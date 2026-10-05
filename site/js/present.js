(function(){
  if(window.__mjbPresent) return;
  window.__mjbPresent=true;
  const btn=document.createElement("button");
  btn.type="button";
  btn.className="bionic-btn";
  /* No aria-pressed: the visible label already swaps to the next action ("Normal reading"),
     and pressed + a swapped label announced a contradictory state. */
  btn.textContent="Easier reading";
  function split(el){
    if(el.dataset.bionic==="1") return;
    const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null);
    const nodes=[];
    while(walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(n=>{
      if(!n.nodeValue || !n.nodeValue.trim()) return;
      if(n.parentElement.closest("a,code,pre,h1,h2,h3,button,nav")) return;
      const frag=document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(tok=>{
        if(/^\s+$/.test(tok)){frag.appendChild(document.createTextNode(tok));return;}
        const cut=Math.max(1,Math.ceil(tok.length*0.4));
        const s=document.createElement("span");
        const b=document.createElement("span");
        b.className="b-half";
        b.textContent=tok.slice(0,cut);
        s.appendChild(b);
        s.appendChild(document.createTextNode(tok.slice(cut)));
        frag.appendChild(s);
      });
      n.parentNode.replaceChild(frag,n);
    });
    el.dataset.bionic="1";
  }
  btn.addEventListener("click",()=>{
    const on=document.body.classList.toggle("bionic");
    btn.textContent=on?"Normal reading":"Easier reading";
    if(on) document.querySelectorAll("main p, main li").forEach(split);
  });
  document.body.appendChild(btn);

  /* Page tools dock (a11y pass 0.6.5). The three fixed controls used to float
     separately over article text on phones. They now sit in one opaque bar;
     its measured height (--mjb-dock-h) feeds footer padding and
     scroll-padding-bottom in sleek.css, so the page end and keyboard focus
     stay clear of it. Without JS only .home-btn exists and keeps its old
     fixed position. */
  if(!document.querySelector(".mjb-dock")){
    const dock=document.createElement("nav");
    dock.className="mjb-dock";
    dock.setAttribute("aria-label","Page tools");
    [document.getElementById("guide-open"),btn,document.querySelector(".home-btn")].forEach(el=>{if(el) dock.appendChild(el);});
    document.body.appendChild(dock);
    const root=document.documentElement;
    root.classList.add("has-mjb-dock");
    let last=0;
    const measure=()=>{const h=Math.ceil(dock.getBoundingClientRect().height);if(h&&h!==last){last=h;root.style.setProperty("--mjb-dock-h",h+"px");}};
    measure();
    if(window.ResizeObserver) new ResizeObserver(measure).observe(dock); else window.addEventListener("resize",measure);
  }
})();
