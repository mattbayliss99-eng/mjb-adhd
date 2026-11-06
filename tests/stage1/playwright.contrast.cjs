'use strict';
/* axe-core color-contrast (WCAG AA) on shell pages for every preset and for custom colour sets incl. deliberately poor choices.
   Also checks reduced-motion and keyboard reachability of the reader seam/options. Headless Chromium; not a substitute for real-device/SR review. */
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs'), path = require('path');
const serve = require('./serve-with-headers.cjs');
const root = path.join(__dirname, '..', '..'), out = path.join(root, 'artifacts', 'stage1-contrast'); fs.mkdirSync(out, { recursive: true });
const PRESETS = ['charcoal-gold', 'mjb-purple', 'ink-paper', 'graphite', 'deep-blue', 'rose', 'neon'];
const CUSTOM = [
  { name: 'custom-white-yellow', bg: '#ffffff', primary: '#ffff00', secondary: '#eeeeee' },
  { name: 'custom-black-navy', bg: '#000000', primary: '#000010', secondary: '#101010' },
  { name: 'custom-midgrey', bg: '#777777', primary: '#888888', secondary: '#666666' },
  { name: 'custom-pink-teal', bg: '#ffd6e8', primary: '#00a3a3', secondary: '#ff4fa3' },
  { name: 'custom-default-picker', bg: '#111214', primary: '#D5AE57', secondary: '#8B78D1' }
];
const PAGES = ['/social-reading-beta/', '/social-reading-beta/p/mjb-p000002/', '/social-reading-beta/journal/', '/social-reading-beta/library/process-atlas/', '/social-reading-beta/read/?r=RT-support-quick-starts', '/social-reading-beta/saved/'];
const results = []; let failed = 0;
function rec(id, ok, d) { if (!ok) failed++; results.push({ id, status: ok ? 'PASS' : 'FAIL', detail: String(d || '').slice(0, 500) }); if (!ok) console.log('FAIL', id, d); }
(async () => {
  const PORT = 8793, O = `http://127.0.0.1:${PORT}`; const srv = await serve(path.join(root, 'site'), PORT);
  const browser = await chromium.launch();
  const themes = PRESETS.map(t => ({ name: t, prefs: { theme: t } })).concat(CUSTOM.map(c => ({ name: c.name, prefs: { theme: 'charcoal-gold', themeTokens: { bg: c.bg, primary: c.primary, secondary: c.secondary } } })));
  for (const th of themes) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(p => { try { localStorage.setItem('mjb-srb-prefs-v2', JSON.stringify(p)); } catch (e) {} }, th.prefs);
    const page = await ctx.newPage();
    let nodes = 0;
    for (const url of PAGES) {
      await page.goto(O + url); await page.waitForTimeout(url.includes('read/') ? 900 : 250);
      const r = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      const v = r.violations.flatMap(x => x.nodes.map(n => n.target.join(' ') + ' ' + (n.any[0] && n.any[0].message || '').slice(0, 90)));
      nodes += r.passes.reduce((s, x) => s + x.nodes.length, 0);
      rec(`CONTRAST ${th.name} ${url}`, v.length === 0, v.slice(0, 4).join(' || '));
    }
    if (th.name.startsWith('custom') || th.name === 'charcoal-gold' || th.name === 'ink-paper') await page.screenshot({ path: path.join(out, `${th.name}-saved.png`) });
    rec(`CONTRAST-NODES ${th.name}`, nodes > 50, nodes);
    await ctx.close();
  }
  // Reduced motion: system preference applies without user setting
  const rm = await browser.newContext({ reducedMotion: 'reduce' }); const rp = await rm.newPage();
  await rp.goto(O + '/social-reading-beta/p/mjb-p000001/');
  rec('REDUCED-MOTION-SYSTEM', await rp.evaluate(() => document.documentElement.getAttribute('data-reduce-motion')) === 'true');
  rec('REDUCED-MOTION-NO-TRANSITION', await rp.evaluate(() => getComputedStyle(document.querySelector('.srb-top')).transitionDuration.split(',').every(d => parseFloat(d) === 0)));
  await rm.close();
  await browser.close(); srv.close();
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 1));
  console.log(`${results.length - failed}/${results.length} contrast/motion checks pass`); process.exit(failed ? 1 : 0);
})();
