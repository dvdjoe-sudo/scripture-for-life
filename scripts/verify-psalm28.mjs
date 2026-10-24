import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const values=new Map([['scripture-for-life.notes','preserve notes'],['scripture-for-life.psalm27-place','6']]);
const c={window:{SFL_PSALMS:{switcher:(n,c,v='')=>'<nav>'+v+'</nav>'}},document:{addEventListener(){}},location:{hash:'#/study/28/1'},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)}};
for(const p of ['data.js','content.js','psalm-verse-study.js','psalm27.js','psalm28.js','topic-connections.js'])vm.runInNewContext(fs.readFileSync(p,'utf8'),c);
const e=c.window.SFL_VERSE_STUDIES,s=e.studies[28],b=read('data/bible.json').books,source=b[18].chapters[27],chapter=Object.fromEntries(source),d=read('drafts/psalm28/editorial.json');
assert.deepEqual(read('drafts/psalm28/source.json').verses,source);
assert.equal(JSON.stringify(s),JSON.stringify(d.study));assert.equal(s.verses.length,9);
const grouped=read('drafts/psalm28/progress.json').groups.flatMap(g=>read('drafts/psalm28/'+g.file).verses.map(({verse,...r})=>r));assert.equal(JSON.stringify(grouped),JSON.stringify(s.verses));
assert(chapter[1].startsWith('Of David.'));assert(chapter[4].includes('Repay them'));assert(chapter[8].includes('His anointed'));assert(chapter[9].includes('shepherd them and carry them forever.'));
const escapeHTML=v=>String(v).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const tools={chapter,escapeHTML,icon:()=>'',refURL:r=>'#/read/'+r,saveButton:()=>'<button>Save</button>',noteField:()=>'<textarea></textarea>',hydrateNotes(){}};
const manifest=read('assets/psalm28/generation-prompts.json'),sw=fs.readFileSync('sw.js','utf8'),hashes=new Set(),originals=new Set();
assert.equal(manifest.paintings.length,9);assert.equal(manifest.pendingVerses.length,0);assert.equal(manifest.styleReference,'assets/psalm23/verse-2-watercolor.webp');
for(const key of ['title','heading','meaning','context','reflect','alt'])assert.equal(new Set(s.verses.map(v=>v[key])).size,9,'Individual '+key);
const refCheck=r=>{const m=/^(.+?) (\d+):(\d+)$/.exec(r);assert(m,r);assert(b.find(x=>x.name===m[1])?.chapters[+m[2]-1]?.some(([v,t])=>v===+m[3]&&t),r);};
for(let n=1;n<=9;n++){
 const v=s.verses[n-1],html=e.render(28,n,tools),p=manifest.paintings.find(x=>x.verse===n),bytes=fs.readFileSync(v.art);
 assert(html.includes('data-speakref="Psalm 28:'+n+'">'+escapeHTML(chapter[n])+'</p>'),'Exact BSB verse '+n);
 assert.equal((html.match(/role="tab"/g)||[]).length,4);assert.equal((html.match(/>Verse \d+ of \d+<\/option>/g)||[]).length,9);assert.equal((html.match(/data-verse-study-art=/g)||[]).length,1);
 assert(html.includes(n<9?'href="#/study/28/'+(n+1)+'"':'href="#/psalms/29"'));assert.equal(e.link('Psalm 28:'+n),'#/study/28/'+n);
 assert(v.meaning.length>300&&v.context.length>140&&v.reflect.length>50);assert(v.explore.length>=2&&v.explore.every(x=>x[1].length>50));v.related.forEach(refCheck);
 assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert(bytes.length>20000);assert(bytes.equals(fs.readFileSync('www/'+v.art)));assert(sw.includes(v.art));hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));
 assert.equal(p.production,v.art);assert.equal(p.status,'generated and visually inspected');assert(p.prompt.length>500);originals.add(p.generatedOriginal);
}
assert.equal(hashes.size,9);assert.equal(originals.size,9);
for(const[id,refs]of Object.entries(d.topicPlan))for(const r of refs){assert(c.window.BIBLE_DATA.topics.find(t=>t.id===id).refs.includes(r));assert.equal(c.window.BIBLE_DATA.verses[r],chapter[+r.split(':')[1]]);assert(c.window.SFL_CONNECTIONS.related({ref:r}).includes('href="#/help/'+id+'"'));}
assert.deepEqual(Array.from(s.people,p=>p.id),['david']);for(const p of s.people){refCheck(p.ref);assert(c.window.PEOPLE.some(x=>x.id===p.id));}
assert.throws(()=>e.render(28,0,tools));assert.throws(()=>e.render(28,10,tools));assert.equal(e.link('Psalm 28:10'),'');assert.equal(e.progress(28),9);assert.equal(e.progress(27),6);assert.equal(values.get('scripture-for-life.notes'),'preserve notes');
assert(e.render(27,14,{...tools,chapter:Object.fromEntries(b[18].chapters[26])}).includes('href="#/study/28/1"'));
assert.equal(fs.readFileSync('psalm28.js','utf8'),fs.readFileSync('www/psalm28.js','utf8'));assert(sw.includes('./psalm28.js'));assert(fs.readFileSync('index.html','utf8').includes('src="psalm28.js"'));
c.localStorage.getItem=()=>{throw Error('blocked');};assert.equal(e.progress(28),1);
console.log('PASS — Psalm 28: nine exact BSB verses and heading; individual notes and inspected paintings; references, David, needs, independent resume, 27→28→29 navigation, offline and Android parity.');
