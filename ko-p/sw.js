/* ═══════════════════════════════════════════════════
   Pahlawan Terakhir — Service Worker
   Cache semua fail untuk offline play
   ═══════════════════════════════════════════════════ */

const CACHE_NAME  = 'pahlawan-terakhir-v1';
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/data.js',
  './js/audio.js',
  './js/auth.js',
  './js/ui.js',
  './js/farming.js',
  './js/game.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // Google Fonts (cache bila first load)
  'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Share+Tech+Mono&display=swap',
];

// ── INSTALL: Cache semua fail ───────────────────────
self.addEventListener('install', e => {
  console.log('[SW] Installing...');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching files...');
        // Cache satu-satu supaya error satu fail tidak gagalkan semua
        return Promise.allSettled(
          CACHE_FILES.map(url =>
            cache.add(url).catch(err => console.warn('[SW] Failed to cache:', url, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: Buang cache lama ──────────────────────
self.addEventListener('activate', e => {
  console.log('[SW] Activating...');
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Serve dari cache, fallback ke network ────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase API — sentiasa dari network (jangan cache)
  if (url.hostname.includes('supabase.co')) {
    e.respondWith(fetch(e.request).catch(() =>
      new Response(JSON.stringify({ error: 'Offline' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    ));
    return;
  }

  // CDN (supabase-js) — network first, fallback cache
  if (url.hostname.includes('jsdelivr.net') || url.hostname.includes('cdnjs')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Fail game — cache first, fallback network
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});

// ── MESSAGE: Update cache bila ada versi baru ───────
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
