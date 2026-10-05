/* MJB ADHD - dopamine pathway explorer (/science/pathway/).
   Progressive enhancement. Without JavaScript the page already holds every
   explanation as text. This script reads the same model from #px-data, draws
   the map as native buttons with an SVG line layer behind them, and shows the
   chosen step's text in a panel below. Selecting a box means "reading this";
   nothing is unlocked, scored or activated. Narrow screens get the ordered
   list without lines. No animation; nothing to switch off for reduced motion. */
(function () {
  "use strict";
  var doc = document;
  var root = doc.getElementById("pathway-explorer");
  var dataEl = doc.getElementById("px-data");
  var textEl = doc.getElementById("px-text");
  if (!root || !dataEl || !textEl || !doc.querySelector) return;
  var model;
  try { model = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var SVGNS = "http://www.w3.org/2000/svg";
  var byId = {};
  model.nodes.forEach(function (n) { byId[n.id] = n; });

  function el(tag, cls, text) {
    var x = doc.createElement(tag);
    if (cls) x.className = cls;
    if (text) x.textContent = text;
    return x;
  }

  /* ---------- map: lanes of buttons ---------- */
  var graph = el("div", "px-graph");
  var svg = doc.createElementNS(SVGNS, "svg");
  svg.setAttribute("class", "px-edges");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  var grid = el("div", "px-grid");
  var buttons = {};
  model.lanes.forEach(function (lane) {
    var group = el("div", "px-lane");
    group.setAttribute("role", "group");
    var h = el("h3", "px-lane-h", lane.title);
    h.id = "plh-" + lane.id;
    group.setAttribute("aria-labelledby", h.id);
    group.appendChild(h);
    model.nodes.filter(function (n) { return n.lane === lane.id; }).forEach(function (n) {
      var b = el("button", "px-node px-k-" + n.kind);
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-controls", "px-panel");
      b.setAttribute("data-id", n.id);
      b.style.gridRow = String(n.row);
      b.style.gridColumn = String(n.col);
      if (n.icon) {
        var img = el("img", "px-ico");
        img.src = "../../assets/pathway/icon-" + n.icon + ".svg";
        img.alt = "";
        img.width = 20; img.height = 20;
        b.appendChild(img);
      }
      b.appendChild(el("span", "px-node-t", n.title));
      b.appendChild(el("span", "px-node-s", n.short));
      buttons[n.id] = b;
      group.appendChild(b);
    });
    grid.appendChild(group);
  });
  graph.appendChild(svg);
  graph.appendChild(grid);

  var panel = el("div", "px-panel");
  panel.id = "px-panel";
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-label", "Explanation of the selected step");
  panel.tabIndex = -1;
  var status = el("p", "visually-hidden");
  status.setAttribute("aria-live", "polite");

  /* The full text list moves into a closed <details>, still one click away. */
  var all = el("details", "px-all");
  var sum = el("summary", "", "Every step as text (" + model.nodes.length + " steps)");
  all.appendChild(sum);
  var textHead = textEl.querySelector(".px-text-h");
  if (textHead) textHead.parentNode.removeChild(textHead);
  textEl.parentNode.insertBefore(graph, textEl);
  textEl.parentNode.insertBefore(panel, textEl);
  textEl.parentNode.insertBefore(status, textEl);
  textEl.parentNode.insertBefore(all, textEl);
  all.appendChild(textEl);
  root.classList.add("px-on");

  /* ---------- selection ---------- */
  var current = null;
  function select(id, focusPanel, quiet) {
    var src = doc.getElementById("n-" + id);
    if (!src || !byId[id]) return;
    current = id;
    Object.keys(buttons).forEach(function (k) { buttons[k].setAttribute("aria-pressed", String(k === id)); });
    var art = src.querySelector("article").cloneNode(true);
    Array.prototype.forEach.call(art.querySelectorAll("[id]"), function (x) { x.removeAttribute("id"); });
    art.removeAttribute("aria-labelledby");
    var h = art.querySelector(".px-title");
    if (h) { h.id = "px-panel-title"; h.tabIndex = -1; }
    panel.innerHTML = "";
    panel.appendChild(el("p", "px-panel-note", "Now reading. Selecting a step does not measure or change anything."));
    panel.appendChild(art);
    status.textContent = "Now reading: " + byId[id].title;
    Array.prototype.forEach.call(svg.querySelectorAll("path[data-from]"), function (p) {
      var on = p.getAttribute("data-from") === id || p.getAttribute("data-to") === id;
      p.setAttribute("class", p.getAttribute("class").replace(/ is-on/g, "") + (on ? " is-on" : ""));
    });
    if (!quiet && window.history && history.replaceState) history.replaceState(null, "", "#n-" + id);
    if (focusPanel && h) h.focus();
  }

  grid.addEventListener("click", function (ev) {
    var b = ev.target.closest ? ev.target.closest("button.px-node") : null;
    if (b) select(b.getAttribute("data-id"), false);
  });
  /* Connection links inside the panel switch the reading, and move focus to it. */
  panel.addEventListener("click", function (ev) {
    var a = ev.target.closest ? ev.target.closest("a[data-node]") : null;
    if (!a) return;
    ev.preventDefault();
    select(a.getAttribute("data-node"), true);
  });
  /* Arrow keys move between boxes in reading order; Tab still works as normal. */
  var orderIds = model.nodes.map(function (n) { return n.id; });
  grid.addEventListener("keydown", function (ev) {
    var b = ev.target.closest ? ev.target.closest("button.px-node") : null;
    if (!b) return;
    var i = orderIds.indexOf(b.getAttribute("data-id"));
    var next = null;
    if (ev.key === "ArrowRight" || ev.key === "ArrowDown") next = orderIds[(i + 1) % orderIds.length];
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") next = orderIds[(i - 1 + orderIds.length) % orderIds.length];
    else if (ev.key === "Home") next = orderIds[0];
    else if (ev.key === "End") next = orderIds[orderIds.length - 1];
    if (!next) return;
    ev.preventDefault();
    buttons[next].focus();
  });

  /* ---------- lines ---------- */
  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (getComputedStyle(grid).display !== "grid") return;
    var g = graph.getBoundingClientRect();
    svg.setAttribute("width", String(g.width));
    svg.setAttribute("height", String(g.height));
    svg.setAttribute("viewBox", "0 0 " + g.width + " " + g.height);
    var defs = doc.createElementNS(SVGNS, "defs");
    ["step", "support", "feedback", "branch"].forEach(function (s) {
      var mk = doc.createElementNS(SVGNS, "marker");
      mk.setAttribute("id", "pxa-" + s);
      mk.setAttribute("viewBox", "0 0 10 10");
      mk.setAttribute("refX", "9"); mk.setAttribute("refY", "5");
      mk.setAttribute("markerUnits", "userSpaceOnUse");
      mk.setAttribute("markerWidth", "9"); mk.setAttribute("markerHeight", "9");
      mk.setAttribute("orient", "auto-start-reverse");
      var p = doc.createElementNS(SVGNS, "path");
      p.setAttribute("d", s === "feedback" ? "M1 1L9 5L1 9" : "M0 0L10 5L0 10z");
      p.setAttribute("class", "pxm pxm-" + s);
      mk.appendChild(p);
      defs.appendChild(mk);
    });
    svg.appendChild(defs);

    var R = {};
    Object.keys(buttons).forEach(function (k) {
      var r = buttons[k].getBoundingClientRect();
      R[k] = { l: r.left - g.left, r: r.right - g.left, t: r.top - g.top, b: r.bottom - g.top, cx: (r.left + r.right) / 2 - g.left };
    });
    var rowTop = {}, rowBot = {};
    model.nodes.forEach(function (n) {
      var r = R[n.id];
      rowTop[n.row] = Math.min(rowTop[n.row] === undefined ? 1e9 : rowTop[n.row], r.t);
      rowBot[n.row] = Math.max(rowBot[n.row] || 0, r.b);
    });

    /* Work out which side each edge leaves and enters, and which row gap it uses. */
    var plan = model.edges.map(function (e) {
      var a = byId[e.from], b = byId[e.to];
      var p = { e: e };
      if (a.row === b.row && b.col > a.col) { p.kind = "h"; p.fs = "r"; p.ts = "l"; }
      else if (a.row === b.row) { p.kind = "u"; p.fs = "b"; p.ts = "b"; p.gap = a.row; }
      else if (a.col === b.col) { p.kind = "v"; p.fs = a.row < b.row ? "b" : "t"; p.ts = a.row < b.row ? "t" : "b"; }
      else { p.kind = "o"; p.fs = a.row < b.row ? "b" : "t"; p.ts = a.row < b.row ? "t" : "b"; p.gap = a.row < b.row ? a.row : b.row; }
      return p;
    });
    /* Spread anchors along each side so lines sharing a side do not overlap. */
    var sides = {};
    plan.forEach(function (p) {
      [["from", p.fs, p.e.to], ["to", p.ts, p.e.from]].forEach(function (s) {
        var id = s[0] === "from" ? p.e.from : p.e.to;
        var key = id + ":" + s[1];
        (sides[key] = sides[key] || []).push({ p: p, end: s[0], other: R[s[2]].cx });
      });
    });
    Object.keys(sides).forEach(function (key) {
      var list = sides[key].sort(function (x, y) { return x.other - y.other; });
      var id = key.split(":")[0], side = key.split(":")[1], r = R[id];
      list.forEach(function (it, i) {
        var f = (i + 1) / (list.length + 1);
        /* A lone line leans toward the box it connects to, so lines in the same
           column never meet and suggest a connection the model does not have. */
        if (list.length === 1 && (side === "t" || side === "b") && Math.abs(it.other - r.cx) > 1) f = it.other < r.cx ? 0.3 : 0.7;
        var pt = side === "l" ? [r.l, r.t + (r.b - r.t) * f] : side === "r" ? [r.r, r.t + (r.b - r.t) * f]
               : [r.l + (r.r - r.l) * f, side === "t" ? r.t : r.b];
        it.p[it.end === "from" ? "fp" : "tp"] = pt;
      });
    });
    /* Give each edge in a row gap its own horizontal track. */
    var gaps = {};
    plan.forEach(function (p) { if (p.gap !== undefined) (gaps[p.gap] = gaps[p.gap] || []).push(p); });
    Object.keys(gaps).forEach(function (k) {
      var row = Number(k);
      var top = rowBot[row], bot = rowTop[row + 1] !== undefined ? rowTop[row + 1] : top + 40;
      var list = gaps[k].sort(function (x, y) { return Math.abs(x.fp[0] - x.tp[0]) - Math.abs(y.fp[0] - y.tp[0]); });
      list.forEach(function (p, i) { p.gy = top + (bot - top) * (i + 1) / (list.length + 1); });
    });

    plan.forEach(function (p) {
      var f = p.fp, t = p.tp, d;
      if (p.kind === "h") d = "M" + f[0] + " " + f[1] + "H" + t[0];
      else if (p.kind === "v") {
        var my = (f[1] + t[1]) / 2;
        d = Math.abs(f[0] - t[0]) < 1 ? "M" + f[0] + " " + f[1] + "V" + t[1]
          : "M" + f[0] + " " + f[1] + "V" + my + "H" + t[0] + "V" + t[1];
      }
      else d = "M" + f[0] + " " + f[1] + "V" + p.gy + "H" + t[0] + "V" + t[1];
      var path = doc.createElementNS(SVGNS, "path");
      path.setAttribute("d", d);
      path.setAttribute("class", "pxe pxe-" + p.e.style + (current && (p.e.from === current || p.e.to === current) ? " is-on" : ""));
      path.setAttribute("data-from", p.e.from);
      path.setAttribute("data-to", p.e.to);
      path.setAttribute("marker-end", "url(#pxa-" + p.e.style + ")");
      svg.appendChild(path);
    });
  }

  var pending = 0;
  function redraw() { if (pending) return; pending = 1; (window.requestAnimationFrame || setTimeout)(function () { pending = 0; draw(); }); }
  if (typeof window.ResizeObserver === "function") new ResizeObserver(redraw).observe(graph);
  window.addEventListener("resize", redraw);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(redraw);
  window.addEventListener("beforeprint", function () { all.open = true; });
  window.addEventListener("hashchange", function () {
    var id = (location.hash || "").replace(/^#n-/, "");
    if (byId[id] && id !== current) select(id, true);
  });

  var start = (location.hash || "").replace(/^#n-/, "");
  select(byId[start] ? start : model.nodes[0].id, false, true);
  draw();
})();
