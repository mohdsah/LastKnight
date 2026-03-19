'use strict';
/* ══════════════════════════════════════════════════════
   Pahlawan Terakhir — Game Config Data
   NW_CONFIG, PARTY_CONFIG, PK_CONFIG,
   window.STAT_PER_LEVEL, window.SKILL_PT_PER_5LV, expRequired
   ══════════════════════════════════════════════════════ */

const NW_CONFIG={duration:600,killPts:1,fortifyPts:5,rewardGold:{winner:2000,loser:500},rewardXP:{winner:5000,loser:1000},castleHP:1000};

const PARTY_CONFIG={maxMembers:6,xpShareRadius:500,xpPenalty:0.15,lootDistrib:'round_robin'};

const PK_CONFIG={nationsWarZone:'ronark',pkDrop:0.15,allyColor:'#44ff44',enemyColor:'#ff4444',neutralColor:'#ffff44'};

// ═══════════════════════════════════════════════════════
// SISTEM BARU: CZ, Farm, Level, Boss Spawn
// ═══════════════════════════════════════════════════════

// ── RARITY COLORS ────────────────────────────────────

const window.STAT_PER_LEVEL = 3;
// Skill point dapat setiap 5 level
const window.SKILL_PT_PER_5LV = 1;

// ── ZONE CZ (Colony Zone) ────────────────────────────


function expRequired(lv) {
  return Math.floor(100 * Math.pow(lv, 1.5));
}

// expRequired — defined once above

// ── Exports ───────────────────────────────────────────
window.NW_CONFIG        = NW_CONFIG;
window.PARTY_CONFIG     = PARTY_CONFIG;
window.PK_CONFIG        = PK_CONFIG;
window.STAT_PER_LEVEL   = window.STAT_PER_LEVEL;
window.SKILL_PT_PER_5LV = window.SKILL_PT_PER_5LV;
window.expRequired      = expRequired;
