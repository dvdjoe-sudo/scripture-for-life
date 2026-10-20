import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const www = path.join(root, 'www');
function assert(ok, message) { if (!ok) throw new Error(message); }
function read(base, relative) {
  const full = path.join(base, relative);
  assert(fs.existsSync(full), 'Missing: ' + full);
  return fs.readFileSync(full, 'utf8');
}
function localFile(base, relative, label) {
  assert(!relative.startsWith('../') && !relative.startsWith('/'),
    'Unsafe path in ' + label + ': ' + relative);
  assert(fs.existsSync(path.join(base, relative)), label + ' missing: ' + relative);
}
assert(fs.existsSync(www), 'Build first with npm run build');
const html = read(www, 'index.html');
const css = read(www, 'styles.css');
const storyCss = read(www, 'genesis.css');
const app = read(www, 'app.js');
const story = read(www, 'genesis.js');
const psalmWalk = read(www, 'psalm-walk.js');
const psalmCss = read(www, 'psalm-walk.css');
const required = [
  'app.js', 'genesis.js', 'exodus.js', 'exodus-people.js', 'psalm-walk.js', 'psalm46.js', 'data.js', 'content.js',
  'psalm-art.js', 'psalm-art.css', 'psalm-navigation.js',
  'psalms-content.js', 'psalms-book.js', 'psalms-book.css',
  'psalm-verse-study.js', 'psalm-verse-study.css', 'psalm1.js', 'psalms-2-3.js', 'psalm4.js', 'psalm5.js', 'psalm6.js', 'psalms-7-8.js', 'psalm9.js', 'topic-connections.js',
  'styles.css', 'genesis.css', 'psalm-walk.css', 'icon.svg',
  'data/bible.json', 'data/episodes.json', 'data/story-scenes.json', 'data/exodus-episodes.json', 'data/exodus-scenes.json',
  'manifest.webmanifest', 'sw.js'
];
for (const item of required) localFile(www, item, 'Android web bundle');
// Preserve the concurrently authored renderer and story data verbatim in packaging.
for (const item of ['genesis.js', 'genesis-people.js', 'exodus.js', 'exodus-people.js', 'deuteronomy.js', 'data/deuteronomy-episodes.json', 'data/deuteronomy-scenes.json', 'joshua.js', 'joshua-people.js', 'data/joshua-episodes.json', 'data/joshua-scenes.json', 'judges.js', 'judges-people.js', 'data/judges-episodes.json', 'data/judges-scenes.json']) {
  assert(read(root, item) === read(www, item), 'Story asset differs in Android bundle: ' + item);
}

// Verify actual index.html links (the old build copied different legacy filenames).
for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["']/g)) {
  const uri = match[1].split(/[?#]/)[0];
  if (!uri || uri.startsWith('http:') || uri.startsWith('https:') || uri.startsWith('data:')) continue;
  localFile(www, uri, 'index.html reference');
}
// A later integration must not leave completed study data on disk but stop loading it.
const scriptSources = Array.from(html.matchAll(/<script\b[^>]*src=["']([^"']+)["']/g), m => m[1].split(/[?#]/)[0]);
for (const file of fs.readdirSync(root).filter(name => name.endsWith('.js'))) {
  if (!read(root, file).includes('window.SFL_VERSE_STUDIES.register(')) continue;
  const position = scriptSources.indexOf(file);
  assert(position !== -1, 'Completed verse study is not loaded by index.html: ' + file);
  assert(position > scriptSources.indexOf('psalm-verse-study.js') && position < scriptSources.indexOf('app.js'),
    'Verse study must load after its engine and before the app: ' + file);
  assert(read(root, file) === read(www, file), 'Verse study differs in Android bundle: ' + file);
}
assert(/rel=["']manifest["']/.test(html), 'Website must link to the app manifest');
assert(/serviceWorker\.register/.test(html), 'Offline service worker is not registered');
assert(app.includes("scene(0,'home')"), 'Original Psalm 23 art was altered/removed');
assert(app.includes('gen-home-cards'), 'Genesis home navigation is missing');
assert(app.includes("parts[0]==='stories'"), 'Story route is missing');
assert(story.includes('function scenePage('), 'Genesis story engine is missing');
assert(app.includes("parts[0]==='walk'"), 'Psalm walk route is missing');
assert(app.includes('<a class="btn light" href="#/study/23/1">Read Psalm 23'), 'Original Psalm study is not the homepage default');
assert(psalmWalk.includes('window.SFL_PSALM_WALK='), 'Psalm walk engine is missing');
assert(psalmWalk.includes('var titles=[') && psalmWalk.includes('Goodness and Mercy'), 'All six Psalm scenes must be present');
assert(psalmWalk.includes('ctx.verses[ref]'), 'Psalm text must come from the existing Bible data');
assert(psalmWalk.includes('EDITORIAL EXPLANATION'), 'Scripture/commentary separation is missing');
assert(psalmCss.includes('.pw-landscape'), 'Psalm walkthrough styles are missing');
assert(html.includes('src="psalm-walk.js"') && html.includes('href="psalm-walk.css"'), 'Psalm walkthrough assets are not loaded');
assert(css.includes('.hero-art'), 'Original home artwork styles missing');
assert(storyCss.includes('.gen-home-cards'), 'Genesis card layout styles missing');

const manifest = JSON.parse(read(www, 'manifest.webmanifest'));
assert(manifest.start_url.includes('#/'), 'Manifest must open the actual home route');
for (const item of manifest.icons || []) localFile(www, item.src, 'manifest icon');
const config = JSON.parse(read(root, 'capacitor.config.json'));
assert(config.webDir === 'www', 'Capacitor webDir does not match bundled folder');
assert(!config.appId.startsWith('com.example.'), 'Replace example Android app ID');

const episodes = JSON.parse(read(www, 'data/episodes.json'));
const scenes = JSON.parse(read(www, 'data/story-scenes.json'));
assert(episodes.length === 12, 'Expected Genesis Episodes 1–12');
let sceneCount = 0;
for (const ep of episodes) {
  const group = scenes[String(ep.id)];
  assert(Array.isArray(group) && group.length, 'Missing scenes for ' + ep.title);
  let nextParagraph = 0;
  for (const scene of group) {
    assert(scene.start === nextParagraph, 'Paragraph gap or overlap: ' + ep.title);
    assert(scene.end >= scene.start && scene.end < ep.paragraphs.length, 'Bad range: ' + ep.title);
    nextParagraph = scene.end + 1;
    sceneCount++;
  }
  assert(nextParagraph === ep.paragraphs.length, 'Missing story paragraphs: ' + ep.title);
  // The uploaded episode manuscript is archived unchanged; every narrative paragraph must match.
  if (Number(ep.id) >= 4) {
    const source = read(root, 'stories/genesis-episode-' + ep.id + '.md').replace(/\r\n/g, '\n').trimEnd();
    const paragraphText = source.split('\n').slice(2).join('\n').trim().split(/\n\s*\n/).map(p => p.trim());
    assert(JSON.stringify(paragraphText) === JSON.stringify(ep.paragraphs),
      'Story narrative differs from original uploaded manuscript: ' + ep.title);
  }
}
assert(sceneCount === 92, 'Expected 92 Genesis scenes');
const offline = read(www, 'sw.js');
for (const pathName of required.filter(v=>!['manifest.webmanifest','sw.js'].includes(v))) {
  // Offline shell covers essential functional files, even if other illustrations load on demand.
  if (!pathName.startsWith('data/') || pathName.endsWith('/bible.json')) {
    assert(offline.includes(pathName), 'Offline shell does not precache ' + pathName);
  }
}
console.log('PASS — Web and Android assets agree; 12 Genesis episodes, ' + sceneCount + ' scenes, original home art, icon, manifest and offline shell.');
