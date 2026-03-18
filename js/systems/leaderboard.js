'use strict';
/* ══ Systems: Leaderboard ══
   Top Level, Top PvP, Top Gold, Top Guild
   ══════════════════════════════════════════════ */

window.Leaderboard = {
  cache: {},
  cacheTime: {},
  TTL: 60000, // 1 minit cache

  async fetch(type) {
    const now = Date.now();
    if (this.cache[type] && now - this.cacheTime[type] < this.TTL) {
      return this.cache[type];
    }
    if (!window.SB || window.offlineMode) return [];

    let query;
    switch(type) {
      case 'level':
        query = window.SB.from('kn_players').select('char_name,level,faction,job').order('level',{ascending:false}).limit(10);
        break;
      case 'gold':
        query = window.SB.from('kn_players').select('char_name,gold,faction,level').order('gold',{ascending:false}).limit(10);
        break;
      case 'pvp':
        query = window.SB.from('kn_players').select('char_name,best_score,faction,level').order('best_score',{ascending:false}).limit(10);
        break;
      case 'guild':
        query = window.SB.from('kn_guilds').select('name,faction,member_count,level').order('level',{ascending:false}).limit(10);
        break;
      default:
        return [];
    }

    const { data } = await query;
    this.cache[type]     = data || [];
    this.cacheTime[type] = now;
    return this.cache[type];
  },

  async render(type, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '<div style="color:var(--muted);text-align:center;padding:10px">⏳</div>';
    const data = await this.fetch(type);

    if (!data.length) {
      el.innerHTML = '<div style="color:var(--muted);text-align:center;padding:10px;font-family:Share Tech Mono,monospace;font-size:.7rem">Tiada rekod lagi</div>';
      return;
    }

    const medals = ['🥇','🥈','🥉'];
    const rows = data.map((p, i) => {
      const isEl = p.faction==='elmorad'||p.faction==='cahaya';
      const fIcon = isEl ? '🌟' : '🔥';
      const jobIcon = {warrior:'⚔️',rogue:'🗡️',magician:'🔮',priest:'✨'}[p.job] || '?';
      const medal = medals[i] || `${i+1}.`;

      let valStr = '';
      if (type==='level')  valStr = `Lv.${p.level}`;
      if (type==='gold')   valStr = `💰${(p.gold||0).toLocaleString()}`;
      if (type==='pvp')    valStr = `⚔${p.best_score||0}`;
      if (type==='guild')  valStr = `👥${p.member_count||0}`;

      const name = p.char_name || p.name || '?';
      return `
        <div style="display:flex;align-items:center;gap:8px;padding:6px 12px;
          border-bottom:1px solid rgba(201,168,76,.07);font-size:.72rem;
          ${i===0?'background:rgba(201,168,76,.06)':''}">
          <span style="width:24px;text-align:center">${medal}</span>
          <span style="flex:1;font-family:Cinzel,serif;color:${isEl?'#c9a84c':'#cc6644'}">${fIcon} ${name}</span>
          ${type!=='guild'?`<span style="font-size:.9rem">${jobIcon}</span>`:''}
          <span style="font-family:Share Tech Mono,monospace;color:var(--gold2)">${valStr}</span>
        </div>`;
    }).join('');

    el.innerHTML = rows;
  },

  async renderAll() {
    await Promise.all([
      this.render('level', 'lb-level'),
      this.render('gold',  'lb-gold'),
      this.render('pvp',   'lb-pvp'),
      this.render('guild', 'lb-guild'),
    ]);
  },
};

window.Leaderboard = window.Leaderboard;
