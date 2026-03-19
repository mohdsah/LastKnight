'use strict';
const RACES={human:{name:'Manusia',icon:'🧑‍⚔️',fac:'elmorad',desc:'Bangsa El Morad. Seimbang dalam semua aspek pertempuran.',base:{str:70,hp:70,dex:65,int:55,mp:55}},elf:{name:'Elf Suci',icon:'🧝',fac:'elmorad',desc:'Elf penjaga cahaya. Pantas dan bijak dalam sihir suci.',base:{str:55,hp:60,dex:80,int:70,mp:70}},orc:{name:'Orc Karus',icon:'👹',fac:'karus',desc:'Orc Karus. Kuat luar biasa, pertahanan seperti batu.',base:{str:90,hp:85,dex:45,int:40,mp:40}},dark:{name:'Gelap Elf',icon:'🧙‍♂️',fac:'karus',desc:'Elf Kegelapan Karus. Pakar sihir hitam dan serangan bayang.',base:{str:55,hp:55,dex:70,int:85,mp:80}}};
const JOBS={warrior:{name:'Warrior',icon:'⚔️',desc:'Garis hadapan. ATK & DEF tinggi. Pedang & Perisai.',stats:{str:+8,hp:+6,dex:+2,int:-2,mp:-2}},rogue:{name:'Rogue',icon:'🗡️',desc:'Pantas & mematikan. Serangan kritikal dari bayang.',stats:{str:+4,hp:+2,dex:+9,int:+1,mp:-2}},magician:{name:'Mage',icon:'🔮',desc:'Sihir elemen dahsyat. Range jauh. Lemah jarak dekat.',stats:{str:-2,hp:+0,dex:+2,int:+10,mp:+8}},priest:{name:'Priest',icon:'✨',desc:'Pemulih dan penyokong. Berkat rakan, azab musuh.',stats:{str:-1,hp:+3,dex:+1,int:+7,mp:+10}}};
const FACE_ICONS={elmorad:['🧑','👨','👲','🧔','🧑‍🦱','🧑‍🦰','🧑‍🦳','🧙'],karus:['👹','👺','🤖','💀','😈','🦹','🧟','👾']};
const ZONES={moradon:{name:'Moradon',icon:'🏙️',type:'town',safe:true,desc:'Bandar neutral. Berdagang, beli item.',bgColor:['#0a0e1a','#080c14'],torchColor:'rgba(255,160,40,.14)',npc:['merchant','blacksmith','innkeeper'],spawnX:1200,spawnY:1200},elmorad:{name:'El Morad',icon:'🌟',type:'town',safe:true,faction:'elmorad',desc:'Kota El Morad.',bgColor:['#0a0c18','#090a14'],torchColor:'rgba(200,160,40,.13)',npc:['merchant_el','blacksmith_el'],spawnX:400,spawnY:400},karus:{name:'Karus',icon:'🔥',type:'town',safe:true,faction:'karus',desc:'Kubu Karus.',bgColor:['#140808','#0f0606'],torchColor:'rgba(255,40,40,.12)',npc:['merchant_kr','blacksmith_kr'],spawnX:2000,spawnY:2000},ronark:{name:'Ronark Land',icon:'⚔️',type:'field',safe:false,pvp:true,desc:'Medan perang utama. PvP aktif!',bgColor:['#130a08','#0f0806'],torchColor:'rgba(255,60,20,.12)',monsters:['orc','goblin','archer','dark_mage','boss'],spawnX:1200,spawnY:600},dungeon_goblin:{name:'Gua Goblin',icon:'🟢',type:'dungeon',safe:false,pvp:false,desc:'Dungeon lv 1-10.',bgColor:['#060e06','#050c05'],torchColor:'rgba(40,200,40,.08)',monsters:['goblin','goblin_king'],waves:5,reqLv:1},dungeon_orc:{name:'Benteng Orc',icon:'🟡',type:'dungeon',safe:false,pvp:false,desc:'Dungeon lv 10-25.',bgColor:['#0e0a06','#0c0804'],torchColor:'rgba(200,140,40,.10)',monsters:['orc','archer','orc_warlord'],waves:8,reqLv:10},dungeon_dark:{name:'Kuil Kegelapan',icon:'🔴',type:'dungeon',safe:false,pvp:false,desc:'Dungeon lv 25+.',bgColor:['#0a0614','#080410'],torchColor:'rgba(150,40,255,.10)',monsters:['dark_mage','boss','demon_king'],waves:12,reqLv:25}};
const NPCS={merchant:{name:'Pedagang Ali',icon:'🧑‍💼',x:1150,y:1150,shop:'general',dialog:'Selamat datang ke Moradon! Apa yang kamu perlukan?'},blacksmith:{name:'Pandai Besi',icon:'⚒️',x:1250,y:1150,shop:'enhance',dialog:'Aku boleh tingkatkan senjata kamu! Bawa ke sini.'},innkeeper:{name:'Pengurus Inn',icon:'🏠',x:1200,y:1250,shop:null,dialog:'Rehat di sini untuk pulih sepenuhnya. 50 gold/malam.',heal:true},gatekeeper:{name:'Pengawal Pintu',icon:'💂',x:1100,y:1200,shop:null,dialog:'Ingin pergi ke Ronark Land? Bersiap sedia!',gate:true},merchant_el:{name:'Pedagang Elmorad',icon:'🧝‍♀️',x:380,y:350,shop:'elmorad',dialog:'Untuk kemuliaan El Morad!'},blacksmith_el:{name:'Pandai Besi',icon:'⚒️',x:420,y:350,shop:'enhance',dialog:'Bawa item +0 kamu, aku buat jadi +9!'},merchant_kr:{name:'Pedagang Karus',icon:'👹',x:1980,y:1960,shop:'karus',dialog:'Untuk kuasa Karus!'},blacksmith_kr:{name:'Pandai Besi Orc',icon:'⚒️',x:2020,y:1960,shop:'enhance',dialog:'Item kamu perlu dikuatkan?'}};
const ITEM_DB={sword_iron:{name:'Pedang Besi',icon:'🗡️',type:'weapon',slot:'weapon',rarity:'common',atk:15,reqStr:60,price:200,sell:50,enh:0,jobs:['warrior']},sword_steel:{name:'Pedang Baja',icon:'⚔️',type:'weapon',slot:'weapon',rarity:'uncommon',atk:30,reqStr:70,price:800,sell:200,enh:0,jobs:['warrior']},sword_knight:{name:'Pedang Ksatria',icon:'🔱',type:'weapon',slot:'weapon',rarity:'rare',atk:52,reqStr:80,price:3000,sell:800,enh:0,jobs:['warrior']},sword_legend:{name:'Pedang Legenda',icon:'⚡',type:'weapon',slot:'weapon',rarity:'legendary',atk:85,reqStr:90,price:0,sell:5000,enh:0,jobs:['warrior'],drop:true},dagger_basic:{name:'Belati',icon:'🔪',type:'weapon',slot:'weapon',rarity:'common',atk:12,reqDex:55,price:180,sell:45,enh:0,jobs:['rogue']},dagger_dark:{name:'Belati Gelap',icon:'☠️',type:'weapon',slot:'weapon',rarity:'uncommon',atk:26,reqDex:70,price:700,sell:180,enh:0,jobs:['rogue']},dagger_shadow:{name:'Belati Bayang',icon:'🌑',type:'weapon',slot:'weapon',rarity:'rare',atk:48,reqDex:80,price:2800,sell:700,enh:0,jobs:['rogue']},staff_oak:{name:'Tongkat Kayu',icon:'🪄',type:'weapon',slot:'weapon',rarity:'common',int:15,reqInt:50,price:190,sell:48,enh:0,jobs:['magician','priest']},staff_magic:{name:'Tongkat Sihir',icon:'🔮',type:'weapon',slot:'weapon',rarity:'uncommon',int:32,reqInt:65,price:850,sell:210,enh:0,jobs:['magician','priest']},staff_divine:{name:'Tongkat Suci',icon:'✨',type:'weapon',slot:'weapon',rarity:'rare',int:58,reqInt:80,price:3200,sell:850,enh:0,jobs:['priest']},staff_chaos:{name:'Tongkat Kekacauan',icon:'💥',type:'weapon',slot:'weapon',rarity:'rare',int:60,reqInt:80,price:3500,sell:900,enh:0,jobs:['magician']},armor_leather:{name:'Baju Kulit',icon:'🥋',type:'armor',slot:'armor',rarity:'common',def:10,price:250,sell:60,enh:0},armor_chain:{name:'Baju Rantai',icon:'🛡️',type:'armor',slot:'armor',rarity:'uncommon',def:22,price:900,sell:225,enh:0,jobs:['warrior','rogue']},armor_plate:{name:'Armor Pelat',icon:'⚙️',type:'armor',slot:'armor',rarity:'rare',def:40,price:3500,sell:900,enh:0,jobs:['warrior']},robe_silk:{name:'Jubah Sutera',icon:'👘',type:'armor',slot:'armor',rarity:'common',def:6,mp:25,price:220,sell:55,enh:0,jobs:['magician','priest']},robe_arcane:{name:'Jubah Arkan',icon:'🎭',type:'armor',slot:'armor',rarity:'rare',def:14,mp:60,price:3000,sell:750,enh:0,jobs:['magician','priest']},helm_iron:{name:'Topi Besi',icon:'⛑️',type:'armor',slot:'helmet',rarity:'common',def:6,price:150,sell:38,enh:0},helm_knight:{name:'Topi Ksatria',icon:'🪖',type:'armor',slot:'helmet',rarity:'uncommon',def:15,price:700,sell:175,enh:0,jobs:['warrior']},glove_leather:{name:'Sarung Tangan',icon:'🧤',type:'armor',slot:'gloves',rarity:'common',def:4,price:120,sell:30,enh:0},glove_fighter:{name:'Sarung Pejuang',icon:'🥊',type:'armor',slot:'gloves',rarity:'uncommon',def:10,atk:5,price:600,sell:150,enh:0,jobs:['warrior','rogue']},boot_cloth:{name:'Kasut Biasa',icon:'👟',type:'armor',slot:'boots',rarity:'common',def:3,price:100,sell:25,enh:0},boot_speed:{name:'Kasut Pantas',icon:'👢',type:'armor',slot:'boots',rarity:'uncommon',def:8,spd:20,price:550,sell:138,enh:0},ring_iron:{name:'Cincin Besi',icon:'💍',type:'acc',slot:'ring1',rarity:'common',str:5,price:200,sell:50,enh:0},ring_gold:{name:'Cincin Emas',icon:'💎',type:'acc',slot:'ring1',rarity:'uncommon',str:12,price:900,sell:225,enh:0},ring_ruby:{name:'Cincin Rubi',icon:'❤️',type:'acc',slot:'ring1',rarity:'rare',str:20,hp:50,price:4000,sell:1000,enh:0,drop:true},amulet_jade:{name:'Amulet Zamrud',icon:'📿',type:'acc',slot:'amulet',rarity:'uncommon',hp:40,mp:30,price:1000,sell:250,enh:0},amulet_power:{name:'Amulet Kuasa',icon:'🔮',type:'acc',slot:'amulet',rarity:'rare',str:15,int:15,price:5000,sell:1250,enh:0,drop:true},earring_el:{name:'Anting El Morad',icon:'🌟',type:'acc',slot:'earring',rarity:'rare',dex:15,int:10,price:4500,sell:1125,enh:0,faction:'elmorad'},earring_kr:{name:'Anting Karus',icon:'🔥',type:'acc',slot:'earring',rarity:'rare',str:15,hp:60,price:4500,sell:1125,enh:0,faction:'karus'},hpot_sm:{name:'HP Potion Kecil',icon:'🧪',type:'potion',rarity:'common',heal:80,price:30,sell:5,stack:99},hpot_md:{name:'HP Potion Sedang',icon:'💊',type:'potion',rarity:'uncommon',heal:250,price:100,sell:20,stack:99},hpot_lg:{name:'HP Potion Besar',icon:'🍶',type:'potion',rarity:'rare',heal:600,price:300,sell:60,stack:99},mpot_sm:{name:'MP Potion Kecil',icon:'🫙',type:'potion',rarity:'common',mana:50,price:25,sell:5,stack:99},mpot_md:{name:'MP Potion Sedang',icon:'🫧',type:'potion',rarity:'uncommon',mana:150,price:80,sell:16,stack:99},town_scroll:{name:'Scroll Kota',icon:'📜',type:'scroll',rarity:'common',tp:'town',price:50,sell:10,stack:20},tp_scroll:{name:'Scroll Teleport',icon:'🌀',type:'scroll',rarity:'uncommon',tp:'any',price:200,sell:40,stack:10},chaos_stone:{name:'Batu Huru-Hara',icon:'💠',type:'mat',rarity:'uncommon',price:300,sell:75,stack:20,enhBonus:true},luna_stone:{name:'Batu Luna',icon:'🌙',type:'mat',rarity:'common',price:100,sell:20,stack:50},star_stone:{name:'Batu Bintang',icon:'⭐',type:'mat',rarity:'rare',price:1000,sell:250,stack:10,noFail:true},wraith_stone:{name:'Batu Arwah',icon:'👻',type:'mat',rarity:'common',price:80,sell:15,stack:50},monsters_bead:{name:'Manik Monster',icon:'🔴',type:'mat',rarity:'common',price:50,sell:10,stack:99}};
const ENH_RATES=[{success:100,fail:0,break:0},{success:95,fail:5,break:0},{success:85,fail:15,break:0},{success:70,fail:25,break:5},{success:55,fail:32,break:13},{success:40,fail:38,break:22},{success:28,fail:38,break:34},{success:18,fail:40,break:42},{success:10,fail:42,break:48}];
const REV_RATES=[{success:60,fail:35,break:5},{success:40,fail:45,break:15},{success:25,fail:45,break:30}];
const SKILL_TREES={warrior:{name:'Warrior Skills',passive:[{id:'sword_mastery',name:'Sword Mastery',icon:'⚔️',maxLv:5,desc:'ATK +8% per level'},{id:'shield_mastery',name:'Shield Mastery',icon:'🛡️',maxLv:5,desc:'DEF +8% per level'},{id:'hp_boost',name:'HP Boost',icon:'❤️',maxLv:3,desc:'Max HP +10% per level'}],active:[{id:'bash',name:'Bash',icon:'💥',maxLv:5,mpCost:15,cd:4,req:null,desc:'Hantaman kuat +40% DMG, stagger musuh'},{id:'charge',name:'Charge',icon:'⚡',maxLv:3,mpCost:20,cd:8,req:'bash',desc:'Serbu pantas ke musuh, stun 1.5s'},{id:'whirlwind',name:'Whirlwind',icon:'🌪️',maxLv:4,mpCost:30,cd:12,req:'bash',desc:'Pusing serang semua musuh sekeliling'},{id:'berserk',name:'Berserk',icon:'🔥',maxLv:3,mpCost:40,cd:20,req:'whirlwind',desc:'ATK +50%, DEF -20% selama 10s'},{id:'shield_bash',name:'Shield Bash',icon:'🛡️',maxLv:3,mpCost:18,cd:6,req:'shield_mastery',desc:'Pukul dengan perisai, stun 2s'}]},rogue:{name:'Rogue Skills',passive:[{id:'dagger_mastery',name:'Dagger Mastery',icon:'🗡️',maxLv:5,desc:'ATK +10% per level'},{id:'crit_boost',name:'Critical Eye',icon:'👁️',maxLv:5,desc:'Crit rate +6% per level'},{id:'evasion',name:'Evasion',icon:'💨',maxLv:3,desc:'Dodge +8% per level'}],active:[{id:'stab',name:'Stab',icon:'🗡️',maxLv:5,mpCost:12,cd:3,req:null,desc:'Tikam pantas, crit +30% DMG'},{id:'poison',name:'Poison',icon:'☠️',maxLv:4,mpCost:20,cd:10,req:'stab',desc:'Racun musuh, DOT 8 dmg/s selama 10s'},{id:'stealth',name:'Stealth',icon:'🌑',maxLv:3,mpCost:30,cd:15,req:'evasion',desc:'Sembunyi 4s, serangan pertama +100% DMG'},{id:'triple',name:'Triple Stab',icon:'⚡',maxLv:4,mpCost:25,cd:8,req:'stab',desc:'3 tikaman berturut-turut dalam 0.5s'},{id:'back_stab',name:'Back Stab',icon:'💀',maxLv:3,mpCost:35,cd:18,req:'stealth',desc:'Tikam dari belakang, +200% DMG'}]},magician:{name:'Mage Skills',passive:[{id:'fire_mastery',name:'Fire Mastery',icon:'🔥',maxLv:5,desc:'DMG sihir api +10%'},{id:'ice_mastery',name:'Ice Mastery',icon:'❄️',maxLv:5,desc:'Slow effect +15%'},{id:'mp_efficiency',name:'MP Efficiency',icon:'💧',maxLv:3,desc:'Kos MP -8%'}],active:[{id:'fireball',name:'Fireball',icon:'🔥',maxLv:5,mpCost:20,cd:2,req:null,desc:'Bola api, DMG tinggi'},{id:'blizzard',name:'Blizzard',icon:'❄️',maxLv:4,mpCost:35,cd:12,req:'ice_mastery',desc:'Ribut salji AOE, slow 40%'},{id:'meteor',name:'Meteor',icon:'☄️',maxLv:4,mpCost:50,cd:18,req:'fireball',desc:'Meteor AOE besar, burn 3s'},{id:'lightning',name:'Lightning',icon:'⚡',maxLv:4,mpCost:28,cd:6,req:'fireball',desc:'Petir lompat 4 sasaran'},{id:'nova',name:'Ice Nova',icon:'🌀',maxLv:3,mpCost:60,cd:25,req:'blizzard',desc:'Freeze semua musuh 3s'}]},priest:{name:'Priest Skills',passive:[{id:'holy_mastery',name:'Holy Mastery',icon:'✨',maxLv:5,desc:'DMG cahaya +10% & heal +15%'},{id:'devotion',name:'Devotion',icon:'💛',maxLv:3,desc:'MP regen +10/s'},{id:'resistance',name:'Resistance',icon:'🔵',maxLv:3,desc:'DMG diterima -5%'}],active:[{id:'heal',name:'Heal',icon:'💚',maxLv:5,mpCost:25,cd:4,req:null,desc:'Pulih HP 40%'},{id:'bless',name:'Bless',icon:'⭐',maxLv:4,mpCost:35,cd:15,req:'holy_mastery',desc:'Buff ATK+DEF+SPD 15s'},{id:'holy',name:'Holy Light',icon:'🌟',maxLv:4,mpCost:40,cd:10,req:'holy_mastery',desc:'AOE cahaya suci'},{id:'cure',name:'Cure',icon:'💊',maxLv:3,mpCost:20,cd:6,req:'heal',desc:'Buang poison/stun'},{id:'resurrect',name:'Resurrect',icon:'💫',maxLv:3,mpCost:80,cd:60,req:'bless',desc:'Bangkit semula 60% HP'}]}};
const DROP_TABLE={goblin:[{id:'luna_stone',rate:.25},{id:'hpot_sm',rate:.3},{id:'wraith_stone',rate:.15},{id:'monsters_bead',rate:.4}],orc:[{id:'luna_stone',rate:.3},{id:'hpot_md',rate:.2},{id:'monsters_bead',rate:.45},{id:'chaos_stone',rate:.05}],archer:[{id:'wraith_stone',rate:.2},{id:'hpot_sm',rate:.35},{id:'mpot_sm',rate:.2},{id:'luna_stone',rate:.2}],dark_mage:[{id:'mpot_md',rate:.25},{id:'chaos_stone',rate:.08},{id:'monsters_bead',rate:.35},{id:'star_stone',rate:.02}],boss:[{id:'chaos_stone',rate:.35},{id:'star_stone',rate:.08},{id:'hpot_lg',rate:.4},{id:'ring_iron',rate:.05},{id:'amulet_jade',rate:.03}],goblin_king:[{id:'chaos_stone',rate:.4},{id:'hpot_lg',rate:.5},{id:'ring_gold',rate:.06},{id:'dagger_dark',rate:.02}],orc_warlord:[{id:'star_stone',rate:.12},{id:'armor_chain',rate:.04},{id:'sword_steel',rate:.03},{id:'ring_ruby',rate:.01},{id:'hpot_lg',rate:.5}],demon_king:[{id:'sword_legend',rate:.01},{id:'ring_ruby',rate:.03},{id:'amulet_power',rate:.02},{id:'star_stone',rate:.2},{id:'chaos_stone',rate:.5}]};
const SHOPS={general:{name:'Kedai Am',tabs:{Potion:['hpot_sm','hpot_md','hpot_lg','mpot_sm','mpot_md'],Scroll:['town_scroll','tp_scroll'],Bahan:['luna_stone','wraith_stone','monsters_bead']}},weapons:{name:'Senjata & Armor',tabs:{Senjata:['sword_iron','sword_steel','dagger_basic','dagger_dark','staff_oak','staff_magic'],Armor:['armor_leather','armor_chain','robe_silk','helm_iron','glove_leather','boot_cloth'],Aksesori:['ring_iron','ring_gold','amulet_jade']}},enhance:{name:'Naik Taraf',tabs:{Bahan:['luna_stone','wraith_stone','chaos_stone','star_stone']}},elmorad:{name:'Kedai El Morad',tabs:{Khas:['earring_el','sword_knight','armor_plate','hpot_lg','mpot_md']}},karus:{name:'Kedai Karus',tabs:{Khas:['earring_kr','dagger_shadow','staff_divine','hpot_lg','mpot_md']}}};
const NW_CONFIG={duration:600,killPts:1,fortifyPts:5,rewardGold:{winner:2000,loser:500},rewardXP:{winner:5000,loser:1000},castleHP:1000};
const PARTY_CONFIG={maxMembers:6,xpShareRadius:500,xpPenalty:0.15,lootDistrib:'round_robin'};
const PK_CONFIG={nationsWarZone:'ronark',pkDrop:0.15,allyColor:'#44ff44',enemyColor:'#ff4444',neutralColor:'#ffff44'};

// ═══════════════════════════════════════════════════════
// SISTEM BARU: CZ, Farm, Level, Boss Spawn
// ═══════════════════════════════════════════════════════

// ── RARITY COLORS ────────────────────────────────────
const RARITY_COLOR={
  common:   '#aaaaaa',
  uncommon: '#40c840',
  rare:     '#4488ff',
  epic:     '#aa44ff',
  legendary:'#ff8800',
};

// ── LEVEL TABLE (EXP diperlukan per level) ───────────
// Formula KO klasik: base * (level^1.8)
function expRequired(lv){
  return Math.floor(100 * Math.pow(lv, 1.8));
}
// Stat point dapat setiap level
const STAT_PER_LEVEL = 3;
// Skill point dapat setiap 5 level
const SKILL_PT_PER_5LV = 1;

// ── ZONE CZ (Colony Zone) ────────────────────────────
const CZ_ZONE = {
  id:      'cz',
  name:    'Colony Zone',
  icon:    '🏰',
  type:    'cz',
  safe:    false,
  pvp:     true,
  desc:    'Rebut Koloni & Benteng! PvP El Morad vs Karus.',
  bgColor: ['#0d0a05','#120e06'],
  torchColor: 'rgba(255,120,20,.13)',
  spawnX:  1500, spawnY:1500,
  monsters:['goblin','orc','archer','dark_mage','boss','cz_guardian'],

  // Castle di tengah CZ
  castle: {
    x:1500, y:1500, hp:1000, maxHp:1000,
    owner: null,     // null = neutral, 'elmorad' atau 'karus'
    captureTime: 0,  // saat yang diperlukan untuk capture
    captureNeeded: 30,
  },

  // 4 koloni di sekeliling
  colonies: [
    { id:'col_north', name:'Koloni Utara',  x:1500, y:800,  owner:null, hp:300, maxHp:300, capT:0, capNeeded:15 },
    { id:'col_south', name:'Koloni Selatan',x:1500, y:2200, owner:null, hp:300, maxHp:300, capT:0, capNeeded:15 },
    { id:'col_east',  name:'Koloni Timur',  x:2200, y:1500, owner:null, hp:300, maxHp:300, capT:0, capNeeded:15 },
    { id:'col_west',  name:'Koloni Barat',  x:800,  y:1500, owner:null, hp:300, maxHp:300, capT:0, capNeeded:15 },
  ],
};

// Tambah CZ ke ZONES
ZONES['cz'] = CZ_ZONE;

// ── BOSS SPAWN TABLE (per zone) ───────────────────────
const BOSS_SPAWNS = {
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

// ── MONSTER FARM ZONES (spawn berkelompok) ────────────
const FARM_ZONES = {
  ronark: [
    // { type, x, y, radius, count, respawnSec }
    { type:'goblin',  x:900,  y:700,  radius:150, count:6, respawnSec:8  },
    { type:'orc',     x:1500, y:900,  radius:150, count:5, respawnSec:12 },
    { type:'archer',  x:700,  y:1300, radius:150, count:5, respawnSec:10 },
    { type:'dark_mage',x:1800,y:1200, radius:150, count:4, respawnSec:15 },
    { type:'orc',     x:1300, y:1600, radius:150, count:6, respawnSec:12 },
    { type:'goblin',  x:500,  y:500,  radius:150, count:8, respawnSec:8  },
  ],
  cz: [
    { type:'goblin',    x:1000, y:1000, radius:120, count:5, respawnSec:8  },
    { type:'orc',       x:2000, y:1000, radius:120, count:4, respawnSec:12 },
    { type:'dark_mage', x:1000, y:2000, radius:120, count:4, respawnSec:14 },
    { type:'archer',    x:2000, y:2000, radius:120, count:5, respawnSec:10 },
    { type:'cz_guardian',x:1500,y:1200, radius:100, count:3, respawnSec:20 },
  ],
};

// ── EXTENDED DROP TABLE ───────────────────────────────
// Drop berdasarkan rarity — ikut level monster
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
NPCS['cz_gate']    = { name:'Pintu CZ',       icon:'🚪', x:1100, y:1200, shop:null, dialog:'Selamat datang ke Colony Zone! Rebut semua Koloni untuk menang!', gate:'cz' };
NPCS['col_npc']    = { name:'Penguasa Koloni',icon:'🏴', x:1500, y:800,  shop:null, dialog:'Koloni ini milik siapa? Serang untuk rebutnya!' };
ZONES['moradon'].npc.push('cz_gate');

// ── SHOP TAMBAH: CZ Reward Shop ───────────────────────
SHOPS['cz_reward'] = {
  name:'Kedai Ganjaran CZ',
  tabs:{
    'Rare Items':['sword_knight','armor_plate','dagger_shadow','staff_divine','ring_ruby'],
    'Materials': ['star_stone','chaos_stone'],
    'Potion':    ['hpot_lg','mpot_md'],
  }
};

// ── INN NPC tambahan ────────────────────────────────
NPCS['innkeeper_el'] = {
  name:'Inn El Morad', icon:'🏨', x:400, y:380, type:'inn', heal:true,
  dialog:'Selamat datang ke Inn El Morad! Pulihkan tenaga untuk perang!'
};
NPCS['innkeeper_kr'] = {
  name:'Inn Karus', icon:'🏚️', x:2000, y:1980, type:'inn', heal:true,
  dialog:'Orc tidak perlu rehat lama. Tapi kami sedia untuk kamu, pejuang!'
};

// Tambah ke zone
if (!ZONES.elmorad.npc.includes('innkeeper_el')) ZONES.elmorad.npc.push('innkeeper_el');
if (!ZONES.karus.npc.includes('innkeeper_kr'))   ZONES.karus.npc.push('innkeeper_kr');

// ── EXPOSE SEMUA KE WINDOW ────────────────────────────
window.RACES      = RACES;
window.JOBS       = JOBS;
window.FACE_ICONS = FACE_ICONS;
window.ZONES      = ZONES;
window.NPCS       = NPCS;
window.ITEM_DB    = ITEM_DB;
window.ENH_RATES  = ENH_RATES;

if (typeof REV_RATES!=="undefined") window.REV_RATES = REV_RATES;
if (typeof SKILL_TREES!=="undefined") window.SKILL_TREES = SKILL_TREES;
if (typeof DROP_TABLE!=="undefined") window.DROP_TABLE = DROP_TABLE;
if (typeof SHOPS!=="undefined") window.SHOPS = SHOPS;
if (typeof NW_CONFIG!=="undefined") window.NW_CONFIG = NW_CONFIG;
if (typeof PARTY_CONFIG!=="undefined") window.PARTY_CONFIG = PARTY_CONFIG;
if (typeof PK_CONFIG!=="undefined") window.PK_CONFIG = PK_CONFIG;
if (typeof RARITY_COLOR!=="undefined") window.RARITY_COLOR = RARITY_COLOR;
if (typeof STAT_PER_LEVEL!=="undefined") window.STAT_PER_LEVEL = STAT_PER_LEVEL;
if (typeof SKILL_PT_PER_5LV!=="undefined") window.SKILL_PT_PER_5LV = SKILL_PT_PER_5LV;
if (typeof CZ_ZONE!=="undefined") window.CZ_ZONE = CZ_ZONE;
if (typeof BOSS_SPAWNS!=="undefined") window.BOSS_SPAWNS = BOSS_SPAWNS;
if (typeof FARM_ZONES!=="undefined") window.FARM_ZONES = FARM_ZONES;
if (typeof DROP_TABLE_EXT!=="undefined") window.DROP_TABLE_EXT = DROP_TABLE_EXT;
if (typeof ENEMY_EXTRA!=="undefined") window.ENEMY_EXTRA = ENEMY_EXTRA;
