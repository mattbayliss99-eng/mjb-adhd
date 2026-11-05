(function () {
  'use strict';
  var KEY = 'mjb-srb-prefs-v2';
  var DEFAULTS = {
    alwaysNav: false, reduceMotion: null, swipe: false, text: '100',
    theme: 'charcoal-gold', plain: false, opaque: false,
    layoutMode: 'split', splitOrientation: 'top-bottom', splitRatio: 42,
    visualLinkMode: true, visualAutoCycle: false, cycleInterval: 10, autoCycleMotionOverride: false,
    logoVariant: 'gold', themeTokens: null
  };
  function storageStatus(msg) {
    var el = document.querySelector('[data-storage-status]');
    if (el && msg) el.textContent = msg;
  }
  function safeParse(raw) {
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function rejectHostile(obj, path) {
    if (!obj || typeof obj !== 'object') return;
    if (Object.prototype.hasOwnProperty.call(obj, '__proto__') || Object.prototype.hasOwnProperty.call(obj, 'prototype') || Object.prototype.hasOwnProperty.call(obj, 'constructor')) {
      throw new Error('hostile key at ' + path);
    }
    Object.keys(obj).forEach(function (k) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') throw new Error('hostile key ' + k);
      var v = obj[k];
      if (typeof v === 'string') {
        if (/[<>]|javascript:|expression\(|url\s*\(/i.test(v)) throw new Error('unsafe token string');
        if (k.match(/bg|primary|secondary|surface|raised|color/i) && v && !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v) && !/^rgb(a)?\(/.test(v)) {
          // allow only hex/rgb for colour-like keys when present
          if (/^#|^rgb/i.test(v) === false && /color|bg|primary|secondary|surface|raised/i.test(k)) throw new Error('unsafe colour ' + k);
        }
      } else if (v && typeof v === 'object') rejectHostile(v, path + '.' + k);
    });
  }
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return Object.assign({}, DEFAULTS);
      var parsed = safeParse(raw);
      if (!parsed || typeof parsed !== 'object') return Object.assign({}, DEFAULTS);
      return Object.assign({}, DEFAULTS, parsed);
    } catch (e) { storageStatus('Preferences unavailable on this device.'); return Object.assign({}, DEFAULTS); }
  }
  function write(p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); storageStatus(''); return true; }
    catch (e) { storageStatus('Could not save preferences (storage full or blocked).'); return false; }
  }
  function themeName(p) {
    if (p.themeTokens && p.themeTokens.bg) return 'custom';
    return p.theme || 'charcoal-gold';
  }
  function applyTokens(tokens) {
    if (!tokens) return;
    var r = document.documentElement.style;
    if (tokens.bg) r.setProperty('--srb-bg', tokens.bg);
    if (tokens.primary) r.setProperty('--srb-gold', tokens.primary);
    if (tokens.secondary) r.setProperty('--srb-secondary', tokens.secondary);
    // derived
    if (tokens.bg) {
      r.setProperty('--srb-surface', tokens.surface || tokens.bg);
      r.setProperty('--srb-raised', tokens.raised || tokens.bg);
    }
  }
  function clearTokens() {
    ['--srb-bg','--srb-surface','--srb-raised','--srb-gold','--srb-secondary'].forEach(function (k) {
      document.documentElement.style.removeProperty(k);
    });
  }
  function apply(p) {
    var root = document.documentElement;
    root.style.setProperty('--srb-text', (p.text || '100') + '%');
    root.setAttribute('data-text', String(p.text || '100'));
    var map = { 'charcoal-gold': 'dark-gold', 'mjb-purple': 'mjb-purple', 'ink-paper': 'ink-paper', 'graphite': 'graphite', 'deep-blue': 'deep-blue', 'neon': 'neon' };
    var t = themeName(p);
    if (t === 'custom') { root.setAttribute('data-theme', 'dark-gold'); applyTokens(p.themeTokens); }
    else { clearTokens(); root.setAttribute('data-theme', map[p.theme] || 'dark-gold'); }
    if (p.reduceMotion == null && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) p.reduceMotion = true;
    root.setAttribute('data-reduce-motion', p.reduceMotion ? 'true' : 'false');
    root.setAttribute('data-plain', p.plain ? 'true' : 'false');
    root.setAttribute('data-opaque', p.opaque ? 'true' : 'false');
    document.body.classList.toggle('srb-always-nav', !!p.alwaysNav);
    root.style.setProperty('--srb-split', String(p.splitRatio || 42));
    var logo = document.getElementById('srb-logo');
    if (logo) logo.setAttribute('data-logo', p.logoVariant || 'gold');
    // sync form
    var set = function (id, val, prop) {
      var el = document.getElementById(id); if (!el) return;
      if (prop === 'checked') el.checked = !!val; else el.value = val;
    };
    set('pref-always-nav', p.alwaysNav, 'checked');
    set('pref-reduce-motion', p.reduceMotion, 'checked');
    set('pref-swipe', p.swipe, 'checked');
    set('pref-plain', p.plain, 'checked');
    set('pref-opaque', p.opaque, 'checked');
    set('pref-text', p.text || '100');
    set('pref-theme', p.theme || 'charcoal-gold');
    set('pref-layout', p.layoutMode || 'split');
    set('pref-orient', p.splitOrientation || 'top-bottom');
    set('pref-logo', p.logoVariant || 'gold');
    set('pref-auto-cycle', p.visualAutoCycle, 'checked');
    set('pref-auto-cycle-motion-override', p.autoCycleMotionOverride, 'checked');
    set('pref-cycle-interval', String(Math.max(10, Number(p.cycleInterval) || 10)));
    set('pref-link-visuals', p.visualLinkMode !== false, 'checked');
    window.__SRB_PREFS = p;
    document.dispatchEvent(new CustomEvent('srb:prefs', { detail: p }));
  }
  var prefs = read();
  apply(prefs);
  function bind() {
    var dlg = document.getElementById('srb-prefs');
    var btn = document.getElementById('srb-prefs-btn');
    if (btn && dlg && dlg.showModal) btn.addEventListener('click', function () { apply(read()); dlg.showModal(); });
    function syncFromForm() {
      var p = read();
      p.alwaysNav = !!(document.getElementById('pref-always-nav') || {}).checked;
      p.reduceMotion = !!(document.getElementById('pref-reduce-motion') || {}).checked;
      p.swipe = !!(document.getElementById('pref-swipe') || {}).checked;
      p.plain = !!(document.getElementById('pref-plain') || {}).checked;
      p.opaque = !!(document.getElementById('pref-opaque') || {}).checked;
      p.text = (document.getElementById('pref-text') || {}).value || '100';
      p.theme = (document.getElementById('pref-theme') || {}).value || 'charcoal-gold';
      p.layoutMode = (document.getElementById('pref-layout') || {}).value || 'split';
      p.splitOrientation = (document.getElementById('pref-orient') || {}).value || 'top-bottom';
      p.logoVariant = (document.getElementById('pref-logo') || {}).value || 'gold';
      p.visualAutoCycle = !!(document.getElementById('pref-auto-cycle') || {}).checked;
      p.autoCycleMotionOverride = !!(document.getElementById('pref-auto-cycle-motion-override') || {}).checked;
      p.cycleInterval = Math.max(10, Number((document.getElementById('pref-cycle-interval') || {}).value) || 10);
      p.visualLinkMode = !!(document.getElementById('pref-link-visuals') || {}).checked;
      // custom colours preview
      var bg = document.getElementById('pref-c-bg');
      var pri = document.getElementById('pref-c-primary');
      var sec = document.getElementById('pref-c-secondary');
      if (bg && pri && sec && document.getElementById('pref-use-custom') && document.getElementById('pref-use-custom').checked) {
        p.themeTokens = { bg: bg.value, primary: pri.value, secondary: sec.value, surface: bg.value, raised: bg.value };
      } else if (document.getElementById('pref-use-custom') && !document.getElementById('pref-use-custom').checked) {
        p.themeTokens = null;
      }
      write(p); apply(p);
    }
    document.querySelectorAll('#srb-prefs input, #srb-prefs select').forEach(function (el) {
      el.addEventListener('change', syncFromForm);
    });
    var applyBtn = document.getElementById('pref-apply-theme');
    if (applyBtn) applyBtn.addEventListener('click', function (e) { e.preventDefault(); syncFromForm(); });
    var resetBtn = document.getElementById('pref-reset-appearance');
    if (resetBtn) resetBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var p = read();
      ['theme','plain','opaque','logoVariant','themeTokens','text'].forEach(function (k) { delete p[k]; });
      p = Object.assign({}, DEFAULTS, p, { theme: 'charcoal-gold', text: '100', plain: false, opaque: false, logoVariant: 'gold', themeTokens: null });
      write(p); apply(p);
    });
    var exp = document.getElementById('pref-export');
    if (exp) exp.addEventListener('click', function (e) {
      e.preventDefault();
      var blob = new Blob([JSON.stringify({ schema: 'mjb-srb-prefs-v2', prefs: read() }, null, 2)], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mjb-reader-prefs.json'; a.click();
    });
    var imp = document.getElementById('pref-import');
    if (imp) imp.addEventListener('change', function () {
      var f = imp.files && imp.files[0]; if (!f) return;
      if (f.size > 100000) { alert('Import too large'); return; }
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = safeParse(String(reader.result));
          if (!data || data.schema !== 'mjb-srb-prefs-v2' || typeof data.prefs !== 'object' || Array.isArray(data.prefs)) throw new Error('bad schema');
          rejectHostile(data, 'root');
          var clean = {};
          Object.keys(DEFAULTS).forEach(function (k) {
            if (Object.prototype.hasOwnProperty.call(data.prefs, k)) clean[k] = data.prefs[k];
          });
          if (data.prefs.themeTokens) {
            rejectHostile(data.prefs.themeTokens, 'themeTokens');
            clean.themeTokens = {
              bg: data.prefs.themeTokens.bg,
              primary: data.prefs.themeTokens.primary,
              secondary: data.prefs.themeTokens.secondary,
              surface: data.prefs.themeTokens.surface,
              raised: data.prefs.themeTokens.raised
            };
          }
          var p = Object.assign({}, DEFAULTS, clean);
          write(p); apply(p);
          storageStatus('Preferences imported.');
        } catch (err) { alert('Import rejected: ' + err.message); storageStatus('Import rejected.'); }
      };
      reader.readAsText(f);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
  window.__SRB_readPrefs = read;
  window.__SRB_writePrefs = function (p) { write(p); apply(p); };
})();
