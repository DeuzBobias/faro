// Local demonstration worker: no account data or page responses are cached.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('push', event => {
 event.waitUntil(self.registration.showNotification('FARO', {
  body:'You have new guidance. Open FARO to read it.',
  icon:'/branding/icon-192.png', badge:'/branding/icon-192.png',
  tag:'faro-guidance', data:{url:'/app/care'},
 }));
});
self.addEventListener('notificationclick', event => {
 event.notification.close();
 event.waitUntil((async()=>{
  const url=new URL('/app/care',self.location.origin).href;
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows){if(new URL(client.url).origin===self.location.origin){await client.navigate(url);return client.focus();}}
  return self.clients.openWindow(url);
 })());
});
