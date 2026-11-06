'use strict';
/* Route-group migration checks: every existing public route, in group batches, through the shell, under the real _headers CSP. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), { execFileSync } = require('child_process');
const serve = require('./serve-with-headers.cjs');
const root = path.join(__dirname, '..', '..'), site = path.join(root, 'site');
const out = path.join(root, 'artifacts', 'stage1-routes'); fs.mkdirSync(out, { recursive: true });
const BASELINE = process.env.MJB_BASELINE_SITE || '';   // optional: path to an unmodified base checkout's site/ for byte parity
const bank = JSON.parse(fs.readFileSync(path.join(root, 'content/routes/route-bank.json'), 'utf8'));
const results = []; let failed = 0;
function rec(id, ok, detail, group) { const s = ok ? 'PASS' : 'FAIL'; if (!ok) failed++; results.push({ id, group: group || '', status: s, detail: String(detail || '').slice(0, 300) }); if (!ok || process.env.VERBOSE) console.log(s, id, detail || ''); }
(async () => {
  const PORT = 8781, O = `http://127.0.0.1:${PORT}`;
  const srv = await serve(site, PORT);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const groups = [...new Set(bank.routes.map(r => r.group))];
  for (const g of groups) {
    const rs = bank.routes.filter(r => r.group === g);
    let gpass = 0;
    const page = await ctx.newPage(); const csp = [], errs = [];
    page.on('console', m => { if (/Content Security Policy|Refused to/.test(m.text())) csp.push(m.text()); });
    page.on('pageerror', e => errs.push(e.message));
    // Group page lists every non-unlisted route with an original link
    await page.goto(`${O}/social-reading-beta/library/${g}/`);
    for (const r of rs) {
      const before = failed;
      // Legacy deep link: unchanged bytes, 200
      const resp = await page.request.get(O + r.oldRoute);
      const bytes = await resp.body();
      rec(`LEGACY-200 ${r.oldRoute}`, resp.status() === 200, resp.status(), g);
      rec(`ORIGINAL-UNCHANGED ${r.oldRoute}`, crypto.createHash('sha256').update(bytes).digest('hex') === r.pageSha256 &&
        (!BASELINE || crypto.createHash('sha256').update(fs.readFileSync(path.join(BASELINE, r.oldRoute, 'index.html'))).digest('hex') === r.pageSha256), 'page sha', g);
      if (r.mode === 'unlisted') { rec(`UNLISTED ${r.oldRoute}`, await page.locator(`#${r.id}`).count() === 0, '', g); if (failed === before) gpass++; continue; }
      const item = page.locator(`#${r.id}`);
      rec(`LIB-ENTRY ${r.oldRoute}`, await item.count() === 1 && await item.locator(`a[data-lib-original][href="${r.oldRoute}"]`).count() === 1, '', g);
      if (r.mode === 'reference') { rec(`REFERENCE-ONLY ${r.oldRoute}`, await item.locator('a[data-lib-read]').count() === 0, r.note, g); if (failed === before) gpass++; continue; }
      const rp = await ctx.newPage(); const rcsp = [], rerr = [];
      rp.on('console', m => { if (/Content Security Policy|Refused to/.test(m.text())) rcsp.push(m.text()); });
      rp.on('pageerror', e => rerr.push(e.message));
      await rp.goto(`${O}/social-reading-beta/read/?r=${r.id}`);
      await rp.waitForSelector('[data-route-article][data-parity]', { timeout: 15000 }).catch(() => {});
      const parity = await rp.getAttribute('[data-route-article]', 'data-parity');
      rec(`PARITY ${r.oldRoute}`, parity === 'match', parity, g);
      const facts = await rp.evaluate(() => {
        const a = document.querySelector('[data-route-article]');
        const ext = [...a.querySelectorAll('a[href^="http"]')].length;
        const ids = [...document.querySelectorAll('[id]')].map(e => e.id); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
        return { ext, dup, scripts: a.querySelectorAll('script').length, handlers: [...a.querySelectorAll('*')].filter(e => [...e.attributes].some(x => /^on/i.test(x.name))).length,
          jsUrls: [...a.querySelectorAll('[href]')].filter(e => /^javascript:/i.test(e.getAttribute('href'))).length, focusH1: document.activeElement && document.activeElement.tagName === 'H1',
          overflow: [...a.querySelectorAll('img')].filter(i => i.getBoundingClientRect().width > a.getBoundingClientRect().width + 1).length,
          topicNet: a.innerHTML.includes('topic-network') };
      });
      rec(`SOURCES-KEPT ${r.oldRoute}`, facts.ext === r.externalSourceLinks, `${facts.ext}/${r.externalSourceLinks}`, g);
      rec(`SAFE-IMPORT ${r.oldRoute}`, !facts.scripts && !facts.handlers && !facts.jsUrls && !facts.dup.length && !facts.topicNet, JSON.stringify(facts), g);
      rec(`FOCUS-H1 ${r.oldRoute}`, facts.focusH1, '', g);
      rec(`VISUALS-CONTAINED ${r.oldRoute}`, facts.overflow === 0, facts.overflow, g);
      rec(`CSP-CLEAN ${r.oldRoute}`, rcsp.length === 0 && rerr.length === 0, rcsp.concat(rerr).join(' | '), g);
      await rp.close();
      if (failed === before) gpass++;
    }
    rec(`GROUP-CSP ${g}`, csp.length === 0 && errs.length === 0, csp.concat(errs).join(' | '), g);
    await page.close();
    console.log(`GROUP ${g}: ${gpass}/${rs.length} routes all checks pass`);
  }
  // Navigation semantics: library -> read -> Back restores focus to the same card; reload restores scroll
  const p = await ctx.newPage();
  const r0 = bank.routes.find(r => r.oldRoute === '/science/genetics/gen-04/');
  await p.goto(`${O}/social-reading-beta/library/science-core/`);
  await p.click(`#${r0.id} a[data-lib-read]`); await p.waitForSelector('[data-route-article][data-parity="match"]');
  await p.evaluate(() => window.scrollTo(0, 900)); await p.waitForTimeout(400);
  await p.reload(); await p.waitForSelector('[data-route-article][data-parity]'); await p.waitForTimeout(300);
  const y = await p.evaluate(() => window.scrollY);
  rec('READER-RELOAD-SCROLL', Math.abs(y - 900) < 60, y);
  await p.click('[data-route-back]'); await p.waitForURL(/library\/science-core\//);
  await p.waitForTimeout(200);
  rec('BACK-FOCUS-CARD', await p.evaluate(id => document.activeElement && document.activeElement.closest('.srb-lib-item') && document.activeElement.closest('.srb-lib-item').id === id, r0.id), r0.id);
  await p.goForward(); await p.waitForSelector('[data-route-article][data-parity]');
  rec('BROWSER-BACK-FORWARD', p.url().includes('read/?r=' + r0.id), p.url());
  // In-article link to another migrated route stays in shell, keeps original via data attribute
  const inner = await p.locator('[data-route-article] a[data-original-href]').first();
  if (await inner.count()) { const h = await inner.getAttribute('href'); rec('INTERNAL-LINK-IN-SHELL', /\/social-reading-beta\/read\/\?r=RT-/.test(h), h); }
  // Favourite a route; appears in Saved
  await p.click('[data-route-fav]'); await p.goto(`${O}/social-reading-beta/saved/`);
  rec('ROUTE-FAVOURITE-SAVED', await p.locator(`#srb-saved-list a[href="/social-reading-beta/read/?r=${r0.id}"]`).count() === 1);
  // Hostile ids
  await p.goto(`${O}/social-reading-beta/read/?r=%3Cimg%20src=x%3E`); await p.waitForTimeout(200);
  rec('READER-BAD-ID', /No page selected/.test(await p.textContent('[data-route-status]')));
  // Mobile narrow screenshot
  const m = await browser.newPage({ viewport: { width: 360, height: 740 } });
  await m.goto(`${O}/social-reading-beta/read/?r=${r0.id}`); await m.waitForSelector('[data-route-article][data-parity]');
  rec('READER-NARROW-REFLOW', await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), await m.evaluate(() => document.documentElement.scrollWidth));
  await m.screenshot({ path: path.join(out, 'reader-gen-04-360.png') });
  await p.goto(`${O}/social-reading-beta/library/`); await p.screenshot({ path: path.join(out, 'library-1280.png') });
  await browser.close(); srv.close();
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 1));
  console.log(`${results.length - failed}/${results.length} route checks pass`); process.exit(failed ? 1 : 0);
})();
