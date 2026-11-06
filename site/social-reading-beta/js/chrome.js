(function () {
  'use strict';
  var lastY = window.scrollY || 0, hidden = false, accumDown = 0, accumUp = 0;
  function activeScroller() {
    var lower = document.querySelector('.srb-reader[data-layout="split"] .srb-lower, .srb-reader[data-layout="side"] .srb-lower');
    if (lower && document.body.getAttribute('data-page') === 'story') return lower;
    return window;
  }
  function canAutoHide() {
    if (document.body.classList.contains('srb-always-nav')) return false;
    if (document.activeElement && document.activeElement.closest && document.activeElement.closest('.srb-top, .srb-dock, .srb-rail, dialog, .srb-show-nav')) return false;
    if (document.querySelector('dialog[open]')) return false;
    return true;
  }
  function setHidden(next) {
    if (hidden === next) return;
    if (next && document.activeElement && document.activeElement.closest && document.activeElement.closest('.srb-top, .srb-dock')) return;
    hidden = next;
    document.body.classList.toggle('srb-nav-hidden', hidden);
  }
  function onScroll(y, dy) {
    if (!canAutoHide()) { setHidden(false); accumDown = accumUp = 0; return; }
    if (y < 24) { setHidden(false); accumDown = accumUp = 0; return; }
    if (Math.abs(dy) < 2) return;
    if (dy > 0) { accumDown += dy; accumUp = 0; if (accumDown > 24) setHidden(true); }
    else { accumUp += -dy; accumDown = 0; if (accumUp > 24) setHidden(false); }
  }
  window.addEventListener('scroll', function () {
    if (activeScroller() !== window) return;
    var y = window.scrollY || 0; var dy = y - lastY; lastY = y; onScroll(y, dy);
  }, { passive: true });
  document.addEventListener('scroll', function (e) {
    var lower = document.querySelector('.srb-lower');
    if (!lower || e.target !== lower) return;
    var y = lower.scrollTop; var dy = y - (lower._srbY || 0); lower._srbY = y; onScroll(y, dy);
  }, true);
  document.addEventListener('focusin', function (e) {
    if (e.target && e.target.closest && e.target.closest('.srb-top, .srb-dock, .srb-rail')) setHidden(false);
  });
  var showBtn = document.getElementById('srb-show-nav');
  if (showBtn) showBtn.addEventListener('click', function () { setHidden(false); showBtn.blur(); document.getElementById('srb-prefs-btn')?.focus(); });
  var menuBtn = document.getElementById('srb-menu-btn');
  var drawer = document.getElementById('srb-drawer');
  if (menuBtn && drawer && drawer.showModal) {
    menuBtn.addEventListener('click', function () { setHidden(false); drawer.showModal(); menuBtn.setAttribute('aria-expanded', 'true'); });
    drawer.addEventListener('close', function () { menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus(); });
  }
  document.querySelectorAll('.srb-nav a, .srb-dock a').forEach(function (a) {
    try { if (a.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '')) a.setAttribute('aria-current', 'page'); } catch (e) {}
  });
})();

  // Stage1: rail density + dock Menu + expand restore
  (function () {
    var app = document.querySelector('.srb-app');
    var reopen = null;
    var top = document.querySelector('.srb-top');
    if (top && app) {
      reopen = document.createElement('button');
      reopen.type = 'button'; reopen.className = 'srb-icon-btn srb-rail-open'; reopen.textContent = 'Sidebar';
      reopen.setAttribute('aria-label', 'Open sidebar'); reopen.hidden = true;
      top.insertBefore(reopen, top.firstChild);
    }
    function setRail(mode, focusRail) {
      if (!app || ['expanded', 'rail', 'closed'].indexOf(mode) < 0) return;
      app.setAttribute('data-rail', mode);
      document.querySelectorAll('[data-rail-mode]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-rail-mode') === mode ? 'true' : 'false'); });
      if (reopen) reopen.hidden = mode !== 'closed';
      try { localStorage.setItem('mjb-srb-rail', mode); } catch (e) {}
      if (mode === 'closed' && reopen && focusRail) reopen.focus();
      if (mode !== 'closed' && focusRail) { var b = document.querySelector('[data-rail-mode="' + mode + '"]'); if (b) b.focus(); }
    }
    document.querySelectorAll('[data-rail-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () { setRail(btn.getAttribute('data-rail-mode'), true); });
    });
    if (reopen) reopen.addEventListener('click', function () { setRail('expanded', true); });
    try { var saved = localStorage.getItem('mjb-srb-rail'); if (saved) setRail(saved, false); } catch (e) {}
    var dockMenu = document.getElementById('srb-dock-menu');
    var drawer = document.getElementById('srb-drawer');
    var menuBtn = document.getElementById('srb-menu-btn');
    if (dockMenu && drawer) {
      dockMenu.addEventListener('click', function () {
        drawer.showModal();
        dockMenu.setAttribute('aria-expanded', 'true');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
      });
      drawer.addEventListener('close', function () {
        dockMenu.setAttribute('aria-expanded', 'false');
      });
    }
    // Expand reader from feed: remember scroll/focus; collapsing uses Back
    document.querySelectorAll('[data-expand-post]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var href = btn.getAttribute('data-expand-href');
        var id = btn.getAttribute('data-expand-post');
        try {
          sessionStorage.setItem('mjb-srb-expand-return', JSON.stringify({
            postId: id,
            scrollY: window.scrollY,
            focusId: 'post-' + String(id || '').toLowerCase(),
            t: Date.now()
          }));
        } catch (e) {}
        btn.setAttribute('aria-expanded', 'true');
        if (href) location.href = href;
      });
    });
    // Restore feed position after Back from reader
    try {
      var raw = sessionStorage.getItem('mjb-srb-expand-return');
      if (raw && /\/social-reading-beta\/?$/.test(location.pathname.replace(/index\.html$/, ''))) {
        var st = JSON.parse(raw);
        if (st && st.focusId) {
          var el = document.getElementById(st.focusId);
          if (el) el.scrollIntoView({ block: 'center' });
          else if (typeof st.scrollY === 'number') window.scrollTo(0, st.scrollY);
        }
      }
    } catch (e) {}
  })();
