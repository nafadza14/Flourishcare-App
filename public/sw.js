/* FlourishCare service worker
 * - Navigations: network first, fall back to the cached app shell when offline
 * - Hashed build assets (/assets/*) and fonts: cache first (their names change on every build)
 * - Logo, icons and manifest: network first, cache only as offline fallback,
 *   so a new logo shows up right away instead of staying stuck in the cache
 * - API requests: always network (never cached), so data stays fresh
 */
const VERSION = 'flourishcare-v4';
const ICON_V = '2';
const SHELL = [
  '/',
  '/manifest.json',
  '/brand/logo-mark.png',
  '/brand/logo.png',
  '/brand/logo-wordmark.png',
  `/icons/icon-192.png?v=${ICON_V}`,
  `/icons/icon-512.png?v=${ICON_V}`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      // cache: 'reload' skips the browser's HTTP cache, so an old logo can never be copied in
      .then((cache) => cache.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' }))).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function networkFirst(request, cacheKey) {
  // Navigations keep their own request; other files revalidate with the server every time
  const live = request.mode === 'navigate' ? fetch(request) : fetch(request, { cache: 'no-cache' });
  return live
    .then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(VERSION).then((cache) => cache.put(cacheKey || request, copy)).catch(() => undefined);
      }
      return res;
    })
    .catch(() => caches.match(cacheKey || request).then((cached) => cached || Response.error()));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, '/'));
    return;
  }

  if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/brand/') || url.pathname === '/manifest.json' || url.pathname === '/logo.svg') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.woff2')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => undefined);
            }
            return res;
          }),
      ),
    );
  }
});
