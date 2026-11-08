import { localPreviewIdentity } from '../shared/local-identity'

export function localPreviewRequest(request:Request) {
  const identity=localPreviewIdentity(request.headers.get('x-faro-preview-email'))
  const headers=new Headers(request.headers)
  // Never retain a caller-supplied internal identity or fall back to a shared user.
  for(const key of ['x-faro-user-id','x-faro-user-email','x-faro-user-name'])headers.delete(key)
  if(identity){headers.set('x-faro-user-id',identity.id);headers.set('x-faro-user-email',identity.email)}
  return new Request(request,{headers})
}
