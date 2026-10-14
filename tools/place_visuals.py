#!/usr/bin/env python3
"""Place generated images alongside relevant sections instead of at page ends.

Run after the atlas/meme/guide builders and before build_navigation.py.
Existing prose, libraries and navigation remain untouched.
"""
from pathlib import Path
import re,html,json
SITE=Path(__file__).resolve().parents[1]/'site'
ATLAS={f['id']:f for f in json.loads((SITE/'assets/atlas/manifest.json').read_text())['figures']}
plans={
 'index.html':{'find-your-place':'Start with what you are experiencing'},
 'science/what-is-adhd/index.html':{'atlas-F00':'Attention is only part of it','atlas-F01':'What this evidence can tell us','atlas-F10':'Explore ADHD in more detail','all-channels':'Sources'},
 'science/genetics/gen-02/index.html':{'atlas-F39':'Study types at a glance','atlas-F31':'What this evidence can tell us'},
 'science/genetics/gen-03/index.html':{'atlas-F03':'What medicines do in this picture','atlas-F04':'The working model: component-level bottlenecking'},
 'science/genetics/gen-06/index.html':{'atlas-F08':'Questions worth asking a neurologist','atlas-F36':'What this evidence can tell us'},
 'compounds/index.html':{'atlas-F25':'3. What your response pattern may be telling you','atlas-F24':'5. Potentially useful adjuncts / supplements','atlas-F40':'4. Medical cannabis'},
 'support/quick-starts/index.html':{'start-button':'Try one visible action'},
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
 # Source rebuilds may remove embeddings; recover them from canonical figure pages.
 for id in placement:
  if id in unique:continue
  if id.startswith('atlas-'):
   f=ATLAS[id[6:]];page=(SITE/f['url'].strip('/')/'index.html').read_text();match=re.search(r'<figure\b.*?</figure>',page,re.S)
   if match:unique[id]=re.sub(r'<figure\b', '<figure id="'+id+'"',match.group(),count=1)
  elif id=='start-button':
   page=(SITE/'support/relatable-examples/index.html').read_text();figs=re.findall(r'<figure\b.*?</figure>',page,re.S)
   match=next((f for f in figs if '/start-button.svg' in f),None)
   if match:unique[id]=match
 for id,f in unique.items():
  heading=placement.get(id)
  if not heading:continue
  marker=next((m for m in re.finditer(r'<h2\b[^>]*>.*?</h2>',s,re.S) if html.unescape(re.sub('<[^>]+>','',m.group())).strip()==heading),None)
  if not marker:raise ValueError((rel,id,heading,'placement heading missing'))
  block='<!-- visual:placed:'+id+' --><section aria-label="Related visual explanation">'+f+'</section><!-- visual:placed:end -->\n'
  s=s[:marker.start()]+block+s[marker.start():]
 p.write_text(re.sub(r'[ \t]+(?=\n)','',s))
print('Placed generated visuals alongside the related article sections.')
