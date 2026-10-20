---
title: "Neurotransmitters as context-dependent control signals — critical mechanism audit"
date: 2026-10-19
status: "research-draft-for-review"
publication: "NOT AUTHORISED"
privacy: "general neuroscience only; no private patient records"
extend_instead_of_duplicate:
  - "guidebook/content/pages/62-dopamine-options.md"
  - "guidebook/content/pages/63-botanical-evidence.md"
  - "guidebook/content/pages/60-01-spasticity.md"
  - "content-queue/next-upload-batch/MOTOR_SIGNAL_GAIN_TIMING_MODULATION_BRIEF_19Oct2026.md"
---

# Neurotransmitters as circuit-control signals, not emotion labels

**Public-science editorial draft.** Proposed title for eventual treatment/mechanisms appendix: *Why serotonin is not a mood dial: signal timing, gain, receptor hardware and circuit context*. No live site change. Do not convert mechanism into a drug-selection rule.

## Thesis and explicit rival models

The popular **serotonin deficiency → depression → SSRI replenishes serotonin** narrative is not validated as a general causal model of depression. This does not mean serotonin cannot regulate emotional processes or that SSRIs lack clinical efficacy. Instead, ask what the molecule does to a specified **circuit, under a specified state, at a specified timescale**.

Three competing explanatory models can be audited:

- **M0: fixed neurochemical label** (serotonin increases mood/stability, dopamine causes pleasure, noradrenaline causes arousal). Predicts near-uniform outcomes for increasing transmitter concentration; contradicted by receptor heterogeneity, context and circuit perturbation studies.
- **M1: circuit-configuration model** (local receptor composition, projection identity, ion-channel coupling and active network state determine direction and magnitude). Has direct electrophysiological and state-dependence support.
- **M2: timing/gain/eligibility model** (a serotonergic system changes the allowable time for event association, the persistence of signalling, feedback response or signal-to-noise). Validated for one fruit-fly olfactory-learning circuit but remains a specific hypothesis for human cognition, ADHD, SSRI emotional blunting and motor symptoms, not an established universal role.

**Vocabulary precision:** serotonin (5-HT) is a ligand/neuromodulator and transmitter; receptors and downstream ion channels/second-messenger cascades are the transducer; SERT is a sodium/chloride-coupled uptake transporter; vesicles and release machinery set the input. It is NOT a general-purpose required junction that dopamine must pass through, nor does inhibiting reuptake necessarily insert a few extra milliseconds into fast glutamatergic neurotransmission.

## Highest-signal experiment: serotonin can change a learning time window

**Zeng et al., Neuron 2023** DOI [10.1016/j.neuron.2022.12.034](https://doi.org/10.1016/j.neuron.2022.12.034), full study [PMC11152601](https://pmc.ncbi.nlm.nih.gov/articles/PMC11152601/).

Species: *Drosophila*. Task: pairing olfactory cue and shock across delays (behavioral T-maze); GRAB sensors for serotonin and acetylcholine, electrophysiological/plasticity-linked readouts, genetics and pharmacology. Fitted behavioural coincidence t50: control 16.9 seconds, tryptophan-hydroxylase-deficient 10.8 seconds, fluoxetine-treated 25.2 seconds. Stimulating/silencing the DPM serotonergic neuron likewise lengthened/shortened the learning time window. Study describes DPM-to-Kenyon-cell inhibitory feedback and heterogeneous release among mushroom-body compartments. Authors found changes in coincidence window rather than a uniform change in amplitude at already-short cue-shock intervals.

**Direct inference:** local 5-HT activity can gate the time window in which subsequent events are associatively linked. **Not established:** human thought-initiation latency, a generic synaptic conduction delay, or clinical antidepressant mechanism. These seconds refer to event-association behaviour, not neurotransmission propagation.

## The same transmitter can increase or decrease excitability; receptors are causal, not narrative filler

**Human neocortical slice study:** [PMID 10375681](https://pubmed.ncbi.nlm.nih.gov/10375681/): 21 pyramidal neurons from 12 people; 11 depolarized, 5 hyperpolarized, 2 biphasic, 3 no response to experimental 5-HT. Antagonist experiments linked depolarization to 5-HT2A and hyperpolarization to 5-HT1A. Small ex-vivo study with supra-physiological application concerns, not population frequencies.

**Co-expression / projection specificity:** [PMID 14754868](https://pubmed.ncbi.nlm.nih.gov/14754868/) showed in rat medial PFC that 5HT1A-associated inhibitory and 5HT2A-associated excitatory responses could be evoked in the same pyramidal neuron depending on stimulation coordinates. **Activity dependence:** [PMID 25206322](https://pubmed.ncbi.nlm.nih.gov/25206322/) found different serotonergic responses for mouse cortical projection-cell classes depending on baseline/suprathreshold excitatory drive.

**State dependence:** [Nature Communications 2024, DOI 10.1038/s41467-024-48489-6](https://doi.org/10.1038/s41467-024-48489-6). Transient optogenetic dorsal-raphe serotonergic stimulation + brain-wide fMRI in male mice: broad positive BOLD-like responses when awake, negative activity patterns under isoflurane. Anaesthesia alters many systems and fMRI hemodynamic readouts are indirect, so not proof that receptor topology is irrelevant. It directly rules out a simple invariant direction for a fixed stimulation paradigm.

**Mechanistic anchor:** 5-HT1A often couples Gi/o to inwardly rectifying K+ conductance (hyperpolarizing); 5-HT2A couples Gq and can reduce K+ conductance / depolarize; 5-HT3 is an ionotropic cation-channel receptor enabling comparatively rapid effects. Site- and cell-specific outcomes matter. [Review PMID 2123618](https://pubmed.ncbi.nlm.nih.gov/2123618/); [cortical review PMC3630391](https://pmc.ncbi.nlm.nih.gov/articles/PMC3630391/).

## What "quantity matters" actually means: an input-response problem

Extracellular concentration is governed by release, diffusion, transport clearance and enzymatic/metabolic fate (and influenced by firing/autoreceptor feedback). A conceptual local mass balance is d[5HT]_ext/dt = R(t) - U_SERT - D_other; note units, spatial gradients and nonlinearity ignored. Receptor occupancy is saturable; different receptor subtypes need not have equal affinities. Effective output = f(receptor expression, local concentration trajectory, input state, co-transmitters, membrane voltage, downstream effectors, history). No simple “extra delay per reuptake” claim.

**Direct pharmacology**: [PMID 8605960](https://pubmed.ncbi.nlm.nih.gov/8605960/) rat microdialysis observed that acute fluoxetine raised extracellular 5-HT to different degrees in raphe vs hippocampus vs cortex. [PMC1572046](https://pmc.ncbi.nlm.nih.gov/articles/PMC1572046/) rat experiments found region-specific interaction between SERT blockade and 5-HT1A/5-HT1B autoreceptors. [PMID 28653748](https://pubmed.ncbi.nlm.nih.gov/28653748/) meta-analysis of 42 rat microdialysis studies (798 rats) found different cortical extracellular trajectories across first week and later weeks on SSRIs. Extrapolation of chemical dynamics to patients or clinical response is not direct.

**SSRIs do not equal serotonin deficiency correction.** The umbrella review [PMID 35854107](https://pubmed.ncbi.nlm.nih.gov/35854107/) found no convincing consistent link between low serotonin markers and depression in the covered evidence. Substantial published critiques [doi:10.1007/s00406-022-01549-8](https://doi.org/10.1007/s00406-022-01549-8) argue that some imaging/test interpretations and selection are problematic. Keep both; reject low-serotonin-as-universal-cause, not serotonin involvement or treatment benefit as a category. NICE NG222 explicitly recognises clinical benefits, adverse effects, patient preference and withdrawal; do not recommend abrupt discontinuation. [NICE](https://www.nice.org.uk/guidance/ng222/chapter/recommendations).

**Human behaviour:** [PMID 36683090](https://pubmed.ncbi.nlm.nih.gov/36683090/) chronic escitalopram vs placebo for 66 healthy volunteers measured reduced reinforcement sensitivity in specific tasks, without blanket cognitive impairments. A decrease in reinforcement sensitivity is not proof that serotonin uniformly suppresses emotion; avoid simplistic happiness/flatness dichotomy.

## Interaction with dopamine: localized opponent coding, not independent global emotional dials

**Cardozo Pinto et al., Nature 2025**, published online 25 Nov 2024: [doi:10.1038/s41586-024-08412-x](https://doi.org/10.1038/s41586-024-08412-x). In mice, simultaneous dopamine and 5-HT terminal activity/sensor measurements in nucleus accumbens showed reward-associated dopamine increase **and** serotonin decrease in the interrogated region. Optogenetic interventions reducing either response modestly affected conditioning, while perturbing both strongly disrupted reinforcement; reproducing both together supported learning. Local circuit, not a worldwide 5-HT inverse reward law.

**Dopamine:** [Gershman et al., Nat Neurosci 2024, doi:10.1038/s41593-024-01705-4](https://doi.org/10.1038/s41593-024-01705-4): predictive errors, reward features, action selection, movement signals not captured by “pleasure” label. Distinguish wanting/incentive salience, liking/hedonic impact, learned prediction and motor control. [Robinson & Berridge, 2025, doi:10.1146/annurev-psych-011624-024031](https://doi.org/10.1146/annurev-psych-011624-024031).

**Norepinephrine:** locus-coeruleus adaptive-gain theory addresses phasic performance-linked responses versus tonic exploration/disengagement, not mere adrenaline; see [Aston-Jones & Cohen 2005](https://doi.org/10.1146/annurev.neuro.28.061604.135709). Hypothesis-generating synthesis, not a proven whole-brain scheduling model. Peripheral sympathetic effects and central noradrenergic response must remain separate.

## Medication-audit template for every compound or supplement

1. **Target and direct perturbation** (e.g. SERT occupancy, DAT inhibition, ligand affinity, vesicular release, calcium conductance): specify concentration and experimental tissue.
2. **Location and configuration** (source projection, receptor subtype, pre-/postsynaptic localization, expression).
3. **State** (prior drive, co-release, autoreceptor feedback, sleeping/waking, medication background).
4. **Immediate local effect** (ion current, depolarization, spike output, synaptic plasticity).
5. **Network endpoint** (gain, latency, persistence, coincidence window, coordination, inhibition).
6. **Human endpoint** (mood, anxiety, attention, task execution, motor function, autonomic safety).
7. **Alternatives/falsifiers** (what predicts the opposite result; what observation separates hypotheses).
8. **Study grade** (human RCT vs human electrophysiology vs animal circuit intervention vs theory); do not combine evidence levels into one unsupported causal chain.

**Computer analogy — useful, but constrained:** transmitters are addressed biochemical broadcasts or modulatory signals, receptor/ion-channel systems are the configurable receivers, reuptake is signal termination/recycling, network state is execution context, homeostatic feedback resembles dynamic control rather than fixed BIOS switches. “Serotonin is RAM channels” is a metaphor, not an anatomical finding.

## Executive function: task batching as a strategy, not a universal ADHD marker

Anecdotal *compile -> initiate once -> execute sequence* is a plausible response to high task-initiation cost, repeated context-switching and prospective-memory burden. It can lower the number of separate activation gates yet increase failure risk if working-memory maintenance or interruptions occur. It should not be presented as a clinical signature of every person with ADHD. Proposed practical design: one external checklist, grouped initiation, explicit return/restart cues, and short atomic tasks, without requiring uninterrupted “batch execution.”

## Three discriminating next questions

1. **Temporal gating:** in human behavioural experiments, does serotonergic perturbation change *which cue-target delays can be learned* without proportionally changing short-delay accuracy or movement reaction time? Make species and designs explicit.
2. **Receptor/circuit state:** do identical local 5-HT perturbations reverse spike output depending on baseline drive and 5-HT1A/2A distribution (with antagonist controls)? Distinguish primary cell electrophysiology from BOLD studies.
3. **Functional dissociation:** when monoaminergic drugs change reported anxiety, do objectively measured reward sensitivity, executive task-start latency, antagonistic muscle coactivation, postural stability and autonomic responses change independently? Observational response does not prove a particular receptor or genetic mechanism.

**Ethical and safety boundary:** No intentional stimulant, cocaine, SSRI or poly-supplement challenges to test these mechanisms. Medication changes and neurological symptoms require clinical oversight.

## Publication decisions

- Extend treatment pharmacology and motor neurology sections with a **“transmitter ≠ behavioural label”** audit.
- Keep serotonin as mood deficiency **disputed/not established**, but serotonergic receptor-level effects and limited human clinical efficacy as different evidence items.
- Keep task-batching idea under ADHD accessibility as an illustrative strategy, not universally characteristic physiology.
- Resolve source grades and abbreviations before generation, avoid new route proliferation.
- **DO NOT publish live website or copy personal clinical information.**


## Endogenous enkephalin and circuit-dependent inhibition: editorial extension (20 October 2026)

**Why include it:** popular “dopamine = motivation”, “GABA = calm”, “endorphins = pleasure” categories hide the fact that opioid peptides co-exist with GABA and dopamine receptors in movement/reward networks, where receptor location determines system-level sign. This belongs in the EXISTING neurotransmitter context audit, not a new isolated article. No private thought-association or medication record is added.

**Taxonomy:** There is no scientifically designated set or ordinal ranking of the “seven most important neurotransmitters.” Glutamate and GABA are the major fast excitatory/inhibitory transmitters in mature brain networks (with important exceptions); dopamine, noradrenaline, serotonin and acetylcholine serve heterogeneous transmitter/modulator functions; peptides such as **Leu-enkephalin** and **Met-enkephalin** are slower neuromodulators. Calling leu-enkephalin an “endorphin” is colloquial: enkephalins, beta-endorphin and dynorphins are distinct endogenous-opioid peptide families. Discrete “top seven” rankings lack a metric (abundance, neural necessity, network leverage, patient outcome).

**PENK-enkephalin striatum / dopamine / GABA junction:** An established basal ganglia organisational pattern is that striatal medium spiny projection neurons provide GABAergic outputs; D2-receptor-enriched indirect-pathway populations often coexpress **preproenkephalin (PENK)**, while D1/direct populations are more associated with prodynorphin, with important single-cell/circuit exceptions. Leu/Met-enkephalins bind opioid receptors (most notably mu and delta receptor families, with actual selectivity context-dependent) and modify local dopamine-, GABA-, acetylcholine- and glutamate-linked signalling through neuronal and presynaptic network effects. [Steiner & Gerfen 1998, PMID 9835393](https://pubmed.ncbi.nlm.nih.gov/9835393/); [review with circuitry, PMCID PMC4292947](https://pmc.ncbi.nlm.nih.gov/articles/PMC4292947/); [opioid/enkephalin reward review 2022, PMCID PMC9391026](https://pmc.ncbi.nlm.nih.gov/articles/PMC9391026/). In early in vivo rat electrochemistry, local striatal delta-agonist stimulation **potentiated potassium-evoked**, but not spontaneous, dopamine efflux, demonstrating that baseline state and stimulation conditions matter. [Pentney & Gratton 1991 PMID 1661389](https://pubmed.ncbi.nlm.nih.gov/1661389/). This is not a human ADHD-target validation or proof of a user's individual neurochemical profile.

**GABA ≠ “switches off any neuron it binds”**: GABA_A increases chloride/bicarbonate conductance, which may hyperpolarise, shunt or even depolarise a cell depending on E_Cl and input timing; *depolarisation* does not always equal spike excitation due to shunting. GABA_B uses GPCR signalling, commonly opens GIRK K+ channels and/or suppresses presynaptic Ca channels. Inhibiting an inhibitory interneuron can disinhibit the downstream circuit, resulting in net **increased** activity. A single transmitter label cannot decide behavioural “calmness.” [Kilb 2021 PMID 34899178](https://pubmed.ncbi.nlm.nih.gov/34899178/); [GABA_A reversal adult brain 2024 PMCID PMC10817304](https://pmc.ncbi.nlm.nih.gov/articles/PMC10817304/); [Farrant & Nusser 2005](https://www.nature.com/articles/nrn1625).

**Ranking versus internal association:** Free-association, introspective yes/no prompts and felt salience can generate hypotheses about *which concepts one is exploring*. They are not assays of peptide levels, receptor occupancy, neurochemical priority or latent subconscious authority. When someone is sleep-deprived, exposed to stimulants/caffeine or taking several centrally active medicines, spontaneous associations and confidence can be especially difficult to interpret. No recommendation for unsupervised medication, cocaine, cannabis or supplement-based perturbation testing.

**Experimental agenda for causal graph:** (1) Pre- and postsynaptic localisation of PENK, D2, MOR and DOR by brain region, neuron identity and species; (2) GABAergic inhibition/disinhibition, state-dependent dopamine efflux and cholinergic interneuron effects as separate **signed, conditional** edges; (3) compare perturbation studies measuring motor output, action selection, nociception and reward, not “calm” alone. Use explicit negative controls and guard against reverse inference from behavioural changes to one neuropeptide.

**Review status:** contextual primary/review evidence, biologically plausible multimodal integration; *no evidence that leu-enkephalin is universally the second most important neurochemical, or that an individual unstructured ranking demonstrates a physiological defect*. Stage only; no live publication.
