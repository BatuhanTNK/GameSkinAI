/**
 * GameSkinAI Service Worker (ozellik_onerileri.md #15).
 * Strateji:
 *  - HTML/navigasyon: network-first (güncellemeler anında ulaşır, offline'da cache).
 *  - Statik varlıklar (js/css/img/font): stale-while-revalidate.
 *  - API istekleri (Supabase, Gemini vb.) asla cache'lenmez.
 */

const CACHE_VERSION = 'gameskinai-v1';
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const SHELL_CACHE = `${CACHE_VERSION}-shell`;

// Uygulama kabuğu: offline açılış için ön-cache
const getShellUrls = () => {
  const scope = self.registration ? self.registration.scope : '/';
  const cleanScope = scope.endsWith('/') ? scope : scope + '/';
  return [cleanScope, `${cleanScope}index.html`, `${cleanScope}manifest.json`, `${cleanScope}favicon.png`];
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(getShellUrls()))
      .catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Yeni sürüm beklemeden devralsın (index.js'ten SKIP_WAITING mesajı gelir)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/** Cache'lenmemesi gereken istekler (API, edge function, harici servisler). */
function isApiRequest(url) {
  return (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('supabase.in') ||
    url.hostname.includes('pollinations.ai') ||
    url.hostname.includes('googleapis.com') ||
    url.pathname.startsWith('/rest/') ||
    url.pathname.startsWith('/functions/')
  );
}

/** Statik varlık mı? (hash'li Vite çıktıları dahil) */
function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf)$/.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (isApiRequest(url)) return; // API'ler her zaman ağa gider

  // Navigasyon istekleri: network-first, offline'da shell'e düş
  if (request.mode === 'navigate') {
    const scope = self.registration ? self.registration.scope : '/';
    const indexUrl = (scope.endsWith('/') ? scope : scope + '/') + 'index.html';
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(indexUrl, copy));
          return response;
        })
        .catch(() =>
          caches.match(indexUrl).then((cached) => cached || Response.error())
        )
    );
    return;
  }

  // Statik varlıklar: stale-while-revalidate
  if (isStaticAsset(url) && url.origin === self.location.origin) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});

// Bildirime tıklanınca uygulamayı odakla / aç
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
