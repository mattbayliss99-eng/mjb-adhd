#!/usr/bin/env python3
"""Place generated images alongside relevant sections instead of at page ends.

Run after the atlas/meme/guide builders and before build_navigation.py.
Existing prose, libraries and navigation remain untouched.
"""
from pathlib import Path
import re,html
SITE=Path(__file__).resolve().parents[1]/'site'
plans={
 'index.html':{'find-your-place':'Start with what you are experiencing'},
 'science/what-is-adhd/index.html':{'atlas-F00':'The usual mix-up','atlas-F01':'Limits','atlas-F10':'Next','all-channels':'Sources'},
 'science/genetics/gen-02/index.html':{'atlas-F39':'Study types at a glance','atlas-F31':'Limits'},
 'science/genetics/gen-03/index.html':{'atlas-F03':'What medicines do in this picture','atlas-F04':'The working model: component-level bottlenecking'},
 'science/genetics/gen-06/index.html':{'atlas-F08':'Questions worth asking a neurologist','atlas-F36':'Limits'},
 'compounds/index.html':{'atlas-F25':'3. What your response pattern may be telling you','atlas-F24':'5. Potentially useful adjuncts / supplements','atlas-F40':'4. Medical cannabis'},
 'support/quick-starts/index.html':{'start-button':'Next'},
 'support/when-help-doesnt-come/index.html':{'close-the-handover':'3. A short message you can copy','briefly':'4. Spend your energy where a decision can be made'},
}
for rel,placement in plans.items():
 p=SITE/rel;s=p.read_text();old=re.findall(r'<!-- visual:placed:[^>]+ -->.*?<!-- visual:placed:end -->',s,re.S);s=re.sub(r'<!-- visual:placed:[^>]+ -->.*?<!-- visual:placed:end -->\s*','',s,flags=re.S)
 blocks=old+re.findall(r'<!-- (?:atlas|relatable|visual):(?:pilot|expanded|guides):start -->.*?<!-- (?:atlas|relatable|visual):(?:pilot|expanded|guides):end -->',s,re.S)
 figs=[]
 for block in blocks:
  figs+=re.findall(r'<figure\b.*?</figure>',block,re.S);s=s.replace(block,'')
 unique={}
 for f in figs:
  id_match=re.search(r'<figure[^>]*\bid="([^"]+)"',f)
  id=id_match.group(1) if id_match else None
  if not id:
   src=re.search(r'/assets/relatable/([^".]+)\.svg',f);id=src.group(1) if src else None
  unique[id]=f
 for id,f in unique.items():
  heading=placement.get(id)
  if not heading:continue
  marker=next((m for m in re.finditer(r'<h2\b[^>]*>.*?</h2>',s,re.S) if html.unescape(re.sub('<[^>]+>','',m.group())).strip()==heading),None)
  if not marker:raise ValueError((rel,id,heading,'placement heading missing'))
  block='<!-- visual:placed:'+id+' --><section aria-label="Related visual explanation">'+f+'</section><!-- visual:placed:end -->\n'
  s=s[:marker.start()]+block+s[marker.start():]
 p.write_text(re.sub(r'[ \t]+(?=\n)','',s))
print('Placed generated visuals alongside the related article sections.')
