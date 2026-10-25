// Builds data/story-index.json: a small list of every story episode (book, title, description, route) for the unified search.
// Run: node scripts/gen-story-index.mjs (npm run check verifies it is current).
import fs from 'node:fs';
const html = fs.readFileSync('index.html', 'utf8');
const lazy = JSON.parse(html.match(/<script id="sfl-lazy-books" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const out = [];
for (const route of Object.keys(lazy)) {
  if (route === 'journey') continue;
  const file = route === 'stories' ? 'data/episodes.json' : `data/${route}-episodes.json`;
  if (!fs.existsSync(file)) continue;
  for (const e of JSON.parse(fs.readFileSync(file, 'utf8'))) out.push({ r: `#/${route}/${e.id}/1`, b: e.book || 'Genesis', t: e.title, d: e.description || '' });
}
const json = JSON.stringify(out);
if (process.argv.includes('--check')) { if (fs.readFileSync('data/story-index.json', 'utf8') !== json) { console.error('data/story-index.json is stale: run node scripts/gen-story-index.mjs'); process.exit(1); } console.log('PASS — story index current: ' + out.length + ' episodes.'); }
else { fs.writeFileSync('data/story-index.json', json); console.log('story-index.json: ' + out.length + ' episodes, ' + json.length + ' bytes'); }
