#!/usr/bin/env node
/* APK readiness checks: refs, search, blank verses, books/chapters, emotions, stories, psalms. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = 8877;
const base = `http://127.0.0.1:${port}/`;
const failures = [];
function check(label, fn) {
  try { fn(); process.stdout.write(`  ok  ${label}\n`); }
  catch (e) { failures.push(`${label}: ${e.message}`); process.stdout.write(`  FAIL ${label}: ${e.message}\n`); }
}
async function checkAsync(label, fn) {
  try { await fn(); process.stdout.write(`  ok  ${label}\n`); }
  catch (e) { failures.push(`${label}: ${e.message}`); process.stdout.write(`  FAIL ${label}: ${e.message}\n`); }
}

const bible = JSON.parse(fs.readFileSync(path.join(root, 'data/bible.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
check('package.json version is 0.7.0', () => assert.equal(pkg.version, '0.7.0'));
check('android:config script exists', () => assert.ok(fs.existsSync(path.join(root, 'scripts/android-project-config.mjs'))));
const apkWf = fs.readFileSync(path.join(root, '.github/workflows/android-apk.yml'), 'utf8');
check('android-apk runs on main', () => assert.match(apkWf, /branches:[\s\S]*main/));
check('android-apk has workflow_dispatch', () => assert.match(apkWf, /workflow_dispatch/));
check('android-apk installs SDK 36', () => assert.match(apkWf, /platforms;android-36/));
check('android-apk calls android:config', () => assert.match(apkWf, /android:config/));
const playWf = fs.readFileSync(path.join(root, '.github/workflows/play-publish.yml'), 'utf8');
check('play-publish installs SDK 36', () => assert.match(playWf, /platforms;android-36/));
check('play-publish calls android:config', () => assert.match(playWf, /android:config/));
const appSrc = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
check('no Psalm 23 silent fallback in refURL', () => assert.ok(!/refURL\(ref\)\{[^}]*#\/read\/19\/23/.test(appSrc.replace(/\n/g,' '))));
check('omitted-manuscript footnote present', () => assert.match(appSrc, /Omitted in earliest manuscripts/));

const blanks = [];
bible.books.forEach((book, bi) => {
  book.chapters.forEach((verses, ci) => {
    for (const [v, text] of verses) {
      if (!String(text ?? '').trim()) blanks.push({ bookId: bi + 1, name: book.name, ch: ci + 1, v: String(v) });
    }
  });
});
check('BSB has blank verse slots to footnote', () => assert.ok(blanks.length >= 1, 'expected blank BSB slots'));

const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', root], { stdio: 'ignore' });
async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(base); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('server did not start');
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto(base + '#/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.APP_TEST && window.BIBLE_DATA && window.PEOPLE, null, { timeout: 20000 });

  const parseCases = [
    ['Genesis 2:21-22', 'Genesis', 2, 21],
    ['Genesis 4:1-2, 25', 'Genesis', 4, 1],
    ['Isaiah 44:28-45:1', 'Isaiah', 44, 28],
    ['Philemon 1:15-16', 'Philemon', 1, 15],
    ['Ps. 23:4', 'Psalm', 23, 4],
    ['Ps 23', 'Psalm', 23, null],
    ['Ps. 23', 'Psalm', 23, null],
    ['Matthew 27:3-5; Acts 1:20-26', 'Matthew', 27, 3],
    ['Acts 13:5, 13', 'Acts', 13, 5],
    ['1 Kings 16:30-33', '1 Kings', 16, 30],
    ['Psalm 23:1', 'Psalm', 23, 1],
  ];
  for (const [raw, book, ch, verse] of parseCases) {
    await checkAsync(`parseReference(${JSON.stringify(raw)})`, async () => {
      const p = await page.evaluate(r => {
        const x = window.APP_TEST.parseReference(r);
        return x && { book: x.book.name, ch: x.ch, verse: x.verse };
      }, raw);
      assert.ok(p, 'returned null');
      assert.equal(p.book, book);
      assert.equal(p.ch, ch);
      assert.equal(p.verse, verse);
    });
    await checkAsync(`refURL(${JSON.stringify(raw)})`, async () => {
      const url = await page.evaluate(r => window.APP_TEST.refURL(r), raw);
      assert.ok(url.startsWith('#/read/'), url);
      const isRealPs23 = book === 'Psalm' && ch === 23;
      if (!isRealPs23) assert.notEqual(url, '#/read/19/23', 'silent Psalm 23 fallback');
      const p = await page.evaluate(r => {
        const x = window.APP_TEST.parseReference(r);
        return x && { id: x.book.id, ch: x.ch, verse: x.verse };
      }, raw);
      const expect = `#/read/${p.id}/${p.ch}${p.verse ? '/' + p.verse : ''}`;
      assert.equal(url, expect);
    });
  }
  await checkAsync('refURL(garbage) is #/ not Psalm 23', async () => {
    const url = await page.evaluate(() => window.APP_TEST.refURL('NotABook 99:1'));
    assert.equal(url, '#/');
  });

  await checkAsync("'thank' matches Gratitude topic", async () => {
    const titles = await page.evaluate(() => window.APP_TEST.searchTopics('thank').map(t => t.title));
    assert.ok(titles.some(t => /gratitude/i.test(t)), JSON.stringify(titles));
  });
  await checkAsync("'fear' still matches", async () => {
    const titles = await page.evaluate(() => window.APP_TEST.searchTopics('fear').map(t => t.title));
    assert.ok(titles.length >= 1, JSON.stringify(titles));
  });

  // All people step refs
  const peopleRefs = await page.evaluate(() => {
    const out = [];
    for (const p of window.PEOPLE) {
      for (const step of (p.steps || [])) {
        out.push({ person: p.id, ref: step[2] });
      }
    }
    return out;
  });
  check(`people ref inventory (${peopleRefs.length})`, () => assert.ok(peopleRefs.length >= 500, `expected ~575, got ${peopleRefs.length}`));
  let peopleFail = 0;
  const peopleFailSamples = [];
  for (const { person, ref } of peopleRefs) {
    const result = await page.evaluate(r => {
      const p = window.APP_TEST.parseReference(r);
      const url = window.APP_TEST.refURL(r);
      return {
        ok: !!(p && url.startsWith('#/read/') && url !== '#/'),
        url,
        book: p?.book?.name,
        ch: p?.ch,
        verse: p?.verse,
      };
    }, ref);
    if (!result.ok || result.url === '#/read/19/23' && !(result.book === 'Psalm' && result.ch === 23)) {
      // Allow real Psalm 23 refs
      const isRealPs23 = result.book === 'Psalm' && result.ch === 23;
      if (!result.ok || (!isRealPs23 && result.url === '#/read/19/23')) {
        peopleFail++;
        if (peopleFailSamples.length < 15) peopleFailSamples.push(`${person}: ${ref} -> ${result.url}`);
      }
    }
  }
  check(`all people refs resolve (${peopleRefs.length - peopleFail}/${peopleRefs.length})`, () => {
    assert.equal(peopleFail, 0, peopleFailSamples.join(' | '));
  });

  // Emotions / topics
  const topics = await page.evaluate(() => window.BIBLE_DATA.topics.map(t => ({ title: t.title, tags: t.tags })));
  check('eight emotion/help topics', () => assert.equal(topics.length, 8));
  for (const t of topics) {
    await checkAsync(`topic tag search: ${t.title}`, async () => {
      const tag = t.tags[0];
      const hits = await page.evaluate(q => window.APP_TEST.searchTopics(q).map(x => x.title), tag);
      assert.ok(hits.includes(t.title), JSON.stringify(hits));
    });
  }

  // All 66 books / chapters load; sample verses present
  const index = await page.evaluate(() => window.BIBLE_DATA.index);
  check('66 books in index', () => assert.equal(index.length, 66));
  let chapterFails = 0;
  const chapterFailSamples = [];
  for (const book of index) {
    await checkAsync(`loadBook ${book.name}`, async () => {
      const ok = await page.evaluate(async id => {
        const b = await window.APP_TEST.loadBook(id);
        return b && Object.keys(b).length > 0;
      }, book.id);
      assert.ok(ok);
    });
    // Every chapter key exists
    const missing = await page.evaluate(({ id, chapters }) => {
      const b = window.APP_TEST /* bookCache via loadBook sync after await */;
      return null;
    }, book);
  }
  // Verify every chapter after books loaded
  await checkAsync('every book has every chapter with >=1 verse', async () => {
    const report = await page.evaluate(async () => {
      const bad = [];
      for (const info of window.BIBLE_DATA.index) {
        const book = await window.APP_TEST.loadBook(info.id);
        for (let ch = 1; ch <= info.chapters; ch++) {
          const verses = book[ch];
          if (!verses || !Object.keys(verses).length) bad.push(`${info.name} ${ch}`);
        }
      }
      return bad;
    });
    assert.equal(report.length, 0, report.slice(0, 10).join(', '));
  });

  // Blank verse footnotes in reader HTML
  for (const b of blanks.slice(0, 5)) {
    await checkAsync(`blank footnote ${b.name} ${b.ch}:${b.v}`, async () => {
      const html = await page.evaluate(async ({ bookId, ch }) => {
        const book = await window.APP_TEST.loadBook(bookId);
        return window.APP_TEST.readerPage(bookId, ch, 0, book);
      }, b);
      assert.match(html, /Omitted in earliest manuscripts/);
      assert.match(html, new RegExp(`id="verse-${b.v}"[\\s\\S]*?verse-omitted`));
    });
  }

  // Stories: Genesis episodes reachable via APP or DOM
  await page.goto(base + '#/stories', { waitUntil: 'domcontentloaded' });
  await checkAsync('stories landing has Genesis episodes', async () => {
    await page.waitForSelector('.gen-episode-tile', { timeout: 15000 });
    const n = await page.locator('.gen-episode-tile').count();
    assert.ok(n >= 12, `got ${n}`);
  });

  // Psalms: all 150 chapters in content + sample illustrated pages
  await checkAsync('psalms content has 150 chapters', async () => {
    const n = await page.evaluate(() => window.SFL_PSALMS_CONTENT?.chapters?.length || 0);
    assert.equal(n, 150);
  });
  for (const n of [1, 23, 46, 150]) {
    await page.goto(base + `#/psalms/${n}`, { waitUntil: 'domcontentloaded' });
    await checkAsync(`Psalm ${n} page loads`, async () => {
      await page.waitForFunction((num) => {
        const t = document.body?.innerText || '';
        return new RegExp('Psalm\\s*' + num, 'i').test(t) || document.querySelector('.psalm-chapter-verse, .study-verse, [data-psalm-switch]');
      }, n, { timeout: 15000 });
      const text = await page.locator('body').innerText();
      assert.match(text, new RegExp(String.raw`Psalm\s*` + n, 'i'));
      const sel = await page.locator('[data-psalm-switch], .psalm-chapter-verse, .study-verse, .psalm-chapter-pager').count();
      assert.ok(sel >= 1, 'missing psalm UI');
    });
  }

  // Search UI edge: Ps. 23:4
  await page.goto(base + '#/search?q=' + encodeURIComponent('Ps. 23:4'), { waitUntil: 'domcontentloaded' });
  await checkAsync('search page handles Ps. 23:4', async () => {
    await page.waitForTimeout(500);
    const body = await page.locator('#main, main, body').first().innerText();
    // Either navigates to read or shows results — must not crash
    assert.equal(pageErrors.length, 0, pageErrors.join('; '));
    assert.ok(body.length > 20);
  });

  check('no page errors during readiness', () => assert.equal(pageErrors.length, 0, pageErrors.join('; ')));
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}

if (failures.length) {
  console.error(`\n${failures.length} readiness check(s) failed`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('\nAll readiness checks passed.');
