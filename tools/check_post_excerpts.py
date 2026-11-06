#!/usr/bin/env python3
"""Verify every non-interface post block is a verbatim excerpt of its linked article's <main> text and that cited #anchors exist."""
import json, re, sys, html, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
d = json.loads((ROOT/'content/posts/posts.json').read_text(encoding="utf-8"))
def main_text(url):
    s = (ROOT/'site'/url.strip('/')/'index.html').read_text(encoding="utf-8")
    m = re.search(r'<main\b.*?</main>', s, re.S); s = m.group(0) if m else s
    ids = set(re.findall(r'\sid="([^"]+)"', s))
    t = html.unescape(re.sub(r'<[^>]+>', '', s)); t = re.sub(r'\s+', ' ', t)
    return t, ids
bad = 0; n = 0
for p in d['posts']:
    for s in p['slides']:
        loc = s.get('sourceLocator') or ''
        url = loc.split('#')[0].split(' ')[0]
        text, ids = main_text(url)
        for a in re.findall(r'#([\w-]+)', loc):
            if a not in ids: print('MISSING ANCHOR', s['id'], a); bad += 1
        for b in s['blocks']:
            n += 1
            if re.sub(r'\s+',' ',b['text']) not in text: print('NOT VERBATIM', b['id'], b['text'][:80]); bad += 1
print('excerpt blocks checked:', n, 'failures:', bad); sys.exit(1 if bad else 0)
