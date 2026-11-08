import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AppState, DailyLog, FasAssessment, Profile } from '../../shared/domain'
import { syncSnapshot, applyChange, clearSnapshot, readSnapshot, writeSnapshot, type Change } from './offline'
import { validateLog, validateProfile } from '../../shared/domain'
import { getUser, handleAuthCallback, onAuthChange, updateUser } from './auth'
import { assessmentId } from './assessment-id'
class NetworkError extends Error {}

export class ApiError extends Error { constructor(message: string, public status: number) { super(message) } }
async function withSyncLock<T>(task: () => Promise<T> | T): Promise<T> {
  if (navigator.locks?.request) return navigator.locks.request('faro-sync', task)
  return task()
}
export async function request<T>(path: string, method = 'GET', body?: unknown, expectedUserId?:string): Promise<T> {
  let response: Response
  const headers=new Headers(body===undefined?undefined:{'Content-Type':'application/json'})
  const user=await getUser()
  if(!user||(expectedUserId&&user.id!==expectedUserId))throw new ApiError('Account changed. Sign in again.',401)
  if(import.meta.env.DEV&&user.email)headers.set('x-faro-preview-email',user.email)
  try { response = await fetch(path, { method, credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(10000), headers, body: body === undefined ? undefined : JSON.stringify(body) }) }
  catch { throw new NetworkError('You are offline. Changes saved on this device will sync when connected.') }
  if((await getUser())?.id!==user.id)throw new ApiError('Account changed. Sign in again.',401)
  let data
  try { data = await response.json() } catch { throw new ApiError('Your session may have expired. Reload and sign in again.',401) }
  if (!response.ok) throw new ApiError(data.error || 'The request failed.',response.status)
  return data
}
type Store = {
  state: AppState | null; loading: boolean; error: string; signedOut: boolean;
  passwordRecovery:boolean; completePasswordRecovery:(password:string)=>Promise<void>;
  refresh: () => Promise<void>; saveProfile: (p: Profile)=>Promise<void>; saveFasAssessment:(answers:number[])=>Promise<FasAssessment>;
  saveLog:(l:DailyLog)=>Promise<void>; deleteLog:(date:string)=>Promise<void>;
  deleteAccount:()=>Promise<void>; pending:number; offline:boolean; forgetDevice:()=>Promise<void>;
}
const Context = createContext<Store | null>(null)
export function AppProvider({children}:{children:ReactNode}) {
  const [state,setState]=useState<AppState|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [signedOut,setSignedOut]=useState(false)
  const [passwordRecovery,setPasswordRecovery]=useState(false)
  const [pending,setPending]=useState(0)
  const [offline,setOffline]=useState(!navigator.onLine)
  const show=useCallback(()=>{const cached=readSnapshot();setState(cached?.state||null);setPending(cached?.pending.length||0)},[])
  const forgetDevice=()=>withSyncLock(()=>{clearSnapshot();setState(null);setPending(0);setSignedOut(true)})
  const refresh=useCallback(async()=>{
   await withSyncLock(async()=>{
    setError('')
    try {
      const user=await getUser()
      if(!user){clearSnapshot();setState(null);setPending(0);setSignedOut(true);return}
      if(readSnapshot()?.state.user.id!==user.id){clearSnapshot();setState(null);setPending(0)}
      if(!navigator.onLine && !import.meta.env.DEV) throw new NetworkError('Offline')
      await syncSnapshot(()=>request<AppState>('/api/state','GET',undefined,user.id),c=>request(c.path,c.method,c.body,user.id),show)
      setSignedOut(false);setOffline(false)
    }
    catch(e) { if(e instanceof ApiError && e.status===401) {clearSnapshot();setState(null);setPending(0);setSignedOut(true)} else if(e instanceof NetworkError){show();setOffline(true);if(!readSnapshot())setError('Sign in once online to make your records available offline.')} else {show();setError(e instanceof Error?e.message:'Could not sync FARO.')} }
    finally {setLoading(false)}
   })
  },[show])
  useEffect(()=>{
    let active=true
    const offAuth=onAuthChange(()=>{if(active)void refresh()})
    const off=()=>setOffline(true)
    const initialize=async()=>{
      try { const callback=await handleAuthCallback(); if(active&&callback?.type==='recovery'){setPasswordRecovery(true);setLoading(false);return} if(active) await refresh() }
      catch(e) { if(active){setError(e instanceof Error?e.message:'Could not connect to Netlify Identity.');setLoading(false)} }
    }
    void initialize()
    window.addEventListener('online',refresh);window.addEventListener('offline',off);window.addEventListener('storage',show)
    return()=>{active=false;offAuth();window.removeEventListener('online',refresh);window.removeEventListener('offline',off);window.removeEventListener('storage',show)}
  },[refresh,show])
  const save=async(change:Change)=>{await withSyncLock(async()=>{const cached=readSnapshot();if(!cached||cached.state.user.id!==state?.user.id)throw new Error('Sign in again before saving.');writeSnapshot({state:applyChange(cached.state,change),pending:[...cached.pending,change]});show()});void refresh()}
  const saveProfile=async(profile:Profile)=>{
    const problem=validateProfile(profile);if(problem)throw new Error(problem)
    await save({path:'/api/profile',method:'PUT',body:profile})
  }
  const saveFasAssessment=async(answers:number[])=>{
    if(!state?.profile)throw new Error('Complete your profile before taking the FAS.')
    if(!navigator.onLine && !import.meta.env.DEV)throw new Error('Connect to FARO to securely save your FAS assessment.')
    const assessment=(await request<{assessment:FasAssessment}>('/api/fas','POST',{id:assessmentId(),answers},state.user.id)).assessment
    await withSyncLock(()=>{
      const cached=readSnapshot()
      if(!cached||cached.state.user.id!==state.user.id)throw new Error('Sign in again before saving your FAS assessment.')
      const previous=cached.state.fasAssessments||[]
      writeSnapshot({state:{...cached.state,fasAssessments:[assessment,...previous.filter(a=>a.id!==assessment.id)].sort((a,b)=>b.completedAt.localeCompare(a.completedAt))},pending:cached.pending})
      show()
    })
    return assessment
  }
  const saveLog=async(log:DailyLog)=>{
    const problem=validateLog(log);if(problem)throw new Error(problem)
    await save({path:'/api/logs',method:'PUT',body:log})
  }
  const deleteLog=async(date:string)=>{
    await save({path:'/api/logs/'+date,method:'DELETE'})
  }
  const deleteAccount=async()=>{
    await withSyncLock(async()=>{const current=await request<AppState>('/api/state');if(current.user.id!==state?.user.id)throw new Error('Account changed. Reload first.');await request('/api/account','DELETE',{confirm:'DELETE'});writeSnapshot({state:{...current,profile:null,logs:[],fasAssessments:[]},pending:[]});show()})
  }
  const completePasswordRecovery=async(password:string)=>{await updateUser({password});setPasswordRecovery(false);await refresh()}
  return <Context.Provider value={{state,loading,error,signedOut,passwordRecovery,completePasswordRecovery,refresh,saveProfile,saveFasAssessment,saveLog,deleteLog,deleteAccount,pending,offline,forgetDevice}}>{children}</Context.Provider>
}
export function useApp(){const value=useContext(Context);if(!value)throw new Error('Missing FARO provider');return value}
