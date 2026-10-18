# Maintenance protocol — freshness, provenance, copyright and quality gates

**Scope:** hand-curated high-signal biomedical studies. Check date: 18 October 2026. This initial selection came from targeted searches, not an exhaustive literature review. Newer does not mean stronger, and older does not mean false.

## When to review

- **Every 30 days:** actively contested branches (mitochondrial Na⁺/Ca²⁺/H⁺ exchange; pending primary replication), new clinical therapies, ongoing interventions.
- **Every 90 days:** rapidly changing mechanistic domains (SPG7 neuronal models, VMAT2 and DAT/TAAR1, toe-walking intervention research).
- **Every 180 days:** more stable baseline cellular and neuromuscular mechanisms, or sooner when a relevant contradictory paper appears.
- **At every website or clinical handoff:** recheck source, population, licensing, conflicts, adverse evidence and what has been published since the last recorded search. A scheduled interval does not certify completeness.

## Literature retrieval queries (examples, not exclusion filters)

- `("SPG7" OR "AFG3L2") AND ("EMRE" OR "MCU" OR "mitochondrial calcium")`
- `("NCLX" OR "SLC8B1" OR "TMEM65") AND ("mitochondrial calcium" OR exchanger)`
- `("VMAT2" OR "SLC18A2" OR "DAT" OR "TAAR1") AND (amphetamine OR transport OR vesicle)`
- `("ATP2A1" OR "SERCA1" OR "Brody disease") AND (relaxation OR contracture)`
- `("autism" OR "ADHD") AND ("toe walking" OR gait) AND (motor OR sensory OR intervention)`
- Check PubMed for newest primary studies first, Europe PMC for available full text, Crossref DOI identity, trial registries for interventions, and systematic reviews for the research landscape.
- Search **unfavourable findings** explicitly, including negative results, failure to replicate, genotype variation and adverse outcomes.
- Record `search_date`, query, databases, filters, number screened, inclusion rationale, and noteworthy exclusions. Otherwise call it a *targeted scan*, not a systematic search.

## Canonical paper inclusion decision

Only add a paper if it does at least one of:
1. Establishes a *directly measured* biological link or discriminating phenotype.
2. Provides a new human dataset or a properly controlled intervention relevant to a claim.
3. Refutes, qualifies or contradicts a previously cited finding.
4. Changes the interpretation of a key molecule, transporter, regulation direction or therapeutic safety question.
5. Is a high-quality synthesis that maps major disagreement or reveals missing evidence.

**Do not include solely because it is new, often cited, compellingly written or superficially compatible with an existing idea.**

## Per-paper record requirements

- Stable DOI/PMID/PMCID where actually verified, title, year and canonical full-text URL.
- Full publication date if known, **not mistaken for date of online indexing or current scan**.
- Study design and experimental level: purified protein → organelle → cell → animal → human clinical.
- Model population, variants, species, concentrations and comparators when central.
- Directly measured endpoint versus discussion speculation.
- What was found; what the authors did not test; negative findings; important limitations.
- Claim IDs with supports, challenges and qualifies edges.
- Licensing and whether original PDF may be redistributed. Open access does not automatically mean public-domain or unrestricted commercial reuse.

## Citation and extraction practice

Extract concise notes **in original wording only for short attributed quotations**; otherwise independently paraphrase. Use source-linking and factual claims instead of reproducing complete copyrighted papers. Avoid treating synthetic notes as equivalent to original data, and do not blindly train an LLM on downloaded copyrighted PDFs.

Use `external_link_only_until_licence_and_version_verified` as default. If a PDF is archived after a confirmed licence, record licence URL, downloaded URL, version, date, SHA-256 checksum, and exact rights conditions; keep original metadata with the archive. No paid or restricted full text is rehosted without permission.

## Review statuses

- `current_primary`: direct relevant research, not a claim of universal truth.
- `foundational_primary`: still valuable older experiment with newer qualifications attached.
- `current_review`: synthesis with methods and cut-off date, not substitute for primary data.
- `current_contested`: critical component identity/direction disputed.
- `not_established`: plausible or hypothesised claim without validating evidence.
- `superseded_interpretation`: interpretation explicitly overruled; original study stays for provenance.

## Cross-scale validity checks

A finding about purified transporters is not automatically true of synapses; synaptic dopamine does not establish motor performance; a cell intervention does not predict clinical safety. Store each required transfer assumption. Exclusion and null evidence must remain visible. Confidence only increases from appropriately independent and relevant evidence.

## Publication firewall

This directory belongs on a non-production research branch. A PR can be reviewed, but do not merge or edit deployed `site/` content just to add source papers. The public GitHub repository is not suitable for personal medical records, confidential correspondence or other people's identifiable information.

## Population pilot schema v1.1 — 18 October 2026

The dated batch preserves 14 seed identities and adds 26 primary records. Full-text access/checks are separate booleans. All-figure/supplement/raw-data review remains false unless separately documented. Exact context/locator/independence/bridge lives on each evidence edge; legacy relation arrays are navigation only.

Keep DOI/PMID/PMCID identity checks separate from scientific replication. Crossref print/online anomalies and comment/preprint relations must remain visible. No PDF redistribution follows from a TDM licence.

Revisit the explicit holds in candidate_audit.json and BATCH_REPORT_2026-10-18.md before expanding candidates. Preserve deferred screens as deferred, not false negatives. Record cohort overlap at participant level; do not count the Brody 2024 or ASD 2026 follow-up as an entirely new cohort.
