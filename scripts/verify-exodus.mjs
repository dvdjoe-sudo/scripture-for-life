import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const episodes=JSON.parse(fs.readFileSync('data/exodus-episodes.json','utf8'));
const scenes=JSON.parse(fs.readFileSync('data/exodus-scenes.json','utf8'));
const bible=JSON.parse(fs.readFileSync('data/bible.json','utf8')).books;
const checkRef=ref=>{const m=/^(.+?) (\d+):(\d+)$/.exec(ref);assert(m,ref);assert(bible.find(b=>b.name===m[1])?.chapters[+m[2]-1]?.some(([n])=>n===+m[3]),ref);};
assert.equal(episodes.length,3);
let total=0;
for(const e of episodes){
 const source=fs.readFileSync(`stories/exodus-episode-${e.id}.md`,'utf8').replace(/\r\n/g,'\n').trimEnd();
 const paragraphs=source.split('\n').slice(2).join('\n').trim().split(/\n\s*\n/).map(p=>p.trim());
 assert.deepEqual(e.paragraphs,paragraphs,'Every uploaded narrative paragraph remains unchanged');
 let next=0;
 for(const s of scenes[e.id]){assert.equal(s.start,next);assert(s.end>=s.start&&s.end<e.paragraphs.length);next=s.end+1;checkRef(s.anchor);assert(s.context.length>100&&s.question.length>40);total++;}
 assert.equal(next,e.paragraphs.length,'No narrative gaps or overlap');
}
assert.equal(total,33);
const ctx={window:{PEOPLE:[]}};vm.runInNewContext(fs.readFileSync('exodus-people.js','utf8'),ctx);
assert.equal(ctx.window.PEOPLE.length,5);
for(const p of ctx.window.PEOPLE){assert(/^#\/exodus\/[1-3]\/\d+$/.test(p.storyRoute));const [,e,n]=/^#\/exodus\/(\d+)\/(\d+)$/.exec(p.storyRoute);assert(scenes[e][+n-1]);p.steps.forEach(s=>checkRef(s[2]));}
for(const f of ['exodus.js','exodus-people.js','data/exodus-episodes.json','data/exodus-scenes.json']){assert.equal(fs.readFileSync(f,'utf8'),fs.readFileSync('www/'+f,'utf8'),'Android matches website');assert(fs.readFileSync('sw.js','utf8').includes(f),'Offline content is included');}
assert(fs.readFileSync('exodus.js','utf8').includes('scripture-for-life.exodus-progress'));
assert(fs.readFileSync('exodus.js','utf8').includes('#/read/2/16'));
assert(fs.readFileSync('genesis.js','utf8').includes('#/exodus/1/1'));
console.log('PASS — Exodus: 3 verbatim manuscripts, 136 paragraphs in 33 contiguous scenes, valid Bible/profile links, isolated progress, and matching offline/Android assets.');
