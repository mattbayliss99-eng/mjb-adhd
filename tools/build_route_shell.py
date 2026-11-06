#!/usr/bin/env python3
"""Route bank + shell library generator (Stage1 v0.3.1).

Reads every existing public page under site/ (excluding the beta/preview shells and 404),
records a stable route ID, group, mode, verbatim title/description and a SHA-256 of the
page's <main> text, then writes:
  content/routes/route-bank.json                      canonical route bank (one record per old URL)
  site/social-reading-beta/routes.json                 runtime copy for the shell reader
  site/social-reading-beta/library/index.html          group index
  site/social-reading-beta/library/<group>/index.html  reviewable route-group pages
  site/social-reading-beta/read/index.html             shell reader (renders the ORIGINAL page's <main> at runtime)
Original pages are never modified or copied: the reader fetches them, so there is one body per article.
Use --check to verify generated files are current.
"""
import hashlib, html, json, re, sys
from html.parser import HTMLParser
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_social_reading_beta as srb

ROOT = srb.ROOT; SITE = srb.SITE; BASE = srb.BASE
EXCLUDE_PREFIX = ("/social-reading-beta/", "/posts-preview/")
GROUPS = [  # (group id, label, prefix test, description) first match wins
  ("start", "Start and mission", lambda r: r in ("/", "/about/mission/", "/navigation/"), "Home page, why the site exists and the full topic index."),
  ("journey", "Journey, arguments and archive", lambda r: r in ("/journey/", "/arguments/", "/archive/"), "The author's journey, the case argued and the living archive."),
  ("accountability", "Accountability record", lambda r: r.startswith("/accountability/"), "Accountability record, UK care accountability and case register."),
  ("science-core", "Science: ADHD, genetics and pathway", lambda r: r.startswith("/science/") and not r.startswith("/science/process-atlas/"), "What ADHD is, the genetics series and the dopamine pathway."),
  ("process-atlas", "Science: process atlas", lambda r: r.startswith("/science/process-atlas/"), "Figure-by-figure process atlas (interactive diagrams stay on the original pages)."),
  ("guide-understand", "Guidebook: understand and care", lambda r: r.startswith(("/guide/static/understand/", "/guide/static/care/")) or r in ("/guide/static/",), "Guidebook pages on symptoms and navigating care."),
  ("guide-evidence", "Guidebook: evidence and treatment", lambda r: r.startswith(("/guide/static/evidence/", "/guide/static/treatment/")), "Guidebook pages on biology, evidence and treatment."),
  ("guide-neurology", "Guidebook: neurology", lambda r: r.startswith("/guide/static/neurology/"), "Guidebook neurology pages."),
  ("guide-accountability", "Guidebook: lives and accountability", lambda r: r.startswith("/guide/static/accountability/"), "Guidebook accountability, timeline and corrections pages."),
  ("guide-method", "Guidebook: method, sources and tools", lambda r: r.startswith(("/guide/static/about/", "/guide/static/tools/")) or r == "/guide/", "Method, source register, resources and appointment preparation."),
  ("support-rights", "Support and rights", lambda r: r.startswith(("/support/", "/rights/")), "Practical supports, examples and rights/adjustments."),
  ("compounds", "Medications and supplements", lambda r: r.startswith("/compounds/"), "Medication, supplement and cannabis pages."),
  ("sources", "Sources and method", lambda r: r.startswith("/sources/"), "Source documents, evidence map, method and verified numbers."),
  ("contact", "Contact", lambda r: r.startswith("/contact/"), "Contact form (stays on the original page)."),
]
# Reference-only: page depends on its own app/form or is a whole-site index the shell library replaces.
REFERENCE = {
  "/": "Whole-site home; the shell has its own Home. Opened as the original page.",
  "/navigation/": "Whole-site topic index; superseded inside the shell by the Library but kept as the original page.",
  "/guide/": "Guidebook JavaScript app (guide.js); its static twin pages under /guide/static/ are migrated instead.",
  "/contact/": "Netlify form: must post from the original page (form-action 'self'); not re-hosted in the shell.",
}
NOT_LISTED = {"/contact/thanks/": "Form confirmation page (noindex); mapped but not listed."}

class MainText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.depth = 0; self.skip = 0; self.parts = []; self.links = 0; self.downloads = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "main": self.depth += 1
        if self.depth and tag in ("script", "template"): self.skip += 1
        if self.depth and tag == "a":
            h = a.get("href") or ""
            if h.startswith("http"): self.links += 1
            if re.search(r"\.(pdf|csv|zip|docx|xlsx|json|md|txt)$", h, re.I) or "download" in a: self.downloads += 1
    def handle_endtag(self, tag):
        if self.depth and tag in ("script", "template") and self.skip: self.skip -= 1
        if tag == "main" and self.depth: self.depth -= 1
    def handle_data(self, d):
        if self.depth and not self.skip: self.parts.append(d)

def norm(t): return re.sub(r"\s+", " ", t).strip()
def meta(src, name):
    m = re.search(r'<meta\s+name="%s"\s+content="([^"]*)"' % name, src) or re.search(r'<meta\s+content="([^"]*)"\s+name="%s"' % name, src)
    return html.unescape(m.group(1)) if m else ""
def title_of(src):
    m = re.search(r"<h1[^>]*>(.*?)</h1>", src, re.S)
    t = re.sub(r"<[^>]+>", "", m.group(1)) if m else re.search(r"<title>(.*?)</title>", src, re.S).group(1)
    return norm(html.unescape(t))
def rid(route): return "RT-" + (re.sub(r"[^a-z0-9]+", "-", route.strip("/").lower()) or "home")

def collect():
    routes = []
    for f in sorted(SITE.rglob("index.html")):
        r = "/" + str(f.parent.relative_to(SITE)).replace("\\", "/") + "/"
        if r == "/./": r = "/"
        if r.startswith(EXCLUDE_PREFIX): continue
        src = f.read_text(encoding="utf-8")
        p = MainText(); p.feed(src)
        text = norm("".join(p.parts))
        group = next(g for g in GROUPS if g[2](r))
        scripts = sorted(set(Path(s).name for s in re.findall(r'<script[^>]+src="([^"]+)"', src)))
        interactive = [s for s in scripts if s in ("atlas.js", "pathway.js", "present.js", "visual.js", "interact.js", "accountability.js", "guide.js", "article-return.js")]
        mode = "reference" if r in REFERENCE else ("unlisted" if r in NOT_LISTED else "reader")
        routes.append({
          "id": rid(r), "oldRoute": r, "group": group[0], "mode": mode,
          "title": title_of(src), "description": meta(src, "description"),
          "robots": meta(src, "robots") or "default",
          "mainTextSha256": hashlib.sha256(text.encode()).hexdigest(), "mainTextChars": len(text),
          "pageSha256": hashlib.sha256(f.read_bytes()).hexdigest(),
          "externalSourceLinks": p.links, "downloadLinks": p.downloads,
          "enhancements": interactive, "note": REFERENCE.get(r) or NOT_LISTED.get(r) or "",
          "reviewState": "published-existing", "changeInMigration": "none (original page unchanged; shell renders it at runtime)",
        })
    return routes

def esc(s): return html.escape(s or "", quote=True)

def library_pages(routes, revision, date):
    out = {}
    cards = []
    for g in GROUPS:
        rs = [r for r in routes if r["group"] == g[0] and r["mode"] != "unlisted"]
        if not rs: continue
        cards.append('<li class="srb-card srb-lib-group"><h2><a href="%slibrary/%s/">%s</a></h2><p>%s</p><p class="srb-fine">%d pages · %d in shell reader · %d open as original</p></li>' % (
            BASE, g[0], esc(g[1]), esc(g[3]), len(rs), sum(r["mode"] == "reader" for r in rs), sum(r["mode"] == "reference" for r in rs)))
        items = []
        for r in rs:
            read = '<a class="srb-btn srb-btn-accent" data-lib-read="%s" href="%sread/?r=%s">Read in shell</a>' % (r["id"], BASE, r["id"]) if r["mode"] == "reader" else '<span class="srb-fine">Opens as original page: %s</span>' % esc(r["note"])
            items.append('<li class="srb-card srb-lib-item" id="%s"><h2 class="srb-h3">%s</h2>%s<p class="srb-fine">Original URL kept: <code>%s</code></p><div class="srb-actions">%s<a class="srb-btn" data-lib-original href="%s">Open original page</a></div></li>' % (
                r["id"], esc(r["title"]), ('<p>%s</p>' % esc(r["description"])) if r["description"] else "", esc(r["oldRoute"]), read, esc(r["oldRoute"])))
        body = ('<nav class="srb-fine" aria-label="Breadcrumb"><a href="%slibrary/">Library</a> › %s</nav><h1>%s</h1><p>%s</p>'
                '<p class="srb-beta-banner" role="note">Existing published pages, unchanged. "Read in shell" shows the original article text, sources and links inside this reader; downloads, interactive diagrams and the accessibility toolbar remain on the original page.</p>'
                '<ul class="srb-lib-list" data-lib-group="%s">%s</ul>') % (BASE, esc(g[1]), esc(g[1]), esc(g[3]), g[0], "".join(items))
        out[SITE / ("social-reading-beta/library/%s/index.html" % g[0])] = srb.shell(g[1] + " - Library", body, revision, date, 'data-page="library-group"').replace("</body>", '<script src="%sjs/library.js" defer></script>\n</body>' % BASE)
    body = ('<h1>Library</h1><p>Every existing public page, grouped for review. Nothing here is new content: pages are shown from their original published URLs.</p><ul class="srb-lib-list">%s</ul>') % "".join(cards)
    out[SITE / "social-reading-beta/library/index.html"] = srb.shell("Library", body, revision, date, 'data-page="library"')
    reader = ('<div class="srb-route-reader" data-route-reader><nav class="srb-actions srb-route-head" aria-label="Reader">'
              '<a class="srb-btn" data-route-back href="%slibrary/">Back to library</a>'
              '<a class="srb-btn" data-route-original href="/">Open original page</a>'
              '<button type="button" class="srb-btn" data-route-fav aria-pressed="false">☆ Favourite</button></nav>'
              '<p class="srb-fine" data-route-status role="status" aria-live="polite">Loading the original page…</p>'
              '<p class="srb-beta-banner" data-route-notice hidden role="note"></p>'
              '<article class="srb-card srb-route-article" data-route-article aria-labelledby="route-h"></article>'
              '<noscript><p>The shell reader needs JavaScript. Use the <a href="%slibrary/">Library</a> links to open original pages.</p></noscript></div>') % (BASE, BASE)
    out[SITE / "social-reading-beta/read/index.html"] = srb.shell("Reader", reader, revision, date, 'data-page="route-reader"').replace("</body>", '<script src="%sjs/route-reader.js" defer></script>\n</body>' % BASE)
    return out

def main():
    check = "--check" in sys.argv
    data = srb.load_bank(); revision = data.get("revision") or data.get("contentRevision") or "unknown"
    date = data.get("date") or data.get("contentDate") or ""
    m = re.search(r'mjb-content-revision" content="([^"]+)".*?mjb-content-date" content="([^"]+)"', (SITE / "social-reading-beta/index.html").read_text(encoding="utf-8"), re.S)
    if m: revision, date = m.group(1), m.group(2)
    routes = collect()
    bank = {"format": "mjb-route-bank", "version": 1, "contentRevision": revision, "routes": routes}
    outputs = {ROOT / "content/routes/route-bank.json": json.dumps(bank, indent=2, ensure_ascii=False) + "\n",
               SITE / "social-reading-beta/routes.json": json.dumps({"format": "mjb-route-bank", "version": 1, "routes": [{k: r[k] for k in ("id", "oldRoute", "group", "mode", "title", "mainTextSha256", "enhancements", "note")} for r in routes]}, ensure_ascii=False) + "\n"}
    outputs.update(library_pages(routes, revision, date))
    stale = []
    for p, c in outputs.items():
        if not p.exists() or p.read_text(encoding="utf-8") != c:
            stale.append(str(p.relative_to(ROOT)))
            if not check: p.parent.mkdir(parents=True, exist_ok=True); p.write_text(c, encoding="utf-8")
    if check and stale: print("STALE:", *stale, sep="\n  "); sys.exit(1)
    counts = {}
    for r in routes: counts[r["mode"]] = counts.get(r["mode"], 0) + 1
    print("Route bank %s: %d routes %s, %d groups" % ("current" if check else "built", len(routes), counts, len({r['group'] for r in routes})))
if __name__ == "__main__": main()
