import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const values=new Map([['scripture-for-life.notes','keep existing reflections'],['scripture-for-life.psalm17-place','8']]);
const ctx={window:{SFL_PSALMS:{switcher:(n,c,v='')=>'<nav>'+v+'</nav>'}},document:{addEventListener(){}},location:{hash:'#/study/18/1'},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)}};
for(const f of ['data.js','content.js','exodus-people.js','topic-connections.js','psalm-verse-study.js','psalm17.js','psalm18.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx);
const engine=ctx.window.SFL_VERSE_STUDIES,study=engine.studies[18],bible=JSON.parse(fs.readFileSync('data/bible.json','utf8')).books;
const source=bible[18].chapters[17],chapter=Object.fromEntries(source);
assert.deepEqual(JSON.parse(fs.readFileSync('drafts/psalm18/source.json','utf8')).verses,source);
assert.equal(study.verses.length,50);
for(const key of ['title','heading','meaning','context','reflect','alt'])assert.equal(new Set(study.verses.map(v=>v[key])).size,50,'Individual '+key);
assert(chapter[1].includes('Of David the servant of the LORD')&&chapter[1].includes('from the hand of Saul. He said:'));
assert(chapter[25].endsWith(';')&&chapter[26].startsWith('to the pure'));
assert(chapter[46].endsWith('—')&&chapter[47].startsWith('the God')&&chapter[47].endsWith(',')&&chapter[48].startsWith('who delivers'));
const escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const checkRef=ref=>{const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m,ref);assert(bible.find(b=>b.name===m[1])?.chapters[+m[2]-1]?.some(([n])=>n===+m[3]),ref);};
const renderTools={chapter,escapeHTML,icon:()=>'',refURL:r=>'#/read/'+r,saveButton:()=>'<button>Save</button>',noteField:()=>'<textarea></textarea>',hydrateNotes(){}};
const manifest=JSON.parse(fs.readFileSync('assets/psalm18/generation-prompts.json','utf8'));
assert.equal(manifest.styleReference,'assets/psalm23/verse-2-watercolor.webp');assert.equal(manifest.paintings.length,50);
const hashes=new Set(),originals=new Set(),sw=fs.readFileSync('sw.js','utf8');
for(let n=1;n<=50;n++){
 const row=study.verses[n-1],html=engine.render(18,n,renderTools);
 assert(html.includes('data-speakref="Psalm 18:'+n+'">'+escapeHTML(chapter[n])+'</p>'),'Exact BSB '+n);
 assert.equal((html.match(/data-verse-study-art=/g)||[]).length,1);
 assert.equal((html.match(/role="tab"/g)||[]).length,4);
 assert.equal((html.match(/>Verse \d+ of \d+<\/option>/g)||[]).length,50);
 assert(row.meaning.length>300&&row.context.length>140&&row.reflect.length>50&&row.explore.length>=2);
 assert(row.explore.every(x=>x.length===2&&x[1].length>50));row.related.forEach(checkRef);
 const img=fs.readFileSync(row.art);assert(img.length>50000);assert.equal(img.subarray(8,12).toString(),'WEBP');
 assert(img.equals(fs.readFileSync('www/'+row.art)),'Web bundle art parity '+n);assert(sw.includes(row.art),'Offline art '+n);
 hashes.add(crypto.createHash('sha256').update(img).digest('hex'));
 const p=manifest.paintings.find(x=>x.verse===n);assert.equal(p.production,row.art);assert.equal(p.status,'generated and visually inspected');assert(p.prompt.length>500&&p.generatedOriginal.endsWith('.png'));originals.add(p.generatedOriginal);
 assert.equal(engine.link('Psalm 18:'+n),'#/study/18/'+n);
 assert(html.includes(n<50?'href="#/study/18/'+(n+1)+'"':'href="#/psalms/19"'));
}
assert.equal(hashes.size,50);assert.equal(originals.size,50);
const groups=['1-10','11-15','16-20','21-27','28-34','35-42','43-50'].map(r=>JSON.parse(fs.readFileSync('drafts/psalm18/verses-'+r+'.json','utf8')));
for(const draft of groups)for(const {verse,...row}of draft.verses)assert.equal(JSON.stringify(study.verses[verse-1]),JSON.stringify(row),'Reviewed editorial row '+verse);
for(const draft of groups)for(const [id,refs]of Object.entries(draft.topicPlan||{}))for(const ref of refs){
 assert(ctx.window.BIBLE_DATA.topics.find(t=>t.id===id).refs.includes(ref));
 assert.equal(ctx.window.BIBLE_DATA.verses[ref],chapter[+ref.split(':')[1]]);
 assert(ctx.window.SFL_CONNECTIONS.related({ref}).includes('href="#/help/'+id+'"'));
}
for(const p of study.people){checkRef(p.ref);assert(ctx.window.PEOPLE.some(x=>x.id===p.id));}
assert.equal(study.people.length,1);assert(study.peopleNote.includes('opponent'));assert.equal(study.people[0].id,'david');
assert(study.verses[40].meaning.includes('not a general explanation'),'Unanswered prayer in context');
assert(study.verses[48].related.includes('Romans 15:9'),'Later quotation distinguished');
assert(study.verses[49].meaning.includes('David'));
assert.throws(()=>engine.render(18,0,renderTools));assert.throws(()=>engine.render(18,51,renderTools));assert.equal(engine.link('Psalm 18:51'),'');
assert.equal(engine.progress(18),50);assert.equal(engine.progress(17),8);assert.equal(values.get('scripture-for-life.notes'),'keep existing reflections');
const prev=engine.render(17,15,{...renderTools,chapter:Object.fromEntries(bible[18].chapters[16])});
assert(prev.includes('href="#/study/18/1"'),'17→18 transition');
assert.equal(fs.readFileSync('psalm18.js','utf8'),fs.readFileSync('www/psalm18.js','utf8'));assert(sw.includes('./psalm18.js'));assert(fs.readFileSync('index.html','utf8').includes('"psalm18.js"'));
ctx.localStorage.getItem=()=>{throw Error('blocked');};assert.equal(engine.progress(18),1);
console.log('PASS — Psalm 18: 50 exact BSB verses and heading, individual reviewed notes and paintings, sentence continuations, context-sensitive references, people/needs links, independent resume, offline and Android web-bundle parity.');
