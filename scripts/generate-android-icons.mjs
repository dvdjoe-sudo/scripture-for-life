#!/usr/bin/env node
/* Generate adaptive launcher icons + Play 512 icon from icon.svg (sharp). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svgPath = path.join(root, 'icon.svg');
const svg = fs.readFileSync(svgPath);
const bg = '#214d43';

const densities = {
  'mipmap-mdpi': { launcher: 48, foreground: 108 },
  'mipmap-hdpi': { launcher: 72, foreground: 162 },
  'mipmap-xhdpi': { launcher: 96, foreground: 216 },
  'mipmap-xxhdpi': { launcher: 144, foreground: 324 },
  'mipmap-xxxhdpi': { launcher: 192, foreground: 432 },
};

const outRes = path.join(root, 'resources', 'android');
fs.rmSync(outRes, { recursive: true, force: true });
fs.mkdirSync(outRes, { recursive: true });

async function renderIcon(size, { pad = 0.18 } = {}) {
  // Pad so the glyph sits in the adaptive safe zone (~66% of canvas).
  const inner = Math.round(size * (1 - pad * 2));
  const glyph = await sharp(svg).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite([{ input: glyph, gravity: 'centre' }]).png().toBuffer();
}

async function solid(size, hex) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return sharp({ create: { width: size, height: size, channels: 4, background: { r, g, b, alpha: 1 } } }).png().toBuffer();
}

const anydpi = path.join(outRes, 'mipmap-anydpi-v26');
fs.mkdirSync(anydpi, { recursive: true });
const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
fs.writeFileSync(path.join(anydpi, 'ic_launcher.xml'), adaptiveXml);
fs.writeFileSync(path.join(anydpi, 'ic_launcher_round.xml'), adaptiveXml);

const values = path.join(outRes, 'values');
fs.mkdirSync(values, { recursive: true });
fs.writeFileSync(path.join(values, 'ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${bg}</color>
</resources>
`);

for (const [folder, sizes] of Object.entries(densities)) {
  const dir = path.join(outRes, folder);
  fs.mkdirSync(dir, { recursive: true });
  const legacy = await sharp(svg).resize(sizes.launcher, sizes.launcher).png().toBuffer();
  const fg = await renderIcon(sizes.foreground, { pad: 0.18 });
  fs.writeFileSync(path.join(dir, 'ic_launcher.png'), legacy);
  fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), legacy);
  fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), fg);
}

const store = path.join(root, 'store');
fs.mkdirSync(store, { recursive: true });
const play512 = await sharp(svg).resize(512, 512).png().toBuffer();
fs.writeFileSync(path.join(store, 'icon-512.png'), play512);

// Feature graphic 1024x500
const featIcon = await sharp(svg).resize(280, 280).png().toBuffer();
const svgText = Buffer.from(`<svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="500" fill="${bg}"/>
  <text x="520" y="230" fill="#fff9e9" font-family="Georgia, serif" font-size="64">Scripture for Life</text>
  <text x="520" y="290" fill="#c9d5ba" font-family="Helvetica, Arial, sans-serif" font-size="28">Find help in God&#39;s Word</text>
</svg>`);
const feature = await sharp(svgText)
  .composite([{ input: featIcon, left: 120, top: 110 }])
  .png()
  .toBuffer();
fs.writeFileSync(path.join(store, 'feature-graphic-1024x500.png'), feature);

console.log('Generated resources/android/* and store/icon-512.png + feature-graphic-1024x500.png');
