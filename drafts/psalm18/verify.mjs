import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

// Partial editorial/asset checkpoint only. This does not certify chapter publication.
const bible=JSON.parse(fs.readFileSync('data/bible.json','utf8')).books;
const source=JSON.parse(fs.readFileSync('drafts/psalm18/source.json','utf8'));
const draft=JSON.parse(fs.readFileSync('drafts/psalm18/verses-1-10.json','utf8'));
const prompts=JSON.parse(fs.readFileSync('assets/psalm18/generation-prompts.json','utf8'));
assert.equal(source.chapter,18);assert.equal(source.verses.length,50);
assert.deepEqual(source.verses,bible[18].chapters[17],'Snapshot must exactly match all fifty bundled BSB verses');
assert(source.verses[0][1].includes('For the choirmaster. Of David the servant of the LORD'));
assert(source.verses[0][1].includes('from the hand of Saul. He said:'));
assert.equal(draft.status,'unpublished partial editorial draft');
assert.deepEqual(draft.completedRange,[1,10]);assert.deepEqual(draft.remainingRange,[11,50]);
assert.equal(draft.verses.length,10);assert.equal(prompts.paintings.length,10);
assert.equal(prompts.styleReference,'assets/psalm23/verse-2-watercolor.webp');
const hashSet=new Set(),originals=new Set();
const checkRef=ref=>{const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m,ref);assert(bible.find(b=>b.name===m[1])?.chapters[+m[2]-1]?.some(([n])=>n===+m[3]),ref);};
for(const [i,row] of draft.verses.entries()){
 const n=i+1;assert.equal(row.verse,n);
 assert(row.meaning.length>300&&row.context.length>140&&row.reflect.length>50&&row.explore.length>=2,'Substantive individual notes '+n);
 row.related.forEach(checkRef);
 assert.equal(row.art,`assets/psalm18/verse-${n}-watercolor.webp`);
 const img=fs.readFileSync(row.art);assert(img.length>50000);assert.equal(img.subarray(8,12).toString(),'WEBP');
 hashSet.add(crypto.createHash('sha256').update(img).digest('hex'));
 const prompt=prompts.paintings.find(p=>p.verse===n);assert(prompt);
 assert.equal(prompt.status,'generated and visually inspected');assert.equal(prompt.production,row.art);
 assert(prompt.prompt.length>500&&prompt.generatedOriginal.endsWith('.png'));
 originals.add(prompt.generatedOriginal);
}
assert.equal(hashSet.size,10,'Ten distinct production paintings');assert.equal(originals.size,10,'Ten separate selected generations');
assert.equal(new Set(draft.verses.map(v=>v.meaning)).size,10);assert.equal(new Set(draft.verses.map(v=>v.context)).size,10);
const ctx={window:{}};for(const file of ['data.js','content.js','exodus-people.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx);
for(const p of draft.peoplePlan){checkRef(p.ref);assert(ctx.window.PEOPLE.some(x=>x.id===p.id));}
for(const [id,refs] of Object.entries(draft.topicPlan)){assert(ctx.window.BIBLE_DATA.topics.some(t=>t.id===id));refs.forEach(checkRef);}
assert(!fs.existsSync('psalm18.js'),'Partial draft must not become a live registered module');
assert(!fs.readFileSync('index.html','utf8').includes('psalm18.js'));
assert(!fs.readFileSync('sw.js','utf8').includes('assets/psalm18/'));
assert(!/^\|\s*18\s*\|/m.test(fs.readFileSync('PSALMS_ROLLOUT.md','utf8')),'Do not mark fifty-verse chapter complete');
console.log('PASS — UNPUBLISHED Psalm 18 draft: exact 50-verse source snapshot; verses 1–10 individual notes, references and ten inspected paintings. Verses 11–50 and full integration/mobile/Android completion remain pending.');
