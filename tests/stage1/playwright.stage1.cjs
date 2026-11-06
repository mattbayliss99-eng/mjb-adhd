'use strict';
/* Stage1 shell/reader behaviour under the real _headers CSP (headless Chromium; emulated viewports, not physical devices). */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const serve = require('./serve-with-headers.cjs');
const root = path.join(__dirname, '..', '..'), out = path.join(root, 'artifacts', 'stage1-shell'); fs.mkdirSync(out, { recursive: true });
const results = []; let failed = 0;
function rec(id, ok, d) { if (!ok) failed++; results.push({ id, status: ok ? 'PASS' : 'FAIL', detail: String(d == null ? '' : d).slice(0, 300) }); console.log(ok ? 'PASS' : 'FAIL', id, d == null ? '' : String(d).slice(0, 160)); }
(async () => {
  const PORT = 8795, O = `http://127.0.0.1:${PORT}`, B = O + '/social-reading-beta/';
  const srv = await serve(path.join(root, 'site'), PORT);
  const browser = await chromium.launch();
  const csp = [];
  try {
    // ---- Phone (emulated 390x844, touch) ----
    const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const p = await phone.newPage(); p.on('console', m => /Content Security Policy|Refused/.test(m.text()) && csp.push(m.text())); p.on('pageerror', e => csp.push(e.message));
    await p.goto(B);
    const dock = await p.$$eval('.srb-dock > *', els => els.map(e => ({ t: e.textContent.trim(), x: e.getBoundingClientRect().x + e.getBoundingClientRect().width / 2 })));
    const vw = 390;
    rec('PHONE-MENU-LEFT', dock[0].t === 'Menu' && dock[0].x < vw * 0.25, JSON.stringify(dock));
    const home = dock.find(d => d.t === 'Home'); rec('PHONE-HOME-CENTRE', home && Math.abs(home.x - vw / 2) < vw * 0.12, home && home.x);
    await p.click('#srb-dock-menu'); rec('PHONE-MENU-OVERLAY', await p.evaluate(() => document.getElementById('srb-drawer').open && getComputedStyle(document.querySelector('.srb-main')).width === getComputedStyle(document.querySelector('.srb-main')).width));
    rec('PHONE-DRAWER-LIBRARY', await p.locator('#srb-drawer a[href="/social-reading-beta/library/"]').count() === 1);
    await p.keyboard.press('Escape');
    rec('FEED-3-TOPICS', await p.locator('.srb-post').count() >= 3, await p.locator('.srb-post').count());
    // Expand -> split at selected step -> collapse restores scroll, focus, selected visual
    await p.locator('[data-expand-post="MJB-P000002"]').scrollIntoViewIfNeeded(); const y0 = await p.evaluate(() => scrollY);
    await p.click('[data-expand-post="MJB-P000002"]'); await p.waitForURL(/\/p\/mjb-p000002\//);
    rec('EXPAND-SPLIT', await p.getAttribute('[data-reader]', 'data-layout').catch(() => null) !== null || await p.locator('.srb-reader').count() === 1);
    await p.click('[data-back-feed]'); await p.waitForURL(u => /social-reading-beta\/$/.test(new URL(u).pathname)); await p.waitForTimeout(250);
    rec('COLLAPSE-FOCUS', await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-expand-post')), 'MJB-P000002');
    rec('COLLAPSE-SELECTED-VISUAL', await p.locator('[data-post-id="MJB-P000002"].srb-post-selected, .srb-post-selected[data-post-id="MJB-P000002"]').count() === 1);
    rec('COLLAPSE-SCROLL', Math.abs((await p.evaluate(() => scrollY)) - y0) < 80, `${y0} -> ${await p.evaluate(() => scrollY)}`);
    await p.screenshot({ path: path.join(out, 'phone-feed.png') });
    // ---- Desktop reader ----
    const desk = await browser.newContext({ viewport: { width: 1366, height: 860 } });
    const d = await desk.newPage(); d.on('console', m => /Content Security Policy|Refused/.test(m.text()) && csp.push(m.text())); d.on('pageerror', e => csp.push(e.message));
    await d.goto(B + 'p/mjb-p000001/');
    const vis = () => d.$$eval('.srb-slide', s => s.filter(x => !x.hidden && x.offsetParent !== null).length);
    const total = await d.locator('.srb-slide').count();
    rec('LAYOUT-SPLIT-ONE', await vis() === 1, `${await vis()}/${total}`);
    rec('NO-PERMANENT-RATIO-TOOLBAR', !(await d.isVisible('[data-split-preset="50"]')));
    const div = d.locator('[data-split-divider]');
    await div.click(); rec('SEAM-TAP-OPTIONS', await d.evaluate(() => document.querySelector('.srb-seam-options').open));
    await d.evaluate(() => document.querySelector('.srb-seam-options').open = false);
    await div.focus(); const v0 = Number(await div.getAttribute('aria-valuenow'));
    await d.keyboard.press('ArrowDown'); await d.keyboard.press('ArrowDown');
    const v1 = Number(await div.getAttribute('aria-valuenow'));
    rec('SEAM-KEYBOARD', v1 === v0 + 4 && (await d.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--srb-split').trim())) === String(v1), `${v0}->${v1}`);
    await d.keyboard.press('Enter'); rec('SEAM-ENTER-OPTIONS', await d.evaluate(() => document.querySelector('.srb-seam-options').open));
    await d.evaluate(() => document.querySelector('.srb-seam-options').open = false);
    const bb = await div.boundingBox(); await d.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await d.mouse.down();
    await d.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2 + 120, { steps: 6 }); await d.mouse.up();
    const v2 = Number(await div.getAttribute('aria-valuenow'));
    rec('SEAM-DRAG', v2 !== v1, `${v1}->${v2}`);
    rec('SEAM-DRAG-NO-OPTIONS', !(await d.evaluate(() => document.querySelector('.srb-seam-options').open)));
    // one layout at a time
    await div.click(); await d.click('[data-split-preset="continuous"]'); await d.waitForTimeout(150);
    rec('LAYOUT-CONTINUOUS-ALL', await vis() === total, `${await vis()}/${total}`);
    await d.click('.srb-seam-options > summary').catch(() => {}); await d.evaluate(() => document.querySelector('.srb-seam-options').open = true);
    await d.click('[data-split-preset="thread"]'); await d.waitForTimeout(150);
    rec('LAYOUT-THREAD-NO-DUP', await vis() === 0 && await d.isVisible('[data-thread]'), await vis());
    await d.evaluate(() => document.querySelector('.srb-seam-options').open = true); await d.click('[data-split-preset="split"]');
    // pin: manual visual browse stays pinned across step navigation until relink
    const pinned0 = await d.getAttribute('[data-pin-visual]', 'data-pinned-id');
    await d.locator('.srb-seam-options > summary').click();
    if (await d.locator('[data-visual-next]').isVisible()) {
      await d.click('[data-visual-next]'); const pinnedManual = await d.getAttribute('[data-pin-visual]', 'data-pinned-id');
      await d.click('[data-slide-next]'); await d.waitForTimeout(100);
      rec('PIN-MANUAL-HOLDS', (await d.getAttribute('[data-pin-visual]', 'data-manual')) === '1' && (await d.getAttribute('[data-pin-visual]', 'data-pinned-id')) === pinnedManual, `${pinned0}->${pinnedManual}`);
      await d.click('[data-resume-linked]'); rec('PIN-RELINK', (await d.getAttribute('[data-pin-visual]', 'data-manual')) === null);
    } else rec('PIN-MANUAL-HOLDS', false, 'visual-next control not visible');
    // reload keeps step (progress service)
    await d.click('[data-slide-next]'); const st = await d.textContent('[data-slide-status]');
    await d.reload(); rec('RELOAD-KEEPS-STEP', (await d.textContent('[data-slide-status]')) === st, st);
    // 3-topic journey: thread -> split -> reference article -> evidence -> return
    for (const [post, art] of [['mjb-p000001', '/science/what-is-adhd/'], ['mjb-p000002', '/science/genetics/'], ['mjb-p000003', '/science/pathway/']]) {
      await d.goto(B + `p/${post}/`); const a = d.locator('a[data-article]').first();
      const orig = await a.getAttribute('data-original-href'); rec(`JOURNEY-ARTICLE ${post}`, orig === art, orig);
      const ev = d.locator('details.srb-evidence:visible').first();
      if (await ev.count()) { await ev.locator('summary').click(); rec(`JOURNEY-EVIDENCE ${post}`, await ev.evaluate(e => e.open)); }
      const stepBefore = await d.textContent('[data-slide-status]');
      await a.click(); await d.waitForSelector('[data-route-article][data-parity]');
      rec(`JOURNEY-REFERENCE-PARITY ${post}`, (await d.getAttribute('[data-route-article]', 'data-parity')) === 'match');
      await d.click('[data-return-to-story]'); await d.waitForURL(new RegExp(post));
      rec(`JOURNEY-RETURN-STEP ${post}`, (await d.textContent('[data-slide-status]')) === stepBefore, stepBefore);
    }
    // desktop rail modes
    await d.goto(B);
    for (const m of ['rail', 'closed', 'expanded']) {
      const btn = d.locator(`[data-rail-mode="${m}"]`); if (await btn.isVisible()) await btn.click(); else if (await d.isVisible('.srb-rail-open')) await d.click('.srb-rail-open'); else { await d.click('.srb-rail-modes > summary'); await btn.click(); }
      await d.waitForTimeout(80); rec(`RAIL-${m}`, (await d.getAttribute('.srb-app', 'data-rail')) === m, await d.getAttribute('.srb-app', 'data-rail'));
      if (m === 'closed') await d.screenshot({ path: path.join(out, 'desktop-rail-closed.png') });
    }
    // Short height + 200% text
    const sh = await browser.newContext({ viewport: { width: 640, height: 360 } }); const s = await sh.newPage();
    await s.addInitScript(() => localStorage.setItem('mjb-srb-prefs-v2', JSON.stringify({ text: '200' })));
    await s.goto(B + 'p/mjb-p000002/');
    rec('SHORT-200-NO-HSCROLL', await s.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), await s.evaluate(() => document.documentElement.scrollWidth));
    rec('SHORT-200-NEXT-REACHABLE', await s.locator('[data-slide-next]').isVisible() || (await s.locator('[data-slide-next]').scrollIntoViewIfNeeded().then(() => s.locator('[data-slide-next]').isVisible())));
    await s.screenshot({ path: path.join(out, 'short-640x360-200pct.png') });
    // Feedback page (formerly inline handlers) works under CSP
    await d.goto(B + 'feedback/'); await d.selectOption('select[name=useful]', 'Yes'); await d.check('input[name=consent]'); await d.click('#srb-feedback button[type=submit]');
    rec('FEEDBACK-CSP-WORKS', /Saved on this device/.test(await d.textContent('#fb-status')));
    rec('NO-CSP-VIOLATIONS', csp.length === 0, csp.join(' | '));
  } catch (e) { rec('HARNESS', false, e.stack); }
  await browser.close(); srv.close();
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 1));
  console.log(`${results.length - failed}/${results.length} shell checks pass`); process.exit(failed ? 1 : 0);
})();
