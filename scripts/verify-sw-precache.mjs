// Fails npm run check if sw.js's install precache (CORE) is missing any file the site needs offline:
// every local <script src>/<link href> in index.html and every data/<book>-episodes.json / -scenes.json.
// Psalm watercolors are deliberately NOT here; they load on demand via LAZY_ART.
import fs from 'node:fs';
import path from 'node:path';
import { root, indexRefs, bookDataFiles } from './site-files.mjs';

const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const start = sw.indexOf('const CORE');
if (start === -1) throw new Error('sw.js: const CORE precache list not found');
const core = new Set(Array.from(sw.slice(start, sw.indexOf('];', start)).matchAll(/['"]\.\/([^'"]*)['"]/g), m => m[1]));

const needed = [...indexRefs(), ...bookDataFiles()];
const missing = needed.filter(f => !core.has(f));
const stale = [...core].filter(f => f && !fs.existsSync(path.join(root, f)));

const problems = [];
if (missing.length) problems.push('sw.js CORE precache is missing ' + missing.length + ' file(s) the site needs offline.\n' +
  'Add these lines to the CORE list in sw.js (and bump VERSION):\n' + missing.map(f => "  './" + f + "',").join('\n'));
if (stale.length) problems.push('sw.js CORE lists file(s) that do not exist (install would fail):\n' + stale.map(f => '  ./' + f).join('\n'));
if (problems.length) {
  console.error('FAIL — ' + problems.join('\n\n'));
  process.exit(1);
}
console.log('PASS — sw.js precaches all ' + indexRefs().length + ' index.html scripts/styles and ' + bookDataFiles().length + ' book data files.');
