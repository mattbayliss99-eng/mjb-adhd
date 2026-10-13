#!/usr/bin/env python3
"""Build a shared public hierarchy/search index; enhance hosted HTML idempotently.

Run last after other page generators. No third-party packages or network requests.
"""
import html
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
ROUTES = json.loads(subprocess.check_output(['node', '-e', "const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('site/js/registry.js','utf8'),c);console.log(JSON.stringify(c.window.MJB_ADHD.routes))"], cwd=ROOT))
HOSTED = json.loads((ROOT / 'guidebook/hosted-routes.json').read_text())

def label(s):
    return re.sub(r'^GEN-\d+:\s*', '', html.unescape(s)).strip()

def url(slug):
    return '/' if slug in ('/', 'index.html') else '/' + slug.lstrip('/')

def canonical(s):
    return re.sub(r'/index\.html(?=[?#]|$)', '/', s)

def leaf(route_id, text=None):
    r = next(x for x in ROUTES if x['id'] == route_id)
    return {'id': route_id, 'label': text or label(r['title']), 'url': url(r['slug'])}

def guide(node, text=None):
    return leaf('route.guide.' + node, text)

def group(key, text, overview, children):
    return {'id': key, 'label': text, 'url': overview, 'children': children}

CATS = [
    group('start', 'Start here', '/', [leaf('route.home'), leaf('route.guide', 'Connected guidebook'), leaf('route.guide.adhd-resources', 'Find useful resources')]),
    group('daily', 'ADHD & daily life', '/support/quick-starts/', [leaf('route.support', 'Starting a task'), {'id':'route.relatable','label':'Relatable examples','url':'/support/relatable-examples/'}, guide('understand'), guide('memory-time-awareness', 'Memory, time & awareness'), guide('pain-fatigue-movement'), guide('fatigue-sleep')]),
    group('brain', 'Brain & genetics', '/science/what-is-adhd/', [leaf('route.science'),
        group('genetic-library', 'Genetics library', '/science/genetics/', [leaf(r['id']) for r in ROUTES if r['id'].startswith('route.gen-')]),
        group('mechanisms', 'Mechanisms & evidence', '/guide/index.html#/n/evidence', [guide(n) for n in ['evidence','adhd-biology','genetics','brain-development','dopamine-system','heterogeneity','open-questions']]),
        leaf('route.pathway'), {'id':'route.process-atlas','label':'Process atlas','url':'/science/process-atlas/'}]),
    group('neurology', 'Neurological symptoms', '/guide/index.html#/n/field-guide', [guide('field-guide'),
        group('movement', 'Movement, pain & sensation', '/guide/index.html#/n/pain-fatigue-movement', [guide(n) for n in ['dystonia','spasticity','ataxia','nerve-pain','sensory-feedback']]),
        group('conditions', 'Condition guides', '/guide/index.html#/n/field-guide', [guide(n) for n in ['hsp','drd','parkinsons-field-guide','fnd']])]),
    group('treatment', 'Medication & treatment', '/compounds/', [leaf('route.compounds'), guide('treatment'), guide('how-medicines-act'), guide('treatment-evidence'), guide('formulations-response', 'Formulations & response'), guide('restarting-after-gap'), guide('dopamine-options'), guide('botanical-evidence'), leaf('route.compounds-cannabis'), leaf('route.compounds-strains')]),
    group('care', 'Getting care', '/guide/index.html#/n/care', [guide('care'), guide('no-prescriber', 'No current prescriber'), guide('continuity', 'When treatment stops'), guide('transfer-handover', 'Transfers & Right to Choose'), guide('records-escalation'), guide('appointment-preparation'), leaf('route.help-writing')]),
    group('accountability', 'Rights & accountability', '/rights/overview/', [leaf('route.rights'), leaf('route.accountability-uk'), leaf('route.accountability-cases'), leaf('route.accountability-leahy'),
        group('case-and-system', 'Cases & responsibilities', '/guide/index.html#/n/accountability', [guide(n) for n in ['accountability','matthew-timeline','case-decisions','accountability-system','accountability-safeguards','accountability-findings','lives-remembered','matthew-leahy','media-framing']]),
        {'id':'route.journey','label':'My treatment journey','url':'/journey/'}, {'id':'route.accountability','label':'Treatment accountability','url':'/accountability/'}]),
    group('resources', 'Evidence & resources', '/sources/', [leaf('route.sources'), leaf('route.evidence-map'), leaf('route.source-method'), leaf('route.numbers'), leaf('route.archive'), guide('sources'), guide('evidence-method'), guide('corrections')]),
]
GLOBALS = [leaf('route.about', 'About MJB'), guide('about'), leaf('route.contact')]
ENTRIES = {}

def walk(nodes, parents):
    for n in nodes:
        path = parents + [{'label': n['label'], 'url': n['url']}]
        if not n.get('children'):
            k = canonical(n['url'])
            ENTRIES.setdefault(k, {'id':n['id'], 'title':n['label'], 'url':n['url'], 'path':path, 'summary':'', 'search':''})
        else:
            walk(n['children'], path)
walk(CATS, [])
walk(GLOBALS, [])
for p in HOSTED:
    k = canonical(p['interactive'])
    if k in ENTRIES:
        ENTRIES[canonical(p['static'])] = {**ENTRIES[k], 'url':p['static'], 'alias':k}

class Text(HTMLParser):
    def __init__(self): super().__init__(); self.parts=[]; self.skip=0
    def handle_starttag(self, tag, attrs):
        if tag in ('script','style'): self.skip+=1
    def handle_endtag(self, tag):
        if tag in ('script','style') and self.skip: self.skip-=1
    def handle_data(self, s):
        if not self.skip: self.parts.append(s)

pages = list(SITE.rglob('index.html'))
for p in pages:
    rel = p.relative_to(SITE).as_posix()
    u = '/' if rel == 'index.html' else '/' + rel[:-10]
    source = p.read_text()
    t = Text(); t.feed(source)
    words = ' '.join(' '.join(t.parts).split())
    k = canonical(u)
    if k not in ENTRIES:
        m = re.search(r'<h1\b[^>]*>(.*?)</h1>', source, re.S)
        title = label(re.sub('<[^>]+>','',m.group(1))) if m else u
        if title:
            section = next((c for c in CATS if u.startswith({'brain':'/science/','care':'/support/','accountability':'/accountability/','treatment':'/compounds/','resources':'/sources/'}.get(c['id'],'/__never__/'))), None)
            parent = section or CATS[0]
            ENTRIES[k]={'id':'page.'+u.strip('/').replace('/','.'),'title':title,'url':u,'path':[{'label':parent['label'],'url':parent['url']},{'label':title,'url':u}],'summary':'','search':''}
    if k in ENTRIES:
        m=re.search(r'<meta\s+name="description"\s+content="([^"]*)"',source)
        ENTRIES[k]['summary']=html.unescape(m.group(1)) if m else words[:180]
        ENTRIES[k]['search']=words[:30000]
        if ENTRIES[k].get('alias'):
            ENTRIES[ENTRIES[k]['alias']]['search']=words[:30000]
            ENTRIES[ENTRIES[k]['alias']]['summary']=ENTRIES[k]['summary']

# Include ordinary unlisted pages (for example service comparisons) in their
# section, rather than silently making them searchable but impossible to browse.
listed = {canonical(n['url']) for n in []}
def collect(nodes):
    for n in nodes:
        if n.get('children'): collect(n['children'])
        else: listed.add(canonical(n['url']))
collect(CATS); collect(GLOBALS)
for k,e in list(ENTRIES.items()):
    if k in listed or e.get('alias') or k.startswith('/guide/static/') or k in ['/navigation/','/navigation-preview/','/contact/thanks/']: continue
    parent=next((c for c in CATS if c['label']==e['path'][0]['label']),CATS[0])
    parent['children'].append({'id':e['id'],'label':e['title'],'url':e['url']})
    listed.add(k)

SEARCH=[]
seen=set()
for k,e in ENTRIES.items():
    if e.get('alias') or k in seen or k in ['/navigation/','/navigation-preview/','/contact/thanks/']: continue
    seen.add(k)
    SEARCH.append(e)
# Location records are small. Article text belongs only in the search array,
# not repeated for every static alias and again in every location record.
LOCATION={k:{field:e[field] for field in ['id','title','url','path','alias'] if field in e} for k,e in ENTRIES.items()}
DATA={'version':'2026-10-13.1','categories':CATS,'global':GLOBALS,'entries':LOCATION,'search':SEARCH}
(SITE/'js/navigation-data.js').write_text('/* Generated by tools/build_navigation.py. */\nwindow.MJB_NAV = '+json.dumps(DATA,ensure_ascii=False,separators=(',',':'))+';\n')

def fallback(nodes):
    out=['<ul>']
    for n in nodes:
        if n.get('children'):
            out.append('<li><details><summary>'+html.escape(n['label'])+'</summary><a href="'+html.escape(n['url'],quote=True)+'">Section overview</a>'+fallback(n['children'])+'</details></li>')
        else: out.append('<li><a href="'+html.escape(n['url'],quote=True)+'">'+html.escape(n['label'])+'</a></li>')
    return ''.join(out)+'</ul>'
nav=SITE/'navigation';nav.mkdir(exist_ok=True)
(nav/'index.html').write_text('''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Browse all topics — MJB ADHD</title><meta name="description" content="Browse MJB ADHD by topic with an accessible expandable index."><link rel="canonical" href="https://mjb-adhd.org.uk/navigation/"><link rel="stylesheet" href="/css/core.css"><link rel="stylesheet" href="/css/sleek.css"></head><body data-page="navigation"><a class="skip-link" href="#main-content">Skip to content</a><header id="site-header" class="top"><a href="/">MJB ADHD home</a></header><main class="wrap" id="main-content"><h1>Browse all topics</h1><p>Choose a category to see its pages. This index works without JavaScript.</p><nav class="topic-index" aria-label="All topics">'''+fallback(CATS+GLOBALS)+'''</nav></main><script defer src="/js/registry.js"></script><script defer src="/js/app.js"></script><script defer src="/js/interact.js"></script></body></html>''')

for p in SITE.rglob('*.html'):
    # Keep the bundled offline guide self-contained; hosted routes are enhanced.
    if p.name=='guidebook.html': continue
    s=p.read_text()
    if '<body' not in s or '</head>' not in s or '</body>' not in s: continue
    if '/css/navigation.css' not in s:
        s=s.replace('</head>','<link rel="stylesheet" href="/css/navigation.css">\n</head>')
    if '/js/navigation-data.js' not in s:
        # Before app.js so it can use the shared search records.
        at=re.search(r'<script[^>]*\bsrc=["\'][^"\']*(?:js/app\.js|guide-data\.js)["\'][^>]*>',s)
        add='<script defer src="/js/navigation-data.js"></script>\n'
        s=s[:at.start()]+add+s[at.start():] if at else s.replace('</body>',add+'</body>')
    if '/js/navigation.js' not in s:
        s=s.replace('</body>','<script defer src="/js/navigation.js"></script>\n</body>')
    if 'id="site-header"' in s and '/navigation/">Browse all topics' not in s:
        s=s.replace('</header>','<noscript><a href="/navigation/">Browse all topics</a></noscript></header>',1)
    p.write_text(s)
print(f'Navigation: {len(CATS)} categories, {len(SEARCH)} searchable destinations, {len(ENTRIES)} route/alias records.')
