'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — Projectile & Ghost Entities
   class Proj, Ghost (multiplayer other players)
   ══════════════════════════════════════════════════════ */

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
    const cx = window.cx; if (!cx) return;
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
