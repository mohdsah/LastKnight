'use strict';
/* ══════════════════════════════════════════════════════════════
   Pahlawan Terakhir — systems/world-map.js
   World Map, Achievement+Title, Event Harian/Mingguan,
   Donasi, National Points (Clan Top)
   ══════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════
// 1. WORLD MAP
// ═══════════════════════════════════════════════════════════
const WorldMap = (() => {
  // Zone layout positions on the 600×800 map canvas
  const LAYOUT = {
    moradon:         { x:300, y:400, icon:'🏙️', col:'#6496ff', type:'town'  },
    elmorad:         { x:150, y:250, icon:'🌟', col:'#c9a84c', type:'town'  },
    karus:           { x:450, y:250, icon:'🔥', col:'#cc3333', type:'town'  },
    ronark:          { x:300, y:200, icon:'⚔️', col:'#ff6644', type:'field' },
    cz:              { x:300, y:120, icon:'🏰', col:'#ff4444', type:'cz'    },
    ardream:         { x:200, y:340, icon:'⚔️', col:'#9955ee', type:'field' },
    dungeon_goblin:  { x:100, y:380, icon:'🟢', col:'#44cc44', type:'dungeon'},
    dungeon_orc:     { x:100, y:450, icon:'🟡', col:'#ccaa44', type:'dungeon'},
    dungeon_dark:    { x:100, y:520, icon:'🔴', col:'#cc4444', type:'dungeon'},
    bifrost:         { x:480, y:380, icon:'🌈', col:'#88aaff', type:'event' },
    forgotten_temple:{ x:480, y:470, icon:'🏛️', col:'#aa66ff', type:'dungeon'},
    eslant:          { x:480, y:560, icon:'🏔️', col:'#44cccc', type:'field' },
    luferson:        { x:420, y:160, icon:'🏯', col:'#cc3333', type:'field' },
  };
  // Zone connections (roads)
  const ROADS = [
    ['moradon','elmorad'],['moradon','karus'],['moradon','ardream'],
    ['elmorad','ronark'],['karus','ronark'],['ronark','cz'],
    ['elmorad','dungeon_goblin'],['elmorad','dungeon_orc'],
    ['karus','dungeon_dark'],['ardream','bifrost'],
    ['bifrost','forgotten_temple'],['forgotten_temple','eslant'],
    ['karus','luferson'],
  ];

  let _canvas = null, _ctx = null, _anim = 0;

  function open() {
    let panel = document.getElementById('worldMapPanel');
    if (!panel) { panel = _createPanel(); document.body.appendChild(panel); }
    panel.classList.remove('off');
    _render();
  }
  function close() { document.getElementById('worldMapPanel')?.classList.add('off'); }

  function _createPanel() {
    const div = document.createElement('div');
    div.id = 'worldMapPanel';
    div.className = 'overlay-panel off';
    div.innerHTML = `
      <div class="ov-box" style="max-width:500px;max-height:90vh;overflow:hidden">
        <div class="ov-header">
          <div class="ov-title">🗺️ World Map</div>
          <div class="ov-close" onclick="WorldMap.close()">✕</div>
        </div>
        <div class="ov-body" style="padding:0;position:relative">
          <canvas id="wmCanvas" style="width:100%;display:block;touch-action:none"></canvas>
          <div id="wmZoneInfo" style="position:absolute;bottom:8px;left:0;right:0;text-align:center;
            font-family:'Cinzel',serif;font-size:.7rem;color:#c9a84c;
            text-shadow:0 0 8px rgba(0,0,0,.8);pointer-events:none"></div>
        </div>
      </div>`;
    return div;
  }

  function _render() {
    const cvs = document.getElementById('wmCanvas');
    if (!cvs) return;
    const W = cvs.offsetWidth || 460, H = Math.round(W * 1.3);
    cvs.width = W; cvs.height = H;
    _canvas = cvs; _ctx = cvs.getContext('2d');

    const sx = W / 600, sy = H / 800;
    const ctx = _ctx;
    const curZone = window.G?.currentZone || 'moradon';
    const selFac  = window.selChar?.faction || 'elmorad';

    // Background
    ctx.fillStyle = '#04050e'; ctx.fillRect(0,0,W,H);
    // Grid
    ctx.strokeStyle = 'rgba(201,168,76,.05)'; ctx.lineWidth = 1;
    for (let i=0;i<W;i+=W/12) { ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke(); }
    for (let i=0;i<H;i+=H/16) { ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(W,i);ctx.stroke(); }

    // Roads
    ROADS.forEach(([a,b]) => {
      const za = LAYOUT[a], zb = LAYOUT[b]; if(!za||!zb) return;
      ctx.beginPath();
      ctx.strokeStyle='rgba(201,168,76,.12)'; ctx.lineWidth=1.5; ctx.setLineDash([4,6]);
      ctx.moveTo(za.x*sx, za.y*sy); ctx.lineTo(zb.x*sx, zb.y*sy); ctx.stroke();
      ctx.setLineDash([]);
    });

    // Zones
    Object.entries(LAYOUT).forEach(([id, z]) => {
      const px = z.x*sx, py = z.y*sy;
      const isCur  = id === curZone;
      const locked = _isLocked(id);
      const r = isCur ? 18 : 13;

      // Glow for current
      if (isCur) {
        ctx.shadowColor = z.col; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(px,py,r+4,0,Math.PI*2);
        ctx.fillStyle = z.col+'33'; ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Zone circle
      ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2);
      ctx.fillStyle = locked ? '#1a1a1a' : z.col+'22';
      ctx.fill();
      ctx.strokeStyle = locked ? '#333' : z.col;
      ctx.lineWidth = isCur ? 2.5 : 1.5;
      ctx.stroke();

      // Icon
      ctx.font = `${isCur?16:12}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = locked ? 0.3 : 1;
      ctx.fillText(locked ? '🔒' : z.icon, px, py);
      ctx.globalAlpha = 1;

      // Zone name
      const zData = window.ZONES?.[id];
      ctx.font = `${isCur ? 'bold ' : ''}${isCur?10:8}px "Cinzel",serif`;
      ctx.fillStyle = locked ? '#444' : (isCur ? z.col : 'rgba(220,200,160,.6)');
      ctx.fillText(zData?.name || id, px, py + r + 10);
    });

    // Player dot
    const pz = LAYOUT[curZone];
    if (pz) {
      const t = Date.now()/1000;
      ctx.beginPath(); ctx.arc(pz.x*sx, pz.y*sy, 5+Math.sin(t*4)*2, 0, Math.PI*2);
      ctx.fillStyle = selFac==='elmorad'||selFac==='cahaya' ? '#c9a84c' : '#ff4444';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
      ctx.fill(); ctx.shadowBlur = 0;
    }

    // Title
    ctx.font = 'bold 10px "Cinzel Decorative",serif';
    ctx.fillStyle = 'rgba(201,168,76,.4)'; ctx.textAlign = 'center';
    ctx.fillText('WORLD OF PAHLAWAN TERAKHIR', W/2, H-8);

    // Tap to travel
    cvs.onclick = (e) => {
      const rect = cvs.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width * W;
      const my = (e.clientY - rect.top)  / rect.height * H;
      Object.entries(LAYOUT).forEach(([id,z]) => {
        const dx = z.x*sx-mx, dy = z.y*sy-my;
        if (Math.hypot(dx,dy) < 22) {
          if (_isLocked(id)) { addChat?.('','Zone dikunci — level tidak cukup!','system'); return; }
          document.getElementById('wmZoneInfo').textContent = `→ Pergi ${window.ZONES?.[id]?.name||id}?`;
          setTimeout(()=>{
            close();
            if (typeof window.gotoAndPlay==='function') window.gotoAndPlay(id);
          }, 600);
        }
      });
    };
  }

  function _isLocked(id) {
    const z = window.ZONES?.[id]; if (!z) return false;
    const lv = window.selChar?.level || 1;
    if (z.reqLv && lv < z.reqLv) return true;
    if (z.faction && z.faction !== window.selChar?.faction &&
        !((z.faction==='cahaya'&&window.selChar?.faction==='elmorad')||(z.faction==='kegelapan'&&window.selChar?.faction==='karus'))) return true;
    return false;
  }

  // Auto-rerender on zone change
  window.addEventListener('load', () => {
    const _wait = setInterval(() => {
      if (!window.gotoAndPlay) return; clearInterval(_wait);
      const _orig = window.gotoAndPlay;
      window.gotoAndPlay = function(zoneId) {
        _orig(zoneId);
        if (document.getElementById('worldMapPanel')?.classList.contains('off') === false) _render();
      };
    }, 300);
  });

  return { open, close };
})();
window.WorldMap = WorldMap;

// ═══════════════════════════════════════════════════════════
// 2. ACHIEVEMENT & TITLE SYSTEM
// ═══════════════════════════════════════════════════════════
const Achievements = (() => {
  const LIST = [
    // Combat
    { id:'first_kill',    name:'Pembunuh Pertama',   desc:'Tewaskan musuh pertama kali',          icon:'⚔️', req:{ kills:1    }, reward:{ title:'Pejuang',     gold:100,  xp:200   }},
    { id:'kill_100',      name:'Pahlawan Sejati',    desc:'Tewaskan 100 musuh',                   icon:'💀', req:{ kills:100  }, reward:{ title:'Veteran',     gold:500,  xp:1000  }},
    { id:'kill_1000',     name:'Pembasmi Iblis',     desc:'Tewaskan 1000 musuh',                  icon:'⚡', req:{ kills:1000 }, reward:{ title:'Pembasmi',    gold:2000, xp:5000  }},
    { id:'boss_first',    name:'Pemburu Boss',       desc:'Kalahkan boss pertama kali',           icon:'👑', req:{ bossKills:1}, reward:{ title:'Pemburu',     gold:1000, xp:2000  }},
    { id:'boss_50',       name:'Legenda Boss',       desc:'Kalahkan 50 boss',                     icon:'🐲', req:{ bossKills:50},reward:{ title:'Legenda',     gold:5000, xp:10000 }},
    // Leveling
    { id:'lv10',          name:'Pemula Berbakat',    desc:'Capai level 10',                       icon:'📈', req:{ level:10   }, reward:{ title:'Pemula',      gold:200,  xp:0     }},
    { id:'lv30',          name:'Pahlawan Muda',      desc:'Capai level 30',                       icon:'🌟', req:{ level:30   }, reward:{ title:'Muda',        gold:800,  xp:0     }},
    { id:'lv60',          name:'Veteran Perang',     desc:'Capai level 60',                       icon:'💎', req:{ level:60   }, reward:{ title:'Veteran',     gold:3000, xp:0     }},
    { id:'lv100',         name:'Tuhan Perang',       desc:'Capai level 100',                      icon:'⭐', req:{ level:100  }, reward:{ title:'Tuhan Perang',gold:10000,xp:0     }},
    // Zone
    { id:'cz_first',      name:'Pejuang Colony',     desc:'Masuk Colony Zone buat pertama kali',  icon:'🏰', req:{ zone:'cz'  }, reward:{ title:'Koloni',     gold:500,  xp:1000  }},
    { id:'bifrost_first', name:'Penjelajah Bifrost', desc:'Lawati Bifrost',                       icon:'🌈', req:{ zone:'bifrost'},reward:{title:'Penjelajah', gold:500,  xp:1000  }},
    // Gold
    { id:'rich_10k',      name:'Pedagang',           desc:'Kumpul 10,000 gold',                   icon:'💰', req:{ gold:10000 }, reward:{ title:'Pedagang',   gold:0,   xp:500   }},
    { id:'rich_100k',     name:'Jutawan',             desc:'Kumpul 100,000 gold',                  icon:'💎', req:{ gold:100000},reward:{ title:'Jutawan',     gold:0,   xp:2000  }},
    // PvP
    { id:'pvp_first',     name:'Pejuang PvP',        desc:'Dapatkan kill PvP pertama',            icon:'⚔️', req:{ pvpKills:1 }, reward:{ title:'PvP',       gold:300,  xp:500   }},
    { id:'pvp_50',        name:'Pembunuh Berbahaya', desc:'50 kill PvP',                          icon:'💀', req:{ pvpKills:50}, reward:{ title:'Berbahaya', gold:2000, xp:5000  }},
    // Dungeon
    { id:'dungeon_clear', name:'Penyelam Dungeon',   desc:'Selesaikan dungeon pertama',           icon:'🗝️', req:{ dungeonClears:1},reward:{title:'Penyelam', gold:500, xp:1000  }},
  ];

  const TITLES_EXTRA = [
    'Anak Syurga','Naga Besi','Raja Pedang','Pemburu Bayangan','Dewa Sihir',
    'Pahlawan Terakhir','Iblis Berduri','Malaikat Maut','Penjaga Abadi','Legenda Hidup'
  ];

  function check(charData) {
    if (!charData) return;
    const done = charData.achievements || {};
    const earned = [];

    LIST.forEach(ach => {
      if (done[ach.id]) return; // already unlocked
      const r = ach.req;
      let pass = false;
      if (r.kills     !== undefined && (charData._totalKills||0) >= r.kills)     pass = true;
      if (r.bossKills !== undefined && (charData._bossKills||0)  >= r.bossKills) pass = true;
      if (r.level     !== undefined && (charData.level||1)       >= r.level)     pass = true;
      if (r.gold      !== undefined && (charData.gold||0)        >= r.gold)      pass = true;
      if (r.pvpKills  !== undefined && (charData._pvpKills||0)   >= r.pvpKills)  pass = true;
      if (r.dungeonClears !== undefined && (charData._dungeonClears||0) >= r.dungeonClears) pass = true;
      if (r.zone && window.G?.currentZone === r.zone) pass = true;

      if (pass) {
        done[ach.id] = Date.now();
        charData.achievements = done;
        earned.push(ach);
        // Apply reward
        if (ach.reward.gold) charData.gold = (charData.gold||0) + ach.reward.gold;
        if (ach.reward.xp)   charData.xp   = (charData.xp||0)  + ach.reward.xp;
        if (ach.reward.title && !charData.titles) charData.titles = [];
        if (ach.reward.title) charData.titles.push(ach.reward.title);
      }
    });

    earned.forEach(ach => _notify(ach));
    if (earned.length) window.saveProgress?.();
  }

  function _notify(ach) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:20%;left:50%;transform:translateX(-50%);
      background:rgba(4,3,14,.95);border:1px solid rgba(201,168,76,.5);
      border-radius:8px;padding:14px 24px;z-index:90;text-align:center;
      font-family:'Cinzel',serif;animation:achIn .4s ease;pointer-events:none`;
    el.innerHTML = `
      <div style="font-size:1.6rem">${ach.icon}</div>
      <div style="font-size:.65rem;color:rgba(201,168,76,.5);letter-spacing:.2em;text-transform:uppercase;margin-top:4px">Achievement Dibuka!</div>
      <div style="font-size:.9rem;color:#c9a84c;margin-top:3px">${ach.name}</div>
      <div style="font-size:.62rem;color:#888;margin-top:2px">${ach.desc}</div>
      ${ach.reward.title ? `<div style="font-size:.65rem;color:#ffd700;margin-top:4px">Title: [${ach.reward.title}]</div>` : ''}
      ${ach.reward.gold  ? `<div style="font-size:.62rem;color:#c9a84c">+${ach.reward.gold} gold</div>` : ''}`;
    document.body.appendChild(el);
    if (typeof Audio !== 'undefined') Audio.playSFX?.('raredrop');
    setTimeout(() => el.remove(), 4000);
  }

  function openPanel() {
    const ch = window.selChar; if (!ch) return;
    let panel = document.getElementById('achievementPanel');
    if (!panel) { panel = _createPanel(); document.body.appendChild(panel); }
    panel.classList.remove('off');
    _renderPanel(ch);
  }

  function _createPanel() {
    const d = document.createElement('div');
    d.id = 'achievementPanel';
    d.className = 'overlay-panel off';
    d.innerHTML = `<div class="ov-box"><div class="ov-header">
      <div class="ov-title">🏆 Achievement & Title</div>
      <div class="ov-close" onclick="Achievements.closePanel()">✕</div></div>
      <div class="ov-body" id="achBody" style="max-height:65vh;overflow-y:auto"></div></div>`;
    return d;
  }

  function closePanel() { document.getElementById('achievementPanel')?.classList.add('off'); }

  function _renderPanel(ch) {
    const done = ch.achievements || {};
    const titles = ch.titles || [];
    const cur = ch.activeTitle || '';
    let html = `<div style="font-family:'Cinzel',serif;font-size:.6rem;color:rgba(201,168,76,.5);
      text-transform:uppercase;letter-spacing:.15em;margin-bottom:10px">
      Title Aktif: <span style="color:#c9a84c">[${cur||'Tiada'}]</span></div>`;

    // Title selector
    if (titles.length) {
      html += `<div style="margin-bottom:12px"><div style="font-family:'Cinzel',serif;
        font-size:.6rem;color:rgba(201,168,76,.45);margin-bottom:6px">Pilih Title:</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">`;
      ['',...titles].forEach(t => {
        html += `<button onclick="Achievements.setTitle('${t}')"
          style="padding:4px 10px;border-radius:4px;border:1px solid rgba(201,168,76,.${t===cur?'6':'2'});
          background:rgba(201,168,76,.${t===cur?'15':'05'});color:${t===cur?'#c9a84c':'#666'};
          font-family:'Cinzel',serif;font-size:.6rem;cursor:pointer">
          ${t?`[${t}]`:'(Tiada)'}</button>`;
      });
      html += `</div></div>`;
    }

    // Achievement list
    html += `<div style="font-family:'Cinzel',serif;font-size:.6rem;color:rgba(201,168,76,.45);
      text-transform:uppercase;letter-spacing:.15em;margin-bottom:8px">
      ${Object.keys(done).length}/${LIST.length} Achievement</div>`;
    LIST.forEach(a => {
      const unlocked = !!done[a.id];
      html += `<div style="display:flex;gap:10px;padding:8px;margin-bottom:4px;border-radius:5px;
        border:1px solid rgba(255,255,255,${unlocked?'.08':'.03'});
        background:rgba(0,0,0,${unlocked?'.35':'.2'});opacity:${unlocked?1:.45}">
        <div style="font-size:1.4rem;flex-shrink:0">${a.icon}</div>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:.7rem;color:${unlocked?'#c9a84c':'#666'}">${a.name}</div>
          <div style="font-size:.6rem;color:#555;margin-top:2px">${a.desc}</div>
          ${unlocked&&a.reward.title?`<div style="font-size:.58rem;color:#ffd700;margin-top:2px">Title: [${a.reward.title}]</div>`:''}
        </div>
        <div style="font-size:.55rem;color:${unlocked?'#40c840':'#333'};flex-shrink:0;align-self:center">
          ${unlocked?'✓ Dibuka':'🔒'}</div>
      </div>`;
    });
    document.getElementById('achBody').innerHTML = html;
  }

  function setTitle(title) {
    if (!window.selChar) return;
    window.selChar.activeTitle = title;
    window.saveProgress?.();
    openPanel();
    window.addChat?.('', `Title ditukar: [${title||'Tiada'}]`, 'system');
  }

  // Hook into kill/level tracking
  window.addEventListener('load', () => {
    const _waitG = setInterval(() => {
      if (!window.G) return; clearInterval(_waitG);
      // Patch enemy rewarded logic
      const _origEndGame = window.G.endGame?.bind(window.G);
    }, 400);

    // Check on every zone entry
    const _waitGP = setInterval(() => {
      if (!window.gotoAndPlay) return; clearInterval(_waitGP);
      const _orig = window.gotoAndPlay;
      window.gotoAndPlay = function(zid) { _orig(zid); setTimeout(() => check(window.selChar), 1000); };
    }, 400);
  });

  return { check, openPanel, closePanel, setTitle, LIST };
})();
window.Achievements = Achievements;

// ═══════════════════════════════════════════════════════════
// 3. EVENT HARIAN / MINGGUAN
// ═══════════════════════════════════════════════════════════
const EventSystem = (() => {
  // Daily events rotate by day-of-week
  const DAILY = [
    { id:'monday',    name:'Hari Goblin',    desc:'EXP ×2 dari Goblin & Bandicoot seharian.',      icon:'🟢', buff:'xp2_goblin',  day:1 },
    { id:'tuesday',   name:'Hari Orc',       desc:'Drop rate item ×2 dari Orc & Werewolf.',        icon:'🟡', buff:'drop2_orc',   day:2 },
    { id:'wednesday', name:'Hari Dungeon',   desc:'Gold reward dungeon ×2.',                       icon:'🗝️', buff:'gold2_dung',  day:3 },
    { id:'thursday',  name:'Hari PvP',       desc:'Kill PvP beri +500 XP & +200 gold tambahan.',   icon:'⚔️', buff:'pvp_bonus',   day:4 },
    { id:'friday',    name:'Hari Boss',      desc:'Boss spawn lebih kerap — setiap 45 saat.',      icon:'💀', buff:'boss_spawn2', day:5 },
    { id:'saturday',  name:'Hari Pasar',     desc:'Fee market dikurang 50%. Pedagang ramai!',      icon:'🏪', buff:'market50',    day:6 },
    { id:'sunday',    name:'Hari Bifrost',   desc:'Bifrost terbuka sepanjang hari. Drop Mythic!',  icon:'🌈', buff:'bifrost_open', day:0 },
  ];
  const WEEKLY = [
    { id:'w_boss_hunt',   name:'Buru Boss Minggu Ini', desc:'Bunuh 10 boss minggu ini.',     icon:'👑', target:10, type:'boss',   reward:{ gold:5000,  xp:10000, item:'star_stone' }},
    { id:'w_pvp_master',  name:'Tuan PvP',             desc:'Dapatkan 20 kill PvP.',         icon:'⚔️', target:20, type:'pvp',    reward:{ gold:3000,  xp:8000,  item:'chaos_stone'}},
    { id:'w_dungeon_run', name:'Pelari Dungeon',        desc:'Selesaikan 5 dungeon.',         icon:'🗝️', target:5,  type:'dungeon',reward:{ gold:4000,  xp:9000,  item:'hpot_xl'   }},
    { id:'w_explorer',   name:'Penjelajah',             desc:'Lawati 5 zone berbeza.',        icon:'🗺️', target:5,  type:'zone',   reward:{ gold:2000,  xp:5000,  item:'tp_scroll' }},
    { id:'w_gold_farmer',name:'Petani Gold',            desc:'Kumpul 20,000 gold minggu ini.',icon:'💰', target:20000,type:'gold', reward:{ gold:5000,  xp:6000,  item:'elixir_power'}}
  ];

  function getTodayEvent() {
    const day = new Date().getDay(); // 0=Sun
    return DAILY.find(e => e.day === day) || DAILY[0];
  }

  function getWeekKey() {
    const d = new Date(); const jan1 = new Date(d.getFullYear(),0,1);
    return `w${Math.ceil((d - jan1) / 604800000)}`;
  }

  function openPanel() {
    let panel = document.getElementById('eventPanel');
    if (!panel) { panel = _createPanel(); document.body.appendChild(panel); }
    panel.classList.remove('off');
    _renderPanel();
  }
  function closePanel() { document.getElementById('eventPanel')?.classList.add('off'); }

  function _createPanel() {
    const d = document.createElement('div');
    d.id = 'eventPanel'; d.className = 'overlay-panel off';
    d.innerHTML = `<div class="ov-box"><div class="ov-header">
      <div class="ov-title">📅 Event & Cabaran</div>
      <div class="ov-close" onclick="EventSystem.closePanel()">✕</div></div>
      <div class="ov-body" id="eventBody" style="max-height:68vh;overflow-y:auto"></div></div>`;
    return d;
  }

  function _renderPanel() {
    const ch = window.selChar; if (!ch) return;
    const today = getTodayEvent();
    const prog  = ch.weekly_event_prog || {};
    const wk    = getWeekKey();

    let html = `
      <div style="background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.2);
        border-radius:6px;padding:12px;margin-bottom:12px">
        <div style="font-family:'Cinzel Decorative',serif;font-size:.75rem;color:#c9a84c;margin-bottom:4px">
          ${today.icon} ${today.name}</div>
        <div style="font-size:.68rem;color:#888;margin-bottom:8px">${today.desc}</div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:rgba(201,168,76,.55)">
          Aktif sehingga: Tengah Malam</div>
      </div>
      <div style="font-family:'Cinzel',serif;font-size:.62rem;color:rgba(201,168,76,.4);
        text-transform:uppercase;letter-spacing:.15em;margin-bottom:8px">Cabaran Mingguan</div>`;

    WEEKLY.forEach(w => {
      const done  = prog[`${wk}_${w.id}_done`] || false;
      const cur   = prog[`${wk}_${w.id}`] || 0;
      const pct   = Math.min(100, cur / w.target * 100);
      html += `
        <div style="padding:10px;margin-bottom:6px;border-radius:5px;
          border:1px solid rgba(255,255,255,${done?'.1':'.05'});
          background:rgba(0,0,0,${done?'.4':'.25'});opacity:${done?1:.85}">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <div style="font-family:'Cinzel',serif;font-size:.7rem;color:${done?'#40c840':'#c9a84c'}">
              ${w.icon} ${w.name} ${done?'✓':''}</div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:#666">
              ${Math.min(cur,w.target)}/${w.target}</div>
          </div>
          <div style="font-size:.62rem;color:#555;margin-bottom:6px">${w.desc}</div>
          <div style="height:4px;background:rgba(0,0,0,.5);border-radius:2px;margin-bottom:6px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${done?'#40c840':'#c9a84c'};border-radius:2px;transition:width .3s"></div></div>
          <div style="font-size:.58rem;color:#ffd700">
            Ganjaran: ${w.reward.gold}g + ${w.reward.item}</div>
          ${!done&&cur>=w.target?`<button class="btn btn-gold" onclick="EventSystem.claimWeekly('${w.id}')"
            style="width:100%;margin-top:6px;padding:6px;font-size:.62rem">Tuntut Ganjaran</button>`:''}
        </div>`;
    });
    document.getElementById('eventBody').innerHTML = html;
  }

  function claimWeekly(wid) {
    const ch = window.selChar; if (!ch) return;
    const w = WEEKLY.find(x => x.id === wid); if (!w) return;
    const wk = getWeekKey();
    if (!ch.weekly_event_prog) ch.weekly_event_prog = {};
    ch.weekly_event_prog[`${wk}_${wid}_done`] = true;
    ch.gold = (ch.gold||0) + w.reward.gold;
    ch.xp   = (ch.xp||0)  + (w.reward.xp||0);
    if (w.reward.item && ch.inventory) ch.inventory[w.reward.item] = (ch.inventory[w.reward.item]||0)+1;
    window.addChat?.('', `🎉 Cabaran "${w.name}" selesai! +${w.reward.gold}g`, 'system');
    window.saveProgress?.(); _renderPanel();
  }

  function trackWeekly(type, amount=1) {
    const ch = window.selChar; if (!ch) return;
    if (!ch.weekly_event_prog) ch.weekly_event_prog = {};
    const wk = getWeekKey();
    WEEKLY.filter(w => w.type === type && !ch.weekly_event_prog[`${wk}_${w.id}_done`]).forEach(w => {
      const key = `${wk}_${w.id}`;
      ch.weekly_event_prog[key] = (ch.weekly_event_prog[key]||0) + amount;
    });
  }

  function getActiveBuff() { return getTodayEvent()?.buff || null; }

  return { openPanel, closePanel, getTodayEvent, trackWeekly, claimWeekly, getActiveBuff };
})();
window.EventSystem = EventSystem;

// ═══════════════════════════════════════════════════════════
// 4. DONASI & NATIONAL POINTS (Clan Top)
// ═══════════════════════════════════════════════════════════
const DonationSystem = (() => {
  // Donation packages (RM → Points)
  const PKG = [
    { id:'pkg5',   rm:5,   pts:500,   bonus:0,    label:'Starter',   icon:'💛', col:'#c9a84c' },
    { id:'pkg10',  rm:10,  pts:1100,  bonus:100,  label:'Popular',   icon:'⭐', col:'#c9a84c', badge:'HOT' },
    { id:'pkg25',  rm:25,  pts:2800,  bonus:300,  label:'Value',     icon:'💎', col:'#88aaff' },
    { id:'pkg50',  rm:50,  pts:6000,  bonus:1000, label:'Champion',  icon:'🏆', col:'#ffd700' },
    { id:'pkg100', rm:100, pts:13000, bonus:3000, label:'Legendary', icon:'🐉', col:'#ff8800', badge:'BEST' },
  ];

  // National Points per clan (faction)
  const NatPts = {
    elmorad: 0, karus: 0,
    load() {
      try {
        const d = JSON.parse(localStorage.getItem('pt_natpts')||'{}');
        this.elmorad = d.elmorad||0; this.karus = d.karus||0;
      } catch {}
    },
    save() {
      localStorage.setItem('pt_natpts', JSON.stringify({ elmorad:this.elmorad, karus:this.karus }));
    },
    add(faction, pts) {
      if (faction==='elmorad'||faction==='cahaya') this.elmorad += pts;
      else this.karus += pts;
      this.save();
    }
  };
  NatPts.load();

  function openDonatePanel() {
    let panel = document.getElementById('donatePanel');
    if (!panel) { panel = _create(); document.body.appendChild(panel); }
    panel.classList.remove('off');
    _render();
  }
  function close() { document.getElementById('donatePanel')?.classList.add('off'); }

  function _create() {
    const d = document.createElement('div');
    d.id = 'donatePanel'; d.className = 'overlay-panel off';
    d.innerHTML = `<div class="ov-box"><div class="ov-header">
      <div class="ov-title">💝 Sokong Permainan</div>
      <div class="ov-close" onclick="DonationSystem.close()">✕</div></div>
      <div class="ov-body" id="donateBody" style="max-height:70vh;overflow-y:auto"></div></div>`;
    return d;
  }

  function _render() {
    const ch = window.selChar;
    const pts = ch?.points || 0;
    const fac = ch?.faction || 'elmorad';
    const isEl = fac==='elmorad'||fac==='cahaya';

    let html = `
      <div style="text-align:center;margin-bottom:12px">
        <div style="font-family:'Share Tech Mono',monospace;font-size:.75rem;color:#c9a84c">
          Point Saya: <b>${pts.toLocaleString()}</b></div>
        <div style="font-size:.6rem;color:#555;margin-top:2px">100 pts = RM 1</div>
      </div>
      <!-- National Points Leaderboard -->
      <div style="background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.06);
        border-radius:6px;padding:10px;margin-bottom:12px">
        <div style="font-family:'Cinzel',serif;font-size:.62rem;color:rgba(201,168,76,.5);
          text-transform:uppercase;letter-spacing:.12em;margin-bottom:8px">🏆 National Points (Clan Top)</div>
        <div style="display:flex;gap:8px">
          <div style="flex:1;text-align:center;padding:8px;border-radius:4px;
            background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.2)">
            <div style="font-size:1.2rem">🌟</div>
            <div style="font-family:'Cinzel',serif;font-size:.65rem;color:#c9a84c">El Morad</div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.8rem;color:#c9a84c">
              ${NatPts.elmorad.toLocaleString()}</div>
          </div>
          <div style="flex:1;text-align:center;padding:8px;border-radius:4px;
            background:rgba(200,50,50,.07);border:1px solid rgba(200,50,50,.2)">
            <div style="font-size:1.2rem">🔥</div>
            <div style="font-family:'Cinzel',serif;font-size:.65rem;color:#cc3333">Karus</div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.8rem;color:#cc3333">
              ${NatPts.karus.toLocaleString()}</div>
          </div>
        </div>
        <div style="font-size:.58rem;color:#444;text-align:center;margin-top:6px">
          Setiap donasi menyumbang ke National Points puak anda!</div>
      </div>
      <!-- Packages -->
      <div style="font-family:'Cinzel',serif;font-size:.62rem;color:rgba(201,168,76,.4);
        text-transform:uppercase;letter-spacing:.12em;margin-bottom:8px">Pilih Pakej</div>`;

    PKG.forEach(p => {
      html += `
        <div onclick="DonationSystem.selectPkg('${p.id}')"
          style="position:relative;display:flex;align-items:center;gap:12px;padding:12px;
          margin-bottom:6px;border-radius:6px;cursor:pointer;transition:all .2s;
          border:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.35);"
          onmouseover="this.style.borderColor='${p.col}44';this.style.background='rgba(0,0,0,.5)'"
          onmouseout="this.style.borderColor='rgba(255,255,255,.07)';this.style.background='rgba(0,0,0,.35)'">
          ${p.badge?`<div style="position:absolute;top:-6px;right:8px;background:${p.badge==='BEST'?'#ff8800':'#cc3333'};
            color:#fff;font-family:'Share Tech Mono',monospace;font-size:.5rem;
            padding:2px 6px;border-radius:3px">${p.badge}</div>`:''}
          <div style="font-size:1.8rem">${p.icon}</div>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:.75rem;color:${p.col}">${p.label}</div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:#888">
              ${p.pts.toLocaleString()} pts${p.bonus?` <span style="color:#40c840">+${p.bonus} BONUS</span>`:''}
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-family:'Cinzel',serif;font-size:.85rem;color:${p.col}">RM ${p.rm}</div>
          </div>
        </div>`;
    });

    html += `
      <div style="margin-top:12px;padding:10px;background:rgba(0,0,0,.3);
        border-radius:6px;border:1px solid rgba(255,255,255,.04)">
        <div style="font-family:'Cinzel',serif;font-size:.62rem;color:rgba(201,168,76,.4);
          text-transform:uppercase;margin-bottom:6px">Masukkan Kod Top-up</div>
        <div style="display:flex;gap:6px">
          <input id="donatCodeInp" placeholder="Kod (cth: PT-XXXX-XXXX)" class="chat-inp"
            style="flex:1;font-family:'Share Tech Mono',monospace;font-size:.72rem">
          <button class="btn btn-gold" onclick="DonationSystem.redeemCode()"
            style="flex:0 0 auto;padding:6px 12px;font-size:.65rem">Guna</button>
        </div>
        <div class="status-msg st-info" id="donateStatus" style="margin-top:6px;font-size:.6rem"></div>
      </div>`;

    document.getElementById('donateBody').innerHTML = html;
  }

  function selectPkg(pkgId) {
    const p = PKG.find(x => x.id === pkgId); if (!p) return;
    const msg = `Untuk beli pakej "${p.label}" (RM${p.rm}), hubungi admin atau buat bayaran:\n\n` +
      `📱 WhatsApp: [Nombor GM]\n💳 TNG/Bank: [No. Akaun GM]\n\n` +
      `Selepas bayar, hantar bukti kepada GM untuk pengesahan.`;
    alert(msg);
    window.addChat?.('', `💝 Memilih pakej ${p.label} (RM${p.rm}) — hubungi GM untuk bayaran.`, 'system');
  }

  async function redeemCode() {
    const code = document.getElementById('donatCodeInp')?.value.trim().toUpperCase();
    const st = document.getElementById('donateStatus');
    if (!code) { st.textContent='Masukkan kod top-up!'; st.className='status-msg st-err'; return; }
    if (!window.SB || window.offlineMode) { st.textContent='Perlu online untuk guna kod.'; return; }

    st.textContent = 'Semak kod...'; st.className = 'status-msg st-info';
    try {
      const { data, error } = await window.SB.from('kn_topup_codes')
        .select('*').eq('code', code).eq('used', false).maybeSingle();
      if (error || !data) { st.textContent='Kod tidak sah atau sudah digunakan!'; st.className='status-msg st-err'; return; }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        st.textContent='Kod sudah tamat tempoh!'; st.className='status-msg st-err'; return;
      }
      // Redeem
      const pts = data.points;
      window.selChar.points = (window.selChar.points||0) + pts;
      NatPts.add(window.selChar.faction, Math.floor(pts/10));
      await window.SB.from('kn_topup_codes').update({ used:true, used_by:window.selChar.char_name, used_at:new Date().toISOString() }).eq('id', data.id);
      window.saveProgress?.();
      st.textContent = `✓ Berjaya! +${pts} points!`; st.className='status-msg st-ok';
      window.addChat?.('', `💎 Top-up berjaya: +${pts} points!`, 'system');
      _render();
    } catch(e) { st.textContent = 'Ralat: ' + e.message; st.className='status-msg st-err'; }
  }

  return { openDonatePanel, close, selectPkg, redeemCode, NatPts };
})();
window.DonationSystem = DonationSystem;

// ═══════════════════════════════════════════════════════════
// HOOK — Inject buttons into HUD / Menu
// ═══════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  // Add CSS animation for achievement popup
  const style = document.createElement('style');
  style.textContent = `
    @keyframes achIn { from{opacity:0;transform:translateX(-50%) translateY(-20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  `;
  document.head.appendChild(style);
});

window.addEventListener('load', () => {
  // Track kills for achievements/weekly
  const _waitG = setInterval(() => {
    if (!window.G?.tick) return; clearInterval(_waitG);
    const _origTick = window.G.tick.bind(window.G);
    window.G.tick = function(dt) {
      _origTick(dt);
      if (this.state !== 'play') return;
      // Track enemy kills for achievements
      this.enemies?.forEach(e => {
        if (e.dead && !e._achTracked) {
          e._achTracked = true;
          const ch = window.selChar; if (!ch) return;
          ch._totalKills = (ch._totalKills||0) + 1;
          if (e.boss) { ch._bossKills = (ch._bossKills||0)+1; EventSystem.trackWeekly('boss'); }
          EventSystem.trackWeekly('kill');
          if (ch._totalKills % 50 === 0) Achievements.check(ch);
        }
      });
    };
  }, 400);

  // Add World Map & Achievement buttons to ingame menu
  const _waitMenu = setInterval(() => {
    const menu = document.getElementById('ingameMenu');
    if (!menu) return; clearInterval(_waitMenu);
    const extra = document.createElement('div');
    extra.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-top:4px';
    extra.innerHTML = `
      <button class="im-btn" onclick="WorldMap.open();closeIngameMenu()">🗺️ World Map</button>
      <button class="im-btn" onclick="Achievements.openPanel();closeIngameMenu()">🏆 Achievement</button>
      <button class="im-btn" onclick="EventSystem.openPanel();closeIngameMenu()">📅 Event & Cabaran</button>
      <button class="im-btn" onclick="DonationSystem.openDonatePanel();closeIngameMenu()">💝 Donasi & Top-up</button>`;
    menu.appendChild(extra);
  }, 500);
});
