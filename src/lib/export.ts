import type { AppState, DailyLog } from '../../shared/domain'
export function download(filename:string,content:string,type:string){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const columns: (keyof DailyLog)[]=['date','sleep','sleepQ','study','work','classes','brk','exercise','water','mood','stress','energy','productivity','notes','updatedAt']
// Prevent spreadsheet formula injection when a note starts with =, +, -, or @.
export function csvCell(value:unknown){let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'}
export function logsCsv(logs:DailyLog[]){return '\uFEFF'+[columns.map(csvCell).join(','),...logs.map(l=>columns.map(c=>csvCell(l[c])).join(','))].join('\r\n')}
export function exportAccount(state:AppState){download('faro-account.json',JSON.stringify({exportedAt:new Date().toISOString(),profile:state.profile,logs:state.logs,fasAssessments:state.fasAssessments||[]},null,2),'application/json')}
