/* Shell reader for existing published pages (Stage1 v0.3.1).
   Renders the ORIGINAL page's <main> fetched from its unchanged URL: one body per article, no copies.
   Sanitises imported markup (no scripts/handlers/javascript: URLs), keeps sources and links, verifies text parity. */
(function () {
  'use strict';
  var BASE = '/social-reading-beta/';
  var FAV_KEY = 'mjb-srb-favourites-v1';
  function $(s) { return document.querySelector(s); }
  function norm(t) { return String(t).replace(/\s+/g, ' ').trim(); }
  function status(m) { var el = $('[data-route-status]'); if (el) el.textContent = m; }
  function sha256(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  function favs() { try { var l = JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
  function sanitize(main, route, bank) {
    var byPath = {}; bank.forEach(function (r) { byPath[r.oldRoute] = r; });
    Array.prototype.forEach.call(main.querySelectorAll('script,template,iframe,object,embed,base,meta,link'), function (n) { n.remove(); });
    Array.prototype.forEach.call(main.querySelectorAll('*'), function (el) {
      Array.prototype.slice.call(el.attributes).forEach(function (a) {
        var n = a.name.toLowerCase();
        if (n.indexOf('on') === 0) { el.removeAttribute(a.name); return; }
        if (['href', 'src', 'poster', 'action', 'data'].indexOf(n) >= 0) {
          var v = a.value.trim();
          if (/^\s*(javascript|vbscript|data:text)/i.test(v)) { el.removeAttribute(a.name); return; }
          if (v.charAt(0) === '#') return; // in-page anchor stays in the reader
          var u; try { u = new URL(v, location.origin + route.oldRoute); } catch (e) { return; }
          if (u.origin === location.origin) {
            var target = byPath[u.pathname];
            if (n === 'href' && el.tagName === 'A' && target && target.mode === 'reader' && !el.hasAttribute('download')) {
              el.setAttribute('data-original-href', u.pathname + u.hash);
              el.setAttribute('href', BASE + 'read/?r=' + target.id + u.hash);
            } else el.setAttribute(a.name, u.pathname + u.search + u.hash);
          }
        }
        if (n === 'srcset') el.setAttribute(a.name, a.value.split(',').map(function (part) {
          var bits = part.trim().split(/\s+/); try { bits[0] = new URL(bits[0], location.origin + route.oldRoute).pathname; } catch (e) {} return bits.join(' ');
        }).join(', '));
      });
    });
    // Avoid id collisions with the shell chrome without breaking in-page anchors.
    Array.prototype.forEach.call(main.querySelectorAll('[id]'), function (el) {
      var id = el.id; if (!document.getElementById(id)) return;
      var nid = 'orig-' + id; el.id = nid;
      Array.prototype.forEach.call(main.querySelectorAll('a[href="#' + id + '"]'), function (a) { a.setAttribute('href', '#' + nid); });
      Array.prototype.forEach.call(main.querySelectorAll('[aria-labelledby="' + id + '"],[aria-describedby="' + id + '"],label[for="' + id + '"]'), function (x) {
        ['aria-labelledby', 'aria-describedby', 'for'].forEach(function (k) { if (x.getAttribute(k) === id) x.setAttribute(k, nid); });
      });
    });
  }
  function scrollKey(id) { return 'mjb-srb-progress:' + id; }
  function render(route, bank) {
    var article = $('[data-route-article]');
    $('[data-route-original]').href = route.oldRoute;
    var back = $('[data-route-back]'); back.href = BASE + 'library/' + route.group + '/#' + route.id;
    back.textContent = 'Back to ' + (document.referrer && document.referrer.indexOf(BASE + 'library/') >= 0 ? 'list' : 'library group');
    var params = new URLSearchParams(location.search), postId = params.get('post-return');
    if (/^MJB-P00000[123]$/.test(postId || '')) {
      // Story -> reference article journey: Back returns to the same post and step.
      var slide = null;
      try { var sv = JSON.parse(sessionStorage.getItem('mjb-srb-article-return') || 'null'); if (sv && sv.postId === postId && /^MJB-S\d{6}-\d{2}$/.test(sv.slideId || '')) slide = sv.slideId; } catch (e) {}
      var ret = BASE + 'p/' + postId.toLowerCase() + '/' + (slide ? '?slide=' + encodeURIComponent(slide) : '');
      back.href = ret; back.textContent = 'Back to story'; back.setAttribute('data-return-to-story', postId);
      return fetchAndRender(route, bank);
    }
    back.addEventListener('click', function (e) {
      if (document.referrer && new URL(document.referrer).pathname === BASE + 'library/' + route.group + '/' && history.length > 1) { e.preventDefault(); history.back(); }
    });
    return fetchAndRender(route, bank);
  }
  function fetchAndRender(route, bank) {
    var article = $('[data-route-article]');
    return fetch(route.oldRoute, { credentials: 'same-origin' }).then(function (res) {
      if (!res.ok) throw new Error('original page returned ' + res.status);
      return res.text();
    }).then(function (src) {
      var doc = new DOMParser().parseFromString(src, 'text/html');
      var main = doc.querySelector('main');
      if (!main) throw new Error('original page has no main content');
      sanitize(main, route, bank);
      var text = norm(main.textContent);
      while (main.firstChild) article.appendChild(document.adoptNode(main.firstChild));
      article.removeAttribute('aria-labelledby'); article.setAttribute('aria-label', route.title);
      document.title = route.title + ' - Reader - MJB social reading beta';
      var notice = $('[data-route-notice]');
      if (route.enhancements && route.enhancements.length) {
        notice.hidden = false;
        notice.textContent = 'Article text, sources and links are shown in full. Interactive extras on this page (' + route.enhancements.join(', ') + '), downloads and the site accessibility toolbar work on the original page.';
      }
      return sha256(text).then(function (h) {
        var ok = h === route.mainTextSha256;
        article.setAttribute('data-parity', ok ? 'match' : 'mismatch');
        status(ok ? 'Showing the published page "' + route.title + '" from ' + route.oldRoute + '. Text matches the route bank.' :
          'Showing ' + route.oldRoute + ', but its text differs from the route bank record. The original page is authoritative.');
      });
    }).then(function () {
      var h1 = article.querySelector('h1');
      var saved = null; try { saved = JSON.parse(localStorage.getItem(scrollKey(route.id)) || 'null'); } catch (e) {}
      if (location.hash) { var t = document.getElementById(decodeURIComponent(location.hash.slice(1))) || document.getElementById('orig-' + decodeURIComponent(location.hash.slice(1))); if (t) { t.scrollIntoView(); if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } }
      else if (saved && typeof saved.scrollY === 'number' && saved.scrollY > 0) { window.scrollTo(0, saved.scrollY); }
      if (!location.hash && h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
      var tick = null;
      window.addEventListener('scroll', function () {
        clearTimeout(tick); tick = setTimeout(function () { try { localStorage.setItem(scrollKey(route.id), JSON.stringify({ scrollY: Math.round(window.scrollY), at: new Date().toISOString() })); } catch (e) {} }, 200);
      }, { passive: true });
    });
  }
  function wireFav(route) {
    var b = $('[data-route-fav]');
    function sync() { var on = favs().some(function (f) { return f.id === route.id; }); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.textContent = (on ? '★ Favourited' : '☆ Favourite'); }
    b.addEventListener('click', function () {
      var l = favs(), on = l.some(function (f) { return f.id === route.id; });
      l = on ? l.filter(function (f) { return f.id !== route.id; }) : l.concat([{ id: route.id, title: route.title, savedAt: new Date().toISOString(), slideId: null }]);
      try { localStorage.setItem(FAV_KEY, JSON.stringify(l)); status(on ? 'Removed from favourites on this device.' : 'Saved to favourites on this device.'); } catch (e) { status('Could not save favourite: browser storage unavailable.'); }
      sync();
    });
    sync();
  }
  document.addEventListener('DOMContentLoaded', function () {
    if (!$('[data-route-reader]')) return;
    var id = new URLSearchParams(location.search).get('r') || '';
    if (!/^RT-[a-z0-9-]{1,100}$/.test(id)) { status('No page selected. Choose one from the Library.'); return; }
    fetch(BASE + 'routes.json').then(function (r) { return r.json(); }).then(function (bank) {
      var route = (bank.routes || []).filter(function (r) { return r.id === id; })[0];
      if (!route) { status('Unknown page id. Choose one from the Library.'); return; }
      if (route.mode !== 'reader') { status('This page opens as the original: ' + route.note); $('[data-route-original]').href = route.oldRoute; return; }
      wireFav(route);
      return render(route, bank.routes);
    }).catch(function (e) { status('Could not load this page in the reader (' + e.message + '). Use "Open original page".'); });
  });
})();
