import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const values=new Map([['scripture-for-life.notes','keep existing reflections'],['scripture-for-life.psalm16-place','7']]);
const ctx={window:{SFL_PSALMS:{switcher:(n,c,v='')=>'<nav>'+v+'</nav>'}},document:{addEventListener(){}},location:{hash:'#/study/17/1'},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)}};
for(const f of ['data.js','content.js','exodus-people.js','topic-connections.js','psalm-verse-study.js','psalm16.js','psalm17.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx);
const engine=ctx.window.SFL_VERSE_STUDIES,study=engine.studies[17],bible=JSON.parse(fs.readFileSync('data/bible.json','utf8')).books;
const source=bible[18].chapters[16],chapter=Object.fromEntries(source);
const escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const checkRef=ref=>{const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m);assert(bible.find(b=>b.name===m[1])?.chapters[+m[2]-1]?.some(([v])=>v===+m[3]),ref);};
assert.equal(study.verses.length,15);
assert.equal(new Set(study.verses.map(v=>v.meaning)).size,15);
assert.equal(new Set(study.verses.map(v=>v.context)).size,15);
assert(chapter[1].startsWith('A prayer of David. '),'Preserve bundled heading');
assert(chapter[8].endsWith('Your wings')&&chapter[9].startsWith('from the wicked'),'Preserve sentence continuation');
assert(chapter[11].includes('tracked us down'),'Preserve plural voice');
assert(chapter[14].includes('May You fill the bellies of Your treasured ones'),'Preserve BSB provision petition');
const tools={chapter,escapeHTML,icon:()=>'',refURL:()=> '#/read/19/17',saveButton:()=>'<button>Save</button>',noteField:()=>'<textarea></textarea>',hydrateNotes(){}};
const manifest=JSON.parse(fs.readFileSync('assets/psalm17/generation-prompts.json','utf8'));
assert.equal(manifest.paintings.length,15);assert.equal(manifest.styleReference,'assets/psalm23/verse-2-watercolor.webp');
const hashes=[];
for(let n=1;n<=15;n++){
 const row=study.verses[n-1],html=engine.render(17,n,tools);
 assert(html.includes(`data-speakref="Psalm 17:${n}">${escapeHTML(chapter[n])}</p>`),'Exact source verse '+n);
 assert.equal((html.match(/data-verse-study-art=/g)||[]).length,1);
 assert.equal((html.match(/role="tab"/g)||[]).length,4);
 assert.equal((html.match(/>Verse \d+ of \d+<\/option>/g)||[]).length,15);
 assert(row.meaning.length>300&&row.context.length>140&&row.reflect.length>50&&row.explore.length>=2);
 row.related.forEach(checkRef);
 const image=fs.readFileSync(row.art);assert(image.length>50000,'Production art must not be empty or a placeholder');assert.equal(image.subarray(8,12).toString(),'WEBP');
 assert(image.equals(fs.readFileSync('www/'+row.art)),'Android matches website');
 assert(fs.readFileSync('sw.js','utf8').includes(row.art),'Cached artwork');
 const prompt=manifest.paintings.find(p=>p.verse===n);assert.equal(prompt.production,row.art);assert.equal(prompt.status,'generated and visually inspected');assert(prompt.prompt.length>500&&prompt.generatedOriginal.endsWith('.png'));
 hashes.push(crypto.createHash('sha256').update(image).digest('hex'));
 assert.equal(engine.link(`Psalm 17:${n}`),`#/study/17/${n}`);
 if(n<15)assert(html.includes(`href="#/study/17/${n+1}"`));
 else assert(html.includes('href="#/psalms/18"'),'Next unfinished chapter remains a chapter page');
}
assert.equal(new Set(hashes).size,15,'Fifteen individual paintings');
for(const p of study.people){checkRef(p.ref);assert(ctx.window.PEOPLE.some(x=>x.id===p.id),'Existing character profile '+p.id);}
assert(study.verses[7].related.includes('Psalm 17:9'),'Shelter prayer keeps its sentence continuation');
assert(study.verses[13].related.includes('Psalm 17:15'),'Provision read with closing contrast');
for(const [ref,id] of [['Psalm 17:8','fear'],['Psalm 17:5','direction'],['Psalm 17:7','strength'],['Psalm 17:6','alone'],['Psalm 17:15','grief']]){
 assert(ctx.window.SFL_CONNECTIONS.related({ref}).includes('href="#/help/'+id+'"'));
 assert.equal(ctx.window.BIBLE_DATA.verses[ref],chapter[+ref.split(':')[1]],'Topic quote preserves BSB');
}
assert.throws(()=>engine.render(17,0,tools));assert.throws(()=>engine.render(17,16,tools));assert.equal(engine.link('Psalm 17:16'),'');
assert.equal(engine.progress(17),15);assert.equal(engine.progress(16),7);assert.equal(values.get('scripture-for-life.notes'),'keep existing reflections');
assert.equal(fs.readFileSync('psalm17.js','utf8'),fs.readFileSync('www/psalm17.js','utf8'));
ctx.localStorage.getItem=()=>{throw Error('blocked');};assert.equal(engine.progress(17),1);
console.log('PASS — Psalm 17: 15 exact BSB verses, individual notes and watercolors, valid source/character references, topic links, independent resume, and offline/Android parity.');
