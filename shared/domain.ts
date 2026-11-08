export type Profile = {
  name: string; studentNumber: string; college: string; course: string;
  yearLevel: string; employment: string; sleepGoal: number; studyGoal: number;
  reminders: boolean;
}
export type DailyLog = {
  date: string; sleep: number; sleepQ: number; study: number; work: number;
  classes: number; brk: number; exercise: number; water: number; mood: number;
  stress: number; energy: number; fatigue?: number | null; productivity: number; notes: string;
  updatedAt?: string;
}
export type FasAssessment = { id: string; answers: number[]; score: number; completedAt: string }
export type AppState = { user: { id: string; email: string; name: string; role?:string }; profile: Profile | null; logs: DailyLog[]; fasAssessments: FasAssessment[] }
export const fasItems = [
  'I am bothered by fatigue',
  'I get tired very quickly',
  'I don’t do much during the day',
  'I have enough energy for everyday life',
  'Physically, I feel exhausted',
  'I have problems to start things',
  'I have problems to think clearly',
  'I feel no desire to do anything',
  'Mentally, I feel exhausted',
  'When I am doing something, I can concentrate quite well',
] as const
export const fasResponseOptions = [
  'Never',
  'Sometimes (about monthly or less)',
  'Regularly (about a few times a month)',
  'Often (about weekly)',
  'Always (about every day)',
] as const
export function scoreFas(answers: number[]) {
  if (answers.length !== 10 || answers.some(value => !Number.isInteger(value) || value < 1 || value > 5)) return null
  return answers.reduce((total, value, index) => total + (index === 3 || index === 9 ? 6 - value : value), 0)
}
export function validateFasAnswers(input: unknown): string | null {
  if (!Array.isArray(input) || scoreFas(input) === null) return 'Answer all 10 FAS statements using the 1–5 response options.'
  return null
}
export function addCalendarMonths(isoDate: string, months: number) {
  const date = new Date(isoDate)
  if (!Number.isFinite(date.getTime())) return null
  const day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + months)
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
  date.setUTCDate(Math.min(day, lastDay))
  return date.toISOString()
}
export function fasRetakeDate(assessment: FasAssessment | undefined) {
  return assessment ? addCalendarMonths(assessment.completedAt, 3) : null
}
export function fasBand(score: number) {
  if (score < 22) return 'Below the commonly used fatigue cutoff'
  if (score < 35) return 'Fatigue range'
  return 'Extreme fatigue range'
}
export const defaultProfile: Profile = {
  name: '', studentNumber: '', college: '', course: '', yearLevel: '', employment: '',
  sleepGoal: 8, studyGoal: 2, reminders: true,
}
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}
export function validDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value && value >= '2000-01-01'
}
export const emptyLog = (date: string): DailyLog => ({ date, sleep: 0, sleepQ: 5, study: 0, work: 0, classes: 0, brk: 0, exercise: 0, water: 0, mood: 2, stress: 5, energy: 5, productivity: 5, notes: '' })
export const numericLimits = { sleep: 24, sleepQ: 10, study: 24, work: 24, classes: 24, brk: 24, exercise: 24, water: 30, mood: 4, stress: 10, energy: 10, productivity: 10 } as const
export function validateLog(input: unknown): string | null {
  if (!input || typeof input !== 'object') return 'Provide a daily log.'
  const log = input as DailyLog
  if (!validDate(log.date)) return 'Choose a valid date.'
  // Permit the next UTC date because a visitor may already be there in their timezone.
  if (log.date > new Date(Date.now()+86400000).toISOString().slice(0,10)) return 'Future dates cannot be logged.'
  for (const [key, max] of Object.entries(numericLimits)) {
    const value = log[key as keyof typeof numericLimits]
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max) return `${key} must be between 0 and ${max}.`
  }
  if (log.fatigue !== undefined && log.fatigue !== null && (typeof log.fatigue !== 'number' || !Number.isFinite(log.fatigue) || log.fatigue < 0 || log.fatigue > 10)) return 'Legacy fatigue rating must be between 0 and 10.'
  if (!Number.isInteger(log.mood) || !Number.isInteger(log.water)) return 'Mood and water must be whole numbers.'
  if (log.sleep + log.study + log.work + log.classes + log.brk + log.exercise > 24) return 'Time entries total more than 24 hours. Count each hour once.'
  if (typeof log.notes !== 'string' || log.notes.length > 2000) return 'Notes must be at most 2,000 characters.'
  return null
}
export function validateProfile(input: unknown): string | null {
  if (!input || typeof input !== 'object') return 'Provide your profile.'
  const p = input as Profile
  for (const key of ['name','studentNumber','college','course','yearLevel','employment'] as const) {
    if (typeof p[key] !== 'string' || p[key].length > 120) return `${key} must be at most 120 characters.`
  }
  if (!p.name.trim()) return 'Enter your name.'
  if (typeof p.sleepGoal !== 'number' || !Number.isFinite(p.sleepGoal) || p.sleepGoal < 1 || p.sleepGoal > 24) return 'Sleep goal must be between 1 and 24 hours.'
  if (typeof p.studyGoal !== 'number' || !Number.isFinite(p.studyGoal) || p.studyGoal < 0 || p.studyGoal > 24) return 'Study goal must be between 0 and 24 hours.'
  if (typeof p.reminders !== 'boolean') return 'Choose a reminder preference.'
  return null
}
export function recentLogs(logs: DailyLog[], days: number, today = localDate()) {
  const start = new Date(`${today}T12:00:00`); start.setDate(start.getDate() - days + 1)
  const from = localDate(start)
  return logs.filter(l => l.date >= from && l.date <= today)
}
export function average(logs: DailyLog[], key: keyof typeof numericLimits) {
  return logs.length ? logs.reduce((n,l)=>n+l[key],0)/logs.length : null
}
export function displayNumber(value: number | null) { return value === null ? '—' : Number(value.toFixed(1)).toString() }
export function routineSuggestions(log: DailyLog | undefined, profile: Profile | null) {
  if (!log || !profile) return []
  const suggestions: {title:string; detail:string; evidence:string; category:string}[] = []
  if (log.sleep < profile.sleepGoal) suggestions.push({ category:'Sleep', title:'Review your sleep goal', evidence:log.sleep+' hours logged; personal goal '+profile.sleepGoal+' hours.', detail:'Look for room in your next schedule to support your personal sleep goal.' })
  if (log.study < profile.studyGoal) suggestions.push({ category:'Study', title:'Plan your next study session', evidence:log.study+' study hours logged; personal goal '+profile.studyGoal+' hours.', detail:'Choose a realistic study session that leaves time for sleep and rest.' })
  if (log.brk === 0 && log.work + log.study + log.classes > 0) suggestions.push({ category:'Rest', title:'Make room for a break', evidence:(log.work+log.study+log.classes)+' hours of work, classes, and study; no break time recorded.', detail:'Review whether your next schedule has space to pause between commitments.' })
  if (log.stress >= 7) suggestions.push({ category:'Wellbeing', title:'Review your workload', evidence:'Self-reported stress '+log.stress+'/10; this prompt appears at 7 or above.', detail:'Consider which commitments you can adjust or discuss with someone who supports you.' })
  if (!suggestions.length) suggestions.push({ category:'Routine', title:'Keep observing your routine', evidence:'No current routine rule was triggered by this entry.', detail:'Compare your next entry with this one to see what changes. This does not establish that fatigue is absent.' })
  return suggestions
}
