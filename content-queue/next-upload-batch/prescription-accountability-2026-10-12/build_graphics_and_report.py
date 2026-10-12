from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image as RLImage, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import json, re, html, base64, shutil, zipfile, hashlib, sys

ROOT=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parent
AS=ROOT/'assets'; SOCIAL=ROOT/'social'; WEB=ROOT/'website'
BG='#080e12'; PANEL='#122027'; FG='#f3f7f5'; MUTED='#bbccc7'; GREEN='#79f5b0'; CYAN='#76dcf3'; AMBER='#ffc778'
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def font(n,b=False): return ImageFont.truetype(BOLD if b else FONT,n)
def wrap(s,n,width,b=False):
 d=ImageDraw.Draw(Image.new('RGB',(1,1)));out=[]
 for para in s.split('\n'):
  line=''
  for w in para.split():
   test=(line+' '+w).strip()
   if d.textlength(test,font=font(n,b))>width and line:out.append(line);line=w
   else:line=test
  out.append(line)
 return out
class Card:
 def __init__(self,num,title,subtitle=''):
  self.num=num;self.im=Image.new('RGB',(1080,1350),BG);self.d=ImageDraw.Draw(self.im);self.svg=[]
  self.rect(0,0,1080,12,GREEN);self.text('MJB ADHD  /  ACCOUNTABILITY',64,57,25,GREEN,True)
  self.text(f'{num:02d} / 08',876,57,25,MUTED,True)
  self.title=title;self.subtitle=subtitle
  self.y=self.para(title,64,134,68,FG,True,950,1.14)+28
  if subtitle:self.y=self.para(subtitle,64,self.y,31,MUTED,False,950,1.25)+32
 def rect(self,x,y,w,h,c):
  self.d.rounded_rectangle((x,y,x+w,y+h),radius=20,fill=c)
  self.svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="20" fill="{c}"/>')
 def line(self,x,y,x2,y2,c=GREEN,width=3):
  self.d.line((x,y,x2,y2),fill=c,width=width)
  self.svg.append(f'<path d="M{x},{y} L{x2},{y2}" stroke="{c}" stroke-width="{width}"/>')
 def text(self,s,x,y,n,c=FG,b=False):
  self.d.text((x,y),s,font=font(n,b),fill=c)
  self.svg.append(f'<text x="{x}" y="{y+n*.91}" fill="{c}" font-family="DejaVu Sans,Arial,sans-serif" font-size="{n}" font-weight="{700 if b else 400}">{html.escape(s)}</text>')
 def para(self,s,x,y,n=36,c=FG,b=False,w=900,lh=1.28):
  for t in wrap(s,n,w,b):self.text(t,x,y,n,c,b);y+=round(n*lh)
  return y
 def box(self,label,body,y,h=220,value=None,color=GREEN):
  self.rect(64,y,952,h,PANEL);self.text(label,90,y+20,26,color,True)
  by=y+64
  if value:self.text(value,90,by,105,color,True);by+=130
  self.para(body,90,by,34,FG,False,899,1.22)
 def finish(self,source,closing,alt):
  self.line(64,1130,1016,1130,CYAN,2)
  self.para(closing,64,1154,31,GREEN,True,950,1.2)
  self.para(source,64,1250,23,MUTED,False,950,1.13)
  self.text('mjb-adhd.org.uk  •  12 October 2026',64,1310,23,MUTED)
  filename=f'{self.num:02d}-'+['prescription','death-data','coroners','cwpt-ratings','reviews','timeline','workload','close-the-loop'][self.num-1]
  self.im.save(AS/(filename+'.png'))
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" role="img" aria-labelledby="title desc"><title id="title">{html.escape(self.title)}</title><desc id="desc">{html.escape(alt)}</desc><rect width="1080" height="1350" fill="{BG}"/>'+''.join(self.svg)+'</svg>'
  (AS/(filename+'.svg')).write_text(svg)
  return {'number':self.num,'file':filename+'.png','svg':filename+'.svg','title':self.title,'subtitle':self.subtitle,'closing':closing,'source':source,'alt':alt}

cards=[]
c=Card(1,'I secured the private route.','Five years treated. About ten months without continuity.');
c.box('12 OCTOBER 2026','ADHD Direct confirmed my Amfexa prescription was processed and posted.',c.y,230,color=GREEN)
c.box('THE OUTCOME','A private prescription sent. No completed NHS prescribing handover evidenced in this review.',c.y+255,260,color=CYAN)
c.para('Delivery, dispensing and recovery are still to be confirmed.',64,c.y+550,34,MUTED,w=940)
cards.append(c.finish('Case: C01, C06, C10 • First-person account','Next: recovery, accountability and change.','MJB personal update. After approximately five years of ADHD treatment and ten months without continuity, ADHD Direct confirmed the private Amfexa prescription was sent on 12 October 2026. No completed NHS prescribing handover is evidenced in this review. Delivery, dispensing and recovery remain unconfirmed.'))

c=Card(2,'Deaths: keep the scope visible.','Two different official reporting series.');
c.box('CALENDAR 2025 • ENGLAND AND WALES','Deaths of people subject to Mental Health Act detention reported to coroners.',c.y,310,'183',GREEN)
c.box('FINANCIAL 2024/25 • ENGLAND','CQC death notifications: 253 detained patients + 61 people subject to community treatment orders.',c.y+335,330,'314',CYAN)
cards.append(c.finish('Ministry of Justice [P01] • CQC [P02]','Do not add them. Neither is an avoidable-death count.','183 deaths of people subject to Mental Health Act detention were reported to coroners in England and Wales in calendar 2025. Separately, CQC received 314 death notifications in England in financial year 2024/25, comprising 253 detained patients and 61 people subject to community treatment orders. The totals are not additive and neither establishes preventability.'))

c=Card(3,'An investigation needs an outcome.','England and Wales • Calendar 2025 • ALL CAUSES');
c.box('ALL CAUSES','Inquests opened.',c.y,280,'35,989',GREEN)
c.box('ALL CAUSES','Prevention of Future Deaths reports issued.',c.y+304,300,'654',CYAN)
c.para('Who checks that the required response leads to a verified safety change?',64,c.y+640,35,FG,True,940)
cards.append(c.finish('Ministry of Justice, Coroners Statistics 2025 [P01]','These are not NHS or mental-health-only totals.','Ministry of Justice data show 35,989 inquests opened and 654 Prevention of Future Deaths reports issued in England and Wales in 2025, across all causes. MJB asks who verifies resulting safety changes. Neither total measures mental-health-only events or proved NHS negligence.'))

c=Card(4,'CWPT: mixed ratings.','Different assessment levels must stay distinct.');
c.box('TRUST-LEVEL WELL-LED','GOOD',c.y,190,color=GREEN)
c.text('Published 26 August 2026',90,c.y+136,28,MUTED)
c.box('ADULT COMMUNITY MENTAL HEALTH','Safe: Requires improvement\nResponsive: Requires improvement',c.y+215,260,color=AMBER)
c.text('Published 15 July 2026',90,c.y+428,28,MUTED)
c.para('Medicines and continuity concerns sit alongside positive findings. These ratings do not decide my ADHD case.',64,c.y+518,35,FG,w=940)
cards.append(c.finish('CQC CWPT reports [P07–P09]','A rating is not a completed handover.','CQC rated CWPT trust-level Well-led as Good, published 26 August 2026. Adult community mental-health Safe and Responsive were Requires improvement, published 15 July 2026. Positive findings and concerns coexist. These are service and leadership assessments, not an adjudication of Matthew’s ADHD prescribing decision.'))

c=Card(5,'Reviews are not interchangeable.','Three examples of different accountability processes.');
for i,(label,body) in enumerate([
 ('ESSEX • STATUTORY INQUIRY','Lampard: mental-health inpatient deaths, 2000–2023.'),
 ('NOTTINGHAMSHIRE • CQC SPECIAL REVIEW','Patient safety and quality of care; published March 2024.'),
 ('GREATER MANCHESTER • ASSURANCE REVIEW','Implementation after the independent review; published May 2026.')]):c.box(label,body,c.y+i*235,212,color=[GREEN,CYAN,AMBER][i])
cards.append(c.finish('Lampard [P12] • CQC [P13] • NHS England [P14]','Identify the process. Verify the change.','Three distinct processes: the Lampard statutory inquiry into Essex mental-health inpatient deaths in 2000–2023; the Nottinghamshire CQC special review published March 2024; and the Greater Manchester independent assurance review published May 2026. These examples are not a national count of trusts currently under statutory investigation.'))

c=Card(6,'The letters kept arriving.','The prescribing handover did not.');
events=[('11 DEC 2025','Recorded CWPT discharge; context disputed.'),('5 MAR 2026','Bridge refused; review via waiting list.'),('28 MAY 2026','Cardiology condition; communication controls.'),('19 AUG 2026','ICB assurance; no single senior case owner.'),('23 SEP 2026','Privately funded transfer appointment.'),('12 OCT 2026','ADHD Direct: Amfexa prescription sent.')]
for i,(date,body) in enumerate(events):
 y=c.y+i*118;c.rect(64,y,12,88,GREEN if i>=4 else CYAN);c.text(date,100,y,29,GREEN if i>=4 else CYAN,True);c.para(body,100,y+42,32,FG,w=890,lh=1.14)
cards.append(c.finish('Case originals [C01, C03, C06, C10, C11]','305 calendar days: discharge date to dispatch date.','Timeline: recorded discharge 11 December 2025, with context disputed; bridge refusal 5 March; cardiology condition and communication controls 28 May; ICB assurance and no single senior case owner on 19 August; privately funded appointment 23 September; private prescription dispatch 12 October. The discharge-to-dispatch date difference is 305 days.'))

c=Card(7,'The patient had to coordinate.','The workload was part of the crisis.');
c.text('4,356',64,c.y,150,GREEN,True)
y=c.y+185;y=c.para('Sent-folder message records across two accounts in 2026.',64,y,39,FG,True,950)
y=c.para('2,368 personal + 1,988 advocacy',64,y+28,36,CYAN,True,950)
y=c.para('1 January–12 October. Includes wider correspondence, outreach, forwards and follow-ups; not all care-seeking emails.',64,y+32,32,MUTED,w=945)
y=c.para('I organised evidence, referrals, complaints and private care while pain and ADHD impaired my capacity to do it.',64,y+38,36,FG,w=945)
cards.append(c.finish('Completed mailbox pagination [A01] • Patient account','This should not be a condition of getting care.','The mailbox audit found 4,356 retained sent-folder message records from 1 January to 12 October 2026 across two accounts: 2,368 personal and 1,988 advocacy. This includes wider correspondence and is not a care-only or unique-recipient count. Matthew describes coordinating evidence, complaints, referrals and private treatment while disabled by pain and impaired executive function.'))

c=Card(8,'Close the loop.','MJB proposed continuity safeguards');
items=['A named decision-maker.','An accepted receiving service.','A workable interim plan.','Risks of treatment AND delay.','A review date and escalation route.','An accessible written decision.']
for i,t in enumerate(items):
 y=c.y+i*91;c.text(f'{i+1:02d}',64,y,35,GREEN,True);c.para(t,142,y,36,FG,True,850)
c.para('A referral is not a completed transfer until responsibility is accepted, or an appropriate alternative is documented.',64,c.y+584,34,MUTED,w=945)
cards.append(c.finish('NICE NG87 1.5.1 [P15] • MJB design proposal','Measure patient outcomes, not just referrals.','MJB proposes six continuity safeguards: named decision-maker, accepted receiving service, interim plan, consideration of treatment and delay risks, review and escalation date, and an accessible written decision. NICE NG87 recommendation 1.5.1 supports continuity of care. The safeguards are proposals, not a statutory entitlement to a particular prescription.'))

(ROOT/'cards.json').write_text(json.dumps(cards,indent=2,ensure_ascii=False))
transcript=[]
for c in cards:
 transcript.append(f"## {c['number']:02d}. {c['title']}\n\n{c['alt']}\n\nSource: {c['source']}\n\n{c['closing']}\n")
(SOCIAL/'alt-text-and-transcript.md').write_text('# Graphics: alt text and accessible transcript\n\n'+'\n'.join(transcript)+'\n## Updated blue poster\n\n305 days since recorded discharge on 11 December 2025; 221 days since the 5 March bridging refusal letter; 167 days since the ICB said it had contacted CWPT on 28 April; 4,356 retained sent-folder records across two accounts in 2026, including wider correspondence. ADHD Direct confirmed Amfexa prescription dispatch on 12 October. No completed NHS prescribing handover is evidenced in this review. Recovery and accountability remain open. Delivery and dispensing are not yet confirmed.\n')
sheet=Image.new('RGB',(1080,760),'#172027')
for i,c in enumerate(cards):
 im=Image.open(AS/c['file']);im.thumbnail((263,329));x=(i%4)*270+(270-im.width)//2;y=(i//4)*380+12;sheet.paste(im,(x,y));ImageDraw.Draw(sheet).text((x,y+334),f"{c['number']:02d}",font=font(22,True),fill=FG)
sheet.save(ROOT/'contact-sheet.png')
short=SOCIAL/'selected-five-card-carousel';short.mkdir(exist_ok=True)
for n,no in enumerate([1,6,7,4,8],1):shutil.copy(AS/cards[no-1]['file'],short/(f'{n:02d}-'+cards[no-1]['file']))

def inline(s):
 s=html.escape(s);s=re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',s)
 s=re.sub(r'(https://[^\s<]+)',lambda m:f'<a href="{m[1]}">{m[1]}</a>',s)
 return s
def mdhtml(md):
 md=re.sub(r'^---\n.*?\n---\n','',md,flags=re.S);lines=md.splitlines();out=[];i=0
 while i<len(lines):
  l=lines[i]
  if not l.strip():i+=1;continue
  if re.match(r'^#{1,6} ',l):
   n=len(l)-len(l.lstrip('#'));title=l[n:].strip();slug=re.sub(r'[^a-z0-9]+','-',title.lower()).strip('-');out.append(f'<h{n} id="{slug}">{inline(title)}</h{n}>');i+=1
  elif l.startswith('|'):
   rows=[]
   while i<len(lines) and lines[i].startswith('|'):
    row=[x.strip() for x in lines[i].strip('|').split('|')];i+=1
    if all(re.fullmatch(r'[- :]+',x) for x in row):continue
    rows.append(row)
   out.append('<div class="table-wrap" tabindex="0"><table><thead><tr>'+''.join('<th scope="col">'+inline(x)+'</th>' for x in rows[0])+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+inline(x)+'</td>' for x in row)+'</tr>' for row in rows[1:])+'</tbody></table></div>')
  elif l.startswith('- ') or re.match(r'^\d+\. ',l):
   li=[]
   numbered=bool(re.match(r'^\d+\. ',l))
   while i<len(lines) and (lines[i].startswith('- ') or re.match(r'^\d+\. ',lines[i])):li.append(re.sub(r'^(?:\d+\.|-) ','',lines[i]));i+=1
   tag='ol' if numbered else 'ul';out.append('<'+tag+'>'+''.join('<li>'+inline(x)+'</li>' for x in li)+'</'+tag+'>')
  else:
   p=[l];i+=1
   while i<len(lines) and lines[i].strip() and not re.match(r'^(?:#{1,6} |\||- |\d+\. )',lines[i]):p.append(lines[i]);i+=1
   out.append('<p>'+inline(' '.join(p))+'</p>')
 return '\n'.join(out)
CSS='''*{box-sizing:border-box}html{scroll-behavior:smooth}body{--bg:#060b0d;--fg:#d9f8e5;--muted:#b4c8be;--panel:#112027;--accent:#79f5b0;margin:0;background:var(--bg);color:var(--fg);font:19px/1.72 system-ui,sans-serif}body.light{--bg:#f6faf7;--fg:#18281f;--muted:#405849;--panel:#e1eee7;--accent:#096234}body.terminal{font-family:monospace;--fg:#9effb2;--accent:#9effb2}a{color:var(--accent);overflow-wrap:anywhere}a:focus,button:focus,select:focus,summary:focus{outline:3px solid #76dcf3;outline-offset:4px}header,main,footer{max-width:980px;margin:auto;padding:24px}header{border-bottom:1px solid var(--muted)}nav{display:flex;gap:20px;flex-wrap:wrap}h1{font-size:clamp(2.3rem,6vw,4.3rem);line-height:1.1;letter-spacing:-.025em}h2{font-size:1.75rem;line-height:1.25;margin-top:2.4em}h3{font-size:1.25rem}strong{color:var(--accent)}p{max-width:78ch}li{margin:.7em 0}button,select{font:inherit;background:var(--panel);color:var(--fg);border:1px solid var(--muted);border-radius:8px;padding:6px 12px}.meta{color:var(--muted)}.callout{border-left:4px solid var(--accent);background:var(--panel);padding:20px;margin:24px 0}.table-wrap{overflow:auto;margin:28px 0}table{border-collapse:collapse;width:100%;font-size:.94rem}th,td{border-bottom:1px solid var(--muted);padding:14px;text-align:left;vertical-align:top}th{background:var(--panel)}.gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}figure{margin:24px 0}img{max-width:100%;height:auto;border-radius:12px}figcaption{color:var(--muted);font-size:.9rem}details{margin:18px 0}summary{cursor:pointer}footer{border-top:1px solid var(--muted)}.skip{position:absolute;left:-9999px}.skip:focus{left:20px;top:15px;background:var(--bg);z-index:20}.poster{max-width:700px;margin-inline:auto}.toolbar{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}@media(max-width:600px){header,main,footer{padding:18px}.gallery{grid-template-columns:1fr}body{font-size:18px}th,td{padding:10px;min-width:150px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}@media print{body{background:white;color:black;font-size:11pt}.toolbar,.skip{display:none}a{color:black}h2{break-after:avoid}.gallery figure{break-inside:avoid}}'''
body=mdhtml((WEB/'account.md').read_text());sources=mdhtml((ROOT/'source-register.md').read_text()) if (ROOT/'source-register.md').exists() else ''
gallery='<section id="graphics"><h2>The graphics, with text alternatives</h2><figure class="poster"><img src="../assets/updated-accountability-poster.png" alt="Updated poster: 305 days since recorded discharge; private prescription sent; recovery and accountability remain open."><figcaption>Updated version of the original blue accountability poster. <a href="../assets/updated-accountability-poster.png">Open full-size poster</a>.</figcaption></figure><div class="gallery">'
for c in cards:gallery+=f'<figure><a href="../assets/{c["file"]}"><img loading="lazy" src="../assets/{c["file"]}" width="1080" height="1350" alt="{html.escape(c["alt"],quote=True)}"></a><figcaption>{c["number"]:02d}. {html.escape(c["title"])}<details><summary>Read the graphic as text</summary><p>{html.escape(c["alt"])}</p><p>{html.escape(c["source"])}</p></details></figcaption></figure>'
gallery+='</div></section>'
page='''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Prescription secured: recovery and accountability | MJB ADHD</title><meta name="description" content="Matthew Bayliss’s dated account of ADHD treatment interruption, private prescription dispatch, correspondence workload and proposals for continuity reform."><style>'''+CSS+'''</style></head><body><a class="skip" href="#main">Skip to content</a><header><nav aria-label="MJB destinations"><a href="https://mjb-adhd.org.uk/">MJB ADHD</a><a href="#what-the-numbers-actually-measure">Numbers</a><a href="#graphics">Graphics</a><a href="#sources">Sources</a></nav><details><summary>Reading settings</summary><div class="toolbar"><label>Theme <select id="theme"><option value="ink">Ink</option><option value="light">Light</option><option value="terminal">Terminal</option></select></label><button id="larger" type="button">Larger text</button><button id="reset" type="button">Reset text</button></div></details><p class="meta">Prepared 12 October 2026 · Review draft · Prescription dispatch confirmed</p></header><main id="main">'''+body+gallery+'<section id="sources">'+sources+'''</section></main><footer><p>MJB ADHD · Patient account, reviewed records and public sources. Historical snapshot; delivery and treatment outcomes await later updates.</p><a href="https://mjb-adhd.org.uk/support/when-help-doesnt-come/">Practical support when help does not come</a></footer><script>(()=>{const t=document.getElementById('theme');t.addEventListener('change',()=>{document.body.className=t.value==='ink'?'':t.value;try{localStorage.setItem('mjb-account-theme',t.value)}catch(e){}});try{const s=localStorage.getItem('mjb-account-theme');if(['ink','light','terminal'].includes(s)){t.value=s;t.dispatchEvent(new Event('change'))}}catch(e){}document.getElementById('larger').onclick=()=>{document.body.style.fontSize='22px'};document.getElementById('reset').onclick=()=>{document.body.style.fontSize=''}})();</script></body></html>'''
(WEB/'index.html').write_text(page)
standalone=re.sub(r'(?P<attr>src|href)="\.\./assets/([^\"]+\.png)"',lambda m:m['attr']+'="data:image/png;base64,'+base64.b64encode((AS/m[2]).read_bytes()).decode()+'"',page)
(ROOT/'MJB_Accountability_Website_Preview.html').write_text(standalone)

# Print report: readable typography, deliberate pagination and accessible selectable text.
pdfmetrics.registerFont(TTFont('DVS',FONT));pdfmetrics.registerFont(TTFont('DVS-Bold',BOLD));pdfmetrics.registerFontFamily('DVS',normal='DVS',bold='DVS-Bold',italic='DVS',boldItalic='DVS-Bold')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyX',fontName='DVS',fontSize=10.2,leading=15.4,spaceAfter=9,textColor=colors.HexColor('#172b25')))
styles.add(ParagraphStyle(name='H1X',fontName='DVS-Bold',fontSize=25,leading=30,spaceAfter=18,textColor=colors.HexColor('#075841')))
styles.add(ParagraphStyle(name='H2X',fontName='DVS-Bold',fontSize=15,leading=19,spaceBefore=17,spaceAfter=10,textColor=colors.HexColor('#075841'),keepWithNext=True))
styles.add(ParagraphStyle(name='CellX',fontName='DVS',fontSize=8.6,leading=12,spaceAfter=0))
def pdfinline(s):
 s=html.escape(s.replace('—','-').replace('–','-').replace('→','to'));s=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',s);return s
def flows(md):
 md=re.sub(r'^---\n.*?\n---\n','',md,flags=re.S);lines=md.splitlines();out=[];i=0
 while i<len(lines):
  l=lines[i]
  if not l.strip():i+=1;continue
  if re.match(r'^#{1,6} ',l):
   n=len(l)-len(l.lstrip('#'));sty=styles['H1X' if n==1 else 'H2X'];j=i+1
   while j<len(lines) and not lines[j].strip():j+=1
   if j<len(lines) and lines[j].startswith('|'):sty=ParagraphStyle('tableheading',parent=sty,keepWithNext=False)
   out.append(Paragraph(pdfinline(l[n:].strip()),sty));i+=1
  elif l.startswith('|'):
   rows=[]
   while i<len(lines) and lines[i].startswith('|'):
    r=[x.strip() for x in lines[i].strip('|').split('|')];i+=1
    if all(re.fullmatch(r'[- :]+',x) for x in r):continue
    rows.append([Paragraph(pdfinline(x),styles['CellX']) for x in r])
   width=A4[0]-100;cols=[width/len(rows[0])]*len(rows[0]);tab=Table(rows,colWidths=cols,repeatRows=1,hAlign='LEFT')
   tab.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e3f1e9')),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#adc7bc')),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]));out.extend([tab,Spacer(1,12)])
  elif l.startswith('- ') or re.match(r'^\d+\. ',l):
   out.append(Paragraph(pdfinline(l[2:] if l.startswith('- ') else l),styles['BodyX'],bulletText='-' if l.startswith('- ') else None));i+=1
  else:
   p=[l];i+=1
   while i<len(lines) and lines[i].strip() and not re.match(r'^(?:#{1,6} |\||- |\d+\. )',lines[i]):p.append(lines[i]);i+=1
   out.append(Paragraph(pdfinline(' '.join(p)),styles['BodyX']))
 return out
story=flows((WEB/'account.md').read_text());story+=[PageBreak()]+flows((ROOT/'source-register.md').read_text())
story+=[PageBreak(),Paragraph('Graphics and public sharing',styles['H1X']),Paragraph('The following preview summarises the eight graphics. Individual 1080 x 1350 PNGs, SVG sources and text alternatives accompany this report. Recommended personal-story sequence: 01, 06, 07, 04, 08.',styles['BodyX'])]
story.append(RLImage(str(ROOT/'contact-sheet.png'),width=480,height=480*760/1080))
story+=[PageBreak(),Paragraph('Updated accountability poster',styles['H1X'])]
im=Image.open(AS/'updated-accountability-poster.png');w=420;h=w*im.height/im.width;story.append(RLImage(str(AS/'updated-accountability-poster.png'),width=w,height=h))
story+=[PageBreak()]+flows((SOCIAL/'caption.md').read_text())
def footer(canvas,doc):
 canvas.setFont('DVS',8);canvas.setFillColor(colors.HexColor('#416357'));canvas.drawString(50,28,'MJB ADHD | 12 October 2026 | Review draft');canvas.drawRightString(A4[0]-50,28,str(doc.page))
doc=SimpleDocTemplate(str(ROOT/'MJB_Prescription_Recovery_and_Accountability_12Oct2026.pdf'),pagesize=A4,rightMargin=50,leftMargin=50,topMargin=45,bottomMargin=48,title='Prescription secured: recovery, accountability and change',author='Matthew Bayliss | MJB ADHD')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(json.dumps({'cards':len(cards),'article_words':len((WEB/'account.md').read_text().split()),'root':str(ROOT)},indent=2))
