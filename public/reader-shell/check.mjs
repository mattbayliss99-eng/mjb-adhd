import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(join(dirname(fileURLToPath(import.meta.url)), "../../package.json"));
const { chromium } = require("playwright");

const root = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(root, "index.html")).href;
const shots = "/workspace/screenshots";
mkdirSync(shots, { recursive: true });

const results = [];
function record(id, status, evidence, action, observed) {
  results.push({ id, status, evidence, action, observed });
  console.log(`${status} ${id} — ${observed}`);
}

const browser = await chromium.launch({ headless: true });
const pageErrors = [];
const consoleErrors = [];
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
const page = await context.newPage();
page.on("pageerror", (error) => pageErrors.push(String(error)));
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

try {
  await page.goto(url, { waitUntil: "load" });
  await page.waitForSelector("#step-title");
  const title = await page.locator("#step-title").innerText();
  const svg = await page.locator("#visual-mount svg").count();
  const missing = await page.getByText("Illustration file missing").count();
  record(
    "T01",
    title.includes("A place to return to") && svg === 1 && missing === 0 && pageErrors.length === 0 ? "PASS" : "FAIL",
    "browser interaction",
    "open index.html from a file URL",
    `title="${title}" svg=${svg} missing=${missing} errors=${pageErrors.length}`,
  );
  await page.screenshot({ path: join(shots, "reader-shell-default.png") });

  const beforeVisual = await page.locator("#visual-caption").innerText();
  await page.locator("#text-next").click();
  const step2 = await page.locator("#step-title").innerText();
  const linkedVisual = await page.locator("#visual-caption").innerText();
  await page.locator("#visual-prev").click();
  const held = await page.locator("#visual-caption").innerText();
  const heldMode = await page.locator("#visual-mode").innerText();
  await page.locator("#text-next").click();
  const step3 = await page.locator("#step-title").innerText();
  const still = await page.locator("#visual-caption").innerText();
  const qual = await page.locator("#step-qual").innerText();
  record(
    "T02",
    step2.includes("You choose how much") &&
      linkedVisual.includes("Choose your depth") &&
      held.includes("Keep the anchor") &&
      step3.includes("Continue where you left off") &&
      still.includes("Keep the anchor") &&
      heldMode.includes("Image held")
      ? "PASS"
      : "FAIL",
    "browser interaction",
    "step 1 to 2, pin a different image, continue",
    `from=${beforeVisual} step2=${step2} linked=${linkedVisual} held=${held} step3=${step3} still=${still}`,
  );

  await page.goto(url, { waitUntil: "load" });
  const ratioBefore = await page.locator("#divider").getAttribute("aria-valuenow");
  const box = await page.locator("#divider").boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 140, { steps: 8 });
  await page.mouse.up();
  const ratioAfter = await page.locator("#divider").getAttribute("aria-valuenow");
  const openAfterDrag = await page.locator("#settings").evaluate((node) => node.open);
  const hit = Math.min(box.width, box.height);
  await page.locator("#divider").focus();
  await page.keyboard.press("ArrowUp");
  const ratioKey = await page.locator("#divider").getAttribute("aria-valuenow");
  await page.keyboard.press("Enter");
  const openAfterKey = await page.locator("#settings").evaluate((node) => node.open);
  await page.keyboard.press("Escape");
  await page.locator("#divider").click();
  const openAfterTap = await page.locator("#settings").evaluate((node) => node.open);
  await page.keyboard.press("Escape");
  record(
    "T03",
    Number(ratioAfter) > Number(ratioBefore) &&
      openAfterDrag === false &&
      Number(ratioKey) < Number(ratioAfter) &&
      openAfterKey === true &&
      openAfterTap === true &&
      hit >= 44
      ? "PASS"
      : "FAIL",
    "browser interaction",
    "drag divider, arrow key, Enter, click",
    `ratio ${ratioBefore}->${ratioAfter}->${ratioKey} dragOpen=${openAfterDrag} keyOpen=${openAfterKey} tapOpen=${openAfterTap} hit=${Math.round(hit)}`,
  );

  const scrollInfo = await page.evaluate(() => {
    const el = document.getElementById("explain");
    el.scrollTop = 40;
    return { before: el.scrollTop, can: el.scrollHeight > el.clientHeight + 8 };
  });
  const evidenceBtn = page.locator("#evidence-open");
  await evidenceBtn.click();
  const source = await page.locator("#evidence-body").innerText();
  await page.keyboard.press("Escape");
  const focusId = await page.evaluate(() => document.activeElement?.id || "");
  const scrollAfter = await page.evaluate(() => document.getElementById("explain").scrollTop);
  await page.locator("#menu-open").click();
  await page.keyboard.press("Escape");
  const menuFocus = await page.evaluate(() => document.activeElement?.id || "");
  record(
    "T04",
    source.includes("MJB Reader Experience") &&
      source.includes("do not establish clinical benefit") &&
      focusId === "evidence-open" &&
      menuFocus === "menu-open" &&
      (!scrollInfo.can || scrollAfter === scrollInfo.before)
      ? "PASS"
      : "FAIL",
    "browser interaction",
    "open and close evidence and settings",
    `focus=${focusId} menu=${menuFocus} scroll ${scrollInfo.before}->${scrollAfter} can=${scrollInfo.can} sourceHasBrief=${source.includes("MJB Reader Experience")}`,
  );

  await page.goto(url + "#DEMO-P001/DEMO-S001-02", { waitUntil: "load" });
  const q = "Important qualifications belong beside the point they qualify.";
  await page.locator("#menu-open").click();
  await page.getByRole("radio", { name: "Continuous article" }).check();
  const articleCount = await page.locator(".step-body").count();
  const articleQual = await page.getByText(q).count();
  const articleCurrent = await page.locator("#explain [aria-current='true']").innerText();
  await page.getByRole("radio", { name: "Compact thread" }).check();
  const threadCount = await page.locator(".step-body").count();
  const threadLayouts = await page.locator("#stage").count();
  await page.getByRole("radio", { name: "Split" }).check();
  const splitCount = await page.locator(".step-body").count();
  const splitTitle = await page.locator("#step-title").innerText();
  await page.keyboard.press("Escape");
  record(
    "T05",
    articleCount === 3 &&
      articleQual === 1 &&
      articleCurrent.includes("You choose how much") &&
      threadCount === 3 &&
      threadLayouts === 1 &&
      splitCount === 1 &&
      splitTitle.includes("You choose how much")
      ? "PASS"
      : "FAIL",
    "browser interaction",
    "split, article, thread, split at the same step",
    `article=${articleCount} qual=${articleQual} thread=${threadCount} split=${splitCount} title=${splitTitle}`,
  );

  await page.evaluate(() => localStorage.removeItem("mjb-reader-shell-v1"));
  await page.goto(url + "#DEMO-P001/DEMO-S001-01", { waitUntil: "load" });
  await page.locator("#text-next").click();
  await page.locator("#save-post").click();
  const savedMsg = await page.locator("#status").innerText();
  await page.locator("#menu-open").click();
  await page.getByRole("button", { name: "Evidence without the wall of text" }).click();
  const other = await page.locator("#step-title").innerText();
  const otherSaved = await page.locator("#save-post").getAttribute("aria-pressed");
  await page.locator("#menu-open").click();
  await page.getByRole("button", { name: "Reading without losing context" }).click();
  const returned = await page.locator("#step-title").innerText();
  const returnedSaved = await page.locator("#save-post").getAttribute("aria-pressed");
  await page.reload({ waitUntil: "load" });
  const reloaded = await page.locator("#step-title").innerText();
  const reloadedSaved = await page.locator("#save-post").getAttribute("aria-pressed");
  await page.evaluate(() => { window.__MJB_FORCE_STORAGE_FAIL = true; });
  await page.locator("#save-post").click();
  const failMsg = await page.locator("#status").innerText();
  const stillSaved = await page.locator("#save-post").getAttribute("aria-pressed");
  await page.evaluate(() => localStorage.setItem("mjb-reader-shell-v1", "{"));
  await page.reload({ waitUntil: "load" });
  const corrupt = await page.locator("#status").innerText();
  const corruptTitle = await page.locator("#step-title").innerText();
  record(
    "T06",
    savedMsg.includes("does not mark it as read") &&
      otherSaved === "false" &&
      returned.includes("You choose how much") &&
      returnedSaved === "true" &&
      reloaded.includes("You choose how much") &&
      reloadedSaved === "true" &&
      failMsg.includes("Could not save") &&
      stillSaved === "true" &&
      corrupt.includes("could not be read") &&
      corruptTitle.includes("You choose how much")
      ? "PASS"
      : "FAIL",
    "browser interaction",
    "save, change topic, return, reload, quota failure, corrupt store",
    `saved="${savedMsg}" other=${other} returned=${returned}/${returnedSaved} reload=${reloaded}/${reloadedSaved} fail="${failMsg}" still=${stillSaved} corrupt="${corrupt}"`,
  );

  await page.goto(url, { waitUntil: "load" });
  await page.locator("#menu-open").click();
  await page.getByRole("button", { name: "Paper" }).click();
  await page.locator("#theme-cancel").click();
  const afterCancel = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.getByRole("button", { name: "Paper" }).click();
  await page.locator("#theme-apply").click();
  const paper = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.locator("#color-base").fill("#ffffff");
  await page.locator("#color-primary").fill("#f4f1ea");
  await page.locator("#color-secondary").fill("#f7f4ee");
  await page.locator("#theme-apply").click();
  const blocked = await page.locator("#theme-msg").innerText();
  const stillPaper = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.getByRole("button", { name: "200%" }).click();
  const font = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
  await page.getByRole("radio", { name: "Reduce motion" }).check();
  const motion = await page.evaluate(() => document.documentElement.dataset.motion);
  await page.locator("#pref-opaque").check();
  const opaque = await page.evaluate(() => document.documentElement.dataset.opaque);
  await page.locator("#pref-cycle").isDisabled();
  record(
    "T07",
    afterCancel === "rgb(20, 18, 14)" &&
      paper === "rgb(251, 247, 239)" &&
      blocked.includes("blocked") &&
      stillPaper === paper &&
      font >= 30 &&
      motion === "reduce" &&
      opaque === "true"
      ? "PASS"
      : "FAIL",
    "browser interaction",
    "cancel preview, apply paper, block pale-on-pale, 200% text, reduced motion, opaque",
    `cancel=${afterCancel} paper=${paper} blocked="${blocked}" font=${font} motion=${motion} opaque=${opaque}`,
  );
  await page.keyboard.press("Escape");
  await page.screenshot({ path: join(shots, "reader-shell-paper-200.png") });

  await page.evaluate(() => localStorage.removeItem("mjb-reader-shell-v1"));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(url, { waitUntil: "load" });
  const views = [
    [320, 568],
    [390, 844],
    [768, 1024],
    [1280, 800],
    [800, 360],
    [390, 420],
  ];
  const viewNotes = [];
  let viewsOk = true;
  for (const [w, h] of views) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(50);
    const info = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      layout: document.getElementById("stage")?.dataset.layout || "",
      divider: Boolean(document.getElementById("divider")),
      title: document.getElementById("step-title")?.innerText || document.body.innerText.slice(0, 80),
    }));
    const next = page.locator("#text-next");
    await next.scrollIntoViewIfNeeded().catch(() => {});
    const boxNext = await next.boundingBox();
    const reached = boxNext && boxNext.x >= -1 && boxNext.x < w && boxNext.y >= -1 && boxNext.y < h;
    const narrow = w <= 800 && h <= 420;
    const fallback = !info.divider && info.layout.includes("flow");
    const overflow = info.sw > info.cw + 2;
    if (overflow || !reached || (narrow && !fallback)) viewsOk = false;
    viewNotes.push(`${w}x${h} layout=${info.layout} overflow=${overflow} reached=${Boolean(reached)} fallback=${fallback}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: join(shots, "reader-shell-mobile.png") });
  await page.setViewportSize({ width: 800, height: 360 });
  await page.screenshot({ path: join(shots, "reader-shell-landscape.png") });
  record("T08", viewsOk ? "PASS" : "FAIL", "browser viewport emulation, not a physical phone", "320, 390, 768, 1280, short landscape, short height", viewNotes.join(" | "));

  pageErrors.length = 0;
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(url + "#DEMO-P002/DEMO-S002-02", { waitUntil: "load" });
  const direct = await page.locator("#step-title").innerText();
  await page.locator("#text-next").click();
  await page.goBack();
  const backTitle = await page.locator("#step-title").innerText();
  await page.goto(url + "#NOPE/NOPE", { waitUntil: "load" });
  const bad = await page.locator("#status").innerText();
  const recovered = await page.locator("#step-title").innerText();
  record(
    "T09",
    direct.includes("A title that tells you something") &&
      backTitle.includes("A title that tells you something") &&
      bad.includes("not recognised") &&
      recovered.includes("A place to return to") &&
      pageErrors.length === 0
      ? "PASS"
      : "FAIL",
    "browser interaction",
    "direct step hash, Back, invalid hash",
    `direct="${direct}" back="${backTitle}" bad="${bad}" recovered="${recovered}" errors=${pageErrors.length}`,
  );

  await page.goto(url + "#DEMO-P001/DEMO-S001-03", { waitUntil: "load" });
  const nextDisabled = await page.locator("#text-next").isDisabled();
  const prevEnabled = !(await page.locator("#text-prev").isDisabled());
  const swipeOff = await page.locator("#pref-swipe").isChecked() === false;
  await page.evaluate(() => {
    const el = document.getElementById("explain");
    el.style.height = "120px";
    el.scrollTop = 0;
    el.dispatchEvent(new Event("scroll"));
    el.scrollTop = 80;
    el.dispatchEvent(new Event("scroll"));
  });
  const hidden = await page.locator("#chrome").getAttribute("data-hidden");
  await page.locator("#chrome-show").click();
  const shown = await page.locator("#chrome").getAttribute("data-hidden");
  await page.locator("#menu-open").click();
  await page.getByText("Move a copy of these preferences").click();
  await page.locator("#import-text").fill('{"v":1,"primary":"javascript:alert(1)","secondary":"#c4a15a","base":"#14120e"}');
  await page.locator("#import-go").click();
  const rejected = await page.locator("#import-msg").innerText();
  const themeStill = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.getByRole("button", { name: "Paper" }).click();
  await page.locator("#theme-apply").click();
  await page.locator("#theme-reset").click();
  const reset = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.keyboard.press("Escape");
  record(
    "R-extra",
    nextDisabled && prevEnabled && swipeOff && hidden === "true" && shown !== "true" && rejected.includes("rejected") && themeStill === "rgb(20, 18, 14)" && reset === "rgb(20, 18, 14)"
      ? "PASS"
      : "FAIL",
    "browser interaction",
    "end of sequence, swipe default, chrome retreat, unsafe import, theme reset",
    `nextDisabled=${nextDisabled} prev=${prevEnabled} swipeOff=${swipeOff} hidden=${hidden} shown=${shown} rejected="${rejected}" theme=${themeStill} reset=${reset}`,
  );

  await page.clock.install();
  await page.locator("#menu-open").click();
  await page.locator("#pref-cycle").check();
  await page.keyboard.press("Escape");
  const stepBefore = await page.locator("#step-title").innerText();
  const visualBefore = await page.locator("#visual-caption").innerText();
  await page.clock.fastForward(7500);
  const visualMid = await page.locator("#visual-caption").innerText();
  await page.locator("#cycle-pause").click();
  const paused = await page.locator("#visual-mode").innerText();
  const stepAfter = await page.locator("#step-title").innerText();
  record(
    "R16",
    stepBefore === stepAfter && visualMid !== visualBefore && paused.includes("held")
      ? "PASS"
      : "FAIL",
    "browser interaction",
    "turn image cycling on, advance the fake clock 7.5s, then pause",
    `step same=${stepBefore === stepAfter} visual ${visualBefore} -> ${visualMid} paused="${paused}"`,
  );

  const reducedContext = await browser.newContext({ viewport: { width: 1100, height: 800 }, reducedMotion: "reduce" });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(url, { waitUntil: "load" });
  const cycleDisabled = await reducedPage.locator("#pref-cycle").isDisabled();
  const systemMotion = await reducedPage.evaluate(() => document.documentElement.dataset.motion);
  record(
    "R14-motion",
    cycleDisabled && systemMotion === "reduce" ? "PASS" : "FAIL",
    "browser emulation of prefers-reduced-motion",
    "open with reduced motion",
    `cycleDisabled=${cycleDisabled} motion=${systemMotion}`,
  );
  await reducedContext.close();

  record("T10", "NOT_RUN", "not executed", "physical phone and screen reader", "No physical device and no screen reader were used.");
} catch (error) {
  record("RUN", "FAIL", "browser interaction", "check.mjs", String(error.stack || error));
} finally {
  await browser.close();
  writeFileSync(join(root, "check-results.json"), JSON.stringify({ pageErrors, consoleErrors, results }, null, 2));
  const failed = results.some((item) => item.status === "FAIL");
  process.exit(failed ? 1 : 0);
}
