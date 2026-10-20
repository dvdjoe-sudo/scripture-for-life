// SANDBOX ONLY: test home page + navigation ideas. Not part of the real site.
(function(){
const LAST='sfl-sandbox.last';
window.addEventListener('hashchange',()=>{const h=location.hash;if(h&&h!=='#/'&&!h.startsWith('#/search'))localStorage.setItem(LAST,JSON.stringify({h,t:document.title.replace(/ ?[·|–-] ?Scripture for Life/,'')}));});
const moods=[['afraid','fear','😟 Afraid'],['tired','strength','😩 Worn out'],['sad','grief','😢 Sad'],['unsure','direction','🤔 Unsure'],['lonely','alone','🫂 Lonely'],['thankful','gratitude','🙏 Thankful']];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
window.sbMood=function(topic){const t=DATA.topics.find(x=>x.id===topic);const refs=t.refs.filter(r=>DATA.verses[r]);const r=refs[Math.floor(Math.random()*refs.length)];
 document.getElementById('sb-verse').innerHTML=`<p class="sb-vtext">“${esc(DATA.verses[r])}”</p><p class="sb-vref">${r} · BSB</p><a class="btn outline" href="#/help/${t.id}">More for ${esc(t.title.toLowerCase())} →</a>`;};
home=function(){let last=null;try{last=JSON.parse(localStorage.getItem(LAST));}catch{}
 const saved=Object.entries(JSON.parse(localStorage.getItem('scripture-for-life.saved')||'{}')).slice(-3);
 const sunday=new Date().getDay()===0;
 return `<div class="container sb-home">
 <p class="sb-banner">Sandbox preview: testing a simpler home page.</p>
 ${last?`<a class="sb-continue" href="${esc(last.h)}"><span>Continue where you left off</span><strong>${esc(last.t||last.h)}</strong><span>→</span></a>`:''}
 ${sunday?`<section class="sb-card"><h2>A Sunday to rest.</h2><p>Look back on your week. What are you thankful for? What can you lay down today?</p><a class="btn" href="#/saved">Review this week's saved verses →</a></section>`:''}
 <section class="sb-card"><h2>How do you feel today?</h2><div class="sb-moods">${moods.map(([,id,l])=>`<button class="sb-mood" onclick="sbMood('${id}')">${l}</button>`).join('')}</div><div id="sb-verse" class="sb-verse"><p class="small">Tap a feeling to get a verse for it.</p></div></section>
 <div class="sb-big3"><a href="#/stories"><strong>Stories</strong><span>Genesis, Exodus, Leviticus</span></a><a href="#/read/19/23"><strong>Read</strong><span>The full Bible</span></a><a href="#/psalms"><strong>Psalms</strong><span>Study verse by verse</span></a></div>
 <section class="sb-card"><h2>Search</h2>${searchForm()}<p class="search-hint">Try “I feel afraid” or “John 3:16”</p></section>
 ${saved.length?`<section class="sb-card"><h2>Your saved verses</h2>${saved.map(([r,v])=>`<a class="sb-saved" href="${refURL(r)}"><strong>${esc(r)}</strong> ${esc(v.text.slice(0,90))}…</a>`).join('')}<a class="text-link" href="#/saved">See all →</a></section>`:''}
 <section class="sb-card"><h2>Explore</h2><div class="sb-links"><a href="#/journey">Bible Journey</a><a href="#/people">People</a><a href="#/study/23/1">Psalm 23 walk</a><a href="#/about">About</a></div></section></div>`;};
const tabs=[['#/','Home','⌂'],['#/stories','Stories','📖'],['#/read/19/23','Read','✎'],['#/saved','Saved','★'],['#/journey','Journey','➜']];
const bar=document.createElement('nav');bar.className='sb-tabbar';bar.setAttribute('aria-label','Main');
bar.innerHTML=tabs.map(([h,l,i])=>`<a href="${h}"><span>${i}</span>${l}</a>`).join('');document.body.appendChild(bar);
const mark=()=>{const h=location.hash||'#/';bar.querySelectorAll('a').forEach(a=>{const k=a.getAttribute('href').split('/')[1]||'';a.classList.toggle('on',(h.split('/')[1]||'')===k);});};
window.addEventListener("hashchange",mark);mark();if(!location.hash||location.hash==="#/")render();
})();
