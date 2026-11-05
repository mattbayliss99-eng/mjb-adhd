/* Native static pages are the navigation model. This only adds optional input/resume. */
(function(){
 'use strict';
 const main=document.querySelector('.mjb-posts-preview');if(!main)return;
 const safePath=p=>/^\/posts-preview\/p\/mjb-p00000[123]\/$/.test(p||'');
 const read=k=>{try{return sessionStorage.getItem(k)}catch{return null}};
 const write=(k,v)=>{try{sessionStorage.setItem(k,v)}catch{}};
 const remove=k=>{try{sessionStorage.removeItem(k)}catch{}};
 const resume=document.querySelector('[data-continue]'),last=read('mjb-posts-last');
 if(resume&&safePath(last)){resume.href=last;resume.hidden=false;}
 const region=document.querySelector('[data-post-region]');if(!region)return;
 const key='mjb-posts-position:'+location.pathname;
 const save=()=>write(key,String(Math.max(0,window.scrollY||0)));
 const requested=read('mjb-posts-focus')===location.pathname;
 if(requested){write(key,'0');remove('mjb-posts-focus');document.getElementById('post-title').focus({preventScroll:true});}
 const restore=()=>{if(location.hash)return;const raw=read(key);const y=Number(raw);if(raw!==null&&Number.isFinite(y)&&y>=0)window.scrollTo(0,y);};
 requestAnimationFrame(restore);window.addEventListener('pageshow',restore);window.addEventListener('pagehide',save);
 write('mjb-posts-last',location.pathname);
 document.querySelectorAll('a[data-prev],a[data-next]').forEach(a=>a.addEventListener('click',()=>{save();write('mjb-posts-focus',new URL(a.href,location.href).pathname);}));
 document.querySelectorAll('[data-article],[data-evidence]').forEach(a=>a.addEventListener('click',save));
 const toggle=document.querySelector('[data-swipe-toggle]');
 let enabled=read('mjb-posts-swipe')==='on';
 if(toggle){toggle.checked=enabled;document.querySelector('[data-swipe-setting]').hidden=false;toggle.addEventListener('change',()=>{enabled=toggle.checked;write('mjb-posts-swipe',enabled?'on':'off');});}
 function go(direction){const a=region.querySelector(direction<0?'a[data-prev]':'a[data-next]');if(a)a.click();}
 region.addEventListener('keydown',e=>{if(e.target!==region||e.ctrlKey||e.altKey||e.metaKey||e.shiftKey)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go(e.key==='ArrowLeft'?-1:1);}});
 let start=null;
 const blocked=t=>t.closest('a,button,input,textarea,select,summary,details,figure,table,pre,code,[contenteditable],[data-horizontal-scroll]');
 region.addEventListener('touchstart',e=>{start=null;if(!enabled||e.touches.length!==1||blocked(e.target)||window.getSelection()?.toString())return;let el=e.target;while(el&&el!==region){if(el.scrollWidth>el.clientWidth+1)return;el=el.parentElement;}start={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
 region.addEventListener('touchmove',e=>{if(e.touches.length!==1)start=null;},{passive:true});
 region.addEventListener('touchcancel',()=>{start=null;},{passive:true});
 region.addEventListener('touchend',e=>{const s=start;start=null;if(!s||!enabled||e.changedTouches.length!==1||e.touches.length)return;const dx=e.changedTouches[0].clientX-s.x,dy=e.changedTouches[0].clientY-s.y;if(Math.abs(dx)>=64&&Math.abs(dx)>Math.abs(dy)*1.5)go(dx>0?-1:1);},{passive:true});
})();
