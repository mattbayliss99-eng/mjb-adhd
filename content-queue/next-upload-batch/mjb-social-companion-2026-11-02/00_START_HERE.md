# MJB social-first + companion app — start here (recovered 2 Nov 2026)

This is a **staged planning-only** handoff recovered from a disappearing chat. Nothing here is an approved website/app release, a message sent to an outside AI, or authorisation to publish.

## Reading order
1. `GROK_IMPLEMENTATION_BRIEF_v1.md` — whole website/app product brief and technical constraints.
2. `CONTINUATION_EXECUTION_ORDER_02Nov2026.md` — exact next task and intended deliverables; do not restart the prior project.
3. `EXPORT_CLI_PRELIMINARY_REVIEW_02Nov2026.md` — GPT's direct code-inspection findings for Grok's 2 Nov Drive CLI: visible SVG truncation, incomplete readiness gate, unverified hero composition. Give this to Grok **before any batch export**.
4. `CLAUDE_AUDIT_CHECKLIST_v1.md` — adversarial review against Grok's actual returned patch, rendered 1:1/4:5/16:9/9:16 assets and native alarm feasibility.

## Source-of-truth boundaries
- Public website: https://mjb-adhd.org.uk/ (no production changes made by this planning branch).
- Social visual-post draft: https://github.com/mattbayliss99-eng/mjb-adhd/pull/8 ; current PR #8 source bank `content/posts/posts.json`, three editorial IDs `MJB-P000001`—`003`. Work in a *separate branch/worktree* based on the current PR #8 HEAD.
- Questionnaire draft PR #7 is separate.
- Grok export CLI and representative blocked exports: https://drive.google.com/drive/folders/1HtdY7bdKXPFOh1bKYTwTq3tyxEwQ2jDa
- Previous broader website checkpoint: `docs/posts-preview/00_CURRENT_STATE.md` in the PR #8 branch.

## Responsibilities and sequence
**Grok**: three design directions using existing post IDs; working reversible dark/gold mobile/desktop preview; fix export CLI, then native Android grouped-alarm feasibility with real-device tests. Report SHA, files, screenshots, rights, test outcomes and blockers.

**Claude**: review actual resulting code/assets using the named audit brief, independently reproduce findings and separate BLOCKER/MAJOR/MINOR; don't deploy.

**GPT**: reconcile their results, run final independent gates and offer owner sign-off choices. **No live merge, Buffer schedule, Play release, external outreach or new account without owner's approval.**

Prioritise simple mobile actions: open useful post, read source, return, save; app-only add a correctly labelled alarm in a few steps and capture a private voice/text note. The app shares public content but does not require a signup or internet to use its private tools.

## Key platform constraint
Native Android alarm engine is required for precise notification: check Google Play exact-alarm policies and permissions, real-device restarts/Doze/volume/revocation. Spotify SDK music cannot be used as alarm tones under Spotify developer rules; YouTube background/audio-only integration is also not supported under YouTube API terms. Base tones on system/licensed-local audio and treat an optional open-playlist shortcut as a separate, user-initiated feature.
