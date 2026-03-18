'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — Volume Control UI
   Panel kawalan volume muzik dan SFX
   ══════════════════════════════════════════════════════ */

/*
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

*/
