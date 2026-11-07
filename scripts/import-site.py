#!/usr/bin/env python3
"""Extract the pinned mjb-adhd site/ tree into preview JSON. Does not rewrite scientific text."""

from __future__ import annotations

import csv
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

ROOT = Path("/tmp/mjb-src")
SITE = ROOT / "site"
OUT = Path("/workspace/content/imported")
PUBLIC = Path("/workspace/public")
MIGRATION = Path("/tmp/mjb-handoff/ROUTE_MIGRATION.csv")
COMMIT = "8d4030af8fce5f8a2e9ae27e013219e6e48417fc"
SKIP = {"script", "style", "iframe", "object", "embed", "noscript"}
# noscript on the guide index is the only readable content. Keep it.
KEEP_NOSCRIPT_PATHS = {"/guide/"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
DROP_ATTR = re.compile(r"^on", re.I)
SAFE_URL = re.compile(r"^(https?:|mailto:|tel:|sms:|/|#)", re.I)
BOOLEAN_ATTRS = {
    "open", "controls", "disabled", "checked", "selected", "required", "multiple",
    "readonly", "download", "reversed", "hidden",
}
SAFE_ATTRS = {
    "href", "src", "srcset", "sizes", "media", "id", "alt", "title", "width", "height",
    "colspan", "rowspan", "scope", "headers", "datetime", "type", "name", "for", "value",
    "poster", "open", "controls", "rel", "target", "download", "loading", "start", "cite",
    "lang", "role", "class", "disabled", "checked", "selected", "required", "multiple",
    "readonly", "reversed", "hidden",
    "aria-label", "aria-labelledby", "aria-hidden", "aria-expanded", "aria-controls",
    "aria-describedby", "aria-current",
    "data-node", "data-atlas-enlarge", "data-srcs", "data-label", "data-conf", "data-src",
    "data-guide-layer", "data-close", "data-component",
}

class Node:
    def __init__(self, tag: str, attrs: dict[str, str] | None = None):
        self.tag = tag
        self.attrs = attrs or {}
        self.children: list = []


class Builder(HTMLParser):
    def __init__(self, keep_noscript: bool, page: str = ""):
        super().__init__(convert_charrefs=True)
        self.root = Node("root")
        self.stack = [self.root]
        self.skip = 0
        self.keep_noscript = keep_noscript
        self.page = page
        self.removed: list[dict[str, str]] = []

    def handle_starttag(self, tag, attrs):
        self._start(tag, attrs, False)

    def handle_startendtag(self, tag, attrs):
        self._start(tag, attrs, True)

    def _start(self, tag, attrs, empty):
        tag = tag.lower()
        if tag in SKIP and not (tag == "noscript" and self.keep_noscript):
            if tag in {"iframe", "object", "embed"}:
                src = ""
                for key, value in attrs:
                    if key.lower() in {"src", "data"} and value:
                        src = value
                self.removed.append({"page": self.page, "tag": tag, "src": src})
            if tag not in VOID:
                self.skip += 1
            return
        if self.skip:
            return
        node = Node(tag, clean_attrs(tag, attrs))
        self.stack[-1].children.append(node)
        if tag not in VOID and not empty:
            self.stack.append(node)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in SKIP and not (tag == "noscript" and self.keep_noscript):
            if self.skip:
                self.skip -= 1
            return
        if self.skip:
            return
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, data):
        if self.skip or not data:
            return
        self.stack[-1].children.append(data)

    def handle_comment(self, data):
        return


def clean_attrs(tag: str, attrs) -> dict[str, str]:
    out: dict[str, str] = {}
    for key, value in attrs:
        key = key.lower()
        if DROP_ATTR.match(key) or key in {"style", "srcdoc"}:
            continue
        if key == "autoplay":
            continue
        if value is None:
            if key in BOOLEAN_ATTRS or key == "aria-hidden":
                out[key] = "true"
            continue
        if key in {"href", "src", "poster"} and not SAFE_URL.match(value.strip()) and not value.startswith(".") and not value.startswith("?"):
            # relative paths without a slash are resolved later; keep them for now
            if ":" in value.split("/")[0]:
                continue
        if key in SAFE_ATTRS:
            out[key] = value
    if tag == "a" and "href" in out and out["href"].lower().startswith("javascript:"):
        del out["href"]
    return out


def page_base(rel_html: str) -> str:
    rel = rel_html[len("site"):] if rel_html.startswith("site") else rel_html
    if not rel.startswith("/"):
        rel = "/" + rel
    if rel.endswith("/index.html"):
        return rel[: -len("index.html")]
    if rel.endswith(".html"):
        return rel
    return rel if rel.endswith("/") else rel + "/"


def resolve_url(base: str, url: str) -> str:
    url = url.strip()
    if not url or url.startswith(("mailto:", "tel:", "sms:", "#")):
        return url
    if url.lower().startswith("javascript:"):
        return ""
    absolute = urljoin("https://mjb-adhd.org.uk" + (base if base.startswith("/") else "/" + base), url)
    parsed = urlparse(absolute)
    host = parsed.netloc.lower()
    if host in {"mjb-adhd.org.uk", "www.mjb-adhd.org.uk"}:
        path = parsed.path or "/"
        if path.endswith("/index.html"):
            path = path[: -len("index.html")]
        elif path.endswith("index.html"):
            path = path[: -len("index.html")]
        if path != "/" and not path.endswith("/") and not Path(path).suffix:
            path += "/"
        if parsed.query:
            path += "?" + parsed.query
        if parsed.fragment:
            path += "#" + parsed.fragment
        return path
    return absolute


def rewrite(node, base: str):
    if isinstance(node, str):
        return
    for key in ("href", "src", "poster"):
        if key in node.attrs:
            node.attrs[key] = resolve_url(base, node.attrs[key])
    for child in node.children:
        rewrite(child, base)


def find_main(root: Node) -> Node | None:
    found = []

    def walk(node):
        if isinstance(node, str):
            return
        if node.tag == "main":
            found.append(node)
        for child in node.children:
            walk(child)

    walk(root)
    return found[0] if found else None


def drop_crumbs(main: Node):
    main.children = [child for child in main.children if not (not isinstance(child, str) and child.tag == "nav" and "crumbs" in child.attrs.get("class", ""))]


def serialize(node) -> dict | str:
    if isinstance(node, str):
        if not node.strip():
            return " "
        return re.sub(r"\s+", " ", node)
    children = []
    for child in node.children:
        item = serialize(child)
        if item == "":
            continue
        children.append(item)
    out: dict = {"t": node.tag}
    if node.attrs:
        out["a"] = node.attrs
    if children:
        out["c"] = children
    return out


def text_of(node) -> str:
    if isinstance(node, str):
        return node
    if isinstance(node, dict):
        return " ".join(text_of(child) for child in node.get("c", []))
    return " ".join(text_of(child) for child in node.children)


def count_tags(node, bag: dict[str, int]):
    if isinstance(node, str):
        return
    bag[node.tag] = bag.get(node.tag, 0) + 1
    for child in node.children:
        count_tags(child, bag)


def headings(node, found: list[str]):
    if isinstance(node, str):
        return
    if node.tag in {"h2", "h3"}:
        label = re.sub(r"\s+", " ", text_of(node)).strip()
        if label:
            found.append(label)
    for child in node.children:
        headings(child, found)


def meta_description(html: str) -> str:
    match = re.search(r'<meta[^>]+name="description"[^>]+content="([^"]*)"', html, re.I)
    if match:
        return match.group(1)
    match = re.search(r'<meta[^>]+content="([^"]*)"[^>]+name="description"', html, re.I)
    return match.group(1) if match else ""


def title_of(html: str, main: Node) -> str:
    for child in main.children:
        if not isinstance(child, str) and child.tag == "h1":
            label = re.sub(r"\s+", " ", text_of(child)).strip()
            if label:
                return label
    match = re.search(r"<title>([^<]+)</title>", html, re.I)
    if not match:
        return "MJB ADHD"
    return re.sub(r"\s+", " ", match.group(1)).replace("| MJB ADHD", "").replace("— MJB ADHD", "").strip() or "MJB ADHD"


def parse_file(path: Path, base: str, keep_noscript: bool) -> tuple[Node, str, list[dict[str, str]]]:
    html = path.read_text(encoding="utf-8", errors="replace")
    builder = Builder(keep_noscript, page=base)
    builder.feed(html)
    main = find_main(builder.root)
    if main is None:
        main = Node("main")
    drop_crumbs(main)
    rewrite(main, base)
    return main, html, builder.removed


def guide_aliases() -> dict[str, str]:
    aliases: dict[str, str] = {}
    static = SITE / "guide" / "static"
    if not static.exists():
        return aliases
    for page in static.rglob("index.html"):
        text = page.read_text(encoding="utf-8", errors="replace")
        rel = "/" + str(page.relative_to(SITE)).replace("index.html", "")
        for node_id in re.findall(r"#/n/([a-z0-9-]+)", text):
            aliases.setdefault(node_id, rel if rel.endswith("/") else rel + "/")
    data = json.loads((SITE / "guide" / "guide-data.json").read_text(encoding="utf-8"))
    for page in data["pages"]:
        aliases.setdefault(page["id"], page.get("route") or f"/guide/#/n/{page['id']}")
    return aliases


def norm_path(path: str) -> str:
    path = path.split("#", 1)[0].split("?", 1)[0]
    if path.endswith("/index.html"):
        path = path[: -len("index.html")]
    if len(path) > 1 and path.endswith("/"):
        path = path[:-1]
    return path or "/"


def walk_dict(node, visit):
    if isinstance(node, str):
        return
    if isinstance(node, dict):
        visit(node)
        for child in node.get("c") or []:
            walk_dict(child, visit)


def write_splits(articles: list[dict], removed_embeds: list[dict[str, str]]):
    bodies = OUT / "bodies"
    if bodies.exists():
        for old in bodies.glob("*.json"):
            old.unlink()
    bodies.mkdir(parents=True, exist_ok=True)
    index = []
    ids_by_path: dict[str, set[str]] = {}
    unknown_tags: dict[str, int] = {}
    known = {
        "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "table", "thead", "tbody", "tfoot",
        "tr", "th", "td", "figure", "figcaption", "img", "a", "blockquote", "details", "summary", "dl",
        "dt", "dd", "section", "div", "span", "strong", "em", "b", "i", "small", "sup", "sub", "br",
        "time", "caption", "abbr", "code", "pre", "button", "form", "label", "input", "textarea",
        "select", "option", "fieldset", "legend", "article", "hr", "picture", "source", "video",
        "audio", "colgroup", "col", "nav", "aside", "header", "footer", "address", "dialog", "cite",
        "mark", "main", "q", "kbd", "s", "u", "del", "ins",
    }
    chip_with_ids = 0
    chip_without_ids = 0
    other_buttons = []
    for article in articles:
        (bodies / f"{article['id']}.json").write_text(
            json.dumps({"id": article["id"], "body": article["body"]}, ensure_ascii=False),
            encoding="utf-8",
        )
        index.append({key: value for key, value in article.items() if key != "body"})
        found_ids: set[str] = set()

        def visit(node, found_ids=found_ids, article=article):
            nonlocal chip_with_ids, chip_without_ids
            tag = node.get("t")
            if tag and tag not in known:
                unknown_tags[tag] = unknown_tags.get(tag, 0) + 1
            attrs = node.get("a") or {}
            if attrs.get("id"):
                found_ids.add(attrs["id"])
            if tag == "button":
                classes = attrs.get("class", "")
                if "chip" in classes.split():
                    if (attrs.get("data-srcs") or "").strip():
                        chip_with_ids += 1
                    else:
                        chip_without_ids += 1
                else:
                    other_buttons.append({
                        "page": article["path"],
                        "type": attrs.get("type", ""),
                        "class": classes,
                        "label": re.sub(r"\s+", " ", text_of(node)).strip()[:80],
                    })

        walk_dict(article["body"], visit)
        ids_by_path[norm_path(article["path"])] = found_ids
        if article.get("originalPath"):
            ids_by_path.setdefault(norm_path(article["originalPath"]), found_ids)

    (OUT / "search-index.json").write_text(
        json.dumps({"commit": COMMIT, "articles": index}, ensure_ascii=False),
        encoding="utf-8",
    )
    catalog = [{key: value for key, value in item.items() if key != "text"} for item in index]
    (OUT / "catalog.json").write_text(json.dumps({"commit": COMMIT, "articles": catalog}, ensure_ascii=False), encoding="utf-8")
    (OUT / "search-text.json").write_text(
        json.dumps({item["id"]: item.get("text", "") for item in index}, ensure_ascii=False),
        encoding="utf-8",
    )
    broken = []
    for article in articles:
        hrefs: list[str] = []

        def take_href(node, hrefs=hrefs):
            attrs = node.get("a") or {}
            href = attrs.get("href")
            if isinstance(href, str):
                hrefs.append(href)

        walk_dict(article["body"], take_href)
        for href in hrefs:
            if "#" not in href or href.startswith("#"):
                continue
            path, frag = href.split("#", 1)
            if not path.startswith("/") or not frag or frag.startswith("/"):
                continue
            target = ids_by_path.get(norm_path(path))
            if target is None or frag not in target:
                broken.append({
                    "from": article["path"],
                    "href": href,
                    "fragment": frag,
                    "targetKnown": target is not None,
                    "disposition": "inherited-unresolved",
                    "note": "The published page links to this fragment. The target page has no element with that id. The link was not retargeted.",
                })
    # one row per unique from+href
    seen = set()
    unique = []
    for item in broken:
        key = (item["from"], item["href"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(item)
    (OUT / "FRAGMENTS.json").write_text(json.dumps({"broken": unique}, indent=2), encoding="utf-8")
    (OUT / "EXCEPTIONS.json").write_text(json.dumps({
        "removedEmbeds": removed_embeds,
        "unknownTags": unknown_tags,
        "picturePolicy": "picture and source elements are kept. The browser chooses srcset. The img inside picture remains the fallback.",
        "whitespacePolicy": "Whitespace-only text between elements is kept as a single space so adjacent inline metadata does not run together. No words were inserted.",
        "booleanPolicy": "Boolean attributes with no value are stored as true and rendered when the element supports them.",
    }, indent=2), encoding="utf-8")
    (OUT / "CONTROL_MAP.json").write_text(json.dumps({
        "chipsWithSourceIds": chip_with_ids,
        "chipsWithoutSourceIds": chip_without_ids,
        "otherButtons": other_buttons,
        "actions": {
            "chip": "Button opens a dialog listing the source links already in that claim and the source ids on the control. Citations are not invented from the colour or the label.",
            "chip-empty": "If a chip has no source id and the claim has no source link, the dialog says no source is attached.",
            "data-node": "Choosing a pathway step scrolls to the matching text step. The coloured script map is not copied.",
            "data-close": "I understand hides the notice it sits in. The notice stays in the HTML without JavaScript.",
            "form-submit": "Submit does not send the form.",
            "figure": "Each figure has an Open image button. The image dialog uses the shared modal, zoom, and optional pin.",
        },
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print("chips", chip_with_ids, "without ids", chip_without_ids, "broken fragments", len(unique), "embeds", len(removed_embeds))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rows = list(csv.DictReader(MIGRATION.open(encoding="utf-8")))
    articles = []
    proposals = []
    referenced: set[str] = set()
    proposal_n = 0
    removed_embeds: list[dict[str, str]] = []
    for row in rows:
        source = SITE.parent / row["source_file"]
        base = page_base(row["source_file"])
        public_path = row["original_path"]
        if public_path == "/":
            public_path = "/about/original-home/"
            base = "/"
        keep_noscript = row["original_path"] in KEEP_NOSCRIPT_PATHS
        main, html, removed = parse_file(source, base if row["original_path"] != "/" else "/", keep_noscript)
        removed_embeds.extend(removed)
        tree = serialize(main)
        plain = re.sub(r"\s+", " ", text_of(tree)).strip()
        counts_raw: dict[str, int] = {}
        count_tags(main, counts_raw)
        digest = hashlib.sha256(plain.encode("utf-8")).hexdigest()
        status = "mapped" if row["original_path"] == "/" else "integrated"
        note = "Original home body is at /about/original-home/. The preview front door stays at /." if status == "mapped" else "Body, figures and links extracted from the pinned file. Wording was not rewritten."
        if len(plain) < 40:
            status = "blocked"
            note = "Extracted text was under 40 characters. The page is not marked integrated."
        article = {
            "id": row["route_id"],
            "path": public_path,
            "originalPath": row["original_path"],
            "title": title_of(html, main),
            "description": meta_description(html) or row["title"],
            "group": row["group"],
            "sourceFile": row["source_file"],
            "blobSha": row["blob_sha"],
            "commit": COMMIT,
            "contentHash": digest,
            "status": status,
            "statusNote": note,
            "counts": {
                "p": counts_raw.get("p", 0),
                "li": counts_raw.get("li", 0),
                "table": counts_raw.get("table", 0),
                "figure": counts_raw.get("figure", 0),
                "a": counts_raw.get("a", 0),
                "h2": counts_raw.get("h2", 0),
            },
            "text": plain,
            "body": tree,
        }
        articles.append(article)
        collect_urls(tree, referenced)
        if row["group"] in {"science-core", "compounds", "process-atlas", "support-rights"} and status == "integrated":
            heads: list[str] = []
            headings(main, heads)
            for heading in heads:
                if proposal_n >= 97:
                    break
                proposal_n += 1
                proposals.append({
                    "id": f"PROP-{proposal_n:04d}",
                    "status": "proposal",
                    "sourcePath": public_path,
                    "heading": heading,
                    "note": "Not an authored post. The heading is copied from the pinned article. No new scientific wording.",
                })

    not_found_main, not_found_html, not_found_removed = parse_file(SITE / "404.html", "/404.html", False)
    removed_embeds.extend(not_found_removed)
    not_found = {
        "id": "RT-404",
        "path": "/404.html",
        "originalPath": "/404.html",
        "title": title_of(not_found_html, not_found_main),
        "description": "Page not found",
        "group": "start",
        "sourceFile": "site/404.html",
        "blobSha": hashlib.sha256((SITE / "404.html").read_bytes()).hexdigest(),
        "commit": COMMIT,
        "contentHash": hashlib.sha256(text_of(serialize(not_found_main)).encode()).hexdigest(),
        "status": "integrated",
        "statusNote": "Real not-found page from site/404.html. Unknown routes use this, not a blank shell.",
        "counts": {},
        "text": re.sub(r"\s+", " ", text_of(not_found_main)).strip(),
        "body": serialize(not_found_main),
    }
    articles.append(not_found)

    aliases = guide_aliases()
    (OUT / "articles.json").write_text(json.dumps({"commit": COMMIT, "articles": articles}, ensure_ascii=False), encoding="utf-8")
    (OUT / "guide-aliases.json").write_text(json.dumps(aliases, ensure_ascii=False, indent=2), encoding="utf-8")
    status_rows = []
    for article in articles:
        if article["id"] == "RT-404":
            continue
        original = article["originalPath"]
        status_rows.append({
            "route_id": article["id"],
            "original_path": original,
            "served_path": article["path"],
            "status": article["status"],
            "content_hash": article["contentHash"],
            "paragraphs": article["counts"].get("p", 0),
            "lists": article["counts"].get("li", 0),
            "tables": article["counts"].get("table", 0),
            "figures": article["counts"].get("figure", 0),
            "note": article["statusNote"],
        })
    with (OUT / "ROUTE_MIGRATION.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(status_rows[0].keys()))
        writer.writeheader()
        writer.writerows(status_rows)

    missing = []
    present = []
    for url in sorted(referenced):
        if not url.startswith("/") or url.startswith("//"):
            continue
        path = url.split("#", 1)[0].split("?", 1)[0]
        if path.endswith("/") or not Path(path).suffix:
            continue
        file_path = PUBLIC / path.lstrip("/")
        record = {"path": path, "bytes": file_path.stat().st_size if file_path.exists() else 0}
        if file_path.exists():
            present.append(record)
        else:
            missing.append(path)
    manifest = {
        "commit": COMMIT,
        "copiedRoots": ["public/assets", "public/guide/visuals", "public/sources/docs", "public/accountability"],
        "referencedFiles": len(present),
        "missing": missing,
    }
    (OUT / "ASSET_MANIFEST.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    queue = {
        "published": ["MJB-P000001", "MJB-P000002", "MJB-P000003"],
        "proposals": proposals,
        "note": "Proposals are headings from pinned articles. They are not new posts and they are not approved.",
    }
    (OUT / "POST_QUEUE.json").write_text(json.dumps(queue, ensure_ascii=False, indent=2), encoding="utf-8")
    write_splits(articles, removed_embeds)
    print("articles", len(articles))
    print("blocked", sum(1 for item in articles if item["status"] == "blocked"))
    print("mapped", sum(1 for item in articles if item["status"] == "mapped"))
    print("proposals", len(proposals))
    print("missing assets", len(missing))
    print("missing sample", missing[:12])


def collect_urls(node, found: set[str]):
    if isinstance(node, str):
        return
    if isinstance(node, dict):
        attrs = node.get("a") or {}
        for key in ("src", "href", "poster"):
            value = attrs.get(key)
            if isinstance(value, str) and value.startswith("/"):
                found.add(value)
        for child in node.get("c") or []:
            collect_urls(child, found)


if __name__ == "__main__":
    main()
