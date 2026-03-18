'use strict';

if (window.BOSS_SPAWNS) {
/* ══ Maps: Boss Spawn Config ══
   Extend window.BOSS_SPAWNS dari data.js
   World Boss diurus oleh js/systems/worldboss.js
   ════════════════════════════════════════════ */


// Tambah boss spawns untuk zone baru
window.BOSS_SPAWNS['ardream'] = window.BOSS_SPAWNS['ardream'] || [
  { type:'goblin_king', x:1400, y:600,  label:'Raja Goblin',  spawnEvery:180, timer:60,  active:false },
  { type:'orc_warlord', x:800,  y:1200, label:'Panglima Orc', spawnEvery:300, timer:120, active:false },
];

window.BOSS_SPAWNS['luferson'] = window.BOSS_SPAWNS['luferson'] || [
  { type:'demon_king', x:1200, y:800, label:'Raja Iblis', spawnEvery:600, timer:180, active:false },
];

}
