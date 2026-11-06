'use strict';
/* Rigorous journal checks in real headless Chromium. Quota/denial are injected (emulated) storage failures, labelled as such. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn, execFileSync } = require('child_process');
const root = path.join(__dirname, '..', '..');
const out = path.join(root, 'artifacts', 'stage1-journal'); fs.mkdirSync(out, { recursive: true });
const results = []; let failed = 0;
function rec(id, ok, detail) { const s = ok ? 'PASS' : 'FAIL'; if (!ok) failed++; results.push({ id, status: s, detail: String(detail || '').slice(0, 400) }); console.log(s, id, detail || ''); }
const PORT = 8771, URL0 = `http://127.0.0.1:${PORT}/social-reading-beta/journal/`;
const LONG = (n) => Array.from({ length: n }, (_, i) => `Synthetic paragraph ${i + 1}. This is fixture text written for print testing only; it contains no personal information. Pagination should flow it across pages without clipping.`).join('\n\n');
const FIX = {
  format: 'mjb-journal-backup', version: 2, exportedAt: '2026-11-01T10:00:00.000Z', title: 'x',
  entries: [
    { id: 'fx-001', heading: 'Synthetic morning check-in', body: LONG(6), createdAt: '2026-01-15T08:05:00.000Z', createdTimezone: 'Europe/London', editedAt: null, editedTimezone: null },
    { id: 'fx-002', heading: 'Synthetic long reflection spanning pages', body: LONG(28), createdAt: '2026-03-30T23:30:00.000Z', createdTimezone: 'America/New_York', editedAt: '2026-04-02T12:00:00.000Z', editedTimezone: 'Europe/London' },
    { id: 'fx-003', heading: 'Synthetic note with <b>markup</b> & javascript: text', body: '<img src=x onerror=alert(1)> should show as literal text.\nUnicode: café — 日本語 — emoji 🙂', createdAt: '2025-12-31T23:59:00.000Z', createdTimezone: 'Asia/Tokyo', editedAt: null, editedTimezone: null },
    ...Array.from({ length: 7 }, (_, i) => ({ id: 'fx-1' + i, heading: 'Synthetic short entry ' + (i + 1), body: LONG(2), createdAt: `2026-02-0${i + 1}T09:00:00.000Z`, createdTimezone: 'Europe/London', editedAt: null, editedTimezone: null }))
  ]
};
async function setFile(page, name, content) {
  const p = path.join(out, name); fs.writeFileSync(p, content);
  await page.setInputFiles('[data-journal-restore-file]', p);
  await page.waitForTimeout(250);
  return page.locator('[data-journal-status]').textContent();
}
async function dl(page, sel) { const [d] = await Promise.all([page.waitForEvent('download'), page.click(sel)]); const p = path.join(out, d.suggestedFilename()); await d.saveAs(p); return { name: d.suggestedFilename(), bytes: fs.readFileSync(p), path: p }; }
(async () => {
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', path.join(root, 'site')], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 }, timezoneId: 'Europe/London' });
    const page = await ctx.newPage(); page.on('dialog', d => d.accept());
    const reqs = []; page.on('request', r => { if (!r.url().startsWith(`http://127.0.0.1:${PORT}/`)) reqs.push(r.url()); });
    await page.goto(URL0);
    // Name
    rec('J-TITLE-DEFAULT', (await page.textContent('h1[data-journal-title]')) === 'Your no-obligation journal');
    await page.fill('[data-journal-name-input]', 'Sam'); await page.click('[data-journal-name-save]');
    rec('J-NAME-SAVE', (await page.textContent('h1[data-journal-title]')) === "Sam's no-obligation journal");
    await page.reload(); rec('J-NAME-PERSIST', (await page.textContent('h1[data-journal-title]')) === "Sam's no-obligation journal");
    await page.fill('[data-journal-name-input]', 'Alex'); await page.click('[data-journal-name-save]');
    rec('J-NAME-EDIT', (await page.textContent('h1[data-journal-title]')) === "Alex's no-obligation journal");
    await page.click('[data-journal-name-reset]'); rec('J-NAME-RESET', (await page.textContent('h1[data-journal-title]')) === 'Your no-obligation journal' && await page.evaluate(() => localStorage.getItem('mjb-srb-journal-name-v1')) === null);
    await page.fill('[data-journal-name-input]', 'Kim'); await page.click('[data-journal-name-save]'); await page.click('[data-journal-name-skip]');
    rec('J-NAME-SKIP', (await page.textContent('h1[data-journal-title]')) === 'Your no-obligation journal');
    const xss = '<img src=x onerror="window.__x=1">'; await page.fill('[data-journal-name-input]', xss); await page.click('[data-journal-name-save]');
    rec('J-NAME-SAFE-RENDER', (await page.textContent('h1[data-journal-title]')) === xss + "'s no-obligation journal" && !(await page.evaluate(() => window.__x)) && await page.locator('h1 img').count() === 0);
    await page.click('[data-journal-name-reset]');
    // Save + edit preserves created
    await page.fill('[data-journal-heading]', 'Synthetic UI entry'); await page.fill('[data-journal-body]', 'Line one\nLine two'); await page.click('[data-journal-save]');
    let st = await page.evaluate(() => JSON.parse(localStorage.getItem('mjb-srb-journal-v1')));
    const e0 = st.entries[0];
    rec('J-SAVE-SCHEMA', st.version === 2 && /Z$/.test(e0.createdAt) && e0.createdTimezone === 'Europe/London' && e0.editedAt === null, JSON.stringify(e0));
    await page.waitForTimeout(30);
    await page.click(`[data-journal-edit="${e0.id}"]`); await page.fill('[data-journal-body]', 'Edited text'); await page.click('[data-journal-save]');
    st = await page.evaluate(() => JSON.parse(localStorage.getItem('mjb-srb-journal-v1')));
    const e1 = st.entries.find(e => e.id === e0.id);
    rec('J-EDIT-PRESERVES-CREATED', e1.createdAt === e0.createdAt && e1.createdTimezone === e0.createdTimezone && e1.editedAt && e1.editedAt !== e0.createdAt && e1.body === 'Edited text' && st.entries.length === 1);
    rec('J-EDIT-DATES-VISIBLE', /Created .*\(Europe\/London\) · Edited/.test(await page.textContent(`[data-entry-id="${e0.id}"] [data-entry-dates]`)));
    await page.click('[data-journal-undo]'); st = await page.evaluate(() => JSON.parse(localStorage.getItem('mjb-srb-journal-v1')));
    rec('J-UNDO-REVISION', st.entries[0].body === 'Line one\nLine two' && st.entries[0].editedAt === null);
    // Malformed / hostile imports leave data unchanged
    const before = await page.evaluate(() => localStorage.getItem('mjb-srb-journal-v1'));
    const bad = {
      'bad-json.json': '{not json', 'proto.json': '{"format":"mjb-journal-backup","version":2,"entries":[{"__proto__":{"x":1},"id":"a","createdAt":"2026-01-01T00:00:00Z","createdTimezone":"UTC"}]}',
      'wrong-type.json': JSON.stringify({ format: 'mjb-journal-backup', version: 2, entries: [{ id: 'a', heading: 5, createdAt: '2026-01-01T00:00:00Z', createdTimezone: 'UTC' }] }),
      'bad-date.json': JSON.stringify({ format: 'mjb-journal-backup', version: 2, entries: [{ id: 'a', createdAt: 'yesterday', createdTimezone: 'UTC' }] }),
      'bad-tz.json': JSON.stringify({ format: 'mjb-journal-backup', version: 2, entries: [{ id: 'a', createdAt: '2026-01-01T00:00:00Z', createdTimezone: 'Mars/Base' }] }),
      'bad-id.json': JSON.stringify({ format: 'mjb-journal-backup', version: 2, entries: [{ id: '../../x"', createdAt: '2026-01-01T00:00:00Z', createdTimezone: 'UTC' }] }),
      'dup.json': JSON.stringify({ format: 'mjb-journal-backup', version: 2, entries: [FIX.entries[0], FIX.entries[0]] }),
      'too-many.json': JSON.stringify({ format: 'mjb-journal-backup', version: 2, entries: Array.from({ length: 501 }, (_, i) => ({ id: 'm' + i, createdAt: '2026-01-01T00:00:00Z', createdTimezone: 'UTC' })) }),
      'huge.json': '{"format":"mjb-journal-backup","version":2,"entries":[],"pad":"' + 'x'.repeat(2100000) + '"}',
      'array.json': '[1,2,3]', 'unknown-format.json': JSON.stringify({ format: 'other', version: 9, entries: [] })
    };
    for (const [n, c] of Object.entries(bad)) {
      const msg = await setFile(page, n, c);
      const after = await page.evaluate(() => localStorage.getItem('mjb-srb-journal-v1'));
      rec('J-IMPORT-REJECT-' + n.replace('.json', ''), /refused/i.test(msg) && after === before, msg);
    }
    fs.unlinkSync(path.join(out, 'huge.json')); fs.unlinkSync(path.join(out, 'too-many.json'));
    // Merge import fixture, then export JSON -> replace-restore roundtrip equality
    let msg = await setFile(page, 'synthetic-fixture.json', JSON.stringify(FIX));
    st = await page.evaluate(() => JSON.parse(localStorage.getItem('mjb-srb-journal-v1')));
    rec('J-IMPORT-MERGE', /Restored 10/.test(msg) && st.entries.length === 11, msg);
    rec('J-IMPORT-SAFE-RENDER', await page.locator('.srb-journal-list img, .srb-journal-list b').count() === 0 && (await page.textContent('[data-entry-id="fx-003"] .srb-journal-body')).includes('<img src=x'));
    // merge again with changed createdAt: must keep original
    const changed = JSON.parse(JSON.stringify(FIX)); changed.entries[0].createdAt = '2020-01-01T00:00:00.000Z'; changed.entries[0].body = 'replaced body';
    await setFile(page, 'synthetic-changed.json', JSON.stringify(changed));
    st = await page.evaluate(() => JSON.parse(localStorage.getItem('mjb-srb-journal-v1')));
    const fx1 = st.entries.find(e => e.id === 'fx-001');
    rec('J-MERGE-KEEPS-ORIGINAL-CREATED', fx1.createdAt === '2026-01-15T08:05:00.000Z' && fx1.body === 'replaced body');
    await setFile(page, 'synthetic-fixture.json', JSON.stringify(FIX));
    const j = await dl(page, '[data-journal-export-json]');
    const exported = JSON.parse(j.bytes.toString('utf8'));
    rec('J-JSON-BYTES', j.name === 'mjb-journal-backup.json' && exported.format === 'mjb-journal-backup' && exported.entries.length === 11, j.path);
    const snap = await page.evaluate(() => localStorage.getItem('mjb-srb-journal-v1'));
    await page.evaluate(() => { localStorage.clear(); }); await page.reload();
    await page.selectOption('[data-journal-restore-mode]', 'replace');
    msg = await setFile(page, 'roundtrip.json', j.bytes.toString('utf8'));
    const restored = await page.evaluate(() => localStorage.getItem('mjb-srb-journal-v1'));
    rec('J-ROUNDTRIP-EXACT', JSON.stringify(JSON.parse(restored).entries) === JSON.stringify(JSON.parse(snap).entries), msg);
    // Markdown bytes
    const md = await dl(page, '[data-journal-export-md]'); const mds = md.bytes.toString('utf8');
    rec('J-MD-BYTES', mds.startsWith('# Your no-obligation journal\n') && mds.includes('## Synthetic long reflection spanning pages') && mds.includes('- Created: 2026-03-30T23:30:00.000Z (America/New_York)') && mds.includes('- Edited: 2026-04-02T12:00:00.000Z (Europe/London)') && mds.includes('日本語 — emoji 🙂'), md.path);
    // Selected entry: txt, copy fallback, md selection
    await page.check('[data-journal-select="fx-003"]');
    const md2 = (await dl(page, '[data-journal-export-md]')).bytes.toString('utf8');
    rec('J-SELECTED-MD', (md2.match(/^## /gm) || []).length === 1 && md2.includes('Synthetic note with'));
    await page.uncheck('[data-journal-select="fx-003"]');
    const t = await dl(page, '[data-journal-txt="fx-001"]');
    rec('J-TXT-BYTES', t.bytes.toString('utf8').startsWith('Synthetic morning check-in\nCreated ') && t.name === 'Synthetic-morning-check-in.txt', t.name);
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: `http://127.0.0.1:${PORT}` });
    await page.click('[data-journal-copy="fx-001"]'); await page.waitForTimeout(100);
    rec('J-COPY-CLIPBOARD', (await page.evaluate(() => navigator.clipboard.readText())).startsWith('Synthetic morning check-in'));
    await page.click('[data-journal-share="fx-001"]');
    rec('J-SHARE-FALLBACK-MSG', /not supported|cancelled|Shared/.test(await page.textContent('[data-journal-status]')), await page.textContent('[data-journal-status]'));
    // ICS editable
    await page.click('[data-journal-ics-open="fx-001"]');
    await page.fill('[data-ics-title]', 'Synthetic review, part; two'); await page.fill('[data-ics-date]', '2026-12-03'); await page.fill('[data-ics-time]', '14:30'); await page.fill('[data-ics-tz]', 'America/New_York'); await page.fill('[data-ics-duration]', '45');
    const ics = (await dl(page, '[data-ics-download]')).bytes.toString('utf8');
    rec('J-ICS-BYTES', ics.includes('DTSTART;TZID=America/New_York:20261203T143000\r\n') && ics.includes('DURATION:PT45M') && ics.includes('SUMMARY:Synthetic review\\, part\\; two') && /not an alarm/.test(ics.replace(/\r\n /g, '')) && !/VALARM/.test(ics), ics.slice(0, 200));
    await page.click('[data-journal-ics-open="fx-001"]'); await page.fill('[data-ics-tz]', 'Nowhere/Zone'); await page.click('[data-ics-download]');
    rec('J-ICS-INVALID-TZ', /time zone invalid/.test(await page.textContent('[data-ics-error]'))); await page.keyboard.press('Escape');
    // Print PDFs
    await page.fill('[data-journal-print-title]', 'Synthetic print title (edited)');
    for (const mode of ['themed', 'plain']) {
      await page.evaluate(m => { window.print = () => {}; document.querySelector(m === 'plain' ? '[data-journal-print-plain]' : '[data-journal-print]').click(); }, mode);
      await page.emulateMedia({ media: 'print' });
      const pdfPath = path.join(out, `journal-print-${mode}.pdf`);
      await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, preferCSSPageSize: true });
      await page.emulateMedia({ media: 'screen' });
      await page.evaluate(() => document.documentElement.removeAttribute('data-print-journal'));
      const txt = execFileSync('pdftotext', ['-layout', pdfPath, '-']).toString();
      const pages = txt.split('\f').filter((p, i, a) => i < a.length - 1 || p.trim());
      const info = execFileSync('pdfinfo', [pdfPath]).toString(); const n = +info.match(/Pages:\s+(\d+)/)[1];
      const emptyPages = txt.split('\f').slice(0, n).filter(p => !p.trim()).length;
      rec(`J-PDF-${mode}-CONTENT`, txt.includes('Synthetic print title (edited)') && txt.includes('Synthetic long reflection spanning pages') && /Created .*\(America\/New_York\)/.test(txt) && /Edited/.test(txt) && txt.includes('Synthetic paragraph 28.'), `pages=${n}`);
      rec(`J-PDF-${mode}-NO-CHROME`, !/Restore|Save entry|Optional name|Heading\s*$|Download JSON|Menu|Reading preferences/m.test(txt));
      rec(`J-PDF-${mode}-PAGINATION`, n >= 3 && emptyPages === 0, `pages=${n} empty=${emptyPages}`);
      execFileSync('pdftoppm', ['-png', '-r', '60', pdfPath, path.join(out, `journal-print-${mode}`)]);
    }
    rec('J-NO-EXTERNAL-REQUESTS', reqs.length === 0, reqs.join(' '));
    // Quota (emulated by throwing QuotaExceededError from setItem)
    const p2 = await ctx.newPage(); p2.on('dialog', d => d.accept());
    await p2.addInitScript(() => { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'mjb-srb-journal-v1' && window.__quota) throw new DOMException('full', 'QuotaExceededError'); return o.call(this, k, v); }; });
    await p2.goto(URL0); const pre = await p2.evaluate(() => localStorage.getItem('mjb-srb-journal-v1'));
    await p2.evaluate(() => { window.__quota = true; }); await p2.fill('[data-journal-heading]', 'q'); await p2.click('[data-journal-save]');
    rec('J-QUOTA-EMULATED', /storage is full\. Nothing was changed/.test(await p2.textContent('[data-journal-status]')) && await p2.evaluate(() => localStorage.getItem('mjb-srb-journal-v1')) === pre && await p2.inputValue('[data-journal-heading]') === 'q');
    // Corrupt stored data: not overwritten
    await p2.evaluate(() => { window.__quota = false; localStorage.setItem('mjb-srb-journal-v1', '{corrupt'); }); await p2.reload();
    await p2.fill('[data-journal-heading]', 'new'); await p2.click('[data-journal-save]');
    rec('J-CORRUPT-NOT-OVERWRITTEN', await p2.evaluate(() => localStorage.getItem('mjb-srb-journal-v1')) === '{corrupt' && await p2.isVisible('[data-journal-recovery]'));
    const raw = await dl(p2, '[data-journal-recovery-download]'); rec('J-CORRUPT-RAW-DOWNLOAD', raw.bytes.toString() === '{corrupt');
    await p2.click('[data-journal-recovery-clear]'); rec('J-CORRUPT-CLEAR', await p2.evaluate(() => localStorage.getItem('mjb-srb-journal-v1')) === null && !(await p2.isVisible('[data-journal-recovery]')));
    // Legacy v0.3.0 shape upgrade
    await p2.evaluate(() => localStorage.setItem('mjb-srb-journal-v1', JSON.stringify({ version: 1, entries: [{ id: 'old1', heading: 'Old', body: 'b', createdAt: 1767225600000, createdTimezone: 'Europe/London', editedAt: 1767225600000 }] }))); await p2.reload();
    rec('J-LEGACY-V030-READ', /Created 1 Jan 2026, 00:00 GMT/.test(await p2.textContent('[data-entry-id="old1"] [data-entry-dates]')));
    // Denied storage (emulated: getItem/setItem throw SecurityError)
    const p3 = await ctx.newPage();
    await p3.addInitScript(() => { Storage.prototype.getItem = () => { throw new DOMException('denied', 'SecurityError'); }; Storage.prototype.setItem = () => { throw new DOMException('denied', 'SecurityError'); }; });
    await p3.goto(URL0); await p3.fill('[data-journal-heading]', 'x'); await p3.click('[data-journal-save]');
    rec('J-DENIED-EMULATED', /blocking site storage/.test(await p3.textContent('[data-journal-storage]')) && /blocking site storage/.test(await p3.textContent('[data-journal-status]')));
    // Narrow 200% text, no horizontal overflow
    const p4 = await browser.newPage({ viewport: { width: 320, height: 568 } }); await p4.goto(URL0);
    await p4.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    rec('J-NARROW-200-REFLOW', await p4.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), await p4.evaluate(() => document.documentElement.scrollWidth));
    await p4.screenshot({ path: path.join(out, 'journal-320-200pct.png'), fullPage: false });
  } catch (e) { rec('J-HARNESS', false, e.stack); }
  await browser.close(); server.kill();
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`${results.length - failed}/${results.length} pass`); process.exit(failed ? 1 : 0);
})();
