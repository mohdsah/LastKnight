'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — Item Data
   ITEM_DB, ENH_RATES, REV_RATES, SHOPS, RARITY_COLOR,
   SET_BONUS definitions
   ══════════════════════════════════════════════════════ */

const ITEM_DB={sword_iron:{name:'Pedang Besi',icon:'🗡️',type:'weapon',slot:'weapon',rarity:'common',atk:15,reqStr:60,price:200,sell:50,enh:0,jobs:['warrior']},sword_steel:{name:'Pedang Baja',icon:'⚔️',type:'weapon',slot:'weapon',rarity:'uncommon',atk:30,reqStr:70,price:800,sell:200,enh:0,jobs:['warrior']},sword_knight:{name:'Pedang Ksatria',icon:'🔱',type:'weapon',slot:'weapon',rarity:'rare',atk:52,reqStr:80,price:3000,sell:800,enh:0,jobs:['warrior']},sword_legend:{name:'Pedang Legenda',icon:'⚡',type:'weapon',slot:'weapon',rarity:'legendary',atk:85,reqStr:90,price:0,sell:5000,enh:0,jobs:['warrior'],drop:true},dagger_basic:{name:'Belati',icon:'🔪',type:'weapon',slot:'weapon',rarity:'common',atk:12,reqDex:55,price:180,sell:45,enh:0,jobs:['rogue']},dagger_dark:{name:'Belati Gelap',icon:'☠️',type:'weapon',slot:'weapon',rarity:'uncommon',atk:26,reqDex:70,price:700,sell:180,enh:0,jobs:['rogue']},dagger_shadow:{name:'Belati Bayang',icon:'🌑',type:'weapon',slot:'weapon',rarity:'rare',atk:48,reqDex:80,price:2800,sell:700,enh:0,jobs:['rogue']},staff_oak:{name:'Tongkat Kayu',icon:'🪄',type:'weapon',slot:'weapon',rarity:'common',int:15,reqInt:50,price:190,sell:48,enh:0,jobs:['magician','priest']},staff_magic:{name:'Tongkat Sihir',icon:'🔮',type:'weapon',slot:'weapon',rarity:'uncommon',int:32,reqInt:65,price:850,sell:210,enh:0,jobs:['magician','priest']},staff_divine:{name:'Tongkat Suci',icon:'✨',type:'weapon',slot:'weapon',rarity:'rare',int:58,reqInt:80,price:3200,sell:850,enh:0,jobs:['priest']},staff_chaos:{name:'Tongkat Kekacauan',icon:'💥',type:'weapon',slot:'weapon',rarity:'rare',int:60,reqInt:80,price:3500,sell:900,enh:0,jobs:['magician']},armor_leather:{name:'Baju Kulit',icon:'🥋',type:'armor',slot:'armor',rarity:'common',def:10,price:250,sell:60,enh:0},armor_chain:{name:'Baju Rantai',icon:'🛡️',type:'armor',slot:'armor',rarity:'uncommon',def:22,price:900,sell:225,enh:0,jobs:['warrior','rogue']},armor_plate:{name:'Armor Pelat',icon:'⚙️',type:'armor',slot:'armor',rarity:'rare',def:40,price:3500,sell:900,enh:0,jobs:['warrior']},robe_silk:{name:'Jubah Sutera',icon:'👘',type:'armor',slot:'armor',rarity:'common',def:6,mp:25,price:220,sell:55,enh:0,jobs:['magician','priest']},robe_arcane:{name:'Jubah Arkan',icon:'🎭',type:'armor',slot:'armor',rarity:'rare',def:14,mp:60,price:3000,sell:750,enh:0,jobs:['magician','priest']},helm_iron:{name:'Topi Besi',icon:'⛑️',type:'armor',slot:'helmet',rarity:'common',def:6,price:150,sell:38,enh:0},helm_knight:{name:'Topi Ksatria',icon:'🪖',type:'armor',slot:'helmet',rarity:'uncommon',def:15,price:700,sell:175,enh:0,jobs:['warrior']},glove_leather:{name:'Sarung Tangan',icon:'🧤',type:'armor',slot:'gloves',rarity:'common',def:4,price:120,sell:30,enh:0},glove_fighter:{name:'Sarung Pejuang',icon:'🥊',type:'armor',slot:'gloves',rarity:'uncommon',def:10,atk:5,price:600,sell:150,enh:0,jobs:['warrior','rogue']},boot_cloth:{name:'Kasut Biasa',icon:'👟',type:'armor',slot:'boots',rarity:'common',def:3,price:100,sell:25,enh:0},boot_speed:{name:'Kasut Pantas',icon:'👢',type:'armor',slot:'boots',rarity:'uncommon',def:8,spd:20,price:550,sell:138,enh:0},ring_iron:{name:'Cincin Besi',icon:'💍',type:'acc',slot:'ring1',rarity:'common',str:5,price:200,sell:50,enh:0},ring_gold:{name:'Cincin Emas',icon:'💎',type:'acc',slot:'ring1',rarity:'uncommon',str:12,price:900,sell:225,enh:0},ring_ruby:{name:'Cincin Rubi',icon:'❤️',type:'acc',slot:'ring1',rarity:'rare',str:20,hp:50,price:4000,sell:1000,enh:0,drop:true},amulet_jade:{name:'Amulet Zamrud',icon:'📿',type:'acc',slot:'amulet',rarity:'uncommon',hp:40,mp:30,price:1000,sell:250,enh:0},amulet_power:{name:'Amulet Kuasa',icon:'🔮',type:'acc',slot:'amulet',rarity:'rare',str:15,int:15,price:5000,sell:1250,enh:0,drop:true},earring_el:{name:'Anting El Morad',icon:'🌟',type:'acc',slot:'earring',rarity:'rare',dex:15,int:10,price:4500,sell:1125,enh:0,faction:'elmorad'},earring_kr:{name:'Anting Karus',icon:'🔥',type:'acc',slot:'earring',rarity:'rare',str:15,hp:60,price:4500,sell:1125,enh:0,faction:'karus'},hpot_sm:{name:'HP Potion Kecil',icon:'🧪',type:'potion',rarity:'common',heal:80,price:30,sell:5,stack:99},hpot_md:{name:'HP Potion Sedang',icon:'💊',type:'potion',rarity:'uncommon',heal:250,price:100,sell:20,stack:99},hpot_lg:{name:'HP Potion Besar',icon:'🍶',type:'potion',rarity:'rare',heal:600,price:300,sell:60,stack:99},mpot_sm:{name:'MP Potion Kecil',icon:'🫙',type:'potion',rarity:'common',mana:50,price:25,sell:5,stack:99},mpot_md:{name:'MP Potion Sedang',icon:'🫧',type:'potion',rarity:'uncommon',mana:150,price:80,sell:16,stack:99},town_scroll:{name:'Scroll Kota',icon:'📜',type:'scroll',rarity:'common',tp:'town',price:50,sell:10,stack:20},tp_scroll:{name:'Scroll Teleport',icon:'🌀',type:'scroll',rarity:'uncommon',tp:'any',price:200,sell:40,stack:10},chaos_stone:{name:'Batu Huru-Hara',icon:'💠',type:'mat',rarity:'uncommon',price:300,sell:75,stack:20,enhBonus:true},luna_stone:{name:'Batu Luna',icon:'🌙',type:'mat',rarity:'common',price:100,sell:20,stack:50},star_stone:{name:'Batu Bintang',icon:'⭐',type:'mat',rarity:'rare',price:1000,sell:250,stack:10,noFail:true},wraith_stone:{name:'Batu Arwah',icon:'👻',type:'mat',rarity:'common',price:80,sell:15,stack:50},monsters_bead:{name:'Manik Monster',icon:'🔴',type:'mat',rarity:'common',price:50,sell:10,stack:99},
// ── SENJATA BARU (Mythic & Set) ──────────────────────────
sword_mythic:{name:'Pedang Kegelapan',icon:'🌑',type:'weapon',slot:'weapon',rarity:'mythic',atk:130,reqStr:95,price:0,sell:20000,enh:0,jobs:['warrior'],drop:true,set:'dark_knight'},
dagger_mythic:{name:'Belati Arwah',icon:'💀',type:'weapon',slot:'weapon',rarity:'mythic',atk:110,reqDex:95,price:0,sell:20000,enh:0,jobs:['rogue'],drop:true,set:'shadow'},
staff_mythic:{name:'Tongkat Iblis',icon:'🔥',type:'weapon',slot:'weapon',rarity:'mythic',int:120,reqInt:95,price:0,sell:20000,enh:0,jobs:['magician'],drop:true,set:'inferno'},
staff_holy:{name:'Tongkat Kudus',icon:'☀️',type:'weapon',slot:'weapon',rarity:'mythic',int:115,reqInt:90,price:0,sell:18000,enh:0,jobs:['priest'],drop:true,set:'holy'},
bow_shadow:{name:'Busur Bayang',icon:'🏹',type:'weapon',slot:'weapon',rarity:'epic',atk:70,reqDex:80,price:0,sell:8000,enh:0,jobs:['rogue'],drop:true},
// ── ARMOR SET BARU ───────────────────────────────────────
armor_dark_knight:{name:'Armor Ksatria Gelap',icon:'🖤',type:'armor',slot:'armor',rarity:'epic',def:65,hp:80,price:0,sell:8000,enh:0,jobs:['warrior'],set:'dark_knight'},
helm_dark_knight:{name:'Topi Ksatria Gelap',icon:'⚫',type:'armor',slot:'helmet',rarity:'epic',def:28,price:0,sell:4000,enh:0,jobs:['warrior'],set:'dark_knight'},
glove_dark:{name:'Sarung Gelap',icon:'🖤',type:'armor',slot:'gloves',rarity:'epic',def:18,atk:12,price:0,sell:3000,enh:0,jobs:['warrior'],set:'dark_knight'},
boot_dark:{name:'Kasut Gelap',icon:'⚫',type:'armor',slot:'boots',rarity:'epic',def:16,spd:15,price:0,sell:2500,enh:0,jobs:['warrior'],set:'dark_knight'},
robe_inferno:{name:'Jubah Inferno',icon:'🔴',type:'armor',slot:'armor',rarity:'epic',def:20,mp:100,int:15,price:0,sell:9000,enh:0,jobs:['magician'],set:'inferno'},
robe_holy:{name:'Jubah Kudus',icon:'⬜',type:'armor',slot:'armor',rarity:'epic',def:18,mp:90,hp:60,price:0,sell:8500,enh:0,jobs:['priest'],set:'holy'},
// ── AKSESORI BARU ────────────────────────────────────────
ring_mythic:{name:'Cincin Keabadian',icon:'♾️',type:'acc',slot:'ring1',rarity:'mythic',str:30,dex:20,int:20,hp:100,price:0,sell:25000,enh:0,drop:true},
ring_fire:{name:'Cincin Api',icon:'🔴',type:'acc',slot:'ring2',rarity:'rare',int:18,atk:8,price:5000,sell:1200,enh:0},
amulet_dragon:{name:'Amulet Naga',icon:'🐉',type:'acc',slot:'amulet',rarity:'mythic',str:25,hp:120,def:15,price:0,sell:22000,enh:0,drop:true},
earring_mythic:{name:'Anting Keramat',icon:'💫',type:'acc',slot:'earring',rarity:'mythic',dex:25,int:25,mp:80,price:0,sell:18000,enh:0,drop:true},
// ── CONSUMABLE BARU ──────────────────────────────────────
hpot_xl:{name:'HP Potion Gergasi',icon:'🍾',type:'potion',rarity:'epic',heal:1500,price:800,sell:160,stack:50},
mpot_lg:{name:'MP Potion Besar',icon:'🫙',type:'potion',rarity:'rare',mana:400,price:250,sell:50,stack:50},
elixir_power:{name:'Elixir Kekuatan',icon:'💪',type:'potion',rarity:'epic',buffAtk:30,buffDur:300,price:1500,sell:300,stack:10},
elixir_speed:{name:'Elixir Kepantasan',icon:'⚡',type:'potion',rarity:'epic',buffSpd:50,buffDur:180,price:1200,sell:240,stack:10},
elixir_guard:{name:'Elixir Pertahanan',icon:'🛡️',type:'potion',rarity:'epic',buffDef:25,buffDur:300,price:1300,sell:260,stack:10},
antidote:{name:'Penawar Racun',icon:'🧫',type:'potion',rarity:'common',cure:'poison',price:80,sell:15,stack:30},
revive_stone:{name:'Batu Kebangkitan',icon:'💎',type:'special',rarity:'rare',revive:true,price:5000,sell:500,stack:5},
// ── BAHAN CRAFT BARU ─────────────────────────────────────
dragon_scale:{name:'Sisik Naga',icon:'🐉',type:'mat',rarity:'legendary',price:0,sell:5000,stack:10},
demon_core:{name:'Inti Iblis',icon:'💜',type:'mat',rarity:'legendary',price:0,sell:8000,stack:5},
crystal_pure:{name:'Kristal Murni',icon:'💎',type:'mat',rarity:'epic',price:0,sell:2000,stack:20},
iron_ore:{name:'Bijih Besi',icon:'⚙️',type:'mat',rarity:'common',price:20,sell:5,stack:99},
magic_dust:{name:'Debu Sihir',icon:'✨',type:'mat',rarity:'uncommon',price:150,sell:30,stack:50},
// ── SET BONUS DATA ───────────────────────────────────────
};

const ENH_RATES=[{success:100,fail:0,break:0},{success:95,fail:5,break:0},{success:85,fail:15,break:0},{success:70,fail:25,break:5},{success:55,fail:32,break:13},{success:40,fail:38,break:22},{success:28,fail:38,break:34},{success:18,fail:40,break:42},{success:10,fail:42,break:48}];

const REV_RATES=[{success:60,fail:35,break:5},{success:40,fail:45,break:15},{success:25,fail:45,break:30}];

const SHOPS={general:{name:'Kedai Am',tabs:{Potion:['hpot_sm','hpot_md','hpot_lg','hpot_xl','mpot_sm','mpot_md','mpot_lg'],Scroll:['town_scroll','tp_scroll','revive_stone'],Bahan:['luna_stone','wraith_stone','monsters_bead','iron_ore','magic_dust'],Elixir:['elixir_power','elixir_speed','elixir_guard','antidote']}},weapons:{name:'Senjata & Armor',tabs:{Senjata:['sword_iron','sword_steel','dagger_basic','dagger_dark','staff_oak','staff_magic'],Armor:['armor_leather','armor_chain','robe_silk','helm_iron','glove_leather','boot_cloth'],Aksesori:['ring_iron','ring_gold','ring_fire','amulet_jade','amulet_power']}},enhance:{name:'Naik Taraf',tabs:{Bahan:['luna_stone','wraith_stone','chaos_stone','star_stone']}},elmorad:{name:'Kedai El Morad',tabs:{Khas:['earring_el','sword_knight','armor_plate','hpot_lg','mpot_md']}},karus:{name:'Kedai Karus',tabs:{Khas:['earring_kr','dagger_shadow','staff_divine','hpot_lg','mpot_md']}}};

const RARITY_COLOR={
  common:   '#aaaaaa',
  uncommon: '#40c840',
  rare:     '#4488ff',
  epic:     '#aa44ff',
  legendary:'#ff8800',
};

// ── LEVEL TABLE (EXP diperlukan per level) ───────────
// Formula KO klasik: base * (level^1.8)
// expRequired defined in config.js
// Stat point dapat setiap level


// ── Exports ───────────────────────────────────────────
window.ITEM_DB      = ITEM_DB;
window.ENH_RATES    = ENH_RATES;
window.REV_RATES    = REV_RATES;
window.SHOPS        = SHOPS;
window.RARITY_COLOR = RARITY_COLOR;
if (typeof RARITY !== 'undefined') window.RARITY = RARITY;
