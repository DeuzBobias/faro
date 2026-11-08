import { average, localDate, recentLogs, type DailyLog } from './domain'

export function weeklyRoutine(logs:DailyLog[], today=localDate()) {
  const previousEnd=new Date(`${today}T12:00:00`)
  previousEnd.setDate(previousEnd.getDate()-7)
  const current=recentLogs(logs,7,today)
  const previous=recentLogs(logs,7,localDate(previousEnd))
  const fields=['sleep','classes','study','work','brk'] as const
  return { days:current.length, previousDays:previous.length, metrics:fields.map(key=>{
    const value=average(current,key)
    const before=average(previous,key)
    return {key,value,change:value===null||before===null?null:value-before}
  }) }
}
