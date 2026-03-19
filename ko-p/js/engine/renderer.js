'use strict';
/* ══ Engine: Canvas Renderer & Game Loop ══ */

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
