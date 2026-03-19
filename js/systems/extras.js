'use strict';
/* ══════════════════════════════════════════════════════════════
   Pahlawan Terakhir — systems/extras.js
   1. Push Notification (boss spawn, event, zone alert)
   2. BGM per zone baru (Bifrost, Eslant, Forgotten Temple)
   3. GM Analytics Dashboard (live stats)
   ══════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════
// 1. PUSH NOTIFICATION
// ═══════════════════════════════════════════════════════════════
const PushNotifUI = (() => {
  let _granted = false;
  let _swReg   = null;

  // ── Minta kebenaran ───────────────────────────────────────
  async function requestPermission() {
    if (!('Notification' in window)) return false;
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') { _granted = true; return true; }
    if (Notification.permission === 'denied')  return false;
    const result = await Notification.requestPermission();
    _granted = result === 'granted';
    return _granted;
  }

  // ── Simpan SW registration ────────────────────────────────
  function setReg(reg) { _swReg = reg; }

  // ── Hantar notifikasi ─────────────────────────────────────
  async function send(title, body, opts = {}) {
    if (!_granted) {
      const ok = await requestPermission();
      if (!ok) return;
    }
    const options = {
      body,
      icon  : opts.icon  || 'icons/icon-192.png',
      badge : opts.badge || 'icons/icon-96.png',
      tag   : opts.tag   || 'pt-notif',
      renotify : true,
      data  : opts.data  || {},
      ...opts.extra,
    };
    try {
      if (_swReg?.showNotification) {
        await _swReg.showNotification(title, options);
      } else {
        new Notification(title, options);
      }
    } catch(e) {
      console.warn('[PushNotif]', e);
    }
  }

  // ── In-app toast (fallback bila tab active) ───────────────
  function toast(title, body, icon = '🔔', dur = 4500) {
    let wrap = document.getElementById('toastWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'toastWrap';
      wrap.style.cssText = `
        position:fixed;top:12px;left:50%;transform:translateX(-50%);
        z-index:999;display:flex;flex-direction:column;gap:6px;
        align-items:center;pointer-events:none;width:min(340px,92vw)`;
      document.body.appendChild(wrap);
    }
    const el = document.createElement('div');
    el.style.cssText = `
      background:rgba(8,6,20,.95);border:1px solid rgba(201,168,76,.35);
      border-radius:8px;padding:10px 14px;
      display:flex;gap:10px;align-items:flex-start;
      box-shadow:0 4px 20px rgba(0,0,0,.7);
      animation:toastIn .3s ease;pointer-events:auto;
      backdrop-filter:blur(12px);max-width:100%`;
    el.innerHTML = `
      <div style="font-size:1.4rem;line-height:1;flex-shrink:0">${icon}</div>
      <div style="flex:1;min-width:0">
        <div style="font-family:'Cinzel',serif;font-size:.72rem;color:#c9a84c;
          font-weight:700;letter-spacing:.05em">${title}</div>
        <div style="font-family:'Crimson Text',serif;font-size:.75rem;
          color:rgba(232,220,200,.8);margin-top:2px;line-height:1.4">${body}</div>
      </div>
      <div style="cursor:pointer;color:#555;font-size:.8rem;padding:2px 4px;flex-shrink:0"
        onclick="this.parentElement.remove()">✕</div>`;
    wrap.appendChild(el);

    // Add style if missing
    if (!document.getElementById('toastStyle')) {
      const s = document.createElement('style');
      s.id = 'toastStyle';
      s.textContent = `
        @keyframes toastIn  { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastOut { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-12px)} }`;
      document.head.appendChild(s);
    }

    setTimeout(() => {
      el.style.animation = 'toastOut .3s ease forwards';
      setTimeout(() => el.remove(), 350);
    }, dur);
  }

  // ── Notif types ───────────────────────────────────────────
  function bossSpawn(bossName, zone) {
    const msg = `${bossName} muncul di ${zone}!`;
    send('👑 Boss Spawn!', msg, { tag:'boss-spawn', icon:'icons/icon-192.png' });
    toast('👑 Boss Spawn!', msg, '👑');
    if (typeof Audio !== 'undefined') Audio.playSFX('bossSpawn');
  }

  function zoneEvent(eventName, zone) {
    const msg = `Event "${eventName}" bermula di ${zone}!`;
    send('📅 Event Bermula!', msg, { tag:'zone-event' });
    toast('📅 Event Bermula!', msg, '📅');
  }

  function levelUp(lv) {
    toast(`⬆ NAIK TAHAP ${lv}!`, 'Tahniah! Stat kamu bertambah.', '⬆', 3000);
  }

  function itemDrop(itemName, rarity) {
    if (rarity === 'legendary' || rarity === 'mythic') {
      toast(`💎 Drop Legenda!`, itemName + ' jatuh!', '💎', 5000);
    }
  }

  function partyInvite(from) {
    toast('👥 Jemputan Party', `${from} menjemput kamu masuk party!`, '👥');
  }

  function duelChallenge(from) {
    toast('⚔️ Cabaran Duel', `${from} mencabar kamu berduel!`, '⚔️');
  }

  function questComplete(questName) {
    toast('✅ Quest Selesai!', questName, '✅', 3500);
  }

  function spinResult(itemName) {
    toast('🎰 Spin Tamat!', `Kamu dapat: ${itemName}!`, '🎰', 4000);
  }

  // ── Auto-request on first game start ─────────────────────
  window.addEventListener('load', () => {
    // Grab SW registration if available
    navigator.serviceWorker?.ready.then(reg => { _swReg = reg; });
    // Auto-request after user interaction
    document.addEventListener('click', async () => {
      if (!_granted && typeof Notification !== 'undefined' && Notification.permission === 'default') {
        await requestPermission();
      }
    }, { once: true });
  });

  // ── Hook into game events ─────────────────────────────────
  window.addEventListener('load', () => {
    // Boss spawn notification
    const _waitBS = setInterval(() => {
      if (!window.showWvNotif) return;
      clearInterval(_waitBS);
      const _orig = window.showWvNotif;
      window.showWvNotif = function(txt) {
        _orig(txt);
        if (txt.includes('Boss') || txt.includes('Iblis') || txt.includes('Dragon') ||
            txt.includes('Felankor') || txt.includes('Isiloon')) {
          const zone = window.ZONES?.[window.G?.currentZone]?.name || '';
          (window.PushNotif?.bossSpawn || PushNotifUI?.bossSpawn)?.(txt.replace(/[⚡👑🐉🐲]/g,'').trim(), zone);
        }
      };
      window.showWvNotif = window.showWvNotif;
    }, 500);
  });

  return { requestPermission, send, toast, bossSpawn, zoneEvent, levelUp,
           itemDrop, partyInvite, duelChallenge, questComplete, spinResult };
})();

window.PushNotifUI = PushNotifUI;

// ═══════════════════════════════════════════════════════════════
// 2. BGM TAMBAHAN (zone baru + SFX baru)
// ═══════════════════════════════════════════════════════════════
(function patchAudio() {
  const _wait = setInterval(() => {
    if (typeof Audio === 'undefined' || !Audio.playZoneMusic) return;
    clearInterval(_wait);

    // ── Patch playZoneMusic untuk zone baru ────────────────
    const _origPlay = Audio.playZoneMusic.bind(Audio);

    // Override via the exposed stopMusic + playSFX approach
    // since we can't directly access the IIFE internals
    // We hook into the zone init to play appropriate music type

    const _origGotoPlay = window.gotoAndPlay;
    if (_origGotoPlay) {
      window.gotoAndPlay = function(zoneId) {
        _origGotoPlay(zoneId);
        // Play zone-specific audio after a short delay
        setTimeout(() => {
          _playZoneBGM(zoneId);
        }, 300);
      };
    }

    function _playZoneBGM(zoneId) {
      // Map new zones to existing music types
      const MAP = {
        bifrost:          'ardream',   // mystical field music
        forgotten_temple: 'dungeon',   // dungeon music
        eslant:           'luferson',  // dark field music
      };
      const mapped = MAP[zoneId];
      if (mapped) {
        Audio.playZoneMusic(mapped);
      }
      // Zone-specific notification
      const zone = window.ZONES?.[zoneId];
      if (zone && zoneId !== 'moradon') {
        PushNotif.toast(zone.icon + ' ' + zone.name, zone.desc || '', zone.icon || '⚔️', 2500);
      }
    }

    // ── Tambah SFX baru ────────────────────────────────────
    const _origSFX = Audio.playSFX.bind(Audio);
    // Hook achievement unlock sound
    window._playSFXExtra = function(type) {
      switch(type) {
        case 'achievement':
          _origSFX('legendary');
          setTimeout(() => _origSFX('levelup'), 400);
          break;
        case 'quest_complete':
          _origSFX('raredrop');
          setTimeout(() => _origSFX('buff'), 300);
          break;
        case 'spin_rare':
          _origSFX('epic');
          setTimeout(() => _origSFX('raredrop'), 250);
          break;
        case 'spin_common':
          _origSFX('pickup');
          break;
        case 'duel_start':
          _origSFX('pvp_kill');
          break;
        case 'party_join':
          _origSFX('buff');
          break;
        case 'event_start':
          _origSFX('world_boss');
          break;
        default:
          _origSFX(type);
      }
    };

    console.log('[Extras] ✓ BGM & SFX extended');
  }, 500);
})();

// ═══════════════════════════════════════════════════════════════
// 3. GM ANALYTICS DASHBOARD (live stats)
// ═══════════════════════════════════════════════════════════════
const GMAnalytics = (() => {

  let _refreshTimer = null;
  let _cache = {};

  // ── Fetch stats from Supabase ─────────────────────────────
  async function fetchStats() {
    if (!window.SB || window.offlineMode) return _mockStats();
    try {
      const [players, lb, pvp, market, topup] = await Promise.all([
        window.SB.from('kn_players').select('id,faction,level,current_zone,created_at', { count:'exact' }),
        window.SB.from('kn_leaderboard').select('score,faction,zone').order('score',{ascending:false}).limit(10),
        window.SB.from('kn_pvp_ranking').select('char_name,faction,kills,deaths,pk_points').order('kills',{ascending:false}).limit(10),
        window.SB.from('kn_market').select('status,price,item_name').eq('status','active').limit(50),
        window.SB.from('kn_topup_requests').select('status,amount_rm,created_at').eq('status','pending').limit(20),
      ]);

      const all = players.data || [];
      const byZone    = {};
      const byFaction = { elmorad:0, karus:0 };
      const byLevel   = { '1-10':0,'11-30':0,'31-60':0,'61+':0 };
      let   today     = 0;
      const todayStr  = new Date().toISOString().slice(0,10);

      all.forEach(p => {
        if (p.current_zone) byZone[p.current_zone] = (byZone[p.current_zone]||0)+1;
        if (p.faction === 'elmorad' || p.faction === 'cahaya') byFaction.elmorad++;
        else byFaction.karus++;
        const lv = p.level||1;
        if (lv<=10) byLevel['1-10']++;
        else if (lv<=30) byLevel['11-30']++;
        else if (lv<=60) byLevel['31-60']++;
        else byLevel['61+']++;
        if (p.created_at?.slice(0,10) === todayStr) today++;
      });

      _cache = {
        total: players.count || all.length,
        today,
        byZone, byFaction, byLevel,
        topLB   : lb.data || [],
        topPvP  : pvp.data || [],
        activeListings : (market.data||[]).length,
        pendingTopup   : (topup.data||[]).length,
        pendingRM : (topup.data||[]).reduce((s,r)=>s+(r.amount_rm||0),0),
        fetchedAt : new Date(),
      };
      return _cache;
    } catch(e) {
      console.warn('[GMAnalytics]', e);
      return _mockStats();
    }
  }

  function _mockStats() {
    return {
      total:0, today:0,
      byZone:{}, byFaction:{elmorad:0,karus:0},
      byLevel:{'1-10':0,'11-30':0,'31-60':0,'61+':0},
      topLB:[], topPvP:[], activeListings:0, pendingTopup:0, pendingRM:0,
      fetchedAt: new Date(), _mock:true,
    };
  }

  // ── Render panel ──────────────────────────────────────────
  async function openPanel() {
    let panel = document.getElementById('analyticsPanel');
    if (!panel) { panel = _create(); }
    panel.classList.remove('off');
    await _render();
    // Auto-refresh every 30s
    clearInterval(_refreshTimer);
    _refreshTimer = setInterval(_render, 30000);
  }

  function closePanel() {
    document.getElementById('analyticsPanel')?.classList.add('off');
    clearInterval(_refreshTimer);
  }

  function _create() {
    const div = document.createElement('div');
    div.id = 'analyticsPanel';
    div.className = 'overlay-panel off';
    div.innerHTML = `
      <div class="ov-box" style="max-width:480px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column">
        <div class="ov-header" style="background:linear-gradient(90deg,rgba(8,5,20,.9),rgba(20,5,30,.9))">
          <div class="ov-title" style="color:#c9a84c">📊 GM Analytics</div>
          <div style="display:flex;gap:8px;align-items:center">
            <div id="analyticsRefreshBtn" onclick="GMAnalytics.refresh()"
              style="cursor:pointer;font-size:.65rem;color:rgba(201,168,76,.6);
                font-family:'Share Tech Mono',monospace;padding:3px 8px;
                border:1px solid rgba(201,168,76,.2);border-radius:3px">↺ Refresh</div>
            <div class="ov-close" onclick="GMAnalytics.closePanel()">✕</div>
          </div>
        </div>
        <div class="ov-body" id="analyticsBody" style="overflow-y:auto;flex:1"></div>
      </div>`;
    document.body.appendChild(div);
    return div;
  }

  async function _render() {
    const body = document.getElementById('analyticsBody');
    if (!body) return;
    body.innerHTML = `<div style="text-align:center;padding:20px;color:var(--muted);font-family:'Share Tech Mono',monospace;font-size:.7rem">⏳ Memuatkan data...</div>`;

    const s = await fetchStats();
    const ts = s.fetchedAt ? s.fetchedAt.toLocaleTimeString('ms-MY') : '—';

    // ── Zone breakdown ──────────────────────────────────────
    const zoneRows = Object.entries(s.byZone)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,8)
      .map(([z,n]) => {
        const zone = window.ZONES?.[z];
        const pct  = s.total > 0 ? Math.round(n/s.total*100) : 0;
        return `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <div style="font-size:.95rem;width:22px;text-align:center">${zone?.icon||'⚙️'}</div>
            <div style="flex:1;min-width:0">
              <div style="font-family:'Cinzel',serif;font-size:.62rem;color:#c9a84c;
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${zone?.name||z}</div>
              <div style="height:4px;background:rgba(0,0,0,.5);border-radius:2px;margin-top:2px">
                <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#4a3010,#c9a84c);border-radius:2px;transition:width .5s"></div>
              </div>
            </div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:#c9a84c;min-width:36px;text-align:right">${n} (${pct}%)</div>
          </div>`;
      }).join('');

    // ── Level distribution ──────────────────────────────────
    const lvRows = Object.entries(s.byLevel).map(([range, n]) => {
      const pct = s.total > 0 ? Math.round(n/s.total*100) : 0;
      return `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:var(--muted);width:40px">Lv${range}</div>
          <div style="flex:1;height:4px;background:rgba(0,0,0,.5);border-radius:2px">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#004080,#40a0ff);border-radius:2px"></div>
          </div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:#40a0ff;min-width:28px;text-align:right">${n}</div>
        </div>`;
    }).join('');

    // ── Top PvP ─────────────────────────────────────────────
    const pvpRows = s.topPvP.slice(0,5).map((p,i) =>
      `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);
        font-family:'Share Tech Mono',monospace;font-size:.65rem">
        <span style="color:${i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'var(--muted)'}">
          ${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)} ${p.char_name||'?'}</span>
        <span style="color:#ff6666">${p.kills||0}K / ${p.deaths||0}D</span>
      </div>`
    ).join('') || '<div style="color:var(--muted);font-size:.65rem;text-align:center">Tiada data</div>';

    // ── Top LB ──────────────────────────────────────────────
    const lbRows = s.topLB.slice(0,5).map((r,i) =>
      `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);
        font-family:'Share Tech Mono',monospace;font-size:.65rem">
        <span style="color:${i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'var(--muted)'}">
          ${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)} ${r.char_name||'?'}</span>
        <span style="color:#c9a84c">${(r.score||0).toLocaleString()}</span>
      </div>`
    ).join('') || '<div style="color:var(--muted);font-size:.65rem;text-align:center">Tiada data</div>';

    const elPct = s.total > 0 ? Math.round(s.byFaction.elmorad/s.total*100) : 50;
    const krPct = 100 - elPct;

    body.innerHTML = `
      <style>
        .an-card{background:rgba(0,0,0,.4);border:1px solid rgba(201,168,76,.1);
          border-radius:6px;padding:12px;margin-bottom:8px}
        .an-title{font-family:'Cinzel',serif;font-size:.65rem;color:rgba(201,168,76,.6);
          text-transform:uppercase;letter-spacing:.15em;margin-bottom:8px}
        .an-stat{text-align:center}
        .an-stat .val{font-family:'Cinzel Decorative',serif;font-size:1.4rem;color:#c9a84c;line-height:1}
        .an-stat .lbl{font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--muted);
          text-transform:uppercase;letter-spacing:.1em;margin-top:2px}
      </style>

      <!-- Header stats -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-bottom:8px">
        <div class="an-card an-stat"><div class="val">${s.total}</div><div class="lbl">Jumlah Pemain</div></div>
        <div class="an-card an-stat"><div class="val" style="color:#40c840">${s.today}</div><div class="lbl">Daftar Hari Ini</div></div>
        <div class="an-card an-stat"><div class="val" style="color:#ff8800">${s.pendingTopup}</div><div class="lbl">Top-up Pending</div></div>
        <div class="an-card an-stat"><div class="val" style="color:#4488ff">${s.activeListings}</div><div class="lbl">Market Items</div></div>
      </div>

      <!-- Faction war bar -->
      <div class="an-card">
        <div class="an-title">⚔️ Keseimbangan Puak</div>
        <div style="display:flex;height:18px;border-radius:4px;overflow:hidden;margin-bottom:6px">
          <div style="width:${elPct}%;background:linear-gradient(90deg,#7a5010,#c9a84c);
            display:flex;align-items:center;justify-content:center;
            font-family:'Share Tech Mono',monospace;font-size:.6rem;color:#000;font-weight:700">
            ${elPct > 15 ? '🌟 ' + elPct + '%' : ''}</div>
          <div style="width:${krPct}%;background:linear-gradient(90deg,#8b1a1a,#cc3333);
            display:flex;align-items:center;justify-content:center;
            font-family:'Share Tech Mono',monospace;font-size:.6rem;color:#fff;font-weight:700">
            ${krPct > 15 ? '🔥 ' + krPct + '%' : ''}</div>
        </div>
        <div style="display:flex;justify-content:space-between;font-family:'Share Tech Mono',monospace;font-size:.6rem">
          <span style="color:#c9a84c">🌟 El Morad: ${s.byFaction.elmorad}</span>
          <span style="color:#cc3333">🔥 Karus: ${s.byFaction.karus}</span>
        </div>
      </div>

      <!-- Pemain per zone -->
      <div class="an-card">
        <div class="an-title">🗺️ Pemain Per Zone</div>
        ${zoneRows || '<div style="color:var(--muted);font-size:.65rem;text-align:center">Tiada data</div>'}
      </div>

      <!-- Level distribution -->
      <div class="an-card">
        <div class="an-title">📊 Taburan Level</div>
        ${lvRows}
      </div>

      <!-- Top PvP & LB side by side -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        <div class="an-card">
          <div class="an-title">⚔️ Top PvP</div>
          ${pvpRows}
        </div>
        <div class="an-card">
          <div class="an-title">🏆 Top Score</div>
          ${lbRows}
        </div>
      </div>

      ${s.pendingTopup > 0 ? `
      <div class="an-card" style="border-color:rgba(255,150,0,.3)">
        <div class="an-title" style="color:rgba(255,150,0,.7)">💰 Top-up Menunggu</div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:.7rem;color:#ff8800">
          ${s.pendingTopup} permintaan · RM ${s.pendingRM.toFixed(2)}
          <button onclick="document.getElementById('analyticsPanel').classList.add('off');document.getElementById('gmPanel')?.classList.remove('off')"
            class="btn btn-gold" style="margin-top:6px;width:100%;padding:6px;font-size:.62rem">
            Uruskan Top-up ▶</button>
        </div>
      </div>` : ''}

      <div style="font-family:'Share Tech Mono',monospace;font-size:.52rem;
        color:rgba(201,168,76,.25);text-align:center;margin-top:4px">
        Dikemas kini: ${ts} ${s._mock ? '(tiada sambungan)' : ''}
      </div>`;
  }

  async function refresh() {
    await _render();
  }

  // ── Hook ke ingame menu GM ────────────────────────────────
  window.addEventListener('load', () => {
    const _wait = setInterval(() => {
      const gmPanel = document.getElementById('gmPanel');
      if (!gmPanel) return;
      clearInterval(_wait);

      // Add analytics button to GM panel header
      const gmHeader = gmPanel.querySelector('.ov-header');
      if (gmHeader && !document.getElementById('gmAnalyticsBtn')) {
        const btn = document.createElement('button');
        btn.id = 'gmAnalyticsBtn';
        btn.className = 'btn btn-gold';
        btn.style.cssText = 'font-size:.6rem;padding:4px 10px;margin-right:8px';
        btn.textContent = '📊 Analytics';
        btn.onclick = () => { gmPanel.classList.add('off'); openPanel(); };
        gmHeader.insertBefore(btn, gmHeader.lastChild);
      }
    }, 1000);

    // Also add to ingame menu
    const _waitMenu = setInterval(() => {
      if (!document.getElementById('ingameMenu')) return;
      clearInterval(_waitMenu);
    }, 500);
  });

  return { openPanel, closePanel, refresh, fetchStats };
})();

window.GMAnalytics = GMAnalytics;

// ═══════════════════════════════════════════════════════════════
// HOOK — Tambah butang ke ingame menu & HUD
// ═══════════════════════════════════════════════════════════════
window.addEventListener('load', () => {
  // Hook PushNotif into existing game events
  const _waitEvents = setInterval(() => {
    if (!window.G?.tick || !window.PushNotif) return;
    clearInterval(_waitEvents);

    // Level up notification
    const _origLvUp = window.showLvNotif || (() => {});
    if (window.showLvNotif) {
      const _o = window.showLvNotif;
      window.showLvNotif = function() {
        _o();
        const lv = window.selChar?.level || 1;
        window.PushNotif?.levelUp?.(lv) || PushNotifUI?.levelUp?.(lv);
      };
    }

    // Item drop notification (legendary/mythic)
    const _origDrop = window.handleDrop;
    if (window.handleDrop) {
      const _o = window.handleDrop;
      window.handleDrop = function(iid) {
        _o(iid);
        const item = window.ITEM_DB?.[iid];
        if (item) window.PushNotif?.itemDrop?.(item.name, item.rarity);
      };
    }

    // Duel challenge notification
    if (window.Duel) {
      const _origChallenge = window.Duel.challenge;
      if (_origChallenge) {
        // Patch Duel to show notification
        const origShowReq = Duel._showRequest;
      }
    }

    console.log('[Extras] ✓ Event hooks registered');
  }, 600);

  // Add GM Analytics to ingame menu (for GM only)
  const _waitGM = setInterval(() => {
    if (!window.selChar) return;
    // GM check — we add analytics option if user is GM
    const checkGM = async () => {
      if (!window.SB || window.offlineMode) { clearInterval(_waitGM); return; }
      try {
        const { data } = await window.SB.from('kn_gm')
          .select('role').eq('user_id', window.curAccount?.id || 'x').maybeSingle();
        if (data) {
          clearInterval(_waitGM);
          window._isGM = true;
          // Add analytics shortcut
          const menu = document.getElementById('ingameMenu');
          if (menu && !document.getElementById('gmAnalyticsShortcut')) {
            const btn = document.createElement('button');
            btn.id = 'gmAnalyticsShortcut';
            btn.className = 'im-btn';
            btn.style.cssText = 'border-color:rgba(255,80,80,.3);color:#ff8888';
            btn.textContent = '📊 GM Analytics';
            btn.onclick = () => { GMAnalytics.openPanel(); closeIngameMenu?.(); };
            menu.appendChild(btn);
          }
        } else { clearInterval(_waitGM); }
      } catch(e) { clearInterval(_waitGM); }
    };
    checkGM();
  }, 2000);
});

// ═══════════════════════════════════════════════════════════════
// PARTY XP SHARE PATCH
// ═══════════════════════════════════════════════════════════════
(function patchPartyXP() {
  const _wait = setInterval(() => {
    if (!window.G?.tick || !window.myParty) return;
    clearInterval(_wait);

    // When party has members, share XP from kills
    const _origReward = window.G.tick.bind(window.G);
    // We track kills and broadcast XP to party members
    const _origTick = window.G.tick.bind(window.G);
    window.G.tick = function(dt) {
      _origTick(dt);
      if (this.state !== 'play' || !window.myParty?.members?.length) return;
      // Check for newly rewarded enemies and share XP
      this.enemies?.forEach(e => {
        if (e.dead && e.rewarded && !e._partyShared) {
          e._partyShared = true;
          const shareXP = Math.floor(e.rew.xp * 0.6); // 60% shared
          // Broadcast to party
          if (window.rtCh && window.selChar) {
            window.rtCh.send({
              type: 'broadcast', event: 'party_xp',
              payload: { xp: shareXP, from: window.selChar.char_name, monType: e.type }
            });
          }
        }
      });
    };

    // Receive party XP
    if (window.rtCh) {
      window.rtCh.on('broadcast', { event: 'party_xp' }, ({ payload }) => {
        if (!window.selChar || payload.from === window.selChar.char_name) return;
        const inParty = window.myParty?.members?.some(m => m.name === payload.from) ||
                        window.myParty?.members?.some(m => m.name === window.selChar?.char_name);
        if (!inParty) return;
        window.selChar.xp = (window.selChar.xp || 0) + payload.xp;
        const need = (window.selChar.level || 1) * 100;
        if (window.selChar.xp >= need) {
          window.selChar.xp -= need;
          window.selChar.level = (window.selChar.level || 1) + 1;
          window.G?.pl?.applyChar?.(window.selChar);
          window.showLvNotif?.();
        }
        window.addChat?.('', `🤝 XP Party +${payload.xp} (dari ${payload.from})`, 'system');
        window.updHUD?.();
      });
    }
    console.log('[Extras] ✓ Party XP share patched');
  }, 800);
})();

console.log('[Extras] ✅ Push Notification + BGM + GM Analytics loaded');
