'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { chromium } = require('playwright');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '../..'), out = path.join(root, 'artifacts/stage2'); fs.mkdirSync(out, {recursive:true});
const origin = process.env.MJB_PREVIEW || 'https://6aed2a08d252e3c395fb4466--mjb-adhd.netlify.app';
const results = [];
function check(id, ok, result) { results.push({id,status:ok?'PASS':'FAIL',result}); if(!ok) console.log('FAIL',id,result); }
(async()=>{
 const bank=JSON.parse(fs.readFileSync(path.join(root,'content/routes/route-bank.json')));
 for(let i=0;i<bank.routes.length;i+=6) await Promise.all(bank.routes.slice(i,i+6).map(async r=>{
   const response=await fetch(origin+r.oldRoute);const bytes=Buffer.from(await response.arrayBuffer());
   const doc=new JSDOM(bytes.toString('utf8')).window; const main=doc.document.querySelector('main'); if(main)main.querySelectorAll('script,template').forEach(n=>n.remove()); const text=main?main.textContent.replace(/\s+/g,' ').trim():''; const hash=crypto.createHash('sha256').update(text).digest('hex'); doc.close();
   check('HOSTED '+r.oldRoute,response.status===200 && hash===r.mainTextSha256, 'status='+response.status+'; full main text hash; Netlify post-processes HTML links');
 }));
 const response=await fetch(origin+'/social-reading-beta/journal/');
 const headers=Object.fromEntries(response.headers);fs.writeFileSync(path.join(out,'hosted-headers.json'),JSON.stringify(headers,null,2));
 check('HOSTED CSP',/script-src 'self';/.test(headers['content-security-policy']||'') && !/script-src[^;]*unsafe-inline/.test(headers['content-security-policy']||''),headers['content-security-policy']);
 check('HOSTED HEADERS',headers['x-content-type-options']==='nosniff' && headers['x-frame-options']==='SAMEORIGIN' && /max-age/.test(headers['strict-transport-security']||''),'security headers preserved');
 const md=await fetch(origin+'/science/genetics/gen-12/',{headers:{Accept:'text/markdown'}});const text=await md.text();
 check('HOSTED MARKDOWN',md.status===200 && /text\/markdown/.test(md.headers.get('content-type')||'') && text.includes('#') && !text.includes('<!DOCTYPE'), 'status='+md.status+'; '+md.headers.get('content-type'));
 const noindex=await fetch(origin+'/social-reading-beta/journal/',{headers:{Accept:'text/markdown'}});
 check('HOSTED JOURNAL HTML',/text\/html/.test(noindex.headers.get('content-type')||''),'journal not converted into public markdown');
 for(const file of ['js/journal.js','js/prefs.js','css/social-reading.css']) {
 const res=await fetch(origin+'/social-reading-beta/'+file);const data=Buffer.from(await res.arrayBuffer());
 check('HOSTED ASSET '+file,res.status===200 && data.equals(fs.readFileSync(path.join(root,'site/social-reading-beta',file))),'exact local bytes');
 }
 const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];const external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(/Content Security Policy|Refused to/.test(m.text()))errors.push(m.text())});
 page.on('request',r=>{if(new URL(r.url()).origin!==origin)external.push(r.url())});
 await page.goto(origin+'/social-reading-beta/');await page.locator('[data-expand-post="MJB-P000001"]').click();await page.waitForURL('**/p/mjb-p000001/');
 check('HOSTED READER',await page.locator('.srb-reader').count()===1,'topic expands');await page.screenshot({path:path.join(out,'hosted-reader-phone.png')});
 await page.goto(origin+'/social-reading-beta/journal/');await page.fill('[data-journal-heading]','Synthetic hosted check');await page.fill('[data-journal-body]','Synthetic only. No personal data.');await page.click('[data-journal-save]');
 check('HOSTED JOURNAL', (await page.textContent('[data-journal-list]')).includes('Synthetic hosted check'),'synthetic note saved locally');
 await page.reload();check('HOSTED RELOAD',(await page.textContent('[data-journal-list]')).includes('Synthetic hosted check'),'local entry survives reload');
 check('HOSTED NO EXTERNAL REQUESTS',external.length===0,external);check('HOSTED NO CSP ERRORS',errors.length===0,errors);
 await browser.close();
 const fallback=require('../../netlify/edge-functions/fallback.ts').default;
 for(const kind of ['throw','500','200']) {
 const r=await fallback(new Request(origin+'/science/genetics/',{headers:{Accept:'text/html'}}),{next:async()=>{if(kind==='throw')throw new Error('synthetic failure');return new Response('synthetic',{status:Number(kind)})}});
 check('FALLBACK MOCK '+kind,kind==='200'?r.status===200:r.status===302 && r.headers.get('location')==='https://x.com/MJB_ADHD','mocked upstream; not a hosted 5xx injection');
 }
 fs.writeFileSync(path.join(out,'hosted-results.json'),JSON.stringify(results,null,2));console.log(results.filter(r=>r.status==='PASS').length+'/'+results.length+' hosted and fallback checks pass');process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1});

