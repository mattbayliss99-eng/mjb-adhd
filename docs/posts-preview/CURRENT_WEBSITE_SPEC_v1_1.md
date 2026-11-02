# MJB current working website specification v1.1
1 November 2026. Consolidated handoff specification, not a claim that changes are deployed. Based on the owner's current instructions, previous visual-posts brief, returned Claude prototype and questionnaire PR. Where older working documents conflict, preserve their originals and use this brief for the new design task. Escalate substantive unresolved conflicts in the returned report.

## Product outcome
A free, evidence-rich ADHD knowledge publication with social-style browsing as the proposed primary entrance and full articles as a parallel mode. The design aims to make information easier to enter, understand, navigate and resume. Evaluate that hypothesis; do not claim a universal ADHD preference or clinical benefit.

Keep the useful left navigator, source links, cross-topic links, shared themes, reading preferences, narration, static guide and print paths. Desktop left rail and labelled mobile drawer should expose topic ancestry and current location. Preserve every existing public route. Do not redesign the entire publication as a disconnected landing page.

## Two views, one maintained content bank
Visual view: one principal idea per post, one main image slot, concise text, visible topic/depth/evidence labels, stable URL, full explanation and source links. Main copy must remain readable HTML, not text trapped in generated images. Allow long content to scroll vertically and large text to grow naturally.

Recommended first experiment: topic shelves leading to finite paged sequences, informed by Claude's existing prototype. Visible Previous/Next and sequence position; swipe optional with a real reader-facing on/off control. No gesture is required. No autoplay or infinite-scroll dependency. Follow normal keyboard semantics without hijacking keys on buttons, links or inputs. Preserve scroll and subject on return, mode switch and reload. Call a newly opened post “visited”, not “read”, unless a separately defined completion action exists.

Article view: full mechanisms, context, limitations, evidence and precise section links. Retain the current deep references. Post and article derive from maintained structured records and reviewed claim sources; do not create independent factual copies that silently diverge.

## Content model
Immutable post IDs independent of display sequence. Canonical topic IDs independent of hashtag spelling; aliases and plain-language suggestions support discovery. Depth simple/medium/high is separate from specificity overview/focused/specific. A post can belong to multiple curated sequences. Preserve source population, experimental design, biological level, uncertainty, conflicting findings and publication date through site cards, captions and narration.

Status workflow: draft -> evidence review -> visual ready -> reviewed -> approved -> published. Existing status strings may differ; map explicitly rather than rewriting every record. A status label cannot certify its own evidence. Prefix-only fingerprints do not detect complete factual drift. Missing typed references must block any source-checked/approved status for factual content. Workflow guidance is not empirical evidence. Existing website prose is not independent verification of itself.

## Visual production
Produce reusable editable masters, separate exports, asset ID/version, creator/tool, provenance/rights, alt text and text description. Prefer shared visual system and reusable templates to unrelated images. Illustrations may be generative; precise scientific diagrams, quantitative figures and labels require explicit authored/vector construction and checking. No invented molecular detail. Use editorial/intro content to test creative layouts without extending biomedical claims.

One record should feed website post, social caption, visual brief and optional narration. Export a web-optimised asset and proposed social crops without cropping away qualifications or source cues. Research X examples as qualitative design/audience discovery; record links/dates and distinguish observations from proposals. No copying others' artwork, posting, messaging or account changes in this task. No embedded X feed, tracking or external social scripts required on the site.

## Learning utility
Questionnaire and terminology work is optional companion utility, not the first design task's core implementation. Keep fictional demonstration separate from recognised instruments and original MJB exploration tools. Real tools require authorised wording, scoring/interpretation review and applicable permissions before inclusion. No invented DSM diagnostic scoring. Flashcards remain pending evidence review. Print/PDF/download capabilities must describe actual behaviour; DOCX/Google Docs export is planned, not implemented by the current demo.

No accounts, analytics or answer collection in this design iteration. Future voluntary data donation is a separate feature: usable tools without donation, exact disclosed fields and purpose, minimisation, explicit consent, and an assessed anonymity model. Visitor responses cannot estimate ADHD population prevalence. This is not permission to implement a collection backend.

## Roles and release
Claude/Claude Code: research, alternative synthesis and suitable programme runs; all outputs remain reviewable.
Grok/Grok Bot: audience/format discovery, illustrative assets, captions and first design/code iterations.
Gemini/Notebook: bounded media and source-derived draft creation using the Creation Kit.
GPT/Codex: scope and coordination, claim/evidence checks, integration review, executed verification, final release decision and authorised website push. The owner retains product direction and approval authority. Model identity alone is not evidence or approval.

Grok works on an isolated branch/local copy. Do not merge, push main or deploy production. Do not combine PR #7 and the posts patch silently. Return separate changes and conflicts. Final GPT/Codex signoff requires observed evidence, not the producer's pass checklist.

## Acceptance
Demonstrate topic orientation after a deep link; no-swipe navigation; back/forward and evidence-return position; same-subject mode switch; hashtags/aliases and no-result state; 200% text and narrow mobile layout; reduced motion; keyboard/focus and meaningful image-free text. Verify original routes, shared reading controls and no-JS/static fallbacks. Record exact commands, tested browser/build SHA, outputs and limitations. Actual downloads must be opened/compared; whole-deck PDF requires all-page content and visual checks. Never substitute source inspection for browser testing.
