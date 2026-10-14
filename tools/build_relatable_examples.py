#!/usr/bin/env python3
"""Original vector meme cards: exact text, reusable site/social assets."""
import html,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];SITE=ROOT/'site';A=SITE/'assets/relatable';A.mkdir(parents=True,exist_ok=True)
cards=[
 {'id':'one-tab','title':'One useful tab','top':'ME: One useful tab.','bottom':'THE TABS: We invited friends.','caption':'One question can turn into several detours. This is a relatable exaggeration, not a diagnostic example.','alt':'Original two-panel meme: one browser tab becomes many tabs. Text: Me: One useful tab. The tabs: We invited friends.','link':'/guide/index.html#/n/memory-time-awareness'},
 {'id':'start-button','title':'The missing start button','top':'THE PLAN: Start the thing.','bottom':'THE START BUTTON: Please wait.','caption':'Wanting to act and getting started can feel very different. The image illustrates an experience, not a proven mechanism.','alt':'Original two-panel meme: a clear task plan beside a waiting start button. Text: The plan: Start the thing. The start button: Please wait.','link':'/support/quick-starts/'},
 {'id':'two-minutes','title':'Just two minutes','top':'ME: Just two minutes.','bottom':'TIME: That was a suggestion.','caption':'A joke about losing track of time while absorbed. Experiences vary, and this image cannot identify ADHD.','alt':'Original two-panel meme: a clock labelled 10:00 becomes 12:00. Text: Me: Just two minutes. Time: That was a suggestion.','link':'/guide/index.html#/n/memory-time-awareness'},
 {'id':'remember-later','title':'I will remember that','top':'ME: I will remember that.','bottom':'BRAIN: Remember what?','caption':'A joke about losing an intention before acting on it. An external note can keep the next action visible; recognising the joke is not a diagnosis.','alt':'Original two-panel meme: a note labelled Remember this, then an empty note with a question mark. Text: Me: I will remember that. Brain: Remember what?','link':'/guide/index.html#/n/memory-time-awareness'},
 {'id':'somewhere-safe','title':'Somewhere very safe','top':'ME: It is somewhere safe.','bottom':'SOMEWHERE SAFE: Classified.','caption':'A relatable exaggeration about misplaced objects. A consistent visible home for an item can reduce searching; this experience is not unique to ADHD.','alt':'Original two-panel meme: a key placed in a box, then three identical boxes marked with question marks. Text: Me: It is somewhere safe. Somewhere safe: Classified.','link':'/support/quick-starts/'},
 {'id':'new-idea','title':'Almost finished','top':'TASK: Almost finished.','bottom':'BRAIN: New idea unlocked.','caption':'A joke about a fresh idea interrupting completion. Keeping an ideas list beside the current task can preserve the idea without losing the next step.','alt':'Original two-panel meme: a progress bar nearly full, then a bright new idea next to an unfinished bar. Text: Task: Almost finished. Brain: New idea unlocked.','link':'/support/quick-starts/'},
 {'id':'all-channels','title':'All channels selected','top':'ROOM: Just background noise.','bottom':'BRAIN: All channels selected.','caption':'An illustration of feeling overloaded by competing inputs. Sensory experiences vary and can have many explanations; this is not a diagnostic example.','alt':'Original two-panel meme: one active sound slider, then six active sliders. Text: Room: Just background noise. Brain: All channels selected.','link':'/guide/index.html#/n/sensory-feedback'},
 {'id':'briefly','title':'Explain briefly','top':'FORM: Explain it briefly.','bottom':'ME: Opens the full timeline.','caption':'A joke about fitting a complicated experience into a small form. Lead with the decision needed, then provide the supporting chronology.','alt':'Original two-panel meme: a small form with three lines, then a row of dated timeline cards. Text: Form: Explain it briefly. Me: Opens the full timeline.','link':'/guide/index.html#/n/appointment-preparation'},
 {'id':'staircase','title':'The first step','top':'PLAN: One step at a time.','bottom':'ME: Builds a staircase first.','caption':'Planning can become a task of its own. A small concrete next action can make the starting point clearer; the image is a joke, not a mechanism claim.','alt':'Original two-panel meme: one step marked Start, then a large staircase of planning steps. Text: Plan: One step at a time. Me: Builds a staircase first.','link':'/support/quick-starts/'},
]
for c in cards:
 e=html.escape
 s=f'<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="640" viewBox="0 0 1000 640"><title>{e(c["title"])}</title><desc>{e(c["alt"])}</desc><rect width="1000" height="640" fill="#080d0a"/><rect x="24" y="24" width="952" height="592" rx="24" fill="#101a14" stroke="#3c6b49" stroke-width="2"/><text x="52" y="72" fill="#78eaa0" font-family="sans-serif" font-size="19">MJB ADHD · ORIGINAL RELATABLE EXAMPLE</text><text x="52" y="140" fill="#eff6ed" font-family="sans-serif" font-size="36" font-weight="700">{e(c["top"])}</text><path d="M52 319h896" stroke="#3c6b49" stroke-width="2"/><text x="52" y="382" fill="#eff6ed" font-family="sans-serif" font-size="36" font-weight="700">{e(c["bottom"])}</text>'
 if c['id']=='one-tab':
  s+='<rect x="54" y="181" width="300" height="78" rx="10" fill="#263c2e" stroke="#78eaa0"/><text x="78" y="231" fill="#eff6ed" font-family="sans-serif" font-size="24">One question</text>'
  for i in range(12):s+=f'<rect x="{54+i*70}" y="{428+(i%2)*18}" width="64" height="94" rx="8" fill="#263c2e" stroke="#78eaa0"/><text x="{67+i*70}" y="{482+(i%2)*18}" fill="#eff6ed" font-family="sans-serif" font-size="20">{i+1}</text>'
 elif c['id']=='start-button':
  s+='<path d="M74 213l18 18 34-42" stroke="#78eaa0" stroke-width="8" fill="none"/><text x="158" y="230" fill="#eff6ed" font-family="sans-serif" font-size="27">Task understood. Intention present.</text><rect x="55" y="426" width="440" height="106" rx="20" fill="#263c2e" stroke="#78eaa0"/><text x="95" y="493" fill="#b9c9bc" font-family="sans-serif" font-size="33">START ... loading</text>'
 elif c['id']=='two-minutes':
  for y,t in [(230,'10:00'),(500,'12:00')]:s+=f'<circle cx="93" cy="{y-13}" r="42" fill="none" stroke="#78eaa0" stroke-width="5"/><path d="M93 {y-40}v27l22 12" stroke="#78eaa0" stroke-width="5" fill="none"/><text x="163" y="{y}" fill="#eff6ed" font-family="sans-serif" font-size="46">{t}</text>'
 elif c['id']=='remember-later':
  for y,t in [(182,'REMEMBER THIS'),(426,'?')]:s+=f'<rect x="54" y="{y}" width="500" height="106" rx="12" fill="#263c2e" stroke="#78eaa0"/><text x="84" y="{y+66}" fill="#eff6ed" font-family="sans-serif" font-size="33">{t}</text>'
 elif c['id']=='somewhere-safe':
  s+='<rect x="54" y="178" width="240" height="107" rx="12" fill="#263c2e" stroke="#78eaa0"/><circle cx="104" cy="225" r="20" fill="none" stroke="#78eaa0" stroke-width="6"/><path d="M123 225h60v18m-20-18v18" fill="none" stroke="#78eaa0" stroke-width="6"/>'
  for i in range(3):s+=f'<rect x="{54+i*280}" y="426" width="240" height="106" rx="12" fill="#263c2e" stroke="#78eaa0"/><text x="{150+i*280}" y="493" fill="#eff6ed" font-family="sans-serif" font-size="40">?</text>'
 elif c['id']=='new-idea':
  for y in [189,434]:s+=f'<rect x="54" y="{y}" width="650" height="58" rx="16" fill="#263c2e" stroke="#78eaa0"/><rect x="59" y="{y+5}" width="580" height="48" rx="12" fill="#78eaa0"/>'
  s+='<circle cx="826" cy="463" r="42" fill="#e8c977"/><path d="M803 520h46" stroke="#e8c977" stroke-width="7"/><text x="751" y="241" fill="#eff6ed" font-family="sans-serif" font-size="32">90%</text>'
 elif c['id']=='all-channels':
  for y,number in [(197,1),(443,6)]:
   for i in range(6):s+=f'<path d="M{90+i*133} {y}v70" stroke="#456b51" stroke-width="8"/><rect x="{72+i*133}" y="{y+(15 if i<number else 55)}" width="36" height="20" rx="6" fill="{chr(35)+("78eaa0" if i<number else "617868")}"/>'
 elif c['id']=='briefly':
  s+='<rect x="54" y="177" width="250" height="108" rx="12" fill="#263c2e" stroke="#78eaa0"/><path d="M80 207h190m-190 25h160m-160 25h100" stroke="#78eaa0" stroke-width="4"/>'
  for i in range(7):s+=f'<rect x="{54+i*126}" y="427" width="110" height="106" rx="8" fill="#263c2e" stroke="#78eaa0"/><text x="{78+i*126}" y="491" fill="#eff6ed" font-family="sans-serif" font-size="25">Day {i+1}</text>'
 elif c['id']=='staircase':
  s+='<rect x="54" y="205" width="240" height="75" rx="12" fill="#263c2e" stroke="#78eaa0"/><text x="98" y="253" fill="#eff6ed" font-family="sans-serif" font-size="29">START</text>'
  for i in range(7):s+=f'<rect x="{54+i*125}" y="{520-i*12}" width="120" height="{22+i*12}" fill="#263c2e" stroke="#78eaa0"/>'
 s+='<text x="52" y="584" fill="#aac2b0" font-family="sans-serif" font-size="18">Illustration of experience · not a diagnostic test or biological mechanism</text></svg>'
 (A/(c['id']+'.svg')).write_text(s)
(A/'manifest.json').write_text(json.dumps({'creator':'MJB ADHD','provenance':'Original coded vector layouts and wording; no third-party meme artwork','cards':cards},indent=2)+'\n')
def fig(c):
 e=html.escape
 return f'<figure class="atlas-figure"><h3>{e(c["title"])}</h3><img src="/assets/relatable/{c["id"]}.svg" width="1000" height="640" loading="lazy" alt="{e(c["alt"])}"><figcaption>{e(c["caption"])}</figcaption><p><a href="{c["link"]}">Explore the related explanation</a> · <a href="/assets/relatable/{c["id"]}.svg">Open image</a></p></figure>'
p=SITE/'support/relatable-examples';p.mkdir(parents=True,exist_ok=True)
(p/'index.html').write_text('''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relatable examples — MJB ADHD</title><meta name="description" content="Original relatable illustrations about starting, browser detours and time awareness, with clear explanations and deeper links."><link rel="canonical" href="https://mjb-adhd.org.uk/support/relatable-examples/"><link rel="stylesheet" href="/css/core.css"><link rel="stylesheet" href="/css/sleek.css"><link rel="stylesheet" href="/css/atlas.css"></head><body data-page="relatable-examples" data-depth="2"><a class="skip-link" href="#main-content">Skip to content</a><header id="site-header" class="top"><a href="/">MJB ADHD home</a></header><main class="wrap" id="main-content"><h1>Relatable examples</h1><p class="lede">Sometimes a picture gets the experience across quickly. These original examples are jokes and illustrations; experiences vary, and recognising one does not establish a diagnosis.</p>'''+''.join(fig(c) for c in cards)+'''</main><script defer src="/js/registry.js"></script><script defer src="/js/app.js"></script><script defer src="/js/interact.js"></script></body></html>''')
p=SITE/'support/quick-starts/index.html';s=p.read_text();start='<!-- relatable:pilot:start -->';end='<!-- relatable:pilot:end -->'
import re
s=re.sub(start+'.*?'+end,'',s,flags=re.S)
block=start+'<section aria-label="A relatable example">'+fig(cards[1])+'<p><a href="/support/relatable-examples/">More relatable examples</a></p></section>'+end
marker='  <!-- library:start -->' if '  <!-- library:start -->' in s else '</main>'
s=s.replace(marker,block+marker,1)
if '/css/atlas.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/css/atlas.css">\n</head>')
p.write_text(s)
# A few relevant placements; avoid filling every page with the whole gallery.
placements={'science/what-is-adhd/index.html':['all-channels'],'help-writing/index.html':['briefly'],'support/when-help-doesnt-come/index.html':['briefly']}
for rel,ids in placements.items():
 p=SITE/rel
 if not p.exists():continue
 s=p.read_text();s=re.sub(r'<!-- relatable:expanded:start -->.*?<!-- relatable:expanded:end -->','',s,flags=re.S)
 block='<!-- relatable:expanded:start --><section aria-label="Relatable illustrations">'+''.join(fig(next(c for c in cards if c['id']==id)) for id in ids)+'</section><!-- relatable:expanded:end -->'
 marker='  <!-- library:start -->' if '  <!-- library:start -->' in s else '</main>';s=s.replace(marker,block+marker,1)
 if '/css/atlas.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/css/atlas.css">\n</head>')
 p.write_text(s)
print('Nine original meme cards and selected regular-site placements staged.')
