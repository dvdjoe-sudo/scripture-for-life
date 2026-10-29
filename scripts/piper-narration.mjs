#!/usr/bin/env node
// Offline narration pre-generator using Piper TTS (https://github.com/OHF-Voice/piper1-gpl).
// Turns story episodes (stories/*.md) into mp3 files in narration/ (gitignored). Nothing in the app
// uses these yet: AUDIO_ENABLED stays false in app.js and there is no UI change. See docs/BUILD-TOOLS.md.
//
// Setup (once):  pip install piper-tts        (ffmpeg must also be installed)
//                python3 -m piper.download_voices en_US-lessac-medium --data-dir .piper-voices
// Usage:         node scripts/piper-narration.mjs [--voice .piper-voices/en_US-lessac-medium.onnx]
//                       [--only amos-episode-1] [--out narration] [--force]
import { readdirSync, readFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, basename } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const voice = opt('--voice', '.piper-voices/en_US-lessac-medium.onnx');
const only = opt('--only', '');
const out = opt('--out', 'narration');
const force = args.includes('--force');

for (const [bin, hint] of [['piper', 'pip install piper-tts'], ['ffmpeg', 'install ffmpeg']]) {
  if (spawnSync(bin, ['--help'], { stdio: 'ignore' }).error) { console.error(`${bin} not found (${hint}).`); process.exit(1); }
}
if (!existsSync(voice)) { console.error(`Voice model not found: ${voice}. See setup in this file.`); process.exit(1); }
mkdirSync(out, { recursive: true });

// Plain narration text: title line, then paragraphs; the source line ("Amos 1-2, Berean Standard Bible") is kept.
const toText = (md) => md.replace(/^#+\s*/gm, '').replace(/[*_`]/g, '').replace(/\n{3,}/g, '\n\n').trim();

const files = readdirSync('stories').filter((f) => f.endsWith('.md') && (!only || f === `${only}.md`)).sort();
if (!files.length) { console.error('No matching stories.'); process.exit(1); }
let made = 0;
for (const f of files) {
  const name = basename(f, '.md');
  const mp3 = join(out, `${name}.mp3`);
  if (existsSync(mp3) && !force) { console.log(`skip ${mp3} (exists)`); continue; }
  const wav = join(out, `${name}.wav`);
  const p = spawnSync('piper', ['--model', voice, '--output_file', wav, '--sentence_silence', '0.35'],
    { input: toText(readFileSync(join('stories', f), 'utf8')), stdio: ['pipe', 'ignore', 'inherit'] });
  if (p.status !== 0) { console.error(`piper failed on ${f}`); process.exit(1); }
  const e = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '64k', mp3], { stdio: 'inherit' });
  rmSync(wav, { force: true });
  if (e.status !== 0) { console.error(`ffmpeg failed on ${f}`); process.exit(1); }
  console.log(`wrote ${mp3}`); made++;
}
console.log(`Done: ${made} new mp3 file(s) in ${out}/.`);
