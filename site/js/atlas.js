(function(){
  'use strict';
  const links=document.querySelectorAll('[data-atlas-enlarge]');if(!links.length||!window.HTMLDialogElement)return;
  const d=document.createElement('dialog');d.className='atlas-viewer';d.setAttribute('aria-label','Enlarged process diagram');
  d.innerHTML='<div class="atlas-viewer-head"><strong>Process diagram</strong><button type="button" data-zoom-out aria-label="Zoom out">−</button><output aria-label="Zoom level">100%</output><button type="button" data-zoom-in aria-label="Zoom in">+</button><button type="button" data-close>Close</button></div><p class="atlas-viewer-hint">Use the zoom buttons, then scroll to move across the diagram. Escape closes this view.</p><div class="atlas-viewer-canvas" tabindex="0" aria-label="Diagram; scroll to explore"><img alt=""></div>';
  document.body.append(d);const img=d.querySelector('img'),canvas=d.querySelector('.atlas-viewer-canvas'),output=d.querySelector('output');let zoom=100,opener,oldOverflow='';
  function size(){img.style.width=zoom+'%';output.textContent=zoom+'%';}
  links.forEach(a=>a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();opener=a;const fig=a.closest('figure');img.src=a.href;img.alt=fig.querySelector('img').alt;d.querySelector('strong').textContent=fig.querySelector('h3').textContent;zoom=100;size();oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';d.showModal();canvas.scrollTo(0,0);d.querySelector('[data-close]').focus({preventScroll:true});}));
  d.querySelector('[data-close]').addEventListener('click',()=>d.close());d.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;opener?.focus({preventScroll:true});});
  d.querySelector('[data-zoom-in]').addEventListener('click',()=>{zoom=Math.min(500,zoom+50);size();});d.querySelector('[data-zoom-out]').addEventListener('click',()=>{zoom=Math.max(100,zoom-50);size();});
})();
