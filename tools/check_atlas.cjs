// Exercise every figure page and check text geometry in the actual SVG renderer.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(__dirname,'../site'),out=process.env.MJB_ATLAS_QA_DIR;
 const m=JSON.parse(fs.readFileSync(path.join(root,'assets/atlas/manifest.json'))),checks=[],geometry=[],media=[];
const server=http.createServer((req,res)=>{let f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root+'/'))return res.writeHead(403).end();try{if(fs.statSync(f).isDirectory())f=path.join(f,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.svg':'image/svg+xml','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.json':'application/json'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));}catch(e){res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const b=await chromium.launch({executablePath:process.env.MJB_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-zygote']});
 const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  for(const f of m.figures){await p.goto(base+f.url);await p.locator('.mjb-location-path').waitFor();const loc=await p.locator('.mjb-location-path').innerText();assert.ok(loc.includes('Process atlas')&&loc.includes(f.title),f.id+' topic path');
   const im=p.locator('.atlas-figure img');await im.scrollIntoViewIfNeeded();assert.equal(await im.evaluate(x=>x.complete&&x.naturalWidth>0),true);assert.ok((await im.getAttribute('alt')).length>35);assert.ok(await p.locator('.atlas-figure details a').count());assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const home=await p.locator('#site-header .brand').evaluate(a=>new URL(a.href).pathname);assert.equal(home,'/index.html');
   checks.push({id:f.id,path:true,image:true,alt:true,sources:true,phone_fit:true,home:true});
  }
  await p.goto(base+'/science/process-atlas/f37/');await p.locator('#navtoggle').click();assert.equal(await p.locator('.mjb-nav-panel [aria-current="page"]').count(),1);assert.equal(await p.locator('.mjb-nav-panel details[open]').count(),3);await p.keyboard.press('Escape');
  await p.locator('.atlas-figure a[data-atlas-enlarge]').last().click();await p.locator('[data-zoom-in]').click();assert.equal(await p.locator('.atlas-viewer output').innerText(),'150%');await p.keyboard.press('Escape');assert.ok(await p.evaluate(()=>document.activeElement.hasAttribute('data-atlas-enlarge')));
  const q=await b.newPage({viewport:{width:1600,height:1080}});
  for(const f of m.figures.filter(x=>x.version==='review-2026-10-13.2')){await q.goto(base+'/'+f.svg);const g=await q.evaluate(()=>{
    const svg=document.querySelector('svg'),W=svg.viewBox.baseVal.width,H=svg.viewBox.baseVal.height,issues=[];
    const intersects=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
    for(const t of svg.querySelectorAll('text')){const r=t.getBBox();if(r.x<0||r.y<0||r.x+r.width>W||r.y+r.height>H)issues.push('outside canvas: '+t.textContent);}
    const boxes=[...svg.querySelectorAll('.node-box')].map(r=>r.getBBox());
    for(const t of svg.querySelectorAll('.edge-label'))if(boxes.some(r=>intersects(t.getBBox(),r)))issues.push('edge label hidden by node: '+t.textContent);
    const labels=[...svg.querySelectorAll('.edge-label')];for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++)if(intersects(labels[i].getBBox(),labels[j].getBBox()))issues.push('overlapping edge labels: '+labels[i].textContent+' / '+labels[j].textContent);
    for(const n of svg.querySelectorAll('.atlas-node')){const r=n.querySelector('rect').getBBox();for(const t of n.querySelectorAll('text')){const z=t.getBBox();if(z.x<r.x||z.x+z.width>r.x+r.width||z.y<r.y||z.y+z.height>r.y+r.height)issues.push('text outside node: '+t.textContent);}}
    return issues;
   });geometry.push({id:f.id,issues:g});
   if(out&&['F03','F06','F14','F33','F37','F40'].includes(f.id))await q.screenshot({path:path.join(out,f.id+'.png')});
  }
  for(const [route,count] of [['/support/relatable-examples/',9],['/support/visual-guides/',4]]){await p.goto(base+route);assert.equal(await p.locator('.atlas-figure').count(),count);for(const im of await p.locator('.atlas-figure img').all()){await im.scrollIntoViewIfNeeded();await im.evaluate(x=>x.decode());assert.ok((await im.getAttribute('alt')).length>50);}assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  const cards=JSON.parse(fs.readFileSync(path.join(root,'assets/relatable/manifest.json'))).cards.map(c=>({id:c.id,svg:'assets/relatable/'+c.id+'.svg'}));
  const guides=JSON.parse(fs.readFileSync(path.join(root,'assets/visual-guides/manifest.json'))).guides.map(c=>({id:c.id,svg:'assets/visual-guides/'+c.id+'.svg'}));
  for(const f of [...cards,...guides]){await q.goto(base+'/'+f.svg);const issues=await q.evaluate(()=>{const s=document.querySelector('svg'),W=s.viewBox.baseVal.width,H=s.viewBox.baseVal.height,ts=[...s.querySelectorAll('text')],result=[];for(const t of ts){const z=t.getBBox();if(z.x<0||z.y<0||z.x+z.width>W||z.y+z.height>H)result.push('text outside canvas: '+t.textContent);}for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){const a=ts[i].getBBox(),b=ts[j].getBBox();if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)result.push('text overlap: '+ts[i].textContent+' / '+ts[j].textContent);}return result;});media.push({id:f.id,issues});if(out)await q.screenshot({path:path.join(out,f.id+'.png')});}
  assert.deepEqual(errors,[]);
  const result={status:[...geometry,...media].some(x=>x.issues.length)?'GEOMETRY_FIX_REQUIRED':'PASSED',figure_pages:checks,deep_menu:true,zoom_focus:true,page_errors:errors,geometry,media};
  fs.writeFileSync(process.env.MJB_ATLAS_QA_REPORT,JSON.stringify(result,null,2));console.log(JSON.stringify({status:result.status,pages:checks.length,issues:geometry.filter(x=>x.issues.length)},null,2));
  if(result.status!=='PASSED')process.exitCode=1;
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
