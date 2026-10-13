#!/usr/bin/env python3
"""Original vector meme cards: exact text, reusable site/social assets."""
import html,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];SITE=ROOT/'site';A=SITE/'assets/relatable';A.mkdir(parents=True,exist_ok=True)
cards=[
 {'id':'one-tab','title':'One useful tab','top':'ME: One useful tab.','bottom':'THE TABS: We invited friends.','caption':'One question can turn into several detours. This is a relatable exaggeration, not a diagnostic example.','alt':'Original two-panel meme: one browser tab becomes many tabs. Text: Me: One useful tab. The tabs: We invited friends.','link':'/guide/index.html#/n/memory-time-awareness'},
 {'id':'start-button','title':'The missing start button','top':'THE PLAN: Start the thing.','bottom':'THE START BUTTON: Please wait.','caption':'Wanting to act and getting started can feel very different. The image illustrates an experience, not a proven mechanism.','alt':'Original two-panel meme: a clear task plan beside a waiting start button. Text: The plan: Start the thing. The start button: Please wait.','link':'/support/quick-starts/'},
 {'id':'two-minutes','title':'Just two minutes','top':'ME: Just two minutes.','bottom':'TIME: That was a suggestion.','caption':'A joke about losing track of time while absorbed. Experiences vary, and this image cannot identify ADHD.','alt':'Original two-panel meme: a clock labelled 10:00 becomes 12:00. Text: Me: Just two minutes. Time: That was a suggestion.','link':'/guide/index.html#/n/memory-time-awareness'},
]
for c in cards:
 e=html.escape
 s=f'<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="640" viewBox="0 0 1000 640"><title>{e(c["title"])}</title><desc>{e(c["alt"])}</desc><rect width="1000" height="640" fill="#080d0a"/><rect x="24" y="24" width="952" height="592" rx="24" fill="#101a14" stroke="#3c6b49" stroke-width="2"/><text x="52" y="72" fill="#78eaa0" font-family="sans-serif" font-size="19">MJB ADHD · ORIGINAL RELATABLE EXAMPLE</text><text x="52" y="140" fill="#eff6ed" font-family="sans-serif" font-size="36" font-weight="700">{e(c["top"])}</text><path d="M52 319h896" stroke="#3c6b49" stroke-width="2"/><text x="52" y="382" fill="#eff6ed" font-family="sans-serif" font-size="36" font-weight="700">{e(c["bottom"])}</text>'
 if c['id']=='one-tab':
  s+='<rect x="54" y="181" width="300" height="78" rx="10" fill="#263c2e" stroke="#78eaa0"/><text x="78" y="231" fill="#eff6ed" font-family="sans-serif" font-size="24">One question</text>'
  for i in range(12):s+=f'<rect x="{54+i*70}" y="{428+(i%2)*18}" width="64" height="94" rx="8" fill="#263c2e" stroke="#78eaa0"/><text x="{67+i*70}" y="{482+(i%2)*18}" fill="#eff6ed" font-family="sans-serif" font-size="20">{i+1}</text>'
 elif c['id']=='start-button':
  s+='<path d="M74 213l18 18 34-42" stroke="#78eaa0" stroke-width="8" fill="none"/><text x="158" y="230" fill="#eff6ed" font-family="sans-serif" font-size="27">Task understood. Intention present.</text><rect x="55" y="426" width="440" height="106" rx="20" fill="#263c2e" stroke="#78eaa0"/><text x="95" y="493" fill="#b9c9bc" font-family="sans-serif" font-size="33">START ... loading</text>'
 else:
  for y,t in [(230,'10:00'),(500,'12:00')]:s+=f'<circle cx="93" cy="{y-13}" r="42" fill="none" stroke="#78eaa0" stroke-width="5"/><path d="M93 {y-40}v27l22 12" stroke="#78eaa0" stroke-width="5" fill="none"/><text x="163" y="{y}" fill="#eff6ed" font-family="sans-serif" font-size="46">{t}</text>'
 s+='<text x="52" y="584" fill="#aac2b0" font-family="sans-serif" font-size="18">Illustration of experience · not a diagnostic test or biological mechanism</text></svg>'
 (A/(c['id']+'.svg')).write_text(s)
(A/'manifest.json').write_text(json.dumps({'creator':'MJB ADHD','provenance':'Original coded vector layouts and wording; no third-party meme artwork','cards':cards},indent=2)+'\n')
def fig(c):
 e=html.escape
 return f'<figure class="atlas-figure"><h3>{e(c["title"])}</h3><img src="/assets/relatable/{c["id"]}.svg" width="1000" height="640" loading="lazy" alt="{e(c["alt"])}"><figcaption>{e(c["caption"])}</figcaption><p><a href="{c["link"]}">Explore the related explanation</a> · <a href="/assets/relatable/{c["id"]}.svg">Open image</a></p></figure>'
p=SITE/'support/relatable-examples';p.mkdir(parents=True,exist_ok=True)
(p/'index.html').write_text('''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relatable examples — MJB ADHD</title><meta name="description" content="Original relatable illustrations about starting, browser detours and time awareness, with clear explanations and deeper links."><link rel="canonical" href="https://mjb-adhd.org.uk/support/relatable-examples/"><link rel="stylesheet" href="/css/core.css"><link rel="stylesheet" href="/css/sleek.css"><link rel="stylesheet" href="/css/atlas.css"></head><body data-page="relatable-examples"><a class="skip-link" href="#main-content">Skip to content</a><header id="site-header" class="top"><a href="/">MJB ADHD home</a></header><main class="wrap" id="main-content"><h1>Relatable examples</h1><p class="lede">Sometimes a picture gets the experience across quickly. These original examples are jokes and illustrations; experiences vary, and recognising one does not establish a diagnosis.</p>'''+''.join(fig(c) for c in cards)+'''</main><script defer src="/js/registry.js"></script><script defer src="/js/app.js"></script><script defer src="/js/interact.js"></script></body></html>''')
p=SITE/'support/quick-starts/index.html';s=p.read_text();start='<!-- relatable:pilot:start -->';end='<!-- relatable:pilot:end -->'
import re
s=re.sub(start+'.*?'+end,'',s,flags=re.S)
block=start+'<section aria-label="A relatable example">'+fig(cards[1])+'<p><a href="/support/relatable-examples/">More relatable examples</a></p></section>'+end
marker='  <!-- library:start -->' if '  <!-- library:start -->' in s else '</main>'
s=s.replace(marker,block+marker,1)
if '/css/atlas.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/css/atlas.css">\n</head>')
p.write_text(s);print('Three original meme cards and a regular-site pilot staged.')
