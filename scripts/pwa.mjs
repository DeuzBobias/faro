import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
export function generatePwa(root, prefix) {
  function files(dir) { return readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? files(join(dir,e.name)) : [join(dir,e.name)]); }
  const paths=files(root).filter(p=>!p.endsWith('sw.js'));
  const assets=paths.map(p=>'/'+p.slice(root.length+1).replaceAll('\\','/'));
  const hash=createHash('sha256'); for(const p of paths) hash.update(p).update(readFileSync(p));
  const cache=prefix+hash.digest('hex').slice(0,12);
  writeFileSync(join(root,'sw.js'),`
const CACHE=${JSON.stringify(cache)}, ASSETS=${JSON.stringify(assets)};
// Store a fresh response so host redirects (for example /index.html to /)
// cannot make an offline navigation fail with a redirected-response error.
async function plain(response) {
 if(!response || !response.ok) throw new Error('Offline asset unavailable');
 return new Response(await response.arrayBuffer(),{status:response.status,statusText:response.statusText,headers:response.headers});
}
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ASSETS.map(async path=>{
 const response=await fetch(new Request(path,{cache:'reload',credentials:'same-origin'}));
 if(new URL(response.url).origin!==self.location.origin)throw new Error('Unexpected asset redirect');
 await c.put(path,await plain(response));
}))).then(()=>self.skipWaiting())));
self.addEventListener('message',e=>{
 if(e.data?.type==='FARO_OFFLINE_STATUS')e.waitUntil(caches.open(CACHE).then(async c=>{
 const present=await Promise.all(ASSETS.map(path=>c.match(path)));
 e.ports[0]?.postMessage({ready:present.every(Boolean)});
 }));
});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith(${JSON.stringify(prefix)})||k.startsWith('faro-offline-'))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/'))return;
 if(e.request.mode==='navigate') e.respondWith(caches.open(CACHE).then(c=>c.match('/index.html')).then(r=>r?plain(r):fetch(e.request)));
 else if(ASSETS.includes(u.pathname)) e.respondWith(caches.open(CACHE).then(c=>c.match(u.pathname)).then(r=>r||fetch(e.request)));
});`);
  console.log('Offline assets:',assets.length,cache);
}
