import './offline.test'
import './care.test'
import { localPreviewRequest } from '../server/local-identity'
import { localPreviewIdentity } from '../shared/local-identity'
import { assessmentId } from '../src/lib/assessment-id'
import { weeklyRoutine } from '../shared/routine-summary'
import {test} from 'node:test'
import assert from 'node:assert/strict'
import { sqliteDatabase } from '../server/local-db'
import worker from '../server/worker'
import { defaultProfile, emptyLog, localDate, recentLogs, average, validateLog, scoreFas, validateFasAnswers } from '../shared/domain'
import { logsCsv } from '../src/lib/export'
import { unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
const DB=sqliteDatabase(':memory:')
test('assessment ID generation works without randomUUID on local HTTP',()=>{
 const id=assessmentId({getRandomValues(bytes){if(bytes instanceof Uint8Array)bytes.set(Array.from({length:16},(_,i)=>i));return bytes}})
 assert.equal(id,'00010203-0405-4607-8809-0a0b0c0d0e0f')
})
test('weekly summaries exclude missing days and compare separate calendar windows',()=>{
 const logs=[{...emptyLog('2026-10-07'),sleep:8},{...emptyLog('2026-10-01'),sleep:6},{...emptyLog('2026-09-30'),sleep:5},{...emptyLog('2026-09-24'),sleep:7},{...emptyLog('2026-10-08'),sleep:20},{...emptyLog('2026-09-23'),sleep:20}]
 const summary=weeklyRoutine(logs,'2026-10-07')
 assert.equal(summary.days,2);assert.equal(summary.previousDays,2)
 assert.deepEqual(summary.metrics[0],{key:'sleep',value:7,change:1})
 assert.equal(weeklyRoutine([logs[0]],'2026-10-07').metrics[0].change,null)
 assert.equal(weeklyRoutine([],'2026-10-07').metrics[0].value,null)
})
const env={DB,ASSETS:{fetch:async()=>new Response('<html>FARO</html>')}}
test('local preview keeps profiles, logs, and FAS separate across email sign-ins',async()=>{
 const db=sqliteDatabase(':memory:')
 const preview=(email:string|undefined,path:string,method='GET',body?:unknown)=>worker.fetch(localPreviewRequest(new Request('http://localhost:8444'+path,{method,headers:{origin:'http://localhost:8444','Content-Type':'application/json','x-faro-user-id':'local-development-user',...(email?{'x-faro-preview-email':email}:{})},body:body===undefined?undefined:JSON.stringify(body)})),{...env,DB:db})
 try {
  assert.equal((await preview(undefined,'/api/state')).status,401)
  assert.equal((await preview('invalid','/api/state')).status,401)
  assert.equal(localPreviewIdentity(' First@Example.com ')?.id,localPreviewIdentity('first@example.com')?.id)
  await preview('first@example.com','/api/profile','PUT',{...defaultProfile,name:'First'})
  await preview('first@example.com','/api/logs','PUT',emptyLog(localDate()))
  assert.equal((await preview('first@example.com','/api/fas','POST',{id:'11111111-1111-4111-8111-111111111111',answers:Array(10).fill(3)})).status,201)
  const second=await (await preview('second@example.com','/api/state')).json()
  assert.equal(second.profile,null);assert.deepEqual(second.logs,[]);assert.deepEqual(second.fasAssessments,[])
  await preview('second@example.com','/api/profile','PUT',{...defaultProfile,name:'Second'})
  assert.equal((await preview('second@example.com','/api/fas','POST',{id:'22222222-2222-4222-8222-222222222222',answers:Array(10).fill(1)})).status,201)
  const firstAgain=await (await preview('FIRST@example.com','/api/state')).json()
  assert.equal(firstAgain.profile.name,'First');assert.equal(firstAgain.logs.length,1);assert.equal(firstAgain.fasAssessments[0].score,30)
  const secondAgain=await (await preview('second@example.com','/api/state')).json()
  assert.equal(secondAgain.profile.name,'Second');assert.equal(secondAgain.fasAssessments[0].score,18)
  assert.notEqual(firstAgain.user.id,secondAgain.user.id)
  await preview('second@example.com','/api/account','DELETE',{confirm:'DELETE'})
  assert.equal((await (await preview('first@example.com','/api/state')).json()).fasAssessments.length,1)
 } finally {db.close()}
})
function call(path:string,method='GET',body?:unknown,user='alice',origin='https://faro.test'){
  return worker.fetch(new Request('https://faro.test'+path,{method,headers:{...(user?{'x-faro-user-id':user,'x-faro-user-email':user+'@test.local'}:{}),origin,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)}),env)
}
test('unauthenticated requests cannot read or write data',async()=>{
  assert.equal((await call('/api/state','GET',undefined,'')).status,401)
  assert.equal((await call('/api/profile','PUT',{...defaultProfile,name:'A'},'')).status,401)
})
test('cross-origin mutation is rejected',async()=>{assert.equal((await call('/api/profile','PUT',{...defaultProfile,name:'A'},'alice','https://evil.test')).status,403)})
test('profile validation, persistence, and user ownership',async()=>{
  assert.equal((await call('/api/profile','PUT',{...defaultProfile,name:''})).status,400)
  assert.equal((await call('/api/profile','PUT',{...defaultProfile,name:'Alice',userId:'bob'})).status,200)
  assert.equal((await (await call('/api/state')).json()).profile.name,'Alice')
  const bob=await (await call('/api/state','GET',undefined,'bob')).json()
  assert.equal(bob.profile,null);assert.deepEqual(bob.logs,[])
})
test('FAS scoring validates ten answers and reverse-scores positive statements',()=>{
  assert.equal(scoreFas(Array(10).fill(3)),30)
  assert.equal(scoreFas(Array(10).fill(1)),18)
  assert.equal(scoreFas(Array(10).fill(5)),42)
  assert.ok(validateFasAnswers(Array(9).fill(3)))
  assert.ok(validateFasAnswers([3,3,3,3,3,3,3,3,3,6]))
  assert.equal(validateFasAnswers(Array(10).fill(3)),null)
})
test('FAS requires a profile, persists private scores, and enforces the three-month interval',async()=>{
  const answers=Array(10).fill(3)
  const id='11111111-1111-4111-8111-111111111111'
  assert.equal((await call('/api/fas','POST',{id,answers},'fas-user')).status,409)
  await call('/api/profile','PUT',{...defaultProfile,name:'FAS participant'},'fas-user')
  const first=await call('/api/fas','POST',{id,answers},'fas-user')
  assert.equal(first.status,201)
  const saved=(await first.json() as {assessment:{score:number;answers:number[]}}).assessment
  assert.equal(saved.score,30);assert.deepEqual(saved.answers,answers)
  assert.equal((await call('/api/fas','POST',{id,answers},'fas-user')).status,200)
  const early=await call('/api/fas','POST',{id:'22222222-2222-4222-8222-222222222222',answers},'fas-user')
  assert.equal(early.status,409);assert.ok((await early.json() as {nextAvailableAt:string}).nextAvailableAt)
  const own=await (await call('/api/state','GET',undefined,'fas-user')).json() as {fasAssessments:{score:number}[]}
  assert.equal(own.fasAssessments.length,1)
  const other=await (await call('/api/state','GET',undefined,'other-user')).json() as {fasAssessments:{score:number}[]}
  assert.deepEqual(other.fasAssessments,[])
})
test('log validation and persistence; same date updates instead of duplicates',async()=>{
  const log={...emptyLog(localDate()),sleep:8,study:2,work:6,notes:'A real entry'}
  assert.equal((await call('/api/logs','PUT',{...log,sleep:25})).status,400)
  assert.equal((await call('/api/logs','PUT',{...log,date:'2026-02-30'})).status,400)
  assert.equal((await call('/api/logs','PUT',{...log,classes:20})).status,400)
  assert.equal((await call('/api/logs','PUT',{...log,notes:'x'.repeat(2001)})).status,400)
  assert.equal((await call('/api/logs','PUT',log,'bob')).status,409)
  assert.equal((await call('/api/logs','PUT',log)).status,200)
  assert.equal((await call('/api/logs','PUT',{...log,notes:'Updated'})).status,200)
  const state=await (await call('/api/state')).json()
  assert.equal(state.logs.length,1);assert.equal(state.logs[0].notes,'Updated');assert.ok(state.logs[0].updatedAt)
})
test('another account cannot delete or access your log',async()=>{
  assert.equal((await call('/api/logs/'+localDate(),'DELETE',undefined,'bob')).status,200)
  assert.equal((await (await call('/api/state')).json()).logs.length,1)
  assert.equal((await (await call('/api/state','GET',undefined,'bob')).json()).logs.length,0)
})
test('delete log and account actually removes persisted records',async()=>{
  await call('/api/logs/'+localDate(),'DELETE')
  assert.equal((await (await call('/api/state')).json()).logs.length,0)
  await call('/api/logs','PUT',emptyLog(localDate()))
  await call('/api/fas','POST',{id:'33333333-3333-4333-8333-333333333333',answers:Array(10).fill(3)})
  assert.equal((await call('/api/account','DELETE',{confirm:'no'})).status,400)
  assert.equal((await call('/api/account','DELETE',{confirm:'DELETE'})).status,200)
  const state=await (await call('/api/state')).json();assert.equal(state.profile,null);assert.deepEqual(state.logs,[]);assert.deepEqual(state.fasAssessments,[])
})
test('API data is never cacheable and unknown endpoints reject',async()=>{
  assert.equal((await call('/api/state')).headers.get('cache-control'),'no-store')
  assert.equal((await call('/api/admin')).status,404)
})
test('statistics use only logged days within calendar range',()=>{
  const logs=[{...emptyLog('2026-09-08'),sleep:8},{...emptyLog('2026-09-02'),sleep:6},{...emptyLog('2026-09-01'),sleep:2}]
  const recent=recentLogs(logs,7,'2026-09-08');assert.equal(recent.length,2);assert.equal(average(recent,'sleep'),7);assert.equal(average([],'sleep'),null)
  assert.ok(validateLog({...emptyLog(localDate()),fatigue:NaN}))
})
test('CSV escapes formulas, quotes and newlines',()=>{
  const csv=logsCsv([{...emptyLog(localDate()),notes:'=HYPERLINK("test")\nsecond line'}])
  assert.ok(csv.includes("'=HYPERLINK"));assert.ok(csv.includes('""test""'))
})
test('saved records survive closing and reopening the database',async()=>{
  const file=resolve('.local','persistence-'+crypto.randomUUID()+'.sqlite')
  let db=sqliteDatabase(file)
  await db.prepare('INSERT INTO profiles (user_id,data,updated_at) VALUES (?,?,?)').bind('persistent',JSON.stringify({...defaultProfile,name:'Persistence test'}),new Date().toISOString()).run()
  db.close();db=sqliteDatabase(file)
  try{const saved=await db.prepare('SELECT data FROM profiles WHERE user_id=?').bind('persistent').first<{data:string}>();assert.equal(JSON.parse(saved!.data).name,'Persistence test')}finally{db.close();unlinkSync(file)}
})
