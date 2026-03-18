'use strict';
/* ═══════════════════════════════════════════════════════════
   KO Classic — Audio System
   Muzik latar setiap zone + bunyi kesan menggunakan
   Web Audio API (tiada fail luar diperlukan!)
   ═══════════════════════════════════════════════════════════ */

const Audio = (() => {
  let ctx = null;
  let masterGain, musicGain, sfxGain;
  let currentMusic = null;
  let currentZone  = null;
  let musicFadeTimer = null;

  // ── Settings (simpan dalam localStorage) ────────────
  const SETTINGS_KEY = 'ko_audio_settings';
  let settings = {
    masterVol : 0.7,
    musicVol  : 0.5,
    sfxVol    : 0.8,
    muted     : false,
  };

  function loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      Object.assign(settings, s);
    } catch {}
  }
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
  }

  // ── Init Audio Context ───────────────────────────────
  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      musicGain  = ctx.createGain();
      sfxGain    = ctx.createGain();
      musicGain.connect(masterGain);
      sfxGain.connect(masterGain);
      masterGain.connect(ctx.destination);
      loadSettings();
      applyVolumes();
    } catch(e) { console.warn('Audio init failed:', e); }
  }

  function applyVolumes() {
    if (!ctx) return;
    const m = settings.muted ? 0 : settings.masterVol;
    masterGain.gain.setTargetAtTime(m,               ctx.currentTime, 0.1);
    musicGain.gain.setTargetAtTime(settings.musicVol, ctx.currentTime, 0.1);
    sfxGain.gain.setTargetAtTime(settings.sfxVol,     ctx.currentTime, 0.1);
  }

  // ── Muzik Generator (Web Audio synth) ───────────────
  // Setiap zone ada "pattern" muzik yang dijana secara prosedur

  // Nota muzik dalam Hz
  const NOTE = {
    C3:130.8,D3:146.8,E3:164.8,F3:174.6,G3:196,A3:220,B3:246.9,
    C4:261.6,D4:293.7,E4:329.6,F4:349.2,G4:392,A4:440,B4:493.9,
    C5:523.3,D5:587.3,E5:659.3,F5:698.5,G5:784,A5:880,
    Bb3:233.1,Eb4:311.1,Ab4:415.3,Bb4:466.2,Db5:554.4,
  };

  // Buat oscilator mudah
  function makeOsc(freq, type, gainVal, start, dur, dest) {
    if (!ctx) return;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type      = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(gainVal, start + 0.02);
    gain.gain.linearRampToValueAtTime(gainVal * 0.6, start + dur * 0.6);
    gain.gain.linearRampToValueAtTime(0, start + dur);
    osc.connect(gain);
    gain.connect(dest || musicGain);
    osc.start(start);
    osc.stop(start + dur + 0.05);
    return osc;
  }

  // Reverb mudah
  function makeReverb() {
    if (!ctx) return musicGain;
    const convolver = ctx.createConvolver();
    const length    = ctx.sampleRate * 1.5;
    const impulse   = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = impulse.getChannelData(c);
      for (let i = 0; i < length; i++) ch[i] = (Math.random()*2-1) * Math.pow(1-i/length, 2);
    }
    convolver.buffer = impulse;
    const out = ctx.createGain(); out.gain.value = 0.3;
    convolver.connect(out); out.connect(musicGain);
    return convolver;
  }

  // ── MUZIK PATTERNS ──────────────────────────────────

  // 1. LOGIN SCREEN — epic dark ambience
  function playLoginMusic() {
    if (!ctx) return;
    const reverb = makeReverb();
    const bpm = 60, beat = 60/bpm;
    let t = ctx.currentTime + 0.1;
    const loop = () => {
      if (currentZone !== 'login') return;
      // Bass drone
      const bass = [NOTE.C3, NOTE.G3, NOTE.Bb3, NOTE.C3];
      bass.forEach((n,i) => makeOsc(n, 'sine', 0.18, t + i*beat*2, beat*2.5, reverb));
      // Melody
      const mel = [NOTE.C5, NOTE.Bb4, NOTE.G4, NOTE.Ab4, NOTE.C5, NOTE.Eb4, NOTE.F4, NOTE.G4];
      mel.forEach((n,i) => makeOsc(n, 'triangle', 0.1, t + i*beat*0.8, beat*0.7, reverb));
      // Pad chord
      [NOTE.C4, NOTE.Eb4, NOTE.G4, NOTE.Bb4].forEach(n =>
        makeOsc(n, 'sine', 0.06, t, beat*8, reverb)
      );
      t += beat * 8;
      musicFadeTimer = setTimeout(loop, beat * 8000 - 200);
    };
    loop();
  }

  // 2. MORADON / TOWN — peaceful medieval town
  function playTownMusic() {
    if (!ctx) return;
    const reverb = makeReverb();
    const bpm = 90, beat = 60/bpm;
    let t = ctx.currentTime + 0.1;
    // Melodi town KO style — guna tangga nada major
    const melPattern = [
      NOTE.G4,NOTE.A4,NOTE.B4,NOTE.C5,NOTE.D5,NOTE.C5,NOTE.B4,NOTE.A4,
      NOTE.G4,NOTE.G4,NOTE.A4,NOTE.B4,NOTE.C5,NOTE.B4,NOTE.A4,NOTE.G4,
    ];
    const bassPattern = [NOTE.G3,NOTE.G3,NOTE.C4,NOTE.C4,NOTE.D4,NOTE.D4,NOTE.G3,NOTE.G3];

    const loop = () => {
      if (currentZone !== 'town') return;
      melPattern.forEach((n,i) => makeOsc(n, 'triangle', 0.12, t + i*beat*0.5, beat*0.45, reverb));
      bassPattern.forEach((n,i) => makeOsc(n, 'sine', 0.15, t + i*beat, beat*0.8, reverb));
      // Counter melody
      [NOTE.D5,NOTE.C5,NOTE.B4,NOTE.A4,NOTE.B4,NOTE.C5,NOTE.D5,NOTE.E5].forEach((n,i) =>
        makeOsc(n, 'sine', 0.07, t + beat*4 + i*beat*0.5, beat*0.4, reverb)
      );
      t += beat * 8;
      musicFadeTimer = setTimeout(loop, beat * 8000 - 200);
    };
    loop();
  }

  // 3. RONARK / FIELD — intense battle music
  function playFieldMusic() {
    if (!ctx) return;
    const bpm = 140, beat = 60/bpm;
    let t = ctx.currentTime + 0.1;

    const loop = () => {
      if (currentZone !== 'field') return;
      // Drum-like kick
      for (let i = 0; i < 8; i++) {
        const kickT = t + i * beat;
        const kick = ctx.createOscillator();
        const kGain = ctx.createGain();
        kick.frequency.setValueAtTime(150, kickT);
        kick.frequency.exponentialRampToValueAtTime(40, kickT + 0.15);
        kGain.gain.setValueAtTime(0.4, kickT);
        kGain.gain.exponentialRampToValueAtTime(0.001, kickT + 0.15);
        kick.connect(kGain); kGain.connect(sfxGain);
        kick.start(kickT); kick.stop(kickT + 0.2);
      }
      // Aggressive bass riff
      const bassRiff = [NOTE.C3,NOTE.C3,NOTE.Eb4,NOTE.C3,NOTE.C3,NOTE.Bb3,NOTE.Ab3,NOTE.G3];
      bassRiff.forEach((n,i) => makeOsc(n, 'sawtooth', 0.14, t + i*beat*0.5, beat*0.4));
      // Lead melody (minor, urgent)
      const lead = [NOTE.C5,NOTE.Eb5,NOTE.G4,NOTE.Ab4,NOTE.Bb4,NOTE.G4,NOTE.Ab4,NOTE.C5];
      lead.forEach((n,i) => makeOsc(n, 'square', 0.08, t + i*beat*0.5, beat*0.35));
      // Power chord pad
      [NOTE.C3,NOTE.G3,NOTE.Eb4].forEach(n => makeOsc(n,'sawtooth',0.06,t,beat*4));
      t += beat * 4;
      musicFadeTimer = setTimeout(loop, beat * 4000 - 100);
    };
    loop();
  }

  // 4. DUNGEON — dark ominous atmosphere
  function playDungeonMusic() {
    if (!ctx) return;
    const reverb = makeReverb();
    const bpm = 70, beat = 60/bpm;
    let t = ctx.currentTime + 0.1;

    const loop = () => {
      if (currentZone !== 'dungeon') return;
      // Dark drone bass
      [NOTE.C3, NOTE.G3].forEach(n => makeOsc(n, 'sawtooth', 0.1, t, beat*8, reverb));
      // Eerie high notes
      const eerie = [NOTE.Eb5,NOTE.D5,NOTE.C5,NOTE.Db5,NOTE.Eb5,NOTE.F5,NOTE.Eb5,NOTE.D5];
      eerie.forEach((n,i) => makeOsc(n, 'sine', 0.06, t + i*beat*0.8, beat*0.6, reverb));
      // Tension stab
      [NOTE.C4,NOTE.Eb4,NOTE.Ab4].forEach(n => makeOsc(n,'triangle',0.05,t+beat*4,beat*3,reverb));
      // Random dissonance
      if (Math.random() > 0.5)
        makeOsc(NOTE.B3 + Math.random()*50, 'sine', 0.04, t+beat*2, beat*2, reverb);
      t += beat * 8;
      musicFadeTimer = setTimeout(loop, beat * 8000 - 200);
    };
    loop();
  }

  // 5. CZ (Colony Zone) — epic war anthem
  function playCZMusic() {
    if (!ctx) return;
    const bpm = 120, beat = 60/bpm;
    let t = ctx.currentTime + 0.1;

    const loop = () => {
      if (currentZone !== 'cz') return;
      // Epic drums
      for (let i = 0; i < 8; i++) {
        if (i % 2 === 0) { // kick
          const k = ctx.createOscillator(), kg = ctx.createGain();
          k.frequency.setValueAtTime(180, t+i*beat);
          k.frequency.exponentialRampToValueAtTime(50, t+i*beat+0.2);
          kg.gain.setValueAtTime(0.5, t+i*beat); kg.gain.exponentialRampToValueAtTime(0.001,t+i*beat+0.2);
          k.connect(kg); kg.connect(musicGain); k.start(t+i*beat); k.stop(t+i*beat+0.25);
        } else { // snare (noise)
          const buf = ctx.createBuffer(1,ctx.sampleRate*0.1,ctx.sampleRate);
          const ch = buf.getChannelData(0);
          for(let j=0;j<ch.length;j++) ch[j]=Math.random()*2-1;
          const src = ctx.createBufferSource(), sg = ctx.createGain();
          src.buffer = buf; sg.gain.setValueAtTime(0.15,t+i*beat); sg.gain.exponentialRampToValueAtTime(0.001,t+i*beat+0.1);
          src.connect(sg); sg.connect(musicGain); src.start(t+i*beat);
        }
      }
      // War anthem melody (major, heroic)
      const anthem = [NOTE.G4,NOTE.G4,NOTE.A4,NOTE.B4,NOTE.G4,NOTE.B4,NOTE.D5,NOTE.D5,
                      NOTE.C5,NOTE.B4,NOTE.A4,NOTE.G4,NOTE.A4,NOTE.G4,NOTE.G4,NOTE.G4];
      anthem.forEach((n,i) => makeOsc(n,'square',0.1,t+i*beat*0.5,beat*0.4));
      // Brass-like chord
      [NOTE.G3,NOTE.B3,NOTE.D4,NOTE.G4].forEach(n => makeOsc(n,'sawtooth',0.08,t,beat*8));
      t += beat * 8;
      musicFadeTimer = setTimeout(loop, beat * 8000 - 100);
    };
    loop();
  }

  // Zone baru: Ardream — lebih gelap, minor, intense
  function playArdreamMusic() {
    if (!ctx) return;
    const bpm = 105, beat = 60/bpm;
    let t = ctx.currentTime + 0.1;
    const loop = () => {
      if (currentZone !== 'ardream') return;
      // Minor battle theme: Am pentatonic
      const mel = [NOTE.A3,NOTE.C4,NOTE.E4,NOTE.A4,NOTE.G4,NOTE.E4,NOTE.C4,NOTE.A3,
                   NOTE.A3,NOTE.E4,NOTE.G4,NOTE.A4,NOTE.Bb3,NOTE.A3,NOTE.E4,NOTE.A3];
      mel.forEach((n,i) => makeOsc(n,'sawtooth',0.09,t+i*beat*0.5,beat*0.45,musicGain));
      [NOTE.A2,NOTE.E3,NOTE.A3].forEach(n => makeOsc(n,'triangle',0.07,t,beat*8,musicGain));
      // Percussion
      for(let i=0;i<8;i++){
        const k=ctx.createOscillator(),kg=ctx.createGain();
        k.frequency.setValueAtTime(160,t+i*beat); k.frequency.exponentialRampToValueAtTime(45,t+i*beat+0.18);
        kg.gain.setValueAtTime(i%2===0?0.4:0.2,t+i*beat); kg.gain.exponentialRampToValueAtTime(0.001,t+i*beat+0.2);
        k.connect(kg); kg.connect(musicGain); k.start(t+i*beat); k.stop(t+i*beat+0.22);
      }
      t += beat * 8;
      musicFadeTimer = setTimeout(loop, beat*8000 - 100);
    };
    loop();
  }

  // Zone baru: Luferson Castle — dark, ominous, epic
  function playLufersonMusic() {
    if (!ctx) return;
    const bpm = 88, beat = 60/bpm;
    let t = ctx.currentTime + 0.1;
    const loop = () => {
      if (currentZone !== 'luferson') return;
      // Dark castle theme — low, brooding
      const mel = [NOTE.A3,NOTE.G3,NOTE.F3,NOTE.E3,NOTE.D3,NOTE.E3,NOTE.F3,NOTE.A3,
                   NOTE.G3,NOTE.F3,NOTE.E3,NOTE.D3,NOTE.C3,NOTE.D3,NOTE.E3,NOTE.A3];
      mel.forEach((n,i) => makeOsc(n,'sawtooth',0.12,t+i*beat*0.5,beat*0.5,musicGain));
      [NOTE.A2,NOTE.E2].forEach(n => makeOsc(n,'sawtooth',0.1,t,beat*8,musicGain));
      // Heavy drums
      for(let i=0;i<8;i++){
        const k=ctx.createOscillator(),kg=ctx.createGain();
        k.frequency.setValueAtTime(200,t+i*beat); k.frequency.exponentialRampToValueAtTime(40,t+i*beat+0.25);
        kg.gain.setValueAtTime(0.45,t+i*beat); kg.gain.exponentialRampToValueAtTime(0.001,t+i*beat+0.28);
        k.connect(kg); kg.connect(musicGain); k.start(t+i*beat); k.stop(t+i*beat+0.3);
      }
      t += beat * 8;
      musicFadeTimer = setTimeout(loop, beat*8000 - 100);
    };
    loop();
  }

  // ── STOP MUSIC ───────────────────────────────────────
  function stopMusic(fadeTime = 1.0) {
    if (!ctx || !musicGain) return;
    if (musicFadeTimer) { clearTimeout(musicFadeTimer); musicFadeTimer = null; }
    musicGain.gain.setTargetAtTime(0, ctx.currentTime, fadeTime * 0.3);
    setTimeout(() => {
      if (ctx && musicGain) musicGain.gain.setTargetAtTime(settings.musicVol, ctx.currentTime, 0.05);
    }, fadeTime * 1000 + 100);
  }

  // ── MAIN PLAY ZONE MUSIC ─────────────────────────────
  function playZoneMusic(zoneId) {
    if (!ctx) init();
    if (!ctx) return;

    // Resume context jika suspended (autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();

    const zone   = window.ZONES?.[zoneId];
    const zType  = zone?.type || 'town';
    let   newKey = zType;

    if      (zoneId === 'login')    newKey = 'login';
    else if (zoneId === 'ardream')  newKey = 'ardream';
    else if (zoneId === 'luferson') newKey = 'luferson';
    else if (zType  === 'town')     newKey = 'town';
    else if (zType  === 'field')    newKey = 'field';
    else if (zType  === 'dungeon')  newKey = 'dungeon';
    else if (zType  === 'cz')       newKey = 'cz';
    else                            newKey = 'field';

    if (currentZone === newKey) return; // sudah main
    currentZone = newKey;

    stopMusic(0.8);
    setTimeout(() => {
      if (currentZone !== newKey) return;
      musicGain.gain.setTargetAtTime(settings.musicVol, ctx.currentTime, 0.3);
      switch (newKey) {
        case 'login':    playLoginMusic();    break;
        case 'town':     playTownMusic();     break;
        case 'field':    playFieldMusic();    break;
        case 'dungeon':  playDungeonMusic();  break;
        case 'cz':       playCZMusic();       break;
        case 'ardream':  playArdreamMusic();  break;
        case 'luferson': playLufersonMusic(); break;
        default:         playFieldMusic();
      }
    }, 900);
  }

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
      }

      case 'elixir': {
        // Elixir guna — bubble pop magic
        const eo = ctx.createOscillator(), eg = ctx.createGain();
        eo.type = 'sine';
        eo.frequency.setValueAtTime(600, t);
        eo.frequency.exponentialRampToValueAtTime(1200, t + .15);
        eg.gain.setValueAtTime(.25 * settings.sfxVol, t);
        eg.gain.exponentialRampToValueAtTime(0.001, t + .3);
        eo.connect(eg); eg.connect(sfxGain); eo.start(t); eo.stop(t + .32);
        break;
      }

      case 'revive': {
        // Revive stone — dramatic rise
        const ro = ctx.createOscillator(), rg = ctx.createGain();
        ro.type = 'sawtooth';
        ro.frequency.setValueAtTime(200, t);
        ro.frequency.exponentialRampToValueAtTime(800, t + .6);
        rg.gain.setValueAtTime(.35 * settings.sfxVol, t);
        rg.gain.exponentialRampToValueAtTime(0.001, t + .8);
        ro.connect(rg); rg.connect(sfxGain); ro.start(t); ro.stop(t + .82);
        break;
      }

      case 'buff': {
        // Buff aktif — positive chime
        [440, 550, 660].forEach((freq, i) => {
          const bo = ctx.createOscillator(), bg = ctx.createGain();
          bo.type = 'triangle'; bo.frequency.value = freq;
          bg.gain.setValueAtTime(.18 * settings.sfxVol, t + i*.08);
          bg.gain.exponentialRampToValueAtTime(0.001, t + i*.08 + .25);
          bo.connect(bg); bg.connect(sfxGain); bo.start(t + i*.08); bo.stop(t + i*.08 + .28);
        });
        break;
      }

      case 'set_bonus': {
        // Set bonus unlock — epic fanfare
        [330, 440, 550, 660].forEach((freq, i) => {
          const so = ctx.createOscillator(), sg = ctx.createGain();
          so.type = 'square'; so.frequency.value = freq;
          sg.gain.setValueAtTime(.16 * settings.sfxVol, t + i*.1);
          sg.gain.exponentialRampToValueAtTime(0.001, t + i*.1 + .3);
          so.connect(sg); sg.connect(sfxGain); so.start(t + i*.1); so.stop(t + i*.1 + .32);
        });
        break;
      }
    }
  }

  // ── VOLUME CONTROL UI ────────────────────────────────
  function openVolumePanel() {
    const p = document.getElementById('volumePanel');
    if (!p) return;
    p.classList.remove('off');
    renderVolumePanel();
  }

  function renderVolumePanel() {
    const el = document.getElementById('volumeBody'); if (!el) return;
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="vol-row">
          <div class="vol-label">🔊 Master</div>
          <input type="range" class="vol-slider" min="0" max="1" step="0.05"
            value="${settings.masterVol}" oninput="Audio.setMaster(+this.value)">
          <div class="vol-val" id="volMasterVal">${Math.round(settings.masterVol*100)}%</div>
        </div>
        <div class="vol-row">
          <div class="vol-label">🎵 Muzik</div>
          <input type="range" class="vol-slider" min="0" max="1" step="0.05"
            value="${settings.musicVol}" oninput="Audio.setMusic(+this.value)">
          <div class="vol-val" id="volMusicVal">${Math.round(settings.musicVol*100)}%</div>
        </div>
        <div class="vol-row">
          <div class="vol-label">💥 Kesan</div>
          <input type="range" class="vol-slider" min="0" max="1" step="0.05"
            value="${settings.sfxVol}" oninput="Audio.setSFX(+this.value)">
          <div class="vol-val" id="volSFXVal">${Math.round(settings.sfxVol*100)}%</div>
        </div>
        <div class="vol-row">
          <div class="vol-label">${settings.muted?'🔇':'🔊'} Mute</div>
          <button class="btn ${settings.muted?'btn-red':'btn-gold'}" style="flex:1;padding:8px;font-size:.7rem"
            onclick="Audio.toggleMute()">
            ${settings.muted ? '🔇 Dimatikan' : '🔊 Hidup'}
          </button>
        </div>
        <div style="text-align:center;margin-top:4px">
          <button class="btn btn-dim" style="padding:8px 20px;font-size:.65rem"
            onclick="Audio.testSFX()">▶ Test Bunyi</button>
        </div>
      </div>`;
  }

  function setMaster(v) {
    settings.masterVol = v; applyVolumes(); saveSettings();
    const el = document.getElementById('volMasterVal');
    if (el) el.textContent = Math.round(v*100)+'%';
  }
  function setMusic(v) {
    settings.musicVol = v; applyVolumes(); saveSettings();
    const el = document.getElementById('volMusicVal');
    if (el) el.textContent = Math.round(v*100)+'%';
  }
  function setSFX(v) {
    settings.sfxVol = v; saveSettings();
    const el = document.getElementById('volSFXVal');
    if (el) el.textContent = Math.round(v*100)+'%';
  }
  function toggleMute() {
    settings.muted = !settings.muted; applyVolumes(); saveSettings();
    renderVolumePanel();
  }
  function testSFX() {
    ['attack','spell','pickup','levelup'].forEach((s,i) =>
      setTimeout(() => playSFX(s), i * 400)
    );
  }

  // ── PUBLIC API ───────────────────────────────────────
  return {
    init, playZoneMusic, stopMusic, playSFX,
    openVolumePanel, renderVolumePanel,
    setMaster, setMusic, setSFX, toggleMute, testSFX,
    get muted() { return settings.muted; },
    get zone()  { return currentZone; },
  };
})();

// ── Auto-init pada first user interaction ──────────────
let _audioInited = false;
function ensureAudio() {
  if (_audioInited) return;
  _audioInited = true;
  Audio.init();
}
document.addEventListener('click',     ensureAudio, { once: true });
document.addEventListener('touchstart',ensureAudio, { once: true });
document.addEventListener('keydown',   ensureAudio, { once: true });
