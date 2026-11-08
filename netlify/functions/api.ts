import { admin as identityAdmin, getUser } from '@netlify/identity'
import { getDatabase } from '@netlify/database'
import type { Context } from '@netlify/functions'
import { fasRetakeDate, numericLimits, scoreFas, validateFasAnswers, validateLog, validateProfile, validDate, type DailyLog, type Profile } from '../../shared/domain'

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Cookie, Authorization' } })
}
function parseJson(value: unknown) {
  return typeof value === 'string' ? JSON.parse(value) : value
}

async function readBody(request: Request) {
  if (!(request.headers.get('content-type') || '').startsWith('application/json')) throw new Error('Expected JSON')
  const reader = request.body?.getReader()
  if (!reader) throw new Error('Missing body')
  let length = 0
  const chunks: Uint8Array[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    length += value.byteLength
    if (length > 16384) { await reader.cancel(); throw new Error('Request too large') }
    chunks.push(value)
  }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return JSON.parse(new TextDecoder().decode(bytes))
}

export default async (request: Request, _context: Context) => {
  try {
    const user = await getUser()
    if (!user) return json({ error: 'Sign in to access FARO.' }, 401)
    const url = new URL(request.url)
    const path = url.pathname.startsWith('/api/') ? url.pathname : `/api/${url.pathname.split('/').slice(4).join('/')}`
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.headers.get('origin') !== url.origin) return json({ error: 'Request origin not allowed.' }, 403)

    if (path === '/api/admin/users' && request.method === 'GET') {
      if (!user.roles?.includes('admin')) return json({ error: 'Admin access required.' }, 403)
      const users = await identityAdmin.listUsers()
      return json({ users: users.map(account => ({
        id: account.id,
        email: account.email,
        createdAt: account.createdAt,
        confirmedAt: account.confirmedAt,
        roles: account.roles || [],
      })) })
    }
    if (path.startsWith('/api/admin/users/') && request.method === 'DELETE') {
      if (!user.roles?.includes('admin')) return json({ error: 'Admin access required.' }, 403)
      const targetId = decodeURIComponent(path.slice('/api/admin/users/'.length))
      if (!/^[\da-f-]{36}$/i.test(targetId)) return json({ error: 'Invalid account.' }, 400)
      if (targetId === user.id) return json({ error: 'You cannot delete the account you are using.' }, 409)
      let body: { confirmEmail?: unknown }
      try { body = await readBody(request) } catch { return json({ error: 'Type the account email to confirm deletion.' }, 400) }
      if (typeof body.confirmEmail !== 'string') return json({ error: 'Type the account email to confirm deletion.' }, 400)
      const users = await identityAdmin.listUsers()
      const target = users.find(account => account.id === targetId)
      if (!target?.email) return json({ error: 'Account not found.' }, 404)
      if (body.confirmEmail.trim().toLowerCase() !== target.email.toLowerCase()) return json({ error: 'The email confirmation does not match.' }, 400)
      if (target.roles?.includes('admin') && users.filter(account => account.roles?.includes('admin')).length <= 1) {
        return json({ error: 'Assign another administrator before deleting the last admin account.' }, 409)
      }
      const db = getDatabase()
      await db.sql`DELETE FROM daily_logs WHERE user_id = ${targetId}`
      await db.sql`DELETE FROM fas_assessments WHERE user_id = ${targetId}`
      await db.sql`DELETE FROM profiles WHERE user_id = ${targetId}`
      await identityAdmin.deleteUser(targetId)
      return json({ ok: true })
    }

    const db = getDatabase()
    if (path === '/api/state' && request.method === 'GET') {
      const profiles = await db.sql`SELECT data FROM profiles WHERE user_id = ${user.id}`
      const logs = await db.sql`SELECT data, updated_at FROM daily_logs WHERE user_id = ${user.id} ORDER BY date DESC`
      const fasAssessments = await db.sql`SELECT id, answers, score, completed_at FROM fas_assessments WHERE user_id = ${user.id} ORDER BY completed_at DESC`
      return json({ user: { id: user.id, email: user.email, name: user.userMetadata?.full_name || '' }, profile: profiles[0]?.data ? parseJson(profiles[0].data) : null, logs: logs.map((l: Record<string, unknown>) => ({ ...parseJson(l.data) as object, updatedAt: l.updated_at })), fasAssessments:fasAssessments.map((a:Record<string,unknown>)=>({id:a.id,answers:parseJson(a.answers),score:a.score,completedAt:a.completed_at})) })
    }
    if (path === '/api/profile' && request.method === 'PUT') {
      let p: Profile
      try { p = await readBody(request) } catch { return json({ error: 'Send a valid profile under 16 KB.' }, 400) }
      const error = validateProfile(p)
      if (error) return json({ error }, 400)
      const clean: Profile = { name:p.name.trim(), studentNumber:p.studentNumber.trim(), college:p.college.trim(), course:p.course.trim(), yearLevel:p.yearLevel.trim(), employment:p.employment.trim(), sleepGoal:p.sleepGoal, studyGoal:p.studyGoal, reminders:p.reminders }
      await db.sql`INSERT INTO profiles (user_id, data, updated_at) VALUES (${user.id}, ${JSON.stringify(clean)}, ${new Date().toISOString()}) ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`
      return json({ profile: clean })
    }
    if (path === '/api/fas' && request.method === 'POST') {
      let body:{id?:unknown;answers?:unknown}
      try { body = await readBody(request) } catch { return json({error:'Send a valid FAS response under 16 KB.'},400) }
      if (typeof body.id !== 'string' || !/^[\da-f-]{36}$/i.test(body.id)) return json({error:'Refresh the assessment and try again.'},400)
      const answerError=validateFasAnswers(body.answers)
      if (answerError) return json({error:answerError},400)
      const profiles=await db.sql`SELECT user_id FROM profiles WHERE user_id = ${user.id}`
      if (!profiles.length) return json({error:'Complete your profile before taking the FAS.'},409)
      const existing=await db.sql`SELECT id, answers, score, completed_at FROM fas_assessments WHERE user_id = ${user.id} AND id = ${body.id}`
      if (existing.length) {const a=existing[0] as Record<string,unknown>;return json({assessment:{id:a.id,answers:parseJson(a.answers),score:a.score,completedAt:a.completed_at}})}
      const latest=await db.sql`SELECT completed_at FROM fas_assessments WHERE user_id = ${user.id} ORDER BY completed_at DESC LIMIT 1`
      const now=new Date().toISOString()
      const nextDate=latest.length?fasRetakeDate({id:'',answers:[],score:0,completedAt:String((latest[0] as Record<string,unknown>).completed_at)}):null
      if (nextDate&&now<nextDate) return json({error:'Your FAS is saved. You can complete it again on or after the date shown.',nextAvailableAt:nextDate},409)
      const answers=body.answers as number[]
      const score=scoreFas(answers)!
      await db.sql`INSERT INTO fas_assessments (user_id, id, answers, score, completed_at) VALUES (${user.id}, ${body.id}, ${JSON.stringify(answers)}, ${score}, ${now})`
      return json({assessment:{id:body.id,answers,score,completedAt:now}},201)
    }
    if (path === '/api/logs' && request.method === 'PUT') {
      let input: DailyLog
      try { input = await readBody(request) } catch { return json({ error: 'Send a valid daily log under 16 KB.' }, 400) }
      const error = validateLog(input)
      if (error) return json({ error }, 400)
      const profiles = await db.sql`SELECT user_id FROM profiles WHERE user_id = ${user.id}`
      if (!profiles.length) return json({ error: 'Complete your profile first.' }, 409)
      const clean = { date: input.date, notes: input.notes.trim() } as DailyLog
      for (const key of Object.keys(numericLimits) as (keyof typeof numericLimits)[]) clean[key] = input[key]
      const updatedAt = new Date().toISOString()
      await db.sql`INSERT INTO daily_logs (user_id, date, data, updated_at) VALUES (${user.id}, ${clean.date}, ${JSON.stringify(clean)}, ${updatedAt}) ON CONFLICT (user_id, date) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`
      return json({ log: { ...clean, updatedAt } })
    }
    if (path.startsWith('/api/logs/') && request.method === 'DELETE') {
      const date = path.slice('/api/logs/'.length)
      if (!validDate(date)) return json({ error: 'Invalid log date.' }, 400)
      await db.sql`DELETE FROM daily_logs WHERE user_id = ${user.id} AND date = ${date}`
      return json({ ok: true })
    }
    if (path === '/api/account' && request.method === 'DELETE') {
      let body
      try { body = await readBody(request) } catch { return json({ error: 'Confirm account deletion.' }, 400) }
      if (body.confirm !== 'DELETE') return json({ error: 'Type DELETE to confirm.' }, 400)
      await db.sql`DELETE FROM daily_logs WHERE user_id = ${user.id}`
      await db.sql`DELETE FROM fas_assessments WHERE user_id = ${user.id}`
      await db.sql`DELETE FROM profiles WHERE user_id = ${user.id}`
      return json({ ok: true })
    }
    return json({ error: 'Not found.' }, 404)
  } catch (error) {
    console.error('FARO request failed', error instanceof Error ? error.message : 'unknown')
    return json({ error: 'FARO could not complete this request. Please try again.' }, 500)
  }
}
