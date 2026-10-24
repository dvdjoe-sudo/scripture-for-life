// Single source of truth for which site files ship: index.html.
// build-web.mjs (Android/Capacitor bundle) and verify-sw-precache.mjs (offline cache) both use this.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Always shipped, even though index.html does not reference them by <script>/<link>.
export const EXTRA_FILES = ['index.html', 'sw.js'];
// Copied whole (every file inside, by pattern) so new data/*.json and art need no list edits.
export const ASSET_DIRS = ['assets', 'data', 'psalms-text'];
// Paths never shipped (relative to the repo root). Add here rather than editing lists elsewhere.
// The raw BSB source text is only used by standalone.html and the verify scripts, not the app.
export const EXCLUDES = ['data/Berean-Standard-Bible-original.txt'];

// Local files referenced by <script src> and <link href> in index.html, in page order.
export function indexRefs(base = root) {
  const html = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
  const refs = [];
  for (const m of html.matchAll(/<(?:script|link)\b[^>]*?\s(?:src|href)=["']([^"']+)["']/g)) {
    const uri = m[1].split(/[?#]/)[0].replace(/^\.\//, '');
    if (!uri || /^(?:[a-z]+:|\/\/)/i.test(uri)) continue;
    if (!refs.includes(uri)) refs.push(uri);
  }
  // Story scripts that app.js loads only when their route opens (still shipped and precached).
  const lazy = html.match(/<script id="sfl-lazy-books" type="application\/json">([\s\S]*?)<\/script>/);
  if (lazy) for (const f of Object.values(JSON.parse(lazy[1]))) if (!refs.includes(f)) refs.push(f);
  // Psalms 1-36 verse-study scripts, loaded on demand by psalm-study-index.js (still shipped and precached).
  const ps = html.match(/<script id="sfl-lazy-psalms" type="application\/json">([\s\S]*?)<\/script>/);
  if (ps) for (const f of JSON.parse(ps[1])) if (!refs.includes(f)) refs.push(f);
  return refs;
}

// Book story data that must be available offline: data/<book>-episodes.json and data/<book>-scenes.json.
export function bookDataFiles(base = root) {
  return fs.readdirSync(path.join(base, 'data'))
    .filter(f => /-(?:episodes|scenes)\.json$/.test(f))
    .sort()
    .map(f => 'data/' + f);
}

export function isExcluded(rel) {
  return EXCLUDES.some(x => rel === x || rel.startsWith(x.replace(/\/?$/, '/')));
}
