'use strict';
/* ══ Systems: Equipment & Item Rarity ══
   Full equipment slot system dengan stat calculation
   Rarity: Common → Uncommon → Rare → Epic → Legendary → Mythic
   ══════════════════════════════════════════════════════════════ */

// ── RARITY CONFIG ─────────────────────────────────
window.RARITY = {
  common:    { label:'Common',    color:'#aaaaaa', mult:1.0,  glow:'' },
  uncommon:  { label:'Uncommon',  color:'#44cc44', mult:1.2,  glow:'rgba(68,200,68,.3)' },
  rare:      { label:'Rare',      color:'#4488ff', mult:1.5,  glow:'rgba(68,136,255,.3)' },
  epic:      { label:'Epic',      color:'#aa44ff', mult:2.0,  glow:'rgba(170,68,255,.3)' },
  legendary: { label:'Legendary', color:'#ff8800', mult:3.0,  glow:'rgba(255,136,0,.4)' },
  mythic:    { label:'MYTHIC',    color:'#ff4488', mult:5.0,  glow:'rgba(255,68,136,.5)' },
};

// ── EQUIPMENT SLOTS ───────────────────────────────
window.EQUIP_SLOTS = [
  { id:'weapon',  label:'Senjata',    icon:'⚔️' },
  { id:'armor',   label:'Armor',      icon:'🛡️' },
  { id:'helmet',  label:'Topi',       icon:'⛑️' },
  { id:'gloves',  label:'Sarung',     icon:'🧤' },
  { id:'boots',   label:'Kasut',      icon:'👢' },
  { id:'ring1',   label:'Cincin 1',   icon:'💍' },
  { id:'ring2',   label:'Cincin 2',   icon:'💍' },
  { id:'amulet',  label:'Amulet',     icon:'📿' },
  { id:'earring', label:'Anting',     icon:'🌟' },
];

// ── GET ITEM RARITY COLOR ─────────────────────────
function getRarityColor(rarity) {
  return window.RARITY[rarity]?.color || '#aaaaaa';
}

function getRarityLabel(rarity) {
  return window.RARITY[rarity]?.label || 'Common';
}

// ── GET ITEM FULL STAT DISPLAY ────────────────────
function getItemStatHTML(itemId, enh=0) {
  const item = window.ITEM_DB?.[itemId];
  if (!item) return '';

  const rar  = window.RARITY[item.rarity] || window.RARITY.common;
  const enhMult = 1 + enh * 0.08;
  const lines = [];

  if (item.atk)  lines.push(`⚔️ ATK +${Math.floor(item.atk * enhMult)}`);
  if (item.def)  lines.push(`🛡️ DEF +${Math.floor(item.def * enhMult)}`);
  if (item.int)  lines.push(`🔮 INT +${Math.floor(item.int * enhMult)}`);
  if (item.str)  lines.push(`💪 STR +${item.str}`);
  if (item.dex)  lines.push(`🌀 DEX +${item.dex}`);
  if (item.hp)   lines.push(`❤️ HP +${item.hp}`);
  if (item.mp)   lines.push(`💧 MP +${item.mp}`);
  if (item.spd)  lines.push(`⚡ SPD +${item.spd}`);
  if (item.heal) lines.push(`💊 Pulih ${item.heal} HP`);
  if (item.mana) lines.push(`💧 Pulih ${item.mana} MP`);

  const enhStr = enh > 0 ? `<span style="color:#ff8800;font-weight:700"> +${enh}</span>` : '';

  return `
    <div style="font-family:Cinzel,serif;font-size:.72rem;color:${rar.color}">
      ${item.icon||'📦'} ${item.name}${enhStr}
      <span style="font-size:.6rem;opacity:.7"> [${rar.label}]</span>
    </div>
    <div style="font-family:Share Tech Mono,monospace;font-size:.62rem;color:rgba(201,168,76,.6);margin-top:3px">
      ${item.type?.toUpperCase()} ${item.slot ? `| ${item.slot}` : ''}
    </div>
    ${lines.length ? `<div style="font-family:Share Tech Mono,monospace;font-size:.65rem;color:#b0a888;margin-top:4px;line-height:1.6">${lines.join('<br>')}</div>` : ''}
    <div style="font-family:Share Tech Mono,monospace;font-size:.58rem;color:rgba(201,168,76,.4);margin-top:3px">
      💰 Jual: ${item.sell || 0}g
    </div>`;
}

// ── RENDER EQUIPMENT PANEL ────────────────────────
function renderEquipPanel(containerId, eqObj) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = window.EQUIP_SLOTS.map(slot => {
    const itemId = eqObj?.[slot.id];
    const item   = itemId ? window.ITEM_DB?.[itemId] : null;
    const rar    = item ? (window.RARITY[item.rarity] || window.RARITY.common) : null;

    return `
      <div class="equip-slot" style="
        background:rgba(0,0,0,.35);
        border:1px solid ${rar ? rar.color+'44' : 'rgba(201,168,76,.1)'};
        border-radius:4px; padding:8px 10px;
        display:flex; align-items:center; gap:8px;
        cursor:${item?'pointer':'default'};
        transition:all .15s;
        ${rar?.glow ? `box-shadow:0 0 8px ${rar.glow}` : ''}
      " onclick="openItemDetail('${itemId||''}','${slot.id}')">
        <span style="font-size:1.3rem;width:26px;text-align:center">${item?.icon || slot.icon}</span>
        <div style="flex:1">
          <div style="font-family:Cinzel,serif;font-size:.62rem;color:${rar?rar.color:'rgba(201,168,76,.35)'}">${item?.name || '( Kosong )'}</div>
          <div style="font-family:Share Tech Mono,monospace;font-size:.55rem;color:rgba(201,168,76,.4)">${slot.label}</div>
        </div>
        ${item ? `<button class="btn btn-red btn-xs" onclick="event.stopPropagation();unequipItem('${slot.id}')">✕</button>` : ''}
      </div>`;
  }).join('');
}

// ── RENDER INVENTORY BAG ──────────────────────────
function renderInventoryBag(containerId, invObj) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const items = Object.entries(invObj || {});
  if (!items.length) {
    el.innerHTML = '<div style="color:rgba(201,168,76,.35);text-align:center;padding:20px;font-family:Cinzel,serif;font-size:.7rem">Bag kosong</div>';
    return;
  }

  el.innerHTML = `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px">` +
    items.map(([rawId, qty]) => {
      const [itemId] = rawId.split('_+');
      const item = window.ITEM_DB?.[itemId];
      const rar  = item ? (window.RARITY[item.rarity] || window.RARITY.common) : window.RARITY.common;
      const enh  = rawId.includes('_+') ? parseInt(rawId.split('_+')[1]) : 0;

      return `
        <div class="bag-item" title="${item?.name || rawId}"
          style="background:rgba(0,0,0,.4);border:1px solid ${rar.color+'33'};border-radius:4px;
          padding:5px 3px;text-align:center;cursor:pointer;position:relative;transition:all .15s;
          ${rar.glow ? `box-shadow:0 0 6px ${rar.glow}` : ''}"
          onclick="openItemDetail('${rawId}','bag')">
          <div style="font-size:1.5rem">${item?.icon || '📦'}</div>
          <div style="font-family:Share Tech Mono,monospace;font-size:.5rem;color:${rar.color};word-break:break-all;margin-top:2px">${item?.name?.slice(0,8) || itemId.slice(0,6)}</div>
          ${enh > 0 ? `<div style="position:absolute;top:2px;right:3px;font-family:Share Tech Mono,monospace;font-size:.55rem;color:#ff8800">+${enh}</div>` : ''}
          <div style="position:absolute;bottom:2px;right:3px;font-family:Share Tech Mono,monospace;font-size:.5rem;color:rgba(201,168,76,.5)">×${qty}</div>
        </div>`;
    }).join('') + '</div>';
}

// ── ITEM DETAIL POPUP ─────────────────────────────
function openItemDetail(rawId, source) {
  if (!rawId) return;
  const [itemId] = rawId.split('_+');
  const enh  = rawId.includes('_+') ? parseInt(rawId.split('_+')[1]) : 0;
  const item = window.ITEM_DB?.[itemId];
  if (!item) return;

  const modal = document.getElementById('itemDetailModal');
  const body  = document.getElementById('itemDetailBody');
  if (!modal || !body) return;

  body.innerHTML = getItemStatHTML(itemId, enh);

  // Action buttons
  const actDiv = document.getElementById('itemDetailActions');
  if (actDiv) {
    actDiv.innerHTML = '';
    if (item.slot && source === 'bag') {
      actDiv.innerHTML = `<button class="btn btn-gold btn-sm btn-full" onclick="equipItem('${rawId}');closeItemDetail()">⚔️ Pakai</button>`;
    }
    if (source === 'bag') {
      actDiv.innerHTML += `<button class="btn btn-dim btn-sm btn-full" style="margin-top:5px" onclick="dropItem('${rawId}');closeItemDetail()">🗑️ Buang (Jual ${item.sell||0}g)</button>`;
    }
  }

  modal.classList.remove('off');
}

function closeItemDetail() {
  document.getElementById('itemDetailModal')?.classList.add('off');
}

// ── EQUIP / UNEQUIP ───────────────────────────────
function equipItem(rawId) {
  const sc = window.selChar; if (!sc) return;
  const [itemId] = rawId.split('_+');
  const item = window.ITEM_DB?.[itemId]; if (!item?.slot) return;
  if (!sc.equipment) sc.equipment = {};
  sc.equipment[item.slot] = rawId;
  // Remove from bag
  if (sc.inventory?.[rawId]) {
    sc.inventory[rawId]--;
    if (sc.inventory[rawId] <= 0) delete sc.inventory[rawId];
  }
  if (typeof window.saveProgress === 'function') window.saveProgress();
  if (window.G?.pl) window.G.pl.applyChar(sc);
  if (typeof renderEquipSlots === 'function') renderEquipSlots();
}

function unequipItem(slot) {
  const sc = window.selChar; if (!sc?.equipment) return;
  const rawId = sc.equipment[slot]; if (!rawId) return;
  sc.equipment[slot] = null;
  if (!sc.inventory) sc.inventory = {};
  const [itemId] = rawId.split('_+');
  sc.inventory[itemId] = (sc.inventory[itemId]||0) + 1;
  if (typeof window.saveProgress === 'function') window.saveProgress();
  if (window.G?.pl) window.G.pl.applyChar(sc);
  if (typeof renderEquipSlots === 'function') renderEquipSlots();
}

function dropItem(rawId) {
  const sc = window.selChar; if (!sc?.inventory) return;
  const [itemId] = rawId.split('_+');
  const item = window.ITEM_DB?.[itemId];
  delete sc.inventory[rawId];
  if (item?.sell) sc.gold = (sc.gold||0) + item.sell;
  if (typeof window.saveProgress === 'function') window.saveProgress();
  if (typeof renderInventoryPanel === 'function') renderInventoryPanel();
}

// Export
window.getRarityColor   = getRarityColor;
window.getRarityLabel   = getRarityLabel;
window.getItemStatHTML  = getItemStatHTML;
window.renderEquipPanel = renderEquipPanel;
window.renderInventoryBag = renderInventoryBag;
window.openItemDetail   = openItemDetail;
window.closeItemDetail  = closeItemDetail;
window.equipItem        = equipItem;
window.unequipItem      = unequipItem;
window.dropItem         = dropItem;
