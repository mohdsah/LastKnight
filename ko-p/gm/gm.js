'use strict';
/* ═══════════════════════════════════════════════════════════════
   Pahlawan Terakhir — GM Admin Panel JS v5.3
   ═══════════════════════════════════════════════════════════════ */

const SURL = 'https://iscybjtiqbzhietclkbi.supabase.co';
const SKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzY3lianRpcWJ6aGlldGNsa2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDY0OTYsImV4cCI6MjA4OTE4MjQ5Nn0.dyc4rVDHBYqL39Y_S9Y9oEsHomQqY2i5gs57tsDPdok';

let SB=null,gmUser=null;
let allPlayers=[],filteredPlayers=[];
let editingChar=null,giveTargetChar=null,selectedItemId=null;
let invEditTarget=null,siTarget=null;
let confirmCallback=null;
let _genCodes=[];

window.addEventListener('DOMContentLoaded',()=>{
  try{ SB=window.supabase.createClient(SURL,SKEY); }catch(e){}
});

function toEmail(u){return u.toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,20)+'@pahlawan-terakhir.game';}

// ── UTILITIES ────────────────────────────────────────────────
function $el(id){return document.getElementById(id);}
function setEl(id,v){const e=$el(id);if(e)e.textContent=v;}
function setVal(id,v){const e=$el(id);if(e)e.value=v;}
function getVal(id){return $el(id)?.value||'';}
function setStatus(id,msg,type){
  const e=$el(id);if(!e)return;
  e.textContent=msg;
  e.style.color=type==='err'?'#e84040':type==='ok'?'#40c840':'#ffcc44';
  if(type!=='info')setTimeout(()=>{if(e)e.textContent=''},4000);
}

// ── AUTH ─────────────────────────────────────────────────────
async function gmLogin(){
  const user=$el('gmUser')?.value.trim(),pass=$el('gmPass')?.value;
  if(!user||!pass){setLoginStatus('Masukkan username dan password!','err');return;}
  setLoginStatus('⏳ Log masuk...','info');
  try{
    const{data,error}=await SB.auth.signInWithPassword({email:toEmail(user),password:pass});
    if(error)throw error;
    await verifyGMAccess(data.user,user);
  }catch(e){setLoginStatus('❌ '+(e.message||'Login gagal'),'err');}
}

async function verifyGMAccess(user,username){
  const{data,error}=await SB.from('kn_gm').select('*').eq('user_id',user.id).maybeSingle();
  if(error||!data){setLoginStatus('❌ Bukan akaun GM!','err');await SB.auth.signOut();return;}
  gmUser={uid:user.id,username:data.gm_name||username,role:data.role||'gm'};
  $el('loginPage').style.display='none';
  $el('gmPanel').style.display='block';
  setEl('gmBadge','🛡️ '+gmUser.username);
  await addGMLog('login',gmUser.username,'Log masuk');
  showPage('dashboard');
  startOnlineCheck();
}

async function gmLogout(){
  await addGMLog('logout',gmUser?.username||'?','Log keluar');
  await SB?.auth.signOut();
  location.reload();
}
function setLoginStatus(msg,type){const e=$el('loginStatus');if(e){e.textContent=msg;e.style.color=type==='err'?'#e84040':type==='ok'?'#40c840':'#ffcc44';}}

// ── PAGE SYSTEM ───────────────────────────────────────────────
const _pageCache={};
async function loadPage(id){
  if(_pageCache[id])return _pageCache[id];
  try{
    const res=await fetch(`pages/page-${id}.html`);
    if(!res.ok)throw new Error('404');
    _pageCache[id]=await res.text();
    return _pageCache[id];
  }catch{
    return `<div class="page active" id="page-${id}"><div class="page-header"><div class="page-title">❌ Halaman tidak dijumpai</div></div><p style="padding:20px;color:var(--muted)">pages/page-${id}.html</p></div>`;
  }
}

async function showPage(id){
  document.querySelectorAll('.sb-item').forEach(el=>{
    el.classList.toggle('active',el.getAttribute('onclick')?.includes(`'${id}'`));
  });
  const c=$el('pageContainer');if(!c)return;
  c.innerHTML='<div style="padding:40px;text-align:center;color:var(--muted)">⏳</div>';
  c.innerHTML=await loadPage(id);
  $el('page-'+id)?.classList.add('active');
  const inits={dashboard:loadDashboard,players:loadPlayers,giveItem:renderItemCategoryTabs,topupMgmt:loadTopupRequests,banList:loadBanList,gmLog:loadGMLog,broadcast:loadBroadcastHistory};
  if(inits[id])setTimeout(inits[id],60);
}

// ── ONLINE CHECK ──────────────────────────────────────────────
async function startOnlineCheck(){
  const ch=SB.channel('ko_presence');
  ch.on('presence',{event:'sync'},()=>{setEl('ocnt',Object.keys(ch.presenceState()).length);}).subscribe();
}

// ── DASHBOARD ─────────────────────────────────────────────────
async function loadDashboard(){
  const[{count:total},{count:banned},{count:topupQ},{data:recent}]=await Promise.all([
    SB.from('kn_players').select('*',{count:'exact',head:true}),
    SB.from('kn_bans').select('*',{count:'exact',head:true}),
    SB.from('kn_topup_requests').select('*',{count:'exact',head:true}).eq('status','pending'),
    SB.from('kn_players').select('char_name,level,faction,created_at').order('created_at',{ascending:false}).limit(8),
  ]);
  setEl('statTotalPlayers',total||0);
  setEl('statBanned',banned||0);
  setEl('statTopupPending',topupQ||0);
  const rb=$el('recentPlayers');if(!rb)return;
  rb.innerHTML=(recent||[]).map(p=>{
    const isEl=p.faction==='elmorad'||p.faction==='cahaya';
    return`<tr><td><span class="pl-faction-${isEl?'el':'kr'}">${p.char_name}</span></td><td>Lv.${p.level||1}</td><td>${isEl?'🌟 El Morad':'🔥 Karus'}</td><td style="font-size:.62rem;color:var(--muted)">${new Date(p.created_at).toLocaleDateString('ms-MY')}</td><td><button class="btn btn-gold btn-xs" onclick="quickEditPlayer('${p.char_name}')">Edit</button></td></tr>`;
  }).join('');
}

// ── PLAYERS LIST ──────────────────────────────────────────────
async function loadPlayers(){
  const{data}=await SB.from('kn_players').select('*').order('level',{ascending:false});
  allPlayers=data||[];filterPlayers();
}
function filterPlayers(){
  const q=(($el('playerSearch')?.value)||'').toLowerCase();
  const fac=$el('playerFacFilter')?.value||'';
  filteredPlayers=allPlayers.filter(p=>{
    const mQ=!q||p.char_name?.toLowerCase().includes(q);
    const mF=!fac||p.faction===fac||(fac==='elmorad'&&p.faction==='cahaya');
    return mQ&&mF;
  });
  renderPlayerTable();
}
function renderPlayerTable(){
  const tb=$el('playerTbody');if(!tb)return;
  tb.innerHTML=filteredPlayers.map(p=>{
    const isEl=p.faction==='elmorad'||p.faction==='cahaya';
    return`<tr><td><span class="pl-faction-${isEl?'el':'kr'}">${p.char_name||'?'}</span></td><td>${p.level||1}</td><td>${(p.gold||0).toLocaleString()}</td><td>${isEl?'🌟 El':'🔥 Kr'}</td><td>${p.job||'?'}</td><td><div class="pl-actions"><button class="btn btn-gold btn-xs" onclick="quickEditPlayer('${p.char_name}')">✏️</button><button class="btn btn-blue btn-xs" onclick="quickGiveItem('${p.char_name}')">🎁</button><button class="btn btn-red btn-xs" onclick="quickBan('${p.char_name}')">🚫</button></div></td></tr>`;
  }).join('')||'<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:20px">Tiada player</td></tr>';
}
function quickEditPlayer(name){const p=allPlayers.find(x=>x.char_name===name);showPage('editPlayer').then(()=>{if(p){editingChar=p;loadEditPlayer(p);}});}
function quickGiveItem(name){showPage('giveItem').then(()=>{const e=$el('givePlayerSearch');if(e){e.value=name;searchGivePlayer();}});}
function quickBan(name){showPage('banList').then(()=>{const e=$el('banName');if(e)e.value=name;});}

// ── EDIT PLAYER ───────────────────────────────────────────────
async function searchEditPlayer(){
  const q=$el('editSearch')?.value.trim();if(!q)return;
  const{data}=await SB.from('kn_players').select('*').ilike('char_name',`%${q}%`).limit(5);
  const res=$el('editSearchResults');if(!res)return;
  if(!data?.length){res.innerHTML='<div style="color:var(--muted);padding:8px">Tidak dijumpai</div>';return;}
  res.innerHTML=data.map(p=>`<div onclick='loadEditPlayer(${JSON.stringify(p).replace(/'/g,"&#39;")})'
    style="padding:8px;cursor:pointer;border-bottom:1px solid var(--border);font-family:Share Tech Mono,monospace;font-size:.72rem;color:var(--gold)">
    ${p.char_name} — Lv.${p.level} ${p.faction==='elmorad'?'🌟':'🔥'}</div>`).join('');
}
function loadEditPlayer(p){
  editingChar=typeof p==='string'?JSON.parse(p):p;
  const card=$el('editPlayerCard');if(card)card.style.display='block';
  setEl('editCharName',editingChar.char_name);
  setVal('editLevel',editingChar.level||1);setVal('editXP',editingChar.xp||0);
  setVal('editGold',editingChar.gold||0);setVal('editSkillPts',editingChar.skill_pts||0);
  setVal('editStatPts',editingChar.stat_pts||0);
  setVal('editStr',editingChar.stat_str||70);setVal('editVit',editingChar.stat_hp||70);
  setVal('editDex',editingChar.stat_dex||65);setVal('editInt',editingChar.stat_int||55);
  setVal('editWis',editingChar.stat_mp||55);
}
function applyPreset(preset){
  const P={max_stat:{str:999,vit:999,dex:999,int:999,wis:999},max_gold:{gold:9999999},level50:{level:50,xp:0},level100:{level:100,xp:0},reset_stat:{str:70,vit:70,dex:65,int:55,wis:55}}[preset];
  if(!P)return;
  if(P.str!==undefined){setVal('editStr',P.str);setVal('editVit',P.vit);setVal('editDex',P.dex);setVal('editInt',P.int);setVal('editWis',P.wis);}
  if(P.gold!==undefined)setVal('editGold',P.gold);
  if(P.level!==undefined){setVal('editLevel',P.level);setVal('editXP',P.xp||0);}
}
async function saveEditPlayer(){
  if(!editingChar)return;
  const upd={level:+getVal('editLevel')||1,xp:+getVal('editXP')||0,gold:+getVal('editGold')||0,skill_pts:+getVal('editSkillPts')||0,stat_pts:+getVal('editStatPts')||0,stat_str:+getVal('editStr')||70,stat_hp:+getVal('editVit')||70,stat_dex:+getVal('editDex')||65,stat_int:+getVal('editInt')||55,stat_mp:+getVal('editWis')||55};
  const{error}=await SB.from('kn_players').update(upd).eq('char_name',editingChar.char_name);
  if(error){setStatus('editStatus','❌ '+error.message,'err');return;}
  await addGMLog('edit_player',editingChar.char_name,`Lv:${upd.level} Gold:${upd.gold}`);
  setStatus('editStatus','✅ Disimpan!','ok');
}
function closeEditPlayer(){editingChar=null;const c=$el('editPlayerCard');if(c)c.style.display='none';}

// ── GIVE ITEM ─────────────────────────────────────────────────
const ITEM_CATS={
  'Senjata':['sword_iron','sword_steel','sword_knight','sword_legend','dagger_basic','dagger_dark','dagger_shadow','staff_oak','staff_magic','staff_divine','staff_chaos'],
  'Armor':['armor_leather','armor_chain','armor_plate','robe_silk','robe_arcane','helm_iron','helm_knight','glove_leather','glove_fighter','boot_cloth','boot_speed'],
  'Aksesori':['ring_iron','ring_gold','ring_ruby','amulet_jade','amulet_power','earring_el','earring_kr'],
  'Potion':['hpot_sm','hpot_md','hpot_lg','mpot_sm','mpot_md','town_scroll','tp_scroll'],
  'Bahan':['chaos_stone','luna_stone','star_stone','wraith_stone','monsters_bead'],
};
const ITEM_ICONS={sword_iron:'🗡️',sword_steel:'⚔️',sword_knight:'🔱',sword_legend:'⚡',dagger_basic:'🔪',dagger_dark:'☠️',dagger_shadow:'🌑',staff_oak:'🪄',staff_magic:'🔮',staff_divine:'✨',staff_chaos:'💥',armor_leather:'🥋',armor_chain:'🛡️',armor_plate:'⚙️',robe_silk:'👘',robe_arcane:'🎭',helm_iron:'⛑️',helm_knight:'🪖',glove_leather:'🧤',glove_fighter:'🥊',boot_cloth:'👟',boot_speed:'👢',ring_iron:'💍',ring_gold:'💎',ring_ruby:'❤️',amulet_jade:'📿',amulet_power:'🔮',earring_el:'🌟',earring_kr:'🔥',hpot_sm:'🧪',hpot_md:'💊',hpot_lg:'🍶',mpot_sm:'🫙',mpot_md:'🫧',town_scroll:'📜',tp_scroll:'🌀',chaos_stone:'💠',luna_stone:'🌙',star_stone:'⭐',wraith_stone:'👻',monsters_bead:'🔴'};

function renderItemCategoryTabs(){
  const tabs=$el('itemCatTabs');if(!tabs)return;
  tabs.innerHTML=Object.keys(ITEM_CATS).map((cat,i)=>`<button class="tab-btn${i===0?' active':''}" onclick="renderItemSelector('${cat}');this.parentElement.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${cat}</button>`).join('');
  renderItemSelector('Senjata');
}
function renderItemSelector(cat){
  const g=$el('itemSelectorGrid');if(!g)return;
  g.innerHTML=(ITEM_CATS[cat]||[]).map(id=>`<div class="item-cell${selectedItemId===id?' selected':''}" onclick="selectItem('${id}')"><div class="item-icon">${ITEM_ICONS[id]||'📦'}</div><div class="item-name">${id}</div></div>`).join('');
}
function selectItem(id){
  selectedItemId=id;
  document.querySelectorAll('.item-cell').forEach(e=>e.classList.remove('selected'));
  document.querySelector(`.item-cell[onclick*="'${id}'"]`)?.classList.add('selected');
  const info=$el('selectedItemInfo');if(info)info.innerHTML=`<span style="color:var(--gold)">${ITEM_ICONS[id]||'📦'} ${id}</span> dipilih`;
}
async function searchGivePlayer(){
  const q=$el('givePlayerSearch')?.value.trim();if(!q)return;
  const{data}=await SB.from('kn_players').select('char_name,level,faction').ilike('char_name',`%${q}%`).limit(3);
  const res=$el('givePlayerResult');if(!res)return;
  if(!data?.length){res.innerHTML='<span style="color:#e84040">Tidak dijumpai</span>';return;}
  giveTargetChar=data[0];
  res.innerHTML=`✅ ${data[0].char_name} — Lv.${data[0].level} ${data[0].faction==='elmorad'?'🌟':'🔥'}`;
}
async function doGiveItem(){
  if(!giveTargetChar){setStatus('giveStatus','Cari player dahulu!','err');return;}
  if(!selectedItemId){setStatus('giveStatus','Pilih item dahulu!','err');return;}
  const qty=parseInt(getVal('giveQty')||1),enh=parseInt(getVal('giveEnh')||0);
  const{data:pl}=await SB.from('kn_players').select('inventory').eq('char_name',giveTargetChar.char_name).single();
  let inv={};try{inv=typeof pl.inventory==='string'?JSON.parse(pl.inventory||'{}'):pl.inventory||{};}catch{}
  const key=enh>0?`${selectedItemId}_+${enh}_${Date.now()}`:selectedItemId;
  inv[key]=(inv[key]||0)+qty;
  const{error}=await SB.from('kn_players').update({inventory:JSON.stringify(inv)}).eq('char_name',giveTargetChar.char_name);
  if(error){setStatus('giveStatus','❌ '+error.message,'err');return;}
  await addGMLog('give_item',giveTargetChar.char_name,`${qty}x ${selectedItemId}${enh?` +${enh}`:''}`);
  setStatus('giveStatus',`✅ ${qty}x ${ITEM_ICONS[selectedItemId]||''} ${selectedItemId}${enh?` +${enh}`:''} diberikan!`,'ok');
}

// ── EDIT INVENTORY ────────────────────────────────────────────
async function searchInvPlayer(){
  const q=$el('invSearch')?.value.trim();if(!q)return;
  const{data}=await SB.from('kn_players').select('*').ilike('char_name',`%${q}%`).limit(1);
  if(!data?.length){alert('Tidak dijumpai');return;}
  invEditTarget=data[0];setEl('invPlayerName',invEditTarget.char_name);
  const c=$el('invEditCard');if(c)c.style.display='block';
  showInvTab('bag');
}
function showInvTab(tab){
  document.querySelectorAll('.inv-tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  const el=$el('invTabContent');if(!el||!invEditTarget)return;
  let inv={},eq={};
  try{inv=typeof invEditTarget.inventory==='string'?JSON.parse(invEditTarget.inventory||'{}'):invEditTarget.inventory||{};}catch{}
  try{eq=typeof invEditTarget.equipment==='string'?JSON.parse(invEditTarget.equipment||'{}'):invEditTarget.equipment||{};}catch{}
  if(tab==='bag'){
    const items=Object.entries(inv);
    if(!items.length){el.innerHTML='<div style="color:var(--muted);padding:10px">Bag kosong</div>';return;}
    el.innerHTML=items.map(([id,qty])=>`<div class="inv-chip"><div class="inv-chip-info"><span style="font-size:1.2rem">${ITEM_ICONS[id.split('_+')[0]]||ITEM_ICONS[id]||'📦'}</span><span class="inv-chip-id">${id}</span></div><div style="display:flex;align-items:center;gap:8px"><span class="inv-chip-qty">×${qty}</span><button class="btn btn-red btn-xs" onclick="removeInvItem('${id}')">✕</button></div></div>`).join('');
  }else if(tab==='equip'){
    el.innerHTML=['weapon','armor','helmet','gloves','boots','ring1','ring2','amulet','earring'].map(s=>`<div class="inv-chip"><span style="font-family:Cinzel,serif;font-size:.62rem;color:var(--muted);width:70px;flex-shrink:0">${s}</span><span style="font-family:Share Tech Mono,monospace;font-size:.65rem;flex:1;color:${eq[s]?'var(--gold)':'var(--muted)'}">${eq[s]||'(kosong)'}</span>${eq[s]?`<button class="btn btn-red btn-xs" onclick="unequipSlot('${s}')">Buang</button>`:''}</div>`).join('');
  }else{
    el.innerHTML=`<div style="display:flex;flex-direction:column;gap:8px"><div><label class="form-label">ID Item</label><input class="gm-inp" id="addInvItemId" placeholder="cth: hpot_lg, chaos_stone..."></div><div class="form-row"><div class="form-group"><label class="form-label">Kuantiti</label><input type="number" class="gm-inp" id="addInvQty" value="1" min="1"></div><div class="form-group"><label class="form-label">Enhancement +</label><input type="number" class="gm-inp" id="addInvEnh" value="0" min="0" max="9"></div></div><div style="display:flex;flex-wrap:wrap;gap:4px">${Object.values(ITEM_CATS).flat().map(id=>`<span onclick="$el('addInvItemId').value='${id}'" style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);border-radius:3px;padding:2px 7px;font-family:Share Tech Mono,monospace;font-size:.58rem;cursor:pointer;color:var(--gold)">${ITEM_ICONS[id]||'📦'} ${id}</span>`).join('')}</div><button class="btn btn-gold btn-full" onclick="addInvItem()">➕ Tambah Item</button></div>`;
  }
}
async function removeInvItem(itemId){
  if(!invEditTarget||!confirm(`Buang ${itemId}?`))return;
  let inv={};try{inv=typeof invEditTarget.inventory==='string'?JSON.parse(invEditTarget.inventory||'{}'):invEditTarget.inventory||{};}catch{}
  delete inv[itemId];
  await SB.from('kn_players').update({inventory:JSON.stringify(inv)}).eq('char_name',invEditTarget.char_name);
  invEditTarget.inventory=JSON.stringify(inv);
  await addGMLog('remove_item',invEditTarget.char_name,`Buang: ${itemId}`);
  setStatus('invStatus',`✅ ${itemId} dibuang`,'ok');showInvTab('bag');
}
async function unequipSlot(slot){
  if(!invEditTarget||!confirm(`Buang item dari slot ${slot}?`))return;
  let eq={};try{eq=typeof invEditTarget.equipment==='string'?JSON.parse(invEditTarget.equipment||'{}'):invEditTarget.equipment||{};}catch{}
  eq[slot]=null;
  await SB.from('kn_players').update({equipment:JSON.stringify(eq)}).eq('char_name',invEditTarget.char_name);
  invEditTarget.equipment=JSON.stringify(eq);
  await addGMLog('unequip',invEditTarget.char_name,`Slot: ${slot}`);
  setStatus('invStatus',`✅ Slot ${slot} dikosongkan`,'ok');showInvTab('equip');
}
async function addInvItem(){
  const id=$el('addInvItemId')?.value.trim(),qty=+($el('addInvQty')?.value||1),enh=+($el('addInvEnh')?.value||0);
  if(!id||!invEditTarget)return;
  let inv={};try{inv=typeof invEditTarget.inventory==='string'?JSON.parse(invEditTarget.inventory||'{}'):invEditTarget.inventory||{};}catch{}
  const key=enh>0?`${id}_+${enh}_${Date.now()}`:id;
  inv[key]=(inv[key]||0)+qty;
  await SB.from('kn_players').update({inventory:JSON.stringify(inv)}).eq('char_name',invEditTarget.char_name);
  invEditTarget.inventory=JSON.stringify(inv);
  await addGMLog('add_item',invEditTarget.char_name,`+${qty}x ${id}${enh?` +${enh}`:''}`);
  setStatus('invStatus',`✅ ${qty}x ${id}${enh?` +${enh}`:''} ditambah!`,'ok');showInvTab('bag');
}

// ── STAT INVESTOR ─────────────────────────────────────────────
async function searchSIPlayer(){
  const q=$el('siSearch')?.value.trim();if(!q)return;
  const{data}=await SB.from('kn_players').select('*').ilike('char_name',`%${q}%`).limit(1);
  if(!data?.length){alert('Tidak dijumpai');return;}
  siTarget=data[0];setEl('siPlayerName',siTarget.char_name);
  const c=$el('siCard');if(c)c.style.display='block';
  setVal('siStr',siTarget.stat_str||70);setVal('siVit',siTarget.stat_hp||70);
  setVal('siDex',siTarget.stat_dex||65);setVal('siInt',siTarget.stat_int||55);setVal('siWis',siTarget.stat_mp||55);
  const info=$el('siPlayerInfo');
  if(info)info.innerHTML=`<div class="inv-chip" style="font-family:Share Tech Mono,monospace;font-size:.68rem"><span>Lv.${siTarget.level} | 💰${(siTarget.gold||0).toLocaleString()}</span><span>StatPts:<span style="color:var(--gold)">${siTarget.stat_pts||0}</span></span></div>`;
}
function siPreset(t){const P={balanced:{str:70,vit:70,dex:65,int:55,wis:55},warrior:{str:200,vit:150,dex:80,int:40,wis:40},mage:{str:40,vit:80,dex:60,int:250,wis:200},rogue:{str:100,vit:80,dex:220,int:50,wis:50},max:{str:999,vit:999,dex:999,int:999,wis:999}}[t];if(!P)return;setVal('siStr',P.str);setVal('siVit',P.vit);setVal('siDex',P.dex);setVal('siInt',P.int);setVal('siWis',P.wis);}
async function addStatPoints(){
  if(!siTarget)return;
  const sp=+getVal('siStatPts')||0,dp=+getVal('siDiamondPts')||0;
  const upd={};
  if(sp>0)upd.stat_pts=(siTarget.stat_pts||0)+sp;
  if(dp>0){let tree={};try{tree=typeof siTarget.skill_tree==='string'?JSON.parse(siTarget.skill_tree||'{}'):siTarget.skill_tree||{};}catch{}tree._points=(tree._points||0)+dp;upd.skill_tree=JSON.stringify(tree);}
  if(!Object.keys(upd).length)return;
  await SB.from('kn_players').update(upd).eq('char_name',siTarget.char_name);
  await addGMLog('give_points',siTarget.char_name,`+${sp} StatPts +${dp} DiamondPts`);
  setStatus('siStatus',`✅ +${sp} stat pts, +${dp} diamond pts!`,'ok');
  searchSIPlayer();
}
async function saveStatInvestor(){
  if(!siTarget)return;
  const upd={stat_str:+getVal('siStr')||70,stat_hp:+getVal('siVit')||70,stat_dex:+getVal('siDex')||65,stat_int:+getVal('siInt')||55,stat_mp:+getVal('siWis')||55};
  await SB.from('kn_players').update(upd).eq('char_name',siTarget.char_name);
  await addGMLog('set_stat',siTarget.char_name,`STR:${upd.stat_str} VIT:${upd.stat_hp} DEX:${upd.stat_dex}`);
  setStatus('siStatus','✅ Stat disimpan!','ok');
}
async function teleportAndGold(){
  if(!siTarget)return;
  const zone=getVal('siZone')||'moradon',gold=+getVal('siGold')||0;
  const upd={current_zone:zone};if(gold>0)upd.gold=(siTarget.gold||0)+gold;
  await SB.from('kn_players').update(upd).eq('char_name',siTarget.char_name);
  await addGMLog('teleport',siTarget.char_name,`→ ${zone}${gold?` +${gold}g`:''}`);
  setStatus('siStatus',`✅ ${siTarget.char_name} → ${zone}${gold?` (+${gold}g)`:''}`,'ok');
}

// ── TOP-UP ────────────────────────────────────────────────────
async function loadTopupRequests(){
  const{data}=await SB.from('kn_topup_requests').select('*').eq('status','pending').order('created_at',{ascending:false});
  const tb=$el('topupRequestBody');if(!tb)return;
  if(!data?.length){tb.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:16px">Tiada permohonan</td></tr>';return;}
  tb.innerHTML=data.map(r=>`<tr><td style="color:var(--gold)">${r.char_name||'?'}</td><td>${r.full_name||'-'}</td><td style="color:var(--gold)">RM ${r.amount_rm||0}</td><td style="color:var(--purple)">💎 ${r.points_req||0}</td><td style="font-size:.6rem;color:var(--muted)">${r.ref_no||'-'}</td><td style="font-size:.6rem;color:var(--muted)">${new Date(r.created_at).toLocaleDateString('ms-MY')}</td><td><button class="btn btn-green btn-xs" onclick="approveTopup('${r.id}','${r.char_name}',${r.points_req||0})">✅</button> <button class="btn btn-red btn-xs" onclick="rejectTopup('${r.id}')">❌</button></td></tr>`).join('');
}
async function approveTopup(reqId,charName,pts){
  try{
    await SB.from('kn_topup_requests').update({status:'approved',approved_by:gmUser.username,approved_at:new Date().toISOString()}).eq('id',reqId);
    const{data:pl}=await SB.from('kn_players').select('skill_tree').eq('char_name',charName).single();
    let tree={};try{tree=typeof pl.skill_tree==='string'?JSON.parse(pl.skill_tree||'{}'):pl.skill_tree||{};}catch{}
    tree._points=(tree._points||0)+pts;
    await SB.from('kn_players').update({skill_tree:JSON.stringify(tree)}).eq('char_name',charName);
    await addGMLog('approve_topup',charName,`+${pts} pts`);
    loadTopupRequests();alert(`✅ ${pts} points → ${charName}!`);
  }catch(e){alert('Error: '+e.message);}
}
async function rejectTopup(reqId){if(!confirm('Tolak?'))return;await SB.from('kn_topup_requests').update({status:'rejected',approved_by:gmUser.username}).eq('id',reqId);loadTopupRequests();}

async function generateTopupCodes(){
  const pts=+getVal('codePoints')||100,qty=Math.min(50,+getVal('codeQty')||1),prefix=(getVal('codePrefix')||'TOPUP').toUpperCase();
  _genCodes=[];const rows=[];
  for(let i=0;i<qty;i++){const code=prefix+'-'+Math.random().toString(36).slice(2,8).toUpperCase();_genCodes.push(code);rows.push({code,points:pts,created_by:gmUser?.username,used:false,created_at:new Date().toISOString()});}
  try{
    await SB.from('kn_topup_codes').insert(rows);
    const el=$el('generatedCodes');
    if(el){el.style.display='block';const cl=$el('codesList');if(cl)cl.innerHTML=_genCodes.map(c=>`<div style="color:var(--gold);letter-spacing:.15em">${c} <span style="color:var(--muted);font-size:.6rem">— ${pts} pts</span></div>`).join('');}
    setStatus('codeStatus',`✅ ${qty} kod dijana!`,'ok');
    await addGMLog('create_codes',`${qty}x`,`${pts}pts prefix:${prefix}`);
  }catch(e){setStatus('codeStatus','Error: '+e.message,'err');}
}
function copyAllCodes(){navigator.clipboard?.writeText(_genCodes.join('\n')).then(()=>alert('Disalin!')).catch(()=>prompt('Salin:',_genCodes.join('\n')));}
async function grantPointsManual(){
  const name=$el('grantCharName')?.value.trim(),pts=+getVal('grantPoints')||0,reason=$el('grantReason')?.value.trim()||'GM Grant';
  if(!name||pts<1){setStatus('grantStatus','Isi semua!','err');return;}
  const{data:pl}=await SB.from('kn_players').select('skill_tree').eq('char_name',name).single();
  if(!pl){setStatus('grantStatus','Tidak dijumpai!','err');return;}
  let tree={};try{tree=typeof pl.skill_tree==='string'?JSON.parse(pl.skill_tree||'{}'):pl.skill_tree||{};}catch{}
  tree._points=(tree._points||0)+pts;
  await SB.from('kn_players').update({skill_tree:JSON.stringify(tree)}).eq('char_name',name);
  await addGMLog('grant_points',name,`+${pts} — ${reason}`);
  setStatus('grantStatus',`✅ ${pts} pts diberikan!`,'ok');
}

// ── BAN / UNBAN ───────────────────────────────────────────────
async function loadBanList(){
  const{data}=await SB.from('kn_bans').select('*').order('created_at',{ascending:false});
  const tb=$el('banTbody');if(!tb)return;
  if(!data?.length){tb.innerHTML='<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:16px">Tiada ban</td></tr>';return;}
  tb.innerHTML=data.map(b=>`<tr><td style="color:#e84040">${b.char_name}</td><td>${b.reason||'-'}</td><td style="font-size:.6rem;color:var(--muted)">${new Date(b.created_at).toLocaleDateString('ms-MY')}</td><td><button class="btn btn-green btn-xs" onclick="doUnban('${b.char_name}')">Unban</button></td></tr>`).join('');
}
async function doBan(){
  const name=$el('banName')?.value.trim(),reason=$el('banReason')?.value.trim()||'Melanggar peraturan';
  if(!name){setStatus('banStatus','Masukkan nama!','err');return;}
  const{data:pl}=await SB.from('kn_players').select('account_id').eq('char_name',name).maybeSingle();
  if(!pl){setStatus('banStatus','Tidak dijumpai!','err');return;}
  await SB.from('kn_bans').insert({char_name:name,account_id:pl.account_id,reason,banned_by:gmUser?.username,created_at:new Date().toISOString()});
  await SB.from('kn_players').update({banned:true}).eq('char_name',name);
  await addGMLog('ban',name,reason);
  setStatus('banStatus',`✅ ${name} di-ban!`,'ok');loadBanList();
}
async function doUnban(name){
  if(!confirm(`Unban ${name}?`))return;
  await SB.from('kn_bans').delete().eq('char_name',name);
  await SB.from('kn_players').update({banned:false}).eq('char_name',name);
  await addGMLog('unban',name,'Unban');loadBanList();
}

// ── BROADCAST ─────────────────────────────────────────────────
const BCAST_TEMPLATES={maintenance:'⚠️ Server maintenance dalam 10 minit. Sila log keluar.',event:'🎉 EVENT KHAS! Double EXP aktif selama 1 jam!',update:'🔄 Update baru! Sila refresh.',warning:'🚨 Amaran: Cheat/exploit = BAN KEKAL.',welcome:'⚔️ Selamat datang ke Pahlawan Terakhir!'};
function setTemplate(key){const e=$el('broadcastMsg');if(e)e.value=BCAST_TEMPLATES[key]||'';}
async function doBroadcast(){
  const msg=$el('broadcastMsg')?.value.trim(),type=$el('broadcastType')?.value||'info';
  if(!msg){setStatus('broadcastStatus','Masukkan mesej!','err');return;}
  try{
    const ch=SB.channel('ko_world');
    await ch.send({type:'broadcast',event:'gm_broadcast',payload:{msg,type,from:gmUser?.username,ts:Date.now()}});
    await SB.from('kn_broadcast').insert({message:msg,type,sent_by:gmUser?.username,created_at:new Date().toISOString()});
    await addGMLog('broadcast',gmUser?.username||'?',msg.slice(0,50));
    setStatus('broadcastStatus','✅ Dihantar!','ok');loadBroadcastHistory();
  }catch(e){setStatus('broadcastStatus','Error: '+e.message,'err');}
}
async function loadBroadcastHistory(){
  const{data}=await SB.from('kn_broadcast').select('*').order('created_at',{ascending:false}).limit(10);
  const tb=$el('broadcastHistory');if(!tb)return;
  tb.innerHTML=(data||[]).map(b=>`<tr><td style="font-size:.72rem">${b.message}</td><td style="color:var(--muted);font-size:.6rem">${b.sent_by}</td><td style="color:var(--muted);font-size:.6rem">${new Date(b.created_at).toLocaleString('ms-MY')}</td></tr>`).join('');
}

// ── GM LOG ────────────────────────────────────────────────────
async function addGMLog(action,target,detail){
  if(!SB||!gmUser)return;
  try{await SB.from('kn_gm_log').insert({gm_name:gmUser.username,action,target,detail,created_at:new Date().toISOString()});}catch{}
}
async function loadGMLog(){
  const{data}=await SB.from('kn_gm_log').select('*').order('created_at',{ascending:false}).limit(50);
  const tb=$el('gmLogBody');if(!tb)return;
  tb.innerHTML=(data||[]).map(l=>`<tr><td class="log-action">${l.action||'?'}</td><td class="log-target" style="color:var(--gold)">${l.gm_name}</td><td class="log-target">${l.target||'-'}</td><td class="log-detail">${l.detail||'-'}</td><td class="log-time">${new Date(l.created_at).toLocaleString('ms-MY')}</td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:16px">Tiada log</td></tr>';
}

// ── CONFIRM ───────────────────────────────────────────────────
function confirmAction(title,msg,cb){
  confirmCallback=cb;
  setEl('confirmTitle',title);setEl('confirmMsg',msg);
  $el('confirmModal')?.classList.remove('off');
  const ok=$el('confirmOk');if(ok)ok.onclick=()=>{if(confirmCallback)confirmCallback();closeConfirm();};
}
function closeConfirm(){$el('confirmModal')?.classList.add('off');confirmCallback=null;}

// ── EXTRA FUNCTIONS ──────────────────────────────────────────

// filterPlayers - job filter support
function filterPlayers(){
  const q=(($el('playerSearch')?.value)||'').toLowerCase();
  const fac=$el('playerFacFilter')?.value||'';
  const job=$el('playerJobFilter')?.value||'';
  filteredPlayers=allPlayers.filter(p=>{
    const mQ=!q||p.char_name?.toLowerCase().includes(q);
    const mF=!fac||p.faction===fac||(fac==='elmorad'&&p.faction==='cahaya');
    const mJ=!job||p.job===job;
    return mQ&&mF&&mJ;
  });
  renderPlayerTable();
  const cnt=$el('playerCount');
  if(cnt)cnt.textContent=`Menunjukkan ${filteredPlayers.length} / ${allPlayers.length} player`;
}

// renderPlayerTable - full version with zone
function renderPlayerTable(){
  const tb=$el('playerTbody');if(!tb)return;
  tb.innerHTML=filteredPlayers.map((p,i)=>{
    const isEl=p.faction==='elmorad'||p.faction==='cahaya';
    const jobIcon={warrior:'⚔️',rogue:'🗡️',magician:'🔮',priest:'✨'}[p.job]||'?';
    return`<tr>
      <td><span class="pl-faction-${isEl?'el':'kr'}">${p.char_name||'?'}</span></td>
      <td style="color:var(--gold)">${p.level||1}</td>
      <td>${(p.gold||0).toLocaleString()}</td>
      <td>${isEl?'🌟 El':'🔥 Kr'}</td>
      <td>${jobIcon} ${p.job||'?'}</td>
      <td style="font-size:.62rem;color:var(--muted)">${p.current_zone||'?'}</td>
      <td><div class="pl-actions">
        <button class="btn btn-gold btn-xs" onclick="quickEditPlayer('${p.char_name}')">✏️</button>
        <button class="btn btn-green btn-xs" onclick="quickInv('${p.char_name}')">🎒</button>
        <button class="btn btn-blue btn-xs" onclick="quickGiveItem('${p.char_name}')">🎁</button>
        <button class="btn btn-red btn-xs" onclick="quickBan('${p.char_name}')">🚫</button>
      </div></td>
    </tr>`;
  }).join('')||'<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:20px">Tiada player</td></tr>';
  const cnt=$el('playerCount');
  if(cnt)cnt.textContent=`${filteredPlayers.length} / ${allPlayers.length} player`;
}
function quickInv(name){showPage('editInventory').then(()=>{const e=$el('invSearch');if(e){e.value=name;searchInvPlayer();}});}

// loadDashboard - full version
async function loadDashboard(){
  try{
    const[{count:total,data:topPlayers},{count:banned},{count:topupQ},{data:recentLog}]=await Promise.all([
      SB.from('kn_players').select('char_name,level,faction',{count:'exact'}).order('level',{ascending:false}).limit(8),
      SB.from('kn_bans').select('*',{count:'exact',head:true}),
      SB.from('kn_topup_requests').select('*',{count:'exact',head:true}).eq('status','pending'),
      SB.from('kn_gm_log').select('*').order('created_at',{ascending:false}).limit(5),
    ]);
    setEl('statTotalPlayers',total||0);
    setEl('statBanned',banned||0);
    setEl('statTopupPending',topupQ||0);
    setEl('dashGMName',gmUser?.username||'—');
    const elCount=(topPlayers||[]).filter(p=>p.faction==='elmorad'||p.faction==='cahaya').length;
    const krCount=(topPlayers||[]).filter(p=>p.faction==='karus'||p.faction==='gelap').length;
    setEl('statElmorad',elCount);setEl('statKarus',krCount);
    const maxLv=topPlayers?.[0]?.level||0;setEl('statMaxLv',maxLv);
    // Top players table
    const rb=$el('recentPlayers');
    if(rb)rb.innerHTML=(topPlayers||[]).map((p,i)=>{
      const isEl=p.faction==='elmorad'||p.faction==='cahaya';
      return`<tr><td style="color:var(--muted)">${i+1}</td><td><span class="pl-faction-${isEl?'el':'kr'}">${p.char_name}</span></td><td>${p.level||1}</td><td>${isEl?'🌟':'🔥'}</td><td><button class="btn btn-gold btn-xs" onclick="quickEditPlayer('${p.char_name}')">Edit</button></td></tr>`;
    }).join('');
    // Recent log
    const rl=$el('dashRecentLog');
    if(rl)rl.innerHTML=(recentLog||[]).map(l=>`<tr><td class="log-action">${l.action}</td><td style="color:var(--gold);font-family:Share Tech Mono,monospace;font-size:.65rem">${l.gm_name}</td><td class="log-target">${l.target||'-'}</td><td class="log-detail">${l.detail||'-'}</td><td class="log-time">${new Date(l.created_at).toLocaleString('ms-MY')}</td></tr>`).join('');
  }catch(e){console.error('Dashboard error:',e);}
}

// filterLog for gmLog page
let allLogs=[];
async function loadGMLog(){
  const{data}=await SB.from('kn_gm_log').select('*').order('created_at',{ascending:false}).limit(200);
  allLogs=data||[];filterLog();
}
function filterLog(){
  const q=(($el('logSearch')?.value)||'').toLowerCase();
  const act=$el('logActionFilter')?.value||'';
  const filtered=allLogs.filter(l=>{
    const mQ=!q||(l.target||'').toLowerCase().includes(q)||(l.gm_name||'').toLowerCase().includes(q)||(l.detail||'').toLowerCase().includes(q);
    const mA=!act||l.action===act;
    return mQ&&mA;
  });
  const tb=$el('gmLogBody');if(!tb)return;
  tb.innerHTML=filtered.map(l=>`<tr><td class="log-action">${l.action||'?'}</td><td style="color:var(--gold);font-family:Share Tech Mono,monospace;font-size:.65rem">${l.gm_name}</td><td class="log-target">${l.target||'-'}</td><td class="log-detail">${l.detail||'-'}</td><td class="log-time">${new Date(l.created_at).toLocaleString('ms-MY')}</td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:16px">Tiada log</td></tr>';
}

// invCurrentTab tracker
let invCurrentTab='bag';
const _origShowInvTab=showInvTab;
function showInvTab(tab){invCurrentTab=tab;_origShowInvTab(tab);}
