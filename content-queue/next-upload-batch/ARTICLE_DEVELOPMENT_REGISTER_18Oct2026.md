---
title: "MJB article development register — motor control, calcium and ion-gradient signalling"
date: 2026-10-18
status: research-backlog-for-review
privacy: general-science-only
publication: not-authorised
purpose: "Extend existing pages before creating standalone articles; no automated integration"
---

# Articles to add or extend — evidence and intervention gates

**Editorial status:** Staged research planning only. No website publication authorised. This public-repository document contains general science, not identifiable patient case histories. Do not move to website build without individual evidence audit, author review and approval.

## Operating rule: process → output → recovery, not molecule → assumed diagnosis

For each researched process, record (a) compartment and normal function; (b) inputs and gradients; (c) molecular transport or reaction; (d) relevant regulators and maintenance; (e) outputs; (f) too little / too much / unstable signal / slow recovery; (g) observable discriminator; (h) contradictory evidence and alternative causes; (i) evidence level by biological scale; (j) supported clinical assessment and management options; (k) safety boundaries; (l) source dates, species, cell type and methods.

**Important:** The same symptom can arise from opposing abnormalities in different cell types or compartments. Normal blood calcium is not an assay for intracellular or mitochondrial calcium; a normal nerve conduction amplitude is not a test for SERCA dysfunction. Avoid diagnostic inference from subjective stimulant response.

## P1 · Toe-walking in autism and ADHD: a gait pattern deserving motor assessment

- **Proposed headline:** "Toe-walking isn't always just sensory: what persistent forefoot gait can and cannot tell us."
- **Placement:** Extend `guidebook/content/pages/60-00-dystonia.md`, `60-01-spasticity.md`, and `35-heterogeneity.md`; cross-reference `content/genetics/GEN-06_when-movement-symptoms-and-adhd-traits-overlap.md`. Standalone accessible page only if extending makes those pages unwieldy.
- **Core supported facts:** Persistent toe-walking is associated with autism in observational cohorts. Sensory hypotheses exist but do not explain every case. Assess ankle dorsiflexion, calf/Achilles shortening, selective motor control, hyperreflexia/clonus, asymmetry, dystonic posturing, developmental history, and potential pain or balance contributions.
- **Research possibilities, explicitly unproven:** delayed relaxation / SERCA dysfunction in a subgroup; supraspinal gait selection differences; abnormal spinal persistent inward current amplification; altered proprioceptive feedback; compensatory stiffness. No general "autistic SERCA deficit" or automatic attribution of toe-walking to ADHD.
- **Progression distinction:** persistent forefoot gait *can* contribute to secondary tissue shortening, loading problems and contractures. It does *not* establish inevitable neurological deterioration with age. New/progressive weakness, asymmetry, falling, loss of skills or clear upper-motor-neuron signs merit specialist assessment independently of autism.
- **Intervention evidence gate (hold article until completed):** compare assessment-led physiotherapy/gait training, orthoses, serial casting, motor/balance training, sensory adaptations where indicated, botulinum toxin and surgery in selected cases. The July 2026 systematic review (8 studies, 424 ASD participants) reported heterogeneous, non-comparable endpoints and cannot establish a treatment hierarchy. A 2025 narrative review also highlights substantial relapse and thin evidence. Separate improvements in ankle range, habitual walking, pain, functional capacity and long-term recurrence.
- **Publication gate:** interventions table with study design, age, sample size, comparator, direct gait endpoint, durability and adverse effects; practical "when to seek assessment" section; no treatment claims based solely on mechanism.
- **Sources:** https://doi.org/10.3389/fmed.2026.1832930 ; https://pubmed.ncbi.nlm.nih.gov/41007062/

## P1 · Failure to release tension: spasticity vs dystonia vs myotonia vs silent contracture

- **Placement:** `guidebook/content/pages/60-00-dystonia.md`, `60-01-spasticity.md`, `53-appointment.md`; extend `37-open-questions.md`.
- **Schematic:** central command ends → is EMG still active? → if yes investigate continuing neural drive, co-contraction, spasticity, dystonia/myotonia; if no yet tension persists, investigate electrically silent contracture, calcium reuptake and muscle energetics.
- **Normal:** calcium released through RyR1 activates skeletal muscle contraction; SERCA1 (ATP2A1) uses ATP to replenish SR and permit relaxation.
- **Too little / delayed:** residual cytosolic calcium and delayed relaxation; repeated action can become harder despite preserved strength. **Too much SERCA activity:** faster reuptake need not mean better function; may limit calcium transient amplitude and affect contraction. **Variability:** workload and fibre composition matter.
- **Clinical discriminator:** review raw prior NCS/needle EMG (if available); interpret actual wording, recorded muscle activity and whether provoked contractions were studied. Routine NCS normality alone does not diagnose Brody disease.
- **Source:** https://pubmed.ncbi.nlm.nih.gov/?term=Brody+disease+40+patients+SERCA+ATP2A1

## P1 · Ca²⁺ outside the cell vs inside the cell: why the same symptoms can oppose each other

- **Placement:** `31-adhd-biology.md`, `60-03-nerve-pain.md`, `60-04-sensory-feedback.md`, and `37-open-questions.md`.
- **Schematic:** extracellular ionised calcium → NaV threshold/excitability; action potential → CaV calcium influx → vesicular exocytosis; intracellular calcium → contraction, second messengers, transcription; PMCA/SERCA/NCX → recovery.
- **Low extracellular ionised calcium:** increases neuronal excitability/tetany susceptibility; **high:** often suppresses neuromuscular excitability. **Unstable:** pH and albumin binding can affect free calcium and symptoms without equal movement in total calcium.
- **Distinguish:** circulating total/adjusted/ionised calcium vs neuronal cytosolic Ca²⁺ vs SR Ca²⁺ vs mitochondrial matrix free/total Ca²⁺.

## P1 · SPG7–AFG3L2–EMRE/MCU mitochondrial calcium quality control

- **Placement:** `60-05-hsp.md`, `32-genetics.md`, `37-open-questions.md`; reuse rather than re-create the mitochondrial atlas.
- **Schematic:** SPG7/AFG3L2 m-AAA protease processes unassembled EMRE → MCU assembly/gating with MICU → controlled mitochondrial Ca²⁺ influx → metabolic matching; also organelle morphology, axonal transport and maintenance.
- **Deficit possibilities:** too little Ca²⁺ entry and poor demand matching; too much ungated entry in some perturbations; disturbed mitochondrial distribution; excessive calcium–phosphate buffering. **Do not infer the direction from the gene alone.**
- **Evidence:** primary EMRE study https://pubmed.ncbi.nlm.nih.gov/28396416/ ; 2026 human SPG7 patient-derived-neuron work https://pubmed.ncbi.nlm.nih.gov/42367671/ ; 2026 synthesis https://doi.org/10.1152/ajpcell.00212.2026
- **Gate:** variant/phenotype specificity, species and experiment, direct versus inferred calcium measurement, alternative causes, genotype unknown/negative branch.

## P2 · Mitochondrial calcium exit: NCLX versus TMEM65, an actively contested assignment

- **Placement:** Advanced companion section within HSP/calcium atlas, not a general-patient treatment page.
- **Schematic:** matrix Ca²⁺ → Na⁺-dependent and H⁺-dependent efflux → clearance/refilling/bioenergetics.
- **2026 evidence update:** identity and relative role of NCLX/SLC8B1 versus TMEM65 in mitochondrial Na⁺/Ca²⁺ exchange are debated; LETM1 versus TMBIM5 for H⁺/Ca²⁺ exchange likewise requires care. Keep the functional node stable but mark component identity disputed.
- **Sources:** https://doi.org/10.1152/ajpcell.00212.2026 ; https://doi.org/10.1002/cpz1.70393

## P2 · Sodium gradients and signalling failure: NaV, Na⁺/K⁺-ATPase, DAT/NET and calcium pumps

- **Placement:** `31-adhd-biology.md`, `34-dopamine-system.md`, `11-how-medicines-act.md`.
- **Schematic:** ATP supplies Na⁺/K⁺ gradient maintenance → action-potential reliability / cotransporter direction; presynaptic CaV and VMAT proton gradient are distinct.
- **Three failure modes:** absent/weak signalling, pathological repetitive excitation, and poor recovery at high frequency. Keep tissue/cell type explicit.
- **Seizures:** some SCN1A loss-of-function variants reduce inhibitory interneuron firing and paradoxically promote network seizures. Hyponatraemia-related seizures are not proof of a sodium-clearance reset or desirable sodium loss. Keep as a differential-neurology explainer, not proof of autism/ADHD causation.

## P2 · Noradrenergic motor gain, spinal persistent inward currents and inhibitory sensory gating

- **Placement:** extend `60-01-spasticity.md` and staged `neural-gating-signal-fidelity-evidence-note-2026-10-17.md`.
- **Schematic:** LC/descending NE and serotonin → receptor-subtype/location-specific modulation → motor-neuron PIC gain vs dorsal-horn alpha2 inhibitory pain gating vs cortical executive motor control.
- **Critical qualifier:** improved movement with a noradrenergic medicine does not locate the effect exclusively above or below the spinal cord; multiple receptor/circuit actions operate simultaneously.
- **Source:** https://pubmed.ncbi.nlm.nih.gov/39196985/

## P2 · Why two stimulants can differ: DAT, VMAT2, TAAR1, autoreceptors, NE and exposure profile

- **Placement:** extend `11-how-medicines-act.md`, `34-dopamine-system.md`, `62-dopamine-options.md`, and `37-open-questions.md`.
- **Schematic:** releaser substrate vs uptake blocker; vesicular mobilisation, transporter efflux, intracellular TAAR1/CaMKII modulation, tonic/phasic dopamine, receptor adaptation, NET contribution and site-specific receptor effects.
- **Guardrails:** do not assume methylphenidate affects only phasic dopamine or that strong response establishes deficient VMAT2/SPG7. Amphetamine and methylphenidate both can elevate extracellular dopamine. Drug response alone cannot localise a lesion.
- **2026 source:** https://www.nature.com/articles/s41380-026-03826-7 ; https://pubmed.ncbi.nlm.nih.gov/42635828/

## P3 · Autonomic symptoms and metabolic/ionic signalling

- **Placement:** extend `60-04-sensory-feedback.md`, `60-07-fatigue-sleep.md`; optionally add a section to `03-pain-fatigue.md`.
- **Questions:** sweating, oral dryness, heat tolerance, thirst and tachycardia; distinguish autonomic activation, drugs, fluid status and endocrine issues. Sweat is not an effective targeted clearance route for mitochondrial calcium or membrane sodium.
- **Gate:** no claims of adaptive 'electrolyte detoxification'; standard clinical evaluation first.

## P3 · Food choices, palatability and signal attribution

- **Placement:** short evidence appendix if needed rather than standalone medical theory.
- **Process:** appetite drive → food moisture/texture → orosensory reward → metabolic satiety → medication/adrenergic state; avoid inferring genetic metabolism from preferences for salt, meat, sugar or dairy fat.
- **Gate:** food-preference evidence is weak as a proxy for intracellular substrate usage. No identification of other people or extrapolation to neurodevelopmental diagnosis.

## Reusable article block: compound/process node

- **Name + other search words:** e.g. SERCA = ATP-dependent Ca²⁺ pump / muscle reset
- **Compartment:** blood, extracellular surface, axon, synapse, skeletal muscle SR, mitochondrial matrix
- **Normal role:** input → regulator → functional output → clearance/replenishment
- **Too little:** plausible impairment, measurable consequence and competing mechanisms
- **Too much:** different downstream directions by compartment
- **Unstable:** timing, peak/tonic, depletion, recovery and compensation
- **Observable:** what clinician/researcher could measure
- **Evidence:** human / model system / cell / biochemical, date and link
- **Alternatives & exclusions:** opposite-direction mechanisms, counter-observations
- **Symptom interventions:** evidence-graded, clinician-directed, long-term durability and harms
- **Editorial placement + internal links:** extend existing page unless independent search/use case requires new page

## Release gates (all required)

1. Verify 2026 literature against primary studies, study dates and comparator outcomes; don't assume prior reviews are current.
2. Separate empirically observed motor signs from hypotheses and subjective narrative.
3. No recommendations for unsupervised drug/supplement changes, stimulant comparisons or provocative physical exertion.
4. Ensure management advice begins with neurological and biomechanical assessment; distinguish treatable mechanical consequences from potentially progressive neurological disease.
5. Source every claim; add source IDs before converting this backlog into website guidebook format.
6. Preserve mobile accessibility and question-first traversal; avoid repeating existing articles.
7. Present draft to author for review; only then integrate and deploy.

**Repository staging path:** `content-queue/next-upload-batch/`. The repo is public; do not place private medical histories in this file.