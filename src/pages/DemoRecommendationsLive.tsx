import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb, ArrowRight } from 'lucide-react'
import { useApp } from '../lib/store'
import { routineSuggestions } from '../../shared/domain'
import { Page } from '../components/LiveUI'
export default function Recommendations(){
 const {state}=useApp()
 const [filter,setFilter]=useState('All')
 if(!state)return null
 const latest=state.logs[0]
 const recs=routineSuggestions(latest,state.profile)
 const categories=['All',...new Set(recs.map(item=>item.category))]
 return <Page title="Your recommendations" description={latest?'Routine-based guidance from your '+latest.date+' entry.':'Save a daily log to receive routine guidance.'}>
  <div className="flex items-start gap-3 py-4 border-b border-border"><Lightbulb size={24} className="text-amber-600 shrink-0"/><div><h2 className="font-semibold">{recs.length} routine {recs.length===1?'reflection':'reflections'}</h2><p className="text-sm text-muted mt-1">These prompts use your recorded habits and personal goals.</p><Link to="/app/fas" className="inline-flex items-center gap-2 text-sm font-semibold text-primary mt-2">View guidance from your FAS assessment<ArrowRight size={15}/></Link></div></div>
  {recs.length>0?<><label className="flex items-center gap-3 text-sm font-medium">Category<select className="faro-input max-w-52" value={filter} onChange={e=>setFilter(e.target.value)}>{categories.map(category=><option key={category}>{category}</option>)}</select></label>
  <div className="space-y-4">{recs.filter(item=>filter==='All'||filter===item.category).map(item=><article key={item.title} className="bg-white border border-border rounded-lg p-5"><p className="text-xs font-semibold text-primary">{item.category}</p><h2 className="font-semibold mt-2">{item.title}</h2><p className="text-sm text-muted leading-relaxed mt-2">{item.detail}</p><div className="mt-4 border-l-4 border-primary pl-3"><h3 className="text-xs font-semibold">Why this appears</h3><p className="text-sm text-muted mt-1">{item.evidence}</p></div><Link to={'/app/daily-log?date='+latest!.date} className="inline-flex gap-2 items-center text-sm text-primary font-semibold mt-4">Review source entry<ArrowRight size={15}/></Link></article>)}</div></>:<Link className="faro-button inline-block" to="/app/daily-log">Add a daily log</Link>}
 </Page>
}
