# MJB social-first website + Android companion — continuation execution order
**Date:** 2 November 2026  
**State:** staged coordination; NOT a merge, deployment, delegated tool invocation, published post, or app release.  
**Owner:** MJB  
**Existing source briefs:** `GROK_IMPLEMENTATION_BRIEF_v1.md` and `CLAUDE_AUDIT_CHECKLIST_v1.md` in this folder. These remain authoritative; this is a SHORT operational addendum, not a duplicate specification.

## Recovery checkpoint / don't repeat work
1. Live MJB site: https://mjb-adhd.org.uk/ ; production `main` is not the social-first candidate.
2. Website visual-post PR #8: https://github.com/mattbayliss99-eng/mjb-adhd/pull/8 ; branch `feature/visual-posts-codex-preview`. Check actual current HEAD, do not assume the recorded 2-Nov baseline still matches. Source-bank candidate: `content/posts/posts.json`, IDs `MJB-P000001` / `002` / `003`. Its native static routes, no-JS Prev/Next, reading controls, narration and source-return behaviour are established starting points, not to be rebuilt.
3. Separate questionnaire PR #7 stays separately reviewed; do not integrate opportunistically.
4. Grok's latest export fixes are in Drive `social-export-cli` within https://drive.google.com/drive/folders/1N6ZhSdaRDUSaB8QzBOfs-hIXW_eg-Lf1. Three representative export folders include 1:1, 4:5, 16:9, 9:16 SVGs, text sidecars and manifests. Grok reports XML escaping, fuller provenance, dry-run-only schedule and block/review flags. These are reported implementation changes, **not yet independently visually approved**. All three remain `blocked` for draft status and unresolved image rights. Do not use in live publishing or queue them.
5. Existing Grok design ZIPs are references, not the current runnable code base. Current website checkpoint: `docs/posts-preview/00_CURRENT_STATE.md` on PR #8; website-build Drive folder https://drive.google.com/drive/folders/1ETzHWo35idPDhaEqxVCtbPc-PttaPzVx.

## Deliverable A — Grok's FIRST bounded task
Build a preview of MJB's social-style front door on an **isolated branch/worktree based on PR #8's current HEAD**. Start by inventorying actual SHA, files, unchanged routes, regression commands, source of brand logo and accessible-theme implementation.
- Provide **three credible 390px/desktop visual options** based on exactly the three canonical editorial posts, not invented scientific claims: 
  **A — X-like vertical feed** (compact text, article/source links);
  **B — Instagram-like visual cards** (large hero, optional finite swipe, explicit controls);
  **C — hybrid** (vertical Home + finite topic shelves/sequences + prominent source/article view). 
  Include pros/cons, accessibility cost, and high-contrast dark/gold plus saved user-theme override. Recommend one from actual usability results, not personal preference alone.
- Keep mobile UI predictable: four destinations **Home / Explore / Saved / Tools**; tap a post, open its full article/original source, return to exact place. Desktop can use contextual side rail; mobile uses bottom navigation and clear headings. Preserve permanent URLs and ordinary browser Back.
- Distinguish swipe between posts from normal vertical scroll, browser-back gesture and text selection. Swipe remains OFF/opt-in for initial pilot; buttons, keyboard and screen readers always work.
- Implement useful low-load details before animations: reliable saved/resume behaviour, article return, search by topic/evidence, post-count/progress, optional compact/large media view, shareable deep links and full captions. Never falsely infer a post has been read.
- Use the *actual* MJB logo as source for gold tokens; first-visit default dark, but never overwrite existing user preferences. Green/amber/red describe action state/urgency only with words+icons; evidence-level, hypothesis status and editorial approval have separate written labels. Warning triangle ⚠️ only accompanies an explicit warning. Avoid neon as general typography, false certainty, or a green badge implying medical efficacy.
- Produce screenshots at 320px, 390px, 200% text and desktop; runnable preview; original code/patch; source/asset manifest; actual TEST/PASS/FAIL/NOT_RUN log. Preserve working reading/bionic, contrast presets, narration, guidebook and no-JS routes. Do not merge/deploy or publish social posts.

## Deliverable B — native companion feasibility spike (separate from website UI patch)
Recommend **Kotlin/Jetpack Compose** for native utilities; share public content schema/assets instead of a second editorial bank. PWA/TWA can be evaluated for content delivery, but a web wrapper is not the alarm engine.
- Prove a **single labelled local alarm** on a real device first (screen off, app process terminated, correct time, notification/audio/channel behaviour). Then test reboot, permission denied, DND/muted volume, battery saver, time-zone change, DST, duplicate/cancel. Mark untested scenarios `NOT_RUN`. No claims of guaranteed waking.
- Resolve Play permission eligibility: `USE_EXACT_ALARM` is restricted to qualifying core alarm/calendar applications; otherwise test `SCHEDULE_EXACT_ALARM` grant flow. Request only justified permissions and use OS clock intents as a *clearly limited* fallback.
- Proposed alarm UX: **Now / Next** board and optional coloured groups (Medication, Appointments, Everyday, Sleep, entirely editable). Quickly duplicate/schedule 2–5 reminders, attach distinct names/colours/icons/ringtones, preview actual loudness, pause a group, see next occurrence. Separate `dismissed`, `snoozed`, `completed by user`; never treat dismissing as proof medication was taken.
- Journal/notes: one-tap text or visible voice recording, local-only by default, auto-save and search, opt-in export/deletion, no hidden server sync or public publishing. Handle mic refusal gracefully. Don't use real personal health data in screenshots or tests.
- Later, if feasibility supports it: Android widgets, quick-setting tile, app shortcuts, carefully tested Assistant intents, user-controlled reminders from voice input, and opt-in AI. No cloud signup required.
- **Music feature decision:** ordinary OS ringtones or user-provided licensed local audio for alarms. Spotify's own Developer Compliance Tips prohibit Spotify audio clips in alarm/ringtone integrations and Spotify voice-controlled experiences. YouTube APIs prohibit extracting audio and background player integration. Optional *user-initiated* open-playlist shortcuts can be studied separately; never let network music failure silence an alarm.
- Check Play Store registration, the account-specific production/testing pathway, app quality, privacy disclosures, data safety and branding. For new personal developer accounts created since Nov 13 2023, Google's published gate is at least 12 continuously opted-in closed testers for 14 days before applying for production; do not promise approval.
- Deliver a minimal runnable native prototype only if policy and real-device feasibility can be tested; otherwise produce exact test harness and impediment register. Avoid claiming a production-ready APK.

## Deliverable C — Claude independent gate
After Grok hands back the **actual** patch and export examples, Claude should follow `CLAUDE_AUDIT_CHECKLIST_v1.md` and issue a severity-ranked review with exact filename/line, observed reproduction steps, screenshot evidence, recommended minimum fix, and PASS/FAIL/NOT_RUN. Specifically challenge:
1. Did Grok duplicate or corrupt PR #8 generators/content/IDs, or change public clinical claims?
2. Are the rendered SVG source cues/rights lines actually legible? Check residual abbreviated/truncated spans even where full-text sidecars exist; no qualification may be silently concealed. Confirm hero composites exist rather than claiming overlays alone are complete artwork.
3. Navigation, touch and system Back; 200% zoom, focus, screen readers, colour-blind/monochrome, no-image/offline; no accidental publishing.
4. Native alarm precision/permissions/OS restrictions based on real test output, not merely a plausible code path.
5. No microphone/journal leakage, tracking, private medical examples, licensing gaps, unsupported medical recommendations or misleading evidence colour semantics.
Claude must not merge, deploy or publish. It should not mark a `review` export as approved.

## Deliverable D — GPT final owner-review packet
After Claude response: reconcile issues against Grok's reproducible patch, rerun independent targeted checks, record known failures and proposed fixes, compare visual choices, and present **three owner choices**: (1) accept web preview for merging, (2) request concrete fixes, (3) defer UI while advancing native-alarm spike. Never call it released until actual owner approval and a verified production deployment.
For Android, keep a separate Play-readiness gate; a pretty website preview does not constitute a tested/remotely dependable alarm app.

## Admin and handoff protocol
- Grok: base/head SHA, branch URL, changed files, screenshots, rights manifest, tests, unresolved risk register, links to Drive artifacts; no silent edits to canonical `posts.json`.
- Claude: independently review those exact artifacts, don't review an outdated ZIP; return `CLAUDE_FINDINGS.md` and marked screenshots.
- GPT: review/checkpoint and owner decision; only then schedule a controlled integration. Preserve drafts and original source; no private case data in GitHub or social exports.
- All generated media/overlay exports are **derived** from site-first canonical post records. Social scheduling remains dry-run until explicit channel, rights and approval gates are cleared. Do not enable Buffer writes.
- Reduce workload by bundling one complete evidence-based review packet rather than asking the owner to compare dozens of unlabelled images.

## Primary platform references (verified 2 Nov 2026)
- Android exact alarm guide: https://developer.android.com/develop/background-work/services/alarms
- Android 14 permission behaviour: https://developer.android.com/about/versions/14/changes/schedule-exact-alarms
- Play exact-alarm eligibility: https://support.google.com/googleplay/android-developer/answer/16558241
- Spotify developer compliance: https://developer.spotify.com/compliance-tips
- YouTube API developer policies: https://developers.google.com/youtube/terms/developer-policies
- Play closed testing: https://support.google.com/googleplay/android-developer/answer/14151465
