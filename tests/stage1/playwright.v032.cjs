'use strict';
// v0.3.2: topic excerpt cards, source-passage links, deck layout, rose preset, help text; screenshots.
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs'); const assert = require('assert');
const serve = require('./serve-with-headers.cjs');
const ROOT = path.join(__dirname, '../..'); const OUT = path.join(ROOT, 'artifacts/stage1-v032');
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/posts/posts.json'), 'utf8'));
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const port = 4917; const srv = await serve(path.join(ROOT, 'site'), port); const B = 'http://127.0.0.1:' + port;
  const browser = await chromium.launch(); const rows = []; const errs = [];
  const ok = (id, cond, d) => { rows.push({ id, status: cond ? 'PASS' : 'FAIL', detail: d }); };
  try {
    for (const vp of [{ w: 390, h: 844 }, { w: 1280, h: 900 }]) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } }); const page = await ctx.newPage();
      page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', (e) => errs.push(String(e)));
      for (const p of bank.posts) {
        await page.goto(B + '/social-reading-beta/p/' + p.id.toLowerCase() + '/', { waitUntil: 'networkidle' });
        const s1 = p.slides[0];
        const body = await page.locator('.srb-slide:not([hidden]) .srb-slide-body').allTextContents();
        ok('V032-EXCERPT-' + p.id + '-' + vp.w, body.join(' ') === s1.blocks.filter((b) => !b.qualification).map((b) => b.text).join(' '), 'visible step 1 = bank verbatim blocks');
        const link = page.locator('.srb-slide:not([hidden]) [data-source-passage]');
        const href = await link.getAttribute('href');
        ok('V032-PASSAGE-' + p.id + '-' + vp.w, /^\/social-reading-beta\/read\/\?r=RT-/.test(href), href);
        const imgOk = await page.locator('[data-visual-slot]').evaluate((i) => i.complete && i.naturalWidth > 0);
        ok('V032-VISUAL-' + p.id + '-' + vp.w, imgOk, await page.locator('[data-visual-slot]').getAttribute('src'));
        const stale = await page.locator('main').innerText();
        ok('V032-NOSTALE-' + p.id + '-' + vp.w, !/three short introductions|do not make biomedical claims|Editorial interface copy/i.test(stale), 'no old interface cards');
        if (vp.w === 390) await page.screenshot({ path: path.join(OUT, `reader-${p.id.toLowerCase()}-390.png`) });
      }
      // help disclosure
      await page.goto(B + '/social-reading-beta/p/mjb-p000002/', { waitUntil: 'networkidle' });
      await page.locator('.srb-seam-options > summary').click();
      await page.locator('.srb-help summary').click();
      ok('V032-HELP-' + vp.w, await page.locator('.srb-help li').count() === 4, 'help lists interface instructions');
      // passage link opens the reader on the right route
      const href = await page.locator('.srb-slide:not([hidden]) [data-source-passage]').getAttribute('href');
      await page.goto(B + href, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      const txt = await page.locator('main').innerText();
      ok('V032-PASSAGE-OPENS-' + vp.w, txt.includes('Keeping those two pictures apart'), page.url());
      // deck layout
      await page.goto(B + '/social-reading-beta/p/mjb-p000001/', { waitUntil: 'networkidle' });
      await page.locator('.srb-seam-options > summary').click();
      await page.locator('[data-split-preset="deck"]').click();
      await page.waitForTimeout(200);
      ok('V032-DECK-LAYOUT-' + vp.w, await page.locator('.srb-reader').getAttribute('data-layout') === 'deck', 'deck applied');
      ok('V032-DECK-VISUAL-S1-' + vp.w, await page.locator('.srb-upper').isVisible(), 'step 1 has mapped visual → shown');
      ok('V032-DECK-DIVIDER-' + vp.w, !(await page.locator('[data-split-divider]').isVisible()), 'no seam in deck');
      await page.locator('[data-slide-next]').click(); await page.waitForTimeout(150);
      ok('V032-DECK-NOVISUAL-S2-' + vp.w, !(await page.locator('.srb-upper').isVisible()), 'step 2 no mapped visual → hidden');
      ok('V032-DECK-ONECARD-' + vp.w, await page.locator('.srb-slide:not([hidden])').count() === 1, 'one card');
      const ov = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
      ok('V032-DECK-NOOVERFLOW-' + vp.w, ov, 'no horizontal overflow');
      if (vp.w === 390) await page.screenshot({ path: path.join(OUT, 'deck-p000001-step2-390.png') });
      await page.locator('[data-slide-prev]').click(); await page.waitForTimeout(150);
      if (vp.w === 390) await page.screenshot({ path: path.join(OUT, 'deck-p000001-step1-390.png') });
      await page.reload({ waitUntil: 'networkidle' });
      ok('V032-DECK-PERSIST-' + vp.w, await page.locator('.srb-reader').getAttribute('data-layout') === 'deck', 'saved pref');
      await page.evaluate(() => localStorage.clear());
      // posts-preview no stale
      await page.goto(B + '/posts-preview/p/mjb-p000003/', { waitUntil: 'networkidle' });
      ok('V032-POSTS-PREVIEW-' + vp.w, (await page.locator('main').innerText()).includes('This is a map of how one dopamine-releasing nerve cell'), 'earlier preview shows excerpt');
      // journal intro text
      await page.goto(B + '/social-reading-beta/journal/', { waitUntil: 'networkidle' });
      ok('V032-JOURNAL-INTRO-' + vp.w, (await page.locator('.srb-journal-intro').innerText()).startsWith('Dates and times are added automatically.'), 'owner text');
      await ctx.close();
    }
    ok('V032-NO-CONSOLE-ERRORS', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await browser.close(); srv.close(); }
  fs.writeFileSync(path.join(OUT, 'v032-results.json'), JSON.stringify(rows, null, 2));
  const pass = rows.filter((r) => r.status === 'PASS').length;
  rows.filter((r) => r.status !== 'PASS').forEach((r) => console.log('FAIL', r.id, r.detail));
  console.log(pass + '/' + rows.length + ' v0.3.2 checks pass'); process.exit(pass === rows.length ? 0 : 1);
})();
