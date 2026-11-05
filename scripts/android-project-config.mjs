#!/usr/bin/env node
// Patches the generated android/ project (created by `npx cap add android`) so
// committed version + SDK targets + launcher icons apply. android/ is gitignored.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const VERSION_NAME = '0.6.0';
const VERSION_CODE = 2;
const SDK = 36;

const varsPath = 'android/variables.gradle';
const appPath = 'android/app/build.gradle';
if (!existsSync(varsPath) || !existsSync(appPath)) {
  console.error('android/ project not found. Run `npx cap add android` first.');
  process.exit(1);
}

let vars = readFileSync(varsPath, 'utf8');
if (!/compileSdkVersion\s*=/.test(vars) || !/targetSdkVersion\s*=/.test(vars)) {
  throw new Error('Unexpected android/variables.gradle (missing SDK fields)');
}
vars = vars.replace(/compileSdkVersion\s*=\s*\d+/, `compileSdkVersion = ${SDK}`);
vars = vars.replace(/targetSdkVersion\s*=\s*\d+/, `targetSdkVersion = ${SDK}`);
writeFileSync(varsPath, vars);

let app = readFileSync(appPath, 'utf8');
if (!/versionCode\s+\d+/.test(app) || !/versionName\s+"[^"]+"/.test(app)) {
  throw new Error('Unexpected android/app/build.gradle (missing version fields)');
}
app = app.replace(/versionCode\s+\d+/, `versionCode ${VERSION_CODE}`);
app = app.replace(/versionName\s+"[^"]+"/, `versionName "${VERSION_NAME}"`);
writeFileSync(appPath, app);

console.log(`Android project configured: compile/targetSdk ${SDK}, versionName ${VERSION_NAME}, versionCode ${VERSION_CODE}`);

const icons = spawnSync(process.execPath, ['scripts/apply-android-icons.mjs'], { stdio: 'inherit' });
if (icons.status) process.exit(icons.status);
