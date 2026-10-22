import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const values=new Map([['scripture-for-life.notes','keep existing reflections'],['scripture-for-life.psalm19-place','8']]);
const ctx={window:{SFL_PSALMS:{switcher:()=>'<nav></nav>'}},document:{addEventListener(){}},location:{hash:'#/study/20/1'},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)}};
for(const f of ['data.js','content.js','exodus-people.js','topic-connections.js','psalm-verse-study.js','psalm19.js','psalm20.js','psalm21.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx);
const engine=ctx.window.SFL_VERSE_STUDIES,study=engine.studies[20],bible=JSON.parse(fs.readFileSync('data/bible.json','utf8')).books;
const source=bible[18].chapters[19],chapter=Object.fromEntries(source),draft=JSON.parse(fs.readFileSync('drafts/psalm20/editorial.json','utf8'));
assert.deepEqual(JSON.parse(fs.readFileSync('drafts/psalm20/source.json','utf8')).verses,source);
assert.equal(JSON.stringify(study),JSON.stringify(draft.study),'Reviewed editorial matches registered study');
assert.equal(study.verses.length,9);
for(const key of ['title','heading','meaning','context','reflect','alt'])assert.equal(new Set(study.verses.map(v=>v[key])).size,9,'Individual '+key);
assert(chapter[1].includes('For the choirmaster. A Psalm of David.'));
assert(chapter[3].endsWith('Selah'));
assert(chapter[5].includes('May we')&&chapter[6].startsWith('Now I know'));
assert.equal(chapter[9],'O LORD, save the king. Answer us on the day we call.');
const escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const checkRef=ref=>{const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m,ref);assert(bible.find(b=>b.name===m[1])?.chapters[+m[2]-1]?.some(([n])=>n===+m[3]),ref);};
const renderTools={chapter,escapeHTML,icon:()=>'',refURL:r=>'#/read/'+r,saveButton:()=>'<button>Save</button>',noteField:()=>'<textarea></textarea>',hydrateNotes(){}};
const manifest=JSON.parse(fs.readFileSync('assets/psalm20/generation-prompts.json','utf8'));
assert.equal(manifest.styleReference,'assets/psalm23/verse-2-watercolor.webp');assert.equal(manifest.paintings.length,9);
const hashes=new Set(),originals=new Set(),sw=fs.readFileSync('sw.js','utf8');
for(let n=1;n<=9;n++){
 const row=study.verses[n-1],html=engine.render(20,n,renderTools);
 assert(html.includes('data-speakref="Psalm 20:'+n+'">'+escapeHTML(chapter[n])+'</p>'),'Exact BSB '+n);
 assert.equal((html.match(/data-verse-study-art=/g)||[]).length,1);
 assert.equal((html.match(/role="tab"/g)||[]).length,4);
 assert.equal((html.match(/>Verse \d+ of \d+<\/option>/g)||[]).length,9);
 assert(row.meaning.length>300&&row.context.length>140&&row.reflect.length>50&&row.explore.length>=2);
 assert(row.explore.every(x=>x.length===2&&x[1].length>50));row.related.forEach(checkRef);
 const img=fs.readFileSync(row.art);assert(img.length>50000);assert.equal(img.subarray(8,12).toString(),'WEBP');
 assert(img.equals(fs.readFileSync('www/'+row.art)),'Web bundle art parity '+n);assert(sw.includes(row.art),'Offline art '+n);
 hashes.add(crypto.createHash('sha256').update(img).digest('hex'));
 const p=manifest.paintings.find(x=>x.verse===n);assert.equal(p.production,row.art);assert.equal(p.status,'generated and visually inspected');assert(p.prompt.length>500&&p.generatedOriginal.endsWith('.png'));originals.add(p.generatedOriginal);
 assert.equal(engine.link('Psalm 20:'+n),'#/study/20/'+n);
 assert(html.includes(n<9?'href="#/study/20/'+(n+1)+'"':'href="#/study/21/1"'));
}
assert.equal(hashes.size,9);assert.equal(originals.size,9);
for(const [id,refs]of Object.entries(draft.topicPlan))for(const ref of refs){
 assert(ctx.window.BIBLE_DATA.topics.find(t=>t.id===id).refs.includes(ref));
 assert.equal(ctx.window.BIBLE_DATA.verses[ref],chapter[+ref.split(':')[1]]);
 assert(ctx.window.SFL_CONNECTIONS.related({ref}).includes('href="#/help/'+id+'"'));
}
for(const p of study.people){checkRef(p.ref);assert(ctx.window.PEOPLE.some(x=>x.id===p.id));}
assert.equal(study.people.length,2);assert.deepEqual(Array.from(study.people,p=>p.id),['david','jacob']);
assert(study.verses[3].meaning.includes('not a blank check'),'Petition, not a universal promise');
assert(study.verses[5].meaning.includes('royal setting'),'Anointed in its royal context');
assert(study.verses[6].meaning.includes('medical care'),'Trust does not reject practical care');
assert(study.verses[7].meaning.includes('not a rule'),'Do not shame hardship');
assert(study.verses[8].meaning.includes('bundled wording'),'Preserve BSB closing petition');
assert.throws(()=>engine.render(20,0,renderTools));assert.throws(()=>engine.render(20,10,renderTools));assert.equal(engine.link('Psalm 20:10'),'');
assert.equal(engine.progress(20),9);assert.equal(engine.progress(19),8);assert.equal(values.get('scripture-for-life.notes'),'keep existing reflections');
const prev=engine.render(19,14,{...renderTools,chapter:Object.fromEntries(bible[18].chapters[18])});
assert(prev.includes('href="#/study/20/1"'),'19→20 transition');
assert.equal(fs.readFileSync('psalm20.js','utf8'),fs.readFileSync('www/psalm20.js','utf8'));assert(sw.includes('./psalm20.js'));assert(fs.readFileSync('index.html','utf8').includes('src="psalm20.js"'));
ctx.localStorage.getItem=()=>{throw Error('blocked');};assert.equal(engine.progress(20),1);
console.log('PASS — Psalm 20: 9 exact BSB verses and heading, individual reviewed notes and paintings, Selah and communal royal voices, context-sensitive references, people/needs links, independent resume, offline and Android web-bundle parity.');
