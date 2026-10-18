# Research control report — BATCH-2026-10-18-A

Status: research branch only; pilot extracted with explicit open gates. **No website files, production branch, clinical treatment or private records changed.**

## Scope and control counts

- Canonical index: [Google Sheet](https://docs.google.com/spreadsheets/d/1qqQL148n70x0CeoEms1Sc34HTFGveNbwZfGIQBavXkc/edit).
- Existing branch: `research/evidence-library-2026-10-18`; parent `89e13715619f0975942fe58222adfaf6dfc6b2ef`.
- **12 Highest candidates investigated:** R01, R02, R04, R05, R09, R10, R11, R12, R21, R24, R26, R27. Priority tie resolved by existing queue order; R32 is the thirteenth Highest and remains unselected.
- **26 additional primary papers**, retaining all 14 original seed identities: **40 records**. **24 claim nodes** (13 additional) and **71 context-bearing edges**: 17 prior paper/claim pairs adjudicated, 54 additional pairs.
- **34 main texts inspected with targeted methods/results/figure legends; six abstract-only records** (four new primary papers and two seed reviews). No full-supplement, all-image or raw-data audit claimed. Missing sample subcounts/COI/masking details remain explicitly unextracted.
- All 40 DOI identities checked against Crossref; 39 also resolved through Europe PMC/PubMed metadata. The 2024 motor/sensory comparison is not indexed in Europe PMC and was verified against Crossref and the actual primary PDF. No DOI/title identity mismatch found. Crossref SPG7-neuron print/online chronology is flagged rather than silently repaired.
- 25 retained search/retrieval log entries; 596 returned database/identity record appearances screened (includes repeated records); 484 unique source identities dispositioned: {'included': 40, 'deferred_not_full_text_adjudicated': 342, 'excluded_preprint_version': 42, 'discovery_only': 59, 'held_primary_methods_concern': 1}. Overlapping queries/versions are not independent studies. Some searches cap at 60 relevance-ranked returns; this is a targeted scan, not exhaustive surveillance.
- Initial broad Europe PMC multiword setup probes were narrowed to explicit TITLE_ABS searches; the retained quantitative screen is the precise query set. PubMed HTTP 429 is an access failure, not a null result.
- BUILD 002 queue cross-read only. No ownership/status cells changed there. 14 canonical papers match exact DOI/PMID mentions in that queue (see prior_queue_crosswalk.json); these are new-to-library additions where applicable, not claimed as new discoveries in the wider project.

## Three useful empirical connections

| Connection | Actually supported | Boundary / falsification target |
|---|---|---|
| SPG7 genotype/context → mitochondrial distribution | 2026 donor cortical neurons have slower day-14 anterograde velocity and selective ultrastructural abnormalities; 2023 cells give related but different neurite/potential findings. | Neither establishes local ATP loss or matrix-calcium direction. A genotype-matched study with normal ATP/calcium despite the transport phenotype would reject that proposed bridge. |
| ATP-sensitive vesicle function → dopamine handling | 2026 PARK7 patient/isogenic neurons combine energy, VMAT2/vesicle and oxidation endpoints with ATP-versus-ATP-γ-S rescue. | One pleiotropic genotype; no proof V-ATPase is the sole ATP-sensitive step or that SPG7/ADHD shares it. Separate pH/uncoating/abundance rescues can discriminate alternatives. |
| TMEM65 efflux → calcium-dependent tissue injury | Reconstitution, independent cell-null data, and 2026 mouse Mcu genetic rescue support linked but different levels of calcium-balance biology. | They do not settle all NCLX counterions or show human therapeutic safety. Failure of independent purified co-flux replication or context-specific native-null results would constrain the assignment. |

These are compatible circuits, **not three independent confirmations of one upstream disease mechanism**. Independent replication is assigned by cohort/preparation/lab; multiple endpoints in one study do not multiply causal confidence.

## Main interpretations corrected or held

1. **NCLX H-only / universal TMEM65–NCLX dependency:** the July 2026 NCLX primary and December 2025 independent TMEM65 primary materially expand the conflict. The NCLX competition assay itself cannot exclude ion blockade. Stoichiometry remains unresolved.
2. **More mitochondrial movement / stable ATP / one TAAR1 direction:** retention and workload matter; ATP can decline with physiological-like activity; TAAR1 ligands move uptake in opposing directions. No generic arrow is appropriate.
3. **Independent clinical corroboration / treatment ranking:** 2025 and 2026 ASD papers reuse one cohort; 2024 Brody adds only five new children to four reused cases. ROM/training-step improvements are not durable gait superiority. Idiopathic trial nulls are labelled indirect for ASD.

Other retained cautions: SERCA assay specificity; survey OR mismatch; TAAR1 figure wording; registry masking/enrollment discrepancy. Full source-by-source details and exact locators are in PAPER_CARDS.md, claims.json, bibliography_audit.json and CLAIM_LEDGER.md.

## Top three experimental or clinical questions

1. **Does the relevant SPG7 perturbation alter calcium direction and ATP reserve in the same distal human neuronal compartment?** Measure free matrix calcium, uptake/efflux, membrane potential, local ATP/ADP, mitochondrial retention and transmission together, using genotype/isogenic controls. Morphology alone cannot answer this.
2. **Which protein/counterion system carries native efflux under matched conditions?** Independent labs should compare NCLX, TMEM65 and double-null/rescue systems with defined Na/K/Li/H gradients, direct co-flux, targeting/purity controls and tissue context. Distinguish permeation from dependence.
3. **Which ATP-consuming step limits vesicular dopamine handling?** Factorially separate V-ATPase/pH, HSPA8/clathrin uncoating, VMAT2 abundance and ATP supply in human dopamine neurons; then test SPG7/AFG3L2 perturbations rather than assuming cross-genotype convergence. Include ATP/purinergic controls and direct flux rather than pH-sensitive reporter alone.

Clinical relevance remains bounded: preserved strength does not exclude delayed relaxation in established ATP2A1 disease; appropriate observed mechanical/electrophysiological endpoints differ from routine NCS. No individual diagnosis or treatment recommendation is made.

## Open gates and access failures

- Primary abstract-only: P2021-TOE-CAST-AFO, P2018-TOE-NEURO, P2025-TOE-RCT, P2013-TOE-BOTOX-NULL. Two seed reviews also remain abstract-only. Full-text efficacy/harms/allocation claims remain held.
- Multiple Europe PMC XML failures were recovered via public PMC HTML; the Brody 2024 PDF was recovered via the Erasmus primary-paper repository. Do not count a recovered endpoint failure as an unavailable study.
- Supplements, raw data, remaining per-panel counts, COI/masking details and complete correction-notice surveillance require a subsequent pass. No source was filled from model memory.
- R01 older pivotal König 2016 was identified but not given new evidence credit without full-text access. The 2023 sensorimotor trial was primary-screened: 40 children, eight-week ROM/posture endpoints, unclear allocation, no durable-gait endpoint; its superiority conclusion is not accepted.
- Original PDFs were not copied to Drive or GitHub. Rights are version-specific; Crossref TDM licences are not redistribution permission. Source links/checksums retained; Drive PDF cells stay blank.

## Verification and handoff

Run `python research/evidence-library/validate.py` and `python research/evidence-library/validate_population.py`. Validate all paper/claim/edge links and normalized DOI/PMID uniqueness; verify only research/evidence-library paths changed. All six canonical Sheet tabs were written and 3,044 target values were read back with zero mismatches; all unselected candidate and ID columns were preserved. Fourteen paper-ID notes cross-reference the prior queue. Header wrapping/body formatting and frozen headers were checked through the API; native rendered fit was not verified. Exact remote commit is supplied in the final handoff after push and readback.

Website ideas for **review only**: extend existing mitochondrial-efflux, weak/inconsistent-medication and gait/relaxation articles with these boundaries. No website backlog, site/guidebook file or deployment is changed by this run.
