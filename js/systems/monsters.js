'use strict';
/* ══ Systems: Monster Definitions ══
   Semua monster dengan stat, drops, AI behaviour
   ══════════════════════════════════════════════ */

window.MONSTER_DB = {

  // ── BASIC ──────────────────────────────────────
  goblin: {
    name:'Goblin',       icon:'👺', hp:80,  spd:90,  atk:12, def:2,  xp:25,  gold:[3,8],
    rarity:'common',     size:22,   range:50, dropTable:['monsters_bead','hpot_sm','luna_stone'],
    dropRate:[0.4,0.15,0.05],  aggro:200, color:'#2a8a2a',
    ai:'melee', special:null,
  },
  orc: {
    name:'Orc',          icon:'👹', hp:200, spd:65,  atk:22, def:6,  xp:60,  gold:[8,18],
    rarity:'common',     size:32,   range:65, dropTable:['monsters_bead','hpot_sm','luna_stone','chaos_stone'],
    dropRate:[0.5,0.2,0.08,0.03], aggro:220, color:'#6a3a2a',
    ai:'melee', special:null,
  },
  archer: {
    name:'Archer',       icon:'🏹', hp:130, spd:75,  atk:18, def:3,  xp:45,  gold:[6,14],
    rarity:'common',     size:26,   range:200,dropTable:['monsters_bead','mpot_sm'],
    dropRate:[0.4,0.12], aggro:300, color:'#7a6a2a',
    ai:'ranged', special:'kite',
  },
  dark_mage: {
    name:'Mage Gelap',   icon:'🧙', hp:160, spd:60,  atk:28, def:2,  xp:80,  gold:[12,25],
    rarity:'uncommon',   size:28,   range:220,dropTable:['chaos_stone','mpot_sm','wraith_stone'],
    dropRate:[0.12,0.2,0.08], aggro:250, color:'#2a0a3a',
    ai:'ranged', special:'aoe',
  },

  // ── MINI BOSSES ─────────────────────────────────
  goblin_king: {
    name:'Raja Goblin',  icon:'👑', hp:900, spd:52,  atk:24, def:8,  xp:450, gold:[70,120],
    rarity:'rare',       size:42,   range:58, dropTable:['ring_iron','chaos_stone','hpot_md','dagger_basic'],
    dropRate:[0.15,0.3,0.5,0.12], aggro:350, color:'#1a6a1a',
    ai:'boss', special:'summon',
  },
  orc_warlord: {
    name:'Panglima Orc', icon:'⚔️', hp:2000,spd:38,  atk:40, def:15, xp:900, gold:[130,200],
    rarity:'rare',       size:58,   range:82, dropTable:['armor_chain','sword_steel','chaos_stone','star_stone'],
    dropRate:[0.2,0.15,0.4,0.08], aggro:400, color:'#4a2a1a',
    ai:'boss', special:'charge',
  },

  // ── BOSSES ──────────────────────────────────────
  boss: {
    name:'Iblis',        icon:'💀', hp:3000,spd:45,  atk:45, def:12, xp:1500,gold:[200,400],
    rarity:'epic',       size:52,   range:95, dropTable:['sword_knight','ring_ruby','star_stone','amulet_jade'],
    dropRate:[0.15,0.08,0.25,0.2], aggro:500, color:'#1a0a3a',
    ai:'boss', special:'multishot',
  },
  demon_king: {
    name:'Raja Iblis',   icon:'😈', hp:6000,spd:33,  atk:55, def:20, xp:3500,gold:[400,700],
    rarity:'legendary',  size:72,   range:95, dropTable:['sword_legend','amulet_power','star_stone','ring_ruby'],
    dropRate:[0.12,0.10,0.35,0.15], aggro:600, color:'#3a0a4a',
    ai:'boss', special:'void',
  },
  cz_guardian: {
    name:'Penjaga CZ',   icon:'🏰', hp:400, spd:55,  atk:25, def:8,  xp:150, gold:[25,45],
    rarity:'uncommon',   size:36,   range:55, dropTable:['monsters_bead','chaos_stone'],
    dropRate:[0.5,0.08], aggro:300, color:'#885500',
    ai:'patrol', special:null,
  },

  // ── NEW MONSTERS ─────────────────────────────────
  troll: {
    name:'Troll',        icon:'🧌', hp:350, spd:45,  atk:32, def:12, xp:120, gold:[15,30],
    rarity:'uncommon',   size:44,   range:70, dropTable:['monsters_bead','luna_stone','hpot_md'],
    dropRate:[0.45,0.1,0.15], aggro:180, color:'#3a5a2a',
    ai:'melee', special:'regen',
  },
  skeleton: {
    name:'Skeleton',     icon:'💀', hp:140, spd:70,  atk:20, def:4,  xp:55,  gold:[5,12],
    rarity:'common',     size:24,   range:55, dropTable:['monsters_bead','wraith_stone'],
    dropRate:[0.4,0.15], aggro:280, color:'#ccccaa',
    ai:'melee', special:null,
  },
  vampire: {
    name:'Vampir',       icon:'🧛', hp:280, spd:80,  atk:30, def:5,  xp:100, gold:[20,40],
    rarity:'uncommon',   size:30,   range:65, dropTable:['wraith_stone','mpot_sm','ring_iron'],
    dropRate:[0.3,0.2,0.08], aggro:260, color:'#5a0a0a',
    ai:'melee', special:'lifesteal',
  },
  dragon: {
    name:'Naga Kecil',   icon:'🐉', hp:1200,spd:55,  atk:38, def:10, xp:600, gold:[100,180],
    rarity:'epic',       size:50,   range:150,dropTable:['sword_knight','chaos_stone','star_stone'],
    dropRate:[0.08,0.25,0.12], aggro:350, color:'#4a0808',
    ai:'ranged', special:'fire',
  },
  lich: {
    name:'Lich',         icon:'👁️', hp:800, spd:40,  atk:50, def:8,  xp:400, gold:[80,140],
    rarity:'epic',       size:40,   range:180,dropTable:['staff_chaos','wraith_stone','ring_gold'],
    dropRate:[0.1,0.3,0.12], aggro:300, color:'#0a0a3a',
    ai:'ranged', special:'curse',
  },
  world_dragon: {
    name:'🐉 NAGA DUNIA', icon:'🐲', hp:25000,spd:25, atk:80, def:30, xp:15000,gold:[3000,5000],
    rarity:'legendary',  size:90,   range:200,dropTable:['sword_legend','amulet_power','ring_ruby','star_stone'],
    dropRate:[0.5,0.4,0.4,0.8], aggro:800, color:'#aa0000',
    ai:'world_boss', special:'meteor',
  },
};

// Helper
function getMonsterStat(type, wave=1) {
  const base = window.MONSTER_DB[type] || window.MONSTER_DB.goblin;
  return {
    ...base,
    hp:   Math.floor(base.hp  * (1 + (wave-1)*0.12)),
    atk:  Math.floor(base.atk * (1 + (wave-1)*0.08)),
  };
}
window.MONSTER_DB   = window.MONSTER_DB;
window.getMonsterStat = getMonsterStat;
