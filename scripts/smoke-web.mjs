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
    assert.equal(await page.locator('.featured .btn.light[href="#/study/23/1"]').count(),1,'Original Psalm study is the homepage primary journey');
    assert.equal(await page.locator('.featured a[href^="#/walk/23/"]').count(),1,'Illustrated Psalm walk remains optional');
    assert.equal(await page.locator('.gen-home-card').count(),3,'Three Genesis cards on homepage');
    assert.equal(await page.locator('.ps46-card a[href="#/study/46/1"]').count(),1,'Psalm 46 is discoverable without replacing Psalm 23');
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
    assert.equal(await page.locator('.trail-compact a').count(),6,'Six freely accessible trail stops');
    assert.equal(await page.locator('.trail-compact .is-complete').count(),0,'Visiting a moment does not finish it');
    await page.locator('.trail-map-details>summary').click();
    const mapOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert.ok(mapOverflow<=2,'Expanded trail fits phone width');
    assert.equal(await page.locator('.trail-map-stops a').count(),6);
    await page.locator('.trail-map-stops a[href="#/study/23/4"]').click();
    await page.locator('.study-verse [data-speakref="Psalm 23:4"]').waitFor();
    assert.equal(await page.locator('.trail-compact .is-current').getAttribute('href'),'#/study/23/4');
    assert.equal(await page.locator('.trail-compact .is-complete').count(),0);
    await page.locator('[data-trail-action="finish"]').click();
    await page.locator('.study-verse [data-speakref="Psalm 23:5"]').waitFor();
    assert.equal(await page.locator('.trail-compact a[href="#/study/23/4"]').getAttribute('class').then(c=>c.includes('is-complete')),true);
    await page.reload();await page.locator('.study-trail').waitFor();
    assert.equal(await page.locator('.trail-compact .is-complete').count(),1,'Completion survives a reload');
    await visit('#/study/23/4','.study-trail');
    await page.locator('[data-trail-action="undo"]').click();
    assert.equal(await page.locator('.trail-compact .is-complete').count(),0,'Completion can be undone');
    await page.locator('[data-psalm-switch]').selectOption('46');
    await page.locator('.ps46-page').waitFor();
    await page.locator('.psalm-navigation a[href="#/psalms"]').click();
    await page.locator('.psalms-study-card').first().waitFor();
    assert.equal(await page.locator('.psalms-study-card').count(),2);
    assert.equal(await page.locator('.psalms-card-links a[href="#/study/23/4"]').count(),1,'Collection keeps each study’s place');
    await page.locator('.psalms-card-links a[href="#/study/23/4"]').click();
    await page.locator('.study-trail').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('46');await page.locator('.ps46-page').waitFor();
    await page.locator('[data-psalm-switch]').selectOption('23');await page.locator('.study-trail').waitFor();
    assert.equal(page.url().endsWith('#/study/23/4'),true,'Switcher resumes the other psalm');
    await visit('#/study/23/1','.study-landscape .landscape');
    assert.equal(await page.locator('a[href="#/walk/23/1"]').count()>0,true,'Original Psalm study connects to the new walk');
    await visit('#/walk/23/1','.pw-scripture .pw-verse');
    assert.match(await page.locator('.pw-scripture').innerText(),/Psalm 23:1/);
    assert.equal(await page.locator('.pw-progress a').count(),6,'Six Psalm 23 scenes');
    assert.equal(await page.locator('.pw-art-mark').count(),1,'Scene-specific illustration is rendered');
    await page.locator('.pw-section').last().locator('summary').click();
    await page.locator('[data-note-ref="Psalm 23:1"]').fill('A quiet reflection');
    await page.locator('.pw-section [data-action="save-note"]').click();
    await visit('#/walk/23/4','.pw-scripture .pw-verse');
    assert.match(await page.locator('.pw-header h1').innerText(),/Through the Valley/);
    await visit('#/walk/23/1','.pw-scripture .pw-verse');
    await page.locator('.pw-section').last().locator('summary').click();
    assert.equal(await page.locator('[data-note-ref="Psalm 23:1"]').inputValue(),'A quiet reflection','Reflection stays saved on this device');
    await visit('#/walk/23/6','.pw-scripture .pw-verse');
    assert.equal(await page.locator('.pw-finish').count(),1,'Final scene has a completion message');
    await visit('#/read/19/23','.reader-verse');
    assert.equal(await page.locator('a[href="#/study/23/1"]').count()>0,true,'Psalm 23 Bible reader links to original study');
    await visit('#/help/fear','.side-note');
    assert.equal(await page.locator('.side-note a[href="#/study/46/1"]').count(),1);
    assert.equal(await page.locator('.side-note a[href="#/people/jacob"]').count(),1);
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
    assert.deepEqual(errors,[],loc.label+' unhandled browser exceptions');
    await context.close();
    console.log('PASS '+loc.label+' on 390px viewport — home, Genesis, Psalm 23, Psalm 46, character/help links, reflections, Bible journey, full reader.');
  }
}finally{
  if(browser)await browser.close();
  for(const server of servers)server.kill();
}
