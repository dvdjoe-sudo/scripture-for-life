// Checks the unwired Psalms 41–60 text drafts: exact BSB coverage, valid references, complete notes,
// distinct art prompts only (no images), and that nothing is wired into the live app yet.
// Psalm 46 already has a live six-section study (psalm46.js, assets/psalm46); for it the script checks
// that those live files are unchanged from origin/main instead of checking that they do not exist.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execSync} from 'node:child_process';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const bible=read('data/bible.json').books,psalms=bible[18].chapters;
const ctx={window:{SFL_PSALMS:{switcher:()=>'<nav></nav>'}},document:{addEventListener(){}},location:{hash:'#/'},localStorage:{getItem:()=>null,setItem(){}}};
for(const f of ['data.js','content.js','exodus-people.js','psalm-verse-study.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx);
const engine=ctx.window.SFL_VERSE_STUDIES,people=ctx.window.PEOPLE,topics=ctx.window.BIBLE_DATA.topics;
const escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const checkRef=ref=>{const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m,ref);assert(bible.find(b=>b.name===m[1])?.chapters[+m[2]-1]?.some(([v,t])=>v===+m[3]&&t),'Invalid reference '+ref);};
const live=['index.html','sw.js','scripts/build-web.mjs','package.json','PSALMS_ROLLOUT.md'].map(f=>[f,fs.readFileSync(f,'utf8')]);
const counts={};
const LIVE=new Set([46]);
for(let n=41;n<=60;n++){
  const dir='drafts/psalm'+n+'/',source=psalms[n-1],chapter=Object.fromEntries(source);
  const src=read(dir+'source.json');assert.deepEqual(src.verses,source,'Psalm '+n+' source.json must equal bundled BSB exactly');
  const ed=read(dir+'editorial.json'),study=ed.study;
  assert.equal(study.number,n);assert.equal(study.verses.length,source.length,'Psalm '+n+' covers every verse');
  for(const key of ['title','heading','meaning','context','reflect','alt'])assert.equal(new Set(study.verses.map(r=>r[key])).size,source.length,'Psalm '+n+' distinct '+key);
  study.verses.forEach((r,i)=>{
    assert(r.meaning.length>300&&r.context.length>140&&r.reflect.length>50,'Psalm '+n+':'+(i+1)+' note length');
    assert.equal(r.explore.length,2);assert(r.explore.every(x=>x.length===2&&x[1].length>50));
    assert(r.related.length>=2);r.related.forEach(checkRef);
    assert.equal(r.art,'assets/psalm'+n+'/verse-'+(i+1)+'-watercolor.webp');assert(!fs.existsSync(r.art),'Art must not be generated yet');
  });
  for(const p of study.people){checkRef(p.ref);assert(people.some(x=>x.id===p.id),'Unknown person '+p.id);}
  for(const [id,refs] of Object.entries(ed.topicPlan)){assert(topics.some(t=>t.id===id),'Unknown topic '+id);for(const r of refs){checkRef(r);assert(r.startsWith('Psalm '+n+':'));}}
  // Render in a sandbox copy of the engine to confirm exact BSB text appears verbatim on every verse page.
  const sandbox={...ctx,window:{...ctx.window}};vm.runInNewContext(fs.readFileSync('psalm-verse-study.js','utf8'),sandbox);
  sandbox.window.SFL_VERSE_STUDIES.register(study);
  const tools={chapter,escapeHTML,icon:()=>'',refURL:r=>'#/read/'+r,saveButton:()=>'',noteField:()=>'',hydrateNotes(){}};
  for(let v=1;v<=source.length;v++){const html=sandbox.window.SFL_VERSE_STUDIES.render(n,v,tools);assert(html.includes('data-speakref="Psalm '+n+':'+v+'">'+escapeHTML(chapter[v])+'</p>'),'Exact BSB Psalm '+n+':'+v);}
  const gp=read(dir+'generation-prompts.json');assert.equal(gp.paintings.length,source.length);assert.equal(gp.pendingVerses.length,source.length);
  gp.paintings.forEach((p,i)=>{assert.equal(p.verse,i+1);assert(p.prompt.length>500);assert(!('generatedOriginal' in p));});
  // Art prompts must be visually distinct: unique scenes, no repeated openings, at most one 'traveler' per psalm.
  const scenes=gp.paintings.map(p=>p.prompt.split('Verse '+p.verse+': ').pop().toLowerCase());
  assert.equal(new Set(scenes).size,scenes.length,'Psalm '+n+' distinct scenes');
  assert.equal(new Set(scenes.map(x=>x.split(/\s+/).slice(0,5).join(' '))).size,scenes.length,'Psalm '+n+' scene openings repeat');
  assert(scenes.filter(x=>x.includes('traveler')).length<=1,'Psalm '+n+' overuses traveler scenes');
  for(const [f,s] of live)assert(!s.includes('drafts/psalm'+n),f+' must not reference drafts/psalm'+n);
  if(LIVE.has(n)){
    const diff=execSync('git diff --name-only origin/main -- psalm'+n+'.js assets/psalm'+n,{encoding:'utf8'}).trim();
    assert.equal(diff,'','Live Psalm '+n+' files must be unchanged from main');
  }else{
    assert(!fs.existsSync('psalm'+n+'.js'),'No runtime module for Psalm '+n);assert(!fs.existsSync('assets/psalm'+n),'No asset folder for Psalm '+n);
    for(const [f,s] of live)assert(!s.includes('psalm'+n+'.js')&&!s.includes('#/study/'+n+'/'),f+' must not wire Psalm '+n);
    assert(!(n in engine.studies),'Psalm '+n+' must not be registered in the live app');
  }
  counts[n]=source.length;
}
console.log('PASS — Psalms 41–60 text drafts: exact BSB coverage',JSON.stringify(counts),'total',Object.values(counts).reduce((a,b)=>a+b),'verses; valid references/people/topics; distinct art prompts only; not wired (Psalm 46 live study unchanged).');
