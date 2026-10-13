#!/usr/bin/env python3
"""Stage the reviewed four-figure pilot from the owner's original handoff ZIP.

Vector originals are preserved in that ZIP. Corrections are explicit and logged;
raw account editor links and held figures never enter the public asset build.
"""
import html,json,re,sys,hashlib,xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile
ROOT=Path(__file__).resolve().parents[1]; SITE=ROOT/'site'
QUEUE=ROOT/'content-queue/next-upload-batch/navigation-atlas-2026-10-13'
PACK='mjb-adhd-process-atlas-handoff/'
z=ZipFile(sys.argv[1]); manifest=json.loads(z.read(PACK+'data/atlas-manifest.json'))
PILOT=['F00','F04','F36','F39']
TEXT={
'F00':('An organising framework','Read from genes and regulation through development, precursor supply, cellular energy, synaptic communication and brain circuits to cognitive performance. Sleep, stress and environment are additional inputs. The connecting arrows organise relationships for learning; they do not demonstrate one causal chain, one defect shared by everybody with ADHD or a diagnostic test.'),
'F04':('Established transport mechanism','ATP hydrolysis powers the vesicular proton pump, V-ATPase, which acidifies the vesicle. VMAT2 exchanges vesicular protons for cytosolic monoamines such as dopamine. It therefore uses an existing proton gradient rather than directly hydrolysing ATP itself. Stored transmitter can subsequently be released by exocytosis. This explains a normal mechanism, not evidence of a VMAT2 defect in a particular reader.'),
'F36':('Established cellular mechanism','NADH supplies electrons through complex I, while succinate oxidation supplies electrons through complex II. Ubiquinone transfers electrons to complex III, cytochrome c carries them to complex IV, and oxygen is the final acceptor. Complexes I, III and IV pump protons from the matrix towards the intermembrane space. Complex II is membrane-bound but does not pump protons; its label is placed on the matrix side in this simplified drawing. Proton return through ATP synthase supports ATP formation from ADP and phosphate. The diagram does not establish mitochondrial dysfunction in ADHD.'),
'F39':('Evidence interpretation framework','Begin with an associated locus, then evaluate fine-mapping, candidate variants, regulatory or coding consequences, potential effector genes and tissue-specific functions. Each step needs its own evidence. Linkage disequilibrium can leave several correlated candidates, and regulation may act over a distance. Proximity can be a clue but does not establish the causal gene by itself. These are complementary evidence types, not a mandatory sequence or a validated causal conclusion about one person.'),
}
EXTRA={
'F00':[{'id':'REVIEW-RARE','title':'Rare genetic variants confer a high risk of ADHD and implicate neuronal biology (2025 online; 2026 issue)','url':'https://www.nature.com/articles/s41586-025-09702-8'}],
'F04':[{'id':'REVIEW-VMAT2','title':'Transport and inhibition mechanism for VMAT2-mediated synaptic vesicle loading of monoamines — full text','url':'https://pmc.ncbi.nlm.nih.gov/articles/PMC10770148/'}],
'F36':[],
'F39':[{'id':'REVIEW-S2G','title':'Combining SNP-to-gene linking strategies to identify disease genes and assess disease omnigenicity','url':'https://www.nature.com/articles/s41588-022-01087-y'}],
}
ET.register_namespace('','http://www.w3.org/2000/svg')
public=[]; registry=[]
for f in manifest['figures']:
    clean={k:v for k,v in f.items() if not k.startswith('biorender_')}
    clean['producer_publish']=clean.pop('publish'); clean['release_approved']=False
    clean['review_status']='PENDING_SCIENCE_REVIEW'
    clean['rights_status']='PRODUCER_DECLARED_ORIGINAL_CODE' if f['primary_source']=='coded-svg' else 'PENDING_PLAN_AND_CITATION_CONFIRMATION'
    if clean['producer_publish']=='after-fix':clean['review_status']='CORRECTION_REQUIRED'
    if not f['sources']:clean['review_status']='SOURCE_GAP'
    if f['id']=='F40':clean['review_status']='MECHANISM_REVIEW_REQUIRED'
    if f['id']=='F23':clean['review_status']='CORRECTION_REQUIRED';clean['additional_review_note']='Image rare-variant examples incorrectly cite S02; use S04 (2025 online / 2026 issue), then review stage assignments.'
    if f['id']=='F29':clean['additional_review_note']='Clarify that GLUT1 transports glucose; oxygen must not appear to use that transporter.'
    if f['id']=='F37':clean['review_status']='CORRECTION_REQUIRED';clean['additional_review_note']='Move overlapping rearrangement label; verify chemical species against primary biochemical sources.'
    if f['id'] in PILOT:
        assert f['primary_source']=='coded-svg'
        data=z.read(PACK+f['svg']).decode()
        changes=[]
        if f['id']=='F04':
            assert 'pump. Monoamines enter only' in data
            data=data.replace('pump. Monoamines enter only','pump. Monoamine uptake is').replace('through VMAT2.</tspan>','shown here through VMAT2.</tspan>')
            changes.append('Qualified the absolute monoamine uptake wording to the depicted pathway.')
        if f['id']=='F39':
            assert 'Nearest gene ≠ causal gene' in data
            data=data.replace('Nearest gene ≠ causal gene','Nearest does not mean causal').replace('Proximity alone is not evidence of the effector gene.','Proximity alone does not establish the effector gene.')
            changes.append('Clarified that nearest-gene/proximity evidence does not by itself establish causality; it is not categorically irrelevant.')
        root=ET.fromstring(data)
        assert not root.findall('.//{http://www.w3.org/2000/svg}image'), 'Unexpected third-party artwork'
        assert 'app.biorender' not in data
        for sub in ['svg','web','full']:(SITE/'assets/atlas'/sub).mkdir(parents=True,exist_ok=True)
        (SITE/f['svg']).write_text(data)
        # Web/full rasters are regenerated from these exact SVG versions by sharp.
        entry={k:clean[k] for k in ['id','title','web','full','svg','width','height','caption','credit','sources']}
        entry['sources']=clean['sources']+EXTRA[f['id']]
        entry['scope'],entry['long_description']=TEXT[f['id']]
        entry['alt_text']=f['title']+'. '+TEXT[f['id']][1].split('. ')[0]+'.'
        entry['version']='review-2026-10-13.1';entry['reviewed']='2026-10-13';entry['changes']=changes
        entry['svg_sha256']=hashlib.sha256(data.encode()).hexdigest();public.append(entry)
        clean.update(review_status='REVIEWED_FOR_STAGING',reviewed='2026-10-13',changes=changes,review_scope=TEXT[f['id']][0],review_limit='Educational pilot checked for stated scope; final user release review still required.')
    registry.append(clean)
(SITE/'assets/atlas/manifest.json').write_text(json.dumps({'version':'2026-10-13.1','figures':public},indent=2)+'\n')
(QUEUE/'figure-review-register.json').write_text(json.dumps({'count':41,'staged_pilot':PILOT,'figures':registry},indent=2)+'\n')

def figure(f):
    e=lambda s:html.escape(str(s),quote=True)
    return f'''<figure class="atlas-figure" id="atlas-{e(f['id'])}"><h3>{e(f['title'])}</h3><p class="atlas-scope">{e(f['scope'])}</p><a href="/{e(f['svg'])}" data-atlas-enlarge><img src="/{e(f['web'])}" width="{f['width']}" height="{f['height']}" loading="lazy" alt="{e(f['alt_text'])}"></a><figcaption>{e(f['caption'])} <span class="atlas-credit">{e(f['credit'])} · Reviewed {f['reviewed']}</span></figcaption><p><a href="/{e(f['svg'])}" data-atlas-enlarge>Open larger diagram</a> · <a href="/{e(f['full'])}">Full-size PNG</a></p><details class="atlas-text"><summary>Read the diagram explanation and sources</summary><p>{e(f['long_description'])}</p><ul>{''.join('<li><a href="'+e(s['url'])+'" rel="noopener">'+e(s['title'])+'</a></li>' for s in f['sources'])}</ul></details></figure>'''
items={f['id']:f for f in public}
hub=SITE/'science/process-atlas';hub.mkdir(parents=True,exist_ok=True)
(hub/'index.html').write_text('''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Process atlas — MJB ADHD</title><meta name="description" content="Explore reviewed diagrams of biological processes and genetic evidence, with readable explanations and original sources."><link rel="canonical" href="https://mjb-adhd.org.uk/science/process-atlas/"><link rel="stylesheet" href="/css/core.css"><link rel="stylesheet" href="/css/sleek.css"><link rel="stylesheet" href="/css/atlas.css"></head><body data-page="process-atlas"><a class="skip-link" href="#main-content">Skip to content</a><header id="site-header" class="top"><a href="/">MJB ADHD home</a></header><main class="wrap" id="main-content"><h1>Process atlas</h1><p class="lede">See how a process works, then choose how much detail to read. A normal biological pathway is not evidence that everybody with ADHD has a defect in it.</p><p>This first selection covers an organising framework, vesicle loading, mitochondrial energy and the evidence needed to connect a genetic association to a gene. Additional figures will be added after review.</p>'''+''.join(figure(f) for f in public)+'''</main><script defer src="/js/registry.js"></script><script defer src="/js/app.js"></script><script defer src="/js/interact.js"></script><script defer src="/js/atlas.js"></script></body></html>''')
# Regular-site pilot placements; the guide gets a discoverable hub link, keeping
# its source-generated article bodies unchanged until the selected design review.
placements={'science/what-is-adhd/index.html':['F00'],'science/genetics/gen-02/index.html':['F39'],'science/genetics/gen-03/index.html':['F04'],'science/genetics/gen-06/index.html':['F36']}
for rel,ids in placements.items():
    p=SITE/rel;s=p.read_text();s=re.sub(r'<!-- atlas:pilot:start -->.*?<!-- atlas:pilot:end -->\s*','',s,flags=re.S)
    block='<!-- atlas:pilot:start --><section aria-label="Process diagrams">'+''.join(figure(items[x]) for x in ids)+'<p><a href="/science/process-atlas/">Explore the process atlas</a></p></section><!-- atlas:pilot:end -->\n'
    marker='  <!-- library:start -->' if '  <!-- library:start -->' in s else '</main>'
    s=s.replace(marker,block+marker,1)
    if '/css/atlas.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/css/atlas.css">\n</head>')
    if '/js/atlas.js' not in s:s=s.replace('</body>','<script defer src="/js/atlas.js"></script>\n</body>')
    p.write_text(s)
print('Staged four coded figures; 37 other figures remain outside public assets. Raster generation still required.')
