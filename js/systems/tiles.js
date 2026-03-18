'use strict';
/* ══════════════════════════════════════════════════════════════
   Pahlawan Terakhir — tile-system.js
   Memuatkan tile texture sebenar (Grass/Dirt/Magma/Snow)
   dan patch drawWorld untuk guna tile sebagai ground pattern.

   Zone → Tile mapping:
     Grass  → moradon, elmorad, ronark (padang hijau)
     Dirt   → ardream, dungeon_goblin, dungeon_orc (tanah biasa)
     Magma  → karus, cz, luferson, forgotten_temple (zona api)
     Snow   → eslant, bifrost (kawasan bersalji)
   ══════════════════════════════════════════════════════════════ */

const TileSystem = (() => {

  // ── Zone → tile type mapping ──────────────────────
  const ZONE_TILE = {
    moradon:          'grass',
    elmorad:          'grass',
    ronark:           'grass',
    ardream:          'dirt',
    dungeon_goblin:   'dirt',
    dungeon_orc:      'dirt',
    dungeon_dark:     'magma',
    karus:            'magma',
    cz:               'magma',
    luferson:         'magma',
    forgotten_temple: 'magma',
    bifrost:          'snow',
    eslant:           'snow',
  };

  // ── Tile tint per zone (overlay colour) ──────────
  // Keeps visual identity of zone while using real texture
  const ZONE_TINT = {
    moradon:          null,                      // pure grass
    elmorad:          'rgba(200,220,100,.06)',    // warm green
    ronark:           'rgba(180,60,20,.12)',      // blood-stained
    ardream:          'rgba(80,40,180,.1)',       // purple dusk
    dungeon_goblin:   'rgba(40,180,40,.08)',      // green mould
    dungeon_orc:      'rgba(180,140,40,.08)',     // sandy
    dungeon_dark:     'rgba(80,0,120,.15)',       // dark purple
    karus:            'rgba(255,30,0,.12)',       // red glow
    cz:               'rgba(255,80,0,.1)',        // fire orange
    luferson:         'rgba(200,40,40,.14)',      // deep red
    forgotten_temple: 'rgba(140,0,200,.12)',      // arcane purple
    bifrost:          'rgba(80,150,255,.08)',     // icy blue
    eslant:           'rgba(150,220,255,.06)',    // pale ice
  };

  // ── Tile scale (how many pixels = 1 tile repeat) ─
  // Larger = tile image is bigger, shows more detail
  const TILE_SCALE = {
    grass: 256,
    dirt:  256,
    magma: 256,
    snow:  256,
  };

  // ── State ─────────────────────────────────────────
  const images   = {};   // { grass: Image, dirt: Image, ... }
  const patterns = {};   // { grass: CanvasPattern, ... } keyed by tileType
  let   loaded   = 0;
  let   total    = 4;
  let   ready    = false;

  // ── Image paths (relative to index.html) ──────────
  const PATHS = {
    grass: 'images/tiles/grass.png',
    dirt:  'images/tiles/dirt.png',
    magma: 'images/tiles/magma.png',
    snow:  'images/tiles/snow.png',
  };

  // ── Load all tiles ────────────────────────────────
  function load() {
    Object.entries(PATHS).forEach(([name, src]) => {
      const img = new Image();
      img.onload  = () => { images[name] = img; loaded++; if (loaded >= total) _onAllLoaded(); };
      img.onerror = () => { console.warn(`[TileSystem] Gagal muat ${src} — fallback warna`); loaded++; if (loaded >= total) _onAllLoaded(); };
      img.src = src;
    });
    console.log('[TileSystem] ⏳ Memuatkan 4 tile textures...');
  }

  // ── Build canvas patterns from loaded images ──────
  function _onAllLoaded() {
    // Patterns are built lazily when cx is available
    ready = true;
    console.log('[TileSystem] ✅ Semua tile texture siap!');
    _patchDrawWorld();
  }

  // ── Get (or build) pattern for a tile type ────────
  function _getPattern(tileType) {
    if (patterns[tileType]) return patterns[tileType];
    const cx = window.cx;
    const img = images[tileType];
    if (!cx || !img) return null;

    try {
      // Scale image into an offscreen canvas first so pattern tiles correctly
      const scale = TILE_SCALE[tileType] || 256;
      const off = document.createElement('canvas');
      off.width  = scale;
      off.height = scale;
      const oc  = off.getContext('2d');
      oc.drawImage(img, 0, 0, scale, scale);
      const pat = cx.createPattern(off, 'repeat');
      patterns[tileType] = pat;
      return pat;
    } catch(e) {
      console.warn('[TileSystem] Pattern error:', e);
      return null;
    }
  }

  // ── Get tile for current zone ─────────────────────
  function getTileForZone(zoneId) {
    return ZONE_TILE[zoneId] || 'grass';
  }

  function getTintForZone(zoneId) {
    return ZONE_TINT[zoneId] || null;
  }

  // ── Patch G.drawWorld ────────────────────────────
  function _patchDrawWorld() {
    const _waitG = setInterval(() => {
      if (!window.G || typeof window.G.drawWorld !== 'function') return;
      clearInterval(_waitG);

      window.G.drawWorld = function() {
        const cx   = window.cx;
        const cam  = window.cam;
        const WW   = window.WW || 3000;
        const WH   = window.WH || 3000;
        const cv   = document.getElementById('gc');
        if (!cx || !cam || !cv) return;

        const zoneId   = this.currentZone || 'moradon';
        const zone     = window.ZONES?.[zoneId] || {};
        const tileType = getTileForZone(zoneId);
        const tint     = getTintForZone(zoneId);
        const tc       = zone.torchColor || 'rgba(255,160,40,.12)';
        const ts       = 64;
        const pat      = _getPattern(tileType);
        const fallback = zone.bgColor || ['#0a0e1a','#080c14'];

        // ── Calculate visible range ──────────────────
        const startC = Math.max(0, Math.floor(cam.x / ts));
        const endC   = Math.min(
          (this.tiles?.[0]?.length || Math.ceil(WW / ts)),
          Math.ceil((cam.x + cv.width) / ts) + 1
        );
        const startR = Math.max(0, Math.floor(cam.y / ts));
        const endR   = Math.min(
          this.tiles?.length || Math.ceil(WH / ts),
          Math.ceil((cam.y + cv.height) / ts) + 1
        );

        // ── Draw tiles ───────────────────────────────
        if (pat) {
          // ① Fill entire visible area with pattern first (single fillRect — fast)
          cx.save();
          cx.translate(-cam.x % (TILE_SCALE[tileType] || 256), -cam.y % (TILE_SCALE[tileType] || 256));
          cx.fillStyle = pat;
          cx.fillRect(
            cam.x - (cam.x % (TILE_SCALE[tileType]||256)),
            cam.y - (cam.y % (TILE_SCALE[tileType]||256)),
            cv.width  + (TILE_SCALE[tileType]||256) * 2,
            cv.height + (TILE_SCALE[tileType]||256) * 2
          );
          cx.restore();

          // ② Zone-wide tint overlay
          if (tint) {
            cx.fillStyle = tint;
            cx.fillRect(cam.x, cam.y, cv.width, cv.height);
          }

          // ③ Per-tile variation darkening for tile type 1 & 2
          if (this.tiles) {
            cx.globalAlpha = 0.28;
            for (let r = startR; r < endR; r++) {
              for (let c = startC; c < endC; c++) {
                const t = this.tiles[r]?.[c] || 0;
                if (t === 0) continue;
                const tx = c * ts, ty = r * ts;
                cx.fillStyle = t === 2 ? 'rgba(0,0,0,.45)' : 'rgba(0,0,0,.25)';
                cx.fillRect(tx, ty, ts, ts);
              }
            }
            cx.globalAlpha = 1;
          }

          // ④ Subtle tile grid (very faint)
          cx.strokeStyle = 'rgba(0,0,0,.07)';
          cx.lineWidth = .5;
          for (let r = startR; r < endR; r++) {
            for (let c = startC; c < endC; c++) {
              cx.strokeRect(c * ts, r * ts, ts, ts);
            }
          }

        } else {
          // ── Fallback: solid colour (no texture loaded) ──
          for (let r = startR; r < endR; r++) {
            for (let c = startC; c < endC; c++) {
              const tx = c * ts, ty = r * ts, t = this.tiles?.[r]?.[c] || 0;
              cx.fillStyle = t === 2 ? fallback[1] : t === 1 ? fallback[0] : (r + c) % 2 === 0 ? fallback[0] : fallback[1];
              cx.fillRect(tx, ty, ts, ts);
              cx.strokeStyle = 'rgba(255,255,255,.015)'; cx.lineWidth = .5; cx.strokeRect(tx, ty, ts, ts);
            }
          }
        }

        // ── Torch lights ─────────────────────────────
        const time = Date.now() / 1000;
        for (let ry = 0; ry < WH; ry += 400) {
          for (let rc = 0; rc < WW; rc += 400) {
            const tx = rc + 200, ty = ry + 200;
            if (tx < cam.x - 220 || tx > cam.x + cv.width + 220 || ty < cam.y - 220 || ty > cam.y + cv.height + 220) continue;
            const fl = 1 + Math.sin(time * 4.2 + tx * .01) * .07;
            try {
              const grd = cx.createRadialGradient(tx, ty, 0, tx, ty, 90 * fl);
              grd.addColorStop(0, tc);
              grd.addColorStop(1, 'rgba(0,0,0,0)');
              cx.fillStyle = grd;
              cx.beginPath(); cx.arc(tx, ty, 90 * fl, 0, Math.PI * 2); cx.fill();
            } catch(e) {}
            // Torch post
            cx.fillStyle = '#6a4a18';
            cx.fillRect(tx - 2, ty - 15, 4, 17);
            // Torch head
            cx.fillStyle = '#4a2e0a';
            cx.fillRect(tx - 3, ty - 19, 6, 5);
            // Flame
            const flameCol = tileType === 'magma' ? `rgba(255,${60+Math.sin(time*7+tx)*.01|0},0,.95)` :
                             tileType === 'snow'   ? `rgba(80,180,255,.85)` :
                                                     `rgba(255,${130+Math.sin(time*8+tx)*.01|0},20,.9)`;
            cx.fillStyle = flameCol;
            cx.shadowColor = flameCol;
            cx.shadowBlur  = 12;
            cx.beginPath();
            cx.arc(tx, ty - 21, 5 * fl, 0, Math.PI * 2);
            cx.fill();
            cx.shadowBlur = 0;
          }
        }

        // ── World border ─────────────────────────────
        const faction = window.selChar?.faction;
        const isCahaya = faction === 'elmorad' || faction === 'cahaya';
        cx.strokeStyle = tileType === 'magma' ? 'rgba(200,50,50,.45)' :
                         tileType === 'snow'  ? 'rgba(80,180,255,.35)' :
                         isCahaya             ? 'rgba(201,168,76,.35)' :
                                                'rgba(200,50,50,.3)';
        cx.lineWidth = 5;
        cx.strokeRect(2, 2, WW - 4, WH - 4);

        // ── Zone name watermark ───────────────────────
        const zoneName = zone.name || zoneId;
        cx.save();
        cx.globalAlpha = 0.025;
        cx.fillStyle = '#ffffff';
        cx.font = `bold ${Math.min(cv.width, cv.height) * .1}px 'Cinzel Decorative',serif`;
        cx.textAlign = 'center';
        cx.fillText(zoneName.toUpperCase(), WW / 2, WH / 2 + 40);
        cx.restore();
      };

      console.log('[TileSystem] ✅ drawWorld patched dengan tile textures');
    }, 200);
  }

  // ── Preload on DOMContentLoaded ──────────────────
  document.addEventListener('DOMContentLoaded', load);

  // ── Public API ───────────────────────────────────
  return {
    load,
    getTileForZone,
    getTintForZone,
    isReady() { return ready; },
    getLoadedCount() { return loaded; },
  };

})();

window.TileSystem = TileSystem;
