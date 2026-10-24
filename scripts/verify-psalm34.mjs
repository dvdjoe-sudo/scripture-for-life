import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const values=new Map([['scripture-for-life.notes','preserve notes']]);
const c={window:{SFL_PSALMS:{switcher:(n,c,v='')=>'<nav>'+v+'</nav>'}},document:{addEventListener(){}},location:{hash:'#/study/34/1'},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)}};
for(const p of ['data.js','content.js','psalm-verse-study.js','psalm33.js','psalm34.js','topic-connections.js'])vm.runInNewContext(fs.readFileSync(p,'utf8'),c);
const e=c.window.SFL_VERSE_STUDIES,s=e.studies[34],b=read('data/bible.json').books,source=b[18].chapters[33],chapter=Object.fromEntries(source),d=read('drafts/psalm34/editorial.json'),N=22;
assert.deepEqual(read('drafts/psalm34/source.json').verses,source);
assert.equal(JSON.stringify(s),JSON.stringify(d.study));assert.equal(s.verses.length,N);
const escapeHTML=v=>String(v).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const tools={chapter,escapeHTML,icon:()=>'',refURL:r=>'#/read/'+r,saveButton:()=>'<button>Save</button>',noteField:()=>'<textarea></textarea>',hydrateNotes(){}};
const manifest=read('assets/psalm34/generation-prompts.json'),sw=fs.readFileSync('sw.js','utf8'),hashes=new Set(),originals=new Set();
assert.equal(manifest.paintings.length,N);assert.equal(manifest.pendingVerses.length,0);assert.equal(manifest.styleReference,'assets/psalm23/verse-2-watercolor.webp');
for(const key of ['title','heading','meaning','context','reflect','alt'])assert.equal(new Set(s.verses.map(v=>v[key])).size,N,'Individual '+key);
const refCheck=r=>{const m=/^(.+?) (\d+):(\d+)$/.exec(r);assert(m,r);assert(b.find(x=>x.name===m[1])?.chapters[+m[2]-1]?.some(([v,t])=>v===+m[3]&&t),r);};
for(let n=1;n<=N;n++){
 const v=s.verses[n-1],html=e.render(34,n,tools),p=manifest.paintings.find(x=>x.verse===n),bytes=fs.readFileSync(v.art);
 assert(html.includes('data-speakref="Psalm 34:'+n+'">'+escapeHTML(chapter[n])+'</p>'),'Exact BSB verse '+n);
 assert.equal((html.match(/role="tab"/g)||[]).length,4);assert.equal((html.match(/>Verse \d+ of \d+<\/option>/g)||[]).length,N);assert.equal((html.match(/data-verse-study-art=/g)||[]).length,1);
 assert(html.includes(n<N?'href="#/study/34/'+(n+1)+'"':'href="#/psalms/35"'));assert.equal(e.link('Psalm 34:'+n),'#/study/34/'+n);
 v.related.forEach(refCheck);
 assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert(bytes.length>20000,'art size '+n);assert(bytes.equals(fs.readFileSync('www/'+v.art)));assert(sw.includes(v.art));hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));
 assert.equal(p.production,v.art);assert.equal(p.status,'generated and visually inspected');assert(p.prompt.length>500);originals.add(p.generatedOriginal);
}
assert.equal(hashes.size,N);assert.equal(originals.size,N);
for(const[id,refs]of Object.entries(d.topicPlan))for(const r of refs){assert(c.window.BIBLE_DATA.topics.find(t=>t.id===id).refs.includes(r));assert.equal(c.window.BIBLE_DATA.verses[r],chapter[+r.split(':')[1]]);assert(c.window.SFL_CONNECTIONS.related({ref:r}).includes('href="#/help/'+id+'"'));}
assert.deepEqual(Array.from(s.people,p=>p.id),["david"]);for(const p of s.people){refCheck(p.ref);assert(c.window.PEOPLE.some(x=>x.id===p.id));}
assert.throws(()=>e.render(34,0,tools));assert.throws(()=>e.render(34,N+1,tools));assert.equal(e.link('Psalm 34:'+(N+1)),'');
const prev=b[18].chapters[32];assert(e.render(33,prev.length,{...tools,chapter:Object.fromEntries(prev)}).includes('href="#/study/34/1"'));
assert.equal(fs.readFileSync('psalm34.js','utf8'),fs.readFileSync('www/psalm34.js','utf8'));assert(sw.includes('./psalm34.js'));assert(fs.readFileSync('index.html','utf8').includes('src="psalm34.js"'));
console.log('PASS — Psalm 34: '+N+' exact BSB verses; individual notes and inspected paintings; references, people, needs, 33→34→35 navigation, offline and Android parity.');
