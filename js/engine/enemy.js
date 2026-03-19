'use strict';
/* ══ Engine: Enemy System ══ */

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
