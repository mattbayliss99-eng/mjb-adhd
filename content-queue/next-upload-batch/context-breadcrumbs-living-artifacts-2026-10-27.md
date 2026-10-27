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
