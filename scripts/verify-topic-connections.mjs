import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx={window:{}};
for(const f of ['data.js','content.js','exodus-people.js','topic-connections.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx);
const {BIBLE_DATA:data,SFL_CONNECTIONS:links,PEOPLE:people}=ctx.window;
const bible=JSON.parse(fs.readFileSync('data/bible.json','utf8')).books;
const scenes={stories:JSON.parse(fs.readFileSync('data/story-scenes.json','utf8')),exodus:JSON.parse(fs.readFileSync('data/exodus-scenes.json','utf8'))};
assert.equal(Object.keys(links.connections).length,8);
for(const topic of data.topics){
 const c=links.connections[topic.id];assert(c);
 for(const ref of topic.refs){
  const [,name,ch,v]=/^(.+?) (\d+):(\d+)$/.exec(ref);
  assert.equal(data.verses[ref],bible.find(b=>b.name===name).chapters[+ch-1].find(([n])=>n===+v)[1],ref+' exact source');
  assert(links.related({ref}).includes('href="#/help/'+topic.id+'"'));
 }
 for(const [route,title] of c.stories){
  const [,book,ep,n]=/^#\/(stories|exodus)\/(\d+)\/(\d+)$/.exec(route);
  assert.equal(scenes[book][ep][+n-1].title,title);
  assert(links.related({route}).includes('href="#/help/'+topic.id+'"'));
 }
 for(const id of c.people){assert(people.some(p=>p.id===id));assert(links.related({personId:id}).includes('href="#/help/'+topic.id+'"'));}
 const html=links.topic(topic.id,r=>'#/psalms/'+r.split(' ')[1].replace(':','/'));
 assert(html.includes('Stories to read alongside.'));
 assert(html.includes('href="#/saved"'));
}
assert.equal(links.topic('missing',()=>''),'');
assert(links.related({ref:'Psalm 150:6'}).includes('Explore all needs'));
for(const f of ['topic-connections.js','data.js','psalm-verse-study.js','app.js','genesis.js','exodus.js']){
 assert(fs.readFileSync(f).equals(fs.readFileSync('www/'+f)),f+' Android parity');
}
console.log('PASS — All eight everyday needs: exact source passages, valid story scenes and people, reciprocal connections, shared Saved access, and Android parity.');
