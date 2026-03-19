'use strict';
/* ═══════════════════════════════════════════════════════════════
   KO Classic — Skill NPC & Master System
   ▸ Skill Trainer NPC (level 10+) — belajar skill dari NPC
   ▸ Skill tiered: Basic (lv10) → Advanced (lv30) → Master (lv50)
   ▸ Master Class (lv40) — tukar ke kelas lebih kuat
   ▸ Master Skill (lv60) — skill ultimate Master
   ═══════════════════════════════════════════════════════════════ */

// ── MASTER CLASS DEFINITIONS ──────────────────────────────────────
// KO Classic: setiap kelas ada 2 pilihan Master
const MASTER_CLASSES = {
  warrior: [
    {
      id:      'blade_master',
      name:    'Blade Master',
      icon:    '⚔️',
      faction: 'any',
      reqLv:   40,
      desc:    'Pakar pedang dua tangan. ATK melampau, kelajuan serangan tinggi.',
      bonus:   { atk: 1.4, spd: 1.1 },
      skills:  ['blade_storm','execution','war_cry','fortress'],
    },
    {
      id:      'berserker',
      name:    'Berserker',
      icon:    '🔥',
      faction: 'karus',
      reqLv:   40,
      desc:    'Pejuang gila perang Karus. Makin teruk luka, makin kuat.',
      bonus:   { atk: 1.6, def: 0.7 },
      skills:  ['rage_slash','blood_frenzy','war_cry','fortress'],
    },
    {
      id:      'paladin',
      name:    'Paladin',
      icon:    '🌟',
      faction: 'elmorad',
      reqLv:   40,
      desc:    'Ksatria suci El Morad. Pertahanan dan serangan cahaya.',
      bonus:   { def: 1.3, hp: 1.2 },
      skills:  ['holy_strike','divine_shield','war_cry','fortress'],
    },
  ],
  rogue: [
    {
      id:      'assassin',
      name:    'Assassin',
      icon:    '💀',
      faction: 'any',
      reqLv:   40,
      desc:    'Pembunuh bayar. Satu tikaman boleh habiskan lawan.',
      bonus:   { crit: 2.0, spd: 1.3 },
      skills:  ['death_blow','shadow_step','smoke_bomb','vanish'],
    },
    {
      id:      'pathfinder',
      name:    'Pathfinder',
      icon:    '🏹',
      faction: 'elmorad',
      reqLv:   40,
      desc:    'Pemanah tepat El Morad. Range jauh dengan anak panah berapi.',
      bonus:   { range: 1.5, dex: 1.3 },
      skills:  ['piercing_shot','fire_arrow','smoke_bomb','vanish'],
    },
    {
      id:      'dark_hunter',
      name:    'Dark Hunter',
      icon:    '🌑',
      faction: 'karus',
      reqLv:   40,
      desc:    'Pemburu gelap Karus. Racun dan kegelapan senjata utama.',
      bonus:   { poison: 2.5, crit: 1.5 },
      skills:  ['venom_slash','dark_step','smoke_bomb','vanish'],
    },
  ],
  magician: [
    {
      id:      'archmage',
      name:    'Archmage',
      icon:    '🔮',
      faction: 'any',
      reqLv:   40,
      desc:    'Ahli sihir tertinggi. Sihir elemen paling dahsyat.',
      bonus:   { int: 1.5, mpCost: 0.8 },
      skills:  ['arcane_nova','time_stop','mana_shield','teleport'],
    },
    {
      id:      'elementalist',
      name:    'Elementalist',
      icon:    '🌪️',
      faction: 'elmorad',
      reqLv:   40,
      desc:    'Penguasa elemen alam. Api, ais dan petir dalam satu.',
      bonus:   { int: 1.4, aoe: 1.5 },
      skills:  ['tri_element','chain_nova','mana_shield','teleport'],
    },
    {
      id:      'dark_wizard',
      name:    'Dark Wizard',
      icon:    '💜',
      faction: 'karus',
      reqLv:   40,
      desc:    'Ahli sihir gelap Karus. Sihir jiwa dan kutukan.',
      bonus:   { int: 1.6, debuff: 2.0 },
      skills:  ['soul_drain','death_curse','mana_shield','teleport'],
    },
  ],
  priest: [
    {
      id:      'bishop',
      name:    'Bishop',
      icon:    '✨',
      faction: 'any',
      reqLv:   40,
      desc:    'Uskup agung. Penyembuh terbaik, lindungi seluruh parti.',
      bonus:   { heal: 1.6, mp: 1.3 },
      skills:  ['mass_heal','divine_light','barrier','resurrection'],
    },
    {
      id:      'oracle',
      name:    'Oracle',
      icon:    '🌙',
      faction: 'elmorad',
      reqLv:   40,
      desc:    'Nabi El Morad. Buff ajaib dan ramalan perang.',
      bonus:   { buff: 1.5, heal: 1.3 },
      skills:  ['fate_blessing','prophecy','barrier','resurrection'],
    },
    {
      id:      'shaman',
      name:    'Shaman',
      icon:    '🪄',
      faction: 'karus',
      reqLv:   40,
      desc:    'Dukun Karus. Memanggil roh nenek moyang untuk berperang.',
      bonus:   { summon: 2.0, atk: 1.2 },
      skills:  ['ancestor_call','spirit_bomb','barrier','resurrection'],
    },
  ],
};

// ── SKILL TIERS (unlock dari NPC ikut level) ──────────────────────
const SKILL_TIERS = {
  warrior: {
    basic:    { reqLv:10, cost:500,   skills:['bash','shield_mastery'] },
    advanced: { reqLv:30, cost:3000,  skills:['whirlwind','charge','hp_boost'] },
    expert:   { reqLv:50, cost:10000, skills:['berserk','sword_mastery','shield_bash'] },
  },
  rogue: {
    basic:    { reqLv:10, cost:500,   skills:['stab','dagger_mastery'] },
    advanced: { reqLv:30, cost:3000,  skills:['poison','stealth','evasion'] },
    expert:   { reqLv:50, cost:10000, skills:['triple','back_stab','crit_boost'] },
  },
  magician: {
    basic:    { reqLv:10, cost:500,   skills:['fireball','fire_mastery'] },
    advanced: { reqLv:30, cost:3000,  skills:['blizzard','lightning','mp_efficiency'] },
    expert:   { reqLv:50, cost:10000, skills:['meteor','nova','ice_mastery'] },
  },
  priest: {
    basic:    { reqLv:10, cost:500,   skills:['heal','holy_mastery'] },
    advanced: { reqLv:30, cost:3000,  skills:['bless','holy','devotion'] },
    expert:   { reqLv:50, cost:10000, skills:['cure','resurrect','resistance'] },
  },
};

// ── MASTER SKILL STATS ────────────────────────────────────────────
const MASTER_SKILL_DB = {
  // Warrior Master Skills
  blade_storm:  {name:'Blade Storm',   icon:'🌪️',mpCost:45,cd:14,desc:'Pusing pedang 360°, DMG ×3 semua musuh'},
  execution:    {name:'Execution',     icon:'⚡',mpCost:55,cd:20,desc:'Tikaman muktamad, +300% DMG bila musuh HP<30%'},
  holy_strike:  {name:'Holy Strike',   icon:'✨',mpCost:40,cd:12,desc:'Pukulan suci, stun 3s + holy DMG ×2'},
  divine_shield:{name:'Divine Shield', icon:'🛡️',mpCost:50,cd:25,desc:'Perisai ilahi, kebal 5s'},
  rage_slash:   {name:'Rage Slash',    icon:'🔥',mpCost:35,cd:8, desc:'Tebasan marah, DMG naik ikut HP hilang'},
  blood_frenzy: {name:'Blood Frenzy',  icon:'💢',mpCost:60,cd:30,desc:'Gila darah 15s, ATK ×2 tapi tak boleh sembuh'},
  war_cry:      {name:'War Cry',       icon:'📯',mpCost:30,cd:20,desc:'Laungan perang, buff ATK+DEF semua berdekatan'},
  fortress:     {name:'Fortress',      icon:'🏰',mpCost:40,cd:30,desc:'Pertahanan mutlak, kurang DMG 80% selama 8s'},

  // Rogue Master Skills
  death_blow:   {name:'Death Blow',    icon:'💀',mpCost:50,cd:15,desc:'Satu pukulan maut, crit ×5 dari stealth'},
  shadow_step:  {name:'Shadow Step',   icon:'🌑',mpCost:25,cd:6, desc:'Teleport ke belakang musuh, auto stealth 2s'},
  piercing_shot:{name:'Piercing Shot', icon:'🏹',mpCost:35,cd:10,desc:'Anak panah tembus 5 musuh berturut'},
  fire_arrow:   {name:'Fire Arrow',    icon:'🔥',mpCost:40,cd:12,desc:'Anak panah api, AOE letupan bila kena'},
  venom_slash:  {name:'Venom Slash',   icon:'☠️',mpCost:40,cd:12,desc:'Tebasan racun kuat, DOT ×3 selama 20s'},
  dark_step:    {name:'Dark Step',     icon:'💜',mpCost:30,cd:8, desc:'Langkah gelap, dodge +90% selama 4s'},
  smoke_bomb:   {name:'Smoke Bomb',    icon:'💨',mpCost:20,cd:15,desc:'Bom asap, butakan musuh berdekatan 3s'},
  vanish:       {name:'Vanish',        icon:'✨',mpCost:45,cd:30,desc:'Hilang sepenuhnya 8s, reset semua CD'},

  // Mage Master Skills
  arcane_nova:  {name:'Arcane Nova',   icon:'💫',mpCost:80,cd:20,desc:'Nova arkan gergasi, DMG ×5 radius besar'},
  time_stop:    {name:'Time Stop',     icon:'⏱️',mpCost:100,cd:60,desc:'Henti masa 5s, semua musuh beku'},
  tri_element:  {name:'Tri Element',   icon:'🌪️',mpCost:70,cd:18,desc:'Gabungan api+ais+petir, triple hit'},
  chain_nova:   {name:'Chain Nova',    icon:'⚡',mpCost:65,cd:15,desc:'Nova berantai, lompat 8 musuh'},
  soul_drain:   {name:'Soul Drain',    icon:'👻',mpCost:55,cd:12,desc:'Sedut nyawa, steal 30% HP musuh'},
  death_curse:  {name:'Death Curse',   icon:'💀',mpCost:80,cd:25,desc:'Kutukan maut, DOT 50 dmg/s selama 15s'},
  mana_shield:  {name:'Mana Shield',   icon:'🔵',mpCost:60,cd:25,desc:'Perisai mana, guna MP untuk block DMG'},
  teleport:     {name:'Teleport',      icon:'🌀',mpCost:30,cd:8, desc:'Teleport ke tempat random berdekatan'},

  // Priest Master Skills
  mass_heal:    {name:'Mass Heal',     icon:'💚',mpCost:70,cd:12,desc:'Sembuh semua ahli party 60% HP'},
  divine_light: {name:'Divine Light',  icon:'🌟',mpCost:80,cd:20,desc:'Cahaya ilahi, musnah semua undead + heal'},
  fate_blessing:{name:'Fate Blessing', icon:'⭐',mpCost:65,cd:20,desc:'Berkat takdir, buff semua stat ×1.5 20s'},
  prophecy:     {name:'Prophecy',      icon:'🔮',mpCost:50,cd:30,desc:'Nubuat perang, reveal lokasi semua musuh'},
  ancestor_call:{name:'Ancestor Call', icon:'👻',mpCost:85,cd:35,desc:'Panggil 3 roh nenek moyang untuk berperang'},
  spirit_bomb:  {name:'Spirit Bomb',   icon:'💥',mpCost:90,cd:30,desc:'Bom roh, AOE gergasi DMG jiwa'},
  barrier:      {name:'Barrier',       icon:'🛡️',mpCost:55,cd:20,desc:'Perisai parti, kurang DMG 40% semua berdekatan'},
  resurrection: {name:'Resurrection',  icon:'💫',mpCost:100,cd:90,desc:'Bangkitkan semua ahli party yang gugur'},
};

// ── SKILL TRAINER NPCs ─────────────────────────────────────────────
const SKILL_TRAINERS = {
  // Moradon — trainer neutral
  skill_trainer_moradon: {
    name: 'Guru Kemahiran',
    icon: '📚',
    x: 1300, y: 1150,
    type: 'skill_trainer',
    dialog: 'Kamu mahu belajar kemahiran? Tunjukkan kamu layak dengan mencapai level yang diperlukan!',
    faction: 'any',
  },
  // El Morad
  skill_trainer_el: {
    name: 'Guru El Morad',
    icon: '🧙',
    x: 380, y: 420,
    type: 'skill_trainer',
    dialog: 'Untuk kemuliaan El Morad! Aku akan ajar kamu kemahiran terhebat.',
    faction: 'elmorad',
  },
  // Karus
  skill_trainer_kr: {
    name: 'Guru Karus',
    icon: '🧟',
    x: 1980, y: 2020,
    type: 'skill_trainer',
    dialog: 'Kekuatan Karus mengalir dalam darah kamu. Aku akan bimbing kamu!',
    faction: 'karus',
  },
  // Master Trainer — level 40
  master_trainer_el: {
    name: '⭐ Guru Master',
    icon: '👑',
    x: 420, y: 420,
    type: 'master_trainer',
    dialog: 'Kamu telah mencapai had kelas pertama. Sudah tiba masanya untuk menjadi Master!',
    faction: 'elmorad',
    reqLv: 40,
  },
  master_trainer_kr: {
    name: '⭐ Guru Master',
    icon: '👑',
    x: 2020, y: 2020,
    type: 'master_trainer',
    dialog: 'Pahlawan sejati Karus tidak berhenti di sini. Capai kehebatan Master!',
    faction: 'karus',
    reqLv: 40,
  },
};

// Tambah trainer ke NPCS dan zone
Object.assign(window.NPCS, SKILL_TRAINERS);
window.ZONES.moradon.npc.push('skill_trainer_moradon');
window.ZONES.elmorad.npc.push('skill_trainer_el','master_trainer_el');
window.ZONES.karus.npc.push('skill_trainer_kr','master_trainer_kr');

// ── UI: SKILL TRAINER PANEL ────────────────────────────────────────
function openSkillTrainer(npcId) {
  const npc = window.NPCS[npcId]; if (!npc || !window.selChar) return;
  if (typeof Audio !== 'undefined') Audio.playSFX('npc_talk');

  const panel = document.getElementById('skillTrainerPanel');
  if (!panel) return;
  panel.classList.remove('off');
  renderSkillTrainer(npc);
}

function renderSkillTrainer(npc) {
  const body  = document.getElementById('skillTrainerBody');
  const title = document.getElementById('skillTrainerTitle');
  if (!body || !title) return;

  title.textContent = npc.icon + ' ' + npc.name;
  const job   = window.selChar.job || 'warrior';
  const lv    = window.selChar.level || 1;
  const gold  = window.selChar.gold  || 0;
  const tiers = SKILL_TIERS[job];
  const learned = window.selChar.skill_tree || {};

  // Check tier sudah dibeli
  const boughtTiers = window.selChar.bought_tiers || {};

  let html = `<div style="font-family:'Crimson Text',serif;font-size:.82rem;color:var(--muted);
    line-height:1.6;padding:10px;background:rgba(0,0,0,.3);border-radius:4px;margin-bottom:12px">
    "${npc.dialog}"</div>`;

  html += `<div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--gold);
    margin-bottom:10px">💰 Gold anda: ${gold.toLocaleString()}</div>`;

  // ── Tier Basic ──
  html += renderTierBlock('basic',   tiers.basic,   boughtTiers, lv, gold, job);
  html += renderTierBlock('advanced',tiers.advanced, boughtTiers, lv, gold, job);
  html += renderTierBlock('expert',  tiers.expert,   boughtTiers, lv, gold, job);

  body.innerHTML = html;
}

function renderTierBlock(tierName, tier, boughtTiers, lv, gold, job) {
  const bought   = boughtTiers[tierName];
  const canAfford = gold >= tier.cost;
  const canLevel  = lv >= tier.reqLv;
  const tierLabel = { basic:'🔰 Asas', advanced:'⚡ Lanjutan', expert:'💎 Pakar' }[tierName];
  const tierColor = { basic:'#aaaaaa', advanced:'#40c840', expert:'#4488ff' }[tierName];

  // Skill names dalam tier ini
  const skillNames = tier.skills.map(sid => {
    const tree = window.SKILL_TREES[job];
    const s = [...(tree?.passive||[]),...(tree?.active||[])].find(x=>x.id===sid);
    return s ? `${s.icon} ${s.name}` : sid;
  }).join(', ');

  let statusHtml = '';
  if (bought) {
    statusHtml = `<div style="color:var(--green);font-family:'Cinzel',serif;font-size:.65rem">✅ Sudah dibeli</div>`;
  } else if (!canLevel) {
    statusHtml = `<div style="color:#e84040;font-size:.65rem">🔒 Perlukan Level ${tier.reqLv}</div>`;
  } else if (!canAfford) {
    statusHtml = `<div style="color:#ff8800;font-size:.65rem">💰 Gold tidak cukup (${tier.cost.toLocaleString()} diperlukan)</div>`;
  } else {
    statusHtml = `<button class="btn btn-gold btn-sm" onclick="buySkillTier('${tierName}')"
      style="margin-top:6px;width:100%">📖 Beli — ${tier.cost.toLocaleString()} Gold</button>`;
  }

  return `<div style="background:rgba(0,0,0,.3);border:1px solid ${bought?'rgba(64,200,64,.3)':'rgba(201,168,76,.12)'};
    border-radius:5px;padding:10px;margin-bottom:8px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <div style="font-family:'Cinzel',serif;font-size:.82rem;color:${tierColor}">${tierLabel}</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:var(--muted)">Lv ${tier.reqLv}+</div>
    </div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:var(--muted);margin-bottom:6px">
      Skill: <span style="color:var(--parch)">${skillNames}</span>
    </div>
    ${statusHtml}
  </div>`;
}

function buySkillTier(tierName) {
  if (!window.selChar) return;
  const job   = window.selChar.job || 'warrior';
  const tier  = SKILL_TIERS[job]?.[tierName];
  if (!tier) return;

  const lv   = window.selChar.level || 1;
  const gold = window.selChar.gold  || 0;

  if (lv < tier.reqLv) {
    showSkillTrainerMsg('⚠️ Level tidak mencukupi! Perlukan Lv.' + tier.reqLv, 'err');
    return;
  }
  if (gold < tier.cost) {
    showSkillTrainerMsg('⚠️ Gold tidak cukup! Perlukan ' + tier.cost.toLocaleString() + 'g', 'err');
    return;
  }

  // Bayar
  window.selChar.gold -= tier.cost;
  if (!window.selChar.bought_tiers) window.selChar.bought_tiers = {};
  window.selChar.bought_tiers[tierName] = true;

  // Unlock semua skill dalam tier ini
  if (!window.selChar.skill_tree) window.selChar.skill_tree = {};
  tier.skills.forEach(sid => {
    if (!window.selChar.skill_tree[sid]) window.selChar.skill_tree[sid] = 1;
  });

  // Apply ke player
  if (G.pl) G.pl.applyChar(window.selChar);
  saveProgress();

  const tierLabel = { basic:'Asas', advanced:'Lanjutan', expert:'Pakar' }[tierName];
  showSkillTrainerMsg('✅ Kemahiran ' + tierLabel + ' berjaya dipelajari!', 'ok');
  if (typeof Audio !== 'undefined') Audio.playSFX('levelup');

  // Refresh panel
  setTimeout(() => {
    const npc = Object.values(window.NPCS).find(n => n.type === 'skill_trainer');
    if (npc) renderSkillTrainer(npc);
  }, 1500);

  addChat('', '📖 ' + window.selChar.char_name + ' telah mempelajari kemahiran ' + tierLabel + '!', 'system');
}

function showSkillTrainerMsg(msg, type) {
  let el = document.getElementById('skillTrainerMsg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'skillTrainerMsg';
    el.style.cssText = 'font-family:Cinzel,serif;font-size:.68rem;text-align:center;padding:6px;margin-top:6px';
    document.getElementById('skillTrainerBody')?.appendChild(el);
  }
  el.textContent = msg;
  el.style.color = type === 'err' ? '#e84040' : '#40c840';
  setTimeout(() => { if(el) el.textContent = ''; }, 3000);
}

// ── UI: MASTER CLASS PANEL ─────────────────────────────────────────
function openMasterTrainer(npcId) {
  const npc = window.NPCS[npcId]; if (!npc || !window.selChar) return;
  if (typeof Audio !== 'undefined') Audio.playSFX('npc_talk');

  const lv = window.selChar.level || 1;
  if (lv < 40) {
    // Tunjuk dalam NPC dialog biasa
    sc('npcDialog','on');
    document.getElementById('npcName').textContent = npc.icon + ' ' + npc.name;
    document.getElementById('npcText').textContent =
      `Kamu masih belum layak. Capai Level 40 dahulu untuk menjadi Master!\n\nLevel kamu: ${lv}/40`;
    document.getElementById('npcBtns').innerHTML =
      `<button class="btn btn-dim" style="font-size:.65rem;padding:6px 10px" onclick="closeNPC()">Tutup</button>`;
    return;
  }

  const panel = document.getElementById('masterPanel');
  if (!panel) return;
  panel.classList.remove('off');
  renderMasterPanel(npc);
}

function renderMasterPanel(npc) {
  const body  = document.getElementById('masterBody');
  const title = document.getElementById('masterTitle');
  if (!body || !title) return;

  title.textContent = npc.icon + ' ' + npc.name;
  const job     = window.selChar.job || 'warrior';
  const faction = window.selChar.faction || 'elmorad';
  const isMaster = window.selChar.is_master || false;
  const masterClass = window.selChar.master_class || null;

  if (isMaster && masterClass) {
    // Sudah jadi Master — tunjuk info dan master skill
    renderMasterInfo(body, masterClass);
    return;
  }

  const options = MASTER_CLASSES[job] || [];
  const available = options.filter(m =>
    m.faction === 'any' ||
    m.faction === faction ||
    (faction === 'cahaya' && m.faction === 'elmorad') ||
    (faction === 'karus'  && m.faction === 'karus')
  );

  let html = `<div style="font-family:'Crimson Text',serif;font-size:.82rem;color:var(--muted);
    line-height:1.6;padding:10px;background:rgba(0,0,0,.3);border-radius:4px;margin-bottom:12px">
    "${npc.dialog}"</div>
    <div style="font-family:'Cinzel',serif;font-size:.68rem;color:rgba(201,168,76,.6);
    text-align:center;letter-spacing:.12em;margin-bottom:10px">PILIH KELAS MASTER ANDA</div>`;

  available.forEach(m => {
    const bonusStr = Object.entries(m.bonus)
      .map(([k,v]) => `${k.toUpperCase()} ×${v}`)
      .join(' | ');
    const skillStr = m.skills.map(sid => {
      const s = MASTER_SKILL_DB[sid];
      return s ? `${s.icon}${s.name}` : sid;
    }).join(', ');

    html += `<div style="background:rgba(0,0,0,.4);border:1px solid rgba(201,168,76,.25);
      border-radius:6px;padding:12px;margin-bottom:10px;cursor:pointer;transition:all .2s"
      onmouseover="this.style.borderColor='rgba(201,168,76,.6)'"
      onmouseout="this.style.borderColor='rgba(201,168,76,.25)'">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:2rem">${m.icon}</span>
        <div>
          <div style="font-family:'Cinzel Decorative',serif;font-size:.9rem;color:var(--gold)">${m.name}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:var(--muted);margin-top:2px">${bonusStr}</div>
        </div>
      </div>
      <div style="font-family:'Crimson Text',serif;font-size:.75rem;color:var(--parch);margin-bottom:8px">${m.desc}</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:rgba(201,168,76,.5);margin-bottom:8px">
        Master Skills: <span style="color:var(--parch)">${skillStr}</span>
      </div>
      <button class="btn btn-gold btn-sm" style="width:100%" onclick="chooseMasterClass('${m.id}')">
        ⭐ Pilih ${m.name}
      </button>
    </div>`;
  });

  body.innerHTML = html;
}

function renderMasterInfo(body, masterClassId) {
  // Cari master class
  const allMasters = Object.values(MASTER_CLASSES).flat();
  const mc = allMasters.find(m => m.id === masterClassId);
  if (!mc) return;

  const job = window.selChar.job || 'warrior';
  const learned = window.selChar.skill_tree || {};

  let html = `<div style="text-align:center;padding:16px 0">
    <div style="font-size:3rem">${mc.icon}</div>
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.1rem;color:var(--gold);margin-top:6px">${mc.name}</div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--green);margin-top:4px">✅ Master Class Aktif</div>
  </div>
  <div style="font-family:'Cinzel',serif;font-size:.7rem;color:rgba(201,168,76,.6);
    letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px">Master Skills</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">`;

  mc.skills.forEach(sid => {
    const s   = MASTER_SKILL_DB[sid]; if (!s) return;
    const lv  = (learned['master_'+sid] || 0);
    const maxLv = 5;
    const canUpgrade = (window.selChar.skill_pts||0) > 0 && lv < maxLv;
    html += `<div style="background:rgba(0,0,0,.4);border:1px solid rgba(201,168,76,.18);
      border-radius:4px;padding:8px;text-align:center">
      <div style="font-size:1.4rem">${s.icon}</div>
      <div style="font-family:'Cinzel',serif;font-size:.62rem;color:var(--gold);margin-top:2px">${s.name}</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--muted)">Lv ${lv}/${maxLv}</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--muted);margin:2px 0">${s.mpCost}MP | ${s.cd}s CD</div>
      ${canUpgrade
        ? `<button class="btn btn-gold btn-xs" onclick="upgradeMasterSkill('${sid}')" style="width:100%;margin-top:4px">+1</button>`
        : lv >= maxLv
          ? `<div style="color:var(--green);font-size:.55rem">MAX</div>`
          : `<div style="color:var(--muted);font-size:.55rem">Perlukan SP</div>`
      }
    </div>`;
  });

  html += `</div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--gold);
    margin-top:10px;text-align:center">Skill Points: ${window.selChar.skill_pts||0}</div>`;

  body.innerHTML = html;
}

function chooseMasterClass(masterClassId) {
  const allMasters = Object.values(MASTER_CLASSES).flat();
  const mc = allMasters.find(m => m.id === masterClassId);
  if (!mc || !window.selChar) return;

  const lv = window.selChar.level || 1;
  if (lv < mc.reqLv) {
    alert('Level tidak mencukupi! Perlukan Lv.' + mc.reqLv);
    return;
  }

  if (!confirm(`Pilih ${mc.name} sebagai kelas Master?\n\nPeringatan: Pilihan ini TIDAK BOLEH diubah!`)) return;

  // Apply master class
  window.selChar.is_master    = true;
  window.selChar.master_class = masterClassId;

  // Beri 4 master skill pada level 0 (perlu upgrade dengan SP)
  if (!window.selChar.skill_tree) window.selChar.skill_tree = {};
  mc.skills.forEach(sid => { window.selChar.skill_tree['master_'+sid] = 0; });

  // Apply bonus stats
  if (G.pl) {
    const p = G.pl;
    if (mc.bonus.atk)   p.atk  *= mc.bonus.atk;
    if (mc.bonus.def)   p.def  *= mc.bonus.def;
    if (mc.bonus.hp)    { p.maxHp *= mc.bonus.hp; p.hp = p.maxHp; }
    if (mc.bonus.spd)   p.speed *= mc.bonus.spd;
    if (mc.bonus.crit)  p.critRate *= mc.bonus.crit;
  }

  saveProgress();

  // Notif besar
  showLvNotif();
  if (typeof Audio !== 'undefined') Audio.playSFX('levelup');
  addChat('', '⭐ ' + window.selChar.char_name + ' telah menjadi ' + mc.name + '!', 'system');

  // Update panel
  document.getElementById('masterPanel')?.classList.add('off');
  setTimeout(() => {
    const panel = document.getElementById('masterPanel');
    if (panel) {
      panel.classList.remove('off');
      const npc = Object.values(window.NPCS).find(n => n.type === 'master_trainer');
      if (npc) renderMasterPanel(npc);
    }
  }, 500);

  // Tunjuk notif khusus
  const notif = document.getElementById('masterNotif');
  if (notif) {
    notif.textContent = '⭐ ' + window.selChar.char_name + ' → ' + mc.icon + ' ' + mc.name + '!';
    notif.style.opacity = '1';
    setTimeout(() => { notif.style.opacity = '0'; }, 5000);
  }
}

function upgradeMasterSkill(sid) {
  if (!window.selChar || (window.selChar.skill_pts||0) <= 0) return;
  const key = 'master_' + sid;
  const curLv = window.selChar.skill_tree?.[key] || 0;
  if (curLv >= 5) return;
  window.selChar.skill_tree[key] = curLv + 1;
  window.selChar.skill_pts = Math.max(0, (window.selChar.skill_pts||0) - 1);
  if (G.pl) G.pl.applyChar(window.selChar);
  saveProgress();
  // Refresh panel
  const body = document.getElementById('masterBody');
  if (body) renderMasterInfo(body, window.selChar.master_class);
}

// ── HOOK NPC OPEN ke Skill/Master Trainer ─────────────────────────
const _origOpenNPC = openNPC;
openNPC = function(npcId) {
  const npc = window.NPCS[npcId]; if (!npc) return;
  if (npc.type === 'skill_trainer') { openSkillTrainer(npcId); return; }
  if (npc.type === 'master_trainer') { openMasterTrainer(npcId); return; }
  _origOpenNPC(npcId);
};

// ── LEVEL UP NOTIFICATION untuk Skill/Master ──────────────────────
function _hookSKMGainExp() {
  if (typeof gainExp !== 'function') { setTimeout(_hookSKMGainExp, 200); return; }
  const _origGainExp = gainExp;
gainExp = function(amount) {
  _origGainExp(amount);
  if (!window.selChar) return;
  const lv = window.selChar.level || 1;

  // Notif pergi ke NPC untuk belajar skill
  if (lv === 10 && !(window.selChar.bought_tiers?.basic)) {
    setTimeout(() => {
      addChat('', '📖 Level 10! Pergi ke Guru Kemahiran untuk belajar Kemahiran Asas!', 'system');
      showWvNotif('📖 Pergi jumpa Guru Kemahiran!');
    }, 1000);
  }
  if (lv === 30 && !(window.selChar.bought_tiers?.advanced)) {
    setTimeout(() => {
      addChat('', '📖 Level 30! Guru Kemahiran ada kemahiran Lanjutan untuk kamu!', 'system');
      showWvNotif('📖 Kemahiran Lanjutan tersedia!');
    }, 1000);
  }
  if (lv === 40 && !window.selChar.is_master) {
    setTimeout(() => {
      addChat('', '⭐ Level 40! Pergi ke Guru Master untuk memilih kelas Master!', 'system');
      showWvNotif('⭐ MASTER CLASS tersedia!');
    }, 1000);
  }
  if (lv === 50 && !(window.selChar.bought_tiers?.expert)) {
    setTimeout(() => {
      addChat('', '💎 Level 50! Kemahiran Pakar tersedia dari Guru Kemahiran!', 'system');
    }, 1000);
  }
};
  window.gainExp = gainExp;
}
setTimeout(_hookSKMGainExp, 300);

// ── SAVE: tambah bought_tiers dan master data ──────────────────────
// saveProgress hook
const _origSaveProgress = typeof saveProgress==='function' ? saveProgress : async()=>{};
saveProgress = async function() {
  // Patch skill_tree untuk simpan master data
  if (window.selChar?.is_master !== undefined) {
    // Data master disimpan dalam skill_tree sebagai metadata
    if (!window.selChar.skill_tree) window.selChar.skill_tree = {};
    window.selChar.skill_tree['_is_master']    = window.selChar.is_master    ? 1 : 0;
    window.selChar.skill_tree['_master_class'] = window.selChar.master_class || '';
    window.selChar.skill_tree['_bought_basic']    = window.selChar.bought_tiers?.basic    ? 1 : 0;
    window.selChar.skill_tree['_bought_advanced'] = window.selChar.bought_tiers?.advanced ? 1 : 0;
    window.selChar.skill_tree['_bought_expert']   = window.selChar.bought_tiers?.expert   ? 1 : 0;
  }
  await _origSaveProgress();
};

// ── LOAD: restore master data dari skill_tree ─────────────────────
function restoreMasterData(ch) {
  if (!ch.skill_tree) return ch;
  if (ch.skill_tree['_is_master']) {
    ch.is_master    = ch.skill_tree['_is_master'] === 1;
    ch.master_class = ch.skill_tree['_master_class'] || null;
  }
  ch.bought_tiers = {
    basic:    ch.skill_tree['_bought_basic']    === 1,
    advanced: ch.skill_tree['_bought_advanced'] === 1,
    expert:   ch.skill_tree['_bought_expert']   === 1,
  };
  return ch;
}

// Hook ke enterWorld/selectCharSlot
const _origEnterWorld = typeof enterWorld==='function' ? enterWorld : ()=>{};
enterWorld = function() {
  if (window.selChar) restoreMasterData(window.selChar);
  _origEnterWorld();
};
