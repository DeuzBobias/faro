import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyChange, readSnapshot, writeSnapshot, clearSnapshot, syncSnapshot } from '../src/lib/offline'
import { defaultProfile, emptyLog, type AppState } from '../shared/domain'
const memory=new Map<string,string>()
Object.defineProperty(globalThis,'localStorage',{value:{getItem:(k:string)=>memory.get(k)||null,setItem:(k:string,v:string)=>memory.set(k,v),removeItem:(k:string)=>memory.delete(k)}})
const account=(id='alice'):AppState=>({user:{id,name:id,email:''},profile:defaultProfile,logs:[],fasAssessments:[]})
test('offline saves survive reload and replay in order; failures retain unsent work',async()=>{
 clearSnapshot();const log=emptyLog('2026-01-01');const change={path:'/api/logs',method:'PUT',body:log}
 writeSnapshot({state:applyChange(account(),change),pending:[change,{...change,body:{...log,notes:'edited'}}]})
 assert.equal(readSnapshot()!.state.logs.length,1)
 let remote=account();let calls=0
 await assert.rejects(syncSnapshot(async()=>remote,async c=>{if(++calls===2)throw new Error('offline');remote=applyChange(remote,c)},()=>{}))
 assert.equal(readSnapshot()!.pending.length,1);assert.equal(readSnapshot()!.state.logs[0].notes,'edited')
 await syncSnapshot(async()=>remote,async c=>{remote=applyChange(remote,c)},()=>{})
 assert.equal(readSnapshot()!.pending.length,0);assert.equal(remote.logs[0].notes,'edited')
})
test('a different signed-in account never receives previous offline changes',async()=>{
 writeSnapshot({state:account(),pending:[{path:'/api/profile',method:'PUT',body:defaultProfile}]})
 await syncSnapshot(async()=>account('bob'),async()=>{assert.fail('must not send Alice changes')},()=>{})
 assert.equal(readSnapshot()!.state.user.id,'bob');assert.equal(readSnapshot()!.pending.length,0)
})
test('offline deletion updates the snapshot; signing out clears device data',()=>{
 const state={...account(),logs:[emptyLog('2026-01-01')]}
 assert.equal(applyChange(state,{path:'/api/logs/2026-01-01',method:'DELETE'}).logs.length,0)
 clearSnapshot();assert.equal(readSnapshot(),null)
})
test('lost response retries are idempotent for same-date writes',async()=>{
 const change={path:'/api/logs',method:'PUT',body:emptyLog('2026-01-01')};let remote=account()
 writeSnapshot({state:applyChange(remote,change),pending:[change]})
 await assert.rejects(syncSnapshot(async()=>remote,async c=>{remote=applyChange(remote,c);throw new Error('lost response')},()=>{}))
 await syncSnapshot(async()=>remote,async c=>{remote=applyChange(remote,c)},()=>{})
 assert.equal(remote.logs.length,1);assert.equal(readSnapshot()!.pending.length,0)
})
