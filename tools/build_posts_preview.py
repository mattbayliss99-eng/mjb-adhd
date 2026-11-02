#!/usr/bin/env python3
"""Generate finite static preview posts from the canonical candidate bank."""
from pathlib import Path
import json,html,sys
ROOT=Path(__file__).resolve().parents[1];SITE=ROOT/'site';BASE='/posts-preview/'
data=json.loads((ROOT/'content/posts/posts.json').read_text());posts=data['posts'];esc=html.escape
assert len(posts)==3 and len({p['id'] for p in posts})==3
assert all(p['evidence']['class']=='editorial' and p['status']=='draft' for p in posts)
def url(p):return BASE+'p/'+p['id'].lower()+'/'
def shell(title,body):
 return f'''<!doctype html><html lang="en-GB" data-palette="purple-green"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{esc(title)} — MJB visual posts preview</title><script src="/js/accessibility.js"></script><link rel="stylesheet" href="/css/core.css"><link rel="stylesheet" href="/css/sleek.css"><link rel="stylesheet" href="/css/navigation.css"><link rel="stylesheet" href="/css/accessibility.css"><link rel="stylesheet" href="{BASE}posts.css"></head><body data-page="posts-preview"><a class="skip-link" href="#main-content">Skip to content</a><header id="site-header" class="top"><nav class="fallback-nav" aria-label="Main"><a href="/">Home</a> · <a href="/navigation/">All topics</a> · <a href="{BASE}">Visual posts preview</a></nav></header><main id="main-content" class="wrap mjb-posts-preview">{body}</main><footer class="wrap"><p>Separate preview · draft editorial copy and illustrative assets pending review · no publication approval.</p></footer><script defer src="/js/navigation-data.js"></script><script defer src="{BASE}navigation-preview.js"></script><script defer src="/js/navigation.js"></script><script defer src="{BASE}sequence.js"></script></body></html>\n'''
outputs={};rows=[]
for i,p in enumerate(posts):
 u=url(p);prev=f'<a data-prev rel="prev" href="{url(posts[i-1])}">Previous</a>' if i else '<span>Beginning of sequence</span>'
 nxt=f'<a data-next rel="next" href="{url(posts[i+1])}">Next</a>' if i<2 else '<a href="/posts-preview/">Finish: back to topics</a>'
 dots=''.join(f'<span aria-hidden="true" class="'+('active' if n==i else '')+'">●</span>' for n in range(3))
 b=f'''<p class="kicker">Visual posts · #intro · simple</p><h1 id="post-title" tabindex="-1">{esc(p['title'])}</h1><p class="mjb-posts-notice">Editorial preview. Pending review; this sequence contains no clinical assessment or scientific evidence claims.</p><article data-post-id="{p['id']}" data-post-region tabindex="0" aria-label="Post reading region" aria-describedby="post-help"><p data-position>Post {i+1} of 3 · {p['id']}</p><figure><img src="{p['image']['src']}" alt="{esc(p['image']['alt'])}" width="784" height="1168"><figcaption>Illustrative asset · provenance review pending.</figcaption></figure>{''.join('<p>'+esc(t)+'</p>' for t in p['body'])}<nav class="mjb-posts-controls" aria-label="Introduction sequence">{prev}<span class="mjb-posts-dots">{dots}</span>{nxt}</nav></article><div data-swipe-setting hidden><label><input type="checkbox" data-swipe-toggle> Enable horizontal swipe for this sequence</label><p id="post-help">Previous and Next always work. Arrow keys work while the post reading region itself has focus. Swipe is optional; vertical scrolling stays native.</p></div><noscript><p>Previous and Next open ordinary pages. Swipe is unavailable without JavaScript.</p></noscript><p><a href="{p['article']['url']}?post-return={p['id']}" data-article>Read the full article: {esc(p['article']['label'])}</a> · <a href="{p['article']['url']}?post-return={p['id']}#post-sources" data-evidence>Article sources</a> · <a href="{BASE}">All preview topics</a></p><p data-resume-status role="status" aria-live="polite"></p>'''
 # aria-describedby must refer to a visible help element even with no JS
 b=b.replace('<div data-swipe-setting hidden>','<p id="post-help">Use the Previous and Next links to move between posts. Tab moves through controls normally.</p><div data-swipe-setting hidden>').replace('<p id="post-help">Previous','<p>Previous')
 outputs[SITE/u.lstrip('/')/'index.html']=shell(p['title'],b)
 rows.append({'url':u,'id':p['id'],'title':p['title']})
body='<h1>Visual posts preview</h1><p class="mjb-posts-notice">A finite, three-post editorial pilot. The live website and its full articles remain available through the shared navigator.</p><section aria-labelledby="intro-heading"><h2 id="intro-heading">Start here · #intro</h2><p>Three short posts about finding your way through this publication.</p><a class="mjb-posts-start" href="'+url(posts[0])+'">Start the introduction</a><p><a data-continue hidden href="'+url(posts[0])+'">Continue from your last visited post</a></p><ol class="mjb-posts-shelf">'+''.join('<li><a href="'+url(p)+'">'+esc(p['title'])+'</a><p>Simple · editorial draft</p></li>' for p in posts)+'</ol></section><section><h2>More topics</h2><p>Future post sequences are planned. These existing article destinations are available now:</p><ul><li><a href="/compounds/">Medicines and supplements</a></li><li><a href="/rights/overview/">Care access and rights</a></li></ul></section>'
outputs[SITE/'posts-preview/index.html']=shell('Topic shelves',body)
navdata=json.dumps(rows,ensure_ascii=False).replace('<','\\u003c')
outputs[SITE/'posts-preview/navigation-preview.js']='''/* Preview-only augmentation: does not rewrite the site's shared index. */
(function(){const D=window.MJB_NAV;if(!D)return;const rows='''+navdata+''';const group={id:'posts-preview',label:'Visual posts preview',url:'/posts-preview/',children:[{id:'posts-preview-home',label:'Preview topics',url:'/posts-preview/'},...rows.map(p=>({id:p.id,label:p.title,url:p.url}))]};D.categories.push(group);for(const p of [{url:'/posts-preview/',id:'posts-preview',title:'Visual posts preview'},...rows])D.entries[p.url]={id:p.id,title:p.title,url:p.url,path:p.url==='/posts-preview/'?[{label:p.title,url:p.url}]:[{label:'Visual posts preview',url:'/posts-preview/'},{label:p.title,url:p.url}]};})();
'''
outputs[SITE/'posts-preview/catalog.json']=json.dumps({'posts':rows},indent=2)+'\n'
# Inject only a query-gated return helper in the existing article. Factual body is unchanged.
article=SITE/'science/what-is-adhd/index.html';text=article.read_text();marker='<script defer src="/posts-preview/article-return.js"></script>'
if marker not in text:text=text.replace('</body>',marker+'\n</body>')
if 'id="post-sources"' not in text:text=text.replace('<h2 class="sec sec-src">Sources</h2>','<h2 class="sec sec-src" id="post-sources">Sources</h2>')
outputs[article]=text
changed=[]
for f,s in outputs.items():
 if not f.exists() or f.read_text()!=s:
  changed.append(str(f.relative_to(ROOT)))
  if '--check' not in sys.argv:f.parent.mkdir(parents=True,exist_ok=True);f.write_text(s)
if '--check' in sys.argv and changed:print('Stale generated files:',changed);sys.exit(1)
print('Posts preview: 3 editorial posts, generated files current' if '--check' in sys.argv else 'Built 3 editorial posts and preview navigation')
