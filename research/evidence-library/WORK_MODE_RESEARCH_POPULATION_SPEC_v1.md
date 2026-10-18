---
title: MJB Living Mechanism Evidence Library — Work-mode population and audit specification
version: 1.0
date: 2026-10-18
status: staged-research-only
privacy: no-personal-records-in-public-GitHub
publication: not-authorised
---

# Objective

Build a **canonical, continuously revisable, claim-level biomedical evidence repository** for MJB. Start from 14 seed papers, 11 claim nodes and 33 research candidates already in the GitHub evidence library and linked native Google Sheet. Locate the most directly related recent primary data *and* older load-bearing experiments; preserve contradictory findings and identify genuine convergence points without assuming the user's or another person's molecular diagnosis.

This is **a curated evidence/retrieval system, not an LLM fine-tuning corpus**. A paper, claim, evidence edge, research question and source file are different objects. Maintain exact identifiers and versioned provenance.

## Pinned inputs — never infer a different master

- GitHub research branch (not `main`): https://github.com/mattbayliss99-eng/mjb-adhd/tree/research/evidence-library-2026-10-18/research/evidence-library
- Canonical machine catalogue: `catalog.json` in that branch.
- Canonical claim graph: `claims.json`.
- Human-friendly article cards, contradiction ledger and navigation: `PAPER_CARDS.md`, `CLAIM_LEDGER.md`, `TOPIC_INDEX.md`, `QUESTION_FIRST.md`.
- Native Google Sheet live working index: https://docs.google.com/spreadsheets/d/1qqQL148n70x0CeoEms1Sc34HTFGveNbwZfGIQBavXkc/edit
- Separate prior MJB BUILD 002 High-Value Research Queue — **cross-reference only; do not overwrite or duplicate its ownership/status records**: https://docs.google.com/spreadsheets/d/1n5EvLw2Z1VawtiqYUxhO2qRKyeMbFrRo5FJ-cRxgVV0/edit
- Website article backlog exists separately under `content-queue/next-upload-batch` on website repo. This research run must not integrate, merge or publish any site files.

## Work-mode configuration

Use **ChatGPT Work** with **High reasoning effort** where available (Extra High for the contradiction adjudication pass only, if offered). Work's browser/connected Drive and GitHub can handle long multi-page source collection and structured updates. Do not rely on a single model pass as scientific verification.

**Prompt to Work:** "Execute this GitHub WORK_MODE_RESEARCH_POPULATION_SPEC_v1.md against the linked native MJB evidence Sheet. Begin with the highest-priority 12 candidates, preserve original records, add findings and contradiction edges with traceable figure/page IDs, update the Sheet and research branch only, then return a change log and unresolved blockers. No patient material, website publishing, outreach, medication recommendations or unsupervised experiments."

## Phase 0 — Reconciling existing material

1. Fetch actual current `catalog.json`, `claims.json`, previous MJB research queue, and the native Sheet. Compare entries using DOI/PMID/PMCID and semantic study identity.
2. Deduplicate canonical paper identities; do not deduplicate two separate papers just because they reach similar conclusions.
3. Recheck every seed bibliographic identity against **PubMed / Crossref / publisher / Europe PMC**. Flag ID/title/DOI mismatch rather than invent a correction.
4. Mark existing seed entries `bibliography_checked`, `abstract_checked`, `full_text_checked`, or `full_methods_and_figures_checked` separately. An excerpt/abstract alone does not qualify as full-text review.
5. Create a dated batch identifier, e.g. `BATCH-2026-10-18-A`. Record original working versions and hashes where available.

## Phase 1 — Candidate search and evidence discovery

Use **PubMed + Europe PMC + publisher primary article** first; Crossref for DOI identity; clinical trial registries when interventions arise; citation chasing for mechanisms and explicit conflicts. Reviews support discovery but should not silently substitute for the primary experiment.

Prioritise:
1. SPG7–AFG3L2–EMRE/MCU, genotype-specific uptake direction, and 2026 patient-derived neuronal transport results;
2. NCLX / TMEM65 competing efflux assignments, excluding oversimplified universal exchange stoichiometry;
3. SERCA1/ATP2A1 delayed-relaxation phenotype, RyR1, electrical versus mechanical contracture;
4. Human VMAT2 structures, DAT efflux, TAAR1 and noradrenergic/receptor-subtype pathways;
5. Toe-walking motor/sensory comparative designs, neurological red flags and interventions with durable outcomes;
6. Neuronal sodium channels, Na+/K+-ATPase, inhibitory interneurons and spinal persistent inward currents;
7. Energetic reserve, local mitochondrial distribution, autonomic and salivary biology, and methods.

**Date strategy:** search 2024–2026 first for *new evidence*, then explicitly add earlier pivotal studies that introduce the mechanism, phenotype or key negative finding. Publication year alone is never evidence of validity. Log executed query, databases, exact date, coverage, results reviewed and inclusion/exclusion reasons. Search for **negative/null/failed replication** papers and contrary genotype experiments, not merely supportive work.

**Inclusion:** direct measurement, independent human replication, relevant variant-specific experiment, a credible contradiction, useful discriminator, significant clinical outcome/harms, or a high-quality systematic synthesis with defined cut-off. Exclude papers whose contribution is only keyword overlap or repeated unsupported discussion claims.

## Phase 2 — Extract a full paper card

**Mandatory fields:** paper_id, canonical title, DOI, PMID, PMCID if confirmed, online date/print date, article version/corrections/retraction status, publisher URL, open access licence, source type, search batch, reviewed_at, full-text access level.

**Study quality context:** study design; objective/hypothesis; species/organism and tissue; genotype or pharmacological intervention; cell-type/compartment; sample size and unit of analysis; control/comparator; blinding/randomisation where relevant; assay and endpoint; treatment/dose/exposure where methodologically relevant; statistical magnitude, uncertainty and relevant nulls; study limitations, conflicts of interest; exact page/table/figure/source locator.

**Meaning:** bullet-point process chain in the format `input → transport/assembly → regulation → output → termination/clearance → recovery`; actual demonstrated finding; what authors merely propose; what remains untested; too little/too much/unstable function effects *by compartment*, and potential downstream phenotypes without clinical causal inflation.

**Never:** infer the person's condition from drug response, treat absence of measurement as negative evidence, fabricate effect sizes, or propose illicit substance/drug challenge as a mechanism test.

## Phase 3 — Claim and contradiction graph

For each claim record one *atomic* statement with:
- `subject`, `mechanism`, `predicate`, `direction` (increase/decrease/conditional/not-established);
- `biological_level`: molecule → organelle → cell → tissue → circuit → behaviour → clinical;
- `study_context`: species, variant, tissue, measurement, concentration;
- `relationship`: **supports**, **qualifies**, **contradicts**, **null/negative**, or **method-dependent** (do not confuse disagreement with a direct falsification);
- `source_evidence`: paper ID + exact figure/page/table and directly measured endpoint;
- `bridge_needed`: precise missing causal transfer to another level;
- `independence_group`: shared cohort/protocol/lab/dataset to prevent double counting;
- `alternative_explanation`, `observables`, `last_reviewed`, `current_status`.

**Conflict case example:** NCLX and TMEM65 papers report different molecular assignments, but distinguishing reconstituted ion permeation from a required cofactor/protein interaction may reconcile part of the dispute. Keep competing versions live pending direct adjudication.

**Directional case example:** SPG7-knockout reduced uptake versus inappropriate EMRE/MCU un-gating in other perturbations. Do not average effects into a meaningless “mitochondrial calcium dysregulation” single-direction arrow.

**Cross-level validator:** every edge from protein→person, cell→circuit, and imaging surrogate→treatment outcome must carry a named bridge and its own evidence; downstream convergence is not independent validation of upstream mechanisms.

## Phase 4 — Confidence without false precision

Report two separate ratings:
1. **Confidence in the bounded claim itself** (high/moderate/low/insufficient), derived from design, directness, independent replication, precision and contradictions, including risk of bias.
2. **Confidence the mechanism explains a particular phenotype or therapeutic response** (often untested), which may be far lower.

Use GRADE-style assessment for clinical intervention/outcome certainty when appropriate, and context-appropriate mechanistic quality assessments for cell/biophysical experiments. Never apply a one-size-fits-all star score as a proxy for both.

Label: `directly_measured`, `replicated`, `qualified`, `contested`, `hypothesis`, `superseded_interpretation`, `requires_full_text`. Keep withdrawn/retracted sources with warning and rationale if needed for historical traceability; do not treat them as current supporting evidence.

## Phase 5 — Drive document instant pull

Use a **canonical source link** for every paper, and a `Drive PDF URL` only if a copy was lawfully stored or shared for authorised private research. Metadata/notes can reside in GitHub/Sheet even when the PDF must remain on publisher/PMC.

If storing an eligible original:
- verify licence and whether redistribution is permitted, record article version and canonical source URL;
- name `<paper-id>__<year>__<first-author>__<short-topic>.pdf`;
- store one copy only, in an appropriately access-controlled Drive repository (not a public shared folder without review);
- calculate/check checksum SHA-256 and capture upload/verification dates;
- add the verified Drive file URL to `PAPERS → Drive PDF link`, never guess an ID.
- keep private case files and third-party patient details out of the public GitHub repo.

**Quick retrieval:** Sheet filter/search topic → click `Paper ID` / source link → exact paper → linked claims/figure/page → counterevidence. Raw full-text training/fine-tuning is not the intended architecture.

## Phase 6 — Publish only research outputs to research branch

After each batch, update:
1. Native Google Sheet **PAPERS, CLAIMS, CANDIDATES, CLAIM_EDGES, SEARCH_LOG, MECHANISMS** using exact tab/range identifiers and readback verification.
2. GitHub research branch `catalog.json`, `claims.json`, `PAPER_CARDS.md`, `CLAIM_LEDGER.md`, topic/question indexes and `MAINTENANCE.md` when necessary.
3. A dated `BATCH_REPORT_<date>.md`: searched / screened / included / excluded counts; what genuinely changed; exact contradictions; new clinical-relevance signals; unresolved flaws; failed source access; next priority.
4. Run `python research/evidence-library/validate.py` on exported branch content or equivalent schema checks; confirm no dangling IDs and no accidental personal files.
5. Do **not** merge into production `main` or modify deployed `site/`. Draft website-copy suggestions separately and hold for explicit approval.

## Batch sizing / stop and escalation rules

- **Pilot:** 12 highest-priority candidates, roughly 3–5 primary papers per candidate *where relevant and actually found*, plus the counter-evidence; no artificial count target.
- Prefer completing high-quality, directly probative claims over collecting hundreds of abstracts. Do not add papers just to satisfy a quota.
- Mandatory pause/flag if source identity conflicts, licensing unclear, a study has been corrected/retracted, methodology cannot be inspected, source contradicts a prior cornerstone, or the claim requires a missing cross-species/molecule→person bridge.
- A “completed” candidate has: dated search log, inclusion/exclusion record, verified primary URLs, bounded findings with exact locators, relevant negative evidence, tested alternative explanations and an honest status.
- A “source not available” entry must remain explicitly unavailable, never be filled from model memory.

## Final handoff to user

Return a **concise control report** (not pages of filler):
- how many new eligible papers and claim edges; source-access failures;
- top 3 new empirical connections, what each actually supports, and what would falsify it;
- top 3 contested/outdated interpretations corrected;
- exact Google Sheet URL and GitHub research branch commit link;
- proposals for new site material **for review only**, not publication.

## Methodological references

- Living evidence updates require transparent surveillance and version history, not a one-time claim of currency: https://www.sciencedirect.com/science/article/pii/S0895435626004075
- Reproducibility needs preserved raw searches, dedup decisions and exclusions: https://doi.org/10.1136/bmjopen-2026-123460
- Structured machine-readable systematic evidence databases: https://doi.org/10.1186/s13750-021-00219-x
- Review automation can aid extraction but must preserve source verification: https://doi.org/10.1371/journal.pone.0320151
