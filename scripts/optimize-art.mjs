// Build-time art optimizer (sharp). Converts any PNG/JPEG watercolor under assets/ or stories/
// to WebP (quality 75, effort 6, the same settings the existing art was made with) and keeps
// the original only when --keep is passed. Existing .webp files are left untouched: re-encoding
// them saves ~3% and would add generational loss, so it is not worth it.
//   npm run art:optimize            convert new PNG/JPEG art to WebP
//   npm run art:optimize -- --keep  convert but keep the originals as fallbacks
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const keep = process.argv.includes('--keep');
const walk = d => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) : [];
const src = ['assets', 'stories'].flatMap(d => walk(path.join(root, d))).filter(f => /\.(png|jpe?g)$/i.test(f));
let before = 0, after = 0;
for (const f of src) {
  const out = f.replace(/\.(png|jpe?g)$/i, '.webp');
  const buf = fs.readFileSync(f);
  await sharp(buf).webp({ quality: 75, effort: 6, smartSubsample: true }).toFile(out);
  before += buf.length; after += fs.statSync(out).size;
  if (!keep) fs.rmSync(f);
  console.log(path.relative(root, f) + ' -> ' + path.relative(root, out));
}
console.log(src.length ? `Converted ${src.length} image(s): ${(before / 1e6).toFixed(2)} MB -> ${(after / 1e6).toFixed(2)} MB` : 'No PNG/JPEG art to convert; all art is already WebP.');
console.log('Now run: node scripts/verify-art.mjs (and update any src= that pointed at the old file).');
