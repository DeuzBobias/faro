import { useState } from 'react'
import { useApp } from '../lib/store'
import { logout } from '../lib/auth'
import { ProfileForm } from './Account'
import { Link } from 'react-router-dom'
import {
  User, Briefcase, Target, Bell, Settings, ChevronRight, LogOut,
  BookOpen, BarChart2, Calendar, FileText, Camera,
} from 'lucide-react'

const quickLinks = [
  { icon: BarChart2, label: 'Analytics', to: '/app/analytics', color: '#081E35', bg: '#E9F5F2' },
  { icon: Calendar,  label: 'Calendar',  to: '/app/calendar',  color: '#23745B', bg: '#E9F5F2' },
  { icon: FileText,  label: 'Reports',   to: '/app/reports',   color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: Bell,      label: 'Alerts',    to: '/app/notifications', color: '#F59E0B', bg: '#FFFBEB' },
]

function SectionHeader({ icon: Icon, color, label }: any) {
  return (
    <div className="flex items-center gap-2 mb-3 px-4 pt-5">
      <Icon size={14} style={{ color }} />
      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{label}</p>
    </div>
  )
}

export default function Profile() {
  const {state,forgetDevice}=useApp();const [editing,setEditing]=useState(false);if(!state?.profile)return null
  const profile=state.profile;const latest=state.logs[0]
  if(editing)return <><button className="faro-secondary m-4" onClick={()=>setEditing(false)}>← Back to profile</button><ProfileForm/></>
  const infoRows=[['Student Number',profile.studentNumber],['College',profile.college],['Course',profile.course],['Year Level',profile.yearLevel],['Employment',profile.employment],['Email',state.user.email]].map(([label,value])=>({label,value:value||'Not provided'}))
  const goals=[{label:'Daily Study Goal',value:`${profile.studyGoal} hrs`,color:'#081E35'},{label:'Nightly Sleep Goal',value:`${profile.sleepGoal} hrs`,color:'#23745B'}]
  const notifPrefs=[{label:'Daily Log Reminders',desc:'Inside FARO · Change in Settings',value:profile.reminders}]


  return (
    <div className="pb-6 animate-fade-in-up">
      {/* Avatar section */}
      <div className="flex flex-col items-center pt-5 pb-4 bg-white border-b" style={{ borderColor: '#E2E8F0' }}>
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>{profile.name.split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase()}</div>

        </div>
        <p className="text-lg font-bold text-[#081E35]" style={{ fontFamily: 'Poppins, sans-serif' }}>{profile.name}</p>
        <p className="text-xs text-[#64748B]">{[profile.course,profile.yearLevel].filter(Boolean).join(' · ')}</p>
        <div className="flex gap-3 mt-3">
          {[[`${latest?.productivity??'—'}/10`,'Productivity'],[`${latest?.sleep??'—'}h`,'Sleep']].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-base font-bold text-[#081E35]" style={{ fontFamily: 'Poppins, sans-serif' }}>{val}</p>
              <p className="text-[10px] text-[#94A3B8]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="px-4 mt-4 grid grid-cols-4 gap-2">
        {quickLinks.map(({ icon: Icon, label, to, color, bg }) => (
          <Link key={label} to={to} className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border active:scale-95 transition-all" style={{ borderColor: '#E2E8F0' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <Icon size={16} style={{ color }} />
            </div>
            <span className="text-[10px] font-medium text-[#64748B] text-center">{label}</span>
          </Link>
        ))}
      </div>

<button className="faro-button mx-4 mt-4" onClick={()=>setEditing(true)}>Edit profile & goals</button>
      {/* Student info */}
      <SectionHeader icon={User} color="#081E35" label="Student Information" />
      <div className="mx-4 bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        {infoRows.map((r, i) => (
          <div key={r.label} className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? 'border-t' : ''}`} style={{ borderColor: '#F1F5F9' }}>
            <span className="text-xs text-[#64748B]">{r.label}</span>
            <span className="text-xs font-semibold text-[#081E35] text-right max-w-[55%]">{r.value}</span>
          </div>
        ))}
      </div>

      {/* Goals */}
      <SectionHeader icon={Target} color="#22C55E" label="Goals & Preferences" />
      <div className="mx-4 space-y-2">
        {goals.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border p-4 flex items-center justify-between" style={{ borderColor: '#E2E8F0' }}>
            <span className="text-sm text-[#64748B]">{label}</span>
            <span className="text-sm font-bold" style={{ color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <SectionHeader icon={Bell} color="#F59E0B" label="Notification Preferences" />
      <div className="mx-4 bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        {notifPrefs.map((n, i) => (
          <div key={n.label} className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? 'border-t' : ''}`} style={{ borderColor: '#F1F5F9' }}>
            <div>
              <p className="text-sm font-medium text-[#081E35]">{n.label}</p>
              <p className="text-[11px] text-[#94A3B8]">{n.desc}</p>
            </div>
            <Link to="/app/settings" aria-label="Change reminder preference" className="w-10 h-6 rounded-full transition-all shrink-0 cursor-pointer relative" style={{ background: n.value ? '#081E35' : '#E2E8F0' }}>
              <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: n.value ? '22px' : '4px' }} />
            </Link>
          </div>
        ))}
      </div>

      {/* Settings & Logout */}
      <div className="mx-4 mt-4 space-y-2">
        <Link to="/app/settings" className="flex items-center gap-3 p-4 bg-white rounded-2xl border active:bg-[#F5F9F7] transition-all" style={{ borderColor: '#E2E8F0' }}>
          <div className="w-9 h-9 rounded-xl bg-[#F5F9F7] flex items-center justify-center">
            <Settings size={16} style={{ color: '#64748B' }} />
          </div>
          <span className="flex-1 text-sm font-medium text-[#081E35]">Settings</span>
          <ChevronRight size={16} className="text-[#CBD5E1]" />
        </Link>
        <button onClick={async()=>{await forgetDevice();await logout();window.location.assign('/login')}} className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border active:bg-danger-50 transition-all" style={{ borderColor: '#E2E8F0' }}>
          <div className="w-9 h-9 rounded-xl bg-danger-50 flex items-center justify-center">
            <LogOut size={16} style={{ color: '#EF4444' }} />
          </div>
          <span className="flex-1 text-sm font-medium text-left" style={{ color: '#EF4444' }}>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
