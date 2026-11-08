import { useApp } from '../lib/store'
import { Link } from 'react-router-dom'
import { Moon, Briefcase, BookOpen, Coffee, GraduationCap, Heart, Battery, ArrowRight, Activity } from 'lucide-react'
import { Page } from '../components/LiveUI'
export default function FatiguePrediction() {
  const {state}=useApp()
  if(!state)return null
  const latest=state.logs[0]
  const factors=[
    {label:'Sleep',value:latest?.sleep,unit:'hours',Icon:Moon},
    {label:'Classes',value:latest?.classes,unit:'hours',Icon:GraduationCap},
    {label:'Study',value:latest?.study,unit:'hours',Icon:BookOpen},
    {label:'Work',value:latest?.work,unit:'hours',Icon:Briefcase},
    {label:'Rest / breaks',value:latest?.brk,unit:'hours',Icon:Coffee},
    {label:'Stress',value:latest?.stress,unit:'/ 10, self-reported',Icon:Heart},
    {label:'Energy',value:latest?.energy,unit:'/ 10, self-reported',Icon:Battery},
  ]
  return <Page title="Daily fatigue" description="Review the routine factors recorded for daily monitoring.">
    <section className="flex gap-4 py-5 border-y border-border"><Activity size={27} className="text-primary shrink-0"/><div><h2 className="font-semibold">Daily estimate: under development</h2><p className="text-sm text-muted leading-relaxed mt-2">The planned Multiple Linear Regression model will estimate a daily fatigue score from routine factors. The target scale and dataset must be established, and the model trained and evaluated, before scores can be shown.</p><Link to="/app/fas" className="inline-flex items-center gap-2 text-primary text-sm font-semibold mt-3">View your available FAS assessment<ArrowRight size={16}/></Link></div></section>
    <section><div className="flex flex-wrap justify-between gap-3 items-center mb-4"><h2 className="font-semibold">Latest recorded factors</h2><p className="text-xs text-muted">{latest?'Entry date: '+latest.date:'No entries yet'}</p></div>
      <div className="grid grid-cols-2 gap-3">{factors.map(({label,value,unit,Icon})=><article key={label} className="bg-white rounded-lg border border-border p-4"><Icon size={21} className="text-primary"/><h3 className="text-sm mt-3">{label}</h3><p className="text-2xl font-semibold mt-1">{value??'—'}</p><p className="text-xs text-muted mt-1">{unit}</p></article>)}</div>
      <p className="text-xs text-muted mt-3 leading-relaxed">These are recorded inputs. Their influence on a daily fatigue estimate has not yet been established.</p>
    </section>
    <div className="flex flex-wrap gap-3"><Link to={latest?'/app/daily-log?date='+latest.date:'/app/daily-log'} className="faro-button">{latest?'Review source entry':'Add a daily log'}</Link><Link to="/app/recommendations" className="faro-secondary">View routine guidance</Link></div>
  </Page>
}
