/* Shared reading preferences and user-initiated section speech. Uses device speech; some voices may use online services. */
(function () {
  'use strict';
  const root=document.documentElement, query=new URLSearchParams(location.search);
  const palettes={
    'purple-white':{name:'Obsidian · violet · white',bg:'#050306',panel:'#2b1244',raised:'#3b1b58',text:'#f3edf8',muted:'#c8bdd2',heading:'#f0d68d',link:'#b9d9ff'},
    'purple-green':{name:'Obsidian · violet · green',bg:'#050306',panel:'#2b1244',raised:'#3b1b58',text:'#7ee2a0',muted:'#a3cdb0',heading:'#f0d68d',link:'#b9d9ff'},
    ink:{name:'Ink · blue · white',bg:'#0c1117',panel:'#17212d',raised:'#223044',text:'#edf3fa',muted:'#bac8d8',heading:'#eddaa5',link:'#9bd3ff'},
    paper:{name:'Warm paper · dark ink',bg:'#faf6ed',panel:'#eee7d9',raised:'#e0d6c3',text:'#22212a',muted:'#4d4557',heading:'#62440b',link:'#164f86'},
    terminal:{name:'Terminal · green on black',bg:'#030805',panel:'#0b1b10',raised:'#153121',text:'#bbf4c6',muted:'#a0c8ad',heading:'#f3df94',link:'#a2dbff'},
    contrast:{name:'High contrast · white on black',bg:'#000000',panel:'#111111',raised:'#222222',text:'#ffffff',muted:'#e0e0e0',heading:'#fff0a8',link:'#a9ddff'}
  };
  let saved={};try{saved=JSON.parse(localStorage.getItem('mjb-reading')||'{}')||{};}catch(e){}
  const defaults={palette:'purple-white',vision:'standard',level:'min',font:'sans',size:100,spacing:'normal',measure:'normal',motion:false,bionic:false,rate:1,voice:'',custom:{},globalText:false};
  const prefs={...defaults,...saved,custom:{...(saved.custom||{})}};
  if(palettes[query.get('palette')]){prefs.palette=query.get('palette');prefs.custom={};}
  if(['min','medium','max'].includes(query.get('detail')))prefs.level=query.get('detail');
  if(!palettes[prefs.palette])prefs.palette=defaults.palette;
  if(!['standard','deuteranopia','protanopia','tritanopia','monochrome'].includes(prefs.vision))prefs.vision='standard';
  if(!['min','medium','max'].includes(prefs.level))prefs.level='min';
  const fonts={sans:'system-ui, -apple-system, Segoe UI, sans-serif',serif:'Georgia, Iowan Old Style, serif',mono:'ui-monospace, SFMono-Regular, Consolas, monospace'};
  const safeColour=c=>/^#[0-9a-f]{6}$/i.test(c||'');
  function save(){try{localStorage.setItem('mjb-reading',JSON.stringify(prefs));}catch(e){}}
  function colours(){return {...palettes[prefs.palette],...Object.fromEntries(Object.entries(prefs.custom).filter(([,v])=>safeColour(v)))};}
  function apply(){
    const c=colours(),light=prefs.palette==='paper';root.dataset.palette=prefs.palette;root.dataset.vision=prefs.vision;root.dataset.readingLevel=prefs.level;
    root.dataset.readingSpacing=prefs.spacing;root.dataset.readingMotion=prefs.motion?'reduced':'system';root.dataset.readingGlobal=prefs.globalText?'true':'false';
    const vars={'bg':c.bg,'bg2':c.panel,'bg3':c.raised,'bg4':c.raised,'surface':c.panel,'surface2':c.raised,'panel':c.panel,'void':c.bg,'ink':c.text,'ink2':c.text,'ink3':c.muted,'muted':c.muted,'panel-text':c.panelText||c.text,'head':c.heading,'gold':c.heading,'accent':c.heading,'accent-ink':light?c.bg:'#100a14','focus':c.heading,'sky':c.link,'reading-link':c.link,'line':light?'#9d91aa':'#76608b','line2':light?'#887890':'#9579ad','font':fonts[prefs.font]||fonts.sans,'reading-font':fonts[prefs.font]||fonts.sans,'reading-size':Math.max(90,Math.min(150,Number(prefs.size)||100))+'%','reading-measure':{narrow:'58ch',normal:'76ch',wide:'96ch'}[prefs.measure]||'76ch','measure':{narrow:'36rem',normal:'44rem',wide:'54rem'}[prefs.measure]||'44rem'};
    const signals=light?['#075540','#164f86','#62440b','#773469','#705300','#8d291d']:['#a3e4ce','#a6d7ff','#efd794','#ebb5df','#eee38f','#ffb8a5'];
    if(prefs.vision==='deuteranopia'||prefs.vision==='protanopia')signals.splice(0,6,...(light?['#164f86','#164f86','#62440b','#5c397e','#705300','#823e12']:['#add8ff','#add8ff','#ffdfa0','#ddc1ff','#ffdfa0','#ffd2b3']));
    if(prefs.vision==='tritanopia')signals.splice(0,6,...(light?['#145550','#145550','#754018','#7c2957','#754018','#7c2957']:['#b7e5dc','#b7e5dc','#ffd0af','#ffc0df','#ffd0af','#ffc0df']));
    if(prefs.vision==='monochrome')signals.fill(c.text);
    ['guidance','research','institution','patient','hypothesis','contested'].forEach((k,i)=>vars['l-'+k]=signals[i]);vars['l-missing']=c.muted;vars['l-finding']=c.text;
    Object.entries(vars).forEach(([k,v])=>root.style.setProperty('--'+k,v));root.style.colorScheme=light?'light':'dark';
    if(document.body){document.body.classList.toggle('bionic',!!prefs.bionic);if(prefs.motion)document.querySelectorAll('video').forEach(v=>v.pause());}
  }
  apply();
  let ui,toolbar,player,activeSection=null,paused=false,token=0,utterance=null,reading=null;
  const synth=window.speechSynthesis,players=new WeakMap();
  function stop(){token++;if(synth)synth.cancel();if(activeSection)activeSection.classList.remove('mjb-speaking');activeSection=null;paused=false;utterance=null;if(player)player.dataset.scrubbing='false';if(reading){reading.index=0;reading.offset=0;reading.complete=false;}updateSpeech();}
  function resetSpeech(){stop();if(player)player.hidden=true;player=null;reading=null;}
  function setText(el,text){if(el.textContent!==text)el.textContent=text;}
  const seconds=text=>text.trim()?text.trim().split(/\s+/).length/3/Math.max(.5,Math.min(2,Number(prefs.rate)||1)):0;
  const clock=n=>{n=Math.max(0,Math.round(n));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');};
  function position(index=reading?.index||0,offset=reading?.offset||0){return reading?seconds(reading.chunks.slice(0,index).join(' '))+seconds((reading.chunks[index]||'').slice(0,offset)):0;}
  function updateSpeech(message){
    if(!ui)return;const status=ui.querySelector('[data-speech-status]');setText(status,message||(activeSection?(paused?'Paused':'Reading: '+(reading?.title||'page')):'Ready to read a section'));
    setText(ui.querySelector('[data-pause]'),paused?'Resume':'Pause');ui.querySelector('[data-pause]').disabled=!activeSection;ui.querySelector('[data-stop]').disabled=!activeSection;
    if(!player||!reading)return;const total=seconds(reading.chunks.join(' ')),index=Math.min(reading.index,reading.chunks.length-1),slider=player.querySelector('[data-player-seek]');
    setText(player.querySelector('[data-player-status]'),message||(activeSection?(paused?'Paused':'Playing'):reading.complete?'Finished':'Ready'));
    setText(player.querySelector('[data-player-play]'),activeSection&&!paused?'Ⅱ Pause':reading.complete?'▶ Replay':paused?'▶ Resume':'▶ Play');
    player.querySelector('[data-player-play]').setAttribute('aria-label',(activeSection&&!paused?'Pause':reading.complete?'Replay':paused?'Resume':'Play')+' '+reading.title);
    player.querySelector('[data-player-stop]').disabled=!activeSection;player.querySelector('[data-player-rate]').value=prefs.rate;player.querySelector('[data-player-voice]').value=prefs.voice;
    slider.max=Math.max(0,reading.chunks.length-1);slider.disabled=reading.chunks.length<2;
    if(player.dataset.scrubbing!=='true'){slider.value=index;slider.setAttribute('aria-valuetext','Passage '+(index+1)+' of '+reading.chunks.length+', about '+clock(position()));setText(player.querySelector('[data-player-time]'),clock(reading.complete?total:position())+' / '+clock(total)+' · estimated');}
    player.querySelector('[data-player-back]').disabled=index===0;player.querySelector('[data-player-next]').disabled=index>=reading.chunks.length-1;
  }
  function textFor(section){
    const walker=document.createTreeWalker(section,NodeFilter.SHOW_TEXT),parts=[];
    while(walker.nextNode()){const n=walker.currentNode,p=n.parentElement;if(!p||p.closest('button:not(.chip),.mjb-section-audio,.mjb-reading-tools,.mjb-audio-player,.refs,.ref,script,style,[hidden],[data-reading-hidden="true"]'))continue;
      if(p.closest('details:not([open])')&&!p.closest('summary'))continue;
      const style=window.getComputedStyle(p);if(style.display==='none'||style.visibility==='hidden')continue;parts.push(n.nodeValue);
    }return parts.join(' ').replace(/\s+/g,' ').trim();
  }
  function playCurrent(){
    if(!reading||!synth)return;token++;synth.cancel();synth.resume();paused=false;activeSection=reading.section;activeSection.classList.add('mjb-speaking');reading.complete=false;
    const session=token,start=reading.offset;utterance=new SpeechSynthesisUtterance(reading.chunks[reading.index].slice(start));utterance.lang='en-GB';utterance.rate=Math.max(.5,Math.min(2,Number(prefs.rate)||1));
    const voice=synth.getVoices().find(v=>v.voiceURI===prefs.voice)||synth.getVoices().find(v=>v.lang==='en-GB')||synth.getVoices().find(v=>/^en/.test(v.lang));if(voice)utterance.voice=voice;
    utterance.onboundary=e=>{if(session!==token||paused||!Number.isFinite(e.charIndex))return;reading.offset=Math.min(reading.chunks[reading.index].length,start+e.charIndex);updateSpeech();};
    utterance.onend=()=>{if(session!==token||paused)return;reading.index++;reading.offset=0;if(reading.index<reading.chunks.length)playCurrent();else{activeSection.classList.remove('mjb-speaking');activeSection=null;utterance=null;reading.complete=true;updateSpeech();}};
    utterance.onerror=e=>{if(session!==token||e.error==='canceled'||e.error==='interrupted')return;stop();updateSpeech('This voice could not play. Try another voice.');};
    updateSpeech();synth.speak(utterance);
  }
  function toggleSpeech(){if(!reading)return;if(activeSection&&!paused){paused=true;token++;synth.cancel();utterance=null;updateSpeech();}else{if(reading.complete){reading.index=0;reading.offset=0;}playCurrent();}}
  function seek(index){if(!reading)return;const playing=!!activeSection&&!paused;token++;synth.cancel();utterance=null;reading.index=Math.max(0,Math.min(reading.chunks.length-1,Number(index)||0));reading.offset=0;reading.complete=false;if(playing)playCurrent();else updateSpeech();}
  const headingFor=section=>section.querySelector(':scope > h2,:scope > h3');
  function speak(section){
    if(!synth||!window.SpeechSynthesisUtterance){openSettings();updateSpeech('Read aloud is unavailable in this browser.');return;}
    if(section===reading?.section&&activeSection){toggleSpeech();return;}
    stop();const text=textFor(section);if(!text){openSettings();updateSpeech('No visible text in this section.');return;}
    if(player)player.hidden=true;player=makePlayer(section);player.hidden=false;
    const title=(section.tagName==='MAIN'?section.querySelector('h1'):headingFor(section))?.cloneNode(true);title?.querySelectorAll('button').forEach(b=>b.remove());
    const sentences=window.Intl?.Segmenter?[...new Intl.Segmenter('en',{granularity:'sentence'}).segment(text)].map(s=>s.segment):text.split(/(?<=[.!?])\s+(?=[A-Z"'“])/);
    const chunks=sentences.flatMap(s=>s.match(/.{1,220}(?:\s|$)|\S{1,220}/g)||[s]).map(s=>s.trim()).filter(Boolean);
    reading={section,title:title?.textContent.trim()||'this page',chunks,index:0,offset:0,complete:false};voices();playCurrent();
  }
  function makePlayer(section){
    let panel=players.get(section);if(panel?.isConnected)return panel;
    panel=document.createElement('div');panel.className='mjb-audio-player';panel.hidden=true;panel.setAttribute('role','group');panel.setAttribute('aria-label','Section audio controls');
    panel.innerHTML='<div class="mjb-player-transport"><button type="button" data-player-play>▶ Play</button><button type="button" data-player-back aria-label="Previous passage">⏮</button><button type="button" data-player-next aria-label="Next passage">⏭</button><button type="button" data-player-stop>■ Stop</button><span data-player-status role="status" aria-live="polite">Ready</span></div><label class="mjb-player-position">Position in section<input type="range" data-player-seek min="0" max="0" step="1" value="0"><span data-player-time>0:00 · estimated</span></label><details class="mjb-player-options"><summary>Speed & voice</summary><div class="mjb-settings-grid"><label>Speed<select data-player-rate>'+[.5,.75,1,1.25,1.5,1.75,2].map(r=>'<option value="'+r+'">'+r+'×</option>').join('')+'</select></label><label>Voice<select data-player-voice></select></label></div><p>Move the slider to a passage. Times are estimates and vary by voice. Pause resumes at the last reported word; voices without word positions repeat the current passage.</p></details>';
    const anchor=section.tagName==='MAIN'?section.querySelector('.mjb-reading-tools'):headingFor(section);if(anchor)anchor.after(panel);else section.prepend(panel);
    panel.querySelector('[data-player-play]').onclick=()=>{if(reading?.section!==section)speak(section);else toggleSpeech();};panel.querySelector('[data-player-stop]').onclick=stop;
    panel.querySelector('[data-player-back]').onclick=()=>seek(reading.index-1);panel.querySelector('[data-player-next]').onclick=()=>seek(reading.index+1);
    panel.querySelector('[data-player-seek]').oninput=e=>{if(reading?.section!==section)return;panel.dataset.scrubbing='true';const index=Number(e.target.value);e.target.setAttribute('aria-valuetext','Passage '+(index+1)+' of '+reading.chunks.length+', about '+clock(position(index,0)));panel.querySelector('[data-player-time]').textContent=clock(position(index,0))+' / '+clock(seconds(reading.chunks.join(' ')))+' · estimated';};panel.querySelector('[data-player-seek]').onchange=e=>{panel.dataset.scrubbing='false';seek(e.target.value);};panel.querySelector('[data-player-seek]').onblur=()=>{panel.dataset.scrubbing='false';updateSpeech();};
    ['rate','voice'].forEach(key=>panel.querySelector('[data-player-'+key+']').onchange=e=>{prefs[key]=key==='rate'?Number(e.target.value):e.target.value;save();sync();if(activeSection&&!paused)playCurrent();else updateSpeech();});players.set(section,panel);return panel;
  }
  function voices(){if(!ui)return;const list=synth?synth.getVoices():[];const selects=[ui.querySelector('[name="voice"]'),...document.querySelectorAll('[data-player-voice]')];
    list.sort((a,b)=>Number(!/^en/.test(a.lang))-Number(!/^en/.test(b.lang))||a.name.localeCompare(b.name));selects.forEach(select=>{select.replaceChildren(new Option('Device default (English preferred)',''));list.forEach(v=>select.add(new Option(v.name+' · '+v.lang+(v.localService?' · device voice':''),v.voiceURI)));select.value=prefs.voice;if(select.selectedIndex<0)select.value='';});}
  function contrast(a,b){function lum(s){const v=s.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2];}const x=lum(a.slice(1)),y=lum(b.slice(1));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  function sync(){if(!ui)return;ui.querySelectorAll('[name]').forEach(e=>{if(!(e.name in prefs))return;if(e.type==='checkbox')e.checked=!!prefs[e.name];else e.value=prefs[e.name];});const c=colours();ui.querySelectorAll('[data-colour]').forEach(e=>e.value=c[e.dataset.colour]||c.text);const body=contrast(c.text,c.bg),panel=contrast(c.panelText||c.text,c.panel);ui.querySelector('[data-contrast]').textContent='Text contrast: page '+body.toFixed(1)+':1 · boxes '+panel.toFixed(1)+':1'+(Math.min(body,panel)<4.5?' — this combination may be hard to read.':'');}
  function setLevel(level){if(!['min','medium','max'].includes(level))return;resetSpeech();prefs.level=level;apply();save();refresh();}
  function openSettings(){if(!ui)return;sync();voices();if(!ui.open)ui.showModal();}
  function bionic(scope){if(!prefs.bionic)return;scope.querySelectorAll('p,li').forEach(el=>{if(el.dataset.bionic==='1'||el.closest('.mjb-reading-tools'))return;const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(n=>{if(n.parentElement.closest('a,button,code,pre,.b-half'))return;const frag=document.createDocumentFragment();n.nodeValue.split(/(\s+)/).forEach(w=>{if(!w.trim()){frag.append(w);return;}const span=document.createElement('span'),bold=document.createElement('span');bold.className='b-half';const cut=Math.max(1,Math.ceil(w.length/3));bold.textContent=w.slice(0,cut);span.append(bold,w.slice(cut));frag.append(span);});n.replaceWith(frag);});el.dataset.bionic='1';});}
  function refresh(){
    const main=document.querySelector('main');if(!main||!ui)return;
    if(!main.querySelector('.mjb-reading-tools')){toolbar=document.createElement('div');toolbar.className='mjb-reading-tools';toolbar.innerHTML='<div role="group" aria-label="Amount of detail"><span>Detail</span>'+['min','medium','max'].map(x=>'<button type="button" data-reading-level="'+x+'">'+(x==='medium'?'Medium':x==='min'?'Min':'Max')+'</button>').join('')+'</div><button type="button" data-reading-settings>Reading & audio</button>';const title=main.querySelector('h1');if(title)title.after(toolbar);else main.prepend(toolbar);}
    main.querySelectorAll('[data-reading-level]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.readingLevel===prefs.level)));
    const level={min:1,medium:2,max:3}[prefs.level];main.querySelectorAll('[data-reading-detail]').forEach(e=>{const hide=Number(e.dataset.readingDetail)>level;e.hidden=hide;e.dataset.readingHidden=String(hide);});
    if(!window.GUIDE&&!main.dataset.sectioned){const scope=main.querySelector('.article-body')||main;const headings=[...scope.querySelectorAll(':scope > h2')];headings.forEach((h,i)=>{if(h.closest('.mjb-reading-section'))return;const section=document.createElement('section');section.className='mjb-reading-section';h.before(section);section.append(h);while(section.nextSibling&&!(section.nextSibling.nodeType===1&&section.nextSibling.tagName==='H2'))section.append(section.nextSibling);});main.dataset.sectioned='1';}
    main.querySelectorAll('[data-guide-layer]:not([data-detail-ready])').forEach(section=>{const n=Number(section.dataset.guideLayer),amount=n===2||n===4?2:n>=5?3:1;[...section.children].filter(e=>e.tagName!=='H2').forEach((e,i)=>{e.dataset.readingDetail=String(e.matches('.callout-warn,.claim[data-label="hypothesis"],.claim[data-label="contested"],.claim[data-label="missing"]')||amount===1||(amount===2&&i===0&&e.tagName==='P')?1:amount);});if(amount>1){const b=document.createElement('button');b.type='button';b.className='mjb-detail-hint';b.dataset.detailHint=String(amount);b.textContent='Show '+(amount===3?'Max':'Medium')+' detail in this section';section.append(b);}section.dataset.detailReady='1';});
    main.querySelectorAll('.mjb-reading-section:not([data-detail-ready])').forEach((section,index)=>{
      const h=section.querySelector('h2'),source=/(sources|references|bibliography)/i.test(h.textContent),advanced=/(molecular|in depth|technical detail|deeper|fine detail)/i.test(h.textContent),simple=index===0||document.body.dataset.page==='home'||/(what .*do|next action|try one|question|scope|limits|what this evidence|uncertain|needs distinguishing|does not|attention is only)/i.test(h.textContent);
      const amount=source||advanced?3:simple?1:2;
      if(amount>1){[...section.children].filter(e=>e!==h).forEach((e,i)=>e.dataset.readingDetail=String(e.matches('.callout-warn,.claim,.atlas-warn,.safety-urgent')||/emergency help|in immediate danger|difficulty breathing|call (999|111)/i.test(e.textContent)||(amount===2&&i===0&&e.tagName==='P')?1:amount));const b=document.createElement('button');b.type='button';b.className='mjb-detail-hint';b.dataset.detailHint=String(amount);b.textContent=source?'Show sources':'Show '+(amount===3?'Max':'Medium')+' detail in this section';section.append(b);}section.dataset.detailReady='1';
    });
    main.querySelectorAll('[data-reading-detail]').forEach(e=>{const hide=Number(e.dataset.readingDetail)>level;e.hidden=hide;e.dataset.readingHidden=String(hide);});
    main.querySelectorAll('.mjb-reading-section,.layer,section').forEach(section=>{const h=headingFor(section);if(!h||h.querySelector('.mjb-section-audio'))return;const b=document.createElement('button');b.className='mjb-section-audio';b.type='button';b.textContent='▶ Listen';b.setAttribute('aria-label','Read aloud: '+h.textContent.trim());b.addEventListener('click',()=>speak(section));h.append(b);if(!synth||!window.SpeechSynthesisUtterance){b.disabled=true;b.title='Read aloud is unavailable in this browser.';}});
    main.querySelectorAll('[data-detail-hint]').forEach(b=>b.hidden=level>=Number(b.dataset.detailHint));bionic(main);sync();
  }
  function init(){
    if(palettes[query.get('palette')])save();
    apply();ui=document.createElement('dialog');ui.id='mjb-reading-settings';ui.className='mjb-reading-settings';ui.setAttribute('aria-labelledby','mjb-settings-title');
    ui.innerHTML='<div class="mjb-settings-head"><h2 id="mjb-settings-title">Make this easier to read</h2><button type="button" data-close-settings>Close</button></div><div class="mjb-settings-grid"><label>Colour profile<select name="palette">'+Object.entries(palettes).map(([id,p])=>'<option value="'+id+'">'+p.name+'</option>').join('')+'</select></label><label>Colour vision palette<select name="vision"><option value="standard">Standard</option><option value="deuteranopia">Deuteranopia · blue / amber</option><option value="protanopia">Protanopia · blue / amber</option><option value="tritanopia">Tritanopia · teal / rose</option><option value="monochrome">Monochrome labels</option></select></label><label>Text size<select name="size"><option value="100">100%</option><option value="110">110%</option><option value="125">125%</option><option value="150">150%</option></select></label><label>Reading font<select name="font"><option value="sans">Clear sans serif</option><option value="serif">Book serif</option><option value="mono">Monospace</option></select></label><label>Spacing<select name="spacing"><option value="normal">Comfortable</option><option value="roomy">More space</option></select></label><label>Line width<select name="measure"><option value="narrow">Narrow</option><option value="normal">Standard</option><option value="wide">Wide</option></select></label></div><div class="mjb-setting-checks"><label><input type="checkbox" name="motion"> Reduce motion</label><label><input type="checkbox" name="bionic"> Bold word beginnings</label></div><details><summary>Choose your own colours</summary><div class="mjb-settings-grid">'+[['text','Page text'],['panelText','Text in boxes and menus'],['bg','Page background'],['panel','Box / menu background'],['heading','Headers and accents'],['link','Links']].map(([key,label])=>'<label>'+label+'<input type="color" data-colour="'+key+'"></label>').join('')+'</div><label><input type="checkbox" name="globalText"> Use page text colour everywhere</label><p data-contrast role="status"></p></details><section class="mjb-audio-options"><h3>Read aloud</h3><p>Choose Listen beside a section. Only its visible text is read. Voices depend on your device; some voices use an online speech service.</p><div class="mjb-settings-grid"><label>Voice<select name="voice"></select></label><label>Speed<select name="rate">'+[.5,.75,1,1.25,1.5,1.75,2].map(r=>'<option value="'+r+'">'+r+'×</option>').join('')+'</select></label></div><div class="mjb-audio-actions"><button type="button" data-read-page>Read this page</button><button type="button" data-pause disabled>Pause</button><button type="button" data-stop disabled>Stop</button></div><p data-speech-status role="status" aria-live="polite">Ready to read a section</p></section><p class="mjb-settings-note">Your choices are remembered on this device. Evidence types also use words and border styles.</p><button type="button" data-reset>Reset reading settings</button>';
    document.body.append(ui);ui.querySelector('[data-close-settings]').onclick=()=>ui.close();ui.addEventListener('click',e=>{if(e.target===ui){const r=ui.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)ui.close();}});
    document.addEventListener('click',e=>{const b=e.target.closest('button[data-reading-settings],button[data-reading-level],button[data-detail-hint]');if(!b)return;if(b.hasAttribute('data-reading-settings'))openSettings();else if(b.dataset.detailHint)setLevel(Number(b.dataset.detailHint)===3?'max':'medium');else setLevel(b.dataset.readingLevel);});
    ui.addEventListener('change',e=>{const el=e.target;if(el.dataset.colour){prefs.custom[el.dataset.colour]=el.value;}else if(el.name in prefs){prefs[el.name]=el.type==='checkbox'?el.checked:el.value;if(el.name==='palette')prefs.custom={};}apply();save();refresh();if((el.name==='voice'||el.name==='rate')&&activeSection&&!paused)playCurrent();else updateSpeech();});
    ui.querySelector('[data-reset]').onclick=()=>{resetSpeech();Object.assign(prefs,defaults,{custom:{}});apply();save();refresh();};ui.querySelector('[data-read-page]').onclick=()=>{speak(document.querySelector('main'));ui.close();player?.scrollIntoView({block:'center',behavior:prefs.motion?'instant':'smooth'});};ui.querySelector('[data-stop]').onclick=stop;ui.querySelector('[data-pause]').onclick=toggleSpeech;
    if(!synth||!window.SpeechSynthesisUtterance){ui.querySelector('[data-read-page]').disabled=true;updateSpeech('Read aloud is unavailable in this browser.');}else{synth.addEventListener('voiceschanged',voices);voices();}
    window.addEventListener('hashchange',()=>{resetSpeech();const id=decodeURIComponent(location.hash.slice(1));const target=document.getElementById(id);if(target?.closest('[data-reading-hidden="true"]')){setLevel(Number(target.closest('[data-reading-hidden="true"]').dataset.readingDetail)===3?'max':'medium');target.scrollIntoView({block:'start'});}});window.addEventListener('pagehide',resetSpeech);window.addEventListener('storage',e=>{if(e.key!=='mjb-reading')return;try{resetSpeech();Object.assign(prefs,defaults,JSON.parse(e.newValue||'{}'));apply();refresh();}catch(err){}});
    const main=document.querySelector('main');if(main)new MutationObserver(()=>{clearTimeout(init.timer);init.timer=setTimeout(refresh,0);}).observe(main,{childList:true});refresh();
  }
  window.MJBReading={prefs,palettes,setLevel,refresh,openSettings,contrast,textFor,stop};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
