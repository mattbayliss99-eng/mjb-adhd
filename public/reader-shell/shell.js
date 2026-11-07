/* MJB comparison reader. One split, local only, no network calls of its own. */
(function () {
  const KEY = "mjb-reader-shell-v1";
  const PRESETS = {
    charcoal: { themeName: "charcoal", primary: "#e0c27a", secondary: "#c4a15a", base: "#14120e" },
    paper: { themeName: "paper", primary: "#6b4e12", secondary: "#1f4d40", base: "#fbf7ef" },
    contrast: { themeName: "contrast", primary: "#ffd56a", secondary: "#ffffff", base: "#000000" },
  };

  const BANK = JSON.parse(document.getElementById("mjb-posts").textContent);
  const stage = document.getElementById("stage");
  const chrome = document.getElementById("chrome");
  const statusEl = document.getElementById("status");
  const settings = document.getElementById("settings");
  const evidence = document.getElementById("evidence");
  const showBtn = document.getElementById("chrome-show");
  const fallbackNote = document.getElementById("fallback-note");

  let state = defaults();
  let opener = null;
  let evidenceOpener = null;
  let savedScroll = 0;
  let draft = null;
  let painting = false;
  let cycleTimer = null;
  let unbindScroll = null;
  let drag = null;
  let storageNote = "";

  function defaults() {
    return {
      v: 1,
      postId: BANK.posts[0].id,
      stepId: BANK.posts[0].steps[0].id,
      visualId: BANK.posts[0].steps[0].visualId,
      visualMode: "linked",
      layout: "split",
      axis: "stack",
      ratio: 46,
      scale: 1,
      motion: "system",
      opaque: false,
      alwaysChrome: false,
      swipe: false,
      cycle: false,
      themeName: "charcoal",
      primary: PRESETS.charcoal.primary,
      secondary: PRESETS.charcoal.secondary,
      base: PRESETS.charcoal.base,
      saved: {},
      places: {},
    };
  }

  function hexParts(value) {
    const raw = String(value || "").replace("#", "");
    const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
    const n = Number.parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function lum(value) {
    const parts = hexParts(value).map((v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2];
  }

  function contrast(a, b) {
    const hi = Math.max(lum(a), lum(b));
    const lo = Math.min(lum(a), lum(b));
    return (hi + 0.05) / (lo + 0.05);
  }

  function mix(a, b, t) {
    const pa = hexParts(a);
    const pb = hexParts(b);
    const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
    return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
  }

  function bestInk(bg) {
    const light = "#f6f1e6";
    const dark = "#1a140c";
    const cL = contrast(light, bg);
    const cD = contrast(dark, bg);
    const ink = cL >= cD ? light : dark;
    return { ink, ratio: Math.max(cL, cD) };
  }

  function assess(theme) {
    const ink = bestInk(theme.base);
    if (ink.ratio < 4.5) return { ok: false, message: "Text would be hard to read on that background. Apply was blocked." };
    if (contrast(theme.primary, theme.base) < 3) return { ok: false, message: "The accent colour does not stand out enough from the background. Apply was blocked." };
    if (contrast(theme.secondary, theme.base) < 3) return { ok: false, message: "The second colour does not stand out enough from the background. Apply was blocked." };
    return { ok: true, message: "" };
  }

  function colorOk(value) {
    return /^#[0-9a-fA-F]{6}$/.test(value);
  }

  function postById(id) {
    return BANK.posts.find((post) => post.id === id) || null;
  }

  function currentPost() {
    return postById(state.postId) || BANK.posts[0];
  }

  function currentStep() {
    const post = currentPost();
    return post.steps.find((step) => step.id === state.stepId) || post.steps[0];
  }

  function visualById(id) {
    return BANK.visuals.find((visual) => visual.id === id) || BANK.visuals[0];
  }

  function sourceById(id) {
    return BANK.sources.find((source) => source.id === id) || null;
  }

  function resolve(postId, stepId) {
    const post = postById(postId);
    if (!post) return { post: BANK.posts[0], step: BANK.posts[0].steps[0], invalid: true };
    const step = post.steps.find((item) => item.id === stepId);
    if (!step) return { post, step: post.steps[0], invalid: true };
    return { post, step, invalid: false };
  }

  function reduced() {
    return state.motion === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function viewportBox() {
    const view = window.visualViewport;
    return {
      w: view ? view.width : window.innerWidth,
      h: view ? view.height : window.innerHeight,
    };
  }

  function splitFits() {
    const box = viewportBox();
    const chromeGuess = 72 * state.scale;
    const room = box.h - chromeGuess;
    if (box.w < 280) return false;
    if (room < 430) return false;
    if (state.scale >= 1.5 && room < 520) return false;
    if (state.scale >= 2 && room < 640) return false;
    return true;
  }

  function effectiveAxis() {
    if (!splitFits() || state.layout !== "split") return "stack";
    if (state.axis === "side" && viewportBox().w < 840) return "stack";
    return state.axis;
  }

  function presentation() {
    if (state.layout === "thread") return splitFits() ? "thread" : "thread-flow";
    if (state.layout === "article") return splitFits() ? "article" : "article-flow";
    return splitFits() ? "split" : "article-flow";
  }

  function setStatus(text) {
    statusEl.textContent = text || "";
  }

  function warnStorage() {
    if (storageNote) return;
    storageNote = "once";
    setStatus("This browser did not store that change. It lasts until you leave or reload.");
  }

  function persist() {
    try {
      if (window.__MJB_FORCE_STORAGE_FAIL) {
        throw new DOMException("simulated", "QuotaExceededError");
      }
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      return false;
    }
  }

  function sanitise(data) {
    if (!data || typeof data !== "object" || Array.isArray(data) || data.v !== 1) throw new Error("shape");
    const next = defaults();
    const layout = ["split", "article", "thread"].includes(data.layout) ? data.layout : "split";
    const axis = data.axis === "side" ? "side" : "stack";
    const mode = data.visualMode === "manual" ? "manual" : "linked";
    const motion = data.motion === "reduce" ? "reduce" : "system";
    const scale = [1, 1.25, 1.5, 2].includes(Number(data.scale)) ? Number(data.scale) : 1;
    if (![data.primary, data.secondary, data.base].every(colorOk)) throw new Error("shape");
    const theme = assess({ primary: data.primary, secondary: data.secondary, base: data.base });
    if (!theme.ok) throw new Error("shape");
    next.layout = layout;
    next.axis = axis;
    next.visualMode = mode;
    next.motion = motion;
    next.scale = scale;
    next.ratio = Math.min(78, Math.max(22, Number(data.ratio) || 46));
    next.opaque = Boolean(data.opaque);
    next.alwaysChrome = Boolean(data.alwaysChrome);
    next.swipe = Boolean(data.swipe);
    next.cycle = Boolean(data.cycle) && motion !== "reduce";
    next.primary = data.primary;
    next.secondary = data.secondary;
    next.base = data.base;
    next.themeName = ["charcoal", "paper", "contrast", "custom"].includes(data.themeName) ? data.themeName : "custom";
    const saved = {};
    const places = {};
    for (const post of BANK.posts) {
      const remembered = data.saved && data.saved[post.id];
      if (typeof remembered === "string" && post.steps.some((step) => step.id === remembered)) saved[post.id] = remembered;
      const place = data.places && data.places[post.id];
      if (typeof place === "string" && post.steps.some((step) => step.id === place)) places[post.id] = place;
    }
    next.saved = saved;
    next.places = places;
    const located = resolve(data.postId, data.stepId);
    next.postId = located.post.id;
    next.stepId = located.step.id;
    const visual = visualById(data.visualId);
    next.visualId = mode === "linked" ? located.step.visualId : visual.id;
    if (data.visualId && !BANK.visuals.some((item) => item.id === data.visualId) && mode === "manual") {
      next.visualId = located.step.visualId;
      next.visualMode = "linked";
    }
    return next;
  }

  function unsafeValue(value) {
    if (typeof value === "string") return /^(javascript|data|vbscript):/i.test(value.trim()) || value.includes("<");
    if (Array.isArray(value)) return value.some(unsafeValue);
    if (value && typeof value === "object") return Object.values(value).some(unsafeValue);
    return false;
  }

  function loadStore() {
    let raw = null;
    try {
      raw = localStorage.getItem(KEY);
    } catch (error) {
      setStatus("This browser did not allow local storage. Choices last for this visit only.");
      return;
    }
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (unsafeValue(data)) throw new Error("shape");
      state = sanitise(data);
    } catch (error) {
      state = defaults();
      setStatus("Stored preferences could not be read. Showing the standard setup.");
    }
  }

  function applyCss(theme) {
    const ink = bestInk(theme.base);
    const onPrimary = bestInk(theme.primary);
    const root = document.documentElement;
    root.style.setProperty("--base", theme.base);
    root.style.setProperty("--ink", ink.ink);
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--on-primary", onPrimary.ink);
    root.style.setProperty("--panel", lum(theme.base) > 0.4 ? mix(theme.base, "#000000", 0.035) : mix(theme.base, "#ffffff", 0.055));
    root.style.setProperty("--line", mix(theme.base, theme.primary, 0.55));
    root.style.setProperty("--scale", String(state.scale));
    root.dataset.motion = reduced() ? "reduce" : "ok";
    root.dataset.opaque = state.opaque ? "true" : "false";
    root.style.colorScheme = lum(theme.base) > 0.4 ? "light" : "dark";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme.base);
  }

  function activeTheme() {
    return draft || state;
  }

  function readHash() {
    const raw = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!raw) return null;
    const [postId, stepId] = raw.split("/");
    return { postId, stepId };
  }

  function writeHash(mode) {
    const next = `#${state.postId}/${state.stepId}`;
    if (location.hash === next) return;
    const url = `${location.pathname}${location.search}${next}`;
    if (mode === "push") history.pushState({ postId: state.postId, stepId: state.stepId }, "", url);
    else history.replaceState({ postId: state.postId, stepId: state.stepId }, "", url);
  }

  function bootLocation() {
    const hash = readHash();
    if (!hash) {
      if (state.visualMode === "linked") state.visualId = currentStep().visualId;
      writeHash("replace");
      return;
    }
    const resolved = resolve(hash.postId, hash.stepId);
    if (resolved.invalid) {
      state.postId = BANK.posts[0].id;
      state.stepId = BANK.posts[0].steps[0].id;
      state.visualMode = "linked";
      state.visualId = currentStep().visualId;
      writeHash("replace");
      const prior = statusEl.textContent;
      setStatus(prior ? `${prior} That address was not recognised. Showing the first explanation.` : "That address was not recognised. Showing the first explanation.");
      return;
    }
    state.postId = resolved.post.id;
    state.stepId = resolved.step.id;
    state.places[state.postId] = state.stepId;
    if (state.visualMode === "linked") state.visualId = resolved.step.visualId;
  }

  function el(tag, props, kids) {
    const node = document.createElement(tag);
    Object.entries(props || {}).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else node.setAttribute(key, String(value));
    });
    (kids || []).forEach((kid) => node.append(kid));
    return node;
  }

  function button(id, act, text, label) {
    const props = { type: "button", "data-act": act, class: "act", text };
    if (id) props.id = id;
    const node = el("button", props);
    if (label) node.setAttribute("aria-label", label);
    return node;
  }

  function mountSvg(visual) {
    const mount = document.getElementById("visual-mount");
    const key = visual.file.replace(".svg", "");
    const holder = document.getElementById(`svg-${key}`);
    mount.replaceChildren();
    if (!holder) {
      mount.append(el("p", { text: "Illustration file missing." }));
      return;
    }
    const doc = new DOMParser().parseFromString(holder.textContent, "image/svg+xml");
    if (doc.querySelector("parsererror")) {
      mount.append(el("p", { text: "Illustration could not be read." }));
      return;
    }
    const svg = document.importNode(doc.documentElement, true);
    let title = svg.querySelector("title");
    if (!title) {
      title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      svg.prepend(title);
    }
    title.id = "visual-svg-title";
    title.textContent = visual.alt;
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-labelledby", "visual-svg-title");
    mount.append(svg);
  }

  function fillVisual(panel) {
    const visual = visualById(state.visualMode === "linked" ? currentStep().visualId : state.visualId);
    if (state.visualMode === "linked") state.visualId = visual.id;
    const index = Math.max(0, BANK.visuals.findIndex((item) => item.id === visual.id));
    panel.append(el("div", { id: "visual-mount" }));
    panel.append(el("figcaption", { id: "visual-caption", text: visual.title }));
    panel.append(el("p", { id: "post-anchor", class: "anchor prose", text: currentPost().anchor }));
    panel.append(el("p", { id: "visual-pos", class: "pos", text: `Image ${index + 1} of ${BANK.visuals.length}` }));
    const mode = state.cycle
      ? "Images are cycling. The explanation stays put."
      : state.visualMode === "manual"
        ? "Image held. The explanation will not change it."
        : "Image follows this step.";
    panel.append(el("p", { id: "visual-mode", class: "mode", text: mode }));
    const controls = el("div", { class: "controls stick" });
    const prev = button("visual-prev", "visual-prev", "Previous image", "Previous image");
    const next = button("visual-next", "visual-next", "Next image", "Next image");
    prev.disabled = index === 0;
    next.disabled = index === BANK.visuals.length - 1;
    controls.append(prev, next);
    if (state.visualMode === "manual" || state.cycle) {
      controls.append(button("relink", "relink", "Use this step's image"));
    }
    if (state.cycle) controls.append(button("cycle-pause", "pause", "Pause images"));
    panel.append(controls);
    return visual;
  }

  function stepBlock(step, index, total, compact) {
    const current = step.id === currentStep().id;
    const wrap = compact
      ? el("details", { class: "step", "data-step": step.id, id: `sec-${step.id}`, open: current ? "" : null, "aria-current": current ? "true" : "false" })
      : el("section", { class: "step prose", id: `sec-${step.id}`, "aria-current": current ? "true" : "false" });
    const heading = el(compact ? "summary" : "h2", { text: `${step.label}. ${step.title}` });
    if (compact) wrap.append(heading);
    wrap.append(el("p", { class: "pos", text: `Step ${index + 1} of ${total}` }));
    if (!compact) wrap.append(heading);
    const body = el("p", { class: "step-body", text: step.body });
    if (current) body.id = "step-body";
    const qual = el("p", { class: "qual", text: step.qualification });
    if (current) qual.id = "step-qual";
    wrap.append(body, qual);
    const evidenceBtn = button(current ? "evidence-open" : "", "evidence", "+ Evidence", `Evidence for ${step.title}`);
    evidenceBtn.dataset.step = step.id;
    wrap.append(evidenceBtn);
    if (index === total - 1) wrap.append(el("p", { class: "end", text: "End of this explanation." }));
    return wrap;
  }

  function textControls() {
    const post = currentPost();
    const index = post.steps.findIndex((step) => step.id === currentStep().id);
    const row = el("div", { class: "controls stick" });
    const prev = button("text-prev", "text-prev", "Previous");
    const next = button("text-next", "text-next", "Next");
    prev.disabled = index <= 0;
    next.disabled = index === post.steps.length - 1;
    row.append(prev, next, button("share-step", "share", "Share step"));
    return row;
  }

  function singleStep(host) {
    const post = currentPost();
    const step = currentStep();
    const index = post.steps.findIndex((item) => item.id === step.id);
    host.append(el("p", { id: "step-pos", class: "pos", text: `Step ${index + 1} of ${post.steps.length}` }));
    const title = el("h2", { id: "step-title", tabindex: "-1", text: step.title });
    const body = el("p", { id: "step-body", class: "step-body prose", text: step.body });
    const qual = el("p", { id: "step-qual", class: "qual prose", text: step.qualification });
    host.append(title, body, qual);
    const row = textControls();
    const evidenceBtn = button("evidence-open", "evidence", "+ Evidence", `Evidence for ${step.title}`);
    evidenceBtn.dataset.step = step.id;
    row.insertBefore(evidenceBtn, row.lastChild);
    host.append(row);
    if (index === post.steps.length - 1) host.append(el("p", { class: "end", text: "End of this explanation." }));
  }

  function paint(options) {
    const opts = options || {};
    painting = true;
    const mode = presentation();
    const split = mode === "split" || mode === "article" || mode === "thread";
    const axis = effectiveAxis();
    document.body.dataset.frame = split ? "split" : "flow";
    document.body.dataset.axis = axis;
    fallbackNote.textContent = mode.endsWith("flow") && state.layout === "split"
      ? "Not enough room for two panels. All steps are in one article. The same step is still selected."
      : "";
    stage.replaceChildren();
    const visual = el("section", { id: "visual-panel", class: "panel", "aria-label": "Pinned context" });
    fillVisual(visual);
    const explain = el("section", { id: "explain", class: "panel", "aria-label": "Explanation" });
    const post = currentPost();
    if (mode === "split") {
      singleStep(explain);
    } else if (mode === "thread" || mode === "thread-flow") {
      explain.append(textControls());
      post.steps.forEach((step, index) => explain.append(stepBlock(step, index, post.steps.length, true)));
    } else {
      explain.append(textControls());
      const article = el("article", { class: "prose" });
      post.steps.forEach((step, index) => article.append(stepBlock(step, index, post.steps.length, false)));
      explain.append(article);
    }
    stage.append(visual);
    if (split) {
      const divider = el("div", {
        id: "divider",
        role: "separator",
        tabindex: "0",
        "aria-orientation": axis === "side" ? "vertical" : "horizontal",
        "aria-valuemin": "22",
        "aria-valuemax": "78",
        "aria-valuenow": String(Math.round(state.ratio)),
        "aria-label": "Resize the panels. Arrow keys move the divider. Enter opens controls.",
      });
      divider.append(el("span", { class: "mark" }));
      stage.append(divider);
    }
    stage.append(explain);
    stage.dataset.layout = mode;
    if (split) {
      const visualPanel = document.getElementById("visual-panel");
      visualPanel.style.flex = `0 0 ${state.ratio}%`;
      explain.style.flex = "1 1 auto";
    }
    const shown = visualById(state.visualId);
    mountSvg(shown);
    document.getElementById("post-title").textContent = post.title;
    document.getElementById("kicker").textContent = `${post.topic} · Demonstration`;
    document.title = `${post.title} — MJB reader`;
    paintSave();
    paintTopics();
    placeDivider();
    const current = document.getElementById(`sec-${currentStep().id}`) || document.getElementById("step-title");
    if (current && mode !== "split") current.scrollIntoView({ block: "nearest", behavior: reduced() ? "auto" : "smooth" });
    painting = false;
    bindScroll();
    syncCycle();
    if (opts.focus) {
      const target = document.getElementById(opts.focus);
      if (target && !target.disabled) target.focus();
    }
  }

  function paintSave() {
    const saved = Boolean(state.saved[state.postId]);
    const button = document.getElementById("save-post");
    button.setAttribute("aria-pressed", saved ? "true" : "false");
    button.textContent = saved ? "Saved" : "Save";
    button.setAttribute("aria-label", saved ? "Saved on this device. Activate to remove." : "Save this post on this device");
  }

  function paintTopics() {
    const list = document.getElementById("topic-list");
    if (!list.childElementCount) {
      BANK.posts.forEach((post) => {
        const item = el("button", { type: "button", "data-post": post.id, text: post.topic });
        list.append(item);
      });
    }
    list.querySelectorAll("button").forEach((item) => {
      item.setAttribute("aria-current", item.dataset.post === state.postId ? "true" : "false");
    });
  }

  function placeDivider() {
    const divider = document.getElementById("divider");
    const visual = document.getElementById("visual-panel");
    if (!divider || !visual) return;
    const stageRect = stage.getBoundingClientRect();
    const vis = visual.getBoundingClientRect();
    const axis = document.body.dataset.axis;
    if (axis === "side") {
      divider.style.left = `${vis.right - stageRect.left - 22}px`;
      divider.style.top = "0px";
      divider.style.width = "44px";
      divider.style.height = "100%";
      divider.style.right = "auto";
      divider.style.bottom = "auto";
    } else {
      divider.style.top = `${vis.bottom - stageRect.top - 22}px`;
      divider.style.left = "0px";
      divider.style.width = "100%";
      divider.style.height = "44px";
      divider.style.right = "auto";
      divider.style.bottom = "auto";
    }
    divider.setAttribute("aria-valuenow", String(Math.round(state.ratio)));
    divider.setAttribute("aria-orientation", axis === "side" ? "vertical" : "horizontal");
  }

  function navigate(postId, stepId, mode, options) {
    const resolved = resolve(postId, stepId);
    state.postId = resolved.post.id;
    state.stepId = resolved.step.id;
    state.places[state.postId] = state.stepId;
    if (state.saved[state.postId]) state.saved[state.postId] = state.stepId;
    if (state.visualMode === "linked" && !state.cycle) state.visualId = resolved.step.visualId;
    if (mode === "push" || mode === "replace") writeHash(mode);
    if (!persist()) warnStorage();
    paint(options || {});
    if (resolved.invalid) setStatus("That address was not recognised. Showing the first explanation.");
  }

  function stepBy(delta) {
    const post = currentPost();
    const index = post.steps.findIndex((step) => step.id === currentStep().id);
    const next = post.steps[index + delta];
    if (!next) return;
    if (state.cycle) {
      state.cycle = false;
      state.visualMode = "manual";
      clearInterval(cycleTimer);
      cycleTimer = null;
      setStatus("Image cycling stopped. The explanation did not move.");
    }
    navigate(post.id, next.id, "push", { focus: "step-title" });
  }

  function nudgeVisual(delta) {
    const index = BANK.visuals.findIndex((item) => item.id === state.visualId);
    const next = BANK.visuals[index + delta];
    if (!next) return;
    state.visualId = next.id;
    state.visualMode = "manual";
    state.cycle = false;
    clearInterval(cycleTimer);
    cycleTimer = null;
    if (!persist()) warnStorage();
    paint({ focus: delta > 0 ? "visual-next" : "visual-prev" });
    setStatus("Image held. The explanation will not change it until you use this step's image.");
  }

  function relink() {
    state.visualMode = "linked";
    state.cycle = false;
    clearInterval(cycleTimer);
    cycleTimer = null;
    state.visualId = currentStep().visualId;
    if (!persist()) warnStorage();
    paint({ focus: "visual-next" });
    setStatus("The image follows this step again.");
  }

  function openPost(postId) {
    const post = postById(postId) || BANK.posts[0];
    const stepId = state.places[post.id] || state.saved[post.id] || post.steps[0].id;
    navigate(post.id, stepId, "push", { focus: "step-title" });
  }

  function toggleSave() {
    const id = state.postId;
    const prev = state.saved[id];
    if (prev) delete state.saved[id];
    else state.saved[id] = state.stepId;
    paintSave();
    if (!persist()) {
      if (prev) state.saved[id] = prev;
      else delete state.saved[id];
      paintSave();
      setStatus("Could not save on this device. Saved was not changed.");
      return;
    }
    setStatus(state.saved[id]
      ? "Saved on this device, including this step. This does not mark it as read."
      : "Removed from saved on this device.");
  }

  function safeHttp(url) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.href;
    } catch (error) {
      return "";
    }
    return "";
  }

  function openEvidence(stepId, from) {
    const post = currentPost();
    const step = post.steps.find((item) => item.id === stepId) || currentStep();
    const scroller = document.getElementById("explain");
    savedScroll = scroller ? scroller.scrollTop : window.scrollY;
    evidenceOpener = from || document.getElementById("evidence-open");
    const body = document.getElementById("evidence-body");
    body.replaceChildren();
    body.append(el("p", { class: "prose", text: step.support }));
    body.append(el("p", { class: "qual prose", text: step.qualification }));
    (step.sourceIds || []).forEach((id) => {
      const source = sourceById(id);
      const block = el("section");
      if (!source) {
        block.append(el("p", { text: "Source record missing." }));
      } else {
        block.append(el("h3", { text: source.title }));
        block.append(el("p", { text: `${source.type}. ${source.date}.` }));
        block.append(el("p", { text: step.sourceLocator || source.locator }));
        block.append(el("p", { text: source.limit }));
        const href = safeHttp(source.url);
        if (href) {
          const link = el("a", { href, text: source.title });
          link.rel = "noopener noreferrer";
          link.target = "_blank";
          block.append(link);
        }
      }
      body.append(block);
    });
    document.getElementById("evidence-title").textContent = "Evidence";
    if (!evidence.open) evidence.showModal();
    document.getElementById("evidence-close").focus();
  }

  function stepUrl() {
    const url = new URL(location.href);
    url.hash = `${state.postId}/${state.stepId}`;
    return url.href;
  }

  function shareStep() {
    const url = stepUrl();
    const finish = (text) => setStatus(text);
    if (navigator.share) {
      navigator.share({ title: currentPost().title, url }).then(() => {
        finish("Share sheet opened for this step.");
      }).catch((error) => {
        if (error && error.name === "AbortError") {
          finish("Share cancelled.");
          return;
        }
        copy(url, finish);
      });
      return;
    }
    copy(url, finish);
  }

  function copy(url, finish) {
    const done = () => finish("Link copied for this step.");
    const fail = () => finish(`Could not copy automatically. The link for this step is ${url}`);
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      fail();
      return;
    }
    navigator.clipboard.writeText(url).then(done).catch(fail);
  }

  function syncForm() {
    const layout = document.querySelector(`input[name="layout"][value="${state.layout}"]`);
    const axis = document.querySelector(`input[name="axis"][value="${state.axis}"]`);
    const motion = document.querySelector(`input[name="motion"][value="${state.motion}"]`);
    if (layout) layout.checked = true;
    if (axis) axis.checked = true;
    if (motion) motion.checked = true;
    document.getElementById("pref-opaque").checked = state.opaque;
    document.getElementById("pref-chrome").checked = state.alwaysChrome;
    document.getElementById("pref-swipe").checked = state.swipe;
    const cycle = document.getElementById("pref-cycle");
    cycle.checked = state.cycle && !reduced();
    cycle.disabled = reduced();
    document.getElementById("cycle-note").textContent = reduced()
      ? "Cycling stays off while motion is reduced."
      : "Cycling changes the image only. It starts off. Pause stops it.";
    document.querySelectorAll("#sizes button").forEach((item) => {
      item.setAttribute("aria-pressed", Number(item.dataset.scale) === state.scale ? "true" : "false");
    });
    setColorInputs(state);
    const note = document.getElementById("axis-note");
    if (state.axis === "side" && effectiveAxis() !== "side") {
      note.textContent = "Side by side needs a wider window. The panels stay stacked until there is room.";
    } else if (!splitFits() && state.layout === "split") {
      note.textContent = "This window is too short for two panels. The continuous article is showing, at the same step.";
    } else {
      note.textContent = "";
    }
  }

  function setColorInputs(theme) {
    document.getElementById("color-primary").value = theme.primary;
    document.getElementById("color-secondary").value = theme.secondary;
    document.getElementById("color-base").value = theme.base;
  }

  function readTheme() {
    return {
      themeName: "custom",
      primary: document.getElementById("color-primary").value,
      secondary: document.getElementById("color-secondary").value,
      base: document.getElementById("color-base").value,
    };
  }

  function openSettings(from) {
    opener = from || document.getElementById("menu-open");
    draft = null;
    applyCss(state);
    syncForm();
    document.getElementById("theme-msg").textContent = "";
    if (!settings.open) settings.showModal();
    document.getElementById("settings-close").focus();
  }

  function cancelPreview() {
    const had = Boolean(draft);
    draft = null;
    applyCss(state);
    setColorInputs(state);
    if (had) document.getElementById("theme-msg").textContent = "Preview cleared.";
  }

  function hideChrome() {
    if (chrome.dataset.hidden === "true" || state.alwaysChrome) return;
    if (chrome.contains(document.activeElement)) return;
    const height = chrome.offsetHeight;
    chrome.style.setProperty("--chrome-pull", `-${height}px`);
    chrome.dataset.hidden = "true";
    chrome.inert = true;
    showBtn.hidden = false;
  }

  function showChrome() {
    chrome.dataset.hidden = "false";
    chrome.style.removeProperty("--chrome-pull");
    chrome.inert = false;
    showBtn.hidden = true;
  }

  function bindScroll() {
    if (unbindScroll) unbindScroll();
    const explain = document.getElementById("explain");
    const scrollsInside = explain && explain.scrollHeight > explain.clientHeight + 8;
    const target = scrollsInside ? explain : window;
    let last = target === window ? window.scrollY : explain.scrollTop;
    const handler = () => {
      if (state.alwaysChrome || settings.open || evidence.open) return;
      const y = target === window ? window.scrollY : explain.scrollTop;
      const dy = y - last;
      if (Math.abs(dy) < 4) return;
      if (dy > 20 && y > 48) hideChrome();
      else if (dy < -12) showChrome();
      last = y;
    };
    target.addEventListener("scroll", handler, { passive: true });
    unbindScroll = () => target.removeEventListener("scroll", handler);
  }

  function syncCycle() {
    clearInterval(cycleTimer);
    cycleTimer = null;
    if (!state.cycle || reduced() || document.hidden) return;
    cycleTimer = window.setInterval(() => {
      if (!state.cycle || reduced() || document.hidden) return;
      const index = BANK.visuals.findIndex((item) => item.id === state.visualId);
      const next = BANK.visuals[(index + 1) % BANK.visuals.length];
      state.visualId = next.id;
      state.visualMode = "manual";
      persist();
      const mount = document.getElementById("visual-mount");
      if (!mount || painting) return;
      mountSvg(next);
      const pos = BANK.visuals.findIndex((item) => item.id === next.id);
      const posEl = document.getElementById("visual-pos");
      const modeEl = document.getElementById("visual-mode");
      if (posEl) posEl.textContent = `Image ${pos + 1} of ${BANK.visuals.length}`;
      if (modeEl) modeEl.textContent = "Images are cycling. The explanation stays put.";
      const caption = document.getElementById("visual-caption");
      if (caption) caption.textContent = next.title;
    }, 7000);
  }

  function rememberRatio(next) {
    state.ratio = Math.min(78, Math.max(22, next));
    const visual = document.getElementById("visual-panel");
    if (visual && document.body.dataset.frame === "split") visual.style.flex = `0 0 ${state.ratio}%`;
    placeDivider();
  }

  stage.addEventListener("click", (event) => {
    const control = event.target.closest("button");
    if (!control || !stage.contains(control)) return;
    const act = control.dataset.act;
    if (act === "text-next") stepBy(1);
    else if (act === "text-prev") stepBy(-1);
    else if (act === "visual-next") nudgeVisual(1);
    else if (act === "visual-prev") nudgeVisual(-1);
    else if (act === "evidence") openEvidence(control.dataset.step || state.stepId, control);
    else if (act === "share") shareStep();
    else if (act === "relink") relink();
    else if (act === "pause") {
      state.cycle = false;
      state.visualMode = "manual";
      clearInterval(cycleTimer);
      cycleTimer = null;
      if (!persist()) warnStorage();
      paint({ focus: "visual-next" });
      setStatus("Image cycling stopped. The explanation did not move.");
    }
  });

  stage.addEventListener("toggle", (event) => {
    if (painting) return;
    const node = event.target;
    if (!node.dataset || !node.dataset.step || !node.open) return;
    if (node.dataset.step === state.stepId) return;
    navigate(state.postId, node.dataset.step, "push", { focus: null });
  });

  stage.addEventListener("pointerdown", (event) => {
    if (state.cycle && event.target.closest("#visual-panel")) {
      state.cycle = false;
      state.visualMode = "manual";
      clearInterval(cycleTimer);
      cycleTimer = null;
      persist();
      setStatus("Image cycling stopped. The explanation did not move.");
    }
    const divider = document.getElementById("divider");
    if (!divider || !divider.contains(event.target) || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    divider.setPointerCapture(event.pointerId);
  });

  stage.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 8) return;
    drag.moved = true;
    const rect = stage.getBoundingClientRect();
    const ratio = document.body.dataset.axis === "side"
      ? ((event.clientX - rect.left) / rect.width) * 100
      : ((event.clientY - rect.top) / rect.height) * 100;
    rememberRatio(ratio);
  });

  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved;
    drag = null;
    if (moved) {
      if (!persist()) warnStorage();
      return;
    }
    openSettings(document.getElementById("divider"));
  }

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    drag = null;
  });

  document.addEventListener("keydown", (event) => {
    const divider = document.getElementById("divider");
    if (event.target !== divider) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const axis = document.body.dataset.axis;
    let next = null;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openSettings(divider);
      return;
    }
    if (event.key === "ArrowUp" || (axis === "side" && event.key === "ArrowLeft")) next = state.ratio - 4;
    if (event.key === "ArrowDown" || (axis === "side" && event.key === "ArrowRight")) next = state.ratio + 4;
    if (event.key === "Home") next = 22;
    if (event.key === "End") next = 78;
    if (next == null) return;
    event.preventDefault();
    rememberRatio(next);
    if (!persist()) warnStorage();
  });

  let touch = null;
  stage.addEventListener("touchstart", (event) => {
    if (!state.swipe || event.touches.length !== 1) return;
    if (event.target.closest("button, a, input, textarea, select, summary, #divider")) return;
    touch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  stage.addEventListener("touchend", (event) => {
    if (!touch || !event.changedTouches[0]) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    touch = null;
    if (!state.swipe || Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (dx < 0) stepBy(1);
    else stepBy(-1);
  }, { passive: true });

  document.getElementById("menu-open").addEventListener("click", () => openSettings(document.getElementById("menu-open")));
  document.getElementById("save-post").addEventListener("click", toggleSave);
  showBtn.addEventListener("click", () => showChrome());
  document.getElementById("settings-close").addEventListener("click", () => settings.close());
  document.getElementById("evidence-close").addEventListener("click", () => evidence.close());

  settings.addEventListener("close", () => {
    cancelPreview();
    if (opener && opener.isConnected) opener.focus();
    else document.getElementById("menu-open").focus();
  });
  evidence.addEventListener("close", () => {
    document.getElementById("evidence-body").replaceChildren();
    const scroller = document.getElementById("explain");
    if (scroller) scroller.scrollTop = savedScroll;
    else window.scrollTo(0, savedScroll);
    if (evidenceOpener && evidenceOpener.isConnected) evidenceOpener.focus();
  });

  document.querySelectorAll('input[name="layout"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      state.layout = input.value;
      if (!persist()) warnStorage();
      paint();
      syncForm();
    });
  });
  document.querySelectorAll('input[name="axis"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      state.axis = input.value;
      if (!persist()) warnStorage();
      paint();
      syncForm();
    });
  });
  document.querySelectorAll('input[name="motion"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      state.motion = input.value;
      if (reduced()) state.cycle = false;
      applyCss(activeTheme());
      if (!persist()) warnStorage();
      syncForm();
      syncCycle();
    });
  });
  document.getElementById("pref-opaque").addEventListener("change", (event) => {
    state.opaque = event.target.checked;
    applyCss(activeTheme());
    if (!persist()) warnStorage();
  });
  document.getElementById("pref-chrome").addEventListener("change", (event) => {
    state.alwaysChrome = event.target.checked;
    if (state.alwaysChrome) showChrome();
    if (!persist()) warnStorage();
  });
  document.getElementById("pref-swipe").addEventListener("change", (event) => {
    state.swipe = event.target.checked;
    if (!persist()) warnStorage();
    setStatus(state.swipe ? "Swipe can change steps. Previous and Next still work." : "Swipe is off. Previous and Next change steps.");
  });
  document.getElementById("pref-cycle").addEventListener("change", (event) => {
    if (reduced()) {
      event.target.checked = false;
      state.cycle = false;
      return;
    }
    state.cycle = event.target.checked;
    if (state.cycle) state.visualMode = "manual";
    if (!persist()) warnStorage();
    paint();
    syncForm();
    if (state.cycle) setStatus("Images will cycle. The explanation will not advance by itself.");
  });
  document.getElementById("sizes").addEventListener("click", (event) => {
    const control = event.target.closest("button");
    if (!control) return;
    state.scale = Number(control.dataset.scale);
    applyCss(activeTheme());
    if (!persist()) warnStorage();
    paint();
    syncForm();
    if (settings.open) document.getElementById("settings-close").focus();
  });

  document.querySelectorAll("[data-preset]").forEach((control) => {
    control.addEventListener("click", () => {
      const preset = PRESETS[control.dataset.preset];
      setColorInputs(preset);
      draft = { ...preset };
      applyCss(draft);
      document.getElementById("theme-msg").textContent = "Preview only. Apply stores it on this device.";
    });
  });
  document.getElementById("theme-preview").addEventListener("click", () => {
    draft = readTheme();
    const check = assess(draft);
    document.getElementById("theme-msg").textContent = check.ok ? "Preview only. Apply stores it on this device." : check.message;
    if (!check.ok) return;
    applyCss(draft);
  });
  document.getElementById("theme-apply").addEventListener("click", () => {
    const theme = readTheme();
    const check = assess(theme);
    if (!check.ok) {
      document.getElementById("theme-msg").textContent = check.message;
      return;
    }
    const names = Object.entries(PRESETS).find(([, preset]) => preset.primary === theme.primary && preset.secondary === theme.secondary && preset.base === theme.base);
    state.primary = theme.primary;
    state.secondary = theme.secondary;
    state.base = theme.base;
    state.themeName = names ? names[0] : "custom";
    draft = null;
    applyCss(state);
    if (!persist()) {
      document.getElementById("theme-msg").textContent = "Could not store the colours. They may last for this visit only.";
      return;
    }
    document.getElementById("theme-msg").textContent = "Colours stored on this device.";
  });
  document.getElementById("theme-cancel").addEventListener("click", cancelPreview);
  document.getElementById("theme-reset").addEventListener("click", () => {
    state.primary = PRESETS.charcoal.primary;
    state.secondary = PRESETS.charcoal.secondary;
    state.base = PRESETS.charcoal.base;
    state.themeName = "charcoal";
    draft = null;
    setColorInputs(state);
    applyCss(state);
    if (!persist()) warnStorage();
    document.getElementById("theme-msg").textContent = "Standard charcoal and gold restored.";
  });

  document.getElementById("topic-list").addEventListener("click", (event) => {
    const control = event.target.closest("button");
    if (!control) return;
    openPost(control.dataset.post);
    settings.close();
  });

  document.getElementById("export-go").addEventListener("click", () => {
    const text = JSON.stringify(state);
    const box = document.getElementById("import-text");
    box.value = text;
    copy(text, (message) => {
      document.getElementById("import-msg").textContent = message.startsWith("Link copied")
        ? "Preferences copied. They are still only on this device until you paste them somewhere."
        : "Could not copy automatically. The text is in the box to select.";
    });
  });
  document.getElementById("import-go").addEventListener("click", () => {
    const raw = document.getElementById("import-text").value;
    if (raw.length > 20000) {
      document.getElementById("import-msg").textContent = "That text is too long. Nothing was loaded.";
      return;
    }
    try {
      const data = JSON.parse(raw);
      if (unsafeValue(data)) throw new Error("unsafe");
      const next = sanitise(data);
      state = next;
      draft = null;
      applyCss(state);
      writeHash("replace");
      if (!persist()) warnStorage();
      paint();
      syncForm();
      document.getElementById("import-msg").textContent = "Preferences loaded on this device.";
    } catch (error) {
      document.getElementById("import-msg").textContent = "Those preferences were rejected. Nothing was changed.";
    }
  });

  window.addEventListener("popstate", () => {
    const hash = readHash();
    if (!hash) return;
    const resolved = resolve(hash.postId, hash.stepId);
    if (resolved.invalid) {
      state.postId = BANK.posts[0].id;
      state.stepId = BANK.posts[0].steps[0].id;
      state.visualId = currentStep().visualId;
      state.visualMode = "linked";
      paint({ focus: "step-title" });
      setStatus("That address was not recognised. Showing the first explanation.");
      return;
    }
    state.postId = resolved.post.id;
    state.stepId = resolved.step.id;
    state.places[state.postId] = state.stepId;
    if (state.visualMode === "linked" && !state.cycle) state.visualId = resolved.step.visualId;
    paint({ focus: "step-title" });
  });

  window.addEventListener("resize", () => {
    const before = stage.dataset.layout;
    const next = presentation();
    if (before !== next) paint();
    else placeDivider();
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      const before = stage.dataset.layout;
      if (before !== presentation()) paint();
      else placeDivider();
    });
  }
  document.addEventListener("visibilitychange", syncCycle);
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => {
    if (reduced()) state.cycle = false;
    applyCss(activeTheme());
    syncCycle();
    syncForm();
  });

  const back = document.getElementById("back-preview");
  if (location.protocol !== "file:") back.hidden = false;

  loadStore();
  bootLocation();
  if (reduced()) state.cycle = false;
  applyCss(state);
  paint();
  syncForm();
})();
