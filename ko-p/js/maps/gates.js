'use strict';
/* ══ Maps: Extra Gates ══
   Tambah gate untuk zone baru selepas GATES diinit dalam index.html
   ══════════════════════════════════════════════════════════════════ */

// Run selepas DOMContentLoaded supaya GATES dah ada
window.addEventListener('load', function() {
  if (!window.GATES) return;

  // Ardream gates
  window.GATES['ardream'] = [
    { id:'gate_back_ronark', name:'🏙️ Kembali Ronark',    to:'ronark',   x:1200, y:680,  icon:'🚪', color:'#888' },
    { id:'gate_to_luferson', name:'🏯 Luferson Castle',   to:'luferson', x:1400, y:800,  icon:'🏯', color:'#4488ff', reqLv:40 },
    { id:'gate_ardream_cz',  name:'🏰 Colony Zone',       to:'cz',       x:1000, y:1000, icon:'🏰', color:'#ff8800' },
  ];

  // Luferson gates
  window.GATES['luferson'] = [
    { id:'gate_back_ardream', name:'↩ Kembali Ardream',   to:'ardream',  x:1200, y:600,  icon:'🚪', color:'#888' },
    { id:'gate_back_ronark2', name:'🏙️ Kembali Ronark',   to:'ronark',   x:900,  y:900,  icon:'🚪', color:'#888' },
  ];

  // Ardean Basin gates
  window.GATES['ardean'] = [
    { id:'gate_back_luf',     name:'↩ Kembali Luferson',  to:'luferson', x:1200, y:600,  icon:'🚪', color:'#888' },
  ];
});
