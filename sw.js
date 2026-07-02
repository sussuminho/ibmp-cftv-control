/**
 * IBMP CFTV Control — Service Worker v8
 * Cache atualizado — força limpeza do cache anterior
 */
const CACHE_NAME = 'ibmp-cftv-v9';
const CACHE_CDN  = 'ibmp-cftv-cdn-v9';
const LOCAL_ASSETS = [
  './IBMP_CFTV_Control_v6_5.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];
const CDN_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.sheetjs.com',
  'cdnjs.cloudflare.com'
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(LOCAL_ASSETS.map(url => cache.add(url).catch(()=>{}))))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== CACHE_CDN).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  const url = new URL(event.request.url);
  // Nunca cachear projeto.json — sempre busca o mais recente
  if (url.pathname.endsWith('projeto.json')) {
    event.respondWith(fetch(event.request).catch(() => new Response('{}', {status: 200})));
    return;
  }
  const isCDN = CDN_HOSTS.some(host => url.hostname.includes(host));
  if (isCDN) {
    event.respondWith(networkFirstCDN(event.request));
  } else {
    event.respondWith(cacheFirstLocal(event.request));
  }
});
async function cacheFirstLocal(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match('./IBMP_CFTV_Control_v6_5.html');
  }
}
async function networkFirstCDN(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_CDN);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('', { status: 503 });
  }
}
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
