import { useApp } from '../lib/store'
import { average, displayNumber, recentLogs } from '../../shared/domain'
import { chartDays, useChartMotion } from '../components/RoutineVisuals'
import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Moon, BookOpen, Briefcase } from 'lucide-react'

type Period='weekly'|'monthly'
export default function Analytics() {
  const [period, setPeriod] = useState<Period>('weekly')
  const {state}=useApp();const motion=useChartMotion();if(!state)return null
  const days=period==='weekly'?7:30;const logs=recentLogs(state.logs,days)
  const data=chartDays(logs,days).map(d=>({...d,day:d.date.slice(5),prod:d.productivity}))
  const best=logs.length?[...logs].sort((a,b)=>b.productivity-a.productivity)[0]:null
  const summaryStats=[
   {label:'Avg Productivity',value:displayNumber(average(logs,'productivity'))+'/10',icon:TrendingUp,color:'#081E35',bg:'#E9F5F2'},
   {label:'Avg Sleep',value:displayNumber(average(logs,'sleep'))+' hrs',icon:Moon,color:'#23745B',bg:'#E9F5F2'},
   {label:'Study Hours',value:logs.length?logs.reduce((s,l)=>s+l.study,0).toFixed(1)+' hrs':'—',icon:BookOpen,color:'#8B5CF6',bg:'#F5F3FF'},
   {label:'Work Hours',value:logs.length?logs.reduce((s,l)=>s+l.work,0).toFixed(1)+' hrs':'—',icon:Briefcase,color:'#F59E0B',bg:'#FFFBEB'},
   {label:'Best Day',value:best?.date.slice(5)||'—',icon:TrendingUp,color:'#22C55E',bg:'#F0FDF4'},
  ]

  return (
    <div className="pb-6 animate-fade-in-up">
      {/* Period selector */}
      <div className="px-4 mt-3">
        <div className="flex gap-1 p-1 bg-white rounded-2xl border" style={{ borderColor: '#E2E8F0' }}>
          {(['weekly', 'monthly'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all capitalize ${period === p ? 'bg-primary text-white' : 'text-[#64748B]'}`}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* Summary stats 2-col grid */}
      <div className="px-4 mt-3 grid grid-cols-3 gap-2">
        {summaryStats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border p-3" style={{ borderColor: '#E2E8F0' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1.5" style={{ background: bg }}>
              <Icon size={13} style={{ color }} />
            </div>
            <p className="text-sm font-bold text-[#081E35]" style={{ fontFamily: 'Poppins, sans-serif' }}>{value}</p>
            <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

<p className="mx-4 mt-3 text-xs text-[#94A3B8]">{logs.length} of {days} days logged. Missing days stay blank. Fatigue ratings are not part of daily logs.</p>
      {/* Productivity chart */}
      <div className="mx-4 mt-3 bg-white rounded-2xl border p-4" style={{ borderColor: '#E2E8F0' }}>
        <p className="text-xs font-bold text-[#081E35] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Productivity Trend</p>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="gProd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#081E35" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#081E35" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 10]} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #E2E8F0' }} formatter={(v: any) => [`${v}/10`, 'Productivity']} />
            <Area isAnimationActive={motion} connectNulls={false} type="monotone" dataKey="prod" stroke="#081E35" strokeWidth={2.5} fill="url(#gProd)" dot={{ r: 3, fill: '#081E35' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sleep chart */}
      <div className="mx-4 mt-3 bg-white rounded-2xl border p-4" style={{ borderColor: '#E2E8F0' }}>
        <p className="text-xs font-bold text-[#081E35] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Sleep Duration</p>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #E2E8F0' }} formatter={(v: any) => [`${v}h`, 'Sleep']} />
            <Line isAnimationActive={motion} connectNulls={false} type="monotone" dataKey="sleep" stroke="#23745B" strokeWidth={2.5} dot={{ r: 4, fill: '#23745B' }} />
            <Line isAnimationActive={motion} connectNulls={false} type="monotone" dataKey={() => state.profile?.sleepGoal??null} stroke="#22C55E" strokeWidth={1} strokeDasharray="4 3" dot={false} name="Your sleep goal" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Work vs Study bar */}
      <div className="mx-4 mt-3 bg-white rounded-2xl border p-4" style={{ borderColor: '#E2E8F0' }}>
        <p className="text-xs font-bold text-[#081E35] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Work vs Study Hours</p>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #E2E8F0' }} />
            <Bar isAnimationActive={motion} dataKey="work"  fill="#F59E0B" radius={[4,4,0,0]} name="Work" />
            <Bar isAnimationActive={motion} dataKey="study" fill="#081E35" radius={[4,4,0,0]} name="Study" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 justify-center">
          {[['Work', '#F59E0B'], ['Study', '#081E35']].map(([l, c]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
              <span className="text-[10px] text-[#64748B]">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
