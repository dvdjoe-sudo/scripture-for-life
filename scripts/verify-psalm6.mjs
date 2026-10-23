import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const values=new Map([['scripture-for-life.notes','preserve reflections'],['scripture-for-life.psalm1-place','5']]);
const ctx={window:{SFL_PSALMS:{switcher:(n,c,v='')=>'<nav>'+v+'</nav>'}},document:{addEventListener(){}},location:{hash:'#/study/2/1'},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)}};
for(const f of ['psalm-verse-study.js','psalm1.js','psalms-2-3.js','psalm4.js','psalm5.js','psalm6.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx);
const engine=ctx.window.SFL_VERSE_STUDIES,bible=JSON.parse(fs.readFileSync('data/bible.json','utf8')).books;
const escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const checkRef=ref=>{const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m);assert(bible.find(b=>b.name===m[1])?.chapters[+m[2]-1]?.some(([v])=>v===+m[3]),ref);};
const hashes=[];
for(const number of [6]){
 const study=engine.studies[number],source=bible[18].chapters[number-1],chapter=Object.fromEntries(source);
 assert.equal(study.verses.length,source.length);
 assert.equal(new Set(study.verses.map(v=>v.meaning)).size,source.length);
 assert.equal(new Set(study.verses.map(v=>v.context)).size,source.length);
 const tools={chapter,escapeHTML,icon:()=>'',refURL:()=> '#/read/19/1',saveButton:()=>'<button>Save</button>',noteField:()=>'<textarea></textarea>',hydrateNotes(){}};
 for(let n=1;n<=source.length;n++){
  const row=study.verses[n-1],html=engine.render(number,n,tools);
  assert(html.includes(`data-speakref="Psalm ${number}:${n}">${escapeHTML(chapter[n])}</p>`),'Exact source verse');
  assert.equal((html.match(/data-verse-study-art=/g)||[]).length,1);
  assert.equal((html.match(/role="tab"/g)||[]).length,4);
  assert.equal((html.match(/>Verse \d+ of \d+<\/option>/g)||[]).length,source.length);
  assert(row.meaning.length>300&&row.context.length>140&&row.reflect.length>50&&row.explore.length>=2);
  row.related.forEach(checkRef);
  const image=fs.readFileSync(row.art);assert.equal(image.subarray(8,12).toString(),'WEBP');
  assert(image.equals(fs.readFileSync('www/'+row.art)),'Android matches website');
  assert(fs.readFileSync('sw.js','utf8').includes(row.art),'Cached artwork');
  hashes.push(crypto.createHash('sha256').update(image).digest('hex'));
  assert.equal(engine.link(`Psalm ${number}:${n}`),`#/study/${number}/${n}`);
 }
 study.people.forEach(p=>checkRef(p.ref));
 assert.throws(()=>engine.render(number,0,tools));assert.throws(()=>engine.render(number,source.length+1,tools));
 assert.equal(engine.link(`Psalm ${number}:${source.length+1}`),'');
}
assert.equal(new Set(hashes).size,10,'Ten individual paintings');
assert.equal(engine.progress(6),10);assert.equal(engine.progress(1),5);
assert.equal(values.get('scripture-for-life.notes'),'preserve reflections');
assert.equal(fs.readFileSync('psalm6.js','utf8'),fs.readFileSync('www/psalm6.js','utf8'));
ctx.localStorage.getItem=()=>{throw Error('blocked');};assert.equal(engine.progress(6),1);
console.log('PASS — Psalm 6: 10 exact source verses, individual meaning/context/art, valid references, all verse links, independent places, and matching offline/Android assets.');
