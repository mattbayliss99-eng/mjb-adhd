# MJB ADHD — visuals commission, 6 October 2026

Create a coherent visual package for the supplied 43-page guidebook, integrated into the existing black/gold/purple MJB ADHD site. The content and route files are authoritative. Do not add medical claims to make a diagram more dramatic. Deliver assets and their editable originals, captions, alt text, text equivalents and a manifest. Return a package for integration, not an automatically published replacement website.

## First batch

| Asset ID | Guide page ID | Visual and purpose | Caption requirement |
|---|---|---|---|
| V01 | memory-time-awareness | Four distinct experiences: losing an intention, losing track of time, automatic familiar activity, and an actual gap in awareness. Use four panels, not a causal sequence. | These experiences need different descriptions and assessment; they are not all established ADHD manifestations. |
| V02 | nerve-pain | A neutral body outline plus a small observation worksheet: location, contact, position, duration, weakness/numbness. | Sensation quality helps describe pain; it does not diagnose nerve injury or measure dopamine. |
| V03 | sensory-feedback | Separate movement planning, position sense, touch, pain and attention into labelled domains without causal arrows. | A framework for describing experience, not a measurement of neural signals or an established mechanism. |
| V04 | dystonia, spasticity, ataxia | Three parallel definition cards: involuntary contractions/postures; increased tone following nervous-system injury/disease; difficulty coordinating movement. Each has an assessment question. | A comparison to prepare for assessment, not a way to diagnose yourself. Keep the three processes distinct. |
| V05 | hsp, drd, genetics | Three-panel comparison: a genetic result; clinical pattern; specialist interpretation. No gene-to-diagnosis shortcut. | A variant or medication response alone does not establish a neurological diagnosis. |
| V06 | continuity, care, no-prescriber | Decision workflow with named owner, interim plan, reasons/alternatives, review date and escalation route. | A request framework, not a guarantee of prescribing or a legal determination. |
| V07 | matthew-timeline | Four-lane timeline: trust records, Matthew's account, other clinicians, records still needed. Use the supplied JSON exactly. | Dates, disputes and source IDs stay visible. Do not collapse discharge request, administrative closure, last dispensing and last dose. |
| V08 | treatment-evidence | Trial result card from source R1 (Brams et al., 2012). Compare 45/60 placebo (75%) with 5/56 continued treatment (8.9%) over six weeks. | Selected adults stable on lisdexamfetamine for at least six months; symptom relapse after randomised withdrawal. This does not measure death, permanent injury or the effect of all treatment interruptions. |

## Existing album shortlist

Use `MJB_Infographic_Selection_06Oct2026.md` as the shortlist and correction log. The album is https://photos.app.goo.gl/RXZKsgYBEhHzafUv8 . Select one master per message. Do not automatically publish the album or hotlink its thumbnails. Some images include identifiers or private contact details: return corrected public versions. Reuse existing site assets only after checking whether their wording and arrows agree with current page evidence.

Priority reuse candidates: “Bad admin isn't just paperwork”, “Filed. Not solved.” and the horizontal MJB branding banner. Case claims need dates and attribution. Expert quotations need original wording, date and permission resolved before reuse. The gene-to-symptom fault trees need individual claims and arrows checked; do not portray the proposed chain as an established ADHD mechanism.

## Evidence and design rules

- Clinical guidance/information, research findings, patient observations, contested accounts and hypotheses must retain distinct labels. No decorative authoritative-looking anatomy for an unverified mechanism.
- For mechanisms: solid line = supported relationship as described by its source; dotted line = association; dashed line = hypothesis. Label lines in words as well. Do not use line weight alone to suggest a quantified effect.
- Never turn an association, response to medication or patient sensation into proof of causation or diagnosis.
- No new drug instructions, dose suggestions, inferred clinician motives or findings of legal/professional breach.
- Avoid large text-heavy posters. Use short panels with a separate HTML/text explanation. At 360px width, essential text must remain legible.
- Match the site's palette without relying on colour alone. Minimum readable contrast; dark and light variants when necessary. Avoid flashing, automatic motion and distressing imagery.
- Decorative artwork may be raster; precise diagrams should be editable vector with real text. Provide SVG plus WebP/PNG fallbacks, with SVG scripts/foreignObject removed. No fonts, trackers or third-party hotlinks.
- Supply 480px/960px web variants where useful, intrinsic dimensions and file sizes; aim below 250 KB per ordinary image. Preserve originals separately.

## Required manifest

One record per asset: `asset_id`, `filename`, `variant`, `width`, `height`, `guide_page_ids`, `existing_routes`, `caption`, `alt`, `text_equivalent_file`, `source_ids`, `evidence_status`, `corrections_applied`, `unresolved`, `rights`, `sha256`.

Every source ID must exist in supplied `guide-data.json`. Every factual panel/arrow must identify its source or be explicitly marked as a patient account or hypothesis. If a claim cannot be supported, omit it and record the gap. No NHS number, address, personal email or phone number in any public asset.

## Return package

`assets/` (web variants), `originals/` (editable), `text/` (equivalents), `visuals-manifest.json`, and `README.md` describing unresolved points. Do not claim that clinical review, permission or source validation happened unless it did. The integrating editor will review, select and insert assets at the listed routes.

## Field-guide additions

V09 — `dopamine-options`: four parallel panels for precursor supply, reuptake inhibition, transmitter release and receptor activation. Show a question beside each: indication, outcome, preparation, monitoring. Keep alpha-2A adrenergic agonism separate from dopamine-receptor agonism. Do not draw a dopamine potency/safety ladder.

V10 — `botanical-evidence`: three evidence cards with population and limitations visible: the six-week saffron ADHD pilot (F1), contrasting Mucuna Parkinson trials (F2/F3), and commercial-product analysis (F4). No dose instructions or claim of interchangeability.

V11 — `case-decisions`: a decision/ownership worksheet with record, interpretation, unresolved question and next owner. Case assertions retain C1/C2/C3 attribution. No clinician-motive imagery or implied formal breach finding.

Use the updated 43-page data file. These additions replace any proposed strongest-to-weakest stimulant ranking or claims that supplements have proven superiority over non-stimulants.
