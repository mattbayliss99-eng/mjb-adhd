(function () {
  'use strict';
  var KEY = 'mjb-srb-favourites-v1';
  function validFavourite(f) {
    return f && typeof f === 'object' && /^MJB-P00000[123]$/.test(f.id || '') &&
      (f.title == null || typeof f.title === 'string') &&
      (f.savedAt == null || typeof f.savedAt === 'string') &&
      (f.slideId == null || typeof f.slideId === 'string');
  }
  function read() {
    try { var list = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(list) ? list.filter(validFavourite) : []; } catch (e) { return []; }
  }
  function storageStatus(msg) {
    var el = document.querySelector('[data-storage-status], [data-fav-status]');
    if (el && msg) el.textContent = msg;
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); return true; }
    catch (e) { storageStatus('Could not save favourite on this device (storage unavailable or quota exceeded).'); return false; }
  }
  function rejectHostile(obj, path) {
    if (!obj || typeof obj !== 'object') return;
    if (Object.prototype.hasOwnProperty.call(obj, '__proto__') || Object.prototype.hasOwnProperty.call(obj, 'constructor')) throw new Error('hostile key at ' + path);
    Object.keys(obj).forEach(function (k) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') throw new Error('hostile key');
      var v = obj[k];
      if (typeof v === 'string' && /<script|javascript:|onerror=/i.test(v)) throw new Error('unsafe string');
      if (v && typeof v === 'object') rejectHostile(v, path + '.' + k);
    });
  }
  function isFav(id) { return read().some(function (x) { return x.id === id; }); }
  function toggle(id, meta) {
    var list = read();
    var i = list.findIndex(function (x) { return x.id === id; });
    if (i >= 0) list.splice(i, 1);
    else list.unshift({ id: id, title: (meta && meta.title) || id, savedAt: new Date().toISOString(), slideId: (meta && meta.slideId) || null, pinId: (meta && meta.pinId) || null });
    if (!write(list)) return null;
    return isFav(id);
  }
  function syncButtons() {
    document.querySelectorAll('[data-fav]').forEach(function (btn) {
      var id = btn.getAttribute('data-fav');
      var on = isFav(id);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.textContent = on ? '★ Saved' : '☆ Save';
    });
  }
  document.querySelectorAll('[data-fav]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-fav');
      var slide = document.querySelector('.srb-slide:not([hidden])');
      var state = toggle(id, {
        title: btn.getAttribute('data-fav-title') || id,
        slideId: slide && slide.getAttribute('data-slide-id'),
        pinId: null
      });
      if (state == null) {
        var st = document.querySelector('[data-download-status], [data-fav-status]');
        if (st) st.textContent = 'Could not save favourite on this device (storage unavailable).';
        return;
      }
      syncButtons();
      var status = document.querySelector('[data-fav-status]');
      if (status) status.textContent = state ? 'Saved on this device' : 'Removed from saved';
    });
  });
  syncButtons();

  if (document.body.getAttribute('data-page') === 'saved') {
    var list = document.getElementById('srb-saved-list');
    var favs = read();
    if (list) {
      list.replaceChildren();
      if (!favs.length) list.innerHTML = '<li>Nothing saved yet. Favourites stay on this device.</li>';
      else favs.forEach(function (f) {
        var row = document.createElement('li');
        var link = document.createElement('a');
        link.href = '/social-reading-beta/p/' + f.id.toLowerCase() + '/' + (f.slideId ? '?slide=' + encodeURIComponent(f.slideId) : '');
        link.textContent = f.title || f.id;
        var note = document.createElement('p'); note.className = 'srb-fine';
        note.textContent = 'Favourite · saved ' + (f.savedAt || '') + ' · not the same as downloaded';
        var remove = document.createElement('button'); remove.type = 'button'; remove.className = 'srb-btn';
        remove.setAttribute('data-fav', f.id); remove.textContent = 'Remove';
        row.append(link, note, remove); list.append(row);
      });
      list.querySelectorAll('[data-fav]').forEach(function (btn) {
        btn.addEventListener('click', function () { toggle(btn.getAttribute('data-fav')); location.reload(); });
      });
    }
  }

  // export/import progress+favs
  var exp = document.getElementById('srb-export-local');
  if (exp) exp.addEventListener('click', function () {
    var progress = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('mjb-srb-progress:') === 0) progress[k] = localStorage.getItem(k);
      }
    } catch (e) {}
    var payload = { schema: 'mjb-srb-local-v1', favourites: read(), progress: progress, exportedAt: new Date().toISOString() };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mjb-reader-local.json'; a.click();
  });
  var imp = document.getElementById('srb-import-local');
  if (imp) imp.addEventListener('change', function () {
    var f = imp.files && imp.files[0]; if (!f) return;
    if (f.size > 500000) { alert('Import too large'); return; }
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        if (!data || data.schema !== 'mjb-srb-local-v1') throw new Error('bad schema');
        rejectHostile(data, 'root');
        if (data.favourites && !Array.isArray(data.favourites)) throw new Error('favourites must be array');
        if (Array.isArray(data.favourites)) {
          data.favourites.forEach(function (item, i) {
            if (!validFavourite(item)) throw new Error('bad or unknown favourite ' + i);
            rejectHostile(item, 'fav'+i);
          });
        }
        if (!confirm('Replace local favourites/progress with imported file?')) return;
        if (Array.isArray(data.favourites)) {
          if (!write(data.favourites)) throw new Error('storage write failed');
        }
        if (data.progress && typeof data.progress === 'object') {
          Object.keys(data.progress).forEach(function (k) {
            if (k.indexOf('mjb-srb-progress:') === 0 && typeof data.progress[k] === 'string') {
              try { localStorage.setItem(k, data.progress[k]); } catch (e) { throw new Error('progress storage failed'); }
            }
          });
        }
        location.reload();
      } catch (err) { alert('Import rejected: ' + err.message); storageStatus('Import rejected.'); }
    };
    reader.readAsText(f);
  });

  window.__SRB_favourites = { read: read, toggle: toggle, isFav: isFav };
})();
