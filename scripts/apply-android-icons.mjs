#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'resources', 'android');
const res = path.join(root, 'android', 'app', 'src', 'main', 'res');
if (!fs.existsSync(src)) {
  console.error('Missing resources/android. Run: node scripts/generate-android-icons.mjs');
  process.exit(1);
}
if (!fs.existsSync(res)) {
  console.error('android/ project not found. Run npx cap add android first.');
  process.exit(1);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, ent.name), b = path.join(to, ent.name);
    if (ent.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}
copyDir(src, res);
console.log('Applied launcher icons from resources/android into android/app/src/main/res');
