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
    if (path.split('.').length > 8) throw new Error('preferences nested too deeply');
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
  function normalizePrefs(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('preferences must be an object');
    rejectHostile(value, 'prefs');
    var out = Object.assign({}, DEFAULTS);
    var enums = { text: ['100', '125', '150', '200'], theme: ['charcoal-gold', 'mjb-purple', 'ink-paper', 'graphite', 'deep-blue', 'rose', 'neon'],
      layoutMode: ['split', 'continuous', 'thread', 'deck'], splitOrientation: ['top-bottom', 'side-by-side'], logoVariant: ['gold', 'purple', 'mono', 'cyan', 'copper', 'game'] };
    Object.keys(DEFAULTS).forEach(function (k) {
      if (!Object.prototype.hasOwnProperty.call(value, k)) return;
      var v = value[k];
      if (enums[k]) { if (enums[k].indexOf(v) < 0) throw new Error('invalid ' + k); }
      else if (k === 'themeTokens') {
        if (v !== null) {
          if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('invalid colours');
          ['bg', 'primary', 'secondary'].forEach(function (c) { if (!/^#[0-9a-f]{6}$/i.test(v[c] || '')) throw new Error('invalid ' + c + ' colour'); });
          v = { bg: v.bg, primary: v.primary, secondary: v.secondary };
        }
      } else if (k === 'splitRatio' || k === 'cycleInterval') {
        if (typeof v !== 'number' || !isFinite(v) || v < (k === 'splitRatio' ? 20 : 10) || v > (k === 'splitRatio' ? 80 : 3600)) throw new Error('invalid ' + k);
      } else if (typeof v !== 'boolean' && !(k === 'reduceMotion' && v === null)) throw new Error('invalid ' + k);
      out[k] = v;
    });
    return out;
  }
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return Object.assign({}, DEFAULTS);
      var parsed = safeParse(raw);
      if (!parsed || typeof parsed !== 'object') return Object.assign({}, DEFAULTS);
      return normalizePrefs(parsed);
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
  /* Readable derived tokens for custom colours (all users). Every text token is pushed toward the ink colour
     until it reaches WCAG AA 4.5:1 against the chosen base, so any primary/secondary/base choice stays readable. */
  function hexRgb(h) { var m = /^#?([0-9a-f]{6})$/i.exec(String(h || '')); if (!m) return null; var n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function rgbHex(c) { return '#' + c.map(function (v) { return ('0' + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(-2); }).join(''); }
  function lum(c) { return c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce(function (s, v, i) { return s + v * [0.2126, 0.7152, 0.0722][i]; }, 0); }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function mix(a, b, t) { return a.map(function (v, i) { return v + (b[i] - v) * t; }); }
  function readable(c, bgs, ink, min) {
    bgs = Array.isArray(bgs[0]) ? bgs : [bgs];
    for (var t = 0; t <= 1.0001; t += 0.05) { var m = mix(c, ink, t); if (bgs.every(function (b) { return contrast(m, b) >= min; })) return m; }
    return ink;
  }
  function deriveTokens(tokens) {
    var bg = hexRgb(tokens.bg); if (!bg) return null;
    var white = [255, 255, 255], black = [0, 0, 0];
    var dark = contrast(white, bg) >= contrast(black, bg);
    var ink = dark ? [242, 239, 231] : [20, 18, 15], away = dark ? black : white;
    if (contrast(ink, bg) < 7) ink = dark ? white : black;
    // Mid-tone bases cannot carry readable text; move the base away from the ink until body text reaches 7:1.
    for (var i = 0; i < 20 && contrast(ink, bg) < 7; i++) bg = mix(bg, away, 0.1);
    var surface = mix(bg, ink, 0.05), raised = mix(bg, ink, 0.1);
    var pri = hexRgb(tokens.primary) || (dark ? [213, 174, 87] : [92, 61, 5]);
    var sec = hexRgb(tokens.secondary) || (dark ? [139, 120, 209] : [91, 74, 138]);
    var priText = readable(pri, [bg, surface, raised, mix(bg, pri, 0.12), mix(raised, pri, 0.12)], ink, 4.6);
    var onAccent = contrast(black, priText) >= contrast(white, priText) ? black : white;
    var muted = readable(mix(ink, bg, 0.35), [bg, surface, raised], ink, 4.6);
    return {
      '--srb-bg': rgbHex(bg), '--srb-surface': rgbHex(surface), '--srb-raised': rgbHex(raised),
      '--srb-ink': rgbHex(ink), '--srb-muted': rgbHex(muted),
      '--srb-gold': rgbHex(priText), '--srb-secondary': rgbHex(readable(sec, [bg, raised], ink, 3)),
      '--srb-link': rgbHex(readable(sec, [bg, surface, raised], ink, 4.6)), '--srb-focus': rgbHex(readable(sec, [bg, raised], ink, 3)),
      '--srb-on-accent': rgbHex(onAccent), '--srb-danger': rgbHex(readable([232, 160, 160], [bg, surface, raised], ink, 4.6)),
      adjustedBase: rgbHex(bg) !== rgbHex(hexRgb(tokens.bg))
    };
  }
  var TOKEN_KEYS = ['--srb-bg', '--srb-surface', '--srb-raised', '--srb-ink', '--srb-muted', '--srb-gold', '--srb-secondary', '--srb-link', '--srb-focus', '--srb-on-accent', '--srb-danger'];
  function applyTokens(tokens) {
    var d = tokens && deriveTokens(tokens); if (!d) return;
    var r = document.documentElement;
    TOKEN_KEYS.forEach(function (k) { r.style.setProperty(k, d[k]); });
    r.style.setProperty('color-scheme', lum(hexRgb(d['--srb-bg'])) < 0.18 ? 'dark' : 'light');
  }
  function clearTokens() {
    TOKEN_KEYS.concat(['color-scheme']).forEach(function (k) { document.documentElement.style.removeProperty(k); });
  }
  window.__SRB_THEME = { deriveTokens: deriveTokens, contrast: function (a, b) { return contrast(hexRgb(a), hexRgb(b)); } };
  function apply(p) {
    var root = document.documentElement;
    root.style.setProperty('--srb-text', (p.text || '100') + '%');
    root.setAttribute('data-text', String(p.text || '100'));
    var map = { 'charcoal-gold': 'dark-gold', 'mjb-purple': 'mjb-purple', 'ink-paper': 'ink-paper', 'graphite': 'graphite', 'deep-blue': 'deep-blue', 'rose': 'rose', 'neon': 'neon' };
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
          var p = normalizePrefs(clean);
          if (!write(p)) return;
          apply(p);
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
