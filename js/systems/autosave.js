'use strict';
/* ══ Systems: Auto-Save & Cloud Sync ══
   Autosave setiap 60 saat
   Force save bila tukar zone / level up / equip
   ══════════════════════════════════════════════ */

window.AutoSave = {
  interval:   60000,  // 60 saat
  lastSave:   0,
  saving:     false,
  pending:    false,
  timer:      null,

  start() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.save(), this.interval);
    // Save on page unload
    window.addEventListener('beforeunload', () => this.save('force'));
    console.log('[AutoSave] Started — every', this.interval/1000, 'seconds');
  },

  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  },

  async save(reason='auto') {
    if (this.saving) { this.pending = true; return; }
    if (!window.selChar || window.offlineMode) return;
    if (!window.SB) return;

    this.saving = true;
    const now = Date.now();

    try {
      // Build save data
      const sc = window.selChar;
      const G  = window.G;

      const saveData = {
        level:         sc.level        || 1,
        xp:            sc.xp           || 0,
        gold:          sc.gold         || 0,
        stat_str:      sc.stat_str     || 70,
        stat_hp:       sc.stat_hp      || 70,
        stat_dex:      sc.stat_dex     || 65,
        stat_int:      sc.stat_int     || 55,
        stat_mp:       sc.stat_mp      || 55,
        stat_pts:      sc.stat_pts     || 0,
        skill_pts:     sc.skill_pts    || 0,
        hp_current:    G?.pl?.hp       || sc.hp_current || null,
        mp_current:    G?.pl?.mp       || sc.mp_current || null,
        best_wave:     sc.best_wave    || 0,
        best_score:    sc.best_score   || 0,
        current_zone:  sc.current_zone || 'moradon',
        inventory:     JSON.stringify(sc.inventory  || {}),
        equipment:     JSON.stringify(sc.equipment  || {}),
        skill_tree:      JSON.stringify(typeof sc.skill_tree==='string' ? (()=>{ try{return JSON.parse(sc.skill_tree||'{}')}catch(e){return {}} })() : (sc.skill_tree||{})),
        daily_progress:  JSON.stringify(sc.daily_progress  || {}),
        quest_progress:  JSON.stringify(sc.quest_progress   || {}),
      };

      const { error } = await window.SB.from('kn_players')
        .update(saveData).eq('char_name', sc.char_name);

      if (!error) {
        this.lastSave = now;
        this.showSaveIndicator(reason);
        // Update leaderboard jika level/score berubah
        if (reason === 'levelup' || reason === 'score') {
          await this.updateLeaderboard(sc, G);
        }
      }
    } catch(e) {
      console.warn('[AutoSave] Error:', e.message);
    } finally {
      this.saving = false;
      if (this.pending) { this.pending = false; this.save('pending'); }
    }
  },

  async updateLeaderboard(sc, G) {
    if (!window.SB) return;
    try {
      await window.SB.from('kn_leaderboard').upsert({
        char_name: sc.char_name,
        account_id: window.curAccount?.uid,
        faction: sc.faction,
        level: sc.level || 1,
        score: sc.best_score || 0,
        wave:  sc.best_wave  || 0,
        updated_at: new Date().toISOString(),
      }, { onConflict:'char_name' });
    } catch(e) {}
  },

  showSaveIndicator(reason) {
    const el = document.getElementById('saveIndicator');
    if (!el) return;
    el.textContent = reason==='auto' ? '💾 Auto-saved' : '💾 Saved';
    el.style.opacity = '1';
    setTimeout(() => { if(el) el.style.opacity = '0'; }, 2000);
  },

  // Force save dengan reason
  forceSave(reason='manual') {
    return this.save(reason);
  },
};

window.AutoSave = window.AutoSave;
