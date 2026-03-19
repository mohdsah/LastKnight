'use strict';
/* ══ Systems: World Boss Raid ══
   Spawn setiap 2 jam, semua player boleh sertai
   Top damage dapat reward Legendary
   ══════════════════════════════════════════════ */

window.WorldBoss = {
  active:    false,
  hp:        25000,
  maxHp:     25000,
  type:      'world_dragon',
  zone:      'ronark',
  x:         1200,
  y:         800,
  timer:     0,
  spawnIn:   7200,  // 2 jam
  damageLog: {},    // uid → {name, dmg, faction}
  lastAnnounce: 0,

  // Check & spawn
  tick(dt) {
    if (this.active) return;
    this.timer += dt;
    if (this.timer >= this.spawnIn) {
      this.spawn();
    }
  },

  spawn() {
    this.active  = true;
    this.hp      = this.maxHp;
    this.timer   = 0;
    this.damageLog = {};
    this.announce('🐉 WORLD BOSS MUNCUL di Ronark Land! Semua pejuang, bersiap!', 'event');
    // Update boss timer HUD
    const el = document.getElementById('worldBossTimer');
    if (el) { el.style.display='block'; el.textContent='🐉 WORLD BOSS AKTIF!'; }
  },

  takeDamage(dmg, player) {
    if (!this.active || !player) return;
    this.hp = Math.max(0, this.hp - dmg);
    // Log damage
    const uid = player.uid || player.char_name;
    if (!this.damageLog[uid]) this.damageLog[uid] = { name: player.char_name, dmg: 0, faction: player.faction };
    this.damageLog[uid].dmg += dmg;
    // Update HUD
    const pct = this.hp / this.maxHp * 100;
    const bar = document.getElementById('worldBossBar');
    if (bar) bar.style.width = pct + '%';
    const lbl = document.getElementById('worldBossHp');
    if (lbl) lbl.textContent = `🐉 ${this.hp.toLocaleString()} / ${this.maxHp.toLocaleString()}`;
    if (this.hp <= 0) this.die();
  },

  die() {
    this.active = false;
    this.announce('💀 World Boss dikalahkan! Tahniah kepada semua pejuang!', 'event');
    this.giveRewards();
    // Respawn dalam 2 jam
    this.spawnIn = 7200;
    const el = document.getElementById('worldBossTimer');
    if (el) el.style.display='none';
  },

  giveRewards() {
    // Sort by damage
    const sorted = Object.entries(this.damageLog)
      .sort((a,b) => b[1].dmg - a[1].dmg);
    if (!sorted.length) return;

    const rewards = [
      { item:'sword_legend',  gold:5000, pts:500, label:'🥇 MVP' },
      { item:'amulet_power',  gold:3000, pts:300, label:'🥈 2nd' },
      { item:'ring_ruby',     gold:1500, pts:150, label:'🥉 3rd' },
    ];

    sorted.slice(0,3).forEach(([uid, data], i) => {
      const r = rewards[i];
      this.announce(`${r.label} ${data.name} — +${r.gold} gold, ${r.item}!`, 'event');
    });
    // All participants get base reward
    sorted.forEach(([uid, data]) => {
      this.announce(`⚔️ ${data.name} — Damage: ${data.dmg.toLocaleString()}`, 'info');
    });
  },

  announce(msg, type='info') {
    // Send to realtime broadcast
    if (window.SB && !window.offlineMode) {
      try {
        window.SB.channel('ko_world').send({
          type:'broadcast', event:'gm_broadcast',
          payload:{ msg, type, from:'SYSTEM', ts: Date.now() }
        });
      } catch(e) {}
    }
    // Also show in local chat
    if (typeof addChat === 'function') addChat('🌍 SYSTEM', msg, type);
  },

  getTimeUntil() {
    const remaining = Math.max(0, this.spawnIn - this.timer);
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = Math.floor(remaining % 60);
    return `${h}j ${m}m ${s}s`;
  },
};

window.WorldBoss = window.WorldBoss;
