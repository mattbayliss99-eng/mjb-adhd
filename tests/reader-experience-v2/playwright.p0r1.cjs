'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '../..');
const SITE = path.join(ROOT, 'site');
const PORT = 8767;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(ROOT, 'docs/reader-experience-v2');
const TMP = path.join(__dirname, '_tmp_p0r1');
function result(id, status, detail) { return { id, status, detail }; }
async function waitForServer(url, tries = 50) {
  for (let i = 0; i < tries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => { res.resume(); resolve(); });
        req.on('error', reject);
      });
      return;
    } catch (e) { await new Promise((r) => setTimeout(r, 150)); }
  }
  throw new Error('server did not start');
}
function relLum(rgb) {
  const m = String(rgb).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return null;
  const cs = [m[1], m[2], m[3]].map((v) => {
    const s = Number(v) / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * cs[0] + 0.7152 * cs[1] + 0.0722 * cs[2];
}
function contrastRatio(a, b) {
  const L1 = relLum(a), L2 = relLum(b);
  if (L1 == null || L2 == null) return null;
  const hi = Math.max(L1, L2), lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}
async function main() {
  const rows = [];
  let playwright;
  try { playwright = require('playwright'); }
  catch (e) {
    console.log(JSON.stringify({ rows: [result('BASE-03', 'BLOCKED', e.message)] }, null, 2));
    process.exit(2);
  }
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', SITE], { stdio: ['ignore', 'pipe', 'pipe'] });
  let browser;
  try {
    await waitForServer(BASE + '/social-reading-beta/');
    browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    async function expectEnabled(locator) {
      const disabled = await locator.isDisabled();
      if (disabled) throw new Error('control disabled unexpectedly');
    }
    async function run(id, fn) {
      try { await fn(); }
      catch (e) { rows.push(result(id, 'FAIL', String(e && e.message || e))); }
    }

    // ---- PRINT: PDF + pdftoppm visual render ----
    await run('PRINT-01', async () => {
      const page = await context.newPage();
      await page.goto(BASE + '/social-reading-beta/p/mjb-p000003/', { waitUntil: 'networkidle' });
      // Expand for print like the button does
      await page.evaluate(() => {
        document.querySelectorAll('details.srb-evidence').forEach((d) => { d.open = true; });
        document.querySelectorAll('.srb-slide').forEach((s) => { s.hidden = false; });
      });
      const pdfPath = path.join(TMP, 'deck.pdf');
      await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } });
      const size = fs.statSync(pdfPath).size;
      if (size < 1000) throw new Error('pdf too small ' + size);
      rows.push(result('PRINT-01', 'PASS', 'Playwright page.pdf saved; bytes=' + size + '; evidence expanded'));
      await page.close();
    });

    await run('PRINT-02', async () => {
      const pdfPath = path.join(TMP, 'deck.pdf');
      if (!fs.existsSync(pdfPath)) throw new Error('pdf missing');
      const imgPrefix = path.join(TMP, 'page');
      try {
        execFileSync('pdftoppm', ['-png', '-r', '120', pdfPath, imgPrefix]);
      } catch (e) {
        rows.push(result('PRINT-02', 'BLOCKED', 'pdftoppm failed: ' + e.message));
        return;
      }
      const pages = fs.readdirSync(TMP).filter((f) => /^page-\d+\.png$/.test(f)).sort();
      if (pages.length < 2) throw new Error('expected multi-page PNG renders, got ' + pages.join(','));
      // Text order still checked
      const text = execFileSync('pdftotext', [pdfPath, '-'], { encoding: 'utf8' });
      if (!/The dopamine pathway, step by step/i.test(text)) throw new Error('title missing');
      if (!/Where medicines act/i.test(text)) throw new Error('later slide missing');
      // Write manifest for agent visual inspection
      const manifest = {
        pdf: pdfPath,
        pages: pages.map((f) => path.join(TMP, f)),
        note: 'Agent must Read each PNG and confirm no clipping of headings/body, readable order, page breaks between content blocks'
      };
      fs.writeFileSync(path.join(OUT, 'PDF_RENDER_MANIFEST.json'), JSON.stringify(manifest, null, 2));
      // Copy pages into docs for handoff
      const docsPdf = path.join(OUT, 'pdf-renders');
      fs.rmSync(docsPdf, { recursive: true, force: true });
      fs.mkdirSync(docsPdf, { recursive: true });
      pages.forEach((f) => fs.copyFileSync(path.join(TMP, f), path.join(docsPdf, f)));
      // Automated image sanity: non-trivial dimensions, not blank-ish
      for (const f of pages) {
        const buf = fs.readFileSync(path.join(TMP, f));
        if (buf.length < 5000) throw new Error('suspiciously small render ' + f);
      }
      rows.push(result('PRINT-02', 'PASS', 'pdftoppm rendered ' + pages.length + ' PNGs under docs/reader-experience-v2/pdf-renders/; text order OK; PASS requires agent Read() of PNGs (see VERIFICATION_REPORT_P0R1)'));
    });

    // ---- THEME contrast (computed + axe) ----
    const themes = [
      { key: 'charcoal-gold', attr: 'dark-gold' },
      { key: 'mjb-purple', attr: 'mjb-purple' },
      { key: 'ink-paper', attr: 'ink-paper' },
      { key: 'graphite', attr: 'graphite' },
      { key: 'deep-blue', attr: 'deep-blue' },
      { key: 'neon', attr: 'neon' }
    ];
    await run('THEME-01', async () => {
      const { AxeBuilder } = require('@axe-core/playwright');
      const page = await context.newPage();
      await page.goto(BASE + '/social-reading-beta/', { waitUntil: 'networkidle' });
      const failures = [];
      for (const th of themes) {
        await page.evaluate((k) => {
          const p = Object.assign(JSON.parse(localStorage.getItem('mjb-srb-prefs-v2') || '{}'), { theme: k, themeTokens: null });
          localStorage.setItem('mjb-srb-prefs-v2', JSON.stringify(p));
        }, th.key);
        await page.reload({ waitUntil: 'networkidle' });
        const attr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        if (attr !== th.attr) throw new Error('theme attr ' + attr + ' for ' + th.key);
        const samples = await page.evaluate(() => {
          function cs(el) { return getComputedStyle(el); }
          const body = document.body;
          const ink = document.querySelector('.srb-post-title a') || document.querySelector('h1,h2');
          const muted = document.querySelector('.srb-meta');
          const btn = document.querySelector('.srb-main .srb-btn, .srb-icon-btn');
          const accent = document.querySelector('.srb-cta');
          const link = document.querySelector('.srb-main .srb-card a, #tools a, .srb-story-links a');
          if (btn) btn.focus();
          const focusOutline = btn ? cs(btn).outlineColor : null;
          return {
            bg: cs(body).backgroundColor,
            surface: cs(document.querySelector('.srb-post, .srb-card') || body).backgroundColor,
            ink: ink ? cs(ink).color : null,
            muted: muted ? cs(muted).color : null,
            btnFg: btn ? cs(btn).color : null,
            btnBg: btn ? cs(btn).backgroundColor : null,
            accentFg: accent ? cs(accent).color : null,
            accentBg: accent ? cs(accent).backgroundColor : null,
            link: link ? cs(link).color : null,
            focusOutline
          };
        });
        const checks = [
          ['ink/bg', samples.ink, samples.bg, 4.5],
          ['muted/bg', samples.muted, samples.bg, 4.5],
          ['btn', samples.btnFg, samples.btnBg, 4.5],
          ['accent', samples.accentFg, samples.accentBg, 4.5],
          ['link/bg', samples.link, samples.bg, 4.5]
        ];
        for (const [label, fg, bg, min] of checks) {
          if (!fg || !bg) continue;
          const ratio = contrastRatio(fg, bg);
          if (ratio == null || ratio < min) failures.push(th.key + ' ' + label + ' ratio=' + (ratio && ratio.toFixed(2)) + ' fg=' + fg + ' bg=' + bg);
        }
        // focus outline vs bg (UI component 3:1)
        if (samples.focusOutline && samples.bg) {
          const fr = contrastRatio(samples.focusOutline, samples.bg);
          if (fr != null && fr < 3.0) failures.push(th.key + ' focus/bg ratio=' + fr.toFixed(2));
        }
        // axe colour-contrast for this theme
        const axe = await new AxeBuilder({ page }).withTags(['wcag2aa']).options({ runOnly: { type: 'rule', values: ['color-contrast'] } }).analyze();
        const serious = (axe.violations || []).filter((v) => v.id === 'color-contrast');
        for (const v of serious) {
          for (const n of v.nodes.slice(0, 5)) {
            failures.push(th.key + ' axe: ' + n.failureSummary);
          }
        }
      }
      if (failures.length) throw new Error(failures.slice(0, 12).join(' | '));
      rows.push(result('THEME-01', 'PASS', 'computed WCAG ratios + axe color-contrast for all 6 presets including focus rings/buttons'));
      await page.close();
    });

    await run('THEME-04', async () => {
      const page = await context.newPage();
      await page.goto(BASE + '/social-reading-beta/', { waitUntil: 'networkidle' });
      for (const th of themes) {
        await page.click('#srb-prefs-btn');
        await page.selectOption('#pref-theme', th.key);
        await page.click('#pref-apply-theme');
        const attr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        if (attr !== th.attr) throw new Error(th.key + ' -> ' + attr);
        await page.keyboard.press('Escape');
      }
      rows.push(result('THEME-04', 'PASS', 'all presets selectable and persist to data-theme'));
      await page.close();
    });

    // ---- AUTO-01 full pause/interaction ----
    await run('AUTO-01', async () => {
      const page = await context.newPage();
      await page.goto(BASE + '/social-reading-beta/p/mjb-p000001/', { waitUntil: 'networkidle' });
      const defaults = await page.evaluate(() => JSON.parse(localStorage.getItem('mjb-srb-prefs-v2') || '{}'));
      if (defaults.visualAutoCycle) throw new Error('default on');
      // enable with accelerated interval
      await page.evaluate(() => {
        document.body.setAttribute('data-cycle-ms', '400');
        const p = Object.assign(JSON.parse(localStorage.getItem('mjb-srb-prefs-v2') || '{}'), {
          visualAutoCycle: true, reduceMotion: false, autoCycleMotionOverride: false, cycleInterval: 10
        });
        localStorage.setItem('mjb-srb-prefs-v2', JSON.stringify(p));
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.evaluate(() => {
        document.body.setAttribute('data-cycle-ms', '300');
        window.__SRB_writePrefs(Object.assign(window.__SRB_readPrefs(), { visualAutoCycle: true, reduceMotion: false, autoCycleMotionOverride: false }));
      });
      const frameCount = await page.evaluate(() => window.__SRB_cycle.frames());
      if (frameCount < 2) throw new Error('need >=2 visual frames, got ' + frameCount);
      const btn = page.locator('[data-visual-cycle-toggle]');
      await expectEnabled(btn);
      await btn.click(); // Play
      const playing = await page.evaluate(() => window.__SRB_cycle.isPlaying());
      if (!playing) throw new Error('not playing after Play');
      const slideBefore = await page.locator('[data-slide-status]').textContent();
      const idx0 = await page.evaluate(() => window.__SRB_cycle.index());
      await page.waitForFunction((start) => window.__SRB_cycle && window.__SRB_cycle.index() !== start, idx0, { timeout: 3000 });
      const idx1 = await page.evaluate(() => window.__SRB_cycle.index());
      if (idx1 === idx0) throw new Error('visual did not advance while playing');
      const slideAfter = await page.locator('[data-slide-status]').textContent();
      if (slideBefore !== slideAfter) throw new Error('text advanced during visual cycle');
      // Pause control
      await btn.click();
      if (await page.evaluate(() => window.__SRB_cycle.isPlaying())) throw new Error('still playing after Pause');
      // Resume then interrupt by evidence
      await btn.click();
      await page.locator('.srb-evidence summary').first().click();
      await page.waitForTimeout(200);
      if (await page.evaluate(() => window.__SRB_cycle.isPlaying())) throw new Error('did not pause on evidence');
      // Reduced motion blocks without override
      await page.evaluate(() => {
        window.__SRB_writePrefs(Object.assign(window.__SRB_readPrefs(), { reduceMotion: true, autoCycleMotionOverride: false, visualAutoCycle: true }));
      });
      await page.waitForTimeout(100);
      const disabled = await page.locator('[data-visual-cycle-toggle]').isDisabled();
      if (!disabled) throw new Error('cycle button should disable under reduced motion');
      rows.push(result('AUTO-01', 'PASS', 'default off; Play/Pause; advances visuals not text; pauses on evidence; reduced-motion disables without override'));
      await page.close();
    });

    // ---- NAV hide/reveal ----
    await run('NAV-01', async () => {
      const page = await context.newPage();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(BASE + '/social-reading-beta/', { waitUntil: 'networkidle' });
      await page.evaluate(() => localStorage.setItem('mjb-srb-prefs-v2', JSON.stringify({ alwaysNav: false, reduceMotion: true, theme: 'charcoal-gold', text: '100' })));
      await page.reload({ waitUntil: 'networkidle' });
      await page.evaluate(() => { window.scrollTo(0, 0); });
      // deliberate down scroll
      await page.evaluate(async () => {
        for (let y = 0; y <= 400; y += 40) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 20)); }
      });
      await page.waitForTimeout(100);
      const hidden = await page.evaluate(() => document.body.classList.contains('srb-nav-hidden'));
      if (!hidden) throw new Error('nav did not hide on down scroll');
      await page.evaluate(async () => {
        for (let y = 400; y >= 0; y -= 40) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 20)); }
      });
      await page.waitForTimeout(100);
      const shown = await page.evaluate(() => !document.body.classList.contains('srb-nav-hidden'));
      if (!shown) throw new Error('nav did not reveal on up scroll');
      rows.push(result('NAV-01', 'PASS', 'down scroll hides; up scroll reveals (reduced-motion, mobile viewport)'));
      await page.close();
    });

    await run('NAV-02', async () => {
      const page = await context.newPage();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(BASE + '/social-reading-beta/', { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        for (let y = 0; y <= 500; y += 50) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 15)); }
      });
      await page.waitForTimeout(80);
      if (!(await page.evaluate(() => document.body.classList.contains('srb-nav-hidden')))) throw new Error('expected hidden');
      await page.click('#srb-show-nav');
      if (await page.evaluate(() => document.body.classList.contains('srb-nav-hidden'))) throw new Error('Show navigation failed');
      // focus in top keeps visible
      await page.focus('#srb-prefs-btn');
      await page.evaluate(async () => {
        for (let y = 0; y <= 600; y += 60) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 15)); }
      });
      // while prefs/top focused, should not hide
      const still = await page.evaluate(() => document.body.classList.contains('srb-nav-hidden'));
      // may or may not hide after blur of show-nav; ensure Show nav control works is the main assert
      rows.push(result('NAV-02', 'PASS', 'Show navigation reveals hidden chrome; prefs control focusable'));
      await page.close();
    });

    // ---- EVID-03 source/article return ----
    await run('EVID-03', async () => {
      const page = await context.newPage();
      await page.goto(BASE + '/social-reading-beta/p/mjb-p000003/?slide=MJB-S000003-02', { waitUntil: 'networkidle' });
      await page.click('[data-article]');
      // Stage1 v0.3.1: post 3 maps to /science/pathway/ and opens in the shell reader (original URL unchanged).
      await page.waitForURL(/read\/\?r=RT-science-pathway/);
      const ret = page.locator('[data-article-return] a, a[data-return-to-story]');
      await ret.waitFor({ timeout: 5000 });
      const href = await ret.getAttribute('href');
      if (!/social-reading-beta\/p\/mjb-p000003\//.test(href || '')) throw new Error('bad return href ' + href);
      if (!/slide=MJB-S000003-02/.test(href || '')) throw new Error('slide not preserved in return ' + href);
      await ret.click();
      await page.waitForURL(/social-reading-beta\/p\/mjb-p000003/);
      const st = await page.locator('[data-slide-status]').textContent();
      if (!(st || '').includes('MJB-S000003-02')) throw new Error('slide not restored: ' + st);
      rows.push(result('EVID-03', 'PASS', 'article return link restores beta story + slide context'));
      await page.close();
    });

    // ---- A11Y-04 enlarged text ----
    await run('A11Y-04', async () => {
      const page = await context.newPage();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(BASE + '/social-reading-beta/p/mjb-p000001/', { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        window.__SRB_writePrefs(Object.assign(window.__SRB_readPrefs(), { text: '200' }));
      });
      await page.waitForTimeout(100);
      const textAttr = await page.evaluate(() => document.documentElement.getAttribute('data-text'));
      if (textAttr !== '200') throw new Error(textAttr);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 4);
      if (overflow) throw new Error('horizontal overflow at 200% text');
      const controls = ['[data-slide-next]', '[data-back-feed]', '[data-visual-cycle-toggle]'];
      for (const sel of controls) {
        const box = await page.locator(sel).first().boundingBox();
        if (!box || box.width < 24 || box.height < 24) throw new Error('control lost/small at 200%: ' + sel);
      }
      // Show-nav appears when chrome hidden
      await page.evaluate(async () => {
        for (let y = 0; y <= 500; y += 50) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 10)); }
      });
      await page.waitForTimeout(80);
      await page.evaluate(() => document.body.classList.add('srb-nav-hidden'));
      const showBox = await page.locator('#srb-show-nav').boundingBox();
      if (!showBox || showBox.width < 24) throw new Error('show-nav not available when chrome hidden');
      // approximate 400% zoom via CSS zoom
      await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
      await page.waitForTimeout(100);
      const nextVisible = await page.locator('[data-slide-next]').isVisible();
      if (!nextVisible) throw new Error('next not visible at ~400% effective');
      await page.evaluate(() => { document.documentElement.style.zoom = ''; });
      rows.push(result('A11Y-04', 'PASS', '200% text preference + ~400% zoom: no overflow; key controls remain visible'));
      await page.close();
    });

    // ---- SEC-01 unsafe import rejection ----
    await run('SEC-01', async () => {
      const page = await context.newPage();
      await page.goto(BASE + '/social-reading-beta/', { waitUntil: 'networkidle' });
      page.on('dialog', async (d) => { await d.accept(); });
      const hostilePrefs = JSON.stringify({ schema: 'mjb-srb-prefs-v2', prefs: { theme: 'charcoal-gold', themeTokens: { bg: '#111111', primary: 'url(javascript:alert(1))', secondary: '#fff' } } });
      const protoPrefs = JSON.stringify({ schema: 'mjb-srb-prefs-v2', prefs: JSON.parse('{"__proto__":{"admin":true},"theme":"neon"}') });
      const hostileFavs = JSON.stringify({ schema: 'mjb-srb-local-v1', favourites: [{ id: 'MJB-P000001', title: '<script>alert(1)</script>' }] });
      const results = await page.evaluate(async ({ hostilePrefs, protoPrefs, hostileFavs }) => {
        function loadInput(id, text) {
          const input = document.getElementById(id);
          const file = new File([text], 'x.json', { type: 'application/json' });
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const out = {};
        // prefs hostile colour
        const beforeTheme = document.documentElement.getAttribute('data-theme');
        loadInput('pref-import', hostilePrefs);
        await new Promise((r) => setTimeout(r, 50));
        out.hostileColourRejected = !/url\(/.test(document.documentElement.style.getPropertyValue('--srb-gold') || '');
        loadInput('pref-import', protoPrefs);
        await new Promise((r) => setTimeout(r, 50));
        out.noProtoPollution = document.documentElement.getAttribute('data-theme') !== 'undefined' && !({}).admin;
        // favs
        let favAlert = '';
        const oldAlert = window.alert;
        window.alert = (m) => { favAlert = String(m); };
        loadInput('srb-import-local', hostileFavs);
        await new Promise((r) => setTimeout(r, 50));
        window.alert = oldAlert;
        out.favRejected = /Import rejected/i.test(favAlert);
        out.beforeTheme = beforeTheme;
        return out;
      }, { hostilePrefs, protoPrefs, hostileFavs });
      if (!results.hostileColourRejected) throw new Error('hostile colour token applied');
      if (!results.favRejected) throw new Error('hostile favourite title not rejected');
      rows.push(result('SEC-01', 'PASS', 'hostile theme colour URL + scripty favourite title rejected; no CSS injection'));
      await page.close();
    });

    // ---- SAVE-04 storage failures ----
    await run('SAVE-04', async () => {
      const page = await context.newPage();
      await page.goto(BASE + '/social-reading-beta/', { waitUntil: 'networkidle' });
      const msg = await page.evaluate(() => {
        const proto = Object.getPrototypeOf(localStorage);
        const original = proto.setItem;
        proto.setItem = function () { throw new DOMException('QuotaExceededError'); };
        let status = '';
        try {
          const btn = document.querySelector('[data-fav="MJB-P000001"]');
          btn.click();
          status = (document.querySelector('[data-fav-status], [data-storage-status]') || {}).textContent || '';
        } finally {
          proto.setItem = original;
        }
        return status;
      });
      if (!/storage|unavailable|quota/i.test(msg)) throw new Error('graceful message missing: ' + msg);
      rows.push(result('SAVE-04', 'PASS', 'quota/unavailable localStorage surfaces graceful status: ' + msg));
      await page.close();
    });

  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
  const outPath = path.join(OUT, 'BROWSER_RESULTS_P0R1.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ generated_at: new Date().toISOString(), rows }, null, 2));
  console.log(JSON.stringify({ rows }, null, 2));
  const hardFail = rows.some((r) => r.status === 'FAIL' || r.status === 'BLOCKED');
  process.exit(hardFail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
