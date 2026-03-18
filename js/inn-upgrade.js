'use strict';
/* ═══════════════════════════════════════════════════════════════
   KO Classic — Inn & Blacksmith Upgrade System v2
   ▸ Inn: Rehat, Buff, Simpan, Repair
   ▸ Blacksmith: Upgrade +1~+9 dengan animasi penuh
   ▸ Reversal: +9 → R+1 R+2 R+3
   ▸ Craft: Buat item dari bahan
   ▸ Protection: Lindungi item dari hancur
   ▸ Decompose: Pecah item jadi bahan
   ═══════════════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════
// INN SYSTEM
// ══════════════════════════════════════════════════
const INN_SERVICES=[
  {id:'rest_basic',   name:'🛌 Rehat Biasa',    icon:'🛌',cost:50,  desc:'Pulih HP & MP sepenuhnya.',              effect:{healFull:true}},
  {id:'rest_premium', name:'✨ Rehat Premium',   icon:'✨',cost:300, desc:'Pulih + EXP ×1.5 selama 10 minit.',     effect:{healFull:true,expBuff:1.5,buffDur:600}},
  {id:'buff_atk',     name:'⚔️ Berkat Pejuang',  icon:'⚔️',cost:200, desc:'ATK +20% selama 5 minit.',              effect:{atkBuff:1.2,buffDur:300}},
  {id:'buff_def',     name:'🛡️ Berkat Perisai',  icon:'🛡️',cost:200, desc:'DEF +25% selama 5 minit.',              effect:{defBuff:1.25,buffDur:300}},
  {id:'buff_spd',     name:'💨 Berkat Angin',    icon:'💨',cost:150, desc:'Speed +30% selama 3 minit.',            effect:{spdBuff:1.3,buffDur:180}},
  {id:'buff_all',     name:'🌟 Berkat Penuh',    icon:'🌟',cost:600, desc:'ATK+DEF+SPD +20% selama 10 minit.',    effect:{atkBuff:1.2,defBuff:1.2,spdBuff:1.2,buffDur:600}},
  {id:'repair',       name:'🔧 Baiki Semua',     icon:'🔧',cost:500, desc:'Baiki semua peralatan yang rosak.',     effect:{repair:true}},
  {id:'save',         name:'💾 Simpan',          icon:'💾',cost:0,   desc:'Simpan progress ke pelayan.',           effect:{save:true}},
];

const innBuffs={
  exp: {active:false,multiplier:1.0,remaining:0},
  atk: {active:false,multiplier:1.0,remaining:0},
  def: {active:false,multiplier:1.0,remaining:0},
  spd: {active:false,multiplier:1.0,remaining:0},
};

function tickInnBuffs(dt){
  let changed=false;
  for(const[k,b]of Object.entries(innBuffs)){
    if(!b.active)continue;
    b.remaining-=dt;
    if(b.remaining<=0){b.remaining=0;b.active=false;b.multiplier=1.0;changed=true;addChat('','⏱️ Buff '+k.toUpperCase()+' tamat.','system')}
  }
  if(changed&&window.G.pl)window.G.pl.applyChar(window.selChar);
  updateInnBuffHUD();
}
function updateInnBuffHUD(){
  const el=document.getElementById('innBuffBar');if(!el)return;
  const active=Object.entries(innBuffs).filter(([,b])=>b.active);
  if(!active.length){el.style.display='none';return}
  el.style.display='flex';
  el.innerHTML=active.map(([k,b])=>{
    const icons={exp:'✨',atk:'⚔️',def:'🛡️',spd:'💨'};
    const m=Math.floor(b.remaining/60),s=Math.floor(b.remaining%60);
    return`<div class="inn-buff-chip">${icons[k]||'✦'} ×${b.multiplier.toFixed(1)} <span>${m}:${s.toString().padStart(2,'0')}</span></div>`;
  }).join('');
}
function applyInnBuff(effect){
  if(effect.healFull&&window.G.pl){window.G.pl.hp=window.G.pl.maxHp;window.G.pl.mp=window.G.pl.maxMp;window.G.fts?.push(new FT(window.G.pl.x,window.G.pl.y-50,'✨ PULIH PENUH!','#40e860',16))}
  if(effect.expBuff) {innBuffs.exp={active:true,multiplier:effect.expBuff,remaining:effect.buffDur};addChat('','✨ EXP ×'+effect.expBuff+' aktif!','system')}
  if(effect.atkBuff) {innBuffs.atk={active:true,multiplier:effect.atkBuff,remaining:effect.buffDur};if(window.G.pl)window.G.pl.atk*=effect.atkBuff}
  if(effect.defBuff) {innBuffs.def={active:true,multiplier:effect.defBuff,remaining:effect.buffDur};if(window.G.pl)window.G.pl.def*=effect.defBuff}
  if(effect.spdBuff) {innBuffs.spd={active:true,multiplier:effect.spdBuff,remaining:effect.buffDur};if(window.G.pl)window.G.pl.speed*=effect.spdBuff}
  if(effect.save)    {window.saveProgress?.();addChat('','💾 Progress disimpan!','system')}
  if(effect.repair)  addChat('','🔧 Semua peralatan dibaiki!','system');
  updateInnBuffHUD();
}

function openInn(npcId){
  const npc=window.NPCS[npcId]||window.NPCS['innkeeper'];
  if(typeof Audio!=='undefined')Audio.playSFX('npc_talk');
  const p=document.getElementById('innPanel');if(!p)return;
  p.classList.remove('off');renderInn(npc);
}
function renderInn(npc){
  const body=document.getElementById('innBody'),title=document.getElementById('innTitle');
  if(!body)return;if(title)title.textContent=(npc?.icon||'🏠')+' '+(npc?.name||'Inn');
  const gold=window.selChar?.gold||0;
  const activeBuffs=Object.entries(innBuffs).filter(([,b])=>b.active);
  let html=`<div style="font-family:'Crimson Text',serif;font-size:.8rem;color:var(--muted);padding:8px 10px;
    background:rgba(0,0,0,.3);border-radius:4px;margin-bottom:10px;line-height:1.6">
    "${npc?.dialog||'Selamat datang! Apa yang kamu perlukan?'}"</div>
  <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--gold);
    text-align:right;margin-bottom:10px">💰 ${gold.toLocaleString()} Gold</div>`;
  if(activeBuffs.length){
    html+=`<div style="background:rgba(64,200,64,.08);border:1px solid rgba(64,200,64,.2);
      border-radius:4px;padding:8px;margin-bottom:10px">
      <div style="font-family:'Cinzel',serif;font-size:.6rem;color:var(--green);letter-spacing:.1em;margin-bottom:4px">✅ BUFF AKTIF</div>`;
    activeBuffs.forEach(([k,b])=>{
      const icons={exp:'✨',atk:'⚔️',def:'🛡️',spd:'💨'};
      const m=Math.floor(b.remaining/60),s=Math.floor(b.remaining%60);
      html+=`<div style="display:flex;justify-content:space-between;font-family:'Share Tech Mono',monospace;font-size:.6rem;color:var(--parch)">
        <span>${icons[k]||'✦'} ${k.toUpperCase()} ×${b.multiplier.toFixed(1)}</span>
        <span style="color:var(--green)">${m}:${s.toString().padStart(2,'0')}</span></div>`;
    });
    html+=`</div>`;
  }
  html+=`<div style="display:flex;flex-direction:column;gap:6px">`;
  INN_SERVICES.forEach(svc=>{
    const ok=gold>=svc.cost;
    html+=`<div style="background:rgba(0,0,0,.32);border:1px solid rgba(201,168,76,${ok?'.15':'.05'});
      border-radius:5px;padding:9px 10px;display:flex;align-items:center;gap:9px;${ok?'':'opacity:.5'}">
      <span style="font-size:1.3rem;flex-shrink:0">${svc.icon}</span>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:.73rem;color:var(--gold)">${svc.name}</div>
        <div style="font-family:'Crimson Text',serif;font-size:.65rem;color:var(--muted)">${svc.desc}</div>
      </div>
      <div style="flex-shrink:0;text-align:right">
        <div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:${svc.cost?'var(--gold)':'var(--green)'};margin-bottom:3px">
          ${svc.cost?svc.cost+'g':'Percuma'}</div>
        <button class="btn btn-gold btn-xs" ${ok?'':'disabled'}
          onclick="buyInnService('${svc.id}')"
          style="${ok?'':'opacity:.4;cursor:not-allowed'}">Beli</button>
      </div></div>`;
  });
  html+=`</div><div class="status-msg" id="innStatus" style="margin-top:8px"></div>`;
  body.innerHTML=html;
}
function buyInnService(svcId){
  const svc=INN_SERVICES.find(s=>s.id===svcId);if(!svc||!window.selChar)return;
  if((window.selChar.gold||0)<svc.cost){setInnStatus('💰 Gold tidak cukup!','err');return}
  window.selChar.gold-=svc.cost;applyInnBuff(svc.effect);
  if(typeof Audio!=='undefined')Audio.playSFX(svc.effect.healFull?'levelup':'buy');
  setInnStatus('✅ '+svc.name+' berjaya!','ok');
  setTimeout(()=>renderInn(window.NPCS['innkeeper']),800);
}
function setInnStatus(msg,type){
  const el=document.getElementById('innStatus');if(!el)return;
  el.textContent=msg;el.style.color=type==='err'?'#e84040':'#40c840';
  setTimeout(()=>{if(el)el.textContent=''},2500);
}

// ══════════════════════════════════════════════════
// BLACKSMITH UPGRADE SYSTEM
// ══════════════════════════════════════════════════
let upgradeTarget=null;
let isUpgrading=false; // lock semasa animasi

// Kos upgrade per level
function getUpgradeCost(enh){
  const gold = [100,200,400,700,1200,2000,3500,6000,10000][enh]||10000;
  const luna = [1,2,3,4,5,6,7,8,9][enh]||9;
  return {gold,luna};
}

function openBlacksmith(npcId){
  const npc=window.NPCS[npcId]||window.NPCS['blacksmith'];
  if(typeof Audio!=='undefined')Audio.playSFX('npc_talk');
  const p=document.getElementById('blacksmithPanel');if(!p)return;
  p.classList.remove('off');renderBlacksmith(npc);
}
function renderBlacksmith(npc){
  const title=document.getElementById('bsTitle'),body=document.getElementById('bsBody');
  if(!body)return;if(title)title.textContent=(npc?.icon||'⚒️')+' '+(npc?.name||'Pandai Besi');
  const inv=window.selChar?.inventory||{};
  const luna=inv.luna_stone||0,chaos=inv.chaos_stone||0,star=inv.star_stone||0,wraith=inv.wraith_stone||0;
  body.innerHTML=`
  <div style="font-family:'Crimson Text',serif;font-size:.78rem;color:var(--muted);
    padding:8px;background:rgba(0,0,0,.3);border-radius:4px;margin-bottom:10px">
    "${npc?.dialog||'Bawa item kamu untuk ditingkatkan!'}"
  </div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:10px">
    <div class="mat-chip" id="matLuna"><span>🌙</span><span>${luna}</span><span>Luna</span></div>
    <div class="mat-chip" id="matChaos"><span>💠</span><span>${chaos}</span><span>Chaos</span></div>
    <div class="mat-chip" id="matStar"><span>⭐</span><span>${star}</span><span>Star</span></div>
    <div class="mat-chip" id="matWraith"><span>👻</span><span>${wraith}</span><span>Wraith</span></div>
  </div>
  <div class="ov-tabs" id="bsTabs" style="margin-bottom:10px">
    <div class="ov-tab active" onclick="switchBSTab('upgrade')">⬆ Upgrade</div>
    <div class="ov-tab" onclick="switchBSTab('reversal')">🔄 Reversal</div>
    <div class="ov-tab" onclick="switchBSTab('protect')">🛡️ Protect</div>
    <div class="ov-tab" onclick="switchBSTab('craft')">🔨 Craft</div>
    <div class="ov-tab" onclick="switchBSTab('decompose')">🧪 Dekompos</div>
  </div>
  <div id="bsTabContent" style="max-height:55vh;overflow-y:auto"></div>
  <div id="bsStatus" style="font-family:'Cinzel',serif;font-size:.7rem;text-align:center;
    padding:5px;margin-top:4px;min-height:20px"></div>`;
  switchBSTab('upgrade');
}

function switchBSTab(tab){
  document.querySelectorAll('#bsTabs .ov-tab').forEach((el,i)=>{
    el.classList.toggle('active',['upgrade','reversal','protect','craft','decompose'][i]===tab);
  });
  const c=document.getElementById('bsTabContent');if(!c)return;
  if(tab==='upgrade')   renderBSUpgrade(c);
  else if(tab==='reversal')  renderBSReversal(c);
  else if(tab==='protect')   renderBSProtect(c);
  else if(tab==='craft')     renderBSCraft(c);
  else if(tab==='decompose') renderBSDecompose(c);
}

// ── TAB UPGRADE ──────────────────────────────────
function getUpgradeableItems(){
  const eq=window.selChar?.equipment||{},inv=window.selChar?.inventory||{};
  const fromEq=Object.entries(eq).filter(([,iid])=>iid&&window.ITEM_DB[iid]).map(([slot,iid])=>({iid,item:window.ITEM_DB[iid],source:'equip',slot}));
  const fromBag=Object.entries(inv).filter(([iid,qty])=>qty>0&&window.ITEM_DB[iid]&&['weapon','armor','acc'].includes(window.ITEM_DB[iid].type)).map(([iid])=>({iid,item:window.ITEM_DB[iid],source:'bag'}));
  return [...fromEq,...fromBag];
}

function renderBSUpgrade(c){
  const items=getUpgradeableItems();
  const inv=window.selChar?.inventory||{};
  const star=inv.star_stone||0;

  let html=`<div style="font-family:'Cinzel',serif;font-size:.58rem;color:var(--muted);
    letter-spacing:.1em;margin-bottom:6px">PILIH ITEM:</div>`;

  if(!items.length){
    c.innerHTML=html+`<div style="text-align:center;padding:20px;color:var(--muted);font-size:.72rem">
      Tiada item untuk diupgrade.<br>Equip atau simpan item dalam beg dahulu.</div>`;return;
  }

  html+=`<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:10px">`;
  items.forEach(({iid,item})=>{
    const enh=item.enh||0,rev=item.reversal||0;
    const isMax=enh>=9;
    const col=isMax?'#ffd700':enh>=7?'#ff8800':enh>=5?'#aa44ff':enh>=3?'#4488ff':enh>=1?'#40c840':'#aaa';
    const sel=upgradeTarget===iid;
    const prot=item.protected?'🛡️':'';
    html+=`<div onclick="selectUpgrade('${iid}')"
      style="background:rgba(0,0,0,.4);border:1px solid ${sel?'rgba(201,168,76,.8)':'rgba(201,168,76,.12)'};
      border-radius:4px;padding:6px 3px;text-align:center;cursor:pointer;position:relative;
      ${sel?'background:rgba(201,168,76,.12)':''};transition:all .15s">
      <div style="font-size:1.4rem">${item.icon}</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:${col};margin-top:1px">
        +${enh}${rev>0?' R+'+rev:''}${prot}</div>
      ${isMax?`<div style="position:absolute;top:-4px;right:-4px;background:#ffd700;border-radius:50%;
        width:14px;height:14px;font-size:.45rem;display:flex;align-items:center;justify-content:center;color:#000">MAX</div>`:''}
    </div>`;
  });
  html+=`</div>`;

  if(upgradeTarget&&window.ITEM_DB[upgradeTarget]){
    const item=window.ITEM_DB[upgradeTarget],enh=item.enh||0;
    if(enh>=9){
      html+=`<div style="text-align:center;padding:14px;background:rgba(255,215,0,.07);
        border:1px solid rgba(255,215,0,.25);border-radius:5px">
        <div style="font-size:2rem">👑</div>
        <div style="font-family:'Cinzel',serif;font-size:.82rem;color:#ffd700;margin-top:4px">
          ${item.name} +9 — MAKSIMUM!</div>
        <div style="font-family:'Cinzel',serif;font-size:.65rem;color:var(--muted);margin-top:4px">
          Gunakan Reversal untuk tingkatkan lebih lanjut</div>
      </div>`;
    } else {
      html+=renderUpgradePanel(item,enh,inv,star);
    }
  } else {
    html+=`<div style="text-align:center;padding:16px;color:var(--muted);font-size:.7rem;
      border:1px dashed rgba(201,168,76,.1);border-radius:4px">
      ← Pilih item untuk melihat butiran upgrade</div>`;
  }
  c.innerHTML=html;
}

function renderUpgradePanel(item,enh,inv,star){
  const rate=window.ENH_RATES[Math.min(enh,window.ENH_RATES.length-1)];
  const{gold:goldCost,luna:lunaCost}=getUpgradeCost(enh);
  const hasGold=(window.selChar?.gold||0)>=goldCost;
  const hasLuna=(inv.luna_stone||0)>=lunaCost;
  const hasStar=star>0;
  const canNormal=hasGold&&hasLuna;
  const canSafe=hasGold&&hasStar;

  // Stat sekarang & preview
  const calcStat=(base,e)=>base?base+e*Math.floor(base*.08):0;
  const statRows=[];
  if(item.atk)statRows.push({label:'ATK',cur:calcStat(item.atk,enh),next:calcStat(item.atk,enh+1)});
  if(item.def)statRows.push({label:'DEF',cur:calcStat(item.def,enh),next:calcStat(item.def,enh+1)});
  if(item.int)statRows.push({label:'INT',cur:calcStat(item.int,enh),next:calcStat(item.int,enh+1)});

  // Enhancement progress bar (0–9 dengan warna)
  const segments=Array.from({length:9},(_,i)=>{
    const filled=i<enh,current=i===enh;
    const col=i>=7?'#ffd700':i>=5?'#aa44ff':i>=3?'#4488ff':'#40c840';
    return`<div style="flex:1;height:100%;background:${filled?col:current?col+'33':'rgba(255,255,255,.06)'};
      border-right:${i<8?'1px solid rgba(0,0,0,.3)':''};position:relative">
      ${current?`<div style="position:absolute;inset:0;background:${col}33;animation:pulse .8s infinite"></div>`:''}
    </div>`;
  }).join('');

  const riskColor=enh>=7?'#e84040':enh>=5?'#ff8800':enh>=3?'#ffcc44':'#40c840';

  return`
  <!-- Item Card -->
  <div style="background:rgba(0,0,0,.4);border:1px solid rgba(201,168,76,.2);border-radius:6px;
    padding:10px;margin-bottom:8px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <div style="font-size:2.2rem;background:rgba(0,0,0,.3);border-radius:4px;
        padding:6px;border:1px solid rgba(201,168,76,.15)">${item.icon}</div>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:.8rem;color:var(--gold)">${item.name}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:3px">
          <span style="font-family:'Share Tech Mono',monospace;font-size:.72rem;color:#4488ff">+${enh}</span>
          <span style="color:var(--muted)">→</span>
          <span style="font-family:'Share Tech Mono',monospace;font-size:.82rem;color:#40c840;
            text-shadow:0 0 8px rgba(64,200,64,.3)">+${enh+1}</span>
        </div>
        ${item.protected?`<div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:#4488ff">🛡️ Protected</div>`:''}
      </div>
    </div>
    <!-- Enhancement Bar -->
    <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;border:1px solid rgba(0,0,0,.4);margin-bottom:6px">
      ${segments}
    </div>
    <div style="display:flex;justify-content:space-between;font-family:'Share Tech Mono',monospace;font-size:.52rem;color:var(--muted)">
      <span>+0</span><span style="color:var(--gold)">+${enh}</span><span>+9</span>
    </div>
    <!-- Stat preview -->
    ${statRows.map(s=>`
    <div style="display:flex;align-items:center;gap:6px;margin-top:4px;
      font-family:'Share Tech Mono',monospace;font-size:.6rem">
      <span style="color:var(--muted);width:28px">${s.label}</span>
      <span style="color:var(--parch)">${s.cur}</span>
      <span style="color:var(--muted)">→</span>
      <span style="color:#40c840">${s.next}</span>
      <span style="color:var(--green);font-size:.52rem">(+${s.next-s.cur})</span>
    </div>`).join('')}
  </div>

  <!-- Kadar -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px">
    <div style="background:rgba(64,200,64,.1);border:1px solid rgba(64,200,64,.2);
      border-radius:4px;padding:6px;text-align:center">
      <div style="font-family:'Cinzel Decorative',serif;font-size:.95rem;color:#40c840">${rate.success}%</div>
      <div style="font-family:'Cinzel',serif;font-size:.5rem;color:var(--muted)">✅ Berjaya</div>
    </div>
    <div style="background:rgba(255,140,0,.1);border:1px solid rgba(255,140,0,.2);
      border-radius:4px;padding:6px;text-align:center">
      <div style="font-family:'Cinzel Decorative',serif;font-size:.95rem;color:#ff8800">${rate.fail}%</div>
      <div style="font-family:'Cinzel',serif;font-size:.5rem;color:var(--muted)">❌ Gagal</div>
    </div>
    <div style="background:rgba(232,64,64,.1);border:1px solid ${item.protected?'rgba(68,136,255,.3)':'rgba(232,64,64,.2)'};
      border-radius:4px;padding:6px;text-align:center">
      <div style="font-family:'Cinzel Decorative',serif;font-size:.95rem;color:${item.protected?'#4488ff':'#e84040'}">${item.protected?'0':rate.break}%</div>
      <div style="font-family:'Cinzel',serif;font-size:.5rem;color:var(--muted)">${item.protected?'🛡️ Safe':'💥 Hancur'}</div>
    </div>
  </div>

  <!-- Kos -->
  <div style="background:rgba(0,0,0,.3);border-radius:4px;padding:8px;margin-bottom:8px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-family:'Share Tech Mono',monospace;font-size:.62rem">
      <div style="color:var(--muted)">Gold:</div>
      <div style="color:${hasGold?'var(--gold)':'#e84040'};text-align:right">${goldCost.toLocaleString()} g</div>
      <div style="color:var(--muted)">🌙 Luna Stone:</div>
      <div style="color:${hasLuna?'#40c840':'#e84040'};text-align:right">${lunaCost}x (ada ${inv.luna_stone||0})</div>
      <div style="color:var(--muted)">⭐ Star Stone (Safe):</div>
      <div style="color:${hasStar?'#40c840':'#e84040'};text-align:right">1x (ada ${star})</div>
    </div>
  </div>

  <!-- Risiko indicator -->
  <div style="display:flex;align-items:center;gap:5px;margin-bottom:8px;
    font-family:'Share Tech Mono',monospace;font-size:.58rem">
    <span style="color:var(--muted)">Tahap Risiko:</span>
    <div style="flex:1;height:4px;background:rgba(0,0,0,.4);border-radius:2px;overflow:hidden">
      <div style="height:100%;width:${(enh/9*100).toFixed(0)}%;background:${riskColor};border-radius:2px;transition:width .5s"></div>
    </div>
    <span style="color:${riskColor}">${['Selamat','Rendah','Rendah','Sederhana','Sederhana','Tinggi','Tinggi','Sangat Tinggi','Bahaya','KRITIS'][enh]}</span>
  </div>

  <!-- Butang Upgrade -->
  <div id="upgradeAnimArea" style="margin-bottom:6px"></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
    <button class="btn btn-gold" onclick="doUpgrade(false)"
      ${canNormal?'':'disabled'} style="${canNormal?'':'opacity:.4;cursor:not-allowed'};padding:10px;font-size:.7rem">
      ⬆ Upgrade Normal
    </button>
    <button onclick="doUpgrade(true)"
      ${canSafe?'':'disabled'}
      style="padding:10px;font-family:'Cinzel',serif;font-size:.68rem;font-weight:700;
        letter-spacing:.08em;border-radius:4px;cursor:${canSafe?'pointer':'not-allowed'};
        ${canSafe?'background:rgba(68,136,255,.18);border:1px solid rgba(68,136,255,.5);color:#4488ff':
          'background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.05);color:#555;opacity:.5'}">
      ⭐ Safe (Star Stone)
    </button>
  </div>`;
}

function selectUpgrade(iid){
  upgradeTarget=iid;
  switchBSTab('upgrade');
}

async function doUpgrade(safe){
  if(!upgradeTarget||isUpgrading)return;
  const item=window.ITEM_DB[upgradeTarget];if(!item)return;
  const enh=item.enh||0;if(enh>=9){setBSStatus('Sudah +9 maksimum!','err');return}

  const inv=window.selChar?.inventory||{};
  const{gold:goldCost,luna:lunaCost}=getUpgradeCost(enh);
  if((window.selChar?.gold||0)<goldCost){setBSStatus('Gold tidak cukup! Perlukan '+goldCost.toLocaleString()+'g','err');return}
  if(!safe&&(inv.luna_stone||0)<lunaCost){setBSStatus('Luna Stone tidak cukup! Perlukan '+lunaCost+'x','err');return}
  if(safe&&!(inv.star_stone>0)){setBSStatus('Tiada Star Stone!','err');return}

  if(!window.selChar)return;
  isUpgrading=true;
  try {
    // Bayar
    window.selChar.gold-=goldCost;
    if(!safe){inv.luna_stone=(inv.luna_stone||0)-lunaCost;if(inv.luna_stone<=0)delete inv.luna_stone}
    else{inv.star_stone--;if(inv.star_stone<=0)delete inv.star_stone}

    // Update mat chips
    updateMatChips(inv);

    // Animasi mengupgrade
    await playUpgradeAnimation(item,enh);

    // Roll
    const rate=window.ENH_RATES[Math.min(enh,window.ENH_RATES.length-1)];
    const roll=Math.random()*100;
    let result;

    if(safe||roll<rate.success){
      result='success';
      item.enh=enh+1;
      if(window.G?.pl)window.G.pl.applyChar(window.selChar);
      if(typeof Audio!=='undefined')Audio.playSFX('enhance_success');
      addChat('','🔨 '+item.name+' +'+item.enh+' berjaya!','system');

    }else if(roll<rate.success+rate.fail){
      result='fail';
      if(typeof Audio!=='undefined')Audio.playSFX('enhance_fail');

    }else if(item.protected){
      result='protected';
      item.protected=false;
      if(typeof Audio!=='undefined')Audio.playSFX('enhance_fail');
      addChat('','🛡️ Protection hancur! Item selamat.','system');

    }else{
      result='break';
      const eq=window.selChar?.equipment||{};
      for(const slot of Object.keys(eq)){if(eq[slot]===upgradeTarget){eq[slot]=null;break}}
      if(inv[upgradeTarget])delete inv[upgradeTarget];
      delete window.ITEM_DB[upgradeTarget];
      upgradeTarget=null;
      if(typeof Audio!=='undefined')Audio.playSFX('enhance_break');
      if(window.G?.pl)window.G.pl.applyChar(window.selChar);
    }

    await showUpgradeResult(result,item,enh);
    window.saveProgress?.();
    setTimeout(()=>switchBSTab('upgrade'),result==='break'?500:1800);
  } catch(e) {
    console.warn('[Upgrade] Error:', e.message);
    setBSStatus('⚠️ Ralat semasa upgrade. Cuba lagi.','err');
  } finally {
    isUpgrading=false;
  }
}

async function playUpgradeAnimation(item,enh){
  const area=document.getElementById('upgradeAnimArea');if(!area)return;
  const frames=['⚒️','✨','⚡','🔥','✨','⚡'];
  for(let i=0;i<18;i++){
    area.innerHTML=`<div style="text-align:center;padding:8px;
      background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);
      border-radius:4px;font-size:1.6rem;animation:pulse .15s infinite">
      ${frames[i%frames.length]}
      <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--gold);margin-top:3px">
        Mengupgrade ${item.name} +${enh}...
      </div>
    </div>`;
    await new Promise(r=>setTimeout(r,80));
  }
}

async function showUpgradeResult(result,item,enh){
  const area=document.getElementById('upgradeAnimArea');if(!area)return;
  const cfg={
    success:{bg:'rgba(64,200,64,.12)',border:'rgba(64,200,64,.4)',icon:'✨',color:'#40c840',
      title:'BERJAYA!',msg:(item?.name||'Item')+' kini +'+(item?.enh||enh+1)+'!'},
    fail:{bg:'rgba(255,140,0,.1)',border:'rgba(255,140,0,.3)',icon:'❌',color:'#ff8800',
      title:'GAGAL',msg:'Item tidak berubah. Cuba lagi!'},
    protected:{bg:'rgba(68,136,255,.1)',border:'rgba(68,136,255,.3)',icon:'🛡️',color:'#4488ff',
      title:'PROTECTION AKTIF',msg:'Item selamat! Protection digunakan.'},
    break:{bg:'rgba(232,64,64,.12)',border:'rgba(232,64,64,.4)',icon:'💥',color:'#e84040',
      title:'HANCUR!',msg:'Item musnah sepenuhnya!'},
  }[result];
  area.innerHTML=`<div style="text-align:center;padding:12px;background:${cfg.bg};
    border:1px solid ${cfg.border};border-radius:5px">
    <div style="font-size:2.2rem">${cfg.icon}</div>
    <div style="font-family:'Cinzel Decorative',serif;font-size:1rem;color:${cfg.color};
      margin:4px 0;text-shadow:0 0 12px ${cfg.color}">${cfg.title}</div>
    <div style="font-family:'Cinzel',serif;font-size:.72rem;color:var(--parch)">${cfg.msg}</div>
  </div>`;
}

function updateMatChips(inv){
  const chips={matLuna:inv.luna_stone||0,matChaos:inv.chaos_stone||0,matStar:inv.star_stone||0,matWraith:inv.wraith_stone||0};
  for(const[id,val]of Object.entries(chips)){
    const el=document.getElementById(id);if(!el)continue;
    const spans=el.querySelectorAll('span');if(spans[1])spans[1].textContent=val;
  }
}

function setBSStatus(msg,type){
  const el=document.getElementById('bsStatus');if(!el)return;
  el.textContent=msg;el.style.color=type==='err'?'#e84040':type==='ok'?'#40c840':'#ffcc44';
  if(type!=='info')setTimeout(()=>{if(el)el.textContent=''},3000);
}

// ── TAB REVERSAL ─────────────────────────────────
function renderBSReversal(c){
  const items=getUpgradeableItems().filter(({item})=>(item.enh||0)>=9);
  let html=`<div style="background:rgba(170,68,255,.07);border:1px solid rgba(170,68,255,.2);
    border-radius:4px;padding:8px;margin-bottom:10px;font-family:'Crimson Text',serif;font-size:.75rem;color:var(--parch)">
    💡 <b style="color:#aa44ff">Reversal</b> — Tingkatkan item +9 ke R+1, R+2, R+3 dengan bonus stat +15% setiap peringkat!
  </div>`;
  if(!items.length){
    c.innerHTML=html+`<div style="text-align:center;padding:20px;color:var(--muted);font-size:.72rem">
      Tiada item +9. Upgrade item ke +9 dahulu.</div>`;return;
  }
  html+=`<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:10px">`;
  items.forEach(({iid,item})=>{
    const rev=item.reversal||0,sel=upgradeTarget===iid;
    html+=`<div onclick="selectUpgrade('${iid}')"
      style="background:rgba(0,0,0,.4);border:1px solid ${sel?'rgba(170,68,255,.8)':'rgba(170,68,255,.15)'};
      border-radius:4px;padding:5px 3px;text-align:center;cursor:pointer;
      ${sel?'background:rgba(170,68,255,.1)':''}">
      <div style="font-size:1.3rem">${item.icon}</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:#aa44ff">+9${rev>0?' R+'+rev:''}</div>
    </div>`;
  });
  html+=`</div>`;

  if(upgradeTarget&&window.ITEM_DB[upgradeTarget]){
    const item=window.ITEM_DB[upgradeTarget],rev=item.reversal||0;
    if(rev>=3){
      html+=`<div style="text-align:center;padding:12px;background:rgba(170,68,255,.08);
        border:1px solid rgba(170,68,255,.3);border-radius:5px">
        <div style="font-size:1.6rem">👑</div>
        <div style="font-family:'Cinzel',serif;font-size:.82rem;color:#aa44ff">R+3 MAKSIMUM!</div>
      </div>`;
    }else{
      const inv=window.selChar?.inventory||{};
      const rr=window.REV_RATES[rev]||{success:25,fail:45,break:30};
      const goldCost=(rev+1)*5000,chaosCost=rev+1;
      const hasG=(window.selChar?.gold||0)>=goldCost,hasC=(inv.chaos_stone||0)>=chaosCost;
      html+=`
      <div style="background:rgba(0,0,0,.4);border:1px solid rgba(170,68,255,.2);
        border-radius:5px;padding:10px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:1.8rem">${item.icon}</span>
          <div>
            <div style="font-family:'Cinzel',serif;font-size:.78rem;color:#aa44ff">${item.name} +9</div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:.68rem;color:var(--gold)">
              R+${rev} → <span style="color:#aa44ff">R+${rev+1}</span>
              <span style="font-size:.55rem;color:var(--green);margin-left:4px">(+15% semua stat)</span>
            </div>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px">
        <div style="background:rgba(64,200,64,.1);border:1px solid rgba(64,200,64,.2);border-radius:4px;padding:6px;text-align:center">
          <div style="font-family:'Cinzel Decorative',serif;font-size:.9rem;color:#40c840">${rr.success}%</div>
          <div style="font-family:'Cinzel',serif;font-size:.5rem;color:var(--muted)">✅ Berjaya</div>
        </div>
        <div style="background:rgba(255,140,0,.1);border:1px solid rgba(255,140,0,.2);border-radius:4px;padding:6px;text-align:center">
          <div style="font-family:'Cinzel Decorative',serif;font-size:.9rem;color:#ff8800">${rr.fail}%</div>
          <div style="font-family:'Cinzel',serif;font-size:.5rem;color:var(--muted)">❌ Gagal (+9)</div>
        </div>
        <div style="background:rgba(232,64,64,.1);border:1px solid rgba(232,64,64,.2);border-radius:4px;padding:6px;text-align:center">
          <div style="font-family:'Cinzel Decorative',serif;font-size:.9rem;color:#e84040">${rr.break}%</div>
          <div style="font-family:'Cinzel',serif;font-size:.5rem;color:var(--muted)">💥 Hancur</div>
        </div>
      </div>
      <div style="background:rgba(0,0,0,.3);border-radius:4px;padding:7px;margin-bottom:8px;
        font-family:'Share Tech Mono',monospace;font-size:.62rem">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px">
          <span style="color:var(--muted)">Gold:</span>
          <span style="color:${hasG?'var(--gold)':'#e84040'}">${goldCost.toLocaleString()} g</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:var(--muted)">💠 Chaos Stone:</span>
          <span style="color:${hasC?'#40c840':'#e84040'}">${chaosCost}x (ada ${inv.chaos_stone||0})</span>
        </div>
      </div>
      <button class="btn btn-blue" onclick="doReversal()"
        ${hasG&&hasC?'':'disabled'} style="${hasG&&hasC?'':'opacity:.4;cursor:not-allowed'};width:100%;padding:10px;font-size:.72rem">
        ⚡ Lakukan Reversal R+${rev+1}
      </button>`;
    }
  }else{
    html+=`<div style="text-align:center;padding:14px;color:var(--muted);font-size:.7rem;
      border:1px dashed rgba(170,68,255,.1);border-radius:4px">← Pilih item +9 untuk reversal</div>`;
  }
  c.innerHTML=html;
}

async function doReversal(){
  if(!upgradeTarget||isUpgrading)return;
  const item=window.ITEM_DB[upgradeTarget];if(!item)return;
  const rev=item.reversal||0;if(rev>=3){setBSStatus('Sudah R+3!','err');return}
  const inv=window.selChar?.inventory||{};
  const goldCost=(rev+1)*5000,chaosCost=rev+1;
  if((window.selChar?.gold||0)<goldCost){setBSStatus('Gold tidak cukup!','err');return}
  if((inv.chaos_stone||0)<chaosCost){setBSStatus('Chaos Stone tidak cukup!','err');return}

  isUpgrading=true;
  try {
    if(!window.selChar)return;
    window.selChar.gold-=goldCost;
    inv.chaos_stone-=chaosCost;if(inv.chaos_stone<=0)delete inv.chaos_stone;

    setBSStatus('⚡ Melakukan Reversal...','info');
    await new Promise(r=>setTimeout(r,1200));

    const rr=window.REV_RATES[rev],roll=Math.random()*100;
    if(roll<rr.success){
      item.reversal=rev+1;
      if(item.atk)item.atk=Math.floor(item.atk*1.15);
      if(item.def)item.def=Math.floor(item.def*1.15);
      if(item.int)item.int=Math.floor(item.int*1.15);
      if(window.G?.pl)window.G.pl.applyChar(window.selChar);
      if(typeof Audio!=='undefined')Audio.playSFX('enhance_success');
      setBSStatus('✨ REVERSAL R+'+item.reversal+' BERJAYA!','ok');
      addChat('','⚡ '+item.name+' kini R+'+item.reversal+'!','system');
    }else if(roll<rr.success+rr.fail){
      if(typeof Audio!=='undefined')Audio.playSFX('enhance_fail');
      setBSStatus('❌ Reversal gagal... item kekal +9','err');
    }else{
      if(typeof Audio!=='undefined')Audio.playSFX('enhance_break');
      const eq=window.selChar?.equipment||{};
      for(const s of Object.keys(eq)){if(eq[s]===upgradeTarget){eq[s]=null;break}}
      delete window.ITEM_DB[upgradeTarget];upgradeTarget=null;
      if(window.G?.pl)window.G.pl.applyChar(window.selChar);
      setBSStatus('💥 HANCUR! Item musnah!','err');
    }
    window.saveProgress?.();
    setTimeout(()=>switchBSTab('reversal'),1800);
  } catch(e) {
    console.warn('[Reversal] Error:', e.message);
    setBSStatus('⚠️ Ralat semasa reversal. Cuba lagi.','err');
  } finally {
    isUpgrading=false;
  }
}

// ── TAB PROTECT ──────────────────────────────────
function renderBSProtect(c){
  const items=getUpgradeableItems().filter(({item})=>!item.protected&&(item.enh||0)>=3);
  const inv=window.selChar?.inventory||{};
  const wraith=inv.wraith_stone||0;
  let html=`<div style="background:rgba(68,136,255,.07);border:1px solid rgba(68,136,255,.2);
    border-radius:4px;padding:8px;margin-bottom:10px;font-family:'Crimson Text',serif;font-size:.75rem;color:var(--parch)">
    🛡️ <b style="color:#4488ff">Protection</b> — Pasang perlindungan pada item +3 ke atas.
    Sekali guna — jika upgrade gagal hancur, item akan selamat tetapi Protection hilang.<br>
    Diperlukan: <b>5× Wraith Stone</b> + <b>300 Gold</b> per item.
  </div>`;

  if(!items.length){
    c.innerHTML=html+`<div style="text-align:center;padding:16px;color:var(--muted);font-size:.7rem">
      Tiada item +3 atau lebih yang belum diprotect.</div>`;return;
  }

  html+=`<div style="font-family:'Cinzel',serif;font-size:.6rem;color:var(--muted);letter-spacing:.1em;margin-bottom:6px">
    ITEM YANG BOLEH DIPROTECT (👻 ${wraith} Wraith Stone ada):</div>
  <div style="display:flex;flex-direction:column;gap:5px">`;

  items.forEach(({iid,item})=>{
    const enh=item.enh||0,canAfford=(window.selChar?.gold||0)>=300&&wraith>=5;
    html+=`<div style="background:rgba(0,0,0,.35);border:1px solid rgba(68,136,255,.15);
      border-radius:5px;padding:8px 10px;display:flex;align-items:center;gap:10px">
      <span style="font-size:1.4rem">${item.icon}</span>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:.72rem;color:var(--gold)">${item.name} +${enh}</div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--muted)">300g + 5× 👻 Wraith Stone</div>
      </div>
      <button class="btn btn-blue btn-xs" onclick="doProtect('${iid}')"
        ${canAfford?'':'disabled'} style="${canAfford?'':'opacity:.4;cursor:not-allowed'}">
        🛡️ Protect
      </button>
    </div>`;
  });
  html+=`</div>`;
  c.innerHTML=html;
}

function doProtect(iid){
  const item=window.ITEM_DB[iid];if(!item)return;
  const inv=window.selChar?.inventory||{};
  if((window.selChar?.gold||0)<300){setBSStatus('Gold tidak cukup! (300g)','err');return}
  if((inv.wraith_stone||0)<5){setBSStatus('Wraith Stone tidak cukup! (5x)','err');return}
  if(!window.selChar)return;
  window.selChar.gold-=300;
  inv.wraith_stone-=5;if(inv.wraith_stone<=0)delete inv.wraith_stone;
  item.protected=true;
  if(typeof Audio!=='undefined')Audio.playSFX('enhance_success');
  setBSStatus('🛡️ '+item.name+' kini dilindungi!','ok');
  addChat('','🛡️ '+item.name+' telah di-protect!','system');
  window.saveProgress?.();
  setTimeout(()=>switchBSTab('protect'),1200);
}

// ── TAB CRAFT ────────────────────────────────────
const CRAFT_RECIPES=[
  {id:'cr1', name:'💎 Cincin Emas',      out:'ring_gold',    mats:[{id:'ring_iron',qty:3},{id:'luna_stone',qty:5},{id:'monsters_bead',qty:10}], gold:500, desc:'Lebur 3 Cincin Besi → Cincin Emas'},
  {id:'cr2', name:'📿 Amulet Zamrud',    out:'amulet_jade',  mats:[{id:'luna_stone',qty:10},{id:'wraith_stone',qty:5},{id:'monsters_bead',qty:20}], gold:800, desc:'Gabung bahan alam → Amulet Zamrud'},
  {id:'cr3', name:'💠 Chaos Stone',      out:'chaos_stone',  mats:[{id:'luna_stone',qty:5},{id:'wraith_stone',qty:5}], gold:200, desc:'Luna + Wraith → Chaos Stone'},
  {id:'cr4', name:'⭐ Star Stone',       out:'star_stone',   mats:[{id:'chaos_stone',qty:3},{id:'luna_stone',qty:10}], gold:1000, desc:'Chaos ×3 + Luna ×10 → Star Stone'},
  {id:'cr5', name:'🍶 HP Potion Besar',  out:'hpot_lg',      mats:[{id:'hpot_md',qty:3},{id:'luna_stone',qty:2}], gold:100, desc:'HP Pot Sedang ×3 → HP Pot Besar'},
  {id:'cr6', name:'⚔️ Pedang Baja',      out:'sword_steel',  mats:[{id:'sword_iron',qty:1},{id:'luna_stone',qty:8},{id:'chaos_stone',qty:2}], gold:1000, desc:'Naik taraf Pedang Besi → Pedang Baja'},
  {id:'cr7', name:'🛡️ Baju Rantai',      out:'armor_chain',  mats:[{id:'armor_leather',qty:1},{id:'luna_stone',qty:8},{id:'chaos_stone',qty:2}], gold:1000, desc:'Naik taraf Baju Kulit → Baju Rantai'},
  {id:'cr8', name:'☠️ Belati Gelap',     out:'dagger_dark',  mats:[{id:'dagger_basic',qty:1},{id:'luna_stone',qty:8},{id:'chaos_stone',qty:2}], gold:1000, desc:'Naik taraf Belati → Belati Gelap'},
  {id:'cr9', name:'🔮 Tongkat Sihir',    out:'staff_magic',  mats:[{id:'staff_oak',qty:1},{id:'luna_stone',qty:8},{id:'chaos_stone',qty:2}], gold:1000, desc:'Naik taraf Tongkat Kayu → Tongkat Sihir'},
  {id:'cr10',name:'🌙 Luna Stone ×10',   out:'luna_stone',   outQty:10, mats:[{id:'monsters_bead',qty:20},{id:'wraith_stone',qty:5}], gold:100, desc:'Bead ×20 + Wraith ×5 → Luna ×10'},
];

function renderBSCraft(c){
  const inv=window.selChar?.inventory||{};
  let html=`<div style="font-family:'Cinzel',serif;font-size:.58rem;color:var(--muted);letter-spacing:.1em;margin-bottom:8px">RESIPI KRAFTING:</div>`;
  CRAFT_RECIPES.forEach(r=>{
    const canCraft=r.mats.every(m=>(inv[m.id]||0)>=m.qty)&&(window.selChar?.gold||0)>=r.gold;
    const outItem=window.ITEM_DB[r.out];
    const matsHtml=r.mats.map(m=>{
      const has=inv[m.id]||0,ok=has>=m.qty;
      const info=window.ITEM_DB[m.id];
      return`<span style="color:${ok?'#40c840':'#e84040'};font-size:.58rem">${info?.icon||'📦'}×${m.qty}(${has})</span>`;
    }).join(' ');
    html+=`<div style="background:rgba(0,0,0,.35);border:1px solid rgba(201,168,76,${canCraft?'.18':'.05'});
      border-radius:5px;padding:9px;margin-bottom:6px;${canCraft?'':'opacity:.6'}">
      <div style="display:flex;align-items:flex-start;gap:8px">
        <span style="font-size:1.5rem;flex-shrink:0">${outItem?.icon||'📦'}</span>
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:.73rem;color:var(--gold)">${r.name}</div>
          <div style="font-family:'Crimson Text',serif;font-size:.65rem;color:var(--muted);margin-top:1px">${r.desc}</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${matsHtml}
            <span style="color:${(window.selChar?.gold||0)>=r.gold?'var(--gold)':'#e84040'};font-size:.58rem">💰${r.gold}g</span>
          </div>
        </div>
        <button class="btn ${canCraft?'btn-green':'btn-dim'} btn-xs" style="flex-shrink:0"
          onclick="doCraft('${r.id}')" ${canCraft?'':'disabled'}>
          🔨 Craft${r.outQty?` ×${r.outQty}`:''}
        </button>
      </div>
    </div>`;
  });
  c.innerHTML=html;
}

async function doCraft(recipeId){
  const r=CRAFT_RECIPES.find(x=>x.id===recipeId);if(!r||!window.selChar)return;
  const inv=window.selChar?.inventory||{};
  for(const m of r.mats){if((inv[m.id]||0)<m.qty){setBSStatus('Bahan tidak cukup!','err');return}}
  if((window.selChar?.gold||0)<r.gold){setBSStatus('Gold tidak cukup!','err');return}
  try {
    window.selChar.gold-=r.gold;
    for(const m of r.mats){inv[m.id]-=m.qty;if(inv[m.id]<=0)delete inv[m.id]}
    const qty=r.outQty||1;
    inv[r.out]=(inv[r.out]||0)+qty;
    if(typeof Audio!=='undefined')Audio.playSFX('enhance_success');
    const info=window.ITEM_DB[r.out];
    setBSStatus('✅ '+info?.name+' × '+qty+' berjaya dicipta!','ok');
    addChat('','🔨 '+window.selChar.char_name+' telah mengcraft '+(info?.name||r.out)+(qty>1?' ×'+qty:'')+'!','system');
    window.saveProgress?.();
    setTimeout(()=>switchBSTab('craft'),1200);
  } catch(e) {
    console.warn('[Craft] Error:', e.message);
    setBSStatus('⚠️ Ralat semasa craft. Cuba lagi.','err');
  }
}

// ── TAB DECOMPOSE ────────────────────────────────
function renderBSDecompose(c){
  const inv=window.selChar?.inventory||{};
  const decomposable=Object.entries(inv).filter(([iid,qty])=>{
    if(qty<=0||!window.ITEM_DB[iid])return false;
    const item=window.ITEM_DB[iid];
    return['weapon','armor','acc'].includes(item.type)&&(item.enh||0)===0;
  });
  let html=`<div style="background:rgba(255,100,0,.07);border:1px solid rgba(255,100,0,.2);
    border-radius:4px;padding:8px;margin-bottom:10px;font-family:'Crimson Text',serif;font-size:.75rem;color:var(--parch)">
    🧪 <b style="color:#ff8800">Dekompos</b> — Pecahkan item +0 menjadi bahan mentah.
    Hanya item tanpa enhancement yang boleh didekompos.
  </div>`;
  if(!decomposable.length){
    c.innerHTML=html+`<div style="text-align:center;padding:16px;color:var(--muted);font-size:.7rem">
      Tiada item +0 yang boleh didekompos.</div>`;return;
  }
  html+=`<div style="font-family:'Cinzel',serif;font-size:.6rem;color:var(--muted);letter-spacing:.1em;margin-bottom:6px">PILIH ITEM UNTUK DEKOMPOS:</div>
  <div style="display:flex;flex-direction:column;gap:5px">`;
  decomposable.forEach(([iid])=>{
    const item=window.ITEM_DB[iid];if(!item)return;
    const rc={common:{luna:2,wraith:1,bead:3},uncommon:{luna:5,chaos:1,bead:5},rare:{luna:8,chaos:3,bead:8},epic:{luna:12,chaos:5,star:1},legendary:{luna:20,chaos:10,star:3}}[item.rarity]||{luna:2,bead:3};
    const matStr=Object.entries(rc).map(([k,v])=>{
      const icons={luna:'🌙',chaos:'💠',star:'⭐',wraith:'👻',bead:'🔴'};
      return`${icons[k]||'📦'}×${v}`;
    }).join(' ');
    html+=`<div style="background:rgba(0,0,0,.35);border:1px solid rgba(255,100,0,.12);
      border-radius:5px;padding:8px 10px;display:flex;align-items:center;gap:10px">
      <span style="font-size:1.4rem">${item.icon}</span>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:.72rem;color:var(--gold)">${item.name}</div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:var(--green)">→ ${matStr}</div>
      </div>
      <button class="btn btn-xs" onclick="doDecompose('${iid}')"
        style="background:rgba(255,100,0,.15);border:1px solid rgba(255,100,0,.3);color:#ff8800;
        font-family:Cinzel,serif;font-size:.6rem;padding:5px 8px;border-radius:3px;cursor:pointer">
        🧪 Pecah
      </button>
    </div>`;
  });
  html+=`</div>`;
  c.innerHTML=html;
}

function doDecompose(iid){
  const item=window.ITEM_DB[iid];if(!item||!window.selChar)return;
  const inv=window.selChar.inventory||{};
  if((inv[iid]||0)<=0){setBSStatus('Tiada item ini!','err');return}
  if(!confirm('Dekompos '+item.name+'? Tidak boleh dibatalkan!'))return;
  // Buang item
  inv[iid]--;if(inv[iid]<=0)delete inv[iid];
  // Bagi bahan ikut rarity
  const rc={common:{luna_stone:2,wraith_stone:1,monsters_bead:3},
    uncommon:{luna_stone:5,chaos_stone:1,monsters_bead:5},
    rare:{luna_stone:8,chaos_stone:3,monsters_bead:8},
    epic:{luna_stone:12,chaos_stone:5,star_stone:1},
    legendary:{luna_stone:20,chaos_stone:10,star_stone:3}}[item.rarity]||{luna_stone:2,monsters_bead:3};
  const matNames=[];
  for(const[k,v]of Object.entries(rc)){
    inv[k]=(inv[k]||0)+v;
    const info=window.ITEM_DB[k];
    matNames.push((info?.icon||'📦')+'×'+v);
  }
  if(typeof Audio!=='undefined')Audio.playSFX('pickup');
  setBSStatus('🧪 '+item.name+' didekompos! Dapat: '+matNames.join(' '),'ok');
  addChat('','🧪 '+item.name+' didekompos → '+matNames.join(' '),'system');
  window.saveProgress?.();
  setTimeout(()=>switchBSTab('decompose'),1200);
}

// ── HOOK NPC ─────────────────────────────────────
const _origOpenNPCInn=openNPC;
openNPC=function(npcId){
  const npc=window.NPCS[npcId];if(!npc)return;
  if(npc.heal||npc.type==='inn'){openInn(npcId);return}
  if(npc.shop==='enhance'||npc.type==='blacksmith'){openBlacksmith(npcId);return}
  _origOpenNPCInn(npcId);
};
window.NPCS['innkeeper'].type='inn';
if(window.NPCS['blacksmith'])window.NPCS['blacksmith'].type='blacksmith';
if(window.NPCS['blacksmith_el'])window.NPCS['blacksmith_el'].type='blacksmith';
if(window.NPCS['blacksmith_kr'])window.NPCS['blacksmith_kr'].type='blacksmith';

// ── FARMING TICK & EXP HOOKS (deferred) ──────────
function _hookInnFunctions() {
  if (typeof farmingTick !== 'function') { setTimeout(_hookInnFunctions, 150); return; }
  const _origFT = farmingTick;
  farmingTick = function(dt) { _origFT(dt); tickInnBuffs(dt); };
  window.farmingTick = farmingTick;

  if (typeof gainExp === 'function') {
    const _origGE = gainExp;
    gainExp = function(amount) {
      const mul = innBuffs.exp.active ? innBuffs.exp.multiplier : 1.0;
      _origGE(Math.floor(amount * mul));
    };
    window.gainExp = gainExp;
  }
}
setTimeout(_hookInnFunctions, 400);
