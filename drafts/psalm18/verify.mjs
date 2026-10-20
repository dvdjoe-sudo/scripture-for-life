import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

// Partial editorial/asset checkpoint only. This does not certify chapter publication.
const bible=JSON.parse(fs.readFileSync('data/bible.json','utf8')).books;
const source=JSON.parse(fs.readFileSync('drafts/psalm18/source.json','utf8'));
const draft=JSON.parse(fs.readFileSync('drafts/psalm18/verses-1-10.json','utf8'));
const next=JSON.parse(fs.readFileSync('drafts/psalm18/verses-11-15.json','utf8'));
const rescue=JSON.parse(fs.readFileSync('drafts/psalm18/verses-16-20.json','utf8'));
const conduct=JSON.parse(fs.readFileSync('drafts/psalm18/verses-21-27.json','utf8'));
const strength=JSON.parse(fs.readFileSync('drafts/psalm18/verses-28-34.json','utf8'));
const verses=[...draft.verses,...next.verses,...rescue.verses,...conduct.verses,...strength.verses];
const prompts=JSON.parse(fs.readFileSync('assets/psalm18/generation-prompts.json','utf8'));
assert.equal(source.chapter,18);assert.equal(source.verses.length,50);
assert.deepEqual(source.verses,bible[18].chapters[17],'Snapshot must exactly match all fifty bundled BSB verses');
assert(source.verses[0][1].includes('For the choirmaster. Of David the servant of the LORD'));
assert(source.verses[0][1].includes('from the hand of Saul. He said:'));
assert.equal(draft.status,'unpublished partial editorial draft');
assert.deepEqual(draft.completedRange,[1,10]);assert.deepEqual(draft.remainingRange,[11,50]);
assert.equal(next.status,'unpublished partial editorial draft');
assert.deepEqual(next.completedRange,[11,15]);assert.deepEqual(next.remainingRange,[16,50]);
assert.equal(rescue.status,'unpublished partial editorial draft');
assert.deepEqual(rescue.completedRange,[16,20]);assert.deepEqual(rescue.remainingRange,[21,50]);
assert.equal(conduct.status,'unpublished partial editorial draft');
assert.deepEqual(conduct.completedRange,[21,27]);assert.deepEqual(conduct.remainingRange,[28,50]);
assert.equal(strength.status,'unpublished partial editorial draft');
assert.deepEqual(strength.completedRange,[28,34]);assert.deepEqual(strength.remainingRange,[35,50]);
assert.equal(draft.verses.length,10);assert.equal(next.verses.length,5);assert.equal(rescue.verses.length,5);assert.equal(conduct.verses.length,7);assert.equal(strength.verses.length,7);assert.equal(prompts.paintings.length,34);
assert(prompts.status.includes('verses 1–34')&&prompts.status.includes('verses 35–50 unfinished'));
assert(source.verses[24][1].endsWith(';')&&source.verses[25][1].startsWith('to the pure'),'Preserve the sentence across 25–26');
assert.equal(prompts.styleReference,'assets/psalm23/verse-2-watercolor.webp');
const hashSet=new Set(),originals=new Set();
const checkRef=ref=>{const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m,ref);assert(bible.find(b=>b.name===m[1])?.chapters[+m[2]-1]?.some(([n])=>n===+m[3]),ref);};
for(const [i,row] of verses.entries()){
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
assert.equal(hashSet.size,34,'Thirty-four distinct production paintings');assert.equal(originals.size,34,'Thirty-four separate selected generations');
for(const key of ['title','heading','meaning','context','reflect','alt'])assert.equal(new Set(verses.map(v=>v[key])).size,34,'Individual '+key);
for(const row of verses){
 assert(row.explore.every(x=>Array.isArray(x)&&x.length===2&&x[0].length>2&&x[1].length>50));
 assert(row.related.length>=3&&new Set(row.related).size===row.related.length);
}
const ctx={window:{}};for(const file of ['data.js','content.js','exodus-people.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx);
for(const p of draft.peoplePlan){checkRef(p.ref);assert(ctx.window.PEOPLE.some(x=>x.id===p.id));}
for(const group of [draft,rescue,conduct,strength])for(const [id,refs] of Object.entries(group.topicPlan)){assert(ctx.window.BIBLE_DATA.topics.some(t=>t.id===id));refs.forEach(checkRef);}
assert(!fs.existsSync('psalm18.js'),'Partial draft must not become a live registered module');
assert(!fs.readFileSync('index.html','utf8').includes('psalm18.js'));
assert(!fs.readFileSync('sw.js','utf8').includes('assets/psalm18/'));
assert(!/^\|\s*18\s*\|/m.test(fs.readFileSync('PSALMS_ROLLOUT.md','utf8')),'Do not mark fifty-verse chapter complete');
console.log('PASS — UNPUBLISHED Psalm 18 draft: exact 50-verse source snapshot; verses 1–34 individual notes, references and thirty-four inspected paintings. Verses 35–50 and full integration/mobile/Android completion remain pending.');
