/* MJB local journal — Stage1 v0.3.1. All rendering via textContent. Nothing is transmitted. */
(function () {
  'use strict';
  var NAME_KEY = 'mjb-srb-journal-name-v1';
  var JOURNAL_KEY = 'mjb-srb-journal-v1';
  var PREV_KEY = 'mjb-srb-journal-v1-previous';
  var PRINT_TITLE_KEY = 'mjb-srb-journal-print-title-v1';
  var MAX_ENTRIES = 500, MAX_HEADING = 200, MAX_BODY = 20000, MAX_IMPORT_BYTES = 2000000, MAX_NAME = 40;
  var ID_RE = /^[A-Za-z0-9._:-]{1,80}$/;
  var ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;
  var state = { corrupt: false, editingId: null, selected: Object.create(null) };

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function status(m) { var el = $('[data-journal-status]'); if (el) el.textContent = m || ''; }
  function storageNote(m) { var el = $('[data-journal-storage]'); if (el) el.textContent = m || ''; }
  function uid() { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'j-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10); }
  function tz() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; } }
  function validTz(z) { try { Intl.DateTimeFormat('en-GB', { timeZone: z }); return true; } catch (e) { return false; } }
  function cleanText(s, max) { return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, max); }
  function isPlainObject(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
  function hasHostileKeys(o, depth) {
    if (depth > 6 || !o || typeof o !== 'object') return false;
    return Object.keys(o).some(function (k) {
      return k === '__proto__' || k === 'constructor' || k === 'prototype' || hasHostileKeys(o[k], depth + 1);
    });
  }
  /* Validate one entry. Throws with a reason. Text content is never rejected for words like "script": it is rendered as text only. */
  function upgradeV1(raw) {
    /* v0.3.0 stored numeric epoch ms and no editedTimezone; convert without changing the instant. */
    if (!isPlainObject(raw) || typeof raw.createdAt !== 'number') return raw;
    var c = new Date(raw.createdAt); if (isNaN(c)) return raw;
    var e = typeof raw.editedAt === 'number' && raw.editedAt !== raw.createdAt ? new Date(raw.editedAt) : null;
    return Object.assign({}, raw, { createdAt: c.toISOString(), createdTimezone: raw.createdTimezone || 'UTC', editedAt: e && !isNaN(e) ? e.toISOString() : null, editedTimezone: null });
  }
  function normalizeEntry(raw) {
    raw = upgradeV1(raw);
    if (!isPlainObject(raw)) throw new Error('entry is not an object');
    if (hasHostileKeys(raw, 0)) throw new Error('entry has a forbidden key');
    var id = String(raw.id || '');
    if (!ID_RE.test(id)) throw new Error('entry id missing or invalid');
    if (raw.heading != null && typeof raw.heading !== 'string') throw new Error('heading must be text');
    if (raw.body != null && typeof raw.body !== 'string') throw new Error('body must be text');
    if ((raw.heading || '').length > MAX_HEADING || (raw.body || '').length > MAX_BODY) throw new Error('heading or body too long');
    if (typeof raw.createdAt !== 'string' || !ISO_RE.test(raw.createdAt) || isNaN(Date.parse(raw.createdAt))) throw new Error('createdAt must be an ISO date-time');
    var ctz = String(raw.createdTimezone || '');
    if (!ctz || ctz.length > 64 || !validTz(ctz)) throw new Error('createdTimezone must be an IANA time zone');
    var edited = raw.editedAt == null ? null : raw.editedAt;
    if (edited !== null && (typeof edited !== 'string' || !ISO_RE.test(edited) || isNaN(Date.parse(edited)))) throw new Error('editedAt must be null or ISO date-time');
    var etz = raw.editedTimezone == null ? null : String(raw.editedTimezone);
    if (etz !== null && !validTz(etz)) throw new Error('editedTimezone invalid');
    return { id: id, heading: cleanText(raw.heading, MAX_HEADING), body: cleanText(raw.body, MAX_BODY),
      createdAt: raw.createdAt, createdTimezone: ctz, editedAt: edited, editedTimezone: edited ? (etz || ctz) : null };
  }
  function parseBackup(text) {
    if (typeof text !== 'string') throw new Error('not text');
    if (text.length > MAX_IMPORT_BYTES) throw new Error('file larger than ' + MAX_IMPORT_BYTES + ' bytes');
    var parsed;
    try { parsed = JSON.parse(text); } catch (e) { throw new Error('not valid JSON'); }
    if (!isPlainObject(parsed)) throw new Error('backup must be a JSON object');
    if (hasHostileKeys(parsed, 0)) throw new Error('backup has a forbidden key');
    if (parsed.format !== 'mjb-journal-backup' || parsed.version !== 2) {
      if (!(parsed.version === 1 && Array.isArray(parsed.entries))) throw new Error('unrecognised backup format/version');
    }
    if (!Array.isArray(parsed.entries)) throw new Error('entries missing');
    if (parsed.entries.length > MAX_ENTRIES) throw new Error('more than ' + MAX_ENTRIES + ' entries');
    var seen = Object.create(null);
    var out = parsed.entries.map(function (e, i) {
      try { var n = normalizeEntry(e); } catch (err) { throw new Error('entry ' + (i + 1) + ': ' + err.message); }
      if (seen[n.id]) throw new Error('duplicate id ' + n.id);
      seen[n.id] = 1; return n;
    });
    return out;
  }
  function mergeEntries(current, incoming, mode) {
    var map = Object.create(null), order = [];
    if (mode !== 'replace') current.forEach(function (e) { map[e.id] = e; order.push(e.id); });
    incoming.forEach(function (e) {
      if (map[e.id]) { e = Object.assign({}, e, { createdAt: map[e.id].createdAt, createdTimezone: map[e.id].createdTimezone }); }
      else order.push(e.id);
      map[e.id] = e;
    });
    if (order.length > MAX_ENTRIES) throw new Error('combined journal exceeds ' + MAX_ENTRIES + ' entries');
    return order.map(function (id) { return map[id]; }).sort(function (a, b) { return Date.parse(b.createdAt) - Date.parse(a.createdAt); });
  }
  /* Storage */
  function storageGet(k) { return localStorage.getItem(k); }
  function readJournal() {
    var raw;
    try { raw = storageGet(JOURNAL_KEY); } catch (e) { return { entries: [], error: 'denied' }; }
    if (!raw) return { entries: [] };
    try {
      var p = JSON.parse(raw);
      if (!isPlainObject(p) || !Array.isArray(p.entries)) throw new Error('shape');
      return { entries: p.entries.map(normalizeEntry) };
    } catch (e) { return { entries: [], error: 'corrupt', raw: raw }; }
  }
  function writeJournal(entries) {
    if (state.corrupt) { status('Saving is paused because stored journal data is unreadable. Download the raw data or clear it first.'); return false; }
    var payload = JSON.stringify({ format: 'mjb-journal-store', version: 2, entries: entries });
    if (entries.length > MAX_ENTRIES || new Blob([payload]).size > MAX_IMPORT_BYTES - 1024) {
      status('Not saved: this would exceed the 500-entry or 2 MB backup limit. Nothing changed. Export a backup, then remove or shorten entries.'); return false;
    }
    try {
      var prev = storageGet(JOURNAL_KEY);
      localStorage.setItem(JOURNAL_KEY, payload);
      try { if (prev) localStorage.setItem(PREV_KEY, prev); } catch (e2) { /* previous revision is best effort */ }
      return true;
    } catch (e) {
      var quota = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
      status(quota ? 'Not saved: this browser\'s storage is full. Nothing was changed. Download a JSON backup, then delete or shorten entries.'
                   : 'Not saved: this browser is blocking site storage (private mode or settings). Nothing was changed. Copy your text elsewhere.');
      return false;
    }
  }
  function readName() { try { var n = storageGet(NAME_KEY); n = n ? cleanText(n, MAX_NAME).trim() : ''; return n || null; } catch (e) { return null; } }
  function writeName(n) {
    try { if (!n) localStorage.removeItem(NAME_KEY); else localStorage.setItem(NAME_KEY, cleanText(n, MAX_NAME).trim()); return true; }
    catch (e) { status('Name not saved: browser storage unavailable.'); return false; }
  }
  function journalTitle() { var n = readName(); return n ? n + "'s no-obligation journal" : 'Your no-obligation journal'; }
  /* Formatting */
  function fmt(iso, zone) {
    try { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: zone, timeZoneName: 'short' }).format(new Date(iso)); }
    catch (e) { return iso; }
  }
  function dateLine(e) {
    return 'Created ' + fmt(e.createdAt, e.createdTimezone) + ' (' + e.createdTimezone + ')' +
      (e.editedAt ? ' · Edited ' + fmt(e.editedAt, e.editedTimezone || e.createdTimezone) : '');
  }
  function entryText(e) { return (e.heading || 'Untitled') + '\n' + dateLine(e) + '\n\n' + (e.body || '') + '\n'; }
  function toMarkdown(title, entries) {
    var out = ['# ' + title, '', '_Exported from this browser. Not encrypted. Not clinical advice._', ''];
    entries.forEach(function (e) {
      out.push('## ' + (e.heading || 'Untitled').replace(/\n/g, ' '), '', '- Created: ' + e.createdAt + ' (' + e.createdTimezone + ')',
        '- Edited: ' + (e.editedAt ? e.editedAt + ' (' + (e.editedTimezone || e.createdTimezone) + ')' : 'never'), '', e.body || '', '');
    });
    return out.join('\n');
  }
  function icsEscape(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function fold(line) { var out = [], s = line; while (s.length > 74) { out.push(s.slice(0, 74)); s = ' ' + s.slice(74); } out.push(s); return out.join('\r\n'); }
  /* opts: {title, date:'YYYY-MM-DD', time:'HH:MM', timezone, durationMin, description} -> floating local time with TZID (IANA). */
  function buildIcs(id, opts) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.date) || !/^\d{2}:\d{2}$/.test(opts.time)) throw new Error('date/time invalid');
    var day = new Date(opts.date + 'T00:00:00Z');
    if (isNaN(day) || day.toISOString().slice(0, 10) !== opts.date || Number(opts.time.slice(0, 2)) > 23 || Number(opts.time.slice(3)) > 59) throw new Error('date/time invalid');
    if (!validTz(opts.timezone)) throw new Error('time zone invalid');
    var dur = Math.max(5, Math.min(1440, parseInt(opts.durationMin, 10) || 30));
    var start = opts.date.replace(/-/g, '') + 'T' + opts.time.replace(':', '') + '00';
    var now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MJB ADHD//Local journal export//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:' + id + '-' + Date.now() + '@local.invalid', 'DTSTAMP:' + now, 'DTSTART;TZID=' + opts.timezone + ':' + start,
      'DURATION:PT' + dur + 'M', 'SUMMARY:' + icsEscape(cleanText(opts.title, 200) || 'Journal item'),
      'DESCRIPTION:' + icsEscape(cleanText(opts.description, 1000) + '\n\nCalendar file only. Your calendar app decides any reminder; this is not an alarm.'),
      'END:VEVENT', 'END:VCALENDAR'];
    return lines.map(fold).join('\r\n') + '\r\n';
  }
  function safeFileName(s, ext) { return (cleanText(s, 60).replace(/[^A-Za-z0-9 _-]+/g, '').trim().replace(/\s+/g, '-') || 'journal') + ext; }
  function download(name, content, type) {
    try {
      var url = URL.createObjectURL(new Blob([content], { type: type }));
      var a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      status('File prepared for download: ' + name + '. Your browser decides where it is saved.');
    } catch (e) { status('Download not supported here. Use Copy instead.'); }
  }
  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove(); status(ok ? 'Copied to clipboard.' : 'Copy blocked by this browser. Select the text and copy manually, or use Download.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { status('Copied to clipboard.'); }, fallback);
    else fallback();
  }
  function shareText(title, text) {
    if (navigator.share) navigator.share({ title: title, text: text }).then(function () { status('Shared using your device share sheet.'); }, function () { status('Share cancelled or unavailable. Nothing was sent.'); });
    else status('Sharing is not supported in this browser. Use Copy or Download.');
  }
  /* Rendering */
  function el(tag, attrs, text) { var n = document.createElement(tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); if (text != null) n.textContent = text; return n; }
  function selectedEntries(all) { var ids = Object.keys(state.selected).filter(function (k) { return state.selected[k]; }); return ids.length ? all.filter(function (e) { return ids.indexOf(e.id) >= 0; }) : all; }
  function applyTitle() {
    $all('[data-journal-title]').forEach(function (h) { h.textContent = journalTitle(); });
    var input = $('[data-journal-name-input]'); if (input && document.activeElement !== input) input.value = readName() || '';
    var pt = $('[data-journal-print-title]'); if (pt && !pt.value) { var saved = null; try { saved = storageGet(PRINT_TITLE_KEY); } catch (e) {} pt.value = saved || journalTitle(); }
  }
  function renderList() {
    var list = $('[data-journal-list]'); if (!list) return;
    var data = readJournal();
    state.corrupt = data.error === 'corrupt';
    var rec = $('[data-journal-recovery]'); if (rec) rec.hidden = !state.corrupt;
    if (data.error === 'denied') storageNote('This browser is blocking site storage, so entries cannot be kept here. Nothing is uploaded.');
    else if (state.corrupt) storageNote('Stored journal data could not be read. It has not been deleted. Download the raw data before choosing Clear.');
    else storageNote('Saved only in this browser on this device. Not encrypted, not synced, not uploaded. Clearing site data or browser cleanup deletes it, so keep JSON backups.');
    list.textContent = '';
    if (!data.entries.length) { list.appendChild(el('li', { class: 'srb-fine' }, 'No entries on this device yet. Writing is optional.')); }
    data.entries.forEach(function (e) {
      var li = el('li', { class: 'srb-journal-item', 'data-entry-id': e.id });
      var sel = el('label', { class: 'srb-journal-select' }); var cb = el('input', { type: 'checkbox', 'data-journal-select': e.id });
      cb.checked = !!state.selected[e.id]; cb.addEventListener('change', function () { state.selected[e.id] = cb.checked; renderPrint(); });
      sel.appendChild(cb); sel.appendChild(document.createTextNode(' Select'));
      li.appendChild(sel);
      li.appendChild(el('h3', {}, e.heading || 'Untitled'));
      li.appendChild(el('p', { class: 'srb-fine', 'data-entry-dates': '' }, dateLine(e)));
      li.appendChild(el('p', { class: 'srb-journal-body' }, e.body || ''));
      var acts = el('div', { class: 'srb-actions' });
      function b(label, attr, fn) { var x = el('button', { type: 'button', class: 'srb-btn' }, label); x.setAttribute(attr, e.id); x.addEventListener('click', fn); acts.appendChild(x); }
      b('Edit', 'data-journal-edit', function () { startEdit(e); });
      b('Copy', 'data-journal-copy', function () { copyText(entryText(e)); });
      b('Share', 'data-journal-share', function () { shareText(e.heading || 'Journal entry', entryText(e)); });
      b('Download .txt', 'data-journal-txt', function () { download(safeFileName(e.heading, '.txt'), entryText(e), 'text/plain;charset=utf-8'); });
      b('Calendar file…', 'data-journal-ics-open', function () { openIcs(e); });
      b('Delete', 'data-journal-delete', function () {
        if (!window.confirm('Delete this entry from this browser? Undo is available once.')) return;
        if (writeJournal(readJournal().entries.filter(function (x) { return x.id !== e.id; }))) { delete state.selected[e.id]; renderAll(); status('Entry deleted. Use "Undo last change" to restore it.'); }
      });
      li.appendChild(acts); list.appendChild(li);
    });
    renderPrint(data.entries);
  }
  function renderPrint(entries) {
    var doc = $('[data-journal-print-doc]'); if (!doc) return;
    entries = selectedEntries(entries || readJournal().entries);
    var pt = $('[data-journal-print-title]');
    doc.textContent = '';
    doc.appendChild(el('h1', { class: 'jp-title' }, (pt && pt.value.trim()) || journalTitle()));
    doc.appendChild(el('p', { class: 'jp-meta' }, 'Printed ' + fmt(new Date().toISOString(), tz()) + ' · ' + entries.length + ' entr' + (entries.length === 1 ? 'y' : 'ies') + ' · Personal notes kept in this browser; not clinical advice.'));
    entries.forEach(function (e) {
      var art = el('article', { class: 'jp-entry' });
      art.appendChild(el('h2', {}, e.heading || 'Untitled'));
      art.appendChild(el('p', { class: 'jp-dates' }, dateLine(e)));
      // v0.3.2: one <p> per paragraph so widows/orphans apply per paragraph in print.
      var jb = el('div', { class: 'jp-body' });
      String(e.body || '').split(/\n[ \t]*\n+/).forEach(function (para) { if (para.trim()) jb.appendChild(el('p', { class: 'jp-para' }, para)); });
      art.appendChild(jb);
      doc.appendChild(art);
    });
  }
  function renderAll() { applyTitle(); renderList(); }
  function startEdit(e) {
    state.editingId = e.id;
    $('[data-journal-heading]').value = e.heading; $('[data-journal-body]').value = e.body;
    $('[data-journal-save]').textContent = 'Save changes'; var c = $('[data-journal-cancel-edit]'); if (c) c.hidden = false;
    var lbl = $('[data-journal-editing]'); if (lbl) lbl.textContent = 'Editing "' + (e.heading || 'Untitled') + '". The original creation date stays the same.';
    $('[data-journal-heading]').focus();
  }
  function endEdit() {
    state.editingId = null; $('[data-journal-heading]').value = ''; $('[data-journal-body]').value = '';
    $('[data-journal-save]').textContent = 'Save entry locally'; var c = $('[data-journal-cancel-edit]'); if (c) c.hidden = true;
    var lbl = $('[data-journal-editing]'); if (lbl) lbl.textContent = '';
  }
  function save() {
    var h = cleanText($('[data-journal-heading]').value, MAX_HEADING), bd = cleanText($('[data-journal-body]').value, MAX_BODY);
    if (!h.trim() && !bd.trim()) { status('Add a heading or some text first.'); return; }
    var entries = readJournal().entries, now = new Date().toISOString();
    if (state.editingId) {
      entries = entries.map(function (e) { return e.id === state.editingId ? Object.assign({}, e, { heading: h, body: bd, editedAt: now, editedTimezone: tz() }) : e; });
    } else entries.unshift({ id: uid(), heading: h, body: bd, createdAt: now, createdTimezone: tz(), editedAt: null, editedTimezone: null });
    if (writeJournal(entries)) { var was = state.editingId; endEdit(); renderAll(); status(was ? 'Changes saved. Creation date kept; edit date recorded.' : 'Saved in this browser.'); }
  }
  function undo() {
    var prev; try { prev = storageGet(PREV_KEY); } catch (e) { prev = null; }
    if (!prev) { status('No earlier version stored.'); return; }
    try { var p = JSON.parse(prev); p.entries.map(normalizeEntry); } catch (e) { status('Earlier version unreadable; nothing changed.'); return; }
    try { var cur = storageGet(JOURNAL_KEY); localStorage.setItem(JOURNAL_KEY, prev); if (cur) localStorage.setItem(PREV_KEY, cur); state.corrupt = false; renderAll(); status('Restored the previous version.'); }
    catch (e) { status('Undo failed: storage unavailable. Nothing changed.'); }
  }
  var icsEntry = null;
  function openIcs(e) {
    icsEntry = e; var d = $('[data-journal-ics]'); if (!d) return;
    var now = new Date(Date.now() + 3600000), zone = tz();
    var parts = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
    function g(t) { return (parts.filter(function (p) { return p.type === t; })[0] || {}).value; }
    $('[data-ics-title]').value = e.heading || 'Journal item';
    $('[data-ics-date]').value = g('year') + '-' + g('month') + '-' + g('day');
    $('[data-ics-time]').value = (g('hour') === '24' ? '00' : g('hour')) + ':' + g('minute');
    $('[data-ics-tz]').value = zone; $('[data-ics-duration]').value = '30';
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  }
  function wire() {
    var on = function (s, ev, fn) { var n = $(s); if (n) n.addEventListener(ev, fn); };
    on('[data-journal-name-save]', 'click', function () { var v = $('[data-journal-name-input]').value.trim(); if (!v) { status('Type a name or choose Skip.'); return; } if (writeName(v)) { $('[data-journal-print-title]').value = ''; applyTitle(); renderPrint(); status('Name saved in this browser only.'); } });
    on('[data-journal-name-skip]', 'click', function () { writeName(null); $('[data-journal-name-input]').value = ''; $('[data-journal-print-title]').value = ''; applyTitle(); renderPrint(); status('Skipped. Using "Your no-obligation journal".'); });
    on('[data-journal-name-reset]', 'click', function () { writeName(null); $('[data-journal-name-input]').value = ''; $('[data-journal-print-title]').value = ''; applyTitle(); renderPrint(); status('Name removed.'); });
    on('[data-journal-save]', 'click', save);
    on('[data-journal-cancel-edit]', 'click', function () { endEdit(); status('Edit cancelled.'); });
    on('[data-journal-undo]', 'click', undo);
    on('[data-journal-print-title]', 'input', function () { try { localStorage.setItem(PRINT_TITLE_KEY, cleanText($('[data-journal-print-title]').value, 120)); } catch (e) {} renderPrint(); });
    on('[data-journal-export-json]', 'click', function () {
      var data = { format: 'mjb-journal-backup', version: 2, exportedAt: new Date().toISOString(), title: journalTitle(), entries: readJournal().entries };
      download('mjb-journal-backup.json', JSON.stringify(data, null, 2), 'application/json');
    });
    on('[data-journal-export-md]', 'click', function () { var all = readJournal().entries; download('mjb-journal.md', toMarkdown(($('[data-journal-print-title]').value.trim() || journalTitle()), selectedEntries(all)), 'text/markdown;charset=utf-8'); });
    on('[data-journal-copy-selected]', 'click', function () { copyText(selectedEntries(readJournal().entries).map(entryText).join('\n---\n\n')); });
    on('[data-journal-share-selected]', 'click', function () { shareText(journalTitle(), selectedEntries(readJournal().entries).map(entryText).join('\n---\n\n')); });
    function doPrint(plain) {
      renderPrint(); var r = document.documentElement;
      r.setAttribute('data-print-journal', plain ? 'plain' : 'themed');
      var done = function () { r.removeAttribute('data-print-journal'); window.removeEventListener('afterprint', done); };
      window.addEventListener('afterprint', done);
      status('Your browser\'s print window opened. Choose "Save as PDF" there if you want a file. MJB does not create or upload a PDF.');
      window.print();
    }
    on('[data-journal-print]', 'click', function () { doPrint(false); });
    on('[data-journal-print-plain]', 'click', function () { doPrint(true); });
    on('[data-journal-restore-file]', 'change', function () {
      var f = this.files && this.files[0]; this.value = ''; if (!f) return;
      if (f.size > MAX_IMPORT_BYTES) { status('Restore refused: file is larger than 2 MB. Nothing changed.'); return; }
      var mode = ($('[data-journal-restore-mode]') || {}).value === 'replace' ? 'replace' : 'merge';
      f.text().then(function (txt) {
        var incoming;
        try { incoming = parseBackup(txt); } catch (err) { status('Restore refused: ' + err.message + '. Nothing changed.'); return; }
        if (mode === 'replace' && !window.confirm('Replace all ' + readJournal().entries.length + ' entries in this browser with ' + incoming.length + ' from the backup? Undo is available once.')) { status('Restore cancelled.'); return; }
        try {
          if (writeJournal(mergeEntries(readJournal().entries, incoming, mode))) { renderAll(); status('Restored ' + incoming.length + ' entries (' + mode + '). Original creation dates kept.'); }
        } catch (err) { status('Restore refused: ' + err.message + '. Nothing changed.'); }
      }, function () { status('Could not read the file. Nothing changed.'); });
    });
    on('[data-journal-recovery-download]', 'click', function () { var raw = ''; try { raw = storageGet(JOURNAL_KEY) || ''; } catch (e) {} download('mjb-journal-unreadable-raw.txt', raw, 'text/plain'); });
    on('[data-journal-recovery-clear]', 'click', function () {
      if (!window.confirm('Clear the unreadable journal data from this browser? Download it first if you might need it.')) return;
      try { localStorage.setItem(PREV_KEY, storageGet(JOURNAL_KEY) || ''); localStorage.removeItem(JOURNAL_KEY); } catch (e) {}
      state.corrupt = false; renderAll(); status('Cleared. The unreadable data was kept once as the previous version.');
    });
    on('[data-ics-download]', 'click', function (ev) {
      ev.preventDefault(); if (!icsEntry) return;
      try {
        var ics = buildIcs(icsEntry.id, { title: $('[data-ics-title]').value, date: $('[data-ics-date]').value, time: $('[data-ics-time]').value, timezone: $('[data-ics-tz]').value.trim(), durationMin: $('[data-ics-duration]').value, description: icsEntry.body });
        download(safeFileName($('[data-ics-title]').value, '.ics'), ics, 'text/calendar;charset=utf-8');
        $('[data-journal-ics]').close();
      } catch (e) { var m = $('[data-ics-error]'); if (m) m.textContent = 'Check the fields: ' + e.message + '.'; }
    });
  }
  window.__SRB_JOURNAL = { normalizeEntry: normalizeEntry, parseBackup: parseBackup, mergeEntries: mergeEntries, buildIcs: buildIcs, toMarkdown: toMarkdown, journalTitle: journalTitle,
    KEYS: { NAME_KEY: NAME_KEY, JOURNAL_KEY: JOURNAL_KEY, PREV_KEY: PREV_KEY }, LIMITS: { MAX_ENTRIES: MAX_ENTRIES, MAX_IMPORT_BYTES: MAX_IMPORT_BYTES } };
  document.addEventListener('DOMContentLoaded', function () {
    if (!$('[data-journal-page]')) { applyTitle(); return; }
    var doc = $('[data-journal-print-doc]'); if (doc) document.body.appendChild(doc);
    wire(); renderAll();
  });
})();
