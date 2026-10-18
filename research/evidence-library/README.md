# MJB Evidence Library — a causal research coprocessor

**Research branch only — not a public-facing article or treatment guide. Last targeted search: 18 October 2026.**

This is a small curated set of **14** verified, high-relevance papers. It is intentionally *not* a bulk ingestion of every paper or a machine-learning training dataset. Use it as a retrieval-augmented evidence store. The title, DOI, PMID, actual population/model, direction of effect, limitations and conflicting findings travel together.

## Start here

- [Human-readable subject routes](TOPIC_INDEX.md): start at mitochondria, catecholamines, motor control, sensory phenomena, or toe-walking.
- [Machine-readable paper catalogue](catalog.json): 14 entries with exact identity, study type, limits, tags, source link and associated claims.
- [Claim-level contradiction ledger](CLAIM_LEDGER.md): direct supporting/challenging links, and why apparent conflicts may reflect different systems.
- [Research and currency protocol](MAINTENANCE.md): minimum checks before quoting or elevating a finding.
- [Definition-first navigation](QUESTION_FIRST.md): enter by what failed instead of remembering terminology.

## Evidence rules

1. **Molecule ≠ mechanism ≠ cell ≠ circuit ≠ person.** Every level jump needs independent justification.
2. Track species, tissue, genotype, exposure, model, endpoints and the difference between direct measurement and author speculation.
3. Older pivotal primary research stays if still useful, **labelled foundational**, with newer work attached. A newer review does not automatically supersede an older experiment.
4. Record contradiction explicitly. In particular, recent studies disagree on the precise transporter assignment for mitochondrial calcium exit.
5. Distinguish null results, absent measurement and measured absence. Do not relabel "not tested" as "ruled out".
6. Avoid simple confidence addition when papers share the same dataset, pathway or assumptions.
7. No personal clinical records or identifiable third-party details in this public GitHub repository. No diagnosis or dose guidance from these mechanistic notes.
8. PDFs are linked to publishers/PMC until licence, exact version and permitted redistribution are verified. Never bulk-upload paywalled PDFs. Even open access may carry non-commercial or no-derivatives terms.

## Suggested future folders and tags

**Keep one canonical paper record** (keyed by DOI or PMID) rather than copy it into multiple subject folders. Cross-tag as needed: `mitochondria`, `calcium`, `ion_exchange`, `catecholamines`, `sodium`, `serca`, `motor_control`, `autism`, `toe_walking`, `methods`.

Expansion lanes: ion channelopathies/epilepsy; neural inhibition/PICs; calcium phosphates, ATP2A1 and ER stress; TAAR1; noradrenergic sensory gating; human genetic studies; treatment outcomes and harms. New records require literature verification, not AI-generated DOI guesses.

**Website:** Only curated, checked derivative articles go into `content-queue/next-upload-batch/`; this research branch is separate and isn't integrated into the deployed `site/` or `guidebook/` directories.
