'use strict';
/* ═══════════════════════════════════════════════════
   Pahlawan Terakhir — init.js v5.4
   Diload PERTAMA — wrapper semua onclick HTML
   ═══════════════════════════════════════════════════ */

window.PT_VERSION   = '5.4';
window.PT_BUILDDATE = '2026-03-17';
console.log('%c⚔ Pahlawan Terakhir v5.4', 'color:#c9a84c;font-size:14px;font-weight:bold');

// ── Helper functions ──────────────────────────────
// Pakai document.getElementById terus - lebih selamat
function _el(id) { return document.getElementById(id); }
function _show(id) { const e=_el(id); if(e) e.classList.remove('off'); }
function _hide(id) { const e=_el(id); if(e) e.classList.add('off'); }
function _open(panelId, cb) {
  const p = _el(panelId);
  if (!p) return;
  p.classList.remove('off');
  if (typeof cb === 'function') cb();
}

// ── Deps check ────────────────────────────────────
function _depsReady() {
  return typeof window.G !== 'undefined'
      && typeof window.G.init === 'function'
      && typeof window.ZONES !== 'undefined'
      && typeof window.hideAll === 'function';
}

// ── ENTER GAME WORLD ─────────────────────────────
function enterGameWorld() {
  if (!_depsReady()) {
    if (!window._ewTry) window._ewTry = 0;
    if (++window._ewTry < 80) {
      setTimeout(enterGameWorld, 100);
    } else {
      window._ewTry = 0;
      console.error('[PT] enterGameWorld: dependencies timeout');
    }
    return;
  }
  window._ewTry = 0;

  const ch = window.selChar;
  if (!ch) {
    const ac = window.addChat;
    if (ac) ac('', 'Pilih watak dahulu!', 'system');
    return;
  }

  _gotoZone(ch.current_zone || 'moradon');
}

// ── GOTO ZONE — core function ─────────────────────
function _gotoZone(zoneId) {
  const G = window.G;
  if (!G || !G.init) {
    setTimeout(() => _gotoZone(zoneId), 100);
    return;
  }

  const ch = window.selChar;
  if (!ch) return;

  // Set zone
  G.currentZone = zoneId;
  ch.current_zone = zoneId;

  // Tutup ingame menu jika ada
  const igm = _el('ingameMenu');
  if (igm) igm.classList.remove('show');

  // Sembunyikan semua screen
  if (typeof window.hideAll === 'function') window.hideAll();

  // Tunjuk HUD
  ['hud','skillBar','topBtns','minimap','chatBox','muteBtn','pkStatus'].forEach(_show);
  if (!window.offlineMode && window.SB) _show('opill');

  // PK status
  const pk = _el('pkStatus');
  if (pk) {
    pk.className = 'pk-peace';
    pk.innerHTML = '<div class="pk-indicator"></div><span>PEACE</span>';
  }

  // Zone setup
  const zone = window.ZONES[zoneId];
  const btp  = _el('bossTimerPanel');
  if (btp) btp.classList.toggle('off', zone?.type === 'town');
  _show('expBarFull');

  // Clear online players
  if (window.opMap) {
    for (const k in window.opMap) delete window.opMap[k];
  }

  // Init game engine
  try {
    G.init();
  } catch(e) {
    console.error('[PT] G.init() error:', e);
  }

  // Realtime
  if (typeof window.initRT === 'function') {
    try { window.initRT(); } catch(e) {}
  }

  // Zone label
  const zl = _el('zoneLabel');
  if (zl) zl.textContent = (zone?.name || zoneId).toUpperCase();

  // Zone banner
  if (typeof window.showZoneBanner === 'function') {
    try { window.showZoneBanner(zoneId); } catch(e) {}
  }

  // Audio
  if (typeof Audio !== 'undefined' && Audio.playZoneMusic) {
    try { Audio.playZoneMusic(zoneId); } catch(e) {}
  }

  // EXP bar update
  if (typeof window.updateExpBar === 'function') {
    try { window.updateExpBar(); } catch(e) {}
  }
}

// Expose globals
window.gotoAndPlay    = _gotoZone;
window.enterGameWorld = enterGameWorld;

// ── IN-GAME MENU ──────────────────────────────────
function toggleIngameMenu() {
  const m = _el('ingameMenu');
  if (m) m.classList.toggle('show');
}
function closeIngameMenu() {
  const m = _el('ingameMenu');
  if (m) m.classList.remove('show');
}
window.toggleIngameMenu = toggleIngameMenu;
window.closeIngameMenu  = closeIngameMenu;

// ── PANEL OPENER HELPER ───────────────────────────
function _panel(id, fn) { _open(id, fn); }

// ── NAVIGATION ────────────────────────────────────
function goMenu() {
  if (typeof window.hideAll === 'function') window.hideAll();
  _show('menuSc');
  const ch = window.selChar;
  if (!ch) return;
  // Update menu UI
  const R = window.RACES, J = window.JOBS;
  const race = R?.[ch.race] || {};
  const isEl = ch.faction==='elmorad' || ch.faction==='cahaya';
  const set = (id, val) => { const e=_el(id); if(e) e.textContent=val; };
  const setC = (id, col) => { const e=_el(id); if(e) e.style.color=col; };
  const av = _el('mAvatar'); if(av) av.textContent = race.icon||'⚔️';
  set('mPname', ch.char_name);
  set('mFTag', isEl?'🌟 El Morad':'🔥 Karus');
  setC('mFTag', isEl?'var(--el)':'var(--kr)');
  set('mLv', ch.level||1);
  set('mGold', (ch.gold||0).toLocaleString());
  set('mPts', (ch.points||0).toLocaleString());
  if (typeof loadLB === 'function') loadLB().catch(()=>{});
  if (typeof Audio !== 'undefined') Audio.playZoneMusic?.('login');
}

function goCharSelect() {
  if (typeof window.hideAll === 'function') window.hideAll();
  _show('charSelectSc');
  if (typeof renderCharSlots === 'function') renderCharSlots();
}

function doLogout() {
  if (typeof window._doLogout_real === 'function') window._doLogout_real();
}

// ── PANEL OPENERS ─────────────────────────────────
function openInventory()   { _panel('invPanel',      () => { if(typeof renderEquipSlots==='function') renderEquipSlots(); }); }
function openSkillTree()   { _panel('skillTreePanel', () => { if(typeof renderSkillTree==='function') renderSkillTree(); }); }
function openStats()       { _panel('statsPanel2',   () => { if(typeof renderStats==='function') renderStats(); }); }
function openStatAlloc()   {
  const ch = window.selChar;
  if (!ch || !(ch.stat_pts > 0)) {
    if (typeof addChat === 'function') addChat('','Tiada stat points!','system');
    return;
  }
  _panel('statAllocPanel', () => { if(typeof renderStatAlloc==='function') renderStatAlloc(); });
}
function openParty()       { _panel('partyPanel',    () => { if(typeof renderPartyPanel==='function') renderPartyPanel(); }); }
function openNWPanel()     { _panel('nwPanel',       () => { if(typeof renderNWPanel==='function') renderNWPanel(); }); }
function openDungeon()     { _panel('dungeonPanel',  () => { if(typeof renderDungeons==='function') renderDungeons(); }); }
function openCZPanel()     { _panel('czPanel',       () => { if(typeof renderCZPanel==='function') renderCZPanel(); }); }
function openPowerUpStore(){ _panel('pstorePanel',   () => { if(typeof renderPStore==='function') renderPStore('weapon'); if(typeof updatePStoreHeader==='function') updatePStoreHeader(); }); }
function openGuild()       { _panel('guildPanel',    () => { if(typeof loadGuildData==='function') loadGuildData(); }); }
function openMarket()      { _panel('marketPanel',   () => { if(typeof renderMarket==='function') renderMarket('browse'); }); }
function openQuests()      { _panel('questPanel',    () => { if(typeof loadQuestProgress==='function') loadQuestProgress(); if(typeof renderQuests==='function') renderQuests(); }); }
function openCastleSiege() { _panel('siegePanel',    () => { if(typeof renderSiegePanel==='function') renderSiegePanel(); }); }
function openInn(id)       { if(typeof _openInn==='function') _openInn(id); }
function openBlacksmith(id){ if(typeof _openBlacksmith==='function') _openBlacksmith(id); }

// ── IN-GAME ACTIONS ───────────────────────────────
function togglePK()       { if(typeof _togglePK==='function') _togglePK(); }
function useQuickPotion() { if(typeof _useQuickPotion==='function') _useQuickPotion(); }
function sendChat()       { if(typeof _sendChat==='function') _sendChat(); }

// ── AUTH FUNCTIONS ────────────────────────────────
function doLogin()         { if(typeof _doLogin==='function') _doLogin(); else setTimeout(doLogin,100); }
function doRegister()      { if(typeof _doRegister==='function') _doRegister(); else setTimeout(doRegister,100); }
function cancelLogin()     { if(typeof _cancelLogin==='function') _cancelLogin(); }
function skipConfig()      { if(typeof _skipConfig==='function') _skipConfig(); }
function selectFaction(f)  { if(typeof _selectFaction==='function') _selectFaction(f); }
function confirmFaction()  { if(typeof _confirmFaction==='function') _confirmFaction(); }
function backToFaction()   { if(typeof _backToFaction==='function') _backToFaction(); }
function createCharacter() { if(typeof _createCharacter==='function') _createCharacter(); }
function enterWorld()      { if(typeof _enterWorld==='function') _enterWorld(); else setTimeout(enterWorld,100); }
function deleteChar()      { if(typeof _deleteChar==='function') _deleteChar(); }
function addStat(k)        { if(typeof _addStat==='function') _addStat(k); }
function cycleFace(d)      { if(typeof _cycleFace==='function') _cycleFace(d); }
