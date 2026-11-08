import { useEffect, useState } from 'react'
import { request, useApp } from './store'

export type CareMessage = { id:string; kind:string; message:string; created_at:string; clinician?:string }
const event = 'faro-care-read'
const key = (id:string) => 'faro:care-read:'+id
function readIds(id:string):string[] {
 try { const value=JSON.parse(localStorage.getItem(key(id))||'[]'); return Array.isArray(value)?value.filter(v=>typeof v==='string'):[] } catch { return [] }
}
export function markCareRead(id:string, messages:CareMessage[]) {
 try { localStorage.setItem(key(id),JSON.stringify([...new Set([...readIds(id),...messages.map(m=>m.id)])])); window.dispatchEvent(new Event(event)) } catch { /* A blocked browser store leaves messages unread. */ }
}
export function useCareNotifications(){
 const {state}=useApp(); const id=state?.user.id; const role=state?.user.role
 const [data,setData]=useState<{owner:string;messages:CareMessage[]}>({owner:'',messages:[]})
 const [read,setRead]=useState<string[]>([])
 useEffect(()=>{
  setData({owner:'',messages:[]});setRead(id?readIds(id):[])
  if(!id||role!=='student')return
  let active=true
  const sync=()=>setRead(readIds(id))
  async function load(){try{const result=await request<{messages:CareMessage[]}>('/api/care/messages');if(active)setData({owner:id!,messages:result.messages})}catch{if(active)setData({owner:id!,messages:[]})}}
  const visible=()=>{if(document.visibilityState==='visible')void load()}
  void load();const timer=window.setInterval(visible,15000)
  window.addEventListener(event,sync);window.addEventListener('storage',sync);window.addEventListener('focus',visible);document.addEventListener('visibilitychange',visible)
  return()=>{active=false;clearInterval(timer);window.removeEventListener(event,sync);window.removeEventListener('storage',sync);window.removeEventListener('focus',visible);document.removeEventListener('visibilitychange',visible)}
 },[id,role])
 const messages=data.owner===id?data.messages:[]
 return {messages,unread:messages.filter(m=>!read.includes(m.id)),markAll:()=>{if(id)markCareRead(id,messages)}}
}
