---
title: "Mechanistic process dictionary — memory and pain as dynamic systems"
date: 2026-10-20
status: "method-spec-stage; editorial and scientific review required"
publication: "NOT AUTHORISED"
privacy: "general mechanistic research only; no private clinical observations"
integration:
  - "Use as a reusable content/causal-graph method, not a duplicate diagnosis article"
  - "Cross-reference existing /support/when-understanding-is-not-enough/ and pain/motor-signal explanation"
  - "Optionally extend existing neurophysiology/guidebook content following review"
---

# A computational process dictionary instead of descriptive labels

## Research question

Can MJB's neural and cognitive explanations be made **reusable across topics** through a common vocabulary of components, operations, transport/communication interfaces, state, resource/energy constraints, timing, maintenance, failure modes and measured outcomes? This document specifies an educational/causal-model scaffold, not an attempt to diagnose somebody from a thought style.

**Core distinction:** naming a function (e.g. *memory*, *referred pain*, *chaperone*, *attention*) is not a complete causal explanation. The explanatory object is a process with explicit input, transformations, conditional interactions, output and observables.

## Proposed computational dictionary schema

Represent each biological process as an object with:

| Field | Meaning | Example in a memory process |
| --- | --- | --- |
| Identity and scope | Process, level, cell type, brain region, compartment; which definition is used | Cue-driven episodic retrieval in a specified network |
| Components | Nodes with location and type; not generic anatomy name-dropping | Hippocampal indexing and distributed cortical representations |
| Inputs and trigger | External/internal cue, threshold, neuromodulatory/attentional state | Partial environmental reminder |
| Transformation/function | Algorithmic operation; what changes | Pattern completion and representational reinstatement |
| Communication/interface | Direction, sign, projection, synchrony, transmission latency | Hippocampal-cortical communication |
| Gate/selection | Threshold, inhibition/disinhibition, competition, salience; signed conditional edges | Competing traces and retrieval cues |
| Resources | ATP expenditure, ion gradients, oxygen, substrate pools, reserve; distinguish known from hypothesised | Metabolic cost of synaptic activity/plasticity |
| Time | Encoding, maintenance, consolidation, retrieval, reconsolidation and forgetting on distinct timescales | Fast recall vs consolidation over days |
| Maintenance | Homeostasis, repair, synaptic turnover, sleep-associated reactivation; compensatory reserve | Activity replay and synapse maintenance |
| Observables | Specific measured endpoint and units; proxy limitations | Recall accuracy, latency, decoding/reinstatement |
| Failure modes | Where bottleneck occurs; differential processes giving similar phenotype | Weak encoding vs intact memory with failed retrieval cue |
| Evidence | Primary perturbation vs correlative signature vs theory vs analogy | Graded links with contradiction records |

**Record edges as directionally signed and conditional:** e.g., input A increases B **only under circuit state S**, including temporal and species limits. Record confounders and independent perturbation. “Signal penetration” is ambiguous; prefer **retrieval accessibility/reachability**, **propagation depth**, **activation threshold**, **signal-to-noise ratio** or **representational fidelity**, matched to the actual intended measurement.

## Worked entry A: memory is neither a static file nor one cortical region

**Established/strongly supported:** episodic memory can engage hippocampal and distributed neocortical networks; animal engram studies identify sparse ensembles and cue-related reactivation, and their representations can evolve during consolidation and recall. Human memory is reconstructive; neither a literal operating-system file browser nor an unchanging document. Consolidation theories differ on how long different kinds of memories depend on hippocampus. [2024/2025 Zaki & Cai review, PMID 39300271](https://pubmed.ncbi.nlm.nih.gov/39300271/); [2023 memory engram review](https://www.nature.com/articles/s41380-023-02137-5); [2022 critical appraisal of consolidation theory](https://pmc.ncbi.nlm.nih.gov/articles/PMC9720899/).

**Useful decomposition:**
1. Encode: attention and salience gate sensory/cognitive input; cell ensembles and synapses change.
2. Stabilise/update: plasticity, sleep-associated reactivation and systems interactions influence persistence.
3. Index/cue: a cue may trigger partial reactivation and pattern completion; cues compete.
4. Retrieve/construct: reactivation assembles accessible content; recall may update it, not merely copy it.
5. Maintain capacity: healthy signalling, metabolic supply, plasticity/structural maintenance, sleep and interference management affect later access.

**Boundary:** specific energy costs of individual retrieval operations and exact effects of ATP-limited brain metabolism on real-world word-finding are not established by computational papers alone. [Pache & van Rossum, 2023 energy-efficient learning perspective DOI 10.1016/j.conb.2023.102779](https://www.sciencedirect.com/science/article/pii/S0959438823001046); [PLOS Comput Biol 2024 primary simulation DOI 10.1371/journal.pcbi.1012553](https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1012553).

**Competing failures with similar observed endpoint (“can't recall X”):** weak original encoding; inadequate retrieval cue; interference from competing representations; reduced attentional selection; language/lexical access; altered state/sleep/fatigue; neurological lesions. Do not infer that information was “lost from storage” solely because it was temporarily unavailable.

## Worked entry B: pain locality, referral and sensitisation

Pain location does not uniquely identify site of pathology. Separate:
- **Radicular pain:** arises from pathological excitation/injury involving a spinal nerve root or dorsal root ganglion, may track a dermatome with accompanying neurological signs.
- **Referred somatic/visceral pain:** perceived at a site other than primary source; convergence-projection, altered receptive fields and central facilitation are proposed/partly evidenced mechanisms. Referral often does *not* respect one dermatome.
- **Peripheral neuropathic pain:** lesion/disease of somatosensory peripheral system with characteristic sensory abnormalities, distributions varying by nerve and mechanism.
- **Local mechanical/myofascial and inflammatory nociception:** muscles, periosteum, tendons, sinus/orbital tissue can drive local and regionally spreading discomfort, with secondary guarding/sensitisation.
- **Sensory amplification or gating shift:** may alter the perceived intensity and territory without requiring tissue damage in every experienced location.

This classification matters because *outer arm pain* is not generically attributable to “C4”; segmental distributions, peripheral nerve territories and referred pain patterns must be distinguished, and symptoms alone rarely localise reliably. [2023 referred pain review](https://pmc.ncbi.nlm.nih.gov/articles/PMC10338069/); [2021 comprehensive neuropathic pain review DOI 10.1152/physrev.00045.2019](https://journals.physiology.org/doi/full/10.1152/physrev.00045.2019). Note that the neurophysiological pathways of referred pain are not fully settled.

**A cyclic hypothesis suitable for testing, not a proved sequence:** local nociception → altered afferent traffic and central gating → muscle guarding → changed loading → more local nociception. Other initiation orders are possible, including primary muscular stress or central sensitisation. Differentiate temporal order and independent observations; do not label a patient with a single causal diagnosis from a process map.

## Distinguish style of reasoning from cognitive assessment

The tendency to represent unfamiliar problems as stateful, failure-capable process models is often called **systems reasoning, mechanistic abstraction, or model-based/causal reasoning**. Similar techniques are routine within engineering, modelling, neuroscience and some clinical disciplines. From conversation alone it is not possible to assign a population percentile, measure intelligence, infer a diagnostic neurotype or conclude models are unusually accurate. Strength: transfer of functional structure across fields and generation of specific discriminating hypotheses. Risk: overgeneralisation across systems with superficially similar outputs; under-specification of biological substrate; skipping alternative causal graphs; assigning greater certainty to intuitively coherent explanations than data justify. [Kinds of scientific reasoning, Kind & Osborne 2016 DOI 10.1002/sce.21251](https://doi.org/10.1002/sce.21251).

## Three discriminating questions for the causal graph

1. **Retrieval versus representation:** can recognition with cues rescue a failed free-recall task? Pair observable behavioural endpoints with age/context controls; this is not a complete physiological assay.
2. **Peripheral versus central pain:** which independently recorded sensory/motor signs, local stimulus-response maps, temporal features and clinical examination support the competing mechanisms?
3. **Resource versus gating failure:** does changing attention/cue conditions rescue output without changing overall energy supply; and can physiological energy measures be linked independently without reverse-inference from a subjective experience?

**Editorial path:** incorporate the dictionary model as a shared mechanism glossary; link specific memory and pain entries within existing navigation; keep a single canonical schema and independent source/audit trail. No live publishing or personal health records.
