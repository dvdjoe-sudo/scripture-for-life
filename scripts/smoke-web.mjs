/* Check the actual running website and the Capacitor web bundle at phone width. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const locations=[{folder:root,port:8870,label:'Website source'},{folder:path.join(root,'www'),port:8871,label:'Android web bundle'}];
const servers=[];
const psalm46=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'data/bible.json'),'utf8')).books[18].chapters[45]);
const psalm46Sections=[[1],[2,3],[4,5],[6,7],[8,9],[10,11]];
async function waitForServer(url){
  for(let attempt=0;attempt<35;attempt++){
    try{const res=await fetch(url);if(res.ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  throw new Error('Local site did not start: '+url);
}
for(const loc of locations){
  const server=spawn('python3',['-m','http.server',String(loc.port),'--bind','127.0.0.1','--directory',loc.folder],{stdio:'ignore'});
  servers.push(server);
}
let browser;
try {
  for(const loc of locations)await waitForServer('http://127.0.0.1:'+loc.port+'/');
  browser=await chromium.launch({headless:true});
  for(const loc of locations){
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:1});
    // Topic pages show 15 random verses; tests below rely on fixed verses, so show the full list.
    await context.addInitScript(()=>{window.SFL_TOPIC_SHOW_ALL=true;});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror', error=>errors.push(error.message));
    const base='http://127.0.0.1:'+loc.port+'/';
    async function visit(route,selector){
      await page.goto(base+route,{waitUntil:'domcontentloaded'});
      await page.locator(selector).first().waitFor({timeout:20000});
      // Mobile pages must not extend beyond the physical viewport.
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
      assert.ok(overflow<=2,loc.label+' '+route+' horizontal overflow: '+overflow+'px');
    }
    await visit('#/','.hero-art .landscape');
    assert.match(await page.locator('h1').first().innerText(),/Find help in/);
    assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/\/(genesis|exodus|nehemiah|daniel)\.js/.test(r.name)).length),0,'Story scripts are not loaded on the home page (they load when their route opens)');
    assert.equal(await page.locator('.topic-grid .topic-card').count(),8,'All eight everyday needs remain on main home');
    assert.equal(await page.locator('.gen-home-quick a[href="#/books"]').count(),1,'Main home links to the Stories landing');
    assert.equal(await page.locator('.gen-home-quick a[href="#/journey"]').count(),1,'Main home links to the Bible Journey');
    assert.equal(await page.locator('.featured,.gen-home-feature,.ps46-card').count(),0,'Preserve main’s focused home layout');
    await visit('#/stories','.gen-episode-tile');
    assert.equal(await page.locator('.gen-episode-tile').count(),12,'All twelve Genesis episodes');
    await visit('#/stories/1/1','#gen-narrative p');
    assert.match(await page.locator('h1').first().innerText(),/First Light/);
    await visit('#/stories/1/6','.gen-next');
    assert.equal(await page.locator('.gen-next a[href="#/stories/2/1"]').count(),1);
    await visit('#/stories/2/6','.gen-next');
    assert.equal(await page.locator('.gen-next a[href="#/stories/3/1"]').count(),1);
    await visit('#/stories/3/8','.gen-next');
    assert.equal(await page.locator('.gen-next a[href="#/stories/4/1"]').count(),1);
    await visit('#/stories/4/1','#gen-narrative p');
    await visit('#/stories/11/8','.gen-next');
    assert.equal(await page.locator('.gen-next a[href="#/stories/12/1"]').count(),1);
    await visit('#/stories/12/9','.gen-next');
    assert.equal(await page.locator('.gen-next a[href="#/journey"]').count(),1);
    await visit('#/journey','.gen-books');
    assert.equal(await page.locator('.gen-book').count(),66,'All 66 books present');
    // Journey: books grouped in nine collapsible sections, first open; phone book names are larger.
    assert.equal(await page.locator('details.gen-era').count(),9,'Journey has nine book sections');
    assert.equal(await page.locator('details.gen-era[open]').count(),1,'Only the first journey section starts open');
    assert.equal(await page.locator('details.gen-era').first().getAttribute('open'),'','The Law section starts open');
    assert.ok(parseFloat(await page.locator('.gen-era .gen-book span').first().evaluate(e=>getComputedStyle(e).fontSize))>=20,'Journey book names are large on phones');
    await page.locator('details.gen-era').last().locator('summary').click();
    await page.locator('details.gen-era').last().locator('a.gen-book[href="#/read/66/1"]').waitFor({state:'visible'});
    assert.doesNotMatch(await page.locator('.page-head').innerText(),/first three Exodus/,'Journey intro has no stale episode counts');
    assert.equal(await page.locator('.gen-content a[href="#/books"]').count(),1,'Journey links to every story book');
    // People: compact one-column list of names with one-line summaries on phones.
    await visit('#/people','.people-grid .person-card');
    const cards=await page.locator('.people-page .person-card').evaluateAll(els=>els.map(e=>Math.round(e.getBoundingClientRect().height)));
    assert.ok(cards.length>10&&cards.every(h=>h>=44&&h<=84),'People cards are compact rows: '+cards.slice(0,5));
    assert.equal(await page.locator('.people-page .person-card .more').evaluateAll(els=>els.filter(e=>e.offsetWidth).length),0,'People cards hide the repeated Explore label on phones');
    await visit('#/people/joel','.story-step');
    assert.match(await page.locator('h1').innerText(),/Joel/,'Joel profile renders');
    await visit('#/people/malachi','.story-step');
    assert.match(await page.locator('h1').innerText(),/Malachi/,'Malachi profile renders');
    for(const [pid,nm] of [['nadab-abihu',/Nadab and Abihu/],['caleb',/Caleb/],['balaam',/Balaam/]]){await visit('#/people/'+pid,'.story-step');assert.match(await page.locator('h1').innerText(),nm,pid+' profile renders');}
    await visit('#/numbers/4/1','a[href="#/people/joshua"]');
    await visit('#/people/jehoshaphat','.story-step');
    assert.match(await page.locator('h1').innerText(),/Jehoshaphat/,'Jehoshaphat profile renders');
    await visit('#/people/jehoiada','.story-step');
    assert.match(await page.locator('h1').innerText(),/Jehoiada/,'Jehoiada profile renders');
    await visit('#/people/nebuchadnezzar','.story-step');
    assert.match(await page.locator('h1').innerText(),/Nebuchadnezzar/,'Nebuchadnezzar profile renders');
    await visit('#/people/three-friends','.story-step');
    assert.match(await page.locator('h1').innerText(),/Shadrach/,'Three friends profile renders');
    await visit('#/people/ezra','.story-step');
    assert.match(await page.locator('h1').innerText(),/Ezra/,'Ezra profile renders');
    await visit('#/people/esther','.story-step');
    assert.match(await page.locator('h1').innerText(),/Esther/,'Esther profile renders');
    await visit('#/people/mordecai','.story-step');
    assert.match(await page.locator('h1').innerText(),/Mordecai/,'Mordecai profile renders');
    await visit('#/people/nehemiah','.story-step');
    assert.match(await page.locator('h1').innerText(),/Nehemiah/,'Nehemiah profile renders');
    await visit('#/people/job','.story-step');
    assert.match(await page.locator('h1').innerText(),/Job/,'Job profile renders');
    await visit('#/study/23/1','.study-landscape .landscape');
    assert.equal(await page.locator('.study-explainer [role="tab"]').count(),4,'Original four-tab Psalm study preserved');
    await page.locator('[data-psalm-verse-select]').selectOption('3');
    await page.waitForFunction(()=>location.hash.endsWith('/3'));
    assert.equal(await page.locator('[data-psalm-verse-select]').inputValue(),'3');
    assert.equal(await page.locator('[data-psalm-verse-select] option').first().innerText(),'Verse 1 of 6');
    await visit('#/study/23/1','.study-landscape .landscape');
    assert.equal(await page.locator('.study-trail,.trail-completion').count(),0,'No guided trail or completion controls');
    assert.equal(await page.locator('[data-psalm-verse-select] option').count(),6);
    const art=[];
    for(let n=1;n<=6;n++){
      await visit('#/study/23/'+n,'.psalm-verse-art');
      assert.equal(await page.locator('.psalm-verse-art').getAttribute('data-psalm-art'),'23-'+n);
      await page.waitForFunction(()=>{const img=document.querySelector('.study-landscape .psalm-verse-art');return img?.complete&&img.naturalWidth>0;});
      art.push(await page.locator('.study-landscape .psalm-verse-art').getAttribute('src'));
    }
    assert.equal(new Set(art).size,6,'Each verse has different imagery');
    await page.locator('[data-psalm-switch]').selectOption('46');await page.locator('.ps46-page').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('23');await page.locator('.psalm-verse-art').waitFor();
    assert.ok(page.url().endsWith('#/study/23/6'),'Psalm switcher retains place');
    // Opening Psalms resumes where you left off (here Psalm 23:6); there is no long list or All Psalms link.
    await page.locator('.site-header a[data-nav="psalms"]').click();
    await page.waitForFunction(()=>location.hash==='#/study/23/6');await page.locator('.psalm-verse-art').waitFor();
    assert.equal(await page.locator('.psalms-list,.psalms-row,#main a[href="#/psalms"]').count(),0,'No Psalms list or All Psalms link');
    assert.equal(await page.evaluate(()=>window.SFL_PSALMS.resumeURL(null)),'#/study/1/1','With nothing read yet, Psalms starts at Psalm 1');
    assert.equal(await page.evaluate(()=>window.SFL_PSALMS.resumeURL({href:'#/psalms/151'})),'#/study/1/1');
    // One tidy picker at the top: search, then the Psalm dropdown (1–150 with titles) beside Go to verse.
    assert.equal(await page.locator('.psalm-picker [data-psalm-switch] option').count(),150);
    assert.match(await page.locator('.psalm-picker [data-psalm-switch] option[value="91"]').innerText(),/^Psalm 91 · \S/);
    assert.equal(await page.locator('.psalm-picker [data-psalm-verse-select]').count(),1,'Go to verse sits in the picker');
    const [findBox,switchBox,verseBox]=await Promise.all(['.psalm-picker [data-psalms-search]','.psalm-picker [data-psalm-switch]','.psalm-picker [data-psalm-verse-select]'].map(q=>page.locator(q).boundingBox()));
    assert.ok(Math.abs(switchBox.y-verseBox.y)<=2&&switchBox.y>findBox.y&&switchBox.y-findBox.y<70,'Psalm and verse dropdowns share one row under the search');
    await page.locator('.psalm-picker [data-psalms-search]').fill('refuge');
    assert.ok(await page.locator('.psalm-find-hit').count()>=1,'Psalm search finds psalms by word');
    await page.locator('.psalm-picker [data-psalms-search]').fill('46');
    assert.equal(await page.locator('.psalm-find-hit').count(),1);
    await page.locator('.psalm-find-hit').click();await page.locator('.ps46-page .psalm-picker [data-psalm-verse-select]').waitFor();
    // Back from the resumed psalm returns to where you were, not to a redirect.
    await visit('#/','.hero-art .landscape');
    await page.locator('.site-header a[data-nav="psalms"]').click();
    await page.waitForFunction(()=>location.hash.startsWith('#/study/46/'));await page.locator('.ps46-page').waitFor();
    await page.goBack();await page.waitForFunction(()=>location.hash==='#/');
    // Phones: Go-to-verse dropdown and the verse come before the watercolor, within the first screen.
    for(const route of ['#/study/91/4','#/study/23/2','#/study/46/1','#/study/1/1']){
      await visit(route,'.phone-verse-first .study-verse .verse-text');
      const [sel,verse,art]=await Promise.all(['.phone-verse-first select[data-psalm-verse-select]','.phone-verse-first .study-verse .verse-text','.phone-verse-first .study-landscape'].map(q=>page.locator(q).first().boundingBox()));
      assert.ok(sel.y<verse.y,route+' verse dropdown comes before the verse');
      assert.ok(verse.y<art.y,route+' verse comes before the watercolor on phones');
      assert.ok(verse.y<760,route+' verse visible in the first screen: '+verse.y);
    }
    // Phones: story controls (Listen, Speed, Share, Text size) fit one row and the story text starts in the first screen.
    for(const route of ['#/stories/1/1','#/joel/1/2','#/malachi/1/1']){
      await visit(route,'.gen-narrative p');
      await page.locator('.gen-reading-controls [data-action="share-scene"]').waitFor();
      await page.locator('.gen-reading-controls [data-action="text-size"]').waitFor();
      const tops=await page.locator('.gen-reading-controls > :is(button,label):visible').evaluateAll(els=>els.map(e=>Math.round(e.getBoundingClientRect().top)));
      assert.ok(tops.length>=4&&Math.max(...tops)-Math.min(...tops)<=4,route+' story controls on one row: '+tops);
      assert.equal(await page.getByRole('button',{name:'Share this scene'}).count(),1,route+' Share keeps its full accessible name');
      const textTop=(await page.locator('.gen-narrative p').first().boundingBox()).y;
      assert.ok(textTop<700,route+' story text starts in the first screen: '+textTop);
    }
    // Phones: topic verse-card actions sit on one row; icon buttons keep their names.
    await visit('#/help/fear','.verse-card .verse-actions');
    const actionRows=await page.locator('.verse-card .verse-actions').evaluateAll(rows=>rows.map(r=>{const t=[...r.children].filter(c=>c.offsetWidth).map(c=>Math.round(c.getBoundingClientRect().top+c.offsetHeight/2));return Math.max(...t)-Math.min(...t);}));
    assert.ok(actionRows.length&&actionRows.every(d=>d<=4),'Topic card actions on one row: '+actionRows);
    assert.ok(await page.getByRole('button',{name:'Listen',exact:true}).count()>0&&await page.getByRole('button',{name:'Reflect',exact:true}).count()>0,'Listen/Reflect keep accessible names');
    // No repeated links to the same place (scene progress dots are a separate step indicator).
    for(const [route,sel] of [['#/study/46/1','.study-verse'],['#/study/23/1','.study-verse'],['#/study/91/4','.study-verse'],['#/psalms/91','.psalm-chapter-verse'],['#/people/moses','.story-step'],['#/joel/1/full','.gen-narrative p']]){
      await visit(route,sel);
      const dups=await page.evaluate(()=>{const seen={};document.querySelectorAll('#main a[href]').forEach(a=>{if(!a.offsetWidth||a.closest('.gen-progress'))return;const h=a.getAttribute('href');seen[h]=(seen[h]||0)+1;});return Object.entries(seen).filter(([,n])=>n>1).map(([h])=>h);});
      assert.deepEqual(dups,[],route+' has duplicate links: '+dups);
    }
    // Phones: tap targets are at least 44px and visible text is at least 11px.
    for(const [route,sel] of [['#/','.topic-card'],['#/help/fear','.verse-card'],['#/study/91/4','.study-verse'],['#/stories/1/1','.gen-narrative p']]){
      await visit(route,sel);
      const small=await page.evaluate(()=>{const out=[];document.querySelectorAll('.site-header a,.site-header button,#main .icon-btn,#main .tab,#main .ref-chip,#main select,#main .search-box input,#main .search-box button,#main .btn').forEach(el=>{if(!el.offsetWidth)return;const r=el.getBoundingClientRect();if(r.height<43.5)out.push((el.className||el.tagName)+':'+Math.round(r.height));});return out;});
      assert.deepEqual(small,[],route+' tap targets under 44px: '+small);
      const tiny=await page.evaluate(()=>{const out=[];const w=document.createTreeWalker(document.querySelector('#main'),NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){if(!n.textContent.trim())continue;const el=n.parentElement;if(!el.offsetWidth&&!el.getClientRects().length)continue;const cs=getComputedStyle(el);if(cs.visibility==='hidden'||el.closest('.wide-only,.sr-only,.visually-hidden'))continue;if(parseFloat(cs.fontSize)<10.9)out.push(el.tagName+'.'+el.className+':'+cs.fontSize);}return [...new Set(out)];});
      assert.deepEqual(tiny,[],route+' text under 11px: '+tiny);
    }
    await visit('#/study/91/4','.study-verse');
    assert.equal(await page.locator('.study-landscape .scene-label').evaluateAll(els=>els.filter(e=>e.offsetWidth).length),0,'Psalm art caption hidden on phones');
    await visit('#/walk/23/4','.psalm-verse-art');
    assert.ok(page.url().endsWith('#/study/23/4'),'Old walk links open the verse illustration');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    await page.locator('[data-note-ref="Psalm 23:4"]').fill('A quiet reflection');
    await page.locator('#study-panel [data-action="save-note"]').click();
    await page.reload();await page.locator('.psalm-verse-art').waitFor();
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('[data-note-ref="Psalm 23:4"]').inputValue(),'A quiet reflection');
    await visit('#/read/19/23','.reader-verse');
    assert.equal(await page.locator('a[href="#/study/23/1"]').count()>0,true,'Psalm 23 Bible reader links to original study');
    // Joel story book: library link, episode list and a scene with Joseph's text and the BSB passage.
    await visit('#/books','.gen-cta-actions a[href="#/joel"]');
    await visit('#/joel','.gen-episode-tile');
    assert.equal(await page.locator('.gen-episode-tile').count(),5,'Joel has five episodes');
    await visit('#/joel/1/1','.gen-narrative');
    assert.match(await page.locator('.gen-narrative').innerText(),/This is the word of the LORD that came to Joel son of Pethuel\./,'Joel scene shows the retelling');
    await visit('#/joel/5/5','.gen-narrative');
    assert.equal(await page.locator('a[href="#/read/30/1"]').count(),1,'Last Joel scene continues to Amos 1');
    // Malachi story book: library link, six episodes, Zechariah leads on to it, and the last scene leads on to Chronicles.
    await visit('#/books','.gen-cta-actions a[href="#/malachi"]');
    await visit('#/malachi','.gen-episode-tile');
    assert.equal(await page.locator('.gen-episode-tile').count(),6,'Malachi has six episodes');
    await visit('#/malachi/1/1','.gen-narrative');
    assert.match(await page.locator('.gen-narrative').innerText(),/the burden of the word of the LORD to Israel through Malachi\./,'Malachi scene shows the retelling');
    await visit('#/malachi/6/5','.gen-narrative');
    assert.equal(await page.locator('a[href="#/chronicles"]').count(),1,'Last Malachi scene continues to Chronicles stories');
    await visit('#/zechariah/15/5','.gen-narrative');
    assert.equal(await page.locator('a[href="#/malachi"]').count()>0,true,'Last Zechariah scene leads to Malachi stories');
    // Chronicles story book: library link, fourteen episodes, Malachi leads on to it, and the last scene continues to Ezra stories.
    await visit('#/books','.gen-cta-actions a[href="#/chronicles"]');
    await visit('#/chronicles','.gen-episode-tile');
    assert.equal(await page.locator('.gen-episode-tile').count(),14,'Chronicles has fourteen episodes');
    await visit('#/chronicles/1/1','.gen-narrative');
    assert.match(await page.locator('.gen-narrative').innerText(),/Chronicles does not open with a scene\./,'Chronicles scene shows the retelling');
    await visit('#/chronicles/14/5','.gen-narrative');
    assert.equal(await page.locator('a[href="#/ezra"]').count(),1,'Last Chronicles scene continues to Ezra stories');
    await visit('#/chronicles/9/1','.gen-narrative a[href="#/people/jehoshaphat"]');
    assert.equal(await page.locator('a[href="#/people/jehoshaphat"]').count(),1,'Chronicles scene links Jehoshaphat inline');
    await visit('#/chronicles/11/3','.gen-narrative a[href="#/people/jehoiada"]');
    assert.equal(await page.locator('a[href="#/people/jehoiada"]').count(),1,'Chronicles scene links Jehoiada inline');
    await visit('#/daniel/4/2','.gen-narrative a[href="#/people/nebuchadnezzar"]');
    assert.equal(await page.locator('a[href="#/people/nebuchadnezzar"]').count(),1,'Daniel scene links Nebuchadnezzar inline');
    assert.equal(await page.locator('a[href="#/people/three-friends"]').count(),1,'Daniel scene links the three friends inline');
    // Ezra story book: library link, ten episodes, Chronicles leads on to it, and the last scene continues to Esther stories.
    await visit('#/books','.gen-cta-actions a[href="#/ezra"]');
    await visit('#/ezra','.gen-episode-tile');
    assert.equal(await page.locator('.gen-episode-tile').count(),10,'Ezra has ten episodes');
    await visit('#/ezra/1/1','.gen-narrative');
    assert.match(await page.locator('.gen-narrative').innerText(),/The exile was supposed to be the end of the story/,'Ezra scene shows the retelling');
    await visit('#/ezra/3/1','.gen-narrative');
    assert.equal(await page.locator('a[href="#/people/zerubbabel"]').count(),1,'Ezra scene links Zerubbabel inline');
    assert.equal(await page.locator('a[href="#/people/joshua-high-priest"]').count(),1,'Ezra scene links Jeshua to Joshua the High Priest inline');
    await visit('#/ezra/7/1','.gen-narrative');
    assert.equal(await page.locator('a[href="#/people/ezra"]').count(),1,'Ezra scene links Ezra inline');
    await visit('#/ezra/10/5','.gen-narrative');
    assert.equal(await page.locator('a[href="#/esther"]').count(),1,'Last Ezra scene continues to Esther stories');
    // Esther story book: library link, nine episodes, Ezra leads on to it, and the last scene continues to Nehemiah stories.
    await visit('#/books','.gen-cta-actions a[href="#/esther"]');
    await visit('#/esther','.gen-episode-tile');
    assert.equal(await page.locator('.gen-episode-tile').count(),9,'Esther has nine episodes');
    await visit('#/esther/2/2','.gen-narrative');
    assert.equal(await page.locator('a[href="#/people/mordecai"]').count(),1,'Esther scene links Mordecai inline');
    assert.equal(await page.locator('a[href="#/people/esther"]').count(),1,'Esther scene links Esther inline');
    await visit('#/esther/9/5','.gen-narrative');
    assert.equal(await page.locator('a[href="#/nehemiah"]').count(),1,'Last Esther scene continues to Nehemiah stories');
    // Nehemiah story book: library link, twelve episodes, Esther leads on to it, and the last scene continues to Job stories.
    await visit('#/books','.gen-cta-actions a[href="#/nehemiah"]');
    await visit('#/nehemiah','.gen-episode-tile');
    assert.equal(await page.locator('.gen-episode-tile').count(),12,'Nehemiah has twelve episodes');
    await visit('#/nehemiah/8/1','.gen-narrative');
    assert.equal(await page.locator('a[href="#/people/ezra"]').count(),1,'Nehemiah scene links Ezra inline');
    assert.equal(await page.locator('a[href="#/people/nehemiah"]').count(),1,'Nehemiah scene links Nehemiah inline');
    await visit('#/nehemiah/12/5','.gen-narrative');
    assert.equal(await page.locator('a[href="#/job"]').count(),1,'Last Nehemiah scene continues to Job stories');
    // Job story book: library link, nineteen episodes, Nehemiah leads on to it, and the last scene continues to Proverbs stories.
    await visit('#/books','.gen-cta-actions a[href="#/job"]');
    await visit('#/job','.gen-episode-tile');
    assert.equal(await page.locator('.gen-episode-tile').count(),19,'Job has nineteen episodes');
    await visit('#/job/1/2','.gen-narrative');
    assert.equal(await page.locator('a[href="#/people/job"]').count(),1,'Job scene links Job inline');
    await visit('#/job/19/5','.gen-narrative');
    assert.equal(await page.locator('a[href="#/proverbs"]').count(),1,'Last Job scene continues to Proverbs stories');
    // Proverbs story book: library link, thirteen episodes, Job leads on to it, a scene links Solomon inline, and the last scene continues to Ecclesiastes stories.
    await visit('#/books','.gen-cta-actions a[href="#/proverbs"]');
    await visit('#/proverbs','.gen-episode-tile');
    assert.equal(await page.locator('.gen-episode-tile').count(),13,'Proverbs has thirteen episodes');
    await visit('#/proverbs/11/1','.gen-narrative');
    assert.equal(await page.locator('a[href="#/people/solomon"]').count(),1,'Proverbs scene links Solomon inline');
    await visit('#/proverbs/13/5','.gen-narrative');
    assert.equal(await page.locator('a[href="#/ecclesiastes"]').count(),1,'Last Proverbs scene continues to Ecclesiastes stories');
    // Ecclesiastes story book: library link, eight episodes, Proverbs leads on to it, and the last scene continues to Song of Songs 1.
    await visit('#/books','.gen-cta-actions a[href="#/ecclesiastes"]');
    await visit('#/ecclesiastes','.gen-episode-tile');
    assert.equal(await page.locator('.gen-episode-tile').count(),8,'Ecclesiastes has eight episodes');
    await visit('#/ecclesiastes/8/5','.gen-narrative');
    assert.equal(await page.locator('a[href="#/read/22/1"]').count(),1,'Last Ecclesiastes scene continues to Song of Songs 1');
    // Whole-episode Listen on every story book's full-episode page, chunked for speech synthesis.
    for(const route of ['#/stories/2/full','#/zechariah/1/full','#/joel/1/full','#/kings1/1/full']){
      await visit(route,'.gen-full .ep-listen [data-action="ep-listen"]');
      assert.equal(await page.locator('.ep-listen #ep-speed option').count(),3,'Episode Listen has the scene speed choices');
    }
    assert.equal(await page.evaluate(()=>{const ch=window.APP_TEST.episodeChunks(['A '+'very long phrase, '.repeat(40)+'end.','Short one. Two!']);return ch.every(c=>c.text.length<=220)&&ch.at(-1).p===1&&ch.map(c=>c.text).join(' ').replace(/\s+/g,'')===('A '+'very long phrase, '.repeat(40)+'end.Short one. Two!').replace(/\s+/g,'');}),true,'Episode text is split into short speech chunks without losing words');
    await page.evaluate(()=>{window.__spoken=[];Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{paused:false,getVoices:()=>[],cancel(){},pause(){this.paused=true;},resume(){this.paused=false;},speak(u){window.__spoken.push(u);}}});});
    await page.locator('.ep-listen #ep-speed').selectOption('1.15');
    await page.locator('[data-action="ep-listen"]').click();
    assert.equal(await page.locator('[data-action="ep-pause"]').isVisible(),true,'Pause appears while the episode plays');
    assert.equal(await page.evaluate(()=>[window.__spoken.length,Math.round(window.__spoken[0].rate*100)].join()),'1,115','Episode narration starts with the chosen speed');
    await page.locator('[data-action="ep-pause"]').click();
    assert.equal(await page.locator('[data-action="ep-pause"]').innerText(),'Resume','Pause toggles to Resume');
    await page.evaluate(()=>window.__spoken[0].onend());
    assert.equal(await page.evaluate(()=>window.__spoken.length),2,'Narration continues to the next chunk');
    await page.locator('[data-action="ep-stop"]').click();
    assert.equal(await page.locator('[data-action="ep-listen"]').isVisible(),true,'Stop returns to the Listen button');
    // Continue where you left off: one home card for the most recent story scene or psalm verse; ✓ on finished episodes.
    await page.evaluate(()=>{localStorage.removeItem('scripture-for-life.last-place');localStorage.removeItem('scripture-for-life.episodes-done');localStorage.removeItem('scripture-for-life.haggai-progress');});
    await visit('#/','.hero');
    assert.equal(await page.locator('.continue-card').count(),0,'No continue card before reading anything');
    await visit('#/zechariah/1/3','.gen-narrative');
    await visit('#/','.continue-card');
    assert.equal(await page.locator('.continue-card').getAttribute('href'),'#/zechariah/1/3','Continue card links to the last story scene');
    assert.match(await page.locator('.continue-card').innerText(),/Zechariah · Episode 1 · Scene 3 of \d+/);
    await visit('#/study/23/4','.study-landscape .landscape');
    await visit('#/','.continue-card');
    assert.equal(await page.locator('.continue-card').getAttribute('href'),'#/study/23/4','Continue card links to the most recent psalm verse');
    assert.match(await page.locator('.continue-card h3').innerText(),/Psalm 23:4/);
    await visit('#/haggai','.gen-episode-tile');
    assert.equal(await page.locator('.episode-done').count(),0,'No ✓ before an episode is finished');
    const haggaiLen=Number((await page.locator('.gen-episode-tile .gen-kicker').first().innerText()).match(/(\d+) SCENES/)[1]);
    await visit('#/haggai/1/'+haggaiLen,'.gen-narrative');
    await visit('#/haggai','.gen-episode-tile');
    assert.equal(await page.locator('.gen-episode-tile[href^="#/haggai/1/"] .episode-done').count(),1,'Finished episode tile shows ✓');
    assert.equal(await page.locator('.episode-done').count(),1,'Only the finished episode shows ✓');
    // Verse of the day: a topic verse chosen by date, tappable to the verse popup.
    assert.equal(await page.evaluate(()=>{const A=window.APP_TEST,a=A.heroVerse(new Date(2026,0,5,0,5)).ref,b=A.heroVerse(new Date(2026,0,5,23,55)).ref,c=A.heroVerse(new Date(2026,0,6,12)).ref,topicRefs=new Set(window.BIBLE_DATA.topics.flatMap(t=>t.refs));return a===b&&a!==c&&topicRefs.has(a)&&A.dailyVersePool().every(r=>topicRefs.has(r));}),true,'Verse of the day is a topic verse, the same all day and different the next day');
    await visit('#/','.votd [data-action="listen-verse"]');
    assert.equal(await page.locator('.votd').getAttribute('data-votd-ref'),await page.evaluate(()=>window.APP_TEST.heroVerse().ref),'Home verse-of-the-day card shows today\'s verse');
    assert.equal(await page.locator('.votd [data-action="share-verse"]').count(),1,'Verse of the day can be shared');
    await page.waitForSelector('.hero-art .daily-verse');
    const dailyRef=await page.locator('.daily-verse').getAttribute('data-ref');
    assert.equal(dailyRef,'Psalm 23:1','Home art caption shows the Psalm 23 verse it illustrates');
    await page.locator('.daily-verse').click();
    await page.locator('#verse-dialog[open]').waitFor();
    assert.equal(await page.locator('#dialog-title').innerText(),dailyRef,'Caption opens the verse popup');
    for(const action of ['save','copy-verse','listen-verse','save-note'])assert.equal(await page.locator('#dialog-content [data-action="'+action+'"]').count()>0,true,'Verse popup offers '+action);
    assert.equal(await page.locator('#dialog-content textarea').count(),1,'Verse popup offers a reflection');
    await page.locator('[data-action="close-dialog"]').first().click();
    // Share: navigator.share with text, BSB reference and link; falls back to Copy with a "Copied" toast.
    await page.evaluate(()=>{window.__shared=[];window.__clip=[];navigator.share=async d=>{window.__shared.push(d);};Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async t=>{window.__clip.push(t);}}});});
    await page.evaluate(()=>{location.hash='#/study/23/1';});
    await page.locator('.verse-actions [data-action="share-verse"][data-ref="Psalm 23:1"]').first().click();
    let shared=await page.evaluate(()=>window.__shared.at(-1));
    assert.match(shared.text,/The LORD is my shepherd[\s\S]*Psalm 23:1, Berean Standard Bible \(BSB\)/,'Share sends the verse text and BSB reference');
    assert.equal(shared.url,'https://dvdjoe-sudo.github.io/scripture-for-life/#/study/23/1','Share sends a link to the verse');
    await page.evaluate(()=>{location.hash='#/psalms/91/4';});
    await page.locator('#psalm-line-4 [data-action="share-verse"]').waitFor();
    await page.evaluate(()=>{location.hash='#/zechariah/1/3';});
    await page.locator('[data-action="share-scene"]').click();
    shared=await page.evaluate(()=>window.__shared.at(-1));
    assert.match(shared.text,/Zechariah story, Episode 1 · Scene 3[\s\S]*Zechariah 1:\d+.*\(BSB\)/,'Scene share includes the book, scene and BSB passage');
    assert.equal(shared.url.endsWith('#/zechariah/1/3'),true,'Scene share links to the scene');
    // Android app: the Capacitor Share plugin opens the phone's share sheet (preferred over navigator.share).
    await page.evaluate(()=>{window.__native=[];window.Capacitor={isNativePlatform:()=>true,Plugins:{Share:{share:async d=>{window.__native.push(d);}}}};});
    const webShares=await page.evaluate(()=>window.__shared.length);
    await page.evaluate(()=>{location.hash='#/study/23/1';});
    await page.locator('.verse-actions [data-action="share-verse"][data-ref="Psalm 23:1"]').first().click();
    const nativeShared=await page.evaluate(()=>window.__native.at(-1));
    assert.match(nativeShared.text,/The LORD is my shepherd[\s\S]*Psalm 23:1, Berean Standard Bible \(BSB\)/,'Native share sends the verse text and BSB reference');
    assert.equal(nativeShared.url,'https://dvdjoe-sudo.github.io/scripture-for-life/#/study/23/1','Native share sends a link to the verse');
    assert.equal(await page.evaluate(()=>window.__shared.length),webShares,'Native app uses the share plugin, not navigator.share');
    await page.evaluate(()=>{delete window.Capacitor;});
    await page.evaluate(()=>{location.hash='#/help/fear';});
    const shareSaveBtn=page.locator('.verse-card [data-action="save"]:not(.is-saved)').first();
    const shareRef=await shareSaveBtn.getAttribute('data-ref');
    await shareSaveBtn.click();
    await page.evaluate(()=>{location.hash='#/saved';});
    await page.locator('.saved-list [data-action="share-verse"]').first().waitFor();
    await page.evaluate(()=>{navigator.share=undefined;});
    await page.locator('.saved-list [data-action="share-verse"][data-ref="'+shareRef+'"]').click();
    assert.equal(await page.locator('#toast').innerText(),'Copied','Without Web Share, Share copies and shows "Copied"');
    assert.match(await page.evaluate(()=>window.__clip.at(-1)),/Berean Standard Bible \(BSB\)\n\nhttps:\/\/dvdjoe-sudo\.github\.io\/scripture-for-life\/#\//,'Copied share text includes the reference and link');
    await page.locator('.saved-list [data-action="open-verse"][data-ref="'+shareRef+'"]').click();
    assert.equal(await page.locator('#verse-dialog[open] [data-action="share-verse"]').count(),1,'Verse popup has Share');
    await page.locator('[data-action="close-dialog"]').first().click();
    await page.locator('.saved-list [data-action="save"][data-ref="'+shareRef+'"]').click();
    // Remembered text size: the existing toggle on story pages, saved and applied app-wide.
    await page.evaluate(()=>localStorage.removeItem('scripture-for-life.text-size'));
    await visit('#/zechariah/1/3','.gen-reading-controls [data-action="text-size"]');
    const sizeOf=sel=>page.locator(sel).first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
    const storyBefore=await sizeOf('.gen-narrative p');
    await visit('#/help/fear','.verse-card .verse-text');
    const topicBefore=await sizeOf('.verse-card .verse-text');
    await visit('#/zechariah/1/full','.gen-full .gen-reading-controls [data-action="text-size"]');
    await visit('#/zechariah/1/3','.gen-reading-controls [data-action="text-size"]');
    await page.locator('.gen-reading-controls [data-action="text-size"]').click();
    assert.equal(await page.evaluate(()=>localStorage.getItem('scripture-for-life.text-size')),'large','Text size choice is saved');
    assert.equal(await sizeOf('.gen-narrative p')>storyBefore,true,'Story text grows');
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('.gen-narrative p').first().waitFor();
    assert.equal(await page.locator('.gen-reading-controls [data-action="text-size"]').getAttribute('aria-pressed'),'true','Story toggle remembers the choice after reload');
    await visit('#/help/fear','.verse-card .verse-text');
    assert.equal(await sizeOf('.verse-card .verse-text')>topicBefore,true,'Topic verses use the larger size');
    await visit('#/read/19/23','.reader-verse');
    assert.equal(await page.locator('.reading.read-size-large').count(),1,'Reader uses the remembered size');
    assert.equal(await sizeOf('.reader-verse'),26,'Reader verse is large');
    await visit('#/psalms/91','.psalm-chapter-verse .verse-text');
    assert.equal(await sizeOf('.psalm-chapter-verse .verse-text'),28,'Psalms use the larger size');
    await visit('#/read/19/23','.reader-verse');
    await page.locator('[data-action="text-size"]').click();
    assert.equal(await page.evaluate(()=>localStorage.getItem('scripture-for-life.text-size')),'normal','Turning it off is saved too');
    assert.equal(await page.locator('.reading.read-size-large').count(),0,'Reader returns to the standard size');
    // Dark mode: follows the device setting, a remembered toggle sits beside Text size, watercolors are never inverted.
    await page.evaluate(()=>localStorage.removeItem('scripture-for-life.theme'));
    await page.emulateMedia({colorScheme:'dark'});
    await visit('#/psalms/23','.psalm-chapter-verse .verse-text');
    await page.reload({waitUntil:'domcontentloaded'});await page.locator('.psalm-chapter-verse .verse-text').first().waitFor();
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark','Dark mode follows the device');
    const bgDark=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
    assert.ok(bgDark.match(/\d+/g).slice(0,3).every(n=>+n<60),'Dark page background: '+bgDark);
    assert.equal(await page.locator('img').evaluateAll(els=>els.filter(e=>getComputedStyle(e).filter!=='none').length),0,'Images are not filtered or inverted');
    await visit('#/zechariah/1/3','.gen-reading-controls [data-action="theme"]');
    await page.locator('.gen-reading-controls [data-action="theme"]').click();
    assert.equal(await page.evaluate(()=>localStorage.getItem('scripture-for-life.theme')),'light','Theme choice is saved');
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'light','Saved choice beats the device setting');
    await page.evaluate(()=>localStorage.removeItem('scripture-for-life.theme'));
    await page.emulateMedia({colorScheme:'light'});
    // Smaller app: verse watercolors ship at 832px wide (sharp on phones, keeps the APK well under 100 MB).
    await visit('#/study/22/1','img[data-verse-study-art]');
    await page.waitForFunction(()=>document.querySelector('img[data-verse-study-art]').naturalWidth>0);
    assert.equal(await page.locator('img[data-verse-study-art]').first().evaluate(i=>i.naturalWidth),832,'Verse watercolors are 832px wide');
    // Psalms 1-36 studies load on demand; the picker covers come from psalm-study-index.js.
await page.goto(base + '#/'); await page.reload(); await page.waitForFunction(() => window.SFL_VERSE_STUDIES && window.SFL_VERSE_STUDIES.coverIndex[1]);
assert(await page.evaluate(() => window.SFL_VERSE_STUDIES.has(1) && /psalm1\//.test(window.SFL_VERSE_STUDIES.coverIndex[1].src)), 'Psalm 1 cover comes from the lightweight index');
assert(!(await page.evaluate(() => Boolean(window.SFL_VERSE_STUDIES.studies[1]) || [...document.scripts].some(s => /\/psalm1\.js$/.test(s.src)))), 'Psalm 1 study must not load before it is opened');
await page.goto(base + '#/study/2/1'); await page.waitForSelector('img[data-verse-study-art="2-1"]', { state: 'attached' });
assert(await page.evaluate(() => Boolean(window.SFL_VERSE_STUDIES.studies[2] && window.SFL_VERSE_STUDIES.studies[3])), 'Opening Psalm 2 loads its shared study script');
// Dark-mode toggle on Home and Psalms; topic rows stay neutral in dark mode.
await page.goto(base + '#/'); await page.waitForSelector('.hero [data-action="theme"]', { state: 'attached' });
await page.goto(base + '#/study/1/1'); await page.waitForSelector('.psalm-picker + .theme-toggle-row [data-action="theme"], .theme-toggle-row [data-action="theme"]', { state: 'attached' });
await page.evaluate(() => { localStorage.setItem('scripture-for-life.theme', 'dark'); window.SFL_THEME.apply(); }); await page.goto(base + '#/help/fear'); await page.waitForSelector('.topic-layout .verse-card:nth-child(2)', { state: 'attached' });
const rowBg = await page.evaluate(() => getComputedStyle(document.querySelector('.topic-layout .verse-card:nth-child(2)')).backgroundColor.match(/\d+/g).map(Number));
assert(Math.abs(rowBg[0] - rowBg[2]) <= 4 && rowBg[0] < 60, 'Dark topic rows must be neutral, not brown: ' + rowBg);
await page.evaluate(() => { localStorage.removeItem('scripture-for-life.theme'); window.SFL_THEME.apply(); });
// Psalm dropdown labels fit on phones: short labels, full-width select.
await page.goto(base + '#/study/119/1'); await page.waitForSelector('#psalm-switch-select', { state: 'attached' });
const dd = await page.evaluate(() => { const s = document.querySelector('#psalm-switch-select'); return { w: s.getBoundingClientRect().width, longest: Math.max(...[...s.options].map(o => o.textContent.length)), full: [...s.options].every(o => o.title.startsWith(o.textContent.replace(/…$/, ''))) }; });
assert(dd.w > 150 && dd.longest <= 24 && dd.full, 'Psalm dropdown labels must fit on phones: ' + JSON.stringify(dd));
// Favorites and Saved are one collection: old favorites migrate into saved without losing existing saved verses.
await page.evaluate(() => { localStorage.setItem('scripture-for-life.saved', JSON.stringify({ 'Psalm 23:1': { text: 'The LORD is my shepherd; I shall not want.', note: 'keep' } })); localStorage.setItem('scripture-for-life.favorites', JSON.stringify({ 'Psalm 1:1': { text: 'Blessed is the man', at: 1 } })); });
await page.goto(base + '#/favorites'); await page.reload(); await page.waitForSelector('.saved-list');
const merged = await page.evaluate(() => ({ s: JSON.parse(localStorage.getItem('scripture-for-life.saved')), f: localStorage.getItem('scripture-for-life.favorites') }));
assert(merged.s['Psalm 23:1'].note === 'keep' && merged.s['Psalm 1:1'] && merged.f === null, 'Favorites merged into saved without data loss');
assert.equal(await page.locator('#main [data-action="favorite"]').count(), 0, 'No duplicate heart/bookmark buttons');
await page.goto(base + '#/help/fear'); await page.waitForSelector('.topic-layout .verse-card [data-action="save"]');
assert.equal(await page.locator('.topic-layout .verse-card').first().locator('[data-action="save"],[data-action="favorite"]').count(), 1, 'One heart per verse');
await page.evaluate(() => localStorage.removeItem('scripture-for-life.saved')); await page.reload();
// Reading streak: consecutive local days the app was opened.
await page.goto(base + '#/'); await page.waitForSelector('.votd .streak-line');
await page.setViewportSize({ width: 360, height: 800 });
const quickLines = await page.evaluate(() => { const q = document.querySelector('.gen-home-quick'), a = [...q.querySelectorAll('a')].map(x => x.getBoundingClientRect()); return { tops: new Set(a.map(r => Math.round(r.top))).size, overflow: q.scrollWidth > q.clientWidth + 1 }; });
await page.setViewportSize({ width: 390, height: 844 });
assert.deepEqual(quickLines, { tops: 1, overflow: false }, 'Home quick links fit on one line at 360px');
assert(/^\d+-day streak$/.test(await page.locator('.streak-line').innerText()), 'Home shows the streak line');
assert.deepEqual(await page.evaluate(() => { const u = window.APP_TEST.updateStreak; return [u(new Date(2026,0,5,9), null).count, u(new Date(2026,0,5,22), {last:'2026-01-05',count:3}).count, u(new Date(2026,0,6,0,5), {last:'2026-01-05',count:3}).count, u(new Date(2026,0,8), {last:'2026-01-05',count:3}).count]; }), [1, 3, 4, 1], 'Streak counts consecutive days and resets after a gap');
// Listen and Share buttons are at least 44x44 on phones, on every page that has them.
for (const r of ['#/', '#/help/fear', '#/study/1/1', '#/psalms/23', '#/stories/1/1']) {
  await page.goto(base + r); await page.waitForSelector('#main [data-action="listen-verse"], #main [data-action="share-scene"]', { state: 'attached' });
  const small = await page.evaluate(() => [...document.querySelectorAll('#main [data-action="listen-verse"], #main [data-action="share-verse"], #main [data-action="share-scene"]')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect()).filter(b => b.width < 44 || b.height < 44).length);
  assert.equal(small, 0, 'Listen/Share tap targets under 44px on ' + r);
}
// Remember where you left off: Read the Bible reopens the last chapter; topics reopen at the last scroll position.
await page.goto(base + '#/read/43/3'); await page.waitForSelector('#main .reader-pager', { state: 'attached' });
await page.goto(base + '#/'); await page.waitForSelector('.votd');
await page.goto(base + '#/read'); await page.waitForFunction(() => window.APP_TEST && document.title.includes('John 3'));
await page.goto(base + '#/help/fear'); await page.waitForSelector('.topic-layout .verse-card'); await page.evaluate(() => window.scrollTo(0, 700)); await page.waitForTimeout(500);
await page.goto(base + '#/'); await page.waitForSelector('.votd'); await page.goto(base + '#/help/fear'); await page.waitForSelector('.topic-layout .verse-card'); await page.waitForTimeout(200);
assert(Math.abs(await page.evaluate(() => window.scrollY) - 700) < 40, 'Topic reopens at last position');
assert.equal(await page.evaluate(() => window.APP_TEST.lastPlace().kind), 'topic', 'Continue card includes topics');
await page.evaluate(() => { localStorage.removeItem('scripture-for-life.topic-scroll'); window.scrollTo(0, 0); });
// Swipe between verses (psalm studies) and chapters (reader); vertical drags do nothing.
async function swipe(dx, dy = 0) { await page.evaluate(([dx, dy]) => { const mk = (x, y) => new Touch({ identifier: 1, target: document.body, clientX: x, clientY: y }); document.body.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [mk(200, 400)], changedTouches: [mk(200, 400)] })); document.body.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [mk(200 + dx, 400 + dy)] })); }, [dx, dy]); }
await page.goto(base + '#/study/1/1'); await page.waitForSelector('[data-verse-study="1"]');
await swipe(-150); await page.waitForFunction(() => location.hash === '#/study/1/2');
await swipe(150); await page.waitForFunction(() => location.hash === '#/study/1/1');
await swipe(-40, 300); await page.waitForTimeout(200); assert.equal(await page.evaluate(() => location.hash), '#/study/1/1', 'Vertical drag does not navigate');
await page.goto(base + '#/read/43/3'); await page.waitForSelector('#main [data-swipe="next"]');
await swipe(-150); await page.waitForFunction(() => location.hash === '#/read/43/4');
// One search for everything: people and stories are grouped with topics and verse matches.
await page.goto(base + '#/search/moses'); await page.waitForSelector('.result-group[data-group="stories"] li a');
assert(await page.locator('.result-group[data-group="people"] a[href="#/people/moses"]').count() === 1, 'Search finds people');
assert(/^#\/[a-z0-9]+\/\d+\/1$/.test(await page.locator('.result-group[data-group="stories"] li a').first().getAttribute('href')), 'Search finds story episodes');
await page.waitForSelector('#word-results *', { state: 'attached' });
// Auto-play next: on by default, toggle persists, next verse/episode routes are found, stop control present.
await page.goto(base + '#/study/1/2'); await page.waitForSelector('[data-verse-study="1"]');
assert.equal(await page.evaluate(() => window.APP_TEST.nextStudyVerse()), '#/study/1/3', 'Next study verse');
await page.goto(base + '#/study/1/6'); await page.waitForSelector('[data-verse-study="1"]');
assert.equal(await page.evaluate(() => window.APP_TEST.nextStudyVerse()), '', 'Last verse stops');
assert.equal(await page.locator('#audio-bar [data-action="toggle-autoplay"]').getAttribute('aria-pressed'), 'true', 'Auto-play defaults on');
assert.equal(await page.locator('#audio-bar [data-action="stop-audio"]').count(), 1, 'Clear stop control');
await page.goto(base + '#/exodus/1/full'); await page.waitForSelector('.ep-autoplay [data-action="toggle-autoplay"]');
assert.equal(await page.evaluate(() => window.APP_TEST.nextEpisodeRoute()), '#/exodus/2/full', 'Next episode route');
await page.locator('.ep-autoplay [data-action="toggle-autoplay"]').click();
assert.equal(await page.evaluate(() => localStorage.getItem('scripture-for-life.autoplay')), 'false', 'Auto-play toggle persists');
assert.equal(await page.locator('#audio-bar [data-action="toggle-autoplay"]').getAttribute('aria-pressed'), 'false', 'Toggles stay in sync');
await page.evaluate(() => localStorage.removeItem('scripture-for-life.autoplay'));
// Word search: Bible verses, story scenes and people; references still work first.
    await visit('#/search/shepherd','.word-hit');
    assert.equal(await page.locator('.word-hit mark').first().innerText().then(t=>/shepherd/i.test(t)),true,'Search word is highlighted');
    assert.equal(await page.locator('.word-story, .word-section .person-card').count()>0,true,'Word search finds a story or person for shepherd');
    // Each section starts short (5 results + Show more) and story scenes come first.
    assert.deepEqual(await page.locator('.word-section h2').allInnerTexts(),['Story scenes','Bible verses'].concat(await page.locator('#word-people-title').count()?['People']:[]),'Story scenes are listed before verses');
    assert.equal(await page.locator('.word-hit:not(.word-story)').count(),5,'Word search shows the first 5 verses');
    assert.ok(await page.locator('.word-story').count()<=5,'Word search shows at most 5 scenes at first');
    await page.locator('[data-action="word-more"][data-kind="verses"]').click();
    assert.equal(await page.locator('.word-hit:not(.word-story)').count(),25,'Show more reveals 20 more verses');
    for(let i=0;i<10&&!(await page.locator('.word-hit a.verse-ref[href="#/read/19/23/1"]').count());i++)await page.locator('[data-action="word-more"][data-kind="verses"]').click();
    assert.equal(await page.locator('.word-hit a.verse-ref[href="#/read/19/23/1"]').count(),1,'Word search finds Psalm 23:1 for shepherd');
    await visit('#/search/Zerubbabel','.word-hit');
    assert.equal(await page.locator('.word-section a.person-card[href="#/people/zerubbabel"]').count(),1,'Word search finds the Zerubbabel person page');
    await visit('#/search/'+encodeURIComponent('“Be still”'),'.word-hit');
    for(let i=0;i<10&&!(await page.locator('.word-hit a.verse-ref[href="#/read/19/46/10"]').count());i++)await page.locator('[data-action="word-more"][data-kind="verses"]').click();
    assert.equal(await page.locator('.word-hit a.verse-ref[href="#/read/19/46/10"]').count(),1,'Quoted phrase search finds Psalm 46:10');
    await visit('#/search/'+encodeURIComponent('John 3:16'),'.side-note');
    assert.equal(await page.locator('.side-note a[href="#/read/43/3/16"]').count()>0,true,'Reference search still opens John 3:16');
    assert.equal(await page.locator('.word-hit').count(),0,'Reference search skips word results');
    await visit('#/search/xyzzyqq','.no-results');
    await visit('#/help/fear','.verse-card');
    assert.equal(await page.evaluate(()=>{window.SFL_TOPIC_SHOW_ALL=false;const r=pickTopicRefs(window.BIBLE_DATA.topics.find(t=>t.id==='strength').refs);window.SFL_TOPIC_SHOW_ALL=true;return new Set(r).size;}),10,'Topic pages pick 10 distinct verses');
    // Topic pages show only the header and verse cards; Psalms/stories/people links live on other pages.
    for(const id of ['fear','strength','health','grief','direction','alone','forgiveness','gratitude']){
      await visit('#/help/'+id,'.verse-card');
      assert.equal(await page.locator('.topic-layout .side-note, [data-topic-connections]').count(),0,'Topic page has no side panel');
      assert.ok(await page.locator('.verse-card .verse-text').evaluateAll(els=>els.every(el=>el.textContent.trim().length>0)));
    }
    await visit('#/study/9/9','[data-verse-study="9"][data-current-verse="9"]');
    assert.equal(await page.locator('[data-related-needs]').count(),0,'study pages have no needs card');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    await page.locator('[data-note-ref="Psalm 9:9"]').fill('A refuge for what I am facing.');
    await page.locator('#verse-study-panel [data-action="save-note"]').click();
    await visit('#/saved','.saved-list');
    assert.ok((await page.locator('.saved-list').innerText()).includes('A refuge for what I am facing.'));
    assert.equal(await page.locator('.saved-actions a[href="#/study/9/9"]').count(),1);
    await visit('#/help/fear','.verse-card');
    await page.locator('.verse-card [data-action="open-verse"][data-ref="Psalm 9:9"]').click();
    await page.locator('#verse-dialog').waitFor({state:'visible'});
    assert.equal(await page.locator('#verse-dialog textarea').inputValue(),'A refuge for what I am facing.');
    await page.locator('.dialog-close').click();
    await visit('#/exodus/3/6','[data-story-book="exodus"] .gen-narrative');
    assert.equal(await page.locator('[data-related-needs]').count(),0,'scene pages have no needs card');
    await visit('#/people/jacob','.person-header');
    assert.equal(await page.locator('[data-related-needs] a[href="#/help/fear"]').count(),1);
    await visit('#/stories/8/7','.gen-narrative');
    assert.equal(await page.locator('[data-related-needs]').count(),0,'scene pages have no needs card');
    await visit('#/help/strength','.verse-card');
    assert.equal(await page.locator('.verse-card a[href="#/study/46/1"]').count(),1,'Refuge verse opens the new study');
    await visit('#/read/19/46','.reader-verse');
    assert.equal(await page.locator('a[href="#/study/46/1"]').count(),1);
    await page.locator('#verse-11 .icon-btn').click();
    await page.locator('#verse-dialog').waitFor({state:'visible'});
    await page.locator('#verse-dialog a[href="#/study/46/6"]').click();
    await page.locator('.ps46-page').waitFor();
    for(let step=1;step<=6;step++){
      await visit('#/study/46/'+step,'.ps46-page .verse-text');
      assert.equal(await page.locator('.study-explainer [role="tab"]').count(),4);
      assert.equal(await page.locator('.ps46-page .journey-steps,.ps46-page .journey-step').count(),0,'Psalm 46 has no row of section buttons');
      assert.equal(await page.locator('.ps46-page [data-psalm-verse-select]').inputValue(),String(step),'Psalm 46 dropdown shows the current section');
      assert.equal(await page.locator('.ps46-page [data-psalm-verse-select] option').count(),6);
      await page.waitForFunction(()=>{const i=document.querySelector('.ps46-watercolor');return i?.complete&&i.naturalWidth>0;});
      const expected=psalm46Sections[step-1];
      assert.equal(await page.locator('.ps46-passage').count(),expected.length);
      for(const verse of expected)assert.equal(await page.locator('[data-speakref="Psalm 46:'+verse+'"]').innerText(),psalm46[verse]);
      assert.equal(await page.locator('.ps46-people a[href="#/people/jacob"]').count(),1);
      assert.equal(await page.locator('.ps46-people a[href="#/people/sons-of-korah"]').count(),1);
      for(const name of ['Context','Explore','Reflect','Meaning']){
        await page.getByRole('tab',{name,exact:true}).click();
        assert.equal(await page.getByRole('tab',{name,exact:true}).getAttribute('aria-selected'),'true');
        assert.ok((await page.locator('#study-panel').innerText()).length>25);
      }
    }
    await page.locator('.ps46-page [data-psalm-verse-select]').selectOption('3');
    await page.waitForFunction(()=>location.hash==='#/study/46/3');
    await page.locator('.ps46-page [data-speakref="Psalm 46:4"]').waitFor();
    await visit('#/study/46/6','.ps46-page');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    await page.locator('[data-note-ref="Psalm 46:10"]').fill('Help me respond with wisdom.');
    await page.locator('#study-panel [data-action="save-note"]').click();
    await visit('#/saved','.saved-list');
    assert.match(await page.locator('.saved-list').innerText(),/Help me respond with wisdom\./);
    await visit('#/study/46/6','.ps46-page');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('[data-note-ref="Psalm 46:10"]').inputValue(),'Help me respond with wisdom.');
    await page.locator('.ps46-page [data-action="save"][data-ref="Psalm 46:11"]').click();
    await visit('#/saved','.saved-list');
    assert.equal(await page.locator('.saved-list a.verse-ref[href="#/read/19/46/11"]').count(),1);
    // Story scene reflections appear on Saved, link back to their scene, and hide when cleared.
    assert.equal(await page.locator('.story-reflections').count(),0,'No story section without story notes');
    await visit('#/zechariah/1/3','#zec-note');
    await page.locator('#zec-note').fill('A story reflection for Zechariah.');
    await page.locator('[data-zec="save"]').click();
    await visit('#/saved','.story-reflections');
    assert.match(await page.locator('#story-reflections-title').innerText(),/Your story reflections/);
    const storyCard=page.locator('.story-reflections .story-reflection');
    assert.equal(await storyCard.count(),1);
    assert.match(await storyCard.innerText(),/Zechariah · Episode 1: Return to Me · Scene 3/);
    assert.match(await storyCard.innerText(),/Where Are Your Fathers Now\?/);
    assert.match(await storyCard.innerText(),/A story reflection for Zechariah\./);
    assert.equal(await storyCard.locator('a[href="#/zechariah/1/3"]').count(),2,'Story reflection links back to its scene');
    await visit('#/zechariah/1/3','#zec-note');
    assert.equal(await page.locator('#zec-note').inputValue(),'A story reflection for Zechariah.');
    await page.locator('#zec-note').fill('');
    await page.locator('[data-zec="save"]').click();
    await visit('#/saved','.saved-list');
    assert.equal(await page.locator('.story-reflections').count(),0,'Cleared story notes hide the section');
    for(const person of ['sons-of-korah','jacob']){
      await visit('#/people/'+person,'.story-step');
      assert.equal(await page.locator('.side-note a[href="#/study/46/1"]').count(),1,'Character profile returns to the Psalm');
    }
    assert.equal(await page.locator('.side-note a[href="#/stories/8/1"]').count(),1,'Jacob profile connects to the Genesis story');
    await page.locator('.side-note a[href="#/stories/8/1"]').click();
    await page.locator('#gen-narrative p').first().waitFor();
    await visit('#/read/1/1','.reader-verse');
    assert.ok(await page.locator('.reader-verse').count()>=20,'Genesis chapter 1 verses rendered');
    await visit('#/psalms','.psalm-picker [data-psalms-search]');
    await page.locator('.psalm-picker [data-psalms-search]').fill('119');
    assert.equal(await page.locator('.psalm-find-hit').count(),1);
    assert.equal(await page.locator('.psalm-find-hit').getAttribute('href'),'#/study/119/1');
    await visit('#/psalms/119','[data-psalm-chapter="119"]');
    await page.locator('[data-psalm-chapter="119"]').waitFor();
    assert.equal(await page.locator('.psalm-chapter-verse').count(),176);
    await page.locator('[data-psalm-verse-jump]').selectOption('105');
    await page.locator('#psalm-line-105.selected').waitFor();
    for(const label of ['Context','Explore','Reflect','Meaning']){
      await page.getByRole('tab',{name:label,exact:true}).click();
      assert.ok((await page.locator('#chapter-panel').innerText()).length>50);
    }
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    await page.locator('#chapter-panel textarea').fill('Light for the next step.');
    await page.locator('#chapter-panel [data-action="save-note"]').click();
    await page.reload();await page.locator('.psalm-chapter').waitFor();
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('#chapter-panel textarea').inputValue(),'Light for the next step.');
    for(const n of [1,42,46,88,91,137,150]){
      await visit('#/psalms/'+n,'.psalm-chapter-art');
      await page.waitForFunction(()=>{const i=document.querySelector('.psalm-chapter-figure img');return i?.complete&&i.naturalWidth>0;});
      assert.ok(await page.locator('.psalm-chapter-verse').count()>0);
    }
    await page.locator('[data-psalm-switch]').selectOption('2');await page.locator('[data-verse-study="2"]').waitFor();
    await visit('#/psalms/2','[data-psalm-chapter="2"]');
    await page.locator('.psalm-chapter-pager').first().locator('a[href="#/psalms/3"]').click();await page.locator('[data-psalm-chapter="3"]').waitFor();
    await visit('#/psalms','[data-psalm-chapter="3"] .psalm-picker');
    await page.locator('.psalm-picker [data-psalms-search]').fill('1');
    await page.locator('.psalm-picker [data-psalms-search]').press('Enter');
    await page.locator('[data-verse-study="1"]').waitFor();
    const psalm1=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'data/bible.json'),'utf8')).books[18].chapters[0]);
    const meanings=[],images=[];
    for(let n=1;n<=6;n++){
      await visit('#/study/1/'+n,'[data-verse-study="1"]');
      await page.waitForFunction(()=>{const i=document.querySelector('[data-verse-study-art]');return i?.complete&&i.naturalWidth>0;});
      assert.equal(await page.locator('.study-verse [data-speakref]').innerText(),psalm1[n]);
      assert.equal(await page.locator('[data-psalm-verse-select] option').count(),6);
      assert.equal(await page.locator('[data-psalm-verse-select]').inputValue(),String(n));
      images.push(await page.locator('[data-verse-study-art]').getAttribute('src'));
      meanings.push(await page.locator('#verse-study-panel').innerText());
      for(const label of ['Context','Explore','Reflect','Meaning']){
        await page.getByRole('tab',{name:label,exact:true}).click();
        assert.ok((await page.locator('#verse-study-panel').innerText()).length>100);
      }
    }
    assert.equal(new Set(images).size,6);assert.equal(new Set(meanings).size,6);
    await visit('#/study/1/3','[data-verse-study="1"]');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    await page.locator('[data-note-ref="Psalm 1:3"]').fill('Steady roots and patient growth.');
    await page.locator('#verse-study-panel [data-action="save-note"]').click();
    await page.reload();await page.locator('[data-verse-study="1"]').waitFor();
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('[data-note-ref="Psalm 1:3"]').inputValue(),'Steady roots and patient growth.');
    await page.locator('[data-psalm-switch]').selectOption('23');await page.locator('.study-landscape').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('1');await page.locator('[data-verse-study="1"]').waitFor();
    assert.ok(page.url().endsWith('#/study/1/3'),'Resume is independent of Psalm 23');
    await page.locator('.study-bottom a[href="#/study/1/4"]').click();await page.locator('[data-current-verse="4"]').waitFor();
    await page.locator('.study-bottom a[href="#/study/1/3"]').click();await page.locator('[data-current-verse="3"]').waitFor();
    assert.equal(await page.locator('.study-context a[href="#/people/jesus"]').count(),1);
    assert.equal(await page.locator('.study-context a[href="#/people/ruth"]').count(),1);
    await visit('#/study/1/6','[data-verse-study="1"]');
    assert.equal(await page.locator('.study-bottom a[href="#/study/2/1"]').count(),1);
    const fullPsalms=JSON.parse(fs.readFileSync(path.join(root,'data/bible.json'),'utf8')).books[18].chapters;
    for(const number of [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,25,26,27,28,29,30,31,32,33,34,35,36]){
      const verses=Object.fromEntries(fullPsalms[number-1]),images=[],meanings=[];
      for(let n=1;n<=Object.keys(verses).length;n++){
        await visit('#/study/'+number+'/'+n,'[data-verse-study="'+number+'"]');
        await page.waitForFunction(()=>{const i=document.querySelector('[data-verse-study-art]');return i?.complete&&i.naturalWidth>0;});
        assert.equal(await page.locator('.study-verse [data-speakref]').innerText(),verses[n]);
        assert.equal(await page.locator('[data-psalm-verse-select] option').count(),Object.keys(verses).length);
        assert.equal(await page.locator('[data-psalm-verse-select]').inputValue(),String(n));
        images.push(await page.locator('[data-verse-study-art]').getAttribute('src'));
        meanings.push(await page.locator('#verse-study-panel').innerText());
        for(const label of ['Context','Explore','Reflect','Meaning']){
          await page.getByRole('tab',{name:label,exact:true}).click();
          assert.ok((await page.locator('#verse-study-panel').innerText()).length>80);
        }
      }
      assert.equal(new Set(images).size,Object.keys(verses).length);
      assert.equal(new Set(meanings).size,Object.keys(verses).length);
      await visit('#/study/'+number+'/3','[data-verse-study="'+number+'"]');
      await page.getByRole('tab',{name:'Reflect',exact:true}).click();
      await page.locator('#verse-study-panel textarea').fill('Reflection for Psalm '+number);
      await page.locator('#verse-study-panel [data-action="save-note"]').click();
      await page.reload();await page.locator('[data-verse-study="'+number+'"]').waitFor();
      await page.getByRole('tab',{name:'Reflect',exact:true}).click();
      assert.equal(await page.locator('#verse-study-panel textarea').inputValue(),'Reflection for Psalm '+number);
    }
    // Psalm 36 shares reflections across study, dialog and Saved.
    await visit('#/saved','.saved-list');
    assert.match(await page.locator('.saved-list').innerText(),/Reflection for Psalm 36/);
    await page.locator('[data-action="open-verse"][data-ref="Psalm 36:3"]').click();
    await page.locator('#verse-dialog[open]').waitFor();
    assert.equal(await page.locator('#verse-dialog [data-note-ref="Psalm 36:3"]').inputValue(),'Reflection for Psalm 36');
    await page.locator('#verse-dialog textarea').fill('One shared Psalm 36 reflection.');
    await page.locator('#verse-dialog [data-action="save-note"]').click();
    await page.locator('#verse-dialog').evaluate(d=>d.close());
    await visit('#/study/36/3','[data-verse-study="36"]');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('#verse-study-panel textarea').inputValue(),'One shared Psalm 36 reflection.');
    await visit('#/study/36/8','[data-verse-study="36"]');
    await visit('#/study/35/6','[data-verse-study="35"]');
    await page.locator('[data-psalm-switch]').selectOption('36');
    await page.locator('[data-verse-study="36"][data-current-verse="8"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('35');
    await page.locator('[data-verse-study="35"][data-current-verse="6"]').waitFor();
    // Psalm 30 shares reflections across study, dialog and Saved.
    await visit('#/saved','.saved-list');
    assert.match(await page.locator('.saved-list').innerText(),/Reflection for Psalm 30/);
    await page.locator('[data-action="open-verse"][data-ref="Psalm 30:3"]').click();
    await page.locator('#verse-dialog[open]').waitFor();
    assert.equal(await page.locator('#verse-dialog [data-note-ref="Psalm 30:3"]').inputValue(),'Reflection for Psalm 30');
    await page.locator('#verse-dialog textarea').fill('One shared Psalm 30 reflection.');
    await page.locator('#verse-dialog [data-action="save-note"]').click();
    await page.locator('#verse-dialog').evaluate(d=>d.close());
    await visit('#/study/30/3','[data-verse-study="30"]');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('#verse-study-panel textarea').inputValue(),'One shared Psalm 30 reflection.');
    await visit('#/study/30/8','[data-verse-study="30"]');
    await visit('#/study/29/6','[data-verse-study="29"]');
    await page.locator('[data-psalm-switch]').selectOption('30');
    await page.locator('[data-verse-study="30"][data-current-verse="8"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('29');
    await page.locator('[data-verse-study="29"][data-current-verse="6"]').waitFor();
    // Psalm 29 shares reflections across study, dialog and Saved.
    await visit('#/saved','.saved-list');
    assert.match(await page.locator('.saved-list').innerText(),/Reflection for Psalm 29/);
    await page.locator('[data-action="open-verse"][data-ref="Psalm 29:3"]').click();
    await page.locator('#verse-dialog[open]').waitFor();
    assert.equal(await page.locator('#verse-dialog [data-note-ref="Psalm 29:3"]').inputValue(),'Reflection for Psalm 29');
    await page.locator('#verse-dialog textarea').fill('One shared Psalm 29 reflection.');
    await page.locator('#verse-dialog [data-action="save-note"]').click();
    await page.locator('#verse-dialog').evaluate(d=>d.close());
    await visit('#/study/29/3','[data-verse-study="29"]');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('#verse-study-panel textarea').inputValue(),'One shared Psalm 29 reflection.');
    await visit('#/study/29/8','[data-verse-study="29"]');
    await visit('#/study/28/6','[data-verse-study="28"]');
    await page.locator('[data-psalm-switch]').selectOption('29');
    await page.locator('[data-verse-study="29"][data-current-verse="8"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('28');
    await page.locator('[data-verse-study="28"][data-current-verse="6"]').waitFor();
    // Psalm 28 shares reflections across study, dialog and Saved.
    await visit('#/saved','.saved-list');
    assert.match(await page.locator('.saved-list').innerText(),/Reflection for Psalm 28/);
    await page.locator('[data-action="open-verse"][data-ref="Psalm 28:3"]').click();
    await page.locator('#verse-dialog[open]').waitFor();
    assert.equal(await page.locator('#verse-dialog [data-note-ref="Psalm 28:3"]').inputValue(),'Reflection for Psalm 28');
    await page.locator('#verse-dialog textarea').fill('One shared Psalm 28 reflection.');
    await page.locator('#verse-dialog [data-action="save-note"]').click();
    await page.locator('#verse-dialog').evaluate(d=>d.close());
    await visit('#/study/28/3','[data-verse-study="28"]');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('#verse-study-panel textarea').inputValue(),'One shared Psalm 28 reflection.');
    await visit('#/study/28/8','[data-verse-study="28"]');
    await visit('#/study/27/6','[data-verse-study="27"]');
    await page.locator('[data-psalm-switch]').selectOption('28');
    await page.locator('[data-verse-study="28"][data-current-verse="8"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('27');
    await page.locator('[data-verse-study="27"][data-current-verse="6"]').waitFor();
    // Psalm 27 shares reflections across study, dialog and Saved.
    await visit('#/saved','.saved-list');
    assert.match(await page.locator('.saved-list').innerText(),/Reflection for Psalm 27/);
    await page.locator('[data-action="open-verse"][data-ref="Psalm 27:3"]').click();
    await page.locator('#verse-dialog[open]').waitFor();
    assert.equal(await page.locator('#verse-dialog [data-note-ref="Psalm 27:3"]').inputValue(),'Reflection for Psalm 27');
    await page.locator('#verse-dialog textarea').fill('One shared Psalm 27 reflection.');
    await page.locator('#verse-dialog [data-action="save-note"]').click();
    await page.locator('#verse-dialog').evaluate(d=>d.close());
    await visit('#/study/27/3','[data-verse-study="27"]');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('#verse-study-panel textarea').inputValue(),'One shared Psalm 27 reflection.');
    await visit('#/study/27/8','[data-verse-study="27"]');
    await visit('#/study/26/6','[data-verse-study="26"]');
    await page.locator('[data-psalm-switch]').selectOption('27');
    await page.locator('[data-verse-study="27"][data-current-verse="8"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('26');
    await page.locator('[data-verse-study="26"][data-current-verse="6"]').waitFor();
    // Psalm 26 shares reflections across study, dialog and Saved.
    await visit('#/saved','.saved-list');
    assert.match(await page.locator('.saved-list').innerText(),/Reflection for Psalm 26/);
    await page.locator('[data-action="open-verse"][data-ref="Psalm 26:3"]').click();
    await page.locator('#verse-dialog[open]').waitFor();
    assert.equal(await page.locator('#verse-dialog [data-note-ref="Psalm 26:3"]').inputValue(),'Reflection for Psalm 26');
    await page.locator('#verse-dialog textarea').fill('One shared Psalm 26 reflection.');
    await page.locator('#verse-dialog [data-action="save-note"]').click();
    await page.locator('#verse-dialog').evaluate(d=>d.close());
    await visit('#/study/26/3','[data-verse-study="26"]');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('#verse-study-panel textarea').inputValue(),'One shared Psalm 26 reflection.');
    await visit('#/study/26/8','[data-verse-study="26"]');
    await visit('#/study/25/6','[data-verse-study="25"]');
    await page.locator('[data-psalm-switch]').selectOption('26');
    await page.locator('[data-verse-study="26"][data-current-verse="8"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('25');
    await page.locator('[data-verse-study="25"][data-current-verse="6"]').waitFor();
    // Psalm 25 shares reflections across study, dialog and Saved.
    await visit('#/study/25/3','[data-verse-study="25"]');
    await visit('#/saved','.saved-list');
    assert.match(await page.locator('.saved-list').innerText(),/Reflection for Psalm 25/);
    await page.locator('[data-action="open-verse"][data-ref="Psalm 25:3"]').click();
    await page.locator('#verse-dialog[open]').waitFor();
    assert.equal(await page.locator('#verse-dialog [data-note-ref="Psalm 25:3"]').inputValue(),'Reflection for Psalm 25');
    await page.locator('#verse-dialog textarea').fill('One shared Psalm 25 reflection.');
    await page.locator('#verse-dialog [data-action="save-note"]').click();
    await page.locator('#verse-dialog').evaluate(d=>d.close());
    await visit('#/study/25/3','[data-verse-study="25"]');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('#verse-study-panel textarea').inputValue(),'One shared Psalm 25 reflection.');
    // Psalm 24 shares reflections across study, dialog and Saved.
    await visit('#/study/24/3','[data-verse-study="24"]');
    await visit('#/saved','.saved-list');
    assert.match(await page.locator('.saved-list').innerText(),/Reflection for Psalm 24/);
    await page.locator('[data-action="open-verse"][data-ref="Psalm 24:3"]').click();
    await page.locator('#verse-dialog[open]').waitFor();
    assert.equal(await page.locator('#verse-dialog [data-note-ref="Psalm 24:3"]').inputValue(),'Reflection for Psalm 24');
    await page.locator('#verse-dialog textarea').fill('One shared Psalm 24 reflection.');
    await page.locator('#verse-dialog [data-action="save-note"]').click();
    await page.locator('#verse-dialog').evaluate(d=>d.close());
    await visit('#/study/24/3','[data-verse-study="24"]');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('#verse-study-panel textarea').inputValue(),'One shared Psalm 24 reflection.');
    // The new chapter uses the same reflection store in study, dialog and Saved.
    await visit('#/study/22/3','[data-verse-study="22"]');
    await visit('#/saved','.saved-list');
    assert.match(await page.locator('.saved-list').innerText(),/Reflection for Psalm 22/);
    await page.locator('[data-action="open-verse"][data-ref="Psalm 22:3"]').click();
    await page.locator('#verse-dialog[open]').waitFor();
    assert.equal(await page.locator('#verse-dialog [data-note-ref="Psalm 22:3"]').inputValue(),'Reflection for Psalm 22');
    await page.locator('#verse-dialog textarea').fill('One shared Psalm 22 reflection.');
    await page.locator('#verse-dialog [data-action="save-note"]').click();
    await page.locator('#verse-dialog').evaluate(d=>d.close());
    await visit('#/study/22/3','[data-verse-study="22"]');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('#verse-study-panel textarea').inputValue(),'One shared Psalm 22 reflection.');
    // The new chapter uses the same reflection store in study, dialog and Saved.
    await visit('#/study/21/3','[data-verse-study="21"]');
    await visit('#/saved','.saved-list');
    assert.match(await page.locator('.saved-list').innerText(),/Reflection for Psalm 21/);
    await page.locator('[data-action="open-verse"][data-ref="Psalm 21:3"]').click();
    await page.locator('#verse-dialog[open]').waitFor();
    assert.equal(await page.locator('#verse-dialog [data-note-ref="Psalm 21:3"]').inputValue(),'Reflection for Psalm 21');
    await page.locator('#verse-dialog textarea').fill('One shared Psalm 21 reflection.');
    await page.locator('#verse-dialog [data-action="save-note"]').click();
    await page.locator('#verse-dialog').evaluate(d=>d.close());
    await visit('#/study/21/3','[data-verse-study="21"]');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('#verse-study-panel textarea').inputValue(),'One shared Psalm 21 reflection.');
    // The new chapter uses the same reflection store in study, dialog and Saved.
    await visit('#/study/20/3','[data-verse-study="20"]');
    await visit('#/saved','.saved-list');
    assert.match(await page.locator('.saved-list').innerText(),/Reflection for Psalm 20/);
    await page.locator('[data-action="open-verse"][data-ref="Psalm 20:3"]').click();
    await page.locator('#verse-dialog[open]').waitFor();
    assert.equal(await page.locator('#verse-dialog [data-note-ref="Psalm 20:3"]').inputValue(),'Reflection for Psalm 20');
    await page.locator('#verse-dialog textarea').fill('One shared Psalm 20 reflection.');
    await page.locator('#verse-dialog [data-action="save-note"]').click();
    await page.locator('#verse-dialog').evaluate(d=>d.close());
    await visit('#/study/20/3','[data-verse-study="20"]');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('#verse-study-panel textarea').inputValue(),'One shared Psalm 20 reflection.');
    // The new chapter uses the same reflection store in study, dialog and Saved.
    await visit('#/study/19/3','[data-verse-study="19"]');
    await visit('#/saved','.saved-list');
    assert.match(await page.locator('.saved-list').innerText(),/Reflection for Psalm 19/);
    await page.locator('[data-action="open-verse"][data-ref="Psalm 19:3"]').click();
    await page.locator('#verse-dialog[open]').waitFor();
    assert.equal(await page.locator('#verse-dialog [data-note-ref="Psalm 19:3"]').inputValue(),'Reflection for Psalm 19');
    await page.locator('#verse-dialog textarea').fill('One shared Psalm 19 reflection.');
    await page.locator('#verse-dialog [data-action="save-note"]').click();
    await page.locator('#verse-dialog').evaluate(d=>d.close());
    await visit('#/study/19/3','[data-verse-study="19"]');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('#verse-study-panel textarea').inputValue(),'One shared Psalm 19 reflection.');
    // The new chapter uses the same reflection store in study, dialog and Saved.
    await visit('#/study/18/3','[data-verse-study="18"]');
    await visit('#/saved','.saved-list');
    assert.match(await page.locator('.saved-list').innerText(),/Reflection for Psalm 18/);
    await page.locator('[data-action="open-verse"][data-ref="Psalm 18:3"]').click();
    await page.locator('#verse-dialog[open]').waitFor();
    assert.equal(await page.locator('#verse-dialog [data-note-ref="Psalm 18:3"]').inputValue(),'Reflection for Psalm 18');
    await page.locator('#verse-dialog textarea').fill('One shared Psalm 18 reflection.');
    await page.locator('#verse-dialog [data-action="save-note"]').click();
    await page.locator('#verse-dialog').evaluate(d=>d.close());
    await visit('#/study/18/3','[data-verse-study="18"]');
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    assert.equal(await page.locator('#verse-study-panel textarea').inputValue(),'One shared Psalm 18 reflection.');
    for(const [id,verse] of [['direction',28],['gratitude',49]]){
      await visit('#/study/18/'+verse+'','body');
      await page.locator('[data-verse-study="18"][data-current-verse="'+verse+'"]').waitFor();
      await visit('#/help/'+id,'body');
      await page.locator('.verse-card').first().waitFor();
    }
    await visit('#/study/18/3','[data-verse-study="18"]');
    await page.locator('[data-psalm-switch]').selectOption('2');await page.locator('[data-verse-study="2"]').waitFor();
    assert.ok(page.url().endsWith('#/study/2/3'),'Each psalm retains its own verse');
    await visit('#/study/2/12','[data-verse-study="2"]');
    await page.locator('.study-bottom a[href="#/study/3/1"]').click();await page.locator('[data-current-verse="1"][data-verse-study="3"]').waitFor();
    await visit('#/study/3/8','[data-verse-study="3"]');
    await page.locator('.study-bottom a[href="#/study/4/1"]').click();await page.locator('[data-current-verse="1"][data-verse-study="4"]').waitFor();
    assert.equal(await page.locator('.study-context a[href="#/people/david"]').count(),1);
    await visit('#/study/4/8','[data-verse-study="4"]');
    await page.locator('.study-bottom a[href="#/study/5/1"]').click();await page.locator('[data-current-verse="1"][data-verse-study="5"]').waitFor();
    assert.equal(await page.locator('.study-context a[href="#/people/david"]').count(),1);
    await visit('#/study/5/12','[data-verse-study="5"]');
    await page.locator('.study-bottom a[href="#/study/6/1"]').click();await page.locator('[data-current-verse="1"][data-verse-study="6"]').waitFor();
    await visit('#/study/6/10','[data-verse-study="6"]');
    await page.locator('.study-bottom a[href="#/study/7/1"]').click();await page.locator('[data-verse-study="7"]').waitFor();
    await visit('#/study/7/17','[data-verse-study="7"]');
    await page.locator('.study-bottom a[href="#/study/8/1"]').click();await page.locator('[data-verse-study="8"]').waitFor();
    assert.equal(await page.locator('.study-context a[href="#/people/jesus"]').count(),1);
    await visit('#/study/8/9','[data-verse-study="8"]');
    await page.locator('.study-bottom a[href="#/study/9/1"]').click();await page.locator('[data-verse-study="9"]').waitFor();
    await visit('#/study/9/20','[data-verse-study="9"]');
    await page.locator('[data-psalm-switch]').selectOption('10');await page.locator('[data-verse-study="10"]').waitFor();
    assert.ok(page.url().endsWith('#/study/10/3'),'Psalm 10 resumes independently');
    await visit('#/study/9/20','[data-verse-study="9"]');
    await page.locator('.study-bottom a[href="#/study/10/1"]').click();
    await page.locator('[data-verse-study="10"][data-current-verse="1"]').waitFor();
    await visit('#/study/10/18','[data-verse-study="10"]');
    await page.locator('.study-bottom a[href="#/study/11/1"]').click();
    await page.locator('[data-verse-study="11"]').waitFor();
    await visit('#/study/11/7','[data-verse-study="11"]');
    await page.locator('.study-bottom a[href="#/study/12/1"]').click();
    await page.locator('[data-verse-study="12"]').waitFor();
    await visit('#/study/12/8','[data-verse-study="12"]');
    await page.locator('.study-bottom a[href="#/study/13/1"]').click();
    await page.locator('[data-verse-study="13"]').waitFor();
    for(const [number,last,next] of [[13,6,14],[14,7,15]]){
      await visit('#/study/'+number+'/'+last,'[data-verse-study="'+number+'"]');
      await page.locator('.study-bottom a[href="#/study/'+next+'/1"]').click();
      await page.locator('[data-verse-study="'+next+'"]').waitFor();
    }
    await visit('#/study/15/5','[data-verse-study="15"]');
    await page.locator('.study-bottom a[href="#/study/16/1"]').click();
    await page.locator('[data-verse-study="16"][data-current-verse="1"]').waitFor();
    await visit('#/study/16/11','[data-verse-study="16"]');
    await page.locator('.study-bottom a[href="#/study/17/1"]').click();
    await page.locator('[data-verse-study="17"][data-current-verse="1"]').waitFor();
    await visit('#/study/17/15','[data-verse-study="17"]');
    await page.locator('.study-bottom a[href="#/study/18/1"]').click();
    await page.locator('[data-verse-study="18"][data-current-verse="1"]').waitFor();
    await visit('#/study/18/50','[data-verse-study="18"]');
    await page.locator('.study-bottom a[href="#/study/19/1"]').click();
    await page.locator('[data-verse-study="19"][data-current-verse="1"]').waitFor();
    await visit('#/study/19/14','[data-verse-study="19"]');
    await page.locator('.study-bottom a[href="#/study/20/1"]').click();
    await page.locator('[data-verse-study="20"][data-current-verse="1"]').waitFor();
    await visit('#/study/20/9','[data-verse-study="20"]');
    await page.locator('.study-bottom a[href="#/study/21/1"]').click();
    await page.locator('[data-verse-study="21"][data-current-verse="1"]').waitFor();
    await visit('#/study/21/13','[data-verse-study="21"]');
    await page.locator('.study-bottom a[href="#/study/22/1"]').click();
    await page.locator('[data-verse-study="22"][data-current-verse="1"]').waitFor();
    await visit('#/study/22/31','[data-verse-study="22"]');
    await page.locator('.study-bottom a[href="#/study/23/1"]').click();
    await page.locator('.study-landscape').waitFor();
    await visit('#/study/22/24','[data-verse-study="22"]');
    await visit('#/study/23/6','.study-landscape');
    await page.locator('[data-psalm-switch]').selectOption('24');
    await page.locator('[data-verse-study="24"]').waitFor();
    await visit('#/study/25/22','[data-verse-study="25"]');
    await page.locator('.study-bottom a[href="#/study/26/1"]').click();
    await page.locator('[data-verse-study="26"][data-current-verse="1"]').waitFor();
    assert.equal(await page.locator('.study-context a[href="#/people/david"]').count(),1);
    await visit('#/study/26/12','[data-verse-study="26"]');
    await page.locator('.study-bottom a[href="#/study/27/1"]').click();
    await page.locator('[data-verse-study="27"][data-current-verse="1"]').waitFor();
    await visit('#/study/27/14','[data-verse-study="27"]');
    await page.locator('.study-bottom a[href="#/study/28/1"]').click();
    await page.locator('[data-verse-study="28"][data-current-verse="1"]').waitFor();
    await visit('#/study/28/9','[data-verse-study="28"]');
    await page.locator('.study-bottom a[href="#/study/29/1"]').click();
    await page.locator('[data-verse-study="29"][data-current-verse="1"]').waitFor();
    await visit('#/study/29/11','[data-verse-study="29"]');
    await page.locator('.study-bottom a[href="#/study/30/1"]').click();
    await page.locator('[data-verse-study="30"][data-current-verse="1"]').waitFor();
    await visit('#/study/30/12','[data-verse-study="30"]');
    await page.locator('.study-bottom a[href="#/study/31/1"]').click();
    await page.locator('[data-verse-study="31"][data-current-verse="1"]').waitFor();
    await visit('#/study/31/24','[data-verse-study="31"]');
    await page.locator('.study-bottom a[href="#/study/32/1"]').click();
    await page.locator('[data-verse-study="32"][data-current-verse="1"]').waitFor();
    await visit('#/study/32/11','[data-verse-study="32"]');
    await page.locator('.study-bottom a[href="#/study/33/1"]').click();
    await page.locator('[data-verse-study="33"][data-current-verse="1"]').waitFor();
    await visit('#/study/33/22','[data-verse-study="33"]');
    await page.locator('.study-bottom a[href="#/study/34/1"]').click();
    await page.locator('[data-verse-study="34"][data-current-verse="1"]').waitFor();
    await visit('#/study/34/22','[data-verse-study="34"]');
    await page.locator('.study-bottom a[href="#/study/35/1"]').click();
    await page.locator('[data-verse-study="35"][data-current-verse="1"]').waitFor();
    await visit('#/study/35/28','[data-verse-study="35"]');
    await page.locator('.study-bottom a[href="#/study/36/1"]').click();
    await page.locator('[data-verse-study="36"][data-current-verse="1"]').waitFor();
    await visit('#/study/36/12','[data-verse-study="36"]');
    await page.locator('.study-bottom a[href="#/study/37/1"]').click();
    await page.locator('.psalm-verse-study[data-verse-study="37"][data-current-verse="1"] img[src="assets/psalms-chapter-art/psalm37-watercolor.webp"]').waitFor();
    await visit('#/study/150/6','.psalm-verse-study[data-verse-study="150"][data-current-verse="6"]');
    for(const [n,v] of [[91,1],[119,105],[150,6]]){await visit(`#/study/${n}/${v}`,`[data-verse-study="${n}"][data-current-verse="${v}"]`);await page.locator('[data-verse-study-tab="context"]').click();await page.locator('#verse-study-panel h3').waitFor();}
    await visit('#/study/45/17','[data-verse-study="45"]');await page.locator('.study-bottom a[href="#/study/46/1"]').click();await page.waitForFunction(()=>location.hash==='#/study/46/1'&&!document.querySelector('[data-verse-study="45"]'));
    for(const [id,verse] of [['fear',7],['gratitude',5],['gratitude',9]]){
      await visit('#/study/36/'+verse+'','body');
      await page.locator('[data-verse-study="36"][data-current-verse="'+verse+'"]').waitFor();
      await visit('#/help/'+id,'body');
      await page.locator('.verse-card').first().waitFor();
    }
    for(const [id,verse] of [['health',2],['grief',5],['gratitude',11]]){
      await visit('#/study/30/'+verse+'','body');
      await page.locator('[data-verse-study="30"][data-current-verse="'+verse+'"]').waitFor();
      await visit('#/help/'+id,'body');
      await page.locator('.verse-card').first().waitFor();
    }
    for(const [id,verse] of [['gratitude',2],['fear',10],['strength',11]]){
      await visit('#/study/29/'+verse+'','body');
      await page.locator('[data-verse-study="29"][data-current-verse="'+verse+'"]').waitFor();
      await visit('#/help/'+id,'body');
      await page.locator('.verse-card').first().waitFor();
    }
    for(const [id,verse] of [['alone',1],['gratitude',6],['strength',7],['direction',9]]){
      await visit('#/study/28/'+verse+'','body');
      await page.locator('[data-verse-study="28"][data-current-verse="'+verse+'"]').waitFor();
      await visit('#/help/'+id,'body');
      await page.locator('.verse-card').first().waitFor();
    }
    for(const [id,verse] of [['fear',1],['alone',10],['direction',11],['strength',14]]){
      await visit('#/study/27/'+verse+'','body');
      await page.locator('[data-verse-study="27"][data-current-verse="'+verse+'"]').waitFor();
      await visit('#/help/'+id,'body');
      await page.locator('.verse-card').first().waitFor();
    }
    for(const [id,verse] of [['direction',3],['gratitude',7],['forgiveness',11],['strength',12]]){
      await visit('#/study/26/'+verse+'','body');
      await page.locator('[data-verse-study="26"][data-current-verse="'+verse+'"]').waitFor();
      await visit('#/help/'+id,'body');
      await page.locator('.verse-card').first().waitFor();
    }
    await visit('#/study/24/10','[data-verse-study="24"]');
    await page.locator('.study-bottom a[href="#/study/25/1"]').click();
    await page.locator('[data-verse-study="25"][data-current-verse="1"]').waitFor();
    assert.equal(await page.locator('.study-context a[href="#/people/david"]').count(),1);
    await visit('#/study/25/16','[data-verse-study="25"]');
    await page.locator('[data-psalm-switch]').selectOption('24');
    await page.locator('[data-verse-study="24"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('25');
    await page.locator('[data-verse-study="25"][data-current-verse="16"]').waitFor();
    for(const [id,verse] of [['direction',4],['forgiveness',11],['alone',16],['strength',17]]){
      await visit('#/study/25/'+verse+'','body');
      await page.locator('[data-verse-study="25"][data-current-verse="'+verse+'"]').waitFor();
      await visit('#/help/'+id,'body');
      await page.locator('.verse-card').first().waitFor();
    }
    await visit('#/study/24/6','[data-verse-study="24"]');
    for(const person of ['david','jacob'])assert.equal(await page.locator('.study-context a[href="#/people/'+person+'"]').count(),1);
    await page.locator('[data-psalm-switch]').selectOption('22');
    await page.locator('[data-verse-study="22"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('24');
    await page.locator('[data-verse-study="24"][data-current-verse="6"]').waitFor();
    for(const [id,verse] of [['gratitude',1],['direction',3],['direction',6],['strength',8]]){
      await visit('#/study/24/'+verse+'','body');
      await page.locator('[data-verse-study="24"][data-current-verse="'+verse+'"]').waitFor();
      await visit('#/help/'+id,'body');
      await page.locator('.verse-card').first().waitFor();
    }
    await visit('#/study/22/24','[data-verse-study="22"]');
    for(const person of ['david','jesus','jacob'])assert.equal(await page.locator('.study-context a[href="#/people/'+person+'"]').count(),1);
    await page.locator('[data-psalm-switch]').selectOption('21');
    await page.locator('[data-verse-study="21"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('22');
    await page.locator('[data-verse-study="22"][data-current-verse="24"]').waitFor();
    for(const [id,verse] of [['alone',11],['grief',14],['gratitude',25]]){
      await visit('#/study/22/'+verse+'','body');
      await page.locator('[data-verse-study="22"][data-current-verse="'+verse+'"]').waitFor();
      await visit('#/help/'+id,'body');
      await page.locator('.verse-card').first().waitFor();
    }
    await visit('#/study/21/7','[data-verse-study="21"]');
    assert.equal(await page.locator('.study-context a[href="#/people/david"]').count(),1);
    await page.locator('[data-psalm-switch]').selectOption('20');
    await page.locator('[data-verse-study="20"][data-current-verse="9"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('21');
    await page.locator('[data-verse-study="21"][data-current-verse="7"]').waitFor();
    for(const [id,verse] of [['gratitude',1],['strength',7]]){
      await visit('#/study/21/'+verse+'','body');
      await page.locator('[data-verse-study="21"][data-current-verse="'+verse+'"]').waitFor();
      await visit('#/help/'+id,'body');
      await page.locator('.verse-card').first().waitFor();
    }
    await visit('#/study/20/7','[data-verse-study="20"]');
    for(const person of ['david','jacob'])assert.equal(await page.locator('.study-context a[href="#/people/'+person+'"]').count(),1);
    await page.locator('[data-psalm-switch]').selectOption('19');
    await page.locator('[data-verse-study="19"][data-current-verse="14"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('20');
    await page.locator('[data-verse-study="20"][data-current-verse="7"]').waitFor();
    for(const [id,verse] of [['fear',1],['strength',2],['direction',7],['gratitude',5]]){
      await visit('#/study/20/'+verse+'','body');
      await page.locator('[data-verse-study="20"][data-current-verse="'+verse+'"]').waitFor();
      await visit('#/help/'+id,'body');
      await page.locator('.verse-card').first().waitFor();
    }
    await visit('#/study/19/8','[data-verse-study="19"]');
    assert.equal(await page.locator('.study-context a[href="#/people/david"]').count(),1);
    await page.locator('[data-psalm-switch]').selectOption('18');
    await page.locator('[data-verse-study="18"][data-current-verse="50"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('19');
    await page.locator('[data-verse-study="19"][data-current-verse="8"]').waitFor();
    for(const [id,verse] of [['direction',8],['gratitude',10],['forgiveness',12]]){
      await visit('#/study/19/'+verse+'','body');
      await page.locator('[data-verse-study="19"][data-current-verse="'+verse+'"]').waitFor();
      await visit('#/help/'+id,'body');
      await page.locator('.verse-card').first().waitFor();
    }
    await visit('#/study/18/35','[data-verse-study="18"]');
    assert.equal(await page.locator('.study-context a[href="#/people/david"]').count(),1);
    assert.equal(await page.locator('.study-context a[href="#/people/saul"]').count(),0,'Do not link a missing profile');
    await page.locator('[data-psalm-switch]').selectOption('17');
    await page.locator('[data-verse-study="17"][data-current-verse="15"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('18');
    await page.locator('[data-verse-study="18"][data-current-verse="35"]').waitFor();
    await visit('#/study/18/35','body');
    await page.locator('[data-verse-study="18"][data-current-verse="35"]').waitFor();
    await visit('#/help/strength','body');
    await page.locator('.verse-card').first().waitFor();
    await visit('#/study/18/35','[data-verse-study="18"]');
    await page.locator('[data-psalm-switch]').selectOption('16');
    await page.locator('[data-verse-study="16"][data-current-verse="11"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('17');
    await page.locator('[data-verse-study="17"][data-current-verse="15"]').waitFor();
    await visit('#/study/17/8','body');
    await page.locator('[data-verse-study="17"][data-current-verse="8"]').waitFor();
    await visit('#/help/fear','body');
    await page.locator('.verse-card').first().waitFor();
    await visit('#/study/16/11','[data-verse-study="16"]');
    await page.locator('[data-psalm-switch]').selectOption('15');
    await page.locator('[data-verse-study="15"][data-current-verse="5"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('16');
    await page.locator('[data-verse-study="16"][data-current-verse="11"]').waitFor();
    await visit('#/study/16/7','body');
    await page.locator('[data-verse-study="16"][data-current-verse="7"]').waitFor();
    await visit('#/help/direction','body');
    await page.locator('.verse-card').first().waitFor();
    await visit('#/study/15/5','[data-verse-study="15"]');
    await page.locator('[data-psalm-switch]').selectOption('13');
    await page.locator('[data-verse-study="13"][data-current-verse="6"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('14');
    await page.locator('[data-verse-study="14"][data-current-verse="7"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('15');
    await page.locator('[data-verse-study="15"][data-current-verse="5"]').waitFor();
    await visit('#/study/15/2','body');
    await page.locator('[data-verse-study="15"][data-current-verse="2"]').waitFor();
    assert.equal(await page.locator('[data-related-needs]').count(),0,'study pages have no needs card');
    await page.locator('[data-psalm-switch]').selectOption('11');
    await page.locator('[data-verse-study="11"][data-current-verse="7"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('12');
    await page.locator('[data-verse-study="12"][data-current-verse="8"]').waitFor();
    await visit('#/study/12/5','body');
    await page.locator('[data-verse-study="12"][data-current-verse="5"]').waitFor();
    assert.equal(await page.locator('[data-related-needs]').count(),0,'study pages have no needs card');
    await visit('#/study/10/1','body');
    await page.locator('[data-verse-study="10"]').waitFor();
    assert.equal(await page.locator('[data-related-needs]').count(),0,'study pages have no needs card');
    await page.locator('[data-psalm-switch]').selectOption('9');await page.locator('[data-verse-study="9"]').waitFor();
    assert.ok(page.url().endsWith('#/study/9/20'),'Psalm 9 resumes independently');
    await page.locator('[data-psalm-switch]').selectOption('8');await page.locator('[data-verse-study="8"]').waitFor();
    assert.ok(page.url().endsWith('#/study/8/9'),'Psalm 8 resumes independently');
    await page.locator('[data-psalm-switch]').selectOption('7');await page.locator('[data-verse-study="7"]').waitFor();
    assert.ok(page.url().endsWith('#/study/7/17'),'Psalm 7 resumes independently');
    await page.locator('[data-psalm-switch]').selectOption('6');await page.locator('[data-verse-study="6"]').waitFor();
    assert.ok(page.url().endsWith('#/study/6/10'),'Psalm 6 resumes independently');
    await page.locator('[data-psalm-switch]').selectOption('5');await page.locator('[data-verse-study="5"]').waitFor();
    assert.ok(page.url().endsWith('#/study/5/12'),'Psalm 5 resumes independently');
    await page.locator('[data-psalm-switch]').selectOption('4');await page.locator('[data-verse-study="4"]').waitFor();
    assert.ok(page.url().endsWith('#/study/4/8'),'Psalm 4 resumes independently');
    await visit('#/stories','.gen-episode-tile');
    await page.locator('a[href="#/exodus"]').first().click();
    await page.locator('[data-story-book="exodus"] .gen-episode-tile').first().waitFor();
    assert.equal(await page.locator('.gen-episode-tile').count(),8,'All eight Exodus episodes');
    const exodusEpisodes=JSON.parse(fs.readFileSync(path.join(root,'data/exodus-episodes.json'),'utf8'));
    const exodusScenes=JSON.parse(fs.readFileSync(path.join(root,'data/exodus-scenes.json'),'utf8'));
    for(const episode of exodusEpisodes){
      for(const [i,scene] of exodusScenes[episode.id].entries()){
        await visit('#/exodus/'+episode.id+'/'+(i+1),'#exo-narrative p');
        assert.deepEqual((await page.locator('#exo-narrative p').allTextContents()).map(t=>t.replace(/ \u2197/g,'')),episode.paragraphs.slice(scene.start,scene.end+1));
        assert.equal(await page.locator('.gen-progress [aria-current]').count(),1);
        assert.ok(await page.locator('.gen-scripture a[href^="#/read/2/"]').count()>0);
        assert.equal(await page.locator('.gen-scene-art .landscape').count(),1);
      }
      await visit('#/exodus/'+episode.id+'/full','.gen-full');
      assert.deepEqual(await page.locator('.gen-full .gen-narrative p').allTextContents(),episode.paragraphs);
    }
    await visit('#/exodus/1/1','#exo-narrative');
    await page.locator('.gen-next a[href="#/exodus/1/2"]').click();await page.locator('h1').filter({hasText:'The midwives'}).waitFor();
    await page.locator('#exo-note').fill('Exodus reflection kept apart from Genesis.');
    await page.locator('[data-exod="save"]').click();await page.reload();await page.locator('#exo-note').waitFor();
    assert.equal(await page.locator('#exo-note').inputValue(),'Exodus reflection kept apart from Genesis.');
    await visit('#/stories/1/3','#gen-narrative');
    await visit('#/exodus','.gen-episode-tile');
    assert.equal(await page.locator('.gen-episode-tile').first().getAttribute('href'),'#/exodus/1/2');
    await page.locator('.gen-episode-tile').first().click();await page.locator('#exo-narrative').waitFor();
    await page.locator('.gen-scripture a[href="#/read/2/1/17"]').click();await page.locator('#verse-17.selected').waitFor();
    for(const [i,episode] of exodusEpisodes.entries()){
      const id=String(episode.id),last=exodusScenes[id].length;
      const next=i+1<exodusEpisodes.length?'#/exodus/'+exodusEpisodes[i+1].id+'/1':'#/journey';
      await visit('#/exodus/'+id+'/'+last,'.gen-next');
      assert.equal(await page.locator('.gen-next a[href="'+next+'"]').count(),1);
    }
    await visit('#/exodus/3/'+exodusScenes['3'].length,'.gen-next');
    assert.equal(await page.locator('a[href="#/read/2/16"]').count(),1,'Existing Episode 3 link to Exodus 16 remains available');
    for(const person of ['moses','aaron','miriam','zipporah','midwives']){
      await visit('#/people/'+person,'.story-step');assert.equal(await page.locator('.side-note a[href^="#/exodus/"]').count(),1);
    }
    assert.deepEqual(errors,[],loc.label+' unhandled browser exceptions');
    await context.close();
    console.log('PASS '+loc.label+' on 390px viewport — home, Genesis, Psalm 23, Psalm 46, character/help links, reflections, Bible journey, full reader, word search, episode Listen, continue reading, verse of the day, share, text size.');
  }
}finally{
  if(browser)await browser.close();
  for(const server of servers)server.kill();
}
