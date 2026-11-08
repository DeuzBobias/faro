import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { request } from '../lib/store'

export default function PhoneNotifications(){
 const supported=import.meta.env.DEV&&window.isSecureContext&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window
 const [enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('')
 useEffect(()=>{let active=true;if(supported)void navigator.serviceWorker.getRegistration('/').then(async r=>{const sub=await r?.pushManager.getSubscription();const config=await request<{endpoints:string[]}>('/api/push/subscription');if(active)setEnabled(!!sub&&config.endpoints.includes(sub.endpoint))}).catch(()=>{});return()=>{active=false}},[supported])
 async function toggle(){
  setBusy(true);setError('')
  try{
   if(enabled){
    const r=await navigator.serviceWorker.getRegistration('/');const sub=await r?.pushManager.getSubscription()
    if(sub){await request('/api/push/subscription','DELETE',{endpoint:sub.endpoint});await sub.unsubscribe()}
    setEnabled(false);return
   }
   const permission=await Notification.requestPermission()
   if(permission!=='granted')throw new Error('Notifications are not allowed. You can change this in your browser or phone settings.')
   const {publicKey}=await request<{publicKey:string}>('/api/push/subscription')
   await navigator.serviceWorker.register('/push-sw.js',{scope:'/'})
   const registration=await navigator.serviceWorker.ready
   const bytes=Uint8Array.from(atob(publicKey.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))
   const previous=await registration.pushManager.getSubscription()
   const sub=previous||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes})
   try{await request('/api/push/subscription','POST',{subscription:sub.toJSON()})}catch(e){if(!previous)await sub.unsubscribe();throw e}
   setEnabled(true)
  }catch(e){setError((e as Error).message)}finally{setBusy(false)}
 }
 return <section className="support-sharing"><h2><Bell size={18}/>Phone notifications</h2><p>Receive a private alert when new guidance arrives, even with FARO closed. Internet access is required. Guidance text and FAS scores are not shown in the alert.</p>{!supported?<p>For this local demo, open the trusted HTTPS address in your phone browser. On iPhone, add FARO to your Home Screen first.</p>:<button disabled={busy} onClick={()=>void toggle()}>{busy?'Please wait...':enabled?'Disable on this device':'Enable on this device'}</button>}{error&&<p role="alert" className="care-error">{error}</p>}{enabled&&<p role="status">Phone notifications enabled on this browser. Signing out disables them here.</p>}</section>
}
