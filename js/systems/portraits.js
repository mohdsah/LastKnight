'use strict';
/* ══════════════════════════════════════════════════════════════
   Pahlawan Terakhir — Portrait System
   Auto-generate portrait mengikut race + job + faction
   Fallback ke SVG files dalam /images/portraits/
   ══════════════════════════════════════════════════════════════ */

window.PortraitSystem = {

  // ── Map race+job → portrait file ──────────────────────────
  PORTRAIT_MAP: {
    // Hero portraits
    'human_warrior': 'images/portraits/human_warrior.svg',
    'human_rogue':   'images/portraits/human_rogue.svg',
    'human_mage':    'images/portraits/human_mage.svg',
    'human_priest':  'images/portraits/human_priest.svg',
    'elf_warrior':   'images/portraits/elf.svg',
    'elf_rogue':     'images/portraits/elf.svg',
    'elf_mage':      'images/portraits/elf.svg',
    'elf_priest':    'images/portraits/elf.svg',
    'orc_warrior':   'images/portraits/orc_warrior.svg',
    'orc_rogue':     'images/portraits/orc_warrior.svg',
    'orc_mage':      'images/portraits/orc_warrior.svg',
    'orc_priest':    'images/portraits/orc_warrior.svg',
    'dark_warrior':  'images/portraits/dark_elf.svg',
    'dark_rogue':    'images/portraits/dark_elf.svg',
    'dark_mage':     'images/portraits/dark_elf.svg',
    'dark_priest':   'images/portraits/dark_elf.svg',
  },

  // ── Monster portraits ──────────────────────────────────────
  MONSTER_MAP: {
    'goblin':       'images/monsters/goblin.svg',
    'orc':          'images/monsters/orc.svg',
    'archer':       'images/monsters/archer.svg',
    'dark_mage':    'images/monsters/dark_mage.svg',
    'cz_guardian':  'images/monsters/orc.svg',
    'boss':         'images/monsters/boss.svg',
    'goblin_king':  'images/monsters/goblin_king.svg',
    'orc_warlord':  'images/monsters/orc_warlord.svg',
    'demon_king':   'images/monsters/demon_king.svg',
    'world_dragon': 'images/monsters/demon_king.svg',
  },

  // ── Get portrait path untuk char ──────────────────────────
  getCharPortrait(char) {
    if (!char) return null;
    const race = char.race || 'human';
    const job  = char.job  || 'warrior';
    const key  = `${race}_${job}`;
    return this.PORTRAIT_MAP[key] || this.PORTRAIT_MAP[`${race}_warrior`] || null;
  },

  // ── Get monster portrait ───────────────────────────────────
  getMonsterPortrait(type) {
    return this.MONSTER_MAP[type] || this.MONSTER_MAP['boss'] || null;
  },

  // ── Generate CSS portrait element ─────────────────────────
  renderPortrait(char, size = 80, className = '') {
    const src = this.getCharPortrait(char);
    const isEl = char?.faction === 'elmorad' || char?.faction === 'cahaya';
    const borderCol = isEl ? 'rgba(201,168,76,.6)' : 'rgba(200,50,50,.6)';

    if (src) {
      return `<div class="portrait-wrap ${className}" style="
        width:${size}px;height:${size}px;
        border:2px solid ${borderCol};
        border-radius:4px;overflow:hidden;position:relative;
        box-shadow:0 0 12px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.05)">
        <img src="${src}" width="${size}" height="${size}" 
             style="display:block;width:100%;height:100%;object-fit:cover"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;
          font-size:${size*.45}px;background:rgba(0,0,0,.5)">${this.getFallbackIcon(char)}</div>
      </div>`;
    }
    // Fallback emoji
    return `<div class="portrait-wrap ${className}" style="
      width:${size}px;height:${size}px;
      border:2px solid ${borderCol};border-radius:4px;
      background:rgba(0,0,0,.5);
      display:flex;align-items:center;justify-content:center;
      font-size:${size*.45}px;
      box-shadow:0 0 12px rgba(0,0,0,.6)">
      ${this.getFallbackIcon(char)}
    </div>`;
  },

  // ── Canvas draw portrait (untuk game canvas) ───────────────
  _imgCache: {},

  drawPortraitCanvas(ctx, char, x, y, size) {
    const src = this.getCharPortrait(char);
    if (!src) {
      // Fallback: lukis kotak dengan emoji
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(x, y, size, size);
      ctx.font = `${size*.5}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText(this.getFallbackIcon(char), x + size/2, y + size*.65);
      return;
    }

    if (!this._imgCache[src]) {
      const img = new Image();
      img.src = src;
      img.onload = () => { this._imgCache[src] = img; };
      this._imgCache[src] = img; // store even before loaded
    }

    const img = this._imgCache[src];
    if (img && img.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, 3);
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    }
  },

  // ── Auto update avatar dalam UI ───────────────────────────
  updateAvatarEl(elementId, char) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const src = this.getCharPortrait(char);
    if (src) {
      el.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit"
        onerror="this.style.display='none';this.insertAdjacentText('afterend','${this.getFallbackIcon(char)}')">`;
    } else {
      el.textContent = this.getFallbackIcon(char);
    }
  },

  // ── Auto portrait untuk char select screen ────────────────
  applyToCharSelect() {
    document.querySelectorAll('.cs-char-slot').forEach((slot, idx) => {
      if (!window.curChars || !window.curChars[idx]) return;
      const char = window.curChars[idx];
      const src  = this.getCharPortrait(char);
      if (!src) return;
      const avatarEl = slot.querySelector('.cs-avatar');
      if (avatarEl) {
        avatarEl.innerHTML = `<img src="${src}"
          style="width:100%;height:100%;object-fit:cover;border-radius:4px"
          onerror="this.style.display='none'">`;
        avatarEl.style.cssText += ';overflow:hidden;border-radius:4px;border:1px solid rgba(201,168,76,.3)';
      }
    });
  },

  // ── Auto portrait untuk HUD menu ─────────────────────────
  applyToMenuAvatar() {
    const char = window.selChar;
    if (!char) return;
    this.updateAvatarEl('mAvatar', char);
  },

  // ── Fallback icons per race ───────────────────────────────
  getFallbackIcon(char) {
    const race = char?.race || 'human';
    const icons = { human:'🧑‍⚔️', elf:'🧝', orc:'👹', dark:'🧙‍♂️' };
    return icons[race] || '⚔️';
  },

  // ── Init: hook ke auth.js selectCharSlot & goMenu ─────────
  init() {
    const PS = window.PortraitSystem;

    // Hook goMenu — apply portrait ke menu avatar
    const origGoMenu = window._goMenu;
    window._goMenu = function() {
      if (origGoMenu) origGoMenu();
      setTimeout(() => PS.applyToMenuAvatar(), 80);
    };

    // Hook renderCharSlots — apply portraits selepas char slots dirender
    const origRender = window.renderCharSlots;
    if (typeof origRender === 'function') {
      window.renderCharSlots = function() {
        origRender.call(this);
        setTimeout(() => PS.applyToCharSelect(), 50);
      };
    }

    // Hook selectCharSlot — update detail panel portrait
    const origSelect = window.selectCharSlot;
    if (typeof origSelect === 'function') {
      window.selectCharSlot = function(idx) {
        origSelect.call(this, idx);
        setTimeout(() => PS.applyToCharSelect(), 30);
      };
    }

    // Apply immediately if already showing
    if (window.selChar) PS.applyToMenuAvatar();
    if (window.curChars && window.curChars.length) PS.applyToCharSelect();

    console.log('[Portrait] System initialized ✅');
  },
};

// Auto-init bila semua scripts loaded
window.addEventListener('load', () => {
  setTimeout(() => window.PortraitSystem.init(), 200);
});
