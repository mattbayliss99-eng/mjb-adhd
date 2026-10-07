/* MJB Guidebook runtime — vanilla JS, no dependencies.
   Reads window.GUIDE (built by tools/build.mjs). Hash routing so it works on any static host,
   from file://, or inside an <iframe>. */
(function () {
  'use strict';
  const G = window.GUIDE;
  if (!G) { document.getElementById('main').innerHTML = '<p>Guide data missing (guide-data.js).</p>'; return; }
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const byId = Object.fromEntries(G.pages.map(p => [p.id, p]));
  const byRoute = Object.fromEntries(G.pages.map(p => [p.route, p]));
  const srcById = Object.fromEntries(G.sources.map(s => [s.id, s]));
  const ENT = G.site.entrances; // [{id,title,question,blurb}]
  const entTitle = id => (ENT.find(e => e.id === id) || {}).title || id;
  const main = $('#main'), rail = $('#rail'), drawer = $('#drawer'), overlay = $('#overlay'), preview = $('#preview');
  const layout = $('.layout');
  const store = {
    get(k, d) { try { const v = sessionStorage.getItem('mjbg:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { sessionStorage.setItem('mjbg:' + k, JSON.stringify(v)); } catch { } },
    lget(k, d) { try { const v = localStorage.getItem('mjbg:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    lset(k, v) { try { localStorage.setItem('mjbg:' + k, JSON.stringify(v)); } catch { } }
  };
  const mem = { trail: store.get('trail', []), seen: store.get('seen', {}), depth: store.lget('depth', 1), labels: store.lget('labels', true) };

  // ---------- embed + theme ----------
  const qs = new URLSearchParams(location.search);
  if (qs.get('embed') === '1') document.documentElement.classList.add('embed');
  const themeSel = $('#theme');
  const hostTheme = document.documentElement.getAttribute('data-theme');
  const setTheme = t => {
    const root = document.documentElement;
    if (t === 'auto') { if (hostTheme && hostTheme !== 'auto') root.setAttribute('data-theme', hostTheme); else root.removeAttribute('data-theme'); }
    else root.setAttribute('data-theme', t);
    store.lset('theme', t); if (themeSel) themeSel.value = t;
  };
  setTheme(qs.get('theme') || store.lget('theme', G.site.defaultTheme || 'auto'));
  themeSel && themeSel.addEventListener('change', e => setTheme(e.target.value));
  if (!mem.labels) document.body.classList.add('labels-off');

  // ---------- graph ----------
  const outLinks = p => [...new Set([p.next_action, p.next_related, p.next_deeper, ...(p.links || [])].filter(x => x && byId[x] && x !== p.id))];
  const inLinks = p => (G.inbound[p.id] || []).filter(x => byId[x]);
  const children = ent => G.pages.filter(p => p.entrance === ent && p.kind !== 'hub' && p.id !== 'home').sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));

  // ---------- routing ----------
  function parseHash() {
    const h = decodeURIComponent(location.hash.replace(/^#/, '')) || '/';
    const [path, q] = h.split('?');
    const params = new URLSearchParams(q || '');
    if (path === '/' || path === '') return { view: 'home', params };
    if (path === '/atlas' || path === 'atlas') return { view: 'atlas', params };
    if (byId[path]) return { view: 'page', page: byId[path], params };
    let m = path.match(/^\/n\/([a-z0-9-]+)/);
    if (m && byId[m[1]]) return { view: 'page', page: byId[m[1]], params, anchor: params.get('a') };
    const r = path.endsWith('/') ? path : path + '/';
    if (byRoute[r]) return { view: 'page', page: byRoute[r], params };
    return { view: '404', params };
  }
  window.addEventListener('hashchange', render);

  function render() {
    hidePreview(); closeDrawer(true);
    const r = parseHash();
    layout.classList.toggle('wide', r.view !== 'page');
    if (r.view === 'home') renderHome();
    else if (r.view === 'atlas') renderAtlas();
    else if (r.view === 'page') renderPage(r.page, r.params);
    else main.innerHTML = `<h1 class="title">Not found</h1><p>That page is not in this guide. <a href="#/">Return to the start</a> or open the <a href="#/atlas">atlas</a>.</p>`;
    if (!r.params.get('keep')) window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
    document.title = (r.page ? r.page.title + ' — ' : '') + G.site.name + ' Guidebook';
  }

  // ---------- home ----------
  function renderHome() {
    rail.innerHTML = '';
    const home = byId.home;
    main.innerHTML = `
      <section class="hero"><h1>${esc(G.site.headline)}</h1><p>${esc(G.site.tagline)}</p></section>
      <div class="howto">${G.site.howto.map(h => `<div><b>${esc(h.t)}</b><p>${esc(h.d)}</p></div>`).join('')}</div>
      <h2 class="sr">Choose an entrance</h2>
      <div class="entrances">${ENT.filter(e => e.home !== false).map(e => {
        const hub = G.pages.find(p => p.kind === 'hub' && p.entrance === e.id);
        const kids = children(e.id).slice(0, 4);
        return `<a class="ent ent-${e.id}" href="#/n/${hub ? hub.id : (kids[0] || {}).id}"><span class="q">${esc(e.question)}</span><h2>${esc(e.title)}</h2><p>${esc(e.blurb)}</p><ol>${kids.map(k => `<li>${esc(k.title)}</li>`).join('')}</ol></a>`;
      }).join('')}</div>
      <div class="shortcut"><div><b>${esc(G.site.shortcut.title)}</b><p>${esc(G.site.shortcut.text)}</p></div><a class="btn" href="#/n/${G.site.shortcut.target}">${esc(G.site.shortcut.cta)} →</a></div>
      ${home ? `<div class="prose">${home.intro || ''}${Object.keys(home.layers).map(n => home.layers[n].html).join('')}</div>` : ''}
      <p><a class="btn alt" href="#/atlas">Open the atlas of all ${G.pages.length} pages</a></p>`;
    wireContent(main);
  }

  // ---------- page ----------
  function renderPage(p, params) {
    // trail
    if (mem.trail[mem.trail.length - 1] !== p.id) { mem.trail.push(p.id); mem.trail = mem.trail.slice(-14); store.set('trail', mem.trail); }
    const layerNums = Object.keys(p.layers).map(Number).sort((a, b) => a - b);
    const maxL = layerNums.length ? layerNums[layerNums.length - 1] : 0;
    let depth = Number(params.get('d')) || (p.kind === 'hub' ? maxL : Math.max(1, Math.min(mem.depth, maxL)));
    if (params.get('all') === '1') depth = maxL;
    const seen = new Set(mem.seen[p.id] || []);
    layerNums.filter(n => n <= depth).forEach(n => seen.add(n));
    mem.seen[p.id] = [...seen]; store.set('seen', mem.seen);
    const ent = ENT.find(e => e.id === p.entrance);
    const hub = G.pages.find(x => x.kind === 'hub' && x.entrance === p.entrance && x.id !== p.id);
    const dial = layerNums.length > 1 ? `
      <div class="dial" role="group" aria-label="Reading depth">
        <div class="dial-row">
          <span class="dial-l">Depth</span>
          <div class="steps">${[1, 2, 3, 4, 5, 6].map(n => {
            const has = layerNums.includes(n);
            return `<button type="button" class="step ${n <= depth && has ? 'on' : ''} ${seen.has(n) ? 'seen' : ''}" data-depth="${n}" ${has ? '' : 'disabled'} aria-pressed="${n <= depth && has}" title="${esc(G.layers[n])}"><b>${n}</b><span>${esc(G.layers[n])}</span></button>`;
          }).join('')}</div>
          <div class="dial-x"><button type="button" class="mini" data-act="all">All</button><button type="button" class="mini" data-act="labels" aria-pressed="${mem.labels}">Labels</button></div>
        </div>
      </div>` : '';
    const layersHtml = layerNums.filter(n => n <= depth).map(n => `
      <section class="layer ${seen.has(n) && !(mem.seen['_' + p.id] || []).includes(n) ? 'enter' : ''}" id="L${n}" aria-labelledby="L${n}h">
        <h2 class="layer-h" id="L${n}h"><span class="n">${n}</span>${esc(p.layers[n].title)}</h2>
        <div class="prose">${p.layers[n].html}</div>
      </section>`).join('');
    mem.seen['_' + p.id] = [...seen];
    const rest = layerNums.filter(n => n > depth);
    const cont = rest.length ? `<div class="continue" aria-label="Continue reading">${rest.map((n, i) => `<button type="button" class="cont" data-depth="${n}"><span class="n">${n}</span><span class="t">${esc(p.layers[n].title)}</span><span class="h">${i === 0 ? 'Continue' : 'Jump'} →</span></button>`).join('')}</div>` : '';
    const atEnd = !rest.length;
    const endp = p.endpoint && atEnd ? `<div class="endpoint" role="note"><h2>End point reached</h2><p>${esc(p.endpoint_text || 'This page ends in a concrete action. You can stop here with something usable, or follow the links below to go deeper.')}</p></div>` : '';
    const tail = atEnd ? `<div class="tail">
      ${p.questions ? `<section><h2>Useful questions</h2><div class="prose">${p.questions}</div></section>` : ''}
      ${p.uncertainty ? `<section><h2>What is uncertain</h2><div class="prose">${p.uncertainty}</div></section>` : ''}
      ${p.unresolved ? `<section><h2>Sources still needed</h2><div class="prose">${p.unresolved}</div></section>` : ''}
    </div>` : '';
    const onward = [['action', 'Next action', p.next_action], ['related', 'Related explanation', p.next_related], ['deeper', 'Deeper evidence', p.next_deeper]].filter(x => x[2] && byId[x[2]]);
    const onwardHtml = onward.length ? `<nav class="onward" aria-label="Where next">${onward.map(([k, l, id]) => `<a class="ow e-${k}" href="#/n/${id}" data-node="${id}"><small>${l}</small><b>${esc(byId[id].title)}</b><span>${esc(byId[id].summary)}</span></a>`).join('')}</nav>` : '';
    main.innerHTML = `
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Start</a><span class="sep">/</span>${hub ? `<a href="#/n/${hub.id}">${esc(entTitle(p.entrance))}</a><span class="sep">/</span>` : ''}<span aria-current="page">${esc(p.title)}</span></nav>
      <h1 class="title">${esc(p.title)}</h1>
      <p class="lede">${esc(p.summary)}</p>
      <div class="meta"><span class="status">${esc(p.status)}</span><span>Content checked <b>${esc(p.reviewed)}</b></span>${p.claimCount ? `<span><b>${p.claimCount}</b> labelled claims</span>` : ''}${p.srcs.length ? `<span><b>${p.srcs.length}</b> sources</span>` : ''}${p.endpoint ? '<span>End-point page</span>' : ''}</div>
      ${dial}
      ${p.intro ? `<div class="prose">${p.intro}</div>` : ''}
      ${layersHtml}${cont}${endp}${tail}${atEnd || p.kind === 'hub' ? onwardHtml : ''}`;
    renderRail(p, onward);
    wireContent(main, p);
    $$('[data-depth]', main).forEach(b => b.addEventListener('click', () => {
      const n = Number(b.dataset.depth); if (b.disabled) return;
      mem.depth = Math.max(1, Math.min(n, 6)); store.lset('depth', mem.depth);
      const target = n;
      history.replaceState(null, '', `#/n/${p.id}?d=${n}&keep=1`);
      renderPage(p, new URLSearchParams(`d=${n}`));
      const el = $('#L' + target); if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }));
    const all = $('[data-act="all"]', main); all && all.addEventListener('click', () => { history.replaceState(null, '', `#/n/${p.id}?d=${maxL}&keep=1`); renderPage(p, new URLSearchParams(`d=${maxL}`)); });
    const lab = $('[data-act="labels"]', main); lab && lab.addEventListener('click', () => { mem.labels = !mem.labels; store.lset('labels', mem.labels); document.body.classList.toggle('labels-off', !mem.labels); lab.setAttribute('aria-pressed', mem.labels); });
  }

  // ---------- rail ----------
  function renderRail(p, onward) {
    const trail = mem.trail.filter(id => byId[id]).slice(-8);
    const ins = inLinks(p);
    rail.innerHTML = `
      <section class="card minimap"><h2>Where this page sits</h2>${miniMap(p)}<div class="legend"><span style="color:var(--e-action)"><i></i>action</span><span style="color:var(--e-related)"><i></i>related</span><span style="color:var(--e-deeper)"><i></i>deeper</span><span style="color:var(--muted)"><i></i>leads here</span></div></section>
      ${onward.length ? `<section class="card"><h2>Where next</h2><ul>${onward.map(([k, l, id]) => `<li><a href="#/n/${id}" class="xl" data-node="${id}">${esc(byId[id].title)}</a> <span class="sub">· ${l.toLowerCase()}</span></li>`).join('')}</ul></section>` : ''}
      ${ins.length ? `<section class="card"><h2>Pages that lead here</h2><ul>${ins.slice(0, 10).map(id => `<li><a href="#/n/${id}" class="xl" data-node="${id}">${esc(byId[id].title)}</a></li>`).join('')}</ul></section>` : ''}
      ${p.srcs.length ? `<section class="card"><h2>Sources on this page</h2><ul>${p.srcs.map(s => srcById[s] ? `<li><button type="button" class="ref" data-src="${s}">${s}</button> <span class="sub">${esc(srcById[s].short || srcById[s].citation.slice(0, 60))}</span></li>` : '').join('')}</ul></section>` : ''}
      ${trail.length > 1 ? `<section class="card"><h2>Your path</h2><div class="trail">${trail.map((id, i) => `${i ? '<span class="arrow">›</span>' : ''}<a href="#/n/${id}">${esc(byId[id].short || byId[id].title)}</a>`).join('')}</div></section>` : ''}`;
    wireContent(rail, p);
  }

  function miniMap(p) {
    const W = 300, H = 230, cx = W / 2, cy = H / 2;
    const typed = [['action', p.next_action], ['related', p.next_related], ['deeper', p.next_deeper]].filter(x => x[1] && byId[x[1]]);
    const used = new Set([p.id, ...typed.map(x => x[1])]);
    const body = (p.links || []).filter(x => byId[x] && !used.has(x)).slice(0, 3); body.forEach(x => used.add(x));
    const ins = inLinks(p).filter(x => !used.has(x) && byId[x].kind !== 'home').slice(0, 5);
    const ring = [...typed.map(([k, id]) => ({ id, k })), ...body.map(id => ({ id, k: 'body' }))];
    const pos = (i, n, r, off = -Math.PI / 2) => [cx + r * Math.cos(off + (i / Math.max(n, 1)) * Math.PI * 2), cy + r * Math.sin(off + (i / Math.max(n, 1)) * Math.PI * 2) * .82];
    const col = k => ({ action: 'var(--e-action)', related: 'var(--e-related)', deeper: 'var(--e-deeper)', body: 'var(--line)', in: 'var(--muted)' })[k];
    const label = id => { const t = byId[id].short || byId[id].title; return t.length > 22 ? t.slice(0, 21) + '…' : t; };
    let edges = '', nodes = '';
    ring.forEach((o, i) => { const [x, y] = pos(i, ring.length, 78); edges += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${col(o.k)}" stroke-width="${o.k === 'body' ? 1 : 2.2}"/>`; nodes += `<a href="#/n/${o.id}" class="xl" data-node="${o.id}"><circle cx="${x}" cy="${y}" r="5.5" fill="${col(o.k)}"/><text x="${x}" y="${y + (y > cy ? 17 : -9)}" text-anchor="middle">${esc(label(o.id))}</text></a>`; });
    ins.forEach((id, i) => { const [x, y] = pos(i + .5, ins.length, 108, Math.PI / 2); edges += `<line x1="${x}" y1="${y}" x2="${cx}" y2="${cy}" stroke="var(--muted)" stroke-dasharray="2 3" stroke-width="1"/>`; nodes += `<a href="#/n/${id}" class="xl" data-node="${id}"><circle cx="${x}" cy="${y}" r="3.5" fill="var(--muted)"/><text x="${x}" y="${y + (y > cy ? 15 : -7)}" text-anchor="middle" style="fill:var(--muted);font-weight:500">${esc(label(id))}</text></a>`; });
    nodes += `<g class="me"><circle cx="${cx}" cy="${cy}" r="15"/><text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10">here</text></g>`;
    return `<svg viewBox="-20 -14 ${W + 40} ${H + 28}" role="img" aria-label="Map of pages linked to and from ${esc(p.title)}">${edges}${nodes}</svg>`;
  }

  // ---------- atlas ----------
  function renderAtlas() {
    rail.innerHTML = '';
    const lanes = ENT.map(e => ({ ...e, pages: G.pages.filter(p => p.entrance === e.id && p.kind !== 'home').sort((a, b) => (a.kind === 'hub' ? -1 : 0) - (b.kind === 'hub' ? -1 : 0) || a.priority - b.priority) })).filter(l => l.pages.length);
    const colW = 196, rowH = 46, top = 46, bw = 176, bh = 34;
    const pos = {};
    lanes.forEach((l, c) => l.pages.forEach((p, r) => pos[p.id] = { x: 14 + c * colW, y: top + r * rowH }));
    const W = 14 + lanes.length * colW, H = top + Math.max(...lanes.map(l => l.pages.length)) * rowH + 10;
    const edges = [];
    G.pages.forEach(p => outLinks(p).forEach(t => { if (pos[p.id] && pos[t]) edges.push([p.id, t]); }));
    const path = (a, b) => { const A = pos[a], B = pos[b]; const x1 = A.x + bw, y1 = A.y + bh / 2, x2 = B.x, y2 = B.y + bh / 2; if (A.x === B.x) { return `M${A.x + bw} ${y1} C${A.x + bw + 30} ${y1},${A.x + bw + 30} ${y2},${A.x + bw} ${y2}`; } const sx = A.x < B.x ? x1 : A.x, ex = A.x < B.x ? x2 : B.x + bw; const mx = (sx + ex) / 2; return `M${sx} ${y1} C${mx} ${y1},${mx} ${y2},${ex} ${y2}`; };
    main.innerHTML = `
      <nav class="crumbs"><a href="#/">Start</a><span class="sep">/</span><span>Atlas</span></nav>
      <h1 class="title">Atlas</h1>
      <p class="lede">Every page, laid out by entrance and ordered by priority. Hover or focus a page to see what it connects to; select it to open.</p>
      <div class="atlas-wrap"><div class="atlas" id="atlas"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Atlas of all pages and their links">
        ${lanes.map((l, c) => `<text class="lane" x="${14 + c * colW}" y="26">${esc(l.short || l.title)}</text>`).join('')}
        ${edges.map(([a, b]) => `<path class="edge" data-a="${a}" data-b="${b}" d="${path(a, b)}"/>`).join('')}
        ${G.pages.filter(p => pos[p.id]).map(p => `<a href="#/n/${p.id}" class="node ${p.kind === 'hub' ? 'hub' : ''} ${p.endpoint ? 'endp' : ''}" data-id="${p.id}"><rect x="${pos[p.id].x}" y="${pos[p.id].y}" width="${bw}" height="${bh}" rx="7"/><text x="${pos[p.id].x + 9}" y="${pos[p.id].y + 21}">${esc((p.short || p.title).slice(0, 27))}</text><text class="pr" x="${pos[p.id].x + bw - 8}" y="${pos[p.id].y + 21}" text-anchor="end">${p.kind === 'hub' ? '◆' : 'P' + p.priority}</text><title>${esc(p.title)} — ${esc(p.summary)}</title></a>`).join('')}
      </svg></div></div>
      <p class="sub" style="color:var(--muted);font-size:.85rem">◆ entrance hub · P1–P9 priority within an entrance · orange border = end-point page with a concrete action.</p>
      <div class="atlas-list">${lanes.map(l => `<section><h3>${esc(l.title)}</h3><ol>${l.pages.map(p => `<li><a href="#/n/${p.id}" class="xl" data-node="${p.id}">${esc(p.title)}</a></li>`).join('')}</ol></section>`).join('')}</div>`;
    const atlas = $('#atlas');
    const focus = id => { atlas.classList.toggle('focus', !!id); $$('.edge', atlas).forEach(e => e.classList.toggle('hl', !!id && (e.dataset.a === id || e.dataset.b === id))); const nb = new Set([id]); if (id) $$('.edge.hl', atlas).forEach(e => { nb.add(e.dataset.a); nb.add(e.dataset.b); }); $$('.node', atlas).forEach(n => n.classList.toggle('hl', nb.has(n.dataset.id))); };
    $$('.node', atlas).forEach(n => { n.addEventListener('mouseenter', () => focus(n.dataset.id)); n.addEventListener('focus', () => focus(n.dataset.id)); n.addEventListener('mouseleave', () => focus(null)); n.addEventListener('blur', () => focus(null)); });
    wireContent(main);
  }

  // ---------- content wiring ----------
  function wireContent(root, page) {
    $$('.chip', root).forEach(b => b.onclick = () => openClaim(b));
    $$('.ref', root).forEach(b => b.onclick = e => { e.preventDefault(); openSources([b.dataset.src], null); });
    $$('a.xl, a.ow', root).forEach(a => {
      a.addEventListener('mouseenter', e => showPreview(a, e));
      a.addEventListener('focus', e => showPreview(a, e));
      a.addEventListener('mouseleave', hidePreview); a.addEventListener('blur', hidePreview);
    });
    $$('.component', root).forEach(el => { const f = COMPONENTS[el.dataset.component]; if (f && !el.dataset.done) { el.dataset.done = 1; try { f(el, el.dataset.arg, page); } catch (err) { el.innerHTML = `<p class="sub">Component failed to load: ${esc(err.message)}</p>`; } } });
  }

  // ---------- previews ----------
  let pvTimer;
  function showPreview(a, e) {
    if (matchMedia('(hover: none)').matches) return;
    const id = a.dataset.node; const p = byId[id]; if (!p) return;
    clearTimeout(pvTimer);
    pvTimer = setTimeout(() => {
      preview.innerHTML = `<div class="pe">${esc(entTitle(p.entrance))} · ${esc(p.status)}</div><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><div class="pm">${Object.keys(p.layers).length} layers · ${p.claimCount || 0} claims · ${p.srcs.length} sources</div>`;
      preview.hidden = false;
      const r = a.getBoundingClientRect(); const w = preview.offsetWidth, h = preview.offsetHeight;
      let x = Math.min(window.innerWidth - w - 10, Math.max(10, r.left)); let y = r.bottom + 8; if (y + h > window.innerHeight - 10) y = r.top - h - 8;
      preview.style.left = x + 'px'; preview.style.top = y + 'px';
    }, 260);
  }
  function hidePreview() { clearTimeout(pvTimer); preview.hidden = true; }

  // ---------- drawer ----------
  let lastFocus;
  function openDrawer(title, html) {
    lastFocus = document.activeElement;
    drawer.innerHTML = `<header><h2 id="drawer-title">${title}</h2><button class="x" type="button" aria-label="Close">×</button></header><div class="body">${html}</div>`;
    drawer.hidden = false; overlay.hidden = false;
    $('.x', drawer).onclick = () => closeDrawer(); overlay.onclick = () => closeDrawer();
    $('.x', drawer).focus();
    wireContent(drawer);
  }
  function closeDrawer(silent) { if (drawer.hidden) return; drawer.hidden = true; overlay.hidden = true; if (!silent && lastFocus) lastFocus.focus(); }
  const labelDef = l => (G.site.labelDefs || {})[l] || '';
  function srcCard(s, flash) {
    const x = srcById[s]; if (!x) return `<div class="src"><span class="id">${esc(s)}</span><p>Unknown source.</p></div>`;
    return `<div class="src ${flash ? 'flash' : ''}" id="d-${esc(s)}"><span class="id">${esc(x.id)}</span><span class="ty">${esc(x.type)}</span><p>${esc(x.citation)}</p>${x.note ? `<p>${esc(x.note)}</p>` : ''}<p class="acc">Access: ${esc(x.access)}${x.operative ? ` · Operative: ${esc(x.operative)}` : ''}${x.checked ? ` · Checked ${esc(x.checked)}` : ''}</p>${x.url ? `<p><a href="${esc(x.url)}" target="_blank" rel="noopener">Open source ↗</a>${x.doi ? ` · <a href="https://doi.org/${esc(x.doi)}" target="_blank" rel="noopener">DOI</a>` : ''}</p>` : (x.doi ? `<p><a href="https://doi.org/${esc(x.doi)}" target="_blank" rel="noopener">DOI ${esc(x.doi)}</a></p>` : '')}</div>`;
  }
  function openClaim(b) {
    const l = b.dataset.label; const ids = (b.dataset.srcs || '').split(',').filter(Boolean);
    const text = b.closest('.claim') ? b.closest('.claim').querySelector('p').textContent : '';
    openDrawer(esc(G.labels[l] || l), `<div class="labeldef" data-label="${l}"><b>${esc(G.labels[l])}</b>${b.dataset.conf ? ` · confidence <b>${esc(b.dataset.conf)}</b>` : ''}<br>${esc(labelDef(l))}</div><p style="font-family:var(--serif)">“${esc(text.slice(0, 400))}”</p><h3 style="font:650 .8rem var(--mono);text-transform:uppercase;color:var(--muted)">Supporting sources</h3>${ids.length ? ids.map(s => srcCard(s)).join('') : '<p>No source attached: this is labelled as a hypothesis or a known gap.</p>'}<p class="sub" style="font-size:.85rem;color:var(--muted)">A label describes this claim only, not the whole page. Confidence and access status are separate: a strong study can still be one we have only read in abstract.</p>`);
  }
  function openSources(ids) { openDrawer('Source', ids.map(s => srcCard(s, true)).join('')); }

  // ---------- search ----------
  let searchEl;
  function openSearch() {
    if (searchEl) { searchEl.remove(); searchEl = null; overlay.hidden = true; return; }
    overlay.hidden = false; overlay.onclick = closeSearch;
    searchEl = document.createElement('div'); searchEl.className = 'search'; searchEl.setAttribute('role', 'dialog'); searchEl.setAttribute('aria-label', 'Search the guide');
    searchEl.innerHTML = `<input type="search" placeholder="Search pages, claims, sources…" aria-label="Search" autocomplete="off"><ol role="listbox"></ol><div class="hint">↑ ↓ to move · Enter to open · Esc to close</div>`;
    document.body.appendChild(searchEl);
    const inp = $('input', searchEl), list = $('ol', searchEl); let sel = 0, res = [];
    const draw = () => {
      const q = inp.value.trim().toLowerCase(); const terms = q.split(/\s+/).filter(t => t.length > 1);
      if (!terms.length) res = G.pages.filter(p => p.kind === 'hub' || p.priority <= 2).slice(0, 10).map(p => ({ p, s: 0 }));
      else res = G.pages.map(p => { let s = 0; const T = p.title.toLowerCase(), S = p.summary.toLowerCase(), B = (p.plain || '').toLowerCase(); for (const t of terms) { if (T.includes(t)) s += 10; if (S.includes(t)) s += 4; const m = B.split(t).length - 1; s += Math.min(m, 6); } return { p, s }; }).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 12);
      sel = Math.min(sel, Math.max(res.length - 1, 0));
      const hl = s => { let o = esc(s); for (const t of terms) o = o.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); return o; };
      list.innerHTML = res.length ? res.map((r, i) => `<li><a href="#/n/${r.p.id}" role="option" aria-selected="${i === sel}">${hl(r.p.title)}<small>${esc(entTitle(r.p.entrance))} · ${hl(r.p.summary)}</small></a></li>`).join('') : '<li><a>No matches. Try fewer words.</a></li>';
    };
    inp.addEventListener('input', () => { sel = 0; draw(); });
    inp.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, res.length - 1); draw(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); draw(); e.preventDefault(); }
      else if (e.key === 'Enter' && res[sel]) { location.hash = '#/n/' + res[sel].p.id; closeSearch(); }
      else if (e.key === 'Escape') closeSearch();
    });
    list.addEventListener('click', e => { if (e.target.closest('a[href]')) closeSearch(); });
    draw(); inp.focus();
  }
  function closeSearch() { if (searchEl) { searchEl.remove(); searchEl = null; } overlay.hidden = true; }

  // ---------- your path ----------
  function openPath() {
    const t = mem.trail.filter(id => byId[id]);
    openDrawer('Your path', t.length ? `<ol>${t.map(id => `<li><a href="#/n/${id}" class="xl" data-node="${id}">${esc(byId[id].title)}</a> <span class="sub">${(mem.seen[id] || []).length} of ${Object.keys(byId[id].layers).length} layers read</span></li>`).join('')}</ol><p><button class="btn alt" type="button" id="clearpath">Clear path</button></p>` : '<p>Pages you open will appear here, so you can retrace a line of reasoning.</p>');
    const c = $('#clearpath'); c && (c.onclick = () => { mem.trail = []; mem.seen = {}; store.set('trail', []); store.set('seen', {}); closeDrawer(); render(); });
  }

  const skip = $('.skip'); skip && skip.addEventListener('click', e => { e.preventDefault(); main.focus(); });
  // ---------- global keys + toolbar ----------
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b || b.closest('main')) return;
    const a = b.dataset.act; if (a === 'search') openSearch(); else if (a === 'atlas') location.hash = '#/atlas'; else if (a === 'path') openPath();
  });
  document.addEventListener('keydown', e => {
    if (e.target.matches('input,textarea,select')) return;
    if (e.key === '/') { e.preventDefault(); openSearch(); }
    else if (e.key === 'Escape') { closeSearch(); closeDrawer(); }
  });

  // =====================================================================
  // Components
  // =====================================================================
  const COMPONENTS = {
    children(el, arg, page) {
      const ent = arg || (page && page.entrance);
      const kids = children(ent);
      el.innerHTML = `<div class="onward" style="grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))">${kids.map(k => `<a class="ow ${k.endpoint ? 'e-action' : 'e-related'}" href="#/n/${k.id}" data-node="${k.id}"><small>Priority ${k.priority}${k.endpoint ? ' · end point' : ''}</small><b>${esc(k.title)}</b><span>${esc(k.summary)}</span></a>`).join('')}</div>`;
      wireContent(el);
    },
    legend(el) {
      el.innerHTML = `<div class="cmp"><div class="cmp-h"><b>The eight claim labels</b></div><div class="cmp-body">${Object.keys(G.labels).map(l => `<div class="labeldef" data-label="${l}"><span class="chip" data-label="${l}" style="cursor:default">${esc(G.labels[l])}</span><br>${esc(labelDef(l))}</div>`).join('')}</div></div>`;
    },
    'source-index'(el) {
      const groups = {}; G.sources.forEach(s => (groups[s.type] = groups[s.type] || []).push(s));
      el.innerHTML = Object.keys(groups).sort().map(t => `<h3>${esc(t)}</h3>${groups[t].map(s => srcCard(s.id)).join('')}`).join('');
    },
    mechanism(el) {
      const M = G.components.mechanism; let sel = null, drug = null;
      const allItems = M.levels.flatMap(l => l.items.map(i => ({ ...i, level: l.id })));
      const it = id => allItems.find(x => x.id === id);
      const draw = () => {
        const linked = new Set(); if (sel) M.links.forEach(k => { if (k.from === sel) linked.add(k.to); if (k.to === sel) linked.add(k.from); });
        const targets = drug ? new Set(M.drugs.find(d => d.id === drug).targets) : null;
        el.innerHTML = `<div class="cmp" role="group" aria-label="${esc(M.title)}"><div class="cmp-h"><b>${esc(M.title)}</b><div class="seg" role="group" aria-label="Medication overlay"><button type="button" data-drug="" aria-pressed="${!drug}">No overlay</button>${M.drugs.map(d => `<button type="button" data-drug="${d.id}" aria-pressed="${drug === d.id}">${esc(d.short)}</button>`).join('')}</div></div>
          <div class="cmp-body"><div class="ladder">${M.levels.map(l => `<div class="rung"><div class="rung-l">${esc(l.label)}<small>${esc(l.sub)}</small></div><div class="items">${l.items.map(i => {
            const cls = [sel === i.id ? 'sel' : '', linked.has(i.id) ? 'lit' : '', (sel && !linked.has(i.id) && sel !== i.id) || (targets && !targets.has(i.id)) ? 'dim' : ''].join(' ');
            return `<button type="button" class="it ${cls}" data-item="${i.id}" aria-pressed="${sel === i.id}">${esc(i.name)}${targets && targets.has(i.id) ? '<span class="drug">Rx</span>' : ''}</button>`; }).join('')}</div></div>`).join('')}</div>
          <div class="mech-detail" aria-live="polite">${detail()}</div></div>
          <div class="cmp-note">${esc(M.note)}</div></div>`;
        $$('[data-item]', el).forEach(b => b.onclick = () => { sel = sel === b.dataset.item ? null : b.dataset.item; draw(); const nb = $(`[data-item="${b.dataset.item}"]`, el); nb && nb.focus(); });
        $$('[data-drug]', el).forEach(b => b.onclick = () => { drug = b.dataset.drug || null; sel = null; draw(); });
        $$('.lk', el).forEach(b => b.onclick = () => { sel = b.dataset.go; draw(); });
        wireContent($('.mech-detail', el));
      };
      const refBtns = ids => (ids || []).map(s => `<button class="ref" type="button" data-src="${s}">${s}</button>`).join('');
      const detail = () => {
        if (drug && !sel) { const d = M.drugs.find(x => x.id === drug); return `<h4>${esc(d.name)}</h4><p>${esc(d.desc)} ${refBtns(d.src)}</p><p class="sub" style="font-size:.85rem;color:var(--muted)">Highlighted (Rx) components are where this medicine is understood to act. Select one to see its connections.</p>`; }
        if (!sel) return `<p style="font-family:var(--sans);color:var(--muted)">${esc(M.intro)}</p>`;
        const i = it(sel); const ks = M.links.filter(k => k.from === sel || k.to === sel);
        return `<h4>${esc(i.name)} <span class="ref" style="cursor:default">${esc(M.levels.find(l => l.id === i.level).label)}</span></h4><p>${esc(i.desc)} ${refBtns(i.src)}</p>${ks.length ? `<div class="linkline">${ks.map(k => { const other = k.from === sel ? k.to : k.from; return `<button type="button" class="lk ${k.type}" data-go="${other}" title="${esc(k.note || '')}">${k.from === sel ? '→' : '←'} ${esc(it(other).name)} · ${k.type}</button>`; }).join('')}</div><p class="sub" style="font-size:.8rem;color:var(--muted);margin-top:.5rem">Line style: solid = established mechanism · dashed = association · dotted = hypothesis. ${ks.filter(k => k.note).map(k => esc(k.note)).join(' ')}</p>` : ''}`;
      };
      draw();
    },
    timeline(el) {
      const T = G.components.timeline; let lane = '', disputed = false;
      const draw = () => {
        const ev = T.events.filter(e => (!lane || e.lane === lane) && (!disputed || e.dispute));
        const dates = [...new Set(ev.map(e => e.date))];
        el.innerHTML = `<div class="cmp"><div class="cmp-h"><b>${esc(T.title)}</b><div class="tl-filters"><div class="seg" role="group" aria-label="Filter by account"><button type="button" data-lane="" aria-pressed="${!lane}">All</button>${Object.entries(T.lanes).map(([k, v]) => `<button type="button" data-lane="${k}" aria-pressed="${lane === k}">${esc(v)}</button>`).join('')}</div><button type="button" class="mini" data-disp aria-pressed="${disputed}">Disputed only</button></div></div>
          <div class="cmp-body"><div class="tl">${dates.map(d => `<div class="tl-row"><div class="tl-date">${esc(d)}</div><div class="tl-cards">${ev.filter(e => e.date === d).map(e => `<article class="tl-card lane-${e.lane} ${e.dispute ? 'dispute' : ''}"><div class="who">${esc(T.lanes[e.lane])}${e.dispute ? ' · disputed' : ''}</div><p><b>${esc(e.title)}</b></p><p>${esc(e.text)}</p>${e.fields ? `<details><summary>Record fields</summary><dl>${Object.entries(e.fields).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></details>` : ''}${e.src && e.src.length ? `<div>${e.src.map(s => `<button class="ref" type="button" data-src="${s}">${s}</button>`).join('')}</div>` : ''}</article>`).join('')}</div></div>`).join('')}</div></div>
          <div class="cmp-note">${esc(T.note)}</div></div>`;
        $$('[data-lane]', el).forEach(b => b.onclick = () => { lane = b.dataset.lane; draw(); });
        $('[data-disp]', el).onclick = () => { disputed = !disputed; draw(); };
        wireContent(el);
      };
      draw();
    },
    'request-builder'(el) {
      const F = [['service', 'Service you are writing to', 'e.g. the specialist ADHD service that last prescribed'], ['last', 'What you were last prescribed, and when it stopped', 'Product, strength, how often, last supply date if known'], ['benefit', 'What it helped with (be specific)', 'e.g. starting tasks, walking further, finishing a work shift'], ['now', 'What has changed since it stopped', 'Specific, dated examples'], ['checks', 'Checks already done or requested', 'e.g. blood pressure readings, heart tests and dates'], ['date', 'Reply requested by', 'A date']];
      el.innerHTML = `<div class="cmp"><div class="cmp-h"><b>Build a continuity request</b></div><div class="cmp-body"><div class="tool-grid">${F.map(([k, l, ph]) => `<label>${esc(l)}<textarea data-k="${k}" placeholder="${esc(ph)}"></textarea></label>`).join('')}</div><h4 style="font:650 .9rem var(--sans);margin:1rem 0 .4rem">Your request</h4><div class="tool-out" aria-live="polite"></div><p><button class="btn" type="button" data-copy>Copy text</button> <span class="sub" data-msg style="color:var(--muted);font-size:.85rem"></span></p></div><div class="cmp-note">Nothing you type leaves this page or is saved. Keep complaints about process in a separate message from this clinical request.</div></div>`;
      const out = $('.tool-out', el); const v = k => ($(`[data-k="${k}"]`, el).value || '').trim();
      const draw = () => { out.textContent = `To: ${v('service') || '[service]'}\n\nI am asking for a clear, written answer about who owns the next decision on my ADHD treatment.\n\nWhat I was prescribed: ${v('last') || '[product, strength, frequency, last supply]'}\nWhat it helped with: ${v('benefit') || '[specific functions]'}\nWhat has changed since it stopped: ${v('now') || '[dated examples]'}\nChecks done or requested: ${v('checks') || '[checks and dates]'}\n\nPlease confirm in writing:\n1. Which service and clinician are responsible for the next treatment decision.\n2. What information or checks remain outstanding, and who will obtain them.\n3. The expected date of that decision.\n4. The interim support and safety plan until then, including who to contact if function deteriorates.\n5. If your service cannot take responsibility, which service will, and whether it has accepted the handover.\n\nA reply by ${v('date') || '[date]'} would help me plan. I am happy to provide any records you need.`; };
      $$('textarea', el).forEach(t => t.addEventListener('input', draw)); draw();
      $('[data-copy]', el).onclick = async () => { const msg = $('[data-msg]', el); try { await navigator.clipboard.writeText(out.textContent); msg.textContent = 'Copied.'; } catch { const r = document.createRange(); r.selectNodeContents(out); const s = getSelection(); s.removeAllRanges(); s.addRange(r); msg.textContent = 'Selected — press copy on your device.'; } };
    },
    'appointment-builder'(el) {
      const F = [['goal', 'The one decision I need from this appointment'], ['obs', 'Three specific, recent examples (what, when, how long)'], ['meds', 'Medicines and products I take now (exact names and strengths)'], ['worked', 'What helped before, and what did not'], ['ask', 'Questions I want answered']];
      el.innerHTML = `<div class="cmp"><div class="cmp-h"><b>One-page appointment sheet</b></div><div class="cmp-body"><div class="tool-grid">${F.map(([k, l]) => `<label>${esc(l)}<textarea data-k="${k}"></textarea></label>`).join('')}</div><h4 style="font:650 .9rem var(--sans);margin:1rem 0 .4rem">Your sheet</h4><div class="tool-out"></div><p><button class="btn" type="button" data-copy>Copy text</button></p></div><div class="cmp-note">Stays on your device. Copy it into a note or email to yourself, and hand it over at the start.</div></div>`;
      const out = $('.tool-out', el); const v = k => ($(`[data-k="${k}"]`, el).value || '').trim() || '—';
      const draw = () => { out.textContent = `DECISION I NEED TODAY\n${v('goal')}\n\nRECENT EXAMPLES\n${v('obs')}\n\nCURRENT MEDICINES\n${v('meds')}\n\nWHAT HELPED / WHAT DID NOT\n${v('worked')}\n\nMY QUESTIONS\n${v('ask')}\n\nBefore I leave, please confirm: who owns the next step, by when, and how I contact them.`; };
      $$('textarea', el).forEach(t => t.addEventListener('input', draw)); draw();
      $('[data-copy]', el).onclick = async () => { try { await navigator.clipboard.writeText(out.textContent); } catch { const r = document.createRange(); r.selectNodeContents(out); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } };
    }
  };

  render();
})();
