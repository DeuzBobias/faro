import { useApp } from '../lib/store'
import { localDate } from '../../shared/domain'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCareNotifications } from '../lib/care-notifications'
import { AlertTriangle, Moon, Bell, BarChart2, CheckCircle2, Droplets, X } from 'lucide-react'

type Notif = {
  id: number; icon: typeof Bell; color: string; bg: string
  title: string; message: string; time: string; read: boolean
}

export default function Notifications() {
  const {state}=useApp()
  const care=useCareNotifications()
  const [notifs,setNotifs]=useState<Notif[]>(()=>state?.profile?.reminders&&!state.logs.some(l=>l.date===localDate())?[{id:1,icon:Bell,color:'#081E35',bg:'#E9F5F2',title:'Daily log reminder',message:'Record today’s sleep, activities, and how you feel. Open Daily Log to check in.',time:'Today · In-app reminder',read:false}]:[])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const displayed = filter === 'all' ? notifs : notifs.filter(n => !n.read)
  const unread = notifs.filter(n => !n.read).length+care.unread.length

  function markRead(id: number) { setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x)) }
  function dismiss(id: number)  { setNotifs(n => n.filter(x => x.id !== id)) }
  function markAll()            { setNotifs(n => n.map(x => ({ ...x, read: true })));care.markAll() }

  return (
    <div className="pb-6 animate-fade-in-up">
      {/* Actions */}
      <div className="px-4 mt-3 flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-white rounded-2xl border" style={{ borderColor: '#E2E8F0' }}>
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${filter === f ? 'bg-primary text-white' : 'text-[#64748B]'}`}
            >{f}{f === 'unread' && unread > 0 ? ` (${unread})` : ''}</button>
          ))}
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="text-xs font-semibold text-primary active:opacity-70">Mark all read</button>
        )}
      </div>

      {/* List */}
      <div className="mt-3 px-4 space-y-2">
        {(filter==='unread'?care.unread:care.messages).map(m=><Link key={m.id} to="/app/care" className="block p-4 rounded-lg border border-green-200 bg-green-50"><div className="flex items-center gap-2"><Bell size={18}/><strong className="text-sm">{m.kind==='consultation'?'Consultation recommendation':'Guidance from your care professional'}</strong>{care.unread.some(n=>n.id===m.id)&&<span className="text-xs font-bold text-green-800">New</span>}</div><p className="text-sm mt-2">Open Professional support to read your message.</p><p className="text-xs text-gray-600 mt-2">{new Date(m.created_at).toLocaleString()}</p></Link>)}
        {displayed.length === 0 && (filter==='unread'?care.unread:care.messages).length===0 ? (
          <div className="bg-white rounded-2xl border py-12 flex flex-col items-center text-center px-5" style={{ borderColor: '#E2E8F0' }}>
            <span className="text-4xl mb-3">🔔</span>
            <p className="text-sm font-semibold text-[#081E35]">You're all caught up!</p>
            <p className="text-xs text-[#64748B] mt-1">No {filter === 'unread' ? 'unread ' : ''}notifications right now.</p>
          </div>
        ) : displayed.map(n => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            className="flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] group"
            style={{ background: n.read ? 'white' : n.bg, borderColor: n.read ? '#E2E8F0' : n.color + '30' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: n.bg }}>
              <n.icon size={18} style={{ color: n.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-1.5">
                <p className={`text-sm flex-1 leading-snug ${n.read ? 'font-medium text-[#081E35]' : 'font-bold text-[#081E35]'}`}>{n.title}</p>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />}
              </div>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{n.message}</p>
              <p className="text-[10px] text-[#94A3B8] mt-1.5">{n.time}</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); dismiss(n.id) }}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[#CBD5E1] hover:text-[#64748B] transition-colors shrink-0 mt-0.5"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
