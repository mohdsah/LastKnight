'use strict';
/* ═══════════════════════════════════════════════════════════════════
   KO Classic — PvP, Market, Guild, Quest, Castle Siege
   ═══════════════════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════════════════
// 1. PvP SYSTEM — Kill/Death/Wanted/PK Points
// ══════════════════════════════════════════════════════════════════
const PVP = {
  kills:       0,
  deaths:      0,
  pkPoints:    0,   // naik bila bunuh, turun bila mati
  wantedLevel: 0,   // 0=biasa 1=mencurigakan 2=penjenayah 3=WANTED
  killStreak:  0,
  bestStreak:  0,
  lastKillTime:0,

  WANTED_THRESHOLDS: [0, 5, 15, 30],
  WANTED_LABELS:     ['Biasa','⚠️ Mencurigakan','🔴 Penjenayah','💀 WANTED'],
  WANTED_COLORS:     ['#aaa','#ffcc44','#ff8800','#e84040'],

  addKill(targetName, targetFac) {
    this.kills++;
    this.pkPoints += 3;
    this.killStreak++;
    if (this.killStreak > this.bestStreak) this.bestStreak = this.killStreak;
    this.lastKillTime = Date.now();
    this.updateWanted();
    this.updateHUD();
    // Kill streak notif
    if (this.killStreak >= 3) {
      const streakMsg = this.killStreak >= 10 ? '💀 GODLIKE! '+this.killStreak+' kills!'
        : this.killStreak >= 5 ? '🔥 RAMPAGE! '+this.killStreak+' kills!'
        : '⚡ '+this.killStreak+' Kill Streak!';
      showWvNotif(streakMsg);
      if (typeof Audio !== 'undefined') Audio.playSFX('raredrop');
    }
    addChat('', `⚔️ ${window.selChar?.char_name} membunuh ${targetName}! (+3 PK pts)`, 'system');
    // Broadcast kill
    if (rtCh) rtCh.send({type:'broadcast', event:'pvp_kill', payload:{
      killer: window.selChar?.char_name, victim: targetName,
      killerFac: window.selChar?.faction, victimFac: targetFac
    }});
    this.save();
  },

  addDeath(killerName) {
    this.deaths++;
    this.pkPoints = Math.max(0, this.pkPoints - 5);
    this.killStreak = 0;
    this.updateWanted();
    this.updateHUD();
    addChat('', `💀 ${window.selChar?.char_name} gugur ditangan ${killerName}! (-5 PK pts)`, 'system');
    this.save();
  },

  updateWanted() {
    const pts = this.pkPoints;
    this.wantedLevel = pts >= 30 ? 3 : pts >= 15 ? 2 : pts >= 5 ? 1 : 0;
  },

  updateHUD() {
    const el = document.getElementById('pvpHUD'); if (!el) return;
    const col = this.WANTED_COLORS[this.wantedLevel];
    const lbl = this.WANTED_LABELS[this.wantedLevel];
    el.style.display = 'flex';
    el.innerHTML = `
      <div class="pvp-stat">⚔️ <span>${this.kills}</span></div>
      <div class="pvp-stat">💀 <span>${this.deaths}</span></div>
      <div class="pvp-stat" style="color:${col}">${lbl}</div>
      ${this.killStreak >= 3 ? `<div class="pvp-streak">🔥 ${this.killStreak}</div>` : ''}`;
  },

  save() {
    if (!window.selChar) return;
    window.selChar.pvp_kills   = this.kills;
    window.selChar.pvp_deaths  = this.deaths;
    window.selChar.pvp_points  = this.pkPoints;
    window.selChar.pvp_streak  = this.bestStreak;
    window.saveProgress?.();
  },

  load() {
    if (!window.selChar) return;
    this.kills      = window.selChar.pvp_kills   || 0;
    this.deaths     = window.selChar.pvp_deaths  || 0;
    this.pkPoints   = window.selChar.pvp_points  || 0;
    this.bestStreak = window.selChar.pvp_streak  || 0;
    this.killStreak = 0;
    this.updateWanted();
    this.updateHUD();
  },
};

// PvP ghost player target detection
function checkPvPHit(playerX, playerY, atkRange, atkDir) {
  if (!pkMode) return; // hanya bila PK mode ON
  const zone = window.ZONES[window.G?.currentZone || 'moradon'];
  if (zone?.safe) return; // safe zone = tiada PvP

  for (const [id, op] of Object.entries(window.opMap)) {
    if (!op || !op.x || !op.y) continue;
    // Semak faction — hanya serang musuh
    const myFac  = window.selChar?.faction === 'cahaya' ? 'elmorad' : window.selChar?.faction;
    const opFac  = op.faction === 'cahaya' ? 'elmorad' : op.faction;
    const isEnem = myFac !== opFac;
    if (!isEnem && PVP.wantedLevel < 2) continue; // tiada friendly fire kecuali WANTED

    const dist = Math.hypot(op.x - playerX, op.y - playerY);
    if (dist > atkRange + 20) continue;
    const ang = Math.abs(Math.atan2(op.y - playerY, op.x - playerX) - atkDir);
    if (ang > 1.2) continue;

    // Hit! Hantar damage broadcast
    const dmg = Math.floor((window.G.pl?.atk || 20) * (0.8 + Math.random() * 0.4));
    if (rtCh) rtCh.send({type:'broadcast', event:'pvp_hit', payload:{
      from: window.selChar?.id, to: op.id, fromName: window.selChar?.char_name,
      damage: dmg, x: op.x, y: op.y
    }});

    // Floating text
    window.G.fts?.push(new FT(op.x, op.y - 20, '⚔ -' + dmg, '#ff4444', 14));
    hitPts(op.x, op.y, '#ff0000');
    break;
  }
}

// Terima PvP hit dari player lain
function handlePvPHit(payload) {
  if (payload.to !== window.selChar?.id) return;
  const dmg = payload.damage || 10;
  if (window.G.pl) {
    if(window.G?.pl) window.G.pl.hurt2(dmg);
    window.G.fts?.push(new FT(window.G.pl.x, window.G.pl.y - 20, '⚔ -' + dmg + ' [PvP]', '#ff2222', 14));
    if (window.G.pl.hp <= 0) {
      PVP.addDeath(payload.fromName || '?');
      // Respawn selepas 3 saat di Moradon
      setTimeout(() => {
        if (window.G?.pl) {
          window.G.pl.hp = window.G.pl.maxHp * 0.3;
          const spawn = window.ZONES?.moradon;
          if (spawn) { window.G.pl.x = spawn.spawnX; window.G.pl.y = spawn.spawnY; }
        }
        if (typeof addChat === 'function') addChat('', '💀 Anda gugur! Respawn di Moradon.', 'system');
      }, 3000);
    }
  }
}

// Terima kill notification
function handlePvPKill(payload) {
  addChat(payload.killer, `⚔️ membunuh ${payload.victim}!`, 'system');
}

// Hook ke RT + Player.doAtk — deferred selepas semua load
window.addEventListener('load', function() {
  // Hook initRT
  if (typeof initRT === 'function') {
    const _origInitRT = initRT;
    initRT = window.initRT = function() {
      _origInitRT();
      if (!rtCh) return;
      rtCh
        .on('broadcast', {event:'pvp_hit'},  ({payload}) => handlePvPHit(payload))
        .on('broadcast', {event:'pvp_kill'}, ({payload}) => handlePvPKill(payload));
    };
  }
  // Hook Player.doAtk
  if (typeof Player !== 'undefined' && Player.prototype.doAtk) {
    const _origDoAtk = Player.prototype.doAtk;
    Player.prototype.doAtk = function(enemies) {
      _origDoAtk.call(this, enemies);
      checkPvPHit(this.x, this.y, this.range, this.dir);
    };
  }
});

// ══════════════════════════════════════════════════════════════════
// 2. MARKET / TRADE BOARD
// ══════════════════════════════════════════════════════════════════
async function openMarket() {
  const p = document.getElementById('marketPanel'); if (!p) return;
  p.classList.remove('off');
  renderMarket('browse');
}

function renderMarket(tab) {
  const body = document.getElementById('marketBody'); if (!body) return;
  document.querySelectorAll('#marketTabs .ov-tab').forEach((el, i) => {
    el.classList.toggle('active', ['browse','sell','mylistings'][i] === tab);
  });
  if      (tab === 'browse')      renderMarketBrowse(body);
  else if (tab === 'sell')        renderMarketSell(body);
  else if (tab === 'mylistings')  renderMarketMyListings(body);
}

async function renderMarketBrowse(container) {
  container.innerHTML = `<div style="font-family:'Cinzel',serif;font-size:.65rem;color:var(--muted);padding:20px;text-align:center">
    ⏳ Memuatkan listing...</div>`;
  if (!SB || window.offlineMode) { container.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px">Perlu sambungan internet</div>'; return; }

  try {
    const { data } = await SB.from('kn_market')
      .select('*').eq('status','active').order('created_at',{ascending:false}).limit(50);

    let html = `
    <div style="display:flex;gap:6px;margin-bottom:10px">
      <input class="search-inp" id="mktSearch" placeholder="Cari item..." style="flex:1;font-size:.72rem"
        oninput="filterMarket()">
      <select class="gm-inp" id="mktFilter" onchange="filterMarket()"
        style="flex:0 0 auto;font-size:.68rem;padding:6px 8px">
        <option value="">Semua</option>
        <option value="weapon">Senjata</option>
        <option value="armor">Armor</option>
        <option value="acc">Aksesori</option>
        <option value="potion">Potion</option>
        <option value="material">Bahan</option>
      </select>
    </div>`;

    if (!data?.length) {
      html += `<div style="text-align:center;padding:30px;color:var(--muted);font-size:.75rem">
        Tiada item dalam Market sekarang.<br>Jadi yang pertama jual!</div>`;
    } else {
      html += `<div id="mktListings" style="display:flex;flex-direction:column;gap:5px">`;
      data.forEach(listing => {
        const item = window.ITEM_DB[listing.item_id] || { name: listing.item_name||'?', icon:'📦', rarity:'common' };
        const col  = {common:'#aaa',uncommon:'#40c840',rare:'#4488ff',epic:'#aa44ff',legendary:'#ff8800'}[item.rarity]||'#aaa';
        const enh  = listing.enh || 0;
        const isMine = listing.seller_name === window.selChar?.char_name;
        html += `<div class="mkt-listing" data-type="${item.type||''}" data-name="${item.name.toLowerCase()}">
          <span style="font-size:1.3rem">${item.icon}</span>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:.72rem;color:${col}">
              ${item.name}${enh>0?` <span style="color:#40c840">+${enh}</span>`:''}
              ${listing.qty>1?`<span style="color:var(--muted);font-size:.6rem"> ×${listing.qty}</span>`:''}
            </div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--muted)">
              Penjual: ${listing.seller_name} | ${new Date(listing.created_at).toLocaleDateString('ms-MY')}
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-family:'Cinzel Decorative',serif;font-size:.78rem;color:var(--gold)">
              💰 ${Number(listing.price).toLocaleString()}g
            </div>
            ${!isMine
              ? `<button class="btn btn-gold btn-xs" onclick="buyMarketItem('${listing.id}','${listing.price}','${item.name}')">Beli</button>`
              : `<span style="font-family:'Cinzel',serif;font-size:.55rem;color:var(--green)">Milik saya</span>`
            }
          </div>
        </div>`;
      });
      html += `</div>`;
    }
    container.innerHTML = html;
    window._mktData = data || [];
  } catch(e) {
    container.innerHTML = `<div style="color:#e84040;text-align:center;padding:20px">Ralat: ${e.message}</div>`;
  }
}

function filterMarket() {
  const q    = (document.getElementById('mktSearch')?.value || '').toLowerCase();
  const type = document.getElementById('mktFilter')?.value || '';
  document.querySelectorAll('.mkt-listing').forEach(el => {
    const name = el.dataset.name || '';
    const etype = el.dataset.type || '';
    const show  = (!q || name.includes(q)) && (!type || etype === type);
    el.style.display = show ? 'flex' : 'none';
  });
}

async function buyMarketItem(listingId, price, itemName) {
  const cost = parseInt(price);
  if ((window.selChar?.gold || 0) < cost) {
    setMarketStatus('💰 Gold tidak cukup!', 'err'); return;
  }
  if (!confirm(`Beli ${itemName} untuk ${cost.toLocaleString()} Gold?`)) return;

  try {
    const { data: listing } = await SB.from('kn_market').select('*').eq('id', listingId).single();
    if (!listing || listing.status !== 'active') { setMarketStatus('Item sudah dijual!', 'err'); return; }

    // Bayar
    if(!window.selChar)return;
    window.selChar.gold -= cost;
    // Terima item
    if (!window.selChar.inventory) window.selChar.inventory = {};
    const copyId = listing.item_id + '_mkt_' + Date.now();
    if (window.ITEM_DB[listing.item_id]) {
      window.ITEM_DB[copyId] = { ...ITEM_DB[listing.item_id], enh: listing.enh || 0 };
      window.selChar.inventory[copyId] = listing.qty || 1;
    } else {
      window.selChar.inventory[listing.item_id] = (window.selChar.inventory[listing.item_id] || 0) + (listing.qty || 1);
    }
    // Update listing status
    await SB.from('kn_market').update({ status:'sold', buyer_name: window.selChar.char_name }).eq('id', listingId);
    // Bayar ke penjual (tambah gold mereka)
    await SB.rpc('add_gold_to_player', { p_char_name: listing.seller_name, p_gold: Math.floor(cost * 0.95) });

    window.saveProgress?.();
    setMarketStatus(`✅ Berjaya beli ${itemName}!`, 'ok');
    addChat('', `🛍️ ${window.selChar.char_name} membeli ${itemName} dari Market!`, 'system');
    if (typeof Audio !== 'undefined') Audio.playSFX('buy');
    setTimeout(() => renderMarket('browse'), 1500);
  } catch(e) { setMarketStatus('Ralat: ' + e.message, 'err'); }
}

let mktSellItem = null;
function renderMarketSell(container) {
  const inv = window.selChar?.inventory || {};
  const sellable = Object.entries(inv).filter(([iid, qty]) => qty > 0 && window.ITEM_DB[iid] &&
    ['weapon','armor','acc'].includes(window.ITEM_DB[iid].type));

  let html = `<div style="font-family:'Cinzel',serif;font-size:.62rem;color:var(--muted);
    letter-spacing:.1em;margin-bottom:8px">PILIH ITEM UNTUK JUAL:</div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:10px">`;

  if (!sellable.length) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--muted);font-size:.72rem">
      Tiada item untuk dijual. Dapatkan item dari monster atau Power-Up Store.</div>`;
    return;
  }

  sellable.forEach(([iid]) => {
    const item = window.ITEM_DB[iid]; if (!item) return;
    const enh  = item.enh || 0, sel = mktSellItem === iid;
    html += `<div onclick="selectMktSell('${iid}')"
      style="background:rgba(0,0,0,.4);border:1px solid ${sel?'rgba(201,168,76,.7)':'rgba(201,168,76,.1)'};
      border-radius:4px;padding:5px;text-align:center;cursor:pointer;${sel?'background:rgba(201,168,76,.12)':''}">
      <div style="font-size:1.3rem">${item.icon}</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.48rem;color:#40c840">+${enh}</div>
    </div>`;
  });
  html += `</div>`;

  if (mktSellItem && window.ITEM_DB[mktSellItem]) {
    const item = window.ITEM_DB[mktSellItem];
    const suggestPrice = Math.floor((item.sell || 100) * 8 * (1 + (item.enh || 0) * 0.5));
    html += `
    <div style="background:rgba(0,0,0,.4);border:1px solid rgba(201,168,76,.2);border-radius:5px;padding:10px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:1.8rem">${item.icon}</span>
        <div>
          <div style="font-family:'Cinzel',serif;font-size:.78rem;color:var(--gold)">${item.name}${item.enh?` +${item.enh}`:''}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:var(--muted)">
            Harga cadangan: ${suggestPrice.toLocaleString()}g
          </div>
        </div>
      </div>
      <div style="margin-bottom:8px">
        <div style="font-family:'Cinzel',serif;font-size:.6rem;color:var(--muted);margin-bottom:4px;letter-spacing:.1em">HARGA JUAL (GOLD)</div>
        <input type="number" class="gm-inp" id="mktPrice" value="${suggestPrice}" min="1" style="width:100%;font-size:.8rem">
      </div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--muted);margin-bottom:8px">
        ⚠️ Yuran 5% dikenakan. Anda terima ${Math.floor(suggestPrice*0.95).toLocaleString()}g selepas jualan.
      </div>
      <button class="btn btn-gold" onclick="listMarketItem()" style="width:100%;padding:10px;font-size:.72rem">
        🏪 Letak di Market
      </button>
    </div>`;
  }
  container.innerHTML = html;
}

function selectMktSell(iid) { mktSellItem = iid; renderMarket('sell'); }

async function listMarketItem() {
  if (!mktSellItem || !window.ITEM_DB[mktSellItem]) return;
  const item  = window.ITEM_DB[mktSellItem];
  const price = parseInt(document.getElementById('mktPrice')?.value || 0);
  if (price < 1) { setMarketStatus('Masukkan harga yang sah!', 'err'); return; }
  if (!SB || window.offlineMode) { setMarketStatus('Perlu sambungan internet!', 'err'); return; }

  try {
    await SB.from('kn_market').insert({
      seller_name: window.selChar.char_name,
      account_id:  window.curAccount?.uid,
      item_id:     mktSellItem,
      item_name:   item.name,
      item_type:   item.type,
      item_icon:   item.icon,
      item_rarity: item.rarity,
      enh:         item.enh || 0,
      qty:         1,
      price,
      status:      'active',
      created_at:  new Date().toISOString(),
    });
    // Buang dari inventory
    const inv = window.selChar.inventory || {};
    if (inv[mktSellItem]) { inv[mktSellItem]--; if (inv[mktSellItem]<=0) delete inv[mktSellItem]; }
    else {
      const eq = window.selChar.equipment || {};
      for (const s of Object.keys(eq)) { if (eq[s]===mktSellItem){eq[s]=null;break} }
      delete window.ITEM_DB[mktSellItem];
    }
    mktSellItem = null;
    setMarketStatus('✅ Item berjaya diletakkan di Market!', 'ok');
    addChat('', `🏪 ${window.selChar.char_name} menjual ${item.name} di Market!`, 'system');
    window.saveProgress?.();
    if (typeof Audio !== 'undefined') Audio.playSFX('buy');
    setTimeout(() => renderMarket('sell'), 1500);
  } catch(e) { setMarketStatus('Ralat: ' + e.message, 'err'); }
}

async function renderMarketMyListings(container) {
  if (!SB || window.offlineMode) { container.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px">Perlu sambungan internet</div>'; return; }
  let data;
  try {
    ({ data } = await SB.from('kn_market').select('*').eq('seller_name', window.selChar?.char_name).order('created_at',{ascending:false}));
  } catch(e) { container.innerHTML = '<div style="color:#e84040;text-align:center;padding:10px">⚠️ Ralat memuatkan listing</div>'; return; }
  let html = `<div style="display:flex;flex-direction:column;gap:5px">`;
  if (!data?.length) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--muted);font-size:.72rem">Tiada listing aktif.</div>`;
    return;
  }
  data.forEach(l => {
    const col = l.status==='sold'?'#40c840':l.status==='cancelled'?'#e84040':'var(--gold)';
    html += `<div class="mkt-listing">
      <span style="font-size:1.2rem">${l.item_icon||'📦'}</span>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:.72rem;color:var(--gold)">${l.item_name}</div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:${col}">${l.status.toUpperCase()}</div>
      </div>
      <div style="font-family:'Cinzel Decorative',serif;font-size:.75rem;color:var(--gold)">${Number(l.price).toLocaleString()}g</div>
      ${l.status==='active'?`<button class="btn btn-red btn-xs" onclick="cancelMarketListing('${l.id}')">Batal</button>`:''}
    </div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
}

async function cancelMarketListing(id) {
  if (!confirm('Batal listing ini?')) return;
  await SB.from('kn_market').update({status:'cancelled'}).eq('id',id);
  // Return item
  const { data: l } = await SB.from('kn_market').select('*').eq('id',id).single();
  if (l?.item_id) {
    if (!window.selChar.inventory) window.selChar.inventory = {};
    window.selChar.inventory[l.item_id] = (window.selChar.inventory[l.item_id]||0)+1;
    window.saveProgress?.();
  }
  renderMarket('mylistings');
}

function setMarketStatus(msg, type) {
  const el = document.getElementById('marketStatus'); if (!el) return;
  el.textContent = msg; el.style.color = type==='err'?'#e84040':'#40c840';
  setTimeout(() => { if(el) el.textContent=''; }, 3000);
}

// ══════════════════════════════════════════════════════════════════
// 3. GUILD / CLAN SYSTEM
// ══════════════════════════════════════════════════════════════════
let myGuild = null;

async function openGuild() {
  const p = document.getElementById('guildPanel'); if (!p) return;
  p.classList.remove('off');
  await loadGuildData();
}

async function loadGuildData() {
  const body = document.getElementById('guildBody'); if (!body) return;
  if (!SB || window.offlineMode) { body.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px">Perlu sambungan internet</div>'; return; }

  try {
    const { data: member } = await SB.from('kn_guild_members')
      .select('*, kn_guilds(*)').eq('char_name', window.selChar?.char_name).maybeSingle();

    if (member?.kn_guilds) {
      myGuild = member.kn_guilds;
      myGuild.myRank = member.rank;
      renderGuildInfo(body);
    } else {
      myGuild = null;
      renderGuildLobby(body);
    }
  } catch(e) {
    body.innerHTML = `<div style="color:#e84040;padding:10px">Ralat: ${e.message}</div>`;
  }
}

function renderGuildLobby(container) {
  container.innerHTML = `
  <div style="text-align:center;padding:16px 0">
    <div style="font-size:2.5rem">🏰</div>
    <div style="font-family:'Cinzel',serif;font-size:.9rem;color:var(--gold);margin-top:6px">Anda tiada Guild</div>
    <div style="font-family:'Crimson Text',serif;font-size:.75rem;color:var(--muted);margin-top:4px">
      Sertai atau cipta guild untuk berperang bersama!</div>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">
    <button class="btn btn-gold" onclick="showCreateGuild()" style="padding:12px">⚔️ Cipta Guild Baru</button>
    <div style="font-family:'Cinzel',serif;font-size:.62rem;color:var(--muted);
      text-align:center;letter-spacing:.1em;margin:4px 0">ATAU SERTAI DENGAN KOD</div>
    <div style="display:flex;gap:6px">
      <input class="gm-inp" id="guildCodeInput" placeholder="Kod jemputan guild..." style="flex:1;font-size:.78rem">
      <button class="btn btn-blue btn-sm" onclick="joinGuildByCode()" style="flex:0 0 auto">Sertai</button>
    </div>
  </div>
  <div id="guildList" style="margin-top:12px"></div>`;
  loadPublicGuilds();
}

async function loadPublicGuilds() {
  const el = document.getElementById('guildList'); if (!el || !SB) return;
  const { data } = await SB.from('kn_guilds').select('*').eq('is_public',true).order('level',{ascending:false}).limit(10);
  if (!data?.length) { el.innerHTML = ''; return; }
  el.innerHTML = `<div style="font-family:'Cinzel',serif;font-size:.6rem;color:var(--muted);
    letter-spacing:.1em;margin-bottom:6px">GUILD AKTIF:</div>` +
  data.map(g => `<div style="background:rgba(0,0,0,.35);border:1px solid rgba(201,168,76,.12);
    border-radius:5px;padding:8px;margin-bottom:5px;display:flex;align-items:center;gap:8px">
    <span style="font-size:1.4rem">${g.emblem||'🏰'}</span>
    <div style="flex:1">
      <div style="font-family:'Cinzel',serif;font-size:.72rem;color:var(--gold)">${g.name}</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--muted)">
        Lv.${g.level||1} | ${g.member_count||0} ahli | ${g.faction==='elmorad'?'🌟':'🔥'}</div>
    </div>
    ${g.is_public?`<button class="btn btn-blue btn-xs" onclick="requestJoinGuild('${g.id}','${g.name}')">Mohon</button>`:''}
  </div>`).join('');
}

function showCreateGuild() {
  const body = document.getElementById('guildBody'); if (!body) return;
  const faction = window.selChar?.faction || 'elmorad';
  body.innerHTML = `
  <div style="font-family:'Cinzel',serif;font-size:.7rem;color:var(--gold);
    letter-spacing:.08em;margin-bottom:12px">⚔️ CIPTA GUILD BARU</div>
  <div style="display:flex;flex-direction:column;gap:8px">
    <div>
      <div class="inp-label" style="font-family:Cinzel,serif;font-size:.58rem;color:var(--muted);margin-bottom:3px">NAMA GUILD</div>
      <input class="gm-inp" id="guildName" placeholder="Nama guild..." maxlength="20" style="width:100%;font-size:.8rem">
    </div>
    <div>
      <div class="inp-label" style="font-family:Cinzel,serif;font-size:.58rem;color:var(--muted);margin-bottom:3px">MOTO GUILD</div>
      <input class="gm-inp" id="guildMotto" placeholder="Moto guild anda..." maxlength="40" style="width:100%;font-size:.75rem">
    </div>
    <div>
      <div class="inp-label" style="font-family:Cinzel,serif;font-size:.58rem;color:var(--muted);margin-bottom:3px">EMBLEMA</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${['🏰','⚔️','🛡️','🔱','👑','🌟','🔥','💀','🦅','🐉','🌙','⭐'].map(e=>
          `<div onclick="selectEmblem('${e}')" id="emb_${e.codePointAt(0)}"
            style="font-size:1.4rem;padding:4px;cursor:pointer;border-radius:3px;
            border:1px solid rgba(201,168,76,.15)">${e}</div>`
        ).join('')}
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <label style="font-family:'Cinzel',serif;font-size:.62rem;color:var(--muted)">
        <input type="checkbox" id="guildPublic" checked> Terbuka (sesiapa boleh mohon)
      </label>
    </div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:var(--muted)">
      Kos penubuhan: <span style="color:var(--gold)">5,000 Gold</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px">
      <button class="btn btn-gold" onclick="createGuild()" style="padding:10px;font-size:.7rem">⚔️ Tubuhkan</button>
      <button class="btn btn-dim" onclick="loadGuildData()" style="padding:10px;font-size:.7rem">Batal</button>
    </div>
    <div class="status-msg" id="guildStatus"></div>
  </div>`;
}

let selectedEmblem = '🏰';
function selectEmblem(e) {
  selectedEmblem = e;
  document.querySelectorAll('[id^="emb_"]').forEach(el => el.style.background='');
  document.getElementById('emb_'+e.codePointAt(0))?.style.setProperty('background','rgba(201,168,76,.2)');
}

async function createGuild() {
  const name   = document.getElementById('guildName')?.value.trim();
  const motto  = document.getElementById('guildMotto')?.value.trim() || '';
  const isPublic = document.getElementById('guildPublic')?.checked;
  if (!name || name.length < 2) { document.getElementById('guildStatus').textContent='Nama min 2 huruf!'; return; }
  if ((window.selChar?.gold||0) < 5000) { document.getElementById('guildStatus').textContent='Gold tidak cukup! (5,000g)'; return; }

  try {
    // Semak nama duplikat
    const { data: ex } = await SB.from('kn_guilds').select('id').eq('name',name).maybeSingle();
    if (ex) { document.getElementById('guildStatus').textContent='Nama guild sudah digunakan!'; return; }

    const invCode = Math.random().toString(36).slice(2,8).toUpperCase();
    const { data: guild, error } = await SB.from('kn_guilds').insert({
      name, motto, emblem: selectedEmblem, is_public: isPublic,
      faction: window.selChar.faction, leader_name: window.selChar.char_name,
      level: 1, exp: 0, member_count: 1, invite_code: invCode,
      created_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;

    await SB.from('kn_guild_members').insert({
      guild_id: guild.id, char_name: window.selChar.char_name,
      account_id: window.curAccount?.uid, rank: 'leader',
      joined_at: new Date().toISOString(),
    });

    if(!window.selChar)return;
    window.selChar.gold -= 5000;
    window.selChar.guild_name = name;
    window.saveProgress?.();
    addChat('', `🏰 Guild "${name}" berjaya ditubuhkan!`, 'system');
    if (typeof Audio !== 'undefined') Audio.playSFX('levelup');
    loadGuildData();
  } catch(e) {
    document.getElementById('guildStatus').textContent = 'Ralat: '+e.message;
  }
}

async function joinGuildByCode() {
  const code = document.getElementById('guildCodeInput')?.value.trim().toUpperCase();
  if (!code) return;
  const { data } = await SB.from('kn_guilds').select('*').eq('invite_code',code).maybeSingle();
  if (!data) { showWvNotif('Kod jemputan tidak sah!'); return; }
  await SB.from('kn_guild_members').insert({
    guild_id: data.id, char_name: window.selChar.char_name,
    account_id: window.curAccount?.uid, rank: 'member', joined_at: new Date().toISOString(),
  });
  await SB.from('kn_guilds').update({member_count: (data.member_count||0)+1}).eq('id',data.id);
  window.selChar.guild_name = data.name;
  window.saveProgress?.();
  addChat('', `🏰 Berjaya sertai Guild "${data.name}"!`, 'system');
  loadGuildData();
}

async function requestJoinGuild(guildId, guildName) {
  if (!confirm(`Mohon sertai Guild "${guildName}"?`)) return;
  await SB.from('kn_guild_requests').insert({
    guild_id: guildId, char_name: window.selChar.char_name,
    account_id: window.curAccount?.uid, status: 'pending', created_at: new Date().toISOString(),
  });
  addChat('', `📨 Permohonan dihantar ke Guild "${guildName}"!`, 'system');
}

function renderGuildInfo(container) {
  const g = myGuild; if (!g) return;
  const isLeader = g.myRank === 'leader';
  container.innerHTML = `
  <div style="background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(0,0,0,.4));
    border:1px solid rgba(201,168,76,.25);border-radius:6px;padding:12px;margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:2.5rem">${g.emblem||'🏰'}</span>
      <div>
        <div style="font-family:'Cinzel Decorative',serif;font-size:1rem;color:var(--gold)">${g.name}</div>
        <div style="font-family:'Crimson Text',serif;font-size:.75rem;color:var(--muted);font-style:italic">"${g.motto||''}"</div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <span style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--gold)">Lv.${g.level||1}</span>
          <span style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--muted)">${g.member_count||0} ahli</span>
          <span style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:${g.faction==='elmorad'?'#c9a84c':'#cc3333'}">${g.faction==='elmorad'?'🌟 El Morad':'🔥 Karus'}</span>
        </div>
      </div>
    </div>
    ${g.invite_code?`<div style="margin-top:8px;font-family:'Share Tech Mono',monospace;font-size:.6rem;
      color:var(--muted)">Kod Jemputan: <span style="color:var(--gold);letter-spacing:.15em">${g.invite_code}</span></div>`:''}
    <div style="margin-top:6px;font-family:'Cinzel',serif;font-size:.6rem;
      color:${g.myRank==='leader'?'#ffd700':g.myRank==='officer'?'#aa44ff':'var(--muted)'}">
      Pangkat: ${g.myRank==='leader'?'👑 Ketua':g.myRank==='officer'?'⭐ Pegawai':'👤 Ahli'}
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">
    <button class="btn btn-gold btn-sm" onclick="loadGuildMembers()">👥 Ahli</button>
    ${isLeader?`<button class="btn btn-blue btn-sm" onclick="loadGuildRequests()">📨 Permohonan</button>`:''}
    <button class="btn btn-dim btn-sm" onclick="loadGuildData()">↺ Refresh</button>
    <button class="btn btn-red btn-sm" onclick="leaveGuild()">🚪 Keluar</button>
  </div>
  <div id="guildSubContent"></div>`;
  loadGuildMembers();
}

async function loadGuildMembers() {
  const el = document.getElementById('guildSubContent'); if (!el || !SB) return;
  const { data } = await SB.from('kn_guild_members').select('*').eq('guild_id', myGuild.id).order('rank');
  const g = myGuild;
  el.innerHTML = `<div style="font-family:'Cinzel',serif;font-size:.6rem;color:var(--muted);
    letter-spacing:.1em;margin-bottom:5px">SENARAI AHLI (${data?.length||0}/${g.max_members||20})</div>` +
  (data||[]).map(m => {
    const rankCol = m.rank==='leader'?'#ffd700':m.rank==='officer'?'#aa44ff':'var(--muted)';
    const rankLabel = m.rank==='leader'?'👑':m.rank==='officer'?'⭐':'👤';
    return`<div style="background:rgba(0,0,0,.3);border-radius:4px;padding:6px 8px;margin-bottom:4px;
      display:flex;align-items:center;gap:6px">
      <span style="color:${rankCol}">${rankLabel}</span>
      <span style="font-family:'Cinzel',serif;font-size:.7rem;color:${m.char_name===window.selChar?.char_name?'var(--gold)':'var(--parch)'};flex:1">${m.char_name}</span>
      <span style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--muted)">${m.rank}</span>
      ${g.myRank==='leader'&&m.char_name!==window.selChar?.char_name
        ?`<button class="btn btn-red btn-xs" onclick="kickGuildMember('${m.char_name}')">Kick</button>`:''
      }
    </div>`;
  }).join('');
}

async function leaveGuild() {
  if (!confirm('Keluar dari guild?')) return;
  await SB.from('kn_guild_members').delete().eq('char_name',window.selChar?.char_name);
  await SB.from('kn_guilds').update({member_count:Math.max(0,(myGuild?.member_count||1)-1)}).eq('id',myGuild?.id);
  window.selChar.guild_name = null; window.saveProgress?.(); myGuild = null; loadGuildData();
}

async function kickGuildMember(charName) {
  if (!confirm(`Kick "${charName}" dari guild?`)) return;
  await SB.from('kn_guild_members').delete().eq('char_name',charName).eq('guild_id',myGuild?.id);
  loadGuildMembers();
}

// ══════════════════════════════════════════════════════════════════
// 4. QUEST / MISSION SYSTEM
// ══════════════════════════════════════════════════════════════════
const QUEST_DB = {
  // Daily Quests
  d_goblin:  {id:'d_goblin', name:'Pembasmi Goblin',   type:'daily', icon:'🟢', desc:'Bunuh 20 Goblin',          req:{kill:'goblin',count:20},    reward:{xp:500, gold:200},  resetH:24},
  d_orc:     {id:'d_orc',    name:'Pemburu Orc',        type:'daily', icon:'🟡', desc:'Bunuh 15 Orc',             req:{kill:'orc',count:15},       reward:{xp:800, gold:350},  resetH:24},
  d_potion:  {id:'d_potion', name:'Pengumpul Potion',   type:'daily', icon:'🧪', desc:'Kumpul 5 HP Potion Besar', req:{collect:'hpot_lg',count:5}, reward:{xp:300, gold:500},  resetH:24},
  d_farm:    {id:'d_farm',   name:'Petani Bahan',       type:'daily', icon:'💠', desc:'Kumpul 10 Chaos Stone',    req:{collect:'chaos_stone',count:10},reward:{xp:600,gold:300},resetH:24},
  d_level:   {id:'d_level',  name:'Naik Taraf',         type:'daily', icon:'⬆️', desc:'Gain 1000 EXP hari ini',  req:{gain_exp:1000},             reward:{xp:200, gold:100},  resetH:24},

  // Story Quests
  s_first:   {id:'s_first',  name:'Pahlawan Pertama',  type:'story', icon:'📖', desc:'Bunuh 5 musuh pertama kamu',req:{kill_any:5},               reward:{xp:1000,gold:500,item:'hpot_md'}, once:true},
  s_lv10:    {id:'s_lv10',   name:'Ksatria Muda',      type:'story', icon:'⚔️', desc:'Capai Level 10',           req:{reach_lv:10},               reward:{xp:2000,gold:1000,item:'chaos_stone'}, once:true},
  s_lv30:    {id:'s_lv30',   name:'Pendekar Sejati',   type:'story', icon:'🔱', desc:'Capai Level 30',           req:{reach_lv:30},               reward:{xp:10000,gold:5000,item:'star_stone'}, once:true},
  s_upgrade: {id:'s_upgrade',name:'Tukang Besi',       type:'story', icon:'⚒️', desc:'Upgrade item ke +5',       req:{upgrade_to:5},              reward:{xp:3000,gold:2000,item:'chaos_stone'}, once:true},
  s_boss:    {id:'s_boss',   name:'Pembunuh Boss',     type:'story', icon:'💀', desc:'Bunuh 1 Boss buat pertama', req:{kill:'boss',count:1},       reward:{xp:5000,gold:3000,item:'hpot_lg'}, once:true},
  s_pvp:     {id:'s_pvp',    name:'Pejuang PvP',       type:'story', icon:'⚔️', desc:'Menang 5 pertarungan PvP', req:{pvp_win:5},                 reward:{xp:8000,gold:4000,item:'ring_iron'}, once:true},
  s_guild:   {id:'s_guild',  name:'Pejuang Bersatu',   type:'story', icon:'🏰', desc:'Sertai sebuah Guild',      req:{join_guild:true},           reward:{xp:2000,gold:1000}, once:true},
};

// Quest progress tracker
let questProgress = {};

function loadQuestProgress() {
  if (!window.selChar) return;
  try {
    const raw = window.selChar.quest_progress;
    questProgress = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
  } catch { questProgress = {}; }
}

function saveQuestProgress() {
  if (!window.selChar) return;
  window.selChar.quest_progress = questProgress;
  window.saveProgress?.();
}

function openQuests() {
  const p = document.getElementById('questPanel'); if (!p) return;
  p.classList.remove('off');
  loadQuestProgress();
  renderQuests();
}

function renderQuests() {
  const body = document.getElementById('questBody'); if (!body) return;
  const lv   = window.selChar?.level || 1;
  const tabs = ['daily','story'];
  let activeTab = document.getElementById('questActiveTab')?.dataset.tab || 'daily';

  let tabHtml = `<div class="ov-tabs" id="questTabRow" style="margin-bottom:10px">
    ${tabs.map(t=>`<div class="ov-tab ${activeTab===t?'active':''}" 
      id="questTab_${t}" data-tab="${t}" onclick="switchQuestTab('${t}')">
      ${t==='daily'?'📋 Daily':'📖 Story'}
    </div>`).join('')}
  </div>`;

  let html = tabHtml + `<div id="questList">`;

  const now = Date.now();
  Object.values(QUEST_DB).filter(q => q.type === activeTab).forEach(q => {
    const prog = questProgress[q.id] || {};
    // Semak dah selesai (once)
    if (q.once && prog.done) {
      html += renderQuestCard(q, prog, 'done'); return;
    }
    // Semak daily reset
    if (q.type === 'daily' && prog.done) {
      const resetTime = (prog.doneAt||0) + q.resetH * 3600000;
      if (now < resetTime) {
        const remain = Math.ceil((resetTime - now) / 3600000);
        html += renderQuestCard(q, prog, 'cooldown', remain); return;
      } else {
        // Reset daily
        prog.done = false; prog.progress = 0;
      }
    }
    // Semak progress
    const current = prog.progress || 0;
    const target  = getQuestTarget(q);
    if (current >= target) {
      html += renderQuestCard(q, prog, 'claimable');
    } else {
      html += renderQuestCard(q, prog, 'active', 0, current, target);
    }
  });

  html += `</div>`;
  body.innerHTML = html;

  // Restore active tab indicator
  const activeEl = document.getElementById('questActiveTab');
  if (!activeEl) {
    // Create hidden tracker
    const t = document.createElement('div');
    t.id = 'questActiveTab'; t.dataset.tab = activeTab;
    t.style.display = 'none'; body.appendChild(t);
  }
}

function switchQuestTab(tab) {
  const el = document.getElementById('questActiveTab');
  if (el) el.dataset.tab = tab;
  // Daily tab — tunjuk DailyQuest system jika ada
  if (tab === 'daily' && window.DailyQuest) {
    const body = document.getElementById('questBody'); if (!body) return;
    const tabHtml = `<div class="ov-tabs" style="margin-bottom:10px">
      <div class="ov-tab active" onclick="switchQuestTab('daily')">📋 Daily</div>
      <div class="ov-tab" onclick="switchQuestTab('story')">📖 Story</div>
    </div><div id="dailyQuestList"></div>`;
    body.innerHTML = tabHtml;
    window.DailyQuest.renderPanel('dailyQuestList');
    return;
  }
  renderQuests();
}

function getQuestTarget(q) {
  if (q.req.kill)       return q.req.count;
  if (q.req.kill_any)   return q.req.kill_any;
  if (q.req.collect)    return q.req.count;
  if (q.req.gain_exp)   return q.req.gain_exp;
  if (q.req.reach_lv)   return q.req.reach_lv;
  if (q.req.upgrade_to) return q.req.upgrade_to;
  if (q.req.pvp_win)    return q.req.pvp_win;
  if (q.req.join_guild) return 1;
  return 1;
}

function renderQuestCard(q, prog, state, extra=0, current=0, target=1) {
  const states = {
    done:      {bg:'rgba(64,200,64,.06)',   border:'rgba(64,200,64,.2)',  badge:'✅ SELESAI',    badgeCol:'#40c840'},
    cooldown:  {bg:'rgba(100,100,100,.06)', border:'rgba(100,100,100,.15)',badge:`⏱️ ${extra}j lagi`, badgeCol:'var(--muted)'},
    claimable: {bg:'rgba(201,168,76,.1)',   border:'rgba(201,168,76,.4)', badge:'🎁 TUNTUT!',   badgeCol:'var(--gold)'},
    active:    {bg:'rgba(0,0,0,.3)',        border:'rgba(201,168,76,.1)', badge:'',             badgeCol:''},
  };
  const s = states[state];
  const pct = target > 0 ? Math.min(100, current/target*100) : 0;
  const rwStr = [
    q.reward.xp   ? `+${q.reward.xp}XP` : '',
    q.reward.gold ? `+${q.reward.gold}g` : '',
    q.reward.item ? `+${window.ITEM_DB[q.reward.item]?.name||q.reward.item}` : '',
  ].filter(Boolean).join(' | ');

  return `<div style="background:${s.bg};border:1px solid ${s.border};border-radius:5px;
    padding:10px;margin-bottom:6px">
    <div style="display:flex;align-items:flex-start;gap:8px">
      <span style="font-size:1.4rem;flex-shrink:0">${q.icon}</span>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:.75rem;color:var(--gold)">${q.name}</div>
        <div style="font-family:'Crimson Text',serif;font-size:.68rem;color:var(--muted)">${q.desc}</div>
        ${state==='active'?`
        <div style="margin-top:5px">
          <div style="height:4px;background:rgba(0,0,0,.4);border-radius:2px;overflow:hidden;margin-bottom:2px">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#4488ff,#40c840);border-radius:2px"></div>
          </div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--muted)">
            ${current}/${target}</div>
        </div>`:''}
        <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--green);margin-top:3px">🎁 ${rwStr}</div>
      </div>
      ${s.badge?`<div style="font-family:'Cinzel',serif;font-size:.6rem;color:${s.badgeCol};
        flex-shrink:0;letter-spacing:.06em">${s.badge}</div>`:''}
    </div>
    ${state==='claimable'?`<button class="btn btn-gold btn-xs" onclick="claimQuest('${q.id}')" 
      style="width:100%;margin-top:6px;padding:7px">🎁 Tuntut Ganjaran</button>`:''}
  </div>`;
}

function claimQuest(questId) {
  const q = QUEST_DB[questId]; if (!q || !window.selChar) return;
  const prog = questProgress[questId] || {};
  const target = getQuestTarget(q);
  if ((prog.progress||0) < target && !prog.done) return;

  // Beri ganjaran
  if (q.reward.xp)   gainExp(q.reward.xp);
  if (q.reward.gold) window.selChar.gold = (window.selChar.gold||0) + q.reward.gold;
  if (q.reward.item) {
    if (!window.selChar.inventory) window.selChar.inventory = {};
    window.selChar.inventory[q.reward.item] = (window.selChar.inventory[q.reward.item]||0)+1;
  }

  questProgress[questId] = { ...prog, done:true, doneAt:Date.now() };
  saveQuestProgress();

  const rwStr = [q.reward.xp?`+${q.reward.xp}XP`:'',q.reward.gold?`+${q.reward.gold}g`:''].filter(Boolean).join(', ');
  addChat('', `🎯 Quest "${q.name}" selesai! ${rwStr}`, 'system');
  if (typeof Audio !== 'undefined') Audio.playSFX('levelup');
  showWvNotif(`🎯 Quest Selesai: ${q.name}!`);
  renderQuests();
}

// Update quest progress bila event berlaku
function updateQuestProgress(event, data={}) {
  loadQuestProgress();
  let changed = false;
  Object.values(QUEST_DB).forEach(q => {
    const prog = questProgress[q.id] || {};
    if (q.once && prog.done) return;
    if (q.type === 'daily' && prog.done) return;

    let add = 0;
    if      (event==='kill'      && q.req.kill    && data.type===q.req.kill) add=1;
    else if (event==='kill'      && q.req.kill_any) add=1;
    else if (event==='kill'      && q.req.kill==='boss' && data.type==='boss') add=1;
    else if (event==='collect'   && q.req.collect && data.id===q.req.collect) add=data.qty||1;
    else if (event==='gain_exp'  && q.req.gain_exp) add=data.amount||0;
    else if (event==='reach_lv'  && q.req.reach_lv && (window.selChar?.level||0)>=q.req.reach_lv) add=q.req.reach_lv;
    else if (event==='upgrade'   && q.req.upgrade_to && data.enh>=(q.req.upgrade_to)) add=q.req.upgrade_to;
    else if (event==='pvp_win'   && q.req.pvp_win) add=1;
    else if (event==='join_guild'&& q.req.join_guild) add=1;

    if (add > 0) {
      const newProg = Math.min(getQuestTarget(q), (prog.progress||0) + add);
      questProgress[q.id] = { ...prog, progress: newProg };
      changed = true;
      // Notif bila quest hampir siap
      if (newProg >= getQuestTarget(q)) {
        showWvNotif(`🎯 Quest "${q.name}" boleh dituntut!`);
      }
    }
  });
  if (changed) saveQuestProgress();
}

// ══════════════════════════════════════════════════════════════════
// 5. CASTLE SIEGE
// ══════════════════════════════════════════════════════════════════
let siegeActive  = false;
let siegeData    = null;
let siegeTimer   = 0;
const SIEGE_DURATION = 1800; // 30 minit

const CASTLE_ZONES = {
  moradon_castle: { name:'Castle Moradon', x:1500, y:500,  hp:5000, maxHp:5000, owner:null, faction:null },
  el_fortress:    { name:'Benteng Utara',  x:600,  y:600,  hp:3000, maxHp:3000, owner:null, faction:null },
  karus_stronghold:{name:'Kubu Selatan',   x:2400, y:2400, hp:3000, maxHp:3000, owner:null, faction:null },
};

function openCastleSiege() {
  const p = document.getElementById('siegePanel'); if (!p) return;
  p.classList.remove('off');
  renderSiegePanel();
}

function renderSiegePanel() {
  const body = document.getElementById('siegeBody'); if (!body) return;
  const myFac = window.selChar?.faction || 'elmorad';

  let html = `<div style="background:rgba(200,50,50,.08);border:1px solid rgba(200,50,50,.25);
    border-radius:4px;padding:10px;margin-bottom:12px;font-family:'Crimson Text',serif;font-size:.78rem;color:var(--parch)">
    ⚔️ <b>Castle Siege</b> — Serbu dan rebut castle musuh! 
    Pemenang dapat bonus stats dan EXP ganda untuk 1 jam!</div>`;

  if (siegeActive && siegeData) {
    const m=Math.floor(siegeTimer/60),s=Math.floor(siegeTimer%60);
    html += `<div style="text-align:center;background:rgba(200,50,50,.1);border:1px solid rgba(200,50,50,.3);
      border-radius:5px;padding:10px;margin-bottom:10px">
      <div style="font-family:'Cinzel Decorative',serif;font-size:.95rem;color:#e84040">⚔️ SIEGE AKTIF</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:1.1rem;color:#ffcc44;margin:4px 0">
        ${m}:${s.toString().padStart(2,'0')}</div>
      <div style="font-family:'Cinzel',serif;font-size:.65rem;color:var(--muted)">
        El Morad: <span style="color:#c9a84c">${siegeData.elScore}</span> pts | 
        Karus: <span style="color:#cc3333">${siegeData.krScore}</span> pts
      </div>
    </div>
    <button class="btn btn-red" onclick="gotoAndPlay('cz');closeIngameMenu?.();document.getElementById('siegePanel').classList.add('off')"
      style="width:100%;padding:10px;font-size:.72rem;margin-bottom:8px">⚔️ Pergi ke Battlefield!</button>`;
  }

  // Castle list
  html += `<div style="font-family:'Cinzel',serif;font-size:.6rem;color:var(--muted);letter-spacing:.12em;margin-bottom:8px">STATUS CASTLE:</div>`;
  Object.entries(CASTLE_ZONES).forEach(([id, c]) => {
    const ownerCol = c.owner==='elmorad'?'#c9a84c':c.owner==='karus'?'#cc3333':'#888';
    const ownerLbl = c.owner==='elmorad'?'🌟 El Morad':c.owner==='karus'?'🔥 Karus':'⬜ Neutral';
    const hpPct    = Math.round(c.hp/c.maxHp*100);
    html += `<div style="background:rgba(0,0,0,.35);border:1px solid rgba(200,50,50,.15);
      border-radius:5px;padding:9px;margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <div style="font-family:'Cinzel',serif;font-size:.72rem;color:var(--gold)">🏰 ${c.name}</div>
        <div style="font-family:'Cinzel',serif;font-size:.62rem;color:${ownerCol}">${ownerLbl}</div>
      </div>
      <div style="height:4px;background:rgba(0,0,0,.4);border-radius:2px;overflow:hidden;margin-bottom:4px">
        <div style="height:100%;width:${hpPct}%;background:${ownerCol};border-radius:2px;transition:width .3s"></div>
      </div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--muted)">
        HP: ${c.hp.toLocaleString()}/${c.maxHp.toLocaleString()} (${hpPct}%)</div>
    </div>`;
  });

  if (!siegeActive) {
    html += `<button class="btn btn-red" onclick="startCastleSiege()" 
      style="width:100%;padding:12px;font-size:.75rem;margin-top:8px">
      ⚔️ Mulakan Castle Siege!</button>`;
  }

  body.innerHTML = html;
}

function startCastleSiege() {
  siegeActive = true;
  siegeTimer  = SIEGE_DURATION;
  siegeData   = { elScore:0, krScore:0 };

  // Reset castle HP
  Object.values(CASTLE_ZONES).forEach(c => { c.hp = c.maxHp; });

  addChat('', '🏰 CASTLE SIEGE BERMULA! Rebut castle dalam 30 minit!', 'system');
  showNWNotif('🏰 CASTLE SIEGE BERMULA!');
  if (typeof Audio !== 'undefined') Audio.playSFX('bossSpawn');

  if (rtCh) rtCh.send({type:'broadcast', event:'siege_start', payload:{time:Date.now()}});
  document.getElementById('siegePanel')?.classList.add('off');
  renderSiegePanel();
}

function tickCastleSiege(dt) {
  if (!siegeActive) return;
  siegeTimer -= dt;
  if (siegeTimer <= 0) { endCastleSiege(); return; }

  // Damage castle bila player berdekatan dan attack
  if (window.G.pl && pkMode) {
    const myFac = window.selChar?.faction === 'cahaya' ? 'elmorad' : window.selChar?.faction;
    Object.values(CASTLE_ZONES).forEach(c => {
      if (!c.owner || c.owner === myFac) return; // skip neutral atau milik sendiri
      const dist = window.G?.pl ? Math.hypot(window.G.pl.x - c.x, window.G.pl.y - c.y) : 9999;
      if (dist < 80) {
        c.hp -= 5;
        const side = myFac === 'elmorad' ? 'elScore' : 'krScore';
        if (siegeData) siegeData[side] += 1;
        if (c.hp <= 0) {
          c.hp = 0; c.owner = myFac;
          addChat('', `🏰 ${c.name} direbut oleh ${myFac}!`, 'system');
          showNWNotif(`🏰 ${c.name.toUpperCase()} DIREBUT!`);
          if (typeof Audio !== 'undefined') Audio.playSFX('colony_capture');
        }
      }
    });
  }
}

function endCastleSiege() {
  siegeActive = false;
  if (!siegeData) return;

  const winner = siegeData.elScore > siegeData.krScore ? 'elmorad' : siegeData.krScore > siegeData.elScore ? 'karus' : null;
  const myFac  = window.selChar?.faction === 'cahaya' ? 'elmorad' : window.selChar?.faction;
  const isWinner = winner === myFac;

  showNWNotif(`🏰 SIEGE TAMAT! ${winner?`${winner==='elmorad'?'🌟 El Morad':'🔥 Karus'} MENANG!`:'SERI!'}`);
  addChat('', `🏰 Castle Siege tamat! El Morad: ${siegeData.elScore} | Karus: ${siegeData.krScore}`, 'system');

  if (isWinner && window.selChar) {
    const bonus = 5000;
    window.selChar.gold = (window.selChar.gold||0) + bonus;
    gainExp(10000);
    innBuffs.exp = { active:true, multiplier:2.0, remaining:3600 };
    addChat('', `🎉 Tahniah! Guild anda menang! +${bonus}g + EXP ×2 1 jam!`, 'system');
  }

  window.saveProgress?.();
  siegeData = null;
  renderSiegePanel();
}

// ══════════════════════════════════════════════════════════════════
// HOOKS & INTEGRATION
// ══════════════════════════════════════════════════════════════════

// Hook farming tick untuk siege dan quest
// farmingTick + gainExp hooks — deferred
function _hookPGQFunctions() {
  const ftReady = typeof farmingTick === 'function';
  const geReady = typeof gainExp === 'function';
  if (!ftReady || !geReady) { setTimeout(_hookPGQFunctions, 200); return; }

  const _origFT = farmingTick;
  farmingTick = function(dt) { _origFT(dt); tickCastleSiege(dt); };
  window.farmingTick = farmingTick;

  const _origGE = gainExp;
  gainExp = function(amount) { _origGE(amount); updateQuestProgress('gain_exp',{amount}); };
  window.gainExp = gainExp;
}
setTimeout(_hookPGQFunctions, 700);

// Hook kill untuk quest & PvP tracking
const _origG_endGame = window.G.endGame?.bind(G);

// Hook farmingInitZone — deferred
function _hookFarmingInitZone() {
  if (typeof farmingInitZone !== 'function') { setTimeout(_hookFarmingInitZone, 200); return; }
  const _origFarmingInitZone = farmingInitZone;
  farmingInitZone = window.farmingInitZone = function(zoneId) {
    _origFarmingInitZone(zoneId);
    loadQuestProgress();
  };
}
setTimeout(_hookFarmingInitZone, 800);

// Tambah quest tracking bila monster mati (dalam game.js rewards loop)
// Dipanggil dari luar bila enemy mati
window.onEnemyKilled = function(enemyType, enemyX, enemyY) {
  updateQuestProgress('kill', { type: enemyType });
  // PvP kill check
  if (window.G.currentZone === 'cz' && siegeActive) {
    const myFac = window.selChar?.faction === 'cahaya' ? 'elmorad' : window.selChar?.faction;
    if (siegeData) siegeData[myFac==='elmorad'?'elScore':'krScore'] += 5;
  }
};

// Hook enterWorld — deferred
function _hookEnterWorldPGQ() {
  if (typeof enterWorld !== 'function') { setTimeout(_hookEnterWorldPGQ, 200); return; }
  const _origEnterWorldPGQ = enterWorld;
  enterWorld = window._enterWorld = function() {
    _origEnterWorldPGQ();
    setTimeout(() => {
      PVP.load();
      loadQuestProgress();
      if (window.selChar?.guild_name) updateQuestProgress('join_guild', {});
    }, 500);
  };
}
setTimeout(_hookEnterWorldPGQ, 900);

// RT events untuk siege
if (typeof rtCh !== 'undefined' && rtCh) {
  rtCh?.on('broadcast', {event:'siege_start'}, () => {
    if (!siegeActive) {
      siegeActive = true; siegeTimer = SIEGE_DURATION;
      siegeData   = { elScore:0, krScore:0 };
      addChat('', '🏰 Castle Siege bermula! Semua pemain dijemput!', 'system');
      showNWNotif('🏰 CASTLE SIEGE BERMULA!');
    }
  });
}
