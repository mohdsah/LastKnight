'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — World Data
   ZONES, NPCS, FARM_ZONES, CZ_ZONE
   ══════════════════════════════════════════════════════ */

const ZONES={moradon:{name:'Moradon',icon:'🏙️',type:'town',safe:true,desc:'Bandar neutral. Berdagang, beli item.',bgColor:['#0a0e1a','#080c14'],torchColor:'rgba(255,160,40,.14)',npc:['merchant','blacksmith','innkeeper'],spawnX:1200,spawnY:1200},elmorad:{name:'El Morad',icon:'🌟',type:'town',safe:true,faction:'elmorad',desc:'Kota El Morad.',bgColor:['#0a0c18','#090a14'],torchColor:'rgba(200,160,40,.13)',npc:['merchant_el','blacksmith_el'],spawnX:400,spawnY:400},karus:{name:'Karus',icon:'🔥',type:'town',safe:true,faction:'karus',desc:'Kubu Karus.',bgColor:['#140808','#0f0606'],torchColor:'rgba(255,40,40,.12)',npc:['merchant_kr','blacksmith_kr'],spawnX:2000,spawnY:2000},ronark:{name:'Ronark Land',icon:'⚔️',type:'field',safe:false,pvp:true,desc:'Medan perang utama. PvP aktif!',bgColor:['#130a08','#0f0806'],torchColor:'rgba(255,60,20,.12)',monsters:['dire_wolf','lycaon','werewolf','harpy','deruvish','ash_knight'],spawnX:1200,spawnY:600},dungeon_goblin:{name:'Gua Goblin',icon:'🟢',type:'dungeon',safe:false,pvp:false,desc:'Dungeon lv 1-10.',bgColor:['#060e06','#050c05'],torchColor:'rgba(40,200,40,.08)',monsters:['goblin','goblin_king'],waves:5,reqLv:1},dungeon_orc:{name:'Benteng Orc',icon:'🟡',type:'dungeon',safe:false,pvp:false,desc:'Dungeon lv 10-25.',bgColor:['#0e0a06','#0c0804'],torchColor:'rgba(200,140,40,.10)',monsters:['orc','archer','orc_warlord'],waves:8,reqLv:10},dungeon_dark:{name:'Kuil Kegelapan',icon:'🔴',type:'dungeon',safe:false,pvp:false,desc:'Dungeon lv 25+.',bgColor:['#0a0614','#080410'],torchColor:'rgba(150,40,255,.10)',monsters:['dark_mage','boss','demon_king'],waves:12,reqLv:25}};

const NPCS={merchant:{name:'Pedagang Ali',icon:'🧑‍💼',x:1150,y:1150,shop:'general',dialog:'Selamat datang ke Moradon! Apa yang kamu perlukan?'},blacksmith:{name:'Pandai Besi',icon:'⚒️',x:1250,y:1150,shop:'enhance',dialog:'Aku boleh tingkatkan senjata kamu! Bawa ke sini.'},innkeeper:{name:'Pengurus Inn',icon:'🏠',x:1200,y:1250,shop:null,dialog:'Rehat di sini untuk pulih sepenuhnya. 50 gold/malam.',heal:true},gatekeeper:{name:'Pengawal Pintu',icon:'💂',x:1100,y:1200,shop:null,dialog:'Ingin pergi ke Ronark Land? Bersiap sedia!',gate:true},merchant_el:{name:'Pedagang Elmorad',icon:'🧝‍♀️',x:380,y:350,shop:'elmorad',dialog:'Untuk kemuliaan El Morad!'},blacksmith_el:{name:'Pandai Besi',icon:'⚒️',x:420,y:350,shop:'enhance',dialog:'Bawa item +0 kamu, aku buat jadi +9!'},merchant_kr:{name:'Pedagang Karus',icon:'👹',x:1980,y:1960,shop:'karus',dialog:'Untuk kuasa Karus!'},blacksmith_kr:{name:'Pandai Besi Orc',icon:'⚒️',x:2020,y:1960,shop:'enhance',dialog:'Item kamu perlu dikuatkan?'}};

const FARM_ZONES = {
  ronark: [
    { type:'dire_wolf',  x:900,  y:700,  radius:150, count:6, respawnSec:10 },
    { type:'lycaon',     x:1500, y:900,  radius:150, count:5, respawnSec:14 },
    { type:'werewolf',   x:700,  y:1300, radius:150, count:4, respawnSec:15 },
    { type:'harpy',      x:1800, y:1200, radius:150, count:4, respawnSec:12 },
    { type:'deruvish',   x:1300, y:1600, radius:150, count:5, respawnSec:13 },
    { type:'ash_knight', x:500,  y:500,  radius:150, count:3, respawnSec:18 },
  ],
  cz: [
    { type:'ash_knight',  x:1000, y:1000, radius:120, count:5, respawnSec:14 },
    { type:'doom_soldier',x:2000, y:1000, radius:120, count:4, respawnSec:16 },
    { type:'apostles',    x:1000, y:2000, radius:120, count:4, respawnSec:15 },
    { type:'death_knight',x:2000, y:2000, radius:120, count:3, respawnSec:18 },
    { type:'atross',      x:1800, y:600,  radius:100, count:3, respawnSec:20 },
    { type:'riote',       x:600,  y:1800, radius:100, count:3, respawnSec:20 },
    { type:'cz_guardian', x:1500, y:1200, radius:100, count:3, respawnSec:25 },
  ],
};

// ── EXTENDED DROP TABLE ───────────────────────────────
// Drop berdasarkan rarity — ikut level monster

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


// ── Exports ───────────────────────────────────────────
window.ZONES      = ZONES;
window.NPCS       = NPCS;
window.FARM_ZONES = FARM_ZONES;
window.CZ_ZONE    = CZ_ZONE;
