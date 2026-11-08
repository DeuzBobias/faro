import {Link} from 'react-router-dom'
import {useApp} from '../lib/store'
import {localDate} from '../../shared/domain'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Moon, BookOpen, Activity } from 'lucide-react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['S','M','T','W','T','F','S']

function pColor(p: number) {
  return p >= 8.5 ? '#22C55E' : p >= 7 ? '#23745B' : p >= 5.5 ? '#F59E0B' : '#EF4444'
}

export default function Calendar() {
  const [year, setYear]       = useState(new Date().getFullYear())
  const [month, setMonth]     = useState(new Date().getMonth())
  const [selected, setSelected] = useState<string | null>(localDate())

  const {state}=useApp();if(!state)return null
  const logs=Object.fromEntries(state.logs.map(l=>[l.date,l]))
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function fmt(d: number) {
    return `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  }
  function prev() { if (month === 0) { setYear(y => y-1); setMonth(11) } else setMonth(m => m-1) }
  function next() { if (month === 11) { setYear(y => y+1); setMonth(0) } else setMonth(m => m+1) }

  const log = selected ? logs[selected] : null

  return (
    <div className="pb-6 animate-fade-in-up">
      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-3">
        <button aria-label="Previous month" disabled={year<=2000 && month===0} onClick={prev} className="w-9 h-9 rounded-xl border flex items-center justify-center" style={{ borderColor: '#E2E8F0' }}>
          <ChevronLeft size={18} className="text-[#64748B]" />
        </button>
        <h2 className="text-base font-bold text-[#081E35]" style={{ fontFamily: 'Poppins, sans-serif' }}>{MONTHS[month]} {year}</h2>
        <button aria-label="Next month" disabled={year===new Date().getFullYear() && month===new Date().getMonth()} onClick={next} className="w-9 h-9 rounded-xl border flex items-center justify-center" style={{ borderColor: '#E2E8F0' }}>
          <ChevronRight size={18} className="text-[#64748B]" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="mx-4 bg-white rounded-2xl border p-3" style={{ borderColor: '#E2E8F0' }}>
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d,i) => <div key={i} className="text-center text-[10px] font-bold text-[#94A3B8] py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: firstDay }).map((_,i) => <div key={i} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const key = fmt(day)
            const l = logs[key]
            const isSel = selected === key
            const isToday = key === localDate()
            return (
              <button
                key={day} aria-label={key} disabled={key>localDate()}
                onClick={() => setSelected(isSel ? null : key)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all active:scale-95 ${isSel ? 'ring-2 ring-primary' : ''} ${isToday && !l ? 'bg-primary-50 text-primary font-bold' : ''}`}
                style={{
                  background: l && !isSel ? pColor(l.productivity) + '18' : isSel ? '#E9F5F2' : undefined,
                  color: l ? pColor(l.productivity) : isToday ? '#081E35' : '#081E35',
                }}
              >
                <span>{day}</span>
                {l && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: pColor(l.productivity) }} />}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t flex-wrap" style={{ borderColor: '#E2E8F0' }}>
          {[['≥8.5', '#22C55E'], ['7–8.4', '#23745B'], ['5.5–6.9', '#F59E0B'], ['<5.5', '#EF4444']].map(([l,c]) => (
            <div key={l} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: c }} />
              <span className="text-[10px] text-[#94A3B8]">{l}/10</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected day detail */}
      {log && selected && (
        <div className="mx-4 mt-3 bg-white rounded-2xl border p-4 animate-fade-in-up" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-[#94A3B8]">{selected}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg">{['😤','😔','😐','😊','😄'][log.mood]}</span>
                <span className="text-sm font-bold text-[#081E35]" style={{ fontFamily: 'Poppins, sans-serif' }}>Daily Summary</span>
              </div>
            </div>
            <button aria-label="Close daily summary" onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F5F9F7]">
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { icon: Activity, label: 'Productivity', value: `${log.productivity}/10`,  color: pColor(log.productivity) },
              { icon: Moon,     label: 'Sleep',        value: `${log.sleep} hrs`,      color: '#23745B' },
              { icon: BookOpen, label: 'Study',        value: `${log.study} hrs`,      color: '#081E35' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#F5F9F7' }}>
                <div className="flex items-center gap-2">
                  <Icon size={13} style={{ color }} />
                  <span className="text-xs text-[#64748B]">{label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>

          {log.notes && (
            <div className="px-3 py-2 rounded-xl" style={{ background: '#F5F9F7' }}>
              <p className="text-xs text-[#64748B] italic">"{log.notes}"</p>
            </div>
          )}
        </div>
      )}

      {selected && <div className="mx-4 mt-3"><Link className="faro-button w-full text-center" to={"/app/daily-log?date="+selected}>{log?"Edit daily log":"Add daily log"}</Link></div>}
      {!selected && (
        <div className="mx-4 mt-3 bg-white rounded-2xl border p-6 text-center" style={{ borderColor: '#E2E8F0' }}>
          <span className="text-3xl mb-2 block">📅</span>
          <p className="text-sm font-semibold text-[#081E35]">No date selected</p>
          <p className="text-xs text-[#64748B] mt-1">Tap a highlighted date to view your log</p>
        </div>
      )}
    </div>
  )
}
