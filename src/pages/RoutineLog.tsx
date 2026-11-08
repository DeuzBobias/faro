import { useState, useEffect } from 'react'
import { useSearchParams, useBlocker } from 'react-router-dom'
import { useApp } from '../lib/store'
import { emptyLog, localDate, validateLog, validDate, type DailyLog } from '../../shared/domain'
import { Card, Message } from '../components/LiveUI'

import { Moon, BookOpen, Briefcase, GraduationCap, Coffee, Droplets, Zap, Activity, Save, CheckCircle2 } from 'lucide-react'
const moods = [
  { emoji: '😤', label: 'Stressed' },
  { emoji: '😔', label: 'Down' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😊', label: 'Good' },
  { emoji: '😄', label: 'Great' },
]

function SectionCard({ title, icon: Icon, color, children }: any) {
  return (
    <div className="mx-4 mb-3 bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: color + '08', borderColor: '#E2E8F0' }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
          <Icon size={13} style={{ color }} />
        </div>
        <p className="text-xs font-bold text-[#081E35]" style={{ fontFamily: 'Poppins, sans-serif' }}>{title}</p>
      </div>
      <div className="px-4 py-4 space-y-4">{children}</div>
    </div>
  )
}

function SliderField({ label, value, onChange, min = 0, max = 10, step = 0.5, color = '#081E35', unit = '' }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-[#64748B]">{label}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>{value}{unit}</span>
      </div>
      <input
        aria-label={label} type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="faro-range w-full h-2 rounded-full cursor-pointer appearance-none"
        style={{ accentColor: color, '--range-color': color } as React.CSSProperties}
      />
      <div className="flex justify-between mt-1 text-[10px] text-[#CBD5E1]">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  )
}

function NumberCard({ label, icon: Icon, color, value, onChange, max = 24 }: any) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <Icon size={14} style={{ color }} />
        <span className="text-sm text-[#081E35]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`Decrease ${label}`} disabled={value <= 0} onClick={() => onChange(Math.max(0, value - 0.5))} className="w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-[#64748B] hover:bg-[#F5F9F7] active:scale-95 transition-all" style={{ borderColor: '#E2E8F0' }}>−</button>
        <label className="number-stepper-value" aria-label={`${label} value in hours`}>
          <input
            type="number"
            min={0}
            max={max}
            step={0.5}
            inputMode="decimal"
            aria-label={`${label} (hours)`}
            value={value}
            onChange={e => {
              const next = e.target.value === '' ? 0 : Number(e.target.value)
              if (Number.isFinite(next)) onChange(Math.min(max, Math.max(0, next)))
            }}
            className="number-stepper-input"
            style={{ color, fontFamily: 'Poppins, sans-serif' }}
          />
          <span aria-hidden="true">h</span>
        </label>
        <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 0.5))} className="w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-[#64748B] hover:bg-[#F5F9F7] active:scale-95 transition-all" style={{ borderColor: '#E2E8F0' }}>+</button>
      </div>
    </div>
  )
}

const hours=[['sleep','Sleep'],['study','Study'],['classes','Classes'],['work','Work'],['brk','Breaks'],['exercise','Exercise']] as const
export default function RoutineLog(){
  const [params,setParams]=useSearchParams()
  const requested=params.get('date')
  const date=validDate(requested)&&requested<=localDate()?requested:localDate()
  return <Editor key={date} date={date} changeDate={value=>setParams({date:value})}/>
}
function Editor({date,changeDate}:{date:string;changeDate:(date:string)=>void}){
  const {state,saveLog,deleteLog}=useApp()
  const existing=state?.logs.find(l=>l.date===date)
  const [log,setLog]=useState<DailyLog>(()=>existing||emptyLog(date))
  const [dirty,setDirty]=useState(false);const [busy,setBusy]=useState(false)
  const [error,setError]=useState('');const [message,setMessage]=useState('');const [confirmDelete,setConfirmDelete]=useState(false)
  const blocker=useBlocker(({currentLocation,nextLocation})=>dirty&&(currentLocation.pathname!==nextLocation.pathname||currentLocation.search!==nextLocation.search))
  useEffect(()=>{if(!dirty)return;const leave=(e:BeforeUnloadEvent)=>e.preventDefault();window.addEventListener('beforeunload',leave);return()=>window.removeEventListener('beforeunload',leave)},[dirty])
  const update=(key:keyof DailyLog,value:string|number)=>{setLog(l=>({...l,[key]:value}));setDirty(true);setMessage('')}
  async function save(e:React.FormEvent){e.preventDefault();setError('');setMessage('');const problem=validateLog(log);if(problem){setError(problem);return}setBusy(true);try{await saveLog(log);setDirty(false);setMessage('Nice work checking in! 🎉 Saved on this device. Changes sync to your account when connected.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
  async function remove(){setBusy(true);setError('');try{await deleteLog(date);setLog(emptyLog(date));setDirty(false);setConfirmDelete(false);setMessage('Daily log deleted.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
  const total=hours.reduce((n,[key])=>n+(Number.isFinite(log[key])?log[key]:0),0)
  const {sleep,sleepQ,study,work,classes,brk,exercise,water,mood,stress,energy,productivity,notes}=log
  const setSleep=(value:number)=>update('sleep',value)
  const setSleepQ=(value:number)=>update('sleepQ',value)
  const setStudy=(value:number)=>update('study',value)
  const setWork=(value:number)=>update('work',value)
  const setClasses=(value:number)=>update('classes',value)
  const setBrk=(value:number)=>update('brk',value)
  const setExercise=(value:number)=>update('exercise',value)
  const setWater=(value:number)=>update('water',value)
  const setMood=(value:number)=>update('mood',value)
  const setStress=(value:number)=>update('stress',value)
  const setEnergy=(value:number)=>update('energy',value)
  const setProd=(value:number)=>update('productivity',value)
  const setNotes=(value:string)=>update('notes',value)
  return (
    <div className="pb-6 animate-fade-in-up">
    {blocker.state==='blocked'&&<div role="alertdialog" aria-label="Unsaved daily log" aria-modal="true" className="fixed inset-0 bg-primary/60 z-50 flex items-center justify-center p-5"><Card><h2 className="font-semibold">Leave without saving?</h2><p className="text-sm text-muted my-3">Your latest changes haven’t been saved.</p><div className="flex gap-3"><button autoFocus className="faro-button" onClick={()=>blocker.reset()}>Keep editing</button><button className="faro-secondary" onClick={()=>blocker.proceed()}>Discard changes</button></div></Card></div>}
      {/* Date */}
      <div className="mx-4 my-3">
        <input
          aria-label="Log date" type="date" min="2000-01-01" max={localDate()} value={date} disabled={busy} onChange={e=>{if(validDate(e.target.value))changeDate(e.target.value)}}
          className="w-full px-4 py-3.5 rounded-2xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          style={{ borderColor: '#E2E8F0', color: '#081E35' }}
        />
      </div>

      <form onSubmit={save}><fieldset disabled={busy}>
      {/* Sleep */}
      <SectionCard title="Sleep" icon={Moon} color="#23745B">
        <NumberCard label="Sleep Duration" icon={Moon} color="#23745B" value={sleep} onChange={setSleep} max={24} />
        <SliderField label="Sleep Quality" value={sleepQ} onChange={setSleepQ} color="#23745B" unit="/10" />
      </SectionCard>

      {/* Academic */}
      <SectionCard title="Academic" icon={BookOpen} color="#081E35">
        <NumberCard label="Study Hours" icon={BookOpen} color="#081E35" value={study} onChange={setStudy} />
        <div className="border-t" style={{ borderColor: '#F1F5F9' }} />
        <NumberCard label="Class Hours" icon={GraduationCap} color="#8B5CF6" value={classes} onChange={setClasses} max={24} />
        <div className="border-t" style={{ borderColor: '#F1F5F9' }} />
        <NumberCard label="Break Time" icon={Coffee} color="#22C55E" value={brk} onChange={setBrk} max={24} />
      </SectionCard>

      {/* Work */}
      <SectionCard title="Work" icon={Briefcase} color="#F59E0B">
        <NumberCard label="Work Hours" icon={Briefcase} color="#F59E0B" value={work} onChange={setWork} />
      </SectionCard>

      {/* Wellness */}
      <SectionCard title="Wellness" icon={Activity} color="#22C55E">
        <NumberCard label="Exercise" icon={Activity} color="#22C55E" value={exercise} onChange={setExercise} max={24} />
        <div className="border-t" style={{ borderColor: '#F1F5F9' }} />
        <SliderField label="Water Intake" value={water} onChange={setWater} min={0} max={30} step={1} color="#0B5666" unit=" glasses" />
      </SectionCard>

      {/* Mood */}
      <div className="mx-4 mb-3 bg-white rounded-2xl border p-4" style={{ borderColor: '#E2E8F0' }}>
        <p className="text-xs font-bold text-[#081E35] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Mood Check-in</p>
        <div className="flex gap-2">
          {moods.map((m, i) => (
            <button
              key={i} type="button" aria-label={`${m.emoji} ${m.label}`} aria-pressed={mood === i}
              onClick={() => setMood(i)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl border-2 transition-all active:scale-95 ${mood === i ? 'border-primary bg-primary-50' : 'border-[#E2E8F0]'}`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-[9px] font-medium" style={{ color: mood === i ? '#081E35' : '#94A3B8' }}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fatigue & Productivity */}
      <SectionCard title="Fatigue & Productivity" icon={Zap} color="#EF4444">
        <SliderField label="Stress Level" value={stress} onChange={setStress} color="#EF4444" unit="/10" />
        <SliderField label="Energy Level" value={energy} onChange={setEnergy} color="#F59E0B" unit="/10" />
        <SliderField label="Productivity Rating" value={productivity} onChange={setProd} color="#22C55E" unit="/10" />
      </SectionCard>

      {/* Notes */}
      <div className="mx-4 mb-4 bg-white rounded-2xl border p-4" style={{ borderColor: '#E2E8F0' }}>
        <p className="text-xs font-bold text-[#081E35] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Notes (Optional)</p>
        <textarea
          aria-label="Notes (Optional)" maxLength={2000} rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How was your day? Any challenges or highlights?"
          className="w-full px-4 py-3 rounded-2xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          style={{ borderColor: '#E2E8F0', color: '#081E35' }}
        />
      </div>

      <div className="mx-4 mb-3"><p className="text-xs text-muted mb-2">{Number(total.toFixed(1))} / 24 hours recorded · Count each hour once.</p><Message text={error}/></div>
      {/* Save */}
      <div className="mx-4">
        <button
          type="submit" disabled={busy || total > 24}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #081E35, #0B5666)' }}
        >
          <Save size={16} /> {busy ? "Saving…" : "Save Daily Log"}
        </button>
        {message && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-success animate-confetti">
            <CheckCircle2 size={16} /> {message}
          </div>
        )}
      </div>
      <p className="mx-4 mt-3 text-xs text-muted">{dirty ? 'Unsaved changes. Save before leaving.' : 'Saved entries sync to your account when connected.'}</p>
      </fieldset></form>
      <div className="mx-4 mt-4">
      {existing&&!confirmDelete&&<button type="button" className="faro-secondary text-red-800 w-full" onClick={()=>setConfirmDelete(true)}>Delete this log</button>}
      {confirmDelete&&<Card><p className="font-semibold">Delete the entry for {date}?</p><div className="flex gap-2 mt-3"><button disabled={busy} className="faro-secondary flex-1" onClick={()=>setConfirmDelete(false)}>Cancel</button><button disabled={busy} className="faro-button flex-1" onClick={()=>void remove()}>Delete log</button></div></Card>}
      </div>
    </div>
  )
}
