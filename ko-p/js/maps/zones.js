'use strict';
/* ══ Maps: Extra Zones ══
   Diload selepas data.js — TAMBAH sahaja, tidak redefine
   ══════════════════════════════════════════════════════ */

// Pastikan window.ZONES sudah ada dari data.js
if (!window.ZONES) { console.error('[Maps] ZONES not found! Load data.js first'); }

// All playable zones: towns, fields, dungeons, colony zone

// New zones: Ardream, Luferson
window.ZONES['ardream'] = {
  name:'Ardream', icon:'⚔️', type:'field', safe:false, pvp:true,
  desc:'Tanah perang Ardream. Level 20-40.',
  bgColor:['#0d0808','#0a0606'], torchColor:'rgba(220,80,40,.12)',
  monsters:['orc','archer','dark_mage','goblin_king'],
  spawnX:1500, spawnY:1500, reqLv:20,
};
window.ZONES['luferson'] = {
  name:'Luferson Castle', icon:'🏯', type:'field', safe:false, pvp:true,
  desc:'Kubu Luferson. Level 40+. Hanya untuk veteran.',
  bgColor:['#060a14','#040810'], torchColor:'rgba(40,80,200,.12)',
  monsters:['dark_mage','boss','orc_warlord','demon_king'],
  spawnX:1200, spawnY:1200, reqLv:40,
};
window.ZONES['ardean'] = {
  name:'Ardean Basin', icon:'🌋', type:'field', safe:false, pvp:false,
  desc:'Lembah Ardean. Penuh dengan raksasa kuat.',
  bgColor:['#100810','#0c060c'], torchColor:'rgba(180,40,180,.12)',
  monsters:['boss','demon_king','dark_mage'],
  spawnX:1000, spawnY:1000, reqLv:60,
};

// Export
if (typeof window !== 'undefined') {
}
