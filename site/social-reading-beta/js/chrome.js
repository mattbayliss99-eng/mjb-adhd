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
