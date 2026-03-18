'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — Particles & Helpers
   class Pt (particle), class FT (floating text),
   helper functions: angDiff, rnd, hitPts
   ══════════════════════════════════════════════════════ */

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
    const cx = window.cx; if (!cx) return;
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
    const cx = window.cx; if (!cx) return;
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
