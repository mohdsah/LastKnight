'use strict';
/* ═══════════════════════════════════════════════════════════
   KO Classic — Farming System
   ▸ Item Drop (dengan rarity & warna)
   ▸ Level Up System (EXP proper)
   ▸ Boss Spawn Timer
   ▸ Farm Zones (respawn berkelompok)
   ▸ Colony Zone (CZ) — Rebut Castle & Koloni
   ═══════════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════
// 1. ITEM DROP SYSTEM
// ══════════════════════════════════════════════════════
window.groundItems = window.groundItems || [];
const groundItems = window.groundItems;

function rollDrops(monsterType, monsterLv) {
  const table = window.DROP_TABLE_EXT[monsterType] || window.DROP_TABLE[monsterType] || [];
  const drops = [];
  for (const d of table) {
    if (monsterLv < (d.minLv || 1)) continue;
    if (Math.random() < d.rate) {
      drops.push(d.id);
      break; // KO style: 1 item per kill (dapat 1 sahaja)
    }
  }
  return drops;
}

function spawnDropItems(x, y, monsterType, monsterLv) {
  const drops = rollDrops(monsterType, monsterLv || 1);
  for (const itemId of drops) {
    const item = window.ITEM_DB[itemId];
    if (!item) continue;
    groundItems.push({
      id: itemId,
      x: x + (Math.random() - .5) * 40,
      y: y + (Math.random() - .5) * 40,
      timer: 30,   // 30 saat sebelum hilang
      bob: Math.random() * Math.PI * 2,
      rarity: item.rarity || 'common',
    });
  }
}

function tickGroundItems(dt, player) {
  for (let i = groundItems.length - 1; i >= 0; i--) {
    const gi = groundItems[i];
    gi.timer -= dt;
    gi.bob   += dt * 2.5;
    if (gi.timer <= 0) { groundItems.splice(i, 1); continue; }
    // Auto-pickup bila player dekat
    if (Math.hypot(player.x - gi.x, player.y - gi.y) < 38) {
      pickupItem(gi.id);
      showDropNotif(gi.id, gi.rarity);
      groundItems.splice(i, 1);
    }
  }
}

function pickupItem(itemId) {
  if (!window.selChar) return;
  if (!window.selChar.inventory) window.selChar.inventory = {};
  const item = window.ITEM_DB[itemId];
  if (!item) return;
  // Item non-stack: buat salinan unik
  if (!item.stack) {
    const copyId = itemId + '_' + Date.now();
    window.ITEM_DB[copyId] = { ...item, enh: 0 };
    window.selChar.inventory[copyId] = 1;
    addChat('', '📦 Got: ' + item.name, 'system');
  } else {
    window.selChar.inventory[itemId] = (window.selChar.inventory[itemId] || 0) + 1;
    addChat('', '📦 Got: ' + item.name + (window.selChar.inventory[itemId] > 1 ? ' x' + window.selChar.inventory[itemId] : ''), 'system');
  }
}

function showDropNotif(itemId, rarity) {
  const item = window.ITEM_DB[itemId]; if (!item) return;
  const col = window.RARITY_COLOR[rarity] || '#aaa';
  // Guard: pastikan G.pl wujud sebelum cipta floating text
  if (G && window.G.pl && window.G.fts) {
    if(G?.pl) window.G.fts.push(new FT(window.G.pl.x, window.G.pl.y - 45, '+ ' + item.name, col, 13));
  }
  // Audio SFX
  if (typeof Audio!=='undefined') {
    if (rarity==='rare'||rarity==='epic'||rarity==='legendary') Audio.playSFX('raredrop');
    else Audio.playSFX('itemdrop');
  }
  // Rare+ buat notif besar
  if (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') {
    const el = document.getElementById('dropBigNotif');
    if (el) {
      el.innerHTML = `<span style="color:${col}">${item.icon} ${item.name}</span>`;
      el.style.opacity = '1';
      setTimeout(() => { el.style.opacity = '0'; }, 3500);
    }
  }
}

function drawGroundItems() {
  for (const gi of groundItems) {
    const yOff = Math.sin(gi.bob) * 4;
    const col   = window.RARITY_COLOR[gi.rarity] || '#aaa';
    const alpha = Math.min(1, gi.timer / 5);
    const item  = window.ITEM_DB[gi.id];
    cx.save();
    cx.globalAlpha = alpha;
    // Glow aura ikut rarity
    if (gi.rarity !== 'common') {
      cx.shadowColor = col; cx.shadowBlur = gi.rarity === 'legendary' ? 18 : 10;
    }
    cx.font = '16px serif'; cx.textAlign = 'center';
    cx.fillText(item?.icon || '📦', gi.x, gi.y + yOff);
    // Label
    cx.shadowBlur = 0;
    cx.fillStyle = col;
    cx.font = '9px "Share Tech Mono",monospace';
    cx.fillText(item?.name || gi.id, gi.x, gi.y + yOff + 14);
    cx.restore();
  }
}

// ══════════════════════════════════════════════════════
// 2. LEVEL UP SYSTEM (EXP Proper)
// ══════════════════════════════════════════════════════
function gainExp(amount) {
  if (!window.selChar) return;
  window.selChar.xp = (window.selChar.xp || 0) + amount;
  const lv = window.selChar.level || 1;
  const need = expRequired(lv);

  // EXP bar update
  updateExpBar();

  if (window.selChar.xp >= need) {
    window.selChar.xp -= need;
    window.selChar.level = lv + 1;

    // Stat points setiap level
    window.selChar.stat_pts = (window.selChar.stat_pts || 0) + window.STAT_PER_LEVEL;

    // Skill point setiap 5 level
    if (window.selChar.level % 5 === 0) {
      window.selChar.skill_pts = (window.selChar.skill_pts || 0) + window.SKILL_PT_PER_5LV;
    }

    if (window.G.pl) window.G.pl.applyChar(window.selChar);
    showLvNotif();
    if (typeof Audio!=='undefined') Audio.playSFX('levelup');
    addChat('', '🎉 Level Up! Now Lv.' + window.selChar.level + ' (+' + window.STAT_PER_LEVEL + ' stat points)', 'system');

    // Level 5 bonus: Skill Point
    if (window.selChar.level % 5 === 0) {
      addChat('', '✨ +1 Skill Point gained!', 'system');
    }

    window.saveProgress?.();
  }
}

function updateExpBar() {
  if (!window.selChar) return;
  const lv   = window.selChar.level || 1;
  const xp   = window.selChar.xp || 0;
  const need = expRequired(lv);
  const pct  = Math.min(100, xp / need * 100);

  const xpB = document.getElementById('xpB'); if (xpB) xpB.style.width = pct + '%';
  const xpV = document.getElementById('xpV'); if (xpV) xpV.textContent = xp.toLocaleString() + '/' + need.toLocaleString();
  const lvB = document.getElementById('lvB'); if (lvB) lvB.textContent = 'LV ' + lv;
}

// ── Stat Point Allocate ───────────────────────────────
// NOTA: openStatAlloc() didefinisi dalam init.js sebagai safe wrapper.
// Fungsi dalaman ini dipanggil terus oleh allocStat & renderStatAlloc sahaja.
function renderStatAlloc() {
  const pts   = window.selChar?.stat_pts || 0;
  const sKeys = ['stat_str','stat_hp','stat_dex','stat_int','stat_mp'];
  const sLbls = { stat_str:'STR (ATK)', stat_hp:'VIT (HP)', stat_dex:'DEX (Speed/Crit)', stat_int:'INT (Magic)', stat_mp:'WIS (MP)' };
  let html = `<div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;color:var(--gold);margin-bottom:8px">
    Available Points: <span style="color:#ffcc44">${pts}</span></div>`;
  for (const k of sKeys) {
    const val = window.selChar?.[k] || 0;
    html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
      <div style="font-family:'Cinzel',serif;font-size:.6rem;color:var(--muted);width:110px">${sLbls[k]}</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;color:var(--gold);width:35px">${val}</div>
      <button class="stat-btn" onclick="allocStat('${k}')" ${pts<=0?'disabled':''}>+</button>
    </div>`;
  }
  html += `<button class="btn btn-gold" style="width:100%;margin-top:8px;padding:8px" onclick="document.getElementById('statAllocPanel').classList.add('off')">Close</button>`;
  document.getElementById('statAllocBody').innerHTML = html;
}
function allocStat(key) {
  if (!window.selChar || (window.selChar.stat_pts || 0) <= 0) return;
  window.selChar.stat_pts--;
  window.selChar[key] = (window.selChar[key] || 0) + 1;
  if (window.G.pl) window.G.pl.applyChar(window.selChar);
  renderStatAlloc();
  window.saveProgress?.();
}

// ══════════════════════════════════════════════════════
// 3. BOSS SPAWN TIMER SYSTEM
// ══════════════════════════════════════════════════════
let bossSpawnList = [];   // senarai spawn aktif untuk zone semasa

function initBossSpawns(zoneId) {
  bossSpawnList = (window.BOSS_SPAWNS?.[zoneId] || []).map(s => ({ ...s }));
}

function tickBossSpawns(dt) {
  for (const spawn of bossSpawnList) {
    if (spawn.active) continue;
    spawn.timer -= dt;
    if (spawn.timer <= 0) {
      spawn.timer  = spawn.spawnEvery;
      spawn.active = true;
      // Spawn boss
      window.G.enemies.push(new Enemy(spawn.x, spawn.y, spawn.type));
      showWvNotif('💀 ' + spawn.label + ' muncul!');
      addChat('', '⚠️ ' + spawn.label + ' has spawned!', 'system');
      if (typeof Audio!=='undefined') Audio.playSFX('bossSpawn');
    }
  }
  // Mark inactive bila boss mati
  for (const spawn of bossSpawnList) {
    if (!spawn.active) continue;
    const stillAlive = window.G.enemies.some(e => !e.dead && e.type === spawn.type &&
      Math.hypot(e.x - spawn.x, e.y - spawn.y) < 400);
    if (!stillAlive) spawn.active = false;
  }
}

function drawBossTimers() {
  // Tunjuk countdown boss timer di HUD
  const el = document.getElementById('bossTimerList'); if (!el) return;
  if (bossSpawnList.length === 0) { el.innerHTML = ''; return; }
  el.innerHTML = bossSpawnList.map(s => {
    if (s.active) return `<div class="boss-timer-row active">💀 ${s.label} <span>ALIVE</span></div>`;
    const m = Math.floor(s.timer / 60), ss = Math.floor(s.timer % 60);
    return `<div class="boss-timer-row">⏱ ${s.label} <span>${m}:${ss.toString().padStart(2,'0')}</span></div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════
// 4. FARM ZONE RESPAWN SYSTEM
// ══════════════════════════════════════════════════════
let farmSpawnList = [];

function initFarmZones(zoneId) {
  const fz = window.FARM_ZONES[zoneId] || [];
  farmSpawnList = fz.map(z => ({
    ...z,
    spawnedIds: [],   // ID musuh yang baru dipaparkan
    respawnT:   0,    // kiraan respawn
  }));
}

function tickFarmZones(dt) {
  for (const fz of farmSpawnList) {
    // Kira berapa musuh dari farm zone ini masih hidup
    const alive = fz.spawnedIds.filter(id =>
      window.G.enemies.some(e => e._farmId === id && !e.dead)
    ).length;

    if (alive < fz.count) {
      fz.respawnT += dt;
      if (fz.respawnT >= fz.respawnSec) {
        fz.respawnT = 0;
        // Spawn 1 musuh baru dalam radius farm zone
        const angle = Math.random() * Math.PI * 2;
        const dist  = Math.random() * fz.radius;
        const x = Math.max(60, Math.min(WW - 60, fz.x + Math.cos(angle) * dist));
        const y = Math.max(60, Math.min(WH - 60, fz.y + Math.sin(angle) * dist));
        const e = new Enemy(x, y, fz.type);
        e._farmId = Date.now() + Math.random();
        window.G.enemies.push(e);
        fz.spawnedIds.push(e._farmId);
      }
    }
    // Bersihkan ID yang dah mati
    fz.spawnedIds = fz.spawnedIds.filter(id =>
      window.G.enemies.some(e => e._farmId === id && !e.dead)
    );
  }
}

function drawFarmZoneMarkers() {
  // Debug: tunjuk boundary farm zone (boleh disable)
  if (!window.showFarmZones) return;
  for (const fz of farmSpawnList) {
    cx.save();
    cx.strokeStyle = 'rgba(201,168,76,.15)';
    cx.lineWidth = 1;
    cx.setLineDash([4, 4]);
    cx.beginPath();
    cx.arc(fz.x, fz.y, fz.radius, 0, Math.PI * 2);
    cx.stroke();
    cx.restore();
  }
}

// ══════════════════════════════════════════════════════
// 5. COLONY ZONE (CZ) SYSTEM
// ══════════════════════════════════════════════════════
let czData = null;   // data CZ aktif (clone dari window.CZ_ZONE)
let czTimer = 0;
let czActive = false;
const CZ_DURATION = 1200;  // 20 minit

function initCZ() {
  // Deep clone CZ data
  try { czData = JSON.parse(JSON.stringify(window.CZ_ZONE)); } catch(e) { czData = {}; }
  czTimer  = CZ_DURATION;
  czActive = true;
  addChat('', '🏰 Colony Zone War bermula! Rebut koloni untuk menang!', 'system');
  showNWNotif('🏰 COLONY ZONE WAR BERMULA!');
  document.getElementById('czHud')?.classList.remove('off');
  updateCZHud();
}

function tickCZ(dt) {
  if (!czActive || !czData) return;
  czTimer -= dt;
  if (czTimer <= 0) { endCZ(); return; }

  const player = window.G.pl; if (!player) return;
  const myFac  = window.selChar?.faction || 'elmorad';

  // ── Castle capture ────────────────────────────────
  const castle = czData.castle;
  const distCastle = Math.hypot(player.x - castle.x, player.y - castle.y);
  if (distCastle < 80 && castle.owner !== myFac) {
    castle.captureTime += dt;
    if (castle.captureTime >= castle.captureNeeded) {
      castle.captureTime = 0;
      castle.owner = myFac;
      addChat('', '🏰 Castle captured by ' + myFac + '!', 'system');
      showNWNotif('🏰 CASTLE DIREBUT!');
    }
  } else if (distCastle >= 80 && castle.owner !== myFac) {
    castle.captureTime = Math.max(0, castle.captureTime - dt * .5);
  }

  // ── Colony captures ───────────────────────────────
  for (const col of czData.colonies) {
    const d = Math.hypot(player.x - col.x, player.y - col.y);
    if (d < 60 && col.owner !== myFac) {
      col.capT += dt;
      if (col.capT >= col.capNeeded) {
        col.capT  = 0;
        col.owner = myFac;
        addChat('', '🏴 ' + col.name + ' captured!', 'system');
        showNWNotif('🏴 ' + col.name.toUpperCase() + ' DIREBUT!');
        if (typeof Audio!=='undefined') Audio.playSFX('colony_capture');
        // Reward EXP
        gainExp(500);
      }
    } else if (d >= 60) {
      col.capT = Math.max(0, col.capT - dt * .3);
    }
  }

  updateCZHud();
}

function endCZ() {
  czActive = false;
  if (!czData) return;

  // Kira skor berdasarkan kawasan dikuasai
  let elScore = 0, krScore = 0;
  if (czData.castle.owner === 'elmorad') elScore += 10;
  else if (czData.castle.owner === 'karus') krScore += 10;
  for (const col of czData.colonies) {
    if (col.owner === 'elmorad') elScore += 2;
    else if (col.owner === 'karus') krScore += 2;
  }

  const myFac   = window.selChar?.faction || 'elmorad';
  const myScore = myFac === 'elmorad' ? elScore : krScore;
  const winner  = elScore > krScore ? '🌟 El Morad' : krScore > elScore ? '🔥 Karus' : '🤝 Seri';

  showNWNotif('🏰 CZ TAMAT! Pemenang: ' + winner);
  addChat('', '🏰 Colony Zone tamat! El Morad: ' + elScore + ' pts | Karus: ' + krScore + ' pts', 'system');

  // Bagi ganjaran
  if (myFac === 'elmorad' ? elScore >= krScore : krScore >= elScore) {
    const gold = myScore >= 10 ? 3000 : 1000;
    const xp   = myScore >= 10 ? 8000 : 3000;
    window.selChar.gold = (window.selChar.gold || 0) + gold;
    gainExp(xp);
    addChat('', '🎁 Ganjaran: ' + gold + 'g + ' + xp + ' EXP!', 'system');
  }

  document.getElementById('czHud')?.classList.add('off');
  window.saveProgress?.();
  czData = null;
}

function updateCZHud() {
  if (!czData) return;
  const el   = document.getElementById('czHud'); if (!el) return;
  const m    = Math.floor(czTimer / 60), s = Math.floor(czTimer % 60);
  const myFac = window.selChar?.faction || 'elmorad';

  // Kira kawasan
  let elPts = 0, krPts = 0;
  if (czData.castle.owner === 'elmorad') elPts += 10;
  else if (czData.castle.owner === 'karus') krPts += 10;
  for (const col of czData.colonies) {
    if (col.owner === 'elmorad') elPts += 2;
    else if (col.owner === 'karus') krPts += 2;
  }

  document.getElementById('czTimer').textContent  = m + ':' + s.toString().padStart(2, '0');
  document.getElementById('czElPts').textContent  = elPts;
  document.getElementById('czKrPts').textContent  = krPts;

  // Update colony markers di minimap
  drawCZMinimap();
}

function drawCZMap() {
  if (!czData || !czActive) return;
  const myFac = window.selChar?.faction || 'elmorad';

  // ── Lukis Castle ─────────────────────────────────
  const c = czData.castle;
  const castleCol = c.owner === 'elmorad' ? '#c9a84c' : c.owner === 'karus' ? '#cc3333' : '#888888';
  cx.save(); cx.translate(c.x, c.y);
  cx.shadowColor = castleCol; cx.shadowBlur = 20;
  cx.fillStyle = castleCol + '33';
  cx.beginPath(); cx.arc(0, 0, 80, 0, Math.PI * 2); cx.fill();
  cx.strokeStyle = castleCol; cx.lineWidth = 3;
  cx.beginPath(); cx.arc(0, 0, 80, 0, Math.PI * 2); cx.stroke();
  cx.fillStyle = castleCol;
  cx.font = '24px serif'; cx.textAlign = 'center'; cx.fillText('🏰', 0, 8);
  cx.fillStyle = castleCol;
  cx.font = 'bold 11px "Share Tech Mono",monospace';
  cx.fillText(c.owner ? c.owner.toUpperCase() : 'NEUTRAL', 0, -20);
  // Capture bar
  if (c.captureTime > 0 && c.owner !== myFac) {
    const bw = 80, pct = c.captureTime / c.captureNeeded;
    cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(-bw/2, -45, bw, 8);
    cx.fillStyle = myFac === 'elmorad' ? '#c9a84c' : '#cc3333';
    cx.fillRect(-bw/2, -45, bw * pct, 8);
  }
  cx.restore();

  // ── Lukis Colonies ────────────────────────────────
  for (const col of czData.colonies) {
    const colCol = col.owner === 'elmorad' ? '#c9a84c' : col.owner === 'karus' ? '#cc3333' : '#888888';
    cx.save(); cx.translate(col.x, col.y);
    cx.shadowColor = colCol; cx.shadowBlur = 12;
    cx.fillStyle = colCol + '22';
    cx.beginPath(); cx.arc(0, 0, 55, 0, Math.PI * 2); cx.fill();
    cx.strokeStyle = colCol; cx.lineWidth = 2;
    cx.strokeRect(-18, -18, 36, 36);
    cx.fillStyle = colCol;
    cx.font = '14px serif'; cx.textAlign = 'center'; cx.fillText('🏴', 0, 5);
    cx.fillStyle = colCol;
    cx.font = '9px "Share Tech Mono",monospace';
    cx.fillText(col.owner ? col.owner.slice(0, 3).toUpperCase() : 'NEU', 0, -22);
    // Capture bar
    if (col.capT > 0 && col.owner !== myFac) {
      const bw = 50, pct = col.capT / col.capNeeded;
      cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(-bw/2, -35, bw, 6);
      cx.fillStyle = myFac === 'elmorad' ? '#c9a84c' : '#cc3333';
      cx.fillRect(-bw/2, -35, bw * pct, 6);
    }
    cx.restore();
  }
}

function drawCZMinimap() {
  if (!czData) return;
  const mc = document.getElementById('mmCanvas'); if (!mc) return;
  const mw = mc.width, mh = mc.height;
  // Overlay titik castle & koloni
  const mctx = mc.getContext('2d');
  // Castle
  const c = czData.castle;
  const cx2 = c.x / WW * mw, cy2 = c.y / WH * mh;
  const castleCol = c.owner === 'elmorad' ? '#c9a84c' : c.owner === 'karus' ? '#cc3333' : '#888';
  mctx.fillStyle = castleCol;
  mctx.fillRect(cx2 - 3, cy2 - 3, 6, 6);
  // Colonies
  for (const col of czData.colonies) {
    const colCol = col.owner === 'elmorad' ? '#c9a84c' : col.owner === 'karus' ? '#cc3333' : '#555';
    mctx.fillStyle = colCol;
    mctx.beginPath();
    mctx.arc(col.x / WW * mw, col.y / WH * mh, 2.5, 0, Math.PI * 2);
    mctx.fill();
  }
}

// ── Panel CZ ─────────────────────────────────────────
// NOTA: openCZPanel() didefinisi dalam init.js sebagai safe wrapper.
// renderCZPanel() dipanggil dari sana.
function renderCZPanel() {
  const myFac = window.selChar?.faction || 'elmorad';
  const isInCZ = window.G.currentZone === 'cz';
  let html = `
    <div class="nw-panel">
      <div class="nw-panel-title">🏰 Colony Zone War</div>
      <div style="font-size:.65rem;color:var(--muted);line-height:1.7;margin-top:6px">
        Rebut <b style="color:var(--gold)">4 Koloni</b> dan <b style="color:var(--gold)">1 Castle</b> untuk menang!<br>
        Berdiri di atas koloni/castle untuk merebut.<br>
        Bunuh monster CZ Guardian untuk mendapat mata tambahan.
      </div>
    </div>`;
  if (czActive && czData) {
    let elPts=0, krPts=0;
    if (czData.castle.owner==='elmorad') elPts+=10; else if (czData.castle.owner==='karus') krPts+=10;
    for (const col of czData.colonies) { if(col.owner==='elmorad') elPts+=2; else if(col.owner==='karus') krPts+=2; }
    const m=Math.floor(czTimer/60), s=Math.floor(czTimer%60);
    html += `
      <div style="background:rgba(0,0,0,.35);border:1px solid rgba(201,168,76,.15);border-radius:4px;padding:10px;margin-bottom:8px">
        <div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;color:#ffcc44;text-align:center;margin-bottom:5px">⏱ ${m}:${s.toString().padStart(2,'0')}</div>
        <div class="nw-vs">
          <div class="nw-side el"><div class="nw-side-name">🌟 El Morad</div><div class="nw-side-score">${elPts}</div></div>
          <div class="nw-vs-sep">pts</div>
          <div class="nw-side kr"><div class="nw-side-name">🔥 Karus</div><div class="nw-side-score">${krPts}</div></div>
        </div>
        <div style="font-family:'Cinzel',serif;font-size:.6rem;color:rgba(201,168,76,.4);text-align:center;margin-top:6px">
          Castle: ${czData.castle.owner||'Neutral'} &nbsp;|&nbsp;
          Koloni: ${czData.colonies.filter(c=>c.owner===myFac).length}/4
        </div>
      </div>`;
    html += `<button class="btn btn-gold" style="width:100%;padding:10px;font-size:.72rem" onclick="gotoAndPlay('cz');document.getElementById('czPanel').classList.add('off')">⚔️ Pergi ke CZ</button>`;
  } else {
    html += `
      <div style="font-family:'Cinzel',serif;font-size:.65rem;color:var(--muted);text-align:center;padding:10px">
        CZ War tidak aktif sekarang.
      </div>
      <button class="btn btn-gold" style="width:100%;padding:10px;font-size:.72rem" onclick="startCZWar()">🏰 Mula CZ War</button>`;
  }
  html += `<div style="margin-top:6px"><button class="btn btn-dim" style="width:100%;font-size:.62rem;padding:7px" onclick="document.getElementById('czPanel').classList.add('off')">Close</button></div>`;
  document.getElementById('czBody').innerHTML = html;
}

function startCZWar() {
  initCZ();
  document.getElementById('czPanel')?.classList.add('off');
  gotoAndPlay('cz');
}

// ══════════════════════════════════════════════════════
// HOOK ke game loop (dipanggil dari game.js)
// ══════════════════════════════════════════════════════
function farmingTick(dt) {
  if (!window.G.pl) return;
  tickGroundItems(dt, window.G.pl);
  tickBossSpawns(dt);
  tickFarmZones(dt);
  if (czActive) tickCZ(dt);
  drawBossTimers();
}

function farmingDraw() {
  drawGroundItems();
  if (czActive && window.G.currentZone === 'cz') drawCZMap();
  drawFarmZoneMarkers();
}

function farmingInitZone(zoneId) {
  initBossSpawns(zoneId);
  initFarmZones(zoneId);
  groundItems.length = 0;
  const zl = document.getElementById('zoneLabel');
  if (zl) zl.textContent = (window.ZONES[zoneId]?.name || zoneId).toUpperCase();
}

// Export globals
window.farmingTick = farmingTick;
window.gainExp = gainExp;
window.farmingInitZone = farmingInitZone;
window.farmingDraw = farmingDraw;
