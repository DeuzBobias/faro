import OfflineReady from './OfflineReady'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Calendar, Activity, ClipboardList, Lightbulb, BarChart2, FileText, Bell, User, Settings, Users, Menu, Quote } from 'lucide-react'
import FaroLogo from './FaroLogo'
import { localDate } from '../../shared/domain'
const student = [
 ['/app','Home',LayoutDashboard],['/app/daily-log','Daily log',BookOpen],
 ['/app/fatigue','Fatigue',Activity],['/app/fas','FAS',ClipboardList],
 ['/app/recommendations','Recommendations',Lightbulb],['/app/profile','Profile',User],['/app/calendar','Calendar',Calendar],
 ['/app/analytics','Analytics',BarChart2],['/app/reports','Reports',FileText],
 ['/app/notifications','Reminders',Bell],['/app/care','Professional support',Users],['/app/settings','Settings',Settings],
] as const
const adminNav = [['/admin/users','Accounts',Users]] as const
const dailyQuotes = [
 'You deserve a moment to pause and breathe.',
 'Rest is part of moving forward.',
 'Take today one gentle step at a time.',
 'You do not have to do it all at once.',
 'A little care for yourself goes a long way.',
 'It is okay to slow down and check in with yourself.',
 'You are allowed to make room for rest.',
 'Small steps still count. Be kind to yourself along the way.',
 'Your wellbeing matters, even on the busy days.',
 'Pause when you need to. You can begin again when you are ready.',
 'Give yourself the same patience you offer others.',
 'A softer pace is still progress.',
 'You are doing enough by showing up for yourself today.',
 'Take a breath. This moment is yours.',
 'Caring for yourself is a good use of your time.',
 'You can take things as they come, one moment at a time.',
 'Let today have a little space for you, too.',
 'There is no rush to have everything figured out.',
 'Listen to what you need, and let that be enough for now.',
 'You deserve care on ordinary days, too.',
 'Rest, reset, and return at your own pace.',
 'Be gentle with yourself as you find your rhythm.',
 'Taking a break is a way of taking care.',
 'For now, one slow breath is enough.',
 'Make space for what helps you feel grounded.',
 'You can meet this day at your own pace.',
 'A quiet moment can be a meaningful start.',
 'Notice what you need. You are worth listening to.',
 'It is okay if all you do today is take care of yourself.',
 'Let progress be gentle today.',
 'You are allowed to pause before the next step.',
]

function DailyWellbeingQuote() {
 const day = localDate()
 const dayNumber = Number(day.replace(/-/g, ''))
 const quote = dailyQuotes[dayNumber % dailyQuotes.length]
 return <aside className="daily-wellbeing-quote" aria-label="Daily wellbeing reminder">
  <Quote size={16} aria-hidden="true" />
  <p>{quote}</p>
 </aside>
}
export default function ResponsiveFrame({admin=false,status,actions}:{admin?:boolean;status?:ReactNode;actions?:ReactNode}) {
 const {pathname}=useLocation();const menu=useRef<HTMLDetailsElement>(null);const content=useRef<HTMLElement>(null)
 const items=admin?adminNav:student
 useEffect(()=>{content.current?.scrollTo(0,0);if(menu.current)menu.current.open=false},[pathname])
 useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==='Escape'&&menu.current){menu.current.open=false;menu.current.querySelector('summary')?.focus()}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[])
 const links=(mobile=false)=>items.slice(0,mobile?6:items.length).map(([to,label,Icon])=><NavLink key={to} to={to} end className={({isActive})=>'adaptive-link'+(isActive?' active':'')}><Icon size={21}/><span>{mobile&&to.endsWith('daily-log')?'Log':mobile&&to.endsWith('recommendations')?'Recs':label}</span></NavLink>)
 return <div className={'adaptive-app'+(admin?' adaptive-admin':'')}>
  <aside className="adaptive-sidebar"><NavLink to={admin?'/admin':'/app'} aria-label="FARO home"><FaroLogo size={38}/></NavLink>{!admin&&<DailyWellbeingQuote/>}<nav aria-label="Main navigation">{links()}</nav></aside>
  <div className="adaptive-workspace"><OfflineReady/><header className="adaptive-header"><div className="adaptive-header-brand"><NavLink className="adaptive-header-logo" to={admin?'/admin':'/app'} aria-label="FARO home"><FaroLogo size={30}/></NavLink>{!admin&&<DailyWellbeingQuote/>}</div><div className="adaptive-actions">{actions}<details ref={menu} className="adaptive-menu"><summary aria-label="All pages"><Menu size={22}/><span>Menu</span></summary><nav aria-label="All pages">{links()}</nav></details></div></header>{status}
  <main ref={content} id="app-content" className="adaptive-content"><Outlet/></main>
  <nav className="adaptive-bottom" aria-label="Quick navigation">{links(true)}</nav></div>
 </div>
}
