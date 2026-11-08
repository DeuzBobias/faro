import { database, type Env } from './db'
import { careApi } from './care'
import { fasRetakeDate, numericLimits, scoreFas, validateFasAnswers, validateLog, validateProfile, validDate, type DailyLog, type Profile } from '../shared/domain'

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Vary': 'Cookie' } })
}
async function readBody(request: Request) {
  if (!(request.headers.get('content-type') || '').startsWith('application/json')) throw new Error('Expected JSON')
  const reader = request.body?.getReader()
  if (!reader) throw new Error('Missing body')
  let length = 0; const chunks: Uint8Array[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    length += value.byteLength
    if (length > 16384) { await reader.cancel(); throw new Error('Request too large') }
    chunks.push(value)
  }
  const bytes = new Uint8Array(length); let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return JSON.parse(new TextDecoder().decode(bytes))
}
export async function api(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  // This API implementation is used only by the loopback development server.
  // Production Netlify functions use verified Netlify Identity tokens instead.
  const id = request.headers.get('x-faro-user-id')
  if (!id) return json({ error: 'Sign in to access FARO.' }, 401)
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    if (request.headers.get('origin') !== url.origin) return json({ error: 'Request origin not allowed.' }, 403)
  }
  const db = database(env)
  if(url.pathname.startsWith('/api/care/'))return careApi(request,db,id,env.notifyGuidance)
  const account=await db.prepare('SELECT role FROM local_accounts WHERE user_id=?').bind(id).first<{role:string}>()
  const user = { id, email: request.headers.get('x-faro-user-email') || '', name: request.headers.get('x-faro-user-name') || '',role:account?.role||'student' }
  if (url.pathname === '/api/state' && request.method === 'GET') {
    const profile = await db.prepare('SELECT data FROM profiles WHERE user_id = ?').bind(id).first<{data:string}>()
    const logs = await db.prepare('SELECT data, updated_at FROM daily_logs WHERE user_id = ? ORDER BY date DESC').bind(id).all<{data:string;updated_at:string}>()
    const fasAssessments = await db.prepare('SELECT id, answers, score, completed_at FROM fas_assessments WHERE user_id = ? ORDER BY completed_at DESC').bind(id).all<{id:string;answers:string;score:number;completed_at:string}>()
    return json({ user, profile: profile ? JSON.parse(profile.data) : null, logs: logs.results.map(l => ({...JSON.parse(l.data), updatedAt:l.updated_at})), fasAssessments:fasAssessments.results.map(a=>({id:a.id,answers:JSON.parse(a.answers),score:a.score,completedAt:a.completed_at})) })
  }
  if (url.pathname === '/api/profile' && request.method === 'PUT') {
    let p: Profile
    try { p = await readBody(request) } catch { return json({error:'Send a valid profile under 16 KB.'},400) }
    const error = validateProfile(p)
    if (error) return json({error},400)
    const clean: Profile = { name:p.name.trim(), studentNumber:p.studentNumber.trim(), college:p.college.trim(), course:p.course.trim(), yearLevel:p.yearLevel.trim(), employment:p.employment.trim(), sleepGoal:p.sleepGoal, studyGoal:p.studyGoal, reminders:p.reminders }
    await db.prepare('INSERT INTO profiles (user_id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at').bind(id,JSON.stringify(clean),new Date().toISOString()).run()
    return json({profile:clean})
  }
  if (url.pathname === '/api/fas' && request.method === 'POST') {
    let body: {id?:unknown;answers?:unknown}
    try { body = await readBody(request) } catch { return json({error:'Send a valid FAS response under 16 KB.'},400) }
    if (typeof body.id !== 'string' || !/^[\da-f-]{36}$/i.test(body.id)) return json({error:'Refresh the assessment and try again.'},400)
    const answerError = validateFasAnswers(body.answers)
    if (answerError) return json({error:answerError},400)
    if (!await db.prepare('SELECT user_id FROM profiles WHERE user_id = ?').bind(id).first()) return json({error:'Complete your profile before taking the FAS.'},409)
    const existing = await db.prepare('SELECT id, answers, score, completed_at FROM fas_assessments WHERE user_id = ? AND id = ?').bind(id,body.id).first<{id:string;answers:string;score:number;completed_at:string}>()
    if (existing) return json({assessment:{id:existing.id,answers:JSON.parse(existing.answers),score:existing.score,completedAt:existing.completed_at}})
    const latest = await db.prepare('SELECT completed_at FROM fas_assessments WHERE user_id = ? ORDER BY completed_at DESC LIMIT 1').bind(id).first<{completed_at:string}>()
    const now = new Date().toISOString()
    const nextDate = latest ? fasRetakeDate({id:'',answers:[],score:0,completedAt:latest.completed_at}) : null
    if (nextDate && now < nextDate) return json({error:'Your FAS is saved. You can complete it again on or after the date shown.',nextAvailableAt:nextDate},409)
    const answers = body.answers as number[]
    const score = scoreFas(answers)!
    await db.prepare('INSERT INTO fas_assessments (user_id, id, answers, score, completed_at) VALUES (?, ?, ?, ?, ?)').bind(id,body.id,JSON.stringify(answers),score,now).run()
    return json({assessment:{id:body.id,answers,score,completedAt:now}},201)
  }
  if (url.pathname === '/api/logs' && request.method === 'PUT') {
    let input: DailyLog
    try { input = await readBody(request) } catch { return json({error:'Send a valid daily log under 16 KB.'},400) }
    const error = validateLog(input)
    if (error) return json({error},400)
    if (!await db.prepare('SELECT user_id FROM profiles WHERE user_id = ?').bind(id).first()) return json({error:'Complete your profile first.'},409)
    const clean = { date:input.date, notes:input.notes.trim() } as DailyLog
    for (const key of Object.keys(numericLimits) as (keyof typeof numericLimits)[]) clean[key] = input[key]
    const updatedAt = new Date().toISOString()
    await db.prepare('INSERT INTO daily_logs (user_id, date, data, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id,date) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at').bind(id,clean.date,JSON.stringify(clean),updatedAt).run()
    return json({log:{...clean,updatedAt}})
  }
  if (url.pathname.startsWith('/api/logs/') && request.method === 'DELETE') {
    const date = url.pathname.slice('/api/logs/'.length)
    if (!validDate(date)) return json({error:'Invalid log date.'},400)
    await db.prepare('DELETE FROM daily_logs WHERE user_id = ? AND date = ?').bind(id,date).run()
    return json({ok:true})
  }
  if (url.pathname === '/api/account' && request.method === 'DELETE') {
    let body
    try { body = await readBody(request) } catch { return json({error:'Confirm account deletion.'},400) }
    if (body.confirm !== 'DELETE') return json({error:'Type DELETE to confirm.'},400)
    await db.batch([
      db.prepare('DELETE FROM push_subscriptions WHERE user_id = ?').bind(id),
      db.prepare('DELETE FROM care_messages WHERE student_id = ?').bind(id),
      db.prepare('DELETE FROM care_consent WHERE user_id = ?').bind(id),
      db.prepare('DELETE FROM daily_logs WHERE user_id = ?').bind(id),
      db.prepare('DELETE FROM fas_assessments WHERE user_id = ?').bind(id),
      db.prepare('DELETE FROM profiles WHERE user_id = ?').bind(id),
    ])
    return json({ok:true})
  }
  return json({error:'Not found.'},404)
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url)
      if (url.pathname.startsWith('/api/')) return await api(request,env)
      if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed',{status:405})
      const isAsset = /\.[a-z0-9]+$/i.test(url.pathname)
      const assetUrl = new URL(isAsset ? url.pathname : '/index.html',url.origin)
      const response = await env.ASSETS.fetch(new Request(assetUrl,{method:request.method}))
      const headers = new Headers(response.headers)
      headers.set('X-Content-Type-Options','nosniff')
      headers.set('Referrer-Policy','same-origin')
      if (!isAsset || url.pathname.endsWith('.html') || url.pathname === '/sw.js') headers.set('Cache-Control','no-cache')
      return new Response(response.body,{status:response.status,headers})
    } catch (error) {
      console.error('FARO request failed', error instanceof Error ? error.message : 'unknown')
      return json({error:'FARO could not complete this request. Please try again.'},500)
    }
  },
}
