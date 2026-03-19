'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — Monster Data
   window.DROP_TABLE, DROP_TABLE_EXT, ENEMY_EXTRA, window.BOSS_SPAWNS
   ══════════════════════════════════════════════════════ */

const window.DROP_TABLE={goblin:[{id:'luna_stone',rate:.25},{id:'hpot_sm',rate:.3},{id:'wraith_stone',rate:.15},{id:'monsters_bead',rate:.4}],orc:[{id:'luna_stone',rate:.3},{id:'hpot_md',rate:.2},{id:'monsters_bead',rate:.45},{id:'chaos_stone',rate:.05}],archer:[{id:'wraith_stone',rate:.2},{id:'hpot_sm',rate:.35},{id:'mpot_sm',rate:.2},{id:'luna_stone',rate:.2}],dark_mage:[{id:'mpot_md',rate:.25},{id:'chaos_stone',rate:.08},{id:'monsters_bead',rate:.35},{id:'star_stone',rate:.02}],boss:[{id:'chaos_stone',rate:.35},{id:'star_stone',rate:.08},{id:'hpot_lg',rate:.4},{id:'ring_iron',rate:.05},{id:'amulet_jade',rate:.03},{id:'crystal_pure',rate:.04},{id:'elixir_power',rate:.02},{id:'robe_inferno',rate:.003},{id:'robe_holy',rate:.003},{id:'ring_fire',rate:.01}],goblin_king:[{id:'chaos_stone',rate:.4},{id:'hpot_lg',rate:.5},{id:'ring_gold',rate:.06},{id:'dagger_dark',rate:.02},{id:'bow_shadow',rate:.008},{id:'staff_holy',rate:.005}],orc_warlord:[{id:'star_stone',rate:.12},{id:'armor_chain',rate:.04},{id:'sword_steel',rate:.03},{id:'ring_ruby',rate:.01},{id:'hpot_lg',rate:.5},{id:'crystal_pure',rate:.06},{id:'armor_dark_knight',rate:.005},{id:'helm_dark_knight',rate:.004},{id:'glove_dark',rate:.008},{id:'boot_dark',rate:.008}],demon_king:[{id:'sword_legend',rate:.01},{id:'ring_ruby',rate:.03},{id:'amulet_power',rate:.02},{id:'star_stone',rate:.2},{id:'chaos_stone',rate:.5},{id:'dragon_scale',rate:.15},{id:'demon_core',rate:.08},{id:'ring_mythic',rate:.005},{id:'amulet_dragon',rate:.003},{id:'earring_mythic',rate:.003},{id:'staff_mythic',rate:.002},{id:'dagger_mythic',rate:.002},{id:'sword_mythic',rate:.002}]};

const DROP_TABLE_EXT = {
  // Format: [{ id, rate, minLv }]
  goblin: [
    { id:'luna_stone',   rate:.30, minLv:1  },
    { id:'hpot_sm',      rate:.40, minLv:1  },
    { id:'wraith_stone', rate:.20, minLv:1  },
    { id:'monsters_bead',rate:.50, minLv:1  },
    { id:'dagger_basic', rate:.04, minLv:1  },  // uncommon
    { id:'ring_iron',    rate:.02, minLv:5  },  // uncommon
  ],
  orc: [
    { id:'luna_stone',   rate:.35, minLv:1  },
    { id:'hpot_md',      rate:.25, minLv:1  },
    { id:'monsters_bead',rate:.50, minLv:1  },
    { id:'chaos_stone',  rate:.08, minLv:1  },
    { id:'sword_iron',   rate:.05, minLv:1  },
    { id:'armor_leather',rate:.04, minLv:5  },
    { id:'ring_iron',    rate:.03, minLv:8  },
  ],
  archer: [
    { id:'wraith_stone', rate:.25, minLv:1  },
    { id:'hpot_sm',      rate:.40, minLv:1  },
    { id:'mpot_sm',      rate:.25, minLv:1  },
    { id:'luna_stone',   rate:.25, minLv:1  },
    { id:'boot_cloth',   rate:.04, minLv:5  },
    { id:'glove_leather',rate:.03, minLv:5  },
  ],
  dark_mage: [
    { id:'mpot_md',      rate:.30, minLv:1  },
    { id:'chaos_stone',  rate:.12, minLv:1  },
    { id:'monsters_bead',rate:.40, minLv:1  },
    { id:'star_stone',   rate:.03, minLv:1  },
    { id:'staff_oak',    rate:.05, minLv:10 },
    { id:'robe_silk',    rate:.04, minLv:10 },
    { id:'amulet_jade',  rate:.02, minLv:15 },
  ],
  cz_guardian: [
    { id:'chaos_stone',  rate:.50, minLv:1  },
    { id:'star_stone',   rate:.15, minLv:1  },
    { id:'hpot_lg',      rate:.60, minLv:1  },
    { id:'ring_gold',    rate:.08, minLv:1  },
    { id:'armor_chain',  rate:.05, minLv:1  },
    { id:'dagger_dark',  rate:.05, minLv:1  },
  ],
  boss: [
    { id:'chaos_stone',  rate:.50, minLv:1  },
    { id:'star_stone',   rate:.12, minLv:1  },
    { id:'hpot_lg',      rate:.60, minLv:1  },
    { id:'ring_iron',    rate:.10, minLv:1  },
    { id:'amulet_jade',  rate:.06, minLv:1  },
    { id:'sword_steel',  rate:.04, minLv:10 },
    { id:'armor_chain',  rate:.04, minLv:10 },
    { id:'ring_gold',    rate:.03, minLv:15 },
  ],
  goblin_king: [
    { id:'chaos_stone',  rate:.60, minLv:1  },
    { id:'hpot_lg',      rate:.80, minLv:1  },
    { id:'ring_gold',    rate:.10, minLv:1  },
    { id:'dagger_dark',  rate:.06, minLv:1  },
    { id:'star_stone',   rate:.10, minLv:1  },
    { id:'helm_knight',  rate:.04, minLv:1  },
  ],
  orc_warlord: [
    { id:'star_stone',   rate:.20, minLv:1  },
    { id:'armor_chain',  rate:.08, minLv:1  },
    { id:'armor_plate',  rate:.03, minLv:1  },
    { id:'sword_knight', rate:.05, minLv:1  },
    { id:'ring_ruby',    rate:.02, minLv:1  },
    { id:'hpot_lg',      rate:.80, minLv:1  },
    { id:'amulet_power', rate:.01, minLv:1  },
  ],
  demon_king: [
    { id:'sword_legend', rate:.015,minLv:1  },
    { id:'ring_ruby',    rate:.04, minLv:1  },
    { id:'amulet_power', rate:.03, minLv:1  },
    { id:'star_stone',   rate:.30, minLv:1  },
    { id:'chaos_stone',  rate:.70, minLv:1  },
    { id:'earring_el',   rate:.02, minLv:1  },
    { id:'earring_kr',   rate:.02, minLv:1  },
    { id:'dagger_shadow',rate:.04, minLv:1  },
    { id:'staff_divine', rate:.04, minLv:1  },
  ],
};

// ── CZ GUARDIAN ENEMY STATS ───────────────────────────
// (ditambah dalam Enemy constructor di game.js)

const ENEMY_EXTRA = {
  cz_guardian: {
    hp: 400, spd:55, atk:25, sz:36, rng:55,
    rew:{ xp:150, gold:30, sc:500 },
    label:'🏰 Penjaga',
  },
};

// ── NPC TAMBAH: CZ Gate & Colony ─────────────────────
window.NPCS['cz_gate']    = { name:'Pintu CZ',       icon:'🚪', x:1100, y:1200, shop:null, dialog:'Selamat datang ke Colony Zone! Rebut semua Koloni untuk menang!', gate:'cz' };
window.NPCS['col_npc']    = { name:'Penguasa Koloni',icon:'🏴', x:1500, y:800,  shop:null, dialog:'Koloni ini milik siapa? Serang untuk rebutnya!' };
window.ZONES['moradon'].npc.push('cz_gate');

// ── SHOP TAMBAH: CZ Reward Shop ───────────────────────
window.SHOPS['cz_reward'] = {
  name:'Kedai Ganjaran CZ',
  tabs:{
    'Rare Items':['sword_knight','armor_plate','dagger_shadow','staff_divine','ring_ruby'],
    'Materials': ['star_stone','chaos_stone'],
    'Potion':    ['hpot_lg','mpot_md'],
  }
};

// ── INN NPC tambahan ────────────────────────────────
window.NPCS['innkeeper_el'] = {
  name:'Inn El Morad', icon:'🏨', x:400, y:380, type:'inn', heal:true,
  dialog:'Selamat datang ke Inn El Morad! Pulihkan tenaga untuk perang!'
};
window.NPCS['innkeeper_kr'] = {
  name:'Inn Karus', icon:'🏚️', x:2000, y:1980, type:'inn', heal:true,
  dialog:'Orc tidak perlu rehat lama. Tapi kami sedia untuk kamu, pejuang!'
};

// Tambah ke zone
if (!window.ZONES.elmorad.npc.includes('innkeeper_el')) window.ZONES.elmorad.npc.push('innkeeper_el');
if (!window.ZONES.karus.npc.includes('innkeeper_kr'))   window.ZONES.karus.npc.push('innkeeper_kr');

// ── EXPOSE SEMUA KE WINDOW ────────────────────────────
window.RACES      = window.RACES;
window.JOBS       = window.JOBS;
window.FACE_ICONS = FACE_ICONS;
window.ZONES      = window.ZONES;
window.NPCS       = window.NPCS;
window.ITEM_DB    = window.ITEM_DB;
window.ENH_RATES  = window.ENH_RATES;

if (typeof window.REV_RATES!=="undefined") window.REV_RATES = window.REV_RATES;
if (typeof window.SKILL_TREES!=="undefined") window.SKILL_TREES = window.SKILL_TREES;
if (typeof window.DROP_TABLE!=="undefined") window.DROP_TABLE = window.DROP_TABLE;
if (typeof window.SHOPS!=="undefined") window.SHOPS = window.SHOPS;
if (typeof NW_CONFIG!=="undefined") window.NW_CONFIG = NW_CONFIG;
if (typeof PARTY_CONFIG!=="undefined") window.PARTY_CONFIG = PARTY_CONFIG;
if (typeof PK_CONFIG!=="undefined") window.PK_CONFIG = PK_CONFIG;
if (typeof RARITY_COLOR!=="undefined") window.RARITY_COLOR = RARITY_COLOR;
if (typeof window.STAT_PER_LEVEL!=="undefined") window.STAT_PER_LEVEL = window.STAT_PER_LEVEL;
if (typeof window.SKILL_PT_PER_5LV!=="undefined") window.SKILL_PT_PER_5LV = window.SKILL_PT_PER_5LV;
if (typeof window.CZ_ZONE!=="undefined") window.CZ_ZONE = window.CZ_ZONE;
if (typeof window.FARM_ZONES!=="undefined") window.FARM_ZONES = window.FARM_ZONES;
if (typeof DROP_TABLE_EXT!=="undefined") window.DROP_TABLE_EXT = DROP_TABLE_EXT;
if (typeof ENEMY_EXTRA!=="undefined") window.ENEMY_EXTRA = ENEMY_EXTRA;
if (typeof expRequired==="function") window.expRequired = expRequired;

const window.BOSS_SPAWNS = {
  ronark: [
    { type:'boss',       x:1200, y:800,  spawnEvery:120, timer:120, active:false, label:'⚡ Iblis Agung' },
    { type:'orc_warlord',x:600,  y:1400, spawnEvery:180, timer:180, active:false, label:'⚔ Panglima Orc' },
  ],
  cz: [
    { type:'cz_guardian',x:1500, y:1500, spawnEvery:90,  timer:90,  active:false, label:'🏰 Penjaga Koloni' },
    { type:'demon_king', x:1500, y:400,  spawnEvery:300, timer:300, active:false, label:'👑 Raja Iblis' },
  ],
  dungeon_goblin: [
    { type:'goblin_king',x:1200, y:1200, spawnEvery:999, timer:999, active:false, label:'👑 Raja Goblin' },
  ],
  dungeon_orc: [
    { type:'orc_warlord',x:1200, y:1200, spawnEvery:999, timer:999, active:false, label:'⚔ Panglima Orc' },
  ],
  dungeon_dark: [
    { type:'demon_king', x:1200, y:1200, spawnEvery:999, timer:999, active:false, label:'👑 Raja Iblis' },
  ],
};

// ── MONSTER FARM window.ZONES (spawn berkelompok) ────────────


// ── Exports ───────────────────────────────────────────
window.DROP_TABLE     = window.DROP_TABLE;
window.DROP_TABLE_EXT = DROP_TABLE_EXT;
window.ENEMY_EXTRA    = ENEMY_EXTRA;
window.BOSS_SPAWNS    = window.BOSS_SPAWNS;
