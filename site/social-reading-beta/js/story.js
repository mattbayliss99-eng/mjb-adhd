(function () {
  'use strict';
  function prefs() { return window.__SRB_PREFS || window.__SRB_readPrefs && window.__SRB_readPrefs() || {}; }
  var reader = document.querySelector('.srb-reader');
  var story = document.querySelector('.srb-story');
  var viewer = document.querySelector('[data-image-viewer]');
  var enlarge = document.querySelector('[data-enlarge-visual]');
  var zoom = 100;
  function zoomImage() { var img = document.querySelector('[data-viewer-image]'); if (img) img.style.width = zoom + '%'; }
  if (enlarge && viewer) {
    enlarge.addEventListener('click', function () {
      var source = document.querySelector('[data-visual-slot]');
      var image = viewer.querySelector('[data-viewer-image]');
      image.src = source.src; image.alt = source.alt; zoom = 100; zoomImage();
      viewer.querySelector('[data-viewer-caption]').textContent = source.alt;
      viewer.showModal();
    });
    viewer.querySelectorAll('[data-viewer-zoom]').forEach(function (b) { b.addEventListener('click', function () {
      var action = b.getAttribute('data-viewer-zoom'); zoom = action === 'reset' ? 100 : Math.max(100, Math.min(500, zoom + (action === 'in' ? 100 : -100))); zoomImage();
    }); });
    viewer.addEventListener('close', function () { enlarge.focus({ preventScroll:true }); });
  }
  var selectedIndex = 0;
  if (!reader || !story) {
    wireFeedOnly();
    return;
  }

  function slides() { return Array.prototype.slice.call(document.querySelectorAll('.srb-slide')); }
  function statusEl() { return document.querySelector('[data-slide-status]'); }
  function currentIndex() {
    return selectedIndex;
  }
  function pinVisualForSlide(slide) {
    var pin = document.querySelector('[data-pin-visual]');
    if (!pin) return;
    if (pin.getAttribute('data-manual') === '1') return;
    var ref = slide.getAttribute('data-visual-ref');
    var img = pin.querySelector('[data-visual-slot]');
    var cap = pin.querySelector('[data-pin-caption]');
    var title = pin.querySelector('[data-pin-title]');
    if (title) title.textContent = slide.querySelector('.srb-slide-heading') ? slide.querySelector('.srb-slide-heading').textContent : '';
    if (!ref) {
      if (cap) cap.textContent = 'Pinned original point (no mapped visual for this step).';
      return;
    }
    // Keep current pin unless linked mode
    var vsrc = slide.getAttribute('data-visual-src');
    if (img && vsrc && vsrc.charAt(0) === '/' && vsrc.indexOf('//') !== 0) {
      if (img.getAttribute('src') !== vsrc) img.setAttribute('src', vsrc);
      img.setAttribute('alt', slide.getAttribute('data-visual-alt') || '');
      if (slide.getAttribute('data-visual-w')) { img.setAttribute('width', slide.getAttribute('data-visual-w')); img.setAttribute('height', slide.getAttribute('data-visual-h')); }
      pin.setAttribute('data-pinned-id', ref);
      if (typeof visualFrames !== 'undefined' && visualFrames) visualFrames.forEach(function (f, k) { if (f.ref === ref) visualIndex = k; });
    }
    if (cap) cap.textContent = 'Image linked to explanation · ' + (slide.getAttribute('data-visual-caption') || ref);
  }
  function show(index, opts) {
    opts = opts || {};
    var all = slides();
    if (!all.length) return;
    index = Math.max(0, Math.min(all.length - 1, index));
    selectedIndex = index;
    syncLayoutContent();
    document.querySelectorAll('.srb-dot').forEach(function (dot, i) {
      if (i === index) dot.setAttribute('aria-current', 'true'); else dot.removeAttribute('aria-current');
    });
    var slide = all[index];
    var id = slide.getAttribute('data-slide-id');
    var st = statusEl();
    var count = document.querySelector('[data-step-count]'); if (count) count.textContent = (index + 1) + ' of ' + all.length;
    if (st) st.textContent = 'Explanation ' + (index + 1) + ' of ' + all.length + ' · ' + id;
    pinVisualForSlide(slide);
    var heading = slide.querySelector('.srb-slide-heading');
    if (opts.focus && reader.getAttribute('data-layout') === 'thread') {
      var block = reader.querySelectorAll('.srb-thread-block')[index];
      if (block) { block.open = true; block.querySelector('summary').focus({ preventScroll: true }); }
    } else if (opts.focus && heading) heading.focus({ preventScroll: true });
    try {
      var url = new URL(location.href);
      if (url.searchParams.get('slide') !== id) {
        url.searchParams.set('slide', id);
        history.replaceState({ slide: id }, '', url);
      }
      sessionStorage.setItem('mjb-srb-slide:' + location.pathname, id);
      var progress = { postId: story.getAttribute('data-post-id'), slideId: id, pinned: document.querySelector('[data-pin-visual]')?.getAttribute('data-pinned-id') || null, t: Date.now() };
      localStorage.setItem('mjb-srb-progress:' + progress.postId, JSON.stringify(progress));
    } catch (e) {}
    document.dispatchEvent(new CustomEvent('srb:slide', { detail: { id: id, index: index } }));
  }
  function go(delta) { show(currentIndex() + delta, { focus: !document.activeElement.closest('[data-slide-prev],[data-slide-next]') }); }

  function syncLayoutContent() {
    var mode = reader.getAttribute('data-layout');
    var thread = reader.querySelector('[data-thread]');
    if (thread) thread.hidden = mode !== 'thread';
    slides().forEach(function (el, i) { el.hidden = mode === 'thread' || (mode !== 'continuous' && i !== selectedIndex); });
    // v0.3.2 deck: one card per step; the pinned visual is shown only when the current step maps to one.
    var cur = slides()[selectedIndex];
    reader.setAttribute('data-deck-visual', mode === 'deck' && cur && cur.getAttribute('data-visual-ref') ? 'yes' : 'no');
  }
  function applyLayout() {
    var p = prefs();
    var mode = p.layoutMode || 'auto';
    if (mode === 'auto') mode = window.matchMedia('(min-width: 900px)').matches ? 'split' : 'deck';
    if (mode === 'split' && p.splitOrientation === 'side-by-side' && window.matchMedia('(min-width: 900px)').matches) mode = 'side';
    reader.setAttribute('data-layout', mode === 'continuous' || mode === 'thread' || mode === 'deck' ? mode : (mode === 'side' ? 'side' : 'split'));
    syncLayoutContent();
    document.documentElement.style.setProperty('--srb-split', String(p.splitRatio || 42));
  }
  applyLayout();
  document.addEventListener('srb:prefs', applyLayout);
  var layoutBreakpoint = window.matchMedia('(min-width: 900px)');
  if (layoutBreakpoint.addEventListener) layoutBreakpoint.addEventListener('change', applyLayout);

  // Divider presets + keyboard
  var divider = document.querySelector('[data-split-divider]');
  function setRatio(n) {
    n = Math.max(25, Math.min(75, Number(n) || 42));
    var p = prefs(); p.splitRatio = n; window.__SRB_writePrefs(p);
    if (divider) divider.setAttribute('aria-valuenow', String(n));
  }
  document.querySelectorAll('[data-split-preset]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var options = document.querySelector('.srb-seam-options');
      if (options) { options.open = false; options.querySelector('summary').focus({ preventScroll:true }); }
      var v = btn.getAttribute('data-split-preset');
      if (v === 'continuous') { var p = prefs(); p.layoutMode = 'continuous'; window.__SRB_writePrefs(p); return; }
      if (v === 'thread') { var p2 = prefs(); p2.layoutMode = 'thread'; window.__SRB_writePrefs(p2); return; }
      if (v === 'deck') { var p4 = prefs(); p4.layoutMode = 'deck'; window.__SRB_writePrefs(p4); return; }
      if (v === 'split') { var p3 = prefs(); p3.layoutMode = 'split'; window.__SRB_writePrefs(p3); return; }
      setRatio(v);
    });
  });
  if (divider) {
    divider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); setRatio((prefs().splitRatio || 42) - 2); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); setRatio((prefs().splitRatio || 42) + 2); }
      if (e.key === 'Home') { e.preventDefault(); setRatio(30); }
      if (e.key === 'End') { e.preventDefault(); setRatio(70); }
    });
    // optional drag
    var dragging = false;
    divider.addEventListener('pointerdown', function (e) {
      dragging = true; divider.__srbMoved = false; divider.setPointerCapture(e.pointerId);
    });
    divider.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var rect = reader.getBoundingClientRect();
      var side = reader.getAttribute('data-layout') === 'side';
      var ratio = side ? ((e.clientX - rect.left) / rect.width) * 100 : ((e.clientY - rect.top) / rect.height) * 100;
      divider.__srbMoved = true;
      setRatio(ratio);
    });
    divider.addEventListener('pointerup', function () { dragging = false; });
  }

  // Initial slide from query/progress
  (function parseInitial() {
    var all = slides(); if (!all.length) return;
    var fromQuery = null, saved = null;
    try { fromQuery = new URL(location.href).searchParams.get('slide'); } catch (e) {}
    try {
      saved = sessionStorage.getItem('mjb-srb-slide:' + location.pathname);
      if (!saved) saved = JSON.parse(localStorage.getItem('mjb-srb-progress:' + story.getAttribute('data-post-id')) || 'null')?.slideId;
    } catch (e) {}
    var target = fromQuery || saved || all[0].getAttribute('data-slide-id');
    var idx = 0;
    if (/^[1-9][0-9]*$/.test(target)) idx = Math.min(Number(target), all.length) - 1;
    for (var i = 0; i < all.length; i++) if (all[i].getAttribute('data-slide-id') === target) { idx = i; break; }
    show(idx, { focus: !!fromQuery, replace: true });
  })();

  var prev = story.querySelector('[data-slide-prev]');
  var next = story.querySelector('[data-slide-next]');
  if (prev) prev.addEventListener('click', function () { go(-1); });
  if (next) next.addEventListener('click', function () {
    if (currentIndex() >= slides().length - 1) {
      var end = document.querySelector('[data-story-end]');
      if (end) { end.hidden = false; end.focus(); }
      return;
    }
    go(1);
  });
  story.querySelectorAll('[data-go-slide]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-go-slide');
      var all = slides();
      for (var i = 0; i < all.length; i++) if (all[i].getAttribute('data-slide-id') === id) { show(i, { focus: true }); break; }
    });
  });
  story.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
    if (e.target && (e.target.closest('a,button,input,textarea,select,summary,[contenteditable]') || e.target.isContentEditable)) return;
    if (e.target && e.target.closest && e.target.closest('[data-split-divider]')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  });

  // Manual visual browse
  var visPrev = document.querySelector('[data-visual-prev]');
  var visNext = document.querySelector('[data-visual-next]');
  var resumeLink = document.querySelector('[data-resume-linked]');
  function markManual() {
    var pin = document.querySelector('[data-pin-visual]');
    if (pin) pin.setAttribute('data-manual', '1');
    if (resumeLink) resumeLink.hidden = false;
  }
  if (resumeLink) resumeLink.addEventListener('click', function () {
    var pin = document.querySelector('[data-pin-visual]');
    if (pin) pin.removeAttribute('data-manual');
    resumeLink.hidden = true;
    var p = prefs(); p.visualLinkMode = true; window.__SRB_writePrefs(p);
    pinVisualForSlide(slides()[currentIndex()]);
  });

  // Auto-cycle visuals: OFF by default; never advances text/posts.
  var cycleTimer = null;
  var cyclePlaying = false;
  var cycleInterrupted = false; // stays paused until explicit Play
  // v0.3.2: frames are the post's real mapped visuals (from the content bank), then the labelled decorative mark.
  var visualFrames = [];
  (function () {
    var seen = {};
    slides().forEach(function (sl) {
      var ref = sl.getAttribute('data-visual-ref'), src = sl.getAttribute('data-visual-src');
      if (!ref || !src || seen[ref] || src.charAt(0) !== '/' || src.indexOf('//') === 0) return;
      seen[ref] = 1;
      visualFrames.push({ ref: ref, src: src, alt: sl.getAttribute('data-visual-alt') || '', caption: sl.getAttribute('data-visual-caption') || ref,
        w: sl.getAttribute('data-visual-w'), h: sl.getAttribute('data-visual-h') });
    });
    visualFrames.push({ ref: 'VIS-MJB-MARK-001', src: '/social-reading-beta/assets/mjb-engraved-mark.svg', alt: 'Original decorative charcoal panel with gold engraved border and MJB mark. Not a scientific diagram.', caption: 'Original MJB decorative mark · not evidence', w: '784', h: '500' });
  })();
  var visualIndex = 0;
  function visualStatus() { return document.querySelector('[data-visual-status]'); }
  function cycleToggleBtn() { return document.querySelector('[data-visual-cycle-toggle]'); }
  function applyVisualFrame(i) {
    visualIndex = ((i % visualFrames.length) + visualFrames.length) % visualFrames.length;
    var frame = visualFrames[visualIndex];
    var pin = document.querySelector('[data-pin-visual]');
    var img = pin && pin.querySelector('[data-visual-slot]');
    var cap = pin && pin.querySelector('[data-pin-caption]');
    if (img) {
      if (img.getAttribute('src') !== frame.src) img.setAttribute('src', frame.src);
      img.setAttribute('alt', frame.alt);
      if (frame.w) { img.setAttribute('width', frame.w); img.setAttribute('height', frame.h); }
      img.setAttribute('data-frame', frame.ref);
      if (pin) pin.setAttribute('data-pinned-id', frame.ref);
    }
    if (cap) cap.textContent = frame.caption;
    var st = visualStatus();
    if (st) st.textContent = 'Image ' + (visualIndex + 1) + ' of ' + visualFrames.length + ' · ' + (cyclePlaying ? 'auto-cycle playing' : 'auto-cycle paused');
  }
  function clearCycleTimer() { if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; } }
  function canAutoCycle() {
    var p = prefs();
    if (!p.visualAutoCycle) return false;
    if (p.reduceMotion && !p.autoCycleMotionOverride) return false;
    return true;
  }
  function syncCycleButton() {
    var btn = cycleToggleBtn();
    if (!btn) return;
    var allowed = canAutoCycle();
    btn.disabled = !allowed;
    btn.setAttribute('aria-pressed', cyclePlaying ? 'true' : 'false');
    btn.textContent = cyclePlaying ? 'Pause visuals' : 'Play visuals';
    if (!allowed) {
      var st = visualStatus();
      if (st) st.textContent = 'Image ' + (visualIndex + 1) + ' of ' + visualFrames.length + ' · auto-cycle off';
    }
  }
  function interruptCycle(reason) {
    if (!cyclePlaying && !cycleTimer) { syncCycleButton(); return; }
    cyclePlaying = false;
    cycleInterrupted = true;
    clearCycleTimer();
    syncCycleButton();
    var st = visualStatus();
    if (st) st.textContent = 'Image ' + (visualIndex + 1) + ' of ' + visualFrames.length + ' · auto-cycle paused (' + (reason || 'interaction') + ')';
  }
  function tickCycle() {
    if (!cyclePlaying) return;
    if (document.hidden) { interruptCycle('hidden tab'); return; }
    if (document.querySelector('dialog[open]')) { interruptCycle('menu open'); return; }
    if (document.querySelector('details.srb-evidence[open]')) { interruptCycle('evidence open'); return; }
    var reader = document.querySelector('.srb-reader');
    if (reader) {
      var rect = reader.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > (window.innerHeight || 0)) { interruptCycle('off-screen'); return; }
    }
    applyVisualFrame(visualIndex + 1);
  }
  function startCycleTimer() {
    clearCycleTimer();
    if (!cyclePlaying || !canAutoCycle()) return;
    var p = prefs();
    var ms = Math.max(10, Number(p.cycleInterval) || 10) * 1000;
    // Tests may set data-cycle-ms on body for accelerated verification
    var accel = Number(document.body.getAttribute('data-cycle-ms') || '0');
    if (accel > 0) ms = accel;
    cycleTimer = setInterval(tickCycle, ms);
  }
  function playCycle() {
    if (!canAutoCycle()) { syncCycleButton(); return; }
    cycleInterrupted = false;
    cyclePlaying = true;
    syncCycleButton();
    startCycleTimer();
    var st = visualStatus();
    if (st) st.textContent = 'Image ' + (visualIndex + 1) + ' of ' + visualFrames.length + ' · auto-cycle playing';
  }
  function pauseCycle(reason) { interruptCycle(reason || 'pause'); }
  function onPrefsCycle() {
    clearCycleTimer();
    if (!canAutoCycle()) { cyclePlaying = false; syncCycleButton(); return; }
    // Prefer no surprise restart after interruption
    if (cycleInterrupted) { cyclePlaying = false; syncCycleButton(); return; }
    if (prefs().visualAutoCycle && cyclePlaying) startCycleTimer();
    syncCycleButton();
  }
  var toggle = cycleToggleBtn();
  if (toggle) toggle.addEventListener('click', function () {
    if (cyclePlaying) pauseCycle('pause control');
    else playCycle();
  });
  // Manual image action / focus in visual controls pauses
  var visControls = document.querySelector('[data-visual-controls]');
  if (visPrev) visPrev.addEventListener('click', function () { markManual(); applyVisualFrame(visualIndex - 1); interruptCycle('manual image'); });
  if (visNext) visNext.addEventListener('click', function () { markManual(); applyVisualFrame(visualIndex + 1); interruptCycle('manual image'); });
  if (visControls) {
    visControls.addEventListener('focusin', function () { if (cyclePlaying) interruptCycle('focus in visual controls'); });
  }
  document.addEventListener('toggle', function (e) {
    if (e.target && e.target.matches && e.target.matches('details.srb-evidence') && e.target.open) interruptCycle('evidence open');
  }, true);
  document.addEventListener('srb:prefs', onPrefsCycle);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) interruptCycle('hidden tab');
    // do not auto-resume when visible again
  });
  applyVisualFrame(0);
  syncCycleButton();
  // Expose for tests
  window.__SRB_cycle = { play: playCycle, pause: pauseCycle, isPlaying: function () { return cyclePlaying; }, index: function () { return visualIndex; }, frames: function () { return visualFrames.length; } };

  document.querySelectorAll('[data-article], [data-evidence]').forEach(function (a) {
    a.addEventListener('click', function () {
      try {
        var slide = slides()[currentIndex()];
        var id = slide && slide.getAttribute('data-slide-id');
        var post = story.getAttribute('data-post-id');
        sessionStorage.setItem('mjb-srb-article-return', JSON.stringify({ postId: post, slideId: id, t: Date.now() }));
      } catch (e) {}
    });
  });

  // Share slide
  function slideLink() {
    var slide = slides()[currentIndex()];
    var url = new URL(location.href);
    url.searchParams.set('slide', slide.getAttribute('data-slide-id'));
    return url.toString();
  }
  var shareBtn = story.querySelector('[data-share-slide]');
  var copyBtn = story.querySelector('[data-copy-slide-link]');
  if (shareBtn) shareBtn.addEventListener('click', function () {
    var url = slideLink();
    if (navigator.share) navigator.share({ title: document.title, url: url }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url);
  });
  if (copyBtn) copyBtn.addEventListener('click', function () {
    if (navigator.clipboard) navigator.clipboard.writeText(slideLink()).then(function () {
      var st = statusEl(); if (st) st.textContent = 'Step link copied';
    });
  });
  var printBtn = story.querySelector('[data-print-deck]');
  if (printBtn) printBtn.addEventListener('click', function () {
    var indexBeforePrint = currentIndex();
    var evidenceBeforePrint = Array.from(document.querySelectorAll('details.srb-evidence')).map(function (d) { return [d, d.open]; });
    // Expand evidence for full export
    document.querySelectorAll('details.srb-evidence').forEach(function (d) { d.open = true; });
    document.querySelectorAll('.srb-slide').forEach(function (s) { s.hidden = false; });
    window.print();
    // restore
    setTimeout(function () {
      show(indexBeforePrint);
      evidenceBeforePrint.forEach(function (item) { item[0].open = item[1]; });
    }, 500);
  });

  wireFeedOnly();

  function wireFeedOnly() {
    // favourites + share on feed cards handled in favourites.js / below
    document.querySelectorAll('[data-share-post]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-share-post');
        var url = new URL('/social-reading-beta/p/' + id.toLowerCase() + '/', location.origin).toString();
        if (navigator.share) navigator.share({ title: btn.getAttribute('data-share-title') || id, url: url }).catch(function () {});
        else if (navigator.clipboard) navigator.clipboard.writeText(url);
      });
    });

  }
})();

  // Stage1: tap seam opens layout options (no permanent ratio toolbar)
  (function(){
    var div = document.querySelector('[data-split-divider]');
    var opts = document.querySelector('.srb-seam-options');
    if (div && opts) {
      div.addEventListener('click', function () { if (div.__srbMoved) { div.__srbMoved = false; return; } try { opts.open = true; var first = opts.querySelector('button'); if (first) first.focus(); } catch (e) {} });
      div.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); try { opts.open = !opts.open; } catch (err) {} }
      });
    }
  })();
