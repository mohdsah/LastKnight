# 📂 Struktur JavaScript — Pahlawan Terakhir v6.0

## Folder Struktur

```
js/
├── init.js                 — Bootstrap, PT_VERSION, gotoAndPlay
├── auth.js                 — Login, register, char create, save
├── ui.js                   — HUD update, panels, inventory, shop
├── game-core.js            — Canvas, input, G object, game loop
├── farming.js              — Colony Zone, farming system
├── skill-master.js         — Skill tree UI
├── inn-upgrade.js          — Inn, enhancement, crafting
├── powerup-store.js        — Point store, costumes
├── pvp-guild-quest.js      — PvP, Guild, Quest system
│
├── data/                   — ⬇ Data statik (pecahan dari data.js)
│   ├── config.js           — NW_CONFIG, PARTY_CONFIG, expRequired
│   ├── characters.js       — RACES, JOBS, FACE_ICONS, SKILL_TREES
│   ├── world.js            — ZONES, NPCS, FARM_ZONES, CZ_ZONE
│   ├── items.js            — ITEM_DB, SHOPS, ENH_RATES, RARITY_COLOR
│   └── monsters.js         — DROP_TABLE, ENEMY_EXTRA, BOSS_SPAWNS
│
├── entities/               — ⬇ Game entities (pecahan dari game.js)
│   ├── particles.js        — class Pt, class FT, angDiff, rnd, hitPts
│   ├── player.js           — class Player (movement, skills, auto-aim, draw)
│   ├── enemy.js            — class Enemy (AI, combat, all monster types)
│   ├── projectile.js       — class Proj, Ghost (multiplayer)
│   └── npc.js              — NPC draw functions, canvas tap handlers
│
├── maps/                   — Map data
│   ├── zones.js            — Extra zones (ardream, luferson)
│   ├── bosses.js           — Boss spawn configs
│   └── gates.js            — Gate definitions per zone
│
├── systems/                — Game systems
│   ├── autosave.js         — Auto-save setiap 30s
│   ├── dailyquest.js       — Daily quest system
│   ├── equipment.js        — Equipment stats calculation
│   ├── items.js            — Set bonus, tooltips, ActiveBuffs
│   ├── leaderboard.js      — Score submission + display
│   ├── monsters.js         — MONSTER_DB definitions
│   ├── portraits.js        — Auto portrait system
│   └── worldboss.js        — World Boss spawn + HUD
│
└── engine/                 — (Legacy - tidak diload, rujukan sahaja)
    ├── player.js           — Versi asal player (sebelum merge)
    ├── enemy.js            — Versi asal enemy
    ├── world.js            — Versi asal world
    ├── renderer.js         — Versi asal renderer
    └── projectile.js       — Versi asal projectile
```

## Load Order dalam index.html

```
init.js → data/* → audio.js → auth.js → ui.js →
entities/* → game-core.js → farming.js → skill-master.js →
inn-upgrade.js → powerup-store.js → pvp-guild-quest.js →
maps/* → systems/*
```

## Tambah Monster Baru

Edit `js/data/monsters.js`:
```js
const DROP_TABLE = {
  ...,
  nama_monster: [{id:'item_id', rate:0.1}, ...]
};
const ENEMY_EXTRA = {
  ...,
  nama_monster: { name:'Nama', hp:500, atk:50, ... }
};
```

## Tambah Item Baru

Edit `js/data/items.js`:
```js
const ITEM_DB = {
  ...,
  item_id: {name:'Nama', icon:'🗡️', type:'weapon', ...}
};
```
