import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
export function Page({title,description,children}:{title:string;description?:string;children:ReactNode}) {
  return <div className="faro-page p-4 space-y-4 pb-8 animate-fade-in-up"><header><h1 className="text-xl font-bold">{title}</h1>{description&&<p className="text-sm text-muted mt-1 leading-relaxed">{description}</p>}</header>{children}</div>
}
export function Card({children,className=''}:{children:ReactNode;className?:string}){return <section className={'faro-card bg-white border border-border rounded-2xl p-4 '+className}>{children}</section>}
export function Empty({title='Your routine starts here',text='Save your first daily log to see your own trends.'}:{title?:string;text?:string}) {return <Card><p className="font-semibold">{title}</p><p className="text-sm text-muted mt-2 mb-4">{text}</p><Link className="faro-button" to="/app/daily-log">Add a daily log</Link></Card>}
export function Message({text,success=false}:{text:string;success?:boolean}) {return text?<p role={success?'status':'alert'} className={'text-sm rounded-xl p-3 '+(success?'bg-primary-50 text-secondary':'bg-danger-50 text-red-800')}>{text}</p>:null}
export function Metric({label,value,unit=''}:{label:string;value:string;unit?:string}) {return <Card><p className="text-xs text-muted">{label}</p><p className="text-2xl font-bold mt-2">{value}<span className="text-sm font-normal ml-1">{unit}</span></p></Card>}
export function Field({label,children}:{label:string;children:ReactNode}){return <label className="block"><span className="block text-sm font-medium mb-1.5">{label}</span>{children}</label>}
