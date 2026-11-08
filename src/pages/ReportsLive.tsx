import { useApp } from '../lib/store'
import { recentLogs,average,displayNumber } from '../../shared/domain'
import { download,logsCsv,exportAccount } from '../lib/export'
import { useState } from 'react'
import { FileText, Download, TrendingUp, CheckCircle2, Clock } from 'lucide-react'

type ReportType = 'weekly' | 'monthly' | 'semester'

export default function Reports() {
  const [active, setActive] = useState<ReportType>('weekly')
  const [generated, setGenerated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const {state}=useApp();if(!state)return null
  const days=active==='weekly'?7:active==='monthly'?30:180;const logs=recentLogs(state.logs,days)
  const report={title:active==='weekly'?'Weekly Report':active==='monthly'?'Monthly Report':'180-Day Report',period:`Last ${days} days · ${logs.length} entries`,highlights:[
   [displayNumber(average(logs,'productivity'))+'/10','Avg Productivity','#081E35'],[displayNumber(average(logs,'sleep'))+' hrs','Avg Sleep','#23745B'],[logs.length?logs.reduce((s,l)=>s+l.study,0).toFixed(1)+' hrs':'—','Study Time','#8B5CF6'],[logs.length?logs.reduce((s,l)=>s+l.work,0).toFixed(1)+' hrs':'—','Work Time','#F59E0B'],[`${logs.length}/${days}`,'Logs Done','#22C55E']]}
  const insights=[logs.length?`${logs.length} daily entries saved during this period.`:'No saved entries in this period. Add a daily log to start.', 'Averages use recorded days only. Missing days are not counted as zero.','Fatigue is not rated in daily logs; FARO’s fatigue prediction is not yet available.']
  const previous: {title:string;date:string}[]=[]

  function generate() {
    setGenerated(true)
  }

  return (
    <div className="pb-6 animate-fade-in-up">
      {/* Type selector */}
      <div className="px-4 mt-3">
        <div className="flex gap-1 p-1 bg-white rounded-2xl border" style={{ borderColor: '#E2E8F0' }}>
          {(['weekly', 'monthly', 'semester'] as ReportType[]).map(t => (
            <button key={t} onClick={() => { setActive(t); setGenerated(false) }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all capitalize ${active === t ? 'bg-primary text-white' : 'text-[#64748B]'}`}
            >{t==='semester'?'180 days':t}</button>
          ))}
        </div>
      </div>

      {/* Report info card */}
      <div className="mx-4 mt-3 bg-white rounded-2xl border p-4" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#081E35]" style={{ fontFamily: 'Poppins, sans-serif' }}>{report.title}</h3>
            <p className="text-xs text-[#64748B] mt-0.5">{report.period}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <FileText size={18} style={{ color: '#081E35' }} />
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #081E35, #0B5666)' }}
        >
          {loading ? (
            <><Clock size={14} className="animate-spin" /> Generating...</>
          ) : (
            <><TrendingUp size={14} /> Generate Report</>
          )}
        </button>
      </div>

      {/* Generated report */}
      {generated && (
        <div className="mx-4 mt-3 animate-fade-in-up">
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
            {/* Header */}
            <div className="px-4 py-4 border-b" style={{ background: 'linear-gradient(135deg, #E9F5F2, #E9F5F2)', borderColor: '#E2E8F0' }}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
                <span className="text-xs font-bold text-success">Report Ready</span>
              </div>
              <p className="text-sm font-bold text-[#081E35]">{report.title}</p>
              <p className="text-[11px] text-[#64748B]">{report.period} · FARO v1.0</p>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">Student: {state.profile?.name}</p>
            </div>

            {/* Highlights */}
            <div className="p-4 border-b" style={{ borderColor: '#F1F5F9' }}>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3">Key Metrics</p>
              <div className="grid grid-cols-3 gap-2">
                {report.highlights.map(([value, label, color]) => (
                  <div key={label} className="rounded-xl p-2.5" style={{ background: '#F5F9F7' }}>
                    <p className="text-base font-bold" style={{ fontFamily: 'Poppins, sans-serif', color }}>{value}</p>
                    <p className="text-[10px] text-[#64748B] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="p-4 border-b" style={{ borderColor: '#F1F5F9' }}>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">FARO Insights</p>
              <div className="space-y-2">
                {insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl p-2.5" style={{ background: '#F5F9F7' }}>
                    <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary">{i+1}</span>
                    </div>
                    <p className="text-xs text-[#081E35] leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Export */}
            <div className="p-4">
              <div className="flex gap-2">
                <button onClick={()=>download("faro-daily-logs.csv",logsCsv(logs),"text/csv;charset=utf-8")} className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-bold border text-[#64748B] active:scale-95 transition-all" style={{ borderColor: '#E2E8F0' }}>
                  <Download size={13} /> Export CSV
                </button>
                <button onClick={()=>window.print()} className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-bold text-white active:scale-95 transition-all" style={{ background: '#081E35' }}>
                  <Download size={13} /> Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

<div className="mx-4 mt-3"><button className="faro-secondary w-full" onClick={()=>exportAccount(state)}>Download all account data (JSON)</button></div>
      {/* Previous reports */}
      <div className="mx-4 mt-3 bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider px-4 py-3 border-b" style={{ borderColor: '#F1F5F9' }}>Previous Reports</p><p className="px-4 py-3 text-xs text-[#94A3B8]">Reports are generated from your current saved logs. Export a copy to keep it.</p>
        {previous.map((r, i) => (
          <div key={r.title} className={`flex items-center gap-3 px-4 py-3.5 active:bg-[#F5F9F7] transition-colors ${i > 0 ? 'border-t' : ''}`} style={{ borderColor: '#F1F5F9' }}>
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
              <FileText size={15} style={{ color: '#081E35' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#081E35] truncate">{r.title}</p>
              <p className="text-[11px] text-[#64748B]">{r.date}</p>
            </div>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-primary bg-primary-50 active:scale-95 transition-all">
              <Download size={11} /> PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
