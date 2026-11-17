---
title: "Four mechanistic domains for investigating neurotransmission in ADHD"
date: 2026-11-17
version: "0.1"
status: "concept proposal for author and scientific review"
publication: "not approved for website publication or journal submission"
privacy: "general science only"
---

# Four mechanistic domains for investigating neurotransmission in ADHD

## Purpose and present conclusion

This proposal develops an evidence-informed framework for investigating where neurotransmission may become functionally limiting in ADHD: release and availability; spatial and temporal exposure; receptor binding; and post-binding signal transduction. Its purpose is to generate experiments that distinguish mechanisms which can otherwise produce similar symptoms or medication responses.

The four stages are useful biochemical distinctions. They are not yet validated ADHD endotypes, do not correspond to the three clinical presentations, and are not established as an exhaustive account of ADHD. The central research question is whether measurements across these stages explain or predict functional variation better than simpler models.

Proposed originating author: Matthew Bayliss, MJB UK ADHD Crisis Project. Author approval and scientific collaborator review remain outstanding. This is a concept proposal, not a completed systematic review, clinical protocol or diagnostic instrument. AI assisted the drafting and targeted evidence search; the author and prospective collaborators must independently verify and take responsibility for a submitted manuscript.

## Draft abstract

ADHD is clinically and biologically heterogeneous. Symptom profiles and medication responses do not uniquely identify an underlying molecular limitation. We propose four interacting mechanistic domains for organising evidence and designing discriminating experiments: transmitter release and availability, spatial and temporal exposure, receptor binding, and post-binding signal transduction. The framework distinguishes an initiating cause from its functional bottleneck, compensatory adaptations and the mechanism through which treatment improves performance. Existing genetic, cellular and physiological research provides examples relevant to these domains but does not validate four discrete patient populations. We propose an initial programme of evidence mapping and computational parameter-recovery experiments, followed by targeted cellular perturbation studies and a prospective clinical feasibility study. The central test is whether stage-specific measures improve prediction and causal discrimination beyond models based on overall transmitter exposure, clinical covariates or general network function. Circuit organisation, development and metabolic support remain explicit alternative or interacting explanations. The framework is intended to be revised when domains are empirically inseparable, predictive value fails to replicate, or other mechanisms better explain the observations.

## 1 The problem and proposed contribution

A useful mechanistic explanation must connect a defined perturbation to a measurable cellular change and then to a relevant functional outcome. Symptom similarity alone does not establish a shared defect. Conversely, improvement with a drug does not prove that its pharmacological target was the original source of dysfunction.

The intended contribution is an operational framework for comparing candidate explanations. The novelty is not the existence of release, clearance, binding or intracellular signalling. Those processes are established neuroscience. Any publishable contribution must instead come from explicit domain boundaries, discriminating predictions, evidence mapping and demonstrated usefulness relative to existing frameworks.

Prior work already addresses multiple pathways. Sonuga-Barke and colleagues tested separable inhibitory, delay-related and temporal-processing components in children with ADHD [R1]. These are neuropsychological constructs, not the synaptic timing proposed here. Their existence prevents a novelty claim that ADHD heterogeneity or multiple pathways have never been considered.

Terminology matters. A phenotype is observable; an endotype is a subtype defined by a biological mechanism. We therefore use mechanistic domains and candidate profiles until reproducible endotypes are demonstrated. Epidemiology concerns distribution and determinants across populations. Aetiology concerns causes; pathophysiology concerns disrupted function. This proposal is principally mechanistic pathophysiology, with aetiological hypotheses.

## 2 The four domains

### Domain 1 Release and transmitter supply

The question is how much biologically active transmitter is delivered, where it is delivered, and how reproducibly delivery follows relevant activity. Candidate upstream contributors include synthesis, vesicular filling, vesicle availability, calcium coupling and exocytosis.

A release measure must be separated from extracellular concentration: concentration reflects release, uptake, diffusion and other clearance processes together. An impaired system need not simply contain too little transmitter. Excess background release, inappropriate bursts or unstable release could also disrupt useful signalling.

The boundary for this domain is the transmitter entering the extracellular compartment. Replenishment and recovery belong here when they determine successive release events. A weak electrical input to the terminal must be measured separately from failure of the terminal to release in response to the same input.

### Domain 2 Spatial and temporal exposure

The question is what concentration-time profile reaches receptors after release. Clearance and diffusion, the location of uptake transporters, release-receptor distance and synchronisation of release can change that profile.

A prolonged extracellular signal may compensate for another defect, but longer exposure is not automatically better. The timing of useful information and recruitment of other receptors matter. Exposure cannot be inferred directly from the duration of subjective medication benefit.

We do not assume a universal fixed binding window before cellular mobilisation. Nor do we equate behavioural timing tasks, neuronal refractory periods, extracellular transmitter decay and several-hour medication intervals. These are distinct timescales requiring different measurements.

### Domain 3 Receptor binding and availability

The question is whether a specified local transmitter exposure produces the expected receptor occupancy. Candidate factors include receptor number at the surface, localisation, binding affinity and association or dissociation kinetics.

Receptor expression, occupancy and functional response are separate endpoints. Lower surface receptor abundance can reduce total occupied receptors without an abnormal affinity per receptor. A binding assay must specify what it estimates.

Dopamine is a small molecule and does not misfold like a protein. Chemically altered products may have different activity, but malformed dopamine carrying corrupted semantic instructions is excluded. Any proposed abnormal ligand must be chemically identified and its receptor effects measured.

### Domain 4 Post-binding signal transduction

The question is whether comparable receptor engagement produces an appropriate intracellular and cellular response. Candidate stages include receptor coupling, second messengers, phosphorylation, ion-channel regulation, receptor trafficking and feedback.

Binding and activation are not identical. Changes in receptor conformation or coupling may sit at their interface. A downstream response measured per occupied receptor is needed to separate these stages operationally.

This domain does not automatically encompass every network abnormality. Synapse placement, long-range connectivity, developmental organisation and learned representations must remain separately describable. Otherwise an all-encompassing category would make the framework impossible to challenge.

## 3 Causes bottlenecks and compensation

We distinguish five questions:

1. Initiating cause: what genetic, developmental, acquired or environmental process changed the system?
2. Functional bottleneck: which operation limits a particular output in a defined condition?
3. Compensation: what adaptations partly preserve that output?
4. Treatment action: which operations does an intervention alter?
5. Clinical consequence: what changes in function, burden or adverse effects?

These need not identify the same component. A treatment can compensate upstream for a downstream weakness. A single genetic change can affect several stages; several small changes can jointly produce a large effect. The bottleneck can vary by circuit, task and physiological state.

A dominant limitation is a hypothesis to test, not a guaranteed feature of every person. Claims that mixed mechanisms are rare, necessarily multiplicative or always dominated by one defect are not established here. Statistical interactions require a defined scale: multiplicative effects on one measurement scale need not be multiplicative on another.

Bioenergetics, membrane gradients, glial support and vascular supply are not designated merely as modifiers. They may be upstream causes, interacting constraints or independent explanations. Predominantly cognitive effects cannot be excluded solely because a proposed energy defect might also be expected to affect movement or other organs.

## 4 A minimal quantitative specification

As an illustrative starting model, let C denote extracellular transmitter concentration, q(t) release, k clearance, B occupied receptors, R available receptors and S a downstream state:

dC/dt = q(t) - kC

dB/dt = kon C(R - B) - koff B

dS/dt = F(B, coupling, feedback, cellular state)

Functional output = G(S, circuit organisation, task and context).

These equations are a deliberately simplified proposal, not a fitted biological model. They omit diffusion, transporter saturation, receptor subtypes, compartmentalisation and many feedback loops. A spatial model and saturable uptake should be introduced only when the measurement resolution and residuals justify them.

Domain 1 primarily affects q; domain 2 affects the relationship between q and local C; domain 3 affects occupancy given C; domain 4 affects S given B. Actual biological parameters can influence more than one domain.

The main methodological danger is non-identifiability: different combinations of release, clearance, receptor abundance and coupling can yield the same output. More adjustable parameters can improve fit without improving knowledge. The first study should test whether the proposed experiments can recover known simulated parameters before interpreting patient measurements.

## 5 Evidence map and its limits

The following is a targeted starting map, not a systematic review or an estimate of how frequently a mechanism occurs in ADHD. Ratings describe relevance and inferential scope, not a universal evidence hierarchy.

### R1 Neuropsychological heterogeneity

A primary study assessed 71 ADHD probands aged 6–17, 71 siblings and 50 controls using tasks relating to inhibition, delay and temporal processing. Results supported dissociable components [R1]. This supports studying heterogeneity, but does not identify synaptic causes or validate the four domains. Verification: indexed abstract.

### R2 Common and rare genetic architecture

A 2023 GWAS included 38,691 ADHD cases and 186,843 controls and identified 27 associated loci; gene prioritisation implicated developmental biology and several neuronal populations [R2]. Association does not locate an individual's bottleneck, and prioritised genes are not all established causal genes. Verification: publisher abstract and indexed record.

### R3 More recent genetic evidence

A 2025 analysis combined childhood symptom and diagnosis data, identifying 39 independent loci in the combined analysis [R3]. It updates the evidence beyond the 2023 study, while combining partly overlapping evidence rather than offering wholly independent replication. Genetic liability is not evidence for four discrete mechanistic populations. Verification: publisher abstract and indexed record.

### R4 Human donor derived cortical neurons

McNeill and colleagues reported altered glutamatergic development, reduced vGLUT2 transcription and reduced calcium-signal strength and frequency in ADHD-derived cortical neurons [R4]. This offers a relevant human cellular platform, not a dopamine-release diagnosis. Calcium signals cannot alone separate release, receptor effects, maturation and excitability. Donor counts, line selection, medication histories and batch structure require full methods extraction before designing a replication. Verification: accessible publisher abstract and selected article text.

### R5 A transporter variant with an instructive dissociation

A rare DAT Ala559Val variant identified in a pedigree with two ADHD-diagnosed boys showed anomalous efflux in cellular experiments despite preserved uptake and surface expression [R5]. It illustrates why transporter function is more complex than fast versus slow reuptake. The pedigree does not establish population prevalence or a unique ADHD cause. Verification: indexed abstract.

### R6 More release but shorter duration

Lphn3 knockout rat experiments reported greater dopamine release with shorter transient duration and interevent times [R6]. This challenges a universal low-release model and provides a release/exposure dissociation. A knockout animal is not equivalent to common human ADHD. Verification: indexed abstract.

### R7 Binding kinetics and occupancy

A computational study incorporated D1 and D2 receptor kinetics and abundance, obtaining responses not captured by simple high-affinity versus low-affinity assumptions [R7]. This supports modelling kinetics explicitly but is not a measured ADHD endotype or direct proof of in-vivo occupancy trajectories. Verification: indexed abstract.

### R8 Measuring activation rather than assuming it from dopamine

Marcott and colleagues expressed GIRK channels as an experimental sensor of D2 activation in striatal neurons [R8]. This demonstrates a way to measure a functional receptor-linked response, with the caveat that engineered coupling changes the preparation and does not independently measure natural receptor occupancy. Verification: indexed abstract.

### R9 Receptor activation can alter another signalling system

Experimental activation of the ADHD-associated D4.7 receptor variant produced excessive suppression of NMDA receptor function in prefrontal preparations [R9]. It supports investigating consequences beyond ligand availability. It does not establish the mechanism in an individual, nor by itself prove normal dopamine binding. Verification: indexed abstract and retrieved publisher/full-text excerpts.

### R10 Intracellular regulation of network function

Wang and colleagues linked alpha2A-adrenoceptor stimulation to cAMP–HCN regulation, prefrontal connectivity and working-memory function [R10]. It supplies a mechanistic example of downstream regulation. It does not establish that ADHD patients generally have a primary cAMP or HCN defect. Verification: indexed abstract.

### R11 Selective release perturbations in human neurons

A 2025 SNAP25 I67N study in engineered human neurons reported reduced release probability and evoked/spontaneous release with preserved measured passive and active electrical properties [R11]. It offers a methodological precedent for separating release from excitability. This is a SNAREopathy study, not evidence that common ADHD is caused by that variant. Verification: publisher abstract.

## 6 Claims and results that would change the model

P1: At least some apparent release and exposure abnormalities can be distinguished using concurrent input, transmitter and clearance measurements. Failure to recover the distinction in controlled simulations or perturbation experiments would require merging or redefining domains.

P2: Receptor occupancy and downstream cellular response can dissociate. If a claimed transduction subgroup disappears after occupancy, surface abundance and cell-state controls, the subgroup assignment fails.

P3: Domain profiles can explain functional variation beyond total exposure and ordinary covariates. If held-out prediction does not improve over simpler models, clinical usefulness is unsupported even if the framework remains a useful teaching map.

P4: Compensation across stages can explain some treatment responses. Selective upstream compensation should improve an output without necessarily normalising the underlying downstream abnormality. An intervention affecting many stages cannot establish this by clinical improvement alone.

P5: Reproducible continuous profiles may exist without discrete types. A stable gradient would support dimensional profiling and reject a four-box patient classification.

P6: Regional vulnerability may amplify a general constraint. This requires local measures or appropriate models; symptom localisation and receptor-expression atlases alone cannot diagnose a regional receptor defect.

Low-dose stimulant preference in people with ADHD and autism is an exploratory question, not a premise. Test any interaction after accounting for drug exposure, sleep, anxiety, sensory burden, other medicines and adverse effects. Do not assume autism belongs to one domain, or that a dose preference uniquely identifies a mechanism.

## 7 Proposed studies

### Study A Evidence mapping and model identification

Question: what observations and perturbations are minimally sufficient to distinguish the four domains?

Build a reproducible evidence register, separating human association, human functional experiments, animal perturbation, cellular assays and computation. Register the search and extraction protocol before calling the review systematic. Code direction, compartment, cell type, measurement and whether a finding is direct or inferred.

Simulate known release, clearance, occupancy and coupling changes, including mixtures. Compare models using only functional output, then adding transmitter measurements, then receptor or downstream measures. Include wrong-model simulations, realistic noise, incomplete sampling and saturable uptake.

Primary endpoint: parameter-recovery accuracy and uncertainty across prespecified scenarios. Secondary endpoints: discrimination between perturbations and held-out prediction. Compare against a one-factor exposure model and models with fewer domains. Publish negative identifiability findings.

This is the lowest-resource first project and could be developed with a computational neuroscience collaborator. Calendar and cost estimates require a host's review; no funding or staff availability is assumed.

### Study B Controlled cellular discrimination

Question: can selective perturbations produce distinguishable response signatures?

Begin with an established preparation and matched controls. A prospective laboratory team should select validated perturbations affecting release machinery, uptake, surface receptor abundance/affinity or downstream coupling. Do not assume any reagent acts exclusively on its intended stage.

Candidate measurements include terminal electrical input, extracellular transmitter dynamics, receptor abundance/binding assays, second-messenger reporters and electrophysiological output. Use more than one assay when an endpoint is ambiguous. Exogenous agonist responses can bypass release, but they do not by themselves separate binding from coupling.

Primary endpoint: blinded recovery of the manipulated stage, or prespecified continuous parameter estimates. Secondary endpoint: whether compensatory manipulation restores output while leaving the initiating defect measurable. Biological replicates, independent preparations, randomised batches and blinded analysis are essential. Cells or repeated wells do not replace independent donors.

Only after this demonstrator should the team consider ADHD donor-derived neurons. Use isogenic controls where appropriate, assess maturation, and specify cell-type relevance. A corrected rare variant may establish a cellular effect without explaining ordinary polygenic ADHD.

### Study C Prospective clinical feasibility

Question: can reliable functional trajectories be collected around already prescribed treatment, and do they predict patient-relevant benefit?

A draft feasibility range is 30–50 adults over repeated assessments, subject to recruitment and statistical review. This is not a powered validation sample. No medication withdrawal or dosing change is proposed by this concept document.

Select one primary endpoint before recruitment, such as within-person variability in a validated sustained-attention task. Treat naming latency, cued versus free recall, recognition, initiation, working memory and adverse effects as candidate secondary outcomes. Use alternate forms and account for practice, time of day, sleep, pain, caffeine, other substances, food and co-occurring conditions. Record formulation and exact prescribed dose times.

Use mixed-effects models and within-person comparisons. Clinical medication selection is confounded by indication; it cannot be interpreted as random allocation. Pupil, EEG, imaging and performance measures are indirect markers, not direct tests of synaptic release or receptor binding. Peripheral dopamine is not a proposed surrogate for brain synaptic dopamine.

The go/no-go decision concerns feasibility, reliability, burden and effect-size uncertainty, not assignment of participants to molecular categories.

### Study D Later mechanistic intervention trial

A later sponsored randomised study could test a specific prediction emerging from A–C. Drug selection, comparators, washout, interaction management and biological sampling must be designed by the investigator and clinical pharmacology team.

A decisive study would show a prespecified biomarker-by-treatment interaction that replicates in a separate sample. Overall drug benefit would not suffice. Stratification must outperform a comparator strategy based on ordinary clinical information and treatment history.

Any UK medicinal-product trial requires sponsor assessment of regulatory classification and applicable approvals. HRA guidance records revised UK clinical-trial regulations taking effect on 28 April 2026 [G1]. The classification must be checked under current guidance rather than assumed from use of an already licensed medicine.

## 8 Limitations and alternative explanations

The map begins at neurotransmission and may omit developmental wiring, circuit topology, axonal conduction, glial function, learning and systems-level regulation that cannot usefully be reduced to four local parameters. A result explained better by these alternatives must be retained, not re-labelled as transduction to protect the theory.

A shared downstream change is not independent evidence for every proposed upstream cause. Several papers using the same cohort, model or pathway are not independent confirmations. A measured group difference may be compensatory, state-dependent or unrelated to the symptom of interest.

Medication effects can be regionally different and pharmacologically broad. No treatment ranking or individual dose recommendation follows from this framework. Personal observations can originate questions but are not mechanistic validation. This public concept deliberately excludes individual clinical histories.

## 9 Collaboration and manuscript development

The immediate ask is scientific criticism and methods collaboration: are the domain boundaries useful, what prior work already covers them, and which first experiment could distinguish two competing mechanisms?

A useful team would include adult ADHD clinical expertise, synaptic physiology or cellular pharmacology, computational identification/statistics, and lived-experience research partnership. Contributions should be recorded using CRediT-style roles; authorship should follow substantive work, responsibility and the chosen journal's rules. Originating the concept should be documented without promising honorary authorship.

The first manuscript should be framed as a hypothesis/methods framework. An evidence map and model-recovery demonstration would strengthen it substantially. A fully human mechanistic endotyping paper is a later objective. An academic institution can provide collaboration, governance and infrastructure; it does not itself grant journal acceptance.

Website integration after review should extend existing heterogeneity, dopamine-system, medicine-mechanism and open-question material. A short accessible article can introduce the framework, with this longer proposal as a download. No live-site change is part of this staging action.

## 10 References and governance source

[R1] Sonuga-Barke E, Bitsakou P, Thompson M. Beyond the dual pathway model: evidence for the dissociation of timing, inhibitory, and delay-related impairments in ADHD. 2010. https://pubmed.ncbi.nlm.nih.gov/20410727/ DOI 10.1016/j.jaac.2009.12.018

[R2] Demontis D and colleagues. Genome-wide analyses of ADHD identify 27 risk loci, refine the genetic architecture and implicate several cognitive domains. Nature Genetics 2023. https://doi.org/10.1038/s41588-022-01285-8

[R3] Genome-wide association meta-analysis of childhood ADHD symptoms and diagnosis identifies new loci and potential effector genes. Nature Genetics 2025. https://doi.org/10.1038/s41588-025-02295-y

[R4] McNeill RV and colleagues. hiPSC-derived cortical neurons from ADHD individuals reveal dysregulated glutamatergic development. Published online 19 September 2025; Molecular Psychiatry volume 31, 1041–1050, 2026. https://doi.org/10.1038/s41380-025-03213-8

[R5] Anomalous dopamine release associated with a human dopamine transporter coding variant. 2008. https://pubmed.ncbi.nlm.nih.gov/18614672/

[R6] Enhanced Transient Striatal Dopamine Release and Reuptake in Lphn3 Knockout Rats. 2020. https://pubmed.ncbi.nlm.nih.gov/32203648/

[R7] Abundance Compensates Kinetics: Similar Effect of Dopamine Signals on D1 and D2 Receptor Populations. 2020. https://pubmed.ncbi.nlm.nih.gov/32071139/

[R8] Marcott PF, Mamaligas AA, Ford CP. Phasic dopamine release drives rapid activation of striatal D2-receptors. Neuron 2014. https://pubmed.ncbi.nlm.nih.gov/25242218/ DOI 10.1016/j.neuron.2014.08.058

[R9] The ADHD-linked human dopamine D4 receptor variant D4.7 induces over-suppression of NMDA receptor function in prefrontal cortex. 2016. https://pubmed.ncbi.nlm.nih.gov/27475724/

[R10] Wang M and colleagues. Alpha2A-adrenoceptors strengthen working memory networks by inhibiting cAMP-HCN channel signaling in prefrontal cortex. Cell 2007. https://pubmed.ncbi.nlm.nih.gov/17448997/ DOI 10.1016/j.cell.2007.03.015

[R11] SNAP25 variant I67N: synaptic phenotypes, drug response and proteome changes in human neurons. Brain 2025;148:3300 onward. https://academic.oup.com/brain/article/148/9/3300/8105786

[G1] Health Research Authority. Clinical trials of investigational medicinal products. Updated 28 April 2026. https://www.hra.nhs.uk/planning-and-improving-research/policies-standards-legislation/clinical-trials-investigational-medicinal-products-ctimps/

## 11 Research control register

Verified in this pass: source identity and central findings for the eleven seed references; selected full publisher text where accessible; current HRA trial-reform guidance. Search date: 17 November 2026.

Still required before submission: systematic search including contradictory and null results; complete methods and supplementary extraction; source-specific sample sizes and independence audit; verification of equations against the intended preparation; external novelty review; statistical protocol; author approval; journal selection and disclosure compliance.

Priority unanswered questions:
1. Can practical measurements distinguish release, exposure, binding and transduction, or do some remain empirically inseparable?
2. Do continuous domain profiles improve out-of-sample functional or treatment-response prediction beyond simpler clinical and exposure models?
3. Which observed abnormalities are initiating causes, compensations or context-dependent consequences?

No evidence currently establishes the four domains as four exclusive causes of all ADHD. That stronger claim is explicitly not made.
