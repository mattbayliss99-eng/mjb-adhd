from pathlib import Path
import json,re,shutil,hashlib
import cairosvg
from PIL import Image

root=Path(__file__).resolve().parents[2]
content=root/'guidebook/content'
mapping={'X1':'CASE-2026-03-05-CWPT','X2':'CASE-2026-03-06-ADDENDUM','X3':'CASE-2026-05-28-PALS'}
case={'C1':mapping['X1'],'C2':mapping['X2'],'C3':mapping['X3']}
sources=json.loads((content/'sources.json').read_text())
canonical=[]
for s in sources:
    old=s['id']
    if old in mapping:
        s['id']=mapping[old];s['legacy_aliases']=[old,{'X1':'C1','X2':'C2','X3':'C3'}[old]]
    elif old=='C1' and s['type']=="Coroner's report":
        s['id']='COR-2024-0699-WINSON';s['legacy_aliases']=['C1 (coroner context only)']
    elif old in case:
        continue
    canonical.append(s)
(content/'sources.json').write_text(json.dumps(canonical,indent=2)+'\n')
for f in (content/'pages').glob('*.md'):
    s=f.read_text()
    for old,new in mapping.items():s=re.sub(r'\b'+old+r'\b',new,s)
    if f.name=='42-lives.md':s=s.replace('!finding(C1)','!finding(COR-2024-0699-WINSON)')
    if f.name=='65-case-decisions.md':
        for old,new in case.items():s=s.replace('('+old+')','('+new+')')
        s=s.replace('C1–C3 are private','The three CASE sources are private')
    f.write_text(s)
for f in (content/'components').glob('*.json'):
    s=f.read_text()
    for old,new in mapping.items():s=s.replace('"'+old+'"','"'+new+'"')
    f.write_text(s)
build=root/'guidebook/tools/build.mjs'
s=build.read_text();needle='const srcIds = new Set(sources.map(s => s.id));'
if 'duplicate source IDs' not in s:s=s.replace(needle,needle+'\nif (srcIds.size !== sources.length) errors.push("duplicate source IDs");')
build.write_text(s)

# Keep the original commission intact; published copies carry corrected source IDs.
package=root.parent/'visuals-new/MJB_VISUALS_V09-V11_06Oct2026'
archive=root/'guidebook/visuals/commission-oct7'
if package.exists():shutil.copytree(package,archive,dirs_exist_ok=True)
else:package=archive
visuals=json.loads((content/'visuals.json').read_text())
web=root/'guidebook/visuals/web'
audit=json.loads((root/'guidebook/visuals/selected-manifest.json').read_text())
for a in json.loads((package/'visuals-manifest.json').read_text()):
    if a['variant']!='original-svg':continue
    asset=a['asset_id'];svg=package/a['filename'];dest=web/svg.name
    raw=svg.read_text()
    if asset=='V09':
        raw=raw.replace('Levodopa is converted toward dopamine. Often paired with carbido','Levodopa is a dopamine precursor.')
        raw=raw.replace('Parkinson symptom treatment; specialist use in selected movement d','Parkinson treatment; often with carbidopa/benserazide.')
        raw=raw.replace('Methylphenidate blocks dopamine and noradrenaline reuptake.','Methylphenidate inhibits dopamine/NA reuptake.')
        raw=raw.replace('ADHD treatment. Response and formulation are individual. Not a pre','ADHD treatment; formulation and response vary.')
        raw=raw.replace('>W1</text>','>W1, F14</text>')
    if asset=='V11':
        raw=raw.replace('C1 trust letter 5 Mar 2026; C2 addendum 6 Mar 2026; C3 PALS 28 May 2026.','Trust: 5 Mar 2026; patient addendum: 6 Mar 2026; PALS: 28 May 2026.')
    dest.write_text(raw)
    png=web/(svg.stem+'-960.png');wp=web/(svg.stem+'-960.webp')
    cairosvg.svg2png(url=str(dest),write_to=str(png),output_width=960)
    im=Image.open(png).convert('RGB');im.save(wp,'WEBP',quality=92,method=6)
    txt=(package/a['text_equivalent_file']).read_text()
    refs=a['source_ids']
    if asset=='V09':refs=refs+['F14'];txt=txt.replace('Not a precursor. W1.','Not a precursor. W1, F14.')
    if asset=='V11':
        refs=[case.get(x,x) for x in refs]
        for old,new in case.items():txt=re.sub(r'\b'+old+r'\b',new,txt)
    visuals[asset]={'id':asset,'svg':dest.name,'webp':wp.name,'png':png.name,'width':im.width,'height':im.height,'alt':a['alt'],'caption':a['caption'],'text':txt,'source_ids':refs,'evidence_status':a['evidence_status'],'routes':a['guide_page_ids']}
    audit=[x for x in audit if x['asset_id']!=asset]
    for f in [dest,png,wp]:audit.append({'asset_id':asset,'filename':f.name,'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'editor_action':'Source IDs corrected where needed; rasters exported from reviewed SVG'})
    page={'V09':'62-dopamine-options.md','V10':'63-botanical-evidence.md','V11':'65-case-decisions.md'}[asset]
    f=content/'pages'/page;s=f.read_text()
    if '@visual '+asset not in s:s=s.replace('@layer 2','@visual '+asset+'\n\n@layer 2',1)
    f.write_text(s)
(content/'visuals.json').write_text(json.dumps(visuals,indent=2)+'\n')
(root/'guidebook/visuals/selected-manifest.json').write_text(json.dumps(audit,indent=2)+'\n')
print(f'Prepared {len(canonical)} distinct sources and {len(visuals)} visuals.')
