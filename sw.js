/**
 * IBMP CFTV Control — Service Worker
 * Versão: 6.0-pwa
 * Estratégia: Cache-First para assets locais, Network-First para CDNs
 *
 * Como funciona:
 *  - No install: armazena o HTML principal e assets no cache
 *  - No fetch: serve do cache se disponível (funciona offline)
 *  - Atualização: novo SW espera até que todas as abas fechem
 */

const CACHE_NAME = 'ibmp-cftv-v6';
const CACHE_CDN  = 'ibmp-cftv-cdn-v6';

// Assets locais — sempre cacheados no install
const LOCAL_ASSETS = [
  './IBMP_CFTV_Control_v6_PWA.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Domínios externos (CDN) — cacheados após primeiro uso
const CDN_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.sheetjs.com',
  'cdnjs.cloudflare.com'
];

// ─── INSTALL ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando IBMP CFTV Control PWA…');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Tenta cachear um a um para não falhar tudo se um asset faltar
        return Promise.allSettled(
          LOCAL_ASSETS.map(url =>
            cache.add(url).catch(err =>
              console.warn(`[SW] Não foi possível cachear ${url}:`, err)
            )
          )
        );
      })
      .then(() => {
        console.log('[SW] Assets locais cacheados');
        // Ativa imediatamente sem esperar fechar abas
        return self.skipWaiting();
      })
  );
});

// ─── ACTIVATE ─────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando nova versão…');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== CACHE_CDN)
          .map(k => {
            console.log('[SW] Removendo cache antigo:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH ────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignora requisições não-GET (POST, PUT etc.)
  if (event.request.method !== 'GET') return;

  // Ignora chrome-extension e outros protocolos não-http
  if (!event.request.url.startsWith('http')) return;

  const isCDN = CDN_HOSTS.some(host => url.hostname.includes(host));

  if (isCDN) {
    // CDN: Network-First com fallback para cache
    event.respondWith(networkFirstCDN(event.request));
  } else {
    // Local: Cache-First com fallback para rede
    event.respondWith(cacheFirstLocal(event.request));
  }
});

// Cache-First: serve do cache; se não tiver, busca na rede e armazena
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
    // Offline e não tem cache: retorna página de fallback
    return caches.match('./IBMP_CFTV_Control_v6_PWA.html');
  }
}

// Network-First para CDN: tenta rede; se falhar, usa cache
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

// ─── MENSAGENS DO CLIENTE ─────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CACHE_VERSION') {
    event.source.postMessage({ version: CACHE_NAME });
  }
});
