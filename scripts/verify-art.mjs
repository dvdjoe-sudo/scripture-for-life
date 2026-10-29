// npm run check: every watercolor is WebP (or has a WebP alongside a kept fallback) and every image is unique.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const walk = d => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) : [];
const imgs = ['assets', 'stories'].flatMap(d => walk(path.join(root, d))).filter(f => /\.(webp|png|jpe?g)$/i.test(f));
const raster = imgs.filter(f => /\.(png|jpe?g)$/i.test(f) && !fs.existsSync(f.replace(/\.(png|jpe?g)$/i, '.webp')));
const seen = new Map(), dups = [];
for (const f of imgs.filter(f => f.endsWith('.webp'))) {
  const h = crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  if (seen.has(h)) dups.push(path.relative(root, f) + ' = ' + path.relative(root, seen.get(h))); else seen.set(h, f);
}
const bytes = imgs.reduce((s, f) => s + fs.statSync(f).size, 0);
if (raster.length || dups.length) {
  if (raster.length) console.error('FAIL — PNG/JPEG art without WebP (run npm run art:optimize):\n  ' + raster.map(f => path.relative(root, f)).join('\n  '));
  if (dups.length) console.error('FAIL — duplicate images (each picture must be unique):\n  ' + dups.join('\n  '));
  process.exit(1);
}
console.log(`PASS — ${seen.size} WebP images, all unique, ${(bytes / 1e6).toFixed(1)} MB.`);
