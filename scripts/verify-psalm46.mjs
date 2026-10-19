import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context={window:{},document:{addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},location:{hash:'#/study/46/1'}};
for(const file of ['data.js','content.js','psalm46.js','study-trail.js','psalm-navigation.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const study=context.window.SFL_PSALM46;
const bible=JSON.parse(fs.readFileSync(path.join(root,'data/bible.json'),'utf8')).books;
const chapter=Object.fromEntries(bible[18].chapters[45]);
assert.equal(study.sections.length,6);
assert.deepEqual(Array.from(study.sections.flatMap(s=>s.verses)),[1,2,3,4,5,6,7,8,9,10,11],'Every verse is covered once, in order');
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function checkRef(ref){const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m,`Invalid reference ${ref}`);const book=bible.find(b=>b.name===m[1]);assert(book?.chapters[+m[2]-1]?.some(([v])=>v===+m[3]),`Missing Bible source: ${ref}`);}
for(const s of study.sections){assert(s.explain&&s.context&&s.explore.length&&s.reflect&&s.prayer);s.related.forEach(checkRef);}
const ctx={chapter,escapeHTML,scene:()=>'<svg class="landscape"></svg>',icon:()=>'',refURL:()=> '#/read/19/46',saveButton:ref=>`<button data-ref="${ref}">Save</button>`,noteField:()=>'<textarea></textarea>',hydrateNotes(){}};
for(let step=1;step<=6;step++){
  const html=study.render(step,ctx);
  assert.equal((html.match(/role="tab"/g)||[]).length,4);
  assert.equal((html.match(/class="verse-text"/g)||[]).length,study.sections[step-1].verses.length);
  for(const v of study.sections[step-1].verses){assert(html.includes(`data-speakref="Psalm 46:${v}">${escapeHTML(chapter[v])}</p>`),'Verse must match the existing BSB data exactly');assert.equal(study.link(`Psalm 46:${v}`),`#/study/46/${step}`);}
  assert(html.includes('#/people/jacob')&&html.includes('#/people/sons-of-korah'));
  assert(html.includes('#/help/fear')&&html.includes('#/help/strength'));
}
assert.equal(study.link('Psalm 46:12'),'');
assert.equal(study.link('Psalm 23:1'),'');
assert.throws(()=>study.render(7,ctx));
for(const id of ['jacob','sons-of-korah']){
  const person=context.window.PEOPLE.find(p=>p.id===id);
  assert(person?.psalm46,`Missing Psalm 46 profile: ${id}`);
  person.steps.forEach(step=>checkRef(step[2]));
}
assert(context.window.PEOPLE.find(p=>p.id==='jacob').storyRoute==='#/stories/8/1');
assert(fs.readFileSync(path.join(root,'sw.js'),'utf8').includes('./psalm46.js'),'Study must be available in the offline shell');
assert.equal(fs.readFileSync(path.join(root,'www/psalm46.js'),'utf8'),fs.readFileSync(path.join(root,'psalm46.js'),'utf8'),'Android and website studies must match');
console.log('PASS — Psalm 46: all 11 source verses, 6 sections, 4 tabs, valid related passages, Jacob/Korah profiles, help links, and matching offline/Android assets.');
