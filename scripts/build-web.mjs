import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webDir = path.join(root, 'www');

// The live website loads scripts and styles from the repository root.
// Capacitor must receive those exact files, not a legacy assets/app.js copy.
const entries = [
  'index.html', 'app.js', 'styles.css', 'genesis.js', 'genesis.css',
  'psalm-walk.js', 'psalm-walk.css', 'psalm46.js',
  'psalm-art.js', 'psalm-art.css', 'psalm-navigation.js',
  'psalms-content.js', 'psalms-book.js', 'psalms-book.css',
  'data.js', 'content.js', 'icon.svg', 'manifest.webmanifest', 'sw.js',
  'assets', 'data'
];

for (const entry of entries) {
  if (!fs.existsSync(path.join(root, entry))) {
    throw new Error('Missing required site file: ' + entry);
  }
}

fs.rmSync(webDir, { recursive: true, force: true });
fs.mkdirSync(webDir, { recursive: true });
for (const entry of entries) {
  fs.cpSync(path.join(root, entry), path.join(webDir, entry), { recursive: true });
}
console.log('Built Android web bundle: ' + webDir);
