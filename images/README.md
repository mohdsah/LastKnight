# 🖼️ Folder Imej — Pahlawan Terakhir

## Struktur

```
images/
├── portraits/          Hero & Character portraits
│   ├── human_warrior.svg   Manusia Warrior (El Morad)
│   ├── human_rogue.svg     Manusia Rogue
│   ├── human_mage.svg      Manusia Mage
│   ├── human_priest.svg    Manusia Priest
│   ├── orc_warrior.svg     Orc Warrior (Karus)
│   ├── dark_elf.svg        Dark Elf (Karus)
│   └── elf.svg             Elf Suci (El Morad)
│
├── monsters/           Monster sprites
│   ├── goblin.svg          Goblin biasa
│   ├── orc.svg             Orc soldier
│   ├── dark_mage.svg       Dark Mage
│   ├── boss.svg            Boss Iblis
│   ├── goblin_king.svg     Raja Goblin (Mini Boss)
│   └── demon_king.svg      Raja Iblis (Final Boss)
│
├── items/              (Boleh tambah item icons)
└── ui/                 (Boleh tambah UI elements)
```

## Cara Guna

### Auto Portrait (Automatik)
`js/systems/portraits.js` akan auto-detect race+job dan apply portrait:

```js
// Get portrait path
const path = PortraitSystem.getCharPortrait(selChar);

// Render HTML portrait element
const html = PortraitSystem.renderPortrait(selChar, 80); // size=80px

// Draw pada canvas
PortraitSystem.drawPortraitCanvas(ctx, char, x, y, size);

// Update avatar element by ID
PortraitSystem.updateAvatarEl('mAvatar', selChar);
```

### Map Race+Job ke Portrait

| Race   | Job      | File                    |
|--------|----------|-------------------------|
| human  | warrior  | human_warrior.svg       |
| human  | rogue    | human_rogue.svg         |
| human  | mage     | human_mage.svg          |
| human  | priest   | human_priest.svg        |
| elf    | (any)    | elf.svg                 |
| orc    | (any)    | orc_warrior.svg         |
| dark   | (any)    | dark_elf.svg            |

## Tambah Portrait Baru

1. Buat SVG 120×140px dalam folder `portraits/`
2. Tambah dalam `PORTRAIT_MAP` dalam `portraits.js`:
```js
'race_job': 'images/portraits/filename.svg',
```

## Format SVG Disyorkan
- Saiz viewBox: `120x140` (portrait), `80-110x90-120` (monster)
- Background gelap: `#06040e` atau `#0a0408`
- Style KO Classic: armor gelap, warna emas `#c9a84c`, mata bercahaya
