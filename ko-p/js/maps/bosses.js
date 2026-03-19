'use strict';
/* ══ Maps: World Boss Config ══
   Extend BOSS_SPAWNS dari data.js dengan World Boss
   ══════════════════════════════════════════════════ */

if (!window.BOSS_SPAWNS) { console.error('[Maps] BOSS_SPAWNS not found!'); }

// World Boss — spawn every 2 hours, notify semua player
window.WORLD_BOSS = {
  active: false,
  type: 'demon_king',
  zone: 'ronark',
  x: 1200, y: 800,
  spawnInterval: 7200, // 2 jam dalam seconds
  timer: 7200,
  label: '🐉 Naga Kegelapan',
  reward: { xp: 15000, gold: 3000, item: 'sword_legend' },
  damageLog: {}, // uid → damage
};
