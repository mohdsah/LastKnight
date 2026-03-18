'use strict';
/* ═══════════════════════════════════════════════════
   Pahlawan Terakhir — init.js
   Versi  : 6.1
   Tarikh : 17 Mac 2026
   Diload PERTAMA — definisi semua global onclick
   ═══════════════════════════════════════════════════ */

window.PT_VERSION   = '6.1';
window.PT_BUILDDATE = '2026-03-16';
console.log('%c⚔ Pahlawan Terakhir v5.0', 'color:#c9a84c;font-size:14px;font-weight:bold');

// ── Safe queue system ─────────────────────────────────
window._ready = false;
window._queue = [];

function _safe(fn) {
  if (window._ready) { try { fn(); } catch(e) { console.error('[PT]',e); } }
  else { window._queue.push(fn); }
}

window._flush = function() {
  window._ready = true;
  const q = window._queue.splice(0);
  q.forEach(f => { try { f(); } catch(e) { console.error('[PT] queue err:',e); } });
};

// ── ENTER GAME WORLD — safe retry version ────────────
function enterGameWorld() {
  // Semak semua dependencies
  if (typeof window.G === 'undefined'
   || typeof window.ZONES === 'undefined'
   || typeof window.selChar === 'undefined'
   || typeof window.hideAll !== 'function') {
    // Retry sehingga 5 saat
    if (!window._ewTries) window._ewTries = 0;
    if (++window._ewTries < 50) {
      setTimeout(enterGameWorld, 100);
    } else {
      window._ewTries = 0;
      console.error('[PT] enterGameWorld: masih gagal selepas 5s');
    }
    return;
  }
  window._ewTries = 0;
  if (!window.selChar) {
    typeof addChat==='function' && addChat('','Pilih watak dahulu!','system');
    return;
  }
  _doGotoAndPlay(window.selChar.current_zone || 'moradon');
}

// ── CORE GOTO FUNCTION ───────────────────────────────
function _doGotoAndPlay(zoneId) {
  const G = window.G;
  if (!G || !window.selChar || !window.ZONES) {
    console.error('[PT] _doGotoAndPlay: missing deps'); return;
  }

  // Validate zone wujud — fallback ke moradon jika tidak
  if (!window.ZONES[zoneId]) {
    console.warn(`[PT] Zone '${zoneId}' tidak wujud dalam ZONES, fallback ke moradon`);
    if (typeof addChat === 'function') addChat('', `⚠️ Zone '${zoneId}' belum tersedia.`, 'system');
    zoneId = 'moradon';
  }

  G.currentZone = zoneId;
  window.selChar.current_zone = zoneId;

  document.getElementById('ingameMenu')?.classList.remove('show');
  if (typeof hideAll === 'function') hideAll();

  ['hud','skillBar','topBtns','minimap','chatBox','muteBtn'].forEach(id => {
    if (typeof sc === 'function') sc(id,'on');
  });
  if (!window.offlineMode && window.SB) {
    if (typeof sc === 'function') sc('opill','on');
  }
  if (typeof sc === 'function') sc('pkStatus','on');
  const pkEl = document.getElementById('pkStatus');
  if (pkEl) { pkEl.className='pk-peace'; pkEl.innerHTML='<div class="pk-indicator"></div><span>PEACE</span>'; }

  const zone = window.ZONES[zoneId];
  const btp  = document.getElementById('bossTimerPanel');
  if (btp) btp.classList.toggle('off', zone?.type==='town');
  document.getElementById('expBarFull')?.classList.remove('off');

  if (window.opMap) for (const k in window.opMap) delete window.opMap[k];
  G.init();
  if (typeof initRT === 'function') initRT();

  const zl = document.getElementById('zoneLabel');
  if (zl) zl.textContent = (zone?.name||zoneId).toUpperCase();
  if (typeof showZoneBanner === 'function') showZoneBanner(zoneId);
  if (typeof Audio !== 'undefined') Audio.playZoneMusic(zoneId);
  if (typeof updateExpBar === 'function') updateExpBar();
}

// Expose
window.gotoAndPlay = _doGotoAndPlay;

// ── UI HELPERS ────────────────────────────────────────
function toggleIngameMenu() {
  document.getElementById('ingameMenu')?.classList.toggle('show');
}
function closeIngameMenu() {
  document.getElementById('ingameMenu')?.classList.remove('show');
}

// ── SAFE WRAPPERS ─────────────────────────────────────
function goMenu()           { _safe(()=>{ if(typeof _goMenu==='function')_goMenu(); }); }
function goCharSelect()     { _safe(()=>{ if(typeof hideAll==='function')hideAll(); const s=document.getElementById('charSelectSc');s?.classList.remove('off');if(typeof renderCharSlots==='function')renderCharSlots(); }); }
function doLogout()         { _safe(()=>{ if(typeof _doLogout_real==='function')_doLogout_real(); }); }
function openInventory()    { _safe(()=>{ const p=document.getElementById('invPanel');p?.classList.remove('off');if(typeof renderEquipSlots==='function')renderEquipSlots(); }); }
function openSkillTree()    { _safe(()=>{ const p=document.getElementById('skillTreePanel');p?.classList.remove('off');if(typeof renderSkillTree==='function')renderSkillTree(); }); }
function openStats()        { _safe(()=>{ const p=document.getElementById('statsPanel2');p?.classList.remove('off');if(typeof renderStats==='function')renderStats(); }); }
function openStatAlloc()    { _safe(()=>{ const p=document.getElementById('statAllocPanel');if(p&&window.selChar&&(window.selChar.stat_pts||0)>0){p.classList.remove('off');if(typeof renderStatAlloc==='function')renderStatAlloc();}else if(typeof addChat==='function')addChat('','Tiada stat points yang tersedia!','system'); }); }
function openParty()        { _safe(()=>{ if(typeof window._openParty==='function')window._openParty(); }); }
function openNWPanel()      { _safe(()=>{ if(typeof window._openNWPanel==='function')window._openNWPanel(); }); }
function openDungeon()      { _safe(()=>{ if(typeof window._openDungeon==='function')window._openDungeon(); }); }
function openCZPanel()      { _safe(()=>{ const p=document.getElementById('czPanel');p?.classList.remove('off');if(typeof renderCZPanel==='function')renderCZPanel(); }); }
function openPowerUpStore() { _safe(()=>{ const p=document.getElementById('pstorePanel');if(p){p.classList.remove('off');if(typeof renderPStore==='function')renderPStore('weapon');if(typeof updatePStoreHeader==='function')updatePStoreHeader();} }); }
function openGuild()        { _safe(()=>{ const p=document.getElementById('guildPanel');p?.classList.remove('off');if(typeof loadGuildData==='function')loadGuildData(); }); }
function openMarket()       { _safe(()=>{ const p=document.getElementById('marketPanel');p?.classList.remove('off');if(typeof renderMarket==='function')renderMarket('browse'); }); }
function openQuests()       { _safe(()=>{ const p=document.getElementById('questPanel');p?.classList.remove('off');if(typeof loadQuestProgress==='function')loadQuestProgress();if(typeof renderQuests==='function')renderQuests(); }); }
function openCastleSiege()  { _safe(()=>{ const p=document.getElementById('siegePanel');p?.classList.remove('off');if(typeof renderSiegePanel==='function')renderSiegePanel(); }); }
function togglePK()         { _safe(()=>{ if(typeof _togglePK==='function')_togglePK(); }); }
function useQuickPotion()   { _safe(()=>{ if(typeof _useQuickPotion==='function')_useQuickPotion(); }); }
function sendChat()         { _safe(()=>{ if(typeof _sendChat==='function')_sendChat(); }); }

// Auth functions — direct (tidak perlu queue kerana dipanggil selepas load)
function doLogin()          { if(typeof _doLogin==='function')_doLogin(); else setTimeout(doLogin,100); }
function doRegister()       { if(typeof _doRegister==='function')_doRegister(); else setTimeout(doRegister,100); }
function cancelLogin()      { if(typeof _cancelLogin==='function')_cancelLogin(); }
function skipConfig()       { if(typeof _skipConfig==='function')_skipConfig(); }
function selectFaction(f)   { if(typeof _selectFaction==='function')_selectFaction(f); }
function confirmFaction()   { if(typeof _confirmFaction==='function')_confirmFaction(); }
function backToFaction()    { if(typeof _backToFaction==='function')_backToFaction(); }
function createCharacter()  { if(typeof _createCharacter==='function')_createCharacter(); }
function enterWorld()       { if(typeof _enterWorld==='function')_enterWorld(); }
function deleteChar()       { if(typeof _deleteChar==='function')_deleteChar(); }
function addStat(k)         { if(typeof _addStat==='function')_addStat(k); }
function cycleFace(d)       { if(typeof _cycleFace==='function')_cycleFace(d); }
