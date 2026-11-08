import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const root=process.argv[2];
const listeners={}, saved=new Map(), stores=new Map();
const caches={open:async key=>{if(!stores.has(key))stores.set(key,{addAll:async paths=>{for(const p of paths){assert.ok(existsSync(root+p),p);saved.set(p,new Response(readFileSync(root+p))) }},match:async p=>saved.get(p)?.clone()});return stores.get(key)},keys:async()=>[...stores.keys()],delete:async k=>stores.delete(k)};
runInNewContext(readFileSync(root+'/sw.js','utf8'),{URL,Promise,caches,fetch:async()=>{throw new Error('network disabled')},self:{location:{origin:'https://faro.test'},addEventListener:(type,fn)=>listeners[type]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}}});
let waiting;listeners.install({waitUntil:p=>waiting=p});await waiting;
listeners.activate({waitUntil:p=>waiting=p});await waiting;
for(const path of ['/','/app','/app/calendar','/admin/dashboard']){let response;listeners.fetch({request:{method:'GET',url:'https://faro.test'+path,mode:'navigate'},respondWith:p=>response=p});assert.ok((await (await response).text()).includes('<html'));}
for(const path of saved.keys()){let response;listeners.fetch({request:{method:'GET',url:'https://faro.test'+path,mode:'cors'},respondWith:p=>response=p});assert.ok(await response,path);}
for(const path of ['/api/state','/.netlify/identity','/.netlify/functions/api/state'])listeners.fetch({request:{method:'GET',url:'https://faro.test'+path,mode:'navigate'},respondWith:()=>assert.fail('must not cache '+path)});
console.log('PASS: offline deep links, all '+saved.size+' assets, API and auth exclusions');
