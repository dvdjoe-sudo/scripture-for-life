// Checks Psalms 37–40 editorial sources and unpublished illustration checkpoints.
// Published lazy text studies remain independently verified by verify-text-psalms.mjs.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const bible=read('data/bible.json').books,psalms=bible[18].chapters;
const ctx={window:{SFL_PSALMS:{switcher:()=>'<nav></nav>'}},document:{addEventListener(){}},location:{hash:'#/'},localStorage:{getItem:()=>null,setItem(){}}};
for(const f of ['data.js','content.js','exodus-people.js','psalm-verse-study.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx);
const engine=ctx.window.SFL_VERSE_STUDIES,people=ctx.window.PEOPLE,topics=ctx.window.BIBLE_DATA.topics;
const escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const checkRef=ref=>{const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m,ref);assert(bible.find(b=>b.name===m[1])?.chapters[+m[2]-1]?.some(([v,t])=>v===+m[3]&&t),'Invalid reference '+ref);};
const live=['index.html','sw.js','scripts/build-web.mjs','package.json','PSALMS_ROLLOUT.md'].map(f=>[f,fs.readFileSync(f,'utf8')]);
const counts={};
const generatedByPsalm={37:12};
for(let n=37;n<=40;n++){
  const dir='drafts/psalm'+n+'/',source=psalms[n-1],chapter=Object.fromEntries(source);
  const src=read(dir+'source.json');assert.deepEqual(src.verses,source,'Psalm '+n+' source.json must equal bundled BSB exactly');
  const ed=read(dir+'editorial.json'),study=JSON.parse(JSON.stringify(ed.study));
  if(n===37){
    const progress=read(dir+'progress.json');assert.equal(progress.completedThrough,generatedByPsalm[n]);assert.equal(progress.nextVerse,generatedByPsalm[n]+1);
    let next=1;
    for(const group of progress.groups){
      assert.equal(group.from,next);const checkpoint=read(dir+group.file);assert.equal(checkpoint.verses.length,group.through-group.from+1);
      checkpoint.verses.forEach((r,i)=>{assert.equal(r.verse,group.from+i);study.verses[r.verse-1]=r;});next=group.through+1;
    }
    assert.equal(next,progress.nextVerse);
    const audit=read(dir+'reference-audit.json');assert.equal(audit.reviewedThrough,progress.completedThrough);
    for(let i=0;i<progress.completedThrough;i++)for(const ref of study.verses[i].related)assert(audit.references.some(a=>a.ref===ref&&a.usedByVerses.includes(i+1)),'Missing contextual audit '+ref);
    for(const entry of audit.references){const m=/^(.+?) (\d+):(\d+)$/.exec(entry.ref);checkRef(entry.ref);const chapter=bible.find(b=>b.name===m[1]).chapters[+m[2]-1];for(const verse of entry.context)assert.deepEqual(verse,chapter.find(x=>x[0]===verse[0]),'Audit must preserve exact bundled BSB '+entry.ref);}
  }
  assert.equal(study.number,n);assert.equal(study.verses.length,source.length,'Psalm '+n+' covers every verse');
  for(const key of ['title','heading','meaning','context','reflect','alt'])assert.equal(new Set(study.verses.map(r=>r[key])).size,source.length,'Psalm '+n+' distinct '+key);
  const generated=generatedByPsalm[n]||0,hashes=new Set();
  study.verses.forEach((r,i)=>{
    assert(r.meaning.length>300&&r.context.length>140&&r.reflect.length>50,'Psalm '+n+':'+(i+1)+' note length');
    assert.equal(r.explore.length,2);assert(r.explore.every(x=>x.length===2&&x[1].length>50));
    assert(r.related.length>=2);r.related.forEach(checkRef);
    assert.equal(r.art,'assets/psalm'+n+'/verse-'+(i+1)+'-watercolor.webp');
    if(i<generated){const bytes=fs.readFileSync(r.art);assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert(bytes.length>50000,'Psalm '+n+':'+(i+1)+' art size');hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));}
    else assert(!fs.existsSync(r.art),'Unfinished art must remain absent: '+r.art);
  });
  for(const p of study.people){checkRef(p.ref);assert(people.some(x=>x.id===p.id),'Unknown person '+p.id);}
  for(const [id,refs] of Object.entries(ed.topicPlan)){assert(topics.some(t=>t.id===id),'Unknown topic '+id);for(const r of refs){checkRef(r);assert(r.startsWith('Psalm '+n+':'));}}
  // Render in a sandbox copy of the engine to confirm exact BSB text appears verbatim on every verse page.
  const sandbox={...ctx,window:{...ctx.window}};vm.runInNewContext(fs.readFileSync('psalm-verse-study.js','utf8'),sandbox);
  sandbox.window.SFL_VERSE_STUDIES.register(study);
  const tools={chapter,escapeHTML,icon:()=>'',refURL:r=>'#/read/'+r,saveButton:()=>'',noteField:()=>'',hydrateNotes(){}};
  for(let v=1;v<=source.length;v++){const html=sandbox.window.SFL_VERSE_STUDIES.render(n,v,tools);assert(html.includes('data-speakref="Psalm '+n+':'+v+'">'+escapeHTML(chapter[v])+'</p>'),'Exact BSB Psalm '+n+':'+v);}
  assert.equal(hashes.size,generated,'Psalm '+n+' generated art must be unique');
  const gp=read(dir+'generation-prompts.json');assert.equal(gp.paintings.length,source.length);assert.deepEqual(gp.pendingVerses,Array.from({length:source.length-generated},(_,i)=>i+generated+1));
  const originals=new Set();gp.paintings.forEach((p,i)=>{assert.equal(p.verse,i+1);assert(p.prompt.length>500);if(i<generated){assert.equal(p.status,'generated and visually inspected');assert(p.generatedOriginal);originals.add(p.generatedOriginal);}else{assert.equal(p.status,'prompt drafted; image not generated');assert(!('generatedOriginal' in p));}});assert.equal(originals.size,generated);
  if(generated){assert.deepEqual(read('assets/psalm'+n+'/generation-prompts.json'),gp,'Packaged prompt manifest parity');}else assert(!fs.existsSync('assets/psalm'+n),'No asset folder for Psalm '+n);
  assert(!fs.existsSync('psalm'+n+'.js'),'No runtime module for Psalm '+n);
  for(const [f,s] of live)assert(!s.includes('drafts/psalm'+n),f+' must not load unpublished Psalm '+n+' drafts');
  assert(!(n in engine.studies),'Psalm '+n+' must not be registered in the live app');
  counts[n]=source.length;
}
console.log('PASS — Psalms 37–40 editorial sources: exact BSB coverage',JSON.stringify(counts),'total',Object.values(counts).reduce((a,b)=>a+b),'verses; valid references/people/topics; Psalm 37 art checkpoint 1–12 verified; illustration drafts not wired.');
