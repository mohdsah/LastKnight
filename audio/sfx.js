'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — Sound Effects (SFX)
   Semua sound effects:
   attack, hit, spell, levelup, death, buy,
   enhance_success, enhance_fail, enhance_break,
   colony_capture, npc_talk, rare, epic, legendary,
   magician, priest, pvp_kill, world_boss,
   elixir, revive, buff, set_bonus
   ══════════════════════════════════════════════════════ */

/*
  // ── SOUND EFFECTS ────────────────────────────────────
  function playSFX(type) {
    if (!ctx) init();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const t = ctx.currentTime;

    switch (type) {

      case 'attack': {
        // Quick sword swing
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(220, t);
        o.frequency.exponentialRampToValueAtTime(80, t + 0.08);
        g.gain.setValueAtTime(0.25 * settings.sfxVol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.12);
        break;
      }

      case 'hit': {
        // Enemy hit thud
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(150, t);
        o.frequency.exponentialRampToValueAtTime(60, t + 0.06);
        g.gain.setValueAtTime(0.2 * settings.sfxVol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.1);
        break;
      }

      case 'spell': {
        // Magic cast whoosh
        for (let i = 0; i < 4; i++) {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(600 + i*150, t + i*0.05);
          o.frequency.exponentialRampToValueAtTime(1200 + i*200, t + i*0.05 + 0.2);
          g.gain.setValueAtTime(0.12 * settings.sfxVol, t + i*0.05);
          g.gain.exponentialRampToValueAtTime(0.001, t + i*0.05 + 0.25);
          o.connect(g); g.connect(sfxGain); o.start(t + i*0.05); o.stop(t + i*0.05 + 0.3);
        }
        break;
      }

      case 'levelup': {
        // Classic level up fanfare
        const melody = [
          {f:523.3,d:0.1},{f:659.3,d:0.1},{f:783.9,d:0.1},
          {f:1046.5,d:0.3},{f:880,d:0.15},{f:1046.5,d:0.4},
        ];
        let mt = t;
        melody.forEach(({f,d}) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.value = f;
          g.gain.setValueAtTime(0.3 * settings.sfxVol, mt);
          g.gain.linearRampToValueAtTime(0.001, mt + d + 0.05);
          o.connect(g); g.connect(sfxGain); o.start(mt); o.stop(mt + d + 0.1);
          mt += d * 0.85;
        });
        break;
      }

      case 'itemdrop': {
        // Coin/item sparkle
        [800, 1000, 1200].forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = f;
          g.gain.setValueAtTime(0.15 * settings.sfxVol, t + i*0.05);
          g.gain.exponentialRampToValueAtTime(0.001, t + i*0.05 + 0.2);
          o.connect(g); g.connect(sfxGain); o.start(t + i*0.05); o.stop(t + i*0.05 + 0.25);
        });
        break;
      }

      case 'raredrop': {
        // Rare item — special chime
        const rareNotes = [523,659,784,1047,1319];
        rareNotes.forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = f;
          g.gain.setValueAtTime(0.2 * settings.sfxVol, t + i*0.08);
          g.gain.exponentialRampToValueAtTime(0.001, t + i*0.08 + 0.4);
          o.connect(g); g.connect(sfxGain); o.start(t + i*0.08); o.stop(t + i*0.08 + 0.5);
        });
        break;
      }

      case 'bossSpawn': {
        // Dramatic boss appear
        const bossNotes = [
          {f:110,d:0.5,type:'sawtooth'},
          {f:87,d:0.5,type:'sawtooth'},
          {f:65,d:0.8,type:'sawtooth'},
        ];
        let bt = t;
        bossNotes.forEach(({f,d,type:tp}) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = tp; o.frequency.value = f;
          g.gain.setValueAtTime(0.35 * settings.sfxVol, bt);
          g.gain.linearRampToValueAtTime(0.001, bt + d);
          o.connect(g); g.connect(sfxGain); o.start(bt); o.stop(bt + d + 0.05);
          bt += d * 0.7;
        });
        break;
      }

      case 'pickup': {
        // Item pickup
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(440, t);
        o.frequency.linearRampToValueAtTime(880, t + 0.1);
        g.gain.setValueAtTime(0.18 * settings.sfxVol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.18);
        break;
      }

      case 'buy': {
        // Shop purchase
        [523, 659].forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.12 * settings.sfxVol, t + i*0.1);
          g.gain.exponentialRampToValueAtTime(0.001, t + i*0.1 + 0.15);
          o.connect(g); g.connect(sfxGain); o.start(t + i*0.1); o.stop(t + i*0.1 + 0.2);
        });
        break;
      }

      case 'death': {
        // Player death
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(300, t);
        o.frequency.exponentialRampToValueAtTime(60, t + 0.8);
        g.gain.setValueAtTime(0.3 * settings.sfxVol, t);
        g.gain.linearRampToValueAtTime(0.001, t + 0.8);
        o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.85);
        break;
      }

      case 'enhance_success': {
        // Enhancement success
        const esNotes = [523,659,784,1047];
        esNotes.forEach((f,i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'triangle'; o.frequency.value = f;
          g.gain.setValueAtTime(0.2 * settings.sfxVol, t + i*0.06);
          g.gain.exponentialRampToValueAtTime(0.001, t + i*0.06 + 0.3);
          o.connect(g); g.connect(sfxGain); o.start(t + i*0.06); o.stop(t + i*0.06 + 0.35);
        });
        break;
      }

      case 'enhance_fail': {
        // Enhancement fail
        [220, 180, 140].forEach((f,i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sawtooth'; o.frequency.value = f;
          g.gain.setValueAtTime(0.15 * settings.sfxVol, t + i*0.08);
          g.gain.exponentialRampToValueAtTime(0.001, t + i*0.08 + 0.2);
          o.connect(g); g.connect(sfxGain); o.start(t + i*0.08); o.stop(t + i*0.08 + 0.25);
        });
        break;
      }

      case 'enhance_break': {
        // Enhancement break — sad sound
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(400, t);
        o.frequency.exponentialRampToValueAtTime(40, t + 1.0);
        g.gain.setValueAtTime(0.35 * settings.sfxVol, t);
        g.gain.linearRampToValueAtTime(0.001, t + 1.0);
        o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 1.05);
        break;
      }

      case 'colony_capture': {
        // Colony captured fanfare
        [392,523,659,784].forEach((f,i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'square'; o.frequency.value = f;
          g.gain.setValueAtTime(0.2 * settings.sfxVol, t + i*0.1);
          g.gain.exponentialRampToValueAtTime(0.001, t + i*0.1 + 0.4);
          o.connect(g); g.connect(sfxGain); o.start(t + i*0.1); o.stop(t + i*0.1 + 0.45);
        });
        break;
      }

      case 'npc_talk': {
        // NPC dialog open
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = 660;
        g.gain.setValueAtTime(0.1 * settings.sfxVol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.15);
        break;
      }

      case 'rare': {
        // Rare drop chime — sama seperti raredrop
        const rNotes = [523, 659, 784, 1047];
        rNotes.forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.18 * settings.sfxVol, t + i*0.07);
          g.gain.exponentialRampToValueAtTime(0.001, t + i*0.07 + 0.35);
          o.connect(g); g.connect(sfxGain); o.start(t + i*0.07); o.stop(t + i*0.07 + 0.4);
        });
        break;
      }

      case 'epic': {
        // Epic drop — dramatik ascending
        const epicNotes = [392, 523, 659, 784, 1047, 1319];
        epicNotes.forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = i < 3 ? 'triangle' : 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.22 * settings.sfxVol, t + i*0.07);
          g.gain.exponentialRampToValueAtTime(0.001, t + i*0.07 + 0.5);
          o.connect(g); g.connect(sfxGain); o.start(t + i*0.07); o.stop(t + i*0.07 + 0.55);
        });
        break;
      }

      case 'legendary': {
        // Legendary drop — gong + fanfare
        // Gong hit
        const gong = ctx.createOscillator(), gongG = ctx.createGain();
        gong.type = 'sine'; gong.frequency.setValueAtTime(120, t);
        gong.frequency.exponentialRampToValueAtTime(80, t + 1.5);
        gongG.gain.setValueAtTime(0.4 * settings.sfxVol, t);
        gongG.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        gong.connect(gongG); gongG.connect(sfxGain); gong.start(t); gong.stop(t + 1.6);
        // Fanfare overlay
        const legNotes = [523, 659, 784, 1047, 1319, 1568];
        legNotes.forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'triangle'; o.frequency.value = f;
          g.gain.setValueAtTime(0.25 * settings.sfxVol, t + 0.1 + i*0.08);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.1 + i*0.08 + 0.6);
          o.connect(g); g.connect(sfxGain); o.start(t + 0.1 + i*0.08); o.stop(t + 0.1 + i*0.08 + 0.65);
        });
        break;
      }

      case 'magician': {
        // Mage cast — mystical shimmer
        for (let i = 0; i < 5; i++) {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(800 + i*180, t + i*0.04);
          o.frequency.exponentialRampToValueAtTime(1600 + i*200, t + i*0.04 + 0.3);
          g.gain.setValueAtTime(0.14 * settings.sfxVol, t + i*0.04);
          g.gain.exponentialRampToValueAtTime(0.001, t + i*0.04 + 0.35);
          o.connect(g); g.connect(sfxGain); o.start(t + i*0.04); o.stop(t + i*0.04 + 0.4);
        }
        break;
      }

      case 'priest': {
        // Priest heal — holy chime
        const holyNotes = [523, 659, 784, 1047];
        holyNotes.forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.16 * settings.sfxVol, t + i*0.09);
          g.gain.exponentialRampToValueAtTime(0.001, t + i*0.09 + 0.45);
          o.connect(g); g.connect(sfxGain); o.start(t + i*0.09); o.stop(t + i*0.09 + 0.5);
        });
        // Soft reverb pad
        const pad = ctx.createOscillator(), padG = ctx.createGain();
        pad.type = 'sine'; pad.frequency.value = 261;
        padG.gain.setValueAtTime(0.08 * settings.sfxVol, t);
        padG.gain.linearRampToValueAtTime(0.001, t + 0.8);
        pad.connect(padG); padG.connect(sfxGain); pad.start(t); pad.stop(t + 0.85);
        break;
      }

      case 'pvp_kill': {
        // PvP kill — victory sting
        [523, 784, 1047].forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'square'; o.frequency.value = f;
          g.gain.setValueAtTime(0.18 * settings.sfxVol, t + i*0.06);
          g.gain.exponentialRampToValueAtTime(0.001, t + i*0.06 + 0.2);
          o.connect(g); g.connect(sfxGain); o.start(t + i*0.06); o.stop(t + i*0.06 + 0.25);
        });
        break;
      }

      case 'world_boss': {
        // World boss roar
        const roar = ctx.createOscillator(), roarG = ctx.createGain();
        roar.type = 'sawtooth';
        roar.frequency.setValueAtTime(60, t);
        roar.frequency.linearRampToValueAtTime(40, t + 1.2);
        roarG.gain.setValueAtTime(0.4 * settings.sfxVol, t);
        roarG.gain.linearRampToValueAtTime(0.001, t + 1.2);
        roar.connect(roarG); roarG.connect(sfxGain); roar.start(t); roar.stop(t + 1.3);
        break;
      case 'elixir':
        // Elixir guna — bubble pop magic
        t.oscillator.type='sine';
        t.oscillator.frequency.setValueAtTime(600,t.ctx.currentTime);
        t.oscillator.frequency.exponentialRampToValueAtTime(1200,t.ctx.currentTime+.15);
        t.gain.gain.setValueAtTime(.25,t.ctx.currentTime);
        t.gain.gain.exponentialRampToValueAtTime(.001,t.ctx.currentTime+.3);
        t.oscillator.start(t.ctx.currentTime);
        t.oscillator.stop(t.ctx.currentTime+.3);
        break;
      case 'revive':
        // Revive stone — dramatic rise
        t.oscillator.type='sawtooth';
        t.oscillator.frequency.setValueAtTime(200,t.ctx.currentTime);
        t.oscillator.frequency.exponentialRampToValueAtTime(800,t.ctx.currentTime+.6);
        t.gain.gain.setValueAtTime(.35,t.ctx.currentTime);
        t.gain.gain.exponentialRampToValueAtTime(.001,t.ctx.currentTime+.8);
        t.oscillator.start(t.ctx.currentTime);
        t.oscillator.stop(t.ctx.currentTime+.8);
        break;
      case 'buff':
        // Buff aktif — positive chime
        t.oscillator.type='triangle';
        t.oscillator.frequency.setValueAtTime(440,t.ctx.currentTime);
        t.oscillator.frequency.setValueAtTime(550,t.ctx.currentTime+.1);
        t.oscillator.frequency.setValueAtTime(660,t.ctx.currentTime+.2);
        t.gain.gain.setValueAtTime(.2,t.ctx.currentTime);
        t.gain.gain.exponentialRampToValueAtTime(.001,t.ctx.currentTime+.4);
        t.oscillator.start(t.ctx.currentTime);
        t.oscillator.stop(t.ctx.currentTime+.4);
        break;
      case 'set_bonus':
        // Set bonus unlock — epic fanfare
        t.oscillator.type='square';
        t.oscillator.frequency.setValueAtTime(330,t.ctx.currentTime);
        t.oscillator.frequency.setValueAtTime(440,t.ctx.currentTime+.1);
        t.oscillator.frequency.setValueAtTime(550,t.ctx.currentTime+.2);
        t.oscillator.frequency.setValueAtTime(660,t.ctx.currentTime+.3);
        t.gain.gain.setValueAtTime(.2,t.ctx.currentTime);
        t.gain.gain.exponentialRampToValueAtTime(.001,t.ctx.currentTime+.6);
        t.oscillator.start(t.ctx.currentTime);
        t.oscillator.stop(t.ctx.currentTime+.6);
        break;
      }
    }
  }

*/
