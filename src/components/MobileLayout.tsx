import ResponsiveFrame from './ResponsiveFrame'
import { useEffect, useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Activity, Lightbulb, User, Bell } from 'lucide-react'
import FaroLogo from './FaroLogo'
import { useApp } from '../lib/store'
import { localDate } from '../../shared/domain'
import { useCareNotifications } from '../lib/care-notifications'
const nav=[{to:'/app',icon:LayoutDashboard,label:'Home'},{to:'/app/daily-log',icon:BookOpen,label:'Log'},{to:'/app/fatigue',icon:Activity,label:'Fatigue'},{to:'/app/recommendations',icon:Lightbulb,label:'Reflect'},{to:'/app/profile',icon:User,label:'Profile'}]
export default function MobileLayout(){
 const {unread}=useCareNotifications()
 const {state,offline,pending,error,refresh}=useApp();const location=useLocation();const [online,setOnline]=useState(navigator.onLine)
 useEffect(()=>{const on=()=>setOnline(true);const off=()=>setOnline(false);window.addEventListener('online',on);window.addEventListener('offline',off);return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off)}},[])
 useEffect(()=>{document.getElementById('app-content')?.scrollTo(0,0)},[location.pathname])
 const reminder=state?.profile?.reminders&&!state?.logs.some(l=>l.date===localDate())
 const initials=(state?.profile?.name||'F').split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase()
 return <ResponsiveFrame status={(!online||offline||pending>0||error)?<p role="status" className="px-4 py-2 text-sm bg-amber-50 text-amber-900">{error || (offline ? "Offline: using records saved on this device. " : "")}{pending>0 ? `${pending} change(s) saved on this device, waiting to sync. ` : ""}<button className="underline ml-2" onClick={()=>void refresh()}>Retry sync</button></p>:null} actions={<><NavLink to="/app/notifications" className="relative p-3" aria-label={unread.length?`Notifications: ${unread.length} unread guidance messages`:reminder?'Reminders: today’s log is missing':'Notifications'}><Bell size={20}/>{unread.length>0?<span className="absolute right-0 top-0 min-w-5 h-5 px-1 text-center text-xs bg-red-700 text-white rounded-full">{unread.length>99?'99+':unread.length}</span>:reminder&&<span className="absolute right-2 top-2 h-2 w-2 bg-secondary rounded-full"/>}</NavLink><NavLink to="/app/profile" aria-label="Your profile" className="bg-primary text-white rounded-full w-11 h-11 flex items-center justify-center text-sm font-bold">{initials}</NavLink></>}/>
}
