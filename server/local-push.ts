import webpush from 'web-push'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import type { Database } from './db'

export function validPushEndpoint(value:unknown):value is string {
 if(typeof value!=='string'||value.length>2048)return false
 try { const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash&&(
  ['fcm.googleapis.com','android.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com'].includes(u.hostname)||u.hostname.endsWith('.push.apple.com')) }catch{return false}
}
export function localPush(db:Database){
 const path='.local/push-keys.json'
 if(!existsSync(path))writeFileSync(path,JSON.stringify(webpush.generateVAPIDKeys()),{mode:0o600,flag:'wx'})
 const keys=JSON.parse(readFileSync(path,'utf8')) as {publicKey:string;privateKey:string}
 async function send(user:string){
  const subscriptions=await db.prepare('SELECT endpoint,subscription FROM push_subscriptions WHERE user_id=?').bind(user).all<{endpoint:string;subscription:string}>()
  let accepted=0,failed=0
  await Promise.all(subscriptions.results.map(async row=>{
   try{
    if(!validPushEndpoint(row.endpoint))throw new Error('Invalid push endpoint')
    await webpush.sendNotification(JSON.parse(row.subscription),JSON.stringify({type:'guidance'}),{
     vapidDetails:{subject:'https://faro.local',...keys},TTL:3600,timeout:5000,
    });accepted++
   }catch(e){failed++;const status=(e as {statusCode?:number}).statusCode;if(status===404||status===410)await db.prepare('DELETE FROM push_subscriptions WHERE endpoint=?').bind(row.endpoint).run()}
  }))
  return {accepted,failed}
 }
 async function api(request:Request,user:string){
  const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}})
  const account=await db.prepare('SELECT role,active FROM local_accounts WHERE user_id=?').bind(user).first<{role:string;active:number}>()
  if(account?.role!=='student'||!account.active)return reply({error:'Student access required.'},403)
  if(request.method==='GET')return reply({publicKey:keys.publicKey,endpoints:(await db.prepare('SELECT endpoint FROM push_subscriptions WHERE user_id=?').bind(user).all<{endpoint:string}>()).results.map(row=>row.endpoint)})
  if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Request origin not allowed.'},403)
  let body:any;try{body=await request.json()}catch{return reply({error:'Invalid subscription.'},400)}
  if(request.method==='DELETE'){
   if(typeof body.endpoint!=='string')return reply({error:'Choose this device subscription.'},400)
   await db.prepare('DELETE FROM push_subscriptions WHERE endpoint=? AND user_id=?').bind(body.endpoint,user).run();return reply({ok:true})
  }
  if(request.method!=='POST')return reply({error:'Method not allowed.'},405)
  const sub=body.subscription
  if(!sub||!validPushEndpoint(sub.endpoint)||!sub.keys||typeof sub.keys.p256dh!=='string'||typeof sub.keys.auth!=='string'||!/^[A-Za-z0-9_-]{87}=?$/.test(sub.keys.p256dh)||!/^[A-Za-z0-9_-]{22}={0,2}$/.test(sub.keys.auth))return reply({error:'Unsupported or invalid push subscription.'},400)
  const owner=await db.prepare('SELECT user_id FROM push_subscriptions WHERE endpoint=?').bind(sub.endpoint).first<{user_id:string}>()
  if(owner&&owner.user_id!==user)return reply({error:'Disable notifications in the previous account on this browser first.'},409)
  const count=await db.prepare('SELECT COUNT(*) AS n FROM push_subscriptions WHERE user_id=?').bind(user).first<{n:number}>()
  if(!owner&&(count?.n||0)>=5)return reply({error:'Up to five notification devices are supported.'},409)
  await db.prepare('INSERT INTO push_subscriptions VALUES (?,?,?,?) ON CONFLICT(endpoint) DO UPDATE SET subscription=excluded.subscription').bind(sub.endpoint,user,JSON.stringify({endpoint:sub.endpoint,keys:{p256dh:sub.keys.p256dh,auth:sub.keys.auth}}),new Date().toISOString()).run()
  return reply({ok:true})
 }
 return {api,send}
}
