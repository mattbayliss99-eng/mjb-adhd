# MJB website update — numbered plan and restart record

Prepared: 13 October 2026, Europe/London. Version 4 — expanded atlas, visual content and priority correspondence ready for review.

**Current checkpoint: S6 — expanded candidate checked locally; refreshed hosted verification in progress. Next: review the full atlas/menu on phone or tablet, then S7 for the approved release before 15:00 Europe/London.**

This record tracks implemented navigation, all 41 staged educational figures, expanded visual content and the remaining release review. The candidate is staged in a draft PR; production publication, outreach and Drive reorganisation remain pending. Complete one bounded stage or substage per run and update this record before handing back.

## Priority decision — 13 October, latest user direction

The first release centres on the **regular website category menu, visible location and search**. Guidebook integration follows the same route model where practical; improvements to the guide must not delay delivering the regular-site menu or break existing guide tools.

1. **Navigation and orientation:** a recognisable Navigation control opens named categories; selecting a category reveals its children. Other branches remain closed. Show the current section and ancestors, plus a compact breadcrumb above the content when the drawer is closed.
2. **Search index:** support specific-information retrieval alongside browsing. Search results show a human label, section path and short description. Audit current index coverage before choosing or replacing search technology.
3. **Claude figures:** independently check, correct and integrate approved figures in small batches. Keep a reusable asset record for later articles and social content.
4. **Relatable images, memes and short videos:** include a small generic pilot in S5.4 rather than relegating all media to the distant backlog. Use original examples initially; select relevant external material with checked reuse/embedding rights. App/PiP/virtual-desktop ideas remain future design inspiration.

The site should answer “Where am I?” after cross-links or a direct search landing. A page's **structural path** is distinct from browser history: seven visited links need not mean seven hierarchy levels. Do not artificially deepen the menu to reproduce every browsing step.

### Navigation research — completed as S0.1

Scope: the next MJB website release, for visitors seeking help or exploring scientific information, on phone, desktop and tablet with mouse. Evidence is current primary design-system/accessibility guidance plus the user's described friction. No visitor analytics, site-specific usability study or fresh live-site audit has been conducted; prevalence and measured performance gains remain unknown.

| Pattern | Useful fit | Tradeoff | Proposed MJB decision |
|---|---|---|---|
| Expandable left sidebar / disclosure drawer | Reveals topic groups and preserves visible parent/current-page relationships | Takes screen width when pinned; long trees need careful grouping | Lead candidate: phone drawer; optional pinned desktop version |
| Top category dropdown with location breadcrumb | Compact, familiar main-site entry point | A closed dropdown gives less persistent sibling/context visibility | Compare as the compact alternative, using the same hierarchy |
| Full application-style file tree | Suits complex selection and file-management interaction | Requires more keyboard/focus behaviour than ordinary website links | Borrow the visual hierarchy; use ordinary links and disclosure buttons for this website |

**Evidence and interpretation:** W3C explicitly favours disclosure navigation for typical sites over complex ARIA tree widgets [R1, R2]. USWDS supports hierarchical side navigation, active-page indication and testing breadth versus depth [R3]. GOV.UK supports breadcrumbs for multi-level site orientation and notes that their value alongside a sidebar should be assessed [R4]. USWDS describes search as useful for specific terms or content not found through navigation [R5]. The combination is our proposed fit for this brief, not a proven universal winner or an ADHD-specific clinical finding.

### Behaviour contract for the first prototype

- Category labels toggle their child list on click/tap/keyboard activation. Put an explicit “Section overview” link inside each group, avoiding one control that both navigates and expands.
- Expand one sibling category at a time; selecting a subcategory reveals the next level without closing its ancestors. Do not expand unrelated branches on hover.
- Opening navigation on an existing article reveals its current ancestor chain automatically. This deliberate location cue is the exception to the default collapsed categories.
- Highlight the current page with text/state and a visual marker; keep ancestors distinguishable. Direct links, search results and browser back/forward update the same state.
- Phone: drawer plus a compact top location path. Desktop: test a pinnable rail against the compact dropdown alternative. Intermediate breadcrumb levels can collapse behind an explicit expansion control if needed.
- Preserve reading position when opening/closing controls; keep Search readily available. Retain all themes, source access, deeper exploration and current routes.

Acceptance focuses on behaviour: find a care topic without knowing its exact name; search an exact mechanism; land directly on a deep page and identify its parent; switch branches without menu clutter; return to a parent; close navigation without losing reading position. Record completion, wrong turns and user feedback rather than assuming fewer clicks alone proves a better design.

### Visual/media pilot — S5.4

Start with two or three original, generic examples: wanting to start a task but struggling to initiate; losing track of time while absorbed; forgetting why a new tab was opened. These are draft editorial themes, not claims that every reader experiences them. Pair each relatable image with a short literal explanation and an optional deeper link. A meme is an illustration of experience, not proof of the mechanism beside it.

Static images get useful text alternatives; video gets captions and a text summary/transcript, click-to-play and no autoplay. W3C guidance supports using visual/media content to clarify meaning and requires equivalent access to its information [R6]. Test whether each example improves comprehension rather than merely decoration. Preserve reusable IDs, credit/rights, sources where applicable and site/social variants; avoid generating unrelated artwork before the content and placement are chosen.

### Proposed cross-tool handoffs

These are division-of-work proposals, not claims of access to Grok or Claude from this chat, and no handoff has been sent.

| Participant | Bounded contribution | Reviewable handback |
|---|---|---|
| ChatGPT / this workspace | Source-backed UX decisions, navigation contract, checkpoint coordination and independent review | Versioned plan, route/test requirements, findings and acceptance record |
| Grok | Current repository/deployment audit and implementation if its existing project access supports this | Exact refs, changed files, reproducible checks and preview; no inferred live status |
| Claude | Figure corrections/regeneration and clear explanatory visuals using the supplied source pack | Original/replacement pair, exact changes, editable files and source/rights record |

Share only the relevant batch and contract, not the entire project history. A producer's “passed” label still needs review against the acceptance criteria. Capability-specific choices follow verified access and outputs, not assumed model superiority.

### Research source register

All accessed 13 October 2026. Primary guidance, not comparative MJB user-testing results.

- R1 — [W3C navigation treeview cautions](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/examples/treeview-navigation/).
- R2 — [W3C disclosure navigation with links](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation-hybrid/).
- R3 — [USWDS side navigation](https://designsystem.digital.gov/components/side-navigation/).
- R4 — [GOV.UK breadcrumbs](https://design-system.service.gov.uk/components/breadcrumbs/).
- R5 — [USWDS search](https://designsystem.digital.gov/components/search/).
- R6 — [W3C accessible writing, images and multimedia](https://www.w3.org/WAI/tips/writing/).

## Execution checkpoint — 13 October 2026, second run

- Priority correspondence completed first: four tailored, unsent replies to the actual AMHAT, Watkins, PSD and OPCC threads. Both supplied graphics are attached to each draft. Bodies/thread identity/attachment sizes and DRAFT status verified. The private email/evidence pack is saved separately; it is not in the public website repository. No email sent; no CFA, appointment time or legal review lodged.
- Draft PR: https://github.com/mattbayliss99-eng/mjb-adhd/pull/6
- Review entry point: https://deploy-preview-6--mjb-adhd.netlify.app/science/process-atlas/
- Branch: `work/navigation-atlas-2026-10-13`. Previous verified head: `f898d3355fcf461727fb74c1bb16f977ed6f2ce8`; expanded commit and deploy verification are being refreshed. Resolve the actual PR head before resuming.
- Main/live remains `5b228c773f44c7e2482270673f8df5c2b906ac08`, production deploy `6ac665a88058380008ef3eb6`. PR #5's accountability content remains included; no merge has occurred.
- Navigation: eight categories, six atlas groups, 127 searchable destinations, 177 route/alias records. Current ancestors reveal on direct deep-page landings. Desktop pin, phone drawer and compact alternative share the hierarchy.
- Figures: original reviewed F00/F04/F36/F39 preserved; all other 37 recreated as original SVGs, including independent replacements for the 16 BioRender drafts. All 41 have a topic page, source links, text explanation, WebP/PNG, enlargement and menu/search path. The five previously empty source lists have supporting references. Corrections and intentional simplifications are recorded. No original ZIP modified or proprietary artwork copied.
- Scientific limits: scoped AI-assisted source/presentation review, not independent expert validation. Some primary studies were available as abstracts/records rather than full text; curated Reactome event summaries and official product/reference text were checked. General physiology, group association and individual clinical claims remain distinct. User release approval is pending.
- Relatable content: nine original meme images; four useful explanatory images. Selected images now sit alongside related article sections. There is no video/autoplay/provider work in this batch.
- Local checks: all 41 figure-page checks and 37 rebuilt-SVG geometry checks passed; all 13 meme/guide images pass geometry/loading checks; 13 navigation journeys passed; guide validates 49 pages, 139 claims, 104 sources, 80 links. Final article placement is idempotent. Refreshed hosted checks remain in progress for this expanded build.
- Actual Android/TalkBack and tablet-with-mouse testing remain user review; simulated Chromium checks do not stand in for those devices.
- ScienceDaily lead remains pending retrieval in the genetics discovery inbox. No title or paper substituted; accepted genetics engine and queue unaffected.
- Timing: publish the reviewed, approved candidate before **15:00 Europe/London** on its release day. If that window is missed, carry the candidate to the next day and verify it before publishing. Website-announcement emails follow a verified live deployment and separately authorised exact drafts. Priority case replies can be reviewed independently of website release.
- Next exact action: complete expanded hosted verification, obtain phone/tablet review, then S7 authorised merge/live confirmation. S8 release outreach remains held. No production push or email send scheduled yet.

## Where the previous chat stopped

The “Prescription Accountability Pack” chat progressed from the accountability carousel to scientific diagrams, website navigation, progressive disclosure, media and future product ideas. Retrieved continuity confirms that the immediate next step was navigation and interaction prototypes. Ryan Swain outreach follows the website update; the existing draft was held. Drive recovery and the phone desktop concept remain separate projects.

The navigation v2 ZIP is the design brief. The atlas ZIP supplies the figure files and metadata that the earlier brief said were missing. Keep both originals unchanged. The atlas's integration instructions are proposed work, not evidence of completed publication or a replacement for scientific review.

### Original ZIP intake verification — historical, before implementation

| Item | Evidence / status |
|---|---|
| Navigation pack | Read its handoff, status note, four main reports and two design/recovery addenda. |
| Archive integrity | Both ZIPs pass their internal CRC checks. |
| Figure inventory | 41 distinct manifest entries, F00–F40; every referenced primary web image exists inside the ZIP. |
| Producer status | 32 `yes`, eight `after-fix`, one `review-first`. These labels are not independent approval. |
| Provenance | 25 coded SVG figures and 16 BioRender figures, as declared in the manifest. Rights remain to be checked. |
| Source gaps | F21, F26, F27, F28 and F30 have empty source lists in the figure manifest. Other source lists still need verification. |
| Accessibility | Short alt text and captions supplied; many alt descriptions are generic and need meaningful long descriptions. Full visual/accessibility QA is pending. |
| Accountability assets | A separate eight-card set described in the GitHub status note; not the 41-figure atlas. |
| Current live state | Not verified in this pass. Historical branch/deployment notes must be refreshed in S1. |

Historical snapshot only: the pack records repository `mattbayliss99-eng/mjb-adhd`, main commit `5b228c773f44c7e2482270673f8df5c2b906ac08`, and branch `content/accountability-prescription-2026-10-12` one commit ahead with 68 changed/added files. Do not treat those observations as current or infer deployment from a push.

## Stage order

| Stage | Purpose | Completion evidence | Status |
|---|---|---|---|
| S0 | Recover context and establish this plan | Packs read; inventory and gaps recorded; S0.1 navigation research and priority refinement complete | COMPLETE |
| S1 | Establish current repository, routes and live deployment | Main/live and accountability refs checked; baseline saved | COMPLETE |
| S2 | Navigation and disclosure candidates | Sidebar and compact alternatives built/tested; human choice remains open | READY FOR REVIEW |
| S3 | Implement navigation candidate on a working branch | Shared hierarchy, site/guide integration and 13 browser journeys | READY FOR REVIEW |
| S4 | Review and correct atlas figures | Four preserved pilots plus 37 original scoped replacements; sources and limits recorded | COMPLETE FOR STAGING — 41/41 |
| S5 | Integrate reviewed figures and useful media | 41 diagram pages, nine memes, four practical guides, section-level placement | EXPANDED CANDIDATE STAGED |
| S6 | Verify the combined website update | Local browser/source/link checks passed; physical device review remains | REVIEW CANDIDATE |
| S7 | Publish the approved release and verify it | Exact deployed revision, permanent URLs, release notes and rollback record | HELD FOR RELEASE APPROVAL |
| S8 | Refresh Ryan Swain outreach after release | Verified links and final reviewed draft; send receipt only if authorised | HELD UNTIL S7 |

S3 and S4 are independent after S1/S2 establish the destination structure. Work sequentially by default; neither requires finishing the entire other stage. S5 requires the selected figure batch to pass S4. A navigation release may finish S6/S7 while unresolved figures remain held for a later batch.

## S1 — establish the real baseline

**S1.1:** Confirm access to the repository and Netlify, then read main, the accountability branch, relevant open work and production deployment metadata. Record retrieval time, branch names, commit hashes and deploy ID. If a connector is unavailable, record precisely what cannot be verified rather than guessing.

**S1.2:** Inventory routes and existing features across the main site, interactive guide and static guide pages. Inspect `site/js/app.js`, `site/js/interact.js`, `site/js/registry.js`, `guidebook/src/shell.html`, `guidebook/src/guide.js` and `guidebook/src/guide.css`, following current code where paths have changed. Record build commands and existing checks from the repository.

**S1.3:** Compare staged and live accountability changes. Check representative live content against the actual revision. Map atlas target URLs to real pages; hash routes need router-aware checks, not just an HTTP 200 from the guide shell.

**Done:** One dated baseline identifies what is live, staged, absent or uncertain, with a route map and preserved feature list. Save the plan and audit in the project working branch/content queue when repository access is established. Keep the accepted genetics-engine runners and milestone work outside this website task.

## S2 — navigation and interaction prototypes

**S2.1:** Map each real page to one primary navigation parent and retain cross-links for scientific relationships. Use clear public labels, stable route IDs and existing URLs. Limit the main tree to roughly three levels; deeper material remains available through related links, local contents and the index.

Starting hierarchy from the v2 addendum:

- Start here
- ADHD & daily life
- Brain & genetics
- Neurological symptoms
- Medication & treatment
- Getting care
- Rights & accountability
- Evidence & resources

About, contact and corrections remain readily accessible global links. Final wording follows the real route inventory; this is a proposal, not a new authoritative sitemap.

**S2.2:** Produce two compact previews using the same content: A, expandable left drawer with an optional pinned desktop rail; B, compact top category dropdown plus location breadcrumbs. Both use the same disclosure hierarchy. Include the familiar three-line Navigation control, active page, expanded ancestors, breadcrumbs, search and a clear return to section. Category activation reveals children; an explicit Section overview link performs navigation. Initial current-page ancestors are revealed for orientation.

**S2.3:** Show three useful within-page disclosures: mechanism, supporting evidence and deeper detail. Essential explanations and next actions stay visible. Preserve focus and reading position; provide meaningful text alternatives for diagrams. Compare touch, keyboard and mouse behaviour before choosing the layout.

**Done:** Clickable previews, a page-to-parent map and a recorded design choice. This is the next user-facing review point after baseline verification. Implement the selected direction after that review.

## S3 — staged navigation implementation

**S3.1:** Add one shared hierarchy register or generator for site and guidebook in an isolated working branch. Stage supporting content under `content-queue/next-upload-batch`; retain established paths and originals.

**S3.2:** Integrate the drawer and selected disclosure behaviour with current routing. Preserve Ink, Terminal and other themes, reading-depth controls, search/page finder, graph atlas, Your path, sources, static reading and print. Swipe is optional; all operations need visible touch and keyboard controls.

**S3.3:** Check active state through direct links and back/forward, focus restoration, scroll preservation, narrow screens, zoom and reduced motion. Keep a straightforward disable/rollback path during staging.

**Done:** A reviewable branch and preview with the selected navigation working on ordinary pages and guide routes. Record exact changed files and checks performed.

## S4 — scientific visual review, in bounded batches

Suggested runs: **S4.1 F00–F09; S4.2 F10–F19; S4.3 F20–F29; S4.4 F30–F40.** Do not mark a whole batch approved because a contact sheet looks good.

For every figure, retain the original ID and filename and record:

- Scientific claims and arrows checked against the cited primary evidence, including compartments, direction, cell type and uncertainty. Separate normal biology, ADHD evidence, hypotheses and treatment mechanisms.
- Source completeness and date, corrections or conflicting findings, and what remains unverified.
- Provenance, publication rights and required credit. Verify current BioRender terms and the applicable account/export rights at this stage.
- Visual legibility, label collisions, contrast, theme fit and phone enlargement.
- Specific alt text, a meaningful text explanation, full caption and preserved scientific qualifiers.
- A dated outcome: approved for staging, correction needed or held, with the reason and replacement version where applicable.

### Original producer correction list — resolved by scoped replacements in version 4

| Figure | Producer's reported issue to resolve and verify |
|---|---|
| F01 | Replace a misleading “reaction” relationship label. |
| F03 | Remove the implication that a neuronal vesicle supplies an adrenal cell. |
| F06 | Review and correct the COMT compartment representation. |
| F09 | Remove projection arrowheads ending on caption text. |
| F11 | Rename process categories currently called circuit modules. |
| F14 | Review receptor interaction labels. |
| F16 | Correct SERT placement and duplicate receptor label. |
| F19 | Replace unverified chemical structures with checked representations. |
| F40 | Review the added amphetamine/dexamfetamine mechanisms and sources. |

These were reported intake issues. Version 4 supplies scoped original replacements and sources for F21, F26, F27, F28 and F30. The current review register supersedes these old holds. Producer `yes` labels never constituted independent approval.

**Done per batch:** A complete review ledger and approved subset. Preserve superseded drafts outside public asset output. When direct BioRender editing/export is unavailable, record the exact required correction and keep the figure held.

## S5 — reusable library and page placement

**S5.1:** Extend the supplied manifest with separate review and publication states, version/digest, rights decision, text description and actual placement. Preserve original metadata and filenames. Keep private editor URLs in working records; generate public metadata without them. Exclude held and superseded figures from the deployed build rather than merely hiding them with CSS.

**S5.2:** Integrate an approved small pilot, then remaining approved batches. Verify placements against the current route map: ADHD overview, compounds/treatment, guide Evidence, neurological field guide, Parkinson's, quick starts and Understand. Keep general scientific figures separate from personal case/accountability content.

**S5.3:** Add a process-atlas hub if the site's existing structure supports it. Embed selected figures where they explain the text; retain the full reusable set in the asset library. Provide captions, credits, evidence labels, enlargement, text explanations and stable links. Extend existing articles before introducing duplicate pages.

**S5.4:** Add the small generic meme/image/video pilot specified in the priority addendum. Build external click-to-load support only for selected material that needs it; retain a normal source link and readable summary. Check that media conveys meaning without dominating the article.

**Done:** Every approved figure has a validated destination and reuse record; pilot media has accessible equivalents and a reuse record. Every withheld figure has a recorded reason. Phone users can read or enlarge figures and return to the same place.

## S6 — combined verification and release review

Use the repository's relevant build and regression checks. Check visible routes, hash navigation, sources, sitemap/indexing, broken links and console errors. Verify themes, search, reading depth, atlas/path tools, static fallback, print, back/forward, reduced motion and figure loading.

Run representative journeys: find ADHD information; find help without a prescriber; find formulations; follow a mechanism cross-link; enlarge a figure; find its source; return to a section. Test keyboard and phone touch. Record actual Android/TalkBack and tablet-with-mouse feedback separately from simulated browser checks; do not claim unperformed device testing.

**Done:** One concrete release candidate with exact revision, approved asset subset, preview links, known limitations and rollback instructions. Review publication against existing session authorisation; obtain approval for the concrete release if it is still required. No implementation or release permission is requested in this planning pass.

## S7 — deployment and live confirmation

Publish only the authorised candidate. Confirm Netlify's deployed revision and representative live routes/content. Check caching and navigation on the live site. Record release time, permanent URLs and a concise changelog/social draft. A successful push or build alone does not close this stage.

**Done:** Live evidence matches the approved release and the plan records the next outstanding batch.

## S8 — Ryan Swain follow-up

The pack records one unsent draft titled “URGENT — DO NOT SEND UNTIL WEBSITE UPDATE — Ryan Swain / You, Me & ADHD”, with a screenshot attached. That is a historical record; read the actual current draft before editing it or creating another.

After S7, refresh the release date, short change summary and two verified links: a science entry point and a treatment-continuity/accountability page. Remove draft-only hold markers before any send. Recheck recipient, attachment, tone and duplicate/sent status. Keep unrelated private observations out of the correspondence. Preserve existing explicit send authorisation where applicable; otherwise hand back the finished draft for approval. Never treat completion of a website release alone as send permission.

**Done:** Final draft saved, or authorised send independently recorded with message/time evidence.

## Later lanes — do not block the first website release

| Lane | First bounded task | Dependency / boundary |
|---|---|---|
| M1 — expanded external-media support | Extend the S5.4 pilot to selected providers as needed | Generic relatable media is already in S5.4; extra provider support must not block navigation. Verify current requirements; no third-party load on page visit by default. |
| E1 — HTML email | One visual correspondence example with complete plain-text fallback | Test actual client rendering; this does not authorise a send. |
| D1 — Drive recovery | Read-only inventory, then a human START HERE page and AI recovery manifest proposal | Preserve evidence originals and stable IDs; no bulk migration. Pack reports a misleadingly named private folder with public-link access, so permissions need fresh verification. |
| A1 — Pocket Desktop | Separate small PWA prototype for movable panels and zoom/pan | Verify current Android limits later; do not promise control of arbitrary third-party apps or Windows execution. |

Private health logs and photos remain outside public website assets and working releases. The older clinical/accountability attachments are available for later source-specific work; this planning pass does not claim to have reviewed them.

## Checkpoint protocol — update after every bounded run

Keep one authoritative current record. A stage may be PLANNED, IN PROGRESS, COMPLETE, BLOCKED or HELD; publication and communication state are recorded separately. Never use “done” to mean merely drafted, pushed or passing.

```text
Plan version/date:
Current stage/substage:
Status:
Completed this run:
Evidence/output paths or stable IDs:
Repository branch and exact revision, if used:
Checks actually run and results:
Open issue / decision / dependency:
Publication state and authorisation reference:
Communication state and authorisation reference:
Next exact action:
```

Resume by reading this checkpoint and the relevant stage only. Refresh mutable repository/deployment/draft state where necessary; do not repeat completed asset intake or restart the whole project.

### Earlier intake checkpoint — version 2 (superseded)

- **Stage:** S0 and S0.1 COMPLETE; S1 remains NEXT.
- **Completed:** Relevant prior-chat context retrieved; both ZIPs read; archive integrity and primary asset existence checked; manifest counts, known fixes and source gaps recorded; staged plan saved; primary navigation guidance researched; regular-site menu/search/orientation prioritised; relatable media promoted to S5.4; proposed participant handoffs recorded.
- **Repository/deployment/draft checks:** Not performed in this pass.
- **Implementation/publication/sends:** None.
- **Next exact action:** S1.1 — verify current repository refs and Netlify production deployment, read-only, then produce the route/feature baseline.

## Source identity

| Supplied archive | SHA-256 |
|---|---|
| MJB_Navigation_Science_Visuals_Android_Design_Work_Pack_13Oct2026_v2.zip | `50b3817f9eefda1672004749e79fb27fca8f82a3d73a4c02acbc569f76d45a46` |
| MJB_ADHD_Process_Atlas_Handoff.zip | `b231f2e6fadaf95ba573953854b82a8b2fd87e4902e1b1684fe445573b5168e5` |

Primary records: navigation `Work_Mode_Implementation_Handoff_v2.md`, `GitHub_Staged_vs_Live_Status_13Oct2026.md`, the reports/addenda; atlas `README_FOR_GPT.md`, `LICENSING_AND_ATTRIBUTION.md`, `data/atlas-manifest.json` and `data/page-map.json`. Scientific, Android and licensing leads remain for later verification. Navigation and visual-accessibility sources R1–R6 were freshly checked in S0.1; this does not complete the current repository/live baseline audit.
