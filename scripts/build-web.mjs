import fs from 'node:fs';
import path from 'node:path';
import { root, indexRefs, EXTRA_FILES, ASSET_DIRS, isExcluded } from './site-files.mjs';

const webDir = path.join(root, 'www');

// The live website loads scripts and styles from the repository root, as listed in index.html.
// Capacitor must receive those exact files, so the bundle is derived from index.html itself:
// add a book's <script> tag to index.html and it is bundled automatically.
const files = [...new Set([...EXTRA_FILES, ...indexRefs()])].filter(f => !isExcluded(f));

const missing = [...files, ...ASSET_DIRS].filter(entry => !fs.existsSync(path.join(root, entry)));
if (missing.length) {
  throw new Error('Missing required site file(s) referenced by index.html or the build: ' + missing.join(', '));
}

fs.rmSync(webDir, { recursive: true, force: true });
fs.mkdirSync(webDir, { recursive: true });
for (const file of files) {
  fs.mkdirSync(path.dirname(path.join(webDir, file)), { recursive: true });
  fs.copyFileSync(path.join(root, file), path.join(webDir, file));
}
let assetCount = 0;
for (const dir of ASSET_DIRS) {
  fs.cpSync(path.join(root, dir), path.join(webDir, dir), {
    recursive: true,
    filter: src => {
      const rel = path.relative(root, src).split(path.sep).join('/');
      if (isExcluded(rel)) return false;
      if (fs.statSync(src).isFile()) assetCount++;
      return true;
    }
  });
}
console.log('Built Android web bundle: ' + webDir + ' (' + files.length + ' files from index.html, ' + assetCount + ' files from ' + ASSET_DIRS.join('/, ') + '/)');
