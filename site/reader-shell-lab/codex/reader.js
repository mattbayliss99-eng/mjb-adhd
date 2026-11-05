(()=>{
'use strict';
const data=JSON.parse(document.getElementById('reader-data').textContent);
const $=id=>document.getElementById(id), key='mjb-shell-codex-v1';
const presets={gold:{base:'#0c0e11',primary:'#d4b370',secondary:'#b5abd2'},purple:{base:'#15101f',primary:'#baa3e0',secondary:'#9ad0b6'},paper:{base:'#f1ece2',primary:'#64420c',secondary:'#345b84'}};
const defaults={mode:'split',orientation:'auto',ratio:43,scale:1,theme:'gold',colours:presets.gold,logo:'match',linked:true,auto:false,reduced:matchMedia('(prefers-reduced-motion:reduce)').matches,plain:false,always:false};
let state={prefs:structuredClone(defaults),saved:{},progress:{}};
let draft=null,post=data.posts[0],step=0,visual=0,manual=false,playing=false,timer=null,focusBefore=null;
function announce(s){$('status').textContent=s;}
function hex(s){return typeof s==='string'&&/^#[0-9a-f]{6}$/i.test(s);}
function cleanPrefs(p){
 const n=structuredClone(defaults);if(!p||typeof p!=='object')return n;
 for(const k of ['linked','auto','reduced','plain','always'])if(typeof p[k]==='boolean')n[k]=p[k];
 if(['split','continuous','thread'].includes(p.mode))n.mode=p.mode;
 if(['auto','vertical'].includes(p.orientation))n.orientation=p.orientation;
 if([1,1.25,1.5,2].includes(p.scale))n.scale=p.scale;
 if(Number.isFinite(p.ratio))n.ratio=Math.min(70,Math.max(25,p.ratio));
 if(['gold','purple','paper','custom'].includes(p.theme))n.theme=p.theme;
 if(['match','gold','purple','cyan','mono'].includes(p.logo))n.logo=p.logo;
 if(p.colours&&['base','primary','secondary'].every(k=>hex(p.colours[k])))n.colours={base:p.colours.base,primary:p.colours.primary,secondary:p.colours.secondary};
 else n.colours=structuredClone(presets[n.theme]||presets.gold);
 return n;
}
function load(){try{
 const p=JSON.parse(localStorage.getItem(key)||'null');if(!p||p.schema!==1)return;
 state.prefs=cleanPrefs(p.prefs);
 for(const d of data.posts){const s=p.saved?.[d.id],r=p.progress?.[d.id];
  if(s&&typeof s==='object'&&typeof s.step==='string'&&d.steps.some(t=>t.id===s.step))state.saved[d.id]={step:s.step};
  if(typeof r==='string'&&d.steps.some(t=>t.id===r))state.progress[d.id]=r;
 }
}catch{announce('Local data unavailable; this visit still works.');}}
function persist(){try{localStorage.setItem(key,JSON.stringify({schema:1,...state}));return true;}catch{announce('Could not save on this device. Your current visit still works.');return false;}}
function lum(h){const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
function contrast(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
function mix(a,b,n){return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-n)+parseInt(b.slice(i,i+2),16)*n).toString(16).padStart(2,'0')).join('');}
function appearance(p){
 const root=document.documentElement,c=p.colours,light=contrast(c.base,'#111111')>contrast(c.base,'#f5f1e8');
 const ink=light?'#111111':'#f5f1e8',surface=mix(c.base,light?'#ffffff':'#ffffff',light?.5:.035),raised=mix(surface,ink,.035);
 const readable=(value,bg,min=4.5)=>contrast(value,bg)>=min?value:ink;
 const primary=readable(c.primary,surface),secondary=readable(c.secondary,surface),muted=readable(mix(ink,surface,.27),surface);
 const vars={base:c.base,surface,raised,ink,muted,primary,secondary,line:mix(surface,ink,.18),'accent-ink':contrast(primary,'#111111')>contrast(primary,'#ffffff')?'#111111':'#ffffff'};
 for(const [k,v] of Object.entries(vars))root.style.setProperty('--'+k,v);
 root.style.setProperty('--scale',String(p.scale));root.style.colorScheme=light?'light':'dark';
 document.body.classList.toggle('reduced',p.reduced);document.body.classList.toggle('plain',p.plain);
 const logo={gold:'#d4b370',purple:'#baa3e0',cyan:'#8dd7e5',mono:ink}[p.logo]||primary;
 document.querySelector('.monogram').style.color=readable(logo,c.base,3);
 document.querySelector('.monogram').style.borderColor=readable(logo,c.base,3);
 if(p.always)document.body.classList.remove('header-retreated');
 $('contrast-note').textContent=(primary!==c.primary||secondary!==c.secondary)?'One or more accents were adapted to maintain readable contrast.':'Foregrounds adapt to the base colour. Presets and custom accents are contrast-checked.';
}
function activePrefs(){return draft||state.prefs;}
function mode(){const p=activePrefs();return p.scale>=2||innerHeight<550?'continuous':p.mode;}
function geometry(){const p=activePrefs(),horizontal=innerWidth>=900&&p.orientation==='auto';
 $('reader').dataset.mode=mode();$('reader').dataset.orientation=horizontal?'horizontal':'vertical';
 document.documentElement.style.setProperty('--ratio-a',p.ratio+'fr');document.documentElement.style.setProperty('--ratio-b',(100-p.ratio)+'fr');
 $('divider').setAttribute('aria-orientation',horizontal?'vertical':'horizontal');$('divider').setAttribute('aria-valuenow',String(Math.round(p.ratio)));
 $('space-note').textContent=mode()!==p.mode?'Article view for available space':'';
}
function el(tag,txt,cls){const e=document.createElement(tag);if(txt!=null)e.textContent=txt;if(cls)e.className=cls;return e;}
function pblock(s,container,heading=true){if(heading)container.append(el('h2',s.title));container.append(el('p',s.body));if(s.qualification)container.append(el('p',s.qualification,'qualification'));}
function renderExplanation(){const box=$('explanation'),m=mode();box.replaceChildren();
 if(m==='split')pblock(post.steps[step],box);
 else for(const [i,s] of post.steps.entries()){
  const block=el(m==='thread'?'details':'section',null,m==='thread'?'thread-block':'');block.id='view-'+s.id;
  if(m==='thread'){block.open=i===step;block.append(el('summary',s.title));pblock(s,block,false);}else{block.append(el('span',s.label,'eyebrow'));pblock(s,block);}
  const b=el('button','＋ Supporting context','inline-evidence');b.type='button';b.addEventListener('click',()=>openEvidence(i));block.append(b);box.append(block);
 }
 $('depth-label').textContent=mode()==='split'?post.steps[step].label:'THE EXPLANATION';
 $('step-count').textContent=`${step+1} / ${post.steps.length} · ${post.steps[step].label}`;
 $('previous').disabled=step===0;$('next').textContent=step===post.steps.length-1?'✓':'→';$('next').setAttribute('aria-label',step===post.steps.length-1?'Finish this explanation':'Next explanation');
 $('dots').replaceChildren();post.steps.forEach((s,i)=>{const b=el('button',null,'dot');b.type='button';b.setAttribute('aria-label','Open explanation '+(i+1));if(i===step)b.setAttribute('aria-current','step');b.addEventListener('click',()=>goStep(i,true));$('dots').append(b);});
}
function renderVisual(){const v=data.visuals[visual];$('visual').src='assets/'+v.file;$('visual').alt=v.alt;$('visual-title').textContent=v.title;$('visual-count').textContent=`${visual+1} / ${data.visuals.length}`;$('resume').hidden=!manual;
 $('cycle').hidden=!state.prefs.auto;$('cycle').disabled=state.prefs.reduced;$('cycle').textContent=playing?'Ⅱ':'▷';$('cycle').setAttribute('aria-label',playing?'Pause visual sequence':'Play visual sequence');
}
function updateURL(push=false){const url=new URL(location.href);url.searchParams.set('post',post.id);url.searchParams.set('step',post.steps[step].id);history[push?'pushState':'replaceState']({post:post.id,step:post.steps[step].id},'',url);}
function render(){appearance(activePrefs());geometry();$('post-title').textContent=post.title;$('anchor-copy').textContent=post.anchor;$('topic-label').textContent=post.topic;renderExplanation();renderVisual();const saved=Boolean(state.saved[post.id]);$('favourite').textContent=saved?'★':'☆';$('favourite').setAttribute('aria-pressed',String(saved));$('favourite').setAttribute('aria-label',saved?'Remove post from favourites':'Save this post');}
function goStep(index,focus=false){stopCycle();step=Math.min(post.steps.length-1,Math.max(0,index));state.progress[post.id]=post.steps[step].id;
 if(state.saved[post.id])state.saved[post.id].step=post.steps[step].id;
 if(!manual&&state.prefs.linked){const n=data.visuals.findIndex(v=>v.id===post.steps[step].visualId);if(n>=0)visual=n;}
 persist();render();updateURL();$('explanation').closest('.lower').scrollTop=0;
 if(focus){const target=mode()==='split'?$('explanation'):$('view-'+post.steps[step].id);target?.scrollIntoView({block:'nearest',behavior:'instant'});if(target){if(!target.hasAttribute('tabindex'))target.tabIndex=-1;target.focus({preventScroll:true});}}
}
function choose(id,push=false,requested=null){stopCycle();post=data.posts.find(p=>p.id===id)||data.posts[0];const desired=requested||state.progress[post.id];step=Math.max(0,post.steps.findIndex(s=>s.id===desired));visual=Math.max(0,data.visuals.findIndex(v=>v.id===post.steps[step].visualId));manual=false;render();updateURL(push);}
function route(){const u=new URL(location.href);choose(u.searchParams.get('post'),false,u.searchParams.get('step'));}
function openSheet(id){stopCycle();focusBefore=document.activeElement;document.body.classList.remove('header-retreated');$(id).showModal();}
for(const d of document.querySelectorAll('dialog'))d.addEventListener('close',()=>{if(d.id==='controls'&&draft){draft=null;render();}focusBefore?.focus({preventScroll:true});});
function openEvidence(index=step){const s=post.steps[index],box=$('evidence-content');box.replaceChildren();box.append(el('p',s.title,'eyebrow'),el('p',s.support,'evidence-copy'));for(const id of s.sourceIds){const src=data.sources.find(s=>s.id===id);if(!src)continue;const card=el('section',null,'source-card');card.append(el('span',src.type,'source-kind'));const a=el('a',src.title);a.href=src.url;a.target='_blank';a.rel='noopener noreferrer';card.append(a,el('p',src.date+' · '+(s.sourceLocator||src.locator)),el('p',src.limit));box.append(card);}openSheet('evidence-sheet');}
function openTopics(){const list=$('topic-list');list.replaceChildren();for(const [i,p] of data.posts.entries()){const b=el('button',null,'topic-card');b.type='button';b.append(el('span',`${String(i+1).padStart(2,'0')} / ${p.topic}`,'eyebrow'),el('strong',p.title),el('small',(state.saved[p.id]?'★ Saved · ':'')+p.steps.length+' explanations'));b.addEventListener('click',()=>{$('topics-sheet').close();choose(p.id,true);});list.append(b);}openSheet('topics-sheet');}
function syncSettings(){const p=draft;$('ratio').value=p.ratio;$('ratio-output').value=Math.round(p.ratio)+'%';$('orientation').value=p.orientation;$('text-size').value=String(p.scale);$('base-colour').value=p.colours.base;$('primary-colour').value=p.colours.primary;$('secondary-colour').value=p.colours.secondary;$('logo-colour').value=p.logo;
 for(const [id,k] of [['linked','linked'],['auto-visual','auto'],['reduced','reduced'],['plain','plain'],['always','always']])$(id).checked=p[k];
 for(const b of document.querySelectorAll('[data-mode]'))if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(b.dataset.mode===p.mode));
 $('split-settings').hidden=p.mode!=='split';
}
function openSettings(){draft=structuredClone(state.prefs);syncSettings();openSheet('controls');}
function preview(){appearance(draft);geometry();renderExplanation();syncSettings();}
function stopCycle(){playing=false;if(timer)clearInterval(timer);timer=null;if($('cycle'))renderVisual();}
function playCycle(){if(!state.prefs.auto||state.prefs.reduced)return;playing=true;renderVisual();timer=setInterval(()=>{if(document.hidden||document.querySelector('dialog[open]')){stopCycle();return;}visual=(visual+1)%data.visuals.length;renderVisual();},10000);}
$('cycle').addEventListener('click',()=>playing?stopCycle():playCycle());
for(const [id,delta] of [['visual-prev',-1],['visual-next',1]])$(id).addEventListener('click',()=>{stopCycle();manual=true;visual=(visual+delta+data.visuals.length)%data.visuals.length;renderVisual();});
$('resume').addEventListener('click',()=>{manual=false;visual=Math.max(0,data.visuals.findIndex(v=>v.id===post.steps[step].visualId));renderVisual();});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#cycle'))stopCycle();},{passive:true});document.addEventListener('focusin',e=>{if(!e.target.closest('#cycle'))stopCycle();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCycle();});
$('topics').addEventListener('click',openTopics);$('favourite').addEventListener('click',()=>{const old=structuredClone(state.saved);if(state.saved[post.id])delete state.saved[post.id];else state.saved[post.id]={step:post.steps[step].id};if(!persist()){state.saved=old;render();return;}render();announce(state.saved[post.id]?'Saved on this device':'Removed from favourites');});
$('previous').addEventListener('click',()=>goStep(step-1,true));$('next').addEventListener('click',()=>step===post.steps.length-1?openTopics():goStep(step+1,true));$('evidence').addEventListener('click',()=>openEvidence());
for(const id of ['settings','layout-shortcut'])$(id).addEventListener('click',openSettings);
for(const b of document.querySelectorAll('button[data-mode]'))b.addEventListener('click',()=>{draft.mode=b.dataset.mode;preview();});
for(const b of document.querySelectorAll('[data-ratio]'))b.addEventListener('click',()=>{draft.ratio=Number(b.dataset.ratio);preview();});
for(const b of document.querySelectorAll('[data-theme]'))b.addEventListener('click',()=>{draft.theme=b.dataset.theme;draft.colours=structuredClone(presets[draft.theme]);preview();});
$('ratio').addEventListener('input',()=>{draft.ratio=Number($('ratio').value);geometry();$('ratio-output').value=draft.ratio+'%';});
for(const id of ['orientation','text-size','logo-colour','linked','auto-visual','reduced','plain','always','base-colour','primary-colour','secondary-colour'])$(id).addEventListener('change',()=>{
 draft.orientation=$('orientation').value;draft.scale=Number($('text-size').value);draft.logo=$('logo-colour').value;
 for(const [id,k] of [['linked','linked'],['auto-visual','auto'],['reduced','reduced'],['plain','plain'],['always','always']])draft[k]=$(id).checked;
 draft.colours={base:$('base-colour').value,primary:$('primary-colour').value,secondary:$('secondary-colour').value};preview();
});
$('reset').addEventListener('click',()=>{draft=structuredClone(defaults);preview();});$('cancel-settings').addEventListener('click',()=>{$('controls').close();});$('apply-settings').addEventListener('click',()=>{state.prefs=cleanPrefs(draft);draft=null;persist();render();$('controls').close();});
let drag=null;const divider=$('divider');
divider.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,moved:false};divider.setPointerCapture(e.pointerId);});
divider.addEventListener('pointermove',e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)drag.moved=true;if(!drag.moved||mode()!=='split')return;const r=$('reader').getBoundingClientRect(),side=$('reader').dataset.orientation==='horizontal';state.prefs.ratio=Math.min(70,Math.max(25,100*(side?e.clientX-r.left:e.clientY-r.top)/(side?r.width:r.height)));geometry();});
divider.addEventListener('pointerup',()=>{if(!drag)return;const moved=drag.moved;drag=null;if(moved)persist();else openSettings();});divider.addEventListener('pointercancel',()=>{drag=null;});
divider.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openSettings();}else if(['ArrowUp','ArrowLeft','ArrowDown','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();state.prefs.ratio=e.key==='Home'?30:e.key==='End'?65:Math.min(70,Math.max(25,state.prefs.ratio+(['ArrowUp','ArrowLeft'].includes(e.key)?-3:3)));geometry();persist();}});
let oldScroll=0;document.querySelector('.lower').addEventListener('scroll',e=>{const y=e.target.scrollTop,delta=y-oldScroll;oldScroll=y;if(state.prefs.always||document.querySelector('dialog[open]')||document.querySelector('.topbar').contains(document.activeElement))return;if(y<20||delta<-4)document.body.classList.remove('header-retreated');else if(delta>4)document.body.classList.add('header-retreated');},{passive:true});
document.querySelector('.topbar').addEventListener('focusin',()=>document.body.classList.remove('header-retreated'));
addEventListener('resize',()=>{geometry();renderExplanation();});addEventListener('popstate',route);load();route();
})();
