#!/usr/bin/env python3
from __future__ import annotations
import html, json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
BASE = "/social-reading-beta/"
BANK_PATH = ROOT / "content/posts/posts.json"
def esc(s):
    return html.escape("" if s is None else str(s), quote=True)
def load_bank():
    data = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    assert data.get("schema_version") in {"2.0", "1.1", "1.0"}
    posts = data["posts"]
    assert len(posts) == 3 and {p["id"] for p in posts} == {"MJB-P000001", "MJB-P000002", "MJB-P000003"}
    seen = []
    for p in posts:
        assert p.get("evidence", {}).get("class") in {"editorial", "article-excerpt"}
        if p["evidence"]["class"] == "article-excerpt":
            assert all(sl.get("sourceLocator") for sl in p["slides"]), "excerpt slides need a source locator"
        assert "topic-network.jpg" not in str((p.get("image") or {}).get("src", ""))
        assert "PENDING_PROVENANCE_REVIEW" not in str((p.get("image") or {}).get("rights", ""))
        for s in p.get("slides") or []:
            assert s.get("id") and s["id"] not in seen
            seen.append(s["id"])
        assert len(p.get("slides") or []) >= 3
    return data
def claim_map(data):
    return {c["id"]: c for c in data.get("claims") or []}
def source_map(data):
    return {s["id"]: s for s in data.get("sources") or []}
def route_id(url):
    """Same stable route ID rule as tools/build_route_shell.py."""
    return "RT-" + (re.sub(r"[^a-z0-9]+", "-", url.strip("/").lower()) or "home")

def post_url(p):
    return f"{BASE}p/{p['id'].lower()}/"
def slide_url(p, slide):
    return f"{post_url(p)}?slide={slide['id']}"
PREFS = r"""
<dialog class="srb-prefs" id="srb-prefs" aria-label="Reading preferences"><form method="dialog" class="srb-prefs-form">
<h2>Reading preferences</h2>
<label><input type="checkbox" id="pref-always-nav"> Always-visible navigation</label>
<label><input type="checkbox" id="pref-reduce-motion"> Reduced motion</label>
<label><input type="checkbox" id="pref-plain"> Plain finish</label>
<label><input type="checkbox" id="pref-opaque"> Reduced transparency</label>
<label><input type="checkbox" id="pref-link-visuals" checked> Link visuals to explanation</label>
<label><input type="checkbox" id="pref-auto-cycle"> Auto-cycle visuals (off by default)</label>
<label><input type="checkbox" id="pref-auto-cycle-motion-override"> Allow auto-cycle even with reduced motion (deliberate override)</label>
<label>Auto-cycle interval (seconds, min 10) <input type="number" id="pref-cycle-interval" min="10" max="120" value="10"></label>
<p id="srb-storage-status" class="srb-fine" role="status" aria-live="polite" data-storage-status></p>
<label>Text size <select id="pref-text"><option value="100">100%</option><option value="125">125%</option><option value="150">150%</option><option value="200">200%</option></select></label>
<label>Theme preset <select id="pref-theme"><option value="charcoal-gold">Charcoal Gold</option><option value="mjb-purple">MJB Purple</option><option value="ink-paper">Ink on Paper</option><option value="graphite">Graphite Monochrome</option><option value="deep-blue">Deep Blue</option><option value="rose">Rose Pink</option><option value="neon">Restrained Neon</option></select></label>
<label>Layout <select id="pref-layout"><option value="auto">Automatic (Deck on phone)</option><option value="split">Split reader</option><option value="continuous">Continuous</option><option value="thread">Thread</option><option value="deck">Deck (one card per step)</option></select></label>
<label>Split orientation <select id="pref-orient"><option value="top-bottom">Top / bottom</option><option value="side-by-side">Side by side (wide)</option></select></label>
<label>Logo variant <select id="pref-logo"><option value="gold">Gold</option><option value="purple">Purple</option><option value="mono">Monochrome</option><option value="cyan">Cyan</option><option value="copper">Copper</option><option value="game">Gaming</option></select></label>
<fieldset><legend>Custom colours</legend>
<label><input type="checkbox" id="pref-use-custom"> Use custom primary/secondary/base</label>
<label>Base <input type="color" id="pref-c-bg" value="#111214"></label>
<label>Primary <input type="color" id="pref-c-primary" value="#D5AE57"></label>
<label>Secondary <input type="color" id="pref-c-secondary" value="#8B78D1"></label>
<p class="srb-warn">Advanced overrides can reduce contrast. Use Reset appearance if needed.</p>
<button type="button" class="srb-btn" id="pref-apply-theme">Apply theme</button>
<button type="button" class="srb-btn" id="pref-reset-appearance">Reset appearance</button></fieldset>
<div><button type="button" class="srb-btn" id="pref-export">Export preferences</button>
<label class="srb-btn">Import preferences<input type="file" id="pref-import" accept="application/json,.json" hidden></label></div>
<button type="submit" class="srb-btn srb-btn-accent">Done</button></form></dialog>"""
def shell(title, body, revision, date, body_attrs=""):
    return f"""<!doctype html>
<html lang="en-GB" data-mjb-beta="social-reading" data-theme="dark-gold">
<head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="mjb-content-revision" content="{esc(revision)}">
<meta name="mjb-content-date" content="{esc(date)}">
<title>{esc(title)} - MJB social reading beta</title>
<link rel="stylesheet" href="{BASE}css/social-reading.css"></head>
<body {body_attrs}>
<a class="skip-link" href="#main-content">Skip to content</a>
<button type="button" class="srb-btn srb-show-nav" id="srb-show-nav">Show navigation</button>
<div class="srb-app"><aside class="srb-rail" aria-label="Primary">
<a class="srb-brand" href="{BASE}"><span class="srb-mark" id="srb-logo" data-logo="gold" aria-hidden="true">M</span><span class="srb-brand-text">MJB ADHD</span></a>
<p class="srb-beta-chip" role="note">Public beta - quoted article excerpts</p>
<details class="srb-rail-modes"><summary>Sidebar options</summary><div role="group" aria-label="Sidebar density">
<button type="button" class="srb-btn" data-rail-mode="expanded" aria-pressed="true">Expanded</button>
<button type="button" class="srb-btn" data-rail-mode="rail">Thin rail</button>
<button type="button" class="srb-btn" data-rail-mode="closed">Closed</button>
</div></details>
<nav class="srb-nav" aria-label="Beta">
<a href="{BASE}"><span aria-hidden="true">⌂</span><span>Home</span></a>
<a href="{BASE}explore/"><span aria-hidden="true">⌕</span><span>Explore</span></a>
<a href="{BASE}library/"><span aria-hidden="true">▤</span><span>Library</span></a>
<a href="{BASE}saved/"><span aria-hidden="true">☆</span><span>Saved</span></a>
<a href="{BASE}journal/"><span aria-hidden="true">✎</span><span>Journal</span></a>
<a href="{BASE}#tools"><span aria-hidden="true">⚒</span><span>Tools</span></a>
<a href="{BASE}author-review/"><span aria-hidden="true">✓</span><span>Author review</span></a>
<a href="{BASE}feedback/"><span aria-hidden="true">✉</span><span>Feedback</span></a>
<a href="/"><span aria-hidden="true">↗</span><span>Full site</span></a></nav>
<div class="srb-rail-foot"><a class="srb-cta" href="{BASE}p/mjb-p000001/">Open first story</a>
<p class="srb-fine">Existing site URLs unchanged. This route is labelled beta.</p></div></aside>
<div class="srb-stage"><header class="srb-top" id="srb-top">
<button type="button" class="srb-icon-btn srb-menu-btn" id="srb-menu-btn" aria-expanded="false" aria-controls="srb-drawer">Menu</button>
<p class="srb-top-title">Social reading beta</p>
<button type="button" class="srb-icon-btn" id="srb-prefs-btn" aria-expanded="false" aria-controls="srb-prefs">Aa</button></header>
<main id="main-content" class="srb-main">{body}</main></div>
<aside class="srb-right" aria-label="Context"><form class="srb-search" role="search" action="{BASE}explore/" method="get">
<label class="srb-visually-hidden" for="srb-q">Search topics</label>
<input id="srb-q" name="q" type="search" placeholder="Search topics or #tags" autocomplete="off"></form>
<section class="srb-card"><h2>Topics</h2><ul class="srb-topics"><li><a href="{BASE}explore/?topic=intro">#intro</a></li><li><a href="{BASE}explore/?topic=evidence-method">#evidence</a></li></ul></section>
<section class="srb-card"><h2>Need help now?</h2><p>This beta is not a crisis service.</p><p><a href="/contact/">Contact MJB</a></p></section></aside></div>
<nav class="srb-dock" aria-label="Mobile">
<button type="button" class="srb-dock-menu" id="srb-dock-menu" aria-expanded="false" aria-controls="srb-drawer">Menu</button>
<a href="{BASE}explore/">Explore</a>
<a class="srb-dock-home" href="{BASE}">Home</a>
<a href="{BASE}saved/">Saved</a>
<a href="{BASE}journal/">Journal</a>
</nav>
<dialog class="srb-drawer" id="srb-drawer" aria-label="Navigation drawer"><form method="dialog"><button type="submit" class="srb-icon-btn">Close</button></form>
<nav aria-label="Drawer"><a href="{BASE}">Home</a><a href="{BASE}explore/">Explore</a><a href="{BASE}library/">Library (all existing pages)</a><a href="{BASE}saved/">Saved</a><a href="{BASE}journal/">Journal</a><a href="{BASE}#tools">Tools</a><a href="{BASE}author-review/">Author review</a><a href="{BASE}packs/">Reading packs</a><a href="/posts-preview/">Earlier visual posts preview</a><a href="/questionnaire-demo/">Questionnaire demo (PR7 separate)</a><a href="/">Full MJB site</a></nav></dialog>
{PREFS}
<script src="{BASE}js/prefs.js" defer></script>
<script src="{BASE}js/chrome.js" defer></script>
<script src="{BASE}js/story.js" defer></script>
<script src="{BASE}js/favourites.js" defer></script>
<script src="{BASE}js/packs.js" defer></script>
<script src="{BASE}js/journal.js" defer></script>
</body></html>"""


def evidence_html(data, claim_ids):
    claims = claim_map(data); sources = source_map(data); parts = []
    for cid in claim_ids or []:
        c = claims.get(cid)
        if not c: continue
        src_bits = []
        for sid in c.get("sourceRefs") or []:
            s = sources.get(sid)
            if not s: continue
            src_bits.append(
                "<p><a class=\"source-title\" href=\"%s\">%s</a><br>%s · %s<br><span>Locator: %s</span></p>"
                % (esc(s.get("url")), esc(s.get("fullTitle")), esc(s.get("authorsOrIssuer")), esc(s.get("date")), esc(s.get("verifiedLocator") or ""))
            )
        wording = esc(c.get("wording") or "")
        parts.append(
            "<details class=\"srb-evidence\"><summary><span class=\"srb-plus\" aria-hidden=\"true\">+</span> "
            "<span class=\"srb-evidence-label\">Evidence for: <span class=\"srb-evidence-claim\">%s</span></span></summary>"
            "<div class=\"srb-evidence-body\"><p><strong>Claim.</strong> %s</p>"
            "<p><strong>What this supports.</strong> %s</p>"
            "<p><strong>Limitations.</strong> %s</p><p><strong>Classification.</strong> %s · review %s</p>%s</div></details>"
            % (wording, wording, esc(c.get("supportSummary")), esc(c.get("limitations")), esc(c.get("category")), esc(c.get("reviewStatus")), "".join(src_bits) or "<p>No linked source metadata.</p>")
        )
    return "".join(parts)


def feed_card(p):
    img = p.get("image") or {}; first = p["slides"][0]; qual = first.get("qualification")
    qhtml = ("<p class=\"srb-qual\">%s</p>" % esc(qual)) if qual else ""
    art = p["article"]["url"]
    return (
        "<article class=\"srb-post\" data-post-id=\"%s\" id=\"post-%s\"><header class=\"srb-post-head\">"
        "<span class=\"srb-avatar\" aria-hidden=\"true\">M</span><div>"
        "<p class=\"srb-meta\"><strong>MJB ADHD</strong> <span class=\"srb-chip\">Article excerpt · inherited review</span></p>"
        "<h2 class=\"srb-post-title\"><a href=\"%s\">%s</a></h2></div></header>"
        "<p>%s</p>%s<a class=\"srb-deck-preview\" href=\"%s\">"
        "<img src=\"%s\" alt=\"%s\" width=\"%s\" height=\"%s\" loading=\"lazy\">"
        "<span>%d explanation steps · open reader</span></a><div class=\"srb-actions\">"
        "<a href=\"%s\">Open</a>"
        "<button type=\"button\" class=\"srb-btn srb-expand\" data-expand-post=\"%s\" data-expand-href=\"%s\" aria-expanded=\"false\">Expand reader</button>"
        "<a href=\"%s?post-return=%s&from=social-reading-beta\">Article · %s</a>"
        "<button type=\"button\" data-fav=\"%s\" data-fav-title=\"%s\" aria-pressed=\"false\">☆ Save</button>"
        "<button type=\"button\" data-share-post=\"%s\" data-share-title=\"%s\">Share</button></div></article>"
    ) % (
        esc(p["id"]), esc(p["id"].lower()), post_url(p), esc(p["title"]), esc(p.get("hook") or first["body"]), qhtml, post_url(p),
        esc(img.get("src")), esc(img.get("alt")), img.get("width", 784), img.get("height", 500), len(p["slides"]), post_url(p),
        esc(p["id"]), post_url(p),
        esc(art), esc(p["id"]), esc(p["article"]["label"]),
        esc(p["id"]), esc(p["title"]), esc(p["id"]), esc(p["title"])
    )

def visual_attrs(data, vref):
    v = {x["id"]: x for x in data.get("visuals") or []}.get(vref)
    if not v:
        return ""
    return ' data-visual-src="%s" data-visual-alt="%s" data-visual-caption="%s" data-visual-w="%s" data-visual-h="%s"' % (
        esc(v["src"]), esc(v["alt"]), esc(v.get("caption") or ""), int(v.get("width") or 0), int(v.get("height") or 0))


def body_html(s):
    blocks = [b for b in (s.get("blocks") or []) if not b.get("qualification")]
    if not blocks:
        return "<p class=\"srb-slide-body\">%s</p>" % esc(s.get("body"))
    return "".join("<p class=\"srb-slide-body\" data-block-id=\"%s\">%s</p>" % (esc(b["id"]), esc(b["text"])) for b in blocks)


def passage_link(p, s):
    loc = s.get("sourceLocator") or ""
    if not loc:
        return ""
    url = loc.split(" ")[0]
    path, _, frag = url.partition("#")
    href = "/social-reading-beta/read/?r=%s&amp;post-return=%s%s" % (route_id(path), esc(p["id"]), ("#" + esc(frag)) if frag else "")
    return ("<p class=\"srb-passage\">Quoted from <a data-source-passage href=\"%s\" data-original-href=\"%s\">%s</a> "
            "<span class=\"srb-fine\">· locator %s</span></p>") % (href, esc(url), esc(p["article"]["label"]), esc(loc))


def story_page(data, p, index, posts):
    img = p.get("image") or {}
    slide_blocks = []; thread_blocks = []
    for i, s in enumerate(p["slides"]):
        q = s.get("qualification")
        evid = evidence_html(data, s.get("evidenceRefs") or s.get("claim_refs"))
        vref = (s.get("visualRefs") or [""])[0] or ""
        qhtml = ("<p class=\"srb-qual\" role=\"note\">%s</p>" % esc(q)) if q else ""
        slide_blocks.append(
            "<section class=\"srb-slide\" id=\"%s\" data-slide-id=\"%s\" data-slide-index=\"%d\" data-visual-ref=\"%s\"%s hidden>"
            "<p class=\"srb-kicker\">%s · Explanation %d of %d</p>"
            "<h2 class=\"srb-slide-heading\" tabindex=\"-1\">%s</h2>"
            "%s%s%s%s</section>"
            % (esc(s["id"]), esc(s["id"]), i+1, esc(vref), visual_attrs(data, vref), esc((s.get("role") or "").replace("_"," ")), i+1, len(p["slides"]),
               esc(s["heading"]), body_html(s), qhtml, passage_link(p, s), evid)
        )
        op = " open" if i == 0 else ""
        thread_blocks.append(
            "<details class=\"srb-thread-block\"%s><summary>%s</summary>%s%s%s%s</details>"
            % (op, esc(s["heading"]), body_html(s), qhtml, passage_link(p, s), evid)
        )
    dots = "".join(
        "<button type=\"button\" class=\"srb-dot\" data-go-slide=\"%s\" aria-label=\"Explanation %d\"></button>" % (esc(s["id"]), i+1)
        for i, s in enumerate(p["slides"])
    )
    prev_p = posts[index-1] if index else None
    next_p = posts[index+1] if index < len(posts)-1 else None
    prev_link = ("<a rel=\"prev\" href=\"%s\">Previous post</a>" % post_url(prev_p)) if prev_p else "<span>Beginning</span>"
    next_link = ("<a rel=\"next\" href=\"%s\">Next post</a>" % post_url(next_p)) if next_p else ("<a href=\"%s\">Finish · feed</a>" % BASE)
    return """
<p class="srb-beta-banner" role="status">Public beta · DS-style split reader · text quoted from the linked MJB article · unresolved-rights rasters excluded.</p>
<p class="srb-print-meta">MJB ADHD · %s · revision %s · %s · %s</p>
<article class="srb-story" data-post-id="%s" data-post-region tabindex="0" aria-label="Story reading region">
<div class="srb-reader" data-layout="split">
<div class="srb-reader-head">
<a class="srb-btn" data-back-feed href="%s">Back to feed</a>
<h1 id="post-title" tabindex="-1">%s</h1>
<p class="srb-status" data-slide-status role="status" aria-live="polite">Explanation 1 of %d</p>
<details class="srb-seam-options"><summary>Layout options</summary>
<div class="srb-actions">
<button type="button" class="srb-btn" data-split-preset="30">30/70</button>
<button type="button" class="srb-btn" data-split-preset="50">50/50</button>
<button type="button" class="srb-btn" data-split-preset="70">70/30</button>
<button type="button" class="srb-btn" data-split-preset="split">Split</button>
<button type="button" class="srb-btn" data-split-preset="continuous">Continuous</button>
<button type="button" class="srb-btn" data-split-preset="thread">Thread</button>
<button type="button" class="srb-btn" data-split-preset="deck" title="One card per step; no split seam">Deck</button>
</div>
<p class="srb-fine">Drag the seam or use arrow keys when it is focused. No permanent ratio toolbar.</p>
</details>
<details class="srb-help"><summary>How this reader works</summary>
<ul class="srb-fine">
<li>Each post is a finite story taken from one MJB article. Reading one step is a complete visit; nothing moves on by itself.</li>
<li>Previous and Next always work. Swipe and visual auto-cycling stay off unless you turn them on.</li>
<li>The ➕ under a step shows what the cited source supports, its limits and the passage it comes from.</li>
<li>“Quoted from” opens the exact article section the step is taken from. Saved items and your place stay on this device.</li>
</ul></details>
</div>
<section class="srb-upper" data-pin-visual data-pinned-id="%s" aria-label="Pinned context">
<p class="srb-pin-title" data-pin-title>%s</p>
<div class="srb-visual"><img src="%s" alt="%s" width="%s" height="%s" data-visual-slot></div>
<p data-pin-caption class="srb-fine">%s</p>
<div class="srb-actions srb-visual-controls" data-visual-controls>
<button type="button" class="srb-btn" data-visual-prev>Previous image</button>
<button type="button" class="srb-btn" data-visual-next>Next image</button>
<button type="button" class="srb-btn srb-btn-accent" data-visual-cycle-toggle aria-pressed="false">Play visuals</button>
<button type="button" class="srb-btn" data-resume-linked hidden>Resume linked visuals</button>
</div>
<p class="srb-fine" data-visual-status role="status" aria-live="polite">Image 1 of 1 · %s · auto-cycle off</p>
</section>
<div class="srb-divider" data-split-divider role="separator" aria-orientation="horizontal" aria-valuemin="25" aria-valuemax="75" aria-valuenow="42" aria-label="Split ratio" tabindex="0">
<span class="srb-fine">Drag or use arrow keys · presets above</span>
</div>
<section class="srb-lower" aria-label="Explanation">
<div class="srb-slides">%s</div>
<div class="srb-thread" data-thread>%s</div>
<nav class="srb-story-nav" aria-label="Explanation steps">
<button type="button" class="srb-btn" data-slide-prev>Previous</button>
<span class="srb-dots">%s</span>
<button type="button" class="srb-btn" data-slide-next>Next</button>
</nav>
<div class="srb-story-tools">
<button type="button" class="srb-btn" data-share-slide>Share this step</button>
<button type="button" class="srb-btn" data-copy-slide-link>Copy step link</button>
<button type="button" class="srb-btn" data-fav="%s" data-fav-title="%s" aria-pressed="false">☆ Save</button>
<button type="button" class="srb-btn" data-print-deck>Print / Save as PDF</button>
<button type="button" class="srb-btn srb-btn-accent" data-download-pack="%s">Request reading pack</button>
</div>
<p class="srb-download-status" data-download-status role="status" aria-live="polite"></p>
<p data-fav-status role="status" aria-live="polite"></p>
<section data-story-end hidden tabindex="-1" class="srb-card">
<h2>End of this story</h2>
<p>No automatic next post.</p>
<p>%s · <a href="%s">Back to feed</a></p>
</section>
<p class="srb-story-links">
<a data-article data-original-href="%s" href="/social-reading-beta/read/?r=%s&amp;post-return=%s">Read full article: %s</a>
· <a data-evidence href="/social-reading-beta/read/?r=%s&amp;post-return=%s#post-sources">Article sources</a> · <a data-article-original href="%s">Original page</a>
</p>
<nav class="srb-sequence" aria-label="Post sequence">%s · %s</nav>
</section></div></article>
<section id="tools" class="srb-card"><h2>Tools</h2>
<ul><li><a href="%spacks/">Reading packs</a></li><li><a href="%sauthor-review/">Author review sheet</a></li></ul>
</section>
""" % (
        esc(p["title"]), esc(data["content_revision"]), esc(data["generated_at"]), esc(post_url(p)),
        esc(p["id"]), BASE, esc(p["title"]), len(p["slides"]), esc(img.get("asset_id") or ""), esc(p["title"]),
        esc(img.get("src")), esc(img.get("alt")), img.get("width", 784), img.get("height", 500), esc(img.get("caption") or img.get("alt")), esc(img.get("asset_id") or "visual"),
        "".join(slide_blocks), "".join(thread_blocks), dots,
        esc(p["id"]), esc(p["title"]), esc(p["id"]),
        next_link, BASE,
        esc(p["article"]["url"]), route_id(p["article"]["url"]), esc(p["id"]), esc(p["article"]["label"]),
        route_id(p["article"]["url"]), esc(p["id"]), esc(p["article"]["url"]),
        prev_link, next_link, BASE, BASE
    )


def phone_story(markup):
    """One primary step bar; secondary tools share a disclosure, with unchanged bank content."""
    nav = re.search(r'<nav class="srb-story-nav".*?</nav>', markup, re.S).group()
    dots = re.search(r'<span class="srb-dots">.*?</span>', nav, re.S).group()
    nav = nav.replace(dots, '<span data-step-count>1 of 4</span>')
    markup = re.sub(r'<nav class="srb-story-nav".*?</nav>', '', markup, flags=re.S)
    markup = re.sub(r'(<article class="srb-story"[^>]*>)', lambda m: m.group(1) + nav, markup, count=1)
    controls = re.search(r'<div class="srb-actions srb-visual-controls".*?</div>', markup, re.S).group()
    markup = markup.replace(controls, '')
    markup = markup.replace('<summary>Layout options</summary>', '<summary>Reader options</summary>')
    markup = markup.replace('</details>\n<details class="srb-help">', dots + controls + '<details class="srb-help">', 1)
    markup = markup.replace('</ul></details>\n</div>', '</ul></details></details>\n</div>', 1)
    markup = markup.replace('Previous and Next always work. Swipe and visual auto-cycling stay off unless you turn them on.', 'Use Previous and Next to change steps. Visual auto-cycling is optional and off by default.')
    markup = markup.replace('Drag or use arrow keys · presets above', 'Drag or use arrow keys · tap for Reader options')
    markup = markup.replace('<div class="srb-visual"><img ', '<div class="srb-visual"><button type="button" class="srb-enlarge" data-enlarge-visual aria-label="Enlarge image"><img ')
    markup = markup.replace(' data-visual-slot></div>', ' data-visual-slot><span class="srb-enlarge-label">Enlarge image</span></button></div>')
    markup += '<dialog class="srb-image-viewer" data-image-viewer aria-label="Enlarged image"><form method="dialog"><button class="srb-btn">Close image</button></form><div class="srb-actions"><button type="button" class="srb-btn" data-viewer-zoom="out">Zoom out</button><button type="button" class="srb-btn" data-viewer-zoom="in">Zoom in</button><button type="button" class="srb-btn" data-viewer-zoom="reset">Fit image</button></div><p data-viewer-caption></p><div class="srb-image-pan" tabindex="0" aria-label="Image scroll area"><img data-viewer-image alt=""></div></dialog>'
    markup = re.sub(r'<p class="srb-beta-banner"[^>]*>.*?</p>', '<p class="srb-beta-banner">Public beta · article excerpts</p>', markup, count=1, flags=re.S)
    return markup

def pack_html(data, p):
    revision = data["content_revision"]; date = data["generated_at"]; img = p.get("image") or {}
    slides = []
    for s in p["slides"]:
        q = ("<p><em>%s</em></p>" % esc(s.get("qualification"))) if s.get("qualification") else ""
        slides.append("<section id='%s'><h2>%s</h2>%s%s<p><small>Source passage: %s</small></p></section>" % (esc(s["id"]), esc(s["heading"]), body_html(s), q, esc(s.get("sourceLocator") or "")))
    return (
        "<!doctype html><html lang=\"en-GB\"><head><meta charset=\"utf-8\">"
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
        "<meta name=\"mjb-content-revision\" content=\"%s\">"
        "<meta name=\"mjb-content-date\" content=\"%s\">"
        "<title>%s - MJB reading pack</title>"
        "<style>body{font-family:system-ui,sans-serif;margin:1rem;line-height:1.5;max-width:40rem}img{max-width:100%%}</style></head><body>"
        "<header><p>MJB ADHD reading pack · content revision <strong>%s</strong> · date <strong>%s</strong></p>"
        "<h1>%s</h1><p>Post ID %s · quoted from the published article · public beta</p></header>"
        "<figure><img src=\"%s\" alt=\"%s\" width=\"%s\" height=\"%s\">"
        "<figcaption>%s · %s · %s</figcaption></figure>%s"
        "<footer><p>Article: <a href=\"%s\">%s</a> (requires connectivity)</p>"
        "<p>External papers need the internet unless separately saved.</p></footer></body></html>"
    ) % (
        esc(revision), esc(date), esc(p["title"]), esc(revision), esc(date), esc(p["title"]), esc(p["id"]),
        esc(img.get("src")), esc(img.get("alt")), img.get("width", 784), img.get("height", 500), esc(img.get("caption") or img.get("alt")), esc(img.get("asset_id")), esc(img.get("rights")), "".join(slides),
        esc(p["article"]["url"]), esc(p["article"]["label"])
    )

def author_review_page(data):
    rows = []
    for p in data["posts"]:
        for s in p["slides"]:
            refs = ", ".join(s.get("evidenceRefs") or s.get("claim_refs") or [])
            rows.append(
                "<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td>"
                "<td><button type=\"button\" class=\"srb-btn\" data-copy-ref=\"%s/%s\">Copy review reference</button></td></tr>"
                % (esc(p["id"]), esc(s["id"]), esc(p["title"]), esc(s["heading"]), esc(s.get("body")), esc(s.get("qualification") or ""), esc(refs), esc(p["id"]), esc(s["id"]))
            )
    return """
<p class="srb-beta-banner">Author review mode - publication-safe editorial copy only - imports are proposals only.</p>
<p class="srb-fine">Content revision %s</p>
<p><button type="button" class="srb-btn srb-btn-accent" id="srb-export-review">Export review sheet (CSV)</button>
<a class="srb-btn" href="%sauthor-review/review-sheet-template.csv">Download empty template</a></p>
<div class="srb-card" style="overflow:auto"><table>
<thead><tr><th>Post ID</th><th>Slide ID</th><th>Title</th><th>Heading</th><th>Visible wording</th><th>Qualification</th><th>Evidence refs</th><th>Action</th></tr></thead>
<tbody>%s</tbody></table></div>
<form class="srb-feedback srb-card"><h2>Import structured feedback (proposal only)</h2>
<p>CSV columns: post_id,slide_id,decision,dictated_wording,intended_meaning,evidence_needed,visual_change,priority,reviewer,date</p>
<input type="file" id="srb-review-file" accept=".csv,text/csv">
<p id="srb-review-import-status" role="status" aria-live="polite"></p></form>
<script>
document.getElementById("srb-export-review")?.addEventListener("click",function(){
  var rows=[["post_id","slide_id","decision","dictated_wording","intended_meaning","evidence_needed","visual_change","priority","reviewer","date"]];
  document.querySelectorAll("tbody tr").forEach(function(tr){var t=tr.querySelectorAll("td");rows.push([t[0].textContent,t[1].textContent,"keep","","","","","","",""]);});
  var csv=rows.map(function(r){return r.map(function(c){return '"' + String(c).replace(/"/g,'""') + '"';}).join(",");}).join("\\n");
  var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="mjb-author-review-sheet.csv";a.click();
});
document.querySelectorAll("[data-copy-ref]").forEach(function(btn){btn.addEventListener("click",function(){navigator.clipboard?.writeText(btn.getAttribute("data-copy-ref"));});});
document.getElementById("srb-review-file")?.addEventListener("change",function(){
  var f=this.files&&this.files[0]; if(!f) return;
  if(f.size>200000){document.getElementById("srb-review-import-status").textContent="File too large";return;}
  var r=new FileReader();
  r.onload=function(){try{localStorage.setItem("mjb-srb-review-proposals",JSON.stringify({schema:"mjb-review-proposals-v1",importedAt:new Date().toISOString(),csv:String(r.result).slice(0,150000)}));document.getElementById("srb-review-import-status").textContent="Stored locally as proposals only - not applied to published text.";}catch(e){document.getElementById("srb-review-import-status").textContent="Could not store proposals";}};
  r.readAsText(f);
});
</script>
""" % (esc(data["content_revision"]), BASE, "".join(rows))

def main():
    data = load_bank()
    revision = data["content_revision"]; date = data["generated_at"]; posts = data["posts"]; outputs = {}
    feed = (
        "<p class=\"srb-beta-banner\" role=\"status\">Public beta · article excerpts</p>"
        "<div class=\"srb-tabs\" role=\"tablist\" aria-label=\"Home\">"
        "<button type=\"button\" role=\"tab\" aria-selected=\"true\">For you</button>"
        "<button type=\"button\" role=\"tab\" aria-selected=\"false\" disabled title=\"Excluded until evidence review\">Science (excluded)</button>"
        "<button type=\"button\" role=\"tab\" aria-selected=\"false\">Help</button></div>"
        "<section class=\"srb-feed\" aria-label=\"Feed\">%s<p class=\"srb-caught-up\">You are all caught up. Finite editorial batch - no infinite scroll.</p></section>"
        "<section id=\"tools\" class=\"srb-card\"><h2>Tools</h2><ul>"
        "<li><a href=\"%spacks/\">Download reading packs</a></li>"
        "<li><a href=\"%sauthor-review/\">Author review walkthrough</a></li>"
        "<li><a href=\"%sfeedback/\">Feedback stub (stays on device)</a></li>"
        "<li><a href=\"/questionnaire-demo/\">Questionnaire demo</a> - separate PR, not merged here</li></ul>"
        "<p><button type=\"button\" class=\"srb-btn\" id=\"srb-export-local\">Export favourites/progress</button>"
        "<label class=\"srb-btn\">Import local data<input type=\"file\" id=\"srb-import-local\" accept=\"application/json,.json\" hidden></label></p></section>"
    ) % ("".join(feed_card(p) for p in posts), BASE, BASE, BASE)
    outputs[SITE/"social-reading-beta/index.html"] = shell("Home", '<h1 class="srb-visually-hidden">MJB reading feed</h1>' + feed, revision, date, 'data-page="home"')
    journal_body = """
<p class="srb-beta-banner" role="status">Local journal · optional · stays in this browser · not clinical care.</p>
<section class="srb-card" data-journal-page>
<h1 data-journal-title>Your no-obligation journal</h1>
<p class="srb-journal-intro">Dates and times are added automatically. Write as much or as little as you want. Change the title and colours whenever you like.</p>
<p class="srb-fine" data-journal-storage></p>
<details class="srb-journal-help"><summary>How dates, storage and privacy work</summary>
<p>Each entry records when you first saved it and your device time zone automatically. Editing keeps that original date and adds a separate edited date. You never have to fill anything in.</p>
<p>Entries are kept only in this browser's local storage. That storage is not encrypted, is not synced, and can be removed by browser cleanup or private browsing. This page never sends journal text to MJB, analytics, AI services, logs or cloud accounts. Files only leave the browser when you choose Download, Copy, Share or Print.</p></details>
<div class="srb-journal-section" role="group" aria-labelledby="jn-name-h"><h2 id="jn-name-h" class="srb-h3">Optional name</h2>
<p class="srb-fine">Adds your name to the title. Skip keeps the default. No account; stored only here.</p>
<div class="srb-actions">
<label>Name <input type="text" data-journal-name-input maxlength="40" autocomplete="off"></label>
<button type="button" class="srb-btn" data-journal-name-save>Save name</button>
<button type="button" class="srb-btn" data-journal-name-skip>Skip</button>
<button type="button" class="srb-btn" data-journal-name-reset>Reset name</button>
</div></div>
<div class="srb-journal-section" role="group" aria-labelledby="jn-write-h"><h2 id="jn-write-h" class="srb-h3">Write</h2>
<p class="srb-fine" data-journal-editing aria-live="polite"></p>
<label class="field">Heading <input class="input" data-journal-heading maxlength="200"></label>
<label class="field">Text <textarea class="input" data-journal-body rows="6" maxlength="20000"></textarea></label>
<div class="srb-actions">
<button type="button" class="srb-btn srb-btn-accent" data-journal-save>Save entry locally</button>
<button type="button" class="srb-btn" data-journal-cancel-edit hidden>Cancel edit</button>
<button type="button" class="srb-btn" data-journal-undo>Undo last change</button>
</div></div>
<div class="srb-journal-section" role="group" aria-labelledby="jn-out-h"><h2 id="jn-out-h" class="srb-h3">Keep a copy</h2>
<p class="srb-fine">Copy, Share, Markdown and Print use the selected entries, or all entries when none are selected.</p>
<label class="field">Title for print and Markdown <input class="input" data-journal-print-title maxlength="120"></label>
<div class="srb-actions">
<button type="button" class="srb-btn" data-journal-copy-selected>Copy</button>
<button type="button" class="srb-btn" data-journal-share-selected>Share…</button>
<button type="button" class="srb-btn" data-journal-export-md>Download Markdown</button>
<button type="button" class="srb-btn" data-journal-export-json>Download JSON backup (all)</button>
<button type="button" class="srb-btn" data-journal-print>Print / Save as PDF (themed)</button>
<button type="button" class="srb-btn" data-journal-print-plain>Print / Save as PDF (ink-friendly)</button>
</div>
<div class="srb-actions">
<label>Restore mode <select data-journal-restore-mode><option value="merge">Merge (keeps existing; original dates kept)</option><option value="replace">Replace all entries here</option></select></label>
<label>Restore JSON backup <input type="file" data-journal-restore-file accept="application/json,.json"></label>
</div></div>
<div class="srb-journal-recovery" data-journal-recovery hidden role="alert">
<p>Stored journal data is unreadable. Saving is paused so nothing is overwritten.</p>
<button type="button" class="srb-btn" data-journal-recovery-download>Download raw data</button>
<button type="button" class="srb-btn" data-journal-recovery-clear>Clear unreadable data</button></div>
<p class="srb-fine" data-journal-status role="status" aria-live="polite"></p>
<h2 class="srb-h3">Entries</h2>
<ul class="srb-journal-list" data-journal-list></ul>
</section>
<dialog class="srb-ics" data-journal-ics aria-labelledby="ics-h"><form method="dialog">
<h2 id="ics-h">Calendar file (.ics)</h2>
<p class="srb-fine">Creates a file your calendar app can import. It is not an alarm; reminders depend on your calendar app.</p>
<label class="field">Title <input class="input" data-ics-title maxlength="200"></label>
<label class="field">Date <input class="input" type="date" data-ics-date></label>
<label class="field">Time <input class="input" type="time" data-ics-time></label>
<label class="field">Time zone (IANA, e.g. Europe/London) <input class="input" data-ics-tz maxlength="64"></label>
<label class="field">Duration (minutes) <input class="input" type="number" min="5" max="1440" data-ics-duration></label>
<p class="srb-warn" data-ics-error aria-live="polite"></p>
<div class="srb-actions"><button type="button" class="srb-btn srb-btn-accent" data-ics-download>Download .ics</button><button type="submit" class="srb-btn">Cancel</button></div>
</form></dialog>
<div class="jp-doc" data-journal-print-doc></div>
"""
    outputs[SITE/"social-reading-beta/journal/index.html"] = shell("Journal", journal_body, revision, date, 'data-page="journal"')

    for i, p in enumerate(posts):
        outputs[SITE/("social-reading-beta/p/%s/index.html" % p["id"].lower())] = shell(p["title"], phone_story(story_page(data, p, i, posts)), revision, date, 'data-page="story"')
        outputs[SITE/("social-reading-beta/packs/%s.html" % p["id"].lower())] = pack_html(data, p)
    explore = "<p class=\"srb-beta-banner\">Explore topics and hashtag aliases.</p><form class=\"srb-search\" action=\"%sexplore/\" method=\"get\"><label for=\"q2\">Search</label><input id=\"q2\" name=\"q\" type=\"search\"><button class=\"srb-btn\" type=\"submit\">Search</button></form><ul class=\"srb-shelf\">%s</ul>" % (
        BASE, "".join("<li><a href=\"%s\">%s</a><p>%s</p></li>" % (post_url(p), esc(p["title"]), esc(", ".join(p.get("hashtag_aliases") or []))) for p in posts)
    )
    outputs[SITE/"social-reading-beta/explore/index.html"] = shell("Explore", explore, revision, date, 'data-page="explore"')
    outputs[SITE/"social-reading-beta/saved/index.html"] = shell("Saved", "<p class=\"srb-beta-banner\">Favourites stay on this device. Favourite is not downloaded.</p><ul id=\"srb-saved-list\" class=\"srb-shelf\"><li>Nothing saved yet.</li></ul><p><button type=\"button\" class=\"srb-btn\" id=\"srb-export-local\">Export favourites/progress</button><label class=\"srb-btn\">Import<input type=\"file\" id=\"srb-import-local\" accept=\"application/json,.json\" hidden></label></p>", revision, date, 'data-page="saved"')
    packs_idx = "<p class=\"srb-beta-banner\">Each pack includes mobile viewport meta plus content revision and date. Status starts with <strong>download requested</strong>.</p><ul class=\"srb-shelf\">%s</ul><p class=\"srb-download-status\" data-download-status role=\"status\" aria-live=\"polite\"></p>" % "".join(
        "<li><button type=\"button\" class=\"srb-btn srb-btn-accent\" data-download-pack=\"%s\">Request pack · %s</button> <a href=\"%spacks/%s.html\">Open pack page</a><p class=\"srb-fine\">Revision %s · date %s</p></li>" % (esc(p["id"]), esc(p["title"]), BASE, p["id"].lower(), esc(revision), esc(date)) for p in posts
    )
    outputs[SITE/"social-reading-beta/packs/index.html"] = shell("Reading packs", packs_idx, revision, date, 'data-page="packs"')
    outputs[SITE/"social-reading-beta/feedback/index.html"] = shell("Feedback", "<p class=\"srb-beta-banner\">Feedback stub - entries stay on this device. Nothing is sent.</p><form class=\"srb-feedback\" id=\"srb-feedback\"><label>Was the first step useful?<select name=\"useful\" required><option value=\"\">Choose</option><option>Yes</option><option>Partly</option><option>No</option></select></label><label>What should improve?<textarea name=\"notes\" rows=\"4\" maxlength=\"500\" placeholder=\"No personal or medical details please\"></textarea></label><label><input type=\"checkbox\" name=\"consent\" required> I understand this stays on my device.</label><button type=\"submit\" class=\"srb-btn\">Save locally</button><button type=\"button\" class=\"srb-btn\" id=\"fb-copy\">Copy local entry</button><p id=\"fb-status\" role=\"status\" aria-live=\"polite\"></p></form><script src=\"/social-reading-beta/js/feedback.js\" defer></script>", revision, date, 'data-page="feedback"')
    outputs[SITE/"social-reading-beta/author-review/index.html"] = shell("Author review", author_review_page(data), revision, date, 'data-page="author-review"')
    outputs[SITE/"social-reading-beta/author-review/review-sheet-template.csv"] = "post_id,slide_id,decision,dictated_wording,intended_meaning,evidence_needed,visual_change,priority,reviewer,date\n"
    catalog = {"schema_version": data["schema_version"], "content_revision": revision, "generated_at": date, "posts": [{"id": p["id"], "title": p["title"], "url": post_url(p), "slides": [{"id": s["id"], "url": slide_url(p, s)} for s in p["slides"]]} for p in posts]}
    outputs[SITE/"social-reading-beta/catalog.json"] = json.dumps(catalog, indent=2) + "\n"
    cap = ROOT / "content/posts/captions"; cap.mkdir(parents=True, exist_ok=True)
    for p in posts:
        sc = p.get("social_captions") or {}
        outputs[cap / ("%s.md" % p["id"].lower())] = "# Captions - %s - %s\ncontent_revision: %s\n\n## X\n%s\n\n## Instagram\n%s\n\n## Facebook\n%s\n" % (p["id"], p["title"], revision, sc.get("x",""), sc.get("instagram",""), sc.get("facebook",""))
    check = "--check" in sys.argv; changed = []
    for path, content in outputs.items():
        rel = str(path.relative_to(ROOT))
        if not path.exists() or path.read_text(encoding="utf-8") != content:
            changed.append(rel)
            if not check:
                path.parent.mkdir(parents=True, exist_ok=True); path.write_text(content, encoding="utf-8")
    if check and changed:
        print("Stale social-reading-beta files:", changed); sys.exit(1)
    print(("%s · revision %s · %d posts · %d slides" % ("Social reading beta current" if check else "Built social reading beta", revision, len(posts), sum(len(p["slides"]) for p in posts))))

if __name__ == "__main__":
    main()
