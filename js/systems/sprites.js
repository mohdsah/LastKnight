'use strict';
/* ══════════════════════════════════════════════════════════════
   Pahlawan Terakhir — Sprite System v2.0
   Real knight sprites (freeknight) + RPG tileset canvas
   ══════════════════════════════════════════════════════════════ */

// ── IMAGE LOADER ─────────────────────────────────────────────
const _imgs = {};
function _loadImg(src) {
  if (!_imgs[src]) { const i=new Image(); i.src=src; _imgs[src]=i; }
  return _imgs[src];
}
function _imgReady(src) {
  const i=_imgs[src]; return i&&i.complete&&i.naturalWidth>0;
}

// ── KNIGHT SPRITE ATLAS ───────────────────────────────────────
// knight_warrior.png: 700×420px, 10 frames × 5 animations
// Row 0=idle, 1=walk, 2=run, 3=attack, 4=dead
// Frame size: 70×84px
const KN = {
  src:    'images/sprites/knight_warrior.png',
  fw: 70, fh: 84,
  anims: { idle:0, walk:1, run:2, attack:3, dead:4 },
  frames: 10,
};

// ── RPG TILESET ───────────────────────────────────────────────
// rpg_tileset.png: 256×64px, 32×32px per tile, 8 cols × 2 rows
const TS = {
  src: 'images/sprites/rpg_tileset.png',
  tw: 32, th: 32, cols: 8,
  tiles: {
    grass:0, dirt:1, stone:2, water:3, sand:4, lava:5,
    dungeon_floor:6, dungeon_wall:7,
    tree:8, rock:9, chest:10, portal:11,
    town_floor:12, cz_floor:13, castle_wall:14, gate:15,
  },
};

// ── KNIGHT SPRITE DRAW ────────────────────────────────────────
function drawKnight(ctx, x, y, opts={}) {
  const {
    anim    = 'idle',   // idle|walk|run|attack|dead
    frame   = 0,
    scale   = 1,
    facing  = 1,        // 1=right, -1=left
    alpha   = 1,
    tint    = null,
  } = opts;

  const img = _loadImg(KN.src);
  if (!_imgReady(KN.src)) {
    // Fallback while loading
    ctx.save();
    ctx.globalAlpha = alpha * .5;
    ctx.fillStyle = '#c9a84c';
    ctx.beginPath(); ctx.arc(x, y, 20*scale, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    return;
  }

  const row = KN.anims[anim] ?? 0;
  const fr  = frame % KN.frames;
  const sx  = fr   * KN.fw;
  const sy  = row  * KN.fh;
  const dw  = KN.fw * scale;
  const dh  = KN.fh * scale;

  ctx.save();
  ctx.globalAlpha = alpha;
  if (facing < 0) {
    ctx.translate(x, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, KN.fw, KN.fh, -dw/2, -dh*.85, dw, dh);
  } else {
    ctx.drawImage(img, sx, sy, KN.fw, KN.fh, x-dw/2, y-dh*.85, dw, dh);
  }
  ctx.restore();
}

// ── RPG TILESET DRAW ─────────────────────────────────────────
function drawTile(ctx, tileName, px, py, size=32) {
  const img = _loadImg(TS.src);
  const idx = TS.tiles[tileName] ?? 0;
  const col = idx % TS.cols;
  const row = Math.floor(idx / TS.cols);
  const sx  = col * TS.tw;
  const sy  = row * TS.th;

  if (_imgReady(TS.src)) {
    ctx.drawImage(img, sx, sy, TS.tw, TS.th, px, py, size, size);
  } else {
    // Canvas fallback while loading
    _tileFallback(ctx, tileName, px, py, size);
  }
}

function _tileFallback(ctx, name, px, py, s) {
  const colors = {
    grass:'#3a7a28',dirt:'#7a5030',stone:'#5a5a6a',water:'#1a4a8a',
    sand:'#c8a840',lava:'#cc2800',dungeon_floor:'#181420',dungeon_wall:'#28203a',
    tree:'#2a5a18',rock:'#484858',chest:'#7a4818',portal:'#3a0860',
    town_floor:'#c0b080',cz_floor:'#282838',castle_wall:'#484858',gate:'#8a6028',
  };
  ctx.fillStyle = colors[name] || '#333';
  ctx.fillRect(px, py, s, s);
}

// ── EXPOSE ────────────────────────────────────────────────────
window.RPGTileset = { draw: drawTile };

// ── CHIBI RENDERER (fallback for non-warrior jobs) ────────────
window.ChibiRenderer = {
  drawHero(ctx, x, y, opts={}) {
    const {job='warrior',faction='elmorad',scale=1,aFrame=0,atkAnim=0,
           facing=1,blessBuff=0,berserkBuff=0,stealthMode=false,t=0} = opts;
    const isEl = faction==='elmorad'||faction==='cahaya';

    // Warrior uses real sprite
    if (job === 'warrior') {
      ctx.save();
      if (stealthMode) ctx.globalAlpha = .35;
      if (blessBuff>0)  { ctx.shadowColor='#ffffaa'; ctx.shadowBlur=22; }
      if (berserkBuff>0){ ctx.shadowColor='#ff4400'; ctx.shadowBlur=20; }

      const anim  = atkAnim > 0 ? 'attack' : (aFrame > 0 ? 'walk' : 'idle');
      const frame = Math.floor(aFrame) % 10;

      drawKnight(ctx, x, y, {
        anim, frame, scale: scale*0.9,
        facing, alpha: stealthMode ? .35 : 1,
      });
      ctx.restore();
      return;
    }

    // Other jobs — canvas-drawn chibi
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing*scale, scale);
    if (stealthMode) ctx.globalAlpha=.35;
    else if (blessBuff>0){ctx.shadowColor='#ffffaa';ctx.shadowBlur=22;}
    else if (berserkBuff>0){ctx.shadowColor='#ff4400';ctx.shadowBlur=20;}
    const bob=Math.sin(aFrame*Math.PI/2)*2;
    if (atkAnim>0) ctx.rotate(-.25*(atkAnim/.28));
    switch(job){
      case 'rogue':   this._rogue(ctx,isEl,bob,atkAnim,t);   break;
      case 'magician':this._mage(ctx,isEl,bob,atkAnim,t);    break;
      case 'priest':  this._priest(ctx,isEl,bob,atkAnim,t);  break;
    }
    ctx.restore();
  },

  drawMonster(ctx, x, y, opts={}) {
    const {type='goblin',scale=1,aFrame=0,atkAnim=0,facing=1,t=0} = opts;
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(facing*scale,scale);
    const fns = {
      goblin:this._goblin,orc:this._orc,archer:this._archer,
      dark_mage:this._darkMage,goblin_king:this._goblinKing,
      orc_warlord:(c,a,k,t)=>this._orc(c,a,k,t,true),
      boss:this._boss,demon_king:this._demonKing,cz_guardian:this._czGuardian,
    };
    (fns[type]||this._goblin).call(this,ctx,aFrame,atkAnim,t);
    ctx.restore();
  },

  // ── Rogue ────────────────────────────────────────────────
  _rogue(ctx,isEl,bob,atk,t){
    const lo=Math.sin(bob*.5)*5;
    ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,26+bob,12,4,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#1a1008';ctx.beginPath();ctx.roundRect(-8,10+bob,7,14+lo,[0,0,3,3]);ctx.fill();
    ctx.beginPath();ctx.roundRect(1,10+bob,7,14-lo,[0,0,3,3]);ctx.fill();
    ctx.fillStyle='#0f0c06';ctx.beginPath();ctx.roundRect(-13,-14,26,29,5);ctx.fill();
    ctx.fillStyle='#4a3218';ctx.beginPath();ctx.roundRect(-10,-12,20,23,4);ctx.fill();
    ctx.fillStyle='#1a0c08';ctx.beginPath();ctx.moveTo(-13,-12);ctx.quadraticCurveTo(-22,0,-19,19+bob*.5);ctx.lineTo(-13,14);ctx.closePath();ctx.fill();
    ctx.fillStyle='#6a4820';ctx.fillRect(-9,4,18,4);
    ctx.fillStyle='#c9a84c';ctx.beginPath();ctx.arc(0,6,2.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#c8804a';ctx.beginPath();ctx.arc(0,-27,12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,130,130,.3)';ctx.beginPath();ctx.ellipse(-5,-23,3.5,2,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(5,-23,3.5,2,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#1a1008';ctx.beginPath();ctx.arc(0,-28,11,Math.PI,0);ctx.fill();ctx.fillRect(-11,-29,22,7);
    ctx.fillStyle='#ff4400';ctx.shadowColor='#ff5500';ctx.shadowBlur=7;
    ctx.beginPath();ctx.arc(-3,-26,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(3,-26,2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    const da=atk>0?-.5:0;
    ctx.save();ctx.translate(11,-1);ctx.rotate(da);ctx.strokeStyle='#aaffcc';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-22);ctx.stroke();ctx.fillStyle='#c9a84c';ctx.fillRect(-3,-2,7,3);ctx.restore();
    ctx.save();ctx.translate(-11,-2);ctx.rotate(-da);ctx.strokeStyle='#aaffcc';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-20);ctx.stroke();ctx.fillStyle='#c9a84c';ctx.fillRect(-2,-2,5,3);ctx.restore();
  },

  // ── Mage ─────────────────────────────────────────────────
  _mage(ctx,isEl,bob,atk,t){
    const lo=Math.sin(bob*.5)*3;
    ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,25+bob,11,4,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#2a1848';ctx.beginPath();ctx.moveTo(-11,10+bob);ctx.lineTo(11,10+bob);ctx.lineTo(14+lo,24+bob);ctx.lineTo(-14-lo,24+bob);ctx.closePath();ctx.fill();
    ctx.fillStyle='#3a2060';ctx.beginPath();ctx.roundRect(-11,-13,22,25,4);ctx.fill();
    ctx.fillStyle='#2a1048';ctx.beginPath();ctx.ellipse(-14,-5,9,7,-.4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(14,-5,9,7,.4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#c8946a';ctx.beginPath();ctx.arc(0,-26,13,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,140,140,.35)';ctx.beginPath();ctx.ellipse(-5,-22,4,2.5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(5,-22,4,2.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#1a1030';ctx.beginPath();ctx.moveTo(0,-40);ctx.lineTo(-10,-22);ctx.lineTo(10,-22);ctx.closePath();ctx.fill();
    ctx.fillStyle='#130a28';ctx.beginPath();ctx.ellipse(0,-22,11,3.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#c9a84c';ctx.beginPath();ctx.arc(0,-40,2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#6644ff';ctx.beginPath();ctx.arc(-4,-26,2.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(4,-26,2.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(-3,-27,1,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(5,-27,1,0,Math.PI*2);ctx.fill();
    const op=.8+Math.sin(t*3)*.2;
    ctx.strokeStyle='#5a3a18';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(14,-5);ctx.lineTo(14,-37);ctx.stroke();
    ctx.fillStyle=`rgba(140,90,255,${op})`;ctx.shadowColor='#aa88ff';ctx.shadowBlur=14*op;ctx.beginPath();ctx.arc(14,-39,7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  },

  // ── Priest ───────────────────────────────────────────────
  _priest(ctx,isEl,bob,atk,t){
    const lo=Math.sin(bob*.5)*3;
    ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,25+bob,12,4,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#e8d8c0';ctx.beginPath();ctx.moveTo(-11,10+bob);ctx.lineTo(11,10+bob);ctx.lineTo(15+lo,24+bob);ctx.lineTo(-15-lo,24+bob);ctx.closePath();ctx.fill();
    ctx.fillStyle='#f0e0c8';ctx.beginPath();ctx.roundRect(-11,-13,22,25,4);ctx.fill();
    ctx.strokeStyle='#c9a84c';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(0,3);ctx.moveTo(-5,-4);ctx.lineTo(5,-4);ctx.stroke();
    ctx.fillStyle='#e0d0b8';ctx.beginPath();ctx.ellipse(-14,-4,10,7,-.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(14,-4,10,7,.3,0,Math.PI*2);ctx.fill();
    const hp=.7+Math.sin(t*2)*.3;
    ctx.strokeStyle=`rgba(255,215,80,${hp})`;ctx.lineWidth=2;ctx.setLineDash([3,3]);ctx.lineDashOffset=-t*5;ctx.beginPath();ctx.arc(0,-37,10,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#d4956a';ctx.beginPath();ctx.arc(0,-26,13,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,150,150,.35)';ctx.beginPath();ctx.ellipse(-5,-22,4,2.5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(5,-22,4,2.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#4477cc';ctx.beginPath();ctx.arc(-4,-26,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(4,-26,2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(-3,-27,.8,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(5,-27,.8,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#8a6020';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(13,-4);ctx.lineTo(13,-34);ctx.stroke();
    const hp2=.7+Math.sin(t*2.5)*.3;
    ctx.strokeStyle=`rgba(255,215,80,${hp2})`;ctx.lineWidth=2;ctx.shadowColor='#ffee88';ctx.shadowBlur=10*hp2;ctx.beginPath();ctx.arc(13,-36,6,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(13,-42);ctx.lineTo(13,-30);ctx.moveTo(7,-36);ctx.lineTo(19,-36);ctx.stroke();ctx.shadowBlur=0;
  },

  // ── Monsters ─────────────────────────────────────────────
  _goblin(ctx,af,atk,t){const bob=Math.sin(af*Math.PI/2)*3;ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(0,20+bob,9,3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2a7a2a';ctx.beginPath();ctx.roundRect(-6,8+bob,5,11+Math.sin(bob)*3,[0,0,2,2]);ctx.fill();ctx.beginPath();ctx.roundRect(1,8+bob,5,11-Math.sin(bob)*3,[0,0,2,2]);ctx.fill();ctx.fillStyle='#2a8a2a';ctx.beginPath();ctx.roundRect(-9,-7,18,16,[5,5,6,6]);ctx.fill();ctx.fillStyle='#4a3a1a';ctx.beginPath();ctx.roundRect(-7,5,14,6,[0,0,3,3]);ctx.fill();const aa=atk>0?-.5:0;ctx.fillStyle='#2a8a2a';ctx.save();ctx.translate(-10,0);ctx.rotate(-aa);ctx.beginPath();ctx.roundRect(-3,-2,7,12,[3,3,4,4]);ctx.fill();ctx.restore();ctx.save();ctx.translate(10,0);ctx.rotate(aa);ctx.beginPath();ctx.roundRect(-3,-2,7,12,[3,3,4,4]);ctx.fill();ctx.restore();ctx.fillStyle='#2a9a2a';ctx.beginPath();ctx.arc(0,-15,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3aaa3a';ctx.beginPath();ctx.ellipse(-12,-13,6,10,-.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(12,-13,6,10,.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#cc0000';ctx.beginPath();ctx.ellipse(-4,-14,4,3.5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(4,-14,4,3.5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff6600';ctx.beginPath();ctx.arc(-4,-14,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(4,-14,2,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(-3,-15,.8,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(5,-15,.8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1a5a1a';ctx.beginPath();ctx.arc(0,-9,3.5,0,Math.PI);ctx.fill();ctx.strokeStyle='#ddddaa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-2,-10);ctx.lineTo(-2,-13);ctx.stroke();ctx.beginPath();ctx.moveTo(2,-10);ctx.lineTo(2,-13);ctx.stroke();},
  _orc(ctx,af,atk,t,iw=false){const bob=Math.sin(af*Math.PI/2)*2,sc='#6a3a2a',ac=iw?'#8a2020':'#6a3820';ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,24+bob,13,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=ac;ctx.beginPath();ctx.roundRect(-10,9+bob,9,13+Math.sin(bob)*2,[0,0,3,3]);ctx.fill();ctx.beginPath();ctx.roundRect(1,9+bob,9,13-Math.sin(bob)*2,[0,0,3,3]);ctx.fill();ctx.fillStyle=ac;ctx.beginPath();ctx.roundRect(-13,-11,26,23,[5,5,8,8]);ctx.fill();ctx.fillStyle='rgba(255,255,255,.08)';ctx.beginPath();ctx.roundRect(-10,-9,11,9,3);ctx.fill();ctx.fillStyle=iw?'#6a1818':'#5a3010';ctx.beginPath();ctx.ellipse(-16,-7,11,8,-.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(16,-7,11,8,.3,0,Math.PI*2);ctx.fill();ctx.fillStyle=sc;ctx.beginPath();ctx.arc(0,-21,13,0,Math.PI*2);ctx.fill();if(iw){ctx.fillStyle='#6a1818';ctx.beginPath();ctx.arc(0,-22,12,Math.PI,0);ctx.fill();ctx.fillRect(-12,-23,24,5);ctx.fillStyle='#ff2200';ctx.shadowColor='#ff4400';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(-3,-22,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(3,-22,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}else{ctx.fillStyle='#ff5500';ctx.beginPath();ctx.ellipse(-3,-20,4,3,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(3,-20,4,3,0,0,Math.PI*2);ctx.fill();}ctx.strokeStyle='#ddddbb';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-4,-13);ctx.lineTo(-3,-18);ctx.stroke();ctx.beginPath();ctx.moveTo(4,-13);ctx.lineTo(3,-18);ctx.stroke();const aa=atk>0?-.9:.1;ctx.save();ctx.translate(16,-3);ctx.rotate(aa);ctx.strokeStyle='#4a3010';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-27);ctx.stroke();ctx.fillStyle='#8a8a9a';ctx.strokeStyle='#aaaacc';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-2,-17);ctx.lineTo(8,-11);ctx.lineTo(7,-25);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();},
  _archer(ctx,af,atk,t){const bob=Math.sin(af*Math.PI/2)*3;ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,21+bob,10,3.5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3a2a10';ctx.beginPath();ctx.roundRect(-6,7+bob,5,11,[0,0,2,2]);ctx.fill();ctx.beginPath();ctx.roundRect(1,7+bob,5,11,[0,0,2,2]);ctx.fill();ctx.fillStyle='#5a3a18';ctx.beginPath();ctx.roundRect(-10,-11,20,20,[4,4,5,5]);ctx.fill();ctx.fillStyle='#3a2a08';ctx.beginPath();ctx.roundRect(-15,-7,7,14,[2,2,3,3]);ctx.fill();ctx.fillStyle='#c8804a';ctx.beginPath();ctx.arc(0,-18,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3a2a10';ctx.beginPath();ctx.arc(0,-19,10,Math.PI,0);ctx.fill();ctx.fillRect(-10,-20,20,5);ctx.fillStyle='#aa7722';ctx.beginPath();ctx.arc(-3,-18,1.8,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(3,-18,1.8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#8a6030';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(12,0,18,-.65,.65);ctx.stroke();if(atk>0){ctx.strokeStyle='#c8a050';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(12,-13);ctx.lineTo(12,13);ctx.stroke();ctx.strokeStyle='#c9a84c';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-4,0);ctx.stroke();ctx.fillStyle='#c9a84c';ctx.beginPath();ctx.moveTo(-4,-2);ctx.lineTo(-9,0);ctx.lineTo(-4,2);ctx.closePath();ctx.fill();}},
  _darkMage(ctx,af,atk,t){const bob=Math.sin(af*Math.PI/2)*2;ctx.fillStyle='rgba(80,0,120,.15)';ctx.beginPath();ctx.ellipse(0,22+bob,11,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#18083a';ctx.beginPath();ctx.moveTo(-11,7+bob);ctx.lineTo(11,7+bob);ctx.lineTo(13,20+bob);ctx.lineTo(-13,20+bob);ctx.closePath();ctx.fill();ctx.fillStyle='#18083a';ctx.beginPath();ctx.roundRect(-10,-12,20,21,4);ctx.fill();ctx.fillStyle='#120628';ctx.beginPath();ctx.ellipse(-13,-3,8,6,-.4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(13,-3,8,6,.4,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(80,0,140,.8)';ctx.shadowColor='#cc00ff';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(-15,4,6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#3a2840';ctx.beginPath();ctx.arc(0,-19,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#0c0418';ctx.beginPath();ctx.arc(0,-20,11,Math.PI,0);ctx.fill();ctx.fillRect(-11,-21,22,7);ctx.fillStyle='#cc00ff';ctx.shadowColor='#cc00ff';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(-3,-18,2.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(3,-18,2.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;},
  _goblinKing(ctx,af,atk,t){ctx.scale(1.3,1.3);const bob=Math.sin(af*Math.PI/2)*2;ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,19+bob,12,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2a9a2a';ctx.beginPath();ctx.roundRect(-11,-11,22,21,[5,5,7,7]);ctx.fill();const cp=.8+Math.sin(t*3)*.2;ctx.fillStyle=`rgba(201,168,76,${cp})`;for(let i=-3;i<=3;i+=2){ctx.beginPath();ctx.moveTo(i*3,-22);ctx.lineTo(i*3-3,-28);ctx.lineTo(i*3+3,-28);ctx.closePath();ctx.fill();}ctx.fillRect(-11,-22,22,4);ctx.fillStyle='#ff2200';ctx.beginPath();ctx.arc(-5,-25,2.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2244ff';ctx.beginPath();ctx.arc(0,-26,2.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#22cc22';ctx.beginPath();ctx.arc(5,-25,2.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2a9a2a';ctx.beginPath();ctx.arc(0,-16,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3aaa3a';ctx.beginPath();ctx.ellipse(-13,-13,7,11,-.25,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(13,-13,7,11,.25,0,Math.PI*2);ctx.fill();ctx.fillStyle='#cc0000';ctx.shadowColor='#ff2200';ctx.shadowBlur=8;ctx.beginPath();ctx.ellipse(-4,-15,5,4.5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(4,-15,5,4.5,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;},
  _boss(ctx,af,atk,t){ctx.scale(1.5,1.5);const bob=Math.sin(t*2)*2;ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,21+bob,13,5,0,0,Math.PI*2);ctx.fill();[[-.7,-.3],[.7,.3]].forEach(([sx,rot])=>{ctx.save();ctx.scale(sx,1);ctx.rotate(rot);ctx.fillStyle='#1a0828';ctx.beginPath();ctx.moveTo(10,-2);ctx.quadraticCurveTo(27,-16,21,7);ctx.quadraticCurveTo(17,18,10,7);ctx.closePath();ctx.fill();ctx.restore();});ctx.fillStyle='#1a0818';ctx.beginPath();ctx.roundRect(-13,-12,26,27,[5,5,9,9]);ctx.fill();const gp=.4+Math.sin(t*5)*.3;ctx.strokeStyle=`rgba(255,80,0,${gp})`;ctx.lineWidth=2;ctx.shadowColor='#ff4400';ctx.shadowBlur=14*gp;ctx.beginPath();ctx.arc(0,-1,8,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#1a0810';ctx.beginPath();ctx.moveTo(-7,-21);ctx.quadraticCurveTo(-15,-30,-9,-23);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(7,-21);ctx.quadraticCurveTo(15,-30,9,-23);ctx.closePath();ctx.fill();ctx.fillStyle='#2a1838';ctx.beginPath();ctx.arc(0,-17,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff0088';ctx.shadowColor='#ff00aa';ctx.shadowBlur=10;[[-5,-21],[5,-21],[-3,-15],[3,-15]].forEach(([ex,ey])=>{ctx.beginPath();ctx.arc(ex,ey,2.5,0,Math.PI*2);ctx.fill();});ctx.shadowBlur=0;const sa=atk>0?-1.2:.15;ctx.save();ctx.translate(14,-4);ctx.rotate(sa);ctx.strokeStyle='#2a1030';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-28);ctx.stroke();ctx.fillStyle='#4a4a5a';ctx.strokeStyle='#8888aa';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-3,-13);ctx.lineTo(8,-7);ctx.lineTo(7,-24);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();},
  _demonKing(ctx,af,atk,t){ctx.scale(1.8,1.8);const bob=Math.sin(t*1.5)*3;ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,21+bob,15,6,0,0,Math.PI*2);ctx.fill();[[-.7,-.25],[.7,.25]].forEach(([sx,rot])=>{ctx.save();ctx.scale(sx,1);ctx.rotate(rot);ctx.fillStyle='#2a0808';ctx.beginPath();ctx.moveTo(9,-1);ctx.quadraticCurveTo(26,-16,20,7);ctx.quadraticCurveTo(17,19,9,7);ctx.closePath();ctx.fill();ctx.restore();});ctx.fillStyle='#1a0818';ctx.beginPath();ctx.roundRect(-13,-13,26,27,[5,5,9,9]);ctx.fill();const gp=.4+Math.sin(t*5)*.35;ctx.strokeStyle=`rgba(255,80,0,${gp})`;ctx.lineWidth=2;ctx.shadowColor='#ff4400';ctx.shadowBlur=14*gp;ctx.beginPath();ctx.arc(0,-1,9,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#2a0c0c';[[-15,-7,-.3],[15,-7,.3]].forEach(([px,py,ang])=>{ctx.save();ctx.translate(px,py);ctx.rotate(ang);ctx.beginPath();ctx.ellipse(0,0,10,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1a0808';ctx.beginPath();ctx.moveTo(-2,-4);ctx.lineTo(0,-11);ctx.lineTo(2,-4);ctx.closePath();ctx.fill();ctx.restore();});[[-1,1],[1,-1]].forEach(([sx])=>{ctx.save();ctx.scale(sx,1);ctx.fillStyle='#1a0810';ctx.beginPath();ctx.moveTo(5,-23);ctx.quadraticCurveTo(14,-30,11,-19);ctx.closePath();ctx.fill();ctx.restore();});ctx.fillStyle='#1e0c1a';ctx.beginPath();ctx.arc(0,-19,13,0,Math.PI*2);ctx.fill();ctx.shadowColor='#ff3300';ctx.shadowBlur=10;ctx.fillStyle='#ff1100';[[-6,-24],[0,-24],[6,-24],[-4,-18],[0,-18],[4,-18]].forEach(([ex,ey])=>{ctx.beginPath();ctx.arc(ex,ey,2,0,Math.PI*2);ctx.fill();});ctx.shadowBlur=0;const sa2=atk>0?-1.4:.2;ctx.save();ctx.translate(15,-5);ctx.rotate(sa2);ctx.strokeStyle='#2a1830';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-30);ctx.stroke();ctx.fillStyle='#4a4a5a';ctx.strokeStyle='#8888aa';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-4,-13);ctx.lineTo(9,-7);ctx.lineTo(8,-26);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#600020';ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.restore();},
  _czGuardian(ctx,af,atk,t){ctx.scale(1.4,1.4);const bob=Math.sin(af*Math.PI/2)*2;ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,21+bob,13,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4a4a6a';ctx.beginPath();ctx.roundRect(-12,-12,24,26,[5,5,8,8]);ctx.fill();ctx.fillStyle='rgba(255,255,255,.1)';ctx.beginPath();ctx.roundRect(-9,-10,10,10,3);ctx.fill();ctx.fillStyle='rgba(80,80,200,.5)';ctx.beginPath();ctx.arc(0,-1,6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(120,120,255,.7)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-7);ctx.lineTo(0,5);ctx.moveTo(-6,-1);ctx.lineTo(6,-1);ctx.stroke();ctx.fillStyle='#3a3a5a';ctx.beginPath();ctx.ellipse(-15,-7,10,8,-.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(15,-7,10,8,.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3a3a5a';ctx.beginPath();ctx.roundRect(-10,10+bob,9,13,[0,0,3,3]);ctx.fill();ctx.beginPath();ctx.roundRect(1,10+bob,9,13,[0,0,3,3]);ctx.fill();ctx.fillStyle='#5a5a7a';ctx.beginPath();ctx.arc(0,-21,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3a3a5a';ctx.beginPath();ctx.arc(0,-22,11,Math.PI,0);ctx.fill();ctx.fillRect(-11,-23,22,6);ctx.fillStyle='rgba(80,120,255,.9)';ctx.beginPath();ctx.roundRect(-8,-25,16,5,2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.arc(-2,-23,1.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(2,-23,1.5,0,Math.PI*2);ctx.fill();const sa=atk>0?-.7:.1;ctx.save();ctx.translate(14,-3);ctx.rotate(sa);ctx.strokeStyle='#6a4a20';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-28);ctx.stroke();ctx.fillStyle='#aaaacc';ctx.beginPath();ctx.moveTo(-4,-22);ctx.lineTo(0,-30);ctx.lineTo(4,-22);ctx.closePath();ctx.fill();ctx.restore();},
};

// ── SPRITE SYSTEM ─────────────────────────────────────────────
window.SpriteSystem = {
  _t: 0,
  init() {
    _loadImg(KN.src);
    _loadImg(TS.src);
    console.log('[SpriteSystem] Initialized ✅');
  },
  tick(dt) { this._t += dt; },
  getTime() { return this._t; },
  // Frame helper for walk/run animation
  getKnightFrame(aFrame, moving) {
    if (!moving) return { anim:'idle', frame: Math.floor(this._t * 8) % 10 };
    return { anim:'walk', frame: Math.floor(aFrame * 10) % 10 };
  },
};
window.addEventListener('load', () => setTimeout(() => window.SpriteSystem?.init(), 100));
