// Verifies the text-only (no artwork yet) verse studies for Psalms 37-150, except 46.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const c={window:{SFL_PSALMS:{switcher:()=>'<nav></nav>'}},document:{addEventListener(){}},location:{hash:'#/'},localStorage:{getItem:()=>null,setItem(){}}};
for(const p of ['data.js','psalm-verse-study.js','psalm36.js','psalm-text-studies.js'])vm.runInNewContext(fs.readFileSync(p,'utf8'),c);
const e=c.window.SFL_VERSE_STUDIES,bible=read('data/bible.json').books[18].chapters;
const E=v=>String(v).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8'),build=fs.readFileSync('scripts/build-web.mjs','utf8');
assert.ok(html.includes('<script src="psalm-text-studies.js" defer></script>'));assert.ok(sw.includes("'./psalm-text-studies.js'"));
assert.ok(build.includes("'psalm-text-studies.js'")&&build.includes("'psalms-text'"));
for(let n=1;n<=36;n++)assert.ok(!fs.existsSync(`psalms-text/psalm${n}.js`));assert.ok(!fs.existsSync('psalms-text/psalm46.js'));
assert.equal(e.has(46),false,'Psalm 46 keeps its own six-section study');
let total=0;
for(let n=37;n<=150;n++){if(n===46)continue;
 const src=bible[n-1],ch=Object.fromEntries(src),N=src.length;assert.equal(e.count(n),N,`count ${n}`);assert.ok(e.has(n));
 assert.equal(e.link(`Psalm ${n}:${N}`),`#/study/${n}/${N}`);assert.equal(e.link(`Psalm ${n}:${N+1}`),'');
 assert.ok(!html.includes(`psalms-text/psalm${n}.js`),'lazy, not eager');
 vm.runInNewContext(fs.readFileSync(`psalms-text/psalm${n}.js`,'utf8'),c);const s=e.studies[n],d=read(`drafts/psalm${n}/editorial.json`).study;
 assert.deepEqual(read(`drafts/psalm${n}/source.json`).verses,src,`BSB source ${n}`);
 assert.equal(s.number,n);assert.equal(s.verses.length,N);assert.equal(s.title,d.title);
 s.verses.forEach((v,i)=>{for(const k of ['title','heading','meaning','contextTitle','context','reflect'])assert.equal(v[k],d.verses[i][k]);assert.ok(!v.art);assert.ok(v.explore.length>=2&&v.related.length>=2);});
 const t={chapter:ch,escapeHTML:E,icon:()=>'',refURL:r=>'#/read/'+r,saveButton:()=>'<b></b>',noteField:()=>'<textarea></textarea>',hydrateNotes(){}};
 for(const i of [1,N]){const out=e.render(n,i,t);assert.ok(!/<img|watercolor|psalm-verse-landscape/i.test(out),`no art ${n}:${i}`);assert.ok(out.includes('text-only'));assert.ok(out.includes(E(ch[i])),`exact BSB ${n}:${i}`);
  if(i===N&&n<150)assert.ok(out.includes(`href="#/study/${n+1}/1"`),`next ${n}`);}
 total+=N;}
assert.ok(e.render(150,6,{chapter:Object.fromEntries(bible[149]),escapeHTML:E,icon:()=>'',refURL:r=>r,saveButton:()=>'',noteField:()=>'',hydrateNotes(){}}).includes('href="#/psalms/150"'));
assert.ok(e.render(36,12,{chapter:Object.fromEntries(bible[35]),escapeHTML:E,icon:()=>'',refURL:r=>r,saveButton:()=>'',noteField:()=>'',hydrateNotes(){}}).includes('href="#/study/37/1"'));
console.log(`Text-only verse studies verified: ${total} verses across Psalms 37-150 (46 unchanged).`);
