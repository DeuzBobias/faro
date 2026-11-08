import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, Field, Message, Page } from '../components/LiveUI'
import ResponsiveFrame from '../components/ResponsiveFrame'

type Account = { id: string; email: string; createdAt?: string; confirmedAt?: string; roles: string[] }

async function api<T>(path: string, init?: RequestInit): Promise<T> {
 const response = await fetch(path, { ...init, credentials: 'same-origin', cache: 'no-store', headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers } })
 const body = await response.json().catch(() => ({}))
 if (!response.ok) throw new Error(body.error || 'Could not complete this request.')
 return body as T
}

function AdminUsersPage() {
 const [accounts, setAccounts] = useState<Account[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [filter, setFilter] = useState('')
 const [confirming, setConfirming] = useState<Account | null>(null)
 const [confirmEmail, setConfirmEmail] = useState('')
 const [busy, setBusy] = useState(false)
 const [notice, setNotice] = useState('')

 const loadAccounts = useCallback(async () => {
  setLoading(true); setError('')
  try { const result = await api<{ users: Account[] }>('/api/admin/users'); setAccounts(result.users) }
  catch (e) { setError(e instanceof Error ? e.message : 'Could not load accounts.') }
  finally { setLoading(false) }
 }, [])
 useEffect(() => { void loadAccounts() }, [loadAccounts])

 const filtered = useMemo(() => accounts.filter(account => account.email.toLowerCase().includes(filter.trim().toLowerCase())), [accounts, filter])
 const remove = async () => {
  if (!confirming || confirmEmail.trim().toLowerCase() !== confirming.email.toLowerCase()) return
  setBusy(true); setError(''); setNotice('')
  try {
   await api(`/api/admin/users/${encodeURIComponent(confirming.id)}`, { method: 'DELETE', body: JSON.stringify({ confirmEmail }) })
   setAccounts(current => current.filter(account => account.id !== confirming.id))
   setNotice(`Account ${confirming.email} was deleted.`); setConfirming(null); setConfirmEmail('')
  } catch (e) { setError(e instanceof Error ? e.message : 'Could not delete this account.') }
  finally { setBusy(false) }
 }

 return <Page title="Account administration" description="Review FARO accounts and permanently delete an account when needed.">
  <Message text={notice} success />
  {error && <Card><Message text={error} />{error.includes('Admin access') && <p className="text-sm text-muted mt-3">Ask the Netlify site owner to assign your account the admin role in Netlify Identity.</p>}<button className="faro-secondary mt-3" onClick={()=>void loadAccounts()}>Try again</button></Card>}
  <Card>
   <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-semibold">FARO accounts</h2><p className="text-sm text-muted mt-1">{loading ? 'Loading accounts…' : `${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'}`}</p></div><button className="faro-secondary" onClick={()=>void loadAccounts()} disabled={loading}>Refresh list</button></div>
   <div className="mt-4"><Field label="Find by email"><input className="faro-input w-full" type="search" value={filter} onChange={event=>setFilter(event.target.value)} placeholder="Search accounts" /></Field></div>
   {loading ? <p className="text-sm text-muted mt-4">Loading accounts…</p> : filtered.length ? <ul className="mt-3 divide-y divide-border">{filtered.map(account=><li key={account.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="font-medium break-all">{account.email}</p><p className="text-xs text-muted mt-1">{account.roles.includes('admin') ? 'Administrator' : 'FARO account'} · {account.confirmedAt ? 'Verified' : 'Unverified'}</p></div><button className="faro-secondary" onClick={()=>{setConfirming(account);setConfirmEmail('');setError('')}} disabled={account.roles.includes('admin') && accounts.filter(a=>a.roles.includes('admin')).length<=1}>Delete account</button></li>)}</ul> : <p className="text-sm text-muted mt-4">{accounts.length ? 'No accounts match that search.' : 'No accounts found.'}</p>}
  </Card>
  {confirming && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"><h2 id="delete-title" className="text-lg font-bold">Delete this account?</h2><p className="text-sm text-muted mt-2">This permanently removes the Netlify login and associated FARO profile and daily logs for <strong className="break-all">{confirming.email}</strong>.</p><div className="mt-4"><Field label="Type the account email to confirm"><input autoFocus className="faro-input w-full" type="email" autoComplete="off" value={confirmEmail} onChange={event=>setConfirmEmail(event.target.value)} /></Field></div><div className="mt-5 flex justify-end gap-2"><button className="faro-secondary" onClick={()=>{setConfirming(null);setConfirmEmail('')}} disabled={busy}>Cancel</button><button className="faro-button" onClick={()=>void remove()} disabled={busy||confirmEmail.trim().toLowerCase()!==confirming.email.toLowerCase()}>{busy?'Deleting…':'Permanently delete'}</button></div></section></div>}
 </Page>
}

export default AdminUsersPage
