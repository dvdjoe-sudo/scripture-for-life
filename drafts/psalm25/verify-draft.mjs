import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const bible=read('data/bible.json').books,source=bible[18].chapters[24],progress=read('drafts/psalm25/progress.json'),manifest=read('assets/psalm25/generation-prompts.json');
assert.deepEqual(read('drafts/psalm25/source.json').verses,source);
assert.equal(source.length,22);assert(source[0][1].startsWith('Of David.'));assert(source[0][1].endsWith(';'));
const rows=progress.groups.flatMap(g=>read('drafts/psalm25/'+g.file).verses);
assert.deepEqual(rows.map(r=>r.verse),[1,2,3,4,5,6,7,8]);
assert.equal(progress.nextVerse,9);assert.deepEqual(progress.pendingArtVerses,manifest.pendingVerses);assert.deepEqual(progress.pendingEditorialVerses,manifest.pendingVerses);
assert.equal(manifest.paintings.length,8);assert.equal(manifest.styleReference,'assets/psalm23/verse-2-watercolor.webp');
const hashes=new Set(),originals=new Set();
for(const key of ['title','heading','meaning','context','reflect','alt'])assert.equal(new Set(rows.map(r=>r[key])).size,8,'Individual '+key);
for(const r of rows){
 assert(r.meaning.length>300&&r.context.length>140&&r.reflect.length>50&&r.explore.length>=2);
 assert(r.explore.every(x=>x.length===2&&x[1].length>50));
 for(const ref of r.related){const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m,ref);assert(bible.find(b=>b.name===m[1])?.chapters[+m[2]-1]?.some(([v,t])=>v===+m[3]&&t),ref);}
 const p=manifest.paintings.find(p=>p.verse===r.verse);assert(p);assert.equal(p.production,r.art);assert.equal(p.status,'generated and visually inspected');assert(p.prompt.length>500&&p.generatedOriginal.endsWith('.png'));originals.add(p.generatedOriginal);
 const bytes=fs.readFileSync(r.art);assert(bytes.length>50000);assert.equal(bytes.subarray(8,12).toString(),'WEBP');hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));
}
assert.equal(hashes.size,8);assert.equal(originals.size,8);
assert(!fs.existsSync('psalm25.js'),'Draft must not register a partial chapter');
assert(!fs.readFileSync('index.html','utf8').includes('src="psalm25.js"'));
console.log('PASS — unpublished Psalm 25 verses 1–8: exact full source snapshot, individual notes, resolvable references, eight distinct art files and recorded prompts; verses 9–22 and full publication gate remain pending.');
