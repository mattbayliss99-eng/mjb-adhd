"""Reviewed educational specifications for the 37 recreated atlas figures.

No BioRender artwork is copied. Nodes/relationships are deliberately scoped;
sources describe the stated physiology or evidence, not a patient diagnosis.
"""
import json
from pathlib import Path
C=[]
def D(id,mode,kicker,nodes,edges,note,explanation,sources):
 C.append(dict(id=id,mode=mode,kicker=kicker,nodes=[dict(title=n[0],body=n[1],kind=n[2] if len(n)>2 else 'process') for n in nodes],edges=[dict(start=a,end=b,label=l) for a,b,l in edges],takeaway=note,explanation=explanation,source_ids=sources))

D('F01','compare','A genetic association and a molecular mechanism answer different questions.',[
 ('DNA variation','Common and rare variants are studied using different designs.','evidence'),
 ('Gene regulation','Some variants may affect when, where or how much a gene is expressed.'),
 ('Protein function','Other variants can alter a protein sequence or its function.'),
 ('Cell and development','Consequences depend on cell type, timing and biological context.'),
 ('Population evidence','GWAS or rare-variant studies test statistical association.','evidence'),
 ('Individual interpretation','Association alone does not identify a causal change in one person.','limit')],[],
 'A pathway gene is not automatically an ADHD risk gene.',
 'DNA differences may influence regulation or protein sequence, but an associated locus, a candidate effector gene and a demonstrated mechanism are different levels of evidence. Developmental context can change the consequences. Common-variant and rare-variant ADHD studies support investigation of neuronal biology; they do not establish a shared defect in every patient or justify treating every pathway gene as an ADHD risk gene. The 2025 childhood GWAS has a publisher correction that should accompany use of that study.','S02 S03 S04 S37')

D('F02','flow','Supply, transport and synthesis are separate control points.',[
 ('Dietary protein','Digestion contributes amino acids to the circulating pool.','supply'),
 ('Circulating amino acids','Tyrosine and tryptophan share transport with other large neutral amino acids.','supply'),
 ('Brain entry','LAT1 / SLC7A5 works with SLC3A2 at the blood-brain barrier.'),
 ('Inside cells','Available precursor can enter enzyme-controlled pathways.'),
 ('Transmitter synthesis','Cofactors, enzyme activity and cell type also matter.'),
 ('Synaptic availability','Storage, release and clearance remain distinct steps.','limit')],[(0,1,'absorption'),(1,2,'transport'),(2,3,'availability'),(3,4,'enzyme action'),(4,5,'additional steps')],
 'A blood level or dietary increase does not directly measure a synapse.',
 'Amino acids are supplied by diet and protein turnover. Brain entry is regulated by transporters, including LAT1, which transports several large neutral amino acids as part of an exchange system. Circulating abundance, transport competition, intracellular supply, enzyme activity and transmitter handling must be distinguished. More dietary precursor does not guarantee more transmitter released at a relevant synapse. The LAT1 experimental source includes mouse studies and human rare-variant observations, not a dietary ADHD treatment trial.','S05 S06 S07 S08')

D('F03','branches','The catecholamine branch depends on which enzymes a cell expresses.',[
 ('Tyrosine','Starting amino acid in the cytosol.','supply'),
 ('L-DOPA','TH uses BH4, iron and oxygen.'),
 ('Dopamine','AADC / DDC uses the B6-derived cofactor PLP.'),
 ('Dopamine vesicle','Dopaminergic cells can store and release dopamine.'),
 ('Noradrenaline','In DBH-expressing cells, conversion occurs in secretory vesicles.'),
 ('Adrenaline','In PNMT-expressing cells, cytosolic methylation uses SAM.')],[(0,1,'TH'),(1,2,'AADC'),(2,3,'VMAT2 storage'),(2,4,'VMAT2 then DBH'),(4,5,'export then PNMT')],
 'Not every dopamine-producing neuron makes noradrenaline or adrenaline.',
 'Tyrosine hydroxylase forms L-DOPA in the cytosol; aromatic L-amino acid decarboxylase forms dopamine. VMAT2 can transport dopamine into secretory vesicles. In cells expressing dopamine beta-hydroxylase, dopamine is converted to noradrenaline inside those vesicles, using copper and ascorbate. In cells expressing PNMT, noradrenaline returns to the cytosol for SAM-dependent conversion to adrenaline, which can be repackaged. These are cell-specific branches, not a compulsory chain in every dopamine neuron. Dopamine is the same molecule in peripheral and brain compartments.','S09 S10 S11 S12 S13 S15')

D('F05','cycle','Electrical activity, calcium entry and vesicle fusion are distinct steps.',[
 ('Ready vesicle','Transmitter is loaded; docking and priming prepare release.'),
 ('Calcium signal','An action potential opens voltage-gated calcium channels.'),
 ('Exocytosis','Calcium sensors and SNARE machinery support membrane fusion.'),
 ('Membrane retrieval','Endocytosis retrieves vesicle membrane and components.'),
 ('Vesicle preparation','Re-acidification and refilling help prepare a new release cycle.'),
 ('Several control points','Firing, vesicle content and release probability can vary independently.','limit')],[(0,2,'ready for fusion'),(1,2,'Ca2+ trigger'),(2,3,'retrieval'),(3,4,'reuse'),(4,0,'refill')],
 'Vesicle membrane recycling is different from amino-acid recycling.',
 'At chemical synapses, action potentials and presynaptic calcium entry can trigger fusion of prepared vesicles. Calcium-sensing proteins and the SNARE machinery participate in release. Membrane retrieval and vesicle preparation permit reuse, but release and recycling comprise multiple processes rather than one invariant conveyor belt. Firing rate, vesicle loading, the size of the ready pool and release probability are separate controls. The diagram illustrates established synaptic physiology and does not locate an ADHD-specific release defect.','S16 S28 S32')

D('F06','branches','Transport out of the cleft and intracellular breakdown are different routes.',[
 ('Extracellular dopamine','Released transmitter can diffuse or be taken up.'),
 ('DAT uptake','DAT brings dopamine into cells that express this transporter.'),
 ('Cytosolic dopamine','It may be repackaged or metabolised inside a cell.'),
 ('Vesicular storage','VMAT2 uses the vesicular proton gradient to reload monoamines.'),
 ('MAO pathway','MAO on the outer mitochondrial membrane forms aldehyde intermediates.'),
 ('COMT pathway','COMT methylates dopamine using SAM; tissue context matters.')],[(0,1,'reuptake'),(1,2,'transport'),(2,3,'VMAT2'),(2,4,'metabolism'),(2,5,'metabolism')],
 'MAO is not an enzyme floating freely in the synaptic cleft.',
 'Clearance from the extracellular space includes diffusion and transporter-mediated uptake. DAT is important in many dopamine regions; NET can also clear dopamine where DAT expression is low, including evidence from mouse prefrontal cortex. Intracellular dopamine can be re-stored or metabolised. MAO is associated with the outer mitochondrial membrane; its aldehyde products require further processing. COMT-dependent methylation is another route whose importance differs by cell and region. This concerns transmitter handling, not systemic metabolism of an ADHD medicine.','S17 S18 S19 S38 S39 S15')

D('F07','compare','Receptor coupling is a starting point, not a complete prediction.',[
 ('D1-like dopamine','D1 and D5 commonly couple to Gs / Golf and promote cAMP signalling.'),
 ('D2-like dopamine','D2, D3 and D4 commonly couple to Gi / Go and reduce cAMP signalling.'),
 ('Noradrenaline receptors','Alpha2 commonly uses Gi / Go; alpha1 and beta families differ.'),
 ('Cell context','Receptor location, other signals and ion channels shape the response.'),
 ('Network effect','A cell response does not directly determine whole-person performance.'),
 ('Other signalling','Receptor responses extend beyond these canonical G-protein pathways.','limit')],[],
 'A receptor family cannot be labelled universally good or bad for attention.',
 'The dopamine receptor nomenclature divides receptors into D1-like and D2-like families with different canonical G-protein coupling. Noradrenaline receptor families also differ. Coupling affects intracellular signals such as cAMP but does not uniquely determine firing, circuit activity or behaviour. Location, concentration, timing, cell type and other signalling pathways change the outcome. The diagram provides a simplified receptor reference, not an individual drug-response prediction.','N-IUPHAR S20 S21')

D('F08','flow','Neurons use energy to maintain gradients and support signalling.',[
 ('Fuel and oxygen','Metabolic substrates and oxygen support aerobic energy production.','supply'),
 ('Mitochondrial pathways','Metabolism supplies electron carriers to the respiratory chain.'),
 ('Proton gradient','Electron transfer supports proton pumping across the inner membrane.'),
 ('ATP formation','ATP synthase uses proton return to support ATP production.'),
 ('Cellular work','Ion pumps, biosynthesis and vesicle handling consume energy.'),
 ('Demand changes','Active signalling changes energy demand; other ATP routes also exist.','limit')],[(0,1,'metabolism'),(1,2,'electron transfer'),(2,3,'coupling'),(3,4,'ATP use'),(4,5,'variable demand')],
 'This is normal physiology, not proof of an energy defect in ADHD.',
 'Aerobic metabolism supplies reducing equivalents to the respiratory chain. Proton pumping and ATP synthase couple electron transfer to ATP generation. Cells use ATP for ion homeostasis, biosynthesis and many aspects of signalling. Glycolysis also produces ATP, and fuel contributions differ with cell and context. Mitochondria do not directly manufacture dopamine. An explanation of energy supply and demand does not establish mitochondrial dysfunction or an energy deficit in an individual with ADHD.','S22 S23 S24')

D('F09','projection','Selected projection examples: schematic routes, not anatomical positions.',[
 ('VTA dopamine cells','Ventral tegmental area populations.','origin'),
 ('Cortical / limbic targets','Selected dopamine projections; functions overlap.'),
 ('SNc dopamine cells','Substantia nigra pars compacta populations.','origin'),
 ('Striatal targets','Dopamine participates in interacting basal-ganglia circuits.'),
 ('Locus coeruleus','Major noradrenergic source; populations are heterogeneous.','origin'),
 ('Cortical targets','Noradrenaline projections include prefrontal and other cortical regions.')],[(0,1,'dopamine axons'),(2,3,'dopamine axons'),(4,5,'NA axons')],
 'Projection systems are not one-to-one maps from a transmitter to a symptom.',
 'Different dopamine cell populations project to cortex, limbic regions and striatum. Locus-coeruleus populations provide noradrenergic projections to cortical and other targets and are not a completely uniform system. This deliberately non-anatomical route map names selected examples, not every origin, target or collateral. Tracing studies cited include rodent and primate work; the simplified route names do not imply the complete architecture is identical across species or that one pathway uniquely causes an ADHD symptom.','N-VTA N-STRIATUM N-LC')

D('F10','network','Connectivity measures describe relationships in recorded brain activity.',[
 ('Default-mode network','One commonly studied large-scale network.','network'),
 ('Control networks','Frontoparietal and related control systems.','network'),
 ('Attention networks','Dorsal / ventral attention systems.','network'),
 ('Sensory and motor','Lower-order networks participate too.','network'),
 ('Task and resting state','Results depend on measurement, processing and context.','evidence'),
 ('Group-level ADHD findings','Associations do not identify the cause in one person.','limit')],[(0,1,'statistical relation'),(0,2,'statistical relation'),(1,3,'statistical relation'),(2,3,'statistical relation')],
 'Dashed lines show statistical dependence, not axons or proven causal influence.',
 'Functional connectivity quantifies statistical relationships between measured signals. It is distinct from an anatomical tract and from a demonstrated causal effect. ADHD studies examine group-level relationships among default-mode, attention, control and other networks; results vary with age, sample, task, motion and analysis. The network layout is conceptual, not a coordinate map or a faithful reproduction of a particular study result. Neither connectivity nor one network measure supplies a stand-alone diagnosis.','S25 S26')

D('F11','compare','A cognitive profile includes several functions and several kinds of measurement.',[
 ('Attention and control','Sustaining focus, inhibiting responses and switching tasks.'),
 ('Working memory','Holding and using information over a short interval.'),
 ('Timing and motivation','Tracking time, starting, sustaining effort and responding to incentives.'),
 ('Observed performance','Task accuracy, response variability and real-world function.','evidence'),
 ('Lived experience','Effort, overwhelm and fatigue may be missed by a brief task.','evidence'),
 ('Changing context','Sleep, stress, pain and task demands can change performance.','limit')],[],
 'No single transmitter amount predicts the entire cognitive profile.',
 'The diagram separates overlapping cognitive functions from the measures used to study them. Laboratory performance and lived experience supply different information. Task and state can change the expression of difficulties; a biological association does not allow one to infer an individual function directly from a neurotransmitter level. This is an organising explanation, not a scale, mechanism claim or assertion that every named difficulty must be present in every person with ADHD.','S02 S20 S25 N-SLEEP')

D('F12','compare','Making BH4, recycling it after hydroxylases and redox salvage are distinct.',[
 ('De novo synthesis','GTP is processed by GCH1, PTPS and SPR.','supply'),
 ('Hydroxylase use','BH4 supports PAH, TH and tryptophan hydroxylases.'),
 ('Hydroxylase recycling','PCD / PCBD1 and QDPR regenerate BH4 after use.'),
 ('NOS redox context','BH4 supports coupled nitric-oxide synthase function.'),
 ('BH2 salvage','DHFR can reduce BH2 back to BH4.'),
 ('Clinical interpretation','A named pathway alone does not diagnose BH4 deficiency.','limit')],[],
 'The hydroxylase cofactor cycle is not identical to NOS redox salvage.',
 'BH4 is made through GCH1, PTPS and SPR-dependent reactions and serves several enzymes. Aromatic-amino-acid hydroxylation generates a hydroxylated pterin intermediate; PCD and QDPR participate in regeneration. NOS has a different redox cycle, and oxidised BH2 can be reduced through DHFR-dependent salvage. These routes should not be collapsed into one chemical loop. Inherited biochemical disorders require their own clinical and laboratory assessment; ordinary ADHD does not by itself demonstrate such a disorder.','S27 N-QDPR N-BH4-SALVAGE')

D('F13','compare','A required cofactor is not evidence that extra intake will help.',[
 ('Iron and BH4','Required by TH and tryptophan hydroxylase reactions.','cofactor'),
 ('PLP from vitamin B6','Supports aromatic amino-acid decarboxylase.','cofactor'),
 ('Copper and ascorbate','Support dopamine beta-hydroxylase.','cofactor'),
 ('SAM methyl donor','Used by PNMT and COMT; it is not a vitamin.','cofactor'),
 ('Enzyme and supply','Cofactor availability is one part of a regulated system.'),
 ('Supplement claims','Need deficiency/benefit evidence and clinical context.','limit')],[],
 'Cofactor requirement does not establish deficiency or a supplement benefit.',
 'Enzymes require specific cofactors or co-substrates: TH and tryptophan hydroxylase use iron and BH4; AADC uses pyridoxal phosphate; DBH uses copper and ascorbate; PNMT and COMT use SAM as a methyl donor. These examples explain chemistry. They do not show that a person is deficient, that extra intake increases transmitter function, or that a supplement treats ADHD. No doses or personalised supplement recommendations are implied.','S10 S11 S12 S13 S19 S31')

D('F14','flow','Glutamate transmission combines vesicle loading, receptors and uptake.',[
 ('Cytosolic glutamate','Metabolism and glutamine supply contribute substrate.','supply'),
 ('Vesicle loading','VGLUT transporters load glutamate using a vesicular gradient.'),
 ('Calcium-triggered release','Prepared vesicles fuse with the presynaptic membrane.'),
 ('Receptors','AMPA / NMDA ion channels and metabotropic receptors differ.'),
 ('EAAT uptake','Transporters on glia and neurons clear extracellular glutamate.'),
 ('Astrocytic recycling','GLUL converts glutamate to glutamine using ATP.')],[(0,1,'VGLUT'),(1,2,'exocytosis'),(2,3,'binding'),(2,4,'clearance'),(4,5,'GLUL')],
 'An excitatory transmitter pathway is not a measure of ADHD severity.',
 'Presynaptic vesicular glutamate transporters load glutamate for release. Postsynaptic ionotropic and metabotropic receptors have different effects and kinetics. Extracellular glutamate is cleared by excitatory amino-acid transporters, including important astrocytic routes. Glutamine synthetase uses ATP to form glutamine, which can return to neurons. This is established neurotransmission; it does not diagnose excessive excitation, a glutamate defect or a particular cause of ADHD.','S28 S29 N-GLUT-RECEPTORS')

D('F15','branches','GABA responses depend on receptor type and the ion gradient.',[
 ('Glutamate precursor','Glutamate decarboxylase uses PLP to form GABA.','supply'),
 ('GABA vesicles','VGAT supports vesicle loading and release.'),
 ('GABAA receptors','Ligand-gated anion channels; response depends on electrochemical gradients.'),
 ('GABAB receptors','G-protein-coupled signalling changes channels and other responses.'),
 ('Chloride regulation','KCC2 and other transporters influence intracellular chloride.'),
 ('Development and context','Anion-channel opening is not universally hyperpolarising.','limit')],[(0,1,'synthesis and loading'),(1,2,'released GABA'),(1,3,'released GABA'),(4,2,'shapes response')],
 'GABA is usually inhibitory in mature contexts; that is not an absolute rule.',
 'GABA is produced from glutamate and released from vesicles. GABAA receptors conduct anions, so the effect depends on chloride/bicarbonate gradients and membrane potential, not just the name of the transmitter. GABAB receptors act through G proteins. Developmental induction of KCC2 contributes to more hyperpolarising GABAA responses in studied neurons. A depolarising response and net network excitation are also not automatically identical. The diagram makes no individual ADHD or developmental diagnosis.','S30 N-GABA-PATH N-KCC2 N-IUPHAR')

D('F16','lanes','Brain and peripheral serotonin are separate compartments.',[
 ('Brain tryptophan','Transport supplies precursor to serotonergic neurons.','supply'),
 ('TPH2 then AADC','5-HTP is formed; AADC converts it to serotonin.'),
 ('Brain transmission','VMAT2 storage, release, receptors and SERT uptake.'),
 ('Peripheral tryptophan','A separate tissue supply and enzyme context.','supply'),
 ('TPH1 pathway','Many peripheral tissues use TPH1 for serotonin synthesis.'),
 ('Peripheral serotonin','This is not a direct source of brain synaptic serotonin.','limit')],[(0,1,'TPH2'),(1,2,'synthesis and release'),(3,4,'TPH1'),(4,5,'peripheral synthesis')],
 'Serotonin is not simply a happiness chemical; tissue context matters.',
 'Tryptophan hydroxylation requires iron, BH4 and oxygen. TPH2 is the key neuronal isoform in brain serotonin synthesis, while TPH1 operates in many peripheral serotonin-producing tissues. AADC then forms serotonin, which is stored and released in the neuronal compartment. SERT-dependent uptake contributes to clearance. These compartments should not be joined by an arrow suggesting peripheral serotonin directly supplies brain synapses. The pathways alone do not predict mood or treatment response.','S31 S32 S15 N-TPH2 N-SERT')

D('F17','cycle','Acetylcholine is made, released, hydrolysed and its choline reused.',[
 ('Choline plus acetyl-CoA','Substrates in the cytosol of a cholinergic neuron.','supply'),
 ('CHAT synthesis','Choline acetyltransferase forms acetylcholine.'),
 ('VAChT and release','Vesicles load acetylcholine and release it by exocytosis.'),
 ('Receptor response','Nicotinic channels and muscarinic receptors differ.'),
 ('AChE hydrolysis','Acetylcholinesterase forms choline and acetate extracellularly.'),
 ('Choline uptake','SLC5A7 returns choline for reuse in synthesis.')],[(0,1,'CHAT'),(1,2,'VAChT'),(2,3,'binding'),(2,4,'hydrolysis'),(4,5,'choline'),(5,0,'reuse')],
 'DAT and MAO are not the main acetylcholine clearance pathway.',
 'Choline acetyltransferase synthesises acetylcholine from choline and acetyl-CoA. Vesicular transport and calcium-dependent exocytosis support release. Acetylcholinesterase, associated with extracellular membrane surfaces, rapidly hydrolyses the transmitter, and choline uptake supplies material for reuse. Nicotinic and muscarinic receptors act differently. Acetylcholine participates in many central and peripheral functions; a mechanism cartoon does not imply an attention-specific defect or justify an individual treatment.','S33 N-ACHE N-IUPHAR')

D('F18','cycle','Astrocytes support transmitter handling and the cellular environment.',[
 ('Released glutamate','Neuronal transmission supplies extracellular glutamate.'),
 ('Astrocytic uptake','EAAT transport helps clear glutamate from extracellular space.'),
 ('Glutamine synthesis','GLUL uses glutamate, ammonia and ATP.'),
 ('Glutamine transfer','Glutamine can be exported and taken up by neurons.'),
 ('Neuronal GLS','Glutaminase forms glutamate for metabolism and transmitter supply.'),
 ('Broader support','Ion balance and metabolic support extend beyond this shuttle.','limit')],[(0,1,'EAAT'),(1,2,'GLUL'),(2,3,'transport'),(3,4,'GLS'),(4,0,'loading and release')],
 'Amino-acid recycling is different from recycling a vesicle membrane.',
 'The glutamate–glutamine shuttle links astrocytic uptake and glutamine synthesis with neuronal glutamine uptake and glutaminase activity. This is one important route, not the entire metabolism of either cell. Astrocytes also support the extracellular environment and exchange metabolic substrates. The figure does not designate a lactate shuttle as the only neuronal fuel route, identify a patient defect or equate amino-acid recycling with synaptic-vesicle recycling.','S28 S29')

D('F19','cycle','Glutathione participates in redox chemistry; balance matters.',[
 ('Amino-acid supply','Glutamate, cysteine and glycine contribute to glutathione synthesis.','supply'),
 ('Reduced glutathione','GSH supports redox reactions; synthesis requires ATP.'),
 ('Peroxide handling','Glutathione peroxidases can use GSH to reduce peroxides.'),
 ('Oxidised glutathione','GSSG can be produced in this redox cycle.'),
 ('Glutathione reductase','GSR uses NADPH to regenerate reduced glutathione.'),
 ('Context and evidence','Reactive species also signal; oxidative stress needs measurement.','limit')],[(0,1,'GCL then GSS'),(1,2,'GSH use'),(2,3,'oxidation'),(3,4,'NADPH'),(4,1,'reduction')],
 'This normal redox system does not establish oxidative stress as an ADHD cause.',
 'Glutathione synthesis combines glutamate and cysteine, then glycine, in ATP-requiring steps. Peroxidase reactions can oxidise reduced glutathione to GSSG while reducing peroxides. Glutathione reductase uses NADPH to regenerate GSH. Reactive species have normal signalling roles as well as damaging effects when regulation fails. The cycle is an educational simplification and not evidence that an individual has oxidative stress, requires an antioxidant or has ADHD because of a redox abnormality.','S34 N-GSR N-GPX')

D('F20','cycle','One-carbon transfer and SAM-dependent methylation are linked processes.',[
 ('Folate-derived one-carbon','5-methyl-THF supplies a methyl group in the remethylation route.','supply'),
 ('B12-dependent MTR','Methionine synthase transfers it to homocysteine.'),
 ('Methionine and SAM','Methionine is used to produce SAM with ATP.'),
 ('Methyl transfer','Enzymes such as COMT or PNMT use SAM.'),
 ('SAH and homocysteine','Further processing connects methyl donation back to metabolism.'),
 ('Genetic interpretation','Common MTHFR variation does not diagnose a methylation failure.','limit')],[(0,1,'MTR'),(1,2,'methionine'),(2,3,'SAM'),(3,4,'SAH formation'),(4,1,'remethylation')],
 'A biochemical pathway is not a personalised supplement prescription.',
 'Folate and cobalamin-dependent methionine synthase link one-carbon metabolism to methionine regeneration. SAM formed from methionine serves as a methyl donor in many reactions, including COMT and PNMT. After methyl donation, SAH is processed to homocysteine, which has several metabolic fates. This diagram omits intermediate steps and other folate functions. A common MTHFR variant alone does not demonstrate failed methylation, ADHD causation or benefit from a specific supplement.','N-MTR N-METHYL S19 S13')

D('F21','compare','Circadian timing, sleep pressure and arousal interact but are not identical.',[
 ('Circadian timing','An internal clock helps organise sleep and waking across the day.','clock'),
 ('Light and timing cues','Environmental timing helps synchronise the system.','clock'),
 ('Sleep pressure','Homeostatic need for sleep tends to increase during wakefulness.','sleep'),
 ('Sleep and recovery','Sleep changes homeostatic pressure; timing also matters.','sleep'),
 ('Arousal systems','Multiple brain systems help support or reduce wakefulness.'),
 ('Function and context','Sleep disruption can alter attention and performance.','limit')],[],
 'Sleep loss can worsen performance without establishing the origin of ADHD.',
 'Two major organising processes are circadian timing and sleep homeostasis. Light helps synchronise circadian rhythms, while prior wakefulness contributes to sleep pressure. These interact with arousal systems and everyday context. Sleep supports many functions, and disruption can affect attention, mood and physical health. This overview is not a diagnosis of a sleep disorder, evidence that sleep loss causes every ADHD case, or an instruction about sleeping medication or supplements.','N-SLEEP N-RDOC')

D('F22','lanes','Cortisol and adrenaline come from different adrenal tissues.',[
 ('Adrenal cortex','Steroid-producing tissue.','origin'),
 ('Cortisol synthesis','Cholesterol-derived glucocorticoid pathway.'),
 ('Endocrine signalling','Cortisol has broad, context-dependent tissue effects.'),
 ('Adrenal medulla','Catecholamine-producing chromaffin cells.','origin'),
 ('Adrenaline synthesis','DBH and PNMT-dependent catecholamine pathway.'),
 ('Peripheral signalling','Blood catecholamines are not brain synaptic levels.','limit')],[(0,1,'steroid pathway'),(1,2,'hormone action'),(3,4,'DBH / PNMT'),(4,5,'secretion')],
 'Peripheral stress hormones cannot be read as a brain dopamine measurement.',
 'The adrenal cortex makes cortisol through steroid biosynthesis, while medullary chromaffin cells make catecholamines through enzymes including DBH and PNMT. Their tissue origins, chemistry and regulation differ. The simplified lanes illustrate these distinctions, not the complete HPA or autonomic feedback networks. Blood catecholamine concentrations cannot be equated with transmitter levels at a brain synapse, and the diagram does not demonstrate a cortisol abnormality or a specific stress cause of ADHD.','N-CORTISOL S12 S13')

D('F23','compare','Developmental biology and genetic association require different evidence.',[
 ('Cell differentiation','Cell identity and timing shape later function.'),
 ('Synapse formation','Neurons form connections within a developing environment.'),
 ('Maintenance and change','Connections remain responsive to activity and context.'),
 ('Common-variant study','2023 GWAS identifies associated regions and enrichment.','evidence'),
 ('Rare-variant study','MAP1A, ANK2 and ANO8 are rare-variant examples from the 2025/26 study.','evidence'),
 ('Individual limits','Association does not prove a specific developmental defect.','limit')],[],
 'Rare-gene examples belong to the rare-variant source, not the 2023 GWAS.',
 'Neuronal differentiation, synapse formation and maintenance provide a biological context for investigating genetic associations. The figure does not assign each named gene to one mandatory developmental stage. MAP1A, ANK2 and ANO8 are examples from the rare-variant paper published online in 2025 and in the 2026 issue; they must not be attributed to the 2023 common-variant GWAS. An association or enrichment can motivate experiments but does not demonstrate an individual developmental lesion.','S02 S04')

D('F24','flow','Drug exposure is not the same thing as synaptic transmitter metabolism.',[
 ('Medicine and formulation','The active ingredient and release design matter.','supply'),
 ('Absorption','Medicine enters circulation after administration.'),
 ('Distribution','Blood and tissue exposure are different quantities.'),
 ('Biotransformation','Enzymes may form inactive or active metabolites.'),
 ('Elimination','Renal and other routes remove drug or metabolites.'),
 ('Clinical response','Exposure, benefit and adverse effects require individual monitoring.','limit')],[(0,1,'entry'),(1,2,'circulation'),(2,3,'metabolism'),(3,4,'clearance')],
 'These steps do not supply a dose or justify changing a prescribed regimen.',
 'Absorption, distribution, metabolism and elimination describe pharmacokinetics. They differ between medicines and formulations. For dexamfetamine, the current UK product information describes gastrointestinal absorption, distribution including brain entry, biotransformation and urinary elimination. This general diagram does not specify a concentration, dose or metabolic genotype interpretation. Clinical effect and tolerability require assessment and monitoring; systemic drug handling must not be conflated with MAO/COMT handling of dopamine.','N-AMFEXA N-CONCERTA N-ATOMOXETINE')

D('F25','compare','Three medicines, different target actions: a simplified comparison.',[
 ('Methylphenidate','Inhibits dopamine and noradrenaline reuptake; product formulation matters.'),
 ('Atomoxetine','Selective noradrenaline transporter inhibition is its principal described action.'),
 ('Dexamfetamine','Acts as a monoamine-transporter substrate and can promote release.'),
 ('Transporter context','DAT and NET expression vary between brain regions.'),
 ('Downstream response','Receptors, signalling and network state shape effects.'),
 ('Clinical interpretation','Target action alone does not predict benefit, safety or dose.','limit')],[],
 'A target diagram is not a medicine ranking or a personal treatment choice.',
 'Methylphenidate and atomoxetine principally inhibit reuptake through different target profiles. Dexamfetamine has substrate/releasing actions and additional intracellular effects demonstrated in experimental models. These distinctions do not exhaust the pharmacology or settle how a medicine improves ADHD symptoms. Evidence from cell or animal preparations cannot be read directly as a therapeutic concentration, personal response prediction or dose equivalence. Current product-specific information is linked; an individual prescribing decision remains separate.','N-CONCERTA N-ATOMOXETINE N-AMFEXA N-AMPH-TAAR N-AMPH-VMAT')

D('F26','flow','One mitochondrial quality-control pathway: PINK1–PRKN mitophagy.',[
 ('Membrane potential loss','In this studied route, impaired import permits PINK1 accumulation.'),
 ('PINK1 at outer membrane','PINK1 phosphorylation supports ubiquitin / PRKN signalling.'),
 ('Ubiquitin tagging','Activated PRKN promotes tagging of outer-membrane substrates.'),
 ('Cargo recruitment','Receptors connect tagged material to autophagy machinery.'),
 ('Lysosomal degradation','Autophagosome fusion supports breakdown of damaged material.'),
 ('Scope of the example','Other quality-control and mitophagy routes exist.','limit')],[(0,1,'PINK1'),(1,2,'PRKN activation'),(2,3,'cargo receptors'),(3,4,'autophagy')],
 'A normal quality-control pathway does not establish an ADHD mechanism.',
 'PINK1–PRKN-dependent mitophagy is a studied selective-removal route for damaged mitochondria. Loss of membrane potential can lead to PINK1 accumulation, phosphorylation of ubiquitin and PRKN activation, cargo recruitment and autophagy followed by lysosomal breakdown. Protein quality control and mitochondrial maintenance have other pathways too. This example does not assert that SPG7 is the same pathway, that a personal variant is pathogenic, or that quality-control failure explains ordinary ADHD.','N-MITOPHAGY')

D('F27','compare','Immune signalling and neural context are research questions, not a universal cause.',[
 ('Innate immune signalling','Toll-like receptors can trigger cell signalling pathways.'),
 ('Cellular response','Downstream transcription and inflammatory mediators depend on context.'),
 ('Microglia in brain','Resident immune cells also participate in development and tissue responses.'),
 ('Experimental observations','Mouse studies demonstrate context-specific roles in synaptic pruning.','evidence'),
 ('ADHD hypothesis','An immune association needs direction, confounding and replication checks.','evidence'),
 ('Patient interpretation','No inference of autoimmunity or inflammation from ADHD alone.','limit')],[],
 'Established immune biology is not proof that ADHD is universally inflammatory.',
 'Innate immune receptor cascades describe established cellular signalling. Microglia also have roles in brain development and responses to injury; a cited mouse experiment investigated synaptic pruning. Those observations do not demonstrate the same mechanism in every human or establish an inflammatory or autoimmune cause of ADHD. Any ADHD-specific immune claim needs its own human study, phenotype, direction-of-effect and confounding assessment. The figure therefore separates normal biological context from an unproven clinical hypothesis.','N-IMMUNE N-MICROGLIA')

D('F28','flow','Nutrients pass through absorption and regulated transport before brain use.',[
 ('Dietary inputs','Food supplies protein and micronutrients.','supply'),
 ('Intestinal uptake','Absorption contributes to circulating availability.'),
 ('Blood and metabolism','The circulating pool is processed and regulated.'),
 ('Brain-barrier transport','Specific transport systems control entry of substrates.'),
 ('Intracellular pathways','Enzymes and cofactors determine subsequent use.'),
 ('Microbiome claims','Association does not establish an effective ADHD treatment.','limit')],[(0,1,'digestion / uptake'),(1,2,'circulation'),(2,3,'transport'),(3,4,'cellular use')],
 'Gut transmitter production is not a direct measure of brain synaptic supply.',
 'Diet provides substrates whose absorption, circulating handling and brain entry are regulated. The figure uses nutrient transport as a supported example, including large-neutral-amino-acid and glucose transport. It deliberately does not draw gut dopamine or serotonin travelling directly into brain synapses. Microbiome findings require separate evidence and cannot be treated as treatment efficacy or a reason to start supplements. This overview contains no individual nutritional diagnosis or intervention claim.','S07 S08 N-GLUT1 S31')

D('F29','lanes','Oxygen and glucose have different delivery and membrane-entry routes.',[
 ('Blood carries oxygen','Most oxygen is transported bound to haemoglobin.','supply'),
 ('Oxygen diffusion','After unloading, oxygen diffuses into tissue; GLUT1 does not carry it.'),
 ('Respiratory chain','Oxygen accepts electrons at complex IV.'),
 ('Circulating glucose','Blood supplies glucose as a metabolic substrate.','supply'),
 ('GLUT1 at the barrier','SLC2A1 / GLUT1 transports glucose across brain-barrier cells.'),
 ('Cellular metabolism','Glucose handling and oxygen use are distinct processes.')],[(0,1,'unloading / diffusion'),(1,2,'cellular use'),(3,4,'transport'),(4,5,'metabolism')],
 'Reduced delivery and impaired cellular use are different hypotheses.',
 'Blood carries oxygen, largely on haemoglobin, and glucose in solution. Oxygen leaves blood and diffuses through tissue; glucose uses transport systems including GLUT1 at the blood-brain barrier. The respiratory chain uses oxygen as a terminal electron acceptor. Transport/delivery limitations and defects of intracellular metabolism are different possibilities requiring their own evidence. ADHD alone demonstrates neither. This corrected diagram removes the implication that oxygen crosses through GLUT1.','N-GLUT1 N-OXYGEN S23')

D('F30','projection','Histamine and orexin are distinct systems with interacting arousal roles.',[
 ('Histamine neurons','Tuberomammillary / posterior-hypothalamic populations.','origin'),
 ('Histamine signalling','A monoamine transmitter acting through histamine receptors.'),
 ('Broad arousal context','Functions include wakefulness and context-dependent behaviour.'),
 ('Orexin neurons','Hypothalamic populations produce orexin / hypocretin peptides.','origin'),
 ('Orexin signalling','Peptide actions can recruit histaminergic and other systems.'),
 ('Evidence limits','Cited knockout and electrophysiology work is from rodents.','limit')],[(0,1,'histamine'),(1,2,'modulation'),(3,4,'orexin'),(4,1,'interaction')],
 'Neither system supplies a one-to-one map to an ADHD symptom.',
 'Histamine is a monoamine, while orexin/hypocretin molecules are peptides. Rodent experiments distinguish their roles in wakefulness and demonstrate orexin excitation of histamine neurons. Both operate in wider interacting arousal systems. The schematic separates origins, transmitters and evidence scope; it is not a complete anatomical map, evidence of a deficit in the reader or a rationale for an ADHD medicine or supplement.','N-OREXIN N-HISTAMINE')

D('F31','compare','Interpret a genetic result through evidence, not a gene-name shortcut.',[
 ('Variant identity','Confirm the exact variant, reference build and call quality.','evidence'),
 ('Evidence class','Common association, rare burden and functional tests differ.','evidence'),
 ('Gene and tissue','Candidate gene, expression and relevant cell type need support.','evidence'),
 ('Clinical classification','Pathogenicity and phenotype match require appropriate assessment.','evidence'),
 ('Contextual hypotheses','A pathway connection can guide research without proving causality.'),
 ('Individual outcome','A SNP name cannot determine a symptom, diagnosis or dose.','limit')],[],
 'Rare biochemical disorders and common ADHD association are not interchangeable.',
 'A genetic overlay should state variant identity and evidence class, then examine the gene, tissue, mechanism and phenotype. Common statistical associations are different from a proven pathogenic rare variant, and rare-variant burden studies are not the same as a diagnosis from one unreviewed call. Connections between genes and pathways can generate research hypotheses. They do not justify arrows directly from a SNP label to a personal symptom or treatment recommendation.','S02 S03 S04 N-VARIANT')

D('F32','reaction','Tyrosine hydroxylase chemistry: the reaction and its controls are separate.',[
 ('L-tyrosine','Substrate in the cytosol.','supply'),
 ('TH reaction','Tyrosine hydroxylase forms L-DOPA.'),
 ('L-DOPA','Product available for downstream AADC conversion.'),
 ('BH4 and oxygen','Required for the hydroxylation chemistry.','cofactor'),
 ('Iron cofactor','Iron supports TH catalytic activity.','cofactor'),
 ('Regulation and context','Enzyme amount/activity influence flux; no dopamine-level prediction.','limit')],[(0,1,'substrate'),(1,2,'product'),(3,1,'co-substrates'),(4,1,'cofactor')],
 'This is a cytosolic reaction; the arrow is not a direct route to a symptom.',
 'Tyrosine hydroxylase catalyses the rate-limiting hydroxylation step in catecholamine biosynthesis. It uses BH4, iron and oxygen to form L-DOPA in the cytosol. Enzyme activity is regulated, so substrate abundance alone does not determine downstream transmitter availability. Further synthesis, vesicular storage, release and clearance remain necessary. The figure omits full chemical stoichiometry and does not assert a TH defect or predict a therapeutic response.','S10 S09')

D('F33','lanes','DBH acts in secretory vesicles; PNMT acts in cytosol of expressing cells.',[
 ('Dopamine in cytosol','Transport into a vesicle precedes DBH action.','supply'),
 ('Secretory vesicle: DBH','Copper / ascorbate-dependent conversion produces noradrenaline.'),
 ('Noradrenaline vesicle','Can be stored and released in noradrenergic cells.'),
 ('Cytosolic noradrenaline','In PNMT-expressing cells, a pool is available outside the vesicle.','supply'),
 ('Cytosol: PNMT','SAM-dependent methylation forms adrenaline.'),
 ('Adrenaline storage','Vesicular transport permits storage for subsequent release.')],[(0,1,'VMAT2 then DBH'),(1,2,'product'),(1,3,'vesicle export'),(3,4,'PNMT'),(4,5,'vesicular uptake')],
 'These branches require the relevant enzymes; not every neuron has both.',
 'DBH is located in secretory vesicles, including noradrenergic neurons and chromaffin cells. It uses copper and ascorbate in conversion of dopamine to noradrenaline. In PNMT-expressing cells, noradrenaline is available in cytosol for SAM-dependent methylation to adrenaline, which can then be repackaged. The paired compartments correct the impression that both enzymes act freely in the same space or that every dopamine cell produces adrenaline.','S12 S13 S15 S09')

D('F34','membrane','DAT transport uses ion gradients; ATP maintains those gradients indirectly.',[
 ('Outside the cell','Extracellular dopamine with sodium and chloride.'),
 ('DAT / SLC6A3','Membrane cotransporter mediating dopamine uptake.'),
 ('Inside the cell','Dopamine enters the cytosol alongside coupled ions.'),
 ('Na+/K+ ATPase','ATP-driven pump helps maintain the sodium gradient.'),
 ('Storage or metabolism','Cytosolic dopamine may be repackaged or processed.'),
 ('Regional context','Other transporters may contribute where DAT is scarce.','limit')],[(0,1,'coupled uptake'),(1,2,'transport'),(3,1,'indirect gradient'),(2,4,'downstream routes')],
 'DAT is not directly powered by ATP hydrolysis.',
 'DAT cotransports dopamine with sodium and chloride across the plasma membrane. Its transport energetics depend on electrochemical gradients; the Na+/K+ ATPase supports ionic gradients using ATP but DAT does not itself act as an ATP-hydrolysing pump. Intracellular dopamine can be stored or metabolised. NET can contribute to dopamine clearance in regions with low DAT, supported by regional experimental evidence. This is not a genotype-based inference about the reader.','S17 N-DAT-ION S38 N-NAK')

D('F35','lanes','A specific experimental context: prefrontal working-memory circuits.',[
 ('Alpha2A receptor','Noradrenaline-related Gi signalling in studied PFC circuits.'),
 ('cAMP / HCN modulation','Reduced cAMP signalling can reduce HCN-channel opening.'),
 ('Network connection','Can strengthen recurrent activity in the studied context.'),
 ('D1 receptor','Dopamine-related effects vary with stimulation level.'),
 ('Working-memory tuning','Primate recordings demonstrate non-linear effects.'),
 ('Scope of evidence','Not a universal concentration curve or a personal optimum.','limit')],[(0,1,'signalling'),(1,2,'modulation'),(3,4,'modulation')],
 'More stimulation does not mean more benefit in every context.',
 'Primate prefrontal experiments support alpha2A-associated regulation of cAMP/HCN signalling and recurrent activity, and non-linear D1 effects on neurons engaged in working memory. These are defined cellular/task contexts. A conceptual inverted-U result is not a measured curve for an individual, a plasma-level target, a universal effect across brain regions or a justification for increasing medication. The figure deliberately avoids numerical concentrations and dose recommendations.','S20 S21')

D('F37','cycle','Hydroxylase recycling and oxidised-BH2 salvage require different enzymes.',[
 ('BH4','Reduced cofactor available to aromatic amino-acid hydroxylases.','cofactor'),
 ('4a-hydroxy-BH4','Hydroxylase-use intermediate; PCD / PCBD1 acts next.'),
 ('Quinonoid BH2','QDPR uses NADH to regenerate BH4.'),
 ('Oxidised 7,8-BH2','A different chemical species used in DHFR-dependent salvage.'),
 ('DHFR salvage','Uses reducing equivalents, conventionally NADPH, to form BH4.'),
 ('Separate routes','NOS redox chemistry is not the same hydroxylase regeneration loop.','limit')],[(0,1,'hydroxylase use'),(1,2,'PCD / PCBD1'),(2,0,'QDPR + NADH'),(3,4,'DHFR'),(4,0,'regeneration')],
 'Quinonoid BH2 and 7,8-BH2 must not be treated as one identical intermediate.',
 'Aromatic amino-acid hydroxylases form 4a-hydroxytetrahydrobiopterin. Pterin-4a-carbinolamine dehydratase produces quinonoid dihydrobiopterin, which QDPR can reduce using NADH to regenerate BH4. Oxidised 7,8-dihydrobiopterin belongs to a different salvage route using DHFR and NADPH. Non-enzymatic rearrangement and intermediate redox chemistry exist but are omitted here rather than drawn as an unverified universal arrow. This is an educational biochemical distinction, not proof of BH4 deficiency or an ADHD mechanism.','S27 N-QDPR N-DHFR N-BH4-SALVAGE')

D('F38','cycle','The glutamate–glutamine shuttle links neurons and astrocytes.',[
 ('Neuron: glutamine','Imported substrate can enter the mitochondrial compartment.','supply'),
 ('Neuron: GLS','Glutaminase forms glutamate, which can reach cytosol.'),
 ('Neuron: release','VGLUT loading and exocytosis supply extracellular glutamate.'),
 ('Astrocyte: uptake','EAAT transport clears extracellular glutamate.'),
 ('Astrocyte: GLUL','Glutamine synthetase uses ATP and ammonia to form glutamine.'),
 ('Glutamine export','Transport returns substrate to the neuronal pool.')],[(0,1,'GLS'),(1,2,'loading / release'),(2,3,'EAAT'),(3,4,'GLUL'),(4,5,'export'),(5,0,'uptake')],
 'Astrocytic amino-acid recycling is not synaptic-vesicle membrane recycling.',
 'Neurons import glutamine and use mitochondrial glutaminase to form glutamate, which is available for vesicular transport and release after cytosolic transfer. Astrocytic uptake and cytosolic glutamine synthetase support glutamine regeneration, followed by transport back to neurons. GABA-producing neurons can use glutamate as precursor, but that additional branch is not the same as the glutamatergic vesicle cycle. The schematic omits some membrane/transport intermediates and does not assert a defect in a particular reader.','S28 S29 S30')

D('F40','branches','Amphetamine mechanisms: experimental targets and clinical effects are distinct.',[
 ('Dexamfetamine entry','A monoamine-transporter substrate; intracellular access matters.'),
 ('Cytosolic actions','Vesicular handling and monoamine availability can be altered.'),
 ('Transporter-mediated efflux','DAT / NET can support non-exocytotic monoamine release.'),
 ('TAAR1 signalling','Cell and mouse studies show intracellular cAMP / RhoA effects.'),
 ('Normal exocytosis','The calcium-triggered vesicle pathway remains a separate route.'),
 ('Clinical boundary','Model, concentration and timing affect findings; no personal prediction.','limit')],[(0,1,'intracellular access'),(1,2,'release pathways'),(0,3,'experimental action')],
 'A therapeutic dose or individual benefit cannot be read from this cartoon.',
 'Amphetamine acts as a substrate at monoamine transporters and can alter intracellular monoamine handling and support transporter-mediated efflux. Experimental work also identifies intracellular TAAR1 signalling and transporter trafficking. Vesicular stores affect availability, but knockout-culture evidence shows vesicular transport is not an absolute prerequisite for every experimental amphetamine action. Calcium-triggered exocytosis is therefore kept separate from efflux. Models, concentration and exposure conditions limit translation. The UK dexamfetamine SmPC does not claim a fully settled explanation of behavioural benefit in ADHD. No dose, efficacy, safety or individual mechanism is inferred.','N-AMFEXA N-AMPH-TAAR N-AMPH-VMAT N-AMPH-EFFLUX')

if __name__=='__main__':
 target=Path(__file__).resolve().parents[1]/'content-queue/next-upload-batch/navigation-atlas-2026-10-13/atlas-recreated-specifications.json'
 target.write_text(json.dumps({'version':'2026-10-13.2','figures':C},indent=2)+'\n')
 print('Wrote',len(C),'recreated figure specifications')
