#!/usr/bin/env python3
"""Context/provenance checks for evidence-population schema; no network."""
import json
from pathlib import Path
R=Path(__file__).resolve().parent
c=json.loads((R/'catalog.json').read_text());g=json.loads((R/'claims.json').read_text())
ps={p['id']:p for p in c['records']};cs={x['id']:x for x in g['claims']};errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
for key in ['doi','pmid','pmcid']:
 vals=[str(p[key]).strip().lower() for p in ps.values() if p.get(key)]
 check(len(vals)==len(set(vals)),f'duplicate canonical {key}')
for p in ps.values():
 for k in ['methodology','measured_endpoints','sample_size_and_unit','actual_findings','negative_or_unmeasured','limitations','source_locator','process_chain','independence_group','claim_confidence','phenotype_explanation_confidence','search_batch','version_notices']:
  check(bool(p.get(k)),f"{p['id']}: missing {k}")
 check('online_date' in p and 'print_date' in p,f"{p['id']}: missing publication-date fields (null is allowed when unconfirmed)")
 check(p['verification']['bibliography_checked'],f"{p['id']}: bibliography unchecked")
 if p['full_text_access_level'].startswith('abstract_only'):
  check(not p['verification']['full_text_checked'],f"{p['id']}: abstract/fulltext mismatch")
  check(not p['verification']['full_methods_and_figures_checked'],f"{p['id']}: abstract/all-figures mismatch")
 check(p['personal_case_inference']=='not_established',f"{p['id']}: patient inference introduced")
 check(p['full_text_storage']=='external_link_only_until_licence_and_version_verified',f"{p['id']}: storage rights review required")
pairs=set();eids=set()
for e in g['edges']:
 check(e['id'] not in eids,'duplicate evidence-edge ID');eids.add(e['id'])
 pair=(e['claim_id'],e['paper_id']);check(pair not in pairs,f'duplicate claim-paper pair {pair}');pairs.add(pair)
 check(e['claim_id'] in cs and e['paper_id'] in ps,f'dangling edge {e["id"]}')
 check(e['relationship'] in {'supports','qualifies','contradicts','null/negative','method-dependent'},f'invalid relation {e["id"]}')
 for k in ['subject','mechanism','predicate','direction','biological_level','study_context','bridge_needed','independence_group','alternative_explanation','observables','last_reviewed','current_status']:
  check(bool(e.get(k)),f'{e["id"]}: missing {k}')
 for k in ['paper_id','url','locator','measured_endpoint','finding']:
  check(bool(e['source_evidence'].get(k)),f'{e["id"]}: missing evidence {k}')
 if e['paper_id'] in ps:check(e['independence_group']==ps[e['paper_id']]['independence_group'],f'{e["id"]}: dependency drift')
for cl in cs.values():
 for k in ['subject','mechanism','predicate','direction','claim_confidence','phenotype_explanation_confidence','bridge_needed','observables']:
  check(bool(cl.get(k)),f"{cl['id']}: missing {k}")
for candidate in json.loads((R/'candidate_audit.json').read_text())['candidates']:
 check(all(p in ps for p in candidate['paper_ids']),f"{candidate['id']}: dangling paper")
 check(candidate['status']!='completed' or not candidate['access_blockers'],f"{candidate['id']}: false completion")
# Public research notes must never embed the local private upload paths or correspondence.
for p in R.rglob('*'):
 if p.is_file() and p.suffix in {'.pdf','.docx','.xlsx','.zip'}:errors.append(f'Unexpected binary/source attachment: {p.name}')
 if p.is_file() and p.suffix in {'.json','.md'}:
  t=p.read_text()
  for bad in ['project_sources/','mjb.adhd.advocacy@gmail.com','matt.bayliss99@gmail.com','libfile_']:
   check(bad not in t,f'Private-source marker in {p.name}')
check(ps['P2025-TOE-COHORT']['independence_group']==ps['P2026-TOE-REPETITIVE']['independence_group'],'Known cohort reuse not collapsed')
if errors:
 print('\n'.join('ERROR: '+e for e in errors));raise SystemExit(1)
print(f'Population context/provenance checks PASSED: {len(ps)} papers, {len(cs)} claims, {len(g["edges"])} edges. Scientific uncertainty remains in cards/ledger.')
