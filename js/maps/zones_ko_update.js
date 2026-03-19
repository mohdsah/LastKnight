'use strict';
/* ══════════════════════════════════════════════════════════
   Pahlawan Terakhir — zones_ko_update.js
   Update zone definitions dengan data KO sebenar
   Tambah: Bifrost, Eslant, Ardream, Delos, Dragon Cave
   ══════════════════════════════════════════════════════════ */

window.addEventListener('load', function() {
  if (!window.ZONES) return;

  // ── Update zone moradon dengan keterangan KO sebenar ──
  Object.assign(window.ZONES.moradon, {
    desc: 'Bandar neutral Adonis Continent. Perdagangan, Anvil & Chaotic Generator.',
    reqLv: 0,
    features: ['trading','anvil','chaotic_gen','pet_npc'],
    bgColor: ['#0a0e1a','#080c14'],
  });

  Object.assign(window.ZONES.elmorad, {
    desc: 'Kota manusia El Morad. Piana Knights menjaga kastil ini.',
    reqLv: 10,
    features: ['nation_quest','war_gate'],
  });

  Object.assign(window.ZONES.karus, {
    desc: 'Kubu Orc Karus. Luferson Castle terletak di kaki Gunung Iskanz.',
    reqLv: 10,
    features: ['nation_quest','war_gate'],
  });

  Object.assign(window.ZONES.ardream, {
    desc: 'Zon PvP level 30-59. Bosses Atross & Riote spawn di sini.',
    reqLv: 30, maxLv: 59,
    pvp: true, nw: true,
    features: ['pvp','boss_spawn','nw_points'],
    bgColor: ['#0d0808','#0a0606'],
    torchColor: 'rgba(220,80,40,.12)',
    monsters: ['harpy','deruvish','centaur','dark_stone','troll','atross','riote'],
  });

  Object.assign(window.ZONES.ronark, {
    desc: 'Colony Zone — Zon PvP utama. Felankor & Isiloon spawn di Bowl.',
    reqLv: 55,
    pvp: true, nw: true,
    features: ['pvp','world_boss','bifrost','nw_points','bowl'],
    bgColor: ['#130a08','#0f0806'],
    torchColor: 'rgba(255,60,20,.12)',
    monsters: ['ash_knight','screaming_werewolf','gagoil','doom_soldier',
               'booro','dark_mare','isiloon','felankor'],
  });

  Object.assign(window.ZONES.luferson, {
    desc: 'Eslant Karus Level 60+. Monster kuat, drop tinggi.',
    reqLv: 60,
    pvp: false,
    features: ['eslant','high_drop','world_boss'],
    bgColor: ['#060a14','#040810'],
    torchColor: 'rgba(40,80,200,.12)',
    monsters: ['brahman','apostle_of_flames','ewil_wizard',
               'dread_mare','dark_mare','dragon_tooth','harpy_queen'],
  });

  // ── ZONE BARU dari KO sebenar ──────────────────────────

  // Bifrost — special event zone dalam Ronark
  window.ZONES['bifrost'] = {
    name: 'Bifrost',       icon: '🌈', type: 'event',
    safe: false, pvp: true,
    desc: 'Zon event Bifrost. Serang Bifrost Monument untuk rebut akses!',
    bgColor: ['#080414','#060010'],
    torchColor: 'rgba(150,40,255,.15)',
    reqLv: 55,
    features: ['bifrost_event','fragment_drop','ultima_boss'],
    monsters: ['gagoil','doom_soldier','booro'],
    parentZone: 'ronark',
    spawnX: 1200, spawnY: 800,
    eventDuration: 7200, // 2 jam
  };

  // Dragon Cave — dungeon dalam Ronark
  window.ZONES['dragon_cave'] = {
    name: 'Dragon Cave',   icon: '🐉', type: 'dungeon',
    safe: false, pvp: false,
    desc: 'Gua naga dalam Ronark Land. Level 60+ sahaja.',
    bgColor: ['#140608','#100404'],
    torchColor: 'rgba(255,40,20,.14)',
    reqLv: 60,
    features: ['dungeon','dragon_boss'],
    monsters: ['dark_mare','doom_soldier','dragon_tooth'],
    waves: 15,
    spawnX: 1100, spawnY: 900,
  };

  // Delos / Castle Siege
  window.ZONES['delos'] = {
    name: 'Delos Castle',  icon: '🏯', type: 'siege',
    safe: false, pvp: true,
    desc: 'Delos Castle Siege. Rebut kastil untuk kuasa National Points!',
    bgColor: ['#0a0808','#080606'],
    torchColor: 'rgba(255,200,40,.12)',
    reqLv: 55,
    features: ['castle_siege','abyss_dungeon','nw_points'],
    monsters: ['ash_knight','doom_soldier'],
    siegeInterval: 604800, // seminggu
    spawnX: 1300, spawnY: 1300,
  };

  // Eslant El Morad
  window.ZONES['eslant_el'] = {
    name: 'El Morad Eslant',icon: '🌟', type: 'field',
    safe: false, pvp: false,
    desc: 'Eslant El Morad. Level 60+. Faction El Morad sahaja.',
    bgColor: ['#080c14','#060a10'],
    torchColor: 'rgba(200,160,40,.12)',
    reqLv: 60, faction: 'elmorad',
    features: ['eslant','high_drop','nation_only'],
    monsters: ['brahman','apostle_of_flames','ewil_wizard','dread_mare'],
    spawnX: 600, spawnY: 600,
  };

  console.log('[PT] KO zones updated — Bifrost, Dragon Cave, Delos, Eslant added');
});
