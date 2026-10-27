---
title: "Executive-function design: context breadcrumbs and living artifacts"
date: 2026-10-27
status: review-only-concept
privacy: general-design-only
publication: not-authorised
placement: "Extend guidebook/content/pages/02-memory-time.md; optional implementation under site support tools only after review"
---

# Context continuity as assistive technology

**Editorial status:** Draft for owner review. This public-repository note contains general design principles only. No private screenshots, patient records, medication regimen, account histories, or personal identity data. No live-site edits or deployment are authorised.

## Reader-facing article proposal

### Don't make remembering the task another task

Digital productivity software often records *what* someone intends to do, then assumes they will revisit the software, identify the relevant entry, remember its meaning and initiate the action. Those are separate demands. ADHD can affect working-memory goal maintenance, temporal awareness and task initiation, but any single user's difficulty has multiple possible causes.

A more useful design makes an **event or completed action the anchor**, preserves context, and supplies an actionable next step only when needed. A good system doesn't ask the person to carry the system's state in their head.

For example, an authorised, clinician-agreed medication reminder schedule can begin when a user confirms a prescribed dose has been taken. Subsequent reminders follow the specified dosing plan. **Acknowledging an alarm, snoozing it and confirming medication taken are distinct events.** A reminder is not evidence of ingestion; the system must not infer dosing or autonomously reschedule medication outside agreed parameters. Notifications need understandable failure states and must never be treated as a medical-grade guarantee.

The same design works outside medication: start a household task, split progress into visible stages, preserve deliberate staging areas rather than categorising every unfinished pile as failure, and display a tiny next action rather than a giant task list. Optional humour and visual rewards can increase willingness to re-engage, but gamification must remain optional and must not obscure meaningful progress.

### The lost-post problem

A reader encounters a useful social-media post, switches to an AI to formulate a reply, returns and discovers that the feed has refreshed. An ordinary browser history entry may show the website, but not the particular post, comment, draft or scroll location. Recovery becomes a memory-and-search task.

A **context breadcrumb** is an explicit, user-controlled save that records as available:
- original URL or platform-native permalink, with tracking query parameters removed where safe;
- platform and content type;
- title, creator/handle and source timestamp, marked as unverified if extracted heuristically;
- save time and user label ("reply later", "research", "share");
- optionally selected text, screenshot and local draft, with separate consent and sensitivity controls;
- exact content identifier and viewport anchor when legitimately available.

Metadata may be incomplete. Neither a screenshot alone nor Google's identity sign-in grants access to the original social post or private platform data. Removed or restricted posts might remain inaccessible. Do not imply universal automatic capture.

Offer "Recents" across explicitly saved items, organised by type, recency and unfinished action. Export / delete should be straightforward. The default should be **no surveillance of everything viewed**.

### Living micro-artifacts from existing MJB knowledge

A long article can yield a social visual summary that opens a lightweight, accessible, interactive mini-explainer. Each mini-explainer should link to the canonical article, show evidence strength and uncertainty, and not give unqualified clinical treatment advice.

One article becomes:
1. authoritative accessible original page;
2. vertical social image/card with legible highlights, consistent branding and a short URL/QR code;
3. preview metadata and a shareable URL;
4. optional interactive causal-chain or checklist component, linked back to the article.

These are **multiple presentations of one source** rather than 200 hand-maintained copies. Regenerate assets when the source changes. Record version and update date. Do not allow visually persuasive cards to overstate emerging hypotheses.

The first pilot should extend existing **Memory, time and awareness** content at `guidebook/content/pages/02-memory-time.md`, which already distinguishes lost intention, elapsed-time awareness, automatic action and missed registration. Link to appointment preparation and treatment continuity where appropriate; don't create another page before checking overlap.

## Architecture option for a separate reusable tool

**Principle:** state is stored explicitly, not inferred from chat history or dependent on the original feed remaining alive.

```
Source/content ID (canonical article or external permalink)
    -> Capture/structured event with provenance and permissions
    -> Local-first indexed store, user-owned and exportable
    -> Optional account synchronisation
    -> Multi-view renderers: recent items, social card, mini-page, watch/phone actions
```

* Share capture: Start with Android's ordinary share menu for links and text; an installed PWA can register as a share target where supported, with browser and platform compatibility checks. A browser extension may later capture post IDs, selected text and scroll anchors where site permissions permit. No credential scraping, cross-origin bypasses or bulk collection by default.
* Optional identity: "Sign in with Google" supplies authentication using minimal `openid email profile` scopes. It **does not** itself import Google, Facebook, X or other activity histories; separate consent and platform permissions are needed. Keep read-only/anonymous use as default in line with the existing MJB no-login design.
* Local durability: Save scroll anchors, selected content ID and drafts on each meaningful change. Restore from session persistence after reload or browser discard. Page-lifecycle-aware polling can refresh data when visible. A perpetual background ping is neither necessary nor reliable; browsers suspend background work.
* Privacy: Mark saved data private by default. Screenshots and pasted responses may contain unrelated personal information. Encrypt at rest where possible, avoid analytics by default, support expiration/export/delete and never surface private breadcrumbs in public URLs.
* Link permanence: Generate short URLs and/or QR overlays for **original MJB cards** to retain a return path in screenshots. Don't assume QR overlays can be attached to third-party posts inside native platforms, and don't misattribute authorship.
* Source truth: A screenshot is a captured observation at a particular time, not proof the original item remains available or unchanged.

## Three implementation stages and value tests

**Stage A — high value, low platform dependence:** build a template generator against one existing MJB page. Output a social card + one shareable interactive explainer with proper source links, revision field, accessibility checks and a generated QR/short-link placement. Publish only after explicit approval. Test whether one canonical edit can update all derivatives with minimal manual work.

**Stage B — personal breadcrumb prototype:** Android-share-to-bookmark + "Recents" list + one-click copy link and optional note. Begin local-first, no account. Test under a real interruption: save an item, switch to a different app, return and recover the exact item plus draft. Measure seconds and actions, not engagement count.

**Stage C — optional continuity and cross-device actions:** Google sign-in with narrowly scoped auth, synced bookmarks and explicit device action routing, then carefully test alarm delivery, snooze, action confirmation and recovery. Keep medical safety boundaries separate from ordinary gamified household tasks.

## Decision metric

Prioritise **time and cognitive effort returned to the user**, not visits, streaks, or interaction totals.

`Net practical value = recovery/re-entry effort avoided + repeat-work avoided - capture friction - upkeep - risk`.

Track optional, privacy-preserving usability tests: time to recover a lost item, number of taps, success after app switches, ability to locate an unfinished draft, and accessibility on a phone. Use user-reported effort rather than assuming every minute saved is psychologically equivalent.

## Evidence / implementation references (verified 27 Oct 2026)

- MJB existing page: `guidebook/content/pages/02-memory-time.md` (local repository), drafted and reviewed October 2026. Follow its evidence and uncertainty conventions before publication.
- Meta's Activity Log exists but is not a general history of every post viewed: https://about.fb.com/news/video/activity-log-tool/ ; https://engineering.fb.com/2025/02/04/security/data-logs-the-latest-evolution-in-metas-access-tools/
- Native Web Share API (share out): https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
- PWA Web Share Target (receive shares; limited browser support): https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target
- OpenID Connect and minimal Google authentication scopes: https://developers.google.com/identity/oauth2/web/guides/how-user-authz-works
- Page freezing/discarding and restoration: https://developer.chrome.com/docs/web-platform/page-lifecycle-api
- Canonicalisation when generating alternative article presentations: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

## Review and release gates

1. Author approves content, visuals and public claims.
2. Verify that the extension does not duplicate the existing `02-memory-time.md` explanation.
3. Test small-screen contrast, keyboard accessibility, motion reduction and non-gamified equivalent.
4. Do not add login, trackers, private data persistence or medication workflows to the public site as an incidental feature.
5. Prepare assets on a feature branch / Deploy Preview; inspect, then request explicit publication approval.


## Addendum 27 Oct 2026 — Universal share resolution and smart preview layer

**Problem observed:** The same social post or Google Drive item looks different depending on whether it arrives via app-native sharing, a mobile deep link, a browser copy action or a messaging app. An opaque folder/file-shaped link does not establish file type, location, safety, trustworthiness or what the reader can do next. The sender's accidental share route should not determine the receiver's information quality.

**Principle:** Resolve the underlying object first, then render the best lawful, accessible representation supported by the destination and the user's permissions. Preserve original provenance and a one-tap escape to the source. Do not silently open, execute, download or log external content to manufacture a richer card.

### Composite social product inspiration — separate strengths from avoidable friction

- Instagram: good content discovery, follow graph, visual launchpad and direct messages; weak when captions, discussion threading and off-app previews fail to communicate context. Do not require app installation for essential MJB information.
- YouTube: useful playback history, playlists and structured video discovery; extend the *find/recover/organise* idea to saved posts, comments, documents and partial drafts.
- Google Drive: powerful file/folder organization but the shared link often lacks immediate recipient-facing semantics; a viewer should know **folder vs Google Doc vs PDF vs ZIP**, whether accessible, and—only if authorised—the parent folder and a shallow contents overview.
- ChatGPT-like interactive UI: expandable details, visible progress and in-place controls reduce navigation overhead. Keep plain-text and keyboard-accessible equivalents.

### Adapter pipeline

`Share input (Android chooser / pasted URL / desktop context menu) -> safe input parsing -> platform adapter / link classification -> stable content ID and verified original URL -> authorised metadata -> capability/permission evaluation -> lightweight preview -> expandable mini-view -> explicit open/save/copy/reply options -> private breadcrumb`.

Distinct URL variants for the same Instagram post should converge on a stable identity when determinable. **Do not** presume that universal canonical rewriting is always safe: shortlinks and tracking URLs can contain access tokens, signatures or intended parameters. Preserve the original link as a fallback and don't strip tokens required to open a shared resource. App deep links and public web permalinks are not always interchangeable, and private posts cannot be made embeddable by clever URL transforms.

Use a confidence/provenance label for each extracted property: verified provider API / source-declared Open Graph / heuristic / user supplied / unavailable. Social embeds require platform-compatible permissions and usage. An Instagram oEmbed endpoint may help render supported public posts but must not be treated as permission to scrape, persist or analyse third-party content. Use a platform-approved embed only where authorised and functional; otherwise show a safe preview with an explicit original-link action.

### Preview surface: compact + intentional expansion

**Compact view:** source platform and recognizable icon, verified title/label, content type, accessible image (where permitted), short relevant description, original domain and a clearly distinguishable primary action. Indicate uncertain or unavailable metadata without manufacturing a thumbnail, file content or author.

**Expanded mini-view, permission dependent:** verified creator/uploader, date updated, file type and size, folder path and up-to-five permitted children, video length/chapter snippet, social media format, link expiry and ownership/access state where available, safe file handling instructions, and a single-tap save-to-breadcrumb action. Keep parent folder ancestry private when recipient does not have access.

**Google Drive adapter:** use Drive's `files.get` fields such as `name,mimeType,description,parents,thumbnailLink,webViewLink,size,modifiedTime`; with authorised `files.list` show a small directory preview. The `thumbnailLink` can expire and may require credentials. A ZIP archive is not a Google Drive folder: label it as a downloadable archive and do not assume it can be inspected remotely.

**Site-owned MJB links:** Open Graph title/image/description/type and article canonical URL; rich `summary` / `interactive` / `references` view choices; clear evidence grading and source dates. A QR overlay on MJB-designed imagery gives screenshots a recoverable breadcrumb; don't alter third-party imagery to imply MJB authorship.

### Security, privacy and accessibility

- Never auto-download or execute a linked file because it has a trusted-looking thumbnail. Display source domain, redirects and available access information, and never represent metadata as independent security verification.
- For public URL unfurling, prevent server-side request forgery (SSRF), unbounded redirects, oversized responses, private IP/network access and deceptive hostnames (OWASP guidelines). Treat untrusted descriptions as text, never executable markup.
- Permission gates: no attempt to infer private posts, folder names, owners or contents unavailable to the recipient. Personal link history remains local/private unless the user opts in to sync.
- Include screen reader names, image alt text, compact density control, keyboard focus, and preview on low-data mode. The thumbnail is supplementary; source and type remain readable without it.
- Retain an immediate "open original" choice; do not force a platform-specific in-app browser or reroute every share through an intermediary.

### Pilot test

Test four inputs: one public Instagram post, a public Drive folder, a private Drive folder shared with a test account, and a direct ZIP. Compare the share-sheet link and pasted browser link: same stable identity and descriptive compact card; expanded details only with permission; fallback to original if unsupported; no app prerequisite for the recipient. Record time to identify and retrieve the object and count avoidable interactions.

**Verified implementation pointers:** [Google Drive file metadata](https://developers.google.com/workspace/drive/api/guides/file-metadata); [Drive v3 files fields](https://developers.google.com/workspace/drive/api/reference/rest/v3/files); [Open Graph](https://ogp.me/); [OWASP SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html); [Meta Instagram oEmbed documentation](https://developers.facebook.com/docs/instagram-platform/oembed) (recheck Meta policy/app review before implementation).
