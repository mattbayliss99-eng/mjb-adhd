#!/usr/bin/env python3
"""Write the Drive "library" links into the static pages.

Folder IDs live in tools/library.json. Each page lists which repositories it
shows; the generated HTML sits between <!-- library:start --> and
<!-- library:end --> markers, so running this again replaces it in place.

Usage (from the project root):  python3 tools/build_library.py
"""
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
DATA = json.loads((ROOT / "tools" / "library.json").read_text())["repos"]

FOLDERS = [("articles", "Articles"), ("sources", "Sources"), ("visuals", "Visuals"), ("downloads", "Downloads")]

# page -> repositories shown in its "From the library" block
PAGES = {
    "index.html": ["home"],
    "science/what-is-adhd/index.html": ["science", "research", "hypotheses"],
    "science/genetics/index.html": ["science", "research", "hypotheses"],
    "support/quick-starts/index.html": ["experience", "support", "function"],
    "compounds/index.html": ["compounds"],
    "rights/overview/index.html": ["rights", "advocacy"],
    "about/mission/index.html": ["about"],
    "contact/index.html": ["contact"],
    "sources/index.html": ["media", "research", "templates"],
    "sources/evidence-map/index.html": ["science", "research"],
    "sources/method/index.html": ["research", "hypotheses"],
    "journey/index.html": ["accountability", "media"],
    "arguments/index.html": ["advocacy", "accountability"],
    "accountability/index.html": ["accountability", "media"],
}

# hub page groups: (heading, intro, repositories)
GROUPS = [
    ("Main sections", "The four doors on the main map, plus practical support.",
     ["science", "experience", "compounds", "rights", "support"]),
    ("Evidence and research", "Records, reading and ideas, each labelled for what it can and cannot show.",
     ["media", "research", "hypotheses", "function", "other"]),
    ("The record and advocacy", "What happened, what was asked, and material others can reuse.",
     ["accountability", "advocacy", "templates"]),
    ("About the site", "Home-page material, the mission and official channels.",
     ["home", "about", "contact"]),
]

START, END = "<!-- library:start -->", "<!-- library:end -->"


def url(folder_id):
    return f"https://drive.google.com/drive/folders/{folder_id}"


def links(key):
    items = "".join(
        f'<li><a href="{url(DATA[key]["folders"][f])}" rel="noopener">{label}'
        f'<span class="visually-hidden"> for {html.escape(DATA[key]["title"])} (opens Google Drive)</span></a></li>'
        for f, label in FOLDERS)
    return f'<ul class="lib-links">{items}</ul>'


def repo(key, tag="h3"):
    r = DATA[key]
    return (f'<div class="lib-repo" id="lib-{key}"><{tag}>{html.escape(r["title"])}</{tag}>'
            f'<p>{html.escape(r["desc"])}</p>{links(key)}</div>')


def page_block(keys):
    body = "".join(repo(k) for k in keys)
    return (f'{START}\n<aside class="lib-block" aria-labelledby="lib-heading">'
            f'<h2 id="lib-heading">From the library</h2>'
            f'<p class="lib-note">Dated articles, sources, visuals and downloads for this section, held in the '
            f'MJB ADHD library on Google Drive and added to over time. <a href="/archive/">How the library works</a></p>'
            f'<div class="lib-grid">{body}</div></aside>\n{END}')


def hub_block():
    parts = []
    for i, (head, intro, keys) in enumerate(GROUPS):
        parts.append(f'<section class="lib-group" aria-labelledby="lib-g{i}"><h2 id="lib-g{i}">{html.escape(head)}</h2>'
                     f'<p class="lib-note">{html.escape(intro)}</p>'
                     f'<div class="lib-grid">{"".join(repo(k) for k in keys)}</div></section>')
    return f"{START}\n" + "\n".join(parts) + f"\n{END}"


def inject(path, block, anchor="</main>"):
    s = path.read_text()
    if START in s:
        s = re.sub(re.escape(START) + ".*?" + re.escape(END), lambda _: block, s, flags=re.S)
    else:
        assert anchor in s, f"{path}: no {anchor}"
        s = s.replace(anchor, block + "\n" + anchor, 1)
    path.write_text(s)


if __name__ == "__main__":
    for rel, keys in PAGES.items():
        inject(SITE / rel, page_block(keys))
    inject(SITE / "archive/index.html", hub_block(), anchor="<!-- library:hub -->")
    print(f"library links written to {len(PAGES) + 1} pages")
