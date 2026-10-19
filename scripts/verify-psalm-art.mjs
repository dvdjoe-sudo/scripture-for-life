import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const values=new Map([['scripture-for-life.study-trail.psalm23','{"last":4,"completed":[2]}'],['scripture-for-life.notes','keep this reflection']]);
const ctx={window:{},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)}};
vm.runInNewContext(fs.readFileSync('psalm-art.js','utf8'),ctx);
const art=ctx.window.SFL_PSALM_ART;
assert.equal(art.progress(),4,'Previous place migrates without changing old data');
assert.equal(new Set([1,2,3,4,5,6].map(n=>art.render(n))).size,6);
for(let n=1;n<=6;n++){
  const html=art.verseNav(n);
  assert.equal((html.match(/href=/g)||[]).length,6,'All verses remain freely accessible');
  assert(!/complete|trail|finish/.test(html),'No completion or guided trail UI');
  assert.equal(art.progress(),n);
  assert(art.render(n).includes('role="img" aria-label="Psalm 23:'+n));
}
assert.equal(values.get('scripture-for-life.notes'),'keep this reflection');
ctx.localStorage.getItem=()=>{throw Error('blocked');};
ctx.localStorage.setItem=()=>{throw Error('blocked');};
assert.equal(art.progress(),1);
assert.doesNotThrow(()=>art.verseNav(3));
assert.throws(()=>art.render(7));
for(const name of ['psalm-art.js','psalm-art.css','psalm-navigation.js'])assert.equal(fs.readFileSync(name,'utf8'),fs.readFileSync('www/'+name,'utf8'));
console.log('PASS — Six verse illustrations, freely accessible verses, migrated place, preserved reflections, blocked storage, and matching Android assets.');
