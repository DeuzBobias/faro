import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, ClipboardList, Moon, BookOpen, Briefcase, Coffee, GraduationCap, Lightbulb } from 'lucide-react'
import { useApp } from '../lib/store'
import { displayNumber, fasBand, fasRetakeDate, localDate, routineSuggestions } from '../../shared/domain'
import { weeklyRoutine } from '../../shared/routine-summary'
import './RoutineOverview.css'

const metricDetails={sleep:{label:'Sleep',Icon:Moon,color:'#23745b'},classes:{label:'Classes',Icon:GraduationCap,color:'#287391'},study:{label:'Study',Icon:BookOpen,color:'#795ab0'},work:{label:'Work',Icon:Briefcase,color:'#a86c12'},brk:{label:'Rest / breaks',Icon:Coffee,color:'#a04466'}}
export default function Dashboard() {
  const {state}=useApp()
  if(!state)return null
  const latest=state.logs[0]
  const fas=state.fasAssessments?.[0]
  const next=fasRetakeDate(fas)
  const week=weeklyRoutine(state.logs)
  const todayLogged=state.logs.some(log=>log.date===localDate())
  const suggestion=routineSuggestions(latest,state.profile)[0]
  const color=fas?(fas.score<22?'#17834e':fas.score<35?'#bc900a':'#d54747'):'#677674'
  return <div className="routine-overview">
    <header className="overview-heading"><div><h1>Hello, {state.profile?.name.split(' ')[0]||'there'}</h1><p>Your assessments and daily routine, at a glance.</p></div><Link className="faro-button inline-flex items-center justify-center gap-2" to="/app/daily-log">{todayLogged?'Review today’s log':'Log today'}<ArrowRight size={17}/></Link></header>
    <section className="overview-fas" aria-label="Latest FAS assessment">
      <div className="overview-score" style={{borderColor:color,color}}><strong>{fas?.score??'—'}</strong><span>FAS / 50</span></div>
      <div className="overview-fas-copy"><p className="overview-kicker">FATIGUE ASSESSMENT SCALE</p><h2>{fas?fasBand(fas.score):'Complete your first assessment'}</h2><p>{fas?'Completed '+new Date(fas.completedAt).toLocaleDateString():'Your FAS result will appear here.'}</p>{next&&<p>Next assessment: {new Date(next).toLocaleDateString()}</p>}<Link to="/app/fas" className="overview-link">View FAS assessment<ArrowRight size={16}/></Link></div>
    </section>
    <section className="overview-week" aria-label="Weekly routine summary">
      <div className="overview-section-heading"><div><h2>Past seven days</h2><p>Average hours per recorded day</p></div><span className="overview-coverage"><CalendarDays size={17}/>{week.days} of 7 days logged</span></div>
      <div className="overview-metrics">{week.metrics.map(metric=>{const {label,Icon,color}=metricDetails[metric.key];return <article key={metric.key} className="overview-metric"><Icon size={22} style={{color}}/><h3>{label}</h3><p className="overview-value">{displayNumber(metric.value)}<span> h/day</span></p><p className="overview-comparison">{metric.change===null?'Comparison needs entries in both weeks':Math.abs(metric.change)<0.05?'No change in average hours':(metric.change>0?'+':'')+metric.change.toFixed(1)+' h vs previous week'}</p></article>})}</div>
      <p className="overview-footnote">Missing days are excluded. Previous seven days: {week.previousDays} recorded. Changes describe your routine and do not establish a change in fatigue.</p>
      <Link to="/app/analytics" className="overview-link">Explore routine trends<ArrowRight size={16}/></Link>
    </section>
    <section className="overview-prompt"><Lightbulb size={25}/><div><p className="overview-kicker">ROUTINE GUIDANCE{latest?' · '+latest.date:''}</p><h2>{suggestion?.title||'Start with a daily log'}</h2><p>{suggestion?.detail||'Record your sleep, classes, work, study, and rest to see your routine summary.'}</p><Link to="/app/recommendations" className="overview-link">Review your recommendations<ArrowRight size={16}/></Link></div></section>
    <nav className="overview-shortcuts" aria-label="Routine records"><Link to="/app/calendar"><CalendarDays size={21}/><span>Review past entries</span><ArrowRight size={16}/></Link><Link to="/app/reports"><ClipboardList size={21}/><span>Open your routine report</span><ArrowRight size={16}/></Link></nav>
  </div>
}
