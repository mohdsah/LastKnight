'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — Audio Settings
   Volume settings, localStorage persistence
   ══════════════════════════════════════════════════════ */

// Bahagian ini adalah sebahagian dari Audio object dalam js/audio.js
// Salin kandungan ini ke dalam Audio = (() => { ... }) jika perlu
// custom integration.

/*
  // ── Settings (simpan dalam localStorage) ────────────
  const SETTINGS_KEY = 'ko_audio_settings';
  let settings = {
    masterVol : 0.7,
    musicVol  : 0.5,
    sfxVol    : 0.8,
    muted     : false,
  };

  function loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      Object.assign(settings, s);
    } catch {}
  }
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
  }

*/
