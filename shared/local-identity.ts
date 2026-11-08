// Local preview identities only. Production uses verified Netlify Identity users.
export function localPreviewIdentity(value:unknown) {
  if(typeof value!=='string')return null
  const email=value.trim().toLowerCase()
  if(email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return null
  return {id:'local-email:'+email,email}
}
