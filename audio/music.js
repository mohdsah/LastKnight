'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — Music Patterns
   Semua muzik latar untuk setiap zone:
   - Town music (Moradon, El Morad, Karus)
   - Field music (Ronark Land PvP)
   - Dungeon music (Goblin, Orc, Dark)
   - Special: Ardream, Luferson, CZ
   ══════════════════════════════════════════════════════ */

/*
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

*/
