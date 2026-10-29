// Computes sw.js VERSION from the content of everything it precaches, using Workbox's precache
// manifest (workbox-build getManifest: one content revision per file). Any change to a CORE file
// or to sw.js itself gives a new VERSION, so installed apps refresh their offline copy. Nobody needs
// to hand-bump VERSION any more: the "Update service worker version" workflow runs this on every
// push to main and commits the result. The service worker's caching logic is unchanged.
//   node scripts/update-sw-version.mjs          rewrite VERSION in sw.js if needed
//   node scripts/update-sw-version.mjs --check  exit 1 if VERSION is stale (informational)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getManifest } from 'workbox-build';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const swPath = path.join(root, 'sw.js');
const sw = fs.readFileSync(swPath, 'utf8');
const VERSION_RE = /^const VERSION = '([^']*)';$/m;
if (!VERSION_RE.test(sw)) throw new Error("sw.js: line `const VERSION = '...';` not found");
const start = sw.indexOf('const CORE');
const core = [...new Set(Array.from(sw.slice(start, sw.indexOf('];', start)).matchAll(/['"]\.\/([^'"]*)['"]/g), m => m[1]).filter(Boolean))];
const { manifestEntries, warnings } = await getManifest({ globDirectory: root, globPatterns: core, maximumFileSizeToCacheInBytes: 50 * 1024 * 1024 });
if (warnings.length) console.warn(warnings.join('\n'));
const missing = core.filter(f => !manifestEntries.some(e => e.url === f));
if (missing.length) throw new Error('Precached file(s) not found: ' + missing.join(', '));
const h = crypto.createHash('sha256');
for (const e of manifestEntries.sort((a, b) => a.url.localeCompare(b.url))) h.update(e.url + ' ' + e.revision + '\n');
h.update(sw.replace(VERSION_RE, ''));
const version = 'scripture-for-life-shell-v-' + h.digest('hex').slice(0, 12);
const current = sw.match(VERSION_RE)[1];
if (current === version) { console.log('sw.js VERSION is current: ' + version); process.exit(0); }
if (process.argv.includes('--check')) { console.log('sw.js VERSION would change: ' + current + ' -> ' + version); process.exit(1); }
fs.writeFileSync(swPath, sw.replace(VERSION_RE, `const VERSION = '${version}';`));
console.log('sw.js VERSION ' + current + ' -> ' + version + ' (' + manifestEntries.length + ' precached files)');
