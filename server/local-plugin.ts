import { mkdirSync } from 'node:fs'
import type { Plugin } from 'vite'
import { sqliteDatabase } from './local-db'
import worker from './worker'
import { localAuth, sessionAccount } from './local-auth'
import { localPush } from './local-push'
export function localApi():Plugin {
  return {name:'faro-local-api',configureServer(server){
    mkdirSync('.local',{recursive:true});const DB=sqliteDatabase('.local/faro.sqlite')
    const push=localPush(DB)
    server.httpServer?.once('close',()=>DB.close())
    server.middlewares.use(async(req,res,next)=>{
      if(!req.url?.startsWith('/api/'))return next()
      try {
        const chunks:Buffer[]=[];let size=0
        for await(const chunk of req){size+=chunk.length;if(size>16384){res.statusCode=413;res.end('Request too large');return}chunks.push(chunk)}
        const headers=new Headers();for(const [key,value]of Object.entries(req.headers)){if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(','):value)}
        const request=new Request(`${server.config.server.https?'https':'http'}://${req.headers.host}${req.url}`,{method:req.method,headers,body:['GET','HEAD'].includes(req.method||'GET')?undefined:Buffer.concat(chunks)})
        let response:Response
        if(new URL(request.url).pathname.startsWith('/api/local-auth/'))response=await localAuth(request,DB)
        else {
          const account=await sessionAccount(request,DB)
          for(const key of ['x-faro-user-id','x-faro-user-email','x-faro-user-name'])headers.delete(key)
          if(account){headers.set('x-faro-user-id',account.user_id);headers.set('x-faro-user-email',account.email)}
          response=req.url.startsWith('/api/push/subscription')?(account?await push.api(request,account.user_id):Response.json({error:'Sign in first.'},{status:401})):await worker.fetch(new Request(request,{headers}),{DB,ASSETS:{fetch:async()=>new Response('Not found',{status:404})},notifyGuidance:push.send})
        }
        res.statusCode=response.status;response.headers.forEach((value,key)=>res.setHeader(key,value));res.end(Buffer.from(await response.arrayBuffer()))
      }catch{res.statusCode=500;res.end(JSON.stringify({error:'Local FARO API failed.'}))}
    })
  }}
}
