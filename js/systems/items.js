'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — Item System v2
   Set Bonus, Tooltip, Elixir Buffs, Auto-equip suggest
   ══════════════════════════════════════════════════════ */

// ── SET BONUS DEFINITIONS ─────────────────────────────
window.SET_BONUS = {
  dark_knight: {
    name: 'Dark Knight Set',
    pieces: ['sword_mythic','armor_dark_knight','helm_dark_knight','glove_dark','boot_dark'],
    bonus: {
      2: { atk: 20, desc: '+20 ATK' },
      4: { atk: 40, def: 20, spd: 10, desc: '+40 ATK +20 DEF +10 SPD' },
      5: { atk: 60, def: 30, spd: 20, crit: .08, desc: '+60 ATK +30 DEF +20 SPD +8% CRIT' },
    },
  },
  shadow: {
    name: 'Shadow Set',
    pieces: ['dagger_mythic','bow_shadow'],
    bonus: {
      2: { dex: 25, crit: .12, desc: '+25 DEX +12% CRIT' },
    },
  },
  inferno: {
    name: 'Inferno Set',
    pieces: ['staff_mythic','robe_inferno'],
    bonus: {
      2: { int: 30, mp: 100, desc: '+30 INT +100 MP' },
    },
  },
  holy: {
    name: 'Holy Set',
    pieces: ['staff_holy','robe_holy'],
    bonus: {
      2: { int: 25, hp: 80, healBonus: .2, desc: '+25 INT +80 HP +20% Heal' },
    },
  },
};

// ── ACTIVE ELIXIR BUFFS ───────────────────────────────
window.ActiveBuffs = {
  _buffs: {},

  apply(itemId) {
    const item = window.ITEM_DB?.[itemId];
    if (!item) return;
    const p = window.G?.pl;
    if (!p) return;

    if (typeof Audio !== 'undefined') Audio.playSFX('elixir');
    if (item.buffAtk)  { this._buffs.atk  = { val: item.buffAtk,  dur: item.buffDur, orig: p.atk  }; p.atk  += item.buffAtk; }
    if (item.buffDef)  { this._buffs.def  = { val: item.buffDef,  dur: item.buffDur, orig: p.def  }; p.def  += item.buffDef; }
    if (item.buffSpd)  { this._buffs.spd  = { val: item.buffSpd,  dur: item.buffDur, orig: p.speed }; p.speed += item.buffSpd; }
    if (item.cure === 'poison' && p.poisonImmune !== undefined) p.poisonImmune = 30;
    if (item.revive) {
      if (typeof Audio !== 'undefined') Audio.playSFX('rare');
      if (!window.selChar) return;
      window.selChar._hasRevive = true;
      if (typeof addChat === 'function') addChat('', '💎 Revive Stone aktif — akan bangkit sekali!', 'system');
    }
    if (typeof addChat === 'function') addChat('', `✨ ${item.name} dipakai!`, 'system');
    this._renderHUD();
  },

  tick(dt) {
    let changed = false;
    const p = window.G?.pl;
    for (const [key, buff] of Object.entries(this._buffs)) {
      buff.dur -= dt;
      if (buff.dur <= 0) {
        if (p) {
          if (key === 'atk')  p.atk   = buff.orig;
          if (key === 'def')  p.def   = buff.orig;
          if (key === 'spd')  p.speed = buff.orig;
        }
        delete this._buffs[key];
        changed = true;
      }
    }
    if (changed) this._renderHUD();
  },

  _renderHUD() {
    const el = document.getElementById('activeBuff');
    if (!el) return;
    const items = Object.entries(this._buffs);
    if (!items.length) { el.innerHTML = ''; return; }
    el.innerHTML = items.map(([k,b]) => {
      const m = Math.floor(b.dur/60), s = Math.floor(b.dur%60);
      const icons = { atk:'⚔️', def:'🛡️', spd:'⚡' };
      return `<span style="font-size:.62rem;background:rgba(0,0,0,.5);
        border:1px solid rgba(201,168,76,.3);border-radius:3px;padding:2px 5px">
        ${icons[k]||'✨'}${b.val>0?'+'+b.val:''} ${m}:${String(s).padStart(2,'0')}
      </span>`;
    }).join(' ');
  },
};

// ── SET BONUS CALCULATOR ──────────────────────────────
window.ItemSystem = {

  getSetBonus(char) {
    if (!char?.equipment) return {};
    const eq = char.equipment;
    const equipped = Object.values(eq).filter(Boolean);
    const totals = {};

    for (const [setId, setDef] of Object.entries(window.SET_BONUS)) {
      const count = setDef.pieces.filter(p => equipped.includes(p)).length;
      if (count < 2) continue;
      // Get highest applicable bonus tier
      const tiers = Object.keys(setDef.bonus).map(Number).sort((a,b) => b-a);
      for (const tier of tiers) {
        if (count >= tier) {
          const bonus = setDef.bonus[tier];
          totals[setId] = { ...bonus, tier, count, name: setDef.name };
          break;
        }
      }
    }
    return totals;
  },

  applySetBonusToPlayer(char, player) {
    const prevBonuses = this._prevBonuses || {};
    const bonuses = this.getSetBonus(char);
    const newSets = Object.keys(bonuses).filter(k => !prevBonuses[k]);
    if (newSets.length && typeof Audio !== 'undefined') Audio.playSFX('set_bonus');
    this._prevBonuses = bonuses;
    for (const bonus of Object.values(bonuses)) {
      if (bonus.atk)   player.atk   += bonus.atk;
      if (bonus.def)   player.def   += bonus.def;
      if (bonus.spd)   player.speed += bonus.spd;
      if (bonus.crit)  player.critRate += bonus.crit;
    }
  },

  // ── ITEM TOOLTIP HTML ─────────────────────────────────
  getTooltipHTML(itemId) {
    const item = window.ITEM_DB?.[itemId];
    if (!item) return '';
    const rar    = window.RARITY?.[item.rarity] || { color:'#aaa', label:'Common' };
    const enh    = item.enh || 0;
    const mult   = 1 + enh * .08;
    const setBonus = item.set ? window.SET_BONUS[item.set] : null;

    let stats = '';
    if (item.atk)   stats += `<div>⚔️ ATK <b style="color:#ffcc44">+${Math.floor((item.atk||0)*mult)}</b>${enh>0?` <span style="color:#ff8800">(+${enh})</span>`:''}</div>`;
    if (item.def)   stats += `<div>🛡️ DEF <b style="color:#44ccff">+${Math.floor((item.def||0)*mult)}</b></div>`;
    if (item.int)   stats += `<div>🔮 INT <b style="color:#aa88ff">+${Math.floor((item.int||0)*mult)}</b></div>`;
    if (item.str)   stats += `<div>💪 STR <b style="color:#ff8844">+${item.str}</b></div>`;
    if (item.dex)   stats += `<div>🌀 DEX <b style="color:#44ffaa">+${item.dex}</b></div>`;
    if (item.hp)    stats += `<div>❤️ HP  <b style="color:#ff4444">+${item.hp}</b></div>`;
    if (item.mp)    stats += `<div>💧 MP  <b style="color:#4488ff">+${item.mp}</b></div>`;
    if (item.spd)   stats += `<div>⚡ SPD <b style="color:#ffff44">+${item.spd}</b></div>`;
    if (item.heal)  stats += `<div>💊 Pulih <b style="color:#40c840">+${item.heal} HP</b></div>`;
    if (item.mana)  stats += `<div>💧 Pulih <b style="color:#4488ff">+${item.mana} MP</b></div>`;
    if (item.buffAtk) stats += `<div>⚔️ +${item.buffAtk} ATK selama ${item.buffDur}s</div>`;
    if (item.buffSpd) stats += `<div>⚡ +${item.buffSpd} SPD selama ${item.buffDur}s</div>`;
    if (item.buffDef) stats += `<div>🛡️ +${item.buffDef} DEF selama ${item.buffDur}s</div>`;

    const jobStr = item.jobs ? item.jobs.join(', ') : 'Semua';
    const reqStr = item.reqStr ? `STR ${item.reqStr}` : item.reqDex ? `DEX ${item.reqDex}` : item.reqInt ? `INT ${item.reqInt}` : '';

    return `
      <div style="
        background:rgba(6,4,16,.98);border:1px solid ${rar.color};
        border-radius:5px;padding:10px 12px;min-width:180px;max-width:220px;
        font-family:'Share Tech Mono',monospace;font-size:.68rem;
        box-shadow:0 0 20px rgba(0,0,0,.8),0 0 10px ${rar.color}22;
        pointer-events:none">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
          <span style="font-size:1.2rem">${item.icon}</span>
          <div>
            <div style="font-family:'Cinzel',serif;font-size:.78rem;color:${rar.color};
              text-shadow:0 0 8px ${rar.color}66">${item.name}${enh>0?` <span style="color:#ff8800">+${enh}</span>`:''}</div>
            <div style="font-size:.58rem;color:${rar.color}88;letter-spacing:.1em">${rar.label.toUpperCase()}</div>
          </div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,.06);padding-top:6px;
          color:rgba(220,210,190,.8);line-height:1.7">${stats || '<div style="color:var(--muted)">Tiada stat</div>'}</div>
        ${reqStr ? `<div style="margin-top:4px;color:rgba(200,160,80,.6);font-size:.6rem">Perlu: ${reqStr}</div>`:''}
        <div style="margin-top:4px;color:rgba(180,160,120,.5);font-size:.6rem">Job: ${jobStr}</div>
        ${setBonus ? `<div style="margin-top:6px;padding:4px 6px;
          background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);border-radius:3px;
          color:#c9a84c;font-size:.6rem">✦ ${setBonus.name}</div>`:''}
        ${item.price ? `<div style="margin-top:6px;display:flex;justify-content:space-between;
          color:rgba(180,160,120,.5);font-size:.6rem;border-top:1px solid rgba(255,255,255,.05);padding-top:4px">
          <span>💰 ${item.price.toLocaleString()}g</span>
          <span>Jual: ${item.sell?.toLocaleString()||0}g</span>
        </div>`:''}
      </div>`;
  },

  // ── SHOW / HIDE TOOLTIP ──────────────────────────────
  showTooltip(itemId, x, y) {
    let el = document.getElementById('itemTooltip');
    if (!el) {
      el = document.createElement('div');
      el.id = 'itemTooltip';
      el.style.cssText = 'position:fixed;z-index:200;pointer-events:none;transition:opacity .15s';
      document.body.appendChild(el);
    }
    el.innerHTML = this.getTooltipHTML(itemId);
    el.style.opacity = '1';
    // Position smartly
    const vw = window.innerWidth, vh = window.innerHeight;
    const tw = 220, th = 180;
    el.style.left = Math.min(x + 12, vw - tw - 8) + 'px';
    el.style.top  = Math.min(y - 10, vh - th - 8) + 'px';
  },

  hideTooltip() {
    const el = document.getElementById('itemTooltip');
    if (el) { el.style.opacity = '0'; setTimeout(()=>{ if(el.style.opacity==='0') el.innerHTML=''; },200); }
  },

  // ── AUTO-EQUIP SUGGESTION ─────────────────────────────
  getBestItem(slot, job, char) {
    const inv  = char?.inventory || {};
    const equip = char?.equipment || {};
    const current = window.ITEM_DB?.[equip[slot]];
    let best = null, bestScore = current ? this._score(current) : 0;

    for (const [id, qty] of Object.entries(inv)) {
      if (!qty || qty <= 0) continue;
      const item = window.ITEM_DB?.[id];
      if (!item || item.slot !== slot) continue;
      if (item.jobs && !item.jobs.includes(job)) continue;
      const score = this._score(item);
      if (score > bestScore) { bestScore = score; best = id; }
    }
    return best;
  },

  _score(item) {
    if (!item) return 0;
    const rarMult = { common:.5, uncommon:.8, rare:1.2, epic:2, legendary:3.5, mythic:5 }[item.rarity] || 1;
    const enh = item.enh || 0;
    return ((item.atk||0) + (item.def||0) + (item.int||0)*1.2 + (item.str||0) +
            (item.dex||0) + (item.hp||0)*.1 + (item.mp||0)*.08) * rarMult * (1 + enh*.1);
  },

  // ── DROP TABLE EXTENDED ───────────────────────────────
  getDropTable(monsterType, wave=1) {
    const base = window.DROP_TABLE_EXT?.[monsterType] || window.DROP_TABLE?.[monsterType] || [];
    // High wave bonus drops
    if (wave >= 10) {
      return [...base, { id:'crystal_pure', rate:.03 * Math.floor(wave/10) }];
    }
    if (wave >= 20) {
      return [...base, { id:'demon_core', rate:.01 }];
    }
    return base;
  },

  init() {
    // Hook player applyChar to include set bonus
    const origApply = window.Player?.prototype?.applyChar;
    if (origApply) {
      window.Player.prototype.applyChar = function(ch) {
        origApply.call(this, ch);
        window.ItemSystem.applySetBonusToPlayer(ch, this);
      };
    }

    // Register ActiveBuffs.tick — dipanggil dari G.tick chain di index.html
    // Guna custom event supaya tidak double-wrap G.tick
    window._itemTickCallbacks = window._itemTickCallbacks || [];
    if (!window._itemTickCallbacks.includes(window.ActiveBuffs.tick.bind(window.ActiveBuffs))) {
      window._itemTickCallbacks.push((dt) => window.ActiveBuffs.tick(dt));
    }
    console.log('[ItemSystem] ActiveBuffs tick registered ✅');

    // Hook equip/unequip to reapply set bonus
    const origEquip   = window.equipItem;
    const origUnequip = window.unequipItem;
    if (typeof origEquip === 'function') {
      window.equipItem = function(...args) {
        origEquip(...args);
        if (window.G?.pl && window.selChar)
          try { window.ItemSystem.applySetBonusToPlayer(window.selChar, window.G.pl); } catch(e) {}
      };
    }
    if (typeof origUnequip === 'function') {
      window.unequipItem = function(...args) {
        origUnequip(...args);
        if (window.G?.pl && window.selChar)
          try { window.ItemSystem.applySetBonusToPlayer(window.selChar, window.G.pl); } catch(e) {}
      };
    }

    console.log('[ItemSystem] Initialized ✅');
  },
};

// Auto-init
window.addEventListener('load', () => {
  setTimeout(() => window.ItemSystem.init(), 300);
});
