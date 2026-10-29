// Phone-sized (390x844) screenshots of key pages, light and dark, into screenshots/ (gitignored).
// CI uploads them as the "phone-screenshots" artifact on every PR so layout changes can be eyeballed.
//   npm run screenshots
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'screenshots'), port = 8897, base = `http://127.0.0.1:${port}/`;
const pages = [['home', '#/'], ['topic-fear', '#/help/fear'], ['stories', '#/books'], ['story-scene', '#/stories/1/1'],
  ['psalm-23', '#/psalms/23'], ['psalm-study', '#/study/23/1'], ['reader', '#/read/43/3'], ['search', '#/search/moses'], ['favorites', '#/favorites']];
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', root], { stdio: 'ignore' });
try {
  for (let i = 0; i < 50; i++) { try { await fetch(base); break; } catch { await new Promise(r => setTimeout(r, 200)); } }
  const browser = await chromium.launch();
  for (const dark of [false, true]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2, serviceWorkers: 'block' });
    if (dark) await ctx.addInitScript(() => localStorage.setItem('scripture-for-life.theme', 'dark'));
    const page = await ctx.newPage();
    for (const [name, hash] of pages) {
      await page.goto(base + hash); await page.waitForLoadState('networkidle'); await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(out, `${name}${dark ? '-dark' : ''}.png`) });
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`Saved ${pages.length * 2} phone screenshots (390px) to screenshots/`);
} finally { server.kill(); }
