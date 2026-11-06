'use strict';
/* Pure-function checks of journal.js (jsdom). Browser behaviour is covered by playwright.journal.cjs. */
const assert = require('assert'), fs = require('fs'), path = require('path'), { JSDOM } = require('jsdom');
const code = fs.readFileSync(path.join(__dirname, '../../site/social-reading-beta/js/journal.js'), 'utf8');
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.test/', runScripts: 'outside-only' });
dom.window.eval(code);
const J = dom.window.__SRB_JOURNAL;
const ok = { id: 'a1', heading: 'h', body: 'b', createdAt: '2026-01-01T10:00:00.000Z', createdTimezone: 'Europe/London', editedAt: null, editedTimezone: null };
assert.deepStrictEqual(JSON.parse(JSON.stringify(J.normalizeEntry(ok))), ok);
assert.strictEqual(J.normalizeEntry({ ...ok, body: '<script>alert(1)</script> javascript:' }).body, '<script>alert(1)</script> javascript:', 'text kept literally (rendered via textContent)');
assert.strictEqual(J.normalizeEntry({ ...ok, body: 'a\u0000b' }).body, 'ab');
for (const bad of [{ ...ok, id: '' }, { ...ok, createdAt: 5 + 'x' }, { ...ok, createdTimezone: 'Nope/Zone' }, { ...ok, heading: {} }, { ...ok, editedAt: 'x' }]) assert.throws(() => J.normalizeEntry(bad));
const legacy = J.normalizeEntry({ id: 'old', heading: 'x', body: '', createdAt: 1767225600000, createdTimezone: 'Europe/London', editedAt: 1767225600000 });
assert.strictEqual(legacy.createdAt, '2026-01-01T00:00:00.000Z'); assert.strictEqual(legacy.editedAt, null);
assert.throws(() => J.parseBackup('{"format":"mjb-journal-backup","version":2,"entries":[{"__proto__":{}}]}'), /forbidden/);
assert.throws(() => J.parseBackup('x'.repeat(J.LIMITS.MAX_IMPORT_BYTES + 1)), /larger/);
const merged = J.mergeEntries([ok], [{ ...ok, createdAt: '2020-01-01T00:00:00.000Z', body: 'new' }], 'merge');
assert.strictEqual(merged[0].createdAt, ok.createdAt); assert.strictEqual(merged[0].body, 'new');
assert.strictEqual(J.mergeEntries([ok], [], 'replace').length, 0);
const ics = J.buildIcs('a1', { title: 'T, x;', date: '2026-12-01', time: '09:15', timezone: 'Europe/Paris', durationMin: 20, description: 'line1\nline2' });
assert.ok(ics.includes('DTSTART;TZID=Europe/Paris:20261201T091500\r\n') && ics.includes('SUMMARY:T\\, x\\;') && ics.includes('DURATION:PT20M') && !/VALARM/.test(ics));
assert.ok(ics.split('\r\n').every(l => l.length <= 75), 'lines folded');
assert.throws(() => J.buildIcs('a1', { title: 't', date: '2026-13', time: '9', timezone: 'UTC' }));
const md = J.toMarkdown('My title', [ok]); assert.ok(md.startsWith('# My title\n') && md.includes('- Created: 2026-01-01T10:00:00.000Z (Europe/London)') && md.includes('- Edited: never'));
console.log('PASS unit.journal (16 assertions groups)');
for (const id of ['toString', 'hasOwnProperty', '__proto__']) {
  const entry = { ...ok, id };
  const restored = J.parseBackup(JSON.stringify({ format: 'mjb-journal-backup', version: 2, entries: [entry] }));
  assert.strictEqual(restored[0].id, id, 'valid IDs survive backup parsing');
  assert.strictEqual(J.mergeEntries([], restored, 'merge')[0].id, id, 'valid IDs survive merge');
}
for (const [date, time] of [['2026-02-31', '09:15'], ['2026-12-01', '99:99'], ['2025-02-29', '09:15']]) {
  assert.throws(() => J.buildIcs('a1', { title: 't', date, time, timezone: 'UTC' }), /date\/time invalid/);
}
assert.ok(J.buildIcs('a1', { title: 't', date: '2028-02-29', time: '23:59', timezone: 'UTC' }).includes('20280229T235900'));
assert.throws(() => J.normalizeEntry({ ...ok, body: 'x'.repeat(20001) }), /too long/);
assert.throws(() => J.mergeEntries(Array.from({ length: 500 }, (_, i) => ({ ...ok, id: 'current-' + i })), [ok], 'merge'), /500/);
