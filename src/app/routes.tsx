import DemoProfileLive from '../pages/DemoProfileLive'
import React from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { SignIn, ProfileForm } from '../pages/Account'
import MobileLayout from '../components/MobileLayout'
import RoutineLog from '../pages/RoutineLog'
import History from '../pages/History'
import { Dashboard, Analytics, Fatigue, Recommendations, Notifications } from '../pages/Insights'
import ReportsLive from '../pages/ReportsLive'
import SettingsLive from '../pages/SettingsLive'
import { useApp } from '../lib/store'
import { Card, Field, Message, Page } from '../components/LiveUI'
import AdminUsersPage from '../pages/AdminUsers'
import ResponsiveFrame from '../components/ResponsiveFrame'
import FasPage from '../pages/Fas'
import CarePortal, { StudentCare } from '../pages/CarePortal'

function Shell(){return <div className="responsive-shell"><Outlet/></div>}
function AccountGate(){const {loading,state,error,signedOut,passwordRecovery,completePasswordRecovery,refresh}=useApp();const [password,setPassword]=React.useState('');const [confirm,setConfirm]=React.useState('');const [message,setMessage]=React.useState('');const [busy,setBusy]=React.useState(false);if(passwordRecovery)return <Page title="Set a new password" description="Choose a new password for your FARO account."><Card><form className="space-y-4" onSubmit={async e=>{e.preventDefault();setMessage('');if(password.length<8){setMessage('Use at least 8 characters.');return}if(password!==confirm){setMessage('The passwords do not match.');return}setBusy(true);try{await completePasswordRecovery(password);setMessage('Your password has been changed.')}catch(error){setMessage(error instanceof Error?error.message:'Could not change your password.')}finally{setBusy(false)}}}><Field label="New password"><input className="faro-input" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></Field><Field label="Confirm new password"><input className="faro-input" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></Field><Message text={message} success={message.startsWith('Your password has been changed')}/><button className="faro-button" disabled={busy}>{busy?'Saving…':'Change password'}</button></form></Card></Page>;if(loading)return <Page title="Loading your routine…"><p>Connecting to your account.</p></Page>;if(signedOut)return <Navigate to="/login" replace/>;if(error&&!state)return <Page title="Could not load your account"><Message text={error}/><button className="faro-button" onClick={()=>void refresh()}>Try again</button><a className="faro-secondary" href="/login">Sign in again</a></Page>;return state?<Outlet/>:<Navigate to="/login" replace/>}
function ProfileGate(){const {state}=useApp();if(!state?.profile)return <Navigate to="/register" replace/>;if(!state.fasAssessments?.length)return <Navigate to="/fas" replace/>;return <MobileLayout/>}
function FasGate(){const {state}=useApp();if(!state?.profile)return <Navigate to="/register" replace/>;if(state.fasAssessments?.length)return <Navigate to="/app/fas" replace/>;return <FasPage onboarding/>}
function NotFound(){return <Page title="Page not found"><a className="faro-button" href="/app">Open FARO</a></Page>}
export const router=createBrowserRouter([{element:<Shell/>,children:[
 {path:'/',element:<SignIn/>},{path:'/login',element:<SignIn/>},{path:'/forgot-password',element:<SignIn/>},
 {element:<AccountGate/>,children:[{path:'/register',element:<ProfileForm onboarding/>},{path:'/fas',element:<FasGate/>},{path:'/doctor',element:<CarePortal/>},{path:'/admin',element:<Navigate to="/admin/users" replace/>},{path:'/admin/users',element:import.meta.env.DEV?<CarePortal admin/>:<><ResponsiveFrame admin/><AdminUsersPage/></>},{path:'/admin/*',element:<Navigate to="/admin/users" replace/>},{path:'/app',element:<ProfileGate/>,children:[
  {index:true,element:<Dashboard/>},{path:'daily-log',element:<RoutineLog/>},{path:'calendar',element:<History/>},
  {path:'fatigue',element:<Fatigue/>},{path:'fas',element:<FasPage/>},{path:'recommendations',element:<Recommendations/>},{path:'analytics',element:<Analytics/>},
  {path:'reports',element:<ReportsLive/>},{path:'notifications',element:<Notifications/>},{path:'profile',element:<DemoProfileLive/>},{path:'settings',element:<SettingsLive/>},{path:'care',element:<StudentCare/>},
 ]}]},{path:'*',element:<NotFound/>}
]}])

