/* MJB ADHD - visual layer (from v0.5.8, Lane A).
   Plain ES5, no build step, no network requests. Adds classes, attributes,
   decorative aria-hidden spans and visually-hidden labels only; never changes
   article text, source URLs/hrefs or object IDs. Every step is idempotent, so
   the MutationObserver re-run on late renders never double-inserts.
   Class contract shared with the CSS worker:
     .mjb-door[data-door=atom|function|capsule|shield]  decorative title mark
     .mjb-claim / .mjb-reply (+ .sr-only "Claim: " / "Correction: ")
     table.mjb-stack + td[data-label]                   stackable tables
     .mjb-noselect                                       values bar
   The only motion is the home banner video loop, which checks
   prefers-reduced-motion and skips; reducedMotion() is exposed for reuse. */
(function () {
  "use strict";
  var doc = document;
  var body = doc.body;
  if (!body) return;

  function safe(name, fn) {
    try { fn(); } catch (err) {
      if (window.console && console.warn) console.warn("[visual] " + name + " skipped: " + (err && err.message));
    }
  }
  function toArray(list) { return Array.prototype.slice.call(list || []); }
  function each(sel, fn, root) { toArray((root || doc).querySelectorAll(sel)).forEach(fn); }
  function has(el, method) { return !!el && typeof el[method] === "function"; }
  function hasClass(el, c) { return !!(el && el.classList && el.classList.contains(c)); }
  function text(el) { return String((el && el.textContent) || "").replace(/\s+/g, " ").replace(/^\s|\s$/g, ""); }

  function reducedMotion() {
    try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
    catch (e) { return false; }
  }

  /* ---------- existing v0.4.x behaviour (kept) ---------- */
  var LABELS = { publisher: "Publisher said", verified: "Verified primary record", assessment: "Our assessment", open: "Still to verify", sources: "Sources" };
  var CLS = { publisher: "claim-publisher", verified: "claim-verified", assessment: "claim-assessment", open: "claim-open", sources: "claim-sources" };

  function claimLabels() {
    each(".editorial-section[data-claim]", function (sec) {
      var key = sec.getAttribute("data-claim");
      if (!LABELS[key]) return;
      sec.classList.add(CLS[key]);
      if (!sec.querySelector(".claim-label")) {
        var tag = doc.createElement("div");
        tag.className = "claim-label";
        tag.textContent = LABELS[key];
        sec.insertBefore(tag, sec.firstChild);
      }
    });
  }

  /* The old inline .pict pictograms (PICT map) were removed: doors() hides every
     .pict tile as soon as its title carries a .mjb-door mark, so the injected SVG
     was never visible. Without JS the tile keeps its assets/door-*.svg <img>. */

  /* ---------- door marks ---------- */
  var SVG_OPEN = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">';
  var DOOR_SVG = {
    atom: SVG_OPEN + '<ellipse cx="12" cy="12" rx="9.5" ry="3.6"/><ellipse cx="12" cy="12" rx="9.5" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.6" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>',
    "function": SVG_OPEN + '<path d="M4 3.5V20h16.5"/><path d="M6.5 17c2.2 0 3-8.5 5.5-8.5s2.6 5 4.6 5c1.3 0 2-1.6 2.9-4"/></svg>',
    capsule: SVG_OPEN + '<g transform="rotate(-45 12 12)"><rect x="3.5" y="8.25" width="17" height="7.5" rx="3.75"/><path d="M12 8.25v7.5"/><path d="M6.6 10.6h2.6"/></g></svg>',
    shield: SVG_OPEN + '<path d="M12 3l7 2.8v5.4c0 4.6-3 8.2-7 9.8-4-1.6-7-5.2-7-9.8V5.8z"/><path d="M9 12l2.1 2.1 4.1-4.2"/></svg>'
  };
  /* Mapping from the real section structure (body[data-page] / first path segment). */
  var DOOR_BY_SECTION = {
    science: "atom", research: "atom", hypotheses: "atom", conditions: "atom", atlas: "atom",
    experience: "function", support: "function", tools: "function", explore: "function",
    compounds: "capsule",
    rights: "shield", templates: "shield", policy: "shield", media: "shield", library: "shield"
  };
  /* Home door cards: the card's own pictogram class names its door, so the
     compounds card gets the capsule even though it still links to science/. */
  var DOOR_BY_PICT = { "p-science": "atom", "p-exp": "function", "p-comp": "capsule", "p-rights": "shield" };
  function doorForCard(a) {
    var pict = a.querySelector(".pict");
    if (pict) for (var k in DOOR_BY_PICT) if (pict.classList.contains(k)) return DOOR_BY_PICT[k];
    return doorForHref(a.getAttribute("href"));
  }
  function doorForHref(h) {
    var path = String(h || "").split(/[?#]/)[0].replace(/^(\.\.\/|\.\/)+/, "");
    var seg = path.split("/")[0];
    return DOOR_BY_SECTION[seg] || null;
  }
  function pageDoor() {
    var page = (body.dataset && body.dataset.page) || "";
    return DOOR_BY_SECTION[page] || null;
  }
  var HIDE_PICT_WITH_DOOR = true;
  function insertDoor(el, door) {
    if (!el || !door || !DOOR_SVG[door] || !has(el, "insertBefore")) return;
    if (el.querySelector(".mjb-door")) return; /* idempotent */
    var span = doc.createElement("span");
    span.className = "mjb-door";
    span.setAttribute("data-door", door);
    span.setAttribute("aria-hidden", "true");
    span.innerHTML = DOOR_SVG[door];
    el.insertBefore(span, el.firstChild);
  }
  function doors() {
    var main = doc.getElementById("main-content") || doc.querySelector("main");
    if (!main) return;
    var h1 = main.querySelector("h1");
    if (h1) insertDoor(h1, pageDoor());
    /* home: four core doors and the two secondary doors */
    each(".grid4 a.dest", function (a) {
      var h = a.querySelector("h2, h3");
      insertDoor(h, doorForCard(a));
      /* One icon language per door: the older decorative .pict tile (aria-hidden)
         is hidden once the title carries its .mjb-door mark. */
      if (HIDE_PICT_WITH_DOOR && h && h.querySelector(".mjb-door")) {
        each(".pict", function (pict) { pict.hidden = true; pict.setAttribute("data-mjb-superseded", "door"); }, a);
      }
    }, main);
    each(".secondary-doors a", function (a) { insertDoor(a.querySelector("strong"), doorForHref(a.getAttribute("href"))); }, main);
  }

  /* ---------- claim vs reply ---------- */
  function srLabel(words) {
    var span = doc.createElement("span");
    /* .sr-only / .mjb-sr are defined in css/refine.css (Lane A CSS block). */
    span.className = "sr-only mjb-sr";
    span.setAttribute("data-mjb-label", "");
    span.textContent = words;
    return span;
  }
  function mark(el, cls, words) {
    if (!el) return;
    el.classList.add(cls);
    var first = el.firstElementChild || el.firstChild;
    if (first && first.getAttribute && first.getAttribute("data-mjb-label") != null) return; /* idempotent */
    el.insertBefore(srLabel(words), el.firstChild);
  }
  /* Media pages (pip-headline, channel-4) use the separate claim-TYPE system
     (.editorial-section[data-claim] + visible .claim-label). Giving those sections
     .mjb-claim would restyle a publisher's framing with the red "wrong claim" marker
     and duplicate their visible labels, so by default they only get a data hook.
     Flip to true if the owner wants the claim/reply styling there too. */
  var MEDIA_AS_CLAIM_REPLY = false;
  function claims() {
    each(".article-body", function (host) {
      var claimSecs = toArray(host.querySelectorAll('.editorial-section[data-claim="publisher"]'));
      if (!claimSecs.length) return;
      claimSecs.forEach(function (sec) {
        sec.setAttribute("data-mjb-role", "claim");
        if (MEDIA_AS_CLAIM_REPLY) mark(sec, "mjb-claim", "Claim: ");
      });
      each('.editorial-section[data-claim="verified"], .editorial-section[data-claim="assessment"]', function (sec) {
        sec.setAttribute("data-mjb-role", "reply");
        if (MEDIA_AS_CLAIM_REPLY) mark(sec, "mjb-reply", "Correction: ");
      }, host);
    });
    /* Library "common claim" pair (library/condition: "There is no ADHD gene..."). */
    each("p.claim-wrong", function (p) { mark(p, "mjb-claim", "Claim: "); });
    each("p.claim-right", function (p) { mark(p, "mjb-reply", "Correction: "); });
    /* Inline misread + reply in one <p> (41 pages incl. science/genetics).
       Splitting it needs an HTML edit, so only flag it for styling. */
    each(".article-body h2", function (h2) {
      if (text(h2) !== "What an onlooker may misread") return;
      var p = h2.nextElementSibling;
      if (p && p.tagName === "P" && /^[\u201c"]/.test(text(p)) && !p.getAttribute("data-mjb-pair")) p.setAttribute("data-mjb-pair", "inline");
    });
  }

  /* ---------- stackable tables ---------- */
  function headerLabels(table) {
    var row = null;
    if (table.tHead && table.tHead.rows.length) row = table.tHead.rows[table.tHead.rows.length - 1];
    else if (table.rows && table.rows.length) {
      var r0 = table.rows[0];
      if (!r0.querySelector("td") && r0.querySelector("th")) row = r0;
    }
    if (!row) return null;
    var labels = [];
    toArray(row.cells).forEach(function (c) {
      var span = Math.max(1, parseInt(c.getAttribute("colspan") || "1", 10) || 1);
      for (var i = 0; i < span; i++) labels.push(text(c));
    });
    return { row: row, labels: labels };
  }
  /* Explicit ARIA table roles so semantics survive display:block stacking (Safari/VoiceOver). */
  function addTableRoles(table) {
    if (table.getAttribute("role")) return;
    table.setAttribute("role", "table");
    toArray(table.querySelectorAll("thead, tbody, tfoot")).forEach(function (g) { g.setAttribute("role", "rowgroup"); });
    toArray(table.rows).forEach(function (tr) {
      tr.setAttribute("role", "row");
      toArray(tr.cells).forEach(function (cell) {
        var inHead = !!(tr.parentNode && tr.parentNode.tagName === "THEAD");
        if (cell.tagName === "TD") cell.setAttribute("role", "cell");
        else if (!inHead && cell.getAttribute("scope") !== "col") cell.setAttribute("role", "rowheader");
        else cell.setAttribute("role", "columnheader");
      });
    });
  }
  function tables() {
    var main = doc.getElementById("main-content") || doc.querySelector("main");
    if (!main) return;
    each("table", function (table) {
      table.classList.add("mjb-stack");
      addTableRoles(table);
      var wrap = table.parentNode;
      if (wrap && hasClass(wrap, "audit-table-wrap") && wrap.getAttribute("aria-label") === "Scrollable accountability register") {
        /* no longer scrolls on phones once stacked; attribute only, no article text */
        wrap.setAttribute("aria-label", "Accountability register");
      }
      var head = headerLabels(table);
      if (!head) return;
      toArray(table.rows).forEach(function (tr) {
        if (tr === head.row || (tr.parentNode && tr.parentNode.tagName === "THEAD")) return;
        var col = 0;
        toArray(tr.cells).forEach(function (cell) {
          var label = head.labels[col];
          if (label && (cell.tagName === "TD" || cell.getAttribute("scope") === "row")) {
            if (cell.getAttribute("data-label") !== label) cell.setAttribute("data-label", label);
          }
          col += Math.max(1, parseInt(cell.getAttribute("colspan") || "1", 10) || 1);
        });
      });
    }, main);
  }

  /* ---------- values bar ---------- */
  function values() {
    each("p.values, .values", function (el) {
      el.classList.add("mjb-noselect");
      /* aria-label is not permitted on a plain <p> (role paragraph); the visible text is the name. */
      if (el.tagName === "P" && el.hasAttribute("aria-label")) el.removeAttribute("aria-label");
    });
  }

  function run() {
    safe("claim-labels", claimLabels);
    safe("doors", doors);
    safe("claims", claims);
    safe("tables", tables);
    safe("values", values);
  }
  run();

  /* Home banner loop. The static picture is always underneath; the video only
     fades in once it is actually playing, and is removed if it fails to load.
     Skipped for prefers-reduced-motion and Save-Data, so nothing is downloaded. */
  safe("hero-loop", function () {
    var stage = doc.getElementById("hero-stage");
    var video = stage && stage.querySelector("video.hero-loop");
    if (!video || !has(video, "play")) return;
    var conn = navigator.connection;
    if (reducedMotion() || (conn && conn.saveData)) { stage.removeChild(video); return; }

    function fail() {
      if (video.parentNode) video.parentNode.removeChild(video);
      if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
      stage.classList.remove("is-playing");
    }
    var btn = doc.createElement("button");
    btn.type = "button";
    btn.className = "hero-toggle";
    btn.setAttribute("aria-pressed", "false");
    btn.textContent = "Pause animation";
    btn.addEventListener("click", function () {
      if (video.paused) { video.play(); btn.textContent = "Pause animation"; btn.setAttribute("aria-pressed", "false"); }
      else { video.pause(); btn.textContent = "Play animation"; btn.setAttribute("aria-pressed", "true"); }
    });

    video.addEventListener("playing", function () {
      stage.classList.add("is-playing");
      if (!btn.parentNode) stage.appendChild(btn);
    });
    video.addEventListener("error", fail);
    video.muted = true;
    video.src = video.getAttribute("data-src");
    var p = video.play();
    if (p && typeof p.catch === "function") p.catch(function () { if (video.paused && !stage.classList.contains("is-playing")) fail(); });
  });

  /* Late renders (object renderer, future JSON-driven tables): re-run, idempotently. */
  safe("observer", function () {
    if (typeof window.MutationObserver !== "function") return;
    var target = doc.getElementById("main-content") || doc.querySelector("main");
    if (!target) return;
    var pending = false;
    var mo = new window.MutationObserver(function (records) {
      if (pending) return;
      var relevant = records.some(function (r) { return r.addedNodes && r.addedNodes.length; });
      if (!relevant) return;
      pending = true;
      var later = window.requestAnimationFrame || function (f) { return window.setTimeout(f, 16); };
      later(function () { pending = false; run(); });
    });
    mo.observe(target, { childList: true, subtree: true });
  });

  window.MJB_VISUAL = { reducedMotion: reducedMotion, refresh: run, doors: DOOR_BY_SECTION };
})();
