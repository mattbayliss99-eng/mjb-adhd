# MJB — NEXT UPLOAD BATCH

**Status:** editorial staging only — NOT published.  
**Created:** 2026-10-11.  
**Purpose:** turn useful conversations, personal observations, evidence reviews, and correspondence into reusable, source-checked MJB website pages or downloadable resources.

## Intake-to-release workflow

1. **Capture** — save the underlying question/claim, the user's contribution, useful comments, and proposed audience.
2. **Investigate** — separate lived experience, established guidance, primary studies, mechanistic hypotheses, contradictory evidence, and unknowns. Document study population, design, endpoints, dates, DOI/PMID and methodological biases.
3. **Draft** — aim for a clear 2–3 A4-page standalone article with a short answer, deeper analysis, source list and a social-share summary. Put full reports/meta-analyses in downloads.
4. **Quality gate** — review accuracy, links, attribution, privacy/consent, safety claims, accessibility, mobile presentation, and coherence with existing pages. Do not expose private medical records or identifying correspondence without explicit publication approval.
5. **Integrate** — place source in the site's *existing* most relevant content family, not a duplicate page; update navigation, cross-links, sitemap, previews and source index; regenerate static/interactive guide outputs as applicable.
6. **Verify & release** — run repository's validation/build/link checks, preview, and publish after approval. Record final public URL and release notes.

**Publication control:** the `content-queue` branch is for intake and editing. Nothing in this queue should be represented as already live. Never bypass existing guidebook compilation and verification.

## Proposed next batch

| ID | Working title | Destination / relationship | State |
| --- | --- | --- | --- |
| MJB-Q001 | Cannabis: uses, harms and realistic comparators | Expand existing `site/compounds/cannabis/`; optionally cross-link a focused evidence article | Intake |
| MJB-Q002 | Drug-use surveys: selection, disclosure and underreporting | New evidence-methodology article; illustrate uncertainty and scenarios, not speculative figures as facts | Intake |
| MJB-Q003 | Clinical disclosure and loss of treatment access | Healthcare accountability / patient safety; distinguish source-backed norms from personal case evidence | Intake |
| MJB-Q004 | Published accountability email: dated primary-source record | Accountability article plus accessible, visually distinct PDF | Await exact sent-version retrieval, privacy review and approval |
| MJB-Q005 | FND: hypothesis-led interventions and negative-response analysis | Add to existing FND guide / linked research article; distinguish Parkinson's evidence from FND-specific efficacy | Intake |

## Existing canonical site pages (avoid duplicates)

- Medical cannabis: `/compounds/cannabis/`
- FND: `/guide/static/neurology/fnd/`
- Guide source pages: `guidebook/content/pages/`
- Verification record: `guidebook/VERIFICATION.md`

## Evidence and editorial requirements

- Label **guideline**, **randomised trial**, **observational study**, **case study**, **mechanistic hypothesis**, **patient observation**, and **editorial opinion** separately.
- For contentious percentages, show the numerator/denominator, denominator definition, sampling frame, ascertainment method, selection effects, and uncertainty. Discuss non-disclosure as a bias possibility rather than apply an invented correction factor.
- For treatment discussion, identify the population and outcome studied; distinguish measurable effects from mechanism conjecture. Do not mistake nonresponse for exclusion of an entire pathway.
- Compare treatments using similar indications and endpoints; disclose unequal comparison groups.
- Publish only material with permission, appropriate redactions and traceable sources. Exclude exact personal identifiers, secrets, and unreviewed private evidence.
- Preserve permanent shareable URLs and good social media previews. Cross-link to a full download where helpful.

## Reusable entry format

Copy `TOPIC_TEMPLATE.md` for each new candidate, using a stable identifier (MJB-Q###). Move its state through: `intake → research → draft → verification → ready → published`.

**Next action:** user supplies a post, thought, study, observation or document; the assistant researches and drafts an entry. Queue pages are only moved into the production structure after editorial verification.
