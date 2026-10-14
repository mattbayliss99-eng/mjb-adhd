/* Shared disclosure navigation: ordinary links, native modal focus, no requests. */
(function () {
  'use strict';
  const D = window.MJB_NAV;
  if (!D || document.getElementById('mjb-navigation-dialog')) return;
  const root = document.documentElement;
  if(location.pathname.startsWith('/guide/static/'))document.body.classList.add('mjb-static-reading');
  const wide = window.matchMedia('(min-width: 1240px)');
  const compact = new URLSearchParams(location.search).get('navlayout') === 'compact';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key = s => String(s).replace(/\/index\.html(?=[?#]|$)/, '/').replace(/\/(?=[?#])/g, '').replace(/\/$/, '') || '/';
  function currentKey() {
    const path = key(location.pathname);
    if (path === '/guide' && location.hash.startsWith('#/n/')) return path + '#/n/' + location.hash.slice(4).split('?')[0];
    return path;
  }
  function record() { return Object.entries(D.entries).find(([k]) => key(k) === currentKey())?.[1]; }
  let opener = document.getElementById('navtoggle');
  const oldNav = document.getElementById('mainnav');
  if (oldNav) oldNav.remove();
  if (opener) {
    const clean = opener.cloneNode(false); opener.replaceWith(clean); opener = clean;
  } else {
    opener = document.createElement('button');
    const header = document.querySelector('.topnav,.topbar,#site-header') || document.body;
    header.prepend(opener);
  }
  opener.type='button'; opener.id='navtoggle'; opener.classList.add('mjb-nav-control');
  opener.innerHTML='<img class="mjb-nav-logo" src="/assets/mjb-emblem.jpg" alt=""><span class="mjb-hamburger" aria-hidden="true"><i></i><i></i><i></i></span><span>Navigation</span>';
  opener.setAttribute('aria-controls','mjb-navigation-dialog'); opener.setAttribute('aria-expanded','false');
  opener.setAttribute('aria-haspopup','dialog');
  // Use the same header on ordinary and guide pages, preserving existing tools.
  const siteHeader=document.querySelector('#site-header,.topbar');
  if(siteHeader){
    const bar=siteHeader.querySelector('.top-inner')||document.createElement('div');
    if(!bar.parentNode){bar.className='top-inner';siteHeader.prepend(bar);}
    const brand=siteHeader.querySelector('.brand')||document.createElement('a');
    brand.className='brand';brand.href='/';brand.setAttribute('aria-label','MJB ADHD home');brand.innerHTML='<span class="brand-name">MJB ADHD</span>';
    const actions=document.createElement('div');actions.className='mjb-header-actions';
    const search=siteHeader.querySelector('#searchtoggle')||siteHeader.querySelector('[data-act="search"]');
    if(search){search.innerHTML='<svg class="mjb-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5"></path></svg><span>Search</span>';search.classList.add('iconbtn','mjb-search-button');actions.append(search);}
    const settings=document.createElement('button');settings.type='button';settings.className='iconbtn';settings.textContent='Aa';settings.setAttribute('aria-label','Reading settings');settings.setAttribute('aria-haspopup','dialog');settings.dataset.readingSettings='';actions.append(settings);
    bar.prepend(opener);bar.append(brand,actions);
    const tools=siteHeader.querySelector('.topnav');if(tools){tools.querySelector('.theme-pick')?.remove();const extra=document.createElement('details');extra.className='mjb-guide-tools';extra.innerHTML='<summary>Explore this guide</summary>';extra.append(tools);siteHeader.append(extra);}
    const box=siteHeader.querySelector('.searchbox');if(box)siteHeader.append(box);
  }
  const dialog=document.createElement('dialog');dialog.id='mjb-navigation-dialog';dialog.className='mjb-nav-dialog';
  dialog.setAttribute('aria-label','Website navigation');
  if(compact)dialog.classList.add('mjb-nav-compact');
  const pinnedHost=document.createElement('aside');pinnedHost.id='mjb-navigation-pinned';pinnedHost.className='mjb-nav-pinned';pinnedHost.hidden=true;
  pinnedHost.setAttribute('aria-label','Website navigation');
  const panel=document.createElement('div');panel.className='mjb-nav-panel';
  function list(nodes, level) {
    return '<ul class="mjb-nav-list">'+nodes.map(n=>n.children?.length ?
      `<li><details data-nav-group="${esc(n.id)}"><summary>${esc(n.label)}</summary><a class="mjb-nav-overview" href="${esc(n.url)}">Section overview</a>${list(n.children,level+1)}</details></li>`:
      `<li><a href="${esc(n.url)}" data-nav-destination="${esc(n.url)}">${esc(n.label)}</a></li>`).join('')+'</ul>';
  }
  panel.innerHTML='<div class="mjb-nav-head"><strong>MJB ADHD</strong><button type="button" data-nav-close>Close</button></div><p class="mjb-nav-location"></p><div class="mjb-nav-actions"><button type="button" data-nav-pin>Keep visible</button><a href="/navigation/">All topics</a></div><nav aria-label="Topics">'+list(D.categories,0)+'<div class="mjb-nav-global">'+list(D.global,0)+'</div></nav>';
  dialog.append(panel);document.body.append(dialog,pinnedHost);
  const closeButton=panel.querySelector('[data-nav-close]');
  const pinButton=panel.querySelector('[data-nav-pin]');
  let pinWanted=false, oldOverflow='';
  try { pinWanted=localStorage.getItem('mjb-nav-pin')==='1'; } catch(e) {}
  if(new URLSearchParams(location.search).get('navlayout')==='rail')pinWanted=true;
  function setExpanded(v){opener.setAttribute('aria-expanded',String(v));}
  function close(){
    if(dialog.open)dialog.close();
    else if(!pinnedHost.hidden){pinWanted=false;savePin();applyPin();}
    setExpanded(false);opener.focus({preventScroll:true});
  }
  function savePin(){try{localStorage.setItem('mjb-nav-pin',pinWanted?'1':'0');}catch(e){}}
  function applyPin(){
    const active=pinWanted&&wide.matches&&!compact;
    if(dialog.open)dialog.close();
    root.classList.toggle('mjb-nav-docked',active);
    pinnedHost.hidden=!active;(active?pinnedHost:dialog).append(panel);
    pinButton.hidden=!wide.matches||compact;
    pinButton.textContent=active?'Use drawer':'Keep visible';
    closeButton.textContent='Close';closeButton.setAttribute('aria-label','Close navigation');
    opener.setAttribute('aria-haspopup',active?'false':'dialog');
    opener.setAttribute('aria-controls',active?'mjb-navigation-pinned':'mjb-navigation-dialog');
    setExpanded(active);
  }
  function open(){
    if(!pinnedHost.hidden){close();return;}
    orient();oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    dialog.showModal();setExpanded(true);closeButton.focus({preventScroll:true});
  }
  opener.addEventListener('click',()=>dialog.open?close():open());
  closeButton.addEventListener('click',close);
  pinButton.addEventListener('click',()=>{pinWanted=!pinWanted;savePin();applyPin();opener.focus({preventScroll:true});});
  dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;setExpanded(false);});
  dialog.addEventListener('cancel',()=>{setExpanded(false);});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close();}});
  panel.addEventListener('toggle',e=>{
    const d=e.target;if(d.tagName!=='DETAILS'||!d.open)return;
    const parent=d.parentElement.parentElement;
    [...parent.children].forEach(li=>{const other=li.querySelector(':scope > details');if(other&&other!==d)other.open=false;});
  },true);
  panel.addEventListener('click',e=>{if(e.target.closest('a')&&dialog.open)dialog.close();});
  wide.addEventListener('change',applyPin);
  const header=document.querySelector('#site-header,.topbar');
  let lastHeaderBottom=-1;
  function positionRail(){if(!header)return;const n=Math.ceil(header.getBoundingClientRect().bottom);if(n!==lastHeaderBottom){root.style.setProperty('--mjb-nav-top',Math.max(0,n)+'px');lastHeaderBottom=n;}}
  if(header&&window.ResizeObserver)new ResizeObserver(positionRail).observe(header);
  window.addEventListener('scroll',positionRail,{passive:true});positionRail();
  const crumbs=document.createElement('nav');crumbs.className='mjb-location-path';crumbs.setAttribute('aria-label','Your location');
  if(header)header.after(crumbs);else document.body.prepend(crumbs);
  function orient(){
    const r=record();
    panel.querySelectorAll('[aria-current]').forEach(a=>a.removeAttribute('aria-current'));
    panel.querySelectorAll('.mjb-current-ancestor').forEach(d=>d.classList.remove('mjb-current-ancestor'));
    if(r){
      panel.querySelectorAll('[data-nav-destination]').forEach(a=>{
        if(key(a.dataset.navDestination)!==key(r.alias||r.url))return;
        a.setAttribute('aria-current','page');
        let p=a.parentElement;
        while(p&&p!==panel){if(p.tagName==='DETAILS'){p.open=true;p.classList.add('mjb-current-ancestor');}p=p.parentElement;}
      });
      panel.querySelector('.mjb-nav-location').textContent='You are in '+r.path[0].label;
      opener.title='Navigation — '+r.path[0].label;
      const path=r.path.filter((x,i)=>!(i===0&&x.url==='/'));
      crumbs.innerHTML='<a href="/">Home</a>'+path.map((x,i)=>' <span aria-hidden="true">›</span> '+(i===path.length-1?'<span aria-current="page">'+esc(r.title)+'</span>':'<a href="'+esc(x.url)+'">'+esc(x.label)+'</a>')).join('');
      if(currentKey()==='/')crumbs.innerHTML='<span aria-current="page">Home</span>';
    } else {
      panel.querySelector('.mjb-nav-location').textContent='Choose a topic to explore';
      const h=document.querySelector('main h1,h1');
      crumbs.innerHTML='<a href="/">Home</a> <span aria-hidden="true">›</span> <span>'+esc(h?.textContent||'Explore')+'</span>';
    }
    document.querySelectorAll('#crumbs,main .crumbs').forEach(c=>c.hidden=true);
  }
  window.addEventListener('hashchange',()=>{if(dialog.open)dialog.close();orient();});
  window.addEventListener('popstate',orient);
  const main=document.querySelector('main');
  if(window.GUIDE&&main)new MutationObserver(orient).observe(main,{childList:true});
  applyPin();orient();root.classList.add('mjb-hierarchy-ready');
})();
