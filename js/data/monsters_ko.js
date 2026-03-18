'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — Monster KO Classic
   Worm, Puss, Bandicoot, Smilodon, Dire Wolf,
   Skeleton, Zombie, Werewolf, Lycaon, Harpy,
   Deruvish, Ash Knight, Doom Soldier, Apostles,
   Death Knight, Atross, Riote,
   Boss: Lobo, Shaula, Isiloon, Bone Dragon, Felankor
   ══════════════════════════════════════════════════════ */

// ── MONSTER STATS TABLE ─────────────────────────────
// Semua stat berganda dengan wave multiplier dalam Enemy constructor
const KO_MONSTERS = {
  // ── Tier 1 — Level Awal ────────────────────────────
  worm: {
    name:'Cacing Tanah', icon:'🐛', col:'#7a8a30', t:1,
    hp:18,  spd:45,  atk:4,  sz:16, rng:30,
    rew:{ xp:5,  gold:1,  sc:22  },
    zone:['moradon','el_morad','luferson'],
    ranged:false,
  },
  puss: {
    name:'Puss',         icon:'🐈', col:'#c8a070', t:1,
    hp:28,  spd:78,  atk:6,  sz:18, rng:34,
    rew:{ xp:7,  gold:1,  sc:30  },
    zone:['moradon','el_morad'],
    ranged:false,
  },
  bandicoot: {
    name:'Bandicoot',    icon:'🦡', col:'#8a7050', t:1,
    hp:42,  spd:72,  atk:8,  sz:20, rng:36,
    rew:{ xp:10, gold:2,  sc:45  },
    zone:['moradon','el_morad','luferson'],
    ranged:false,
  },

  // ── Tier 2 — Level Sederhana ───────────────────────
  smilodon: {
    name:'Smilodon',     icon:'🐆', col:'#d09050', t:2,
    hp:65,  spd:92,  atk:12, sz:22, rng:40,
    rew:{ xp:16, gold:3,  sc:70  },
    zone:['el_morad','luferson'],
    ranged:false,
  },
  dire_wolf: {
    name:'Dire Wolf',    icon:'🐺', col:'#606878', t:2,
    hp:75,  spd:100, atk:14, sz:24, rng:42,
    rew:{ xp:20, gold:4,  sc:88  },
    zone:['el_morad','luferson','ronark'],
    ranged:false,
  },
  skeleton: {
    name:'Skeleton',     icon:'💀', col:'#c8c0a0', t:2,
    hp:55,  spd:60,  atk:10, sz:22, rng:38,
    rew:{ xp:13, gold:3,  sc:60  },
    zone:['el_morad','luferson'],
    ranged:false,
  },
  zombie: {
    name:'Zombie',       icon:'🧟', col:'#5a7a50', t:2,
    hp:95,  spd:42,  atk:16, sz:26, rng:42,
    rew:{ xp:22, gold:4,  sc:95  },
    zone:['el_morad','luferson'],
    ranged:false,
  },

  // ── Tier 3 — Level Tinggi ──────────────────────────
  werewolf: {
    name:'Werewolf',     icon:'🐉', col:'#706058', t:3,
    hp:120, spd:88,  atk:22, sz:28, rng:46,
    rew:{ xp:32, gold:7,  sc:145 },
    zone:['el_morad','luferson','ronark'],
    ranged:false,
  },
  lycaon: {
    name:'Lycaon',       icon:'🦊', col:'#404858', t:3,
    hp:145, spd:95,  atk:24, sz:28, rng:46,
    rew:{ xp:38, gold:8,  sc:170 },
    zone:['ardream','ronark'],
    ranged:false,
  },
  harpy: {
    name:'Harpy',        icon:'🦅', col:'#807080', t:3,
    hp:100, spd:112, atk:20, sz:26, rng:42,
    rew:{ xp:30, gold:6,  sc:135 },
    zone:['ardream','ronark'],
    ranged:true, prefDist:185,
  },
  deruvish: {
    name:'Deruvish',     icon:'🌀', col:'#904028', t:3,
    hp:135, spd:85,  atk:26, sz:28, rng:48,
    rew:{ xp:35, gold:7,  sc:160 },
    zone:['ardream','ronark'],
    ranged:false,
  },

  // ── Tier 4 — Elite ────────────────────────────────
  ash_knight: {
    name:'Ash Knight',   icon:'🗡️', col:'#585870', t:4,
    hp:200, spd:70,  atk:30, sz:32, rng:52,
    rew:{ xp:55, gold:13, sc:240 },
    zone:['ardream','cz'],
    ranged:false,
  },
  doom_soldier: {
    name:'Doom Soldier',  icon:'⚔️', col:'#7a3a3a', t:4,
    hp:220, spd:62,  atk:32, sz:32, rng:52,
    rew:{ xp:60, gold:15, sc:260 },
    zone:['ardream','cz'],
    ranged:false,
  },
  apostles: {
    name:'Apostles',     icon:'👼', col:'#6050a0', t:4,
    hp:240, spd:78,  atk:34, sz:30, rng:52,
    rew:{ xp:65, gold:16, sc:285 },
    zone:['ardream','cz'],
    ranged:true, prefDist:200,
  },

  // ── Tier 5 — Veteran ──────────────────────────────
  death_knight: {
    name:'Death Knight', icon:'⚰️', col:'#303042', t:5,
    hp:300, spd:65,  atk:38, sz:36, rng:56,
    rew:{ xp:88, gold:22, sc:380 },
    zone:['cz'],
    ranged:false,
  },
  atross: {
    name:'Atross',       icon:'🔮', col:'#503080', t:5,
    hp:340, spd:70,  atk:40, sz:34, rng:56,
    rew:{ xp:95, gold:26, sc:420 },
    zone:['cz'],
    ranged:true, prefDist:210,
  },
  riote: {
    name:'Riote',        icon:'🔥', col:'#703030', t:5,
    hp:375, spd:80,  atk:42, sz:36, rng:58,
    rew:{ xp:105,gold:30, sc:470 },
    zone:['cz'],
    ranged:false,
  },

  // ── Boss Tier ──────────────────────────────────────
  lobo: {
    name:'Lobo',         icon:'👑', col:'#505870', t:9,
    hp:800, spd:65,  atk:35, sz:50, rng:68,
    rew:{ xp:350, gold:90,  sc:1800 },
    zone:['el_morad'],
    boss:true, specCnt:8, specType:'fire', specCd:5.5,
  },
  shaula: {
    name:'Shaula',       icon:'👑', col:'#604020', t:9,
    hp:850, spd:60,  atk:38, sz:52, rng:70,
    rew:{ xp:380, gold:100, sc:1900 },
    zone:['luferson'],
    boss:true, specCnt:8, specType:'fire', specCd:5.5,
  },
  isiloon: {
    name:'Isiloon',      icon:'👑', col:'#402870', t:9,
    hp:1200,spd:55,  atk:45, sz:58, rng:75,
    rew:{ xp:600, gold:180, sc:3000 },
    zone:['ardream','cz'],
    boss:true, specCnt:12, specType:'void', specCd:4.5,
  },
  bone_dragon: {
    name:'Bone Dragon',  icon:'🐲', col:'#706050', t:9,
    hp:1500,spd:50,  atk:50, sz:65, rng:85,
    rew:{ xp:800, gold:250, sc:4000 },
    zone:['cz'],
    boss:true, specCnt:14, specType:'void', specCd:4.0,
  },
  felankor: {
    name:'Felankor',     icon:'🐉', col:'#7a1010', t:9,
    hp:2500,spd:45,  atk:58, sz:75, rng:95,
    rew:{ xp:1200,gold:400, sc:6000 },
    zone:['cz'],
    boss:true, specCnt:18, specType:'void', specCd:3.5,
  },
};

// ── DROP TABLES for new monsters ────────────────────
const KO_DROPS = {
  worm:        [ {id:'hpot_sm',rate:.45},{id:'luna_stone',rate:.25},{id:'monsters_bead',rate:.35} ],
  puss:        [ {id:'hpot_sm',rate:.40},{id:'luna_stone',rate:.28},{id:'wraith_stone',rate:.15} ],
  bandicoot:   [ {id:'hpot_sm',rate:.40},{id:'luna_stone',rate:.30},{id:'monsters_bead',rate:.40},{id:'dagger_basic',rate:.04} ],
  smilodon:    [ {id:'hpot_md',rate:.30},{id:'luna_stone',rate:.35},{id:'chaos_stone',rate:.06},{id:'boot_cloth',rate:.04} ],
  dire_wolf:   [ {id:'hpot_md',rate:.30},{id:'luna_stone',rate:.35},{id:'chaos_stone',rate:.07},{id:'glove_leather',rate:.04} ],
  skeleton:    [ {id:'hpot_sm',rate:.40},{id:'wraith_stone',rate:.30},{id:'monsters_bead',rate:.45},{id:'ring_iron',rate:.03} ],
  zombie:      [ {id:'hpot_md',rate:.35},{id:'monsters_bead',rate:.50},{id:'chaos_stone',rate:.08},{id:'armor_leather',rate:.04} ],
  werewolf:    [ {id:'hpot_md',rate:.35},{id:'chaos_stone',rate:.12},{id:'star_stone',rate:.04},{id:'sword_iron',rate:.05},{id:'ring_iron',rate:.04} ],
  lycaon:      [ {id:'chaos_stone',rate:.15},{id:'star_stone',rate:.05},{id:'hpot_md',rate:.40},{id:'sword_steel',rate:.04},{id:'ring_gold',rate:.03} ],
  harpy:       [ {id:'mpot_sm',rate:.40},{id:'chaos_stone',rate:.12},{id:'star_stone',rate:.04},{id:'amulet_jade',rate:.03},{id:'glove_leather',rate:.04} ],
  deruvish:    [ {id:'chaos_stone',rate:.14},{id:'star_stone',rate:.05},{id:'hpot_md',rate:.40},{id:'armor_chain',rate:.04} ],
  ash_knight:  [ {id:'star_stone',rate:.12},{id:'chaos_stone',rate:.50},{id:'hpot_lg',rate:.55},{id:'sword_knight',rate:.04},{id:'helm_knight',rate:.03} ],
  doom_soldier:[ {id:'star_stone',rate:.14},{id:'chaos_stone',rate:.55},{id:'hpot_lg',rate:.55},{id:'armor_plate',rate:.04},{id:'ring_ruby',rate:.02} ],
  apostles:    [ {id:'star_stone',rate:.15},{id:'mpot_md',rate:.45},{id:'chaos_stone',rate:.50},{id:'staff_divine',rate:.04},{id:'amulet_power',rate:.02} ],
  death_knight:[ {id:'star_stone',rate:.20},{id:'chaos_stone',rate:.60},{id:'hpot_lg',rate:.70},{id:'sword_legend',rate:.02},{id:'armor_dark_knight',rate:.03} ],
  atross:      [ {id:'star_stone',rate:.22},{id:'chaos_stone',rate:.65},{id:'mpot_md',rate:.60},{id:'ring_mythic',rate:.01},{id:'staff_mythic',rate:.02} ],
  riote:       [ {id:'star_stone',rate:.25},{id:'chaos_stone',rate:.70},{id:'hpot_lg',rate:.75},{id:'dagger_mythic',rate:.015},{id:'ring_ruby',rate:.04} ],
  lobo:        [ {id:'star_stone',rate:.35},{id:'chaos_stone',rate:.80},{id:'hpot_lg',rate:.90},{id:'ring_gold',rate:.10},{id:'sword_steel',rate:.08},{id:'armor_chain',rate:.08} ],
  shaula:      [ {id:'star_stone',rate:.35},{id:'chaos_stone',rate:.80},{id:'hpot_lg',rate:.90},{id:'ring_ruby',rate:.06},{id:'staff_divine',rate:.06},{id:'amulet_jade',rate:.08} ],
  isiloon:     [ {id:'star_stone',rate:.50},{id:'chaos_stone',rate:.90},{id:'hpot_lg',rate:.95},{id:'ring_mythic',rate:.04},{id:'sword_legend',rate:.03},{id:'armor_dark_knight',rate:.04} ],
  bone_dragon: [ {id:'star_stone',rate:.60},{id:'dragon_scale',rate:.40},{id:'hpot_lg',rate:.95},{id:'sword_mythic',rate:.03},{id:'ring_mythic',rate:.04},{id:'amulet_dragon',rate:.03} ],
  felankor:    [ {id:'dragon_scale',rate:.60},{id:'demon_core',rate:.40},{id:'star_stone',rate:.70},{id:'sword_mythic',rate:.05},{id:'ring_mythic',rate:.05},{id:'earring_mythic',rate:.04} ],
};

// ── ZONE MONSTER LISTS (untuk dipakai dalam ZONES) ──
const KO_ZONE_MONSTERS = {
  moradon:  ['worm','puss','bandicoot'],
  el_morad: ['worm','bandicoot','smilodon','dire_wolf','skeleton','zombie','werewolf'],
  luferson: ['worm','bandicoot','smilodon','dire_wolf','skeleton','zombie','werewolf'],
  ardream:  ['lycaon','dire_wolf','harpy','deruvish','ash_knight','doom_soldier','apostles','death_knight'],
  cz:       ['lycaon','ash_knight','doom_soldier','harpy','deruvish','apostles','death_knight','atross','riote'],
  ronark:   ['dire_wolf','lycaon','werewolf','harpy','deruvish'],
  dungeon_goblin: ['worm','bandicoot','skeleton'],
  dungeon_orc:    ['smilodon','dire_wolf','zombie','werewolf'],
  dungeon_dark:   ['lycaon','deruvish','ash_knight','apostles'],
};

// ── Boss spawn per zone ──────────────────────────────
const KO_ZONE_BOSSES = {
  el_morad: { type:'lobo',      spawnEvery:120, label:'👑 Lobo' },
  luferson: { type:'shaula',    spawnEvery:120, label:'👑 Shaula' },
  ardream:  { type:'isiloon',   spawnEvery:180, label:'👑 Isiloon' },
  cz:       { type:'felankor',  spawnEvery:300, label:'🐉 Felankor' },
  ronark:   { type:'bone_dragon',spawnEvery:240,label:'🐲 Bone Dragon' },
};

// ── Merge into existing Enemy constructor table ──────
// Patch Enemy class to support new monster types
(function patchEnemy() {
  if (typeof Enemy === 'undefined') {
    window.addEventListener('load', patchEnemy);
    return;
  }
  const _orig = Enemy.prototype.constructor;

  // We patch the T table by adding KO monsters to it
  // via a pre-hook on Enemy construction
  const _origTick = Enemy.prototype.tick;
  const _origHit  = Enemy.prototype.hit;

  // Store KO_MONSTERS for constructor access
  window.KO_MONSTERS = KO_MONSTERS;

  // Override constructor via prototype extension
  const origEnemy = Enemy;
  window.Enemy = class Enemy extends origEnemy {
    constructor(x, y, type) {
      // If KO_MONSTERS has this type, use its stats
      const ko = KO_MONSTERS[type];
      if (ko) {
        // Temporarily inject into expected T table format
        // by calling super then overriding
        super(x, y, 'goblin'); // placeholder
        const wv = (typeof G !== 'undefined' && G.wave) ? G.wave : 1;
        this.type = type;
        this.name = ko.name;
        this.icon = ko.icon;
        this.col  = ko.col;
        this.maxHp = this.hp = Math.floor(ko.hp * (1 + (wv-1) * 0.09));
        this.speed = ko.spd;
        this.atk   = Math.floor(ko.atk * (1 + (wv-1) * 0.06));
        this.sz    = ko.sz;
        this.rng   = ko.rng;
        this.rew   = {
          xp:   ko.rew.xp,
          gold: Math.floor(ko.rew.gold * (1 + (wv-1) * 0.05)),
          sc:   ko.rew.sc,
        };
        this.dead = false; this.rewarded = false;
        this.hurt = 0; this.aTimer = 0; this.aFrame = 0;
        this.acd  = 0; this.dir = 0; this.shootCd = 0;
        this.specTimer = ko.boss ? (ko.specCd || 5.5) : 99;
        this.stunned = 0; this.slowed = 0; this.poison = null;
        this.poisonTimer = 0; this.burnTimer = 0;
        this.boss = ko.boss || false;
        this.elite= false;
        if (ko.ranged) this.prefDist = ko.prefDist || 185;
        // Draw with KO renderer
        this._koType = true;
        this._koData = ko;
        // Boss spec settings
        if (ko.boss) {
          this.specCnt  = ko.specCnt  || 8;
          this.specType = ko.specType || 'fire';
          this.specCd   = ko.specCd   || 5.5;
        }
      } else {
        super(x, y, type);
      }
    }

    tick(dt, player, projs) {
      if (this.dead) return;
      if (!this._koType) { super.tick(dt, player, projs); return; }

      // KO-specific AI tick
      if (this.hurt > 0)    this.hurt -= dt;
      if (this.acd > 0)     this.acd  -= dt;
      if (this.stunned > 0) { this.stunned -= dt; return; }
      if (this.slowed > 0)  this.slowed -= dt;
      this.aTimer += dt;
      if (this.aTimer > .18) { this.aTimer = 0; this.aFrame = (this.aFrame + 1) % 4; }

      const spd = this.slowed > 0 ? this.speed * .45 : this.speed;
      const dx  = player.x - this.x, dy = player.y - this.y;
      const dist = Math.hypot(dx, dy) || .1;
      this.dir  = Math.atan2(dy, dx);
      this._facing = Math.cos(this.dir) >= 0 ? 1 : -1;

      if (this._koData?.ranged) {
        const pd = this.prefDist || 185;
        if (dist > pd + 30) { this.x += dx/dist*spd*dt; this.y += dy/dist*spd*dt; }
        else if (dist < pd - 30) { this.x -= dx/dist*spd*dt*.5; this.y -= dy/dist*spd*dt*.5; }
        this.shootCd -= dt;
        if (this.shootCd <= 0 && dist < 320) {
          this.shootCd = this.boss ? 1.8 : 2.4;
          if (typeof Proj !== 'undefined')
            projs.push(new Proj(this.x, this.y, player.x, player.y,
              this.boss ? 'void' : 'dark', this.atk));
        }
      } else {
        if (dist > this.rng) { this.x += dx/dist*spd*dt; this.y += dy/dist*spd*dt; }
        else if (this.acd <= 0) {
          this.acd = this.boss ? 1.0 : 1.7;
          if (typeof player.hurt2 === 'function') player.hurt2(this.atk + rnd(-4, 6));
          if (typeof nwActive !== 'undefined' && nwActive && typeof addNWKill === 'function') addNWKill();
        }
      }

      // Boss special attack
      if (this.boss) {
        this.specTimer -= dt;
        if (this.specTimer <= 0) {
          this.specTimer = this.specCd || 5.5;
          const cnt = this.specCnt || 8;
          for (let i = 0; i < cnt; i++) {
            const a = (i / cnt) * Math.PI * 2;
            if (typeof Proj !== 'undefined')
              projs.push(new Proj(this.x, this.y,
                this.x + Math.cos(a) * 270, this.y + Math.sin(a) * 270,
                this.specType || 'fire', this.atk * .7));
          }
        }
      }
      this.x = Math.max(8, Math.min(WW - 8, this.x));
      this.y = Math.max(8, Math.min(WH - 8, this.y));
    }

    hit(dmg) {
      this.hp -= dmg; this.hurt = .18;
      if (this.hp <= 0) { this.hp = 0; this.dead = true; }
    }
  };
})();

// ── Merge drops into DROP_TABLE_EXT ─────────────────
window.addEventListener('DOMContentLoaded', function() {
  if (window.DROP_TABLE_EXT) {
    Object.assign(window.DROP_TABLE_EXT, KO_DROPS);
  }
  // Update zone monster lists
  if (window.ZONES) {
    Object.entries(KO_ZONE_MONSTERS).forEach(([zid, mlist]) => {
      if (window.ZONES[zid]) window.ZONES[zid].monsters = mlist;
    });
  }
  // Update boss spawns
  if (window.BOSS_SPAWNS) {
    Object.entries(KO_ZONE_BOSSES).forEach(([zid, cfg]) => {
      if (!window.BOSS_SPAWNS[zid]) window.BOSS_SPAWNS[zid] = [];
      // Only add if boss not already present
      const hasType = window.BOSS_SPAWNS[zid].some(b => b.type === cfg.type);
      if (!hasType) {
        window.BOSS_SPAWNS[zid].push({
          type: cfg.type, x: 1200, y: 1200,
          spawnEvery: cfg.spawnEvery, timer: cfg.spawnEvery,
          active: false, label: cfg.label,
        });
      }
    });
  }
});

// ── Expose globals ───────────────────────────────────
window.KO_MONSTERS      = KO_MONSTERS;
window.KO_DROPS         = KO_DROPS;
window.KO_ZONE_MONSTERS = KO_ZONE_MONSTERS;
window.KO_ZONE_BOSSES   = KO_ZONE_BOSSES;
