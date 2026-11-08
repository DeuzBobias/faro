import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto'
import type { Database } from './db'
import { localPreviewIdentity } from '../shared/local-identity'

export type LocalAccount = { user_id:string; email:string; password_hash:string; role:string; active:number }
export function passwordHash(password:string) {
 const salt=randomBytes(16).toString('hex')
 return salt+':'+scryptSync(password,salt,64).toString('hex')
}
function matches(password:string,hash:string) {
 const [salt,value]=hash.split(':');if(!salt||!value)return false
 const expected=Buffer.from(value,'hex'),actual=scryptSync(password,salt,64)
 return expected.length===actual.length&&timingSafeEqual(expected,actual)
}
const digest=(value:string)=>createHash('sha256').update(value).digest('hex')
function sessionToken(request:Request){return request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith('faro_session='))?.slice(13)||''}
export async function sessionAccount(request:Request,db:Database) {
 return db.prepare('SELECT a.* FROM local_accounts a JOIN local_sessions s ON s.user_id=a.user_id WHERE s.token=? AND s.expires_at>? AND a.active=1').bind(digest(sessionToken(request)),new Date().toISOString()).first<LocalAccount>()
}
export async function localAuth(request:Request,db:Database):Promise<Response> {
 const path=new URL(request.url).pathname
 const reply=(body:unknown,status=200,cookie?:string)=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}})
 const cookie=(value:string,age:number)=>`faro_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${new URL(request.url).protocol==='https:'?'; Secure':''}`
 if(request.method==='GET'&&path==='/api/local-auth/me'){
  const a=await sessionAccount(request,db)
  return a?reply({user:{id:a.user_id,email:a.email,roles:[a.role],name:a.email.split('@')[0]}}):reply({user:null},401)
 }
 if(request.method!=='POST'||request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Request not allowed.'},403)
 if(path==='/api/local-auth/logout'){
  await db.prepare('DELETE FROM local_sessions WHERE token=?').bind(digest(sessionToken(request))).run()
  return reply({ok:true},200,cookie('',0))
 }
 if(!['/api/local-auth/login','/api/local-auth/signup'].includes(path))return reply({error:'Not found.'},404)
 let body:{email?:unknown;password?:unknown}
 try{body=await request.json()}catch{return reply({error:'Invalid request.'},400)}
 const identity=localPreviewIdentity(body.email)
 if(!identity||typeof body.password!=='string'||body.password.length<8||body.password.length>128)return reply({error:'Enter a valid email and an 8–128 character password.'},400)
 let account=await db.prepare('SELECT * FROM local_accounts WHERE email=?').bind(identity.email).first<LocalAccount>()
 if(path.endsWith('/signup')){
  if(account)return reply({error:'This email is registered. Sign in instead.'},409)
  await db.prepare('INSERT INTO local_accounts (user_id,email,password_hash,role,active,created_at) VALUES (?,?,?,\'student\',1,?)').bind(identity.id,identity.email,passwordHash(body.password),new Date().toISOString()).run()
  account=await db.prepare('SELECT * FROM local_accounts WHERE email=?').bind(identity.email).first<LocalAccount>()
 }else if(!account||!matches(body.password,account.password_hash)||!account.active)return reply({error:'Email or password is incorrect, or the account is suspended.'},401)
 if(!account)return reply({error:'Could not create account.'},500)
 const token=randomBytes(32).toString('hex')
 await db.prepare('DELETE FROM local_sessions WHERE expires_at<=?').bind(new Date().toISOString()).run()
 await db.prepare('INSERT INTO local_sessions (token,user_id,expires_at) VALUES (?,?,?)').bind(digest(token),account.user_id,new Date(Date.now()+86400000).toISOString()).run()
 return reply({user:{id:account.user_id,email:account.email,name:account.email.split('@')[0],roles:[account.role]}},200,cookie(token,86400))
}
