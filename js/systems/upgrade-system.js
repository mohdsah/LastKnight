'use strict';
/* ══════════════════════════════════════════════════════════════════
   Pahlawan Terakhir — upgrade-system.js
   Sistem upgrade lengkap:

   1. SOCKET / GEM — Pasang gem ke slot item (3 slot max)
   2. REFINE       — Tambah elemen pada senjata (api/ais/halilintar/racun)
   3. SET BONUS    — Bonus aktif bila pakai 2/3/4 pieces set
   4. CRAFT LANJUTAN — 20+ resipi baru (epic & mythic tier)
   ══════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════
// BAHAGIAN 1: GEM DATABASE
// ═══════════════════════════════════════════════════════════════════
const GEM_DB = {
  // ── ATK Gems ────────────────────────────────────────────────────
  gem_atk_sm:  { name:'Batu ATK Kecil',   icon:'🔴', type:'gem', stat:'atk', val:5,  rarity:'common',   price:400,  sell:80,  stack:10 },
  gem_atk_md:  { name:'Batu ATK Sedang',  icon:'🔴', type:'gem', stat:'atk', val:12, rarity:'uncommon', price:1200, sell:300, stack:10 },
  gem_atk_lg:  { name:'Batu ATK Besar',   icon:'🔴', type:'gem', stat:'atk', val:25, rarity:'rare',     price:3500, sell:800, stack:5  },
  gem_atk_xp:  { name:'Batu ATK Agung',   icon:'🔴', type:'gem', stat:'atk', val:45, rarity:'epic',     price:0,    sell:3000,stack:3, drop:true },

  // ── DEF Gems ────────────────────────────────────────────────────
  gem_def_sm:  { name:'Batu DEF Kecil',   icon:'🔵', type:'gem', stat:'def', val:4,  rarity:'common',   price:400,  sell:80,  stack:10 },
  gem_def_md:  { name:'Batu DEF Sedang',  icon:'🔵', type:'gem', stat:'def', val:10, rarity:'uncommon', price:1200, sell:300, stack:10 },
  gem_def_lg:  { name:'Batu DEF Besar',   icon:'🔵', type:'gem', stat:'def', val:22, rarity:'rare',     price:3500, sell:800, stack:5  },

  // ── HP Gems ─────────────────────────────────────────────────────
  gem_hp_sm:   { name:'Batu HP Kecil',    icon:'💚', type:'gem', stat:'hp',  val:30, rarity:'common',   price:350,  sell:70,  stack:10 },
  gem_hp_md:   { name:'Batu HP Sedang',   icon:'💚', type:'gem', stat:'hp',  val:80, rarity:'uncommon', price:1000, sell:250, stack:10 },
  gem_hp_lg:   { name:'Batu HP Besar',    icon:'💚', type:'gem', stat:'hp',  val:160,rarity:'rare',     price:3000, sell:700, stack:5  },

  // ── MP Gems ─────────────────────────────────────────────────────
  gem_mp_sm:   { name:'Batu MP Kecil',    icon:'💙', type:'gem', stat:'mp',  val:25, rarity:'common',   price:350,  sell:70,  stack:10 },
  gem_mp_md:   { name:'Batu MP Sedang',   icon:'💙', type:'gem', stat:'mp',  val:65, rarity:'uncommon', price:1000, sell:250, stack:10 },

  // ── Special Gems ────────────────────────────────────────────────
  gem_crit:    { name:'Batu Kritikal',    icon:'⭐', type:'gem', stat:'crit', val:3, rarity:'rare',     price:5000, sell:1200,stack:5  },
  gem_spd:     { name:'Batu Laju',        icon:'⚡', type:'gem', stat:'spd',  val:15,rarity:'rare',     price:4000, sell:1000,stack:5  },
  gem_dex:     { name:'Batu Tangkas',     icon:'🌀', type:'gem', stat:'dex',  val:10,rarity:'uncommon', price:1500, sell:380, stack:10 },
};

// ── Gem materials needed to create gems ─────────────────────────
const GEM_CRAFT = [
  { out:'gem_atk_sm', mats:[{id:'monsters_bead',qty:15},{id:'luna_stone',qty:3}],  gold:300  },
  { out:'gem_atk_md', mats:[{id:'gem_atk_sm',qty:3},  {id:'chaos_stone',qty:1}],  gold:800  },
  { out:'gem_atk_lg', mats:[{id:'gem_atk_md',qty:3},  {id:'chaos_stone',qty:3}],  gold:2500 },
  { out:'gem_def_sm', mats:[{id:'monsters_bead',qty:15},{id:'wraith_stone',qty:3}],gold:300  },
  { out:'gem_def_md', mats:[{id:'gem_def_sm',qty:3},  {id:'chaos_stone',qty:1}],  gold:800  },
  { out:'gem_def_lg', mats:[{id:'gem_def_md',qty:3},  {id:'chaos_stone',qty:3}],  gold:2500 },
  { out:'gem_hp_sm',  mats:[{id:'luna_stone',qty:5},  {id:'monsters_bead',qty:10}],gold:250 },
  { out:'gem_hp_md',  mats:[{id:'gem_hp_sm',qty:3},   {id:'chaos_stone',qty:1}],  gold:700  },
  { out:'gem_hp_lg',  mats:[{id:'gem_hp_md',qty:3},   {id:'star_stone',qty:1}],   gold:2000 },
  { out:'gem_crit',   mats:[{id:'gem_atk_lg',qty:2},  {id:'star_stone',qty:2},{id:'chaos_stone',qty:5}], gold:8000 },
  { out:'gem_spd',    mats:[{id:'gem_dex',qty:3},     {id:'chaos_stone',qty:3},{id:'magic_dust',qty:5}], gold:6000 },
];

// Add gems to ITEM_DB
window.addEventListener('DOMContentLoaded', () => {
  if (window.ITEM_DB) Object.assign(window.ITEM_DB, GEM_DB);
});

// ═══════════════════════════════════════════════════════════════════
// BAHAGIAN 2: REFINE DATABASE (Elemen pada senjata)
// ═══════════════════════════════════════════════════════════════════
const REFINE_ELEMENTS = {
  fire:    { name:'Api',        icon:'🔥', color:'#ff4400', bonus:{ atk:8,  burnChance:0.15 }, mat:'dragon_scale',  matQty:1, gold:3000 },
  ice:     { name:'Ais',        icon:'❄️', color:'#44ccff', bonus:{ atk:6,  slowChance:0.20 }, mat:'crystal_pure',  matQty:2, gold:2500 },
  thunder: { name:'Halilintar', icon:'⚡', color:'#ffcc00', bonus:{ atk:7,  stunChance:0.10 }, mat:'magic_dust',    matQty:5, gold:2000 },
  poison:  { name:'Racun',      icon:'☠️', color:'#44ff44', bonus:{ atk:5,  poisonChance:0.25},mat:'demon_core',    matQty:1, gold:2800 },
  holy:    { name:'Kudus',      icon:'✨', color:'#ffff88', bonus:{ atk:10, holyDmg:0.20 },    mat:'crystal_pure',  matQty:3, gold:5000, reqFac:'elmorad' },
  dark:    { name:'Gelap',      icon:'🌑', color:'#aa44ff', bonus:{ atk:10, darkDmg:0.20 },    mat:'demon_core',    matQty:2, gold:5000, reqFac:'karus'   },
};

// ═══════════════════════════════════════════════════════════════════
// BAHAGIAN 3: SET BONUS DEFINITIONS
// ═══════════════════════════════════════════════════════════════════
const SET_BONUS = {
  dark_knight: {
    name: 'Set Ksatria Gelap',
    icon: '⚫',
    items: ['sword_mythic','armor_dark_knight','helm_dark_knight','glove_dark','boot_dark'],
    bonuses: {
      2: { atk:20, def:15,            desc:'ATK +20, DEF +15' },
      3: { atk:20, def:15, hp:100,    desc:'ATK +20, DEF +15, HP +100' },
      4: { atk:20, def:15, hp:100, critRate:0.05, desc:'ATK +20, DEF +15, HP +100, CRIT +5%' },
      5: { atk:50, def:35, hp:200, critRate:0.10, speed:20, desc:'FULL SET: ATK +50, DEF +35, HP +200, CRIT +10%, SPD +20' },
    }
  },
  shadow: {
    name: 'Set Bayangan',
    icon: '🌑',
    items: ['dagger_mythic','dagger_shadow','boot_dark','glove_dark'],
    bonuses: {
      2: { atk:18, dex:15,           desc:'ATK +18, DEX +15' },
      3: { atk:18, dex:15, crit:0.08,desc:'ATK +18, DEX +15, CRIT +8%' },
      4: { atk:35, dex:30, crit:0.15, speed:25, desc:'FULL SET: ATK +35, DEX +30, CRIT +15%, SPD +25' },
    }
  },
  inferno: {
    name: 'Set Inferno',
    icon: '🔴',
    items: ['staff_mythic','robe_inferno','amulet_power'],
    bonuses: {
      2: { int:20, mp:80,            desc:'INT +20, MP +80' },
      3: { int:40, mp:150, atk:15,   desc:'FULL SET: INT +40, MP +150, ATK +15' },
    }
  },
  holy: {
    name: 'Set Kudus',
    icon: '☀️',
    items: ['staff_holy','robe_holy','amulet_jade'],
    bonuses: {
      2: { int:18, mp:70, hp:60,     desc:'INT +18, MP +70, HP +60' },
      3: { int:35, mp:130, hp:120, healBonus:0.20, desc:'FULL SET: INT +35, MP +130, HP +120, Heal +20%' },
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
// BAHAGIAN 4: ADVANCED CRAFT RECIPES
// ═══════════════════════════════════════════════════════════════════
const ADVANCED_RECIPES = [
  // ── Weapon upgrades ─────────────────────────────────────────────
  { id:'adv_w1',  name:'🔱 Pedang Ksatria',  out:'sword_knight', mats:[{id:'sword_steel',qty:1},{id:'chaos_stone',qty:5},{id:'crystal_pure',qty:1}],  gold:8000,  reqLv:25 },
  { id:'adv_w2',  name:'🌑 Belati Bayang',   out:'dagger_shadow',mats:[{id:'dagger_dark',qty:1},{id:'chaos_stone',qty:5},{id:'wraith_stone',qty:8}],   gold:7000,  reqLv:25 },
  { id:'adv_w3',  name:'✨ Tongkat Suci',    out:'staff_divine', mats:[{id:'staff_magic',qty:1},{id:'chaos_stone',qty:5},{id:'luna_stone',qty:15}],    gold:8000,  reqLv:25 },
  { id:'adv_w4',  name:'💥 Tongkat Kekacauan',out:'staff_chaos', mats:[{id:'staff_magic',qty:1},{id:'chaos_stone',qty:5},{id:'monsters_bead',qty:20}], gold:8000,  reqLv:25 },

  // ── Armor upgrades ───────────────────────────────────────────────
  { id:'adv_a1',  name:'⚙️ Armor Pelat',     out:'armor_plate',  mats:[{id:'armor_chain',qty:1},{id:'chaos_stone',qty:4},{id:'iron_ore',qty:10}],      gold:9000,  reqLv:30 },
  { id:'adv_a2',  name:'🎭 Jubah Arkan',     out:'robe_arcane',  mats:[{id:'robe_silk',qty:2},{id:'chaos_stone',qty:4},{id:'magic_dust',qty:8}],       gold:8500,  reqLv:30 },
  { id:'adv_a3',  name:'🪖 Topi Ksatria',    out:'helm_knight',  mats:[{id:'helm_iron',qty:2},{id:'chaos_stone',qty:3},{id:'luna_stone',qty:10}],      gold:5000,  reqLv:20 },
  { id:'adv_a4',  name:'👢 Kasut Pantas',    out:'boot_speed',   mats:[{id:'boot_cloth',qty:2},{id:'chaos_stone',qty:2},{id:'magic_dust',qty:5}],      gold:4500,  reqLv:20 },

  // ── Epic tier craft (requires boss drops) ───────────────────────
  { id:'adv_e1',  name:'🖤 Armor Ksatria Gelap', out:'armor_dark_knight', mats:[{id:'armor_plate',qty:1},{id:'dragon_scale',qty:2},{id:'chaos_stone',qty:8},{id:'star_stone',qty:2}], gold:25000, reqLv:50 },
  { id:'adv_e2',  name:'⚫ Topi Ksatria Gelap',  out:'helm_dark_knight',  mats:[{id:'helm_knight',qty:1},{id:'dragon_scale',qty:1},{id:'chaos_stone',qty:6},{id:'star_stone',qty:1}], gold:18000, reqLv:50 },
  { id:'adv_e3',  name:'🔴 Jubah Inferno',        out:'robe_inferno',      mats:[{id:'robe_arcane',qty:1},{id:'demon_core',qty:1},{id:'chaos_stone',qty:8},{id:'star_stone',qty:2}],  gold:22000, reqLv:50 },

  // ── Accessories ─────────────────────────────────────────────────
  { id:'adv_c1',  name:'❤️ Cincin Rubi',     out:'ring_ruby',    mats:[{id:'ring_gold',qty:2},{id:'chaos_stone',qty:3},{id:'dragon_scale',qty:1}],     gold:12000, reqLv:35 },
  { id:'adv_c2',  name:'🔮 Amulet Kuasa',    out:'amulet_power', mats:[{id:'amulet_jade',qty:1},{id:'star_stone',qty:2},{id:'magic_dust',qty:10}],     gold:15000, reqLv:35 },
  { id:'adv_c3',  name:'🐉 Amulet Naga',     out:'amulet_dragon',mats:[{id:'amulet_power',qty:1},{id:'dragon_scale',qty:3},{id:'demon_core',qty:1},{id:'star_stone',qty:3}], gold:40000, reqLv:60 },

  // ── Material recipes ─────────────────────────────────────────────
  { id:'adv_m1',  name:'🐉 Sisik Naga',      out:'dragon_scale', mats:[{id:'star_stone',qty:5},{id:'chaos_stone',qty:10}],                            gold:5000,  reqLv:50, outQty:1 },
  { id:'adv_m2',  name:'💜 Inti Iblis',      out:'demon_core',   mats:[{id:'star_stone',qty:3},{id:'chaos_stone',qty:15},{id:'monsters_bead',qty:30}], gold:4000,  reqLv:50, outQty:1 },
  { id:'adv_m3',  name:'💎 Kristal Murni',   out:'crystal_pure', mats:[{id:'chaos_stone',qty:5},{id:'luna_stone',qty:20},{id:'magic_dust',qty:5}],     gold:3000,  reqLv:30, outQty:1 },
  { id:'adv_m4',  name:'✨ Debu Sihir ×5',   out:'magic_dust',   mats:[{id:'monsters_bead',qty:20},{id:'luna_stone',qty:5}],                          gold:500,   reqLv:1,  outQty:5  },
];

// ═══════════════════════════════════════════════════════════════════
// BAHAGIAN 5: SOCKET SYSTEM — Pasang gem ke item
// ═══════════════════════════════════════════════════════════════════
const SocketSystem = (() => {

  // Max gem slots by rarity
  const MAX_SLOTS = { common:0, uncommon:1, rare:2, epic:3, legendary:3, mythic:3 };

  // Cost to open a socket slot
  const OPEN_COST  = { 1:2000, 2:8000, 3:20000 };
  const OPEN_MATS  = { 1:[{id:'chaos_stone',qty:2}], 2:[{id:'chaos_stone',qty:5},{id:'star_stone',qty:1}], 3:[{id:'star_stone',qty:3},{id:'dragon_scale',qty:1}] };

  function getSlots(iid) {
    const it = window.ITEM_DB?.[iid]; if (!it) return 0;
    return MAX_SLOTS[it.rarity] || 0;
  }

  function getOpenedSlots(iid) {
    const ch = window.selChar; if (!ch) return 0;
    const eq = ch.equipment || {};
    const inv = ch.inventory || {};
    // Check equipped + inventory items (item object stores sockets)
    // We store socket data in selChar.sockets = { [iid]: [gemId, null, null] }
    const sockets = ch.sockets || {};
    return (sockets[iid] || []).length;
  }

  function getGems(iid) {
    const ch = window.selChar; if (!ch) return [];
    const sockets = ch.sockets || {};
    return sockets[iid] || [];
  }

  // ── Open a new socket slot ─────────────────────────────────────
  function openSocket(iid) {
    const ch = window.selChar; if (!ch) { _status('Pilih watak!','err'); return; }
    const it  = window.ITEM_DB?.[iid]; if (!it) return;
    const max = MAX_SLOTS[it.rarity] || 0;
    if (!ch.sockets) ch.sockets = {};
    const cur = (ch.sockets[iid] || []).length;
    if (cur >= max) { _status(`Item ini boleh ada maksimum ${max} slot gem sahaja!`,'err'); return; }

    const slot = cur + 1;
    const cost = OPEN_COST[slot] || 0;
    const mats = OPEN_MATS[slot] || [];
    const inv  = ch.inventory || {};

    if ((ch.gold || 0) < cost) { _status('Gold tidak cukup! Perlu ' + cost + 'g','err'); return; }
    for (const m of mats) {
      if ((inv[m.id] || 0) < m.qty) {
        _status('Bahan tidak cukup: ' + (window.ITEM_DB?.[m.id]?.name || m.id),'err'); return;
      }
    }

    if (!confirm(`Buka slot gem ke-${slot} untuk ${it.name}?\nKos: ${cost}g + bahan`)) return;

    ch.gold -= cost;
    for (const m of mats) { inv[m.id] -= m.qty; if (inv[m.id] <= 0) delete inv[m.id]; }
    if (!ch.sockets[iid]) ch.sockets[iid] = [];
    ch.sockets[iid].push(null); // empty slot

    _status(`✓ Slot gem ke-${slot} dibuka pada ${it.name}!`, 'ok');
    window.Audio?.playSFX?.('enhance_success');
    window.addChat?.('', `💎 ${ch.char_name} membuka slot gem ke-${slot} pada ${it.name}!`, 'system');
    window.saveProgress?.();
    renderSocketPanel(iid);
  }

  // ── Pasang gem ke slot ──────────────────────────────────────────
  function insertGem(iid, slotIdx, gemId) {
    const ch = window.selChar; if (!ch) return;
    const inv = ch.inventory || {};
    if ((inv[gemId] || 0) < 1) { _status('Tiada gem ini dalam beg!','err'); return; }
    if (!ch.sockets) ch.sockets = {};
    if (!ch.sockets[iid]) ch.sockets[iid] = [];

    const existing = ch.sockets[iid][slotIdx];
    if (existing) {
      // Return old gem to inventory
      inv[existing] = (inv[existing] || 0) + 1;
    }

    ch.sockets[iid][slotIdx] = gemId;
    inv[gemId]--;
    if (inv[gemId] <= 0) delete inv[gemId];

    const gem = GEM_DB[gemId];
    _status(`✓ ${gem?.name || gemId} dipasang!`, 'ok');
    window.Audio?.playSFX?.('pickup');
    window.saveProgress?.();
    renderSocketPanel(iid);
    applyAllSocketBonuses();
  }

  // ── Tanggal gem ─────────────────────────────────────────────────
  function removeGem(iid, slotIdx) {
    const ch = window.selChar; if (!ch) return;
    if (!ch.sockets?.[iid]?.[slotIdx]) { _status('Slot kosong!','err'); return; }
    const gemId = ch.sockets[iid][slotIdx];
    ch.sockets[iid][slotIdx] = null;
    const inv = ch.inventory || {};
    inv[gemId] = (inv[gemId] || 0) + 1;
    _status('Gem ditanggal ke beg.', 'ok');
    window.saveProgress?.();
    renderSocketPanel(iid);
    applyAllSocketBonuses();
  }

  // ── Apply semua gem bonus ke player ────────────────────────────
  function applyAllSocketBonuses() {
    const ch = window.selChar;
    const p  = window.G?.pl;
    if (!ch || !p) return;

    const sockets = ch.sockets || {};
    let bonusAtk=0, bonusDef=0, bonusHp=0, bonusMp=0, bonusCrit=0, bonusSpd=0, bonusDex=0;

    // Only apply gems from equipped items
    const eq = ch.equipment || {};
    for (const iid of Object.values(eq)) {
      if (!iid || !sockets[iid]) continue;
      for (const gemId of sockets[iid]) {
        if (!gemId) continue;
        const gem = GEM_DB[gemId];
        if (!gem) continue;
        if (gem.stat === 'atk')  bonusAtk  += gem.val;
        if (gem.stat === 'def')  bonusDef  += gem.val;
        if (gem.stat === 'hp')   bonusHp   += gem.val;
        if (gem.stat === 'mp')   bonusMp   += gem.val;
        if (gem.stat === 'crit') bonusCrit += gem.val / 100;
        if (gem.stat === 'spd')  bonusSpd  += gem.val;
        if (gem.stat === 'dex')  bonusDex  += gem.val;
      }
    }

    p._gemAtk  = bonusAtk;
    p._gemDef  = bonusDef;
    p._gemHp   = bonusHp;
    p._gemMp   = bonusMp;
    p._gemCrit = bonusCrit;
    p._gemSpd  = bonusSpd;
    // Apply to player
    p.atk   = (p.atk   || 0) + bonusAtk  - (p._prevGemAtk  || 0);
    p.def   = (p.def   || 0) + bonusDef  - (p._prevGemDef  || 0);
    p.maxHp = (p.maxHp || 0) + bonusHp   - (p._prevGemHp   || 0);
    p.maxMp = (p.maxMp || 0) + bonusMp   - (p._prevGemMp   || 0);
    p.speed = (p.speed || 0) + bonusSpd  - (p._prevGemSpd  || 0);
    if (p._prevGemCrit) p.critRate = (p.critRate || 0) - p._prevGemCrit;
    p.critRate = (p.critRate || 0) + bonusCrit;
    p._prevGemAtk=bonusAtk; p._prevGemDef=bonusDef; p._prevGemHp=bonusHp;
    p._prevGemMp=bonusMp; p._prevGemSpd=bonusSpd; p._prevGemCrit=bonusCrit;
  }

  // ── Render Socket Panel ─────────────────────────────────────────
  function renderSocketPanel(selectedIid = null) {
    const ch = window.selChar; if (!ch) return;
    const body = document.getElementById('bsSocketBody'); if (!body) return;

    const eq   = ch.equipment || {};
    const inv  = ch.inventory || {};
    const sockets = ch.sockets || {};

    // List equipped sockettable items
    const equipItems = Object.entries(eq)
      .filter(([,iid]) => iid && window.ITEM_DB?.[iid] && (MAX_SLOTS[window.ITEM_DB[iid].rarity]||0) > 0)
      .map(([slot, iid]) => ({ slot, iid, item: window.ITEM_DB[iid] }));

    if (!equipItems.length) {
      body.innerHTML = `<div style="color:var(--muted);text-align:center;padding:20px;font-size:.72rem">Pakai item rare/epic/legendary untuk melihat slot gem.</div>`;
      return;
    }

    // Player's gems in inventory
    const playerGems = Object.entries(inv)
      .filter(([id,qty]) => qty > 0 && GEM_DB[id])
      .map(([id,qty]) => ({ id, qty, gem:GEM_DB[id] }));

    let html = `
      <style>
        .sock-item{background:rgba(0,0,0,.4);border:1px solid rgba(201,168,76,.15);
          border-radius:6px;padding:10px;margin-bottom:8px}
        .sock-item.selected{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.06)}
        .sock-slot{display:inline-flex;flex-direction:column;align-items:center;gap:3px;
          width:52px;cursor:pointer;padding:5px;border-radius:5px;
          border:1px dashed rgba(201,168,76,.2);background:rgba(0,0,0,.3);
          transition:all .15s;vertical-align:top}
        .sock-slot.filled{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.07)}
        .sock-slot:hover{border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.1)}
        .sock-gem-icon{font-size:1.2rem;line-height:1}
        .sock-gem-lbl{font-family:'Share Tech Mono',monospace;font-size:.5rem;
          color:var(--muted);text-align:center;line-height:1.2}
        .sock-open{display:inline-flex;flex-direction:column;align-items:center;gap:3px;
          width:52px;cursor:pointer;padding:5px;border-radius:5px;
          border:1px dashed rgba(255,255,255,.1);background:rgba(0,0,0,.2);
          vertical-align:top;transition:all .15s}
        .sock-open:hover{border-color:rgba(201,168,76,.35);background:rgba(201,168,76,.05)}
        .gem-pick-grid{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;
          background:rgba(0,0,0,.3);border:1px solid rgba(201,168,76,.1);
          border-radius:5px;padding:8px}
      </style>`;

    // Item list
    html += `<div style="font-family:'Cinzel',serif;font-size:.6rem;color:rgba(201,168,76,.5);
      letter-spacing:.15em;text-transform:uppercase;margin-bottom:8px">ITEM YANG DIPAKAI:</div>`;

    for (const { slot, iid, item } of equipItems) {
      const maxSlot = MAX_SLOTS[item.rarity] || 0;
      const opened  = (sockets[iid] || []).length;
      const gems    = sockets[iid] || [];
      const isSelected = selectedIid === iid;
      const rarCol  = { common:'#aaa',uncommon:'#44cc44',rare:'#4488ff',epic:'#aa44ff',legendary:'#ff8800',mythic:'#ff4488' }[item.rarity] || '#aaa';

      html += `<div class="sock-item${isSelected?' selected':''}" onclick="SocketSystem.renderSocketPanel('${iid}')">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:1.4rem">${item.icon}</span>
          <div>
            <div style="font-family:'Cinzel',serif;font-size:.72rem;color:${rarCol}">${item.name}</div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--muted)">${slot.toUpperCase()} · Max ${maxSlot} slot gem</div>
          </div>
        </div>`;

      if (isSelected) {
        html += `<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:flex-start">`;

        // Show opened slots
        for (let i = 0; i < opened; i++) {
          const gemId = gems[i];
          const gem   = gemId ? GEM_DB[gemId] : null;
          html += `<div class="sock-slot filled" onclick="event.stopPropagation();SocketSystem.removeGem('${iid}',${i})" title="${gem ? 'Klik untuk tanggal: '+gem.name : 'Kosong'}">
            <div class="sock-gem-icon">${gem ? gem.icon : '○'}</div>
            <div class="sock-gem-lbl">${gem ? gem.name.slice(0,8) : 'Kosong'}</div>
          </div>`;
        }

        // Show locked slots that can be opened
        for (let i = opened; i < maxSlot; i++) {
          const oCost  = OPEN_COST[i+1] || 0;
          const sMats  = OPEN_MATS[i+1] || [];
          const canOpen = (ch.gold||0) >= oCost && sMats.every(m=>(inv[m.id]||0)>=m.qty);
          html += `<div class="sock-open" onclick="event.stopPropagation();SocketSystem.openSocket('${iid}')" title="Buka slot gem ke-${i+1} (${oCost}g)">
            <div class="sock-gem-icon" style="color:${canOpen?'#c9a84c':'#555'}">🔒</div>
            <div class="sock-gem-lbl" style="color:${canOpen?'var(--gold)':'#444'}">${oCost}g</div>
          </div>`;
        }

        html += `</div>`;

        // Show gems in inventory to equip
        if (opened > 0 && playerGems.length > 0) {
          html += `<div class="gem-pick-grid">
            <div style="width:100%;font-family:'Cinzel',serif;font-size:.58rem;color:rgba(201,168,76,.5);
              letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px">Pilih Gem dari Beg:</div>`;

          // Find empty slots
          const emptySlots = gems.map((g,i)=>g===null?i:-1).filter(i=>i>=0);
          if (emptySlots.length === 0) {
            html += `<div style="color:var(--muted);font-size:.65rem">Semua slot penuh. Klik gem untuk tanggal.</div>`;
          } else {
            for (const { id, qty, gem } of playerGems) {
              const rarC = { common:'#aaa',uncommon:'#44cc44',rare:'#4488ff',epic:'#aa44ff' }[gem.rarity] || '#aaa';
              html += `<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;
                border-radius:4px;cursor:pointer;border:1px solid rgba(201,168,76,.12);
                background:rgba(0,0,0,.3);transition:all .15s"
                onclick="event.stopPropagation();SocketSystem.insertGem('${iid}',${emptySlots[0]},'${id}')"
                onmouseover="this.style.borderColor='rgba(201,168,76,.4)'"
                onmouseout="this.style.borderColor='rgba(201,168,76,.12)'">
                <span style="font-size:1.1rem">${gem.icon}</span>
                <div>
                  <div style="font-family:'Cinzel',serif;font-size:.65rem;color:${rarC}">${gem.name}</div>
                  <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--muted)">${gem.stat?.toUpperCase()} +${gem.val} · ×${qty}</div>
                </div>
              </div>`;
            }
          }
          html += `</div>`;
        } else if (opened > 0 && playerGems.length === 0) {
          html += `<div style="color:var(--muted);font-size:.65rem;margin-top:6px">Tiada gem dalam beg. Beli atau craft gem dahulu.</div>`;
        }
      }

      html += `</div>`;
    }

    body.innerHTML = html;
  }

  function _status(msg, type) {
    const el = document.getElementById('bsSocketStatus');
    if (!el) return;
    el.textContent = msg;
    el.className   = 'status-msg ' + (type==='err'?'st-err':'st-ok');
    setTimeout(() => { if(el) el.textContent=''; }, 2800);
  }

  return { openSocket, insertGem, removeGem, renderSocketPanel, applyAllSocketBonuses, MAX_SLOTS };
})();
window.SocketSystem = SocketSystem;

// ═══════════════════════════════════════════════════════════════════
// BAHAGIAN 6: REFINE SYSTEM — Elemen senjata
// ═══════════════════════════════════════════════════════════════════
const RefineSystem = (() => {

  function getRefine(iid) {
    const ch = window.selChar; if (!ch) return null;
    return (ch.refines || {})[iid] || null;
  }

  function canRefine(iid) {
    const item = window.ITEM_DB?.[iid];
    return item && item.type === 'weapon' && ['rare','epic','legendary','mythic'].includes(item.rarity);
  }

  function doRefine(iid, element) {
    const ch  = window.selChar; if (!ch) return;
    const el  = REFINE_ELEMENTS[element]; if (!el) return;
    const item = window.ITEM_DB?.[iid];
    if (!canRefine(iid)) { _status('Item ini tidak boleh di-Refine!','err'); return; }
    if (el.reqFac && ch.faction !== el.reqFac && !(ch.faction==='cahaya'&&el.reqFac==='elmorad') && !(ch.faction==='karus'&&el.reqFac==='karus')) {
      _status(`Elemen ${el.name} hanya untuk puak ${el.reqFac}!`,'err'); return;
    }

    const inv = ch.inventory || {};
    if ((inv[el.mat] || 0) < el.matQty) {
      const matName = window.ITEM_DB?.[el.mat]?.name || el.mat;
      _status(`Bahan tidak cukup: perlu ${el.matQty}× ${matName}`,'err'); return;
    }
    if ((ch.gold || 0) < el.gold) { _status('Gold tidak cukup!','err'); return; }

    const existing = (ch.refines || {})[iid];
    const msg = existing
      ? `Tukar elemen ${existing.toUpperCase()} → ${element.toUpperCase()} pada ${item.name}?\nKos: ${el.gold}g + bahan`
      : `Tambah elemen ${element.toUpperCase()} pada ${item.name}?\nKos: ${el.gold}g + bahan`;
    if (!confirm(msg)) return;

    ch.gold -= el.gold;
    inv[el.mat] -= el.matQty;
    if (inv[el.mat] <= 0) delete inv[el.mat];
    if (!ch.refines) ch.refines = {};
    ch.refines[iid] = element;

    _applyRefineBonus(iid, el);
    _status(`✓ ${item.name} kini berapi elemen ${el.icon} ${el.name}!`, 'ok');
    window.Audio?.playSFX?.('enhance_success');
    window.addChat?.('', `⚗️ ${ch.char_name} meng-Refine ${item.name} dengan elemen ${el.name}!`, 'system');
    window.saveProgress?.();
    renderRefinePanel();
  }

  function removeRefine(iid) {
    const ch = window.selChar; if (!ch) return;
    const item = window.ITEM_DB?.[iid];
    if (!ch.refines?.[iid]) { _status('Item ini tiada elemen!','err'); return; }
    const cost = 500;
    if ((ch.gold||0) < cost) { _status('Gold tidak cukup (500g untuk buang)','err'); return; }
    if (!confirm(`Buang elemen dari ${item?.name}? Kos: ${cost}g`)) return;
    ch.gold -= cost;
    delete ch.refines[iid];
    _status('Elemen dibuang.','ok');
    window.saveProgress?.();
    renderRefinePanel();
  }

  function _applyRefineBonus(iid, elData) {
    const p = window.G?.pl; if (!p) return;
    p.atk = (p.atk || 0) + (elData.bonus.atk || 0);
    if (elData.bonus.burnChance)   p._burnChance   = (p._burnChance   || 0) + elData.bonus.burnChance;
    if (elData.bonus.slowChance)   p._slowChance   = (p._slowChance   || 0) + elData.bonus.slowChance;
    if (elData.bonus.stunChance)   p._stunChance   = (p._stunChance   || 0) + elData.bonus.stunChance;
    if (elData.bonus.poisonChance) p._poisonChance = (p._poisonChance || 0) + elData.bonus.poisonChance;
  }

  function renderRefinePanel() {
    const ch   = window.selChar; if (!ch) return;
    const body = document.getElementById('bsRefineBody'); if (!body) return;
    const eq   = ch.equipment || {};
    const inv  = ch.inventory || {};

    // Get weapon items equipped
    const weapons = Object.entries(eq)
      .filter(([,iid]) => iid && canRefine(iid))
      .map(([slot,iid]) => ({ slot, iid, item:window.ITEM_DB[iid] }));

    let html = `<style>
      .ref-el{display:flex;align-items:center;gap:10px;padding:10px;border-radius:5px;
        border:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.35);
        margin-bottom:6px;cursor:pointer;transition:all .18s}
      .ref-el:hover{border-color:rgba(201,168,76,.3);background:rgba(201,168,76,.06)}
      .ref-el.locked{opacity:.4;cursor:not-allowed}
    </style>`;

    if (!weapons.length) {
      body.innerHTML = html + `<div style="color:var(--muted);text-align:center;padding:20px;font-size:.72rem">Pakai senjata rare atau lebih tinggi untuk Refine.</div>`;
      return;
    }

    for (const { iid, item } of weapons) {
      const current = (ch.refines || {})[iid];
      const curEl   = current ? REFINE_ELEMENTS[current] : null;
      const rarCol  = { rare:'#4488ff',epic:'#aa44ff',legendary:'#ff8800',mythic:'#ff4488' }[item.rarity]||'#aaa';

      html += `<div style="background:rgba(0,0,0,.4);border:1px solid rgba(201,168,76,.15);
        border-radius:6px;padding:10px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:1.4rem">${item.icon}</span>
          <div>
            <div style="font-family:'Cinzel',serif;font-size:.72rem;color:${rarCol}">${item.name}</div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:var(--muted)">
              Elemen Semasa: ${curEl ? curEl.icon+' '+curEl.name : '—'}
              ${current ? `<span onclick="RefineSystem.removeRefine('${iid}')" style="color:#ff4444;cursor:pointer;margin-left:8px">[Buang 500g]</span>` : ''}
            </div>
          </div>
        </div>
        <div style="font-family:'Cinzel',serif;font-size:.58rem;color:rgba(201,168,76,.5);
          text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px">Pilih Elemen:</div>`;

      for (const [elKey, el] of Object.entries(REFINE_ELEMENTS)) {
        const matInfo = window.ITEM_DB?.[el.mat];
        const hasmat  = (inv[el.mat] || 0) >= el.matQty;
        const hasgold = (ch.gold || 0) >= el.gold;
        const canDo   = hasmat && hasgold &&
          (!el.reqFac || ch.faction === el.reqFac ||
           (el.reqFac==='elmorad'&&(ch.faction==='elmorad'||ch.faction==='cahaya')) ||
           (el.reqFac==='karus'&&ch.faction==='karus'));
        const isActive = current === elKey;

        html += `<div class="ref-el${canDo?'':' locked'}${isActive?' selected':''}"
          style="${isActive?'border-color:'+el.color+';background:rgba(255,255,255,.04)':''}"
          onclick="${canDo?`RefineSystem.doRefine('${iid}','${elKey}')`:''}" >
          <div style="font-size:1.5rem">${el.icon}</div>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:.7rem;color:${el.color}">${el.name}${isActive?' ✓':''}</div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--muted)">
              ATK +${el.bonus.atk||0}
              ${el.bonus.burnChance ? ' · Burn '+Math.round(el.bonus.burnChance*100)+'%':''}
              ${el.bonus.slowChance ? ' · Slow '+Math.round(el.bonus.slowChance*100)+'%':''}
              ${el.bonus.stunChance ? ' · Stun '+Math.round(el.bonus.stunChance*100)+'%':''}
              ${el.bonus.poisonChance ? ' · Poison '+Math.round(el.bonus.poisonChance*100)+'%':''}
              ${el.reqFac ? ' · Puak '+el.reqFac:''}
            </div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.56rem;
              color:${hasmat?'var(--gold)':'#e84040'}">
              ${matInfo?.icon||'📦'}×${el.matQty} (ada:${inv[el.mat]||0}) · ${el.gold}g
            </div>
          </div>
        </div>`;
      }
      html += `</div>`;
    }

    body.innerHTML = html;
  }

  function _status(msg, type) {
    const el = document.getElementById('bsRefineStatus');
    if (!el) return;
    el.textContent = msg;
    el.className   = 'status-msg ' + (type==='err'?'st-err':'st-ok');
    setTimeout(() => { if(el) el.textContent=''; }, 2800);
  }

  return { doRefine, removeRefine, renderRefinePanel, canRefine, getRefine };
})();
window.RefineSystem = RefineSystem;

// ═══════════════════════════════════════════════════════════════════
// BAHAGIAN 7: SET BONUS SYSTEM
// ═══════════════════════════════════════════════════════════════════
const SetSystem = (() => {

  // Detect active set bonuses from equipped items
  function detectActiveSets() {
    const ch = window.selChar; if (!ch) return {};
    const eq = Object.values(ch.equipment || {}).filter(Boolean);
    const active = {};

    for (const [setId, setDef] of Object.entries(SET_BONUS)) {
      const count = setDef.items.filter(iid => eq.includes(iid)).length;
      if (count >= 2) active[setId] = count;
    }
    return active;
  }

  // Apply set bonuses to player
  function applySetBonuses() {
    const p  = window.G?.pl; if (!p) return;
    const ch = window.selChar; if (!ch) return;

    // Remove old set bonuses first
    if (p._prevSetAtk)  p.atk   -= p._prevSetAtk;
    if (p._prevSetDef)  p.def   -= p._prevSetDef;
    if (p._prevSetHp)   p.maxHp -= p._prevSetHp;
    if (p._prevSetMp)   p.maxMp -= p._prevSetMp;
    if (p._prevSetSpd)  p.speed -= p._prevSetSpd;
    if (p._prevSetCrit) p.critRate -= p._prevSetCrit;

    let tAtk=0, tDef=0, tHp=0, tMp=0, tSpd=0, tCrit=0;
    const active = detectActiveSets();

    for (const [setId, count] of Object.entries(active)) {
      const setDef = SET_BONUS[setId];
      // Get highest applicable bonus tier
      const tiers = Object.keys(setDef.bonuses).map(Number).sort((a,b)=>b-a);
      for (const tier of tiers) {
        if (count >= tier) {
          const b = setDef.bonuses[tier];
          tAtk  += b.atk   || 0;
          tDef  += b.def   || 0;
          tHp   += b.hp    || 0;
          tMp   += b.mp    || 0;
          tSpd  += b.speed || 0;
          tCrit += b.critRate || 0;
          break;
        }
      }
    }

    p.atk      += tAtk;
    p.def      += tDef;
    p.maxHp    += tHp;
    p.maxMp    += tMp;
    p.speed    += tSpd;
    p.critRate  = (p.critRate || 0) + tCrit;
    p._prevSetAtk=tAtk; p._prevSetDef=tDef; p._prevSetHp=tHp;
    p._prevSetMp=tMp;   p._prevSetSpd=tSpd; p._prevSetCrit=tCrit;
  }

  function renderSetPanel() {
    const body = document.getElementById('bsSetBody'); if (!body) return;
    const ch   = window.selChar; if (!ch) return;
    const eq   = Object.values(ch.equipment || {}).filter(Boolean);
    const active = detectActiveSets();

    let html = `<style>
      .set-card{background:rgba(0,0,0,.4);border:1px solid rgba(201,168,76,.12);
        border-radius:6px;padding:12px;margin-bottom:8px}
      .set-card.active{border-color:rgba(201,168,76,.45);background:rgba(201,168,76,.06)}
      .set-piece{display:inline-flex;align-items:center;gap:4px;padding:3px 7px;
        border-radius:3px;font-family:'Share Tech Mono',monospace;font-size:.6rem;
        margin:2px;border:1px solid}
      .set-piece.owned{border-color:rgba(68,200,68,.4);color:#40c840;background:rgba(68,200,68,.07)}
      .set-piece.missing{border-color:rgba(100,100,100,.2);color:#555;background:rgba(0,0,0,.2)}
    </style>`;

    for (const [setId, setDef] of Object.entries(SET_BONUS)) {
      const count   = active[setId] || 0;
      const isActive = count >= 2;
      const maxTier = Math.max(...Object.keys(setDef.bonuses).map(Number));

      html += `<div class="set-card${isActive?' active':''}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:1.6rem">${setDef.icon}</span>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:.78rem;color:#c9a84c">${setDef.name}</div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:${isActive?'#40c840':'var(--muted)'}">${count}/${setDef.items.length} pieces${isActive?' — AKTIF':' — tidak aktif'}</div>
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:8px">`;

      for (const iid of setDef.items) {
        const item  = window.ITEM_DB?.[iid];
        const owned = eq.includes(iid);
        html += `<div class="set-piece ${owned?'owned':'missing'}" title="${item?.name||iid}">
          ${item?.icon||'📦'} ${(item?.name||iid).slice(0,12)}${owned?'':' ✗'}</div>`;
      }

      html += `</div>
        <div style="font-family:'Cinzel',serif;font-size:.58rem;color:rgba(201,168,76,.5);
          text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px">Bonus Aktif:</div>`;

      for (const [tier, bonus] of Object.entries(setDef.bonuses)) {
        const tierNum   = parseInt(tier);
        const isReached = count >= tierNum;
        html += `<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;
          border-radius:4px;margin-bottom:3px;
          background:${isReached?'rgba(201,168,76,.1)':'rgba(0,0,0,.2)'};
          border:1px solid ${isReached?'rgba(201,168,76,.3)':'rgba(255,255,255,.06)'}">
          <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;
            color:${isReached?'#ffcc44':'#555'};width:20px">${tierNum}pc</div>
          <div style="font-family:'Crimson Text',serif;font-size:.72rem;
            color:${isReached?'#c9a84c':'#555'}">${bonus.desc}</div>
          ${isReached?'<div style="color:#40c840;font-size:.8rem">✓</div>':''}
        </div>`;
      }
      html += `</div>`;
    }

    body.innerHTML = html;
  }

  return { detectActiveSets, applySetBonuses, renderSetPanel };
})();
window.SetSystem = SetSystem;

// ═══════════════════════════════════════════════════════════════════
// BAHAGIAN 8: INJECT TAB SOCKET, REFINE, SET, CRAFT LANJUTAN
//             ke dalam panel Blacksmith sedia ada
// ═══════════════════════════════════════════════════════════════════
(function patchBlacksmith() {
  const _wait = setInterval(() => {
    if (typeof switchBSTab !== 'function') return;
    clearInterval(_wait);

    // ── Patch switchBSTab to handle new tabs ──────────────────
    const _origSwitch = window.switchBSTab;
    window.switchBSTab = function(tab) {
      if (['socket','refine','setbonus','advcraft'].includes(tab)) {
        // Update tab highlights
        const tabs = document.querySelectorAll('.ov-tab[onclick*="switchBSTab"]');
        tabs.forEach(t => {
          const match = t.getAttribute('onclick')?.match(/switchBSTab\('(\w+)'\)/);
          if (match) t.classList.toggle('active', match[1] === tab);
        });
        const c = document.getElementById('bsContent'); if (!c) return;
        if (tab === 'socket')   { c.innerHTML = _socketHTML();   SocketSystem.renderSocketPanel(); }
        if (tab === 'refine')   { c.innerHTML = _refineHTML();   RefineSystem.renderRefinePanel(); }
        if (tab === 'setbonus') { c.innerHTML = _setHTML();      SetSystem.renderSetPanel(); }
        if (tab === 'advcraft') { c.innerHTML = _advCraftHTML(); renderAdvancedCraft(); }
        return;
      }
      _origSwitch(tab);
    };

    // ── Patch renderBlacksmith to inject new tabs ──────────────
    const _origRender = window.renderBlacksmith;
    if (_origRender) {
      window.renderBlacksmith = function(npc) {
        _origRender(npc);
        // Inject extra tabs into the tab bar
        setTimeout(() => {
          const tabBar = document.querySelector('#blacksmithPanel .ov-tabs') ||
                         document.querySelector('.ov-tabs');
          if (tabBar && !tabBar.querySelector('[onclick*="socket"]')) {
            const extraTabs = document.createElement('div');
            extraTabs.innerHTML = `
              <div class="ov-tab" onclick="switchBSTab('socket')">💎 Socket</div>
              <div class="ov-tab" onclick="switchBSTab('refine')">⚗️ Refine</div>
              <div class="ov-tab" onclick="switchBSTab('setbonus')">📦 Set Item</div>
              <div class="ov-tab" onclick="switchBSTab('advcraft')">🔨 Craft+</div>`;
            while (extraTabs.firstChild) tabBar.appendChild(extraTabs.firstChild);
          }
        }, 80);
      };
    }

    console.log('[UpgradeSystem] ✓ Blacksmith patched dengan Socket/Refine/Set/Craft+');
  }, 500);
})();

function _socketHTML() {
  return `<div id="bsSocketBody"></div>
    <div class="status-msg" id="bsSocketStatus" style="margin-top:6px"></div>`;
}
function _refineHTML() {
  return `<div id="bsRefineBody"></div>
    <div class="status-msg" id="bsRefineStatus" style="margin-top:6px"></div>`;
}
function _setHTML() {
  return `<div id="bsSetBody"></div>`;
}
function _advCraftHTML() {
  return `<div id="bsAdvCraftBody" style="max-height:55vh;overflow-y:auto"></div>
    <div class="status-msg" id="bsAdvCraftStatus" style="margin-top:6px"></div>`;
}

// ── Advanced Craft render ────────────────────────────────────────
function renderAdvancedCraft() {
  const body = document.getElementById('bsAdvCraftBody'); if (!body) return;
  const ch   = window.selChar; if (!ch) return;
  const inv  = ch.inventory || {};
  const lv   = ch.level || 1;

  let html = `<div style="font-family:'Cinzel',serif;font-size:.58rem;color:var(--muted);
    letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px">RESIPI LANJUTAN:</div>`;

  for (const r of ADVANCED_RECIPES) {
    const outItem  = window.ITEM_DB?.[r.out];
    const reqLv    = r.reqLv || 1;
    const lkReq    = lv < reqLv;
    const hasAll   = r.mats.every(m=>(inv[m.id]||0)>=m.qty);
    const hasGold  = (ch.gold||0) >= r.gold;
    const canCraft = !lkReq && hasAll && hasGold;
    const rarCol   = { uncommon:'#44cc44',rare:'#4488ff',epic:'#aa44ff',legendary:'#ff8800',mythic:'#ff4488' }[outItem?.rarity]||'#c9a84c';

    const matsHtml = r.mats.map(m => {
      const has = inv[m.id]||0, ok = has>=m.qty;
      const mi  = window.ITEM_DB?.[m.id];
      return `<span style="color:${ok?'#40c840':'#e84040'};font-size:.58rem">${mi?.icon||'📦'}×${m.qty}(${has})</span>`;
    }).join(' ');

    html += `<div style="background:rgba(0,0,0,.35);
      border:1px solid rgba(201,168,76,${canCraft?'.18':'.05'});
      border-radius:5px;padding:9px;margin-bottom:6px;
      ${!canCraft?'opacity:.6':''}">
      <div style="display:flex;align-items:flex-start;gap:8px">
        <span style="font-size:1.5rem;flex-shrink:0">${outItem?.icon||'📦'}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:.73rem;color:${rarCol}">${r.name}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--muted)">Lv.${reqLv}+ ${lkReq?'🔒':''}</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:3px">
            ${matsHtml}
            <span style="color:${hasGold?'var(--gold)':'#e84040'};font-size:.58rem">💰${r.gold}g</span>
          </div>
        </div>
        <button onclick="doAdvancedCraft('${r.id}')"
          class="btn ${canCraft?'btn-gold':'btn-dim'}"
          style="flex-shrink:0;font-size:.62rem;padding:5px 10px;border-radius:3px"
          ${canCraft?'':'disabled'}>Craft${r.outQty?` ×${r.outQty}`:''}</button>
      </div>
    </div>`;
  }

  body.innerHTML = html;
}

async function doAdvancedCraft(recipeId) {
  const r  = ADVANCED_RECIPES.find(x=>x.id===recipeId); if (!r) return;
  const ch = window.selChar; if (!ch) return;
  const inv = ch.inventory || {};

  if ((ch.level||1) < (r.reqLv||1)) { _advStatus(`Perlu Level ${r.reqLv}!`,'err'); return; }
  for (const m of r.mats) { if((inv[m.id]||0)<m.qty){_advStatus('Bahan tidak cukup!','err');return} }
  if ((ch.gold||0) < r.gold) { _advStatus('Gold tidak cukup!','err'); return; }

  ch.gold -= r.gold;
  for (const m of r.mats) { inv[m.id]-=m.qty; if(inv[m.id]<=0)delete inv[m.id]; }
  const qty = r.outQty || 1;
  inv[r.out] = (inv[r.out]||0) + qty;

  window.Audio?.playSFX?.('enhance_success');
  const item = window.ITEM_DB?.[r.out];
  _advStatus(`✅ ${item?.name||r.out} ×${qty} berjaya dicipta!`,'ok');
  window.addChat?.('', `🔨 ${ch.char_name} craft ${item?.name||r.out}${qty>1?' ×'+qty:''}!`, 'system');
  window.PushNotif?.toast?.('🔨 Craft Berjaya!', `${item?.name||r.out}${qty>1?' ×'+qty:''} dicipta!`, '🔨', 3000);
  window.saveProgress?.();
  setTimeout(() => renderAdvancedCraft(), 1200);
}
function _advStatus(msg,type){
  const el=document.getElementById('bsAdvCraftStatus');if(!el)return;
  el.textContent=msg;el.className='status-msg '+(type==='err'?'st-err':'st-ok');
  setTimeout(()=>{if(el)el.textContent=''},2800);
}
window.doAdvancedCraft = doAdvancedCraft;

// ═══════════════════════════════════════════════════════════════════
// BAHAGIAN 9: GEM SHOP (beli gem dari NPC)
// ═══════════════════════════════════════════════════════════════════
(function addGemShop() {
  window.addEventListener('DOMContentLoaded', () => {
    // Add gems to ITEM_DB and SHOPS
    if (window.ITEM_DB) Object.assign(window.ITEM_DB, GEM_DB);

    // Add gem shop to NPC catalogs
    if (window.NpcShop && window.NpcShop.CATALOGS) {
      window.NpcShop.CATALOGS.gem_shop = {
        name: 'Kedai Gem & Bahan Upgrade',
        tabs: {
          'Gem ATK' : ['gem_atk_sm','gem_atk_md','gem_atk_lg'],
          'Gem DEF' : ['gem_def_sm','gem_def_md','gem_def_lg'],
          'Gem HP'  : ['gem_hp_sm', 'gem_hp_md', 'gem_hp_lg'],
          'Gem MP'  : ['gem_mp_sm', 'gem_mp_md'],
          'Khas'    : ['gem_crit',  'gem_spd',   'gem_dex'],
        }
      };
    }
  });
})();

// ═══════════════════════════════════════════════════════════════════
// BAHAGIAN 10: HOOK EQUIP/UNEQUIP untuk apply bonuses
// ═══════════════════════════════════════════════════════════════════
(function hookEquip() {
  const _wait = setInterval(() => {
    if (typeof equipItem === 'undefined' && !window.equipItem) return;
    clearInterval(_wait);

    const _origEquip = window.equipItem || equipItem;
    const patchedEquip = function(iid) {
      _origEquip(iid);
      setTimeout(() => {
        SocketSystem.applyAllSocketBonuses();
        SetSystem.applySetBonuses();
        window.updHUD?.();
      }, 50);
    };
    if (window.equipItem) window.equipItem = patchedEquip;

    const _origUnequip = window.unequipItem || unequipItem;
    if (_origUnequip) {
      const patchedUnequip = function(iid) {
        _origUnequip(iid);
        setTimeout(() => {
          SocketSystem.applyAllSocketBonuses();
          SetSystem.applySetBonuses();
          window.updHUD?.();
        }, 50);
      };
      if (window.unequipItem) window.unequipItem = patchedUnequip;
    }
    console.log('[UpgradeSystem] ✓ equip/unequip hooked');
  }, 600);
})();

// ── Auto-apply bonuses on game start ───────────────────────────
window.addEventListener('load', () => {
  const _wait = setInterval(() => {
    if (!window.G?.pl || !window.selChar) return;
    clearInterval(_wait);
    SocketSystem.applyAllSocketBonuses();
    SetSystem.applySetBonuses();
    console.log('[UpgradeSystem] ✓ Initial bonuses applied');
  }, 1000);
});

// ── Add gem craft to existing CRAFT_RECIPES ─────────────────────
window.addEventListener('DOMContentLoaded', () => {
  if (typeof CRAFT_RECIPES !== 'undefined') {
    GEM_CRAFT.forEach(gc => {
      if (!CRAFT_RECIPES.find(r => r.out === gc.out)) {
        CRAFT_RECIPES.push({
          id: 'gem_' + gc.out,
          name: GEM_DB[gc.out]?.icon + ' ' + GEM_DB[gc.out]?.name,
          out: gc.out,
          mats: gc.mats,
          gold: gc.gold,
          desc: 'Craft gem untuk socket item',
        });
      }
    });
  }
});

console.log('[UpgradeSystem] ✅ Socket + Refine + Set Bonus + Craft Lanjutan loaded');
