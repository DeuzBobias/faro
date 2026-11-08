import type { AppState, DailyLog, Profile } from '../../shared/domain'
export type Change = { path:string; method:string; body?: Profile | DailyLog }
export type Snapshot = { state:AppState; pending:Change[] }
const KEY='faro-offline-account-v1'
export function readSnapshot():Snapshot|null { try { const s=JSON.parse(localStorage.getItem(KEY)||'null'); return s?.state?.user?.id && Array.isArray(s.pending) ? s : null } catch { return null } }
export function writeSnapshot(value:Snapshot) { localStorage.setItem(KEY,JSON.stringify(value)) }
export function clearSnapshot() { localStorage.removeItem(KEY) }
export function applyChange(state:AppState, change:Change):AppState {
 if(change.path==='/api/profile') return {...state,profile:change.body as Profile}
 if(change.method==='DELETE') return {...state,logs:state.logs.filter(l=>l.date!==change.path.split('/').pop())}
 const log=change.body as DailyLog
 return {...state,logs:[log,...state.logs.filter(l=>l.date!==log.date)].sort((a,b)=>b.date.localeCompare(a.date))}
}

export async function syncSnapshot(fetchState:()=>Promise<AppState>, send:(change:Change)=>Promise<unknown>, changed:()=>void) {
 let next=await fetchState()
 const cached=readSnapshot()
 const queue=cached?.state.user.id===next.user.id ? cached.pending : []
 writeSnapshot({state:queue.reduce(applyChange,next),pending:queue});changed()
 while(queue.length) {
  await send(queue[0]);queue.shift()
  // Sign-out can clear the device while a request is in flight.
  if(!readSnapshot()) return
  writeSnapshot({state:readSnapshot()!.state,pending:[...queue]});changed()
 }
 next=await fetchState()
 if(!readSnapshot()) return
 writeSnapshot({state:next,pending:[]});changed()
}
