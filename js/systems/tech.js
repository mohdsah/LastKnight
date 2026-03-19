'use strict';
/* ══════════════════════════════════════════════════════════════
   Pahlawan Terakhir — systems/tech.js
   Push Notification, BGM per zone, GM Analytics, Custom GM
   ══════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════
// 1. PUSH NOTIFICATION (Boss spawn, Event, PvP)
// ═══════════════════════════════════════════════════════════
const PushNotif = (() => {
  let _perm  = 'default';
  let _subCh = null;

  async function requestPermission() {
    if (!('Notification' in window)) {
      console.warn('[PushNotif] Notification API tidak disokong');
      return false;
    }
    if (typeof Notification === 'undefined') return false;
    _perm = await (typeof Notification !== 'undefined' ? Notification.requestPermission.bind(Notification) : async()=>('denied'))();
    return _perm === 'granted';
  }

  function notify(title, body, icon = 'icons/icon-96.png', tag = 'game') {
    if (typeof Notification === 'undefined' || _perm !== 'granted') return;
    if (document.visibilityState === 'visible') return; // tab active — skip
    try {
      const n = new Notification(title, { body, icon, tag, badge: 'icons/icon-96.png' });
      n.onclick = () => { window.focus(); n.close(); };
      setTimeout(() => n.close(), 8000);
    } catch(e) {}
  }

  // Subscribe to Supabase zone_events for real-time boss/event push
  function subscribeEvents() {
    if (!window.SB || window.offlineMode) return;
    if (_subCh) _subCh.unsubscribe();
    _subCh = window.SB.channel('pt_push_events');
    _subCh
      .on('broadcast', { event: 'boss_spawn' }, ({ payload }) => {
        notify(`👑 Boss Muncul!`, `${payload.boss} muncul di ${payload.zone}!`, 'icons/icon-96.png', 'boss');
        window.addChat?.('', `🔔 BOSS SPAWN: ${payload.boss} di ${payload.zone}!`, 'system');
        if (typeof Audio !== 'undefined') Audio.playSFX?.('world_boss');
      })
      .on('broadcast', { event: 'zone_event' }, ({ payload }) => {
        notify(`📅 Event Bermula!`, `${payload.name} di ${payload.zone}!`);
        window.addChat?.('', `🔔 EVENT: ${payload.name} bermula!`, 'system');
      })
      .on('broadcast', { event: 'gm_announce' }, ({ payload }) => {
        notify(`📢 Pengumuman GM`, payload.msg);
        window.addChat?.('', `📢 [GM] ${payload.msg}`, 'system');
        if (typeof Audio !== 'undefined') Audio.playSFX?.('raredrop');
      })
      .subscribe();
    console.log('[PushNotif] ✅ Event channel subscribed');
  }

  // Notify when player's game is backgrounded during boss spawn
  function notifyBoss(bossName, zone) {
    notify(`👑 Boss Muncul — ${bossName}!`, `Pergi ${zone} sekarang!`, 'icons/icon-96.png', 'boss');
  }

  function notifyPvPKill(killerName) {
    notify(`⚔️ PvP Kill!`, `${killerName} ditewaskan oleh kamu! +200g`, 'icons/icon-96.png', 'pvp');
  }

  function openSettings() {
    let p = document.getElementById('pushSettingsPanel');
    if (!p) {
      p = document.createElement('div');
      p.id = 'pushSettingsPanel'; p.className = 'overlay-panel off';
      p.innerHTML = `<div class="ov-box" style="max-width:340px"><div class="ov-header">
        <div class="ov-title">🔔 Tetapan Notifikasi</div>
        <div class="ov-close" onclick="this.closest('.overlay-panel').classList.add('off')">✕</div></div>
        <div class="ov-body" id="pushBody"></div></div>`;
      document.body.appendChild(p);
    }
    p.classList.remove('off');
    _renderSettings();
  }

  function _renderSettings() {
    const body = document.getElementById('pushBody'); if (!body) return;
    const granted = _perm === 'granted';
    const prefs = JSON.parse(localStorage.getItem('pt_push_prefs')||'{"boss":true,"event":true,"pvp":false,"gm":true}');

    body.innerHTML = `
      <div style="margin-bottom:12px">
        <div style="font-size:.68rem;color:#666;margin-bottom:8px">
          Notifikasi akan muncul walaupun game ditutup (push notification).</div>
        ${!granted ? `<button class="btn btn-gold" onclick="PushNotif.enable()"
          style="width:100%;padding:10px;font-size:.7rem">🔔 Aktifkan Notifikasi</button>` :
          `<div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:#40c840;
            text-align:center;padding:6px">✓ Notifikasi Aktif</div>`}
      </div>
      ${['boss','event','pvp','gm'].map(k => `
        <div style="display:flex;align-items:center;justify-content:space-between;
          padding:8px;border-radius:4px;border:1px solid rgba(255,255,255,.05);margin-bottom:5px">
          <div style="font-family:'Cinzel',serif;font-size:.7rem;color:#aaa">
            ${k==='boss'?'👑 Boss Spawn':k==='event'?'📅 Zone Event':k==='pvp'?'⚔️ PvP Kill':'📢 GM Announce'}
          </div>
          <label style="position:relative;display:inline-block;width:36px;height:20px">
            <input type="checkbox" ${prefs[k]?'checked':''} onchange="PushNotif.togglePref('${k}',this.checked)"
              style="opacity:0;width:0;height:0">
            <span style="position:absolute;inset:0;background:${prefs[k]?'#c9a84c':'#333'};
              border-radius:20px;cursor:pointer;transition:background .2s"></span>
          </label>
        </div>`).join('')}
      <div style="margin-top:10px">
        <button class="btn btn-dim" onclick="PushNotif.test()"
          style="width:100%;padding:8px;font-size:.65rem">▶ Test Notifikasi</button>
      </div>`;
  }

  async function enable() {
    const ok = await requestPermission();
    if (ok) { subscribeEvents(); _renderSettings(); }
    else window.addChat?.('','Notifikasi ditolak oleh browser.','system');
  }

  function togglePref(key, val) {
    const p = JSON.parse(localStorage.getItem('pt_push_prefs')||'{}');
    p[key] = val; localStorage.setItem('pt_push_prefs', JSON.stringify(p));
  }

  function test() {
    notify('🔔 Test Notifikasi', 'Notifikasi Pahlawan Terakhir berfungsi!', 'icons/icon-96.png', 'test');
    if (!('Notification' in window) || _perm !== 'granted')
      alert('Aktifkan notifikasi dahulu!');
  }

  // Auto-init
  window.addEventListener('load', () => {
    _perm = (typeof Notification !== 'undefined' ? Notification.permission : 'denied') || 'default';
    if (_perm === 'granted') { subscribeEvents(); console.log('[PushNotif] ✅ Notifikasi aktif'); }
    // Hook boss spawns
    const _w = setInterval(() => {
      if (!window.G) return; clearInterval(_w);
      const _orig = window.G.tick?.bind(window.G);
      if (!_orig) return;
      window.G.tick = function(dt) {
        _orig(dt);
        this.enemies?.forEach(e => {
          if (e.boss && !e._pushNotified && e._achTracked) {
            e._pushNotified = true;
            notifyBoss(e.name||e.type, window.ZONES?.[this.currentZone]?.name||this.currentZone);
          }
        });
      };
    }, 600);
  });

  return { enable, notify, notifyBoss, notifyPvPKill, openSettings, test, subscribeEvents, togglePref };
})();
window.PushNotif = PushNotif;

// ═══════════════════════════════════════════════════════════
// 2. BGM PER ZONE + SFX LENGKAP
// (Extend existing Audio module — tidak overwrite)
// ═══════════════════════════════════════════════════════════
window.addEventListener('load', () => {
  const _w = setInterval(() => {
    if (typeof Audio === 'undefined' || !Audio.playSFX) return;
    clearInterval(_w);

    // Patch playZoneMusic to add per-zone descriptions
    const ZONE_BGM_DESC = {
      moradon:          { tempo:95,  mood:'ambient', key:'C', desc:'Nyaman & aman — bunyi marketplace' },
      elmorad:          { tempo:105, mood:'heroic',  key:'G', desc:'Megah & cerah — hero El Morad' },
      karus:            { tempo:108, mood:'dark',    key:'Am',desc:'Tegang & gelap — kubu Karus' },
      ronark:           { tempo:130, mood:'battle',  key:'Em',desc:'Agresif — medan perang' },
      cz:               { tempo:145, mood:'intense', key:'Dm',desc:'Penuh adrenalin — Colony Zone' },
      ardream:          { tempo:125, mood:'battle',  key:'Bm',desc:'PvP sengit — Ardream' },
      dungeon_goblin:   { tempo:110, mood:'eerie',   key:'Cm',desc:'Misterius — Gua Goblin' },
      dungeon_orc:      { tempo:118, mood:'heavy',   key:'Fm',desc:'Berat & brutal — Benteng Orc' },
      dungeon_dark:     { tempo:115, mood:'horror',  key:'F#m',desc:'Menakutkan — Kuil Kegelapan' },
      bifrost:          { tempo:120, mood:'mystic',  key:'Dm',desc:'Mistik & kaya — Bifrost Event' },
      forgotten_temple: { tempo:100, mood:'ancient', key:'Gm',desc:'Purba & sunyi — Forgotten Temple' },
      eslant:           { tempo:112, mood:'epic',    key:'Am',desc:'Epik & luas — Pegunungan Eslant' },
    };
    window._ZONE_BGM_DESC = ZONE_BGM_DESC;

    // Add new SFX sounds
    const _origSFX = Audio.playSFX.bind(Audio);
    Audio.playSFX = function(name) {
      // Route new sfx names that weren't in original
      const aliases = {
        'achievement': 'levelup',
        'quest_complete': 'levelup',
        'duel_start': 'pvp_kill',
        'spin_rare': 'raredrop',
        'donate': 'buy',
        'world_enter': 'portal',
      };
      _origSFX(aliases[name] || name);
    };

    console.log('[BGM] ✅ Zone BGM descriptions loaded');
  }, 400);
});

// ═══════════════════════════════════════════════════════════
// 3. GM ANALYTICS DASHBOARD (live stats)
// ═══════════════════════════════════════════════════════════
const GMAnal = (() => {
  let _refreshTimer = null;

  async function openDashboard() {
    let p = document.getElementById('gmAnalPanel');
    if (!p) { p = _create(); document.body.appendChild(p); }
    p.classList.remove('off');
    await _render();
    // Auto-refresh every 30s
    _refreshTimer = setInterval(_render, 30000);
  }

  function closeDashboard() {
    document.getElementById('gmAnalPanel')?.classList.add('off');
    clearInterval(_refreshTimer);
  }

  function _create() {
    const d = document.createElement('div');
    d.id = 'gmAnalPanel'; d.className = 'overlay-panel off';
    d.style.zIndex = '150';
    d.innerHTML = `<div class="ov-box" style="max-width:500px"><div class="ov-header"
      style="background:rgba(200,50,50,.1);border-bottom-color:rgba(200,50,50,.2)">
      <div class="ov-title" style="color:#e06060">📊 GM Analytics Dashboard</div>
      <div class="ov-close" onclick="GMAnal.closeDashboard()">✕</div></div>
      <div class="ov-body" id="gmAnalBody" style="max-height:75vh;overflow-y:auto"></div></div>`;
    return d;
  }

  async function _render() {
    const body = document.getElementById('gmAnalBody'); if (!body) return;
    if (!window.SB || window.offlineMode) {
      body.innerHTML = '<div style="color:#666;text-align:center;padding:20px">Perlu online untuk analytics.</div>';
      return;
    }
    body.innerHTML = '<div style="color:#555;text-align:center;padding:12px;font-size:.65rem">⏳ Memuatkan data...</div>';

    try {
      // Parallel queries
      const [players, lb, pvp, market, topups] = await Promise.all([
        window.SB.from('kn_players').select('faction,level,current_zone,gold,created_at'),
        window.SB.from('kn_leaderboard').select('score,wave,level,faction').order('score',{ascending:false}).limit(10),
        window.SB.from('kn_pvp_ranking').select('char_name,kills,deaths,pk_points,faction').order('kills',{ascending:false}).limit(10),
        window.SB.from('kn_market').select('status,price,item_name').eq('status','active').limit(50),
        window.SB.from('kn_topup_requests').select('status,amount_rm,created_at').limit(50),
      ]);

      const pl = players.data || [];
      const total    = pl.length;
      const elCount  = pl.filter(p=>p.faction==='elmorad'||p.faction==='cahaya').length;
      const krCount  = pl.filter(p=>p.faction==='karus').length;
      const avgLv    = total ? Math.round(pl.reduce((s,p)=>s+(p.level||1),0)/total) : 0;
      const avgGold  = total ? Math.round(pl.reduce((s,p)=>s+(p.gold||0),0)/total) : 0;
      const topZones = pl.reduce((a,p)=>{a[p.current_zone||'moradon']=(a[p.current_zone||'moradon']||0)+1;return a},{});
      const topZone  = Object.entries(topZones).sort((a,b)=>b[1]-a[1])[0];
      const today    = new Date(); today.setHours(0,0,0,0);
      const newToday = pl.filter(p=>new Date(p.created_at)>=today).length;
      const revenue  = (topups.data||[]).filter(t=>t.status==='approved').reduce((s,t)=>s+(t.amount_rm||0),0);
      const pendingT = (topups.data||[]).filter(t=>t.status==='pending').length;

      const onlineCnt = Object.keys(window.opMap||{}).length + 1;

      body.innerHTML = `
        <!-- Live Stats Row -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:14px">
          ${_chip('🟢 Online Sekarang', onlineCnt, '#40c840')}
          ${_chip('👥 Jumlah Pemain', total, '#c9a84c')}
          ${_chip('🆕 Daftar Hari Ini', newToday, '#88aaff')}
          ${_chip('🌟 El Morad', elCount, '#c9a84c')}
          ${_chip('🔥 Karus', krCount, '#e06060')}
          ${_chip('📊 Avg Level', avgLv, '#c9a84c')}
        </div>

        <!-- Zone Activity -->
        <div style="margin-bottom:12px">
          <div style="font-family:'Cinzel',serif;font-size:.6rem;color:rgba(200,50,50,.6);
            text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px">🗺️ Zone Paling Aktif</div>
          ${Object.entries(topZones).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([z,n])=>`
            <div style="display:flex;justify-content:space-between;padding:4px 6px;
              border-radius:3px;margin-bottom:2px;background:rgba(0,0,0,.3)">
              <span style="font-size:.65rem;color:#888">${window.ZONES?.[z]?.icon||'?'} ${window.ZONES?.[z]?.name||z}</span>
              <span style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:#c9a84c">${n} pemain</span>
            </div>`).join('')}
        </div>

        <!-- PvP Top -->
        <div style="margin-bottom:12px">
          <div style="font-family:'Cinzel',serif;font-size:.6rem;color:rgba(200,50,50,.6);
            text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px">⚔️ Top PvP</div>
          ${(pvp.data||[]).slice(0,5).map((p,i)=>`
            <div style="display:flex;gap:8px;padding:4px 6px;border-radius:3px;
              margin-bottom:2px;background:rgba(0,0,0,.3)">
              <span style="color:#555;font-size:.62rem;width:14px">${i+1}</span>
              <span style="flex:1;font-size:.65rem;color:#ccc">${p.char_name}</span>
              <span style="font-size:.6rem;color:#40c840">K:${p.kills}</span>
              <span style="font-size:.6rem;color:#e06060">D:${p.deaths}</span>
              <span style="font-size:.6rem;color:#c9a84c">${p.pk_points}pts</span>
            </div>`).join('')}
        </div>

        <!-- Revenue -->
        <div style="padding:10px;border-radius:5px;background:rgba(40,200,40,.05);
          border:1px solid rgba(40,200,40,.15);margin-bottom:12px">
          <div style="font-family:'Cinzel',serif;font-size:.6rem;color:rgba(40,200,40,.6);
            text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px">💰 Revenue</div>
          <div style="display:flex;justify-content:space-between">
            <span style="font-size:.65rem;color:#888">Total Diluluskan</span>
            <span style="font-family:'Share Tech Mono',monospace;font-size:.72rem;color:#40c840">RM ${revenue.toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:4px">
            <span style="font-size:.65rem;color:#888">Pending Kelulusan</span>
            <span style="font-family:'Share Tech Mono',monospace;font-size:.72rem;color:#ffaa00">${pendingT} permintaan</span>
          </div>
        </div>

        <!-- Market -->
        <div style="margin-bottom:10px">
          <div style="font-family:'Cinzel',serif;font-size:.6rem;color:rgba(200,50,50,.6);
            text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px">🏪 Market Board</div>
          <div style="font-size:.65rem;color:#888">${(market.data||[]).length} listing aktif</div>
          ${(market.data||[]).slice(0,5).map(m=>`
            <div style="display:flex;justify-content:space-between;padding:3px 6px;
              border-radius:3px;margin-bottom:2px;background:rgba(0,0,0,.3)">
              <span style="font-size:.62rem;color:#888">${m.item_name||'?'}</span>
              <span style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:#c9a84c">${(m.price||0).toLocaleString()}g</span>
            </div>`).join('')}
        </div>

        <div style="text-align:right;font-size:.55rem;color:#333">
          Dikemas kini: ${new Date().toLocaleTimeString('ms-MY')} · Auto-refresh 30s</div>`;

    } catch(e) {
      body.innerHTML = `<div style="color:#e06060;font-size:.7rem;padding:10px">Ralat: ${e.message}</div>`;
    }
  }

  function _chip(label, val, col) {
    return `<div style="text-align:center;padding:8px 4px;border-radius:5px;
      background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.05)">
      <div style="font-family:'Share Tech Mono',monospace;font-size:.9rem;color:${col}">${val}</div>
      <div style="font-family:'Cinzel',serif;font-size:.5rem;color:#444;text-transform:uppercase;
        letter-spacing:.08em;margin-top:2px">${label}</div>
    </div>`;
  }

  return { openDashboard, closeDashboard };
})();
window.GMAnal = GMAnal;

// ═══════════════════════════════════════════════════════════
// 4. CUSTOM GM SYSTEM
// ═══════════════════════════════════════════════════════════
const GMSystem = (() => {
  let _isGM = false, _gmRole = null;

  async function checkGMStatus() {
    if (!window.SB || window.offlineMode) return false;
    const uid = window.curAccount?.id || (await window.SB.auth.getUser())?.data?.user?.id;
    if (!uid) return false;
    try {
      const { data } = await window.SB.from('kn_gm').select('gm_name,role,is_banned').eq('user_id', uid).maybeSingle();
      if (data && !data.is_banned) {
        _isGM = true; _gmRole = data.role;
        window._isGM = true; window._gmRole = data.role; window._gmName = data.gm_name;
        _injectGMHUD(data.gm_name, data.role);
        console.log(`[GM] ✅ GM aktif: ${data.gm_name} (${data.role})`);
        return true;
      }
    } catch(e) {}
    return false;
  }

  function _injectGMHUD(name, role) {
    const el = document.createElement('div');
    el.id = 'gmBadge';
    el.style.cssText = `position:fixed;top:8px;right:48px;z-index:20;
      background:rgba(200,50,50,.85);border:1px solid rgba(255,80,80,.4);
      border-radius:4px;padding:3px 8px;cursor:pointer;
      font-family:'Cinzel',serif;font-size:.55rem;color:#fff;
      letter-spacing:.1em;text-transform:uppercase`;
    el.textContent = `⚙ GM`;
    el.title = `${name} (${role})`;
    el.onclick = () => openGMPanel();
    document.body.appendChild(el);
  }

  function openGMPanel() {
    let p = document.getElementById('customGMPanel');
    if (!p) { p = _create(); document.body.appendChild(p); }
    p.classList.remove('off');
    _renderGM();
  }
  function closeGMPanel() { document.getElementById('customGMPanel')?.classList.add('off'); }

  function _create() {
    const d = document.createElement('div');
    d.id = 'customGMPanel'; d.className = 'overlay-panel off';
    d.style.zIndex = '160';
    d.innerHTML = `<div class="ov-box" style="border-color:rgba(200,50,50,.3)"><div class="ov-header"
      style="background:rgba(200,50,50,.1)">
      <div class="ov-title" style="color:#e06060">⚙ GM Panel — ${window._gmName||'GM'}</div>
      <div class="ov-close" onclick="GMSystem.closeGMPanel()">✕</div></div>
      <div class="ov-body" id="customGMBody" style="max-height:72vh;overflow-y:auto"></div></div>`;
    return d;
  }

  function _renderGM() {
    const body = document.getElementById('customGMBody'); if (!body) return;
    const isAdmin = _gmRole === 'admin';
    body.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
        <button class="btn" onclick="GMAnal.openDashboard()"
          style="padding:10px;font-size:.65rem;border-color:rgba(200,50,50,.4);color:#e06060;flex-direction:column;height:auto">
          📊 Analytics</button>
        <button class="btn" onclick="GMSystem.openBroadcast()"
          style="padding:10px;font-size:.65rem;border-color:rgba(255,200,50,.4);color:#ffcc44;flex-direction:column;height:auto">
          📢 Broadcast</button>
        <button class="btn" onclick="GMSystem.openPlayerMgmt()"
          style="padding:10px;font-size:.65rem;border-color:rgba(200,50,50,.3);color:#e06060;flex-direction:column;height:auto">
          👥 Urus Pemain</button>
        <button class="btn" onclick="GMSystem.openTopupMgmt()"
          style="padding:10px;font-size:.65rem;border-color:rgba(40,200,40,.4);color:#40c840;flex-direction:column;height:auto">
          💰 Urus Top-up</button>
        ${isAdmin ? `
        <button class="btn" onclick="GMSystem.openCodeGen()"
          style="padding:10px;font-size:.65rem;border-color:rgba(201,168,76,.4);color:#c9a84c;flex-direction:column;height:auto">
          🎫 Jana Kod</button>
        <button class="btn" onclick="GMSystem.openBossTrigger()"
          style="padding:10px;font-size:.65rem;border-color:rgba(200,50,50,.4);color:#e06060;flex-direction:column;height:auto">
          💀 Spawn Boss</button>` : ''}
      </div>
      <!-- Quick Actions -->
      <div style="font-family:'Cinzel',serif;font-size:.6rem;color:rgba(200,50,50,.5);
        text-transform:uppercase;letter-spacing:.12em;margin-bottom:8px">Tindakan Pantas</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;gap:6px">
          <input id="gmTargetInp" class="chat-inp" placeholder="Nama watak..." style="flex:1;font-size:.7rem">
          <input id="gmAmountInp" class="chat-inp" placeholder="Jumlah..." style="width:80px;font-size:.7rem">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
          <button class="btn btn-gold" onclick="GMSystem.giveGold()" style="padding:6px;font-size:.62rem">💰 Beri Gold</button>
          <button class="btn btn-gold" onclick="GMSystem.giveXP()"   style="padding:6px;font-size:.62rem">📈 Beri XP</button>
          <button class="btn btn-gold" onclick="GMSystem.giveItem()" style="padding:6px;font-size:.62rem">📦 Beri Item</button>
          ${isAdmin ? `<button class="btn btn-red" onclick="GMSystem.banPlayer()" style="padding:6px;font-size:.62rem">🚫 Ban</button>` : ''}
        </div>
      </div>
      <div class="status-msg st-info" id="gmActionStatus" style="margin-top:8px;font-size:.62rem"></div>`;
  }

  async function openBroadcast() {
    const msg = prompt('Mesej broadcast kepada semua pemain:');
    if (!msg || !window.SB) return;
    try {
      await window.SB.from('kn_broadcast').insert({ message: msg, type:'gm', sent_by: window._gmName });
      await window.SB.channel('pt_push_events').send({ type:'broadcast', event:'gm_announce', payload:{ msg } });
      window.addChat?.('', `📢 Broadcast dihantar: ${msg}`, 'system');
      _log('broadcast', '-', msg);
    } catch(e) { alert('Ralat: '+e.message); }
  }

  async function openPlayerMgmt() {
    if (!window.SB) return;
    const { data } = await window.SB.from('kn_players').select('char_name,level,faction,gold,banned,current_zone').order('level',{ascending:false}).limit(30);
    const name = prompt('Cari nama pemain (kosong = semua):');
    const list = name ? (data||[]).filter(p=>p.char_name.toLowerCase().includes(name.toLowerCase())) : (data||[]);
    const info = list.map(p=>`${p.char_name} Lv${p.level} ${p.faction} ${p.current_zone} ${p.banned?'[BAN]':''}`).join('\n');
    alert(info || 'Tiada pemain dijumpai');
  }

  async function openTopupMgmt() {
    if (!window.SB) return;
    const { data } = await window.SB.from('kn_topup_requests').select('*').eq('status','pending').order('created_at',{ascending:true}).limit(20);
    if (!data?.length) { alert('Tiada permintaan top-up pending.'); return; }
    const ids = data.map((t,i)=>`${i+1}. ${t.char_name} — RM${t.amount_rm} (${t.ref_no})`).join('\n');
    const choice = prompt(`Permintaan Pending:\n${ids}\n\nMasukkan nombor untuk luluskan (0=batal):`);
    if (!choice || choice==='0') return;
    const idx = parseInt(choice)-1; if (isNaN(idx)||!data[idx]) return;
    const req = data[idx];
    await window.SB.from('kn_topup_requests').update({ status:'approved', approved_by:window._gmName, approved_at:new Date() }).eq('id',req.id);
    await window.SB.from('kn_players').update({ points: window.SB.sql`points + ${req.points_req}` }).eq('char_name', req.char_name);
    _log('topup_approve', req.char_name, `RM${req.amount_rm} → ${req.points_req}pts`);
    alert(`✓ Top-up ${req.char_name} diluluskan!`);
  }

  async function openCodeGen() {
    const pts = prompt('Points untuk kod (contoh: 1000):');
    if (!pts || isNaN(pts)) return;
    const code = 'PT-' + Math.random().toString(36).slice(2,6).toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase();
    if (!window.SB) return;
    await window.SB.from('kn_topup_codes').insert({ code, points:parseInt(pts), created_by:window._gmName });
    _log('create_code', '-', `${code} (${pts}pts)`);
    alert(`Kod berjaya dijana:\n${code}\n${pts} points`);
  }

  async function openBossTrigger() {
    const zones = Object.keys(window.ZONES||{}).join(', ');
    const zone = prompt(`Zone:\n${zones}`);
    if (!zone||!window.ZONES?.[zone]) { alert('Zone tidak sah'); return; }
    const bossList = (window.BOSS_SPAWNS?.[zone]||[]).map(b=>b.label).join(', ')||'boss';
    const boss = prompt(`Boss untuk spawn (${bossList}):`);
    if (!boss) return;
    window.SB?.channel('pt_push_events').send({ type:'broadcast', event:'boss_spawn', payload:{ boss, zone: window.ZONES[zone].name } });
    // Spawn in G
    if (window.G?.state==='play'&&window.G?.currentZone===zone) {
      const z = window.ZONES[zone];
      window.G.enemies?.push(new Enemy(z.spawnX||1200, z.spawnY||1200, boss.toLowerCase().replace(' ','_')));
    }
    _log('spawn_boss', zone, boss);
    window.addChat?.('','💀 Boss dispawn oleh GM!','system');
  }

  async function giveGold() {
    const target = document.getElementById('gmTargetInp')?.value.trim();
    const amount = parseInt(document.getElementById('gmAmountInp')?.value);
    if (!target||!amount||!window.SB) return;
    await window.SB.from('kn_players').update({ gold: window.SB.rpc?.('add_gold',{p:target,g:amount}) || amount }).eq('char_name',target);
    // Use function
    await window.SB.rpc('add_gold_to_player', { p_char_name: target, p_gold: amount });
    _log('give_gold', target, `${amount}g`);
    document.getElementById('gmActionStatus').textContent = `✓ ${amount}g diberikan kepada ${target}`;
    document.getElementById('gmActionStatus').className = 'status-msg st-ok';
  }

  async function giveXP() {
    const target = document.getElementById('gmTargetInp')?.value.trim();
    const amount = parseInt(document.getElementById('gmAmountInp')?.value);
    if (!target||!amount||!window.SB) return;
    await window.SB.from('kn_players').update({ xp: amount }).eq('char_name',target);
    _log('give_xp', target, `${amount}xp`);
    document.getElementById('gmActionStatus').textContent = `✓ ${amount}xp diberikan kepada ${target}`;
    document.getElementById('gmActionStatus').className = 'status-msg st-ok';
  }

  async function giveItem() {
    const target = document.getElementById('gmTargetInp')?.value.trim();
    const itemId = document.getElementById('gmAmountInp')?.value.trim();
    if (!target||!itemId||!window.SB) return;
    const { data } = await window.SB.from('kn_players').select('inventory').eq('char_name',target).maybeSingle();
    if (!data) { document.getElementById('gmActionStatus').textContent='Pemain tidak dijumpai'; return; }
    const inv = data.inventory||{};
    inv[itemId] = (inv[itemId]||0)+1;
    await window.SB.from('kn_players').update({ inventory:inv }).eq('char_name',target);
    _log('give_item', target, itemId);
    document.getElementById('gmActionStatus').textContent = `✓ ${itemId} diberikan kepada ${target}`;
    document.getElementById('gmActionStatus').className = 'status-msg st-ok';
  }

  async function banPlayer() {
    const target = document.getElementById('gmTargetInp')?.value.trim();
    if (!target) return;
    if (!confirm(`BAN ${target}? Mereka tidak akan dapat log masuk.`)) return;
    const reason = prompt('Sebab ban:') || 'Melanggar peraturan';
    if (!window.SB) return;
    await window.SB.from('kn_players').update({ banned:true }).eq('char_name',target);
    await window.SB.from('kn_bans').insert({ char_name:target, reason, banned_by:window._gmName });
    _log('ban', target, reason);
    document.getElementById('gmActionStatus').textContent = `✓ ${target} dibanned`;
    document.getElementById('gmActionStatus').className = 'status-msg st-ok';
  }

  async function _log(action, target, detail) {
    if (!window.SB) return;
    try {
      await window.SB.from('kn_gm_log').insert({ gm_name:window._gmName||'GM', action, target, detail });
    } catch(e) {}
  }

  // Auto-check on load
  window.addEventListener('load', () => {
    const _w = setInterval(async () => {
      if (!window.SB || !window.curAccount) return; clearInterval(_w);
      await checkGMStatus();
    }, 1500);
  });

  return { openGMPanel, closeGMPanel, checkGMStatus, openBroadcast, openPlayerMgmt,
           openTopupMgmt, openCodeGen, openBossTrigger, giveGold, giveXP, giveItem, banPlayer };
})();
window.GMSystem = GMSystem;

// ═══════════════════════════════════════════════════════════
// INJECT — Settings button for Push Notif
// ═══════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  // Add push notif toggle to settings area
  window.addEventListener('load', () => {
    const _w = setInterval(() => {
      const menu = document.getElementById('ingameMenu');
      if (!menu || menu.dataset.techInjected) return;
      clearInterval(_w);
      menu.dataset.techInjected = '1';
      const extra = document.createElement('div');
      extra.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-top:4px';
      extra.innerHTML = `
        <button class="im-btn" onclick="PushNotif.openSettings();closeIngameMenu()">🔔 Notifikasi</button>`;
      menu.appendChild(extra);
    }, 700);
  });
});

// ── GMAnalytics alias (dari extras.js) ───────────────────────────
window.GMAnalytics = window.GMAnal;  // alias supaya kod lain boleh guna

// ── BGM untuk zone baru ───────────────────────────────────────────
(function() {
  const _wait = setInterval(() => {
    if (!window.gotoAndPlay) return;
    clearInterval(_wait);
    const _orig = window.gotoAndPlay;
    window.gotoAndPlay = function(zoneId) {
      _orig(zoneId);
      const MAP = { bifrost:'ardream', forgotten_temple:'dungeon', eslant:'luferson' };
      if (MAP[zoneId] && typeof Audio !== 'undefined') {
        setTimeout(() => Audio.playZoneMusic(MAP[zoneId]), 300);
      }
    };
  }, 400);
})();

// ── Party XP Share ────────────────────────────────────────────────
(function() {
  const _wait = setInterval(() => {
    if (!window.G?.tick || !window.myParty) return;
    clearInterval(_wait);
    const _orig = window.G.tick.bind(window.G);
    window.G.tick = function(dt) {
      _orig(dt);
      if (this.state !== 'play' || !window.myParty?.members?.length) return;
      this.enemies?.forEach(e => {
        if (e.dead && e.rewarded && !e._partyShared) {
          e._partyShared = true;
          const shareXP = Math.floor((e.rew?.xp || 0) * 0.6);
          if (window.rtCh && window.selChar) {
            window.rtCh.send({ type:'broadcast', event:'party_xp',
              payload:{ xp:shareXP, from:window.selChar.char_name }});
          }
        }
      });
    };
  }, 800);
})();
