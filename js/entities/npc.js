'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — NPC Draw & Canvas NPC Tap
   NPC rendering dan interaction handlers
   ══════════════════════════════════════════════════════ */

// ── NPC DRAW ─────────────────────────────────────────
function drawNPCs() {
  const cx = window.cx; if (!cx) return;
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
