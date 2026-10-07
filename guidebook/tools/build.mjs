#!/usr/bin/env node
// MJB Guidebook build — zero dependencies (Node 18+).
// Reads content/pages/*.md + content/*.json, validates, and writes:
//   dist/guide-data.js            window.GUIDE = {...} (works from file:// and any static host)
//   dist/index.html               app shell (loads assets + data)
//   dist/guidebook.html           single self-contained file (embed / offline / artifact)
//   dist/static/<route>/index.html  pre-rendered no-JS pages (SEO, print, script-blocked readers)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (...a) => path.join(ROOT, ...a);
const read = f => fs.readFileSync(f, 'utf8');
const visuals = JSON.parse(read(P('content', 'visuals.json')));
const args = new Set(process.argv.slice(2));
const CHECK_ONLY = args.has('--check');

export const LAYERS = {
  1: 'Quick understanding', 2: 'Possible explanations', 3: 'Useful next action',
  4: 'Treatment logic', 5: 'Deeper explanation', 6: 'Evidence and sources'
};
export const LABELS = {
  guidance: 'Clinical guidance', research: 'Research finding', institution: 'Institutional position',
  patient: 'Patient observation', hypothesis: 'Hypothesis', contested: 'Contested account',
  missing: 'Missing source', finding: 'Formal finding'
};
const NEEDS_SOURCE = new Set(['guidance', 'research', 'institution', 'finding', 'patient', 'contested']);
const CONF = new Set(['strong', 'moderate', 'limited', 'pending', '']);

// ---------- helpers ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function frontMatter(txt, file) {
  const m = txt.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const i = line.indexOf(':');
    const k = line.slice(0, i).trim(); let v = line.slice(i + 1).trim();
    if (v === 'true') v = true; else if (v === 'false') v = false;
    else if (/^\d+$/.test(v)) v = Number(v);
    else if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    meta[k] = v;
  }
  return { meta, body: txt.slice(m[0].length) };
}

// ---------- inline markdown ----------
function inline(s, ctx) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>');
  // [[node-id]] or [[node-id|text]] internal links
  out = out.replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (_, id, text) => {
    ctx.links.add(id);
    return `<a class="xl" data-node="${id}" href="#/n/${id}">${text || `{{title:${id}}}`}</a>`;
  });
  // {S-ID} or {W2,R1} source refs
  out = out.replace(/\{([A-Z][A-Za-z0-9-]*(?:\s*,\s*[A-Z][A-Za-z0-9-]*)*)\}/g, (_, ids) => {
    const list = ids.split(',').map(x => x.trim());
    list.forEach(x => ctx.srcs.add(x));
    return `<span class="refs">${list.map(x => `<button class="ref" data-src="${x}" type="button">${x}</button>`).join('')}</span>`;
  });
  // External and root-relative editorial links
  out = out.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)/g, (_, label, url) => `<a href="${url}"${url.startsWith('http') ? ' rel="noopener" target="_blank"' : ''}>${label}</a>`);
  return out;
}

// ---------- block markdown ----------
function blocks(src, ctx) {
  const lines = src.split('\n');
  const html = [];
  let i = 0;
  const para = [];
  const flush = () => { if (para.length) { html.push(`<p>${inline(para.join(' '), ctx)}</p>`); para.length = 0; } };
  while (i < lines.length) {
    const L = lines[i];
    const t = L.trim();
    if (!t) { flush(); i++; continue; }
    // component
    let m = t.match(/^@component\s+([a-z-]+)(?:\s+(.*))?$/);
    if (m) { flush(); ctx.components.add(m[1]); html.push(`<div class="component" data-component="${m[1]}" data-arg="${esc(m[2] || '')}"><noscript>Interactive component: ${esc(m[1])} (requires JavaScript; the text above and below carries the same evidence).</noscript></div>`); i++; continue; }
    // claim: !label[conf](S1,S2) text
    m = t.match(/^!([a-z]+)(?:\[([a-z]*)\])?\(([^)]*)\)\s+(.*)$/);
    if (m) {
      flush();
      const [, label, conf = '', srcs, text] = m;
      const ids = srcs.split(',').map(x => x.trim()).filter(Boolean);
      ctx.claims.push({ label, conf, ids, line: i + 1, text: text.slice(0, 80) });
      ids.forEach(x => ctx.srcs.add(x));
      let body = text; let j = i + 1;
      while (j < lines.length && lines[j].trim() && !/^[!@#>|*\-]|^\d+\./.test(lines[j].trim())) { body += ' ' + lines[j].trim(); j++; }
      html.push(`<div class="claim" data-label="${label}" data-conf="${conf}"><button class="chip chip-${label}" type="button" data-label="${label}" data-srcs="${ids.join(',')}" data-conf="${conf}" aria-label="${LABELS[label] || label}${conf ? ', confidence ' + conf : ''}: show sources">${LABELS[label] || label}${conf ? `<i>${conf}</i>` : ''}</button><p>${inline(body, ctx)}</p>${ids.length ? `<span class="refs">${ids.map(x => `<button class="ref" data-src="${x}" type="button">${x}</button>`).join('')}</span>` : ''}</div>`);
      i = j; continue;
    }
    // Selected artwork, captions and readable equivalents are compiler-owned HTML.
    if (t.startsWith('@visual ')) {
      flush(); const id = t.slice(8).trim(); const v = visuals[id];
      if (!v) throw new Error(`Unknown visual: ${id}`);
      v.source_ids.forEach(id => ctx.srcs.add(id));
      html.push(`<figure class="guide-visual"><a href="/guide/visuals/${esc(v.svg)}" aria-label="Open full-size diagram: ${esc(v.alt)}"><picture><source type="image/webp" srcset="/guide/visuals/${esc(v.webp)}"><img src="/guide/visuals/${esc(v.png)}" width="${v.width}" height="${v.height}" loading="lazy" alt="${esc(v.alt)}"></picture></a><figcaption>${esc(v.caption)}</figcaption><details><summary>Read diagram text</summary>${blocks(v.text.replace(/^# .+\n/, ''), ctx)}</details></figure>`);
      i++; continue;
    }
    // headings
    m = t.match(/^(#{3,4})\s+(.*)$/);
    if (m) { flush(); const lvl = m[1].length; const id = m[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); html.push(`<h${lvl} id="${ctx.id}--${id}">${inline(m[2], ctx)}</h${lvl}>`); i++; continue; }
    // callout > [!note] Title
    m = t.match(/^>\s*\[!(note|warn|key|ask)\]\s*(.*)$/);
    if (m) {
      flush(); const kind = m[1]; const title = m[2]; const inner = []; i++;
      while (i < lines.length && lines[i].trim().startsWith('>')) { inner.push(lines[i].trim().replace(/^>\s?/, '')); i++; }
      html.push(`<aside class="callout callout-${kind}"><b>${inline(title, ctx)}</b>${blocks(inner.join('\n'), ctx)}</aside>`); continue;
    }
    // blockquote
    if (t.startsWith('>')) { flush(); const inner = []; while (i < lines.length && lines[i].trim().startsWith('>')) { inner.push(lines[i].trim().replace(/^>\s?/, '')); i++; } html.push(`<blockquote>${blocks(inner.join('\n'), ctx)}</blockquote>`); continue; }
    // table
    if (t.startsWith('|')) {
      flush(); const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(lines[i].trim()); i++; }
      const cells = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(rows[0]); const body = rows.slice(2).map(cells);
      html.push(`<div class="tablewrap" tabindex="0"><table><thead><tr>${head.map(h => `<th scope="col">${inline(h, ctx)}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr>${r.map((c, k) => k === 0 ? `<th scope="row">${inline(c, ctx)}</th>` : `<td>${inline(c, ctx)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    // lists
    if (/^[-*]\s+/.test(t) || /^\d+\.\s+/.test(t)) {
      flush(); const ordered = /^\d+\./.test(t); const items = [];
      while (i < lines.length && (/^[-*]\s+/.test(lines[i].trim()) || /^\d+\.\s+/.test(lines[i].trim()) || (lines[i].startsWith('  ') && lines[i].trim()))) {
        const s = lines[i].trim();
        if (/^[-*]\s+/.test(s) || /^\d+\.\s+/.test(s)) items.push(s.replace(/^([-*]|\d+\.)\s+/, ''));
        else items[items.length - 1] += ' ' + s;
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      html.push(`<${tag}>${items.map(x => {
        const cb = x.match(/^\[ \]\s+(.*)$/);
        return cb ? `<li class="check"><label><input type="checkbox"> <span>${inline(cb[1], ctx)}</span></label></li>` : `<li>${inline(x, ctx)}</li>`;
      }).join('')}</${tag}>`);
      continue;
    }
    para.push(t); i++;
  }
  flush();
  return html.join('\n');
}

// ---------- page parsing ----------
function parsePage(file) {
  const { meta, body } = frontMatter(read(file), file);
  const ctx = { id: meta.id, links: new Set(), srcs: new Set(), claims: [], components: new Set() };
  const sections = { layers: {}, questions: '', uncertainty: '', unresolved: '', intro: '' };
  const parts = body.split(/^@(layer[ \t]+\d|questions|uncertainty|unresolved)[ \t]*(.*)$/m);
  sections.intro = blocks(parts[0], ctx);
  const text = [parts[0]];
  for (let k = 1; k < parts.length; k += 3) {
    const key = parts[k]; const title = parts[k + 1].trim(); const content = parts[k + 2];
    text.push(content);
    if (key.startsWith('layer')) {
      const n = Number(key.split(/\s+/)[1]);
      if (sections.layers[n]) throw new Error(`${file}: duplicate layer ${n}`);
      sections.layers[n] = { title: title || LAYERS[n], html: blocks(content, ctx) };
    } else sections[key] = blocks(content, ctx);
  }
  const plain = text.join(' ').replace(/[#>*`|!\[\]{}()@]/g, ' ').replace(/\s+/g, ' ').slice(0, 6000);
  return { ...meta, ...sections, plain, links: [...ctx.links], srcs: [...ctx.srcs], claims: ctx.claims, components: [...ctx.components], file: path.basename(file) };
}

// ---------- load ----------
const pagesDir = P('content', 'pages');
const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.md')).sort().map(f => parsePage(path.join(pagesDir, f)));
const sources = JSON.parse(read(P('content', 'sources.json')));
const extras = {};
for (const f of fs.readdirSync(P('content', 'components'))) extras[path.basename(f, '.json')] = JSON.parse(read(P('content', 'components', f)));

// ---------- validate ----------
const errors = []; const warns = [];
const byId = Object.fromEntries(pages.map(p => [p.id, p]));
const srcIds = new Set(sources.map(s => s.id));
if (srcIds.size !== sources.length) errors.push("duplicate source IDs");
const routes = new Set();
const PRIV = [/\b\d{3}\s?\d{3}\s?\d{4}\b/, /@gmail\.com/i, /\bCV\d{1,2}\s?\d[A-Z]{2}\b/, /Richmond Road/i, /\b07\d{3}\s?\d{6}\b/];
for (const p of pages) {
  for (const k of ['id', 'title', 'route', 'entrance', 'priority', 'summary', 'status', 'reviewed']) if (p[k] === undefined || p[k] === '') errors.push(`${p.file}: missing ${k}`);
  if (routes.has(p.route)) errors.push(`${p.file}: duplicate route ${p.route}`); routes.add(p.route);
  for (const l of p.links) if (!byId[l]) errors.push(`${p.file}: broken link [[${l}]]`);
  for (const s of p.srcs) if (!srcIds.has(s)) errors.push(`${p.file}: unknown source {${s}}`);
  for (const c of p.claims) {
    if (!LABELS[c.label]) errors.push(`${p.file}:${c.line}: unknown claim label "${c.label}"`);
    if (!CONF.has(c.conf)) errors.push(`${p.file}:${c.line}: unknown confidence "${c.conf}"`);
    if (NEEDS_SOURCE.has(c.label) && !c.ids.length) errors.push(`${p.file}:${c.line}: ${c.label} claim needs a source — "${c.text}"`);
  }
  const onward = ['next_action', 'next_related', 'next_deeper'].map(k => p[k]).filter(Boolean);
  for (const o of onward) if (!byId[o]) errors.push(`${p.file}: onward link to unknown page ${o}`);
  if (p.kind !== 'hub' && p.id !== 'home' && onward.length === 0) warns.push(`${p.file}: no onward links`);
  const raw = read(path.join(pagesDir, p.file));
  for (const re of PRIV) if (re.test(raw)) errors.push(`${p.file}: possible personal identifier matches ${re}`);
  if (p.kind !== 'hub' && !p.uncertainty) warns.push(`${p.file}: no @uncertainty section`);
}
// orphans (nothing links in, not a hub/home)
const inbound = Object.fromEntries(pages.map(p => [p.id, []]));
for (const p of pages) {
  const kids = p.components.includes('children') ? pages.filter(q => q.entrance === p.entrance && q.kind !== 'hub' && q.id !== 'home').map(q => q.id) : [];
  const homeHubs = p.id === 'home' ? pages.filter(q => q.kind === 'hub').map(q => q.id) : [];
  const out = new Set([...p.links, p.next_action, p.next_related, p.next_deeper, p.parent, ...kids, ...homeHubs].filter(Boolean));
  for (const o of out) if (inbound[o] && o !== p.id) inbound[o].push(p.id);
}
for (const p of pages) if (p.id !== 'home' && inbound[p.id].length === 0) warns.push(`${p.id}: orphan (no inbound links)`);
for (const s of sources) for (const k of ['id', 'type', 'citation', 'access']) if (!s[k]) errors.push(`source ${s.id || '?'}: missing ${k}`);

const usedSrc = new Set(pages.flatMap(p => p.srcs));
// component source refs
const walk = (o, where) => { if (Array.isArray(o)) o.forEach(x => walk(x, where)); else if (o && typeof o === 'object') { if (Array.isArray(o.src)) o.src.forEach(id => { if (!srcIds.has(id)) errors.push(`component ${where}: unknown source ${id}`); else usedSrc.add(id); }); Object.values(o).forEach(v => walk(v, where)); } };
for (const [k, v] of Object.entries(extras)) walk(v, k);
for (const s of sources) if (!usedSrc.has(s.id) && !(s.unused_ok)) warns.push(`source ${s.id}: not cited by any page`);
const claimCount = pages.reduce((a, p) => a + p.claims.length, 0);
console.log(`pages ${pages.length} · claims ${claimCount} · sources ${sources.length} · links ${pages.reduce((a, p) => a + p.links.length, 0)}`);
warns.forEach(w => console.log('  warn  ' + w));
if (errors.length) { errors.forEach(e => console.error('  ERROR ' + e)); process.exit(1); }
console.log('validation passed');
if (CHECK_ONLY) process.exit(0);

// ---------- emit ----------
// resolve {{title:id}}
const titleOf = id => byId[id] ? byId[id].title : id;
for (const p of pages) for (const k of ['intro', 'questions', 'uncertainty', 'unresolved']) p[k] = (p[k] || '').replace(/\{\{title:([a-z0-9-]+)\}\}/g, (_, id) => esc(titleOf(id)));
for (const p of pages) for (const n in p.layers) p.layers[n].html = p.layers[n].html.replace(/\{\{title:([a-z0-9-]+)\}\}/g, (_, id) => esc(titleOf(id)));
const site = JSON.parse(read(P('content', 'site.json')));
const data = { site: { ...site, built: new Date().toISOString().slice(0, 10) }, layers: LAYERS, labels: LABELS, pages: pages.map(({ file, claims, ...rest }) => ({ ...rest, claimCount: claims.length })), inbound, sources, components: extras };
const dist = P('dist'); fs.rmSync(dist, { recursive: true, force: true }); fs.mkdirSync(dist, { recursive: true });
const dataJs = `window.GUIDE=${JSON.stringify(data)};`;
const offlineDataJs = dataJs.replace(/\/guide\/visuals\/([A-Za-z0-9.-]+\.(?:png|webp|svg))/g, (_, name) => { const ext = path.extname(name).slice(1); return `data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${fs.readFileSync(P('visuals','web',name)).toString('base64')}`; });
fs.writeFileSync(path.join(dist, 'guide-data.js'), dataJs);
fs.writeFileSync(path.join(dist, 'guide-data.json'), JSON.stringify(data, null, 1));
fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });
const css = read(P('src', 'guide.css')); const js = read(P('src', 'guide.js'));
fs.writeFileSync(path.join(dist, 'assets', 'guide.css'), css);
fs.writeFileSync(path.join(dist, 'assets', 'guide.js'), js);
const shell = read(P('src', 'shell.html'));
const fill = (head, foot) => shell.replace('<!--HEAD-->', () => head).replace('<!--FOOT-->', () => foot).replaceAll('{{SITE}}', esc(site.name));
fs.writeFileSync(path.join(dist, 'index.html'), fill('<link rel="stylesheet" href="assets/guide.css">', '<script src="guide-data.js"></script><script src="assets/guide.js"></script>'));
const safe = s => s.replace(/<\/script/gi, '<\\/script');
fs.writeFileSync(path.join(dist, 'guidebook.html'), fill(`<style>${css}</style>`, `<script>${safe(offlineDataJs)}</script><script>${safe(js)}</script>`));

// artifact variant: body-only (host supplies the skeleton)
{
  const body = shell.replace(/^[\s\S]*<body>/, '').replace(/<\/body>[\s\S]*$/, '');
  const fonts = (shell.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/) || [''])[0];
  const art = `<title>${esc(site.name)} Guidebook</title>\n${fonts}\n<style>${css}</style>\n` + body.replace('<!--FOOT-->', () => `<script>${safe(offlineDataJs)}</script><script>${safe(js)}</script>`).replaceAll('{{SITE}}', esc(site.name));
  fs.writeFileSync(path.join(dist, 'artifact.html'), art);
}
// pre-rendered static pages
const layerOrder = p => Object.keys(p.layers).map(Number).sort((a, b) => a - b);
const staticLink = (from, to) => { const t = byId[to]; return t ? (path.posix.relative(from, t.route) || '.') + '/' : '#'; };
for (const p of pages) {
  const dir = path.join(dist, 'static', p.route.replace(/^\/|\/$/g, ''));
  fs.mkdirSync(dir, { recursive: true });
  const sourceCard = x => `<li id="src-${esc(x.id)}"><b>${esc(x.id)}</b> ${esc(x.citation)}${x.url ? ` <a href="${esc(x.url)}">Source</a>` : x.doi ? ` <a href="https://doi.org/${esc(x.doi)}">DOI</a>` : ''} <i>${esc(x.access || '')}</i>${x.note ? `<p>${esc(x.note)}</p>` : ''}</li>`;
  const refs = ids => (ids || []).map(id => `<a href="${staticLink(p.route, 'sources')}#src-${esc(id)}">${esc(id)}</a>`).join(', ');
  const fallback = (name, arg) => {
    if (name === 'children') return `<ul>${pages.filter(q => q.entrance === (arg || p.entrance) && q.kind !== 'hub' && q.id !== 'home').map(q => `<li><a href="${staticLink(p.route, q.id)}">${esc(q.title)}</a> — ${esc(q.summary)}</li>`).join('')}</ul>`;
    if (name === 'source-index') return `<ol>${sources.map(sourceCard).join('')}</ol>`;
    if (name === 'legend') return `<ul>${Object.entries(LABELS).map(([k,v]) => `<li><b>${esc(v)}</b>: ${esc(site.labelDefs[k] || k)}</li>`).join('')}</ul>`;
    if (name === 'timeline') { const t = extras.timeline; return `<p>${esc(t.note)}</p>${t.events.map(e => `<article><h3>${esc(e.date)} — ${esc(e.title)}</h3><p><b>${esc(t.lanes[e.lane])}${e.dispute ? ' · Disputed' : ''}</b></p><p>${esc(e.text)}</p>${Object.entries(e.fields || {}).map(([k,v]) => `<p><b>${esc(k)}:</b> ${esc(v)}</p>`).join('')}<p>${refs(e.src)}</p></article>`).join('')}`; }
    if (name === 'mechanism') { const m = extras.mechanism; const nodes = Object.fromEntries(m.levels.flatMap(l => l.items).map(i => [i.id,i.name])); return `<h3>${esc(m.title)}</h3><p>${esc(m.note || '')}</p>${m.levels.map(l => `<h4>${esc(l.label)}</h4><ul>${l.items.map(i => `<li><b>${esc(i.name)}</b>: ${esc(i.desc)} ${refs(i.src)}</li>`).join('')}</ul>`).join('')}<h4>Connections and evidence strength</h4><ul>${m.links.map(l => `<li>${esc(nodes[l.from] || l.from)} → ${esc(nodes[l.to] || l.to)}: <b>${esc(l.type)}</b>${l.note ? ' — '+esc(l.note) : ''}</li>`).join('')}</ul><h4>Medicine overlays</h4><ul>${m.drugs.map(d => `<li><b>${esc(d.name)}</b>: ${esc(d.desc)} ${refs(d.src)}</li>`).join('')}</ul>`; }
    if (name === 'request-builder') return '<h3>Continuity request worksheet</h3><p>Write down your current treatment gap, its effects, the decision you need, who should own it, and a requested response date. Ask for the reasons, alternatives and interim plan in writing. Copy these prompts into a document to complete them.</p>';
    if (name === 'appointment-builder') return '<h3>Appointment worksheet</h3><p>Record your main concern, symptom timeline, current medicines and substances, benefit and adverse effects, previous tests, questions, and the decision or follow-up plan you need. Copy these prompts into a document to complete them.</p>';
    throw new Error(`Missing static fallback: ${name}`);
  };
  const fix = h => h.replace(/<div class="component" data-component="([a-z-]+)" data-arg="([^"]*)">[\s\S]*?<\/div>/g, (_, name, arg) => fallback(name,arg)).replace(/href="#\/n\/([a-z0-9-]+)"/g, (_, id) => `href="${staticLink(p.route, id)}"`).replace(/<button class="ref" data-src="([^"]+)" type="button">([^<]+)<\/button>/g, (_, id, label) => `<a class="ref" href="${staticLink(p.route, 'sources')}#src-${id}">${label}</a>`).replace(/\{\{title:([a-z0-9-]+)\}\}/g, (_, id) => esc(titleOf(id)));

  const body = [`<p class="lede">${esc(p.summary)}</p>`, fix(p.intro), ...layerOrder(p).map(n => `<section><h2>${n} · ${esc(p.layers[n].title)}</h2>${fix(p.layers[n].html)}</section>`),
    p.questions ? `<section><h2>Useful questions</h2>${fix(p.questions)}</section>` : '', p.uncertainty ? `<section><h2>Uncertainty</h2>${fix(p.uncertainty)}</section>` : '', p.unresolved ? `<section><h2>Unresolved sources</h2>${fix(p.unresolved)}</section>` : '',
    `<section><h2>Sources cited</h2><ol>${p.srcs.map(s => { const x = sources.find(y => y.id === s); return x ? `<li id="src-${s}"><b>${s}</b> ${esc(x.citation)}${x.url ? ` <a href="${esc(x.url)}">link</a>` : ''} <i>(${esc(x.access)})</i></li>` : ''; }).join('')}</ol></section>`].join('\n');
  const onward = [['Next action', p.next_action], ['Related', p.next_related], ['Deeper', p.next_deeper]].filter(x => x[1]).map(([k, id]) => `<a href="${staticLink(p.route, id)}">${k}: ${esc(titleOf(id))}</a>`).join(' · ');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.title)} — ${esc(site.name)}</title><link rel="canonical" href="https://mjb-adhd.org.uk/guide/static${esc(p.route)}"><meta name="description" content="${esc(p.summary)}"><style>body{font:18px/1.6 Georgia,serif;max-width:46rem;margin:2rem auto;padding:0 1rem;color:#1d1d1b}h1,h2,h3{font-family:system-ui,sans-serif;line-height:1.25}.claim{border-left:3px solid #999;padding-left:.8rem;margin:1rem 0}.chip{font:600 .75rem system-ui;text-transform:uppercase;letter-spacing:.04em;border:1px solid #999;background:none;border-radius:99px;padding:.1rem .5rem}.refs .ref{font:.75rem system-ui;border:0;background:#eee;margin-left:.25rem}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:.4rem;vertical-align:top;text-align:left}.callout{border:1px solid #bbb;padding:.6rem 1rem;margin:1rem 0}.component{display:none}.guide-visual{margin:1.5rem 0}.guide-visual img{width:100%;height:auto}.guide-visual figcaption{font:1rem/1.5 system-ui,sans-serif;margin:.5rem 0}.guide-visual details{font:1rem/1.6 system-ui,sans-serif}</style></head><body><p><a href="/">MJB ADHD home</a> · <a href="/guide/">Guidebook</a></p><p><a href="${path.posix.relative(p.route, '/') || '.'}/">${esc(site.name)}</a> · Static reading view · <a href="${path.posix.relative(p.route, '/') || '.'}/../index.html#/n/${p.id}">Interactive version</a></p><h1>${esc(p.title)}</h1><p><small>Status: ${esc(p.status)} · Content checked ${esc(p.reviewed)}</small></p>${body}<nav><p>${onward}</p></nav></body></html>`;
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}
// route manifest for integrators
fs.writeFileSync(path.join(dist, 'routes.csv'), 'id,route,title,entrance,priority,status,reviewed,kind,next_action,next_related,next_deeper\n' + pages.map(p => [p.id, p.route, `"${p.title.replace(/"/g, '""')}"`, p.entrance, p.priority, p.status, p.reviewed, p.kind || 'article', p.next_action || '', p.next_related || '', p.next_deeper || ''].join(',')).join('\n') + '\n');
console.log('wrote dist/ (index.html, guidebook.html, guide-data.js/json, static/, routes.csv)');
