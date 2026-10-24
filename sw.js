/* Atomic release shell: failed precache cannot replace a working version. */
const VERSION = 'shivvedh-shell-2026-10-24-v3';
const ROOT = new URL('./', self.registration.scope);
const PATHS = [
  './',
  'index.html',
  'letters.html',
  'bakhar.html',
  'documents.html',
  'search.html',
  'evidence.html',
  'bakhar-passages.html',
  'offline.html',
  'volume-one.html',
  'manifest.webmanifest',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'app/fonts.css',
  'assets/fonts/noto-serif-devanagari-devanagari-400-normal.woff2',
  'assets/fonts/noto-serif-devanagari-devanagari-700-normal.woff2',
  'assets/fonts/noto-serif-devanagari-latin-400-normal.woff2',
  'app/reader.css',
  'app/royal.css',
  'app/reader.js',
  'app/search.js',
  'app/offline.js',
  'app/anchors.js',
  'data/evidence-policy.json',
  'data/catalog.json',
  'data/search-index.json',
  'data/documents.json',
  'data/bakhars.json',
  'data/claims.json',
  'data/bakhar-passages.json',
  'assets/shivvedh-logo.png.png',
  'assets/shivaji-maharaj.webp.webp',
];
const URLS = PATHS.map((p) => new URL(p, ROOT).href);
self.addEventListener('install', (event) =>
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      try {
        await cache.addAll(URLS);
      } catch (error) {
        await caches.delete(VERSION);
        throw error;
      }
    })(),
  ),
);
// New versions wait until all old tabs close, avoiding mixed manuscripts and indexes.
self.addEventListener('activate', (event) =>
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (
          (key.startsWith('shivvedh-shell-') ||
            key.startsWith('shivvedh-user-download-')) &&
          key !== VERSION
        )
          await caches.delete(key);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener('fetch', (event) => {
  const req = event.request,
    url = new URL(req.url);
  if (
    req.method !== 'GET' ||
    url.origin !== ROOT.origin ||
    !url.pathname.startsWith(ROOT.pathname)
  )
    return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(VERSION),
        key = new URL(url.pathname, ROOT.origin).href,
        hit = await cache.match(key);
      if (hit) return hit;
      try {
        return await fetch(req);
      } catch {
        if (req.mode === 'navigate')
          return (
            (await cache.match(new URL('offline.html', ROOT).href)) ||
            Response.error()
          );
        return Response.error();
      }
    })(),
  );
});
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'OFFLINE_STATUS' || !event.ports[0]) return;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      const hits = await Promise.all(URLS.map((url) => cache.match(url)));
      event.ports[0].postMessage({
        version: VERSION,
        complete: hits.every(Boolean),
        saved: hits.filter(Boolean).length,
        total: URLS.length,
      });
    })(),
  );
});
