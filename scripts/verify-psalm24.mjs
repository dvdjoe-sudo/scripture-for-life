import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const values=new Map([['scripture-for-life.notes','preserve reflections'],['scripture-for-life.psalm22-place','24']]);
const ctx={window:{SFL_PSALMS:{switcher:()=>'<nav></nav>'}},document:{addEventListener(){}},location:{hash:'#/study/24/1'},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)}};
for(const f of ['data.js','content.js','exodus-people.js','psalm-verse-study.js','psalm22.js','psalm24.js','topic-connections.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx);
const engine=ctx.window.SFL_VERSE_STUDIES,study=engine.studies[24],bible=read('data/bible.json').books,source=bible[18].chapters[23],chapter=Object.fromEntries(source),draft=read('drafts/psalm24/editorial.json');
assert.deepEqual(read('drafts/psalm24/source.json').verses,source);
assert.equal(JSON.stringify(study),JSON.stringify(draft.study));
assert.equal(study.verses.length,10);
assert(chapter[1].startsWith('A Psalm of David.'));assert(chapter[6].endsWith('Selah'));assert(chapter[10].endsWith('Selah'));assert.equal(chapter[7],chapter[9]);
for(const key of ['title','heading','meaning','context','reflect','alt'])assert.equal(new Set(study.verses.map(r=>r[key])).size,10,'Distinct '+key);
const checkRef=ref=>{const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m,ref);assert(bible.find(b=>b.name===m[1])?.chapters[+m[2]-1]?.some(([v,t])=>v===+m[3]&&t),ref);};
const escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tools={chapter,escapeHTML,icon:()=>'',refURL:r=>'#/read/'+r,saveButton:()=>'<button>Save</button>',noteField:()=>'<textarea></textarea>',hydrateNotes(){}};
const manifest=read('assets/psalm24/generation-prompts.json'),sw=fs.readFileSync('sw.js','utf8'),hashes=new Set(),originals=new Set();
assert.equal(manifest.paintings.length,10);assert.equal(manifest.pendingVerses.length,0);assert.equal(manifest.styleReference,'assets/psalm23/verse-2-watercolor.webp');
for(let n=1;n<=10;n++){
 const r=study.verses[n-1],html=engine.render(24,n,tools);
 assert(html.includes('data-speakref="Psalm 24:'+n+'">'+escapeHTML(chapter[n])+'</p>'),'Exact rendered BSB '+n);
 assert.equal((html.match(/role="tab"/g)||[]).length,4);assert.equal((html.match(/data-verse-study-art=/g)||[]).length,1);assert.equal((html.match(/>Verse \d+ of \d+<\/option>/g)||[]).length,10);
 assert(html.includes(n<10?'href="#/study/24/'+(n+1)+'"':'href="#/psalms/25"'),'Forward chapter/verse navigation');
 assert(r.meaning.length>300&&r.context.length>140&&r.reflect.length>50&&r.explore.length>=2);assert(r.explore.every(x=>x.length===2&&x[1].length>50));r.related.forEach(checkRef);
 const bytes=fs.readFileSync(r.art);assert(bytes.length>50000);assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert(bytes.equals(fs.readFileSync('www/'+r.art)));assert(sw.includes(r.art));hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));
 const p=manifest.paintings.find(p=>p.verse===n);assert.equal(p.production,r.art);assert.equal(p.status,'generated and visually inspected');assert(p.prompt.length>500&&p.generatedOriginal.endsWith('.png'));originals.add(p.generatedOriginal);
 assert.equal(engine.link('Psalm 24:'+n),'#/study/24/'+n);
}
assert.equal(hashes.size,10);assert.equal(originals.size,10);
for(const[id,refs]of Object.entries(draft.topicPlan))for(const ref of refs){assert(ctx.window.BIBLE_DATA.topics.find(t=>t.id===id).refs.includes(ref));assert.equal(ctx.window.BIBLE_DATA.verses[ref],chapter[+ref.split(':')[1]]);assert(ctx.window.SFL_CONNECTIONS.related({ref}).includes('href="#/help/'+id+'"'));}
assert.deepEqual(Array.from(study.people,p=>p.id),['david','jacob']);for(const p of study.people){checkRef(p.ref);assert(ctx.window.PEOPLE.some(x=>x.id===p.id));}
assert.throws(()=>engine.render(24,0,tools));assert.throws(()=>engine.render(24,11,tools));assert.equal(engine.link('Psalm 24:11'),'');assert.equal(engine.progress(24),10);assert.equal(engine.progress(22),24);assert.equal(values.get('scripture-for-life.notes'),'preserve reflections');
assert.equal(fs.readFileSync('psalm24.js','utf8'),fs.readFileSync('www/psalm24.js','utf8'));assert(sw.includes('./psalm24.js'));assert(fs.readFileSync('index.html','utf8').includes('src="psalm24.js"'));
ctx.localStorage.getItem=()=>{throw Error('blocked');};assert.equal(engine.progress(24),1);
console.log('PASS — Psalm 24: 10 exact BSB verses, heading and both Selah markers; individual notes/art, contextual references, David/Jacob, needs links, independent resume, forward transitions, offline and Android web-bundle parity.');
