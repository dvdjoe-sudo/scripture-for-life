/* Check the actual running website and the Capacitor web bundle at phone width. */
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const locations=[{folder:root,port:8870,label:'Website source'},{folder:path.join(root,'www'),port:8871,label:'Android web bundle'}];
const servers=[];
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
    assert.equal(await page.locator('.gen-home-card').count(),3,'Three Genesis cards on homepage');
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
    await visit('#/read/1/1','.reader-verse');
    assert.ok(await page.locator('.reader-verse').count()>=20,'Genesis chapter 1 verses rendered');
    assert.deepEqual(errors,[],loc.label+' unhandled browser exceptions');
    await context.close();
    console.log('PASS '+loc.label+' on 390px viewport — home, Genesis, story navigation, Psalm 23, Bible journey, full reader.');
  }
}finally{
  if(browser)await browser.close();
  for(const server of servers)server.kill();
}
