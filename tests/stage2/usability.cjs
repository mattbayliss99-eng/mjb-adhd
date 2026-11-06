'use strict';
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '../..'), out = path.join(root, 'artifacts/stage2-usability');
fs.mkdirSync(out, { recursive: true });
const results = [];
function rec(id, ok, detail) { results.push({ id, status: ok ? 'PASS' : 'FAIL', detail }); console.log(ok ? 'PASS' : 'FAIL', id, detail || ''); }
(async () => {
 const server = await require('../stage1/serve-with-headers.cjs')(path.join(root, 'site'), 8894);
 const browser = await chromium.launch();
 const B = (process.env.MJB_PREVIEW || 'http://127.0.0.1:8894') + '/social-reading-beta/';
 try {
  const ctx = await browser.newContext({ viewport: { width:390, height:844 }, isMobile:true, hasTouch:true });
  const p = await ctx.newPage();
  await p.goto(B+'p/mjb-p000001/');
  rec('NO-UNIMPLEMENTED-SWIPE', await p.locator('#pref-swipe').count() === 0);
  rec('PHONE-DEFAULT-DECK', await p.getAttribute('.srb-reader','data-layout') === 'deck');
  const heading = await p.locator('.srb-slide:not([hidden]) .srb-slide-heading').boundingBox();
  const next = await p.locator('[data-slide-next]').boundingBox();
  rec('FIRST-HEADING-AND-NEXT-VISIBLE', heading && next && heading.y >= 0 && heading.y + heading.height < next.y && next.y + next.height < 844, JSON.stringify({heading,next}));
  if(next) { const x=next.x+next.width/2, y=next.y+next.height/2; const positions=[];
   for(let i=0;i<3;i++){ await p.touchscreen.tap(x,y); await p.waitForTimeout(80); const b=await p.locator('[data-slide-next]').boundingBox();positions.push(b.y+b.height/2); }
   rec('THREE-SAME-POINT-TAPS-REACH-FOUR', /-04$/.test(new URL(p.url()).searchParams.get('slide')||''),p.url());
   rec('NEXT-DRIFT-AT-MOST-8PX', positions.every(v=>Math.abs(v-y)<=8), JSON.stringify(positions));
  }
  await p.locator('.srb-seam-options > summary').click();
  rec('DOT-TARGETS-44PX', await p.locator('.srb-dot').evaluateAll(els=>els.every(e=>{const r=e.getBoundingClientRect();return r.width>=44 && r.height>=44;})));
  await p.locator('.srb-seam-options > summary').click();
  rec('DOCK-TARGETS-48PX', await p.locator('.srb-dock > *').evaluateAll(els=>els.every(e=>e.getBoundingClientRect().height>=48)));
  rec('STORY-NO-FALSE-HOME-CURRENT', await p.locator('.srb-dock [aria-current="page"]').count() === 0);
  await p.goto(B); await p.locator('[data-expand-post="MJB-P000002"]').scrollIntoViewIfNeeded();
  const y0=await p.evaluate(()=>scrollY); await p.locator('[data-expand-post="MJB-P000002"]').click();
  await p.waitForURL('**/p/mjb-p000002/');await p.goBack();await p.waitForTimeout(200);
  rec('BACK-RESTORES-ONCE', Math.abs(await p.evaluate(()=>scrollY)-y0)<80,`${y0}->${await p.evaluate(()=>scrollY)}`);
  await p.goto(B+'p/mjb-p000002/');await p.locator('.srb-dock-home').click();await p.waitForTimeout(150);
  rec('FRESH-HOME-AT-TOP',await p.evaluate(()=>scrollY)<8,await p.evaluate(()=>scrollY));
  rec('HOME-HAS-ONE-CURRENT-PER-NAV',await p.locator('.srb-nav [aria-current="page"]').count()===1);
  rec('HOME-HAS-H1',await p.locator('h1').count()===1);
  await p.goto(B+'p/mjb-p000001/?slide=MJB-S000001-01');
  let tabs=0; await p.locator('.skip-link').focus();
  for(;tabs<20;tabs++){await p.keyboard.press('Tab');if(await p.locator('[data-slide-next]').evaluate(e=>e===document.activeElement))break;}
  rec('NEXT-WITHIN-8-TABS',tabs+1<=8,tabs+1);
  await p.locator('[data-enlarge-visual]').click();
  rec('IMAGE-VIEWER-OPENS',await p.locator('[data-image-viewer]').evaluate(e=>e.open));
  const viewerAxe = await new AxeBuilder({page:p}).analyze();
  rec('IMAGE-VIEWER-AXE',viewerAxe.violations.length===0,viewerAxe.violations.map(v=>v.id).join(', '));
  const w=await p.locator('[data-viewer-image]').evaluate(e=>e.getBoundingClientRect().width);
  await p.locator('[data-viewer-zoom="in"]').click();
  rec('IMAGE-ZOOM-INCREASES-SIZE',await p.locator('[data-viewer-image]').evaluate(e=>e.getBoundingClientRect().width)>w);
  await p.keyboard.press('Escape');
  rec('IMAGE-CLOSE-RESTORES-FOCUS',await p.locator('[data-enlarge-visual]').evaluate(e=>e===document.activeElement));
  for(const width of [320,390]) for(const text of ['100','200']) {
   await p.setViewportSize({width,height:844}); await p.evaluate(t=>{const p=window.__SRB_readPrefs();p.text=t;window.__SRB_writePrefs(p)},text);
   const b=await p.locator('[data-slide-next]').boundingBox();
   rec(`REACHABLE-NEXT-${width}-${text}`,b && b.y>=0 && b.y+b.height<=844);
   rec(`REFLOW-${width}-${text}`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   rec(`CONTROL-LABELS-FIT-${width}-${text}`,await p.locator('.srb-story-nav > *, .srb-dock > *').evaluateAll(els=>els.every(e=>{const r=document.createRange();r.selectNodeContents(e);const t=r.getBoundingClientRect(),b=e.getBoundingClientRect();return t.left>=b.left-1 && t.right<=b.right+1;})));
  }
  await p.screenshot({path:path.join(out,'phone-200pct.png')});
  for (const post of ['000001','000002','000003']) for(const mode of ['deck','split','continuous','thread']) {
   await p.goto(B+`p/mjb-p${post}/?slide=MJB-S${post}-01`);
   await p.evaluate(mode=>window.__SRB_writePrefs(Object.assign(window.__SRB_readPrefs(),{text:'100',layoutMode:mode})),mode);
   const b=await p.locator('[data-slide-next]').boundingBox(), x=b.x+b.width/2,y=b.y+b.height/2; const centres=[];
   for(let i=0;i<3;i++){await p.touchscreen.tap(x,y);const n=await p.locator('[data-slide-next]').boundingBox();centres.push(n.y+n.height/2)}
   rec(`REPEAT-TAPS-${post}-${mode}`,/-04$/.test(new URL(p.url()).searchParams.get('slide')||'') && centres.every(c=>Math.abs(c-y)<=8),JSON.stringify(centres));
  }
  for(const size of [{width:390,height:568},{width:640,height:360}]){
   await p.setViewportSize(size);await p.evaluate(()=>window.__SRB_writePrefs(Object.assign(window.__SRB_readPrefs(),{text:'200',layoutMode:'auto'})));
   const b=await p.locator('[data-slide-next]').boundingBox();rec(`SHORT-HEIGHT-${size.height}`,b.y>=0 && b.y+b.height<=size.height);
  }
  const desktopContext=await browser.newContext({viewport:{width:1280,height:900}});
  const desktop=await desktopContext.newPage();await desktop.goto(B+'p/mjb-p000001/');
  rec('DESKTOP-NO-DOCK',await desktop.locator('.srb-dock').evaluate(e=>getComputedStyle(e).display)==='none');
  rec('DESKTOP-DEFAULT-SPLIT',await desktop.getAttribute('.srb-reader','data-layout')==='split');
  const readerAxe = await new AxeBuilder({page:desktop}).analyze();
  rec('READER-AXE',readerAxe.violations.length===0,readerAxe.violations.map(v=>v.id).join(', '));
  await p.setViewportSize({width:390,height:844});await p.goto(B);
  const homeAxe = await new AxeBuilder({page:p}).analyze();
  rec('HOME-AXE',homeAxe.violations.length===0,homeAxe.violations.map(v=>v.id).join(', '));
  await desktop.screenshot({path:path.join(out,'desktop.png')});
 } catch(e) {rec('HARNESS',false,e.stack)}
 await browser.close();server.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));
 console.log(`${results.filter(r=>r.status==='PASS').length}/${results.length} usability checks pass`);process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})();
