// DOM regression checks. Layout, native navigation and real gestures still need browser checks.
const {JSDOM}=require(process.env.MJB_DOM_MODULE||'jsdom');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
if(process.env.MJB_RED_FIXTURE){const d=new JSDOM(fs.readFileSync(process.env.MJB_RED_FIXTURE,'utf8'));const next=d.window.document.querySelector('[data-next]');assert.equal(next.tagName,'A','Every post needs an ordinary next link that works without a controller');process.exit();}
const bank=JSON.parse(fs.readFileSync(path.join(root,'content/posts/posts.json'))).posts;
const code=fs.readFileSync(path.join(root,'site/posts-preview/sequence.js'),'utf8');let count=0;
function open(id,storage={},hash=''){
 const file=path.join(root,'site/posts-preview/p',id.toLowerCase(),'index.html');
 const d=new JSDOM(fs.readFileSync(file,'utf8'),{url:'https://mjb.test/posts-preview/p/'+id.toLowerCase()+'/'+hash,runScripts:'outside-only',pretendToBeVisual:true});const w=d.window;
 w.scrollTo=(x,y)=>{w.__scroll=y};w.requestAnimationFrame=f=>{f();return 1};
 for(const [k,v] of Object.entries(storage))w.sessionStorage.setItem(k,v);w.eval(code);return d;
}
function pass(s){count++;console.log('PASS',s)}
for(let i=0;i<3;i++){
 const d=open(bank[i].id);const doc=d.window.document;
 assert.equal(doc.querySelectorAll('article[data-post-id]').length,1);
 const prev=doc.querySelector('a[data-prev]'),next=doc.querySelector('a[data-next]');
 if(i)assert.equal(prev.getAttribute('href'),'/posts-preview/p/'+bank[i-1].id.toLowerCase()+'/');else assert.equal(prev,null);
 if(i<2)assert.equal(next.getAttribute('href'),'/posts-preview/p/'+bank[i+1].id.toLowerCase()+'/');else assert.equal(next,null);
 assert.equal(doc.querySelector('article').hidden,false);assert.match(doc.querySelector('[data-position]').textContent,new RegExp(`${i+1} of 3`));d.window.close();
}pass('Every static post, including the middle card, has usable native sequence links without JS-dependent hidden content');
{
 const d=open('MJB-P000002'),w=d.window,doc=w.document,region=doc.querySelector('[data-post-region]');
 let destinations=[];doc.addEventListener('click',e=>{const a=e.target.closest('a');if(a){destinations.push(a.pathname);e.preventDefault();}});
 const press=(target,props)=>target.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true,...props}));
 press(doc.querySelector('[data-swipe-toggle]'));assert.equal(destinations.length,0);
 press(region,{ctrlKey:true});press(region,{shiftKey:true});assert.equal(destinations.length,0);
 press(region);assert.equal(destinations.at(-1),'/posts-preview/p/mjb-p000003/');
 region.focus();region.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true,cancelable:true}));assert.equal(destinations.at(-1),'/posts-preview/p/mjb-p000001/');
 assert.equal(w.sessionStorage.getItem('mjb-posts-focus'),'/posts-preview/p/mjb-p000001/');
 d.window.close();pass('Scoped arrows follow correct native link; form controls and modifiers are untouched; destination focus request stored');
}
{
 const d=open('MJB-P000002',{'mjb-posts-focus':'/posts-preview/p/mjb-p000002/','mjb-posts-position:/posts-preview/p/mjb-p000002/':'340'});assert.equal(d.window.document.activeElement.id,'post-title');assert.equal(d.window.__scroll,0);assert.equal(d.window.sessionStorage.getItem('mjb-posts-focus'),null);d.window.close();pass('Sequence arrival focuses visible title and consumes focus request');
}
{
 const d=open('MJB-P000001'),w=d.window,doc=w.document,region=doc.querySelector('[data-post-region]'),toggle=doc.querySelector('[data-swipe-toggle]');let clicks=0;doc.addEventListener('click',e=>{if(e.target.closest('a[data-next]')){clicks++;e.preventDefault();}});
 function touch(target,type,x,y,multi=false){const e=new w.Event(type,{bubbles:true});Object.defineProperty(e,'touches',{value:type==='touchend'?[]:multi?[{clientX:x,clientY:y},{}]:[{clientX:x,clientY:y}]});Object.defineProperty(e,'changedTouches',{value:[{clientX:x,clientY:y}]});target.dispatchEvent(e)}
 function swipe(target,dx,dy){touch(target,'touchstart',200,200);touch(target,'touchend',200+dx,200+dy)}
 swipe(region,-150,0);assert.equal(clicks,0);toggle.checked=true;toggle.dispatchEvent(new w.Event('change'));assert.equal(w.sessionStorage.getItem('mjb-posts-swipe'),'on');
 swipe(region,-150,200);swipe(doc.querySelector('a[data-next]'),-150,0);assert.equal(clicks,0);
 touch(region,'touchstart',200,200,true);touch(region,'touchend',0,200);assert.equal(clicks,0);
 swipe(region,-150,0);assert.equal(clicks,1);touch(region,'touchstart',200,200);region.dispatchEvent(new w.Event('touchcancel',{bubbles:true}));touch(region,'touchend',0,200);assert.equal(clicks,1);
 d.window.close();pass('Swipe defaults off; only enabled horizontal noninteractive single-touch gesture navigates; cancel and vertical gestures ignored');
}
{
 const key='mjb-posts-position:/posts-preview/p/mjb-p000002/';const d=open('MJB-P000002',{[key]:'340'});assert.equal(d.window.__scroll,340);d.window.close();
 const h=open('MJB-P000002',{[key]:'340'},'#post-title');assert.equal(h.window.__scroll,undefined);h.window.close();pass('Return/reload restores saved scroll without overriding explicit fragment destinations');
}
console.log(`${count} DOM regression groups passed. No browser/layout conformance claim.`);
