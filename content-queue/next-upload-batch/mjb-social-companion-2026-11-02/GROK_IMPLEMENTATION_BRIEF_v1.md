# MJB social-first website + Android companion: Grok implementation brief v1
Date: 2026-11-02
Status: PROPOSAL AND STAGED TASK. Not approved for production, not a finished implementation.
Owner priority: free, immediate utility, low setup burden, substantial benefit on a phone.
Website: https://mjb-adhd.org.uk/
Repo: https://github.com/mattbayliss99-eng/mjb-adhd

## 0. Start from actual project state, not a mock reconstruction
Before touching source, read:
- Current 2 Nov checkpoint in Drive: 00_START_HERE_CURRENT_WEBSITE_STATE_2026-11-02.md (website build root https://drive.google.com/drive/folders/1ETzHWo35idPDhaEqxVCtbPc-PttaPzVx).
- Existing PR #8: https://github.com/mattbayliss99-eng/mjb-adhd/pull/8, branch feature/visual-posts-codex-preview. This is the IN-PROGRESS, unmerged social-post implementation. The current three canonical editorial IDs are MJB-P000001 through MJB-P000003.
- Existing draft PR #7: https://github.com/mattbayliss99-eng/mjb-adhd/pull/7 is separate questionnaire work; do not merge it casually.
- CURRENT_WEBSITE_SPEC_v1_1.md and REPO_AND_INPUTS.md in the earlier Grok handoff.
- Shared reading/accessibility/navigation code and docs, existing guidebook, public journal draft boundaries.
- Existing social export tool and notes in Drive. A separate source review noted source cues and overflow issues; verify fixes yourself, not from a status report.

Confirm the actual branch/head SHA, modified files, repo cleanliness, test/build commands and permissions. Preserve the static Netlify site and its public routes. Work on a SEPARATE isolated topic branch/worktree derived from the current PR #8 candidate if implementing a web change; never modify PR #8 branch as a side effect. Deliver a patch with explicit base SHA. Do not merge, deploy, post, collect user data or enable paid services.

## 1. Product thesis and critical division
MJB is a single-publisher, evidence-linked knowledge site with a social app's navigation comfort, NOT a fake multiuser social network. Its companion Android app shares public MJB content but provides native, private daily-use tools.

Public website: browsable, shareable ADHD science, lived experience, treatments, care navigation, accountability and useful tools. No login, no ads, no analytics or third-party tracking required.
Android app: website-like feed plus device-local alarms/routines, voice notes and personal journal. These must keep working without internet, account or a live MJB server.
Shared canonical content: content/posts/posts.json and article anchors form one editorial source of truth, with website, media exports, search metadata and app feed derived from it. No duplicate manually edited factual banks.
Privacy boundary: public journal pieces are deliberate published editorial items; personal diary entries are private and never sync or publish by default.

Success criterion: someone can open MJB, read one useful post, go deeper, return where they were, and set a useful labelled reminder in seconds without creating an account.

## 2. Borrow the strongest interaction patterns without copying platforms
X-like: chronological/curated text-first home feed, compact topic filters, profile identity, short post summaries, stable links, native share; NOT engagement counts, fake likes, addiction optimisations, an algorithmic black box or scraped/copied assets.
Instagram-like: large purposeful image/diagram treatment, image sequences where warranted, mobile swipes and full-screen viewer; the explanation remains real selectable HTML with alt text and readable source link.
Facebook-like: browsable topic communities/shelves, related posts, context and long-form follow-through; not actual membership/groups infrastructure.
Reading app strengths: bookmark, resume last post and scroll offset, clear reading depth, offline saved material, visible provenance, an obvious back-to-article path.

Design the first social home for the SAME three existing PR #8 records, not another invented content bank. Use a deterministic finite feed. Default ordering can be curated with newest/featured labels; no claims about personalization. Visible Previous/Next buttons and post x of n. Optional swipe (on/off switch), with horizontal gesture only when deliberate and without breaking vertical scrolling, selection, browser back, keyboard or screen readers. Consider desktop left topic rail and right contextual references; mobile bottom nav + labelled topic drawer. No forced fullscreen or auto-advance.

Proposed mobile IA:
- HOME: curated posts and featured entry points
- EXPLORE: topics, search, evidence/source filtering
- SAVED: local bookmarks + resume point
- TOOLS: website tools; Android app also provides alarms/routines and personal journal

A single tap/click on any post must expose: topic/depth, evidence class, what is known vs hypothesised, primary source link where applicable, related article and reason for uncertainty. Long scientific content has a genuine read-full-article view and a return-to-post affordance. Never treat a mere page-open as 'completed reading'.

## 3. Visual identity and semantics
Default FIRST-VISIT theme: dark charcoal/near-black with the actual MJB logo's gold accent. Extract the accent from the approved logo asset rather than inventing a loosely similar gold. Use restrained gold for brand/primary action/focus and legible off-white body text. Cards should be edge-to-edge or nearly so on mobile with sensible safe-area padding. Avoid heavy glass effects, noisy shadows, moving gradients and gratuitous neon.

Neon traffic-light colours are available for REAL-WORLD ACTION urgency, and only with labels/icons:
- RED: urgent actionable warning/risk; never a decorative 'weak evidence' code.
- AMBER: caution, uncertainty, review needed or follow-up; identify which meaning in text.
- GREEN: completed task/confirmed operational success, not proof a treatment works.
- General warning triangle and other universally recognised symbols: pair with explicit language, not symbol alone.
Keep evidence strength (human controlled study / observational / animal / cell / hypothesis / personal observation) SEPARATE from practical risk, editorial approval and progress status.

Preserve user's existing colour-vision settings, reading presets, bionic text, narration, font size, spacing and reduced motion. Dark is only the default, never a forced theme. Test WCAG 2.2 AA contrast with actual pixels; non-text UI states must still be clear in grayscale. At 200% zoom long labels wrap, never silently truncate source qualifications.

## 4. Website staged development
W0 Baseline inventory and reproducible PR #8 preview. Confirm three canonical records, actual post sequence, keyboard/reading controls, source-return path, rendering and media exports; enumerate existing open verification gates.
W1 Design alternatives: deliver three concise directions: (A) vertical social feed, (B) horizontally paged cards, (C) hybrid topic shelves + finite sequences. Recommend the hybrid only if field tests support usability. Present screenshots 390px, narrow 320/360px, desktop; dark/gold plus one contrast-safe alternate theme.
W2 Working HTML/CSS/JS proof: one integrated home and a finite three-post path, real bookmark/resume, stable URLs, search/topic landing, source/full-article link, and accessible swipe off by default or opt-in. Preserve existing no-JS routes. Keep data and narrative logic in PR #8 source, not a second rendering system.
W3 Optional PWA on existing static hosting: manifest, proper icons, fast install, app shortcuts, offline cached landing/last saved posts with visible 'offline/stale' indicator and versioned source date. No expectation of reliable alarm scheduling from a PWA. Research whether service worker and cache policy can be added without damaging navigation or forcing stale medical information.
W4 Only after positive testing: expand editorial content by topic batches, review sources individually, then add polished original hero images and social exports. Audit author rights, alt text and diagram accuracy. Keep publication manual.

Check compatibility of Netlify static routing, old canonical paths, existing search, bionic reading, language/voice TTS, print, offline guide and sitemap. Do not replace site architecture with a framework solely for swipe libraries.

## 5. Android companion architecture (separate feasibility + prototype)
Evaluate two options on explicit tradeoffs: (1) Kotlin + Jetpack Compose native utility shell with a verified web/PWA content surface, (2) PWA/TWA for content plus a separately packaged native utility layer if practical. Recommend a native Compose core for alarms/notes where reliability matters; pure WebView/TWA does NOT make background alarms reliable. Avoid promises that a PWA alone handles exact timing. Use Android's built-in intent and AlarmManager APIs with current Play policy.

App MVP has exactly three native pillars:
A. GROUPED ALARMS / ROUTINES
- Default examples: Medication, Appointments, Everyday, Sleep; all user-configurable, not medical advice. Colour, icon, name, ringtone, repeat days, weekday exceptions, time zone, pause and quick-copy. Include one-tap presets and 'duplicate and adjust' for multiple daily alarms.
- A clean 'Today' board: upcoming, active, acknowledged, missed, next occurrence, quick edit. Sort by next occurrence and group.
- Distinguish 'dismissed' from 'completed' (did the activity happen?) and from 'snoozed'. Never infer medication was taken from dismissing a reminder.
- Use OS alarm-clock-grade timing for true alarms; verify USE_EXACT_ALARM eligibility under Play policy or request SCHEDULE_EXACT_ALARM when appropriate. Inspect capability on first run and show an explicit warning if precise scheduling is unavailable. Handle restarts, DST/time zone changes, permissions being revoked, Doze and OEM battery restrictions. Proper audio and notification-channel verification, optional loudness preview; never silently assert an alert will wake the user.
- Investigate AlarmClock ACTION_SET_ALARM as an interoperable fallback to the installed clock, but note that system clock alarm categories/labels are not necessarily accessible or controllable by MJB.
- No prefilled actual prescription/dosing instructions.
B. PRIVATE JOURNAL + VOICE NOTES
- Tap once to write, tap once to start/stop a note with clear mic permission and recording indicator, autosave drafts. Include optional OS-supported speech-to-text/dictation and voice playback, but don't claim universal offline transcription.
- Basic date/topic tags, fast search, encrypted local storage where feasible, deliberate export/backup and deletion. No signup, server upload, public journal mixing or hidden analytics.
C. SHARED FEED / READING
- Reuse canonical public posts, bookmarks and consistent visual language. Offline saved posts are clearly identified and can be refreshed without losing personal notes.

No AI assistant required for MVP. Later: opt-in on-device inference/AI, export/import format, widgets, voice commands and privacy-preserving optional sync. Avoid implementing cloud accounts as a prerequisite.

## 6. Voice assistant and music realities: prove, don't assume
- First, test standard in-app speech input and Android launcher shortcuts/deep links for 'New medication reminder', 'Start journal' and selected routine templates. Research current Assistant App Actions built-in and custom intents, supported locale and test-device compatibility; do not promise that arbitrary natural-language Assistant commands will route correctly.
- Native ACTION_SET_ALARM and ACTION_SET_TIMER can hand the user to a chosen alarm app; note the tradeoff with MJB's grouping metadata.
- Spotify's published compliance tips prohibit using Spotify songs/clips as alarm tones and building voice-controlled experiences with its tools. Therefore do NOT implement Spotify-as-alarm-tone or voice-controlled Spotify playback through its platform SDK. Optional user-initiated 'open this playlist in Spotify' may be evaluated separately for compliance.
- YouTube API policy forbids background player/audio-only extraction and inappropriate caching. Do NOT promise YouTube Music alarm audio integration without an official supported/legal route.
- Base alarms on Android/system ringtones or user-selected locally licensed audio through an appropriate picker. Audio must work without network and should not silently fail when a music app is logged out.
- If a feature depends on permissions, subscription, OEM compatibility or a prohibited SDK use, show the limitation as a documented product decision rather than a hidden footnote.

## 7. App Play Store/admin constraints
Do not assume 'free app' equals frictionless publication. Verify developer registration, current account verification, package name/brand ownership, screenshots/metadata, privacy policy and Data safety declarations, minimum SDK/target SDK, current Play review/testing rules. New personal accounts created after 13 Nov 2023 generally require 12 opted-in closed testers for 14 continuous days before applying for production. Internal testing can begin first. There is a registration fee, details must be checked for the actual account.
Pure low-utility wrappers may face functionality/quality review. The alarms/journal and offline utility should be genuinely useful, tested native functionality.
Zero-cost to users is an explicit business decision. Avoid background tracking, ad SDKs and paid upsell in MVP. Do not create or access Play/Spotify accounts without user authorisation.

## 8. Security, safety, evidence and publishing rules
No medical records/individual case files in the public site, repository, test fixtures, sample screenshots or telemetry. Test voice/journal using fictional content. Public journals require the owner's intentional editorial approval, and source-sensitive experiences need explicit privacy review.
Preserve post IDs and factual claims; don't recast cell/animal research as clinical proof. Scientific diagrams must be editable/checked, unlike artistic atmospheric heroes. Exports require provenance, rights, full caption, alt text, readable source and direct website link.
Do not add app-wide 'urgent medical advice' or diagnostic/scoring claims. Reminders are organisational tools, not prescription recommendations or emergency systems.
Avoid publishing automatic notifications until privacy and consent are reviewed. No auto-post, no Buffer queue writes, no external account access.
Avoid copying actual X/Instagram/Facebook assets, icons/logos, proprietary interface code, branding or trade dress. Borrow well-understood interaction patterns only.

## 9. Testing and success metrics (observed, not invented)
Website acceptance:
- 390px and 320/360px, desktop, 200% zoom and 400% when practical; English reflow, keyboard/touch/VoiceOver or TalkBack, reduced-motion, colour-blind palettes, image disabled, offline/no-JS where relevant.
- A reader can reach one post in one tap, find its primary source, return at the same place, save it and find it again; work with swipe disabled. Stable back/forward URLs, no nested swipe traps.
- Verify original site routes and scripts, search, guide, reading TTS, print and source paths; record commands, browsers and BASE_SHA.
Android acceptance (REAL DEVICE, not emulator only):
- Create a labelled repeated alarm without account in a small number of steps and verify real firing after screen-off and app process termination.
- Test reboot, time-zone/DST shift, cancelled/denied permission, Doze/battery saver, DND, mute/volume, sound picker, duplicate scheduling, pause/restore and user-initiated 'test alarm'. No guarantee across every handset; documented limitations.
- Microphone permission denied still leaves text diary working; switching offline must not lose entries; export and restore round trip tested.
- Test on at least one current Pixel and a lower-spec Android device if available; no fabricated screenshots or test outcomes.
- Clear PASS/FAIL/NOT_RUN evidence, recording time/build/OS/device. For performance, measure actual load, jank and bundle size before specifying final budgets.

## 10. Grok deliverables and boundaries
FIRST delivery is a BOUNDED website prototype, not a whole rebuild or publishable app:
1. Baseline source/branch/SHA inventory and current PR #8 integration points.
2. Three design options with tradeoffs, and one chosen approach.
3. Clickable/runnable three-post website prototype and a short Android grouped-alarm concept (screens + technical feasibility matrix), reusing existing source content.
4. Before/after mobile and desktop screenshots, colour token map, alt text and graphic rights manifest.
5. Patch/archive of changed source files and runnable commands. No edits to main or PR #7, no merges.
6. Test report and blocker register.
7. Explicit second-stage native Android MVP implementation proposal, including permissions/API and test plan. Do not claim alarm reliability before real-device testing.

Prioritise demonstrable utility, source continuity, privacy, accessibility and reversibility over spectacle. Keep all results under a separate dated Drive handoff or PR for Claude/GPT review. Final production release requires the owner's approval.

## Verified starting references (recheck at implementation time)
- https://developer.android.com/develop/background-work/services/alarms
- https://developer.android.com/about/versions/14/changes/schedule-exact-alarms
- https://developer.android.com/reference/android/provider/AlarmClock
- https://developer.android.com/develop/devices/assistant/get-started
- https://developer.android.com/develop/ui/views/layout/webapps/trusted-web-activities
- https://developer.spotify.com/compliance-tips
- https://developers.google.com/youtube/terms/developer-policies
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/googleplay/android-developer/answer/9898783
- https://www.w3.org/TR/WCAG22/
