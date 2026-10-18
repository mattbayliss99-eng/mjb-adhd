# Claim ledger — evidence that agrees, disagrees or changes the meaning

This is a human-readable companion to [claims.json](claims.json). Claims are **scoped to their actual models**; the list is not a diagnosis, an efficacy guide or a statement that all research through October 2026 is exhaustively captured.

| Claim | Current evidence grade / scope | Direct evidence | Contrary or restricting evidence |
|---|---|---|---|
| C-MCU-ASSEMBLY — SPG7/AFG3L2 process unassembled EMRE | Direct mechanistic model support | P2017-EMRE | P2019-SPG7-MCU demonstrates the consequences are not a universal 'more calcium' phenotype |
| C-SPG7-DIRECTION — direction of mitochondrial Ca²⁺ disturbance | **Context-dependent** | P2019-SPG7-MCU; P2017-EMRE | P2026-SPG7-NEURONS has relevant phenotype but **did not directly assay calcium** |
| C-SPG7-AXON — mitochondrial transport in SPG7-derived neurons | Patient-derived cell evidence | P2026-SPG7-NEURONS | Bz-423 is not demonstrated safe/effective in patients |
| C-MITO-EFFLUX-IDENTITY — NCLX vs TMEM65 | **Actively contested in 2026** | P2025-NCLX-STRUCTURE; P2025-TMEM65-EXCHANGER; P2025-TMEM65-NCLX-PARTNER | The three primary interpretations differ; P2026-MITO-REVIEW explicitly does not settle them |
| C-VMAT2-STRUCTURE — proton gradient-dependent vesicle loading | Direct molecular evidence | P2025-VMAT2-STRUCTURE | It says nothing diagnostic about any one person's vesicular reserve |
| C-AMPH-EFFLUX — calcium-independent dopamine transporter efflux | Direct cultured-neuron evidence | P2023-AMPH-CALCIUM | Not evidence of universal calcium independence of stimulant physiology |
| C-RELEASER-BLOCKER — drug-response localisation | Molecular class contrast valid, patient lesion **not inferred** | P2023-AMPH-CALCIUM | P2026-PET-META shows both methylphenidate and amphetamine robustly affect extracellular DA; simplistic tonic/phasic dichotomy rejected |
| C-RELAXATION — strength preserved but muscle relaxation impaired | Human clinical genetics evidence for ATP2A1 disease | P2020-BRODY | Not generic evidence for SPG7/SERCA coupling or for personal diagnosis |
| C-TOE-MECHANISMS — sensory vs motor | Noncausal, different-study-group comparisons | P2024-TOE-MOTOR (toe vs non-toe autism comparison) | P2026-TOE-SENSORY (toe-walkers only) highlights co-occurring sensory issues but doesn't establish causal contrast |
| C-TOE-PAIN — gait/pain overlap | Parent-report association | P2026-TOE-SENSORY | Temporal direction cannot be determined |
| C-TOE-TREATMENT — most effective intervention | **Not established** | P2026-TOE-REVIEW | Eight heterogeneous studies / very-low-certainty; cannot rank treatments |

## How to update this without losing scientific history

1. Identify a *particular claim* that a newer paper challenges, rather than declaring a whole older paper obsolete.
2. Write down exactly which preparation, species, cell type, intervention, genetics, endpoint and exposure were different.
3. Link `supports`, `qualifies` and `challenges` symmetrically at the claim level. These edges indicate intellectual relationships, **not** automatically independent evidence or quantitative confidence.
4. Keep old foundational records accessible with `foundational_primary`, but mark the interpretation as contested, superseded, contradicted or still supported.
5. Put direct patient-derived cell evidence below clinical trial evidence for claims about treatment, but not automatically for molecular mechanism questions: method-to-question match matters.
6. Every new mechanism-to-person transition requires a bridge and an observable discriminator. Hypotheses alone are not evidence of disease in an individual.
