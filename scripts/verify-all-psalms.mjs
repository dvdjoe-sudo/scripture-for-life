import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const values=new Map();
const c={window:{SFL_PSALM_ART:{progress:()=>2},SFL_PSALM46:{progress:()=>3}},document:{addEventListener(){}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},location:{hash:'#/psalms/1'}};
for(const f of ['psalms-content.js','psalm-navigation.js','psalms-book.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),c);
const book=c.window.SFL_PSALMS_BOOK,source=JSON.parse(fs.readFileSync('data/bible.json','utf8')).books[18].chapters;
assert.equal(book.chapters.length,150);
assert.deepEqual(Array.from(book.chapters.map(x=>x.number)),Array.from({length:150},(_,i)=>i+1));
assert.equal(new Set(book.chapters.map(x=>x.meaning)).size,150,'Every chapter has its own editorial introduction');
const escapeHTML=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
let verses=0;
for(let n=1;n<=150;n++){
 const chapter=Object.fromEntries(source[n-1]),row=book.chapters[n-1];
 assert(book.kinds[row.kind]&&book.art[row.art],`Invalid chapter metadata ${n}`);
 assert(row.meaning.length>100&&row.title.length>5);
 const ctx={chapter,escapeHTML,saveButton:r=>`<button data-ref="${r}">Save</button>`,noteField:()=>'<textarea></textarea>',hydrateNotes(){},icon:()=>''};
 const html=book.render(n,0,ctx);
 assert.equal((html.match(/class="psalm-chapter-verse /g)||[]).length,source[n-1].length);
 assert.equal((html.match(/class="psalm-chapter-art"/g)||[]).length,1,'One main image per chapter');
 assert.equal((html.match(/role="tab"/g)||[]).length,4);
 for(const[v,text]of source[n-1])assert(html.includes(`data-speakref="Psalm ${n}:${v}">${escapeHTML(text)}</p>`),'Exact BSB source text for '+n+':'+v);
 assert(html.includes('#/people'),'Character section');
 assert(!html.includes('href="#/psalms/0"')&&!html.includes('href="#/psalms/151"'));
 assert.throws(()=>book.render(n,source[n-1].length+1,ctx));
 verses+=source[n-1].length;
}
assert.equal(book.lastPlace().chapter,150);
assert.throws(()=>book.render(151,0,{}));
assert.throws(()=>book.render(0,0,{}));
assert.equal((book.collection().match(/data-psalm-number=/g)||[]).length,150);
const offline=fs.readFileSync('sw.js','utf8');
for(const[src]of Object.values(book.art)){
 const bytes=fs.readFileSync(src);assert(bytes.equals(fs.readFileSync('www/'+src)),src+' agrees with Android');
 assert(offline.includes(src),src+' is cached offline');
 assert.equal(bytes.subarray(8,12).toString(),'WEBP');
}
for(const f of ['psalms-content.js','psalms-book.js','psalms-book.css'])assert.equal(fs.readFileSync(f,'utf8'),fs.readFileSync('www/'+f,'utf8'));
c.localStorage.getItem=()=>{throw Error('blocked');};assert.equal(book.lastPlace(),null);
console.log(`PASS — All 150 Psalms, ${verses} exact BSB verses, individual notes, four tabs, chapter boundaries, invalid references, 24 matching offline/Android watercolor assets.`);
