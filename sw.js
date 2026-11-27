// Service worker: offline support for English Quest.
// Bump VERSION whenever app files change so users get the update.
const VERSION = 'v13';
const CACHE = 'eq-' + VERSION;
const FONT_CACHE = 'eq-fonts';
const APP_SHELL = [
  './',
  './index.html',
  './config.js',
  './vendor/supabase/supabase.js',
  './styles.css',
  './app.js',
  './questions.js',
  './notes.js',
  './bank/A1.js',
  './bank/A2.js',
  './bank/B1.js',
  './bank/B2.js',
  './bank/C1.js',
  './bank/C2.js',
  './bank/merge.js',
  './words/A1.js',
  './words/A2.js',
  './words/B1.js',
  './words/B2.js',
  './words/C1.js',
  './words/C2.js',
  './pwa.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_SHELL)));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE && k !== FONT_CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: cache-first (fonts never change), works offline after first visit.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONT_CACHE).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      try { const res = await fetch(req); c.put(req, res.clone()); return res; }
      catch { return new Response('', { status: 504 }); }
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Page navigations: network first so updates arrive, cached shell when offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  // App files: cache first, fall back to network (and cache it).
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
