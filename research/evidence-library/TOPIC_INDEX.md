# Topic index — enter from a biological system or a clinical pattern

All paper IDs resolve to [catalog.json](catalog.json) and claim IDs to [claims.json](claims.json). A paper can appear in several routes without duplicating the canonical record.

## Mitochondria / energy / protein maintenance
- **SPG7–AFG3L2–EMRE / MCU assembly:** P2017-EMRE → P2019-SPG7-MCU → P2026-SPG7-NEURONS → P2026-MITO-REVIEW.
- **Ca²⁺ uptake direction and gatekeeping:** C-MCU-ASSEMBLY; C-SPG7-DIRECTION. Separate free-matrix calcium, buffered calcium and total calcium.
- **Axonal mitochondrial transport:** P2026-SPG7-NEURONS; C-SPG7-AXON.
- **Calcium efflux / ion gradients:** P2025-NCLX-STRUCTURE ↔ P2025-TMEM65-EXCHANGER ↔ P2025-TMEM65-NCLX-PARTNER → P2026-MITO-REVIEW. **Unresolved, not a settled NCLX mechanism.** C-MITO-EFFLUX-IDENTITY.

## Catecholamines / dopamine / vesicle loading
- **Vesicular proton gradient and VMAT2:** P2025-VMAT2-STRUCTURE; C-VMAT2-STRUCTURE.
- **Amphetamine efflux independent of conventional cytosolic calcium signalling in culture:** P2023-AMPH-CALCIUM; C-AMPH-EFFLUX.
- **Human amphetamine / methylphenidate extracellular dopamine imaging:** P2026-PET-META; C-RELEASER-BLOCKER.
- **Newly indexed with open gates:** TAAR1 and transporter phosphorylation. **Still not adequately populated:** α2 noradrenergic sensory gating, spinal PICs and NET. Do not guess a drug response lesion from an incomplete branch.

## Motor control / muscle calcium / release of tension
- **Exercise-related stiffness and delayed relaxation with strength often preserved:** P2020-BRODY; C-RELAXATION.
- **Differentials not mutually exclusive:** continuing EMG activation, dystonia, spasticity, myotonia, electrically silent contracture, fixed shortening, fatigue/energetic limitation. The anatomical superficial back line does not imply a uniformly distributed SERCA defect.
- **HSP evidence:** P2026-SPG7-NEURONS (genotype-confirmed cell model, not treatment trial).

## Autism / toe-walking / pain
- **Motor vs sensory account:** P2024-TOE-MOTOR + P2026-TOE-SENSORY. See C-TOE-MECHANISMS: designs answer different questions.
- **Interventions:** P2026-TOE-REVIEW. Very-low-certainty evidence; no efficacy leaderboard (C-TOE-TREATMENT).
- **Pain and function:** P2026-TOE-SENSORY (C-TOE-PAIN). Use history, neurologic examination and gait biomechanics, not assumptions of inevitable deterioration.

## Start from a failure, not a molecule
- “Can generate force, but cannot release tension” → SERCA vs sustained neural activation → C-RELAXATION.
- “Initial signal works, repetition fails” → recovery gradients vs ATP supply vs fatigue → C-SPG7-DIRECTION; requires new direct evidence.
- “Calcium seems both too high and too low” → separate outside-membrane, cytosol, SR and mitochondrial matrix; C-SPG7-DIRECTION.
- “Older NCLX explanation seems confident” → C-MITO-EFFLUX-IDENTITY is explicitly **actively contested**.
- “Stimulant changes initiation but not strength” → C-RELEASER-BLOCKER; evidence here does **not** identify a single cause.
- “Toe-walking explained as sensory” → compare P2024-TOE-MOTOR vs P2026-TOE-SENSORY and ask what their study groups actually were.

**Search suggestion:** search any ID, normal function, observed failure or term in `catalog.json` and `claims.json`. Don't interpret a shared downstream effect as independent causal confirmation.

## Population pilot additions — 18 October 2026

- **Efflux dispute:** C-NCLX-COUNTERION; C-TMEM65-NCLX-DEPENDENCE; C-TMEM65-PERMEATION; C-TMEM65-MCU-RESCUE.
- **Local energy/vesicle maintenance:** C-ATP-VESICLE-CYCLE; C-ATP-NOT-CONSTANT; C-MITO-RETENTION; C-DJ1-ATP-VMAT2.
- **DAT/TAAR1 regulation:** C-DAT-STATE; C-TAAR1-LIGAND. Ligand, residue, loading and assay context are required.
- **Muscle assay specificity:** C-SERCA-ASSAY; C-RELAXATION. Four 2024 children overlap 2020.
- **Gait evidence genealogy/durability:** C-TOE-COHORT-DEPENDENCY; C-TOE-DURABILITY.

Use [batch control report](BATCH_REPORT_2026-10-18.md), [candidate audit](candidate_audit.json) and [search/screening records](search_log.json). New primary records have differing access levels; a catalogue entry does not certify full-methods/all-figures review.
