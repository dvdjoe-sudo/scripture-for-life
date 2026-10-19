/* Scripture for Life — portable, framework-free source edition.
 * Scripture: Berean Standard Bible (public domain, https://berean.bible/terms.htm)
 * Local-only bookmarks and notes; no account, tracking, or backend.
 */
'use strict';

const HELP = [
  {id:'fear',icon:'🕊️',title:'When I feel afraid',short:'Courage and peace in fearful moments.',intro:'Fear can feel overwhelming. These passages offer invitations to remember God’s presence and seek peace.',refs:['Isaiah 41:10','Psalm 56:3','2 Timothy 1:7','Joshua 1:9','John 14:27'],reflect:'What would it mean to take one small step today while remembering that you are not alone?'},
  {id:'anxiety',icon:'🌿',title:'Worry & anxiety',short:'Words for a troubled or restless mind.',intro:'Scripture does not ask us to pretend we are never worried. These passages speak of prayer, daily concerns, and comfort.',refs:['Philippians 4:6-7','1 Peter 5:7','Matthew 6:34','Psalm 94:19','John 14:1'],reflect:'Which worry could you name honestly in prayer today?'},
  {id:'health',icon:'✚',title:'Health & strength',short:'Compassion and hope during illness.',intro:'When bodies are hurting or strength is low, Scripture offers prayer and consolation. Spiritual encouragement complements, but does not replace, medical care.',refs:['Psalm 34:18','James 5:14-15','Psalm 147:3','2 Corinthians 12:9','Isaiah 40:29'],reflect:'Who could offer practical support, prayer, or help as you move through this season?'},
  {id:'grief',icon:'🌧️',title:'Loss & grief',short:'Comfort when you are missing someone.',intro:'The Bible makes room for tears, sorrow, and the longing for restoration.',refs:['Matthew 5:4','Revelation 21:4','Psalm 34:18','John 11:35','Psalm 23:4'],reflect:'What would it look like to give yourself space to grieve, without rushing?'},
  {id:'hope',icon:'☀️',title:'Finding hope',short:'Promises to hold onto in difficult times.',intro:'These passages point toward perseverance, renewal, and the hope rooted in God.',refs:['Romans 15:13','Jeremiah 29:11','Lamentations 3:22-23','Isaiah 40:31','Romans 8:28'],reflect:'What small sign of hope can you notice today?'},
  {id:'loneliness',icon:'🤲',title:'Feeling alone',short:'Reminders of presence and belonging.',intro:'Loneliness can make even ordinary days heavy. These verses speak about faithfulness and presence.',refs:['Deuteronomy 31:8','Psalm 27:10','Matthew 28:20','Isaiah 43:2','Hebrews 13:5'],reflect:'Is there a person or community you could reach out to today?'},
  {id:'forgiveness',icon:'❤️',title:'Forgiveness & mercy',short:'Grace, reconciliation, and new beginnings.',intro:'Forgiveness is an important biblical theme, alongside truth, repentance, mercy, and wisdom.',refs:['1 John 1:9','Ephesians 4:32','Psalm 103:12','Colossians 3:13','Matthew 6:14'],reflect:'What does a wise next step toward grace or healing look like in your situation?'},
  {id:'guidance',icon:'🧭',title:'Direction & purpose',short:'Wisdom when the way forward is unclear.',intro:'These passages encourage trust, discernment, and seeking God’s wisdom for choices.',refs:['Proverbs 3:5-6','James 1:5','Psalm 119:105','Psalm 32:8','Isaiah 30:21'],reflect:'What decision needs thought, prayer, and perhaps trusted advice?'}
];

const CHARACTERS = [
  {name:'Adam & Eve',icon:'🌱',role:'The first people',range:'Genesis 1–3',description:'Creation, companionship, choice, and the consequences of leaving Eden.',story:'1',ref:'Genesis 2:7'},
  {name:'Cain & Abel',icon:'🌾',role:'Two brothers',range:'Genesis 4',description:'An offering, anger, a warning, and the first recorded murder.',story:'2',ref:'Genesis 4:8'},
  {name:'Noah',icon:'🌈',role:'A man who found favor',range:'Genesis 6–9',description:'Faithfulness against the backdrop of violence and coming judgment. A longer story chapter is not yet published.',ref:'Genesis 6:8'},
  {name:'Abraham',icon:'⭐',role:'Called to a new land',range:'Genesis 12–25',description:'A journey of faith, promise, waiting, and trust.',ref:'Genesis 12:1'},
  {name:'Moses',icon:'🔥',role:'Leader of the Exodus',range:'Exodus–Deuteronomy',description:'A reluctant leader called to confront Pharaoh and guide Israel.',ref:'Exodus 3:10'},
  {name:'Ruth',icon:'🌾',role:'Faithful friend and family',range:'Ruth 1–4',description:'Loyalty, courage, and unexpected provision.',ref:'Ruth 1:16'},
  {name:'David',icon:'🎵',role:'Shepherd and king',range:'1 Samuel 16 onward',description:'A young shepherd, a king, a musician, and a complex human life.',ref:'1 Samuel 16:13'},
  {name:'Jesus',icon:'✝️',role:'At the center of the Gospels',range:'Matthew, Mark, Luke & John',description:'His teachings, compassion, crucifixion, and resurrection as recorded in the Gospels.',ref:'John 3:16'},
  {name:'Mary Magdalene',icon:'🕯️',role:'Follower and witness',range:'Luke 8; John 20',description:'A devoted follower of Jesus and witness to the empty tomb.',ref:'John 20:18'},
  {name:'Paul',icon:'✉️',role:'Missionary and letter writer',range:'Acts 9 onward',description:'From persecutor to messenger, with letters that shaped the early church.',ref:'Acts 9:15'}
];

let bible = null;
let episodes = null;
let storyScenes = null;
let books = new Map();
let versesIndex = [];
let toastTimer = null;
let readingQueue = [];
let speechActive = false;
const app = document.getElementById('main');

const esc = s => String(s ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const route = (path, options = {}) => `#/${path}${Object.keys(options).length?'?'+new URLSearchParams(options).toString():''}`;
const readRoute = (book,chapter,verse) => route('read',Object.assign({book,chapter},verse?{verse}:{}));
const plainRef = ref => /^(.*?)\s+(\d+):(\d+)(?:-(\d+))?$/.exec(ref);
const getStored = (key, fallback) => {try{return JSON.parse(localStorage.getItem('sfl-'+key))??fallback;}catch{return fallback;}};
const setStored = (key, value) => {try{localStorage.setItem('sfl-'+key,JSON.stringify(value));return true;}catch{toast('Unable to save on this device');return false;}};
const bookmarks = () => getStored('bookmarks',[]);
const notes = () => getStored('notes',{});
const bookmarked = ref => bookmarks().includes(ref);
const totalSaved = () => bookmarks().length;
function notifySavedCount(){document.getElementById('saved-count').textContent=totalSaved();}
function toast(msg){let node=document.getElementById('toast');node.textContent=msg;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),2800);}

function getRef(ref){
  const match=plainRef(ref);if(!match)return null;
  const [,book,chapStr,startStr,endStr]=match;
  const b=books.get(book.toLowerCase());if(!b)return null;
  const ch=Number(chapStr),start=Number(startStr),end=Number(endStr||startStr);
  if(end-start>50)return null;
  const chapter=b.chapters[ch-1];if(!chapter)return null;
  const lines=chapter.filter(([v])=>v>=start&&v<=end);
  if(!lines.length)return null;
  return {book:b.name,chapter:ch,verse:start,text:lines.map(([v,text])=>text).join(' '),verses:lines};
}
function referenceCard(ref,context){
  const data=getRef(ref);if(!data)return `<p>Reference not available: ${esc(ref)}</p>`;
  return `<article class="verse-card"><a class="reference" href="${readRoute(data.book,data.chapter,data.verse)}">${esc(ref)} · BSB ↗</a><p class="verse-text">${esc(data.text)}</p>${context?`<p class="context">${esc(context)}</p>`:''}
    <div class="verse-actions"><button data-bookmark="${esc(ref)}">${bookmarked(ref)?'♥ Saved':'♡ Save verse'}</button><button data-note="${esc(ref)}">✎ Note</button><button data-speak="${esc(ref)}">▶ Listen</button><a href="${readRoute(data.book,data.chapter,data.verse)}">Read chapter ↗</a></div>
    <div id="notes-${safeId(ref)}" class="note-area" hidden></div></article>`;
}
const safeId = str => str.replace(/[^a-zA-Z0-9]/g,'_');
const pageHeader = (eyebrow,title,description) => `<div class="page-head"><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1>${description?`<p>${esc(description)}</p>`:''}</div>`;
function setPage(html,title,keepScroll=false){app.innerHTML=html;document.querySelectorAll('img[src^="assets/scenes/"]').forEach(img=>{const base=img.getAttribute('src').split('/').pop();if(window.STANDALONE_ART&&window.STANDALONE_ART[base])img.src=window.STANDALONE_ART[base];});document.title=`${title} | Scripture for Life`;notifySavedCount();document.querySelectorAll('[data-tab]').forEach(a=>a.classList.toggle('active',location.hash.startsWith('#/'+a.dataset.tab)));if(!keepScroll)window.scrollTo(0,0);}

function home(){
  let topics=HELP.map(t=>`<a href="${route('help',{topic:t.id})}" class="card card-link"><div class="card-icon">${t.icon}</div><h3>${esc(t.title)}</h3><p>${esc(t.short)}</p><div class="card-arrow">Explore verses →</div></a>`).join('');
  let verse=getRef('Psalm 23:1');
  setPage(`<section class="hero"><div><div class="eyebrow">WELCOME · SCRIPTURE FOR LIFE</div><h1>Whatever you're facing, start with God's Word.</h1><p>Find Scripture for real-life moments, discover the people behind the stories, and hear the Bible in a more personal way.</p><div class="hero-actions"><a class="btn btn-primary" href="#/help">Find words for today →</a><a class="btn btn-outline-light" href="#/stories">Explore Bible stories</a></div></div></section>
  <section class="section"><div class="section-header"><div><div class="eyebrow">WORDS FOR THE MOMENT</div><h2>What is on your heart?</h2></div><a class="text-link" href="#/help">View all topics →</a></div><div class="grid grid-4">${topics}</div></section>
  <section class="section"><div class="verse-feature"><div class="eyebrow">A VERSE TO BEGIN WITH</div><blockquote>“${esc(verse?.text||'The LORD is my shepherd; I shall not want.')}”</blockquote><cite>Psalm 23:1 · Berean Standard Bible</cite><div class="hero-actions" style="justify-content:center"><a class="btn btn-outline" href="#/study">Explore Psalm 23 →</a><button class="btn btn-outline" data-speak="Psalm 23:1">▶ Listen</button></div></div></section>
  <section class="section"><div class="section-header"><div><div class="eyebrow">STORIES THAT STAY WITH US</div><h2>The book of Genesis comes alive</h2></div><a class="text-link" href="#/stories">All stories →</a></div><div class="grid grid-2">${episodeCards()}</div></section>
  <section class="section"><div class="strip"><h3>Read the Bible, not just about the Bible.</h3><p>All 66 books of the public-domain Berean Standard Bible are available here, with bookmarks, personal notes, and browser-based read-aloud.</p><a class="btn btn-outline" href="#/read">Open the Bible →</a></div></section>`,'Home');
}
function help(topicId){
  let selected=HELP.find(t=>t.id===topicId)||HELP[0];
  let side=HELP.map(t=>`<a class="${selected.id===t.id?'active':''}" href="${route('help',{topic:t.id})}">${t.icon} ${esc(t.title)}</a>`).join('');
  setPage(`${pageHeader('FIND HELP IN GOD’S WORD','Scripture for what you’re going through','Choose a life moment to find exact verses and gentle reflection prompts.')}
    <div class="topic-list"><aside class="topic-side" aria-label="Help topics">${side}</aside><section class="topic-main"><div class="card" style="margin-bottom:18px"><span class="pill">${selected.icon} ${esc(selected.title)}</span><h2 style="margin-top:15px">You can bring this to God.</h2><p>${esc(selected.intro)}</p></div><div class="verse-stack">${selected.refs.map(ref=>referenceCard(ref)).join('')}</div><div class="strip" style="margin-top:22px"><div class="kicker">A QUESTION TO SIT WITH</div><p>${esc(selected.reflect)}</p></div><p class="disclaimer">These reflections are devotional guidance, not a substitute for urgent medical, mental-health, or safety support.</p></section></div>`,'Find Help');
}
function storyProgress(){return getStored('story-progress',{});}
function sceneURL(id,scene,view='scene'){return route('episode',{id,scene,...(view==='full'?{view:'full'}:{})});}
function savedScene(id){return Math.max(1,Number(storyProgress()[id]?.scene)||1);}
function saveStoryProgress(id,scene,completed=false){
 const all=storyProgress();const old=all[id]||{};
 all[id]={scene:Math.max(1,Number(scene)),completed:old.completed||completed,updatedAt:new Date().toISOString()};
 setStored('story-progress',all);
}
function episodeCards(){return episodes.map(ep=>{
 const scene=savedScene(ep.id);const saved=storyProgress()[ep.id];
 return `<a class="story-tile" href="${sceneURL(ep.id,scene)}"><img src="assets/scenes/genesis-${esc(ep.id)}-1.svg" alt="Symbolic illustration for ${esc(ep.title)}" loading="lazy" />
 <div class="story-tile-body"><div class="eyebrow">GENESIS · EPISODE ${esc(ep.id)}</div><h3>${esc(ep.title)}</h3><p>${esc(ep.description)}</p>
 <div class="story-tile-foot"><span>${saved?.completed?'✓ Completed':saved?'Resume scene '+scene:'6 illustrated scenes'}</span><strong>${saved?'Continue reading':'Start reading'} →</strong></div></div></a>`;
 }).join('');}
function stories(){
 let chars=CHARACTERS.map(p=>`<article class="card"><div class="character-avatar">${p.icon}</div><div class="eyebrow">${esc(p.role)}</div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><p class="small muted">${esc(p.range)}</p><a class="text-link" href="${p.story?sceneURL(p.story,savedScene(p.story)):refRoute(p.ref)}">${p.story?'Read the story →':'Open Scripture →'}</a></article>`).join('');
 setPage(`${pageHeader('STORIES OF SCRIPTURE','Step inside the stories','Illustrated chapters let you read a scene, explore the Scripture behind it, and reflect before continuing.')}
 <section class="storybook-feature"><div class="eyebrow">THE STORY BEGINS · GENESIS</div><h2>In the beginning</h2><p>From the first light to life beyond Eden. Read the original story, discover its biblical setting, and carry a question into the next scene.</p>
 <div class="hero-actions"><a class="btn btn-light" href="${sceneURL('1',savedScene('1'))}">${storyProgress()['1']?'Continue Genesis':'Begin Episode 1'} →</a><a class="btn btn-outline-light" href="${readRoute('Genesis',1)}">Read Genesis in the Bible</a></div></section>
 <section class="section"><div class="section-header"><div><div class="eyebrow">EXPLORE THE STORY</div><h2>Genesis · the opening episodes</h2></div></div><div class="grid grid-2">${episodeCards()}</div></section>
 <section class="section"><div class="section-header"><div><div class="eyebrow">PEOPLE IN THE STORY</div><h2>Meet the characters</h2></div></div><div class="grid grid-3">${chars}</div></section>`,'People & Stories');
}
function refRoute(ref){let d=getRef(ref);return d?readRoute(d.book,d.chapter,d.verse):'#/read';}
function storyParagraph(p){return /^“|^"/.test(p)&&/[”"]/.test(p)?`<blockquote>${esc(p)}</blockquote>`:`<p>${esc(p)}</p>`;}
function storyNotes(){return getStored('story-notes',{});}
function chapterTools(e,scene){
 const v=getRef(scene.anchor);
 return `<div class="story-learn">
  <details class="story-discover"><summary><span>📖 <strong>Explore the Scripture</strong></span><span class="story-detail-arrow">+</span></summary><div class="story-discover-content"><div class="eyebrow">BEREAN STANDARD BIBLE · EXACT VERSE</div>
  ${v?`<blockquote>“${esc(v.text)}”</blockquote>`:''}
  <a class="text-link" href="${refRoute(scene.anchor)}">${esc(scene.anchor)} · Read in context →</a><p class="small muted">Scene covers ${esc(scene.passage)}.</p></div></details>
  <details class="story-discover"><summary><span>✧ <strong>Understand this moment</strong></span><span class="story-detail-arrow">+</span></summary><div class="story-discover-content"><div class="eyebrow">INTERPRETIVE NOTE · NOT BIBLE TEXT</div><p>${esc(scene.context)}</p></div></details>
  <details class="story-discover"><summary><span>🪶 <strong>Pause & reflect</strong></span><span class="story-detail-arrow">+</span></summary><div class="story-discover-content"><div class="eyebrow">A THOUGHT TO CARRY</div><p>${esc(scene.question)}</p>
  <label class="field-label" for="reflection-input">My reflection (saved only on this device)</label><textarea class="saved-note story-journal" id="reflection-input" placeholder="Write what stood out to you…">${esc(storyNotes()[`${e.id}-${scene.id}`]||'')}</textarea><button type="button" class="btn btn-primary btn-sm" data-save-story-reflection="${esc(e.id)}-${esc(scene.id)}">Save reflection</button></div></details>
 </div>`;
}
function story(id,sceneParam,view='scene'){
 const e=episodes.find(ep=>ep.id===id);if(!e){setPage('<div class="empty-state"><h2>That episode isn’t available yet.</h2><a href="#/stories">Return to stories</a></div>','Stories');return;}
 const scenes=storyScenes[id]||[];if(!scenes.length)return;
 const index=Math.max(0,Math.min(scenes.length-1,(Number(sceneParam)||savedScene(id))-1));
 const scene=scenes[index];const next=episodes.find(ep=>Number(ep.id)===Number(id)+1);
 // Browsing in full-text mode does not overwrite the last illustrated scene.
 if(view!=='full'&&savedScene(id)!==index+1)saveStoryProgress(id,index+1);
 const isFull=view==='full';
 const header=`<div class="storybook-top"><a class="text-link small" href="#/stories">← Story library</a><span class="story-top-logo">✦ SCRIPTURE FOR LIFE</span></div>
 <div class="story-chapter-heading"><span class="eyebrow">THE BOOK OF GENESIS · EPISODE ${esc(e.id)}</span><h1>${esc(e.title)}</h1><p>${esc(e.subtitle)} · Narrative adaptation of Genesis</p></div>
 <div class="story-mode-bar"><div class="story-view-switch" aria-label="Story reading mode"><a href="${sceneURL(id,index+1)}" class="${!isFull?'current':''}" ${!isFull?'aria-current="page"':''}>Illustrated scenes</a><a href="${sceneURL(id,index+1,'full')}" class="${isFull?'current':''}" ${isFull?'aria-current="page"':''}>Full story</a></div><button type="button" class="toolbar-btn" data-speak-story="${esc(e.id)}">▶ Listen to episode</button></div>`;
 if(isFull){
  const content=e.paragraphs.map((p,i)=>`${i&&i%9===0?'<div class="scene-break" aria-hidden="true">✦ ✦ ✦</div>':''}${storyParagraph(p)}`).join('');
  setPage(`<div class="story-read storybook">${header}<article class="story-paper">${content}</article><div class="story-next"><a class="btn btn-outline" href="${sceneURL(id,index+1)}">← Illustrated scenes</a>${next?`<a class="btn btn-primary" href="${sceneURL(next.id,savedScene(next.id))}">Continue: ${esc(next.title)} →</a>`:'<a class="btn btn-outline" href="#/stories">All stories →</a>'}</div><p class="disclaimer">Adapted narrative. Use the Bible reading links in illustrated mode to read the source text directly.</p></div>`,e.title);return;
 }
 const content=e.paragraphs.slice(scene.start,scene.end+1).map(storyParagraph).join('');
 const completion=storyProgress()[id]?.completed;
 const sceneNav=scenes.map((s,i)=>`<a class="story-progress-step ${i===index?'active':''}" href="${sceneURL(id,i+1)}" aria-label="Scene ${i+1}: ${esc(s.title)}" ${i===index?'aria-current="step"':''} title="${esc(s.title)}"><span></span></a>`).join('');
 let nextButton=index+1<scenes.length?`<a class="btn btn-primary" href="${sceneURL(id,index+2)}">Continue the story →</a>`:
 next?`<button type="button" data-finish-episode="${esc(id)}" data-go-next="${esc(next.id)}" class="btn btn-primary">${completion?'Next episode':'Finish & continue'} →</button>`:`<button type="button" data-finish-episode="${esc(id)}" class="btn btn-primary">${completion?'✓ Episode completed':'Mark episode complete ✓'}</button>`;
 setPage(`<div class="story-read storybook">${header}
  <div class="scene-counter"><span>SCENE ${index+1} OF ${scenes.length}</span><span>${esc(scene.passage)}</span></div><nav class="story-progress-track" aria-label="Scenes">${sceneNav}</nav>
  <figure class="scene-art"><img src="assets/scenes/genesis-${esc(id)}-${index+1}.svg" alt="Symbolic illustration for ${esc(scene.title)}"/><figcaption><span>GENESIS · ${esc(e.id)}.${index+1}</span><h2>${esc(scene.title)}</h2></figcaption></figure>
  <article class="story-paper scene-reading" aria-label="Story narration">${content}</article>
  <div class="scene-listen"><button type="button" class="toolbar-btn" data-speak-scene="${esc(id)}|${index}">▶ Listen to this scene</button><span>Narrative retelling, not a word-for-word Bible translation.</span></div>
  ${chapterTools(e,scene)}
  <div class="scene-buttons">${index>0?`<a class="btn btn-outline" href="${sceneURL(id,index)}">← Previous scene</a>`:`<a class="btn btn-outline" href="#/stories">← All stories</a>`}${nextButton}</div>
  <div class="story-next-episode"><strong>${index===scenes.length-1?'At the end of this episode':'Coming next'}</strong><p>${index<scenes.length-1?esc(scenes[index+1].title):next?`Episode ${esc(next.id)}: ${esc(next.title)}`:'The next Genesis chapter is not yet published.'}</p></div>
  <div class="disclaimer">The story text comes from your Genesis narrative files. Illustrations are symbolic artwork; reflections are explanatory and may involve interpretation. Compare each scene with the linked Berean Standard Bible passage.</div></div>`,`${e.title} · Scene ${index+1}`);
}
function read(bookName='Genesis',chapterValue='1',highlight){
 const b=books.get(String(bookName).toLowerCase())||bible.books[0];
 const chapter=Math.max(1,Math.min(b.chapters.length,Number(chapterValue)||1));
 const lines=b.chapters[chapter-1];
 const selectBooks=bible.books.map(item=>`<option value="${esc(item.name)}" ${item.name===b.name?'selected':''}>${esc(item.name)}</option>`).join('');
 const selectChapters=b.chapters.map((c,i)=>`<option value="${i+1}" ${i+1===chapter?'selected':''}>Chapter ${i+1}</option>`).join('');
 const markup=lines.map(([v,txt])=>`<span class="inline-verse" id="verse-${v}" data-select-verse="${v}" tabindex="0" role="button" aria-label="Save or annotate ${esc(b.name)} ${chapter}:${v}"><sup class="verse-no">${v}</sup>${esc(txt)} </span>`).join('');
 const first=`${b.name} ${chapter}:1`;
 const prev = chapter>1?readRoute(b.name,chapter-1):null;
 const next = chapter<b.chapters.length?readRoute(b.name,chapter+1):null;
 setPage(`${pageHeader('READ THE BIBLE','The Word, chapter by chapter','Browse every chapter of the Berean Standard Bible, free to read and share.')}
 <form class="reader-controls" id="reader-form"><label>Book<select name="book" id="book-select">${selectBooks}</select></label><label>Chapter<select name="chapter" id="chapter-select">${selectChapters}</select></label><button type="submit" class="btn btn-primary">Go to chapter →</button><button type="button" class="btn btn-outline" data-speak-chapter="${esc(b.name)}|${chapter}">▶ Listen</button></form>
 <article class="chapter-reader"><header><div class="eyebrow">BEREAN STANDARD BIBLE</div><h2>${esc(b.name)} ${chapter}</h2><p class="muted">Tap any verse to save it or add a personal note.</p></header><p class="verses">${markup}</p><div id="verse-tools" class="note-area" hidden></div><div class="reader-footer">${prev?`<a class="btn btn-outline" href="${prev}">← Previous</a>`:'<span></span>'}${next?`<a class="btn btn-outline" href="${next}">Next chapter →</a>`:'<span></span>'}</div></article>
 <section class="section"><h3>Search for a verse or a phrase</h3>${searchForm('')}</section>` ,`${b.name} ${chapter}`);
 if(highlight){let target=document.getElementById('verse-'+highlight);if(target){target.style.background='#f3e7c5';requestAnimationFrame(()=>target.scrollIntoView({behavior:'smooth',block:'center'}));}}
}
function searchForm(query){return `<form id="search-form" class="search-form" role="search"><input type="search" name="q" value="${esc(query)}" placeholder="Try ‘peace’ or ‘John 3:16’" aria-label="Search Bible" required /><button class="btn btn-primary" type="submit">Search</button></form>`;}
function search(query){
 const q=query.trim();if(!q){read();return;}
 let found=plainRef(q);if(found&&getRef(q)){let r=getRef(q);location.hash=readRoute(r.book,r.chapter,r.verse);return;}
 const terms=q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
 const matches=versesIndex.filter(v=>terms.every(t=>v.text.toLowerCase().includes(t)));
 let shown=matches.slice(0,80);
 setPage(`${pageHeader('EXPLORE SCRIPTURE','Search the Bible',`Results for “${q}”`)}<div class="search-panel">${searchForm(q)}</div><p class="result-count">${matches.length.toLocaleString()} ${matches.length===1?'verse':'verses'} found${matches.length>80?' · Showing first 80':''}</p><div class="verse-stack">${shown.length?shown.map(x=>referenceCard(x.ref)).join(''):'<div class="empty-state"><h3>No verses found</h3><p>Try a simpler word or an exact verse reference like Psalm 23:1.</p></div>'}</div>`,'Search');
}
function saved(){
 let marks=bookmarks(), allNotes=notes();
 let entries=marks.map(ref=>`<article class="saved-entry">${referenceCard(ref)}${allNotes[ref]?`<div class="strip" style="margin-top:9px"><strong>Your note</strong><p>${esc(allNotes[ref])}</p></div>`:''}</article>`).join('');
 let noteOnly=Object.keys(allNotes).filter(ref=>allNotes[ref]&&!marks.includes(ref)).map(ref=>`<article class="saved-entry">${referenceCard(ref)}<div class="strip" style="margin-top:9px"><strong>Your note</strong><p>${esc(allNotes[ref])}</p></div></article>`).join('');
 setPage(`${pageHeader('YOUR QUIET SPACE','Saved verses & notes','Keep passages close and write reflections. Everything stays in this browser on this device.')}
 ${!entries&&!noteOnly?`<div class="empty-state"><div class="card-icon">♡</div><h3>Nothing saved yet</h3><p>Save meaningful verses while reading Scripture or exploring help topics.</p><a href="#/help" class="btn btn-primary">Find verses →</a></div>`:`<div class="verse-stack">${entries}${noteOnly}</div><div class="action-row"><button class="btn btn-outline" id="export-notes">↓ Export notes (.json)</button></div>`}
 <p class="disclaimer">Saved material uses your browser’s local storage. Clearing browser data can erase it. Use Export notes for a backup.</p>`,'Saved');
}
function study(){
 const sections=[
  {ref:'Psalm 23:1',title:'A shepherd who cares',meaning:'In its ancient setting, a shepherd guides, feeds, and protects the flock. David uses that relationship as an image of personal trust in the LORD.',prompt:'Where do you most need guidance today?'},
  {ref:'Psalm 23:2-3',title:'Rest and restoration',meaning:'The images of green pasture and still water evoke provision, safety, and renewal. Restoration is not the same as a promise that life will always be easy.',prompt:'What would receiving rest look like for you right now?'},
  {ref:'Psalm 23:4',title:'In the darkest valley',meaning:'The psalm does not deny danger or grief. It shifts attention to God’s presence within the valley, rather than an escape from every trial.',prompt:'What helps you remember that you are not abandoned when things are hard?'},
  {ref:'Psalm 23:5',title:'A table in trouble',meaning:'The image changes from shepherding to hospitality. The meal and overflowing cup portray honor and abundance, even while opposition remains.',prompt:'Where have you experienced unexpected care or kindness?'},
  {ref:'Psalm 23:6',title:'Goodness that follows',meaning:'David ends in confidence that God’s goodness and steadfast love will accompany him. Readers differ about details of dwelling in God’s house; the overarching theme is enduring communion with God.',prompt:'What might it mean to live each day with that confidence?'}
 ];
 setPage(`${pageHeader('GO DEEPER','Psalm 23: more than familiar words','Read the psalm closely, consider its historical imagery, and reflect on what it might mean today.')}
 <div class="study-layout"><div class="card"><div class="eyebrow">DAVID’S PSALM · BSB</div><h2>The LORD is my shepherd</h2>${sections.map(s=>`<section class="study-block"><a class="kicker" href="${refRoute(s.ref)}">${esc(s.ref)} ↗</a><h3>${esc(s.title)}</h3><p class="verse-text">“${esc(getRef(s.ref)?.text||'')}”</p><p><strong>Understanding the imagery:</strong> ${esc(s.meaning)}</p><p><em>Reflect:</em> ${esc(s.prompt)}</p><div class="verse-actions"><button data-bookmark="${esc(s.ref)}">${bookmarked(s.ref)?'♥ Saved':'♡ Save'}</button><button data-speak="${esc(s.ref)}">▶ Listen</button></div></section>`).join('')}</div><aside class="aside-card"><div class="eyebrow">HOW WE APPROACH SCRIPTURE</div><h3>Text first. Meaning with care.</h3><p>Start with the Bible’s exact wording, then explore literary context, historical images, and possible applications.</p><p>Interpretive notes are human-written devotional commentary, not Scripture itself or the only possible Christian interpretation.</p><a class="btn btn-outline" href="${readRoute('Psalm',23)}">Read all of Psalm 23 →</a></aside></div>`,'Psalm 23 Study');
}
function about(){
 setPage(`${pageHeader('ABOUT & SOURCES','Rooted in Scripture, open to everyone','A simple Bible companion designed to put God’s Word first.')}
 <div class="grid grid-2"><div class="card"><h3>Bible text</h3><p>The complete text of the Berean Standard Bible (BSB) is included for offline-capable static hosting. It was dedicated to the public domain on April 30, 2023.</p><p><a class="text-link" href="https://berean.bible/terms.htm" target="_blank" rel="noopener">Official terms &amp; attribution ↗</a></p><p><a class="text-link" href="https://berean.bible/downloads.htm" target="_blank" rel="noopener">Official Bible downloads ↗</a></p></div><div class="card"><h3>Stories &amp; interpretation</h3><p>The two Genesis narrative episodes are creative retellings based on Genesis 1–6. They are clearly distinguished from the biblical text.</p><p>Verse reflections seek to be faithful to context but should not be treated as an exclusive or infallible interpretation.</p></div><div class="card"><h3>Your privacy</h3><p>This version uses no tracking, login, or external backend. Bookmarks and notes stay in your current browser unless you export them.</p></div><div class="card"><h3>Site source code</h3><p>This portable version uses HTML, CSS, JavaScript, and local JSON files. It can be hosted as a static site with no paid API or key.</p><p><a href="data/Berean-Standard-Bible-original.txt" class="text-link" download>Download original BSB text ↗</a></p></div></div>`,'About & Sources');
}

function showNote(ref){
 const panel=document.getElementById('notes-'+safeId(ref));if(!panel)return;
 if(!panel.hidden){panel.hidden=true;return;}
 const existing=notes()[ref]||'';
 panel.innerHTML=`<label class="field-label" for="note-field-${safeId(ref)}">Personal note on ${esc(ref)}</label><textarea class="saved-note" id="note-field-${safeId(ref)}" placeholder="Write your reflection…">${esc(existing)}</textarea><div class="action-row" style="margin-top:8px"><button class="btn btn-primary btn-sm" data-save-note="${esc(ref)}">Save note</button><button class="btn btn-outline btn-sm" data-cancel-note="${esc(ref)}">Cancel</button></div>`;
 panel.hidden=false;panel.querySelector('textarea').focus();
}
function toggleBookmark(ref){let list=bookmarks();list=list.includes(ref)?list.filter(x=>x!==ref):[...list,ref];if(setStored('bookmarks',list)){toast(list.includes(ref)?`Saved ${ref}`:`Removed ${ref}`);render(true);}}
function saveNote(ref){let panel=document.getElementById('notes-'+safeId(ref));const field=panel?.querySelector('textarea');if(!field)return;const all=notes();if(field.value.trim()){all[ref]=field.value.trim();}else{delete all[ref];}if(setStored('notes',all)){toast(`Note updated for ${ref}`);render(true);}}
function exportNotes(){
 const payload={app:'Scripture for Life',exportedAt:new Date().toISOString(),translation:'Berean Standard Bible',bookmarks:bookmarks(),notes:notes(),storyProgress:storyProgress(),storyReflections:storyNotes()};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='scripture-for-life-notes.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function startSpeech(parts){
 if(!('speechSynthesis' in window)){toast('Read-aloud is not available in this browser');return;}
 stopSpeech();speechActive=true;
 const chunks=[];
 for(const piece of parts){
   const words=piece.split(/\s+/);let current='';
   for(const word of words){if((current+' '+word).length>175&&current){chunks.push(current);current=word;}else current+=(current?' ':'')+word;}
   if(current)chunks.push(current);
 }
 readingQueue=chunks;
 document.getElementById('speech-panel').hidden=false;
 speakNext();
}
function speakNext(){
 if(!speechActive)return;
 const text=readingQueue.shift();if(!text){stopSpeech();return;}
 const utt=new SpeechSynthesisUtterance(text);utt.rate=.92;
 utt.onend=()=>{if(speechActive)speakNext();};
 utt.onerror=()=>{if(speechActive)speakNext();};
 window.speechSynthesis.speak(utt);
}
function stopSpeech(){speechActive=false;readingQueue=[];if('speechSynthesis' in window)window.speechSynthesis.cancel();document.getElementById('speech-panel').hidden=true;}
function render(keepScroll=false){
 if(!bible||!episodes||!storyScenes)return;
 const raw=location.hash.replace(/^#\/?/,'');const [page='',searchPart='']=raw.split('?');const params=new URLSearchParams(searchPart);
 const previousY=window.scrollY;
 switch(page){
   case '':case 'home':home();break;
   case 'help':help(params.get('topic'));break;
   case 'stories':stories();break;
   case 'episode':story(params.get('id')||'1',params.get('scene'),params.get('view')||'scene');break;
   case 'read':read(params.get('book')||'Genesis',params.get('chapter')||'1',params.get('verse'));break;
   case 'saved':saved();break;
   case 'study':study();break;
   case 'search':search(params.get('q')||'');break;
   case 'about':about();break;
   default:home();
 }
 if(keepScroll)window.scrollTo(0,previousY);
}
async function init(){
 try{
  const [bibleResp,epResp,scenesResp]=await Promise.all([fetch('data/bible.json'),fetch('data/episodes.json'),fetch('data/story-scenes.json')]);
  if(!bibleResp.ok||!epResp.ok||!scenesResp.ok)throw new Error('Unable to load local Scripture data.');
  [bible,episodes,storyScenes]=await Promise.all([bibleResp.json(),epResp.json(),scenesResp.json()]);
  books=new Map(bible.books.map(b=>[b.name.toLowerCase(),b]));
  versesIndex=bible.books.flatMap(b=>b.chapters.flatMap((ch,idx)=>ch.map(([v,text])=>({ref:`${b.name} ${idx+1}:${v}`,text}))));
  if(!location.hash)location.hash='#/home';else render();
 }catch(err){app.innerHTML=`<div class="empty-state"><h2>We couldn’t open the Bible files.</h2><p>${esc(err.message)}</p><p>Open the project through a local web server, not directly as a file. See README.md.</p></div>`;}
}

window.addEventListener('hashchange',()=>{stopSpeech();render();document.getElementById('mobile-nav').hidden=true;document.getElementById('menu-toggle').setAttribute('aria-expanded','false');});
document.getElementById('menu-toggle').addEventListener('click',()=>{const m=document.getElementById('mobile-nav');m.hidden=!m.hidden;document.getElementById('menu-toggle').setAttribute('aria-expanded',String(!m.hidden));});
document.getElementById('stop-speech').addEventListener('click',stopSpeech);
app.addEventListener('click',e=>{
 const closest=selector=>e.target.closest(selector);
 const bm=closest('[data-bookmark]');if(bm){toggleBookmark(bm.dataset.bookmark);return;}
 const note=closest('[data-note]');if(note){showNote(note.dataset.note);return;}
 const cancel=closest('[data-cancel-note]');if(cancel){showNote(cancel.dataset.cancelNote);return;}
 const saver=closest('[data-save-note]');if(saver){saveNote(saver.dataset.saveNote);return;}
 const verse=closest('[data-select-verse]');if(verse){const b=document.getElementById('book-select').value,c=document.getElementById('chapter-select').value,ref=`${b} ${c}:${verse.dataset.selectVerse}`;const panel=document.getElementById('verse-tools');panel.innerHTML=`<div class="kicker">${esc(ref)}</div><p>${esc(getRef(ref)?.text||'')}</p><button class="toolbar-btn" data-bookmark="${esc(ref)}">${bookmarked(ref)?'♥ Remove bookmark':'♡ Save verse'}</button> <button class="toolbar-btn" data-note="${esc(ref)}">✎ Note</button> <button class="toolbar-btn" data-speak="${esc(ref)}">▶ Listen</button><div class="note-area" id="notes-${safeId(ref)}" hidden></div>`;panel.hidden=false;panel.scrollIntoView({behavior:'smooth',block:'nearest'});return;}
 const speak=closest('[data-speak]');if(speak){const r=getRef(speak.dataset.speak);if(r)startSpeech([`${speak.dataset.speak}. ${r.text}`]);return;}
 const spChapter=closest('[data-speak-chapter]');if(spChapter){const [book,c]=spChapter.dataset.speakChapter.split('|');startSpeech(books.get(book.toLowerCase()).chapters[Number(c)-1].map(([v,t])=>`${v}. ${t}`));return;}
 const spScene=closest('[data-speak-scene]');if(spScene){const [epId,index]=spScene.dataset.speakScene.split('|');const ep=episodes.find(e=>e.id===epId),sc=storyScenes[epId]?.[Number(index)];if(ep&&sc)startSpeech(ep.paragraphs.slice(sc.start,sc.end+1));return;}
 const storySave=closest('[data-save-story-reflection]');if(storySave){const id=storySave.dataset.saveStoryReflection,field=document.getElementById('reflection-input');if(field){const all=storyNotes();if(field.value.trim())all[id]=field.value.trim();else delete all[id];setStored('story-notes',all);toast('Your reflection was saved on this device');}return;}
 const finish=closest('[data-finish-episode]');if(finish){const episodeId=finish.dataset.finishEpisode;saveStoryProgress(episodeId,storyScenes[episodeId].length,true);toast('Episode marked complete');if(finish.dataset.goNext){location.hash=sceneURL(finish.dataset.goNext,savedScene(finish.dataset.goNext));}else render(true);return;}
 const spStory=closest('[data-speak-story]');if(spStory){const ep=episodes.find(e=>e.id===spStory.dataset.speakStory);if(ep)startSpeech(ep.paragraphs);return;}
 if(closest('#export-notes')){exportNotes();return;}
});
app.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-select-verse]')){e.preventDefault();e.target.click();}});
app.addEventListener('submit',e=>{
 if(e.target.id==='reader-form'){e.preventDefault();const b=e.target.elements.book.value;const c=e.target.elements.chapter.value;location.hash=readRoute(b,c);}
 if(e.target.id==='search-form'){e.preventDefault();location.hash=route('search',{q:e.target.elements.q.value.trim()});}
});
app.addEventListener('change',e=>{
 if(e.target.id==='book-select'){const b=books.get(e.target.value.toLowerCase());const select=document.getElementById('chapter-select');select.innerHTML=b.chapters.map((c,i)=>`<option value="${i+1}">Chapter ${i+1}</option>`).join('');}
});
init();
