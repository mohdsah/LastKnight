'use strict';
/* ═══════════════════════════════════════════════════════
   KO Classic — Auth
   Guna Supabase Auth (email+password) tapi UI pakai
   Username sahaja. Email dijana automatik:
   username@pahlawan-terakhir.game
   ═══════════════════════════════════════════════════════ */

const SURL = 'https://vlmxawhhgtioawjwncrh.supabase.co';
const SKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbXhhd2hoZ3Rpb2F3anduY3JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODkwMjMsImV4cCI6MjA4OTA2NTAyM30.czvcAXqw-9F7CPZpywNqtYXWW85JdYH7WiQfkPD410M';

// ── Global state — exposed via window untuk akses cross-file ──
let SB          = null;
let offlineMode = false;
let curAccount  = null;
let curChars    = [];
let selChar     = null;
let selCharIdx  = -1;

// Expose semua sebagai window properties (SEKALI sahaja)
Object.defineProperty(window,'SB',         {get(){return SB;},         set(v){SB=v;},         configurable:true});
Object.defineProperty(window,'offlineMode', {get(){return offlineMode;}, set(v){offlineMode=v;}, configurable:true});
Object.defineProperty(window,'selChar',     {get(){return selChar;},     set(v){selChar=v;},     configurable:true});
Object.defineProperty(window,'curAccount',  {get(){return curAccount;},  set(v){curAccount=v;},  configurable:true});
Object.defineProperty(window,'curChars',    {get(){return curChars;},    set(v){curChars=v;},    configurable:true});

// Char create pending state
let pendingFaction = null, pendingRace = null, pendingJob = null;
let pendingStats   = {str:0,hp:0,dex:0,int:0,mp:0};
let pendingBP      = 5, pendingFaceIdx = 0, _selFaction = null;

// ── INIT SUPABASE ─────────────────────────────────────
function initSB() {
  try {
    if (!window.supabase) {
      console.warn('[PT] Supabase CDN tidak load — offline mode');
      offlineMode = true; SB = null; return false;
    }
    SB = window.supabase.createClient(SURL, SKEY);
    offlineMode = false;
    return true;
  } catch(e) {
    console.warn('[PT] Supabase init failed:', e);
    offlineMode = true; SB = null; return false;
  }
}

// Username → email palsu untuk Supabase Auth
function toFakeEmail(username) {
  // bersihkan username, jadikan email selamat
  const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
  return clean + '@pahlawan-terakhir.game';
}

// Offline mode
function skipConfig() {
  offlineMode = true; SB = null;
  hideAll(); sc('loginSc','on'); setTimeout(initLoginCreature, 80);
}

// ── STATUS ────────────────────────────────────────────
function setLgSt(msg, type) {
  const el = E('lgStatus'); if (!el) return;
  el.textContent = msg;
  el.className = 'login-status ' + (type==='err'?'st-err':type==='ok'?'st-ok':'st-info');
}
function cancelLogin() {
  E('lgUsr').value = ''; E('lgPwd').value = '';
  setLgSt('Enter username & password','info');
}

// ── LOGIN ─────────────────────────────────────────────
async function doLogin() {
  const usr = E('lgUsr').value.trim();
  const pwd = E('lgPwd').value;

  if (!usr) { setLgSt('Sila masukkan username','err'); return; }
  if (!pwd) { setLgSt('Sila masukkan password','err'); return; }
  if (usr.length < 3) { setLgSt('Username min 3 huruf','err'); return; }

  setLgSt('Connecting...','info');

  // Offline mode
  if (offlineMode || !SB) {
    curAccount = { uid:'off_'+Date.now().toString(36), username:usr };
    curChars = []; goCharSelect(); return;
  }

  try {
    const email = toFakeEmail(usr);

    // Login dengan Supabase Auth
    const { data: authData, error: authErr } = await SB.auth.signInWithPassword({ email, password: pwd });

    if (authErr) {
      // Cuba detect jenis error
      if (authErr.message.includes('Invalid login credentials') || authErr.message.includes('invalid_credentials')) {
        setLgSt('Username atau password salah!','err');
      } else if (authErr.message.includes('Email not confirmed')) {
        setLgSt('Email belum disahkan. Semak inbox anda.','err');
      } else {
        setLgSt('Login gagal: ' + authErr.message,'err');
      }
      return;
    }

    const uid = authData.user.id;
    curAccount = { uid, username: usr };

    // Ambil karakter dari kn_players
    const { data: chars, error: charErr } = await SB.from('kn_players')
      .select('*')
      .eq('account_id', uid)
      .order('created_at');

    if (charErr) throw charErr;
    curChars = (chars || []).map(parseChar);

    setLgSt('Berjaya! Selamat datang, ' + usr,'ok');
    setTimeout(goCharSelect, 600);

  } catch(e) {
    console.error('Login error:', e);
    setLgSt('Ralat: ' + (e.message || 'Unknown error'),'err');
  }
}

// ── REGISTER ─────────────────────────────────────────
async function doRegister() {
  const usr = E('lgUsr').value.trim();
  const pwd = E('lgPwd').value;

  if (!usr || usr.length < 3)  { setLgSt('Username min 3 huruf','err'); return; }
  if (!pwd || pwd.length < 6)  { setLgSt('Password min 6 huruf','err'); return; }
  if (!/^[a-zA-Z0-9_]+$/.test(usr)) { setLgSt('Username: huruf, angka & _ sahaja','err'); return; }

  setLgSt('Mendaftar akaun...','info');

  // Offline mode
  if (offlineMode || !SB) {
    curAccount = { uid:'off_'+Date.now().toString(36), username:usr };
    curChars = []; goCharSelect(); return;
  }

  try {
    const email = toFakeEmail(usr);

    // Semak username sudah wujud
    const { data: existing } = await SB.from('kn_usernames')
      .select('id')
      .eq('username', usr)
      .maybeSingle();

    if (existing) { setLgSt('Username sudah digunakan!','err'); return; }

    // Daftar dengan Supabase Auth
    const { data: authData, error: authErr } = await SB.auth.signUp({
      email,
      password: pwd,
      options: {
        data: { username: usr },          // simpan dalam user metadata
        emailRedirectTo: undefined,       // tiada email confirmation
      }
    });

    if (authErr) {
      if (authErr.message.includes('already registered') || authErr.message.includes('User already registered')) {
        setLgSt('Username ini sudah didaftarkan!','err');
      } else {
        setLgSt('Daftar gagal: ' + authErr.message,'err');
      }
      return;
    }

    if (!authData.user) { setLgSt('Daftar gagal. Cuba lagi.','err'); return; }

    const uid = authData.user.id;

    // Simpan username dalam table kn_usernames (untuk semak duplikat)
    await SB.from('kn_usernames').insert({ user_id: uid, username: usr }).throwOnError();

    curAccount = { uid, username: usr };
    curChars   = [];

    // Jika perlu email confirmation
    if (!authData.session) {
      setLgSt('✅ Akaun berjaya! Sila log masuk semula.','ok');
      return;
    }

    setLgSt('✅ Akaun berjaya dibuat! Selamat datang, ' + usr,'ok');
    setTimeout(goCharSelect, 700);

  } catch(e) {
    console.error('Register error:', e);
    setLgSt('Ralat: ' + (e.message || 'Unknown error'),'err');
  }
}

// ── LOGOUT ───────────────────────────────────────────
async function doLogout() {
  if (SB && !offlineMode) {
    await SB.auth.signOut().catch(() => {});
  }
  curAccount = null; curChars = []; selChar = null; selCharIdx = -1;
  if (typeof rtCh !== 'undefined' && rtCh) { rtCh.unsubscribe(); rtCh = null; }
  hideAll(); sc('loginSc','on');
  if (E('lgUsr')) E('lgUsr').value = '';
  if (E('lgPwd')) E('lgPwd').value = '';
  setLgSt('Enter username & password','info');
  setTimeout(initLoginCreature, 80);
}

// ── AUTO SESSION RESTORE ─────────────────────────────
async function tryRestoreSession() {
  if (!SB || offlineMode) return false;
  try {
    const { data } = await SB.auth.getSession();
    if (!data?.session?.user) return false;

    const user = data.session.user;
    const username = user.user_metadata?.username
                  || user.email?.split('@')[0]
                  || 'Player';
    curAccount = { uid: user.id, username };

    const { data: chars } = await SB.from('kn_players')
      .select('*').eq('account_id', user.id).order('created_at');
    curChars = (chars || []).map(parseChar);

    // Sesi ada — tunggu loading selesai (3.5s) baru pergi char select
    setTimeout(() => {
      if (typeof hideAll === 'function') hideAll();
      goCharSelect();
    }, 3500);
    return true;
  } catch(e) {
    return false;
  }
}

// ── PARSE CHAR ───────────────────────────────────────
function parseChar(c) {
  try { c.inventory = typeof c.inventory === 'string' ? JSON.parse(c.inventory||'{}') : c.inventory||{}; } catch { c.inventory = {}; }
  try { c.equipment = typeof c.equipment === 'string' ? JSON.parse(c.equipment||'{}') : c.equipment||{}; } catch { c.equipment = {}; }
  try { c.skill_tree= typeof c.skill_tree === 'string' ? JSON.parse(c.skill_tree||'{}') : c.skill_tree||{}; } catch { c.skill_tree= {}; }
  try { c.daily_progress  = typeof c.daily_progress  === 'string' ? JSON.parse(c.daily_progress ||'{}') : c.daily_progress ||{}; } catch { c.daily_progress  = {}; }
  try { c.quest_progress  = typeof c.quest_progress  === 'string' ? JSON.parse(c.quest_progress ||'{}') : c.quest_progress ||{}; } catch { c.quest_progress  = {}; }
  if (!c.current_zone) c.current_zone = 'moradon';
  return c;
}

// ── CHAR SELECT ──────────────────────────────────────
function goCharSelect() { hideAll(); sc('charSelectSc','on'); renderCharSlots(); }

function renderCharSlots() {
  const arena = E('csArena'); arena.innerHTML = '';
  E('csDetail').style.display = 'none';
  E('csPlay').disabled = true; E('csDel').disabled = true;

  for (let i = 0; i < 3; i++) {
    const ch = curChars[i];
    if (ch) {
      const race = window.RACES[ch.race]||window.RACES.human;
      const job  = window.JOBS[ch.job]||window.JOBS.warrior;
      const isEl = ch.faction==='elmorad'||ch.faction==='cahaya';
      // Portrait SVG atau fallback emoji
      const portraitSrc = window.PortraitSystem?.getCharPortrait(ch);
      const avatarHtml  = portraitSrc
        ? `<img src="${portraitSrc}" style="width:100%;height:100%;object-fit:cover;border-radius:3px"
             onerror="this.outerHTML='<span>${race.icon}</span>'">`
        : race.icon;
      const div  = document.createElement('div'); div.className = 'cs-char-slot';
      div.innerHTML = `
        <div class="cs-avatar ${isEl?'portrait-el':'portrait-kr'}">${avatarHtml}</div>
        <div class="cs-char-name">${ch.char_name}</div>
        <div class="cs-char-info">Lv.${ch.level||1} ${job.name}</div>
        <div class="cs-char-faction ${isEl?'fc-elmorad':'fc-karus'}">${isEl?'🌟 El Morad':'🔥 Karus'}</div>`;
      div.onclick = () => selectCharSlot(i);
      arena.appendChild(div);
    } else {
      const div = document.createElement('div'); div.className = 'cs-empty-slot';
      div.innerHTML = `<div style="font-size:2rem;opacity:.3">+</div><div>Slot Kosong</div><div style="font-size:.58rem;opacity:.45">Klik untuk cipta</div>`;
      div.onclick = () => {
        pendingFaction=null; pendingRace=null; pendingJob=null;
        pendingBP=5; pendingStats={str:0,hp:0,dex:0,int:0,mp:0};
        hideAll(); sc('factionSc','on');
      };
      arena.appendChild(div);
    }
  }
}

function selectCharSlot(idx) {
  selCharIdx = idx; selChar = curChars[idx];
  document.querySelectorAll('.cs-char-slot').forEach((el,i) => el.classList.toggle('selected', i===idx));
  E('csPlay').disabled = false; E('csDel').disabled = false;
  const ch = selChar, race = window.RACES[ch.race]||window.RACES.human, job = window.JOBS[ch.job]||window.JOBS.warrior;
  const isEl = ch.faction==='elmorad'||ch.faction==='cahaya';
  const d = E('csDetail'); d.style.display = 'flex';
  d.innerHTML = `
    <div class="cs-detail-name">${ch.char_name}</div>
    <div class="cs-detail-row"><span>Race</span><span class="dv">${race.name}</span></div>
    <div class="cs-detail-row"><span>Class</span><span class="dv">${job.name}</span></div>
    <div class="cs-detail-row"><span>Nation</span><span class="dv">${isEl?'🌟 El Morad':'🔥 Karus'}</span></div>
    <div class="cs-detail-row"><span>Level</span><span class="dv">${ch.level||1}</span></div>
    <div class="cs-detail-row"><span>Gold</span><span class="dv">${(ch.gold||0).toLocaleString()}</span></div>
    <div class="cs-detail-row"><span>Best Score</span><span class="dv">${(ch.best_score||0).toLocaleString()}</span></div>`;
}

async function deleteChar() {
  if (!selChar || selCharIdx < 0) return;
  if (!confirm(`Padam watak "${selChar.char_name}"? Tidak boleh dibatalkan!`)) return;
  if (!offlineMode && SB) {
    await SB.from('kn_players').delete().eq('id', selChar.id).eq('account_id', curAccount.uid);
  }
  curChars.splice(selCharIdx, 1); selChar = null; selCharIdx = -1; renderCharSlots();
}

function enterWorld() {
  if (!selChar) return;
  if (!selChar.inventory) selChar.inventory = {hpot_sm:10,mpot_sm:5,town_scroll:3};
  if (!selChar.equipment) selChar.equipment = {weapon:null,armor:null,helmet:null,gloves:null,boots:null,ring1:null,ring2:null,amulet:null,earring:null};
  if (!selChar.skill_tree) selChar.skill_tree = {};
  if (!selChar.daily_progress) selChar.daily_progress = {};
  if (!selChar.quest_progress)  selChar.quest_progress  = {};

  // Restore costume & points data
  if (typeof restoreMasterData === 'function') restoreMasterData(selChar);

  // Mulakan AutoSave
  if (window.AutoSave && !window.AutoSave.timer) {
    window.AutoSave.start();
    console.log('[PT] AutoSave started');
  }

  goMenu();
}

// ── FACTION & CHAR CREATE ─────────────────────────────
function selectFaction(f) {
  _selFaction = f;
  E('fhEl').classList.toggle('sel', f==='elmorad');
  E('fhKr').classList.toggle('sel', f==='karus');
  sc('factionBot','on');
  E('fsStatus').textContent = f==='elmorad' ? '🌟 El Morad selected' : '🔥 Karus selected';
  E('fsStatus').style.color = f==='elmorad' ? 'var(--el)' : 'var(--kr)';
}
function confirmFaction() {
  if (!_selFaction) return;
  pendingFaction = _selFaction;
  hideAll(); sc('charCreateSc','on'); initCharCreate();
}
function backToFaction() { hideAll(); sc('factionSc','on'); sc('factionBot','on'); }

function initCharCreate() {
  const rl = E('raceList'); rl.innerHTML = '';
  Object.entries(window.RACES).filter(([,r]) => r.fac===pendingFaction).forEach(([k,r]) => {
    const d = document.createElement('div');
    d.className = 'cc-option' + (pendingRace===k ? ' ' + (pendingFaction==='elmorad'?'sel':'sel-red') : '');
    d.innerHTML = `${r.icon} ${r.name}`; d.onclick = () => setRace(k); rl.appendChild(d);
    if (!pendingRace) pendingRace = k;
  });
  if (!pendingRace) pendingRace = Object.keys(window.RACES).find(k => window.RACES[k].fac===pendingFaction);
  const jl = E('jobList'); jl.innerHTML = '';
  Object.entries(window.JOBS).forEach(([k,j]) => {
    const d = document.createElement('div');
    d.className = 'cc-option' + (pendingJob===k ? ' ' + (pendingFaction==='elmorad'?'sel':'sel-red') : '');
    d.innerHTML = `${j.icon} ${j.name}`; d.onclick = () => setJob(k); jl.appendChild(d);
  });
  if (!pendingJob) pendingJob = 'warrior';
  setRace(pendingRace); setJob('warrior');
}

function setRace(k) {
  pendingRace = k;
  document.querySelectorAll('#raceList .cc-option').forEach((el,i) => {
    const key = Object.keys(window.RACES).filter(r => window.RACES[r].fac===pendingFaction)[i];
    el.className = 'cc-option' + (key===k ? ' ' + (pendingFaction==='elmorad'?'sel':'sel-red') : '');
  }); updateCharPreview();
}
function setJob(k) {
  pendingJob = k;
  document.querySelectorAll('#jobList .cc-option').forEach((el,i) => {
    const key = Object.keys(window.JOBS)[i];
    el.className = 'cc-option' + (key===k ? ' ' + (pendingFaction==='elmorad'?'sel':'sel-red') : '');
  });
  E('jobDesc').textContent = window.JOBS[k]?.desc || ''; updateCharPreview();
}
function cycleFace(dir) {
  const icons = FACE_ICONS[pendingFaction]||FACE_ICONS.elmorad;
  pendingFaceIdx = (pendingFaceIdx+dir+icons.length)%icons.length; updateCharPreview();
}
function updateCharPreview() {
  const race = window.RACES[pendingRace], job = window.JOBS[pendingJob]; if (!race||!job) return;
  const icons = FACE_ICONS[pendingFaction]||FACE_ICONS.elmorad;
  E('ccAvatarIcon').textContent = icons[pendingFaceIdx%icons.length];
  const sp = E('statsPanel'); sp.innerHTML = '';
  const sK=['str','hp','dex','int','mp'], sL={str:'STR',hp:'VIT',dex:'DEX',int:'INT',mp:'MP'};
  const sC={str:'sf-str',hp:'sf-hp',dex:'sf-dex',int:'sf-int',mp:'sf-mp'};
  sK.forEach(k => {
    const v = race.base[k]+(job.stats[k]||0)+(pendingStats[k]||0);
    const row = document.createElement('div'); row.className = 'stat-row';
    row.innerHTML = `<div class="stat-lbl">${sL[k]}</div><div class="stat-bar-bg"><div class="stat-bar-fill ${sC[k]}" style="width:${Math.min(100,v/120*100)}%"></div></div><div class="stat-val">${v}</div><button class="stat-btn" onclick="addStat('${k}')" id="sb_${k}">+</button>`;
    sp.appendChild(row);
  });
  E('bpCount').textContent = pendingBP;
  sK.forEach(k => { const btn = E('sb_'+k); if(btn) btn.disabled = pendingBP<=0; });
}
function addStat(k) { if(pendingBP<=0) return; pendingBP--; pendingStats[k]=(pendingStats[k]||0)+1; updateCharPreview(); }

async function createCharacter() {
  const name = E('ccName').value.trim();
  if (!name||name.length<2) { E('ccStatus').textContent='Nama min 2 huruf!'; return; }
  if (!/^[a-zA-Z0-9_]+$/.test(name)) { E('ccStatus').textContent='Nama: huruf, angka & _ sahaja'; return; }
  E('ccStatus').textContent = 'Mencipta watak...';
  const race = window.RACES[pendingRace], job = window.JOBS[pendingJob];
  const icons = FACE_ICONS[pendingFaction]||FACE_ICONS.elmorad;

  // ── Start Items ikut kelas ────────────────────────
  const startInventory = {
    hpot_sm: 10,
    mpot_sm: 5,
    town_scroll: 3,
  };
  const startEquipment = {
    weapon: null, armor: null, helmet: null,
    gloves: null, boots: null, ring1: null,
    ring2: null, amulet: null, earring: null,
  };

  // Senjata ikut kelas
  switch(pendingJob) {
    case 'warrior':
      startEquipment.weapon = 'sword_iron';
      startEquipment.armor  = 'armor_leather';
      startEquipment.helmet = 'helm_iron';
      startEquipment.gloves = 'glove_leather';
      startEquipment.boots  = 'boot_cloth';
      startInventory['hpot_sm'] = 15;
      break;
    case 'rogue':
      startEquipment.weapon = 'dagger_basic';
      startEquipment.armor  = 'armor_leather';
      startEquipment.helmet = 'helm_iron';
      startEquipment.gloves = 'glove_leather';
      startEquipment.boots  = 'boot_speed';   // rogue dapat kasut laju
      startInventory['mpot_sm'] = 8;
      break;
    case 'magician':
      startEquipment.weapon = 'staff_oak';
      startEquipment.armor  = 'robe_silk';
      startEquipment.gloves = 'glove_leather';
      startEquipment.boots  = 'boot_cloth';
      startInventory['mpot_sm'] = 15;   // mage perlu banyak MP potion
      startInventory['mpot_md'] = 3;
      break;
    case 'priest':
      startEquipment.weapon = 'staff_oak';
      startEquipment.armor  = 'robe_silk';
      startEquipment.gloves = 'glove_leather';
      startEquipment.boots  = 'boot_cloth';
      startInventory['hpot_sm'] = 10;
      startInventory['mpot_sm'] = 10;
      break;
  }

  const c = {
    account_id: curAccount.uid, char_name: name,
    faction: pendingFaction, race: pendingRace, job: pendingJob,
    face_idx: pendingFaceIdx%icons.length,
    level:1, xp:0, gold:3000, best_wave:0, best_score:0,
    skill_pts:0, stat_pts:0,
    current_zone: 'moradon',   // ← SENTIASA mula di Moradon
    stat_str: race.base.str+(job.stats.str||0)+(pendingStats.str||0),
    stat_hp:  race.base.hp +(job.stats.hp ||0)+(pendingStats.hp ||0),
    stat_dex: race.base.dex+(job.stats.dex||0)+(pendingStats.dex||0),
    stat_int: race.base.int+(job.stats.int||0)+(pendingStats.int||0),
    stat_mp:  race.base.mp +(job.stats.mp ||0)+(pendingStats.mp ||0),
    inventory: JSON.stringify(startInventory),
    equipment: JSON.stringify(startEquipment),
    skill_tree: JSON.stringify({}),
  };

  if (!offlineMode && SB) {
    try {
      const { data: ex } = await SB.from('kn_players').select('id').eq('char_name', name).maybeSingle();
      if (ex) { E('ccStatus').textContent='Nama watak sudah digunakan!'; return; }
      const { data, error } = await SB.from('kn_players').insert(c).select().single();
      if (error) throw error;
      curChars.push(parseChar(data));
    } catch(e) { E('ccStatus').textContent='Ralat: '+e.message; return; }
  } else {
    c.id = 'local_'+Date.now();
    try { c.inventory  = typeof c.inventory  === 'string' ? JSON.parse(c.inventory  || '{}') : (c.inventory  || {}); } catch(e) { c.inventory  = {}; }
    try { c.equipment  = typeof c.equipment  === 'string' ? JSON.parse(c.equipment  || '{}') : (c.equipment  || {}); } catch(e) { c.equipment  = {}; }
    try { c.skill_tree = typeof c.skill_tree === 'string' ? JSON.parse(c.skill_tree || '{}') : (c.skill_tree || {}); } catch(e) { c.skill_tree = {}; }
    curChars.push(c);
  }
  hideAll(); sc('charSelectSc','on'); renderCharSlots(); selectCharSlot(curChars.length-1);
}

// ── SAVE / SUBMIT ─────────────────────────────────────
async function saveProgress() {
  if (!selChar) return;
  if (!offlineMode && SB) {
    try {
      await SB.from('kn_players').update({
        level:        selChar.level,
        xp:           selChar.xp,
        gold:         selChar.gold,
        best_wave:    selChar.best_wave  || 0,
        best_score:   selChar.best_score || 0,
        skill_pts:    selChar.skill_pts  || 0,
        stat_pts:     selChar.stat_pts   || 0,
        current_zone: selChar.current_zone || 'moradon',
        stat_str:     selChar.stat_str,
        stat_hp:      selChar.stat_hp,
        stat_dex:     selChar.stat_dex,
        stat_int:     selChar.stat_int,
        stat_mp:      selChar.stat_mp,
        inventory:    JSON.stringify(selChar.inventory  || {}),
        equipment:    JSON.stringify(selChar.equipment  || {}),
        skill_tree:   JSON.stringify(selChar.skill_tree || {}),
      }).eq('id', selChar.id);
      const si = E('saveind');
      if (si) { si.style.opacity='1'; setTimeout(()=>si.style.opacity='0', 2000); }
    } catch(e) { console.warn('Save error:', e); }
  }
}

async function submitScore(score, wave, lv) {
  if (offlineMode || !SB || !selChar) return;
  try {
    await SB.from('kn_leaderboard').insert({
      char_name:  selChar.char_name,
      account_id: curAccount.uid,
      faction:    selChar.faction,
      score, wave, level: lv
    });
  } catch(e) { console.warn('Score submit error:', e); }
}

// ── BOOT: semak session sedia ada ────────────────────
window.saveProgress = saveProgress;
window.addChat = typeof addChat !== 'undefined' ? addChat : null;

window.addEventListener('DOMContentLoaded', () => {
  // 1. Init Supabase
  initSB();

  // 2. Signal init.js
  if (typeof window._flush === 'function') window._flush();

  // 3. Game loop
  requestAnimationFrame(function loop(ts) {
    const dt = Math.min((ts-(window._lastT||0))/1000, .05);
    window._lastT = ts;
    if (typeof window.G !== 'undefined') { window.G.tick(dt); window.G.draw(); }
    requestAnimationFrame(loop);
  });

  // 4. Production boot — Supabase ada, cuba restore dulu
  if (SB && !offlineMode) {
    // Tunjuk loading, cuba restore session serentak
    startLoad();
    tryRestoreSession().catch(() => {});
  } else {
    // Offline/CDN fail — terus startLoad
    startLoad();
  }
});

// ── Alias untuk init.js ───────────────────────────────
window._doLogin        = doLogin;
window._doRegister     = doRegister;
window._cancelLogin    = cancelLogin;
window._skipConfig     = skipConfig;
window._selectFaction  = selectFaction;
window._confirmFaction = confirmFaction;
window._backToFaction  = backToFaction;
window._createCharacter= createCharacter;
window._enterWorld     = enterWorld;
window._deleteChar     = deleteChar;
window._addStat        = addStat;
window._cycleFace      = cycleFace;
window._doLogout       = doLogout;
window.renderCharSlots = renderCharSlots;
window.selectCharSlot  = selectCharSlot;
