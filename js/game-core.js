'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — Game Core
   Canvas setup, Input handlers, Realtime (WebSocket),
   Job setup, G object (world state), Game loop & boot
   Depends: entities/particles.js, entities/player.js,
            entities/enemy.js, entities/projectile.js,
            entities/npc.js
   ══════════════════════════════════════════════════════ */

// ── CANVAS ───────────────────────────────────────────
const cv = document.getElementById('gc');
const cx = cv.getContext('2d');
window.cam = window.cam || { x: 0, y: 0 };
const cam = window.cam;
window.WW = 3000; window.WH = 3000;
const WW = 3000, WH = 3000;

function resize() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);

// ── INPUT ────────────────────────────────────────────
const KS = {};
const JOY = { on: false, dx: 0, dy: 0, sx: 0, sy: 0 };
let atkDown=false, atkTap=false, spTap=false, sp2Tap=false, sp3Tap=false, sp4Tap=false;

window.addEventListener('keydown', e => {
  KS[e.key] = true;
  if (e.key===' '||e.key==='z') { atkTap = atkDown = true; }
  if (e.key==='q') spTap = true;
  if (e.key==='e') sp2Tap = true;
  if (e.key==='r') sp3Tap = true;
  if (e.key==='f') sp4Tap = true;
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
}, { passive: false });
window.addEventListener('keyup', e => { KS[e.key] = false; if (e.key===' '||e.key==='z') atkDown = false; });

function setupButton(id, onDown, onUp) {
  const el = document.getElementById(id); if (!el) return;
  el.addEventListener('touchstart', e => { e.preventDefault(); onDown(); el.classList.add('pr'); }, { passive: false });
  el.addEventListener('touchend',  e => { e.preventDefault(); if(onUp) onUp(); el.classList.remove('pr'); }, { passive: false });
  el.addEventListener('mousedown', onDown);
  el.addEventListener('mouseup',   onUp||(() => {}));
}
setupButton('atBtn',  () => { atkDown = atkTap = true; }, () => { atkDown = false; });
setupButton('spBtn',  () => { spTap  = true; });
setupButton('sp2Btn', () => { sp2Tap = true; });
setupButton('sp3Btn', () => { sp3Tap = true; });
setupButton('sp4Btn', () => { sp4Tap = true; });

const jz = document.getElementById('jz');
const jk = document.getElementById('jk');
const JR = 42;
jz?.addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.touches[0], r = jz.getBoundingClientRect();
  JOY.sx = r.left+r.width/2; JOY.sy = r.top+r.height/2; JOY.on = true; updJoy(t.clientX, t.clientY);
}, { passive: false });
jz?.addEventListener('touchmove',  e => { e.preventDefault(); updJoy(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
jz?.addEventListener('touchend',   e => { e.preventDefault(); JOY.on=false; JOY.dx=0; JOY.dy=0; jk.style.transform='translate(-50%,-50%)'; }, { passive: false });
function updJoy(cx2, cy2) {
  let dx=cx2-JOY.sx, dy=cy2-JOY.sy;
  const d = Math.hypot(dx, dy);
  if (d > JR) { dx = dx/d*JR; dy = dy/d*JR; }
  JOY.dx = dx/JR; JOY.dy = dy/JR;
  jk.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
}
cv.addEventListener('mousemove', e => { if (G.state!=='play'||!G.pl) return; G.pl.dir = Math.atan2(e.clientY+cam.y-G.pl.y, e.clientX+cam.x-G.pl.x); });
cv.addEventListener('mousedown', e => { if (G.state!=='play') return; if (e.button===0) { atkDown=atkTap=true; } });
cv.addEventListener('mouseup',   () => { atkDown = false; });

// ── REALTIME ─────────────────────────────────────────
window.rtCh = null;
let rtCh = null;
window.opMap = window.opMap || {};
function initRT() {
  if (window.offlineMode||!SB||!window.selChar) return;
  if (rtCh) rtCh.unsubscribe();
  rtCh = SB.channel('ko_world', { config:{broadcast:{self:false}, presence:{key:window.selChar.id||window.curAccount.uid}} });
  window.rtCh = rtCh;
  rtCh
    .on('broadcast',{event:'pos'},   ({payload}) => { if (payload.id!==window.selChar.id) window.opMap[payload.id]=payload; })
    .on('broadcast',{event:'leave'}, ({payload}) => { delete window.opMap[payload.id]; })
    .on('broadcast',{event:'chat'},  ({payload}) => { addChat(payload.name, payload.msg, payload.type||'normal'); })
    .on('broadcast',{event:'party_req'}, ({payload}) => {
      if (payload.code === window.curAccount?.uid?.slice(-6).toUpperCase()) {
        myParty.members.push({id:payload.id, name:payload.from, hpPct:100});
        addChat('', payload.from+' joined your party!', 'system');
        renderPartyPanel();
      }
    })
    .on('presence',{event:'sync'},   () => {
      const n = Object.keys(rtCh.presenceState()).length;
      const el=Ev('ocnt'); if(el) el.textContent=n;
    })
    .subscribe(async s => {
      if (s==='SUBSCRIBED') await rtCh.track({id:window.selChar.id, name:window.selChar.char_name, faction:window.selChar.faction, x:Math.round(G.pl?.x||0), y:Math.round(G.pl?.y||0)});
    });
}
function bcastPos() {
  if (!rtCh||!G.pl||!window.selChar) return;
  rtCh.send({type:'broadcast', event:'pos', payload:{
    id:window.selChar.id, name:window.selChar.char_name, faction:window.selChar.faction,
    x:Math.round(G.pl.x), y:Math.round(G.pl.y)
  }});
}

// ── JOB SETUP ────────────────────────────────────────
function getJobMul() {
  const j = window.selChar?.job||'warrior';
  const M = {
    warrior:  { spd:165, atkMul:1.0,  rangeMul:1.0, critBase:.08, sk:['⚔ BASH','🛡 SHIELD BASH','🌪 WHIRLWIND','🔥 BERSERK'] },
    rogue:    { spd:210, atkMul:1.15, rangeMul:.85, critBase:.18, sk:['🗡 STAB','☠ POISON','🌑 STEALTH','⚡ TRIPLE'] },
    magician: { spd:150, atkMul:.70,  rangeMul:1.7, critBase:.05, sk:['🔥 FIREBALL','❄ BLIZZARD','☄ METEOR','⚡ LIGHTNING'] },
    priest:   { spd:155, atkMul:.60,  rangeMul:1.4, critBase:.04, sk:['💚 HEAL','⭐ BLESS','🌟 HOLY','💊 CURE'] },
  };
  return M[j] || M.warrior;
}

// ── MAIN GAME ────────────────────────────────────────
window.G = {
  state:'menu', pl:null, enemies:[], projs:[], pts:[], fts:[],
  wave:1, score:0, kills:0, goldRun:0,
  spawnQ:[], spawnT:0, waveDone:false, breakT:0,
  saveT:0, bcastT:0, tiles:null,
  currentZone:'moradon', zoneNPCs:[],
  dungeonMode:null,

  init() {
    const zone=window.ZONES[this.currentZone||'moradon'];
    const sx=zone?.spawnX||WW/2, sy=zone?.spawnY||WH/2;
    this.pl=new Player(sx,sy);
    if (window.selChar) this.pl.applyChar(window.selChar);
    this.enemies=[]; this.projs=[]; this.pts=[]; this.fts=[];
    this.wave=1; this.score=0; this.kills=0; this.goldRun=0;
    this.waveDone=false; this.breakT=0; this.saveT=0; this.bcastT=0;
    for(const k in window.opMap) delete window.opMap[k];
    this.genTiles();
    this.loadZoneNPCs();
    if (typeof farmingInitZone === 'function') farmingInitZone(this.currentZone||'moradon');
    // Play zone music
    if (typeof Audio !== 'undefined') Audio.playZoneMusic(this.currentZone||'moradon');
    if (zone?.type==='town') this.state='play';
    else { this.startWave(); this.state='play'; }
    if (window.selChar) window.selChar.current_zone=this.currentZone;
  },

  changeZone(zoneId) {
    this.currentZone=zoneId;
    const zone=window.ZONES[zoneId];
    if (!zone) return;
    const sx=zone.spawnX||WW/2, sy=zone.spawnY||WH/2;
    this.enemies=[]; this.projs=[]; if(typeof groundItems!=="undefined")groundItems.length=0;
    this.wave=1; this.score=0; this.kills=0;
    this.waveDone=false; this.spawnQ=[];
    if (this.pl) { this.pl.x=sx; this.pl.y=sy; }
    this.genTiles();
    this.loadZoneNPCs();
    // Init farming untuk zone baru
    if (typeof farmingInitZone==='function') farmingInitZone(zoneId);
    // Play zone music
    if (typeof Audio !== 'undefined') Audio.playZoneMusic(zoneId);
    if (window.selChar) window.selChar.current_zone=zoneId;
    if (zone.type!=='town') this.startWave();
  },

  loadZoneNPCs() {
    const zone=window.ZONES[this.currentZone||'moradon'];
    if (!zone?.npc) { this.zoneNPCs=[]; return; }
    this.zoneNPCs=zone.npc.map(id=>window.NPCS[id]).filter(Boolean);
  },

  genTiles() {
    const cols=Math.ceil(WW/64)+1, rows=Math.ceil(WH/64)+1;
    this.tiles=[];
    for(let r=0;r<rows;r++){
      this.tiles[r]=[];
      for(let c=0;c<cols;c++){
        const v=(Math.sin(r*13.7+c*7.3)+1)/2;
        this.tiles[r][c]=v<.08?1:v<.13?2:0;
      }
    }
  },

  startWave() {
    this.spawnQ=[]; this.waveDone=false;
    const zone=window.ZONES[this.currentZone||'moradon'];
    if (zone?.type==='town') return;

    if (this.dungeonMode) {
      const d=this.dungeonMode;
      if (this.wave>d.totalWaves) { this.endDungeon(); return; }
      const n=4+this.wave*2;
      const mTypes=zone?.monsters||['goblin','orc'];
      for(let i=0;i<n;i++) this.spawnQ.push(mTypes[rnd(0,mTypes.length-2)]||'goblin');
      if (this.wave===d.totalWaves) this.spawnQ.push(d.bossType||'boss');
      showWvNotif(this.wave===d.totalWaves?`💀 BOSS!`:`Wave ${this.wave}/${d.totalWaves}`);
    } else {
      const n=5+this.wave*3;
      const mTypes=zone?.monsters||['goblin','orc','archer'];
      for(let i=0;i<n;i++) {
        const r=Math.random();
        this.spawnQ.push(r<.45?mTypes[0]:r<.75?mTypes[Math.min(1,mTypes.length-1)]:mTypes[Math.min(2,mTypes.length-1)]);
      }
      if (this.wave%5===0) this.spawnQ.push('boss');
      showWvNotif(`⚔ Wave ${this.wave}`);
    }
    this.spawnT=0;
    updHUD();
  },

  spawnEnemy(type) {
    const p=this.pl, side=rnd(0,3); let x,y; const off=340;
    switch(side){case 0:x=p.x+rnd(-380,380);y=p.y-off;break;case 1:x=p.x+off;y=p.y+rnd(-380,380);break;case 2:x=p.x+rnd(-380,380);y=p.y+off;break;default:x=p.x-off;y=p.y+rnd(-380,380)}
    x=Math.max(60,Math.min(WW-60,x)); y=Math.max(60,Math.min(WH-60,y));
    this.enemies.push(new Enemy(x,y,type));
  },

  tick(dt) {
    if (this.state!=='play') return;
    const p=this.pl;
    p.tick(dt,this.enemies);
    if (p.hp<=0) {
      // Semak Revive Stone
      if (window.selChar?._hasRevive) {
        window.selChar._hasRevive = false;
        p.hp = Math.floor(p.maxHp * 0.6);
        p.inv = 2; // invincibility 2s
        if (typeof Audio!=='undefined') { Audio.playSFX('revive'); Audio.playSFX('rare'); }
        if (typeof G!=='undefined') G.fts.push(new FT(p.x, p.y-50, '💎 BANGKIT!', '#ffdd44', 18));
        if (typeof addChat==='function') addChat('', '💎 Revive Stone menyelamatkan anda!', 'system');
        return;
      }
      this.endGame(); return;
    }

    // NPC tap detection (touch canvas)
    // Spawn
    const zone=window.ZONES[this.currentZone||'moradon'];
    if (zone?.type!=='town') {
      if (this.spawnQ.length>0) {
        this.spawnT+=dt;
        const iv=Math.max(.3,1.3-this.wave*.04);
        if (this.spawnT>=iv) { this.spawnT=0; this.spawnEnemy(this.spawnQ.shift()); }
      }
    }

    // Tick enemies
    for (const e of this.enemies) if (!e.dead) e.tick(dt,p,this.projs);

    // Rewards
    for (const e of this.enemies) {
      if (e.dead && !e.rewarded) {
        e.rewarded=true; this.kills++; this.score+=e.rew.sc*this.wave; this.goldRun+=e.rew.gold;
        hitPts(e.x,e.y,'rgba(201,168,76,.65)');
        if (window.selChar) {
          window.selChar.gold=(window.selChar.gold||0)+e.rew.gold;
          // EXP — guna farming.js gainExp (proper level up system)
          if (typeof gainExp==='function') gainExp(e.rew.xp);
          // Item drop — guna farming.js drop table
          if (typeof spawnDropItems==='function') spawnDropItems(e.x,e.y,e.type,window.selChar.level||1);
          // CZ colony kill bonus
          if (czActive && typeof addNWKill==='function') addNWKill();
          // DailyQuest kill tracking
          if (window.DailyQuest) {
            window.DailyQuest.addProgress('kills', 1);
            window.DailyQuest.addProgress('gold_earned', e.rew.gold||0);
            if (['boss','goblin_king','orc_warlord','demon_king','world_dragon'].includes(e.type))
              window.DailyQuest.addProgress('boss_kills', 1);
          }
          // WorldBoss damage
          if (window.WorldBoss?.active && window.selChar)
            window.WorldBoss.takeDamage(e.rew.xp*2, window.selChar);
          // onEnemyKilled callback
          if (typeof window.onEnemyKilled==='function') window.onEnemyKilled(e.type, e.x, e.y);
        }
      }
    }
    this.enemies=this.enemies.filter(e=>!e.dead);

    // Farming tick: ground items, boss timer, farm respawn, CZ
    if (typeof farmingTick==='function') farmingTick(dt);

    // Wave complete
    if (!this.waveDone && this.spawnQ.length===0 && this.enemies.length===0 && zone?.type!=='town') {
      this.waveDone=true; this.breakT=3;
      const bonus=this.wave*200; this.score+=bonus;
      showWvNotif(`✓ Wave ${this.wave} Clear! +${bonus}`);
    }
    if (this.waveDone) { this.breakT-=dt; if(this.breakT<=0){this.wave++;this.startWave()} }

    // Projectiles
    for (const pr of this.projs) pr.tick(dt,p);
    this.projs=this.projs.filter(pr=>!pr.dead);

    // Ground items
    tickGroundItems(dt,p);

    // Particles
    for (const pt of this.pts) pt.tick(dt); this.pts=this.pts.filter(pt=>!pt.dead);
    for (const ft of this.fts) ft.tick(dt); this.fts=this.fts.filter(ft=>!ft.dead);

    // Camera
    cam.x+=(p.x-cv.width/2-cam.x)*8*dt;
    cam.y+=(p.y-cv.height/2-cam.y)*8*dt;
    cam.x=Math.max(0,Math.min(WW-cv.width,cam.x));
    cam.y=Math.max(0,Math.min(WH-cv.height,cam.y));

    updHUD();

    // Auto save
    this.saveT+=dt;
    if (this.saveT>=60) {
      this.saveT=0;
      if (window.selChar) {
        window.selChar.best_wave=Math.max(window.selChar.best_wave||0,this.wave);
        window.selChar.best_score=Math.max(window.selChar.best_score||0,this.score);
        if (typeof window.AutoSave?.save === 'function') window.AutoSave.save('auto');
        else if (typeof saveProgress === 'function') window.saveProgress?.();
      }
    }

    // World Boss timer
    if (window.WorldBoss) window.WorldBoss.tick(dt);

    // Daily Quest — track exp/gold gains passively
    if (window.DailyQuest && this.state === 'play') {
      this.dqT = (this.dqT||0) + dt;
      if (this.dqT >= 5) {
        this.dqT = 0;
        // Track zone visits
        if (window.selChar?.current_zone) {
          if (!this._visitedZones) this._visitedZones = new Set();
          this._visitedZones.add(window.selChar.current_zone);
          window.DailyQuest.addProgress('zones', 0); // set not add
          let tree; try { tree = typeof window.selChar.skill_tree==='string'?
            JSON.parse(window.selChar.skill_tree||'{}'):window.selChar.skill_tree||{}; } catch(e) { tree={}; }
          if (!tree._daily) tree._daily={};
          tree._daily.zones = this._visitedZones.size;
          window.selChar.skill_tree = tree;
        }
      }
    }

    // Broadcast position
    this.bcastT+=dt;
    if (this.bcastT>=.14) { this.bcastT=0; bcastPos(); }
  },

  draw() {
    cx.clearRect(0,0,cv.width,cv.height);
    if (this.state!=='play') return;
    cx.save(); cx.translate(-cam.x,-cam.y);
    this.drawWorld();
    drawNPCs();
    drawGroundItems();
    for (const op of Object.values(window.opMap)) drawGhost(op);
    for (const pr of this.projs) pr.draw();
    for (const e of this.enemies) if (!e.dead) e.draw();
    for (const pt of this.pts) pt.draw();
    this.pl.draw();
    for (const ft of this.fts) ft.draw();
    // Farming draw: ground items, CZ overlay
    if (typeof farmingDraw==='function') farmingDraw();
    cx.restore();
  },

  drawWorld() {
    const zone=window.ZONES[this.currentZone||'moradon'];
    const bg=zone?.bgColor||['#0a0e1a','#080c14'];
    const tc=zone?.torchColor||'rgba(255,160,40,.12)';
    const ts=64;
    const startC=Math.max(0,Math.floor(cam.x/ts));
    const endC=Math.min((this.tiles[0]||[]).length,Math.ceil((cam.x+cv.width)/ts)+1);
    const startR=Math.max(0,Math.floor(cam.y/ts));
    const endR=Math.min(this.tiles.length,Math.ceil((cam.y+cv.height)/ts)+1);
    for(let r=startR;r<endR;r++){
      for(let c=startC;c<endC;c++){
        const tx=c*ts, ty=r*ts, t=this.tiles[r]?.[c]||0;
        cx.fillStyle=t===2?bg[1]:t===1?bg[0]:(r+c)%2===0?bg[0]:bg[1];
        cx.fillRect(tx,ty,ts,ts);
        cx.strokeStyle='rgba(255,255,255,.015)'; cx.lineWidth=.5; cx.strokeRect(tx,ty,ts,ts);
      }
    }
    // Torch lights
    const time=Date.now()/1000;
    for(let ry=0;ry<WH;ry+=400){
      for(let rc=0;rc<WW;rc+=400){
        const tx=rc+200,ty=ry+200;
        if(tx<cam.x-220||tx>cam.x+cv.width+220||ty<cam.y-220||ty>cam.y+cv.height+220) continue;
        const fl=1+Math.sin(time*4.2+tx*.01)*.07;
        try {
          const grd=cx.createRadialGradient(tx,ty,0,tx,ty,85*fl);
          grd.addColorStop(0,tc); grd.addColorStop(1,'rgba(0,0,0,0)');
          cx.fillStyle=grd; cx.beginPath(); cx.arc(tx,ty,85*fl,0,Math.PI*2); cx.fill();
        } catch(e) {}
        cx.fillStyle='#8b5e1a'; cx.fillRect(tx-2,ty-13,4,15);
        cx.fillStyle=`rgba(255,${100+Math.sin(time*8+tx)*.01|0},0,.9)`;
        cx.beginPath(); cx.arc(tx,ty-15,4.5*fl,0,Math.PI*2); cx.fill();
      }
    }
    // Border
    const isCahaya=window.selChar?.faction==='elmorad'||window.selChar?.faction==='cahaya';
    cx.strokeStyle=isCahaya?'rgba(201,168,76,.3)':'rgba(200,50,50,.25)';
    cx.lineWidth=4; cx.strokeRect(2,2,WW-4,WH-4);
  },

  async endGame() {
    this.state='gameover';
    if (typeof Audio!=='undefined') { Audio.playSFX('death'); Audio.stopMusic(2); }
    if (window.selChar) {
      window.selChar.best_wave=Math.max(window.selChar.best_wave||0,this.wave);
      window.selChar.best_score=Math.max(window.selChar.best_score||0,this.score);
      window.selChar.gold=(window.selChar.gold||0)+this.goldRun;
      await window.saveProgress?.(); await submitScore(this.score,this.wave,window.selChar.level);
    }
    Ev('goSc').textContent=this.score.toLocaleString();
    Ev('goWv').textContent=this.wave;
    Ev('goKl').textContent=this.kills;
    Ev('goLv').textContent=window.selChar?.level||1;
    Ev('goGl').textContent=this.goldRun;
    hideAll(); sc('gosc','on');
    this.dungeonMode=null;
    if (rtCh) { rtCh.send({type:'broadcast',event:'leave',payload:{id:window.selChar?.id}}); rtCh.unsubscribe(); rtCh=null; window.rtCh=null; }
  },

  async endDungeon() {
    this.state='gameover';
    const d=this.dungeonMode;
    if (d?.rewards && window.selChar) {
      window.selChar.xp=(window.selChar.xp||0)+d.rewards.xp;
      window.selChar.gold=(window.selChar.gold||0)+d.rewards.gold;
      if (d.rewards.item) { window.selChar.inventory[d.rewards.item]=(window.selChar.inventory[d.rewards.item]||0)+1; }
      await window.saveProgress?.();
    }
    Ev('goSc').textContent=this.score.toLocaleString();
    Ev('goWv').textContent=this.wave;
    Ev('goKl').textContent=this.kills;
    Ev('goLv').textContent=window.selChar?.level||1;
    Ev('goGl').textContent=(d?.rewards?.gold||0)+this.goldRun;
    hideAll(); sc('gosc','on'); this.dungeonMode=null;
  },
};

// ── CANVAS NPC TAP ───────────────────────────────────
cv.addEventListener('click', e => {
  if (G.state!=='play'||!G.pl||!G.zoneNPCs) return;
  const wx=e.clientX+cam.x, wy=e.clientY+cam.y;
  for (const npc of G.zoneNPCs) {
    if (Math.hypot(wx-npc.x,wy-npc.y)<50 && npc.id) { openNPC(npc.id); return; }
  }
});
// Give NPCs their ID for click detection
Object.keys(window.NPCS).forEach(id => { if(window.NPCS[id]) window.NPCS[id].id=id; });

// ── LOOP & BOOT ──────────────────────────────────────
// Loop dan boot diuruskan oleh auth.js DOMContentLoaded
let lastT = 0;
function gameLoop(ts) {
  const dt = Math.min((ts-lastT)/1000,.05); lastT=ts;
  try { G.tick(dt); G.draw(); } catch(e) { console.warn('[GameLoop]', e.message); }
  requestAnimationFrame(gameLoop);
}

// ── Window exports ───────────────────────────────────
window.cx            = cx;
window.cv            = cv;
window.initRT        = initRT;
window.showZoneBanner= showZoneBanner;
window.bcastPos      = bcastPos;
window.FT            = FT;
window.Enemy         = Enemy;
window.hitPts        = typeof hitPts !== 'undefined' ? hitPts : null;
