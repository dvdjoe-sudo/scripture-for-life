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
    await visit('#/study/23/1','.study-landscape .landscape');
    assert.equal(await page.locator('.study-explainer [role="tab"]').count(),4,'Original four-tab Psalm study preserved');
    assert.equal(await page.locator('.study-trail,.trail-completion').count(),0,'No guided trail or completion controls');
    assert.equal(await page.locator('.psalm-verse-nav a').count(),6);
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
    await page.locator('.psalm-navigation a[href="#/psalms"]').click();
    await page.locator('.psalms-all-grid .psalms-study-card').first().waitFor();
    assert.equal(await page.locator('.psalms-all-grid .psalms-study-card').count(),150,'All 150 Psalm chapter cards remain available');
    assert.equal(await page.locator('.psalms-detailed a[href^="#/study/23/"]').count(),1,'Original Psalm 23 detailed study remains available');
    assert.equal(await page.locator('.psalms-detailed a[href^="#/study/46/"]').count(),1,'Psalm 46 detailed study remains available');
    assert.equal(await page.locator('.psalms-detailed a[href^="#/study/25/"]').count(),1,'Psalm 25 detailed study is discoverable');
    assert.equal(await page.locator('.psalms-detailed a[href^="#/study/26/"]').count(),1,'Psalm 26 detailed study is discoverable');
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
    await visit('#/help/fear','.side-note');
    assert.equal(await page.locator('.side-note a[href="#/study/46/1"]').count(),1);
    assert.equal(await page.locator('.side-note a[href="#/people/jacob"]').count(),1);
    // Everyday needs connect to topic-specific Psalms, stories, people, and shared notes.
    for(const id of ['fear','strength','health','grief','direction','alone','forgiveness','gratitude']){
      await visit('#/help/'+id,'[data-topic-connections="'+id+'"]');
      assert.ok(await page.locator('[data-topic-connections] a[href^="#/study/"]').count()>0);
      assert.ok(await page.locator('[data-topic-connections] a[href^="#/stories/"], [data-topic-connections] a[href^="#/exodus/"]').count()>0);
      assert.ok(await page.locator('[data-topic-connections] a[href^="#/people/"]').count()>0);
      assert.ok(await page.locator('.verse-card .verse-text').evaluateAll(els=>els.every(el=>el.textContent.trim().length>0)));
    }
    await visit('#/help/fear','[data-topic-connections="fear"]');
    await page.locator('[data-topic-connections] a[href="#/study/9/9"]').click();
    await page.locator('[data-verse-study="9"][data-current-verse="9"]').waitFor();
    assert.equal(await page.locator('[data-related-needs] a[href="#/help/fear"]').count(),1);
    await page.getByRole('tab',{name:'Reflect',exact:true}).click();
    await page.locator('[data-note-ref="Psalm 9:9"]').fill('A refuge for what I am facing.');
    await page.locator('#verse-study-panel [data-action="save-note"]').click();
    await visit('#/saved','.saved-list');
    assert.ok((await page.locator('.saved-list').innerText()).includes('A refuge for what I am facing.'));
    assert.equal(await page.locator('.saved-actions a[href="#/study/9/9"]').count(),1);
    await visit('#/help/fear','[data-topic-connections="fear"]');
    await page.locator('.verse-card [data-action="open-verse"][data-ref="Psalm 9:9"]').click();
    await page.locator('#verse-dialog').waitFor({state:'visible'});
    assert.equal(await page.locator('#verse-dialog textarea').inputValue(),'A refuge for what I am facing.');
    await page.locator('.dialog-close').click();
    await page.locator('[data-topic-connections] a[href="#/exodus/3/6"]').click();
    await page.locator('[data-story-book="exodus"] .gen-narrative').waitFor();
    await page.locator('[data-related-needs] a[href="#/help/fear"]').click();
    await page.locator('[data-topic-connections="fear"]').waitFor();
    await page.locator('[data-topic-connections] a[href="#/people/jacob"]').click();
    await page.locator('.person-header').waitFor();
    assert.equal(await page.locator('[data-related-needs] a[href="#/help/fear"]').count(),1);
    await visit('#/stories/8/7','.gen-narrative');
    assert.equal(await page.locator('[data-related-needs] a[href="#/help/fear"]').count(),1);
    await visit('#/help/strength','.verse-card');
    assert.equal(await page.locator('.verse-card a[href="#/study/46/1"]').count(),1,'Refuge verse opens the new study');
    assert.equal(await page.locator('.side-note a[href="#/people/sons-of-korah"]').count(),1);
    await visit('#/read/19/46','.reader-verse');
    assert.equal(await page.locator('a[href="#/study/46/1"]').count(),1);
    await page.locator('#verse-11 .icon-btn').click();
    await page.locator('#verse-dialog').waitFor({state:'visible'});
    await page.locator('#verse-dialog a[href="#/study/46/6"]').click();
    await page.locator('.ps46-page').waitFor();
    for(let step=1;step<=6;step++){
      await visit('#/study/46/'+step,'.ps46-page .verse-text');
      assert.equal(await page.locator('.study-explainer [role="tab"]').count(),4);
      assert.equal(await page.locator('.journey-step.active').count(),1);
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
    for(const person of ['sons-of-korah','jacob']){
      await visit('#/people/'+person,'.story-step');
      assert.equal(await page.locator('.side-note a[href="#/study/46/1"]').count(),1,'Character profile returns to the Psalm');
    }
    assert.equal(await page.locator('.side-note a[href="#/stories/8/1"]').count(),1,'Jacob profile connects to the Genesis story');
    await page.locator('.side-note a[href="#/stories/8/1"]').click();
    await page.locator('#gen-narrative p').first().waitFor();
    await visit('#/read/1/1','.reader-verse');
    assert.ok(await page.locator('.reader-verse').count()>=20,'Genesis chapter 1 verses rendered');
    await visit('#/psalms','.psalms-all-grid .psalms-study-card');
    await page.locator('[data-psalms-search]').fill('119');
    assert.equal(await page.locator('.psalms-all-grid .psalms-study-card:visible').count(),1);
    assert.equal(await page.locator('.psalms-all-grid .psalms-study-card:visible a.btn').getAttribute('href'),'#/study/119/1');
    await page.locator('.psalms-all-grid .psalms-study-card:visible a:has-text("Whole chapter")').click();
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
    await visit('#/psalms','.psalms-all-grid .psalms-study-card');
    await page.locator('[data-psalms-search]').fill('1');
    await page.locator('.psalms-all-grid .psalms-study-card:visible a.btn').click();
    await page.locator('[data-verse-study="1"]').waitFor();
    const psalm1=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'data/bible.json'),'utf8')).books[18].chapters[0]);
    const meanings=[],images=[];
    for(let n=1;n<=6;n++){
      await visit('#/study/1/'+n,'[data-verse-study="1"]');
      await page.waitForFunction(()=>{const i=document.querySelector('[data-verse-study-art]');return i?.complete&&i.naturalWidth>0;});
      assert.equal(await page.locator('.study-verse [data-speakref]').innerText(),psalm1[n]);
      assert.equal(await page.locator('.psalm-verse-nav a').count(),6);
      assert.equal(await page.locator('.psalm-verse-nav [aria-current]').getAttribute('href'),'#/study/1/'+n);
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
        assert.equal(await page.locator('.psalm-verse-nav a').count(),Object.keys(verses).length);
        assert.equal(await page.locator('.psalm-verse-nav [aria-current]').getAttribute('href'),'#/study/'+number+'/'+n);
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
      await visit('#/help/'+id,'[data-topic-connections="'+id+'"]');
      await page.locator('[data-topic-connections] a[href="#/study/18/'+verse+'"]').click();
      await page.locator('[data-verse-study="18"][data-current-verse="'+verse+'"]').waitFor();
      await page.locator('[data-related-needs] a[href="#/help/'+id+'"]').click();
      await page.locator('[data-topic-connections="'+id+'"]').waitFor();
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
    await page.locator('.psalm-verse-study.text-only[data-verse-study="37"][data-current-verse="1"]').waitFor();
    assert.equal(await page.locator('.psalm-verse-study img').count(),0,'text-only study has no image');
    for(const [n,v] of [[91,1],[119,105],[150,6]]){await visit(`#/study/${n}/${v}`,`[data-verse-study="${n}"][data-current-verse="${v}"]`);await page.locator('[data-verse-study-tab="context"]').click();await page.locator('#verse-study-panel h3').waitFor();}
    await visit('#/study/45/17','[data-verse-study="45"]');await page.locator('.study-bottom a[href="#/study/46/1"]').click();await page.waitForFunction(()=>location.hash==='#/study/46/1'&&!document.querySelector('[data-verse-study="45"]'));
    for(const [id,verse] of [['fear',7],['gratitude',5],['gratitude',9]]){
      await visit('#/help/'+id,'[data-topic-connections="'+id+'"]');
      await page.locator('[data-topic-connections] a[href="#/study/36/'+verse+'"]').click();
      await page.locator('[data-verse-study="36"][data-current-verse="'+verse+'"]').waitFor();
      await page.locator('[data-related-needs] a[href="#/help/'+id+'"]').click();
      await page.locator('[data-topic-connections="'+id+'"]').waitFor();
    }
    for(const [id,verse] of [['health',2],['grief',5],['gratitude',11]]){
      await visit('#/help/'+id,'[data-topic-connections="'+id+'"]');
      await page.locator('[data-topic-connections] a[href="#/study/30/'+verse+'"]').click();
      await page.locator('[data-verse-study="30"][data-current-verse="'+verse+'"]').waitFor();
      await page.locator('[data-related-needs] a[href="#/help/'+id+'"]').click();
      await page.locator('[data-topic-connections="'+id+'"]').waitFor();
    }
    for(const [id,verse] of [['gratitude',2],['fear',10],['strength',11]]){
      await visit('#/help/'+id,'[data-topic-connections="'+id+'"]');
      await page.locator('[data-topic-connections] a[href="#/study/29/'+verse+'"]').click();
      await page.locator('[data-verse-study="29"][data-current-verse="'+verse+'"]').waitFor();
      await page.locator('[data-related-needs] a[href="#/help/'+id+'"]').click();
      await page.locator('[data-topic-connections="'+id+'"]').waitFor();
    }
    for(const [id,verse] of [['alone',1],['gratitude',6],['strength',7],['direction',9]]){
      await visit('#/help/'+id,'[data-topic-connections="'+id+'"]');
      await page.locator('[data-topic-connections] a[href="#/study/28/'+verse+'"]').click();
      await page.locator('[data-verse-study="28"][data-current-verse="'+verse+'"]').waitFor();
      await page.locator('[data-related-needs] a[href="#/help/'+id+'"]').click();
      await page.locator('[data-topic-connections="'+id+'"]').waitFor();
    }
    for(const [id,verse] of [['fear',1],['alone',10],['direction',11],['strength',14]]){
      await visit('#/help/'+id,'[data-topic-connections="'+id+'"]');
      await page.locator('[data-topic-connections] a[href="#/study/27/'+verse+'"]').click();
      await page.locator('[data-verse-study="27"][data-current-verse="'+verse+'"]').waitFor();
      await page.locator('[data-related-needs] a[href="#/help/'+id+'"]').click();
      await page.locator('[data-topic-connections="'+id+'"]').waitFor();
    }
    for(const [id,verse] of [['direction',3],['gratitude',7],['forgiveness',11],['strength',12]]){
      await visit('#/help/'+id,'[data-topic-connections="'+id+'"]');
      await page.locator('[data-topic-connections] a[href="#/study/26/'+verse+'"]').click();
      await page.locator('[data-verse-study="26"][data-current-verse="'+verse+'"]').waitFor();
      await page.locator('[data-related-needs] a[href="#/help/'+id+'"]').click();
      await page.locator('[data-topic-connections="'+id+'"]').waitFor();
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
      await visit('#/help/'+id,'[data-topic-connections="'+id+'"]');
      await page.locator('[data-topic-connections] a[href="#/study/25/'+verse+'"]').click();
      await page.locator('[data-verse-study="25"][data-current-verse="'+verse+'"]').waitFor();
      await page.locator('[data-related-needs] a[href="#/help/'+id+'"]').click();
      await page.locator('[data-topic-connections="'+id+'"]').waitFor();
    }
    await visit('#/study/24/6','[data-verse-study="24"]');
    for(const person of ['david','jacob'])assert.equal(await page.locator('.study-context a[href="#/people/'+person+'"]').count(),1);
    await page.locator('[data-psalm-switch]').selectOption('22');
    await page.locator('[data-verse-study="22"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('24');
    await page.locator('[data-verse-study="24"][data-current-verse="6"]').waitFor();
    for(const [id,verse] of [['gratitude',1],['direction',3],['direction',6],['strength',8]]){
      await visit('#/help/'+id,'[data-topic-connections="'+id+'"]');
      await page.locator('[data-topic-connections] a[href="#/study/24/'+verse+'"]').click();
      await page.locator('[data-verse-study="24"][data-current-verse="'+verse+'"]').waitFor();
      await page.locator('[data-related-needs] a[href="#/help/'+id+'"]').click();
      await page.locator('[data-topic-connections="'+id+'"]').waitFor();
    }
    await visit('#/study/22/24','[data-verse-study="22"]');
    for(const person of ['david','jesus','jacob'])assert.equal(await page.locator('.study-context a[href="#/people/'+person+'"]').count(),1);
    await page.locator('[data-psalm-switch]').selectOption('21');
    await page.locator('[data-verse-study="21"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('22');
    await page.locator('[data-verse-study="22"][data-current-verse="24"]').waitFor();
    for(const [id,verse] of [['alone',11],['grief',14],['gratitude',25]]){
      await visit('#/help/'+id,'[data-topic-connections="'+id+'"]');
      await page.locator('[data-topic-connections] a[href="#/study/22/'+verse+'"]').click();
      await page.locator('[data-verse-study="22"][data-current-verse="'+verse+'"]').waitFor();
      await page.locator('[data-related-needs] a[href="#/help/'+id+'"]').click();
      await page.locator('[data-topic-connections="'+id+'"]').waitFor();
    }
    await visit('#/study/21/7','[data-verse-study="21"]');
    assert.equal(await page.locator('.study-context a[href="#/people/david"]').count(),1);
    await page.locator('[data-psalm-switch]').selectOption('20');
    await page.locator('[data-verse-study="20"][data-current-verse="9"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('21');
    await page.locator('[data-verse-study="21"][data-current-verse="7"]').waitFor();
    for(const [id,verse] of [['gratitude',1],['strength',7]]){
      await visit('#/help/'+id,'[data-topic-connections="'+id+'"]');
      await page.locator('[data-topic-connections] a[href="#/study/21/'+verse+'"]').click();
      await page.locator('[data-verse-study="21"][data-current-verse="'+verse+'"]').waitFor();
      await page.locator('[data-related-needs] a[href="#/help/'+id+'"]').click();
      await page.locator('[data-topic-connections="'+id+'"]').waitFor();
    }
    await visit('#/study/20/7','[data-verse-study="20"]');
    for(const person of ['david','jacob'])assert.equal(await page.locator('.study-context a[href="#/people/'+person+'"]').count(),1);
    await page.locator('[data-psalm-switch]').selectOption('19');
    await page.locator('[data-verse-study="19"][data-current-verse="14"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('20');
    await page.locator('[data-verse-study="20"][data-current-verse="7"]').waitFor();
    for(const [id,verse] of [['fear',1],['strength',2],['direction',7],['gratitude',5]]){
      await visit('#/help/'+id,'[data-topic-connections="'+id+'"]');
      await page.locator('[data-topic-connections] a[href="#/study/20/'+verse+'"]').click();
      await page.locator('[data-verse-study="20"][data-current-verse="'+verse+'"]').waitFor();
      await page.locator('[data-related-needs] a[href="#/help/'+id+'"]').click();
      await page.locator('[data-topic-connections="'+id+'"]').waitFor();
    }
    await visit('#/study/19/8','[data-verse-study="19"]');
    assert.equal(await page.locator('.study-context a[href="#/people/david"]').count(),1);
    await page.locator('[data-psalm-switch]').selectOption('18');
    await page.locator('[data-verse-study="18"][data-current-verse="50"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('19');
    await page.locator('[data-verse-study="19"][data-current-verse="8"]').waitFor();
    for(const [id,verse] of [['direction',8],['gratitude',10],['forgiveness',12]]){
      await visit('#/help/'+id,'[data-topic-connections="'+id+'"]');
      await page.locator('[data-topic-connections] a[href="#/study/19/'+verse+'"]').click();
      await page.locator('[data-verse-study="19"][data-current-verse="'+verse+'"]').waitFor();
      await page.locator('[data-related-needs] a[href="#/help/'+id+'"]').click();
      await page.locator('[data-topic-connections="'+id+'"]').waitFor();
    }
    await visit('#/study/18/35','[data-verse-study="18"]');
    assert.equal(await page.locator('.study-context a[href="#/people/david"]').count(),1);
    assert.equal(await page.locator('.study-context a[href="#/people/saul"]').count(),0,'Do not link a missing profile');
    await page.locator('[data-psalm-switch]').selectOption('17');
    await page.locator('[data-verse-study="17"][data-current-verse="15"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('18');
    await page.locator('[data-verse-study="18"][data-current-verse="35"]').waitFor();
    await visit('#/help/strength','[data-topic-connections="strength"]');
    await page.locator('[data-topic-connections] a[href="#/study/18/35"]').click();
    await page.locator('[data-verse-study="18"][data-current-verse="35"]').waitFor();
    await page.locator('[data-related-needs] a[href="#/help/strength"]').click();
    await page.locator('[data-topic-connections="strength"]').waitFor();
    await visit('#/study/18/35','[data-verse-study="18"]');
    await page.locator('[data-psalm-switch]').selectOption('16');
    await page.locator('[data-verse-study="16"][data-current-verse="11"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('17');
    await page.locator('[data-verse-study="17"][data-current-verse="15"]').waitFor();
    await visit('#/help/fear','[data-topic-connections="fear"]');
    await page.locator('[data-topic-connections] a[href="#/study/17/8"]').click();
    await page.locator('[data-verse-study="17"][data-current-verse="8"]').waitFor();
    await page.locator('[data-related-needs] a[href="#/help/fear"]').click();
    await page.locator('[data-topic-connections="fear"]').waitFor();
    await visit('#/study/16/11','[data-verse-study="16"]');
    await page.locator('[data-psalm-switch]').selectOption('15');
    await page.locator('[data-verse-study="15"][data-current-verse="5"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('16');
    await page.locator('[data-verse-study="16"][data-current-verse="11"]').waitFor();
    await visit('#/help/direction','[data-topic-connections="direction"]');
    await page.locator('[data-topic-connections] a[href="#/study/16/7"]').click();
    await page.locator('[data-verse-study="16"][data-current-verse="7"]').waitFor();
    await page.locator('[data-related-needs] a[href="#/help/direction"]').click();
    await page.locator('[data-topic-connections="direction"]').waitFor();
    await visit('#/study/15/5','[data-verse-study="15"]');
    await page.locator('[data-psalm-switch]').selectOption('13');
    await page.locator('[data-verse-study="13"][data-current-verse="6"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('14');
    await page.locator('[data-verse-study="14"][data-current-verse="7"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('15');
    await page.locator('[data-verse-study="15"][data-current-verse="5"]').waitFor();
    await visit('#/help/direction','[data-topic-connections]');
    await page.locator('[data-topic-connections] a[href="#/study/15/2"]').click();
    await page.locator('[data-verse-study="15"][data-current-verse="2"]').waitFor();
    assert.equal(await page.locator('[data-related-needs] a[href="#/help/direction"]').count(),1);
    await page.locator('[data-psalm-switch]').selectOption('11');
    await page.locator('[data-verse-study="11"][data-current-verse="7"]').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('12');
    await page.locator('[data-verse-study="12"][data-current-verse="8"]').waitFor();
    await visit('#/help/strength','[data-topic-connections]');
    await page.locator('[data-topic-connections] a[href="#/study/12/5"]').click();
    await page.locator('[data-verse-study="12"][data-current-verse="5"]').waitFor();
    assert.equal(await page.locator('[data-related-needs] a[href="#/help/strength"]').count(),1);
    await visit('#/help/alone','[data-topic-connections]');
    await page.locator('[data-topic-connections] a[href="#/study/10/1"]').click();
    await page.locator('[data-verse-study="10"]').waitFor();
    assert.equal(await page.locator('[data-related-needs] a[href="#/help/alone"]').count(),1);
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
        assert.deepEqual(await page.locator('#exo-narrative p').allTextContents(),episode.paragraphs.slice(scene.start,scene.end+1));
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
    console.log('PASS '+loc.label+' on 390px viewport — home, Genesis, Psalm 23, Psalm 46, character/help links, reflections, Bible journey, full reader.');
  }
}finally{
  if(browser)await browser.close();
  for(const server of servers)server.kill();
}
