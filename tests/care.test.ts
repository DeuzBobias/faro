import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sqliteDatabase } from '../server/local-db'
import { localAuth, sessionAccount } from '../server/local-auth'
import worker from '../server/worker'
import { defaultProfile } from '../shared/domain'
import { validPushEndpoint } from '../server/local-push'
import { careApi } from '../server/care'

test('push endpoints reject local, arbitrary and insecure destinations',()=>{
 assert.equal(validPushEndpoint('https://fcm.googleapis.com/fcm/send/test'),true)
 assert.equal(validPushEndpoint('https://web.push.apple.com/test'),true)
 for(const value of ['http://fcm.googleapis.com/test','https://127.0.0.1/test','https://fcm.googleapis.com.evil.test/test','https://user@fcm.googleapis.com/test','https://fcm.googleapis.com:8445/test','https://example.com/test'])assert.equal(validPushEndpoint(value),false)
})

test('guidance remains saved if push fails and withdrawn consent prevents push',async()=>{
 const db=sqliteDatabase(':memory:');let calls=0
 try{
  for(const [id,role] of [['s','student'],['d','doctor']])await db.prepare('INSERT INTO local_accounts VALUES (?,?,?,?,?,?)').bind(id,id+'@test.local','unused',role,1,new Date().toISOString()).run()
  await db.prepare('INSERT INTO care_consent VALUES (?,?,?)').bind('s',1,new Date().toISOString()).run()
  const send=()=>careApi(new Request('http://localhost/api/care/guidance?student=s',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'guidance',message:'Fictional test message'})}),db,'d',async()=>{calls++;throw new Error('Push unavailable')})
  const response=await send();assert.equal(response.status,201);assert.equal((await response.json()).push.failed,1)
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM care_messages').first<{n:number}>())?.n,1)
  await db.prepare('UPDATE care_consent SET enabled=0').run()
  assert.equal((await send()).status,403);assert.equal(calls,1)
 }finally{db.close()}
})

test('local password login works without external identity, with server-side sessions',async()=>{
 const db=sqliteDatabase(':memory:')
 const auth=(path:string,body:unknown)=>localAuth(new Request('http://localhost/api/local-auth/'+path,{method:'POST',headers:{origin:'http://localhost','Content-Type':'application/json'},body:JSON.stringify(body)}),db)
 try{
  const result=await auth('signup',{email:'student@test.local',password:'Test-password-123',role:'admin'})
  assert.equal(result.status,200)
  const cookie=result.headers.get('set-cookie')!.split(';')[0]
  const account=await sessionAccount(new Request('http://localhost',{headers:{cookie}}),db)
  assert.equal(account?.role,'student')
  assert.equal((await auth('login',{email:'student@test.local',password:'wrong-password'})).status,401)
  assert.equal((await auth('login',{email:'student@test.local',password:'Test-password-123'})).status,200)
  await db.prepare('UPDATE local_accounts SET active=0').run()
  assert.equal(await sessionAccount(new Request('http://localhost',{headers:{cookie}}),db),null)
  assert.equal((await auth('login',{email:'student@test.local',password:'Test-password-123'})).status,401)
 }finally{db.close()}
})

test('professional access requires role and consent; messages and administrative audit persist',async()=>{
 const db=sqliteDatabase(':memory:')
 for(const [id,role] of [['s','student'],['d','doctor'],['a','admin']])await db.prepare('INSERT INTO local_accounts VALUES (?,?,?,?,?,?)').bind(id,id+'@test.local','unused',role,1,new Date().toISOString()).run()
 await db.prepare('INSERT INTO profiles VALUES (?,?,?)').bind('s',JSON.stringify({...defaultProfile,name:'Test student'}),new Date().toISOString()).run()
 const env={DB:db,ASSETS:{fetch:async()=>new Response('')}}
 const call=(id:string,path:string,method='GET',body?:unknown)=>worker.fetch(new Request('http://localhost/api/care/'+path,{method,headers:{origin:'http://localhost','Content-Type':'application/json','x-faro-user-id':id},body:body===undefined?undefined:JSON.stringify(body)}),env)
 try{
  assert.equal((await call('s','admin/accounts')).status,403)
  assert.equal((await call('a','students')).status,403)
  assert.equal((await call('d','student?student=s')).status,403)
  await call('s','consent','PUT',{enabled:true})
  assert.equal((await (await call('d','students')).json()).students.length,1)
  assert.equal((await call('d','student?student=s')).status,200)
  assert.equal((await call('d','guidance?student=s','POST',{kind:'guidance',message:'Please review your recorded routine.'})).status,201)
  assert.equal((await (await call('s','messages')).json()).messages.length,1)
  assert.equal((await call('d','admin/accounts')).status,403)
  assert.equal((await call('a','admin/accounts','PUT',{id:'a',role:'student',active:false})).status,409)
  await call('s','consent','PUT',{enabled:false})
  assert.equal((await call('d','student?student=s')).status,403)
  assert.equal((await call('d','guidance?student=s','POST',{kind:'guidance',message:'No longer allowed'})).status,403)
  assert.ok((await (await call('a','admin/audit')).json()).events.length>=3)
 }finally{db.close()}
})
