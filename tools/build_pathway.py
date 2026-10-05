#!/usr/bin/env python3
"""Build /science/pathway/ and its claim-to-source register from content/pathway/model.json.

The page carries every explanation as plain HTML (works without JavaScript);
js/pathway.js reads the same model from an inline JSON block and draws the
interactive map. Run tools/build_library.py afterwards to restore the library block.

Usage (from the project root):  python3 tools/build_pathway.py
"""
import csv
import html
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "content" / "pathway" / "model.json"
OUT = ROOT / "site" / "science" / "pathway" / "index.html"
CSV = ROOT / "content" / "pathway" / "source-to-edge.csv"
BASE = "https://mjb-adhd.org.uk"
E = lambda s: html.escape(s or "", quote=True)

KIND = {"process": "Step", "support": "Support (cofactor or energy)", "feedback": "Feedback", "branch": "Related pathway (context)"}
STYLE = {"step": "solid arrow", "support": "dotted line", "feedback": "dashed line", "branch": "thin line"}


def main():
    m = json.loads(SRC.read_text())
    nodes = {n["id"]: n for n in m["nodes"]}
    order = [s for n in m["nodes"] for s in [x["source"] for x in n["refs"]]] + \
            [x["source"] for e in m["edges"] for x in e["refs"]]
    num = {}
    for s in order:
        num.setdefault(s, len(num) + 1)

    def cites(refs):
        seen, out = set(), []
        for r in refs:
            if r["source"] in seen:
                continue
            seen.add(r["source"])
            n = num[r["source"]]
            out.append(f'<a href="#src-{n}">[{n}]</a>' + (f' {E(r["loc"])}' if r["loc"] else ""))
        return "; ".join(out)

    def tier(t):
        return f'<span class="tier tier-{t.lower()}">Tier {t}</span>' if t else ""

    arts = []
    for lane in m["lanes"]:
        items = [n for n in m["nodes"] if n["lane"] == lane["id"]]
        lis = []
        for n in items:
            out_e = [e for e in m["edges"] if e["from"] == n["id"]]
            in_e = [e for e in m["edges"] if e["to"] == n["id"]]
            conn = "".join(f'<li>→ <a href="#n-{e["to"]}" data-node="{e["to"]}">{E(nodes[e["to"]]["title"])}</a>: {E(e["explain"])}'
                           f' <span class="px-style">({STYLE[e["style"]]})</span></li>' for e in out_e)
            conn += "".join(f'<li>← <a href="#n-{e["from"]}" data-node="{e["from"]}">{E(nodes[e["from"]]["title"])}</a>: {E(e["explain"])}'
                            f' <span class="px-style">({STYLE[e["style"]]})</span></li>' for e in in_e)
            rows = [("What happens", E(n["what"]) + " " + tier(n["tier"]))]
            if n["needs"]:
                rows.append(("Needs", E(n["needs"])))
            rows.append(("Connections", f"<ul>{conn}</ul>"))
            rows.append(("ADHD research", E(n["adhd"]["text"]) + (" " + tier(n["adhd"]["tier"]) if n["adhd"]["tier"] else "")))
            if n["medicines"]:
                rows.append(("Medicines that act here", E(n["medicines"]) + " <em>For understanding only; not a treatment guide.</em>"))
            rows.append(("Limits", E(n["limits"])))
            rows.append(("Sources", cites(n["refs"])))
            rows.append(("Read more", f'<a href="{E(n["route"])}">Related article</a>'))
            dl = "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in rows)
            lis.append(f'<li class="px-item" id="n-{n["id"]}" data-kind="{n["kind"]}"><article aria-labelledby="h-{n["id"]}">'
                       f'<h4 id="h-{n["id"]}" class="px-title">{E(n["title"])}</h4><p class="px-kind">{KIND[n["kind"]]} · {E(n["short"])}</p>'
                       f'<dl class="px-dl">{dl}</dl></article></li>')
        arts.append(f'<section class="px-lane-text" aria-labelledby="lt-{lane["id"]}"><h3 id="lt-{lane["id"]}">{E(lane["title"])}</h3><ol class="px-list">{"".join(lis)}</ol></section>')

    srcs = []
    for s, n in sorted(num.items(), key=lambda x: x[1]):
        r = m["sources"][s]
        links = f'<a href="https://doi.org/{E(r["doi"])}" rel="noopener">DOI</a> · PMID <a href="https://pubmed.ncbi.nlm.nih.gov/{E(r["pmid"])}/" rel="noopener">{E(r["pmid"])}</a>'
        srcs.append(f'<li id="src-{n}">{E(r["cite"])} {links} <span class="px-read">(checked: {E(r["read"])})</span></li>')
    omitted = "".join(f'<li><strong>{E(o["what"])}.</strong> {E(o["why"])}</li>' for o in m["omitted"])
    data = json.dumps({"lanes": m["lanes"], "nodes": [{k: n[k] for k in ("id", "kind", "lane", "row", "col", "title", "short", "icon")} for n in m["nodes"]],
                       "edges": [{k: e[k] for k in ("id", "from", "to", "style", "label")} for e in m["edges"]]}, ensure_ascii=False).replace("</", "<\\/")

    title = "The dopamine pathway, step by step"
    desc = "An explorable map of how a brain dopamine cell makes, stores, releases and clears dopamine, with sources and limits for every step."
    page = f'''<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{title} | MJB ADHD</title>
  <meta name="description" content="{E(desc)}">
  <link rel="icon" type="image/jpeg" href="../../assets/mjb-emblem.jpg">
  <link rel="apple-touch-icon" href="../../assets/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#050505">
  <link rel="canonical" href="{BASE}/science/pathway/">
  <link rel="stylesheet" href="../../css/core.css">
  <link rel="stylesheet" href="../../css/sleek.css">
  <link rel="stylesheet" href="../../css/pathway.css">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{E(desc)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="MJB ADHD">
  <meta property="og:locale" content="en_GB">
  <meta property="og:url" content="{BASE}/science/pathway/">
  <meta property="og:image" content="{BASE}/assets/og-share.jpg">
  <meta property="og:image:alt" content="Gold ouroboros encircling a DNA double helix above the letters MJB, on a black background.">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body data-page="science" data-depth="2">
  <a class="skip-link" href="#main-content">Skip to content</a>
  <div class="rail" aria-hidden="true"></div>
  <header class="top" id="site-header"><nav class="fallback-nav" aria-label="Main"><a href='/'>Home</a> · <a aria-current='page' href='/science/what-is-adhd/'>What ADHD is</a> · <a href='/support/quick-starts/'>Starting</a> · <a href='/compounds/'>Medications &amp; Supplements</a> · <a href='/rights/overview/'>Medical rights</a> · <a href='/about/mission/'>Mission</a> · <a href='/contact/'>Contact</a> · <a href='/sources/'>Sources</a></nav></header>
  <main class="wrap" id="main-content">
    <nav class="crumbs" id="crumbs" aria-label="Breadcrumb"><a href='/'>Home</a> / <a href='/science/what-is-adhd/'>Science</a> / <span>Dopamine pathway</span></nav>
    <p class="kicker">Confirmed science / Mechanism</p>
    <h1>{title}</h1>
    <div class="article-meta"><span class="badge">Last updated {E(m["updated"])}</span><span class="badge">Model {E(m["version"])}</span></div>
    <div class="article-body">
<h2 id="the-short-version" class="sec sec-brief">The short version</h2>
<p>This is a map of how one dopamine-releasing nerve cell in the brain makes, stores and releases dopamine, and of what then happens to the dopamine. Each box is a step, a supporting ingredient, a feedback brake or a related pathway. The biology of each step is well established (<span class="tier tier-a">Tier A</span>). Whether a weak step explains ADHD in any particular person is an open question (<span class="tier tier-d">Tier D</span>), and the map does not answer it.</p>
<p class="px-note"><strong>How to use it.</strong> Select any box to read about it in the panel below the map. Selecting a box only changes what you are reading. It does not measure, test or change anything, and it cannot tell you whether you have ADHD or which medicine might suit you.</p>
<section class="px" id="pathway-explorer" aria-labelledby="px-heading">
<h2 id="px-heading">The map</h2>
<div class="px-legend" aria-label="How the lines are drawn"><span class="lg lg-step">Solid arrow: next step in the sequence</span><span class="lg lg-support">Dotted: cofactor or energy support</span><span class="lg lg-feedback">Dashed: feedback (a brake)</span><span class="lg lg-branch">Thin: related pathway, for context</span></div>
<div class="px-text" id="px-text">
<h3 class="px-text-h">Every step as text</h3>
{"".join(arts)}
</div>
<script type="application/json" id="px-data">{data}</script>
</section>
<h2 id="genetic-studies">What genetic studies do and do not show here</h2>
<p>None of the genes on this map is listed within 50 kb of any of the 27 regions reported by the 2023 genome-wide study (<a href="/science/genetics/gen-12/">GEN-12</a>). Older candidate-gene studies reported signals for DAT1, DRD4 and DRD5, with heterogeneity between studies (<a href="/science/genetics/gen-03/">GEN-03</a>). An association with a region of DNA is not the same as a candidate gene, and neither is a proven causal mechanism (<a href="/science/genetics/gen-02/">GEN-02</a>).</p>
<h2 id="medicines">Where medicines act</h2>
<p>Methylphenidate mainly inhibits the dopamine and noradrenaline transporters. Amphetamine also inhibits them, can make them run in reverse, and inhibits VMAT2. These notes explain why the medicines are discussed with this pathway. They are not a guide to choosing or changing treatment, which is a decision for a prescriber.</p>
<h2 id="left-out" class="sec sec-limit">Limits and what is left out</h2>
<ul><li>The map is a teaching model of one cell type. Real signalling varies between brain regions and from moment to moment.</li><li>Region-specific clearance figures come from mouse studies.</li><li>No part of the map describes any individual's biology, levels or treatment.</li>{omitted}</ul>
<h2 id="sources" class="sec sec-src">Sources</h2>
<p>Each source was read for the specific statement it supports. The location is given beside each citation, and the full claim-to-source register is kept with the page's source files.</p>
<ol class="px-sources">{"".join(srcs)}</ol>
    </div>
    <div class="nextbox"><strong>Useful next destination.</strong> <a href="/science/genetics/gen-03/">GEN-03</a>: The dopamine supply chain in plain English.</div>
    <nav class="gen-series" aria-label="Genetics series"><a href="/science/genetics/">All genetics articles</a><a href="/science/genetics/gen-12/">The 27 loci</a><a href="/science/genetics/gen-11/">Glossary</a></nav>
  </main>
  <a class='home-btn' href='/'>Main map</a>
  <footer><div class="wrap"><p class="foot-safety"><strong>Need help now?</strong> Danger: <a href="tel:999">999</a> · Urgent: <a href="tel:111">NHS 111</a> (mental health option) · Text <a href="sms:85258?body=SHOUT">SHOUT to 85258</a> · Samaritans <a href="tel:116123">116 123</a> · <a href="/support/when-help-doesnt-come/">When help doesn't come</a></p>MJB ADHD · general information, not medical advice · <a href="/archive/">Living archive</a></div></footer>
  <script defer src="../../js/registry.js"></script>
  <script defer src="../../js/app.js"></script>
  <script defer src="../../js/interact.js"></script>
  <script defer src="../../js/visual.js"></script>
  <script defer src="../../js/present.js"></script>
  <script defer src="../../js/pathway.js"></script>
</body>
</html>
'''
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(page)

    with CSV.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["type", "id", "from", "to", "relation", "style", "statement", "tier", "source_id", "citation", "doi", "pmid", "location", "quote", "read", "caveat"])
        for n in m["nodes"]:
            for r in n["refs"]:
                s = m["sources"][r["source"]]
                w.writerow(["node", n["id"], "", "", n["kind"], "", n["what"], n["tier"], r["source"], s["cite"], s["doi"], s["pmid"], r["loc"], r["quote"], s["read"], n["limits"]])
        for e in m["edges"]:
            for r in e["refs"]:
                s = m["sources"][r["source"]]
                w.writerow(["edge", e["id"], e["from"], e["to"], e["rel"], e["style"], e["explain"], e["tier"], r["source"], s["cite"], s["doi"], s["pmid"], r["loc"], r["quote"], s["read"], e["caveat"]])
        for o in m["omitted"]:
            w.writerow(["omitted", "", "", "", "", "", o["what"], "", "", "", "", "", "", "", "", o["why"]])
    print(f"built /science/pathway/ ({len(m['nodes'])} nodes, {len(m['edges'])} edges, {len(num)} sources)")


if __name__ == "__main__":
    main()
