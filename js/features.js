'use strict';
/* ══════════════════════════════════════════════════════════════
   Pahlawan Terakhir — features.js  (patch file)
   1. Zone Baru: Bifrost, Forgotten Temple, Eslant
   2. PvP Realtime CZ (Supabase Broadcast)
   3. NPC Shop lengkap (semua NPC, semua tab)
   4. Inventory & Equipment visual upgrade
   ══════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════
// 1. ZONE BARU
// ═══════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', function() {

  // ── BIFROST ────────────────────────────────────────
  if (window.ZONES) {
    window.ZONES['bifrost'] = {
      name: 'Bifrost',
      icon: '🌈',
      type: 'event',
      safe: false,
      pvp: false,
      reqLv: 30,
      desc: 'Dunia peralihan antara alam. Event respawn setiap 2 jam. Musuh kuat, ganjaran istimewa!',
      bgColor: ['#08050f', '#0c0818'],
      torchColor: 'rgba(120,40,255,.14)',
      monsters: ['lycaon', 'harpy', 'apostles', 'deruvish', 'ash_knight', 'doom_soldier'],
      spawnX: 1500, spawnY: 1500,
      special: 'bifrost_event',   // trigger event mode
    };

    // ── FORGOTTEN TEMPLE ───────────────────────────
    window.ZONES['forgotten_temple'] = {
      name: 'Forgotten Temple',
      icon: '🏛️',
      type: 'dungeon',
      safe: false,
      pvp: false,
      reqLv: 50,
      desc: 'Kuil tua penuh makhluk purba. Hanya pahlawan veteran boleh bertahan!',
      bgColor: ['#070508', '#0a0608'],
      torchColor: 'rgba(200,50,50,.1)',
      monsters: ['apostles', 'death_knight', 'atross', 'riote'],
      spawnX: 1200, spawnY: 1200,
      waves: 15,
      bossType: 'isiloon',
    };

    // ── ESLANT ─────────────────────────────────────
    window.ZONES['eslant'] = {
      name: 'Eslant',
      icon: '🏔️',
      type: 'field',
      safe: false,
      pvp: false,
      reqLv: 60,
      desc: 'Tanah tinggi Eslant. Lokasi leveling terbaik untuk pahlawan level tinggi.',
      bgColor: ['#050a0a', '#060c0c'],
      torchColor: 'rgba(40,200,200,.1)',
      monsters: ['death_knight', 'atross', 'riote', 'bone_dragon'],
      spawnX: 1000, spawnY: 1000,
    };

    console.log('[Features] ✓ 3 zone baru ditambah: Bifrost, Forgotten Temple, Eslant');
  }

  // ── GATES for new zones ─────────────────────────
  window.addEventListener('load', function() {
    if (!window.GATES) return;

    GATES['bifrost'] = [
      { id:'gate_bifrost_moradon', name:'🏙️ Kembali Moradon', to:'moradon', x:1200, y:600, icon:'🚪', color:'#888' },
      { id:'gate_bifrost_cz',      name:'🏰 Colony Zone',     to:'cz',      x:1400, y:800, icon:'🏰', color:'#ff8800' },
    ];
    GATES['forgotten_temple'] = [
      { id:'gate_ft_ronark',       name:'↩ Kembali Ronark',   to:'ronark',         x:1200, y:600, icon:'🚪', color:'#888' },
      { id:'gate_ft_eslant',       name:'🏔️ Pergi Eslant',    to:'eslant',         x:900,  y:900, icon:'🏔️', color:'#40c8c8', reqLv:60 },
    ];
    GATES['eslant'] = [
      { id:'gate_eslant_moradon',  name:'🏙️ Kembali Moradon', to:'moradon',        x:1200, y:600, icon:'🚪', color:'#888' },
      { id:'gate_eslant_cz',       name:'🏰 Colony Zone',     to:'cz',             x:1400, y:800, icon:'🏰', color:'#ff8800', reqLv:60 },
    ];
    console.log('[Features] ✓ Gates for new zones registered');
  });

  // ── BOSS SPAWNS for new zones ───────────────────
  if (window.BOSS_SPAWNS) {
    window.BOSS_SPAWNS['bifrost'] = [
      { type:'isiloon',    x:1500, y:1500, spawnEvery:240, timer:120, active:false, label:'👑 Isiloon' },
    ];
    window.BOSS_SPAWNS['forgotten_temple'] = [
      { type:'bone_dragon',x:1200, y:1200, spawnEvery:999, timer:999, active:false, label:'🐲 Bone Dragon' },
    ];
    window.BOSS_SPAWNS['eslant'] = [
      { type:'felankor',   x:1000, y:1000, spawnEvery:300, timer:180, active:false, label:'🐉 Felankor' },
    ];
  }

  // ── Add to dungeon list ─────────────────────────
  const dungeonData = {
    forgotten_temple: {
      id: 'forgotten_temple',
      bossType: 'bone_dragon',
      totalWaves: 15,
      rewards: { xp: 15000, gold: 5000, item: 'star_stone' }
    }
  };
  window.DUNGEON_DATA = Object.assign(window.DUNGEON_DATA || {}, dungeonData);

});

// ═══════════════════════════════════════════════════
// 2. PVP REALTIME CZ — Supabase Broadcast
// ═══════════════════════════════════════════════════

const CZPvP = (() => {
  let pvpCh   = null;     // Supabase broadcast channel for CZ
  let players = {};       // uid → { x, y, name, faction, hp, maxHp, lv, job }
  let myKills = 0, myDeaths = 0;
  let enabled = false;
  const HIT_RANGE = 75;   // pixel range to register PvP hit
  const REVIVE_SECS = 8;  // seconds before revive after PvP death
  let pvpDead  = false;
  let pvpReviveTimer = 0;

  // ── Init ─────────────────────────────────────────
  function init() {
    if (!window.SB || window.offlineMode) return;
    if (pvpCh) pvpCh.unsubscribe();

    pvpCh = window.SB.channel('pt_cz_pvp', {
      config: { broadcast: { self: false }, presence: { key: window.selChar?.id || 'x' } }
    });

    pvpCh
      .on('broadcast', { event: 'pos' }, ({ payload }) => {
        if (!payload?.uid) return;
        players[payload.uid] = payload;
        _updPvPHUD();
      })
      .on('broadcast', { event: 'hit' }, ({ payload }) => {
        _onHitReceived(payload);
      })
      .on('broadcast', { event: 'kill' }, ({ payload }) => {
        _onKillNotify(payload);
      })
      .on('broadcast', { event: 'leave' }, ({ payload }) => {
        if (payload?.uid) { delete players[payload.uid]; _updPvPHUD(); }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = pvpCh.presenceState();
        const cnt = Object.keys(state).length;
        const el = document.getElementById('pvpPlayerCount');
        if (el) el.textContent = cnt + ' dalam CZ';
      })
      .subscribe(async s => {
        if (s === 'SUBSCRIBED') {
          await pvpCh.track({
            uid: window.selChar?.id,
            name: window.selChar?.char_name,
            faction: window.selChar?.faction,
          });
        }
      });

    enabled = true;
    console.log('[PvP] ✓ CZ realtime channel active');
  }

  // ── Broadcast player position every tick ────────
  let _bcastTimer = 0;
  function tick(dt) {
    if (!enabled || !pvpCh || !window.G?.pl) return;
    _bcastTimer += dt;
    if (_bcastTimer < 0.12) return;
    _bcastTimer = 0;

    const p = window.G.pl;
    const ch = window.selChar;
    pvpCh.send({
      type: 'broadcast', event: 'pos',
      payload: {
        uid: ch?.id, name: ch?.char_name, faction: ch?.faction,
        job: ch?.job, lv: ch?.level,
        x: Math.round(p.x), y: Math.round(p.y),
        hp: Math.round(p.hp), maxHp: Math.round(p.maxHp),
      }
    });

    // ── Check PvP hits on enemy faction ──────────
    if (window.G?.state !== 'play') return;
    if (pvpDead) { pvpReviveTimer -= dt; if (pvpReviveTimer <= 0) _revive(); return; }

    const myFac = ch?.faction;
    for (const [uid, op] of Object.entries(players)) {
      if (op.faction === myFac) continue; // same faction — skip
      const dist = Math.hypot(p.x - op.x, p.y - op.y);
      if (dist < HIT_RANGE && (window.atkTap || window.atkDown) && p.acd <= 0.01) {
        const dmg = Math.floor(p.atk * 0.7 + Math.random() * 12);
        pvpCh.send({
          type: 'broadcast', event: 'hit',
          payload: { target: uid, attacker: ch?.id, attackerName: ch?.char_name, dmg, faction: myFac }
        });
      }
    }
  }

  // ── Receive hit ──────────────────────────────────
  function _onHitReceived(payload) {
    const ch = window.selChar;
    if (!ch || payload.target !== ch.id) return;
    const p = window.G?.pl;
    if (!p || pvpDead) return;

    p.hp = Math.max(0, p.hp - payload.dmg);
    if (typeof window.hitPts === 'function') window.hitPts(p.x, p.y, '#ff2244');
    if (typeof window.G?.fts !== 'undefined')
      window.G.fts.push({ x: p.x, y: p.y - 20, txt: `⚔ -${payload.dmg}`, col: '#ff4466', sz: 14, life: 1.1, ml: 1.1, vy: -52, tick(dt){this.y+=this.vy*dt;this.vy*=.94;this.life-=dt}, draw(){ const a=this.life/this.ml; const cx=window.cx; if(!cx)return; cx.save();cx.globalAlpha=a;cx.font=`bold ${this.sz}px "Share Tech Mono",monospace`;cx.fillStyle=this.col;cx.textAlign='center';cx.shadowColor=this.col;cx.shadowBlur=6;cx.fillText(this.txt,this.x,this.y);cx.restore(); }, get dead(){return this.life<=0} });

    if (typeof window.addChat === 'function')
      window.addChat('', `⚔ ${payload.attackerName} menyerang anda! -${payload.dmg} HP`, 'pvp');

    if (p.hp <= 0) {
      pvpDead = true;
      pvpReviveTimer = REVIVE_SECS;
      myDeaths++;
      // Notify killer
      pvpCh.send({
        type: 'broadcast', event: 'kill',
        payload: { killer: payload.attacker, killerName: payload.attackerName, victim: ch.id, victimName: ch.char_name }
      });
      _showPvPDead();
    }
  }

  // ── Kill notify ──────────────────────────────────
  function _onKillNotify(payload) {
    const ch = window.selChar;
    if (!ch) return;
    if (payload.killer === ch.id) {
      myKills++;
      if (typeof window.addChat === 'function')
        window.addChat('', `🏆 Kamu menewaskan ${payload.victimName}! (+1 kill)`, 'pvp');
      // Award kill bonus
      if (window.selChar) {
        window.selChar.gold = (window.selChar.gold || 0) + 150;
        window.selChar.xp   = (window.selChar.xp || 0) + 200;
      }
    } else if (payload.victim === ch.id) {
      if (typeof window.addChat === 'function')
        window.addChat('', `💀 Kamu ditewaskan oleh ${payload.killerName}!`, 'pvp');
    } else {
      if (typeof window.addChat === 'function')
        window.addChat('', `⚔ ${payload.killerName} ► ${payload.victimName}`, 'pvp');
    }
    _updPvPHUD();
  }

  // ── Dead UI ──────────────────────────────────────
  function _showPvPDead() {
    const el = document.getElementById('pvpDeadOverlay');
    if (el) { el.classList.remove('off'); el.querySelector('.pvp-revive-timer').textContent = Math.ceil(pvpReviveTimer) + 's'; }
    const iv = setInterval(() => {
      pvpReviveTimer -= 0.5;
      const te = document.querySelector('.pvp-revive-timer');
      if (te) te.textContent = Math.ceil(Math.max(0, pvpReviveTimer)) + 's';
      if (pvpReviveTimer <= 0) clearInterval(iv);
    }, 500);
  }

  function _revive() {
    pvpDead = false;
    const p = window.G?.pl;
    if (p) { p.hp = p.maxHp * 0.5; p.inv = 3; }
    const el = document.getElementById('pvpDeadOverlay');
    if (el) el.classList.add('off');
    if (typeof window.addChat === 'function')
      window.addChat('', '✨ Kamu bangkit semula! (50% HP)', 'system');
  }

  // ── HUD update ───────────────────────────────────
  function _updPvPHUD() {
    const hud = document.getElementById('pvpHUD');
    if (!hud) return;
    const myFac = window.selChar?.faction;
    const enemies = Object.values(players).filter(p => p.faction !== myFac);
    const allies  = Object.values(players).filter(p => p.faction === myFac);
    hud.style.display = 'flex';
    hud.innerHTML = `
      <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;line-height:1.6">
        <div style="color:#ffcc44">⚔ K:${myKills} / D:${myDeaths}</div>
        <div style="color:#44ff44">👥 Sekutu: ${allies.length}</div>
        <div style="color:#ff4444">⚡ Musuh: ${enemies.length}</div>
      </div>`;
  }

  // ── Draw enemy players on canvas ─────────────────
  function draw() {
    if (!enabled || !window.cx || !window.cam) return;
    const cx = window.cx, cam = window.cam;
    const myFac = window.selChar?.faction;
    for (const op of Object.values(players)) {
      const sx = op.x - cam.x, sy = op.y - cam.y;
      if (sx < -80 || sx > window.innerWidth + 80 || sy < -80 || sy > window.innerHeight + 80) continue;
      const isEnemy = op.faction !== myFac;
      const col = isEnemy ? '#ff4444' : '#44ff44';

      cx.save();
      cx.translate(sx, sy);
      // Shadow
      cx.fillStyle = 'rgba(0,0,0,.3)';
      cx.beginPath(); cx.ellipse(0, 18, 12, 5, 0, 0, Math.PI * 2); cx.fill();
      // Body
      cx.fillStyle = isEnemy ? '#8a1010' : '#10508a';
      if (typeof cx.roundRect === 'function') { cx.beginPath(); cx.roundRect(-9,-11,18,21,3); cx.fill(); }
      else { cx.fillRect(-9,-11,18,21); }
      // Head
      cx.fillStyle = isEnemy ? '#a01818' : '#1860a0';
      cx.beginPath(); cx.arc(0, -16, 9, 0, Math.PI * 2); cx.fill();
      // Visor
      cx.fillStyle = isEnemy ? 'rgba(255,80,80,.7)' : 'rgba(80,180,255,.7)';
      cx.fillRect(-5, -19, 10, 4);
      // HP bar
      if (op.hp !== undefined && op.maxHp) {
        const bw = 32, bh = 4, bx = -bw/2, by = -28;
        cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(bx-1, by-1, bw+2, bh+2);
        const r = Math.max(0, op.hp / op.maxHp);
        cx.fillStyle = r > 0.5 ? '#44cc44' : r > 0.25 ? '#ffaa00' : '#ff3333';
        cx.fillRect(bx, by, bw * r, bh);
      }
      cx.restore();

      // Name + PvP tag
      cx.font = 'bold 9px "Share Tech Mono",monospace';
      cx.textAlign = 'center';
      cx.fillStyle = isEnemy ? '#ff6666' : '#66ff66';
      cx.fillText((isEnemy ? '⚔ ' : '👥 ') + (op.name || '?'), sx, sy - 32);
    }
  }

  // ── Disconnect ───────────────────────────────────
  function disconnect() {
    if (!pvpCh) return;
    pvpCh.send({ type: 'broadcast', event: 'leave', payload: { uid: window.selChar?.id } });
    pvpCh.unsubscribe();
    pvpCh = null;
    players = {};
    enabled = false;
    const hud = document.getElementById('pvpHUD');
    if (hud) hud.style.display = 'none';
  }

  return { init, tick, draw, disconnect, get players() { return players; }, get enabled() { return enabled; } };
})();

window.CZPvP = CZPvP;

// ── Hook PvP into game loop ──────────────────────────
window.addEventListener('load', function() {
  // Patch G.tick to include PVP tick
  const _waitForG = setInterval(() => {
    if (!window.G) return;
    clearInterval(_waitForG);

    const _origTick = window.G.tick.bind(window.G);
    const _origDraw = window.G.draw.bind(window.G);

    window.G.tick = function(dt) {
      _origTick(dt);
      if (this.state === 'play' && this.currentZone === 'cz') {
        CZPvP.tick(dt);
      }
    };

    window.G.draw = function() {
      _origDraw();
      if (this.state === 'play' && this.currentZone === 'cz') {
        const cx = window.cx, cam = window.cam;
        if (cx && cam) {
          cx.save(); cx.translate(-cam.x, -cam.y);
          CZPvP.draw();
          cx.restore();
        }
      }
    };

    console.log('[PvP] ✓ Hooked into window.G.tick / window.G.draw');
  }, 200);

  // Auto-init PvP when entering CZ
  const _waitInitRT = setInterval(() => {
    if (!window.initRT) return;
    clearInterval(_waitInitRT);
    const _origInitRT = window.initRT;
    window.initRT = function() {
      _origInitRT();
      if (window.G?.currentZone === 'cz') CZPvP.init();
      else CZPvP.disconnect();
    };
  }, 200);
});

// ═══════════════════════════════════════════════════
// 3. NPC SHOP LENGKAP
// ═══════════════════════════════════════════════════

const NpcShop = (() => {

  // ── Shop catalogs ────────────────────────────────
  const CATALOGS = {
    general: {
      name: 'Kedai Umum',
      tabs: {
        'Potion': ['hpot_sm','hpot_md','hpot_lg','mpot_sm','mpot_md','antidote','town_scroll','tp_scroll'],
        'Bahan' : ['luna_stone','wraith_stone','monsters_bead','iron_ore','magic_dust'],
      }
    },
    elmorad: {
      name: 'Kedai El Morad',
      tabs: {
        'Senjata'  : ['sword_iron','sword_steel','dagger_basic','dagger_dark','staff_oak','staff_magic'],
        'Armor'    : ['helm_iron','armor_leather','armor_chain','glove_leather','boot_cloth','robe_silk'],
        'Aksesori' : ['ring_iron','ring_gold','amulet_jade','earring_el'],
        'Potion'   : ['hpot_sm','hpot_md','mpot_sm','mpot_md','town_scroll'],
      }
    },
    karus: {
      name: 'Kedai Karus',
      tabs: {
        'Senjata'  : ['sword_iron','sword_steel','dagger_basic','dagger_dark','staff_oak','staff_magic'],
        'Armor'    : ['helm_iron','armor_leather','armor_chain','glove_leather','boot_cloth','robe_silk'],
        'Aksesori' : ['ring_iron','ring_gold','amulet_jade','earring_kr'],
        'Potion'   : ['hpot_sm','hpot_md','mpot_sm','mpot_md','town_scroll'],
      }
    },
    enhance: {
      name: 'Kedai Naik Taraf',
      tabs: {
        'Batu Naik Taraf': ['chaos_stone','luna_stone','star_stone','wraith_stone'],
        'Kristal'        : ['crystal_pure','magic_dust','iron_ore'],
      }
    },
    cz_reward: {
      name: 'Kedai Ganjaran CZ',
      tabs: {
        'Senjata Rare' : ['sword_knight','dagger_shadow','staff_divine','staff_chaos','bow_shadow'],
        'Armor Rare'   : ['armor_plate','armor_dark_knight','helm_dark_knight','robe_arcane','robe_inferno'],
        'Aksesori Rare': ['ring_ruby','ring_fire','amulet_power','amulet_dragon'],
        'Elixir'       : ['elixir_power','elixir_speed','elixir_guard','revive_stone','hpot_xl'],
      }
    },
    bifrost: {
      name: 'Kedai Bifrost',
      tabs: {
        'Item Event'   : ['elixir_power','elixir_speed','elixir_guard','hpot_xl','mpot_lg','revive_stone'],
        'Bahan Epic'   : ['crystal_pure','magic_dust','dragon_scale'],
      }
    },
    eslant: {
      name: 'Kedai Eslant',
      tabs: {
        'Senjata Veteran': ['sword_knight','dagger_shadow','staff_divine','staff_chaos'],
        'Armor Veteran'  : ['armor_plate','robe_arcane','helm_knight','glove_fighter','boot_speed'],
        'Potion'         : ['hpot_lg','hpot_xl','mpot_md','mpot_lg'],
      }
    }
  };

  let _curShop = null, _curTab = null, _curSellItem = null;

  // ── Open shop ────────────────────────────────────
  function open(shopId, npcName) {
    const cat = CATALOGS[shopId];
    if (!cat) { if(window.addChat) window.addChat('','Kedai tidak tersedia.','system'); return; }
    _curShop = shopId;
    const tabs = Object.keys(cat.tabs);
    _curTab = tabs[0];

    const panel = document.getElementById('npcShopPanel');
    if (!panel) { _createShopPanel(); }

    document.getElementById('npcShopTitle').textContent = (npcName ? npcName + ' — ' : '') + cat.name;
    _renderTabs(tabs);
    _renderItems();
    document.getElementById('npcShopPanel').classList.remove('off');
  }

  function close() {
    document.getElementById('npcShopPanel')?.classList.add('off');
  }

  // ── Create panel DOM if missing ──────────────────
  function _createShopPanel() {
    const div = document.createElement('div');
    div.id = 'npcShopPanel';
    div.className = 'overlay-panel off';
    div.innerHTML = `
      <div class="ov-box" style="max-width:420px">
        <div class="ov-header">
          <div class="ov-title" id="npcShopTitle">🏪 Kedai</div>
          <div class="ov-close" onclick="NpcShop.close()">✕</div>
        </div>
        <div class="ov-body">
          <div style="margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">
            <div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;color:#c9a84c">
              💰 Gold: <span id="shopGoldDisplay">0</span>
            </div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--muted)" id="shopCartInfo"></div>
          </div>
          <div class="ov-tabs" id="shopTabs" style="margin-bottom:8px;flex-wrap:wrap;gap:4px"></div>
          <div id="shopBody" style="max-height:52vh;overflow-y:auto"></div>
          <div class="status-msg" id="shopStatus" style="margin-top:6px"></div>
        </div>
      </div>`;
    document.body.appendChild(div);
  }

  function _renderTabs(tabs) {
    const tc = document.getElementById('shopTabs');
    if (!tc) return;
    tc.innerHTML = tabs.map(t =>
      `<div class="ov-tab${t===_curTab?' active':''}" onclick="NpcShop.switchTab('${t}')">${t}</div>`
    ).join('');
  }

  function _renderItems() {
    const cat = CATALOGS[_curShop];
    if (!cat) return;
    const items = cat.tabs[_curTab] || [];
    const body = document.getElementById('shopBody');
    if (!body) return;

    const gold = window.selChar?.gold || 0;
    const goldEl = document.getElementById('shopGoldDisplay');
    if (goldEl) goldEl.textContent = gold.toLocaleString();

    const window.ITEM_DB = window.ITEM_DB || {};
    const RARITY = { common:'#aaa', uncommon:'#4af', rare:'#fa0', epic:'#c4f', legendary:'#f84', mythic:'#f4f' };

    body.innerHTML = items.map(iid => {
      const item = window.ITEM_DB[iid];
      if (!item) return '';
      const canAfford = gold >= (item.price || 0);
      const col = RARITY[item.rarity] || '#aaa';
      let statLine = '';
      if (item.atk)  statLine += `ATK+${item.atk} `;
      if (item.def)  statLine += `DEF+${item.def} `;
      if (item.int)  statLine += `INT+${item.int} `;
      if (item.hp)   statLine += `HP+${item.hp} `;
      if (item.mp)   statLine += `MP+${item.mp} `;
      if (item.heal) statLine += `Sembuh ${item.heal}HP `;
      if (item.mana) statLine += `MP+${item.mana} `;
      return `
        <div class="shop-item-row" style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:5px;border:1px solid rgba(255,255,255,.06);margin-bottom:5px;background:rgba(0,0,0,.3);${!canAfford&&item.price?'opacity:.55':''}">
          <div style="font-size:1.6rem;flex-shrink:0">${item.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Cinzel',serif;font-size:.72rem;color:${col}">${item.name}</div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--muted)">${statLine||item.desc||''}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:#c9a84c">${item.price?item.price.toLocaleString()+'g':'TIDAK DIJUAL'}</div>
            ${item.price ? `<button onclick="NpcShop.buy('${iid}')" class="btn btn-gold" style="margin-top:3px;padding:3px 10px;font-size:.58rem;${!canAfford?'opacity:.4;pointer-events:none':''}">Beli</button>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  function switchTab(tab) {
    _curTab = tab;
    const cat = CATALOGS[_curShop];
    if (cat) _renderTabs(Object.keys(cat.tabs));
    _renderItems();
  }

  // ── Buy item ─────────────────────────────────────
  function buy(iid) {
    const item = window.ITEM_DB?.[iid];
    if (!item || !window.selChar) return;
    const ch = window.selChar;

    if (!item.price || item.price <= 0) { _setStatus('Item ini tidak dijual!', 'err'); return; }
    if ((ch.gold || 0) < item.price) { _setStatus('Gold tidak mencukupi!', 'err'); return; }

    // Deduct gold
    ch.gold -= item.price;
    document.getElementById('shopGoldDisplay').textContent = ch.gold.toLocaleString();

    // Add to inventory
    if (!ch.inventory) ch.inventory = {};
    if (item.stack && (ch.inventory[iid] || 0) >= (item.stack || 1)) {
      ch.gold += item.price; // refund
      _setStatus(`${item.name} sudah penuh (max ${item.stack})!`, 'err');
      return;
    }
    ch.inventory[iid] = (ch.inventory[iid] || 0) + 1;

    _setStatus(`✓ Beli ${item.icon} ${item.name} (-${item.price}g)`, 'ok');
    if (typeof window.Audio !== 'undefined') Audio.playSFX?.('buy');
    if (typeof window.addChat === 'function') window.addChat('', `🛒 Beli ${item.name}`, 'system');
    _renderItems();
    window.saveProgress?.();
  }

  function _setStatus(msg, type) {
    const el = document.getElementById('shopStatus');
    if (!el) return;
    el.textContent = msg;
    el.className = 'status-msg ' + (type === 'err' ? 'st-err' : 'st-ok');
    setTimeout(() => { if (el) el.textContent = ''; }, 2500);
  }

  return { open, close, buy, switchTab };
})();

window.NpcShop = NpcShop;

// ── Patch NPC interaction to open NpcShop ───────────
window.addEventListener('load', function() {
  const _waitUI = setInterval(() => {
    if (!window.interactNPC) return;
    clearInterval(_waitUI);

    const _origInteract = window.interactNPC;
    window.interactNPC = function(npc) {
      // If NPC has a shop, open NpcShop
      if (npc.shop && NpcShop) {
        NpcShop.open(npc.shop, npc.name);
        return;
      }
      _origInteract(npc);
    };
    console.log('[NpcShop] ✓ NPC interaction patched');
  }, 300);
});

// ═══════════════════════════════════════════════════
// 4. INVENTORY & EQUIPMENT VISUAL UPGRADE
// ═══════════════════════════════════════════════════

const InvVisual = (() => {

  const RARITY_GLOW = {
    common: 'none',
    uncommon: '0 0 8px rgba(68,170,255,.5)',
    rare: '0 0 10px rgba(255,170,0,.55)',
    epic: '0 0 12px rgba(200,80,255,.55)',
    legendary: '0 0 16px rgba(255,130,40,.65)',
    mythic: '0 0 20px rgba(255,60,255,.7)',
  };
  const RARITY_BG = {
    common: 'rgba(255,255,255,.04)',
    uncommon: 'rgba(68,170,255,.08)',
    rare: 'rgba(255,170,0,.1)',
    epic: 'rgba(200,80,255,.12)',
    legendary: 'rgba(255,130,40,.14)',
    mythic: 'rgba(255,60,255,.16)',
  };
  const RARITY_BORDER = {
    common: 'rgba(255,255,255,.1)',
    uncommon: 'rgba(68,170,255,.35)',
    rare: 'rgba(255,170,0,.45)',
    epic: 'rgba(200,80,255,.5)',
    legendary: 'rgba(255,130,40,.6)',
    mythic: 'rgba(255,60,255,.65)',
  };

  // ── Full equipment panel with character silhouette ─
  function renderEquipFull() {
    const ch = window.selChar;
    if (!ch) return;
    const eq = ch.equipment || {};
    const window.ITEM_DB = window.ITEM_DB || {};

    const slots = [
      { key:'helmet', label:'Topi',         icon:'⛑️', pos:'top-center'    },
      { key:'weapon', label:'Senjata',       icon:'⚔️', pos:'mid-left'      },
      { key:'armor',  label:'Baju',          icon:'🛡️', pos:'mid-center'    },
      { key:'gloves', label:'Sarung Tangan', icon:'🧤', pos:'mid-right'     },
      { key:'ring1',  label:'Cincin 1',      icon:'💍', pos:'bot-left'      },
      { key:'boots',  label:'Kasut',         icon:'👟', pos:'bot-center'    },
      { key:'ring2',  label:'Cincin 2',      icon:'💍', pos:'bot-right'     },
      { key:'amulet', label:'Amulet',        icon:'📿', pos:'acc-left'      },
      { key:'earring',label:'Anting',        icon:'✨', pos:'acc-right'     },
    ];

    // Compute total stats from equipment
    let totalAtk=0, totalDef=0, totalHp=0, totalMp=0, totalInt=0;
    for (const [slot, iid] of Object.entries(eq)) {
      const it = window.ITEM_DB[iid]; if (!it) continue;
      const enh = it.enh || 0;
      if (it.atk) totalAtk += it.atk + enh * Math.floor(it.atk * .08);
      if (it.def) totalDef += it.def + enh * Math.floor(it.def * .08);
      if (it.int) totalInt += it.int + enh * Math.floor(it.int * .08);
      if (it.hp)  totalHp  += it.hp;
      if (it.mp)  totalMp  += it.mp;
    }

    // Build equipment grid HTML
    function slotHTML(s) {
      const iid = eq[s.key];
      const item = iid ? window.ITEM_DB[iid] : null;
      const enh  = item?.enh || 0;
      const rar  = item?.rarity || 'common';
      const glow = item ? (RARITY_GLOW[rar] || 'none') : 'none';
      const bg   = item ? (RARITY_BG[rar]   || 'transparent') : 'rgba(0,0,0,.3)';
      const bord = item ? (RARITY_BORDER[rar]|| 'rgba(255,255,255,.1)') : 'rgba(255,255,255,.07)';
      return `
        <div class="eq-slot-v2" data-slot="${s.key}"
          style="box-shadow:${glow};background:${bg};border:1px solid ${bord}"
          onclick="InvVisual.selectSlot('${s.key}')"
          title="${s.label}: ${item ? item.name : 'Kosong'}">
          <div class="eq-slot-icon">${item ? item.icon : s.icon}</div>
          <div class="eq-slot-label">${s.label}</div>
          ${item ? `<div class="eq-slot-name rarity-${rar}">${item.name.slice(0,10)}${enh > 0 ? ' <span class="eq-enh">+'+enh+'</span>' : ''}</div>` : '<div class="eq-slot-name" style="color:var(--muted)">—</div>'}
        </div>`;
    }

    const window.JOBS = window.JOBS || {};
    const jObj = window.JOBS[ch.job] || {};
    const FACES = window.FACE_ICONS || {};
    const faceArr = FACES[ch.faction] || ['⚔️'];
    const faceIcon = faceArr[ch.face_idx % faceArr.length] || '⚔️';

    const html = `
      <style>
        .eq-grid-v2{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px}
        .eq-slot-v2{border-radius:6px;padding:7px 5px;text-align:center;cursor:pointer;transition:all .18s;min-height:62px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
        .eq-slot-v2:hover{transform:translateY(-2px);filter:brightness(1.18)}
        .eq-slot-icon{font-size:1.4rem;line-height:1}
        .eq-slot-label{font-family:'Cinzel',serif;font-size:.52rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase}
        .eq-slot-name{font-family:'Share Tech Mono',monospace;font-size:.58rem;line-height:1.2}
        .eq-enh{color:#ffcc44;font-weight:700}
        .eq-char-card{background:rgba(0,0,0,.45);border:1px solid rgba(201,168,76,.15);border-radius:8px;padding:12px;text-align:center;margin-bottom:8px}
        .eq-char-avatar{font-size:2.8rem;line-height:1;margin-bottom:4px}
        .eq-char-name{font-family:'Cinzel Decorative',serif;font-size:.82rem;color:#c9a84c}
        .eq-char-sub{font-family:'Cinzel',serif;font-size:.6rem;color:var(--muted);margin-top:2px}
        .eq-stat-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:8px}
        .eq-stat-chip{background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.06);border-radius:4px;padding:4px 2px;text-align:center}
        .eq-stat-val{font-family:'Share Tech Mono',monospace;font-size:.72rem;color:#c9a84c}
        .eq-stat-lbl{font-family:'Cinzel',serif;font-size:.5rem;color:var(--muted);text-transform:uppercase;letter-spacing:.07em}
        .eq-action-bar{display:flex;gap:5px;margin-top:8px}
        .rarity-common{color:#aaa}
        .rarity-uncommon{color:#4af}
        .rarity-rare{color:#fa0}
        .rarity-epic{color:#c4f}
        .rarity-legendary{color:#f84}
        .rarity-mythic{color:#f4f}
        .eq-detail-box{background:rgba(0,0,0,.45);border:1px solid rgba(201,168,76,.12);border-radius:6px;padding:10px;margin-top:8px;min-height:60px}
      </style>

      <div class="eq-char-card">
        <div class="eq-char-avatar">${faceIcon}</div>
        <div class="eq-char-name">${ch.char_name}</div>
        <div class="eq-char-sub">Lv.${ch.level} ${jObj.name || ch.job} · ${ch.faction==='elmorad'||ch.faction==='cahaya'?'🌟 El Morad':'🔥 Karus'}</div>
        <div class="eq-stat-grid">
          <div class="eq-stat-chip"><div class="eq-stat-val">${ch.stat_str||70}</div><div class="eq-stat-lbl">STR</div></div>
          <div class="eq-stat-chip"><div class="eq-stat-val">${ch.stat_hp||70}</div><div class="eq-stat-lbl">VIT</div></div>
          <div class="eq-stat-chip"><div class="eq-stat-val">${ch.stat_dex||65}</div><div class="eq-stat-lbl">DEX</div></div>
          <div class="eq-stat-chip"><div class="eq-stat-val">+${totalAtk}</div><div class="eq-stat-lbl">ATK</div></div>
          <div class="eq-stat-chip"><div class="eq-stat-val">+${totalDef}</div><div class="eq-stat-lbl">DEF</div></div>
          <div class="eq-stat-chip"><div class="eq-stat-val">+${totalInt}</div><div class="eq-stat-lbl">INT</div></div>
        </div>
      </div>

      <div class="eq-grid-v2">
        ${slotHTML({ key:'helmet', label:'Topi',   icon:'⛑️' })}
        ${slotHTML({ key:'armor',  label:'Baju',   icon:'🛡️' })}
        ${slotHTML({ key:'gloves', label:'Sarung', icon:'🧤' })}
        ${slotHTML({ key:'weapon', label:'Senjata',icon:'⚔️' })}
        ${slotHTML({ key:'ring1',  label:'Cincin1',icon:'💍' })}
        ${slotHTML({ key:'ring2',  label:'Cincin2',icon:'💍' })}
        ${slotHTML({ key:'boots',  label:'Kasut',  icon:'👟' })}
        ${slotHTML({ key:'amulet', label:'Amulet', icon:'📿' })}
        ${slotHTML({ key:'earring',label:'Anting', icon:'✨' })}
      </div>

      <div class="eq-detail-box" id="eqDetailBox">
        <div style="color:var(--muted);font-size:.65rem;text-align:center">Klik slot untuk lihat item</div>
      </div>`;

    const body = document.getElementById('invBody');
    if (body) body.innerHTML = html;
  }

  // ── Select slot to show detail ───────────────────
  function selectSlot(slotKey) {
    const ch = window.selChar;
    if (!ch) return;
    const iid = ch.equipment?.[slotKey];
    const window.ITEM_DB = window.ITEM_DB || {};
    const box = document.getElementById('eqDetailBox');
    if (!box) return;

    if (!iid) {
      box.innerHTML = `<div style="color:var(--muted);font-size:.65rem;text-align:center">Slot ${slotKey} kosong — pergi ke beg untuk equip.</div>`;
      return;
    }
    const item = window.ITEM_DB[iid];
    if (!item) return;
    const enh = item.enh || 0;
    const rar = item.rarity || 'common';
    const col = { common:'#aaa',uncommon:'#4af',rare:'#fa0',epic:'#c4f',legendary:'#f84',mythic:'#f4f' }[rar] || '#aaa';

    let stats = '';
    if (item.atk) stats += `<div>⚔ ATK +${item.atk + enh * Math.floor(item.atk * .08)}</div>`;
    if (item.def) stats += `<div>🛡 DEF +${item.def + enh * Math.floor(item.def * .08)}</div>`;
    if (item.int) stats += `<div>🔮 INT +${item.int + enh * Math.floor(item.int * .08)}</div>`;
    if (item.hp)  stats += `<div>❤️ HP +${item.hp}</div>`;
    if (item.mp)  stats += `<div>💙 MP +${item.mp}</div>`;
    if (item.str) stats += `<div>💪 STR +${item.str}</div>`;
    if (item.dex) stats += `<div>🏃 DEX +${item.dex}</div>`;
    if (item.spd) stats += `<div>⚡ SPD +${item.spd}</div>`;
    if (item.set) stats += `<div style="color:#f84">🏆 Set: ${item.set}</div>`;

    const glow = RARITY_GLOW[rar] || 'none';
    box.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:6px;border-radius:5px;background:${RARITY_BG[rar]||'transparent'};border:1px solid ${RARITY_BORDER[rar]||'transparent'};box-shadow:${glow}">
        <div style="font-size:2rem">${item.icon}</div>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:.78rem;color:${col}">${item.name}${enh > 0 ? ' <span style="color:#ffcc44">+'+enh+'</span>' : ''}</div>
          <div style="font-size:.6rem;color:var(--muted);text-transform:capitalize">${rar}</div>
        </div>
      </div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;margin:6px 0;line-height:1.7">${stats||'<div style="color:var(--muted)">Item istimewa</div>'}</div>
      <div style="display:flex;gap:5px">
        <button class="btn btn-dim" onclick="InvVisual.unequip('${slotKey}')" style="flex:1;padding:5px;font-size:.62rem">⬇ Tanggal</button>
        <button class="btn btn-red" onclick="InvVisual.confirmSell('${iid}')" style="flex:0 0 auto;padding:5px 10px;font-size:.6rem">Jual ${item.sell}g</button>
      </div>`;
  }

  function unequip(slotKey) {
    if (!window.selChar?.equipment) return;
    const iid = window.selChar.equipment[slotKey];
    if (!iid) return;
    if (!window.selChar.inventory) window.selChar.inventory = {};
    window.selChar.inventory[iid] = (window.selChar.inventory[iid] || 0) + 1;
    delete window.selChar.equipment[slotKey];
    if (window.addChat) window.addChat('', '⬇ Item ditanggal ke beg.', 'system');
    if (typeof window.updHUD === 'function') window.updHUD();
    renderEquipFull();
    window.saveProgress?.();
  }

  function confirmSell(iid) {
    const item = window.ITEM_DB?.[iid];
    if (!item || !window.selChar) return;
    if (!confirm(`Jual ${item.name} untuk ${item.sell} gold?`)) return;
    // Remove from equipment
    const eq = window.selChar.equipment || {};
    for (const [s, id] of Object.entries(eq)) { if (id === iid) { delete eq[s]; break; } }
    window.selChar.gold = (window.selChar.gold || 0) + (item.sell || 0);
    if (window.addChat) window.addChat('', `💰 Jual ${item.name} (+${item.sell}g)`, 'system');
    if (typeof window.updHUD === 'function') window.updHUD();
    renderEquipFull();
    window.saveProgress?.();
  }

  // ── Enhanced bag grid ────────────────────────────
  function renderBagEnhanced() {
    const ch = window.selChar;
    if (!ch) return;
    const inv = ch.inventory || {};
    const window.ITEM_DB = window.ITEM_DB || {};
    const RARITY_COL = { common:'#aaa',uncommon:'#4af',rare:'#fa0',epic:'#c4f',legendary:'#f84',mythic:'#f4f' };

    let html = `
      <style>
        .inv-grid-v2{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:8px}
        .inv-slot-v2{aspect-ratio:1;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;position:relative;border:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.3);transition:all .15s;min-height:52px}
        .inv-slot-v2:hover{transform:scale(1.05);filter:brightness(1.2)}
        .inv-slot-v2 .is-icon{font-size:1.5rem;line-height:1}
        .inv-slot-v2 .is-qty{position:absolute;bottom:2px;right:4px;font-family:'Share Tech Mono',monospace;font-size:.58rem;color:#ffcc44}
        .inv-slot-v2 .is-enh{position:absolute;top:2px;right:4px;font-family:'Share Tech Mono',monospace;font-size:.55rem;color:#ffcc44;font-weight:700}
        .inv-detail-v2{background:rgba(0,0,0,.45);border:1px solid rgba(201,168,76,.12);border-radius:6px;padding:10px;min-height:70px}
      </style>
      <div class="inv-grid-v2">`;

    const entries = Object.entries(inv).filter(([,q]) => q > 0);
    const total = 24;
    for (let i = 0; i < total; i++) {
      if (i < entries.length) {
        const [iid, qty] = entries[i];
        const item = window.ITEM_DB[iid];
        if (!item) { html += '<div class="inv-slot-v2"></div>'; continue; }
        const rar = item.rarity || 'common';
        const col = RARITY_COL[rar] || '#aaa';
        const glow = RARITY_GLOW[rar] || 'none';
        const bg   = RARITY_BG[rar]  || 'transparent';
        const bord = RARITY_BORDER[rar] || 'rgba(255,255,255,.07)';
        html += `
          <div class="inv-slot-v2" style="background:${bg};border-color:${bord};box-shadow:${glow}"
            onclick="InvVisual.selectBagItem('${iid}')"
            ontouchstart="InvVisual.selectBagItem('${iid}')"
            title="${item.name}">
            <div class="is-icon">${item.icon}</div>
            ${qty > 1 ? `<div class="is-qty">${qty}</div>` : ''}
            ${item.enh > 0 ? `<div class="is-enh">+${item.enh}</div>` : ''}
          </div>`;
      } else {
        html += '<div class="inv-slot-v2" style="border-style:dashed;opacity:.3"></div>';
      }
    }

    html += `</div><div class="inv-detail-v2" id="invDetailV2"><div style="color:var(--muted);font-size:.65rem;text-align:center">Klik item untuk lihat butiran</div></div>`;

    const body = document.getElementById('invBody');
    if (body) body.innerHTML = html;
  }

  function selectBagItem(iid) {
    const ch = window.selChar;
    const window.ITEM_DB = window.ITEM_DB || {};
    const item = window.ITEM_DB[iid];
    if (!item || !ch) return;
    const box = document.getElementById('invDetailV2');
    if (!box) return;

    const qty = ch.inventory?.[iid] || 0;
    const rar = item.rarity || 'common';
    const col = { common:'#aaa',uncommon:'#4af',rare:'#fa0',epic:'#c4f',legendary:'#f84',mythic:'#f4f' }[rar] || '#aaa';
    const eq  = ch.equipment || {};
    const equipped = Object.values(eq).includes(iid);

    let stats = '';
    if (item.atk)  stats += `⚔ ATK +${item.atk}  `;
    if (item.def)  stats += `🛡 DEF +${item.def}  `;
    if (item.int)  stats += `🔮 INT +${item.int}  `;
    if (item.hp)   stats += `❤️ HP +${item.hp}  `;
    if (item.mp)   stats += `💙 MP +${item.mp}  `;
    if (item.heal) stats += `💊 Sembuh ${item.heal}HP  `;
    if (item.mana) stats += `💙 +${item.mana}MP  `;
    if (item.set)  stats += `🏆 Set: ${item.set}  `;

    const canEquip = item.slot && ['weapon','armor','helmet','gloves','boots','ring1','ring2','amulet','earring'].includes(item.slot);
    const classOk  = !item.jobs || item.jobs.includes(ch.job);

    box.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
        <div style="font-size:2.2rem">${item.icon}</div>
        <div>
          <div style="font-family:'Cinzel',serif;font-size:.8rem;color:${col}">${item.name}${item.enh>0?' <span style="color:#ffcc44">+'+item.enh+'</span>':''}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--muted)">${rar.toUpperCase()} · Qty: ${qty}</div>
        </div>
      </div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:var(--parch);margin-bottom:6px;line-height:1.6">${stats||'<span style="color:var(--muted)">Special item</span>'}</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${canEquip && classOk && !equipped ? `<button class="btn btn-gold" onclick="InvVisual.equipItem('${iid}')" style="flex:1;padding:5px;font-size:.62rem">⬆ Pakai</button>` : ''}
        ${equipped ? `<button class="btn btn-dim" onclick="InvVisual.unequipById('${iid}')" style="flex:1;padding:5px;font-size:.62rem">⬇ Tanggal</button>` : ''}
        ${item.type==='potion' ? `<button class="btn btn-blue" onclick="InvVisual.useItem('${iid}')" style="flex:1;padding:5px;font-size:.62rem">✨ Guna</button>` : ''}
        ${!canEquip ? `<button class="btn btn-dim" style="flex:1;padding:5px;font-size:.62rem;opacity:.4" disabled>Tidak boleh pakai</button>` : ''}
        ${!classOk ? `<button class="btn btn-dim" style="flex:1;padding:5px;font-size:.62rem;opacity:.4" disabled>Kelas salah</button>` : ''}
        <button class="btn btn-red" onclick="InvVisual.sellOne('${iid}')" style="flex:0 0 auto;padding:5px 10px;font-size:.6rem">Jual ${item.sell}g</button>
      </div>`;
  }

  function equipItem(iid) {
    if (typeof window.equipItem === 'function') { window.equipItem(iid); renderBagEnhanced(); return; }
    const ch = window.selChar;
    const item = window.ITEM_DB?.[iid];
    if (!item || !ch) return;
    if (item.jobs && !item.jobs.includes(ch.job)) { window.addChat?.('','Kelas tidak sesuai!','system'); return; }
    if (!ch.equipment) ch.equipment = {};
    const slot = item.slot;
    // Unequip old
    if (ch.equipment[slot]) {
      if (!ch.inventory) ch.inventory = {};
      ch.inventory[ch.equipment[slot]] = (ch.inventory[ch.equipment[slot]] || 0) + 1;
    }
    ch.equipment[slot] = iid;
    ch.inventory[iid] = Math.max(0, (ch.inventory[iid] || 0) - 1);
    if (ch.inventory[iid] === 0) delete ch.inventory[iid];
    window.addChat?.('', `⬆ ${item.name} dipakai!`, 'system');
    window.Audio?.playSFX?.('equip');
    window.updHUD?.();
    renderBagEnhanced();
    window.saveProgress?.();
  }

  function unequipById(iid) {
    const ch = window.selChar;
    if (!ch?.equipment) return;
    for (const [s, id] of Object.entries(ch.equipment)) {
      if (id === iid) { unequipSlot(s); return; }
    }
  }

  function unequipSlot(slot) {
    const ch = window.selChar;
    if (!ch?.equipment?.[slot]) return;
    const iid = ch.equipment[slot];
    if (!ch.inventory) ch.inventory = {};
    ch.inventory[iid] = (ch.inventory[iid] || 0) + 1;
    delete ch.equipment[slot];
    window.addChat?.('','⬇ Item ditanggal.','system');
    window.updHUD?.();
    renderBagEnhanced();
    window.saveProgress?.();
  }

  function useItem(iid) {
    if (typeof window.usePotion === 'function') { window.usePotion(iid); renderBagEnhanced(); return; }
    const ch = window.selChar;
    const item = window.ITEM_DB?.[iid];
    if (!item || !ch) return;
    const p = window.G?.pl;
    if (!p) return;
    if (item.heal) {
      p.hp = Math.min(p.maxHp, p.hp + item.heal);
      window.addChat?.('', `💊 Pulih ${item.heal} HP!`, 'system');
    }
    if (item.mana) {
      p.mp = Math.min(p.maxMp, p.mp + item.mana);
      window.addChat?.('', `💙 MP +${item.mana}!`, 'system');
    }
    ch.inventory[iid] = Math.max(0, (ch.inventory[iid] || 0) - 1);
    if (ch.inventory[iid] === 0) delete ch.inventory[iid];
    window.Audio?.playSFX?.('heal');
    window.updHUD?.();
    renderBagEnhanced();
  }

  function sellOne(iid) {
    const ch = window.selChar;
    const item = window.ITEM_DB?.[iid];
    if (!item || !ch) return;
    if (!confirm(`Jual 1x ${item.name} untuk ${item.sell}g?`)) return;
    ch.inventory[iid] = Math.max(0, (ch.inventory[iid] || 0) - 1);
    if (ch.inventory[iid] === 0) delete ch.inventory[iid];
    ch.gold = (ch.gold || 0) + (item.sell || 0);
    window.addChat?.('', `💰 Jual ${item.name} (+${item.sell}g)`, 'system');
    window.updHUD?.();
    renderBagEnhanced();
    window.saveProgress?.();
  }

  return { renderEquipFull, renderBagEnhanced, selectSlot, selectBagItem, equipItem, unequipById, unequip, useItem, sellOne, confirmSell };
})();

window.InvVisual = InvVisual;

// ── Patch openInventory to use new visual ────────────
window.addEventListener('load', function() {
  const _waitInv = setInterval(() => {
    if (typeof window.openInventory !== 'function' || !document.getElementById('invPanel')) return;
    clearInterval(_waitInv);

    // Patch tab clicks in invPanel
    const tabEquip = document.getElementById('invTabEquip');
    const tabBag   = document.getElementById('invTabBag');
    if (tabEquip) tabEquip.onclick = () => { tabEquip.classList.add('active'); tabBag?.classList.remove('active'); InvVisual.renderEquipFull(); };
    if (tabBag)   tabBag.onclick   = () => { tabBag.classList.add('active'); tabEquip?.classList.remove('active'); InvVisual.renderBagEnhanced(); };

    // Override openInventory to call enhanced render
    const _origOpenInv = window.openInventory;
    window.openInventory = function() {
      _origOpenInv?.();
      // Default to equipment tab
      setTimeout(() => {
        if (document.getElementById('invPanel')?.classList.contains('off') === false) {
          InvVisual.renderEquipFull();
        }
      }, 30);
    };
    console.log('[InvVisual] ✓ Inventory visual patched');
  }, 400);
});

// ═══════════════════════════════════════════════════
// PvP Dead Overlay (inject into DOM)
// ═══════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', function() {
  const overlay = document.createElement('div');
  overlay.id = 'pvpDeadOverlay';
  overlay.className = 'off';
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:90;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px`;
  overlay.innerHTML = `
    <div style="font-family:'Cinzel Decorative',serif;font-size:clamp(1.5rem,5vw,2.5rem);color:#cc3333;text-shadow:0 0 30px rgba(200,40,40,.6)">💀 Kamu Gugur!</div>
    <div style="font-family:'Cinzel',serif;font-size:.85rem;color:var(--muted)">Dibunuh oleh musuh dalam Colony Zone</div>
    <div style="background:rgba(0,0,0,.6);border:1px solid rgba(200,50,50,.3);border-radius:6px;padding:14px 28px;text-align:center">
      <div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;color:var(--muted)">Bangkit semula dalam</div>
      <div style="font-family:'Cinzel Decorative',serif;font-size:2rem;color:#cc3333" class="pvp-revive-timer">8s</div>
    </div>`;
  document.body.appendChild(overlay);

  // Inject zone select cards for new zones into dungeon panel if exists
  console.log('[Features] ✓ PvP Dead Overlay injected');
});

// ── Zone select UI injection for new zones ───────────
window.addEventListener('load', function() {
  const _waitZone = setInterval(() => {
    if (typeof window.renderDungeons !== 'function') return;
    clearInterval(_waitZone);

    const _origRenderDungeons = window.renderDungeons;
    window.renderDungeons = function() {
      _origRenderDungeons();
      // Add new zone buttons
      const body = document.getElementById('dungeonBody');
      if (!body || !window.selChar) return;
      const lv = window.selChar.level || 1;
      const newZones = [
        { id:'bifrost',          name:'🌈 Bifrost',          req:30, desc:'Zone event eksklusif. Musuh kuat, drop istimewa.' },
        { id:'forgotten_temple', name:'🏛️ Forgotten Temple', req:50, desc:'Dungeon veteran. 15 gelombang + Boss Bone Dragon.' },
        { id:'eslant',           name:'🏔️ Eslant',           req:60, desc:'Tanah tinggi. Leveling terbaik untuk level 60+.' },
      ];
      newZones.forEach(z => {
        const locked = lv < z.req;
        const div = document.createElement('div');
        div.style.cssText = `margin-top:6px;padding:10px;border-radius:5px;border:1px solid rgba(201,168,76,.${locked?'1':'2'});background:rgba(0,0,0,.3);opacity:${locked?'.5':'1'}`;
        div.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-family:'Cinzel',serif;font-size:.78rem;color:${locked?'var(--muted)':'#c9a84c'}">${z.name}</div>
              <div style="font-size:.65rem;color:var(--muted);margin-top:2px">${z.desc}</div>
            </div>
            <div style="text-align:right;flex-shrink:0;margin-left:10px">
              ${locked
                ? `<div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:#e84040">🔒 Lv ${z.req}</div>`
                : `<button class="btn btn-gold" onclick="window.gotoAndPlay?.('${z.id}')" style="padding:5px 12px;font-size:.62rem">Masuk</button>`}
            </div>
          </div>`;
        body.appendChild(div);
      });
    };
    console.log('[Features] ✓ Zone select patched with new zones');
  }, 400);
});

console.log('[Features] ✅ features.js loaded — Zone Baru, PvP CZ, NPC Shop, Inv Visual');
