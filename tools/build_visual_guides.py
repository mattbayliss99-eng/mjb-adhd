#!/usr/bin/env python3
"""Four original practical illustrations; no private case data or external art."""
import html,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];SITE=ROOT/'site';A=SITE/'assets/visual-guides';A.mkdir(parents=True,exist_ok=True)
guides=[
 dict(id='read-the-evidence',title='Three different evidence questions',intro='A mechanism, an association and an individual conclusion are different kinds of evidence.',cards=[('Mechanism','How can a biological process work?','Enzymes, transporters, cells and model experiments.'),('Association','What varies together in a study?','A statistical result needs its sample, effect and uncertainty.'),('Individual conclusion','What does this mean for this person?','Clinical and genetic interpretation needs additional evidence.')],note='A connection between these questions needs evidence; it is not automatic.',link='/science/process-atlas/',caption='Use the question to recognise the scope of a claim. A normal pathway does not prove a defect; an association does not prove an individual cause.'),
 dict(id='close-the-handover',title='Make a handover visible',intro='A practical checklist for following a referral or transfer; ask the service which process applies.',cards=[('The sender','What was sent, when and to whom?','Keep the referral, summary and reference.'),('The receiver','Was it received and accepted?','Separate delivery, triage, acceptance and responsibility.'),('The next action','Who does what, by when?','Record the plan, contact and how an overdue action is escalated.')],note='A sent message is not the same event as an accepted handover or a completed action.',link='/guide/index.html#/n/transfer-handover',caption='This is a record-organising tool, not a declaration that every referral guarantees treatment. Ask for the actual status and next decision.'),
 dict(id='prepare-the-question',title='A short account with useful detail',intro='Lead with what has changed and the decision you need; keep the supporting detail available.',cards=[('Change and impact','What is different from your baseline?','Name the practical effect and relevant dates.'),('Evidence and uncertainty','Which record supports which point?','Separate observation, your report and a working hypothesis.'),('Decision needed','What answer or next action are you asking for?','Ask who owns it and when you will receive the answer.')],note='A clear short account can link to a full chronology without trying to fit everything into one box.',link='/guide/index.html#/n/appointment-preparation',caption='A template for structuring an appointment question or written update. It does not replace reporting urgent concerns to the relevant clinical service.'),
 dict(id='find-your-place',title='Browse, search and keep your place',intro='Three routes through this website, with the current section always visible.',cards=[('Browse by topic','Open the menu, then choose a category.','Only the selected branch opens; the current page is marked.'),('Search a specific term','Use search when you know the word or phrase.','Results include the section path as well as the title.'),('Move through parents','Use the location path or optional desktop sidebar.','Return to a parent section without retracing every link.')],note='The location path describes the topic hierarchy, not your private browsing history.',link='/navigation/',caption='The menu and breadcrumb work together. On larger screens you can pin the explorer; on a phone it opens as a drawer.'),
]
def e(s):return html.escape(s,quote=True)
for g in guides:
 s=f'<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="850" viewBox="0 0 1440 850" role="img" aria-labelledby="t d" font-family="DejaVu Sans,sans-serif"><title id="t">{e(g["title"])}</title><desc id="d">{e(g["intro"]+" "+g["caption"])}</desc><rect width="1440" height="850" fill="#0d1713"/><rect width="1440" height="9" fill="#79e8ab"/><text x="54" y="60" fill="#79e8ab" font-size="20" font-weight="700">MJB ADHD / A USEFUL VISUAL</text><text x="54" y="123" fill="#f1f8f3" font-size="42" font-weight="700">{e(g["title"])}</text>'
 from PIL import ImageFont
 font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
 def text(t,x,y,width,size=25,col='#f1f8f3',bold=False):
  f=ImageFont.truetype(font,size);rows=[];row=''
  for word in t.split():
   z=(row+' '+word).strip()
   if row and f.getlength(z)>width:rows.append(row);row=word
   else:row=z
  rows.append(row)
  return f'<text x="{x}" y="{y}" font-size="{size}" fill="{col}" font-weight="{700 if bold else 400}">'+''.join(f'<tspan x="{x}" dy="{0 if i==0 else size*1.4}">{e(r)}</tspan>' for i,r in enumerate(rows))+'</text>'
 s+=text(g['intro'],54,180,1325,25)
 for i,(title,q,detail) in enumerate(g['cards']):
  x=54+i*452
  s+=f'<rect x="{x}" y="265" width="426" height="342" rx="20" fill="#183026" stroke="#4f9773" stroke-width="2"/><circle cx="{x+34}" cy="306" r="19" fill="#79e8ab"/><text x="{x+34}" y="314" text-anchor="middle" fill="#0d1713" font-size="23" font-weight="700">{i+1}</text>'
  s+=text(title,x+24,369,378,29,'#79e8ab',True)+text(q,x+24,432,378,26)+text(detail,x+24,523,378,23,'#c4d9cc')
 s+='<rect x="54" y="657" width="1332" height="127" rx="18" fill="#223b2e"/>'+text(g['note'],78,704,1283,26)+ '<text x="54" y="828" fill="#9bbbaa" font-size="18">Original MJB illustration · practical explanation · open the related page for detail</text></svg>'
 (A/(g['id']+'.svg')).write_text(s);g['alt']=g['title']+'. '+g['intro']+' '+g['note']
def fig(g):return f'<figure class="atlas-figure" id="{g["id"]}"><h3>{e(g["title"])}</h3><img loading="lazy" src="/assets/visual-guides/{g["id"]}.svg" width="1440" height="850" alt="{e(g["alt"])}"><figcaption>{e(g["caption"])}</figcaption><p><a href="{g["link"]}">Read the related explanation</a> · <a href="/assets/visual-guides/{g["id"]}.svg">Open full-size illustration</a></p><details><summary>Read the image as text</summary><p>{e(g["intro"])}</p><ul>'+''.join('<li><strong>'+e(a)+'</strong>: '+e(b)+' '+e(c)+'</li>' for a,b,c in g['cards'])+'</ul><p>'+e(g['note'])+'</p></details></figure>'
(A/'manifest.json').write_text(json.dumps({'creator':'MJB ADHD','provenance':'Original wording and code-native vector shapes; no private case data or third-party art','guides':guides},indent=2)+'\n')
p=SITE/'support/visual-guides';p.mkdir(exist_ok=True)
(p/'index.html').write_text('''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Useful visual guides — MJB ADHD</title><meta name="description" content="Short visual guides to evidence, handovers, preparing questions and finding your place on the website."><link rel="canonical" href="https://mjb-adhd.org.uk/support/visual-guides/"><link rel="stylesheet" href="/css/core.css"><link rel="stylesheet" href="/css/sleek.css"><link rel="stylesheet" href="/css/atlas.css"></head><body data-page="visual-guides" data-depth="2"><a class="skip-link" href="#main-content">Skip to content</a><header id="site-header" class="top"><a href="/">MJB ADHD home</a></header><main class="wrap" id="main-content"><h1>Useful visual guides</h1><p class="lede">Start with the picture, then read the detail when you need it.</p>'''+''.join(fig(g) for g in guides)+'''</main><script defer src="/js/registry.js"></script><script defer src="/js/app.js"></script><script defer src="/js/interact.js"></script></body></html>''')
placements={'science/process-atlas/index.html':'read-the-evidence','support/when-help-doesnt-come/index.html':'close-the-handover','help-writing/index.html':'prepare-the-question','index.html':'find-your-place'}
for rel,id in placements.items():
 p=SITE/rel
 if not p.exists():continue
 s=p.read_text();s=re.sub(r'<!-- visual:guides:start -->.*?<!-- visual:guides:end -->','',s,flags=re.S)
 block='<!-- visual:guides:start --><section aria-label="A useful visual guide">'+fig(next(g for g in guides if g['id']==id))+'</section><!-- visual:guides:end -->'
 marker='  <!-- library:start -->' if '  <!-- library:start -->' in s else '</main>';s=s.replace(marker,block+marker,1)
 if '/css/atlas.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/css/atlas.css">\n</head>')
 p.write_text(s)
print('Four original explanatory images and related regular-site placements staged.')
