/* MJB ADHD - interaction layer (from v0.5.8, Lane A).
   Plain ES5, no build step, no network requests. Every block is guarded so it
   is a no-op when its elements are missing. Never edits article text, hrefs of
   sources or object IDs.
   1. "Find a page" dialog: role=dialog + aria-modal, focus moves in on open,
      Tab/Shift+Tab trapped, Escape / close button / backdrop / outside click
      close it and focus returns to the opener, arrow keys move through results,
      Enter opens one, "/" or Ctrl/Cmd+K opens it (not while typing in a field).
      Result URLs are built exactly like app.js href() so they match the nav.
   2. Header search (#q / #sres, built by app.js): arrow keys + Enter, added at
      runtime here because app.js is outside Lane A.
   3. <details> evidence stays native <details>; closed ones are opened for
      printing only and restored afterwards. */
(function () {
  "use strict";
  var doc = document;
  var body = doc.body;
  if (!body) return;

  function safe(name, fn) {
    try { fn(); } catch (err) {
      if (window.console && console.warn) console.warn("[interact] " + name + " skipped: " + (err && err.message));
    }
  }
  function toArray(list) { return Array.prototype.slice.call(list || []); }
  function has(el, method) { return !!el && typeof el[method] === "function"; }

  var depth = Number((body.dataset && body.dataset.depth) || 0) || 0;
  var prefix = depth > 0 ? new Array(depth + 1).join("../") : "";

  /* Identical rules to app.js href(): explicit index.html, relative prefix. */
  function href(slug) {
    slug = String(slug || "");
    if (slug === "/" || slug === "index.html" || slug === "") return prefix + "index.html";
    if (slug === "404.html") return prefix + "404.html";
    if (slug.charAt(slug.length - 1) === "/") slug += "index.html";
    return prefix + slug;
  }
  function destKey(url) { return String(url).replace(/\/index\.html(?=[?#]|$)/, "/"); }

  function isTypingTarget(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName.toUpperCase();
    if (tag === "TEXTAREA" || tag === "SELECT") return true;
    if (tag === "INPUT") {
      var t = String(el.type || "text").toLowerCase();
      return !/^(button|submit|reset|checkbox|radio|range|color|file|image)$/.test(t);
    }
    return !!el.isContentEditable;
  }
  function isVisible(el) {
    if (!el) return false;
    if (has(el, "getClientRects")) return el.getClientRects().length > 0;
    return true;
  }

  /* ---------- 1. Find-a-page dialog ---------- */
  var START = [
    ["science/what-is-adhd/", "Understand ADHD — what the condition is"],
    ["support/quick-starts/", "Something is hard today — starting"],
    ["rights/overview/", "Care and medical rights"],
    ["about/mission/", "Why this site exists"]
  ];
  function navSections() {
    return [["science/what-is-adhd/", "Confirmed Science"],
      ["support/quick-starts/", "ADHD: The Experience"],
      ["rights/overview/", "Medical rights"],
      ["about/mission/", "Mission"], ["contact/", "Contact"], ["sources/", "Sources"]];
  }

  var indexCache = null;
  function searchIndex() {
    if (indexCache) return indexCache;
    var OS = window.MJB_ADHD || {};
    var seen = {};
    var list = [];
    function add(title, target, sub, parts, kind) {
      if (!title || target == null) return;
      var url = href(target);
      var key = destKey(url);
      if (seen[key]) {
        seen[key].hay += " " + parts.join(" ").toLowerCase();
        return;
      }
      var item = { title: String(title), href: url, sub: String(sub || ""), kind: kind,
                   hay: parts.join(" ").toLowerCase() };
      seen[key] = item;
      list.push(item);
    }
    (OS.routes || []).forEach(function (r) {
      if (!r.hidden) add(r.title, r.slug, r.slug, [r.title, r.slug, r.id], "section");
    });
    indexCache = list;
    return list;
  }
  function findPages(q) {
    q = String(q || "").replace(/^\s+|\s+$/g, "").toLowerCase();
    if (!q) return [];
    var hits = [];
    searchIndex().forEach(function (it) {
      var t = it.title.toLowerCase();
      if (it.hay.indexOf(q) === -1 && t.indexOf(q) === -1) return;
      hits.push({ it: it, score: t.indexOf(q) === 0 ? 0 : (t.indexOf(q) !== -1 ? 1 : 2) });
    });
    hits.sort(function (a, b) { return a.score - b.score || (a.it.title < b.it.title ? -1 : a.it.title > b.it.title ? 1 : 0); });
    return hits.slice(0, 12).map(function (h) { return h.it; });
  }

  safe("find-a-page", function () {
    if (doc.getElementById("guide-panel")) return; /* idempotent */
    if (!has(doc, "createElement") || !has(body, "appendChild")) return;

    var btn = doc.createElement("button");
    btn.className = "guide-btn";
    btn.type = "button";
    btn.id = "guide-open";
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "guide-panel");
    btn.setAttribute("aria-keyshortcuts", "/ Control+K Meta+K");
    btn.setAttribute("title", "Find a page (press / or Ctrl+K)");
    btn.textContent = "Find a page";

    var backdrop = doc.createElement("div");
    backdrop.className = "guide-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.hidden = true;

    var panel = doc.createElement("div");
    panel.className = "guide-panel";
    panel.id = "guide-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "guide-title");
    panel.setAttribute("aria-describedby", "guide-hint");

    function el(tag, cls, text) {
      var n = doc.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    }
    var head = el("div", "guide-head");
    var kicker = el("p", "kicker", "Page finder \u00b7 not a medical bot");
    var title = el("h2", "guide-title", "Find a page");
    title.id = "guide-title";
    var closeBtn = el("button", "ev-btn guide-close", "Close");
    closeBtn.type = "button";
    closeBtn.id = "guide-close";
    closeBtn.setAttribute("aria-label", "Close page finder");
    head.appendChild(title);
    head.appendChild(closeBtn);

    var label = el("label", "guide-label", "Filter pages by title or topic");
    label.setAttribute("for", "guide-q");
    var input = el("input", "guide-input");
    input.id = "guide-q";
    input.type = "search";
    input.setAttribute("autocomplete", "off");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("aria-controls", "guide-results");
    var hint = el("p", "guide-hint", "Arrow keys move through pages. Enter opens one. Escape closes. Press / or Ctrl+K to reopen.");
    hint.id = "guide-hint";
    var status = el("p", "guide-status");
    status.id = "guide-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    var results = el("div", "guide-results");
    results.id = "guide-results";

    panel.appendChild(kicker);
    panel.appendChild(head);
    panel.appendChild(label);
    panel.appendChild(input);
    panel.appendChild(hint);
    panel.appendChild(status);
    panel.appendChild(results);

    function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
    function group(heading, items) {
      if (!items.length) return;
      results.appendChild(el("p", "guide-group", heading));
      var ul = el("ul", "guide-list");
      ul.setAttribute("role", "list");
      /* inline fallback so a bare list never shows bullets before CSS lands */
      ul.style.listStyle = "none"; ul.style.margin = "0"; ul.style.padding = "0";
      items.forEach(function (it) {
        var li = el("li");
        var a = el("a", "guide-result");
        a.href = it.href;
        a.setAttribute("data-mjb-result", "");
        a.appendChild(el("span", "guide-result-title", it.title));
        if (it.sub) {
          var small = el("small", "guide-result-sub", it.sub);
          small.style.display = "block";
          a.appendChild(small);
        }
        li.appendChild(a);
        ul.appendChild(li);
      });
      results.appendChild(ul);
    }
    function pairs(list) { return list.map(function (p) { return { title: p[1], href: href(p[0]) }; }); }
    function render() {
      clear(results);
      var q = input.value;
      if (!String(q).replace(/\s+/g, "")) {
        group("Start here", pairs(START));
        group("Sections", pairs(navSections()));
        status.textContent = "";
        return;
      }
      var hits = findPages(q).map(function (h) { return { title: h.title, href: h.href, sub: h.kind + " \u00b7 " + h.sub }; });
      if (!hits.length) {
        status.textContent = "No matching pages. Try a different word, or browse the sections below.";
        group("Sections", pairs(navSections()));
        return;
      }
      status.textContent = hits.length + (hits.length === 1 ? " matching page" : " matching pages");
      group("Matching pages", hits);
    }

    var opener = null;
    function isOpen() { return !panel.hidden; }
    function resultLinks() { return toArray(results.querySelectorAll("a[data-mjb-result]")); }
    function focusables() {
      return toArray(panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(isVisible);
    }
    function open(from) {
      if (isOpen()) { input.focus(); return; }
      opener = from || doc.activeElement || btn;
      render();
      panel.hidden = false;
      panel.classList.add("open");
      backdrop.hidden = false;
      backdrop.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      if (doc.documentElement) doc.documentElement.classList.add("mjb-dialog-open");
      input.focus();
      if (has(input, "select")) input.select();
    }
    function close(restoreFocus) {
      if (!isOpen()) return;
      panel.classList.remove("open");
      panel.hidden = true;
      backdrop.classList.remove("open");
      backdrop.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      if (doc.documentElement) doc.documentElement.classList.remove("mjb-dialog-open");
      if (restoreFocus !== false) {
        var target = opener && opener !== body && doc.contains(opener) && has(opener, "focus") ? opener : btn;
        target.focus();
      }
      opener = null;
    }

    btn.addEventListener("click", function () { if (isOpen()) close(true); else open(btn); });
    closeBtn.addEventListener("click", function () { close(true); });
    backdrop.addEventListener("click", function () { close(true); });
    input.addEventListener("input", render);

    panel.addEventListener("keydown", function (e) {
      var key = e.key;
      if (key === "Escape" || key === "Esc") {
        /* stop here so app.js's document Escape handler cannot move focus elsewhere */
        e.preventDefault(); if (has(e, "stopPropagation")) e.stopPropagation(); close(true); return;
      }
      if (key === "Tab") {
        var f = focusables();
        if (!f.length) { e.preventDefault(); return; }
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (doc.activeElement === first || !panel.contains(doc.activeElement))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (doc.activeElement === last || !panel.contains(doc.activeElement))) { e.preventDefault(); first.focus(); }
        return;
      }
      var links = resultLinks();
      var idx = links.indexOf(doc.activeElement);
      if (key === "ArrowDown" || key === "Down") {
        if (!links.length) return;
        e.preventDefault();
        (idx < 0 ? links[0] : links[(idx + 1) % links.length]).focus();
      } else if (key === "ArrowUp" || key === "Up") {
        if (idx < 0) return;
        e.preventDefault();
        if (idx === 0) input.focus(); else links[idx - 1].focus();
      } else if ((key === "Home" || key === "End") && idx >= 0) {
        e.preventDefault();
        links[key === "Home" ? 0 : links.length - 1].focus();
      } else if (key === "Enter" && e.target === input) {
        e.preventDefault();
        if (links.length) links[0].click();
      }
      /* Enter on a focused result link follows it natively. */
    });

    /* Outside click (works even before the CSS worker styles .guide-backdrop). */
    var downEvent = window.PointerEvent ? "pointerdown" : "mousedown";
    doc.addEventListener(downEvent, function (e) {
      if (!isOpen()) return;
      var t = e.target;
      if (t === backdrop || panel.contains(t) || btn.contains(t)) return;
      close(false); /* the user chose another target; do not steal focus back */
    }, true);
    /* Keep focus inside while open (e.g. programmatic or assistive moves). */
    doc.addEventListener("focusin", function (e) {
      if (isOpen() && e.target !== body && !panel.contains(e.target)) input.focus();
    });
    doc.addEventListener("keydown", function (e) {
      var key = e.key;
      if ((key === "Escape" || key === "Esc") && isOpen()) { close(true); return; }
      if (e.defaultPrevented || e.isComposing || e.altKey) return;
      var slash = key === "/" && !e.ctrlKey && !e.metaKey;
      var cmdK = (key === "k" || key === "K") && (e.ctrlKey || e.metaKey) && !e.shiftKey;
      if (!slash && !cmdK) return;
      if (isOpen()) { if (cmdK) { e.preventDefault(); input.focus(); } return; }
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      open(doc.activeElement && doc.activeElement !== body ? doc.activeElement : btn);
    });

    body.appendChild(btn);
    body.appendChild(backdrop);
    body.appendChild(panel);
  });

  /* ---------- 2. Header search results (app.js #q / #sres) ---------- */
  safe("header-search-keys", function () {
    var q = doc.getElementById("q");
    var sres = doc.getElementById("sres");
    if (!has(q, "addEventListener") || !has(sres, "addEventListener") || !has(sres, "querySelectorAll")) return;
    function links() { return toArray(sres.querySelectorAll("a[href]")); }
    /* No aria-describedby="sres": it made screen readers read the whole result list as the field description. app.js announces a count via #sres-status. */
    if (q.getAttribute("aria-describedby") === "sres") q.removeAttribute("aria-describedby");
    q.addEventListener("keydown", function (e) {
      var l = links();
      if ((e.key === "ArrowDown" || e.key === "Down") && l.length) { e.preventDefault(); l[0].focus(); }
      else if (e.key === "Enter" && l.length) { e.preventDefault(); l[0].click(); }
    });
    sres.addEventListener("keydown", function (e) {
      var l = links();
      var i = l.indexOf(doc.activeElement);
      if (i < 0) return;
      if (e.key === "ArrowDown" || e.key === "Down") { e.preventDefault(); l[(i + 1) % l.length].focus(); }
      else if (e.key === "ArrowUp" || e.key === "Up") { e.preventDefault(); if (i === 0) q.focus(); else l[i - 1].focus(); }
      else if (e.key === "Home") { e.preventDefault(); l[0].focus(); }
      else if (e.key === "End") { e.preventDefault(); l[l.length - 1].focus(); }
    });
  });

  /* ---------- 3. <details> evidence: native toggling, print expands ---------- */
  safe("details-print", function () {
    if (!has(window, "addEventListener")) return;
    var opened = [];
    window.addEventListener("beforeprint", function () {
      opened = toArray(doc.querySelectorAll("details:not([open])"));
      opened.forEach(function (d) { d.open = true; });
    });
    window.addEventListener("afterprint", function () {
      opened.forEach(function (d) { d.open = false; });
      opened = [];
    });
  });
})();
