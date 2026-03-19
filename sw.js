/* ═══════════════════════════════════════════════════
   Pahlawan Terakhir — Service Worker v5.0
   Cache semua fail untuk offline play
   ═══════════════════════════════════════════════════ */

const CACHE_NAME  = 'pahlawan-terakhir-v19';
const CACHE_FILES = [
  '/',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/screens.css',
  './css/hud.css',
  './css/panels.css',
  './css/premium.css',
  './css/components.css',
  './css/orientation.css',
  // ── Core JS ──────────────────────────────────────
  './js/init.js',
  './js/data/config.js',
  './js/data/characters.js',
  './js/data/world.js',
  './js/data/items.js',
  './js/data/monsters.js',
  './js/audio.js',
  './js/auth.js',
  './js/ui.js',
  './js/entities/particles.js',
  './js/entities/player.js',
  './js/entities/enemy.js',
  './js/entities/projectile.js',
  './js/entities/npc.js',
  './js/game-core.js',
  './js/farming.js',
  './js/skill-master.js',
  './js/inn-upgrade.js',
  './js/powerup-store.js',
  './js/pvp-guild-quest.js',
    // ── Engine ───────────────────────────────────────
            // ── Maps ─────────────────────────────────────────
  './js/maps/zones.js',
  './js/maps/bosses.js',
  './js/maps/gates.js',
  // ── Systems ──────────────────────────────────────
  './js/systems/equipment.js',
  './js/systems/monsters.js',
  './js/systems/autosave.js',
  './js/systems/dailyquest.js',
  './js/systems/leaderboard.js',
  './js/systems/worldboss.js',
  './js/systems/portraits.js',
  './js/systems/sprites.js',
  './images/sprites/monsters_sheet.jpg',
  './images/sprites/rpg_tileset.png',
  // Hero sprites 8-arah
  './images/hero/walk/walk_00000.png',
  './images/hero/walk/walk_10000.png',
  './images/hero/walk/walk_20000.png',
  './images/hero/walk/walk_30000.png',
  './images/hero/walk/walk_40000.png',
  './images/hero/walk/walk_50000.png',
  './images/hero/walk/walk_60000.png',
  './images/hero/walk/walk_70000.png',
  './images/tiles/grass.png',
  './images/tiles/dirt.png',
  './images/tiles/magma.png',
  './images/tiles/snow.png',
  './images/sprites/knight_warrior.png',
  './images/sprites/knight_helmet.png',
  './images/sprites/hero_rogue_f.png',
  './js/systems/items.js',
  // ── Portrait Images ──────────────────────────────
  './images/portraits/human_warrior.svg',
  './images/portraits/human_rogue.svg',
  './images/portraits/human_mage.svg',
  './images/portraits/human_priest.svg',
  './images/portraits/orc_warrior.svg',
  './images/portraits/dark_elf.svg',
  './images/portraits/elf.svg',
  // ── Monster Images ───────────────────────────────
  './images/monsters/goblin.svg',
  './images/monsters/orc.svg',
  './images/monsters/archer.svg',
  './images/monsters/dark_mage.svg',
  './images/monsters/boss.svg',
  './images/monsters/goblin_king.svg',
  './images/monsters/orc_warlord.svg',
  './images/monsters/demon_king.svg',
  // ── Icons ────────────────────────────────────────
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  // ── Fonts (cache bila first load) ────────────────
  'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Share+Tech+Mono&display=swap',
];

// ── INSTALL: Cache semua fail ───────────────────────
self.addEventListener('install', e => {
  console.log('[SW] Installing v5...');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching files...');
        // Cache satu-satu, jangan fail kalau satu error
        return Promise.allSettled(
          CACHE_FILES.map(url => cache.add(url).catch(err =>
            console.warn('[SW] Failed to cache:', url, err.message)
          ))
        );
      })
      .then(() => {
        console.log('[SW] Install complete');
        return self.skipWaiting();
      })
  );
});

// ── ACTIVATE: Buang cache lama ──────────────────────
self.addEventListener('activate', e => {
  console.log('[SW] Activating v5...');
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => {
              console.log('[SW] Removing old cache:', k);
              return caches.delete(k);
            })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Intercept requests ───────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET requests
  if (e.request.method !== 'GET') return;

  // Supabase API — jangan cache, sentiasa network
  if (url.hostname.includes('supabase.co')) {
    e.respondWith(fetch(e.request).catch(() =>
      new Response(JSON.stringify({ error: 'Offline' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    ));
    return;
  }

  // CDN (supabase-js, fonts) — network first, fallback cache
  if (url.hostname.includes('jsdelivr.net') ||
      url.hostname.includes('cdnjs') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('gstatic.com')) {
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

  // Fail game — cache first, fallback network, then cache baru
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => {
        // Offline fallback untuk HTML
        if (e.request.destination === 'document') {
          return caches.match('/') || caches.match('./index.html');
        }
      });
    })
  );
});

// ── MESSAGE: Update cache bila ada versi baru ───────
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
