'use strict';
/* ═══════════════════════════════════════════════════════
   KO Classic — UI System
   Menu, HUD, Party, NPC, Nation War, Trade, Enhancement
   ═══════════════════════════════════════════════════════ */

// ── HELPERS ───────────────────────────────────────────────────────
const E = id => document.getElementById(id);
function sc(id, mode='off'){const el=E(id);if(el)el.classList[mode==='on'?'remove':'add']('off')}
function hideAll(){
  ['loadSc','loginSc','factionSc','charCreateSc','charSelectSc','menuSc','gosc',
   'hud','skillBar','topBtns','minimap','opill','factionBot','zoneBanner',
   'nwHud','partyHud','pkStatus','chatBox'].forEach(id=>sc(id));
  closeAllPanels();
}
function closeAllPanels(){
  ['invPanel','statsPanel2','shopPanel','dungeonPanel','nwPanel','partyPanel',
   'tradePanel','skillTreePanel','npcDialog'].forEach(id=>{
    const el=E(id);if(el)el.classList.add('off');
  });
}

// ── LOAD ──────────────────────────────────────────────────────────
const LOAD_MSGS=['Menyambung ke server...','Memuatkan peta dunia...','Menyedia pasukan El Morad...','Menyedia tentera Karus...','Memuatkan item...','Masuk ke dunia!'];
let loadPct=0;
function startLoad(){
  // Sembunyikan semua screen lain, tunjuk loading
  document.querySelectorAll('.sc').forEach(el => {
    if (el.id === 'loadSc') el.classList.remove('off');
    else el.classList.add('off');
  });

  loadPct = 0;
  let step = 0;

  function setProgress(val, label) {
    const fill = document.getElementById('lbFill');
    const pct  = document.getElementById('lbPct');
    const msg  = document.getElementById('lbMsg');
    if (fill) fill.style.width  = Math.min(100, val) + '%';
    if (pct)  pct.textContent   = Math.floor(Math.min(100, val)) + '%';
    if (msg)  msg.textContent   = label || LOAD_MSGS[Math.min(step, LOAD_MSGS.length-1)];
  }

  // Step-by-step loading
  const steps = [
    {pct: 20,  delay: 0},
    {pct: 40,  delay: 250},
    {pct: 60,  delay: 500},
    {pct: 80,  delay: 750},
    {pct: 95,  delay: 1000},
    {pct: 100, delay: 1300},
  ];

  steps.forEach(({pct, delay}) => {
    setTimeout(() => {
      loadPct = pct;
      setProgress(pct, LOAD_MSGS[step++] || LOAD_MSGS[LOAD_MSGS.length-1]);
    }, delay);
  });

  // Selepas 1.8 saat — tunjuk login screen
  setTimeout(() => {
    document.getElementById('loadSc')?.classList.add('off');
    document.getElementById('loginSc')?.classList.remove('off');
    setTimeout(initLoginCreature, 80);
    if (typeof Audio !== 'undefined') { Audio.init(); Audio.playZoneMusic('login'); }
  }, 1800);
}

// ── LOGIN CREATURE ─────────────────────────────────────────────────
function initLoginCreature(){
  const lcc=E('loginCreatureCanvas');if(!lcc)return;
  // Reserve ~260px for login card at bottom, rest goes to creature
  const cardH = 260;
  const avail = window.innerHeight - cardH;
  const lw=Math.min(400,window.innerWidth);
  const lh=Math.min(avail, Math.min(380, window.innerWidth*.85));
  lcc.width=lw; lcc.height=lh;
  lcc.style.bottom = cardH + 'px';
  lcc.style.height  = lh + 'px';
  lcc.style.width   = lw + 'px';
  const lx=lcc.getContext('2d');let t=0;
  function draw(t){
    lx.clearRect(0,0,lw,lh);const cx2=lw/2,cy2=lh*.78,sc2=lh/400;
    lx.save();lx.translate(cx2,cy2);lx.scale(sc2,sc2);
    const br=Math.sin(t*1.8)*.012;lx.scale(1+br,1-br*.5);
    lx.fillStyle='#1a2a1a';lx.beginPath();lx.ellipse(0,-80,85,120,0,0,Math.PI*2);lx.fill();
    lx.fillStyle='#2a3a2a';lx.beginPath();lx.ellipse(0,-85,70,100,0,0,Math.PI*2);lx.fill();
    for(let i=-2;i<=2;i++)for(let j=0;j<3;j++){lx.fillStyle=`rgba(60,80,40,${.4+j*.1})`;lx.beginPath();lx.ellipse(i*22,-60+j*28,11,8,0,0,Math.PI*2);lx.fill()}
    const wf=Math.sin(t*2.5)*12;
    lx.fillStyle='rgba(15,12,8,.88)';
    lx.beginPath();lx.moveTo(-60,-80);lx.bezierCurveTo(-180,-120+wf,-220,-40+wf,-160,80);lx.bezierCurveTo(-130,60,-90,30,-60,-20);lx.closePath();lx.fill();
    lx.strokeStyle='rgba(40,20,5,.6)';lx.lineWidth=1.5;lx.beginPath();lx.moveTo(-60,-70);lx.lineTo(-180,-120+wf);lx.stroke();
    lx.fillStyle='rgba(15,12,8,.88)';
    lx.beginPath();lx.moveTo(60,-80);lx.bezierCurveTo(180,-120+wf,220,-40+wf,160,80);lx.bezierCurveTo(130,60,90,30,60,-20);lx.closePath();lx.fill();
    lx.strokeStyle='rgba(40,20,5,.6)';lx.lineWidth=1.5;lx.beginPath();lx.moveTo(60,-70);lx.lineTo(180,-120+wf);lx.stroke();
    lx.fillStyle='#243424';lx.beginPath();lx.ellipse(0,-180,36,50,0,0,Math.PI*2);lx.fill();
    for(let i=-1;i<=1;i++){lx.fillStyle='#4a6030';lx.beginPath();lx.moveTo(i*14,-155);lx.lineTo(i*10,-195);lx.lineTo(i*18,-195);lx.closePath();lx.fill()}
    const hs=Math.sin(t*.9)*6;lx.save();lx.translate(hs,0);
    lx.fillStyle='#1e301e';lx.beginPath();lx.ellipse(0,-250,55,55,0,0,Math.PI*2);lx.fill();
    lx.fillStyle='#3a2010';lx.beginPath();lx.moveTo(-30,-280);lx.lineTo(-20,-340);lx.lineTo(-8,-285);lx.closePath();lx.fill();
    lx.beginPath();lx.moveTo(30,-280);lx.lineTo(20,-340);lx.lineTo(8,-285);lx.closePath();lx.fill();
    const ep=.7+Math.sin(t*3)*.3;lx.shadowColor='#ff2200';lx.shadowBlur=18*ep;
    lx.fillStyle=`rgba(255,${20+ep*40|0},0,${ep})`;
    lx.beginPath();lx.ellipse(-20,-258,9,7,-.2,0,Math.PI*2);lx.fill();
    lx.beginPath();lx.ellipse(20,-258,9,7,.2,0,Math.PI*2);lx.fill();
    lx.fillStyle='#000';lx.shadowBlur=0;lx.beginPath();lx.ellipse(-20,-258,4,5,0,0,Math.PI*2);lx.fill();lx.beginPath();lx.ellipse(20,-258,4,5,0,0,Math.PI*2);lx.fill();
    const jo=18+Math.sin(t*.7)*4;lx.fillStyle='#0a0606';lx.beginPath();lx.ellipse(0,-220,35,jo,0,0,Math.PI*2);lx.fill();
    lx.fillStyle='#dddbc0';for(let i=-3;i<=3;i++){lx.beginPath();lx.moveTo(i*9,-210);lx.lineTo(i*9-3,-225+Math.abs(i)*2);lx.lineTo(i*9+3,-225+Math.abs(i)*2);lx.closePath();lx.fill()}
    lx.shadowBlur=0;lx.restore();
    lx.fillStyle='rgba(0,0,0,.35)';lx.beginPath();lx.ellipse(0,90,100,18,0,0,Math.PI*2);lx.fill();lx.restore();
  }
  function loop(){if(!E('loginSc')||E('loginSc').classList.contains('off'))return;t+=0.016;draw(t);requestAnimationFrame(loop)}
  loop();
}

// ── MENU ──────────────────────────────────────────────────────────
async function goMenu(){
  hideAll(); sc('menuSc','on'); if(!selChar) return;
  const race = RACES[selChar.race]||RACES.human;
  const job  = JOBS[selChar.job]||JOBS.warrior;
  const isEl = selChar.faction==='elmorad'||selChar.faction==='cahaya';

  // Avatar — portrait SVG atau fallback emoji
  const av = E('mAvatar');
  if (av) {
    const portraitSrc = window.PortraitSystem?.getCharPortrait(selChar);
    if (portraitSrc) {
      av.innerHTML = `<img src="${portraitSrc}"
        style="width:100%;height:100%;object-fit:cover;border-radius:inherit"
        onerror="this.outerHTML='${race.icon}'">`;
      av.style.overflow = 'hidden';
    } else {
      av.textContent = race.icon;
    }
  }

  E('mPname').textContent = selChar.char_name;
  E('mFTag').textContent  = isEl ? '🌟 El Morad' : '🔥 Karus';
  E('mFTag').style.color  = isEl ? 'var(--el)' : 'var(--kr)';
  E('mLv').textContent    = selChar.level||1;
  E('mGold').textContent  = (selChar.gold||0).toLocaleString();

  const pts = E('mPts'); if(pts) pts.textContent = (selChar.points||0).toLocaleString();
  const mb  = E('menuPointBadge'); if(mb) mb.textContent = (selChar.points||0)+' pt';

  await loadLB();

  // Mainkan muzik login/menu
  if(typeof Audio!=='undefined') Audio.playZoneMusic('login');
}
async function loadLB(){
  const lb=E('lbList');
  if(offlineMode||!SB){lb.innerHTML='<div style="color:var(--muted);text-align:center;font-size:.7rem;padding:7px">Offline mode</div>';return}
  try{
    const{data}=await SB.from('kn_leaderboard').select('char_name,faction,score,wave').order('score',{ascending:false}).limit(10);
    if(!data||!data.length){lb.innerHTML='<div style="color:var(--muted);text-align:center;font-size:.7rem;padding:7px">No records yet</div>';return}
    lb.innerHTML=data.map((r,i)=>`<div class="lb-row ${i<3?'r'+(i+1):''}">
      <span class="rk">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</span>
      <span class="ln">${r.char_name||'?'}</span>
      <span class="lf ${r.faction==='elmorad'||r.faction==='cahaya'?'fc-elmorad':'fc-karus'}">${r.faction==='elmorad'||r.faction==='cahaya'?'🌟':'🔥'}</span>
      <span class="ls">${Number(r.score||0).toLocaleString()}</span></div>`).join('');
  }catch{lb.innerHTML='<div style="color:var(--muted);text-align:center;font-size:.7rem;padding:7px">Failed to load</div>'}
}

// ── HUD ───────────────────────────────────────────────────────────
function updHUD(){
  const p=G.pl;if(!p)return;
  const hpB=E('hpB');if(hpB)hpB.style.width=(p.hp/p.maxHp*100)+'%';
  const hpV=E('hpV');if(hpV)hpV.textContent=Math.ceil(p.hp)+'/'+Math.ceil(p.maxHp);
  const mpB=E('mpB');if(mpB)mpB.style.width=(p.mp/p.maxMp*100)+'%';
  const mpV=E('mpV');if(mpV)mpV.textContent=Math.ceil(p.mp)+'/'+Math.ceil(p.maxMp);
  const lv=selChar?.level||1,xp=selChar?.xp||0;
  const need=typeof window.expRequired==='function'?window.expRequired(lv):lv*100;
  const xpB=E('xpB');if(xpB)xpB.style.width=(xp/need*100)+'%';
  const xpV=E('xpV');if(xpV)xpV.textContent=xp+'/'+need;
  const lvB=E('lvB');if(lvB)lvB.textContent='LV '+lv;
  const wN=E('wN');if(wN)wN.textContent=G.wave;
  const scN=E('scN');if(scN)scN.textContent=G.score.toLocaleString();
  const klN=E('klN');if(klN)klN.textContent='Kills: '+G.kills;
  // Skill CD
  ['spBtn','sp2Btn','sp3Btn','sp4Btn'].forEach((id,i)=>{
    const btn=E(id);if(!btn)return;
    const cd=[p.scd,p.sp2cd,p.sp3cd,p.sp4cd][i]||0;
    btn.classList.toggle('cd',cd>0);
    btn.dataset.cd=cd>0?Math.ceil(cd)+'s':'';
  });
  updMinimap();
  updPartyHud();
  updNWHud();
}

// ── MINIMAP ───────────────────────────────────────────────────────
function updMinimap(){
  const mc=E('mmCanvas');if(!mc||!G.pl)return;
  const mw=mc.width,mh=mc.height;const lx=mc.getContext('2d');
  const isEl=selChar?.faction==='elmorad'||selChar?.faction==='cahaya';
  lx.fillStyle=isEl?'#0a0c18':'#120808';lx.fillRect(0,0,mw,mh);
  // NPC dots (green)
  if(G.zoneNPCs){G.zoneNPCs.forEach(n=>{lx.fillStyle='#40c840';lx.beginPath();lx.arc(n.x/WW*mw,n.y/WH*mh,2,0,Math.PI*2);lx.fill()})}
  // Enemies (red)
  for(const e of G.enemies||[]){if(e.dead)continue;lx.fillStyle='#e84040';lx.beginPath();lx.arc(e.x/WW*mw,e.y/WH*mh,1.5,0,Math.PI*2);lx.fill()}
  // Other players
  for(const op of Object.values(opMap||{})){
    lx.fillStyle=op.faction==='elmorad'||op.faction==='cahaya'?'#4488ff':'#ff4444';
    lx.beginPath();lx.arc(op.x/WW*mw,op.y/WH*mh,2,0,Math.PI*2);lx.fill();
  }
  // Player (gold)
  if (!G?.pl) return;
  const mx=G.pl.x/WW*mw,my=G.pl.y/WH*mh;
  lx.fillStyle=isEl?'#ffdd44':'#ff8844';lx.beginPath();lx.arc(mx,my,3,0,Math.PI*2);lx.fill();
  lx.strokeStyle=isEl?'#ffdd44':'#ff8844';lx.lineWidth=1;lx.stroke();
}

// ── ZONE BANNER ───────────────────────────────────────────────────
function showZoneBanner(zoneId){
  const zone=ZONES[zoneId];if(!zone)return;
  sc('zoneBanner','on');
  E('zoneNameTag').textContent=zone.icon+' '+zone.name;
  const pvpEl=E('zonePvpTag');
  if(zone.pvp){pvpEl.textContent='⚔️ PVP ZONE — Nation War Active';pvpEl.style.display='block'}
  else if(zone.safe){pvpEl.textContent='🛡️ Safe Zone';pvpEl.style.display='block'}
  else pvpEl.style.display='none';
  setTimeout(()=>sc('zoneBanner'),4000);
}

// ── CHAT SYSTEM ───────────────────────────────────────────────────
const chatHistory=[];
function addChat(name,msg,type='normal',faction=null){
  chatHistory.push({name,msg,type,faction});
  if(chatHistory.length>50)chatHistory.shift();
  renderChat();
}
function renderChat(){
  const el=E('chatMessages');if(!el)return;
  el.innerHTML=chatHistory.slice(-20).map(m=>`
    <div class="chat-msg cm-${m.type}">
      ${m.name?`<span class="cm-name">${m.name}:</span> `:''}${m.msg}
    </div>`).join('');
  el.scrollTop=el.scrollHeight;
}
function sendChat(){
  const inp=E('chatInput');if(!inp||!inp.value.trim())return;
  const msg=inp.value.trim().substring(0,100);inp.value='';
  const name=selChar?.char_name||'?';
  // Detect channel prefix
  if(msg.startsWith('/p ')){addChat(name,msg.slice(3),'party');broadcastChat(name,msg.slice(3),'party')}
  else if(msg.startsWith('/n ')){addChat(name,msg.slice(3),'nation');broadcastChat(name,msg.slice(3),'nation')}
  else{addChat(name,msg,'normal');broadcastChat(name,msg,'normal')}
}
function broadcastChat(name,msg,type){
  if(!rtCh||!selChar)return;
  rtCh.send({type:'broadcast',event:'chat',payload:{name,msg,type,faction:selChar.faction}});
}

// ── NATION WAR HUD ────────────────────────────────────────────────
let nwActive=false,nwTimer=0,nwScore={elmorad:0,karus:0};
function updNWHud(){
  if(!nwActive){sc('nwHud');return}
  sc('nwHud','on');
  const m=Math.floor(nwTimer/60),s=nwTimer%60;
  E('nwTimerDisp').textContent=`${m}:${s.toString().padStart(2,'0')}`;
  E('nwScoreEl').textContent=nwScore.elmorad;
  E('nwScoreKr').textContent=nwScore.karus;
}
function startNationWar(){
  nwActive=true;nwTimer=NW_CONFIG.duration;nwScore={elmorad:0,karus:0};
  showNWNotif('⚔️ NATION WAR BERMULA!');addChat('','Nation War has started!','system');
}
function endNationWar(){
  nwActive=false;sc('nwHud');
  const winner=nwScore.elmorad>nwScore.karus?'🌟 El Morad':'🔥 Karus';
  showNWNotif('🏆 '+winner+' MENANG!');
  if(selChar){
    const isWinner=(selChar.faction==='elmorad'&&nwScore.elmorad>nwScore.karus)||(selChar.faction==='karus'&&nwScore.karus>nwScore.elmorad);
    const gold=isWinner?NW_CONFIG.rewardGold.winner:NW_CONFIG.rewardGold.loser;
    const xp=isWinner?NW_CONFIG.rewardXP.winner:NW_CONFIG.rewardXP.loser;
    selChar.gold=(selChar.gold||0)+gold;selChar.xp=(selChar.xp||0)+xp;
    addChat('','You received '+gold+' gold and '+xp+' XP!','system');
    window.saveProgress?.();
  }
}
function addNWKill(){if(!nwActive||!selChar)return;nwScore[selChar.faction==='elmorad'||selChar.faction==='cahaya'?'elmorad':'karus']++}

// ── PARTY SYSTEM ──────────────────────────────────────────────────
let myParty={members:[],leader:null};
function openParty(){if(!selChar)return;E('partyPanel').classList.remove('off');renderPartyPanel()}
function renderPartyPanel(){
  const isLeader=myParty.leader===selChar?.id||myParty.members.length===0;
  let html=`<div style="font-family:'Cinzel',serif;font-size:.65rem;color:rgba(201,168,76,.5);text-transform:uppercase;margin-bottom:8px">
    Party Members (${myParty.members.length+1}/${PARTY_CONFIG.maxMembers})</div>`;
  // Leader (self)
  if(selChar){
    html+=`<div class="party-slot">
      <div class="party-slot-icon">${(RACES[selChar.race]||RACES.human).icon}</div>
      <div class="party-slot-info">
        <div class="party-slot-name">👑 ${selChar.char_name} (You)</div>
        <div class="party-slot-hp"><div class="party-slot-hp-fill" style="width:${G.pl?G.pl.hp/G.pl.maxHp*100:100}%"></div></div>
      </div>
    </div>`;
  }
  // Other members
  myParty.members.forEach(m=>{
    html+=`<div class="party-slot">
      <div class="party-slot-icon">🧑</div>
      <div class="party-slot-info">
        <div class="party-slot-name">${m.name}</div>
        <div class="party-slot-hp"><div class="party-slot-hp-fill" style="width:${m.hpPct||100}%"></div></div>
      </div>
      ${isLeader?`<button class="btn btn-red" style="flex:0 0 auto;font-size:.55rem;padding:3px 6px" onclick="kickMember('${m.id}')">Kick</button>`:''}
    </div>`;
  });
  // Invite code
  const code=curAccount?.uid?.slice(-6).toUpperCase()||'??????';
  html+=`<div class="party-invite-code" onclick="copyPartyCode('${code}')" title="Click to copy">
    Party Code: <b>${code}</b> 📋</div>`;
  if(isLeader&&myParty.members.length===0){
    html+=`<div style="margin-top:8px;display:flex;gap:5px">
      <input id="joinCodeInp" class="chat-inp" placeholder="Enter party code..." style="flex:1">
      <button class="btn btn-blue" style="flex:0 0 auto;font-size:.62rem" onclick="joinParty()">Join</button>
    </div>`;
  }
  E('partyBody').innerHTML=html;
}
function copyPartyCode(code){
  navigator.clipboard?.writeText(code).then(()=>addChat('','Party code copied!','system')).catch(()=>{});
}
function joinParty(){
  const code=E('joinCodeInp')?.value.trim();
  if(!code){addChat('','Enter a party code!','system');return}
  addChat('',`Searching for party: ${code}...`,'system');
  if(rtCh){rtCh.send({type:'broadcast',event:'party_req',payload:{from:selChar?.char_name,code,id:selChar?.id}})}
}
function kickMember(id){myParty.members=myParty.members.filter(m=>m.id!==id);renderPartyPanel()}
function updPartyHud(){
  const ph=E('partyHud');if(!ph)return;
  if(myParty.members.length===0){sc('partyHud');return}
  sc('partyHud','on');
  ph.innerHTML=myParty.members.map(m=>`<div class="party-member">
    <div class="pm-name">${m.name}</div>
    <div class="pm-hp-bar"><div class="pm-hp-fill" style="width:${m.hpPct||100}%"></div></div>
  </div>`).join('');
}

// ── PK SYSTEM ─────────────────────────────────────────────────────
let pkMode=false;
function togglePK(){
  const zone=ZONES[G.currentZone||'moradon'];
  if(zone?.safe){addChat('','Cannot enable PK in safe zone!','system');return}
  pkMode=!pkMode;
  const el=E('pkStatus');if(!el)return;
  el.className='off';// re-show
  sc('pkStatus','on');
  el.className=(pkMode?'pk-pk':'pk-peace');
  el.innerHTML=`<div class="pk-indicator"></div><span>${pkMode?'PK MODE':'PEACE'}</span>`;
  addChat('',pkMode?'PK Mode enabled!':'Peace mode enabled','system');
}
function isEnemy(faction){
  if(!selChar)return false;
  const myFac=selChar.faction==='cahaya'?'elmorad':selChar.faction;
  const theirFac=faction==='cahaya'?'elmorad':faction;
  return myFac!==theirFac;
}

// ── NPC DIALOG ────────────────────────────────────────────────────
let activeNPC=null;
function openNPC(npcId){
  const npc=NPCS[npcId];if(!npc)return;
  activeNPC=npc;
  sc('npcDialog','on');
  if(typeof Audio!=='undefined') Audio.playSFX('npc_talk');
  E('npcName').textContent=npc.icon+' '+npc.name;
  E('npcText').textContent=npc.dialog;
  let btns=`<button class="btn btn-dim" style="font-size:.65rem;padding:6px 10px" onclick="closeNPC()">Close</button>`;
  if(npc.shop)btns+=`<button class="btn btn-gold" style="font-size:.65rem;padding:6px 10px" onclick="openShop('${npc.shop}');closeNPC()">Shop</button>`;
  if(npc.heal)btns+=`<button class="btn btn-blue" style="font-size:.65rem;padding:6px 10px" onclick="healAtInn()">Rest (50g)</button>`;
  if(npc.gate)btns+=`<button class="btn btn-red" style="font-size:.65rem;padding:6px 10px" onclick="gotoZone('ronark');closeNPC()">Go to Ronark</button>`;
  E('npcBtns').innerHTML=btns;
}
function closeNPC(){sc('npcDialog');activeNPC=null}
function healAtInn(){
  if(!selChar||!G.pl)return;
  if((selChar.gold||0)<50){addChat('','Not enough gold! Need 50g.','system');return}
  if(!G?.pl)return; selChar.gold-=50;G.pl.hp=G.pl.maxHp;G.pl.mp=G.pl.maxMp;
  addChat('','Rested at inn. HP/MP fully restored!','system');closeNPC();window.saveProgress?.();
}
function gotoZone(zoneId){
  G.changeZone(zoneId);showZoneBanner(zoneId);
  addChat('',`Entered: ${ZONES[zoneId]?.name||zoneId}`,'system');
}

// ── INVENTORY PANEL ───────────────────────────────────────────────
let selItemId=null;
function openInventory(){if(!selChar)return;E('invPanel').classList.remove('off');renderEquipSlots()}
function renderEquipSlots(){
  E('invTabEquip').classList.add('active');E('invTabBag').classList.remove('active');E('invTabEnh').classList.remove('active');
  const eq=selChar.equipment||{};
  const slots=[
    {key:'weapon',label:'Weapon',icon:'⚔️'},{key:'armor',label:'Armor',icon:'🛡️'},
    {key:'helmet',label:'Helmet',icon:'⛑️'},{key:'gloves',label:'Gloves',icon:'🧤'},
    {key:'boots',label:'Boots',icon:'👟'},{key:'ring1',label:'Ring 1',icon:'💍'},
    {key:'ring2',label:'Ring 2',icon:'💍'},{key:'amulet',label:'Amulet',icon:'📿'},
    {key:'earring',label:'Earring',icon:'✨'},
  ];
  let html='<div class="equip-grid" style="grid-template-columns:1fr 1fr 1fr">';
  slots.forEach(s=>{
    const iid=eq[s.key];const item=iid?ITEM_DB[iid]:null;const enh=item?.enh||0;
    html+=`<div class="equip-slot${item?' equipped':''}" onclick="selEquipSlot('${s.key}')"
      ${item ? `onmouseenter="window.ItemSystem?.showTooltip('${iid}',event.clientX,event.clientY)" onmouseleave="window.ItemSystem?.hideTooltip()" ontouchstart="window.ItemSystem?.showTooltip('${iid}',event.touches[0].clientX,event.touches[0].clientY)" ontouchend="setTimeout(()=>window.ItemSystem?.hideTooltip(),1500)"` : ''}>
      <div class="es-icon">${item?item.icon:s.icon}</div>
      <div class="es-info"><div class="es-lbl">${s.label}</div>
      <div class="es-val">${item?(item.name+(enh>0?' +'+enh:'')):'—'}</div></div></div>`;
  });
  html+='</div><div class="item-detail-box" id="itemDetailBox"><div style="color:var(--muted);font-size:.68rem;text-align:center;margin-top:8px">Select an item to view details</div></div>';
  E('invBody').innerHTML=html;
}
function renderBag(){
  if(!selChar)return;
  E('invTabEquip').classList.remove('active');E('invTabBag').classList.add('active');E('invTabEnh').classList.remove('active');
  const inv=selChar.inventory||{};const items=Object.entries(inv).filter(([,q])=>q>0);
  let html='<div class="inv-grid">';
  for(let i=0;i<20;i++){
    if(i<items.length){
      const[iid,qty]=items[i];const item=ITEM_DB[iid];if(!item){continue}
      html+=`<div class="inv-slot has-item" onclick="selBagItem('${iid}')"
        onmouseenter="window.ItemSystem?.showTooltip('${iid}',event.clientX,event.clientY)"
        onmouseleave="window.ItemSystem?.hideTooltip()"
        ontouchstart="window.ItemSystem?.showTooltip('${iid}',event.touches[0].clientX,event.touches[0].clientY)"
        ontouchend="setTimeout(()=>window.ItemSystem?.hideTooltip(),2000)"
        title="${item.name}">
        ${item.icon}${qty>1?`<span class="item-qty">${qty}</span>`:''}${item.enh>0?`<span class="item-enh">+${item.enh}</span>`:''}
      </div>`;
    }else html+='<div class="inv-slot"></div>';
  }
  html+='</div><div class="item-detail-box" id="itemDetailBox"><div style="color:var(--muted);font-size:.68rem;text-align:center;margin-top:8px">Select an item to view details</div></div>';
  E('invBody').innerHTML=html;
}
function selEquipSlot(slot){if(!selChar)return;const iid=selChar.equipment?.[slot];if(iid)selBagItem(iid)}
function selBagItem(iid){
  if(!selChar)return;
  selItemId=iid;const item=ITEM_DB[iid];if(!item)return;
  const eq=selChar.equipment||{};const equipped=Object.values(eq).includes(iid);const enh=item.enh||0;
  let stats='';
  if(item.atk)stats+=`<div>ATK +${item.atk+enh*Math.floor(item.atk*.08)}</div>`;
  if(item.def)stats+=`<div>DEF +${item.def+enh*Math.floor(item.def*.08)}</div>`;
  if(item.int)stats+=`<div>INT +${item.int+enh*Math.floor(item.int*.08)}</div>`;
  if(item.hp)stats+=`<div>HP +${item.hp}</div>`;if(item.mp)stats+=`<div>MP +${item.mp}</div>`;
  if(item.str)stats+=`<div>STR +${item.str}</div>`;if(item.dex)stats+=`<div>DEX +${item.dex}</div>`;
  if(item.spd)stats+=`<div>SPD +${item.spd}</div>`;if(item.heal)stats+=`<div>Heal ${item.heal} HP</div>`;
  if(item.mana)stats+=`<div>Restore ${item.mana} MP</div>`;
  let btns='';
  if(['weapon','armor','helmet','gloves','boots','ring1','ring2','amulet','earring'].includes(item.slot)){
    btns+=equipped?`<button class="btn btn-dim" style="flex:1;padding:6px;font-size:.65rem" onclick="unequipItem('${iid}')">Unequip</button>`:
    `<button class="btn btn-gold" style="flex:1;padding:6px;font-size:.65rem" onclick="equipItem('${iid}')">Equip</button>`;
  }
  if(item.type==='potion')btns+=`<button class="btn btn-blue" style="flex:1;padding:6px;font-size:.65rem" onclick="usePotion('${iid}')">Use</button>`;
  btns+=`<button class="btn btn-red" style="flex:0 0 auto;padding:6px 10px;font-size:.62rem" onclick="sellItem('${iid}')">Sell ${item.sell}g</button>`;
  const box=E('itemDetailBox');if(!box)return;
  box.innerHTML=`<div class="item-detail-name rarity-${item.rarity}">${item.icon} ${item.name}${enh>0?' +'+enh:''}</div>
    <div class="item-detail-stat">${stats||'<div>Special item</div>'}</div>
    <div style="margin-top:7px;display:flex;gap:5px">${btns}</div>`;
}
function _equipItemUI(iid){
  const item=ITEM_DB[iid];if(!item||!selChar)return;
  if(item.jobs&&!item.jobs.includes(selChar.job)){addChat('','Your class cannot use this item!','system');return}
  if(!selChar.equipment)selChar.equipment={};
  const slot=item.slot||'weapon';
  const oldId=selChar.equipment[slot];
  if(oldId){selChar.inventory[oldId]=(selChar.inventory[oldId]||0)+1}
  selChar.equipment[slot]=iid;
  selChar.inventory[iid]=Math.max(0,(selChar.inventory[iid]||1)-1);
  if(selChar.inventory[iid]===0)delete selChar.inventory[iid];
  if(G.pl)G.pl.applyChar(selChar);
  renderBag();window.saveProgress?.();
}
function _unequipItemUI(iid){
  if(!selChar||!selChar.equipment)return;
  for(const s in selChar.equipment){if(selChar.equipment[s]===iid){selChar.equipment[s]=null;selChar.inventory[iid]=(selChar.inventory[iid]||0)+1;if(G.pl)G.pl.applyChar(selChar);renderEquipSlots();window.saveProgress?.();return}}
}
function usePotion(iid){
  const item=ITEM_DB[iid];if(!item||!selChar||!G.pl)return;
  const qty=selChar.inventory[iid]||0;if(qty<=0)return;
  if(item.heal){G.pl.hp=Math.min(G.pl.maxHp,G.pl.hp+item.heal);G.fts.push(new FT(G.pl.x,G.pl.y-40,'+'+item.heal+' HP','#40c840',14))}
  if(item.mana){G.pl.mp=Math.min(G.pl.maxMp,G.pl.mp+item.mana);G.fts.push(new FT(G.pl.x,G.pl.y-40,'+'+item.mana+' MP','#4080ff',14))}
  // Elixir / special item buffs
  if(item.buffAtk||item.buffDef||item.buffSpd||item.cure||item.revive){
    if(window.ActiveBuffs) window.ActiveBuffs.apply(iid);
  }
  selChar.inventory[iid]=qty-1;if(selChar.inventory[iid]===0)delete selChar.inventory[iid];
  renderBag();
}
function sellItem(iid){
  const item=ITEM_DB[iid];if(!item||!selChar)return;
  const qty=selChar.inventory[iid]||0;if(qty<=0)return;
  selChar.gold=(selChar.gold||0)+item.sell;
  selChar.inventory[iid]=qty-1;if(selChar.inventory[iid]===0)delete selChar.inventory[iid];
  addChat('','Sold '+item.name+' for '+item.sell+' gold','system');
  renderBag();window.saveProgress?.();
}

// ── ENHANCEMENT ───────────────────────────────────────────────────
let enhTarget=null;
function renderEnhancement(){
  if(!selChar)return;
  E('invTabEquip').classList.remove('active');E('invTabBag').classList.remove('active');E('invTabEnh').classList.add('active');
  const eq=selChar.equipment||{};
  let html='<div class="enh-panel"><div style="font-family:Cinzel,serif;font-size:.62rem;color:var(--muted);margin-bottom:6px">Select equipped item to enhance:</div>';
  html+='<div class="inv-grid" style="grid-template-columns:repeat(4,1fr)">';
  for(const s of ['weapon','armor','helmet','gloves','boots','ring1','ring2','amulet','earring']){
    const iid=eq[s];if(!iid)continue;const item=ITEM_DB[iid];if(!item)continue;
    html+=`<div class="inv-slot has-item${enhTarget===iid?' sel':''}" onclick="setEnhTarget('${iid}')" title="${item.name}">
      ${item.icon}<span class="item-enh">+${item.enh||0}</span></div>`;
  }
  html+='</div>';
  if(enhTarget){
    const item=ITEM_DB[enhTarget];const enh=item?.enh||0;
    const rate=ENH_RATES[Math.min(enh,ENH_RATES.length-1)]||{success:5,fail:55,break:40};
    const cost=Math.floor((enh+1)*80*(1+enh*.6));
    html+=`<div class="enh-item-preview">
      <div class="enh-icon">${item.icon}</div>
      <div class="enh-info">
        <div class="enh-name">${item.name}</div>
        <div class="enh-lv">+${enh} → <span style="color:#40c840">+${enh+1}</span>${enh>=9?'&nbsp;(MAX)':''}</div>
        <div class="enh-bar-bg"><div class="enh-bar-fill" style="width:${enh/9*100}%"></div></div>
      </div></div>
    <div class="enh-rates">
      <span>✅ ${rate.success}%</span><span>❌ ${rate.fail}%</span><span>💥 ${rate.break}%</span>
    </div>
    <div class="enh-cost"><span>Cost:</span><span>💰 ${cost} gold</span></div>
    <div class="enh-cost" style="border-top:1px solid rgba(255,255,255,.04);padding-top:5px">
      <span style="font-size:.6rem;color:var(--muted)">Luna Stone: </span>
      <span style="color:var(--gold)">${selChar.inventory?.luna_stone||0}x</span>
      &nbsp;<span style="font-size:.6rem;color:var(--muted)">Chaos Stone: </span>
      <span style="color:#c9a84c">${selChar.inventory?.chaos_stone||0}x</span>
      &nbsp;<span style="font-size:.6rem;color:var(--muted)">Star Stone: </span>
      <span style="color:#ffcc44">${selChar.inventory?.star_stone||0}x</span>
    </div>
    <div class="enh-result" id="enhResult"></div>
    <div style="display:flex;gap:5px">
      <button class="btn btn-gold" style="flex:2;padding:9px;font-size:.7rem" onclick="doEnhance(false)">⬆ Enhance</button>
      <button class="btn btn-blue" style="flex:1;padding:9px;font-size:.6rem" title="Use Star Stone (no break)" onclick="doEnhance(true)">⭐ Safe</button>
    </div>`;
  }
  html+='</div>';E('invBody').innerHTML=html;
}
function setEnhTarget(iid){enhTarget=iid;renderEnhancement()}
function doEnhance(safe){
  if(!enhTarget){return}const item=ITEM_DB[enhTarget];if(!item)return;
  const enh=item.enh||0;if(enh>=9){E('enhResult').textContent='Already at maximum +9!';return}
  const cost=Math.floor((enh+1)*80*(1+enh*.6));
  if((selChar.gold||0)<cost){E('enhResult').innerHTML='<span style="color:#e84040">Not enough gold!</span>';return}
  if(safe){const ss=selChar.inventory?.star_stone||0;if(ss<=0){E('enhResult').innerHTML='<span style="color:#e84040">No Star Stone!</span>';return}selChar.inventory.star_stone=ss-1}
  if(!selChar||!G?.pl)return;
  selChar.gold-=cost;
  const rate=ENH_RATES[Math.min(enh,ENH_RATES.length-1)];
  const roll=Math.random()*100;const el=E('enhResult');
  if(safe||roll<rate.success){
    item.enh=(item.enh||0)+1;
    el.textContent=`✨ SUCCESS! ${item.name} +${item.enh}`;el.className='enh-result enh-success';
    if(typeof Audio!=='undefined') Audio.playSFX('enhance_success');
    if(G.pl)G.pl.applyChar(selChar);
  }else if(roll<rate.success+rate.fail){
    el.textContent='❌ Failed... item unchanged';el.className='enh-result enh-fail';
    if(typeof Audio!=='undefined') Audio.playSFX('enhance_fail');
  }else{
    const slot=Object.keys(selChar.equipment||{}).find(s=>selChar.equipment[s]===enhTarget);
    if(slot)selChar.equipment[slot]=null;
    delete ITEM_DB[enhTarget];enhTarget=null;
    el.textContent='💥 DESTROYED! Item is gone!';el.className='enh-result enh-break';
    if(typeof Audio!=='undefined') Audio.playSFX('enhance_break');
  }
  window.saveProgress?.();setTimeout(()=>renderEnhancement(),2000);
}

// ── CHARACTER STATS ────────────────────────────────────────────────
function openStats(){if(!selChar)return;E('statsPanel2').classList.remove('off');renderStats()}
function renderStats(){
  const p=G.pl;const lv=selChar.level||1;
  const eq=selChar.equipment||{};
  let bAtk=0,bDef=0,bInt=0,bHp=0,bMp=0,bStr=0,bDex=0,bSpd=0;
  for(const iid of Object.values(eq)){
    if(!iid)continue;const item=ITEM_DB[iid];if(!item)continue;const e=item.enh||0;
    if(item.atk)bAtk+=item.atk+e*Math.floor(item.atk*.08);if(item.def)bDef+=item.def+e*Math.floor(item.def*.08);
    if(item.int)bInt+=item.int+e*Math.floor(item.int*.08);if(item.hp)bHp+=item.hp;if(item.mp)bMp+=item.mp;
    if(item.str)bStr+=item.str;if(item.dex)bDex+=item.dex;if(item.spd)bSpd+=item.spd;
  }
  const isEl=selChar.faction==='elmorad'||selChar.faction==='cahaya';
  E('statsBody').innerHTML=`
    <div style="text-align:center;margin-bottom:10px">
      <div style="font-size:2rem">${(RACES[selChar.race]||RACES.human).icon}</div>
      <div style="font-family:'Cinzel Decorative',serif;font-size:.9rem;color:var(--gold)">${selChar.char_name}</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:var(--muted)">${(JOBS[selChar.job]||JOBS.warrior).name} | ${isEl?'🌟 El Morad':'🔥 Karus'}</div>
    </div>
    <div class="stat-detail-grid">
      <div class="sd-row"><span class="sd-lbl">Level</span><span class="sd-val">${lv}</span></div>
      <div class="sd-row"><span class="sd-lbl">Gold</span><span class="sd-val" style="color:#f0c840">${(selChar.gold||0).toLocaleString()}</span></div>
      <div class="sd-row"><span class="sd-lbl">HP</span><span class="sd-val red">${p?Math.ceil(p.maxHp):'-'}${bHp?'<span style="color:#40c840">+'+bHp+'</span>':''}</span></div>
      <div class="sd-row"><span class="sd-lbl">MP</span><span class="sd-val purple">${p?Math.ceil(p.maxMp):'-'}${bMp?'<span style="color:#40c840">+'+bMp+'</span>':''}</span></div>
      <div class="sd-row"><span class="sd-lbl">ATK</span><span class="sd-val">${p?Math.ceil(p.atk):'-'}${bAtk?'<span style="color:#40c840">+'+bAtk+'</span>':''}</span></div>
      <div class="sd-row"><span class="sd-lbl">DEF</span><span class="sd-val">${p?Math.ceil(p.def):'-'}${bDef?'<span style="color:#40c840">+'+bDef+'</span>':''}</span></div>
      <div class="sd-row"><span class="sd-lbl">STR</span><span class="sd-val">${selChar.stat_str||0}${bStr?'<span style="color:#40c840">+'+bStr+'</span>':''}</span></div>
      <div class="sd-row"><span class="sd-lbl">DEX</span><span class="sd-val green">${selChar.stat_dex||0}${bDex?'<span style="color:#40c840">+'+bDex+'</span>':''}</span></div>
      <div class="sd-row"><span class="sd-lbl">INT</span><span class="sd-val purple">${selChar.stat_int||0}${bInt?'<span style="color:#40c840">+'+bInt+'</span>':''}</span></div>
      <div class="sd-row"><span class="sd-lbl">Skill Pts</span><span class="sd-val">${selChar.skill_pts||0}</span></div>
      <div class="sd-row"><span class="sd-lbl">Zone</span><span class="sd-val" style="font-size:.55rem">${ZONES[selChar.current_zone||'moradon']?.name||'-'}</span></div>
      <div class="sd-row"><span class="sd-lbl">Best Wave</span><span class="sd-val">${selChar.best_wave||0}</span></div>
    </div>
    <div style="margin-top:8px;display:flex;gap:5px">
      <button class="btn btn-gold" style="flex:1;font-size:.62rem;padding:7px" onclick="openSkillTree()">Skill Tree</button>
      <button class="btn btn-dim" style="flex:1;font-size:.62rem;padding:7px" onclick="document.getElementById('statsPanel2').classList.add('off')">Close</button>
    </div>
    ${(()=>{ const sb=window.ItemSystem?.getSetBonus(selChar); if(!sb||!Object.keys(sb).length) return '';
      return `<div style="margin-top:8px;padding:8px;background:rgba(201,168,76,.06);
        border:1px solid rgba(201,168,76,.2);border-radius:4px">
        <div style="font-family:'Cinzel',serif;font-size:.58rem;color:rgba(201,168,76,.6);
          letter-spacing:.12em;margin-bottom:5px">✦ SET BONUS AKTIF</div>
        ${Object.values(sb).map(b=>`<div style="font-family:'Share Tech Mono',monospace;
          font-size:.6rem;color:#c9a84c;margin-bottom:3px">
          ${b.name} (${b.count}/${b.tier} pcs): ${b.desc}</div>`).join('')}
      </div>`;
    })()}`;
}

// ── SHOP ──────────────────────────────────────────────────────────
let curShopId='general',curShopTab=null;
function openShop(shopId){
  curShopId=shopId||'general';E('shopPanel').classList.remove('off');
  const shop=SHOPS[curShopId];if(!shop)return;
  // Build tabs
  const tabs=Object.keys(shop.tabs);curShopTab=tabs[0];
  E('shopTabsRow').innerHTML=tabs.map((t,i)=>`<div class="ov-tab${i===0?' active':''}" id="shopTab_${t}" onclick="renderShopTab('${t}')">${t}</div>`).join('');
  E('shopTitle').textContent='🏪 '+shop.name;
  renderShopTab(tabs[0]);
}
function renderShopTab(tab){
  curShopTab=tab;
  const shop=SHOPS[curShopId];if(!shop)return;
  document.querySelectorAll('#shopTabsRow .ov-tab').forEach(el=>el.classList.remove('active'));
  const tabEl=E('shopTab_'+tab);if(tabEl)tabEl.classList.add('active');
  const items=shop.tabs[tab]||[];
  let html=`<div class="shop-gold">💰 Your Gold: ${(selChar?.gold||0).toLocaleString()}</div>`;
  items.forEach(iid=>{
    const item=ITEM_DB[iid];if(!item)return;
    html+=`<div class="shop-item" onclick="buyItem('${iid}')"
      onmouseenter="window.ItemSystem?.showTooltip('${iid}',event.clientX,event.clientY)"
      onmouseleave="window.ItemSystem?.hideTooltip()">
      <div class="shop-item-icon">${item.icon}</div>
      <div class="shop-item-info">
        <div class="shop-item-name rarity-${item.rarity}">${item.name}</div>
        <div class="shop-item-desc">${item.type==='potion'?`Restores ${item.heal||item.mana||0} ${item.heal?'HP':'MP'}`:item.type==='scroll'?'Teleport scroll':item.type==='mat'?'Enhancement material':item.type}</div>
      </div>
      <div class="shop-item-price">💰 ${item.price}</div>
    </div>`;
  });
  E('shopBody').innerHTML=html;
}
function buyItem(iid){
  const item=ITEM_DB[iid];if(!item||!selChar)return;
  if(!item.price){addChat('','This item cannot be purchased.','system');return}
  if((selChar.gold||0)<item.price){addChat('','Not enough gold!','system');renderShopTab(curShopTab);return}
  selChar.gold-=item.price;
  if(item.stack){selChar.inventory[iid]=(selChar.inventory[iid]||0)+1}
  else{const copyId=iid+'_'+Date.now();ITEM_DB[copyId]={...item,enh:0};selChar.inventory[copyId]=(selChar.inventory[copyId]||0)+1}
  if(typeof Audio!=='undefined') Audio.playSFX('buy');
  addChat('','Bought: '+item.name+' (-'+item.price+'g)','system');
  renderShopTab(curShopTab);window.saveProgress?.();
}

// ── DUNGEON ───────────────────────────────────────────────────────
function openDungeon(){if(!selChar)return;E('dungeonPanel').classList.remove('off');renderDungeons()}
function renderDungeons(){
  const lv=selChar?.level||1;
  const dlist=[
    {id:'dungeon_goblin',name:'Goblin Cave',    icon:'🟢',diff:'easy',  reqLv:1,  waves:5,  boss:'goblin_king',  rw:{xp:500,gold:100,item:'hpot_sm'}},
    {id:'dungeon_orc',   name:'Orc Fortress',   icon:'🟡',diff:'normal',reqLv:10, waves:8,  boss:'orc_warlord',  rw:{xp:2000,gold:500,item:'chaos_stone'}},
    {id:'dungeon_dark',  name:'Dark Temple',     icon:'🔴',diff:'hard',  reqLv:25, waves:12, boss:'demon_king',   rw:{xp:8000,gold:2000,item:'star_stone'}},
  ];
  let html='';
  dlist.forEach(d=>{
    const locked=lv<d.reqLv;
    html+=`<div class="dungeon-card${locked?' locked':''}" onclick="${locked?'':' startDungeon(\''+d.id+'\',\''+d.boss+'\','+d.waves+','+JSON.stringify(d.rw).replace(/"/g,"'")+')'}">
      <div class="dungeon-icon">${d.icon}</div>
      <div class="dungeon-info">
        <div class="dungeon-name">${d.name}</div>
        <div class="dungeon-desc">${d.waves} waves | Boss: ${d.boss.replace('_',' ')}</div>
        <div class="dungeon-req">${locked?'Requires Lv.'+d.reqLv:'Reward: '+d.rw.xp+' XP | '+d.rw.gold+' gold'}</div>
      </div>
      <div class="diff-tag diff-${d.diff}">${d.diff.toUpperCase()}</div>
    </div>`;
  });
  E('dungeonBody').innerHTML=html;
}
function startDungeon(zoneId,bossType,waves,rewards){
  if(!selChar)return;
  const lv=selChar?.level||1;const zone=ZONES[zoneId];if(!zone||lv<zone.reqLv)return;
  G.dungeonMode={id:zoneId,bossType,totalWaves:waves,rewards};
  closeAllPanels();startGame();
}

// ── NATION WAR PANEL ──────────────────────────────────────────────
function openNWPanel(){if(!selChar)return;E('nwPanel').classList.remove('off');renderNWPanel()}
function renderNWPanel(){
  const isEl=selChar?.faction==='elmorad'||selChar?.faction==='cahaya';
  E('nwBody').innerHTML=`
    <div class="nw-panel">
      <div class="nw-panel-title">⚔️ Nation War — Ronark Land</div>
      <div class="nw-vs">
        <div class="nw-side el"><div class="nw-side-name">🌟 El Morad</div><div class="nw-side-score">${nwScore.elmorad}</div></div>
        <div class="nw-vs-sep">VS</div>
        <div class="nw-side kr"><div class="nw-side-name">🔥 Karus</div><div class="nw-side-score">${nwScore.karus}</div></div>
      </div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:var(--muted);text-align:center;margin-top:6px">
        ${nwActive?'War active! Time: '+fmtTime(nwTimer):'War is not active'}
      </div>
    </div>
    <div style="font-family:'Cinzel',serif;font-size:.65rem;color:rgba(201,168,76,.5);margin-bottom:7px">
      Your Nation: <span style="color:${isEl?'var(--el)':'var(--kr)'}">${isEl?'🌟 El Morad':'🔥 Karus'}</span>
    </div>
    <div style="font-size:.65rem;color:var(--muted);margin-bottom:8px;line-height:1.6">
      Join Nation War in Ronark Land! Kill enemies to score points for your nation. Winner gets 2000 gold & 5000 XP!
    </div>
    <div style="display:flex;gap:6px">
      <button class="btn btn-${isEl?'gold':'red'}" style="flex:2;padding:10px;font-size:.7rem" onclick="joinNW()">⚔️ Join War</button>
      <button class="btn btn-dim" style="flex:1;padding:10px;font-size:.65rem" onclick="document.getElementById('nwPanel').classList.add('off')">Close</button>
    </div>`;
}
function joinNW(){
  if(!nwActive)startNationWar();
  G.dungeonMode=null;closeAllPanels();gotoZone('ronark');startGame();
  addChat('','Joined Nation War in Ronark Land!','system');
}
function fmtTime(s){const m=Math.floor(s/60),ss=s%60;return `${m}:${ss.toString().padStart(2,'0')}`}

// ── SKILL TREE ─────────────────────────────────────────────────────
function openSkillTree(){if(!selChar)return;E('skillTreePanel').classList.remove('off');renderSkillTree()}
function renderSkillTree(){
  const job=selChar?.job||'warrior';const tree=SKILL_TREES[job];if(!tree)return;
  const learned=selChar.skill_tree||{};const pts=selChar.skill_pts||0;
  let html=`<div class="skill-pts-bar">Skill Points: <span style="color:var(--gold)">${pts}</span></div>`;
  // Passive
  html+=`<div class="skill-section-title">⬆ Passive</div><div class="skill-grid">`;
  tree.passive.forEach(s=>{
    const lv=learned[s.id]||0;const can=pts>0&&lv<s.maxLv;
    const cls=lv>=s.maxLv?'maxed':lv>0?'unlocked':can?'':'locked';
    html+=`<div class="skill-node ${cls}" onclick="${can?`learnSkill('${s.id}')`:''}" title="${s.desc}">
      <div class="sn-icon">${s.icon}</div><div class="sn-name">${s.name}</div><div class="sn-lv">${lv}/${s.maxLv}</div></div>`;
  });
  html+='</div>';
  // Active
  html+=`<div class="skill-section-title">⚡ Active</div><div class="skill-grid">`;
  tree.active.forEach(s=>{
    const lv=learned[s.id]||0;const reqOk=!s.req||(learned[s.req]||0)>0;const can=pts>0&&lv<s.maxLv&&reqOk;
    const cls=lv>=s.maxLv?'maxed':lv>0?'unlocked':can?'':'locked';
    html+=`<div class="skill-node ${cls}" onclick="${can?`learnSkill('${s.id}')`:''}" title="${s.desc} (${s.mpCost}MP, ${s.cd}s CD)">
      <div class="sn-icon">${s.icon}</div><div class="sn-name">${s.name}</div><div class="sn-lv">${lv}/${s.maxLv}</div></div>`;
  });
  html+='</div>';
  E('skillBody').innerHTML=html;
}
function learnSkill(sid){
  if(!selChar||(selChar.skill_pts||0)<=0)return;
  const job=selChar?.job||'warrior';const tree=SKILL_TREES[job];if(!tree)return;
  const allSkills=[...tree.passive,...tree.active];const s=allSkills.find(x=>x.id===sid);if(!s)return;
  const learned=selChar.skill_tree||{};
  if((learned[s.id]||0)>=s.maxLv)return;
  if(s.req&&!(learned[s.req]>0))return;
  selChar.skill_tree[s.id]=(selChar.skill_tree[s.id]||0)+1;
  selChar.skill_pts=Math.max(0,(selChar.skill_pts||0)-1);
  if(G.pl)G.pl.applyChar(selChar);
  renderSkillTree();window.saveProgress?.();
  addChat('','Learned: '+(s.name)+' Lv.'+(selChar.skill_tree[s.id]),'system');
}

// ── TRADE PANEL ───────────────────────────────────────────────────
let tradeState={myItems:{},myGold:0,theirItems:{},theirGold:0,myAccepted:false,theirAccepted:false};
function openTrade(){if(!selChar)return;E('tradePanel').classList.remove('off');renderTrade()}
function renderTrade(){
  const inv=selChar?.inventory||{};const items=Object.entries(inv).filter(([,q])=>q>0).slice(0,6);
  let myGrid='';items.forEach(([iid])=>{const item=ITEM_DB[iid];if(!item)return;myGrid+=`<div class="inv-slot has-item" onclick="addToTrade('${iid}')" title="${item.name}">${item.icon}</div>`});
  for(let i=items.length;i<6;i++)myGrid+='<div class="inv-slot"></div>';
  E('tradeBody').innerHTML=`
    <div style="font-family:'Cinzel',serif;font-size:.65rem;color:rgba(201,168,76,.5);text-transform:uppercase;margin-bottom:8px">
      Trade System
    </div>
    <div class="trade-grid">
      <div class="trade-side">
        <div class="trade-side-title">You (${selChar?.char_name||'?'})</div>
        <div class="trade-items">${myGrid}</div>
        <div class="trade-gold-row">Gold: <input class="trade-gold-inp" id="tradeGoldInp" type="number" min="0" value="0"> g</div>
      </div>
      <div class="trade-side">
        <div class="trade-side-title">Partner</div>
        <div class="trade-items"><div class="inv-slot"></div><div class="inv-slot"></div><div class="inv-slot"></div></div>
        <div class="trade-gold-row" style="color:var(--muted)">Waiting...</div>
      </div>
    </div>
    <div class="trade-accept" id="tradeAcceptRow">
      <div class="trade-check${tradeState.myAccepted?' accepted':''}" onclick="toggleTradeAccept()" id="myTradeCheck"></div>
      <span>I Accept Trade</span>
      <span style="margin-left:8px;color:var(--muted)">Partner: ${tradeState.theirAccepted?'✅':'⏳'}</span>
    </div>
    <div style="margin-top:8px;display:flex;gap:5px">
      <button class="btn btn-gold" style="flex:1;font-size:.65rem;padding:7px" onclick="toggleTradeAccept()">Accept</button>
      <button class="btn btn-red" style="flex:1;font-size:.65rem;padding:7px" onclick="cancelTrade()">Cancel</button>
    </div>
    <div style="font-size:.6rem;color:var(--muted);text-align:center;margin-top:5px">
      💡 Trade requires both players to accept. Share your party code to find each other online.
    </div>`;
}
function addToTrade(iid){addChat('','Added to trade: '+(ITEM_DB[iid]?.name||iid),'system')}
function toggleTradeAccept(){
  tradeState.myAccepted=!tradeState.myAccepted;
  const el=E('myTradeCheck');if(el)el.classList.toggle('accepted',tradeState.myAccepted);
  addChat('',tradeState.myAccepted?'You accepted the trade.':'You cancelled your acceptance.','system');
}
function cancelTrade(){tradeState={myItems:{},myGold:0,theirItems:{},theirGold:0,myAccepted:false,theirAccepted:false};E('tradePanel').classList.add('off');addChat('','Trade cancelled.','system')}

// ── NOTIFS ────────────────────────────────────────────────────────
function showLvNotif(){
  const el=E('lvnotif');if(!el)return;
  el.textContent='⬆ LEVEL UP! '+(window.selChar?.level||'');el.classList.add('sh');
  if(G&&G.pl&&G.pts){for(let i=0;i<28;i++){const a=(i/28)*Math.PI*2,sp=90+Math.random()*140;G.pts.push(new Pt(G.pl.x,G.pl.y,Math.cos(a)*sp,Math.sin(a)*sp,'#ffcc44',5,.75))}}
  setTimeout(()=>el.classList.remove('sh'),2200);
}
function showWvNotif(t){const el=E('wvnotif');el.textContent=t;el.classList.add('sh');setTimeout(()=>el.classList.remove('sh'),2600)}
function showNWNotif(t){const el=E('nwNotif');el.textContent=t;el.classList.add('sh');setTimeout(()=>el.classList.remove('sh'),3000)}

// ── GAME START ────────────────────────────────────────────────────
function startGame(){
  hideAll();sc('hud','on');sc('skillBar','on');sc('topBtns','on');sc('minimap','on');sc('chatBox','on');
  if(!offlineMode&&SB)sc('opill','on');
  sc('pkStatus','on');const el=E('pkStatus');if(el){el.className='pk-peace';el.innerHTML='<div class="pk-indicator"></div><span>PEACE</span>'}
  if(myParty.members.length>0)sc('partyHud','on');
  for(const k in opMap)delete opMap[k];G.init();initRT();
  if(selChar)showZoneBanner(G.currentZone||'moradon');
}
function useQuickElixir(){
  if(!selChar||!G?.pl)return;
  const elixirs=['elixir_power','elixir_speed','elixir_guard'];
  for(const eid of elixirs){
    const qty=selChar.inventory[eid]||0;
    if(qty>0){
      usePotion(eid);
      if(typeof Audio!=='undefined') Audio.playSFX('buff');
      updQuickElixirBtn();
      return;
    }
  }
  if(typeof addChat==='function') addChat('','⚗️ Tiada Elixir dalam bag!','system');
}

function updQuickElixirBtn(){
  const elixirs=['elixir_power','elixir_speed','elixir_guard'];
  const iconEl=document.getElementById('quickElixirIcon');
  const qtyEl=document.getElementById('quickElixirQty');
  const btn=document.getElementById('quickElixirBtn');
  if(!iconEl||!qtyEl||!selChar)return;
  let total=0, icon='💪';
  for(const eid of elixirs){
    const q=selChar.inventory[eid]||0; total+=q;
    if(q>0){
      icon=eid==='elixir_speed'?'⚡':eid==='elixir_guard'?'🛡️':'💪'; break;
    }
  }
  iconEl.textContent=icon;
  if(total>0){qtyEl.textContent=total;qtyEl.style.display='block';btn.style.opacity='1';}
  else{qtyEl.style.display='none';btn.style.opacity='.35';}
}

function useQuickPotion(){
  if(!G.pl||!selChar)return;
  const inv=selChar.inventory||{};
  const pot=inv.hpot_lg>0?'hpot_lg':inv.hpot_md>0?'hpot_md':inv.hpot_sm>0?'hpot_sm':null;
  if(!pot){addChat('','No HP Potion!','system');return}
  usePotion(pot);
}

// ── Alias untuk init.js ───────────────────────────────
window._openInventory  = openInventory;
window._openSkillTree  = openSkillTree;
window._openStats      = openStats;
window._openStatAlloc  = openStatAlloc;
window._openParty      = openParty;
window._openNWPanel    = openNWPanel;
window._openDungeon    = openDungeon;
window._togglePK       = togglePK;
window._useQuickPotion = useQuickPotion;
window._sendChat       = sendChat;

// ── Window exports untuk init.js ─────────────────────
window.hideAll  = hideAll;
window.sc       = sc;
window.E        = E;
window.addChat  = addChat;
window.goMenu   = goMenu;
window.goCharSelect = goCharSelect;
window.openInventory = openInventory;
window.openSkillTree = openSkillTree;
window.openStats     = openStats;
window.openStatAlloc = openStatAlloc;
window.openParty     = openParty;
window.openNWPanel   = openNWPanel;
window.openDungeon   = openDungeon;
window.openCZPanel   = openCZPanel;
window.renderPartyPanel = typeof renderPartyPanel !== 'undefined' ? renderPartyPanel : null;
window.renderNWPanel    = typeof renderNWPanel !== 'undefined' ? renderNWPanel : null;
window.renderDungeons   = typeof renderDungeons !== 'undefined' ? renderDungeons : null;
window.renderCZPanel    = typeof renderCZPanel !== 'undefined' ? renderCZPanel : null;

// ── Additional exports ──────────────────────────────
window.useQuickElixir = useQuickElixir;
window.updQuickElixirBtn = updQuickElixirBtn;
window.doEnhance = doEnhance;
window.updHUD = updHUD;
window.updMinimap = updMinimap;
window.showZoneBanner = showZoneBanner;
