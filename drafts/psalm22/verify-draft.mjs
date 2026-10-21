import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const bible=read('data/bible.json').books,source=read('drafts/psalm22/source.json'),plan=read('drafts/psalm22/progress.json');
assert.deepEqual(source.verses,bible[18].chapters[21],'Exact entire bundled chapter');
assert.equal(source.verses.length,31);
assert(source.verses[0][1].includes('To the tune of “The Doe of the Dawn.”'));
assert.equal(plan.completedChapter,false,'Partial drafts must not claim chapter completion');
const rows=plan.groups.flatMap(g=>{const d=read('drafts/psalm22/'+g.file);assert.deepEqual(d.range,g.range);assert.equal(d.verses.length,g.range[1]-g.range[0]+1);return d.verses;});
assert.equal(rows.length,plan.nextVerse-1);
assert.deepEqual(rows.map(r=>r.verse),Array.from({length:rows.length},(_,i)=>i+1),'Contiguous editorial checkpoint');
for(const key of ['title','heading','meaning','context','reflect','alt'])assert.equal(new Set(rows.map(r=>r[key])).size,rows.length,'Distinct '+key);
const manifest=read('assets/psalm22/generation-prompts.json');
assert.equal(manifest.styleReference,'assets/psalm23/verse-2-watercolor.webp');
assert.equal(manifest.paintings.length,rows.length);
assert.deepEqual(manifest.pendingVerses,Array.from({length:31-rows.length},(_,i)=>rows.length+i+1));
const hashes=new Set(),originals=new Set();
for(const r of rows){
 assert(r.meaning.length>300&&r.context.length>140&&r.reflect.length>50&&r.explore.length>=2);
 assert(r.explore.every(x=>x.length===2&&x[1].length>50));
 for(const ref of r.related){const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m,ref);assert(bible.find(b=>b.name===m[1])?.chapters[+m[2]-1]?.some(([v,text])=>v===+m[3]&&text),ref);}
 const p=manifest.paintings.find(p=>p.verse===r.verse);assert.equal(p.production,r.art);assert.equal(p.status,'generated and visually inspected');assert(p.prompt.length>500&&p.generatedOriginal.endsWith('.png'));originals.add(p.generatedOriginal);
 const bytes=fs.readFileSync(r.art);assert(bytes.length>50000);assert.equal(bytes.subarray(8,12).toString(),'WEBP');hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));
}
assert.equal(hashes.size,rows.length);assert.equal(originals.size,rows.length);
assert(source.verses[6][1].endsWith(':'));assert(source.verses[7][1].startsWith('“'),'Preserve mockers’ quotation and boundary');
assert(rows[6].meaning.includes('colon'));assert(rows[7].meaning.includes('mockers'));assert(rows[0].meaning.includes('Matthew 27:46')&&rows[0].meaning.includes('Mark 15:34'));
assert(rows[5].meaning.includes('not a statement that any person has no human dignity'));
if(rows.length<31){
 assert(!fs.existsSync('psalm22.js'),'Do not register a partial chapter');
 assert(!fs.readFileSync('index.html','utf8').includes('psalm22.js'));
 assert(!fs.readFileSync('sw.js','utf8').includes('assets/psalm22/'),'Offline release gate still pending');
}else assert.equal(rows.length,31,'Whole chapter required for integration');
console.log('PASS — Psalm 22 editorial/art checkpoint: '+rows.length+'/31 exact source-backed individual notes and distinct inspected paintings; whole-chapter release checks remain separate.');
