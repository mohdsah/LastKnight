'use strict';
/* ══════════════════════════════════════════════════════════════
   Pahlawan Terakhir — systems/social.js
   Chat Global + Bisikan, NPC Quest, Duel 1v1, Lucky Spin/Gacha
   ══════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════
// 1. GLOBAL CHAT + BISIKAN (Whisper)
// ═══════════════════════════════════════════════════════════
const GlobalChat = (() => {
  let _ch = null; // Supabase channel
  const MAX_MSGS = 80;
  const msgs = [];

  function init() {
    if (window.offlineMode || !window.SB) return;
    if (_ch) _ch.unsubscribe();
    _ch = window.SB.channel('pt_global_chat');
    _ch.on('broadcast', { event: 'msg' }, ({ payload }) => {
      _addMsg(payload);
    })
    .on('broadcast', { event: 'whisper' }, ({ payload }) => {
      const myName = window.selChar?.char_name;
      if (payload.to !== myName) return;
      _addMsg({ ...payload, type: 'whisper_in' });
      if (typeof Audio !== 'undefined') Audio.playSFX?.('npc_talk');
    })
    .subscribe();
    console.log('[GlobalChat] ✅ Channel global_chat aktif');
  }

  function send(text, type = 'normal') {
    const ch = window.selChar; if (!ch || !text.trim()) return;

    // Whisper syntax: /w NamaPemain mesej
    if (text.startsWith('/w ') || text.startsWith('/bisik ')) {
      const parts = text.replace(/^\/(w|bisik) /, '').split(' ');
      const to = parts[0]; const msg = parts.slice(1).join(' ');
      if (!to || !msg) { window.addChat?.('', 'Format: /w [nama] [mesej]', 'system'); return; }
      whisper(to, msg); return;
    }

    const payload = {
      from: ch.char_name, faction: ch.faction,
      lv: ch.level, text: text.trim(), type,
      ts: Date.now()
    };
    _addMsg(payload);
    _ch?.send({ type: 'broadcast', event: 'msg', payload });
  }

  function whisper(to, text) {
    const ch = window.selChar; if (!ch) return;
    const payload = { from: ch.char_name, to, text, type: 'whisper_out', ts: Date.now() };
    _addMsg(payload);
    _ch?.send({ type: 'broadcast', event: 'whisper', payload: { ...payload, type: 'whisper_in' } });
  }

  function _addMsg(msg) {
    msgs.push(msg);
    if (msgs.length > MAX_MSGS) msgs.shift();
    _renderMsg(msg);
  }

  function _renderMsg(msg) {
    const box = document.getElementById('globalChatMsgs'); if (!box) return;
    const isEl   = msg.faction === 'elmorad' || msg.faction === 'cahaya';
    const isWhisp = msg.type === 'whisper_in' || msg.type === 'whisper_out';
    const isSystem= msg.type === 'system';
    const col = isWhisp ? '#88aaff' : isSystem ? '#888' : (isEl ? '#c9a84c' : '#e06060');

    const row = document.createElement('div');
    row.style.cssText = 'padding:2px 6px;font-family:"Share Tech Mono",monospace;font-size:.62rem;line-height:1.5';
    if (isWhisp) row.style.background = 'rgba(100,150,255,.06)';

    const time = new Date(msg.ts || Date.now()).toLocaleTimeString('ms-MY', { hour:'2-digit', minute:'2-digit' });
    const prefix = isWhisp ? (msg.type==='whisper_out'?`→ ${msg.to}`:`← ${msg.from}`) : (msg.from||'System');
    const facIcon = !isSystem && !isWhisp ? (isEl ? '🌟' : '🔥') : '';

    row.innerHTML = `<span style="color:#444">[${time}]</span> ` +
      (isWhisp ? `<span style="color:#88aaff">💬 ${prefix}</span>` :
      isSystem ? `<span style="color:#555">⚙ System</span>` :
      `<span style="color:${col}">${facIcon} ${prefix}</span>`) +
      `: <span style="color:${isSystem?'#666':'#ccc'}">${_esc(msg.text)}</span>`;

    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
    // Trim DOM
    while (box.children.length > MAX_MSGS) box.removeChild(box.firstChild);
  }

  function openPanel() {
    let p = document.getElementById('globalChatPanel');
    if (!p) { p = _create(); document.body.appendChild(p); }
    p.classList.remove('off');
    // Re-render all msgs
    const box = document.getElementById('globalChatMsgs');
    if (box) { box.innerHTML = ''; msgs.forEach(_renderMsg); }
  }
  function closePanel() { document.getElementById('globalChatPanel')?.classList.add('off'); }

  function _create() {
    const d = document.createElement('div');
    d.id = 'globalChatPanel'; d.className = 'overlay-panel off';
    d.innerHTML = `<div class="ov-box"><div class="ov-header">
      <div class="ov-title">💬 Chat Global</div>
      <div class="ov-close" onclick="GlobalChat.closePanel()">✕</div></div>
      <div class="ov-body" style="padding:0;display:flex;flex-direction:column;height:55vh">
        <div id="globalChatMsgs" style="flex:1;overflow-y:auto;padding:6px;background:rgba(0,0,0,.3)"></div>
        <div style="display:flex;gap:5px;padding:8px;border-top:1px solid rgba(201,168,76,.1)">
          <input id="globalChatInp" class="chat-inp" placeholder="Taip mesej... (/w nama untuk bisikan)"
            style="flex:1;font-size:.7rem" maxlength="100"
            onkeydown="if(event.key==='Enter')GlobalChat.sendFromInput()">
          <button class="btn btn-gold" onclick="GlobalChat.sendFromInput()"
            style="flex:0 0 auto;padding:6px 10px;font-size:.62rem">Hantar</button>
        </div>
      </div></div>`;
    return d;
  }

  function sendFromInput() {
    const inp = document.getElementById('globalChatInp');
    if (!inp?.value.trim()) return;
    send(inp.value.trim()); inp.value = '';
  }

  function _esc(s) { return String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0,120); }

  // Auto-init when Supabase ready
  window.addEventListener('load', () => {
    const _w = setInterval(() => { if (!window.SB && !window.offlineMode) return; clearInterval(_w); init(); }, 500);
  });

  return { init, send, whisper, openPanel, closePanel, sendFromInput };
})();
window.GlobalChat = GlobalChat;

// ═══════════════════════════════════════════════════════════
// 2. NPC QUEST SYSTEM
// ═══════════════════════════════════════════════════════════
const NPCQuest = (() => {
  const QUESTS = [
    // Moradon
    { id:'q_worm10',    npc:'merchant',     name:'Masalah Cacing',      zone:'moradon',
      desc:'Bunuh 10 Cacing Tanah berhampiran Moradon.',
      obj:[{type:'kill',target:'worm',count:10}], minLv:1,
      reward:{xp:500,gold:300,item:'hpot_sm',qty:5}},
    { id:'q_wolf5',     npc:'gatekeeper',   name:'Ancaman Serigala',    zone:'moradon',
      desc:'Tewaskan 5 Dire Wolf yang mengancam kota.',
      obj:[{type:'kill',target:'dire_wolf',count:5}], minLv:5,
      reward:{xp:800,gold:500,item:'hpot_md',qty:3}},
    // El Morad
    { id:'q_skeleton8', npc:'blacksmith_el',name:'Tulang Untuk Besi',   zone:'elmorad',
      desc:'Bunuh 8 Skeleton dan bawa pulang. Rangkanya berguna untuk menempa.',
      obj:[{type:'kill',target:'skeleton',count:8}], minLv:8,
      reward:{xp:1200,gold:700,item:'luna_stone',qty:3}},
    { id:'q_zombie5',   npc:'innkeeper_el', name:'Zombie Tanah El',     zone:'elmorad',
      desc:'Hapuskan 5 Zombie dari kawasan barat El Morad.',
      obj:[{type:'kill',target:'zombie',count:5}], minLv:10,
      reward:{xp:1500,gold:900,item:'chaos_stone',qty:2}},
    // Karus
    { id:'q_smilodon6', npc:'blacksmith_kr',name:'Kulit Smilodon',      zone:'karus',
      desc:'Bunuh 6 Smilodon untuk diambil kulitnya.',
      obj:[{type:'kill',target:'smilodon',count:6}], minLv:8,
      reward:{xp:1200,gold:700,item:'luna_stone',qty:3}},
    // Ardream
    { id:'q_lycaon10',  npc:'gatekeeper',   name:'Pemburu Lycaon',      zone:'ardream',
      desc:'Tewaskan 10 Lycaon di Ardream.',
      obj:[{type:'kill',target:'lycaon',count:10}], minLv:25,
      reward:{xp:5000,gold:3000,item:'star_stone',qty:2}},
    { id:'q_harpy8',    npc:'merchant',     name:'Bulu Harpy',          zone:'ardream',
      desc:'Bunuh 8 Harpy. Bulunya berharga di pasaran.',
      obj:[{type:'kill',target:'harpy',count:8}], minLv:28,
      reward:{xp:4500,gold:2500,item:'chaos_stone',qty:5}},
    // CZ
    { id:'q_dk5',       npc:'cz_gate',      name:'Penghapus Death Knight',zone:'cz',
      desc:'Tewaskan 5 Death Knight di Colony Zone.',
      obj:[{type:'kill',target:'death_knight',count:5}], minLv:50,
      reward:{xp:15000,gold:8000,item:'star_stone',qty:5}},
    { id:'q_boss_cz',   npc:'col_npc',      name:'Bunuh Boss Colony',   zone:'cz',
      desc:'Tewaskan 1 Boss di Colony Zone.',
      obj:[{type:'boss_kill',count:1}], minLv:55,
      reward:{xp:20000,gold:12000,item:'crystal_pure',qty:3}},
  ];

  function getAvailable(zone, lv) {
    return QUESTS.filter(q => q.zone === zone && lv >= q.minLv);
  }

  function getActive() {
    const ch = window.selChar; if (!ch) return [];
    return (ch.quest_progress ? Object.keys(ch.quest_progress) : [])
      .filter(k => !ch.quest_progress[k].done)
      .map(k => ({ ...QUESTS.find(q => q.id === k), ...ch.quest_progress[k] }))
      .filter(Boolean);
  }

  function accept(questId) {
    const q = QUESTS.find(x => x.id === questId);
    const ch = window.selChar;
    if (!q || !ch) return;
    if ((ch.level||1) < q.minLv) { window.addChat?.('','Level tidak mencukupi!','system'); return; }
    if (!ch.quest_progress) ch.quest_progress = {};
    if (ch.quest_progress[questId]) { window.addChat?.('','Quest sudah diterima!','system'); return; }
    ch.quest_progress[questId] = { progress: {}, done: false, accepted: Date.now() };
    window.addChat?.('', `📋 Quest diterima: ${q.name}`, 'system');
    window.saveProgress?.();
    openPanel();
  }

  function trackKill(monsterType, isBoss = false) {
    const ch = window.selChar; if (!ch?.quest_progress) return;
    Object.keys(ch.quest_progress).forEach(qid => {
      const state = ch.quest_progress[qid];
      if (state.done) return;
      const q = QUESTS.find(x => x.id === qid); if (!q) return;
      q.obj.forEach(obj => {
        if (obj.type === 'kill' && obj.target === monsterType) {
          state.progress[monsterType] = (state.progress[monsterType]||0) + 1;
        }
        if (obj.type === 'boss_kill' && isBoss) {
          state.progress._boss = (state.progress._boss||0) + 1;
        }
      });
      // Check if complete
      const allDone = q.obj.every(obj => {
        if (obj.type === 'kill')      return (state.progress[obj.target]||0) >= obj.count;
        if (obj.type === 'boss_kill') return (state.progress._boss||0) >= obj.count;
        return false;
      });
      if (allDone && !state.done) {
        state.done = true;
        _notifyComplete(q);
      }
    });
  }

  function claim(questId) {
    const ch = window.selChar; if (!ch) return;
    const state = ch.quest_progress?.[questId];
    const q = QUESTS.find(x => x.id === questId);
    if (!q || !state?.done) return;
    ch.gold = (ch.gold||0) + q.reward.gold;
    ch.xp   = (ch.xp||0) + q.reward.xp;
    if (q.reward.item) { if(!ch.inventory)ch.inventory={}; ch.inventory[q.reward.item]=(ch.inventory[q.reward.item]||0)+(q.reward.qty||1); }
    delete ch.quest_progress[questId];
    window.addChat?.('', `🎁 Quest "${q.name}" selesai! +${q.reward.xp}xp +${q.reward.gold}g`, 'system');
    window.addChat?.('', `📦 Item diterima: ${q.reward.item} ×${q.reward.qty||1}`, 'system');
    window.saveProgress?.();
    EventSystem?.trackWeekly('quest');
    Achievements?.check(ch);
    openPanel();
  }

  function _notifyComplete(q) {
    window.addChat?.('', `✅ Quest "${q.name}" selesai! Buka panel Quest untuk tuntut ganjaran.`, 'system');
    if (typeof Audio !== 'undefined') Audio.playSFX?.('levelup');
  }

  function openPanel(zone) {
    const curZone = zone || window.G?.currentZone || 'moradon';
    let p = document.getElementById('npcQuestPanel');
    if (!p) { p = _create(); document.body.appendChild(p); }
    p.classList.remove('off');
    _render(curZone);
  }
  function closePanel() { document.getElementById('npcQuestPanel')?.classList.add('off'); }

  function _create() {
    const d = document.createElement('div');
    d.id = 'npcQuestPanel'; d.className = 'overlay-panel off';
    d.innerHTML = `<div class="ov-box"><div class="ov-header">
      <div class="ov-title">🎯 Quest</div>
      <div class="ov-close" onclick="NPCQuest.closePanel()">✕</div></div>
      <div class="ov-body" id="npcQuestBody" style="max-height:65vh;overflow-y:auto"></div></div>`;
    return d;
  }

  function _render(zone) {
    const ch = window.selChar; if (!ch) return;
    const avail  = getAvailable(zone, ch.level||1);
    const active = getActive();
    const qp     = ch.quest_progress || {};

    let html = '';

    // Active quests
    if (active.length) {
      html += `<div style="font-family:'Cinzel',serif;font-size:.6rem;color:rgba(201,168,76,.4);
        text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px">Quest Aktif</div>`;
      active.forEach(aq => {
        const q = QUESTS.find(x => x.id === aq.id); if (!q) return;
        const state = qp[q.id] || {};
        const done = state.done;
        const progStr = q.obj.map(obj => {
          if (obj.type==='kill')     return `${state.progress?.[obj.target]||0}/${obj.count} ${obj.target}`;
          if (obj.type==='boss_kill')return `${state.progress?._boss||0}/${obj.count} boss`;
          return '?';
        }).join(', ');
        html += `<div style="padding:10px;margin-bottom:6px;border-radius:5px;
          border:1px solid rgba(201,168,76,.${done?'3':'1'});background:rgba(0,0,0,.35)">
          <div style="font-family:'Cinzel',serif;font-size:.72rem;color:${done?'#40c840':'#c9a84c'}">${q.name} ${done?'✅':''}</div>
          <div style="font-size:.62rem;color:#555;margin:3px 0">${q.desc}</div>
          <div style="font-size:.6rem;color:#777;margin-bottom:6px">📊 ${progStr}</div>
          <div style="font-size:.58rem;color:#ffd700">🎁 +${q.reward.xp}xp +${q.reward.gold}g + ${q.reward.item}</div>
          ${done?`<button class="btn btn-gold" onclick="NPCQuest.claim('${q.id}')"
            style="width:100%;margin-top:6px;padding:6px;font-size:.65rem">Tuntut Ganjaran 🎁</button>`:''}
        </div>`;
      });
    }

    // Available quests in zone
    const notActive = avail.filter(q => !qp[q.id]);
    if (notActive.length) {
      html += `<div style="font-family:'Cinzel',serif;font-size:.6rem;color:rgba(201,168,76,.4);
        text-transform:uppercase;letter-spacing:.12em;margin:10px 0 6px">Quest Tersedia — ${window.ZONES?.[zone]?.name||zone}</div>`;
      notActive.forEach(q => {
        html += `<div style="padding:10px;margin-bottom:6px;border-radius:5px;
          border:1px solid rgba(255,255,255,.05);background:rgba(0,0,0,.25)">
          <div style="font-family:'Cinzel',serif;font-size:.72rem;color:#aaa">${q.name}</div>
          <div style="font-size:.62rem;color:#555;margin:3px 0">${q.desc}</div>
          <div style="font-size:.58rem;color:#ffd700;margin-bottom:6px">🎁 +${q.reward.xp}xp +${q.reward.gold}g + ${q.reward.item}</div>
          <button class="btn btn-gold" onclick="NPCQuest.accept('${q.id}')"
            style="width:100%;padding:6px;font-size:.65rem">Terima Quest</button>
        </div>`;
      });
    }
    if (!html) html = `<div style="text-align:center;color:#444;font-size:.7rem;padding:20px">Tiada quest tersedia di zon ini.</div>`;
    document.getElementById('npcQuestBody').innerHTML = html;
  }

  // Hook kill tracking into game
  window.addEventListener('load', () => {
    const _w = setInterval(() => {
      if (!window.G) return; clearInterval(_w);
      const _origTick = window.G.tick.bind(window.G);
      window.G.tick = function(dt) {
        _origTick(dt);
        this.enemies?.forEach(e => {
          if (e.dead && e._achTracked && !e._questTracked) {
            e._questTracked = true;
            trackKill(e.type, e.boss||false);
          }
        });
      };
    }, 400);
  });

  return { accept, claim, trackKill, openPanel, closePanel, getAvailable, getActive };
})();
window.NPCQuest = NPCQuest;

// Patch existing openQuests in init.js to use NPCQuest
window.addEventListener('load', () => {
  const _w = setInterval(() => {
    if (typeof window._safe !== 'function') return; clearInterval(_w);
    // Override openQuests global
    window.openQuests = function() {
      _safe(() => {
        const p = document.getElementById('questPanel'); p?.classList.remove('off');
        if (typeof loadQuestProgress==='function') loadQuestProgress();
        if (typeof renderQuests==='function') renderQuests();
        NPCQuest.openPanel(window.G?.currentZone);
      });
    };
  }, 400);
});

// ═══════════════════════════════════════════════════════════
// 3. DUEL 1v1
// ═══════════════════════════════════════════════════════════
const Duel = (() => {
  let _active = false, _opponent = null, _myHp = 0, _oppHp = 0;
  let _duelCh = null;

  function challenge(targetName) {
    if (!window.SB || window.offlineMode) { window.addChat?.('','Perlu online untuk duel!','system'); return; }
    const ch = window.selChar; if (!ch) return;
    if (!_duelCh) _init();
    _duelCh.send({ type:'broadcast', event:'duel_req',
      payload:{ from:ch.char_name, fromId:ch.id, to:targetName, lv:ch.level } });
    window.addChat?.('', `⚔️ Cabaran duel dihantar kepada ${targetName}...`, 'system');
  }

  function _init() {
    if (!window.SB) return;
    _duelCh = window.SB.channel('pt_duel');
    _duelCh.on('broadcast', { event:'duel_req' }, ({ payload }) => {
      const me = window.selChar?.char_name;
      if (payload.to !== me) return;
      _showRequest(payload);
    })
    .on('broadcast', { event:'duel_accept' }, ({ payload }) => {
      if (payload.to !== window.selChar?.char_name) return;
      _startDuel(payload);
    })
    .on('broadcast', { event:'duel_hit' }, ({ payload }) => {
      if (payload.target !== window.selChar?.char_name) return;
      _takeDuelHit(payload.dmg);
    })
    .on('broadcast', { event:'duel_end' }, ({ payload }) => {
      _endDuel(payload.winner);
    })
    .subscribe();
  }

  function _showRequest(req) {
    const el = document.createElement('div');
    el.id = 'duelRequest';
    el.style.cssText = `position:fixed;top:35%;left:50%;transform:translateX(-50%);
      background:rgba(4,3,14,.95);border:1px solid rgba(200,80,80,.4);border-radius:8px;
      padding:16px 22px;z-index:95;text-align:center;min-width:240px`;
    el.innerHTML = `
      <div style="font-size:1.5rem">⚔️</div>
      <div style="font-family:'Cinzel Decorative',serif;font-size:.85rem;color:#e06060;margin-top:4px">
        Cabaran Duel!</div>
      <div style="font-size:.7rem;color:#888;margin:6px 0">
        <b style="color:#ccc">${req.from}</b> (Lv.${req.lv}) mencabar kamu!</div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn btn-gold" onclick="Duel.accept('${req.from}','${req.fromId}')"
          style="flex:1;padding:8px;font-size:.68rem">Terima ⚔️</button>
        <button class="btn btn-red" onclick="Duel.decline()" style="flex:1;padding:8px;font-size:.68rem">Tolak</button>
      </div>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 15000);
    if (typeof Audio !== 'undefined') Audio.playSFX?.('pvp_kill');
  }

  function accept(fromName, fromId) {
    document.getElementById('duelRequest')?.remove();
    const ch = window.selChar; if (!ch) return;
    _duelCh?.send({ type:'broadcast', event:'duel_accept',
      payload:{ to:fromName, toId:fromId, from:ch.char_name, fromId:ch.id } });
    _startDuel({ opponent:fromName, oppId:fromId });
  }

  function decline() {
    document.getElementById('duelRequest')?.remove();
    window.addChat?.('','⚔️ Cabaran duel ditolak.','system');
  }

  function _startDuel(payload) {
    _active = true;
    _opponent = payload.opponent || payload.from;
    const p = window.G?.pl; if (!p) return;
    _myHp  = p.maxHp;
    _oppHp = p.maxHp * (0.85 + Math.random() * 0.3); // estimate
    window.addChat?.('', `⚔️ DUEL BERMULA! vs ${_opponent}`, 'system');
    _showDuelHUD();
  }

  function _showDuelHUD() {
    let hud = document.getElementById('duelHUD');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'duelHUD';
      hud.style.cssText = `position:fixed;top:12%;left:50%;transform:translateX(-50%);
        background:rgba(4,3,14,.92);border:1px solid rgba(200,80,80,.3);border-radius:6px;
        padding:8px 18px;z-index:20;min-width:220px;text-align:center;pointer-events:none`;
      document.body.appendChild(hud);
    }
    _updDuelHUD();
  }

  function _updDuelHUD() {
    const hud = document.getElementById('duelHUD'); if (!hud) return;
    const p = window.G?.pl;
    _myHp = p?.hp || _myHp;
    const myPct  = Math.max(0, _myHp  / (p?.maxHp||100) * 100);
    const oppPct = Math.max(0, _oppHp / (p?.maxHp||100) * 100);
    hud.innerHTML = `
      <div style="font-family:'Cinzel',serif;font-size:.6rem;color:#e06060;letter-spacing:.1em">⚔️ DUEL</div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
        <div style="flex:1;text-align:right">
          <div style="font-size:.6rem;color:#c9a84c">${window.selChar?.char_name||'Kamu'}</div>
          <div style="height:5px;background:rgba(0,0,0,.5);border-radius:3px;overflow:hidden;margin-top:2px">
            <div style="height:100%;width:${myPct}%;background:#40c840;border-radius:3px"></div></div>
        </div>
        <div style="font-size:.65rem;color:#e06060">VS</div>
        <div style="flex:1">
          <div style="font-size:.6rem;color:#e06060">${_opponent||'?'}</div>
          <div style="height:5px;background:rgba(0,0,0,.5);border-radius:3px;overflow:hidden;margin-top:2px">
            <div style="height:100%;width:${oppPct}%;background:#e84040;border-radius:3px"></div></div>
        </div>
      </div>`;
  }

  function _takeDuelHit(dmg) {
    const p = window.G?.pl; if (!p || !_active) return;
    p.hp = Math.max(0, p.hp - dmg);
    p.hurt = 0.3; p.inv = 0.5;
    window.hitPts?.(p.x, p.y, '#ff2244');
    if (p.hp <= 0) {
      _duelCh?.send({ type:'broadcast', event:'duel_end', payload:{ winner:_opponent } });
      _endDuel(_opponent);
    } else _updDuelHUD();
  }

  function sendHit() {
    if (!_active || !_duelCh) return;
    const p = window.G?.pl; if (!p) return;
    const dmg = Math.floor(p.atk * 0.6 + Math.random() * 10);
    _oppHp = Math.max(0, _oppHp - dmg);
    _duelCh.send({ type:'broadcast', event:'duel_hit',
      payload:{ target:_opponent, attacker:window.selChar?.char_name, dmg } });
    _updDuelHUD();
    if (_oppHp <= 0) { _duelCh.send({ type:'broadcast',event:'duel_end',payload:{winner:window.selChar?.char_name}}); _endDuel(window.selChar?.char_name); }
  }

  function _endDuel(winner) {
    _active = false;
    document.getElementById('duelHUD')?.remove();
    const isWinner = winner === window.selChar?.char_name;
    window.addChat?.('', isWinner ? `🏆 Kamu MENANG duel!` : `💀 Kamu KALAH duel.`, 'system');
    if (isWinner) {
      const ch = window.selChar;
      if (ch) { ch.gold=(ch.gold||0)+200; ch._pvpKills=(ch._pvpKills||0)+1; }
      if (typeof Audio !== 'undefined') Audio.playSFX?.('raredrop');
    }
    PVP?.addKill?.(_opponent, null);
  }

  function openPanel() {
    let p = document.getElementById('duelPanel');
    if (!p) { p = _create(); document.body.appendChild(p); }
    p.classList.remove('off');
    _renderPanel();
  }
  function closePanel() { document.getElementById('duelPanel')?.classList.add('off'); }

  function _create() {
    const d = document.createElement('div');
    d.id = 'duelPanel'; d.className = 'overlay-panel off';
    d.innerHTML = `<div class="ov-box"><div class="ov-header">
      <div class="ov-title">⚔️ Duel 1v1</div>
      <div class="ov-close" onclick="Duel.closePanel()">✕</div></div>
      <div class="ov-body" id="duelBody"></div></div>`;
    return d;
  }

  function _renderPanel() {
    const online = Object.values(window.opMap||{});
    const ch = window.selChar;
    let html = `
      <div style="font-size:.68rem;color:#555;margin-bottom:12px">
        Cabar pemain lain berduel 1v1! Pemenang dapat 200 gold.</div>
      <div style="margin-bottom:12px;display:flex;gap:6px">
        <input id="duelTargetInp" class="chat-inp" placeholder="Nama pemain..."
          style="flex:1;font-size:.72rem">
        <button class="btn btn-red" onclick="Duel.challengeFromInput()"
          style="flex:0 0 auto;padding:6px 12px;font-size:.65rem">Cabar ⚔️</button>
      </div>
      <div style="font-family:'Cinzel',serif;font-size:.6rem;color:rgba(201,168,76,.4);
        text-transform:uppercase;margin-bottom:6px">Pemain Online (${online.length})</div>`;
    if (!online.length) {
      html += `<div style="text-align:center;color:#333;font-size:.7rem;padding:12px">Tiada pemain lain dalam zon ini.</div>`;
    } else {
      online.forEach(op => {
        const isEnemy = op.faction !== ch?.faction;
        html += `<div style="display:flex;align-items:center;gap:8px;padding:8px;
          border-radius:4px;border:1px solid rgba(255,255,255,.05);margin-bottom:4px">
          <div style="flex:1;font-family:'Cinzel',serif;font-size:.7rem;
            color:${isEnemy?'#e06060':'#c9a84c'}">${op.name||'?'}</div>
          <button class="btn btn-red" onclick="Duel.challenge('${op.name}')"
            style="flex:0 0 auto;padding:4px 10px;font-size:.6rem">Cabar</button>
        </div>`;
      });
    }
    document.getElementById('duelBody').innerHTML = html;
  }

  function challengeFromInput() {
    const name = document.getElementById('duelTargetInp')?.value.trim();
    if (name) challenge(name);
  }

  return { challenge, challengeFromInput, accept, decline, sendHit, openPanel, closePanel };
})();
window.Duel = Duel;

// ═══════════════════════════════════════════════════════════
// 4. LUCKY SPIN / GACHA
// ═══════════════════════════════════════════════════════════
const LuckySpin = (() => {
  const ITEMS = [
    { id:'hpot_lg',     name:'HP Potion Besar', icon:'🍶', wt:25, rarity:'common'   },
    { id:'mpot_md',     name:'MP Potion Sedang', icon:'🫙', wt:20, rarity:'common'   },
    { id:'luna_stone',  name:'Batu Luna ×3',    icon:'🌙', wt:20, rarity:'common'   },
    { id:'chaos_stone', name:'Batu Huru-Hara',  icon:'💠', wt:12, rarity:'uncommon' },
    { id:'star_stone',  name:'Batu Bintang',    icon:'⭐', wt:8,  rarity:'uncommon' },
    { id:'elixir_power',name:'Elixir Kekuatan', icon:'💪', wt:6,  rarity:'rare'     },
    { id:'ring_ruby',   name:'Cincin Rubi',     icon:'❤️', wt:4,  rarity:'rare'     },
    { id:'amulet_power',name:'Amulet Kuasa',    icon:'🔮', wt:3,  rarity:'epic'     },
    { id:'revive_stone',name:'Batu Kebangkitan',icon:'💎', wt:1,  rarity:'epic'     },
    { id:'ring_mythic', name:'Cincin Keabadian',icon:'♾️', wt:.5, rarity:'mythic'   },
  ];
  const SPIN_COST = 500; // points per spin
  const SPIN_COST_GOLD = 2000; // gold per spin (free spin alternative)

  function _roll() {
    const total = ITEMS.reduce((s,i) => s + i.wt, 0);
    let r = Math.random() * total;
    for (const item of ITEMS) { r -= item.wt; if (r <= 0) return item; }
    return ITEMS[0];
  }

  function spin(usePoints = true) {
    const ch = window.selChar; if (!ch) return;
    if (usePoints) {
      if ((ch.points||0) < SPIN_COST) { window.addChat?.('',`Perlu ${SPIN_COST} points untuk spin!`,'system'); return; }
      ch.points -= SPIN_COST;
    } else {
      if ((ch.gold||0) < SPIN_COST_GOLD) { window.addChat?.('',`Perlu ${SPIN_COST_GOLD} gold untuk spin!`,'system'); return; }
      ch.gold -= SPIN_COST_GOLD;
    }
    const result = _roll();
    if (!ch.inventory) ch.inventory = {};
    const qty = result.id.endsWith('luna_stone') ? 3 : 1;
    ch.inventory[result.id] = (ch.inventory[result.id]||0) + qty;
    _animate(result);
    window.saveProgress?.();
    return result;
  }

  function spin10(usePoints = true) {
    const ch = window.selChar; if (!ch) return;
    const cost10 = usePoints ? SPIN_COST*9 : SPIN_COST_GOLD*9; // 10% discount
    if (usePoints && (ch.points||0) < cost10) { window.addChat?.('',`Perlu ${cost10} points untuk 10x spin!`,'system'); return; }
    if (!usePoints && (ch.gold||0) < cost10) { window.addChat?.('',`Perlu ${cost10} gold untuk 10x spin!`,'system'); return; }
    if (usePoints) ch.points -= cost10; else ch.gold -= cost10;
    const results = Array.from({length:10}, _roll);
    if (!ch.inventory) ch.inventory = {};
    results.forEach(r => { ch.inventory[r.id]=(ch.inventory[r.id]||0)+1; });
    _animate10(results);
    window.saveProgress?.();
    return results;
  }

  function _animate(item) {
    const RARITY_COL = { common:'#aaa',uncommon:'#4af',rare:'#fa0',epic:'#c4f',legendary:'#f84',mythic:'#f4f' };
    const col = RARITY_COL[item.rarity]||'#aaa';
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:40%;left:50%;transform:translateX(-50%);
      background:rgba(4,3,14,.96);border:2px solid ${col};border-radius:10px;
      padding:20px 32px;z-index:95;text-align:center;
      animation:achIn .5s ease;box-shadow:0 0 30px ${col}44`;
    el.innerHTML = `
      <div style="font-size:3rem;animation:spinBounce 0.5s ease">${item.icon}</div>
      <div style="font-family:'Cinzel Decorative',serif;font-size:.65rem;color:${col};
        text-transform:uppercase;letter-spacing:.2em;margin-top:8px">${item.rarity}</div>
      <div style="font-family:'Cinzel',serif;font-size:.9rem;color:${col};margin-top:4px">${item.name}</div>
      <div style="font-size:.62rem;color:#555;margin-top:8px">Dimasukkan ke dalam beg anda</div>`;
    document.body.appendChild(el);
    if (item.rarity === 'mythic' || item.rarity === 'legendary') {
      if (typeof Audio !== 'undefined') Audio.playSFX?.('raredrop');
    }
    setTimeout(() => el.remove(), 3500);
    window.addChat?.('', `🎰 Lucky Spin: ${item.icon} ${item.name} (${item.rarity})!`, 'system');
    openPanel(); // refresh
  }

  function _animate10(items) {
    const best = items.sort((a,b) => b.wt-a.wt)[0]; // rarest
    _animate(best);
    const others = items.filter(i=>i!==best).map(i=>`${i.icon}`).join(' ');
    window.addChat?.('', `🎰 10× Spin: ${others} + ${best.icon} ${best.name}!`, 'system');
  }

  function openPanel() {
    let p = document.getElementById('luckSpinPanel');
    if (!p) { p = _create(); document.body.appendChild(p); }
    p.classList.remove('off');
    _render();
  }
  function closePanel() { document.getElementById('luckSpinPanel')?.classList.add('off'); }

  function _create() {
    const d = document.createElement('div');
    d.id = 'luckSpinPanel'; d.className = 'overlay-panel off';
    d.innerHTML = `<div class="ov-box"><div class="ov-header">
      <div class="ov-title">🎰 Lucky Spin</div>
      <div class="ov-close" onclick="LuckySpin.closePanel()">✕</div></div>
      <div class="ov-body" id="luckSpinBody" style="max-height:68vh;overflow-y:auto"></div></div>`;
    return d;
  }

  function _render() {
    const ch = window.selChar;
    const pts = ch?.points || 0, gold = ch?.gold || 0;
    const RARITY_COL = { common:'#aaa',uncommon:'#4af',rare:'#fa0',epic:'#c4f',mythic:'#f4f' };
    let html = `
      <div style="text-align:center;padding:12px;background:rgba(0,0,0,.35);
        border-radius:6px;margin-bottom:14px">
        <div style="font-size:3rem;margin-bottom:6px">🎰</div>
        <div style="font-family:'Cinzel Decorative',serif;font-size:.8rem;color:#c9a84c">Lucky Spin</div>
        <div style="font-size:.62rem;color:#555;margin-top:4px">Cuba nasib kamu! Item rare & mythic menanti.</div>
        <div style="display:flex;gap:6px;margin-top:12px;justify-content:center">
          <div style="font-family:'Share Tech Mono',monospace;font-size:.7rem;
            color:#c9a84c;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);
            padding:4px 12px;border-radius:4px">⭐ ${pts.toLocaleString()} pts</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.7rem;
            color:#c9a84c;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);
            padding:4px 12px;border-radius:4px">💰 ${gold.toLocaleString()} g</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
        <button class="btn btn-gold" onclick="LuckySpin.spin(true)"
          style="padding:12px;font-size:.7rem;flex-direction:column;height:auto">
          <div>1× Spin</div><div style="font-size:.6rem;opacity:.7">${SPIN_COST} pts</div></button>
        <button class="btn btn-gold" onclick="LuckySpin.spin(false)"
          style="padding:12px;font-size:.7rem;flex-direction:column;height:auto">
          <div>1× Spin</div><div style="font-size:.6rem;opacity:.7">${SPIN_COST_GOLD} gold</div></button>
        <button class="btn btn-gold" onclick="LuckySpin.spin10(true)"
          style="padding:12px;font-size:.7rem;flex-direction:column;height:auto;border-color:rgba(255,215,0,.6)">
          <div>10× Spin 🔥</div><div style="font-size:.6rem;opacity:.7">${SPIN_COST*9} pts (-10%)</div></button>
        <button class="btn btn-gold" onclick="LuckySpin.spin10(false)"
          style="padding:12px;font-size:.7rem;flex-direction:column;height:auto;border-color:rgba(255,215,0,.6)">
          <div>10× Spin 🔥</div><div style="font-size:.6rem;opacity:.7">${SPIN_COST_GOLD*9} gold</div></button>
      </div>
      <div style="font-family:'Cinzel',serif;font-size:.6rem;color:rgba(201,168,76,.4);
        text-transform:uppercase;letter-spacing:.12em;margin-bottom:8px">Senarai Hadiah</div>`;
    ITEMS.forEach(item => {
      const col = RARITY_COL[item.rarity]||'#aaa';
      const pct  = Math.round(item.wt / ITEMS.reduce((s,i)=>s+i.wt,0) * 100 * 10) / 10;
      html += `<div style="display:flex;align-items:center;gap:8px;padding:6px;
        border-radius:4px;border:1px solid rgba(255,255,255,.04);margin-bottom:3px">
        <div style="font-size:1.3rem;flex-shrink:0">${item.icon}</div>
        <div style="flex:1;font-family:'Cinzel',serif;font-size:.68rem;color:${col}">${item.name}</div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:#444">${pct}%</div>
      </div>`;
    });
    document.getElementById('luckSpinBody').innerHTML = html;
  }

  // Add CSS
  document.addEventListener('DOMContentLoaded', () => {
    const s = document.createElement('style');
    s.textContent = `@keyframes spinBounce { 0%{transform:scale(.5) rotate(-20deg)} 60%{transform:scale(1.2) rotate(5deg)} 100%{transform:scale(1) rotate(0)} }`;
    document.head.appendChild(s);
  });

  return { spin, spin10, openPanel, closePanel };
})();
window.LuckySpin = LuckySpin;

// ═══════════════════════════════════════════════════════════
// INJECT BUTTONS into ingame menu
// ═══════════════════════════════════════════════════════════
window.addEventListener('load', () => {
  const _w = setInterval(() => {
    const menu = document.getElementById('ingameMenu');
    if (!menu || menu.dataset.socialInjected) return;
    clearInterval(_w);
    menu.dataset.socialInjected = '1';
    const extra = document.createElement('div');
    extra.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-top:4px';
    extra.innerHTML = `
      <button class="im-btn" onclick="GlobalChat.openPanel();closeIngameMenu()">💬 Chat Global</button>
      <button class="im-btn" onclick="NPCQuest.openPanel(window.G?.currentZone);closeIngameMenu()">🎯 Quest NPC</button>
      <button class="im-btn" onclick="Duel.openPanel();closeIngameMenu()">⚔️ Duel 1v1</button>
      <button class="im-btn" onclick="LuckySpin.openPanel();closeIngameMenu()">🎰 Lucky Spin</button>`;
    menu.appendChild(extra);
  }, 600);
});
