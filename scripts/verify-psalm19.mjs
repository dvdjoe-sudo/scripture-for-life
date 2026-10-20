import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const values=new Map([['scripture-for-life.notes','keep existing reflections'],['scripture-for-life.psalm18-place','35']]);
const ctx={window:{SFL_PSALMS:{switcher:()=>'<nav></nav>'}},document:{addEventListener(){}},location:{hash:'#/study/19/1'},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)}};
for(const f of ['data.js','content.js','exodus-people.js','topic-connections.js','psalm-verse-study.js','psalm18.js','psalm19.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx);
const engine=ctx.window.SFL_VERSE_STUDIES,study=engine.studies[19],bible=JSON.parse(fs.readFileSync('data/bible.json','utf8')).books;
const source=bible[18].chapters[18],chapter=Object.fromEntries(source),draft=JSON.parse(fs.readFileSync('drafts/psalm19/editorial.json','utf8'));
assert.deepEqual(JSON.parse(fs.readFileSync('drafts/psalm19/source.json','utf8')).verses,source);
assert.equal(JSON.stringify(study),JSON.stringify(draft.study),'Reviewed editorial matches registered study');
assert.equal(study.verses.length,14);
for(const key of ['title','heading','meaning','context','reflect','alt'])assert.equal(new Set(study.verses.map(v=>v[key])).size,14,'Individual '+key);
assert(chapter[1].includes('For the choirmaster. A Psalm of David.'));
assert(chapter[3].endsWith(',')&&chapter[4].startsWith('their voice'));
assert(chapter[5].endsWith(',')&&chapter[6].startsWith('it rises'));
const escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const checkRef=ref=>{const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m,ref);assert(bible.find(b=>b.name===m[1])?.chapters[+m[2]-1]?.some(([n])=>n===+m[3]),ref);};
const renderTools={chapter,escapeHTML,icon:()=>'',refURL:r=>'#/read/'+r,saveButton:()=>'<button>Save</button>',noteField:()=>'<textarea></textarea>',hydrateNotes(){}};
const manifest=JSON.parse(fs.readFileSync('assets/psalm19/generation-prompts.json','utf8'));
assert.equal(manifest.styleReference,'assets/psalm23/verse-2-watercolor.webp');assert.equal(manifest.paintings.length,14);
const hashes=new Set(),originals=new Set(),sw=fs.readFileSync('sw.js','utf8');
for(let n=1;n<=14;n++){
 const row=study.verses[n-1],html=engine.render(19,n,renderTools);
 assert(html.includes('data-speakref="Psalm 19:'+n+'">'+escapeHTML(chapter[n])+'</p>'),'Exact BSB '+n);
 assert.equal((html.match(/data-verse-study-art=/g)||[]).length,1);
 assert.equal((html.match(/role="tab"/g)||[]).length,4);
 assert.equal((html.match(/>Verse \d+<\/a>/g)||[]).length,14);
 assert(row.meaning.length>300&&row.context.length>140&&row.reflect.length>50&&row.explore.length>=2);
 assert(row.explore.every(x=>x.length===2&&x[1].length>50));row.related.forEach(checkRef);
 const img=fs.readFileSync(row.art);assert(img.length>50000);assert.equal(img.subarray(8,12).toString(),'WEBP');
 assert(img.equals(fs.readFileSync('www/'+row.art)),'Web bundle art parity '+n);assert(sw.includes(row.art),'Offline art '+n);
 hashes.add(crypto.createHash('sha256').update(img).digest('hex'));
 const p=manifest.paintings.find(x=>x.verse===n);assert.equal(p.production,row.art);assert.equal(p.status,'generated and visually inspected');assert(p.prompt.length>500&&p.generatedOriginal.endsWith('.png'));originals.add(p.generatedOriginal);
 assert.equal(engine.link('Psalm 19:'+n),'#/study/19/'+n);
 assert(html.includes(n<14?'href="#/study/19/'+(n+1)+'"':'href="#/psalms/20"'));
}
assert.equal(hashes.size,14);assert.equal(originals.size,14);
for(const [id,refs]of Object.entries(draft.topicPlan))for(const ref of refs){
 assert(ctx.window.BIBLE_DATA.topics.find(t=>t.id===id).refs.includes(ref));
 assert.equal(ctx.window.BIBLE_DATA.verses[ref],chapter[+ref.split(':')[1]]);
 assert(ctx.window.SFL_CONNECTIONS.related({ref}).includes('href="#/help/'+id+'"'));
}
for(const p of study.people){checkRef(p.ref);assert(ctx.window.PEOPLE.some(x=>x.id===p.id));}
assert.equal(study.people.length,1);assert.equal(study.people[0].id,'david');
assert(study.verses[3].related.includes('Romans 10:18')&&study.verses[3].context.includes('two settings remain distinct'),'Later quotation in its context');
assert(study.verses[4].meaning.includes('comparisons'));
assert(study.verses[11].meaning.includes('invent forgotten offenses'));
assert.throws(()=>engine.render(19,0,renderTools));assert.throws(()=>engine.render(19,15,renderTools));assert.equal(engine.link('Psalm 19:15'),'');
assert.equal(engine.progress(19),14);assert.equal(engine.progress(18),35);assert.equal(values.get('scripture-for-life.notes'),'keep existing reflections');
const prev=engine.render(18,50,{...renderTools,chapter:Object.fromEntries(bible[18].chapters[17])});
assert(prev.includes('href="#/study/19/1"'),'18→19 transition');
assert.equal(fs.readFileSync('psalm19.js','utf8'),fs.readFileSync('www/psalm19.js','utf8'));assert(sw.includes('./psalm19.js'));assert(fs.readFileSync('index.html','utf8').includes('src="psalm19.js"'));
ctx.localStorage.getItem=()=>{throw Error('blocked');};assert.equal(engine.progress(19),1);
console.log('PASS — Psalm 19: 14 exact BSB verses and heading, individual reviewed notes and paintings, sentence continuations, context-sensitive references, people/needs links, independent resume, offline and Android web-bundle parity.');
