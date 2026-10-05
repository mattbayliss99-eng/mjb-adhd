(function () {
  const OS = window.MJB_ADHD;
  if (!OS) return;

  const page = document.body.dataset.page || "home";
  const depth = Number(document.body.dataset.depth || "0");
  const prefix = depth === 0 ? "" : "../".repeat(depth);

  function href(slug) {
    if (slug === "/" || slug === "index.html") return prefix + "index.html";
    if (slug === "404.html") return prefix + "404.html";
    if (slug.endsWith("/")) slug += "index.html";
    return prefix + slug;
  }

  /* ----- chrome -----
     DOM order: Menu button, then the menu it opens, then Search, so Tab moves
     from "Menu" straight into the opened links. On phones CSS (sleek.css,
     order:10) still draws the opened menu as a full-width row under the buttons. */
  const header = document.getElementById("site-header");
  if (header) {
    const primary = OS.routes.filter((r) => r.group === "primary");
    header.innerHTML = `
      <div class="top-inner">
        <a class="brand" href="${href("index.html")}">
          <img src="${prefix}assets/mjb-emblem.jpg" alt="MJB ADHD emblem">
          <span><b>MJB ADHD</b></span>
        </a>
        <button class="iconbtn" id="navtoggle" type="button" aria-controls="mainnav" aria-expanded="false">Menu</button>
        <nav class="nav-main" id="mainnav" aria-label="Main navigation">
          ${primary.map((r) => `<a href="${href(r.slug)}" data-route="${r.id}">${r.crumb}</a>`).join("")}
          <a href="${href("about/mission/")}" data-route="route.about">Mission</a>
          <a href="${href("contact/")}" data-route="route.contact">Contact</a>
          <a href="${href("sources/")}" data-route="route.sources">Sources</a>
          <a href="${href("archive/")}" data-route="route.archive">Library</a>
        </nav>
        <button class="iconbtn" id="searchtoggle" type="button" aria-controls="searchbox" aria-expanded="false">Search</button>
        <div class="searchbox" id="searchbox">
          <label class="visually-hidden" for="q">Search</label>
          <input id="q" type="search" placeholder="Search title, topic, function, medication…" autocomplete="off">
          <p class="visually-hidden" id="sres-status" role="status" aria-live="polite"></p>
          <div class="search-results" id="sres"></div>
        </div>
      </div>`;
    /* Site-wide safety notice, directly under the header on every page. */
    const alert = document.createElement("aside");
    alert.className = "nhs-alert";
    alert.setAttribute("aria-label", "Safety warning");
    alert.innerHTML = `<span class="nhs-alert-icon" aria-hidden="true">⚠️</span>
      <p><strong>For your own safety:</strong> keep all correspondence and expect nothing. Rely on family and friends for support — the NHS is currently not reliable.
      <a href="${href("index.html")}#safety">Read the warning</a></p>`;
    header.after(alert);
  }

  const crumbs = document.getElementById("crumbs");
  /* Second <nav> on the page needs its own name (the header nav is "Main navigation"). */
  if (crumbs && !crumbs.hasAttribute("aria-label")) crumbs.setAttribute("aria-label", "Breadcrumb");
  if (crumbs && !crumbs.textContent.trim()) {
    const route = OS.routes.find((r) => r.id === "route." + page) || OS.routes.find((r) => r.slug.startsWith(page));
    crumbs.innerHTML = `<a href="${href("index.html")}">Home</a>` +
      (page !== "home" ? ` / <span>${(route && route.title) || page}</span>` : "");
  }

  /* Sub-pages light up their parent section in the header. */
  const SECTION_OF = { "evidence-map": "sources", "source-method": "sources" };
  const section = SECTION_OF[page] || page;
  document.querySelectorAll("[data-route]").forEach((a) => {
    if (a.getAttribute("data-route") === "route." + section) a.setAttribute("aria-current", "page");
  });

  /* Home: safety warning pop-up (once per browser session; the same text stays on the page at #safety). */
  const safety = document.getElementById("safety-dialog");
  if (safety && typeof safety.showModal === "function") {
    let seen = false;
    try { seen = sessionStorage.getItem("mjb-safety-seen") === "1"; } catch (e) {}
    if (!seen && location.hash !== "#safety") safety.showModal();
    safety.addEventListener("close", () => {
      try { sessionStorage.setItem("mjb-safety-seen", "1"); } catch (e) {}
    });
    safety.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => safety.close()));
  }

  const nav = document.getElementById("mainnav");
  const navToggle = document.getElementById("navtoggle");
  navToggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(!!open));
  });

  const box = document.getElementById("searchbox");
  const searchToggle = document.getElementById("searchtoggle");
  searchToggle?.addEventListener("click", () => {
    const open = box?.classList.toggle("open");
    searchToggle.setAttribute("aria-expanded", String(!!open));
    if (open) document.getElementById("q")?.focus();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (box?.classList.contains("open")) searchToggle?.focus();
    else if (nav?.classList.contains("open")) navToggle?.focus();
    nav?.classList.remove("open"); navToggle?.setAttribute("aria-expanded", "false");
    box?.classList.remove("open"); searchToggle?.setAttribute("aria-expanded", "false");
  });

  /* ----- search ----- */
  function search(q) {
    q = (q || "").trim().toLocaleLowerCase();
    if (!q) return [];
    const hits = new Map();
    function add(title, target, sub, parts, kind) {
      const haystack = parts.join(" ").toLocaleLowerCase();
      if (!haystack.includes(q)) return;
      const url = href(target);
      const key = url.replace(/\/index\.html(?=[?#]|$)/, "/");
      const score = title.toLocaleLowerCase().startsWith(q) ? 0 : title.toLocaleLowerCase().includes(q) ? 1 : 2;
      const hit = {kind, title, href:url, sub, score};
      if (!hits.has(key) || score < hits.get(key).score) hits.set(key, hit);
    }
    OS.routes.filter((r) => !r.hidden).forEach((r) =>
      add(r.title, r.slug, r.slug, [r.title,r.slug,r.id], "section"));
    return [...hits.values()].sort((a,b) => a.score-b.score || a.title.localeCompare(b.title)).slice(0, 12);
  }

  const qEl = document.getElementById("q");
  const resEl = document.getElementById("sres");
  const statusEl = document.getElementById("sres-status");
  let statusTimer = 0;
  function announce(msg) {
    /* Short count only, debounced, so screen readers are not read the whole list per keystroke. */
    if (!statusEl) return;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { statusEl.textContent = msg; }, 400);
  }
  qEl?.addEventListener("input", () => {
    const hits = search(qEl.value);
    if (!hits.length) {
      const typed = !!qEl.value.trim();
      resEl.textContent = typed ? "No matches. Try a different word or browse the main map." : "";
      resEl.classList.toggle("show", typed);
      announce(typed ? resEl.textContent : "");
      return;
    }
    announce(hits.length + (hits.length === 1 ? " matching page" : " matching pages"));
    resEl.classList.add("show");
    resEl.replaceChildren();
    hits.forEach((h) => {
      const a = document.createElement("a"); a.href = h.href;
      const strong = document.createElement("strong"); strong.textContent = h.title;
      const small = document.createElement("small"); small.textContent = h.kind + " · " + h.sub;
      a.append(strong, small); resEl.appendChild(a);
    });
  });

  /* alias redirects */
  const params = new URLSearchParams(location.search);
  const alias = params.get("go");
  if (alias && OS.aliases[alias]) location.replace(href(OS.aliases[alias]));

  /* Renderers for unpublished sections (object lists, layers, object page,
     rights router, atlas, template cards) were removed in 0.6.5: none of their
     hooks exist on the six published pages. Recoverable from core065_original.zip. */

  /* home map button already in markup */
})();
