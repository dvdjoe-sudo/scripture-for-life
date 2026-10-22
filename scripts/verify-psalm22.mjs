import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const values=new Map([['scripture-for-life.notes','preserve reflections'],['scripture-for-life.psalm21-place','7']]);
const ctx={window:{SFL_PSALMS:{switcher:()=>'<nav></nav>'}},document:{addEventListener(){}},location:{hash:'#/study/22/1'},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)}};
for(const f of ['data.js','content.js','exodus-people.js','psalm-verse-study.js','psalm21.js','psalm22.js','topic-connections.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx);
const engine=ctx.window.SFL_VERSE_STUDIES,study=engine.studies[22],bible=read('data/bible.json').books,source=bible[18].chapters[21],chapter=Object.fromEntries(source),draft=read('drafts/psalm22/editorial.json');
assert.deepEqual(read('drafts/psalm22/source.json').verses,source);
assert.equal(JSON.stringify(study),JSON.stringify(draft.study));
const groups=read('drafts/psalm22/progress.json').groups.flatMap(g=>read('drafts/psalm22/'+g.file).verses.map(({verse,...r})=>r));
assert.equal(JSON.stringify(groups),JSON.stringify(study.verses),'All reviewed groups match runtime');
assert.equal(study.verses.length,31);
assert(chapter[1].includes('The Doe of the Dawn'));assert(chapter[7].endsWith(':'));assert(chapter[8].startsWith('“'));assert(chapter[21].endsWith('You have answered me!'));assert(chapter[31].endsWith('all that He has done.'));
for(const key of ['title','heading','meaning','context','reflect','alt'])assert.equal(new Set(study.verses.map(r=>r[key])).size,31,'Distinct '+key);
const checkRef=ref=>{const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m,ref);assert(bible.find(b=>b.name===m[1])?.chapters[+m[2]-1]?.some(([v,t])=>v===+m[3]&&t),ref);};
const escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tools={chapter,escapeHTML,icon:()=>'',refURL:r=>'#/read/'+r,saveButton:()=>'<button>Save</button>',noteField:()=>'<textarea></textarea>',hydrateNotes(){}};
const manifest=read('assets/psalm22/generation-prompts.json'),sw=fs.readFileSync('sw.js','utf8'),hashes=new Set(),originals=new Set();
assert.equal(manifest.paintings.length,31);assert.equal(manifest.pendingVerses.length,0);assert.equal(manifest.styleReference,'assets/psalm23/verse-2-watercolor.webp');
for(let n=1;n<=31;n++){
 const r=study.verses[n-1],html=engine.render(22,n,tools);
 assert(html.includes('data-speakref="Psalm 22:'+n+'">'+escapeHTML(chapter[n])+'</p>'),'Exact rendered BSB '+n);
 assert.equal((html.match(/role="tab"/g)||[]).length,4);assert.equal((html.match(/data-verse-study-art=/g)||[]).length,1);assert.equal((html.match(/>Verse \d+ of \d+<\/option>/g)||[]).length,31);
 assert(html.includes(n<31?'href="#/study/22/'+(n+1)+'"':'href="#/study/23/1"'),'Forward chapter/verse navigation');
 assert(r.meaning.length>300&&r.context.length>140&&r.reflect.length>50&&r.explore.length>=2);assert(r.explore.every(x=>x.length===2&&x[1].length>50));r.related.forEach(checkRef);
 const bytes=fs.readFileSync(r.art);assert(bytes.length>50000);assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert(bytes.equals(fs.readFileSync('www/'+r.art)));assert(sw.includes(r.art));hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));
 const p=manifest.paintings.find(p=>p.verse===n);assert.equal(p.production,r.art);assert.equal(p.status,'generated and visually inspected');assert(p.prompt.length>500&&p.generatedOriginal.endsWith('.png'));originals.add(p.generatedOriginal);
 assert.equal(engine.link('Psalm 22:'+n),'#/study/22/'+n);
}
assert.equal(hashes.size,31);assert.equal(originals.size,31);
for(const[id,refs]of Object.entries(draft.topicPlan))for(const ref of refs){assert(ctx.window.BIBLE_DATA.topics.find(t=>t.id===id).refs.includes(ref));assert.equal(ctx.window.BIBLE_DATA.verses[ref],chapter[+ref.split(':')[1]]);assert(ctx.window.SFL_CONNECTIONS.related({ref}).includes('href="#/help/'+id+'"'));}
assert.deepEqual(Array.from(study.people,p=>p.id),['david','jesus','jacob']);for(const p of study.people){checkRef(p.ref);assert(ctx.window.PEOPLE.some(x=>x.id===p.id));}
assert.throws(()=>engine.render(22,0,tools));assert.throws(()=>engine.render(22,32,tools));assert.equal(engine.link('Psalm 22:32'),'');assert.equal(engine.progress(22),31);assert.equal(engine.progress(21),7);assert.equal(values.get('scripture-for-life.notes'),'preserve reflections');
assert(engine.render(21,13,{...tools,chapter:Object.fromEntries(bible[18].chapters[20])}).includes('href="#/study/22/1"'));
assert.equal(fs.readFileSync('psalm22.js','utf8'),fs.readFileSync('www/psalm22.js','utf8'));assert(sw.includes('./psalm22.js'));assert(fs.readFileSync('index.html','utf8').includes('src="psalm22.js"'));
ctx.localStorage.getItem=()=>{throw Error('blocked');};assert.equal(engine.progress(22),1);
console.log('PASS — Psalm 22: 31 exact BSB verses and heading, reviewed individual notes/art, contextual references and people, needs links, independent resume, 21→22→23 transitions, offline and Android web-bundle parity.');
