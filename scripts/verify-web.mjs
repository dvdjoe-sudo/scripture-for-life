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
  'app.js', 'genesis.js', 'psalm-walk.js', 'psalm46.js', 'data.js', 'content.js',
  'study-trail.js', 'study-trail.css', 'psalm-navigation.js',
  'styles.css', 'genesis.css', 'psalm-walk.css', 'icon.svg',
  'data/bible.json', 'data/episodes.json', 'data/story-scenes.json',
  'manifest.webmanifest', 'sw.js'
];
for (const item of required) localFile(www, item, 'Android web bundle');

// Verify actual index.html links (the old build copied different legacy filenames).
for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["']/g)) {
  const uri = match[1].split(/[?#]/)[0];
  if (!uri || uri.startsWith('http:') || uri.startsWith('https:') || uri.startsWith('data:')) continue;
  localFile(www, uri, 'index.html reference');
}
assert(/rel=["']manifest["']/.test(html), 'Website must link to the app manifest');
assert(/serviceWorker\.register/.test(html), 'Offline service worker is not registered');
assert(app.includes("scene(0,'home')"), 'Original Psalm 23 art was altered/removed');
assert(app.includes('gen-home-cards'), 'Genesis home navigation is missing');
assert(app.includes("parts[0]==='stories'"), 'Story route is missing');
assert(story.includes('function scenePage('), 'Genesis story engine is missing');
assert(app.includes("parts[0]==='walk'"), 'Psalm walk route is missing');
assert(app.includes('<a class="btn light" href="#/study/23/1">Begin the journey'), 'Original Psalm study is not the homepage default');
assert(app.includes('href="#/walk/23/${window.SFL_PSALM_WALK.progress()}"'), 'Optional illustrated walk is missing from homepage');
assert(app.includes('href="#/walk/23/'), 'Psalm walk homepage and/or deep links are missing');
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
