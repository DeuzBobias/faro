import { randomUUID } from 'node:crypto'
import type { Database } from './db'

export async function careApi(request:Request,db:Database,id:string,notify?: (id:string)=>Promise<{accepted:number;failed:number}>):Promise<Response> {
 const path=new URL(request.url).pathname
 const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}})
 const actor=await db.prepare('SELECT role,active FROM local_accounts WHERE user_id=?').bind(id).first<{role:string;active:number}>()
 if(!actor?.active)return json({error:'An active local account is required.'},403)
 const audit=async(action:string,target:string)=>db.prepare('INSERT INTO care_audit VALUES (?,?,?,?,?)').bind(randomUUID(),id,action,target,new Date().toISOString()).run()
 let body:Record<string,unknown>={}
 if(request.method!=='GET'){
  try{body=await request.json()}catch{return json({error:'Invalid request.'},400)}
 }
 if(path==='/api/care/consent'){
  if(actor.role!=='student')return json({error:'Student access required.'},403)
  if(request.method==='PUT'){
   if(typeof body.enabled!=='boolean')return json({error:'Choose whether to share.'},400)
   await db.prepare('INSERT INTO care_consent VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET enabled=excluded.enabled,updated_at=excluded.updated_at').bind(id,body.enabled?1:0,new Date().toISOString()).run()
   await audit(body.enabled?'consent-granted':'consent-withdrawn',id)
  }else if(request.method!=='GET')return json({error:'Method not allowed.'},405)
  const c=await db.prepare('SELECT enabled FROM care_consent WHERE user_id=?').bind(id).first<{enabled:number}>()
  return json({enabled:!!c?.enabled})
 }
 if(path==='/api/care/messages'&&request.method==='GET'){
  const messages=await db.prepare('SELECT m.id,m.kind,m.message,m.created_at,a.email AS clinician FROM care_messages m LEFT JOIN local_accounts a ON a.user_id=m.clinician_id WHERE student_id=? ORDER BY m.created_at DESC').bind(id).all()
  return json({messages:messages.results})
 }
 if(path.startsWith('/api/care/admin/')){
  if(actor.role!=='admin')return json({error:'Administrator access required.'},403)
  if(path==='/api/care/admin/accounts'&&request.method==='GET')return json({accounts:(await db.prepare('SELECT user_id,email,role,active,created_at FROM local_accounts ORDER BY email').all()).results})
  if(path==='/api/care/admin/audit'&&request.method==='GET')return json({events:(await db.prepare('SELECT * FROM care_audit ORDER BY created_at DESC LIMIT 100').all()).results})
  if(path==='/api/care/admin/accounts'&&request.method==='PUT'){
   if(typeof body.id!=='string'||!['student','doctor','psychologist','admin'].includes(String(body.role))||typeof body.active!=='boolean')return json({error:'Invalid account change.'},400)
   if(body.id===id)return json({error:'You cannot change your own access.'},409)
   if(!await db.prepare('SELECT user_id FROM local_accounts WHERE user_id=?').bind(body.id).first())return json({error:'Account not found.'},404)
   await db.prepare('UPDATE local_accounts SET role=?,active=? WHERE user_id=?').bind(body.role,body.active?1:0,body.id).run()
   await db.prepare('DELETE FROM local_sessions WHERE user_id=?').bind(body.id).run()
   await audit('account-access:'+body.role+':'+body.active,body.id)
   return json({ok:true})
  }
  return json({error:'Not found.'},404)
 }
 if(!['doctor','psychologist'].includes(actor.role))return json({error:'Doctor or psychologist access required.'},403)
 if(path==='/api/care/students'&&request.method==='GET'){
  const rows=await db.prepare("SELECT p.user_id,p.data,a.email FROM profiles p JOIN care_consent c ON c.user_id=p.user_id AND c.enabled=1 JOIN local_accounts a ON a.user_id=p.user_id AND a.active=1 AND a.role='student' ORDER BY p.updated_at DESC").all<{user_id:string;data:string;email:string}>()
  const students=[]
  for(const row of rows.results){
   const fas=await db.prepare('SELECT score,completed_at FROM fas_assessments WHERE user_id=? ORDER BY completed_at DESC LIMIT 1').bind(row.user_id).first()
   const log=await db.prepare('SELECT date,data FROM daily_logs WHERE user_id=? ORDER BY date DESC LIMIT 1').bind(row.user_id).first<{date:string;data:string}>()
   students.push({id:row.user_id,email:row.email,name:JSON.parse(row.data).name,fas,latestLog:log?{date:log.date,...JSON.parse(log.data)}:null})
  }
  await audit('review-queue',id)
  return json({students})
 }
 const target=new URL(request.url).searchParams.get('student')
 if(!target)return json({error:'Choose a student.'},400)
 const allowed=await db.prepare("SELECT c.user_id FROM care_consent c JOIN local_accounts a ON a.user_id=c.user_id WHERE c.user_id=? AND c.enabled=1 AND a.active=1 AND a.role='student'").bind(target).first()
 if(!allowed)return json({error:'This record is unavailable or sharing has been withdrawn.'},403)
 if(path==='/api/care/student'&&request.method==='GET'){
  const p=await db.prepare('SELECT data FROM profiles WHERE user_id=?').bind(target).first<{data:string}>()
  const logs=await db.prepare('SELECT data FROM daily_logs WHERE user_id=? ORDER BY date DESC LIMIT 90').bind(target).all<{data:string}>()
  const fas=await db.prepare('SELECT score,completed_at FROM fas_assessments WHERE user_id=? ORDER BY completed_at DESC').bind(target).all()
  const messages=await db.prepare('SELECT kind,message,created_at FROM care_messages WHERE student_id=? ORDER BY created_at DESC').bind(target).all()
  await audit('student-record-viewed',target)
  return json({profile:p?JSON.parse(p.data):null,logs:logs.results.map(l=>JSON.parse(l.data)),fas:fas.results,messages:messages.results})
 }
 if(path==='/api/care/guidance'&&request.method==='POST'){
  if(typeof body.message!=='string'||!body.message.trim()||body.message.length>2000||!['guidance','consultation'].includes(String(body.kind)))return json({error:'Enter guidance of 1–2,000 characters and a valid message type.'},400)
  await db.prepare('INSERT INTO care_messages VALUES (?,?,?,?,?,?)').bind(randomUUID(),target,id,body.kind,body.message.trim(),new Date().toISOString()).run()
   await audit('guidance-sent',target)
   let push={accepted:0,failed:0}
   try{if(notify)push=await notify(target)}catch{push.failed=1}
   return json({ok:true,push},201)
 }
 return json({error:'Not found.'},404)
}
