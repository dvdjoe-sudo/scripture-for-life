#!/usr/bin/env node
// Adds Gradle Play Publisher (com.github.triplet.play) and release signing to the generated
// android/ project. android/ is created in CI by `npx cap add android`, so this runs after that.
// Nothing here uploads anything; uploading happens only in the manual "Publish to Google Play" workflow.
// Env read by Gradle at build time (all optional for configuration):
//   PLAY_CREDENTIALS_PATH  path to the Play service-account JSON key
//   PLAY_TRACK             internal | alpha | beta | production (default internal)
//   PLAY_VERSION_CODE      integer versionCode (must increase for every upload)
//   UPLOAD_KEYSTORE_PATH, UPLOAD_KEYSTORE_PASSWORD, UPLOAD_KEY_ALIAS, UPLOAD_KEY_PASSWORD
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const GPP_VERSION = '3.12.1';
const root = 'android/build.gradle';
const app = 'android/app/build.gradle';
if (!existsSync(root) || !existsSync(app)) {
  console.error('android/ project not found. Run `npx cap add android` first.');
  process.exit(1);
}

let r = readFileSync(root, 'utf8');
if (!r.includes('play-publisher')) {
  r = r.replace(/buildscript\s*\{([\s\S]*?)repositories\s*\{/, (m) => `${m}\n        gradlePluginPortal()`);
  r = r.replace(/(classpath\s+['"]com\.android\.tools\.build:gradle:[^'"]+['"])/, `$1\n        classpath 'com.github.triplet.gradle:play-publisher:${GPP_VERSION}'`);
  if (!r.includes('play-publisher')) throw new Error('Could not add the play-publisher classpath to android/build.gradle');
  writeFileSync(root, r);
}

let a = readFileSync(app, 'utf8');
if (!a.includes('com.github.triplet.play')) {
  a += `
// ---- Added by scripts/android-play-publisher.mjs ----
apply plugin: 'com.github.triplet.play'

android {
    defaultConfig {
        if (System.getenv('PLAY_VERSION_CODE')) {
            versionCode Integer.parseInt(System.getenv('PLAY_VERSION_CODE'))
        }
    }
    if (System.getenv('UPLOAD_KEYSTORE_PATH')) {
        signingConfigs {
            upload {
                storeFile file(System.getenv('UPLOAD_KEYSTORE_PATH'))
                storePassword System.getenv('UPLOAD_KEYSTORE_PASSWORD')
                keyAlias System.getenv('UPLOAD_KEY_ALIAS')
                keyPassword System.getenv('UPLOAD_KEY_PASSWORD')
            }
        }
        buildTypes { release { signingConfig signingConfigs.upload } }
    }
}

play {
    if (System.getenv('PLAY_CREDENTIALS_PATH')) {
        serviceAccountCredentials.set(file(System.getenv('PLAY_CREDENTIALS_PATH')))
    }
    track.set(System.getenv('PLAY_TRACK') ?: 'internal')
    defaultToAppBundles.set(true)
    releaseStatus.set(com.github.triplet.gradle.androidpublisher.ReleaseStatus.DRAFT)
}
`;
  writeFileSync(app, a);
}
console.log(`Gradle Play Publisher ${GPP_VERSION} configured for android/.`);
