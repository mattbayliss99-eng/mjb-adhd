// Behaviour checks for navigation; uses an installed Playwright + Chromium.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(__dirname,'../site');
const report=[];
const server=http.createServer((req,res)=>{
  let file=path.join(root,decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
  }catch(e){res.writeHead(404).end();}
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  const b=await chromium.launch({executablePath:process.env.MJB_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-zygote']});
  const errors=[];
  const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errors.push(e.message));
  async function check(name,fn){await fn();report.push({name,passed:true});console.log('PASS',name);}
  try{
    await check('Deep regular-site page: location, current page and ancestor chain',async()=>{
      await p.goto(base+'/science/genetics/gen-03/');await p.locator('#navtoggle').waitFor();
      assert.match(await p.locator('.mjb-location-path').innerText(),/Brain & genetics.*Genetics library.*dopamine supply chain/is);
      await p.locator('#navtoggle').click();assert.equal(await p.locator('dialog#mjb-navigation-dialog').evaluate(d=>d.open),true);
      assert.equal(await p.locator('.mjb-nav-panel [aria-current="page"]').count(),1);
      assert.equal(await p.locator('.mjb-nav-panel details[open]').count(),2);
    });
    await check('Selecting a category reveals it and collapses sibling categories',async()=>{
      await p.locator('[data-nav-group="care"]>summary').click();
      assert.equal(await p.locator('[data-nav-group="care"]').evaluate(d=>d.open),true);
      assert.equal(await p.locator('[data-nav-group="brain"]').evaluate(d=>d.open),false);
      await p.locator('.mjb-nav-panel a').filter({hasText:'No current prescriber'}).click();
      await p.waitForURL('**/guide/index.html#/n/no-prescriber');
      assert.match(await p.locator('.mjb-location-path').innerText(),/Getting care.*No current prescriber/s);
    });
    await check('Guide hash changes and static equivalents retain location',async()=>{
      await p.goto(base+'/guide/index.html#/n/dystonia');assert.match(await p.locator('.mjb-location-path').innerText(),/Neurological symptoms.*Movement, pain & sensation.*Dystonia/s);
      await p.evaluate(()=>location.hash='#/n/formulations-response');await p.locator('.mjb-location-path').filter({hasText:'Formulations & response'}).waitFor();
      await p.goto(base+'/guide/static/care/no-prescriber/');assert.match(await p.locator('.mjb-location-path').innerText(),/Getting care.*No current prescriber/s);
    });
    await check('Escape restores focus and preserves reading position',async()=>{
      await p.goto(base+'/science/genetics/gen-03/');await p.evaluate(()=>window.scrollTo(0,450));
      const y=await p.evaluate(()=>scrollY);await p.locator('#navtoggle').click();await p.keyboard.press('Escape');
      assert.equal(await p.evaluate(()=>document.activeElement.id),'navtoggle');assert.equal(await p.evaluate(()=>scrollY),y);
      assert.equal(await p.locator('#navtoggle').getAttribute('aria-expanded'),'false');
    });
    await check('Header search finds indexed mechanism text and shows section path',async()=>{
      await p.locator('#searchtoggle').click();await p.locator('#q').fill('VMAT2');
      assert.ok(await p.locator('#sres a').count());assert.match(await p.locator('#sres').innerText(),/Brain & genetics/);
      await p.keyboard.press('Escape');
    });
    await check('Page finder shares expanded index, keyboard open and close',async()=>{
      await p.keyboard.press('Control+k');await p.locator('#guide-q').fill('no prescriber');
      assert.ok(await p.locator('#guide-results a').count());
      await p.keyboard.press('Escape');
    });
    await check('Phone layout avoids horizontal overflow; drawer controls fit',async()=>{
      await p.locator('#navtoggle').click();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(process.env.MJB_QA_DIR)await p.screenshot({path:path.join(process.env.MJB_QA_DIR,'navigation-phone.png')});
      await p.keyboard.press('Escape');
    });
    await check('Desktop pin survives page navigation and adjusts to phone width',async()=>{
      await p.setViewportSize({width:1440,height:1000});await p.locator('#navtoggle').click();await p.locator('[data-nav-pin]').click();
      assert.equal(await p.locator('.mjb-nav-pinned').isVisible(),true);
      await p.goto(base+'/rights/overview/');assert.equal(await p.locator('.mjb-nav-pinned').isVisible(),true);
      if(process.env.MJB_QA_DIR)await p.screenshot({path:path.join(process.env.MJB_QA_DIR,'navigation-desktop.png')});
      await p.setViewportSize({width:390,height:844});assert.equal(await p.locator('.mjb-nav-pinned').isVisible(),false);
      await p.locator('#navtoggle').click();assert.equal(await p.locator('dialog#mjb-navigation-dialog').evaluate(d=>d.open),true);await p.keyboard.press('Escape');
    });
    await check('Compact alternative and guide themes remain usable',async()=>{
      await p.goto(base+'/guide/index.html?navlayout=compact#/n/genetics');
      for(const theme of ['ink','paper','terminal','contrast']){await p.locator('#theme').selectOption(theme);assert.equal(await p.locator('html').getAttribute('data-theme'),theme);}
      await p.locator('#navtoggle').click();assert.equal(await p.locator('.mjb-nav-compact').evaluate(d=>d.open),true);await p.keyboard.press('Escape');
    });
    await check('Scientific pilot: images load, text equivalents and enlargement work',async()=>{
      await p.goto(base+'/science/process-atlas/');assert.equal(await p.locator('.atlas-figure').count(),4);
      assert.equal(await p.locator('#site-header .brand').getAttribute('href'),'../../index.html');
      for(const img of await p.locator('.atlas-figure img').all()){await img.scrollIntoViewIfNeeded();assert.equal(await img.evaluate(x=>x.complete&&x.naturalWidth>0),true);}
      const open=p.locator('#atlas-F04 a[data-atlas-enlarge]').last();await open.click();
      assert.equal(await p.locator('.atlas-viewer').evaluate(d=>d.open),true);
      await p.locator('[data-zoom-in]').click();assert.equal(await p.locator('.atlas-viewer output').innerText(),'150%');await p.keyboard.press('Escape');
      assert.equal(await p.evaluate(()=>document.activeElement.hasAttribute('data-atlas-enlarge')),true);
      await p.locator('#atlas-F04 summary').click();assert.match(await p.locator('#atlas-F04 details').innerText(),/proton gradient/);
    });
    await check('Relatable pilot: three original images load with literal explanations',async()=>{
      await p.goto(base+'/support/relatable-examples/');assert.equal(await p.locator('.atlas-figure').count(),3);
      assert.equal(await p.locator('#site-header .brand').getAttribute('href'),'../../index.html');
      for(const img of await p.locator('.atlas-figure img').all()){await img.scrollIntoViewIfNeeded();assert.equal(await img.evaluate(x=>x.complete&&x.naturalWidth>0),true);assert.ok((await img.getAttribute('alt')).length>50);}
    });
    await check('No page JavaScript errors in exercised routes',async()=>assert.deepEqual(errors,[]));
    // A separate no-JS context proves the index does not rely on enhancement.
    const nojs=await b.newContext({javaScriptEnabled:false});const np=await nojs.newPage();await np.goto(base+'/navigation/');
    await np.getByText('Getting care',{exact:true}).click();assert.equal(await np.getByRole('link',{name:'No current prescriber',exact:true}).isVisible(),true);
    report.push({name:'No-JavaScript category index reveals real destination links',passed:true});console.log('PASS no-JavaScript index');await nojs.close();
  }catch(e){report.push({name:'Failure',passed:false,error:e.stack});console.error(e);process.exitCode=1;}
  finally{await b.close();server.close();if(process.env.MJB_QA_REPORT)fs.writeFileSync(process.env.MJB_QA_REPORT,JSON.stringify({checks:report,errors},null,2)+'\n');}
})();
