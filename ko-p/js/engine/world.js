'use strict';
/* ══ Engine: World / G Object ══ */

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
    this.currentZone = zoneId;
    const zone = window.ZONES[zoneId];
    if (!zone) { console.warn('[PT] Zone not found:', zoneId); return; }

    const sx = zone.spawnX || WW/2, sy = zone.spawnY || WH/2;

    // Reset combat state
    this.enemies = []; this.projs = []; this.pts = []; this.fts = [];
    if (typeof groundItems !== 'undefined') groundItems.length = 0;
    this.wave = 1; this.score = 0; this.kills = 0;
    this.waveDone = false; this.spawnQ = []; this.spawnT = 0;
    this.breakT = 0;

    // Teleport player ke spawn point
    if (this.pl) {
      this.pl.x = sx; this.pl.y = sy;
      this.pl.hp = Math.min(this.pl.hp, this.pl.maxHp); // jangan heal penuh
      this.pl.hurt = 0; this.pl.inv = 0;
    }

    // Regenerate tiles
    this.genTiles();
    this.loadZoneNPCs();

    // Farming system untuk zone baru
    if (typeof window.farmingInitZone === 'function') window.farmingInitZone(zoneId);
    else if (typeof farmingInitZone === 'function') farmingInitZone(zoneId);

    // Muzik
    if (typeof Audio !== 'undefined') Audio.playZoneMusic(zoneId);

    // Save zone
    if (window.selChar) window.selChar.current_zone = zoneId;

    // State
    this.state = 'play';

    // Mula wave kalau bukan town
    if (zone.type !== 'town') {
      this.startWave();
    }
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
    if (p.hp<=0) { this.endGame(); return; }

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
        saveProgress();
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
        const grd=cx.createRadialGradient(tx,ty,0,tx,ty,85*fl);
        grd.addColorStop(0,tc); grd.addColorStop(1,'rgba(0,0,0,0)');
        cx.fillStyle=grd; cx.beginPath(); cx.arc(tx,ty,85*fl,0,Math.PI*2); cx.fill();
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
      await saveProgress(); await submitScore(this.score,this.wave,window.selChar.level);
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
      await saveProgress();
    }
    Ev('goSc').textContent=this.score.toLocaleString();
    Ev('goWv').textContent=this.wave;
    Ev('goKl').textContent=this.kills;
    Ev('goLv').textContent=window.selChar?.level||1;
    Ev('goGl').textContent=(d?.rewards?.gold||0)+this.goldRun;
    hideAll(); sc('gosc','on'); this.dungeonMode=null;
  },
};

