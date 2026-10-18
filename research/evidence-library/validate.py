#!/usr/bin/env python3
"""Offline checks for MJB paper/claim index. No network, no patient data."""
import json
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parent
catalog = json.loads((ROOT / "catalog.json").read_text(encoding="utf-8"))
graph = json.loads((ROOT / "claims.json").read_text(encoding="utf-8"))
papers = catalog["records"]
claims = graph["claims"]
errors = []
warnings = []

def uniq(vals, label):
    if len(vals) != len(set(vals)):
        errors.append(f"duplicate {label}")

pids = [p.get("id") for p in papers]
cids = [c.get("id") for c in claims]
uniq(pids, "paper ID")
uniq(cids, "claim ID")
pmap = {p["id"]: p for p in papers}
cmap = {c["id"]: c for c in claims}
uniq([p["doi"].lower() for p in papers if p.get("doi")], "DOI")

for p in papers:
    for key in ("id", "title", "year", "design", "model", "url", "demonstrates", "does_not_demonstrate", "reviewed_on"):
        if not p.get(key):
            errors.append(f'{p.get("id", "?")}: missing {key}')
    if not (p.get("doi") or p.get("pmid")):
        warnings.append(f'{p["id"]}: no DOI/PMID — recheck source identity')
    if p.get("year", 0) > date.today().year:
        errors.append(f'{p["id"]}: publication date in future')
    for cid in p.get("links_to_claims", []):
        if cid not in cmap:
            errors.append(f"{p['id']}: dangling claim {cid}")
    if p.get("full_text_storage") != "external_link_only_until_licence_and_version_verified":
        warnings.append(f'{p["id"]}: verify archive licence, version and checksum')

for c in claims:
    for key in ("id", "question", "summary", "state", "level", "transfer_to_human", "discriminator"):
        if not c.get(key):
            errors.append(f'{c.get("id", "?")}: missing {key}')
    for relation in ("supports", "qualifies", "challenges"):
        for pid in c.get(relation, []):
            if pid not in pmap:
                errors.append(f'{c["id"]}: invalid {relation} {pid}')
    if c.get("state") == "actively_contested" and not c.get("challenges"):
        warnings.append(f'{c["id"]}: contested but no challenging papers linked')

print(f"Evidence library: {len(papers)} papers / {len(claims)} claims")
for msg in warnings:
    print("WARNING:", msg)
for msg in errors:
    print("ERROR:", msg)
if errors:
    raise SystemExit(1)
print("Integrity checks PASSED (this does not verify external scientific accuracy).")
