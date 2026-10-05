#!/usr/bin/env python3
"""Turn the GEN genetics series (content/genetics/*.md) into static pages.

Output: site/science/genetics/ (GEN-00 hub) and site/science/genetics/gen-NN/.
Articles listed in IN_PREPARATION are not published; they appear in the hub
as plain text marked "in preparation" until their HOLD items are verified.

Usage (from the project root):  python3 tools/build_genetics.py
"""
import html
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "content" / "genetics"
OUT = ROOT / "site" / "science" / "genetics"
BASE = "https://mjb-adhd.org.uk"

# Status says "HOLD items must be verified before publishing".
IN_PREPARATION = {"GEN-07", "GEN-08"}

SECTION_CLASS = {
    "the short version": "sec sec-brief",
    "the usual mix-up": "sec sec-misread",
    "limits": "sec sec-limit",
    "sources": "sec sec-src",
}


def slug_for(gen_id):
    return "" if gen_id == "GEN-00" else gen_id.lower() + "/"


def page_url(gen_id):
    return f"/science/genetics/{slug_for(gen_id)}"


def anchor(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


# ---------- front matter ----------

def parse(path):
    raw = path.read_text()
    meta, body = {}, raw
    if raw.startswith("---"):
        fm, body = raw[3:].split("\n---", 1)
        for line in fm.strip().splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
    return meta, body.strip("\n")


# ---------- inline markdown ----------

def hold_text(s):
    s = re.sub(r"\s*\(see HOLD\)", "", s)
    s = re.sub(r"\(HOLD:[^)]*\)", "(HOLD)", s)
    s = re.sub(r"HOLD: [^.)|]*", "HOLD", s)
    return s


def inline(s, current, titles):
    s = hold_text(s)
    links = []

    def keep_link(m):
        text, url = m.group(1), m.group(2)
        links.append(f'<a href="{html.escape(url, quote=True)}" rel="noopener">{inline_basic(text)}</a>')
        return f"\x00{len(links) - 1}\x00"

    s = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", keep_link, s)
    s = inline_basic(s)
    s = re.sub(r"\bDOI (10\.\d{4,9}/[^\s,;|]+?)(?=[.)]?(?:\s|$|,|;))",
               lambda m: f'DOI <a href="https://doi.org/{m.group(1)}" rel="noopener">{m.group(1)}</a>', s)
    s = re.sub(r"\bPMID (\d{6,9})\b",
               lambda m: f'PMID <a href="https://pubmed.ncbi.nlm.nih.gov/{m.group(1)}/" rel="noopener">{m.group(1)}</a>', s)
    s = s.replace("✓", '<span class="ok" title="Checked against the source">✓</span>')

    def gen_ref(m):
        gid = m.group(0)
        if gid == current or gid not in titles:
            return gid
        if gid in IN_PREPARATION:
            return f'{gid} <span class="hold">in preparation</span>'
        return f'<a href="{page_url(gid)}">{gid}</a>'

    s = re.sub(r"GEN-\d\d", gen_ref, s)
    s = re.sub(r"\bTier ([ABCD])((?:/[ABCD])?)\b",
               lambda m: f'<span class="tier tier-{m.group(1).lower()}">Tier {m.group(1)}{m.group(2)}</span>', s)
    s = re.sub(r"\bHOLD\b", '<span class="hold">not yet verified</span>', s)
    s = re.sub(r"\[(\d+(?:,\s*\d+)*)\]", lambda m: '<sup class="cite">[' + ", ".join(
        f'<a href="#src-{n.strip()}" aria-label="Source {n.strip()}">{n.strip()}</a>' for n in m.group(1).split(",")) + "]</sup>", s)
    return re.sub(r"\x00(\d+)\x00", lambda m: links[int(m.group(1))], s)


def inline_basic(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?![*\w])", r"<em>\1</em>", s)
    return s


# ---------- block markdown ----------

def cells(row):
    return [c.strip() for c in row.strip().strip("|").split("|")]


def blocks(body, current, titles):
    """Return (kicker, updated, title, [section html strings], next_html)."""
    lines = body.splitlines()
    kicker = updated = title = ""
    out, next_html = [], ""
    i = 0
    in_next = False
    buf = []

    def emit(h):
        (buf if in_next else out).append(h)

    while i < len(lines):
        line = lines[i]
        st = line.strip()
        if not st:
            i += 1
            continue
        if st.startswith("# "):
            title = st[2:].strip()
        elif st.startswith("**Kicker:**"):
            kicker = st.split("**Kicker:**", 1)[1].strip()
        elif st.startswith("**Last updated:**"):
            updated = st.split("**Last updated:**", 1)[1].strip()
        elif st.startswith("## "):
            head = st[3:].strip()
            in_next = head.lower() == "useful next destination"
            if not in_next:
                cls = SECTION_CLASS.get(head.lower(), "")
                cls_attr = f' class="{cls}"' if cls else ""
                emit(f'<h2 id="{anchor(head)}"{cls_attr}>{inline(head, current, titles)}</h2>')
        elif st.startswith("### "):
            head = st[4:].strip()
            emit(f'<h3 id="{anchor(head)}">{inline(head, current, titles)}</h3>')
        elif st.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(lines[i]); i += 1
            head, body_rows = cells(rows[0]), [cells(r) for r in rows[2:]]
            th = "".join(f'<th scope="col">{inline(c, current, titles)}</th>' for c in head)
            trs = []
            for r in body_rows:
                rid = ""
                if current == "GEN-11" and r:
                    term = re.sub(r"\*\*|\(.*", "", r[0]).strip()
                    rid = f' id="g-{anchor(term)}"'
                tds = "".join(f"<td>{inline(c, current, titles)}</td>" for c in r)
                trs.append(f"<tr{rid}>{tds}</tr>")
            emit(f'<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table><thead><tr>{th}</tr></thead>'
                 f'<tbody>{"".join(trs)}</tbody></table></div>')
            continue
        elif re.match(r"^[-*] ", st):
            items = []
            while i < len(lines) and re.match(r"^\s*[-*] ", lines[i]):
                items.append(re.sub(r"^\s*[-*] ", "", lines[i]).strip()); i += 1
            emit("<ul>" + "".join(f"<li>{inline(x, current, titles)}</li>" for x in items) + "</ul>")
            continue
        elif re.match(r"^\d+\. ", st):
            items = []
            while i < len(lines) and re.match(r"^\s*\d+\. ", lines[i]):
                items.append(re.sub(r"^\s*\d+\. ", "", lines[i]).strip()); i += 1
            emit("<ol>" + "".join(f"<li>{inline(x, current, titles)}</li>" for x in items) + "</ol>")
            continue
        else:
            para = [st]
            i += 1
            while i < len(lines) and lines[i].strip() and not re.match(r"^(#|\||[-*] |\d+\. |\*\*Kicker|\*\*Last)", lines[i].strip()):
                para.append(lines[i].strip()); i += 1
            emit(f"<p>{inline(' '.join(para), current, titles)}</p>")
            continue
        i += 1
    if buf:
        next_html = " ".join(re.sub(r"^<p>|</p>$", "", b) for b in buf)
    return kicker, updated, title, out, next_html


# ---------- glossary links ----------

GLOSS_TERMS = [
    ("heritability", "heritability"), ("loci", "locus"), ("locus", "locus"), ("GWAS", "gwas"),
    ("polygenic score", "polygenic-score"), ("de novo", "de-novo"), ("copy-number variant", "cnv"),
    ("penetrance", "penetrance"), ("pharmacogenomics", "pharmacogenomics"), ("VMAT2", "vmat2"),
    ("AADC", "aadc"), ("BH4", "bh4"), ("dopa-responsive dystonia", "dopa-responsive-dystonia"),
    ("hereditary spastic paraplegia", "hsp"), ("spasticity", "spasticity"), ("dystonia", "dystonia"),
    ("basal ganglia", "basal-ganglia"), ("differential diagnosis", "differential-diagnosis"),
    ("variant of uncertain significance", "vus"), ("candidate gene", "candidate-gene"),
    ("effector gene", "effector-gene"), ("SNP heritability", "snp-heritability"), ("trio", "trio"),
]


def glossary_defs():
    meta, body = parse(SRC / "GEN-11_glossary.md")
    defs = {}
    for line in body.splitlines():
        if line.startswith("| **"):
            c = cells(line)
            term = re.sub(r"\*\*|\(.*", "", c[0]).strip()
            defs[anchor(term)] = re.sub(r"\*", "", c[1])
    return defs


def link_glossary(section_html, defs, seen):
    """Link the first use of each glossary term on the page. Skips headings, links and tables' header cells."""
    parts = re.split(r"(<[^>]+>)", section_html)
    stack, held = [], []
    for n, part in enumerate(parts):
        if part.startswith("<"):
            tag = re.match(r"</?([a-z0-9]+)", part)
            if not tag:
                continue
            name = tag.group(1)
            if part.startswith("</"):
                if name in stack:
                    while stack and stack.pop() != name:
                        pass
            elif not part.endswith("/>") and name not in ("br", "img", "input", "meta", "link"):
                stack.append(name)
            continue
        if any(t in stack for t in ("a", "h2", "h3", "th", "strong", "span")) or not part.strip():
            continue
        for term, gid in GLOSS_TERMS:
            if gid in seen or gid not in defs:
                continue
            m = re.search(r"(?<![\w-])(" + re.escape(term) + r")(?![\w-])", part, flags=0 if term.isupper() else re.I)
            if not m or "\x01" in m.group(0):
                continue
            seen.add(gid)
            tip = html.escape(defs[gid], quote=True)
            held.append(f'<a class="gloss" href="/science/genetics/gen-11/#g-{gid}" title="{tip}">{m.group(1)}</a>')
            part = part[:m.start()] + f"\x01{len(held) - 1}\x01" + part[m.end():]
        parts[n] = re.sub(r"\x01(\d+)\x01", lambda k: held[int(k.group(1))], part)
    return "".join(parts)


# ---------- page shell ----------

def shell(gen_id, title, desc, kicker, updated, body, next_html, toc, extra=None):
    depth = 3 if gen_id != "GEN-00" else 2
    if extra:
        depth = extra["path"].strip("/").count("/") + 1
    up = "../" * depth
    url = BASE + (extra["path"] if extra else page_url(gen_id))
    t = html.escape(title)
    d = html.escape(desc, quote=True)
    crumbs = "<a href='/'>Home</a> / <a href='/science/what-is-adhd/'>Science</a> / "
    crumbs += (f"<a href='/science/genetics/'>Genetics</a> / <span>{gen_id}</span>" if gen_id != "GEN-00"
               else "<span>Genetics</span>")
    page = "science"
    if extra:
        crumbs, page = extra["crumbs"], extra["page"]
    toc_html = ""
    if toc:
        toc_html = ('<details class="toc" open><summary>On this page</summary><ol>'
                    + "".join(f'<li><a href="#{a}">{html.escape(h)}</a></li>' for a, h in toc) + "</ol></details>")
    nxt = f'<div class="nextbox"><strong>Useful next destination.</strong> {next_html}</div>' if next_html else ""
    glossary_line = ('' if gen_id == "GEN-11" or extra else
                     '<p class="gloss-hint">Underlined terms link to the <a href="/science/genetics/gen-11/">glossary</a>; '
                     'hover or long-press for a quick definition.</p>')
    return f"""<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{t} | MJB ADHD</title>
  <meta name="description" content="{d}">
  <link rel="icon" type="image/jpeg" href="{up}assets/mjb-emblem.jpg">
  <link rel="apple-touch-icon" href="{up}assets/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#050505">
  <link rel="canonical" href="{url}">
  <link rel="stylesheet" href="{up}css/core.css">
  <link rel="stylesheet" href="{up}css/sleek.css">
  <meta property="og:title" content="{t}">
  <meta property="og:description" content="{d}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="MJB ADHD">
  <meta property="og:locale" content="en_GB">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{BASE}/assets/og-share.jpg">
  <meta property="og:image:alt" content="Gold ouroboros encircling a DNA double helix above the letters MJB, on a black background.">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body data-page="{page}" data-depth="{depth}">
  <a class="skip-link" href="#main-content">Skip to content</a>
  <div class="rail" aria-hidden="true"></div>
  <header class="top" id="site-header"><nav class="fallback-nav" aria-label="Main"><a href='/'>Home</a> · <a aria-current='page' href='/science/what-is-adhd/'>What ADHD is</a> · <a href='/support/quick-starts/'>Starting</a> · <a href='/compounds/'>Medications &amp; Supplements</a> · <a href='/rights/overview/'>Medical rights</a> · <a href='/about/mission/'>Mission</a> · <a href='/contact/'>Contact</a> · <a href='/sources/'>Sources</a></nav></header>
  <main class="wrap" id="main-content">
    <nav class="crumbs" id="crumbs" aria-label="Breadcrumb">{crumbs}</nav>
    <p class="kicker">{html.escape(kicker)}{' · ' + gen_id if gen_id.startswith('GEN-') and gen_id != 'GEN-00' else ''}</p>
    <h1>{t}</h1>
    <div class="article-meta"><span class="badge">Last updated {html.escape(updated)}</span>{f'<span class="badge">{gen_id}</span>' if gen_id.startswith('GEN-') else ''}</div>
    {toc_html}
    <div class="article-body gen-article">
{body}
    </div>
    {glossary_line}
    {nxt}
    <nav class="gen-series" aria-label="Genetics series"><a href="/science/genetics/">All genetics articles</a><a href="/science/genetics/gen-11/">Glossary</a><a href="/sources/numbers/">Verified numbers</a></nav>
  </main>
  <a class='home-btn' href='/'>Main map</a>
  <footer><div class="wrap">MJB ADHD · general information, not medical advice · <a href="/archive/">Living archive</a></div></footer>
  <script defer src="{up}js/registry.js"></script>
  <script defer src="{up}js/app.js"></script>
  <script defer src="{up}js/interact.js"></script>
  <script defer src="{up}js/visual.js"></script>
  <script defer src="{up}js/present.js"></script>
</body>
</html>
"""


def first_text(section_html):
    for m in re.finditer(r"<(p|li)>(.*?)</\1>", section_html, flags=re.S):
        t = re.sub(r"<[^>]+>", "", m.group(2))
        t = re.sub(r"\s+", " ", t).strip()
        t = re.sub(r"\s*\[\d+(?:,\s*\d+)*\]", "", t)
        if len(t) > 40:
            return (t[:155].rsplit(" ", 1)[0] + "…") if len(t) > 160 else t
    return ""


EXTRA = [
    {"src": ROOT / "content" / "sources" / "verified-numbers.md", "path": "/sources/numbers/", "page": "sources",
     "crumbs": "<a href='/'>Home</a> / <a href='/sources/'>Sources</a> / <span>Verified numbers</span>"},
]


def build_extra(titles):
    for e in EXTRA:
        meta, body = parse(e["src"])
        kicker, updated, title, sections, next_html = blocks(body, meta.get("id", ""), titles)
        html_body = "\n".join(sections)
        toc = [(a, re.sub(r"<[^>]+>", "", h)) for a, h in re.findall(r'<h2 id="([^"]+)"[^>]*>(.*?)</h2>', html_body)]
        target = ROOT / "site" / e["path"].strip("/") / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(shell(meta.get("id", ""), title, first_text(html_body) or title, kicker, updated,
                                html_body, next_html, toc, extra=e))
        print("built", e["path"])


def main():
    files = sorted(SRC.glob("GEN-*.md"))
    docs = {}
    for f in files:
        meta, body = parse(f)
        docs[meta["id"]] = body
    titles = {gid: re.search(r"^# (.+)$", b, flags=re.M).group(1).strip() for gid, b in docs.items()}
    defs = glossary_defs()
    published = []
    for gid, body in docs.items():
        if gid in IN_PREPARATION:
            continue
        kicker, updated, title, sections, next_html = blocks(body, gid, titles)
        seen, linked, in_sources = set(), [], False
        for sec in sections:
            if 'class="sec sec-src"' in sec:
                in_sources = True
            elif in_sources and sec.startswith("<ol>"):
                n = iter(range(1, 100))
                sec = re.sub(r"<li>", lambda _: f'<li id="src-{next(n)}">', sec)
            linked.append(sec if in_sources or gid == "GEN-11" else link_glossary(sec, defs, seen))
        html_body = "\n".join(linked)
        toc = [(a, re.sub(r"<[^>]+>", "", h)) for a, h in re.findall(r'<h2 id="([^"]+)"[^>]*>(.*?)</h2>', html_body)]
        desc = first_text(html_body) or title
        target = OUT / slug_for(gid) / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(shell(gid, title, desc, kicker, updated, html_body, next_html, toc if len(toc) > 3 else []))
        published.append(gid)
    build_extra(titles)
    print("published:", ", ".join(published))
    print("in preparation:", ", ".join(sorted(IN_PREPARATION)))


if __name__ == "__main__":
    main()
