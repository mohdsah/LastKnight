'use strict';
/* ══════════════════════════════════════════════════════════════════
   Pahlawan Terakhir — hero-sprite.js  v1.0
   Sistem sprite hero 3D isometric 8 arah penuh

   ANIMASI & FAIL:
     walk    → images/hero/walk/walk_{D}{FFFF}.png       (8dir × 10fr)
     attack1 → images/hero/attack1/attack_{D}{FFFF}.png  (8dir × 10fr)
     attack2 → images/hero/attack2/Attack_{D}{FFFF}.png  (8dir × 18fr) ← huruf besar A
     block   → images/hero/block/block_{D}{FFFF}.png     (8dir ×  5fr)
     death   → images/hero/death/death_{D}{FFFF}.png     (8dir ×  8fr)
     gothit  → images/hero/gothit/gothit_{D}{FFFF}.png   (8dir ×  6fr)

   ARAH ISOMETRIC (D = 0-7):
     Sprite D0=N  D1=NE  D2=E  D3=SE  D4=S  D5=SW  D6=W  D7=NW
     (berdasarkan visual sprite yang ditest)

   SAIZ FRAME (unscaled):
     Walk    : 148 × 144 px
     Attack1 : 356 × 232 px
     Attack2 : 226 × 204 px
     Block   : 212 × 169 px
     Death   : 242 × 199 px
     GotHit  : 302 × 196 px
   ══════════════════════════════════════════════════════════════════ */

const HeroSprite = (() => {

  const BASE = 'images/hero/';

  // ── Konfigurasi setiap animasi ─────────────────────────────
  const CFG = {
    //        folder      prefix     dirs  frames  fps   loop   scale   anchorY
    walk:    ['walk/',    'walk_',    8,    10,    12,   true,  1.15,   0.80],
    attack1: ['attack1/', 'attack_',  8,    10,    16,   false, 0.85,   0.75],
    attack2: ['attack2/', 'Attack_',  8,    18,    18,   false, 1.00,   0.80],
    block:   ['block/',   'block_',   8,     5,    10,   true,  1.10,   0.78],
    death:   ['death/',   'death_',   8,     8,    10,   false, 1.05,   0.80],
    gothit:  ['gothit/',  'gothit_',  8,     6,    14,   false, 1.00,   0.80],
  };
  // CFG index shortcuts
  const [F_FOLDER,F_PREFIX,F_DIRS,F_FRAMES,F_FPS,F_LOOP,F_SCALE,F_ANCH] =
        [0,1,2,3,4,5,6,7];

  // ── Petaan arah isometrik ───────────────────────────────────
  // Math.atan2: 0=Timur, π/2=Selatan, ±π=Barat, -π/2=Utara
  // Sprite: D0=N, D1=NE, D2=E, D3=SE, D4=S, D5=SW, D6=W, D7=NW
  //
  // Sektor sudut (CCW dari Timur) → Sprite dir:
  //   E=0rad    → D2    NE=π/4   → D1    N=-π/2   → D0    NW=-3π/4 → D7
  //   SE=π/2(-)→ D3    S=π/2    → D4    SW=3π/4  → D5    W=π      → D6
  function angleToSpriteDir(rad) {
    // Normalise -π..π → 0..2π
    let a = ((rad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    // Map 0..2π into 8 equal sectors (each 45°), starting from North (-π/2 = 3π/2)
    // Shift so North=sector0: add π/2 + π/8 (half sector) for centring
    const shifted = (a + Math.PI * 0.5 + Math.PI * 0.125) % (Math.PI * 2);
    const sector  = Math.floor(shifted / (Math.PI / 4)) % 8;
    // sector 0=N,1=NE,2=E,3=SE,4=S,5=SW,6=W,7=NW → sprite dir same
    return sector;
  }

  // ── Cache: frames[animName][dir][frameIdx] = HTMLImageElement ─
  const frames  = {};
  const loading = {}; // 'animName_dir' → true

  let totalLoaded  = 0;
  let walkDirsReady = 0; // berapa dir walk sudah siap

  // ── Muat satu set animasi+arah ─────────────────────────────
  function _loadSet(animName, dir) {
    const key = `${animName}_${dir}`;
    if (loading[key]) return;
    loading[key] = true;

    const cfg = CFG[animName]; if (!cfg) return;
    if (!frames[animName])      frames[animName] = {};
    if (!frames[animName][dir]) frames[animName][dir] = [];

    let done = 0;
    const total = cfg[F_FRAMES];
    for (let f = 0; f < total; f++) {
      const fstr = String(f).padStart(4, '0');
      const src  = `${BASE}${cfg[F_FOLDER]}${cfg[F_PREFIX]}${dir}${fstr}.png`;
      const img  = new Image();
      img.onload = () => {
        frames[animName][dir][f] = img;
        totalLoaded++;
        if (++done >= total && animName === 'walk') walkDirsReady++;
      };
      img.onerror = () => { ++done; }; // skip missing
      img.src = src;
    }
  }

  // ── Preload bertahap: walk dulu, kemudian yang lain ─────────
  let _started = false;
  function preloadAll() {
    if (_started) return;
    _started = true;

    // Fasa 1 – walk (semua 8 arah, kritikal)
    for (let d = 0; d < 8; d++) _loadSet('walk', d);

    // Fasa 2 – attack1 (paling kerap digunakan)
    setTimeout(() => { for (let d = 0; d < 8; d++) _loadSet('attack1', d); }, 600);

    // Fasa 3 – gothit & death (pendek, penting)
    setTimeout(() => {
      for (let d = 0; d < 8; d++) { _loadSet('gothit', d); _loadSet('death', d); }
    }, 1400);

    // Fasa 4 – attack2 & block (besar, boleh tunggu)
    setTimeout(() => {
      for (let d = 0; d < 8; d++) { _loadSet('attack2', d); _loadSet('block', d); }
    }, 2600);

    console.log('[HeroSprite] ⏳ Memuatkan sprite hero 8-arah...');
  }

  // ── State mesin animasi (satu per Player) ──────────────────
  function createState() {
    return {
      anim    : 'walk',
      dir     : 4,        // default S (menghadap kamera)
      frame   : 0,
      timer   : 0,
      locked  : false,    // true = tunggu animasi habis sebelum tukar
      done    : false,    // animasi tidak-gelung sudah selesai
      prevHurt: 0,
    };
  }

  // state singleton untuk player utama
  const _state = createState();

  // ── Kemas kini state animasi dari player ───────────────────
  function update(dt, player) {
    if (!player) return;
    const st = _state;

    // 1. Resolve arah dari player.dir (radian)
    const newDir = angleToSpriteDir(player.dir ?? 0);

    // 2. Kenal pasti animasi yang sepatutnya
    const hp      = player.hp;
    const dead    = hp <= 0;
    const hurt    = player.hurt > 0 && player.hurt !== st.prevHurt;
    const atk2    = (player.atkAnim > 0) && (player._useSkill2 || player.sp2cd < 0.01);
    const atk1    = (player.atkAnim > 0);
    const moving  = (Math.abs(player._dx||0) + Math.abs(player._dy||0)) > 0.05 ||
                    (window.JOY?.on && Math.hypot(window.JOY?.dx||0, window.JOY?.dy||0) > 0.06);
    const blocking = player.blocking || false;

    st.prevHurt = player.hurt;

    let want;
    if (dead)         want = 'death';
    else if (hurt && !st.locked) want = 'gothit';
    else if (st.locked) want = st.anim;   // biarkan animasi selesai
    else if (atk2)    want = 'attack2';
    else if (atk1)    want = 'attack1';
    else if (blocking) want = 'block';
    else               want = 'walk';     // berjalan atau idle (walk frame 0)

    // 3. Tukar animasi jika berbeza
    if (want !== st.anim) {
      const cfg = CFG[want];
      st.anim   = want;
      st.frame  = 0;
      st.timer  = 0;
      st.done   = false;
      st.locked = cfg ? !cfg[F_LOOP] : false;
    }

    // 4. Kemas kini arah (hanya semasa walk/block supaya atk tidak flip)
    if (['walk', 'block'].includes(st.anim)) st.dir = newDir;

    // 5. Pastikan set ini dimuatkan
    _loadSet(st.anim, st.dir);

    // 6. Maju frame
    const cfg = CFG[st.anim];
    if (!cfg) return;

    if (dead && st.done) return; // beku pada frame terakhir death

    st.timer += dt;
    const interval = 1 / cfg[F_FPS];
    if (st.timer >= interval) {
      st.timer -= interval;
      st.frame++;
      if (st.frame >= cfg[F_FRAMES]) {
        if (cfg[F_LOOP]) {
          st.frame = 0;
        } else {
          st.frame  = cfg[F_FRAMES] - 1;
          st.done   = true;
          st.locked = false;
          if (st.anim !== 'death') {
            // Kembali ke walk selepas animasi selesai
            st.anim   = 'walk';
            st.frame  = moving ? (st.frame % (CFG.walk[F_FRAMES])) : 0;
            st.timer  = 0;
          }
        }
      }
    }

    // Simpan dx/dy player untuk next tick
    player._dx = player._prevX !== undefined ? player.x - player._prevX : 0;
    player._dy = player._prevY !== undefined ? player.y - player._prevY : 0;
    player._prevX = player.x;
    player._prevY = player.y;
  }

  // ── Dapatkan frame semasa ──────────────────────────────────
  function _getFrame() {
    const st  = _state;
    const img = frames[st.anim]?.[st.dir]?.[st.frame];
    if (img) return img;
    // Fallback: cuba walk dir 4 (S)
    return frames['walk']?.[4]?.[0] ?? null;
  }

  // ── Lukis hero dengan sprite ────────────────────────────────
  // Mengembalikan true jika berjaya, false jika fallback diperlukan
  function draw(ctx, player, camX, camY) {
    if (!player) return false;

    const img = _getFrame();
    if (!img || !img.complete || img.naturalWidth === 0) return false;

    const st   = _state;
    const cfg  = CFG[st.anim];
    const sc   = cfg ? cfg[F_SCALE] : 1.0;
    const anch = cfg ? cfg[F_ANCH]  : 0.78;

    const sw = img.naturalWidth  * sc;
    const sh = img.naturalHeight * sc;

    // Kedudukan skrin player
    const sx = player.x - camX;
    const sy = player.y - camY;

    ctx.save();

    // ── Kesan buff / status ──────────────────────────────────
    if (player.stealthMode) ctx.globalAlpha = 0.3;

    if (player.blessBuff > 0) {
      ctx.shadowColor = 'rgba(255,255,160,.9)';
      ctx.shadowBlur  = 20;
    } else if (player.berserkBuff > 0) {
      ctx.shadowColor = 'rgba(255,80,0,.9)';
      ctx.shadowBlur  = 18;
    }

    // ── Flicker masa terluka ──────────────────────────────────
    if (player.hurt > 0) {
      ctx.globalAlpha = (ctx.globalAlpha ?? 1) * (0.45 + Math.sin(Date.now() * 0.07) * 0.35);
    }

    // ── Bayang di bawah sprite ───────────────────────────────
    ctx.shadowBlur = 0;
    ctx.fillStyle  = 'rgba(0,0,0,.22)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 6, Math.min(sw * 0.25, 22), Math.min(sh * 0.06, 7), 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Lukis sprite ─────────────────────────────────────────
    // Anchor: kaki = sy (bawah watak ≈ anch% dari atas imej)
    const dx = sx - sw * 0.5;
    const dy = sy - sh * anch;
    ctx.drawImage(img, dx, dy, sw, sh);

    ctx.restore();

    // ── Nama watak di atas kepala ─────────────────────────────
    const ch = window.selChar;
    if (ch) {
      const isEl    = ch.faction === 'elmorad' || ch.faction === 'cahaya';
      const nameY   = sy - sh * anch - 6;
      const nameCol = isEl ? '#c9a84c' : '#e06060';
      ctx.font      = 'bold 10px "Share Tech Mono",monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillText(ch.char_name || 'Pahlawan', sx + 1, nameY + 1);
      ctx.fillStyle = nameCol;
      ctx.fillText(ch.char_name || 'Pahlawan', sx, nameY);

      // ── Tag buff ───────────────────────────────────────────
      if (player.blessBuff > 0) {
        ctx.font = '9px monospace'; ctx.fillStyle = '#ffffaa';
        ctx.fillText('✦ BLESS', sx, nameY - 11);
      } else if (player.berserkBuff > 0) {
        ctx.font = '9px monospace'; ctx.fillStyle = '#ff4400';
        ctx.fillText('⚡ BERSERK', sx, nameY - 11);
      } else if (player.stealthMode) {
        ctx.font = '9px monospace'; ctx.fillStyle = '#aaccff';
        ctx.fillText('👁 STEALTH', sx, nameY - 11);
      }
    }

    return true;
  }

  // ── Info kemajuan muat ────────────────────────────────────
  function progress() {
    const total = Object.values(CFG).reduce((s, c) => s + c[F_DIRS] * c[F_FRAMES], 0);
    return {
      loaded : totalLoaded,
      total,
      walkReady : walkDirsReady >= 8,
      pct : Math.round(totalLoaded / total * 100),
    };
  }

  return {
    preloadAll, update, draw, progress,
    get state() { return _state; },
    angleToSpriteDir,
  };

})();

window.HeroSprite = HeroSprite;

// ════════════════════════════════════════════════════════════════
// PATCH: Gantikan ChibiRenderer.drawHero dengan sprite sebenar
// ════════════════════════════════════════════════════════════════
(function patchChibiRenderer() {
  const _tryPatch = () => {
    if (!window.ChibiRenderer) return false;

    const _origDrawHero = window.ChibiRenderer.drawHero.bind(window.ChibiRenderer);

    window.ChibiRenderer.drawHero = function(ctx, x, y, opts = {}) {
      const {
        job = 'warrior', faction = 'elmorad', scale = 1,
        aFrame = 0, atkAnim = 0, facing = 1,
        blessBuff = 0, berserkBuff = 0, stealthMode = false, t = 0,
      } = opts;

      // ── Semua job guna sprite hero dari Hero.zip ───────────
      // Bina player-like object supaya HeroSprite.draw boleh guna
      // (Bila dipanggil dari ChibiRenderer, kita perlu simulasi player state)
      const fakePlayer = {
        x           : x,
        y           : y,
        hp          : 1,           // bukan dead
        hurt        : 0,
        atkAnim     : atkAnim,
        _useSkill2  : false,
        sp2cd       : 1,
        blocking    : false,
        _dx         : facing > 0 ? 1 : -1,
        _dy         : 0,
        blessBuff   : blessBuff,
        berserkBuff : berserkBuff,
        stealthMode : stealthMode,
      };

      // Paksa arah berdasarkan facing (kiri/kanan)
      // facing 1=kanan(E), -1=kiri(W)
      const st = HeroSprite.state;
      if (atkAnim > 0) {
        st.anim   = 'attack1';
        st.frame  = Math.floor(aFrame * 1.2) % 10;
      } else {
        st.anim  = 'walk';
        st.frame = Math.floor(aFrame) % 10;
      }
      // Set arah: facing kanan → dir 2 (E), kiri → dir 6 (W)
      if (st.anim === 'walk' || st.anim === 'attack1') {
        st.dir = facing >= 0 ? 2 : 6;
      }

      const drawn = HeroSprite.draw(ctx, fakePlayer, 0, 0);

      if (!drawn) {
        // Fallback ke asal (canvas chibi / knight atlas)
        _origDrawHero(ctx, x, y, opts);
      }

      // ── Aura barrier (tetap lukis walaupun sprite ada) ─────
      if (opts.barrierHp > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(68,136,255,${.6 + Math.sin(t*4)*.2})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(x, y, 36, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
      }
    };

    console.log('[HeroSprite] ✅ ChibiRenderer.drawHero dipatch dengan sprite isometrik');
    return true;
  };

  if (!_tryPatch()) {
    const iv = setInterval(() => { if (_tryPatch()) clearInterval(iv); }, 150);
  }
})();

// ════════════════════════════════════════════════════════════════
// PATCH: Player.tick dan Player.draw — guna sprite + state penuh
// ════════════════════════════════════════════════════════════════
(function patchPlayer() {
  const _tryPatch = () => {
    if (typeof Player === 'undefined' || !Player.prototype?.tick) return false;

    // ── Mula preload ───────────────────────────────────────
    HeroSprite.preloadAll();

    // ── Patch tick: jejak dx/dy + kemas kini sprite state ──
    const _origTick = Player.prototype.tick;
    Player.prototype.tick = function(dt, enemies) {
      const prevX = this.x, prevY = this.y;
      _origTick.call(this, dt, enemies);
      this._dx = this.x - prevX;
      this._dy = this.y - prevY;
      // Kemas kini state animasi sprite hero
      HeroSprite.update(dt, this);
    };

    // ── Patch draw: guna sprite dulu, fallback ke canvas ──
    const _origDraw = Player.prototype.draw;
    Player.prototype.draw = function() {
      const ctx = window.cx, cam = window.cam;
      if (!ctx || !cam) { _origDraw.call(this); return; }

      // ── Lukis target auto-aim (kekalkan dari asal) ───────
      if (this._aimTarget && !this._aimTarget.dead) {
        const t   = Date.now() / 1000;
        const tx  = this._aimTarget.x, ty = this._aimTarget.y;
        const sx  = tx - cam.x, sy = ty - cam.y;
        const pulse = .7 + Math.sin(t * 6) * .3;
        ctx.save();
        ctx.strokeStyle = `rgba(255,60,60,${pulse})`;
        ctx.lineWidth = 1.5; ctx.setLineDash([4,3]); ctx.lineDashOffset = -t*15;
        ctx.beginPath(); ctx.arc(sx, sy, this._aimTarget.sz + 10, 0, Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // ── Barrier ring ──────────────────────────────────────
      if (this.barrierHp > 0) {
        const t = Date.now() / 1000;
        const sx = this.x - cam.x, sy = this.y - cam.y;
        ctx.save();
        ctx.strokeStyle = `rgba(68,136,255,${.6+Math.sin(t*4)*.2})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(sx, sy, 36, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
      }

      // ── Lukis sprite hero (koordinat dunia → skrin) ───────
      const drawn = HeroSprite.draw(ctx, this, cam.x, cam.y);

      if (!drawn) {
        // Sprite belum dimuatkan — guna lukisan canvas asal
        _origDraw.call(this);
        return;
      }

      // ── Tag buff (lukis walaupun sprite ada) ─────────────
      const sc  = window.selChar;
      const sx  = this.x - cam.x;
      const sy  = this.y - cam.y;
      const cfg = HeroSprite.state?.anim ? {} : {};
      // (Nama + buff tag sudah dilukis dalam HeroSprite.draw)

      // ── Attack arc kesan visual ───────────────────────────
      if (this.atkAnim > 0) {
        ctx.save();
        const isEl = sc?.faction === 'elmorad' || sc?.faction === 'cahaya';
        ctx.globalAlpha = (this.atkAnim / .3) * 0.18;
        ctx.fillStyle = isEl ? '#ffdd44' : '#ff4444';
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.arc(sx, sy, this.range, this.dir - Math.PI * .55, this.dir + Math.PI * .55);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    };

    console.log('[HeroSprite] ✅ Player.tick & Player.draw dipatch');
    return true;
  };

  if (!_tryPatch()) {
    const iv = setInterval(() => { if (_tryPatch()) clearInterval(iv); }, 150);
  }
})();

// ════════════════════════════════════════════════════════════════
// LOADING INDICATOR — tunjuk kemajuan muat sprite
// ════════════════════════════════════════════════════════════════
(function spritLoadIndicator() {
  window.addEventListener('DOMContentLoaded', () => {
    HeroSprite.preloadAll();

    // Semak kemajuan setiap 0.5s dan update mesej loading jika masih di loading screen
    const iv = setInterval(() => {
      const p = HeroSprite.progress();
      if (p.walkReady) {
        clearInterval(iv);
        console.log(`[HeroSprite] ✅ Walk siap — ${p.loaded}/${p.total} frame (${p.pct}%)`);
        return;
      }
      const lmsg = document.getElementById('lbM');
      if (lmsg && lmsg.textContent.includes('sprite') === false) {
        // Jangan overwrite mesej lain
      }
    }, 500);
  });
})();
