import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webDir = path.join(root, 'www');

// The live website loads scripts and styles from the repository root.
// Capacitor must receive those exact files, not a legacy assets/app.js copy.
const entries = [
  'index.html', 'app.js', 'styles.css', 'genesis.js', 'genesis-people.js', 'exodus.js', 'exodus-people.js', 'leviticus.js', 'numbers.js', 'deuteronomy.js', 'joshua.js', 'joshua-people.js', 'judges.js', 'judges-people.js', 'ruth.js', 'ruth-people.js', 'genesis.css',
  'psalm-walk.js', 'psalm-walk.css', 'psalm46.js',
  'psalm-art.js', 'psalm-art.css', 'psalm-navigation.js',
  'psalms-content.js', 'psalms-book.js', 'psalms-book.css',
  'psalm-verse-study.js', 'psalm-verse-study.css', 'psalm1.js', 'psalms-2-3.js', 'psalm4.js', 'psalm5.js', 'psalm6.js', 'psalms-7-8.js', 'psalm9.js', 'psalm10.js', 'psalms-11-12.js', 'psalms-13-15.js', 'topic-connections.js',
  'psalm16.js', 'psalm17.js', 'psalm18.js', 'psalm19.js', 'psalm20.js', 'psalm21.js', 'psalm22.js', 'psalm24.js', 'psalm25.js', 'psalm26.js', 'psalm27.js', 'samuel1.js', 'samuel1-people.js', 'samuel2.js', 'samuel2-people.js', 'kings1.js', 'kings1-people.js', 'data.js', 'content.js', 'icon.svg', 'manifest.webmanifest', 'sw.js',
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
