import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { CalendarClock, ClipboardList, HeartPulse, Info, RotateCcw } from 'lucide-react'
import { fasBand, fasItems, fasResponseOptions, fasRetakeDate, type FasAssessment } from '../../shared/domain'
import { useApp } from '../lib/store'
import { Card, Message, Page } from '../components/LiveUI'
import './Fas.css'

function scoreTone(score:number) { return score<22?'low':score<35?'moderate':'high' }

function displayDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric' })
}

function recommendation(score: number) {
  if (score < 22) return {
    title:'Keep supporting your routine',
    detail:'Your FAS score is below the commonly used fatigue cutoff. Continue monitoring your sleep, workload, and rest. This result does not rule out fatigue or another health concern.',
  }
  if (score < 35) return {
    title:'Make space for recovery this week',
    detail:'Your score falls in the FAS fatigue range. Review your upcoming school and work commitments, protect time for rest, and notice whether fatigue continues or affects your usual activities.',
  }
  return {
    title:'Consider additional support',
    detail:'Your score falls in the FAS extreme-fatigue range. If fatigue persists or interferes with daily activities, consider discussing it with a qualified health professional. FARO cannot determine its cause or diagnose a condition.',
  }
}

function Results({ assessment, nextDate }: { assessment:FasAssessment; nextDate:string|null }) {
  const advice=recommendation(assessment.score)
  return <>
    <section className={`fas-result fas-tone-${scoreTone(assessment.score)}`} aria-label="Latest FAS result">
      <div className="fas-result-main">
        <div className="fas-score-circle" aria-label={`FAS score ${assessment.score} out of 50`}>
          <span className="fas-score-caption">FAS SCORE</span>
          <strong>{assessment.score}</strong>
          <span className="fas-score-denominator">out of 50</span>
        </div>
        <div className="fas-result-copy">
          <p className="fas-eyebrow">YOUR LATEST ASSESSMENT</p>
          <h2>{fasBand(assessment.score)}</h2>
          <p className="fas-result-date">Completed {displayDate(assessment.completedAt)}</p>
          <p className="fas-result-note">Your usual fatigue, assessed separately from your daily routine.</p>
        </div>
      </div>
      <div className="fas-scale" aria-label="FAS score ranges">
        {[{tone:'low',range:'10–21',label:'Below cutoff'},{tone:'moderate',range:'22–34',label:'Fatigue range'},{tone:'high',range:'35–50',label:'Extreme fatigue'}].map(band=><div key={band.tone} className={`fas-scale-band fas-tone-${band.tone}`} aria-current={scoreTone(assessment.score)===band.tone?'true':undefined}>
          <div className="fas-scale-stripe"/><strong>{band.range}</strong><span>{band.label}</span>
          {scoreTone(assessment.score)===band.tone&&<small>Your result</small>}
        </div>)}
      </div>
    </section>
    <section className={`fas-guidance fas-tone-${scoreTone(assessment.score)}`}>
      <div className="fas-guidance-icon"><HeartPulse size={24}/></div>
      <div><p className="fas-eyebrow">RECOMMENDED NEXT STEP</p><h2>{advice.title}</h2><p className="fas-guidance-detail">{advice.detail}</p></div>
    </section>
    {nextDate&&<section className="fas-next">
      <CalendarClock size={24} className="shrink-0"/>
      <div><p className="fas-eyebrow">NEXT ASSESSMENT</p><p className="fas-next-date">{displayDate(nextDate)}</p><p className="text-sm text-muted mt-1">A new assessment becomes available every three months.</p></div>
    </section>}
  </>
}

function Questionnaire({ onboarding, onCancel }:{onboarding:boolean;onCancel:()=>void}) {
  const {saveFasAssessment}=useApp()
  const navigate=useNavigate()
  const [answers,setAnswers]=useState<number[]>(Array(10).fill(0))
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const answered=answers.every(value=>value>=1&&value<=5)

  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setError('')
    if(!answered){setError('Please answer all 10 statements.');return}
    setBusy(true)
    try { await saveFasAssessment(answers);if(onboarding)navigate('/app',{replace:true});else onCancel() }
    catch(e){setError(e instanceof Error?e.message:'Could not save your FAS assessment.')}
    finally{setBusy(false)}
  }

  return <>
    <Card>
      <div className="flex items-start gap-3"><ClipboardList size={21} className="text-secondary mt-0.5 shrink-0"/><div><h2 className="font-semibold">Fatigue Assessment Scale</h2><p className="text-sm leading-relaxed text-muted mt-1">These ten statements refer to how you usually feel. Choose one response for each statement, even if you do not have any complaints at the moment.</p></div></div>
    </Card>
    <form onSubmit={submit} className="space-y-3">
      {fasItems.map((item,index)=><fieldset key={item} className="rounded-xl border border-border bg-white p-4">
        <legend className="sr-only">{index+1}. {item}</legend>
        <p className="text-sm font-medium leading-relaxed"><span className="text-muted mr-2">{index+1}.</span>{item}</p>
        <div className="grid grid-cols-5 gap-1.5 mt-3">
          {fasResponseOptions.map((option,optionIndex)=><label key={option} className="min-w-0 cursor-pointer text-center">
            <input className="peer sr-only" type="radio" name={`fas-${index}`} value={optionIndex+1} aria-label={`${item}: ${option}`} checked={answers[index]===optionIndex+1} onChange={()=>setAnswers(current=>current.map((value,i)=>i===index?optionIndex+1:value))}/>
            <span className="flex aspect-square items-center justify-center rounded-lg border border-border text-sm font-semibold text-secondary peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">{optionIndex+1}</span>
            <span className="mt-1 block text-[10px] leading-tight text-muted">{['Never','Sometimes','Regularly','Often','Always'][optionIndex]}</span>
          </label>)}
        </div>
        <p className="mt-2 text-[10px] leading-tight text-muted">{fasResponseOptions.map((option,i)=>`${i+1} ${option}`).join(' · ')}</p>
      </fieldset>)}
      <Message text={error}/>
      <button className="faro-button w-full" disabled={busy||!answered}>{busy?'Saving assessment…':onboarding?'Complete FAS and continue':'Save new FAS assessment'}</button>
      {!onboarding&&<button type="button" className="faro-secondary w-full" disabled={busy} onClick={onCancel}>Cancel</button>}
    </form>
  </>
}

export default function FasPage({onboarding=false}:{onboarding?:boolean}) {
  const {state}=useApp()
  const [editing,setEditing]=useState(false)
  if(!state)return null
  if(!state.profile)return <Navigate to="/register" replace/>
  const assessments=state.fasAssessments||[]
  const latest=assessments[0]
  const nextDate=fasRetakeDate(latest)
  const canRetake=!latest||!nextDate||Date.now()>=Date.parse(nextDate)

  if(onboarding&&latest)return <Navigate to="/app/fas" replace/>

  return <Page title={onboarding?'Your baseline FAS':'Fatigue Assessment Scale'} description={onboarding?'Complete the FAS after setting up your profile. Your score is separate from daily routine monitoring.':'Review your latest FAS result or complete a new assessment when it becomes due.'}>
    {onboarding&&<Card className="flex items-start gap-3"><Info size={19} className="text-secondary mt-0.5 shrink-0"/><p className="text-sm leading-relaxed text-muted">The FAS is a self-report assessment, not a diagnosis. Your answers and score are stored with your account. FARO will ask you to complete it again after three months.</p></Card>}
    {editing?<Questionnaire onboarding={false} onCancel={()=>setEditing(false)}/>:latest?<>
      <Results assessment={latest} nextDate={nextDate}/>
      {canRetake?<button type="button" className="faro-button w-full flex items-center justify-center gap-2" onClick={()=>setEditing(true)}><RotateCcw size={17}/>Retake FAS</button>:<button type="button" className="faro-secondary w-full flex items-center justify-center gap-2" disabled title={`Available ${displayDate(nextDate!)}`}><CalendarClock size={17}/>Available {displayDate(nextDate!)}</button>}
      {assessments.length>1&&<Card><h2 className="font-semibold mb-3">Previous assessments</h2><ul className="divide-y divide-border">{assessments.slice(1).map(attempt=><li key={attempt.id} className="flex justify-between gap-3 py-3 text-sm"><span>{displayDate(attempt.completedAt)}</span><span className="font-semibold">{attempt.score} / 50</span></li>)}</ul></Card>}
    </>:<Questionnaire onboarding={onboarding} onCancel={()=>{}}/>}
    <Card><p className="text-xs leading-relaxed text-muted">FAS wording and scoring: Fatigue Assessment Scale (FAS), © ild care foundation. Used for research under the foundation’s stated conditions. <a className="underline" href="https://www.ildcare.nl/en/fatigue-assessment-scale-conditions-for-use-and-copyright/" target="_blank" rel="noreferrer">Conditions of use</a>.</p></Card>
    {!onboarding&&<Link className="faro-secondary block text-center" to="/app">Back to home</Link>}
  </Page>
}
