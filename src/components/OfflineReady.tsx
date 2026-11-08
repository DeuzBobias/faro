import { useEffect, useState } from 'react'
import { useApp } from '../lib/store'
export default function OfflineReady(){
 const {state}=useApp();const [ready,setReady]=useState(false);const [failed,setFailed]=useState(false)
 useEffect(()=>{
  if(!import.meta.env.PROD)return
  let active=true;let timer:ReturnType<typeof setTimeout>;let channel:MessageChannel|undefined
  const check=()=>{
   const worker=navigator.serviceWorker?.controller;if(!worker)return
   channel?.port1.close();channel=new MessageChannel()
   clearTimeout(timer);timer=setTimeout(()=>{if(active)setFailed(true)},8000)
   channel.port1.onmessage=e=>{clearTimeout(timer);if(active){setReady(e.data?.ready===true);setFailed(e.data?.ready!==true)}}
   worker.postMessage({type:'FARO_OFFLINE_STATUS'},[channel.port2])
  }
  const fail=()=>setFailed(true)
  if('serviceWorker' in navigator){navigator.serviceWorker.ready.then(check);navigator.serviceWorker.addEventListener('controllerchange',check);check()}else fail()
  window.addEventListener('faro-offline-error',fail)
  return()=>{active=false;clearTimeout(timer);channel?.port1.close();navigator.serviceWorker?.removeEventListener('controllerchange',check);window.removeEventListener('faro-offline-error',fail)}
 },[])
 if(!import.meta.env.PROD)return null
 return <p role="status" className="text-center text-xs py-2 px-3 bg-white text-muted">{ready&&state?.profile?'Ready for offline use on this device.':failed?'Offline download incomplete. Reconnect and reload FARO.':'Preparing offline access — keep this page open while connected.'}</p>
}
