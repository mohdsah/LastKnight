# 🎵 Audio System — Pahlawan Terakhir

## Struktur
```
audio/
├── README.md          — Dokumentasi ini
├── settings.js        — Volume settings (localStorage)
├── engine.js          — Web Audio Context + oscillator helpers  
├── music.js           — Semua muzik patterns (town, field, dungeon, dll)
├── sfx.js             — Sound effects (attack, hit, levelup, dll)
└── volume-ui.js       — Volume control panel UI
```

## Cara Guna

Semua fail dipanggil oleh `js/audio.js` sebagai sumber rujukan.
Kod sebenar ada dalam `js/audio.js`.

## Tambah SFX Baru
Dalam `sfx.js`, tambah kes baru:
```js
case 'nama_sfx':
  // oscillator settings...
  break;
```

## Tambah Muzik Baru
Dalam `music.js`, tambah:
```js
playNamaMuzik() {
  // notes array
  // BPM, pattern
}
```
