'use strict';
/* ══ Systems: Daily Quest & Achievement ══
   Reset setiap 24 jam
   Track progress realtime
   ══════════════════════════════════════════════ */

window.DailyQuest = {

  // ── QUEST DEFINITIONS ────────────────────────
  QUESTS: {
    daily_kill_20:  { id:'daily_kill_20',  type:'daily', label:'Bunuh 20 Musuh',      icon:'⚔️', goal:20,  track:'kills',      reward:{xp:500,  gold:200,  item:'hpot_md'} },
    daily_farm_500: { id:'daily_farm_500', type:'daily', label:'Kumpul 500 Gold',     icon:'💰', goal:500, track:'gold_earned', reward:{xp:300,  gold:0,    item:'luna_stone'} },
    daily_zone3:    { id:'daily_zone3',    type:'daily', label:'Lawati 3 Zon Berbeza', icon:'🗺️', goal:3,   track:'zones',       reward:{xp:400,  gold:150,  item:'mpot_sm'} },
    daily_pvp3:     { id:'daily_pvp3',     type:'daily', label:'Menang 3 PvP',         icon:'🏆', goal:3,   track:'pvp_wins',    reward:{xp:800,  gold:300,  item:'chaos_stone'} },
    daily_boss:     { id:'daily_boss',     type:'daily', label:'Kalahkan 1 Boss',      icon:'💀', goal:1,   track:'boss_kills',  reward:{xp:1500, gold:500,  item:'star_stone'} },
  },

  // ── GET PLAYER PROGRESS ───────────────────────
  getProgress() {
    const sc = window.selChar;
    if (!sc) return {};
    try {
      const tree = typeof sc.skill_tree === 'string' ? JSON.parse(sc.skill_tree||'{}') : sc.skill_tree || {};
      const today = new Date().toDateString();
      if (tree._dailyDate !== today) {
        // Reset daily progress
        tree._dailyDate = today;
        tree._daily = {};
        sc.skill_tree = tree;
      }
      return tree._daily || {};
    } catch { return {}; }
  },

  addProgress(track, amount=1) {
    const sc = window.selChar; if (!sc) return;
    try {
      let tree = typeof sc.skill_tree === 'string' ? JSON.parse(sc.skill_tree||'{}') : sc.skill_tree || {};
      const today = new Date().toDateString();
      if (tree._dailyDate !== today) { tree._dailyDate = today; tree._daily = {}; }
      if (!tree._daily) tree._daily = {};
      tree._daily[track] = (tree._daily[track]||0) + amount;
      sc.skill_tree = tree;

      // Check quest completion
      Object.values(this.QUESTS).forEach(q => {
        if (q.track === track && (tree._daily[track]||0) >= q.goal) {
          if (!tree._daily[`done_${q.id}`]) {
            tree._daily[`done_${q.id}`] = true;
            sc.skill_tree = tree;
            this.notifyComplete(q);
          }
        }
      });
    } catch {}
  },

  notifyComplete(quest) {
    const rew = quest.reward;
    const sc  = window.selChar; if (!sc) return;
    sc.gold = (sc.gold||0) + (rew.gold||0);
    sc.xp   = (sc.xp||0)   + (rew.xp||0);
    if (rew.item && sc.inventory) {
      sc.inventory[rew.item] = (sc.inventory[rew.item]||0) + 1;
    }
    if (typeof addChat==='function') addChat('📋 QUEST', `${quest.icon} "${quest.label}" selesai! +${rew.xp}xp +${rew.gold}g`, 'system');
    // Show notif
    const fl = document.getElementById('questNotif');
    if (fl) { fl.textContent=`✅ Quest: ${quest.label}`; fl.classList.add('sh'); setTimeout(()=>fl.classList.remove('sh'),3000); }
  },

  renderPanel(containerId) {
    const el = document.getElementById(containerId); if (!el) return;
    const prog = this.getProgress();
    const quests = Object.values(this.QUESTS);
    const today = new Date().toLocaleDateString('ms-MY');

    el.innerHTML = `
      <div style="font-family:Cinzel,serif;font-size:.6rem;color:rgba(201,168,76,.5);letter-spacing:.15em;margin-bottom:10px">
        RESET ESOK TENGAH MALAM · ${today}
      </div>
      ${quests.map(q => {
        const cur   = Math.min(prog[q.track]||0, q.goal);
        const pct   = Math.min(100, cur/q.goal*100);
        const done  = prog[`done_${q.id}`];
        return `
          <div style="background:rgba(0,0,0,.3);border:1px solid rgba(201,168,76,${done?'.4':'.1'});border-radius:5px;padding:10px;margin-bottom:8px;${done?'opacity:.6':''}">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
              <span style="font-family:Cinzel,serif;font-size:.72rem;color:${done?'var(--green)':'var(--gold)'}">${q.icon} ${q.label}</span>
              <span style="font-family:Share Tech Mono,monospace;font-size:.62rem;color:rgba(201,168,76,.6)">${cur}/${q.goal}</span>
            </div>
            <div style="height:4px;background:rgba(0,0,0,.4);border-radius:2px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${done?'#40c840':'var(--gold)'};transition:width .3s"></div>
            </div>
            <div style="font-family:Share Tech Mono,monospace;font-size:.58rem;color:rgba(201,168,76,.4);margin-top:4px">
              +${q.reward.xp}xp +${q.reward.gold}g ${q.reward.item?'📦':''}
              ${done ? '<span style="color:#40c840;float:right">✅ SELESAI</span>' : ''}
            </div>
          </div>`;
      }).join('')}`;
  },
};

window.DailyQuest = window.DailyQuest;
