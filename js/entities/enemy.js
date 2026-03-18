'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — Enemy Entity
   class Enemy: AI, combat, draw functions semua jenis
   ══════════════════════════════════════════════════════ */

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
      // KO Classic monsters — handled by KO_MONSTERS patch but fallback here
      worm:        {hp:18+wv*2,   spd:45, atk:4,  sz:16,rng:30,rew:{xp:5,  gold:rnd(1,2),  sc:22}},
      puss:        {hp:28+wv*2,   spd:78, atk:6,  sz:18,rng:34,rew:{xp:7,  gold:rnd(1,2),  sc:30}},
      bandicoot:   {hp:42+wv*3,   spd:72, atk:8,  sz:20,rng:36,rew:{xp:10, gold:rnd(2,4),  sc:45}},
      smilodon:    {hp:65+wv*5,   spd:92, atk:12, sz:22,rng:40,rew:{xp:16, gold:rnd(3,6),  sc:70}},
      dire_wolf:   {hp:75+wv*6,   spd:100,atk:14, sz:24,rng:42,rew:{xp:20, gold:rnd(4,8),  sc:88}},
      skeleton:    {hp:55+wv*4,   spd:60, atk:10, sz:22,rng:38,rew:{xp:13, gold:rnd(3,5),  sc:60}},
      zombie:      {hp:95+wv*7,   spd:42, atk:16, sz:26,rng:42,rew:{xp:22, gold:rnd(4,8),  sc:95}},
      werewolf:    {hp:120+wv*9,  spd:88, atk:22, sz:28,rng:46,rew:{xp:32, gold:rnd(7,12), sc:145}},
      lycaon:      {hp:145+wv*10, spd:95, atk:24, sz:28,rng:46,rew:{xp:38, gold:rnd(8,14), sc:170}},
      harpy:       {hp:100+wv*8,  spd:112,atk:20, sz:26,rng:42,rew:{xp:30, gold:rnd(6,10), sc:135}},
      deruvish:    {hp:135+wv*9,  spd:85, atk:26, sz:28,rng:48,rew:{xp:35, gold:rnd(7,12), sc:160}},
      ash_knight:  {hp:200+wv*12, spd:70, atk:30, sz:32,rng:52,rew:{xp:55, gold:rnd(13,20),sc:240}},
      doom_soldier:{hp:220+wv*13, spd:62, atk:32, sz:32,rng:52,rew:{xp:60, gold:rnd(15,22),sc:260}},
      apostles:    {hp:240+wv*14, spd:78, atk:34, sz:30,rng:52,rew:{xp:65, gold:rnd(16,24),sc:285}},
      death_knight:{hp:300+wv*16, spd:65, atk:38, sz:36,rng:56,rew:{xp:88, gold:rnd(22,32),sc:380}},
      atross:      {hp:340+wv*18, spd:70, atk:40, sz:34,rng:56,rew:{xp:95, gold:rnd(26,36),sc:420}},
      riote:       {hp:375+wv*20, spd:80, atk:42, sz:36,rng:58,rew:{xp:105,gold:rnd(30,42),sc:470}},
      lobo:        {hp:800+wv*28, spd:65, atk:35, sz:50,rng:68,rew:{xp:350, gold:rnd(80,130), sc:1800}},
      shaula:      {hp:850+wv*30, spd:60, atk:38, sz:52,rng:70,rew:{xp:380, gold:rnd(90,140), sc:1900}},
      isiloon:     {hp:1200+wv*40,spd:55, atk:45, sz:58,rng:75,rew:{xp:600, gold:rnd(160,220),sc:3000}},
      bone_dragon: {hp:1500+wv*50,spd:50, atk:50, sz:65,rng:85,rew:{xp:800, gold:rnd(230,300),sc:4000}},
      felankor:    {hp:2500+wv*80,spd:45, atk:58, sz:75,rng:95,rew:{xp:1200,gold:rnd(380,480),sc:6000}},
    };
    // KO monster icons/colours (used by fallback renderer)
    const KO_META = {
      worm:{'icon':'🐛','col':'#7a8a30','name':'Cacing Tanah'},
      puss:{'icon':'🐈','col':'#c8a070','name':'Puss'},
      bandicoot:{'icon':'🦡','col':'#8a7050','name':'Bandicoot'},
      smilodon:{'icon':'🐆','col':'#d09050','name':'Smilodon'},
      dire_wolf:{'icon':'🐺','col':'#606878','name':'Dire Wolf'},
      skeleton:{'icon':'💀','col':'#c8c0a0','name':'Skeleton'},
      zombie:{'icon':'🧟','col':'#5a7a50','name':'Zombie'},
      werewolf:{'icon':'🐉','col':'#706058','name':'Werewolf'},
      lycaon:{'icon':'🦊','col':'#404858','name':'Lycaon'},
      harpy:{'icon':'🦅','col':'#807080','name':'Harpy'},
      deruvish:{'icon':'🌀','col':'#904028','name':'Deruvish'},
      ash_knight:{'icon':'🗡️','col':'#585870','name':'Ash Knight'},
      doom_soldier:{'icon':'⚔️','col':'#7a3a3a','name':'Doom Soldier'},
      apostles:{'icon':'👼','col':'#6050a0','name':'Apostles'},
      death_knight:{'icon':'⚰️','col':'#303042','name':'Death Knight'},
      atross:{'icon':'🔮','col':'#503080','name':'Atross'},
      riote:{'icon':'🔥','col':'#703030','name':'Riote'},
      lobo:{'icon':'👑','col':'#505870','name':'Lobo'},
      shaula:{'icon':'👑','col':'#604020','name':'Shaula'},
      isiloon:{'icon':'👑','col':'#402870','name':'Isiloon'},
      bone_dragon:{'icon':'🐲','col':'#706050','name':'Bone Dragon'},
      felankor:{'icon':'🐉','col':'#7a1010','name':'Felankor'},
    };
    const s=T[type]||T.goblin;
    if (KO_META[type]) { this.icon=KO_META[type].icon; this.col=KO_META[type].col; this.name=KO_META[type].name; }
    this.maxHp=this.hp=s.hp; this.speed=s.spd; this.atk=s.atk;
    this.sz=s.sz; this.rng=s.rng; this.rew=s.rew;
    if (['archer','dark_mage','harpy','apostles','atross'].includes(type)) this.prefDist=type==='apostles'?200:type==='atross'?210:180;
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

    if (this.type==='archer'||this.type==='dark_mage'||this.type==='harpy'||this.type==='apostles'||this.type==='atross') {
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
        this.atkAnim = 0.28; player.hurt2(this.atk+rnd(-4,6));
        if (nwActive) addNWKill();
      }
    }
    // Boss specials
    if (['boss','goblin_king','orc_warlord','demon_king','lobo','shaula','isiloon','bone_dragon','felankor'].includes(this.type)) {
      this.specTimer-=dt;
      if (this.specTimer<=0) {
        this.specTimer=['isiloon','bone_dragon','felankor'].includes(this.type)?3.5:5;
        const cnt=this.type==='felankor'?18:this.type==='bone_dragon'?14:this.type==='isiloon'?12:8;
        const ptype=['felankor','bone_dragon','isiloon','demon_king'].includes(this.type)?'void':'fire';
        for(let i=0;i<cnt;i++){const a=(i/cnt)*Math.PI*2;projs.push(new Proj(this.x,this.y,this.x+Math.cos(a)*270,this.y+Math.sin(a)*270,ptype,this.atk*.7))}
      }
    }
    this.x=Math.max(8,Math.min(WW-8,this.x));
    this.y=Math.max(8,Math.min(WH-8,this.y));
  }

  hit(dmg) { this.hp-=dmg; this.hurt=.18; if(this.hp<=0){this.hp=0;this.dead=true} }

  draw() {
    const cx = window.cx; if (!cx) return;
    const t = window.SpriteSystem?.getTime() || (Date.now() / 1000);

    // ── ChibiRenderer monster draw ────────────────────────
    if (window.ChibiRenderer) {
      // Apply status tint via globalAlpha before draw
      if (this.hurt > 0 || this.stunned > 0) {
        cx.save();
        cx.globalAlpha = .5 + Math.sin(Date.now() * .08) * .3;
        window.ChibiRenderer.drawMonster(cx, this.x, this.y, {
          type: this.type, scale: this.sz / 22,
          aFrame: this.aFrame || 0, atkAnim: this.atkAnim || 0,
          facing: this._facing || 1, t,
        });
        cx.restore();
      } else {
        window.ChibiRenderer.drawMonster(cx, this.x, this.y, {
          type: this.type, scale: this.sz / 22,
          aFrame: this.aFrame || 0, atkAnim: this.atkAnim || 0,
          facing: this._facing || 1, t,
        });
      }
    } else {
      // Fallback: coloured circle + emoji icon
      cx.save();
      cx.fillStyle = 'rgba(0,0,0,.22)';
      cx.beginPath(); cx.ellipse(this.x, this.y + this.sz * .45, this.sz * .6, this.sz * .2, 0, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = this.col || '#ff4444';
      cx.beginPath(); cx.arc(this.x, this.y, this.sz, 0, Math.PI * 2); cx.fill();
      cx.font = `${this.sz * 1.2}px serif`;
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText(this.icon || '👾', this.x, this.y);
      cx.restore();
    }

    // ── Status FX overlay ─────────────────────────────────
    if (this.poison) {
      cx.save(); cx.globalAlpha = .35;
      cx.fillStyle = '#44ff44';
      cx.beginPath(); cx.arc(this.x, this.y, this.sz + 2, 0, Math.PI * 2); cx.fill();
      cx.restore();
    }
    if (this.burnTimer > 0) {
      cx.save(); cx.globalAlpha = .25;
      cx.fillStyle = '#ff6600';
      cx.beginPath(); cx.arc(this.x, this.y, this.sz + 3, 0, Math.PI * 2); cx.fill();
      cx.restore();
    }
    if (this.stunned > 0) {
      cx.font = '12px serif'; cx.textAlign = 'center';
      cx.fillText('💫', this.x, this.y - this.sz - 14);
    }

    // ── HP bar ─────────────────────────────────────────────
    if (this.hp < this.maxHp) {
      const bw = this.sz * 2.2, bh = 5;
      const bx = this.x - bw / 2, by = this.y - this.sz * 1.8;
      cx.fillStyle = 'rgba(0,0,0,.65)';
      cx.beginPath(); cx.roundRect(bx - 1, by - 1, bw + 2, bh + 2, 3); cx.fill();
      const ratio = Math.max(0, this.hp / this.maxHp);
      const hcol  = ratio > .6 ? '#44cc44' : ratio > .3 ? '#ffaa00' : '#ff3333';
      cx.fillStyle = hcol;
      cx.beginPath(); cx.roundRect(bx, by, bw * ratio, bh, 2); cx.fill();
    }

    // ── Name label ────────────────────────────────────────
    cx.font = 'bold 9px "Share Tech Mono",monospace';
    cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
    cx.fillStyle = 'rgba(0,0,0,.55)';
    cx.fillText(this.name || this.type, this.x + 1, this.y - this.sz * 1.8 - 6);
    cx.fillStyle = this.col || '#ffaaaa';
    cx.fillText(this.name || this.type, this.x, this.y - this.sz * 1.8 - 7);

    // ── Elite ring ─────────────────────────────────────────
    if (this.elite) {
      cx.strokeStyle = `rgba(255,200,0,${.3 + Math.sin(t * 3) * .2})`;
      cx.lineWidth = 2.5;
      cx.beginPath(); cx.arc(this.x, this.y, this.sz + 8, 0, Math.PI * 2); cx.stroke();
    }
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
