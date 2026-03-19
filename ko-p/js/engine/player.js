'use strict';
/* ══ Engine: Player & Job System ══ */

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
