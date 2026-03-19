'use strict';
/* ════════════════════════════════════════════════════
   KO Classic — Game Engine
   Zone system, NPC, PK, Nation War, Drop, Skills
   ════════════════════════════════════════════════════ */

// ── CANVAS ───────────────────────────────────────────
const cv = document.getElementById('gc');
const cx = cv.getContext('2d');
window.cx  = cx;   // expose for inline scripts
window.cam = window.cam || { x: 0, y: 0 };
const cam = window.cam;
window.WW = 3000; window.WH = 3000;
const WW = 3000, WH = 3000;

function resize() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);

// Polyfill roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r){
    const R = Math.min(typeof r==='number'?r:r[0], Math.min(w,h)/2);
    this.beginPath(); this.moveTo(x+R,y); this.lineTo(x+w-R,y);
    this.quadraticCurveTo(x+w,y,x+w,y+R); this.lineTo(x+w,y+h-R);
    this.quadraticCurveTo(x+w,y+h,x+w-R,y+h); this.lineTo(x+R,y+h);
    this.quadraticCurveTo(x,y+h,x,y+h-R); this.lineTo(x,y+R);
    this.quadraticCurveTo(x,y,x+R,y); this.closePath(); return this;
  };
}

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

// ── HELPERS ──────────────────────────────────────────
function angDiff(a,b) { let d=a-b; while(d>Math.PI)d-=Math.PI*2; while(d<-Math.PI)d+=Math.PI*2; return d; }
function rnd(min, max) { return Math.floor(Math.random()*(max-min+1))+min; }
const Ev = id => document.getElementById(id);

// ── PARTICLES ────────────────────────────────────────
class Pt {
  constructor(x,y,vx,vy,col,sz,life) {
    Object.assign(this, {x,y,vx,vy,col,sz,life,ml:life});
  }
  tick(dt) {
    this.x+=this.vx*dt; this.y+=this.vy*dt;
    this.vx*=.88; this.vy*=.88; this.life-=dt;
  }
  draw() {
    const a=this.life/this.ml;
    cx.save(); cx.globalAlpha=a; cx.fillStyle=this.col;
    cx.beginPath(); cx.arc(this.x,this.y,this.sz*a,0,Math.PI*2); cx.fill(); cx.restore();
  }
  get dead() { return this.life<=0; }
}

class FT {
  constructor(x,y,txt,col,sz=14) {
    Object.assign(this, {x,y,txt,col,sz,life:1.1,ml:1.1,vy:-50});
  }
  tick(dt) { this.y+=this.vy*dt; this.vy*=.94; this.life-=dt; }
  draw() {
    const a=this.life/this.ml;
    cx.save(); cx.globalAlpha=a;
    cx.font=`bold ${this.sz}px 'Share Tech Mono',monospace`;
    cx.fillStyle=this.col; cx.textAlign='center';
    cx.shadowColor=this.col; cx.shadowBlur=6;
    cx.fillText(this.txt, this.x, this.y); cx.restore();
  }
  get dead() { return this.life<=0; }
}

function hitPts(x,y,col) {
  for (let i=0; i<6; i++) {
    const a=Math.random()*Math.PI*2, sp=55+Math.random()*90;
    G.pts.push(new Pt(x,y, Math.cos(a)*sp, Math.sin(a)*sp, col, 3, .4));
  }
}

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

// ── PLAYER ───────────────────────────────────────────
class Player {
  constructor(x,y) {
    this.x=x; this.y=y; this.dir=0;
    const jm = getJobMul(); this.jm=jm; this.speed=jm.spd;
    this.maxHp=100; this.hp=100; this.maxMp=60; this.mp=60;
    this.atk=20; this.def=5; this.range=65; this.critRate=jm.critBase;
    this.acd=0; this.acdMax=.40;
    this.scd=0;  this.scdMax=5;
    this.sp2cd=0; this.sp2Max=8;
    this.sp3cd=0; this.sp3Max=14;
    this.sp4cd=0; this.sp4Max=20;
    this.hurt=0; this.inv=0; this.atkAnim=0;
    this.aFrame=0; this.aTimer=0; this.mpRegen=0;
    // Buffs
    this.blessBuff=0; this.berserkBuff=0; this.stealthMode=false; this.stealthTimer=0;
    this.barrierHp=0; this.poisonImmune=0;
  }

  applyChar(ch) {
    const lv = ch.level||1;
    this.maxHp = 90  + (ch.stat_hp||70)*1.3  + (lv-1)*20;
    this.maxMp = 35  + (ch.stat_mp||50)*.85  + (lv-1)*9;
    this.atk   = 12  + (ch.stat_str||70)*.16 + (lv-1)*4.5;
    this.def   = 4   + (ch.stat_hp||70)*.06  + (lv-1)*1.8;
    this.range = 60  + (ch.stat_dex||60)*.08;
    this.speed = getJobMul().spd + (ch.stat_dex||60)*.35;
    this.jm    = getJobMul();

    // Equipment bonuses
    const eq = ch.equipment||{};
    for (const iid of Object.values(eq)) {
      if (!iid) continue;
      const item = window.ITEM_DB[iid]; if (!item) continue;
      const e = item.enh||0;
      if (item.atk) this.atk  += item.atk + e*Math.floor(item.atk*.08);
      if (item.def) this.def  += item.def + e*Math.floor(item.def*.08);
      if (item.int) this.atk  += (item.int + e*Math.floor(item.int*.08))*.5;
      if (item.hp)  this.maxHp += item.hp;
      if (item.mp)  this.maxMp += item.mp;
      if (item.str) this.atk  += item.str*.12;
      if (item.dex) { this.range+=item.dex*.05; this.critRate+=item.dex*.001; }
      if (item.spd) this.speed += item.spd;
    }

    // Skill tree passives
    const tree = window.SKILL_TREES[ch.job||'warrior'];
    const learned = ch.skill_tree||{};
    if (tree) {
      tree.passive.forEach(s => {
        const slv = learned[s.id]||0; if (!slv) return;
        if (s.id==='sword_mastery'||s.id==='dagger_mastery'||s.id==='fire_mastery'||s.id==='holy_mastery')
          this.atk *= (1+slv*.05);
        if (s.id==='shield_mastery') this.def *= (1+slv*.06);
        if (s.id==='hp_boost') this.maxHp *= (1+slv*.08);
        if (s.id==='crit_boost') this.critRate += slv*.04;
        if (s.id==='evasion') this.evasion = (this.evasion||0)+slv*.06;
        if (s.id==='mp_efficiency') this.mpDiscount = (this.mpDiscount||0)+slv*.07;
        if (s.id==='devotion') this.mpRegenBonus = (this.mpRegenBonus||0)+slv*8;
      });
    }

    this.hp = Math.min(this.hp||this.maxHp, this.maxHp);
    this.mp = Math.min(this.mp||this.maxMp, this.maxMp);
  }

  tick(dt, enemies) {
    // Movement
    let dx=0, dy=0;
    if (JOY.on) { dx=JOY.dx; dy=JOY.dy; }
    else {
      if (KS['ArrowLeft']||KS['a']||KS['A']) dx-=1;
      if (KS['ArrowRight']||KS['d']||KS['D']) dx+=1;
      if (KS['ArrowUp']||KS['w']||KS['W']) dy-=1;
      if (KS['ArrowDown']||KS['s']||KS['S']) dy+=1;
    }
    const mg = Math.hypot(dx,dy);
    const spd = this.stealthMode ? this.speed*.25 : this.speed;
    if (mg>.05) {
      dx/=mg; dy/=mg; this.dir=Math.atan2(dy,dx);
      this.aTimer+=dt; if(this.aTimer>.14){this.aTimer=0;this.aFrame=(this.aFrame+1)%4}
    }
    this.x = Math.max(16, Math.min(WW-16, this.x+dx*spd*dt));
    this.y = Math.max(20, Math.min(WH-20, this.y+dy*spd*dt));

    // NPC interaction check
    if (G.zoneNPCs) {
      for (const npc of G.zoneNPCs) {
        if (Math.hypot(this.x-npc.x, this.y-npc.y) < 55) {
          const hint = Ev('npcHint');
          if (hint) { hint.textContent='Tap '+npc.icon+' '+npc.name; hint.style.opacity='1'; }
        }
      }
    }

    // Cooldown ticks
    if(this.acd>0) this.acd-=dt; if(this.scd>0) this.scd-=dt;
    if(this.sp2cd>0) this.sp2cd-=dt; if(this.sp3cd>0) this.sp3cd-=dt; if(this.sp4cd>0) this.sp4cd-=dt;
    if(this.hurt>0) this.hurt-=dt; if(this.inv>0) this.inv-=dt; if(this.atkAnim>0) this.atkAnim-=dt;
    if(this.blessBuff>0) this.blessBuff-=dt;
    if(this.berserkBuff>0) { this.berserkBuff-=dt; if(this.berserkBuff<=0){this.atk/=1.5;this.def/=.75} }
    if(this.stealthMode) { this.stealthTimer-=dt; if(this.stealthTimer<=0) this.stealthMode=false; }
    if(this.poisonImmune>0) this.poisonImmune-=dt;

    // MP regen
    this.mpRegen+=dt;
    if (this.mpRegen>=1.8) {
      this.mpRegen=0;
      const bonus = (this.mpRegenBonus||0) + (this.blessBuff>0?5:0);
      this.mp = Math.min(this.maxMp, this.mp+4+bonus);
    }

    // Nation War NW timer
    if (nwActive) { nwTimer-=dt; if(nwTimer<=0) endNationWar(); }

    // Actions
    if ((atkDown||atkTap) && this.acd<=0) this.doAtk(enemies);
    if (spTap  && this.scd<=0  && this.mp>=this._mpCost(1)) this.doSp1(enemies);
    if (sp2Tap && this.sp2cd<=0 && this.mp>=this._mpCost(2)) this.doSp2(enemies);
    if (sp3Tap && this.sp3cd<=0 && this.mp>=this._mpCost(3)) this.doSp3(enemies);
    if (sp4Tap && this.sp4cd<=0 && this.mp>=this._mpCost(4)) this.doSp4(enemies);
    atkTap=false; spTap=false; sp2Tap=false; sp3Tap=false; sp4Tap=false;
  }

  _mpCost(slot) {
    const job=window.selChar?.job||'warrior'; const tree=window.SKILL_TREES[job]; if(!tree) return 20;
    const skills=tree.active; const s=skills[slot-1]; if(!s) return 20;
    const lv=(window.selChar?.skill_tree||{})[s.id]||1;
    return Math.floor((s.mpCost||20)*(1-(this.mpDiscount||0))*(1+lv*.05));
  }

  doAtk(enemies) {
    if (this.acd>0) return;
    this.acd = this.acdMax; this.atkAnim=.28;
    if (typeof Audio!=='undefined') Audio.playSFX('attack');
    const bAtk = (this.blessBuff>0?this.atk*.12:0) + (this.berserkBuff>0?this.atk*.5:0);
    for (const e of enemies) {
      if (e.dead) continue;
      const dist = Math.hypot(e.x-this.x, e.y-this.y);
      if (dist > this.range+14) continue;
      const diff = Math.abs(angDiff(Math.atan2(e.y-this.y,e.x-this.x), this.dir));
      if (diff < Math.PI*.65) {
        const isCrit = Math.random() < this.critRate || this.stealthMode;
        let dmg = Math.floor((this.atk+bAtk)*this.jm.atkMul + rnd(-3,8));
        if (isCrit) { dmg=Math.floor(dmg*(this.stealthMode?2.5:1.6)); G.fts.push(new FT(e.x,e.y-26,'CRIT!','#ffff44',13)); }
        e.hit(dmg);
        hitPts(e.x,e.y,'#ff4040');
        G.fts.push(new FT(e.x,e.y-18,'-'+dmg, isCrit?'#ffff00':'#ff7060',13));
        this.stealthMode=false; // stealth breaks on hit
        // PK tracking
        if (e.isPlayer && nwActive) addNWKill();
      }
    }
  }

  // ── SP1: Primary Skill ───────────────────────────────
  doSp1(enemies) {
    const job=window.selChar?.job||'warrior';
    const cost=this._mpCost(1); if(this.mp<cost) return;
    this.scd=this.scdMax; this.mp-=cost;
    if (typeof Audio!=='undefined') Audio.playSFX(job==='magician'||job==='priest'?'spell':'attack');
    const lv=(window.selChar?.skill_tree||{})['bash']||(window.selChar?.skill_tree||{})['stab']||(window.selChar?.skill_tree||{})['fireball']||(window.selChar?.skill_tree||{})['heal']||1;
    const dmgMul=1+lv*.12;

    if (job==='warrior') {
      // Bash — heavy stagger hit
      this.atkAnim=.4;
      for (const e of enemies) {
        if (e.dead) continue;
        if (Math.hypot(e.x-this.x,e.y-this.y)<=this.range*1.2) {
          const dmg=Math.floor(this.atk*1.8*dmgMul+rnd(5,15)); e.hit(dmg); e.stunned=1.5;
          G.fts.push(new FT(e.x,e.y-20,'-'+dmg,'#ffcc00',15)); hitPts(e.x,e.y,'#ffaa00');
        }
      }
      for(let i=0;i<16;i++){const a=(i/16)*Math.PI*2;G.pts.push(new Pt(this.x,this.y,Math.cos(a)*80,Math.sin(a)*80,'#ffcc44',4,.5))}
      G.fts.push(new FT(this.x,this.y-60,'⚔ BASH!','#ffcc44',18));

    } else if (job==='rogue') {
      // Stab — fast crit attack
      let nearest=null,minD=9999;
      for(const e of enemies){if(!e.dead){const d=Math.hypot(e.x-this.x,e.y-this.y);if(d<minD&&d<280){minD=d;nearest=e}}}
      if(nearest){const a=Math.atan2(nearest.y-this.y,nearest.x-this.x);this.x+=Math.cos(a)*(minD-30);this.y+=Math.sin(a)*(minD-30);this.dir=a}
      for(const e of enemies){
        if(e.dead)continue; if(Math.hypot(e.x-this.x,e.y-this.y)>this.range*1.3)continue;
        const dmg=Math.floor(this.atk*1.5*dmgMul+rnd(0,10));e.hit(dmg);
        G.fts.push(new FT(e.x,e.y-18,'-'+dmg,'#00ffaa',14));hitPts(e.x,e.y,'#00ffaa');
      }
      for(let i=0;i<14;i++){const a=Math.random()*Math.PI*2;G.pts.push(new Pt(this.x,this.y,Math.cos(a)*75,Math.sin(a)*75,'#00ffaa',3,.4))}
      G.fts.push(new FT(this.x,this.y-60,'🗡 STAB!','#00ffaa',18));

    } else if (job==='magician') {
      // Fireball — ranged projectile burst
      const r=this.range*2.2;
      for(const e of enemies){
        if(e.dead)continue;
        const d=Math.hypot(e.x-this.x,e.y-this.y);
        if(d<=r){const dmg=Math.floor(this.atk*2.2*dmgMul+rnd(8,20));e.hit(dmg);hitPts(e.x,e.y,'#ff6600');G.fts.push(new FT(e.x,e.y-18,'-'+dmg,'#ff8800',15));e.burnTimer=(e.burnTimer||0)+3}
      }
      for(let i=0;i<24;i++){const a=(i/24)*Math.PI*2,sp=80+Math.random()*100;G.pts.push(new Pt(this.x,this.y,Math.cos(a)*sp,Math.sin(a)*sp,'#ff6600',5,.55))}
      G.fts.push(new FT(this.x,this.y-65,'🔥 FIREBALL!','#ff8800',18));

    } else if (job==='priest') {
      // Heal — restore HP
      const healAmt=Math.floor(this.maxHp*(.3+lv*.06));
      this.hp=Math.min(this.maxHp,this.hp+healAmt);
      this.inv=Math.max(this.inv,1.5);
      for(let i=0;i<24;i++){const a=(i/24)*Math.PI*2,sp=70+Math.random()*100;G.pts.push(new Pt(this.x,this.y,Math.cos(a)*sp,Math.sin(a)*sp,'#40e860',5,.65))}
      G.fts.push(new FT(this.x,this.y-60,'+'+healAmt+' HEAL','#40e860',20));
    }
  }

  // ── SP2: Secondary Skill ─────────────────────────────
  doSp2(enemies) {
    const job=window.selChar?.job||'warrior';
    const cost=this._mpCost(2); if(this.mp<cost) return;
    this.sp2cd=this.sp2Max; this.mp-=cost;

    if (job==='warrior') {
      // Shield Bash — stun + def buff
      for(const e of enemies){if(!e.dead&&Math.hypot(e.x-this.x,e.y-this.y)<=this.range*1.1){const dmg=Math.floor(this.atk*1.2+rnd(3,10));e.hit(dmg);e.stunned=2;G.fts.push(new FT(e.x,e.y-20,'-'+dmg,'#88aaff',13))}}
      G.fts.push(new FT(this.x,this.y-55,'🛡 SHIELD BASH!','#88aaff',16));
      for(let i=0;i<12;i++){const a=Math.random()*Math.PI*2;G.pts.push(new Pt(this.x,this.y,Math.cos(a)*60,Math.sin(a)*60,'#88aaff',4,.5))}

    } else if (job==='rogue') {
      // Poison — DOT on nearby enemies
      for(const e of enemies){if(!e.dead&&Math.hypot(e.x-this.x,e.y-this.y)<=this.range*1.5){e.poison={dmg:this.atk*.25,timer:10}}}
      G.fts.push(new FT(this.x,this.y-55,'☠ POISON!','#88ff44',16));
      for(let i=0;i<16;i++){const a=(i/16)*Math.PI*2;G.pts.push(new Pt(this.x,this.y,Math.cos(a)*90,Math.sin(a)*90,'#88ff44',4,.5))}

    } else if (job==='magician') {
      // Blizzard — AOE slow
      const r=this.range*2.5;
      for(const e of enemies){if(!e.dead&&Math.hypot(e.x-this.x,e.y-this.y)<=r){const dmg=Math.floor(this.atk*1.5+rnd(5,15));e.hit(dmg);e.slowed=(e.slowed||0)+4;G.fts.push(new FT(e.x,e.y-18,'-'+dmg,'#88ccff',13))}}
      for(let i=0;i<28;i++){const a=(i/28)*Math.PI*2,rr=r*.8;G.pts.push(new Pt(this.x+Math.cos(a)*rr,this.y+Math.sin(a)*rr,Math.cos(a)*30,Math.sin(a)*30,'#88ccff',4,.6))}
      G.fts.push(new FT(this.x,this.y-60,'❄ BLIZZARD!','#88ccff',17));

    } else if (job==='priest') {
      // Bless — ATK+DEF buff
      this.blessBuff=15;
      for(let i=0;i<20;i++){const a=(i/20)*Math.PI*2;G.pts.push(new Pt(this.x,this.y,Math.cos(a)*90,Math.sin(a)*90,'#ffffaa',4,.6))}
      G.fts.push(new FT(this.x,this.y-55,'⭐ BLESS!','#ffffaa',17));
    }
  }

  // ── SP3: Third Skill ─────────────────────────────────
  doSp3(enemies) {
    const job=window.selChar?.job||'warrior';
    const cost=this._mpCost(3); if(this.mp<cost) return;
    this.sp3cd=this.sp3Max; this.mp-=cost;

    if (job==='warrior') {
      // Whirlwind — 360 AOE
      this.x+=Math.cos(this.dir)*40; this.y+=Math.sin(this.dir)*40;
      for(const e of enemies){if(!e.dead&&Math.hypot(e.x-this.x,e.y-this.y)<=this.range*2){
        const dmg=Math.floor(this.atk*2.5+rnd(10,25));e.hit(dmg);
        const a=Math.atan2(e.y-this.y,e.x-this.x);e.x+=Math.cos(a)*45;e.y+=Math.sin(a)*45;
        G.fts.push(new FT(e.x,e.y-18,'-'+dmg,'#ffcc44',15));hitPts(e.x,e.y,'#ffcc00');
      }}
      for(let i=0;i<32;i++){const a=(i/32)*Math.PI*2,sp=110+Math.random()*120;G.pts.push(new Pt(this.x,this.y,Math.cos(a)*sp,Math.sin(a)*sp,'#ffcc44',5,.6))}
      G.fts.push(new FT(this.x,this.y-65,'🌪 WHIRLWIND!','#ffcc44',20));

    } else if (job==='rogue') {
      // Stealth — invisible + crit boost
      this.stealthMode=true; this.stealthTimer=4;
      for(let i=0;i<18;i++){const a=Math.random()*Math.PI*2;G.pts.push(new Pt(this.x,this.y,Math.cos(a)*55,Math.sin(a)*55,'#334455',3,.45))}
      G.fts.push(new FT(this.x,this.y-55,'🌑 STEALTH!','#667788',17));

    } else if (job==='magician') {
      // Meteor — huge AOE
      const r=this.range*3;
      for(const e of enemies){if(!e.dead&&Math.hypot(e.x-this.x,e.y-this.y)<=r){
        const dmg=Math.floor(this.atk*3.8+rnd(15,35));e.hit(dmg);
        const a=Math.atan2(e.y-this.y,e.x-this.x);e.x+=Math.cos(a)*55;e.y+=Math.sin(a)*55;
        G.fts.push(new FT(e.x,e.y-18,'-'+dmg,'#cc44ff',16));hitPts(e.x,e.y,'#aa22ee');
      }}
      for(let i=0;i<40;i++){const a=Math.random()*Math.PI*2,sp=120+Math.random()*180;G.pts.push(new Pt(this.x,this.y,Math.cos(a)*sp,Math.sin(a)*sp,'#8840ff',5,.65))}
      G.fts.push(new FT(this.x,this.y-70,'☄ METEOR!','#cc44ff',22));

    } else if (job==='priest') {
      // Holy Light — AOE holy damage
      const r=this.range*2.2;
      for(const e of enemies){if(!e.dead&&Math.hypot(e.x-this.x,e.y-this.y)<=r){
        const dmg=Math.floor(this.atk*2+rnd(8,20));e.hit(dmg);e.stunned=2.5;
        G.fts.push(new FT(e.x,e.y-18,'-'+dmg,'#ffffcc',14));hitPts(e.x,e.y,'#ffffcc');
      }}
      for(let i=0;i<32;i++){const a=(i/32)*Math.PI*2,rr=r*.75;G.pts.push(new Pt(this.x+Math.cos(a)*rr,this.y+Math.sin(a)*rr,Math.cos(a)*35,Math.sin(a)*35,'#ffffcc',4,.55))}
      G.fts.push(new FT(this.x,this.y-65,'🌟 HOLY LIGHT!','#ffffcc',20));
    }
  }

  // ── SP4: Ultimate Skill ──────────────────────────────
  doSp4(enemies) {
    const job=window.selChar?.job||'warrior';
    const cost=this._mpCost(4); if(this.mp<cost) return;
    this.sp4cd=this.sp4Max; this.mp-=cost;

    if (job==='warrior') {
      // Berserk — ATK +50%, DEF -25% for 10s
      this.atk*=1.5; this.def*=.75; this.berserkBuff=10;
      for(let i=0;i<24;i++){const a=Math.random()*Math.PI*2;G.pts.push(new Pt(this.x,this.y,Math.cos(a)*100,Math.sin(a)*100,'#ff4400',5,.55))}
      G.fts.push(new FT(this.x,this.y-65,'🔥 BERSERK!','#ff4400',22));

    } else if (job==='rogue') {
      // Triple Stab — 3 rapid hits
      const targets=enemies.filter(e=>!e.dead&&Math.hypot(e.x-this.x,e.y-this.y)<this.range*1.5);
      for(let h=0;h<3;h++){
        setTimeout(()=>{
          for(const e of targets){if(!e.dead){const dmg=Math.floor(this.atk*1.4+rnd(0,10));e.hit(dmg);G.fts.push(new FT(e.x,e.y-(18+h*10),'-'+dmg,'#00ffaa',13));hitPts(e.x,e.y,'#00ffaa')}}
        }, h*100);
      }
      G.fts.push(new FT(this.x,this.y-65,'⚡ TRIPLE STAB!','#00ffaa',20));

    } else if (job==='magician') {
      // Lightning chain — jumps between 5 enemies
      const sorted=enemies.filter(e=>!e.dead).sort((a,b)=>Math.hypot(a.x-this.x,a.y-this.y)-Math.hypot(b.x-this.x,b.y-this.y)).slice(0,5);
      sorted.forEach((e,i)=>{
        setTimeout(()=>{if(!e.dead){const dmg=Math.floor(this.atk*(2.5-i*.3)+rnd(5,15));e.hit(dmg);hitPts(e.x,e.y,'#44ffff');G.fts.push(new FT(e.x,e.y-18,'-'+dmg,'#44ffff',14))}},i*80);
      });
      G.fts.push(new FT(this.x,this.y-65,'⚡ LIGHTNING!','#44ffff',20));

    } else if (job==='priest') {
      // Cure — remove poison & stun from self + heal
      this.poisonImmune=10; this.inv=Math.max(this.inv,2);
      const heal=Math.floor(this.maxHp*.2);
      this.hp=Math.min(this.maxHp,this.hp+heal);
      G.fts.push(new FT(this.x,this.y-60,'+'+heal+' CURE!','#88ffaa',18));
      for(let i=0;i<20;i++){const a=(i/20)*Math.PI*2;G.pts.push(new Pt(this.x,this.y,Math.cos(a)*80,Math.sin(a)*80,'#88ffaa',4,.55))}
    }
  }

  hurt2(dmg) {
    if (this.inv>0) return;
    // Evasion check
    if (Math.random()<(this.evasion||0)) { G.fts.push(new FT(this.x,this.y-20,'DODGE!','#aaffcc',12)); return; }
    // Barrier absorb
    if (this.barrierHp>0) {
      const abs=Math.min(this.barrierHp,dmg); this.barrierHp-=abs; dmg-=abs;
      if (dmg<=0) { hitPts(this.x,this.y,'#4488ff'); return; }
    }
    const actual=Math.max(1,dmg-this.def);
    this.hp=Math.max(0,this.hp-actual);
    this.hurt=.28; this.inv=.6;
    hitPts(this.x,this.y,'#ff2222');
  }

  draw() {
    const race=window.RACES[window.selChar?.race]||window.RACES.human;
    const isEl=window.selChar?.faction==='elmorad'||window.selChar?.faction==='cahaya';
    cx.save(); cx.translate(this.x,this.y);
    if (this.stealthMode) cx.globalAlpha=.3;
    else if (this.hurt>0) cx.globalAlpha=.5+Math.sin(Date.now()*.06)*.3;
    // Aura
    if (this.blessBuff>0) { cx.shadowColor='#ffffaa'; cx.shadowBlur=24; }
    else if (this.berserkBuff>0) { cx.shadowColor='#ff4400'; cx.shadowBlur=20; }
    else { cx.shadowColor=isEl?'rgba(201,168,76,.35)':'rgba(200,40,40,.28)'; cx.shadowBlur=16; }
    // Barrier ring
    if (this.barrierHp>0) { cx.strokeStyle='rgba(68,136,255,.6)'; cx.lineWidth=3; cx.beginPath(); cx.arc(0,0,30,0,Math.PI*2); cx.stroke(); }
    // Shadow
    cx.fillStyle='rgba(0,0,0,.32)'; cx.beginPath(); cx.ellipse(0,18,13,5,0,0,Math.PI*2); cx.fill();
    const flip=Math.cos(this.dir)<0;
    cx.scale(flip?-1:1,1);
    if (this.atkAnim>0) cx.rotate(-.28*(this.atkAnim/.28));
    const ac=isEl?'#c8a040':'#8a2020', ac2=isEl?'#a08030':'#6a1010';
    // Body
    cx.fillStyle=ac; cx.roundRect(-9,-12,18,22,3); cx.fill();
    cx.fillStyle=ac2; cx.fillRect(-14,-13,8,7); cx.fillRect(6,-13,8,7);
    // Helmet
    cx.fillStyle=ac2; cx.beginPath(); cx.arc(0,-17,10,0,Math.PI); cx.fill(); cx.fillRect(-10,-17,20,4);
    cx.fillStyle=isEl?'rgba(100,200,255,.85)':'rgba(255,60,60,.75)'; cx.fillRect(-6,-21,12,5);
    // Legs
    cx.fillStyle=isEl?'#806020':'#601010';
    const lo=Math.sin(this.aFrame*Math.PI/2)*4;
    cx.fillRect(-8,10,7,13+lo); cx.fillRect(1,10,7,13-lo);
    // Weapon
    const job=window.selChar?.job||'warrior';
    if (job==='magician') {
      cx.strokeStyle='#cc88ff'; cx.lineWidth=2.5; cx.beginPath(); cx.moveTo(12,3); cx.lineTo(12,-28); cx.stroke();
      cx.fillStyle='#aa44ff'; cx.beginPath(); cx.arc(12,-30,5,0,Math.PI*2); cx.fill();
    } else if (job==='rogue') {
      cx.strokeStyle='#aaffcc'; cx.lineWidth=2; cx.beginPath(); cx.moveTo(10,2); cx.lineTo(22,-14); cx.stroke();
    } else {
      const sa=this.atkAnim>0?-Math.PI/2.2:Math.PI/8;
      cx.strokeStyle='#dde8ff'; cx.lineWidth=3; cx.lineCap='round';
      cx.save(); cx.translate(11,-4); cx.rotate(sa); cx.beginPath(); cx.moveTo(0,0); cx.lineTo(0,-30); cx.stroke();
      cx.strokeStyle='#c9a84c'; cx.lineWidth=5; cx.beginPath(); cx.moveTo(-6,-1); cx.lineTo(6,-1); cx.stroke(); cx.restore();
    }
    if (job!=='magician') {
      cx.fillStyle=isEl?'#2840b0':'#8a1010'; cx.strokeStyle='#c9a84c'; cx.lineWidth=1.5;
      cx.beginPath(); cx.moveTo(-15,-9); cx.lineTo(-9,-9); cx.lineTo(-9,4); cx.lineTo(-12,9); cx.lineTo(-15,4); cx.closePath(); cx.fill(); cx.stroke();
    }
    if (this.atkAnim>0) {
      cx.restore(); cx.save(); cx.translate(this.x,this.y);
      cx.globalAlpha=(this.atkAnim/.28)*.2;
      cx.fillStyle=isEl?'#ffdd44':'#ff4444';
      cx.beginPath(); cx.moveTo(0,0); cx.arc(0,0,this.range,this.dir-Math.PI*.6,this.dir+Math.PI*.6); cx.closePath(); cx.fill();
    }
    cx.restore();
    // Name tag
    cx.fillStyle=isEl?'#c9a84c':'#e06060';
    cx.font='10px "Share Tech Mono",monospace'; cx.textAlign='center';
    cx.fillText(window.selChar?.char_name||'Hero', this.x, this.y-36);
    if (this.blessBuff>0) { cx.font='9px monospace'; cx.fillStyle='#ffffaa'; cx.fillText('✦BLESS', this.x, this.y-48); }
  }
}

// ── ENEMY ────────────────────────────────────────────
class Enemy {
  constructor(x,y,type) {
    this.x=x; this.y=y; this.type=type;
    this.dead=false; this.rewarded=false;
    this.hurt=0; this.aTimer=0; this.aFrame=0;
    this.acd=0; this.dir=0; this.shootCd=0; this.specTimer=6;
    this.stunned=0; this.slowed=0; this.poison=null; this.poisonTimer=0; this.burnTimer=0;
    const wv=G.wave||1;
    const T={
      goblin:      {hp:35+wv*3,   spd:90,  atk:8,  sz:22,rng:38,rew:{xp:12, gold:rnd(2,5),  sc:50}},
      orc:         {hp:90+wv*8,   spd:58,  atk:18, sz:30,rng:46,rew:{xp:28, gold:rnd(5,12), sc:120}},
      archer:      {hp:55+wv*5,   spd:70,  atk:13, sz:24,rng:38,rew:{xp:20, gold:rnd(4,9),  sc:85}},
      dark_mage:   {hp:70+wv*6,   spd:62,  atk:22, sz:26,rng:38,rew:{xp:32, gold:rnd(7,15), sc:150}},
      cz_guardian: {hp:400+wv*15, spd:55,  atk:25, sz:36,rng:55,rew:{xp:150,gold:rnd(25,50),sc:500}},
      boss:        {hp:600+wv*35, spd:42,  atk:30, sz:48,rng:72,rew:{xp:220,gold:rnd(40,80),sc:1100}},
      goblin_king: {hp:900+wv*25, spd:52,  atk:24, sz:42,rng:58,rew:{xp:450,gold:rnd(70,120),sc:2200}},
      orc_warlord: {hp:2000+wv*50,spd:38,  atk:40, sz:58,rng:82,rew:{xp:900,gold:rnd(130,200),sc:4500}},
      demon_king:  {hp:6000+wv*120,spd:33, atk:55, sz:72,rng:95,rew:{xp:3500,gold:rnd(400,700),sc:18000}},
    };
    const s=T[type]||T.goblin;
    this.maxHp=this.hp=s.hp; this.speed=s.spd; this.atk=s.atk;
    this.sz=s.sz; this.rng=s.rng; this.rew=s.rew;
    if (type==='archer'||type==='dark_mage') this.prefDist=180;
  }

  tick(dt, player, projs) {
    if (this.dead) return;
    if (this.hurt>0) this.hurt-=dt;
    if (this.acd>0) this.acd-=dt;
    if (this.stunned>0) { this.stunned-=dt; return; }
    if (this.slowed>0) this.slowed-=dt;
    this.aTimer+=dt; if(this.aTimer>.18){this.aTimer=0;this.aFrame=(this.aFrame+1)%4}

    // Burn DOT
    if (this.burnTimer>0) { this.burnTimer-=dt; if(dt>.1) { this.hp-=this.atk*.08; if(this.hp<=0){this.hp=0;this.dead=true;return} } }
    // Poison DOT
    if (this.poison) {
      this.poisonTimer+=dt;
      if (this.poisonTimer>=1) { this.poisonTimer=0; this.hp-=this.poison.dmg; this.poison.timer--; hitPts(this.x,this.y,'#88ff44'); if(this.poison.timer<=0)this.poison=null; if(this.hp<=0){this.hp=0;this.dead=true;return} }
    }

    const spd=this.slowed>0?this.speed*.45:this.speed;
    const dx=player.x-this.x, dy=player.y-this.y, dist=Math.hypot(dx,dy);
    this.dir=Math.atan2(dy,dx);

    if (this.type==='archer'||this.type==='dark_mage') {
      const pd=this.prefDist||180;
      if (dist>pd+30) { this.x+=dx/dist*spd*dt; this.y+=dy/dist*spd*dt; }
      else if (dist<pd-30) { this.x-=dx/dist*spd*dt*.5; this.y-=dy/dist*spd*dt*.5; }
      this.shootCd-=dt;
      if (this.shootCd<=0&&dist<300) {
        this.shootCd=this.type==='dark_mage'?1.6:2.2;
        projs.push(new Proj(this.x,this.y,player.x,player.y,this.type==='dark_mage'?'dark':'arrow',this.atk));
      }
    } else {
      if (dist>this.rng) { this.x+=dx/dist*spd*dt; this.y+=dy/dist*spd*dt; }
      else if (this.acd<=0) {
        const atkSpd=['boss','goblin_king','orc_warlord','demon_king'].includes(this.type)?1.0:1.6;
        this.acd=atkSpd;
        player.hurt2(this.atk+rnd(-4,6));
        if (nwActive) addNWKill();
      }
    }
    // Boss specials
    if (['boss','goblin_king','orc_warlord','demon_king'].includes(this.type)) {
      this.specTimer-=dt;
      if (this.specTimer<=0) {
        this.specTimer=this.type==='demon_king'?3.5:5;
        const cnt=this.type==='demon_king'?14:8;
        for(let i=0;i<cnt;i++){const a=(i/cnt)*Math.PI*2;projs.push(new Proj(this.x,this.y,this.x+Math.cos(a)*260,this.y+Math.sin(a)*260,this.type==='demon_king'?'void':'fire',this.atk*.7))}
      }
    }
    this.x=Math.max(8,Math.min(WW-8,this.x));
    this.y=Math.max(8,Math.min(WH-8,this.y));
  }

  hit(dmg) { this.hp-=dmg; this.hurt=.18; if(this.hp<=0){this.hp=0;this.dead=true} }

  draw() {
    cx.save(); cx.translate(this.x,this.y);
    if (this.stunned>0) { cx.globalAlpha=.65; cx.shadowColor='#ffffcc'; cx.shadowBlur=10; }
    else if (this.hurt>0) cx.globalAlpha=.5;
    if (this.poison) { cx.shadowColor='#88ff44'; cx.shadowBlur=7; }
    if (this.burnTimer>0) { cx.shadowColor='#ff6600'; cx.shadowBlur=10; }
    // Shadow
    cx.fillStyle='rgba(0,0,0,.28)'; cx.beginPath(); cx.ellipse(0,this.sz/2-3,this.sz*.54,this.sz*.22,0,0,Math.PI*2); cx.fill();
    switch(this.type) {
      case 'goblin':     drawGoblin(cx,this); break;
      case 'orc':        drawOrc(cx,this); break;
      case 'archer':     drawArcher(cx,this); break;
      case 'dark_mage':  drawDarkMage(cx,this); break;
      default:           drawBoss(cx,this); break;
    }
    // HP bar
    if (this.hp<this.maxHp) {
      const bw=this.sz*1.7, bx=-bw/2, by=-this.sz-12;
      cx.globalAlpha=1;
      cx.fillStyle='rgba(0,0,0,.65)'; cx.fillRect(bx,by,bw,5);
      const pct=this.hp/this.maxHp;
      cx.fillStyle=pct>.5?'#40c840':pct>.25?'#c8c840':'#c84040';
      cx.fillRect(bx,by,bw*pct,5);
    }
    cx.restore();
  }
}

// ── ENEMY DRAW FUNCTIONS ─────────────────────────────
function drawGoblin(c,e){const f=Math.cos(e.dir)<0;c.scale(f?-1:1,1);c.fillStyle='#2a8a2a';c.beginPath();c.ellipse(0,-2,9,11,0,0,Math.PI*2);c.fill();c.fillStyle='#3aaa3a';c.beginPath();c.arc(0,-15,8,0,Math.PI*2);c.fill();c.fillStyle='#ff4400';c.beginPath();c.arc(-3,-16,2,0,Math.PI*2);c.fill();c.beginPath();c.arc(3,-16,2,0,Math.PI*2);c.fill();c.fillStyle='#2a8a2a';c.beginPath();c.ellipse(-10,-15,3.5,5.5,-.3,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(10,-15,3.5,5.5,.3,0,Math.PI*2);c.fill();c.strokeStyle='#888';c.lineWidth=2;c.beginPath();c.moveTo(10,-4);c.lineTo(20,-14);c.stroke()}
function drawOrc(c,e){const f=Math.cos(e.dir)<0;c.scale(f?-1:1,1);c.fillStyle='#6a3a2a';c.roundRect(-13,-13,26,25,4);c.fill();c.fillStyle='#7a4a3a';c.beginPath();c.arc(0,-21,12,0,Math.PI*2);c.fill();c.fillStyle='#ff8800';c.beginPath();c.arc(-4,-22,3,0,Math.PI*2);c.fill();c.beginPath();c.arc(4,-22,3,0,Math.PI*2);c.fill();c.fillStyle='#eeeebb';c.beginPath();c.moveTo(-5,-15);c.lineTo(-3,-9);c.lineTo(-1,-15);c.fill();c.beginPath();c.moveTo(1,-15);c.lineTo(3,-9);c.lineTo(5,-15);c.fill();c.strokeStyle='#999';c.lineWidth=2;c.beginPath();c.moveTo(15,-13);c.lineTo(15,9);c.stroke();c.fillStyle='#888';c.beginPath();c.moveTo(15,-13);c.lineTo(26,-7);c.lineTo(22,2);c.lineTo(15,-3);c.closePath();c.fill()}
function drawArcher(c,e){const f=Math.cos(e.dir)<0;c.scale(f?-1:1,1);c.fillStyle='#7a6a2a';c.beginPath();c.ellipse(0,-2,8,11,0,0,Math.PI*2);c.fill();c.fillStyle='#5a4a1a';c.beginPath();c.arc(0,-15,9,0,Math.PI*2);c.fill();c.fillStyle='#cc9966';c.beginPath();c.arc(0,-16,5,0,Math.PI*2);c.fill();c.strokeStyle='#8b5e1a';c.lineWidth=2;c.beginPath();c.arc(13,-7,13,-1.1,1.1);c.stroke();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=1;c.beginPath();c.moveTo(13,-20);c.lineTo(13,6);c.stroke()}
function drawDarkMage(c,e){const f=Math.cos(e.dir)<0;c.scale(f?-1:1,1);c.fillStyle='#2a0a3a';c.beginPath();c.ellipse(0,-2,9,12,0,0,Math.PI*2);c.fill();c.fillStyle='#3a0a4a';c.beginPath();c.arc(0,-16,10,0,Math.PI*2);c.fill();c.shadowColor='#aa44ff';c.shadowBlur=10;c.fillStyle='#cc44ff';c.beginPath();c.arc(-3,-18,2.5,0,Math.PI*2);c.fill();c.beginPath();c.arc(3,-18,2.5,0,Math.PI*2);c.fill();c.shadowBlur=0;c.strokeStyle='#8822cc';c.lineWidth=2;c.beginPath();c.moveTo(12,2);c.lineTo(12,-25);c.stroke();c.fillStyle='#aa22ff';c.beginPath();c.arc(12,-27,5,0,Math.PI*2);c.fill();c.fillStyle='rgba(150,50,255,.3)';c.beginPath();c.arc(12,-27,9,0,Math.PI*2);c.fill()}
function drawBoss(c,e){
  const s=e.sz/46; c.scale(s,s);
  c.fillStyle='#6a0808'; c.roundRect(-20,-18,40,36,5); c.fill();
  c.fillStyle='#3a0808'; for(let i=0;i<3;i++) c.fillRect(-20,-18+i*12,40,5);
  c.fillStyle='#8a0a0a'; c.beginPath(); c.arc(0,-28,17,0,Math.PI*2); c.fill();
  c.fillStyle='#1a0505';
  c.beginPath();c.moveTo(-13,-38);c.lineTo(-8,-55);c.lineTo(-3,-38);c.fill();
  c.beginPath();c.moveTo(3,-38);c.lineTo(8,-55);c.lineTo(13,-38);c.fill();
  c.fillStyle='#ff0000'; c.shadowColor='#ff0000'; c.shadowBlur=12;
  c.beginPath();c.arc(-6,-29,4,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(6,-29,4,0,Math.PI*2);c.fill();
  c.shadowBlur=0; c.strokeStyle='#cc0000'; c.lineWidth=5;
  c.beginPath();c.moveTo(22,-28);c.lineTo(22,18);c.stroke();
  c.fillStyle='#880000'; c.beginPath();c.moveTo(22,-28);c.lineTo(36,-18);c.lineTo(30,2);c.lineTo(22,-8);c.closePath();c.fill();
  const lbl=e.type==='demon_king'?'👑DEMON KING':e.type==='orc_warlord'?'⚔WARLORD':e.type==='goblin_king'?'👑GOBLIN KING':'⚡BOSS';
  c.fillStyle='#ff4444'; c.font='bold 9px "Share Tech Mono",monospace'; c.textAlign='center'; c.fillText(lbl,0,-62);
}

// ── PROJECTILE ───────────────────────────────────────
class Proj {
  constructor(x,y,tx,ty,type,dmg) {
    this.x=x; this.y=y; this.type=type; this.dmg=dmg; this.dead=false; this.life=2.2;
    const dx=tx-x, dy=ty-y, dist=Math.hypot(dx,dy)||1;
    const sp = type==='arrow'?310 : type==='void'?190 : 250;
    this.vx=dx/dist*sp; this.vy=dy/dist*sp; this.dir=Math.atan2(dy,dx);
  }
  tick(dt, player) {
    this.x+=this.vx*dt; this.y+=this.vy*dt; this.life-=dt;
    if (this.life<=0) { this.dead=true; return; }
    if (Math.hypot(player.x-this.x, player.y-this.y)<20) {
      player.hurt2(this.dmg); this.dead=true;
      hitPts(this.x,this.y, this.type==='void'?'#aa44ff':this.type==='fire'?'#ff6600':'#cc8822');
    }
  }
  draw() {
    cx.save(); cx.translate(this.x,this.y); cx.rotate(this.dir);
    if (this.type==='arrow') {
      cx.strokeStyle='#cc8822'; cx.lineWidth=2; cx.beginPath(); cx.moveTo(-10,0); cx.lineTo(10,0); cx.stroke();
      cx.fillStyle='#888'; cx.beginPath(); cx.moveTo(10,0); cx.lineTo(6,-3); cx.lineTo(6,3); cx.closePath(); cx.fill();
    } else if (this.type==='void') {
      cx.shadowColor='#aa44ff'; cx.shadowBlur=14;
      cx.fillStyle='#aa44ff'; cx.beginPath(); cx.arc(0,0,7,0,Math.PI*2); cx.fill();
      cx.fillStyle='#dd88ff'; cx.beginPath(); cx.arc(0,0,3,0,Math.PI*2); cx.fill();
    } else {
      cx.shadowColor='#ff6600'; cx.shadowBlur=12;
      cx.fillStyle='#ff4400'; cx.beginPath(); cx.arc(0,0,6,0,Math.PI*2); cx.fill();
      cx.fillStyle='#ffaa00'; cx.beginPath(); cx.arc(0,0,3,0,Math.PI*2); cx.fill();
    }
    cx.restore();
  }
}

// ── GHOST (other players) ────────────────────────────
function drawGhost(op) {
  cx.save(); cx.globalAlpha=.42; cx.translate(op.x,op.y);
  const isEl=op.faction==='elmorad'||op.faction==='cahaya';
  const col=isEl?'#4460e0':'#e04444';
  cx.fillStyle=col; cx.roundRect(-8,-12,16,20,3); cx.fill();
  cx.beginPath(); cx.arc(0,-16,8,0,Math.PI*2); cx.fill();
  cx.fillStyle='rgba(220,230,255,.85)';
  cx.font='9px "Share Tech Mono",monospace'; cx.textAlign='center';
  cx.fillText(op.name||'?', 0, -28); cx.restore();
}

// ── NPC DRAW ─────────────────────────────────────────
function drawNPCs() {
  if (!G.zoneNPCs) return;
  const time=Date.now()/1000;
  for (const npc of G.zoneNPCs) {
    cx.save(); cx.translate(npc.x, npc.y);
    // Glow
    cx.shadowColor='rgba(201,168,76,.3)'; cx.shadowBlur=15;
    // Body
    cx.fillStyle='#1a1a2a'; cx.roundRect(-10,-14,20,24,3); cx.fill();
    cx.fillStyle='rgba(201,168,76,.15)'; cx.fillRect(-10,-14,20,24);
    // Icon
    cx.font='16px serif'; cx.textAlign='center'; cx.shadowBlur=0;
    cx.fillText(npc.icon, 0, -2);
    // Name
    cx.fillStyle='rgba(201,168,76,.8)';
    cx.font='9px "Share Tech Mono",monospace';
    cx.fillText(npc.name, 0, -20);
    // Interact hint pulse
    const dist=G.pl?Math.hypot(G.pl.x-npc.x,G.pl.y-npc.y):9999;
    if (dist<70) {
      cx.strokeStyle=`rgba(201,168,76,${.4+Math.sin(time*4)*.2})`;
      cx.lineWidth=2; cx.beginPath(); cx.arc(0,-7,18,0,Math.PI*2); cx.stroke();
      cx.fillStyle='rgba(201,168,76,.7)';
      cx.font='8px "Share Tech Mono",monospace';
      cx.fillText('[TAP]', 0, -32);
    }
    cx.restore();
  }
}

// item drop handled by farming.js
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
  G.tick(dt); G.draw();
  requestAnimationFrame(gameLoop);
}

// ── Window exports ───────────────────────────────────
window.initRT        = initRT;
window.showZoneBanner= showZoneBanner;
window.bcastPos      = bcastPos;
window.FT            = FT;
window.Enemy         = Enemy;
window.hitPts        = typeof hitPts !== 'undefined' ? hitPts : null;
