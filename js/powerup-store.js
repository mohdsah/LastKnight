'use strict';
/* ═══════════════════════════════════════════════════════════════
   KO Classic — Power-Up Store System
   ▸ Point Store (beli item premium dengan point)
   ▸ Top-Up Manual (hantar bukti bayar → GM approve)
   ▸ Kod Top-Up (GM cipta kod → player masukkan)
   ▸ Costume / Skin system
   ▸ 100 Point = RM 10
   ═══════════════════════════════════════════════════════════════ */

// ── KADAR POINT ───────────────────────────────────────────────────
const POINT_RATE = { points: 100, rm: 10 }; // 100 Point = RM 10

// ── TOPUP PACKAGES ────────────────────────────────────────────────
const TOPUP_PACKAGES = [
  { id:'tp_100',  points:100,  rm:10,  bonus:0,    label:'Starter',   icon:'💎' },
  { id:'tp_300',  points:300,  rm:30,  bonus:30,   label:'Popular',   icon:'💎💎', tag:'HOT' },
  { id:'tp_500',  points:500,  rm:50,  bonus:75,   label:'Value',     icon:'💎💎💎' },
  { id:'tp_1000', points:1000, rm:100, bonus:200,  label:'Premium',   icon:'👑', tag:'BEST VALUE' },
  { id:'tp_3000', points:3000, rm:300, bonus:900,  label:'Ultimate',  icon:'🌟', tag:'VIP' },
];

// ── POWER-UP STORE ITEMS ──────────────────────────────────────────
const PSTORE_ITEMS = {
  // ── Weapons Premium ──
  weapon: [
    {
      id:'ps_sword_legend',    name:'⚡ Pedang Legenda',   icon:'⚡',
      type:'item',             itemId:'sword_legend',
      points:500,              rarity:'legendary',
      desc:'Pedang terkuat di dunia. ATK +85. Drop rate sangat rendah.',
    },
    {
      id:'ps_dagger_shadow',   name:'🌑 Belati Bayang',    icon:'🌑',
      type:'item',             itemId:'dagger_shadow',
      points:350,              rarity:'rare',
      desc:'Belati Rogue terbaik. ATK +48, Crit +20%.',
    },
    {
      id:'ps_staff_divine',    name:'✨ Tongkat Suci',     icon:'✨',
      type:'item',             itemId:'staff_divine',
      points:350,              rarity:'rare',
      desc:'Tongkat Priest sempurna. INT +58, Holy DMG +30%.',
    },
    {
      id:'ps_staff_chaos',     name:'💥 Tongkat Kekacauan',icon:'💥',
      type:'item',             itemId:'staff_chaos',
      points:350,              rarity:'rare',
      desc:'Tongkat Mage dahsyat. INT +60, Sihir DMG +25%.',
    },
  ],

  // ── Armor Premium ──
  armor: [
    {
      id:'ps_armor_plate',     name:'⚙️ Armor Pelat',     icon:'⚙️',
      type:'item',             itemId:'armor_plate',
      points:400,              rarity:'rare',
      desc:'Armor terkuat Warrior. DEF +40.',
    },
    {
      id:'ps_robe_arcane',     name:'🎭 Jubah Arkan',      icon:'🎭',
      type:'item',             itemId:'robe_arcane',
      points:380,              rarity:'rare',
      desc:'Jubah Mage/Priest terbaik. DEF +14, MP +60.',
    },
    {
      id:'ps_ring_ruby',       name:'❤️ Cincin Rubi',      icon:'❤️',
      type:'item',             itemId:'ring_ruby',
      points:450,              rarity:'rare',
      desc:'Cincin berkuasa. STR +20, HP +50.',
    },
    {
      id:'ps_amulet_power',    name:'🔮 Amulet Kuasa',     icon:'🔮',
      type:'item',             itemId:'amulet_power',
      points:500,              rarity:'rare',
      desc:'Amulet paling kuat. STR +15, INT +15.',
    },
  ],

  // ── Enhancement Stones ──
  enhance: [
    {
      id:'ps_star_5',          name:'⭐ Star Stone ×5',    icon:'⭐',
      type:'multi_item',       itemId:'star_stone',        qty:5,
      points:200,              rarity:'rare',
      desc:'5× Star Stone — Safe Enhancement tanpa risiko hancur.',
    },
    {
      id:'ps_star_20',         name:'⭐ Star Stone ×20',   icon:'⭐',
      type:'multi_item',       itemId:'star_stone',        qty:20,
      points:700,              rarity:'rare',
      desc:'20× Star Stone. Nilai terbaik untuk upgrade selamat.',
      tag:'BEST BUY',
    },
    {
      id:'ps_chaos_10',        name:'💠 Chaos Stone ×10',  icon:'💠',
      type:'multi_item',       itemId:'chaos_stone',       qty:10,
      points:150,              rarity:'uncommon',
      desc:'10× Chaos Stone untuk Enhancement & Reversal.',
    },
    {
      id:'ps_chaos_50',        name:'💠 Chaos Stone ×50',  icon:'💠',
      type:'multi_item',       itemId:'chaos_stone',       qty:50,
      points:600,              rarity:'uncommon',
      desc:'50× Chaos Stone. Stok penuh untuk Reversal.',
      tag:'VALUE',
    },
    {
      id:'ps_luna_100',        name:'🌙 Luna Stone ×100',  icon:'🌙',
      type:'multi_item',       itemId:'luna_stone',        qty:100,
      points:100,              rarity:'common',
      desc:'100× Luna Stone untuk Enhancement biasa.',
    },
  ],

  // ── Buff Scrolls ──
  buff: [
    {
      id:'ps_buff_exp2',       name:'📜 Scroll EXP ×2',   icon:'📜',
      type:'buff_scroll',      buffType:'exp',             multiplier:2.0,  dur:3600,
      points:150,              rarity:'uncommon',
      desc:'EXP Double selama 1 jam. Sesuai untuk grind level!',
    },
    {
      id:'ps_buff_exp3',       name:'📜 Scroll EXP ×3',   icon:'🌟',
      type:'buff_scroll',      buffType:'exp',             multiplier:3.0,  dur:3600,
      points:400,              rarity:'rare',
      desc:'EXP Triple selama 1 jam. Power leveling!',
      tag:'HOT',
    },
    {
      id:'ps_buff_drop2',      name:'🎁 Scroll Drop ×2',  icon:'🎁',
      type:'buff_scroll',      buffType:'drop',            multiplier:2.0,  dur:3600,
      points:200,              rarity:'uncommon',
      desc:'Drop Rate Double 1 jam. Lebih banyak item dari monster!',
    },
    {
      id:'ps_buff_gold2',      name:'💰 Scroll Gold ×2',  icon:'💰',
      type:'buff_scroll',      buffType:'gold',            multiplier:2.0,  dur:1800,
      points:100,              rarity:'common',
      desc:'Gold Drop Double selama 30 minit.',
    },
    {
      id:'ps_buff_combo',      name:'🌈 Scroll Kombo',    icon:'🌈',
      type:'buff_scroll',      buffType:'combo',           multiplier:2.0,  dur:1800,
      points:350,              rarity:'rare',
      desc:'EXP ×2 + Drop ×2 + Gold ×2 selama 30 minit!',
      tag:'BEST',
    },
  ],

  // ── Costumes / Skins ──
  costume: [
    {
      id:'ps_costume_knight',  name:'🏅 Pakaian Ksatria',  icon:'🏅',
      type:'costume',          costumeId:'knight_gold',
      points:800,              rarity:'epic',
      desc:'Pakaian Ksatria Emas mewah. Tunjuk status anda!',
      colors: { body:'#c9a84c', accent:'#fff8d0' },
    },
    {
      id:'ps_costume_shadow',  name:'🌑 Pakaian Bayang',   icon:'🌑',
      type:'costume',          costumeId:'shadow_dark',
      points:800,              rarity:'epic',
      desc:'Pakaian serba hitam misteri. Musuh tidak nampak kamu!',
      colors: { body:'#1a1a2a', accent:'#6644aa' },
    },
    {
      id:'ps_costume_flame',   name:'🔥 Pakaian Api',      icon:'🔥',
      type:'costume',          costumeId:'flame_red',
      points:800,              rarity:'epic',
      desc:'Pakaian berapi. Nampak seperti Berserker sejati!',
      colors: { body:'#8a1010', accent:'#ff4400' },
    },
    {
      id:'ps_costume_holy',    name:'✨ Pakaian Suci',      icon:'✨',
      type:'costume',          costumeId:'holy_white',
      points:800,              rarity:'epic',
      desc:'Pakaian cahaya suci. Aura El Morad memancar!',
      colors: { body:'#e8e0d0', accent:'#ffffaa' },
    },
    {
      id:'ps_costume_vip',     name:'👑 Pakaian VIP',      icon:'👑',
      type:'costume',          costumeId:'vip_royal',
      points:2000,             rarity:'legendary',
      desc:'Pakaian eksklusif VIP. Terhad! Tunjuk kemewahan anda.',
      colors: { body:'#2a0a5a', accent:'#ffd700' },
      tag:'EKSKLUSIF',
    },
  ],
};

// ── BUFF TRACKER untuk Premium Scroll ────────────────────────────
const premiumBuffs = {
  exp:  { active: false, multiplier: 1.0, remaining: 0 },
  drop: { active: false, multiplier: 1.0, remaining: 0 },
  gold: { active: false, multiplier: 1.0, remaining: 0 },
};

function tickPremiumBuffs(dt) {
  let changed = false;
  for (const [key, buff] of Object.entries(premiumBuffs)) {
    if (!buff.active) continue;
    buff.remaining -= dt;
    if (buff.remaining <= 0) {
      buff.active = false; buff.multiplier = 1.0; buff.remaining = 0;
      changed = true;
      addChat('', `⏱️ Premium Buff ${key.toUpperCase()} tamat.`, 'system');
    }
  }
  if (changed) updatePremiumBuffHUD();
}

function updatePremiumBuffHUD() {
  const el = document.getElementById('premiumBuffBar'); if (!el) return;
  const active = Object.entries(premiumBuffs).filter(([,b]) => b.active);
  if (!active.length) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  el.innerHTML = active.map(([key, b]) => {
    const icons = { exp:'📜', drop:'🎁', gold:'💰' };
    const m = Math.floor(b.remaining/60), s = Math.floor(b.remaining%60);
    return `<div class="inn-buff-chip" style="border-color:rgba(170,68,255,.4)">
      ${icons[key]||'✦'} ×${b.multiplier.toFixed(1)} <span>${m}:${s.toString().padStart(2,'0')}</span>
    </div>`;
  }).join('');
}

// ── OPEN POWER-UP STORE ───────────────────────────────────────────
function openPowerUpStore() {
  const panel = document.getElementById('pstorePanel');
  if (!panel) return;
  panel.classList.remove('off');
  renderPStore('weapon');
  updatePStoreHeader();
  if (typeof Audio !== 'undefined') Audio.playSFX('npc_talk');
}

function updatePStoreHeader() {
  const pts = window.selChar?.points || 0;
  const el  = document.getElementById('pstorePoints');
  if (el) el.textContent = pts.toLocaleString();
}

const PSTORE_CATS = {
  weapon:  '⚔️ Senjata',
  armor:   '🛡️ Armor',
  enhance: '⭐ Enhancement',
  buff:    '📜 Buff Scroll',
  costume: '👑 Costume',
};

function renderPStore(cat) {
  // Update active tab
  document.querySelectorAll('.pstore-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.cat === cat)
  );
  const body  = document.getElementById('pstoreBody'); if (!body) return;
  const items = PSTORE_ITEMS[cat] || [];
  const pts   = window.selChar?.points || 0;

  let html = '';
  items.forEach(item => {
    const canBuy  = pts >= item.points;
    const rcol    = { common:'#aaa', uncommon:'#40c840', rare:'#4488ff', epic:'#aa44ff', legendary:'#ff8800' }[item.rarity] || '#aaa';

    html += `
    <div class="pstore-card" style="border-color:${canBuy?'rgba(201,168,76,.2)':'rgba(255,255,255,.05)'}">
      ${item.tag ? `<div class="pstore-tag">${item.tag}</div>` : ''}
      <div class="pstore-icon">${item.icon}</div>
      <div class="pstore-info">
        <div class="pstore-name" style="color:${rcol}">${item.name}</div>
        <div class="pstore-rarity" style="color:${rcol}">${item.rarity.toUpperCase()}</div>
        <div class="pstore-desc">${item.desc}</div>
      </div>
      <div class="pstore-buy">
        <div class="pstore-price">💎 ${item.points.toLocaleString()}</div>
        <button class="btn ${canBuy?'btn-gold':'btn-dim'} btn-xs pstore-btn"
          onclick="buyPStoreItem('${item.id}')"
          ${canBuy?'':'disabled'}
          style="${canBuy?'':'opacity:.4;cursor:not-allowed'}">
          ${canBuy?'Beli':'Tidak cukup'}
        </button>
      </div>
    </div>`;
  });

  if (!html) html = `<div style="text-align:center;color:var(--muted);padding:30px;font-size:.75rem">Tiada item dalam kategori ini.</div>`;
  body.innerHTML = html;
}

async function buyPStoreItem(itemId) {
  const cat  = Object.keys(PSTORE_ITEMS).find(c => PSTORE_ITEMS[c].find(i => i.id === itemId));
  const item = PSTORE_ITEMS[cat]?.find(i => i.id === itemId);
  if (!item || !window.selChar) return;

  const pts = window.selChar.points || 0;
  if (pts < item.points) { showPStoreMsg('💎 Point tidak cukup!', 'err'); return; }

  // Tolak point
  window.selChar.points = pts - item.points;

  // Apply item
  if (item.type === 'item') {
    if (!window.selChar.inventory) window.selChar.inventory = {};
    const copyId = item.itemId + '_ps_' + Date.now();
    window.ITEM_DB[copyId] = { ...ITEM_DB[item.itemId], enh: 0 };
    window.selChar.inventory[copyId] = 1;
    addChat('', `💎 ${item.name} diterima dalam inventori!`, 'system');

  } else if (item.type === 'multi_item') {
    if (!window.selChar.inventory) window.selChar.inventory = {};
    window.selChar.inventory[item.itemId] = (window.selChar.inventory[item.itemId] || 0) + item.qty;
    addChat('', `💎 ${item.qty}× ${window.ITEM_DB[item.itemId]?.name || item.itemId} diterima!`, 'system');

  } else if (item.type === 'buff_scroll') {
    applyPremiumBuff(item);
    addChat('', `📜 ${item.name} aktif! Duration: ${item.dur/60} minit`, 'system');

  } else if (item.type === 'costume') {
    if (!window.selChar.costumes) window.selChar.costumes = [];
    if (!window.selChar.costumes.includes(item.costumeId)) window.selChar.costumes.push(item.costumeId);
    addChat('', `👑 Costume ${item.name} diterima! Pakai di menu Costume.`, 'system');
  }

  if (typeof Audio !== 'undefined') Audio.playSFX('raredrop');
  updatePStoreHeader();
  renderPStore(cat);

  // Rekod dalam DB
  try {
    await logPointTransaction('purchase', -item.points, item.name);
    window.saveProgress?.();
    showPStoreMsg(`✅ ${item.name} berjaya dibeli!`, 'ok');
  } catch(e) {
    console.warn('[PStore] DB log error:', e.message);
    showPStoreMsg(`✅ ${item.name} diterima (offline)`, 'ok');
  }
}

function applyPremiumBuff(item) {
  if (item.buffType === 'combo') {
    premiumBuffs.exp  = { active:true, multiplier:item.multiplier, remaining:item.dur };
    premiumBuffs.drop = { active:true, multiplier:item.multiplier, remaining:item.dur };
    premiumBuffs.gold = { active:true, multiplier:item.multiplier, remaining:item.dur };
  } else {
    premiumBuffs[item.buffType] = { active:true, multiplier:item.multiplier, remaining:item.dur };
  }
  updatePremiumBuffHUD();
}

function showPStoreMsg(msg, type) {
  const el = document.getElementById('pstoreMsg'); if (!el) return;
  el.textContent = msg;
  el.style.color = type === 'err' ? '#e84040' : '#40c840';
  setTimeout(() => { if (el) el.textContent = ''; }, 3000);
}

// ── TOPUP PANEL ───────────────────────────────────────────────────
function openTopUp() {
  const panel = document.getElementById('topupPanel');
  if (!panel) return;
  panel.classList.remove('off');
  renderTopUp();
}

function renderTopUp() {
  const body = document.getElementById('topupBody'); if (!body) return;
  const pts  = window.selChar?.points || 0;

  let html = `
  <!-- Point Balance -->
  <div style="background:linear-gradient(135deg,rgba(170,68,255,.15),rgba(68,68,255,.08));
    border:1px solid rgba(170,68,255,.3);border-radius:6px;padding:12px;
    text-align:center;margin-bottom:14px">
    <div style="font-family:'Cinzel',serif;font-size:.65rem;color:var(--muted);letter-spacing:.12em">BAKI POINT ANDA</div>
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.8rem;color:#aa44ff;
      text-shadow:0 0 20px rgba(170,68,255,.4);margin:4px 0">💎 ${pts.toLocaleString()}</div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:var(--muted)">
      ≈ RM ${((pts/100)*10).toFixed(2)}
    </div>
  </div>

  <!-- Tabs -->
  <div class="ov-tabs" id="topupTabs" style="margin-bottom:12px">
    <div class="ov-tab active" onclick="switchTopUpTab('packages')">💎 Pakej</div>
    <div class="ov-tab" onclick="switchTopUpTab('code')">🎟️ Kod Top-Up</div>
    <div class="ov-tab" onclick="switchTopUpTab('manual')">📱 Manual</div>
    <div class="ov-tab" onclick="switchTopUpTab('history')">📋 Sejarah</div>
  </div>

  <div id="topupTabContent"></div>
  <div class="status-msg" id="topupStatus" style="margin-top:8px"></div>`;

  body.innerHTML = html;
  switchTopUpTab('packages');
}

function switchTopUpTab(tab) {
  document.querySelectorAll('#topupTabs .ov-tab').forEach((el,i) => {
    el.classList.toggle('active', ['packages','code','manual','history'][i] === tab);
  });
  const content = document.getElementById('topupTabContent'); if (!content) return;

  if      (tab === 'packages') renderTopUpPackages(content);
  else if (tab === 'code')     renderTopUpCode(content);
  else if (tab === 'manual')   renderTopUpManual(content);
  else if (tab === 'history')  renderTopUpHistory(content);
}

function renderTopUpPackages(container) {
  let html = `<div style="font-family:'Cinzel',serif;font-size:.62rem;color:var(--muted);
    letter-spacing:.1em;margin-bottom:8px">PILIH PAKEJ TOP-UP:</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">`;

  TOPUP_PACKAGES.forEach(pkg => {
    const total = pkg.points + pkg.bonus;
    html += `
    <div style="background:rgba(0,0,0,.4);border:1px solid rgba(170,68,255,.2);
      border-radius:6px;padding:10px;text-align:center;position:relative;cursor:pointer;
      transition:all .2s" onmouseover="this.style.borderColor='rgba(170,68,255,.5)'"
      onmouseout="this.style.borderColor='rgba(170,68,255,.2)'"
      onclick="selectTopUpPackage('${pkg.id}')">
      ${pkg.tag ? `<div class="pstore-tag" style="background:rgba(170,68,255,.8)">${pkg.tag}</div>` : ''}
      <div style="font-size:1.4rem">${pkg.icon}</div>
      <div style="font-family:'Cinzel',serif;font-size:.72rem;color:#aa44ff;margin-top:3px">${pkg.label}</div>
      <div style="font-family:'Cinzel Decorative',serif;font-size:1.1rem;color:var(--gold);margin:3px 0">
        💎 ${pkg.points.toLocaleString()}
      </div>
      ${pkg.bonus > 0 ? `<div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:#40c840">+${pkg.bonus} BONUS</div>` : ''}
      <div style="font-family:'Cinzel',serif;font-size:.75rem;color:var(--parch);
        margin-top:5px;padding:4px;background:rgba(201,168,76,.1);border-radius:3px">
        RM ${pkg.rm}.00
      </div>
      ${total !== pkg.points ? `<div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:#40c840;margin-top:2px">Jumlah: ${total} point</div>` : ''}
    </div>`;
  });

  html += `</div>
  <div id="selectedPackageInfo" style="margin-top:10px"></div>`;
  container.innerHTML = html;
}

let selectedPkg = null;
function selectTopUpPackage(pkgId) {
  selectedPkg = TOPUP_PACKAGES.find(p => p.id === pkgId);
  const el = document.getElementById('selectedPackageInfo'); if (!el) return;
  const pkg = selectedPkg;
  const total = pkg.points + pkg.bonus;
  el.innerHTML = `
  <div style="background:rgba(170,68,255,.1);border:1px solid rgba(170,68,255,.3);
    border-radius:5px;padding:10px;text-align:center">
    <div style="font-family:'Cinzel',serif;font-size:.72rem;color:#aa44ff;margin-bottom:4px">
      Pilihan: ${pkg.icon} ${pkg.label} — RM ${pkg.rm}.00
    </div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--gold)">
      💎 ${pkg.points} + 🎁 ${pkg.bonus} Bonus = ${total} Point
    </div>
    <div style="margin-top:8px;display:flex;gap:6px">
      <button class="btn btn-blue btn-sm" style="flex:1" onclick="proceedTopUp('manual')">📱 Bayar Manual</button>
    </div>
  </div>`;
}

function proceedTopUp(method) {
  if (!selectedPkg) return;
  switchTopUpTab(method);
  setTimeout(() => {
    const amtEl = document.getElementById('manualAmount');
    if (amtEl) amtEl.value = selectedPkg.rm;
    const pkgEl = document.getElementById('manualPackageId');
    if (pkgEl) pkgEl.value = selectedPkg.id;
  }, 100);
}

function renderTopUpCode(container) {
  container.innerHTML = `
  <div style="text-align:center;padding:10px 0">
    <div style="font-size:2.5rem">🎟️</div>
    <div style="font-family:'Cinzel',serif;font-size:.82rem;color:var(--gold);margin:6px 0">Masukkan Kod Top-Up</div>
    <div style="font-family:'Crimson Text',serif;font-size:.75rem;color:var(--muted);margin-bottom:14px">
      Dapatkan kod dari admin atau acara dalam game
    </div>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:8px">
    <input class="gm-inp" id="topupCodeInput" placeholder="Contoh: TOPUP-XXXX-XXXX"
      style="flex:1;font-size:.85rem;letter-spacing:.12em;text-transform:uppercase"
      oninput="this.value=this.value.toUpperCase()" maxlength="20">
    <button class="btn btn-gold btn-sm" onclick="redeemCode()" style="flex:0 0 auto">Guna</button>
  </div>
  <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:var(--muted);
    text-align:center;margin-top:8px">
    Setiap kod hanya boleh digunakan sekali
  </div>`;
}

async function redeemCode() {
  const code = document.getElementById('topupCodeInput')?.value.trim().toUpperCase();
  if (!code || code.length < 6) { setTopUpStatus('Masukkan kod yang sah!', 'err'); return; }

  setTopUpStatus('Menyemak kod...', 'info');
  if (!SB || window.offlineMode) { setTopUpStatus('Perlu sambungan internet!', 'err'); return; }

  try {
    // Semak kod dalam DB
    const { data, error } = await SB.from('kn_topup_codes')
      .select('*').eq('code', code).eq('used', false).maybeSingle();

    if (error) throw error;
    if (!data) { setTopUpStatus('❌ Kod tidak sah atau sudah digunakan!', 'err'); return; }

    // Guna kod
    await SB.from('kn_topup_codes').update({
      used: true,
      used_by: window.selChar?.char_name,
      used_at: new Date().toISOString()
    }).eq('id', data.id);

    // Beri point
    const pts = data.points || 0;
    window.selChar.points = (window.selChar.points || 0) + pts;
    await window.saveProgress?.();
    await logPointTransaction('topup_code', pts, `Kod: ${code}`);

    setTopUpStatus(`✅ Berjaya! +${pts} Point diterima!`, 'ok');
    if (typeof Audio !== 'undefined') Audio.playSFX('raredrop');
    updatePStoreHeader();
    renderTopUp();
    addChat('', `💎 ${window.selChar.char_name} telah menambah ${pts} Point melalui kod!`, 'system');

  } catch(e) {
    setTopUpStatus('Ralat: ' + e.message, 'err');
  }
}

function renderTopUpManual(container) {
  container.innerHTML = `
  <div style="background:rgba(255,140,0,.08);border:1px solid rgba(255,140,0,.2);
    border-radius:4px;padding:10px;margin-bottom:12px;font-family:'Crimson Text',serif;font-size:.75rem;color:var(--parch)">
    📌 <b>Cara Top-Up Manual:</b><br>
    1. Hantar bayaran ke akaun di bawah<br>
    2. Isi borang dengan maklumat pembayaran<br>
    3. GM akan approve dalam 24 jam<br>
    4. Point akan dikreditkan secara automatik
  </div>

  <!-- Bank Details -->
  <div style="background:rgba(0,0,0,.4);border:1px solid rgba(201,168,76,.2);
    border-radius:5px;padding:10px;margin-bottom:12px">
    <div style="font-family:'Cinzel',serif;font-size:.68rem;color:var(--gold);margin-bottom:6px;letter-spacing:.1em">
      💳 MAKLUMAT AKAUN BANK
    </div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:.7rem;line-height:1.8">
      <div>Bank: <span style="color:var(--gold)">Maybank</span></div>
      <div>Nama: <span style="color:var(--gold)">Pahlawan Terakhir Sdn Bhd</span></div>
      <div>No Akaun: <span style="color:var(--gold);letter-spacing:.15em">1234 5678 9012</span></div>
      <div style="margin-top:6px;font-size:.62rem;color:var(--muted)">TNG / DuitNow juga diterima: 012-3456789</div>
    </div>
  </div>

  <!-- Form -->
  <div style="display:flex;flex-direction:column;gap:8px">
    <input type="hidden" id="manualPackageId">
    <div>
      <div class="inp-label" style="font-family:Cinzel,serif;font-size:.58rem;color:var(--muted);letter-spacing:.1em;margin-bottom:3px">NAMA PENUH</div>
      <input class="gm-inp" id="manualName" placeholder="Nama penuh anda..." style="font-size:.8rem">
    </div>
    <div>
      <div class="inp-label" style="font-family:Cinzel,serif;font-size:.58rem;color:var(--muted);letter-spacing:.1em;margin-bottom:3px">AMAUN (RM)</div>
      <input type="number" class="gm-inp" id="manualAmount" placeholder="10.00" min="10" step="10" style="font-size:.8rem">
    </div>
    <div>
      <div class="inp-label" style="font-family:Cinzel,serif;font-size:.58rem;color:var(--muted);letter-spacing:.1em;margin-bottom:3px">NO RUJUKAN / RESIT</div>
      <input class="gm-inp" id="manualRef" placeholder="Contoh: TXN123456789..." style="font-size:.8rem">
    </div>
    <div>
      <div class="inp-label" style="font-family:Cinzel,serif;font-size:.58rem;color:var(--muted);letter-spacing:.1em;margin-bottom:3px">NO TELEFON</div>
      <input class="gm-inp" id="manualPhone" placeholder="01X-XXXXXXX" style="font-size:.8rem">
    </div>
    <button class="btn btn-gold" onclick="submitManualTopUp()" style="padding:10px;font-size:.72rem">
      📤 Hantar Permohonan
    </button>
  </div>`;
}

async function submitManualTopUp() {
  const name  = document.getElementById('manualName')?.value.trim();
  const amt   = parseFloat(document.getElementById('manualAmount')?.value || 0);
  const ref   = document.getElementById('manualRef')?.value.trim();
  const phone = document.getElementById('manualPhone')?.value.trim();
  const pkgId = document.getElementById('manualPackageId')?.value || '';

  if (!name)  { setTopUpStatus('Masukkan nama penuh!', 'err'); return; }
  if (amt < 10) { setTopUpStatus('Amaun minimum RM 10!', 'err'); return; }
  if (!ref)   { setTopUpStatus('Masukkan no rujukan!', 'err'); return; }
  if (!phone) { setTopUpStatus('Masukkan no telefon!', 'err'); return; }

  // Kira point yang akan diterima
  const pkg     = TOPUP_PACKAGES.find(p => p.id === pkgId) || TOPUP_PACKAGES.find(p => p.rm === amt);
  const points  = pkg ? pkg.points + pkg.bonus : Math.floor(amt * 10); // 10 pts per RM 1

  setTopUpStatus('Menghantar permohonan...', 'info');

  if (!SB || window.offlineMode) {
    setTopUpStatus('Perlu sambungan internet untuk hantar permohonan!', 'err'); return;
  }

  try {
    await SB.from('kn_topup_requests').insert({
      char_name:  window.selChar?.char_name,
      account_id: window.curAccount?.uid,
      full_name:  name,
      amount_rm:  amt,
      ref_no:     ref,
      phone,
      points_req: points,
      status:     'pending',
      pkg_id:     pkgId || null,
      created_at: new Date().toISOString(),
    });

    setTopUpStatus(`✅ Permohonan berjaya dihantar! +${points} Point akan dikreditkan selepas GM mengesahkan.`, 'ok');
    addChat('', `📱 Permohonan top-up RM${amt} telah dihantar. Menunggu kelulusan GM.`, 'system');

    // Clear form
    ['manualName','manualAmount','manualRef','manualPhone'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });

  } catch(e) {
    setTopUpStatus('Ralat: ' + e.message, 'err');
  }
}

async function renderTopUpHistory(container) {
  let html = `<div style="font-family:'Cinzel',serif;font-size:.65rem;color:var(--muted);margin-bottom:8px">SEJARAH TRANSAKSI:</div>`;

  if (!SB || window.offlineMode) {
    html += `<div style="color:var(--muted);font-size:.7rem;text-align:center;padding:20px">Perlu sambungan internet</div>`;
    container.innerHTML = html; return;
  }

  try {
    const { data } = await SB.from('kn_point_log')
      .select('*')
      .eq('char_name', window.selChar?.char_name)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!data?.length) {
      html += `<div style="color:var(--muted);font-size:.7rem;text-align:center;padding:20px">Tiada transaksi lagi</div>`;
    } else {
      html += `<div style="display:flex;flex-direction:column;gap:4px">`;
      data.forEach(tx => {
        const date  = new Date(tx.created_at).toLocaleDateString('ms-MY');
        const isPos = tx.points > 0;
        html += `<div style="background:rgba(0,0,0,.3);border-radius:4px;padding:7px 10px;
          border-left:3px solid ${isPos?'rgba(64,200,64,.5)':'rgba(232,64,64,.5)'};
          display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-family:'Cinzel',serif;font-size:.68rem;color:var(--parch)">${tx.description||'-'}</div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--muted)">${date}</div>
          </div>
          <div style="font-family:'Cinzel Decorative',serif;font-size:.82rem;
            color:${isPos?'#40c840':'#e84040'};font-weight:bold">
            ${isPos?'+':''}${tx.points}
          </div>
        </div>`;
      });
      html += `</div>`;
    }
  } catch(e) {
    html += `<div style="color:#e84040;font-size:.7rem;padding:10px">Ralat: ${e.message}</div>`;
  }

  container.innerHTML = html;
}

function setTopUpStatus(msg, type) {
  const el = document.getElementById('topupStatus'); if (!el) return;
  el.textContent = msg;
  el.style.color = type === 'err' ? '#e84040' : type === 'ok' ? '#40c840' : '#ffcc44';
  if (type !== 'info') setTimeout(() => { if (el) el.textContent = ''; }, 4000);
}

// ── LOG TRANSAKSI ─────────────────────────────────────────────────
async function logPointTransaction(type, pts, desc) {
  if (!SB || window.offlineMode || !window.selChar) return;
  try {
    await SB.from('kn_point_log').insert({
      char_name:   window.selChar.char_name,
      account_id:  window.curAccount?.uid,
      type,
      points:      pts,
      description: desc,
      balance:     window.selChar.points || 0,
      created_at:  new Date().toISOString(),
    });
  } catch(e) { console.warn('Log error:', e); }
}

// ── COSTUME SYSTEM ────────────────────────────────────────────────
function openCostumePanel() {
  const p = document.getElementById('costumePanel');
  if (!p) return;
  p.classList.remove('off');
  renderCostumePanel();
}

function renderCostumePanel() {
  const body = document.getElementById('costumeBody'); if (!body) return;
  const owned   = window.selChar?.costumes || [];
  const current = window.selChar?.active_costume || null;
  const costumes = PSTORE_ITEMS.costume;

  let html = `<div style="font-family:'Cinzel',serif;font-size:.65rem;color:var(--muted);
    letter-spacing:.1em;margin-bottom:10px">COSTUME YANG DIMILIKI:</div>`;

  if (!owned.length) {
    html += `<div style="text-align:center;padding:20px;color:var(--muted);font-size:.75rem">
      Tiada costume. Beli di Power-Up Store!</div>`;
  } else {
    html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">`;
    costumes.filter(c => owned.includes(c.costumeId)).forEach(c => {
      const isActive = current === c.costumeId;
      html += `<div style="background:rgba(0,0,0,.4);border:1px solid rgba(${isActive?'255,215,0':'170,68,255'},.3);
        border-radius:5px;padding:10px;text-align:center;cursor:pointer"
        onclick="equipCostume('${c.costumeId}')">
        <div style="font-size:2rem">${c.icon}</div>
        <div style="font-family:'Cinzel',serif;font-size:.68rem;color:#aa44ff;margin-top:3px">${c.name}</div>
        ${isActive
          ? `<div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:#ffd700;margin-top:3px">✓ AKTIF</div>`
          : `<button class="btn btn-blue btn-xs" style="margin-top:5px;width:100%">Pakai</button>`
        }
      </div>`;
    });
    html += `</div>`;

    if (current) {
      html += `<div style="margin-top:10px;text-align:center">
        <button class="btn btn-dim btn-xs" onclick="equipCostume(null)">Tanggalkan Costume</button>
      </div>`;
    }
  }

  body.innerHTML = html;
}

function equipCostume(costumeId) {
  if (!window.selChar) return;
  window.selChar.active_costume = costumeId;
  if (window.G?.pl) window.G.pl.activeCostume = costumeId ? PSTORE_ITEMS.costume.find(c=>c.costumeId===costumeId) : null;
  window.saveProgress?.();
  renderCostumePanel();
  addChat('', costumeId ? `👑 Costume dipakai!` : '👕 Costume ditanggalkan.', 'system');
}

// ── HOOK ke game ticker ───────────────────────────────────────────
// farmingTick hook — deferred
function _hookPSFarmingTick() {
  if (typeof farmingTick !== 'function') { setTimeout(_hookPSFarmingTick, 200); return; }
  const _orig = farmingTick;
  farmingTick = function(dt) { _orig(dt); tickPremiumBuffs(dt); };
  window.farmingTick = farmingTick;
}
setTimeout(_hookPSFarmingTick, 500);

// ── HOOK EXP multiplier (dipasang lewat untuk pastikan gainExp wujud) ──
window._psExpMultiplierReady = false;
function _hookPSExpMultiplier() {
  if (typeof gainExp !== 'function') { setTimeout(_hookPSExpMultiplier, 100); return; }
  const _orig = gainExp;
  gainExp = function(amount) {
    const mul = premiumBuffs.exp.active ? premiumBuffs.exp.multiplier : 1.0;
    _orig(Math.floor(amount * mul));
  };
  window._psExpMultiplierReady = true;
}
setTimeout(_hookPSExpMultiplier, 500); // Tunggu farming.js define gainExp

// Gold multiplier handled in farming.js reward loop

// ── SAVE + LOAD hooks — deferred ─────────────────────────────────
function _hookPSSave() {
  if (typeof saveProgress !== 'function')     { setTimeout(_hookPSSave, 300); return; }
  if (typeof restoreMasterData !== 'function') { setTimeout(_hookPSSave, 300); return; }

  const _origSaveProgressPS = saveProgress;
  saveProgress = window.saveProgress = async function() {
    if (window.selChar) {
      if (!window.selChar.skill_tree) window.selChar.skill_tree = {};
      window.selChar.skill_tree['_points']         = window.selChar.points || 0;
      window.selChar.skill_tree['_active_costume'] = window.selChar.active_costume || '';
      window.selChar.skill_tree['_costumes']       = JSON.stringify(window.selChar.costumes || []);
    }
    await _origSaveProgressPS();
  };

  const _origRestoreMaster = restoreMasterData;
  restoreMasterData = window.restoreMasterData = function(ch) {
    _origRestoreMaster(ch);
    if (ch.skill_tree) {
      ch.points         = ch.skill_tree['_points'] || 0;
      ch.active_costume = ch.skill_tree['_active_costume'] || null;
      try { ch.costumes = JSON.parse(ch.skill_tree['_costumes'] || '[]'); } catch { ch.costumes = []; }
    }
    return ch;
};

// ── Exports ──
window.openPowerUpStore = openPowerUpStore;
