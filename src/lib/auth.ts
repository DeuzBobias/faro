import type { AuthCallback, User, UserUpdates } from '@netlify/identity'
import { localPreviewIdentity } from '../../shared/local-identity'
import { clearSnapshot, readSnapshot } from './offline'

const LOCAL_USER_KEY = 'faro-local-preview-user'
const isLocalPreview = import.meta.env.DEV
const localListeners = new Set<AuthCallback>()

// Load Netlify Identity only in production. Importing its browser client during
// local development triggers a request to the unavailable /.netlify/identity endpoint.
async function netlifyAuth() {
  return import('@netlify/identity')
}

function readLocalUser(): User | null {
  try {
    const saved = localStorage.getItem(LOCAL_USER_KEY)
    if(!saved)return null
    const user=JSON.parse(saved) as User
    const identity=localPreviewIdentity(user.email)
    if(!identity)return null
    return {...user,...identity}
  } catch {
    return null
  }
}

function notifyLocal(event: 'login' | 'logout' | 'user_updated', user: User | null) {
  for (const listener of localListeners) listener(event, user)
}

export async function getUser(): Promise<User | null> {
  if(!navigator.onLine){
    const cached=readSnapshot()?.state
    if(cached&&(!cached.user.role||cached.user.role==='student'))return {id:cached.user.id,email:cached.user.email,name:cached.user.name,provider:'email',roles:[],appMetadata:{},userMetadata:{}}
  }
  return isLocalPreview ? readLocalUser() : (await netlifyAuth()).getUser()
}

export async function login(email: string, password: string): Promise<User> {
  if (!isLocalPreview) return (await netlifyAuth()).login(email, password)
  return localAuthenticate('login',email,password)
}

async function localAuthenticate(mode:'login'|'signup',email:string,password:string):Promise<User>{
  const response=await fetch('/api/local-auth/'+mode,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
  const data=await response.json()
  if(!response.ok)throw new Error(data.error||'Could not sign in.')
  const user:User={...data.user,provider:'email',appMetadata:{provider:'email',roles:data.user.roles},userMetadata:{}}
  if(readSnapshot()?.state.user.id!==user.id)clearSnapshot()
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user))
  notifyLocal('login', user)
  return user
}

export async function signup(email: string, password: string): Promise<User> {
  if (!isLocalPreview) return (await netlifyAuth()).signup(email, password)
  return localAuthenticate('signup',email,password)
}

export async function logout(): Promise<void> {
  if (!isLocalPreview) return (await netlifyAuth()).logout()
  if('serviceWorker' in navigator){
   const registration=await navigator.serviceWorker.getRegistration('/')
   const subscription=await registration?.pushManager?.getSubscription()
   if(subscription){
    const result=await fetch('/api/push/subscription',{method:'DELETE',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint:subscription.endpoint})})
    if(!result.ok&&result.status!==401)throw new Error('Reconnect to disable phone notifications before signing out.')
    await subscription.unsubscribe()
   }
  }
  await fetch('/api/local-auth/logout',{method:'POST',credentials:'same-origin'})
  localStorage.removeItem(LOCAL_USER_KEY)
  clearSnapshot()
  notifyLocal('logout', null)
}

export function onAuthChange(callback: AuthCallback): () => void {
  if (!isLocalPreview) {
    let unsubscribe: (() => void) | undefined
    void netlifyAuth().then(identity => { unsubscribe = identity.onAuthChange(callback) })
    return () => unsubscribe?.()
  }
  localListeners.add(callback)
  return () => localListeners.delete(callback)
}

export async function handleAuthCallback() {
  return isLocalPreview || !navigator.onLine ? null : (await netlifyAuth()).handleAuthCallback()
}

export async function requestPasswordRecovery(email: string): Promise<void> {
  if (!isLocalPreview) return (await netlifyAuth()).requestPasswordRecovery(email)
  throw new Error('Local accounts do not use email recovery. Contact the person managing this laptop.')
}

export async function updateUser(updates: UserUpdates): Promise<User> {
  if (!isLocalPreview) return (await netlifyAuth()).updateUser(updates)
  if (updates.password) throw new Error('Password changes are not used in local preview.')
  const current = readLocalUser()
  if (!current) throw new Error('Sign in to the local preview first.')
  if(updates.email&&updates.email.trim().toLowerCase()!==current.email)throw new Error('Use sign out to switch local preview accounts.')
  const updated: User = {
    ...current,
    email: updates.email ?? current.email,
    name: typeof updates.data?.full_name === 'string' ? updates.data.full_name : current.name,
    userMetadata: { ...current.userMetadata, ...updates.data },
  }
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated))
  notifyLocal('user_updated', updated)
  return updated
}
