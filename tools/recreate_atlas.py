#!/usr/bin/env python3
"""Recreate held figures as original SVGs; build readable topic pages and hub.

Run after stage_atlas.py to preserve the reviewed four-figure pilot, before the
navigation builder. Raster generation uses render_atlas.cjs afterwards.
"""
import html,json,math,re,hashlib,xml.etree.ElementTree as ET
from pathlib import Path
from PIL import ImageFont
from atlas_catalog import C
from atlas_sources import N
ROOT=Path(__file__).resolve().parents[1];SITE=ROOT/'site';Q=ROOT/'content-queue/next-upload-batch/navigation-atlas-2026-10-13'
REG=json.loads((Q/'figure-review-register.json').read_text())
OLD={f['id']:f for f in REG['figures']};pilot=json.loads((SITE/'assets/atlas/manifest.json').read_text())
PUBLIC={f['id']:f for f in pilot['figures'] if f['id'] in ['F00','F04','F36','F39']}
SOURCES={s['id']:s for f in OLD.values() for s in f['sources']};SOURCES.update(N)
GROUPS=[('overview','Overview and genetic evidence','F00 F01 F10 F11 F23 F31 F39'),('synthesis','Supply, synthesis and cofactors','F02 F03 F12 F13 F16 F20 F32 F33 F37'),('synapses','Synapses and receptor signalling','F04 F05 F06 F07 F14 F15 F17 F18 F34 F35 F38'),('energy','Energy and cellular support','F08 F19 F26 F27 F29 F36'),('context','Context and arousal','F09 F21 F22 F28 F30'),('medicines','Medicine handling and targets','F24 F25 F40')]
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def wrap(s,width,size,bold=False):
 font=ImageFont.truetype(BOLD if bold else FONT,size);rows=[];row=''
 for word in s.split():
  candidate=(row+' '+word).strip()
  if row and font.getlength(candidate)>width:rows.append(row);row=word
  else:row=candidate
 if row:rows.append(row)
 return rows
def T(s,x,y,size=25,width=1440,bold=False,colour='#182e38',cls=''):
 rows=wrap(s,width,size,bold);line=round(size*1.36)
 return '<text class="'+cls+'" x="'+str(x)+'" y="'+str(y)+'" font-size="'+str(size)+'" font-weight="'+('700' if bold else '400')+'" fill="'+colour+'">'+''.join('<tspan x="'+str(x)+'" dy="'+str(0 if i==0 else line)+'">'+html.escape(v)+'</tspan>' for i,v in enumerate(rows))+'</text>',len(rows)*line
def svg(spec,title):
 # Connected flows snake across two rows. Comparative lanes remain left to right.
 order=[0,1,2,5,4,3] if spec['mode'] in ['flow','cycle'] else [0,1,2,3,4,5]
 positions={i:(60+(order.index(i)%3)*530,240+(order.index(i)//3)*330) for i in range(6)}
 w,h=420,230;colours={'evidence':('#f0eaf8','#7355a6'),'limit':('#fff4db','#9c6a17'),'cofactor':('#eaf3ff','#3a6d99'),'supply':('#eaf3ff','#3a6d99'),'origin':('#f0eaf8','#7355a6'),'network':('#eaf4ee','#29705e'),'clock':('#eaf3ff','#3a6d99'),'sleep':('#f0eaf8','#7355a6'),'process':('#eaf4ee','#29705e')}
 s=['<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1080" viewBox="0 0 1600 1080" role="img" aria-labelledby="title desc" font-family="DejaVu Sans,sans-serif">','<title id="title">'+html.escape(title)+'</title><desc id="desc">'+html.escape(spec['explanation'])+'</desc>','<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#45646e"/></marker></defs>','<rect width="1600" height="1080" fill="#fbfcf8"/><rect width="1600" height="10" fill="#28705e"/>']
 s.append(T('MJB ADHD / PROCESS ATLAS  ·  '+spec['id'],60,61,21,bold=True,colour='#29705e')[0]);s.append(T(title,60,120,38,bold=True)[0]);s.append(T(spec['kicker'],60,172,24)[0])
 # Connectors are behind nodes. Lines indicate the named relationship only.
 routes=[]
 for idx,e in enumerate(spec['edges']):
  a,b=positions[e['start']],positions[e['end']];ax,ay=a[0]+w/2,a[1]+h/2;bx,by=b[0]+w/2,b[1]+h/2
  if ay==by and abs(ax-bx)>540:
   # Return/skip edges must go around intermediate boxes, not through them.
   upper=ay<500; y1=a[1]+h if upper else a[1]; y2=b[1]+h if upper else b[1]
   lane=495+(idx%3)*22
   d=f'M{ax} {y1+ (8 if upper else -8)}V{lane}H{bx}V{y2+ (12 if upper else -12)}';lx=(ax+bx)/2-110;ly=lane-8;lw=220
  elif ay==by:
   right=bx>ax;x1=a[0]+w if right else a[0];x2=b[0] if right else b[0]+w
   d=f'M{x1+ (8 if right else -8)} {ay}H{x2- (12 if right else -12)}';lx=(x1+x2)/2-48;ly=ay-33;lw=96
  elif ax==bx:
   down=by>ay;y1=a[1]+h if down else a[1];y2=b[1] if down else b[1]+h
   d=f'M{ax} {y1+ (8 if down else -8)}V{y2- (12 if down else -12)}';lx=ax+16;ly=(y1+y2)/2-10;lw=180
  else:
   down=by>ay;y1=a[1]+h if down else a[1];y2=b[1] if down else b[1]+h
   lane=495+(idx%3)*22;d=f'M{ax} {y1+ (8 if down else -8)}V{lane}H{bx}V{y2- (12 if down else -12)}';lx=(ax+bx)/2-105;ly=lane-8;lw=210
  dash=' stroke-dasharray="10 8"' if spec['mode']=='network' else ''
  arrow='' if spec['mode']=='network' else ' marker-end="url(#arrow)"'
  routes.append('<path d="'+d+'" fill="none" stroke="#45646e" stroke-width="3"'+dash+arrow+'/>')
  if spec['mode']!='network':routes.append(T(e['label'],lx,ly,16,width=lw,colour='#34565f',cls='edge-label')[0])
 s+=routes
 if spec['mode']=='membrane':s.append('<rect x="1094" y="225" width="12" height="280" rx="6" fill="#83b6bd" opacity=".6"/>')
 for i,n in enumerate(spec['nodes']):
  x,y=positions[i];fill,accent=colours[n['kind']]
  s.append(f'<g class="atlas-node" data-node="{i+1}"><rect class="node-box" x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="{fill}" stroke="{accent}" stroke-width="2"/><circle cx="{x+30}" cy="{y+31}" r="15" fill="{accent}"/><text x="{x+30}" y="{y+37}" font-size="17" text-anchor="middle" fill="white" font-weight="700">{i+1}</text>')
  head,hh=T(n['title'],x+56,y+38,25,width=w-78,bold=True);s.append(head)
  body,bh=T(n['body'],x+24,y+42+hh,23,width=w-48);s.append(body)
  assert 42+hh+bh<h-8,(spec['id'],n['title'],'node text exceeds height')
  s.append('</g>')
 s.append('<rect x="60" y="836" width="1480" height="129" rx="16" fill="#e8f1ed"/>')
 s.append(T('KEEP THE DISTINCTION',84,871,18,bold=True,colour='#29705e')[0]);s.append(T(spec['takeaway'],84,914,27,width=1415,bold=True)[0])
 legend='Numbered boxes are comparison points; no causal arrows implied.' if not spec['edges'] else ('Dashed lines: statistical relationships, not anatomical tracts.' if spec['mode']=='network' else 'Arrows: the labelled process or relationship; omitted steps are explained below the image.')
 s.append(T(legend,60,1003,20,colour='#49626a')[0]);s.append(T('Sources: '+', '.join(spec['source_ids'].split())+'  ·  Scope and full references accompany this diagram.',60,1045,18,colour='#49626a')[0]);s.append('</svg>')
 data=''.join(s);ET.fromstring(data);return data

title_overrides={'F26':'Mitochondrial quality control: one mitophagy route','F22':'Adrenal hormones: two tissue compartments','F28':'Nutrition: supply, transport and evidence limits'}
for spec in C:
 f=OLD[spec['id']];title=title_overrides.get(f['id'],f['title']);slug=re.sub('[^a-z0-9]+','-',title.lower()).strip('-');base=f['id']+'_'+slug
 for sub in ['svg','web','full']:(SITE/'assets/atlas'/sub).mkdir(parents=True,exist_ok=True)
 paths={k:f'assets/atlas/{folder}/{base}.{ext}' for k,folder,ext in [('svg','svg','svg'),('web','web','webp'),('full','full','png')]}
 data=svg(spec,title);(SITE/paths['svg']).write_text(data)
 entry=dict(id=f['id'],title=title,**paths,width=1600,height=1080,credit='MJB ADHD · original vector reconstruction',caption=spec['kicker']+' '+spec['takeaway'],scope='Evidence interpretation' if spec['mode'] in ['compare','network'] and f['id'] in ['F01','F10','F11','F23','F27','F31'] else 'Scoped educational mechanism',long_description=spec['explanation'],alt_text=title+'. '+spec['kicker'],sources=[SOURCES[k] for k in spec['source_ids'].split()],version='review-2026-10-13.2',reviewed='2026-10-13',svg_sha256=hashlib.sha256(data.encode()).hexdigest(),changes=['Recreated from a reviewed text specification using original editable vector elements; no BioRender or other proprietary artwork copied.','Replaced production instructions with reader captions, defined scope, explicit compartments/relationships and accessible explanation.'],relationships=[{'from':spec['nodes'][e['start']]['title'],'to':spec['nodes'][e['end']]['title'],'relationship':e['label']} for e in spec['edges']],nodes=spec['nodes'])
 PUBLIC[f['id']]=entry
 f.update(review_status='RECREATED_FOR_STAGING',rights_status='ORIGINAL_CODE_NO_THIRD_PARTY_ARTWORK',reviewed='2026-10-13',review_scope=entry['scope'],review_limit='AI source and presentation review for the stated educational scope; no independent expert validation or user release approval implied.',release_approved=False,replacement_svg=paths['svg'],replacement_sources=entry['sources'],changes=entry['changes'])

def esc(s):return html.escape(str(s),quote=True)
def figure(f):
 relations=''.join('<li>'+esc(e['from'])+' → '+esc(e['to'])+': '+esc(e['relationship'])+'</li>' for e in f.get('relationships',[]))
 return f'''<figure class="atlas-figure" id="atlas-{f['id']}"><h3>{esc(f['title'])}</h3><p class="atlas-scope">{esc(f['scope'])}</p><a href="/{f['svg']}" data-atlas-enlarge><img src="/{f['web']}" width="{f['width']}" height="{f['height']}" loading="lazy" alt="{esc(f['alt_text'])}"></a><figcaption>{esc(f['caption'])}<span class="atlas-credit">{esc(f['credit'])} · Reviewed {f['reviewed']}</span></figcaption><p><a href="/{f['svg']}" data-atlas-enlarge>Open larger diagram</a> · <a href="/{f['full']}">Full-size PNG</a> · <a href="/science/process-atlas/{f['id'].lower()}/">Diagram page</a></p><details class="atlas-text"><summary>Read the diagram explanation and sources</summary><p>{esc(f['long_description'])}</p>{'<ul class="atlas-relationships">'+relations+'</ul>' if relations else ''}<ul>{''.join('<li><a href="'+esc(s['url'])+'" rel="noopener">'+esc(s['title'])+'</a></li>' for s in f['sources'])}</ul></details></figure>'''

def page(title,body,depth=2,description='Reviewed biological process diagrams with plain-language explanations and original references.'):
 return f'''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)} — MJB ADHD</title><meta name="description" content="{esc(description)}"><link rel="stylesheet" href="/css/core.css"><link rel="stylesheet" href="/css/sleek.css"><link rel="stylesheet" href="/css/atlas.css"></head><body data-page="process-atlas" data-depth="{depth}"><a class="skip-link" href="#main-content">Skip to content</a><header id="site-header" class="top"><a href="/">MJB ADHD home</a></header><main class="wrap" id="main-content">{body}</main><script defer src="/js/registry.js"></script><script defer src="/js/app.js"></script><script defer src="/js/interact.js"></script><script defer src="/js/atlas.js"></script></body></html>'''

intro='''<h1>Process atlas</h1><p class="lede">A visual way into biology: choose a topic, look at the process, then open the explanation when you need more detail.</p><p>Normal physiology, research associations and individual clinical conclusions are different kinds of information. Each diagram names its scope and links its sources. The images are educational schematics rather than diagnostic tests or personal treatment instructions.</p>'''
toc='<nav class="atlas-topics" aria-label="Process atlas topics">'+''.join('<a href="#'+k+'">'+esc(t)+'</a>' for k,t,ids in GROUPS)+'</nav>'
body=intro+toc
for k,title,ids in GROUPS:
 body+=f'<section id="{k}" aria-labelledby="heading-{k}"><h2 id="heading-{k}">{esc(title)}</h2><div class="atlas-tiles">'
 for id in ids.split():
  f=PUBLIC[id];f['url']='/science/process-atlas/'+id.lower()+'/'
  body+=f'<a class="atlas-tile" href="{f["url"]}"><img src="/{f["web"]}" width="{f["width"]}" height="{f["height"]}" loading="lazy" alt=""><span>{esc(f["title"])}</span><small>{esc(f["scope"])}</small></a>'
  p=SITE/f['url'].strip('/');p.mkdir(parents=True,exist_ok=True)
  detail=f'<p><a href="/science/process-atlas/#{k}">All diagrams in {esc(title.lower())}</a></p><h1>{esc(f["title"])}</h1><p class="lede">{esc(f["caption"])}</p>'+figure(f)+f'<section class="atlas-explanation"><h2>What the diagram shows</h2><p>{esc(f["long_description"])}</p></section><p><a href="/science/process-atlas/#{k}">Return to the process atlas</a></p>'
  (p/'index.html').write_text(page(f['title'],detail,3,f['caption']))
 body+='</div></section>'
# Four already-reviewed pilots remain on the hub for direct comparison/review.
body+='<section aria-label="Featured diagrams"><h2>Four starting points</h2>'+''.join(figure(PUBLIC[k]) for k in ['F00','F04','F36','F39'])+'</section>'
(SITE/'science/process-atlas/index.html').write_text(page('Process atlas',body))
(SITE/'assets/atlas/manifest.json').write_text(json.dumps({'version':'2026-10-13.2','groups':[{'id':k,'title':t,'figures':ids.split()} for k,t,ids in GROUPS],'figures':[PUBLIC[k] for k in sorted(PUBLIC)]},indent=2)+'\n')
REG.update(staged_figures=sorted(PUBLIC),recreated_figures=[s['id'] for s in C],remaining_held=0,review_stage='AI_SOURCE_AND_PRESENTATION_REVIEW_PENDING_USER')
(Q/'figure-review-register.json').write_text(json.dumps(REG,indent=2)+'\n')
(Q/'atlas-source-review-register.json').write_text(json.dumps({'checked':'2026-10-13','sources':SOURCES,'limits':'Primary study abstracts, curated pathway summaries and official product/reference text used for scoped schematics; not all source full texts accessed.'},indent=2)+'\n')
# Selected regular-site placements break up text without dumping every image.
placements={'science/what-is-adhd/index.html':['F01','F10'],'science/genetics/gen-03/index.html':['F03'],'science/genetics/gen-02/index.html':['F31'],'science/genetics/gen-06/index.html':['F08'],'compounds/index.html':['F24','F25','F40']}
for rel,ids in placements.items():
 p=SITE/rel;s=p.read_text();s=re.sub(r'<!-- atlas:expanded:start -->.*?<!-- atlas:expanded:end -->\s*','',s,flags=re.S)
 block='<!-- atlas:expanded:start --><section aria-label="Visual explanations">'+''.join(figure(PUBLIC[id]) for id in ids)+'<p><a href="/science/process-atlas/">Explore all 41 process diagrams</a></p></section><!-- atlas:expanded:end -->\n'
 marker='  <!-- library:start -->' if '  <!-- library:start -->' in s else '</main>';s=s.replace(marker,block+marker,1)
 if '/css/atlas.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/css/atlas.css">\n</head>')
 if '/js/atlas.js' not in s:s=s.replace('</body>','<script defer src="/js/atlas.js"></script>\n</body>')
 p.write_text(s)
print('Recreated 37 original SVGs; all 41 figures have topic pages, captions, source links and a grouped hub. Raster regeneration remains.')
