'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — Audio Engine
   Web Audio Context, Oscillator synth helpers
   ══════════════════════════════════════════════════════ */
// Nota: Fail ini digunakan sebagai sebahagian daripada Audio object
// Lihat audio/audio-main.js untuk keseluruhan sistem

/*
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

*/
// RUJUKAN — kandungan sebenar dalam js/audio.js
