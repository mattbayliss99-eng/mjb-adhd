const {JSDOM,requestInterceptor,VirtualConsole}=require(process.env.MJB_DOM_MODULE||'jsdom');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');const root=path.resolve(__dirname,'../site');
async function open(route){const missing=[],errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>{if(e.type==='unhandled-exception')errors.push(e.message)});
const d=new JSDOM(fs.readFileSync(path.join(root,new URL('https://mjb.test'+route).pathname,'index.html'),'utf8'),{url:'https://mjb.test'+route,runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,resources:{interceptors:[requestInterceptor(req=>{const u=new URL(req.url);let file=path.join(root,u.pathname);try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');return new Response(u.pathname.endsWith('.css')?'':fs.readFileSync(file),{headers:{'Content-Type':u.pathname.endsWith('.js')?'application/javascript':'text/css'}})}catch{missing.push(u.pathname);return new Response('',{status:404})}})]},beforeParse(w){w.matchMedia=q=>({matches:q.includes('1240'),media:q,addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};}});
await new Promise(resolve=>d.window.addEventListener('load',()=>setTimeout(resolve,60),{once:true}));assert.deepEqual(missing,[]);assert.deepEqual(errors,[]);return d;}
(async()=>{
for(const route of ['/posts-preview/','/posts-preview/p/mjb-p000001/','/posts-preview/p/mjb-p000002/','/posts-preview/p/mjb-p000003/']){
 const d=await open(route),doc=d.window.document;assert.ok(doc.querySelector('#navtoggle'));assert.ok(doc.querySelector('.mjb-reading-tools'));assert.match(doc.querySelector('[aria-label="Your location"]').textContent,/Visual posts preview/);assert.ok(doc.querySelector('[data-reading-settings]'));
 doc.querySelector('#navtoggle').click();assert.equal(doc.querySelector('#mjb-navigation-dialog').open,true);assert.equal(doc.querySelectorAll('.mjb-nav-panel [aria-current="page"]').length,1);
 doc.querySelector('[data-nav-close]').click();assert.equal(doc.querySelector('#mjb-navigation-dialog').open,false);assert.equal(doc.activeElement.id,'navtoggle');
 d.window.MJBReading.setLevel('max');assert.equal(d.window.MJBReading.prefs.level,'max');d.window.MJBReading.openSettings();assert.equal(doc.querySelector('#mjb-reading-settings').open,true);d.window.close();
}console.log('PASS Shared engines on all 4 routes: dependencies load, header, current location, nav open/close focus and reading settings');
for(const query of ['?post-return=MJB-P000002','','?post-return=https://evil.invalid/']){
 const d=await open('/science/what-is-adhd/'+query),a=d.window.document.querySelector('.mjb-posts-return a');
 if(query==='?post-return=MJB-P000002')assert.equal(a.getAttribute('href'),'/posts-preview/p/mjb-p000002/');else assert.equal(a,null);d.window.close();
}console.log('PASS Existing article gains return link only for allowlisted preview ID; ordinary visits and untrusted URLs unaffected');
})().catch(e=>{console.error(e);process.exitCode=1});
