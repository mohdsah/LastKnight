'use strict';
/* ══════════════════════════════════════════════════════════
   Pahlawan Terakhir — monsters_ko.js
   Monster KO SEBENAR dari Open-KO/ko-client-assets
   Data berdasarkan KO v1298 (USKO Classic)
   Zone → Monster → Stats → Drops
   ══════════════════════════════════════════════════════════ */

// ── MORADON HUNTING AREA (Lv 1-35) ────────────────────────
window.MONSTERS_KO = {

  // ── MORADON WEREWOLF AREA ─────────────────────────────
  werewolf: {
    name:'Werewolf',       icon:'🐺', lv:18,
    hp:320,   atk:[18,24], def:55,  exp:95,  gold:[8,15],
    zone:['moradon'], aggro:false,
    drop:[
      {id:'luna_stone',    rate:0.30},
      {id:'monsters_bead', rate:0.45},
      {id:'hpot_sm',       rate:0.20},
      {id:'wraith_stone',  rate:0.08},
    ],
  },
  lycaon: {
    name:'Lycaon',         icon:'🐺', lv:22,
    hp:480,   atk:[24,32], def:70,  exp:140, gold:[12,20],
    zone:['moradon'], aggro:false,
    drop:[
      {id:'luna_stone',    rate:0.28},
      {id:'monsters_bead', rate:0.42},
      {id:'hpot_sm',       rate:0.22},
      {id:'wraith_stone',  rate:0.10},
    ],
  },
  lugaru: {
    name:'Lugaru',         icon:'🐺', lv:26,
    hp:650,   atk:[30,40], def:85,  exp:195, gold:[15,25],
    zone:['moradon'], aggro:false,
    drop:[
      {id:'luna_stone',    rate:0.25},
      {id:'monsters_bead', rate:0.40},
      {id:'hpot_md',       rate:0.15},
      {id:'chaos_stone',   rate:0.03},
    ],
  },
  dire_wolf: {
    name:'Dire Wolf',      icon:'🐺', lv:30,
    hp:850,   atk:[38,50], def:100, exp:260, gold:[20,35],
    zone:['moradon'], aggro:false,
    drop:[
      {id:'luna_stone',    rate:0.22},
      {id:'monsters_bead', rate:0.38},
      {id:'hpot_md',       rate:0.18},
      {id:'chaos_stone',   rate:0.05},
      {id:'wraith_stone',  rate:0.12},
    ],
  },
  dark_eyes: {
    name:'Dark Eyes',      icon:'👁️', lv:33,
    hp:1100,  atk:[46,60], def:115, exp:320, gold:[25,42],
    zone:['moradon'], aggro:true,
    drop:[
      {id:'luna_stone',    rate:0.20},
      {id:'chaos_stone',   rate:0.06},
      {id:'hpot_md',       rate:0.20},
      {id:'monsters_bead', rate:0.35},
    ],
  },
  shadow_seeker: {
    name:'Shadow Seeker',  icon:'🌑', lv:35,
    hp:1400,  atk:[55,72], def:130, exp:400, gold:[30,50],
    zone:['moradon'], aggro:true,
    drop:[
      {id:'chaos_stone',   rate:0.08},
      {id:'luna_stone',    rate:0.18},
      {id:'hpot_md',       rate:0.22},
      {id:'star_stone',    rate:0.02},
    ],
  },

  // ── MORADON SCORPION AREA ─────────────────────────────
  scorpion: {
    name:'Scorpion',       icon:'🦂', lv:20,
    hp:380,   atk:[20,28], def:60,  exp:110, gold:[9,16],
    zone:['moradon'], aggro:false,
    drop:[
      {id:'monsters_bead', rate:0.48},
      {id:'hpot_sm',       rate:0.25},
      {id:'luna_stone',    rate:0.15},
    ],
  },
  pincer: {
    name:'Pincer',         icon:'🦂', lv:24,
    hp:520,   atk:[28,36], def:78,  exp:155, gold:[13,22],
    zone:['moradon'], aggro:false,
    drop:[
      {id:'monsters_bead', rate:0.45},
      {id:'hpot_sm',       rate:0.28},
      {id:'luna_stone',    rate:0.18},
      {id:'wraith_stone',  rate:0.06},
    ],
  },
  paralyzer: {
    name:'Paralyzer',      icon:'🦂', lv:28,
    hp:720,   atk:[34,45], def:92,  exp:210, gold:[18,28],
    zone:['moradon'], aggro:true,
    drop:[
      {id:'monsters_bead', rate:0.42},
      {id:'hpot_md',       rate:0.15},
      {id:'luna_stone',    rate:0.20},
      {id:'chaos_stone',   rate:0.04},
    ],
  },

  // ── ARDREAM (Lv 30-59) ────────────────────────────────
  harpy: {
    name:'Harpy',          icon:'🦅', lv:38,
    hp:1800,  atk:[65,85], def:145, exp:520, gold:[35,60],
    zone:['ardream'], aggro:false,
    drop:[
      {id:'luna_stone',    rate:0.25},
      {id:'chaos_stone',   rate:0.08},
      {id:'monsters_bead', rate:0.40},
      {id:'hpot_md',       rate:0.20},
      {id:'dagger_basic',  rate:0.02},
    ],
  },
  harpy_elder: {
    name:'Harpy Elder',    icon:'🦅', lv:42,
    hp:2400,  atk:[78,102],def:165, exp:680, gold:[45,75],
    zone:['ardream'], aggro:false,
    drop:[
      {id:'chaos_stone',   rate:0.10},
      {id:'luna_stone',    rate:0.22},
      {id:'hpot_md',       rate:0.22},
      {id:'star_stone',    rate:0.03},
      {id:'dagger_dark',   rate:0.015},
    ],
  },
  deruvish: {
    name:'Deruvish',       icon:'🏜️', lv:44,
    hp:2800,  atk:[85,110],def:175, exp:780, gold:[50,85],
    zone:['ardream','ronark'], aggro:true,
    drop:[
      {id:'chaos_stone',   rate:0.12},
      {id:'star_stone',    rate:0.04},
      {id:'hpot_md',       rate:0.25},
      {id:'monsters_bead', rate:0.35},
      {id:'wraith_stone',  rate:0.15},
    ],
  },
  centaur: {
    name:'Centaur',        icon:'🐴', lv:46,
    hp:3200,  atk:[92,120],def:185, exp:880, gold:[58,95],
    zone:['ardream'], aggro:false,
    drop:[
      {id:'chaos_stone',   rate:0.12},
      {id:'star_stone',    rate:0.04},
      {id:'hpot_lg',       rate:0.15},
      {id:'dagger_shadow', rate:0.012},
      {id:'armor_chain',   rate:0.01},
    ],
  },
  dark_stone: {
    name:'Dark Stone',     icon:'🪨', lv:48,
    hp:3600,  atk:[100,130],def:195,exp:980, gold:[65,108],
    zone:['ardream'], aggro:true,
    drop:[
      {id:'chaos_stone',   rate:0.14},
      {id:'star_stone',    rate:0.05},
      {id:'hpot_lg',       rate:0.18},
      {id:'armor_plate',   rate:0.008},
    ],
  },
  troll: {
    name:'Troll',          icon:'🧌', lv:50,
    hp:4200,  atk:[110,142],def:210,exp:1100,gold:[70,120],
    zone:['ardream'], aggro:false,
    drop:[
      {id:'chaos_stone',   rate:0.15},
      {id:'star_stone',    rate:0.05},
      {id:'hpot_lg',       rate:0.20},
      {id:'helm_knight',   rate:0.008},
    ],
  },

  // ── RONARK LAND (Lv 55+) ─────────────────────────────
  ash_knight: {
    name:'Ash Knight',     icon:'⚔️', lv:55,
    hp:5500,  atk:[125,165],def:225,exp:1450,gold:[85,140],
    zone:['ronark'], aggro:true,
    drop:[
      {id:'chaos_stone',   rate:0.18},
      {id:'star_stone',    rate:0.07},
      {id:'hpot_lg',       rate:0.22},
      {id:'sword_knight',  rate:0.006},
      {id:'armor_plate',   rate:0.005},
    ],
  },
  screaming_werewolf: {
    name:'Screaming Werewolf',icon:'🐺',lv:58,
    hp:6800,  atk:[145,188],def:245,exp:1780,gold:[100,165],
    zone:['ronark'], aggro:true,
    drop:[
      {id:'chaos_stone',   rate:0.20},
      {id:'star_stone',    rate:0.08},
      {id:'hpot_lg',       rate:0.25},
      {id:'ring_gold',     rate:0.015},
    ],
  },
  gagoil: {
    name:'Gagoil',         icon:'👹', lv:60,
    hp:8000,  atk:[160,208],def:260,exp:2100,gold:[115,190],
    zone:['ronark'], aggro:true,
    drop:[
      {id:'chaos_stone',   rate:0.22},
      {id:'star_stone',    rate:0.09},
      {id:'hpot_lg',       rate:0.28},
      {id:'ring_ruby',     rate:0.008},
      {id:'amulet_jade',   rate:0.01},
    ],
  },
  doom_soldier: {
    name:'Doom Soldier',   icon:'💀', lv:62,
    hp:9500,  atk:[178,230],def:280,exp:2450,gold:[130,215],
    zone:['ronark'], aggro:true,
    drop:[
      {id:'chaos_stone',   rate:0.25},
      {id:'star_stone',    rate:0.10},
      {id:'hpot_lg',       rate:0.30},
      {id:'sword_legend',  rate:0.003},
      {id:'amulet_power',  rate:0.005},
    ],
  },
  booro: {
    name:'Booro',          icon:'🦬', lv:64,
    hp:11000, atk:[195,252],def:295,exp:2800,gold:[145,240],
    zone:['ronark'], aggro:true,
    drop:[
      {id:'chaos_stone',   rate:0.28},
      {id:'star_stone',    rate:0.12},
      {id:'dragon_scale',  rate:0.08},
      {id:'hpot_lg',       rate:0.32},
    ],
  },
  dark_mare: {
    name:'Dark Mare',      icon:'🐴', lv:66,
    hp:13000, atk:[215,278],def:315,exp:3200,gold:[160,265],
    zone:['ronark','luferson'], aggro:true,
    drop:[
      {id:'chaos_stone',   rate:0.30},
      {id:'star_stone',    rate:0.14},
      {id:'dragon_scale',  rate:0.10},
      {id:'demon_core',    rate:0.05},
      {id:'sword_legend',  rate:0.004},
    ],
  },

  // ── ESLANT / LUFERSON (Lv 60+) ───────────────────────
  brahman: {
    name:'Brahman',        icon:'🧙', lv:62,
    hp:7500,  atk:[155,200],def:255,exp:2200,gold:[120,198],
    zone:['luferson'], aggro:false,
    drop:[
      {id:'chaos_stone',   rate:0.20},
      {id:'star_stone',    rate:0.08},
      {id:'staff_divine',  rate:0.006},
      {id:'mpot_md',       rate:0.25},
    ],
  },
  apostle_of_flames: {
    name:'Apostle of Flames',icon:'🔥',lv:65,
    hp:9000,  atk:[175,225],def:270,exp:2600,gold:[135,222],
    zone:['luferson'], aggro:true,
    drop:[
      {id:'chaos_stone',   rate:0.22},
      {id:'star_stone',    rate:0.09},
      {id:'dragon_scale',  rate:0.06},
      {id:'hpot_lg',       rate:0.30},
    ],
  },
  ewil_wizard: {
    name:'Ewil Wizard',    icon:'🧙', lv:68,
    hp:10500, atk:[192,248],def:285,exp:3000,gold:[148,245],
    zone:['luferson'], aggro:true,
    drop:[
      {id:'chaos_stone',   rate:0.25},
      {id:'star_stone',    rate:0.11},
      {id:'demon_core',    rate:0.06},
      {id:'staff_chaos',   rate:0.005},
    ],
  },
  dread_mare: {
    name:'Dread Mare',     icon:'🌑', lv:70,
    hp:12000, atk:[210,270],def:300,exp:3500,gold:[160,265],
    zone:['luferson'], aggro:true,
    drop:[
      {id:'chaos_stone',   rate:0.28},
      {id:'star_stone',    rate:0.13},
      {id:'demon_core',    rate:0.08},
      {id:'dragon_scale',  rate:0.10},
    ],
  },

  // ── BOSSES ────────────────────────────────────────────
  atross: {
    name:'Atross',         icon:'👑', lv:50,
    hp:35000, atk:[220,285],def:280,exp:8000, gold:[500,800],
    zone:['ardream','cz'], aggro:true, boss:true,
    drop:[
      {id:'ring_ruby',     rate:0.25},
      {id:'amulet_jade',   rate:0.20},
      {id:'star_stone',    rate:0.50},
      {id:'chaos_stone',   rate:0.80},
      {id:'sword_knight',  rate:0.08},
    ],
  },
  riote: {
    name:'Riote',          icon:'👑', lv:50,
    hp:35000, atk:[225,290],def:285,exp:8000, gold:[500,800],
    zone:['ardream','cz'], aggro:true, boss:true,
    drop:[
      {id:'ring_ruby',     rate:0.25},
      {id:'amulet_power',  rate:0.15},
      {id:'star_stone',    rate:0.50},
      {id:'chaos_stone',   rate:0.80},
      {id:'dagger_shadow', rate:0.07},
    ],
  },
  isiloon: {
    name:'Isiloon',        icon:'🐲', lv:70,
    hp:85000, atk:[350,450],def:380,exp:25000,gold:[2000,3500],
    zone:['ronark'], aggro:true, boss:true, worldboss:true,
    spawnEvery: 10800, // 3 jam
    drop:[
      {id:'sword_legend',  rate:0.30},
      {id:'ring_ruby',     rate:0.40},
      {id:'amulet_power',  rate:0.35},
      {id:'star_stone',    rate:1.00},
      {id:'dragon_scale',  rate:0.80},
      {id:'demon_core',    rate:0.60},
    ],
  },
  felankor: {
    name:'Felankor',       icon:'🐉', lv:80,
    hp:250000,atk:[520,680],def:500,exp:80000,gold:[5000,8000],
    zone:['ronark'], aggro:true, boss:true, worldboss:true,
    spawnEvery: 21600, // 6 jam
    drop:[
      {id:'sword_legend',  rate:0.50},
      {id:'ring_mythic',   rate:0.20},
      {id:'amulet_dragon', rate:0.20},
      {id:'dragon_scale',  rate:1.00},
      {id:'demon_core',    rate:1.00},
    ],
  },
  dragon_tooth: {
    name:'Dragon Tooth',   icon:'🦷', lv:80,
    hp:76380, atk:[380,490],def:1152,exp:30000,gold:[3000,5000],
    zone:['luferson'], aggro:true, boss:true,
    drop:[
      {id:'star_stone',    rate:1.00},
      {id:'dragon_scale',  rate:0.80},
      {id:'sword_legend',  rate:0.15},
    ],
  },
  harpy_queen: {
    name:'Harpy Queen',    icon:'🦅', lv:110,
    hp:179998,atk:[450,580],def:720, exp:60000,gold:[4000,6500],
    zone:['luferson'], aggro:true, boss:true, worldboss:true,
    spawnEvery: 14400, // 4 jam
    drop:[
      {id:'earring_el',    rate:0.40},
      {id:'earring_kr',    rate:0.40},
      {id:'ring_mythic',   rate:0.15},
      {id:'star_stone',    rate:1.00},
      {id:'dragon_scale',  rate:0.90},
    ],
  },
};

// ── ITEM TAMBAHAN (KO Extended) ──────────────────────────
// Item dari drop table KO sebenar yg belum ada dalam ITEM_DB
if (window.ITEM_DB) {
  Object.assign(window.ITEM_DB, {
    dragon_scale: {
      name:'Dragon Scale',  icon:'🐉', type:'mat',  rarity:'rare',
      price:2000, sell:500,  stack:20, desc:'Sisik naga. Bahan crafting armor epik.',
    },
    demon_core: {
      name:'Demon Core',    icon:'💜', type:'mat',  rarity:'epic',
      price:5000, sell:1250, stack:10, desc:'Inti iblis. Digunakan untuk weapon +8 ke atas.',
    },
    ring_mythic: {
      name:'Ring of Power', icon:'💫', type:'acc',  rarity:'legendary',
      slot:'ring1', str:35, hp:120, price:0, sell:15000,
      desc:'Cincin paling berkuasa di Continent of Adonis.',
    },
    amulet_dragon: {
      name:'Dragon Amulet', icon:'🐲', type:'acc',  rarity:'legendary',
      slot:'amulet', str:25, int:25, hp:100, mp:80, price:0, sell:20000,
      desc:'Amulet jiwa naga. Bonus semua stat.',
    },
    robe_inferno: {
      name:'Inferno Robe',  icon:'🔥', type:'armor', rarity:'epic',
      slot:'armor', def:45, mp:120, int:20, price:0, sell:8000,
      jobs:['magician'], desc:'Jubah api neraka Magician.',
    },
    robe_holy: {
      name:'Holy Robe',     icon:'✨', type:'armor', rarity:'epic',
      slot:'armor', def:42, mp:130, hp:80, price:0, sell:8000,
      jobs:['priest'], desc:'Jubah suci Priest.',
    },
    armor_dark_knight: {
      name:'Dark Knight Armor',icon:'⚫',type:'armor',rarity:'epic',
      slot:'armor', def:75, hp:150, str:12, price:0, sell:10000,
      jobs:['warrior'], desc:'Armor Dark Knight legenda.',
    },
    helm_dark_knight: {
      name:'Dark Knight Helm',icon:'🪖',type:'armor',rarity:'epic',
      slot:'helmet', def:40, hp:80,  price:0, sell:5000,
      jobs:['warrior'],
    },
    glove_dark: {
      name:'Dark Gauntlet',  icon:'🧤', type:'armor', rarity:'epic',
      slot:'gloves', def:22, str:8,  price:0, sell:3500,
    },
    boot_dark: {
      name:'Dark Boots',     icon:'👢', type:'armor', rarity:'epic',
      slot:'boots', def:20, spd:15,  price:0, sell:3000,
    },
    ring_fire: {
      name:'Ring of Flame',  icon:'🔴', type:'acc', rarity:'rare',
      slot:'ring1', str:18, atk:8,   price:0, sell:4000,
    },
    bow_shadow: {
      name:'Shadow Bow',     icon:'🏹', type:'weapon', rarity:'rare',
      slot:'weapon', atk:55, reqDex:80, price:0, sell:3500,
      jobs:['rogue'],
    },
    staff_holy: {
      name:'Holy Staff',     icon:'✨', type:'weapon', rarity:'rare',
      slot:'weapon', int:65, reqInt:85, price:0, sell:4000,
      jobs:['priest'],
    },
    crystal_pure: {
      name:'Pure Crystal',   icon:'💎', type:'mat', rarity:'rare',
      price:800, sell:200, stack:20, desc:'Kristal murni untuk crafting.',
    },
    elixir_power: {
      name:'Power Elixir',   icon:'⚗️', type:'mat', rarity:'epic',
      price:3000, sell:750, stack:5, desc:'Elixir kekuatan untuk craft weapon +9.',
    },
  });
  console.log('[PT] ITEM_DB extended with KO original items');
}

// ── ZONE MONSTER LIST UPDATE ─────────────────────────────
// Tambah monster KO sebenar ke zone definitions
const _KO_ZONE_MONSTERS = {
  moradon:  ['werewolf','lycaon','lugaru','dire_wolf','dark_eyes',
             'shadow_seeker','scorpion','pincer','paralyzer'],
  ardream:  ['harpy','harpy_elder','deruvish','centaur','dark_stone',
             'troll','atross','riote'],
  ronark:   ['ash_knight','screaming_werewolf','gagoil','doom_soldier',
             'booro','dark_mare','isiloon','felankor'],
  luferson: ['brahman','apostle_of_flames','ewil_wizard','dread_mare',
             'dark_mare','dragon_tooth','harpy_queen'],
  cz:       ['ash_knight','deruvish','atross','riote'],
};

window.addEventListener('load', function() {
  if (window.ZONES) {
    Object.entries(_KO_ZONE_MONSTERS).forEach(([zone, mobs]) => {
      if (window.ZONES[zone]) {
        window.ZONES[zone].monsters_ko = mobs;
      }
    });
    console.log('[PT] KO monster zones updated');
  }

  // Expose MONSTERS_KO
  window.MONSTERS_KO = window.MONSTERS_KO;

  // Merge DROP_TABLE dengan drop KO sebenar
  if (window.DROP_TABLE) {
    Object.entries(window.MONSTERS_KO).forEach(([key, mob]) => {
      if (mob.drop && !window.DROP_TABLE[key]) {
        window.DROP_TABLE[key] = mob.drop;
      }
    });
    console.log('[PT] DROP_TABLE merged with KO data');
  }
});
