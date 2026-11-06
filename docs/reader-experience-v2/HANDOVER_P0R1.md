# HANDOVER — Reader Experience v2.0 P0r1 (2026-11-05)

## Git (local only — not pushed)
- Branch: `feature/reader-experience-v2-p0`
- Base PR #8: `72b85a37b6d4a33f0cd7d5e1de3860a8e9336a8c`
- Head: resolve via MANIFEST / `git rev-parse feature/reader-experience-v2-p0` after applying bundle
- Apply via P0r1 bundle/format-patch (Drive). PR #7 untouched.

## What changed vs P0
Focused verification fixes only: PDF visual renders, theme WCAG/axe, full auto-cycle pause behaviour, NAV/EVID/A11Y/SEC/SAVE release checks.

## Matty — short steps
1. Open Drive **Grok Handoff** → download `MJB_reader_experience_v2.0-P0r1_*` ZIP + this HANDOVER.
2. Give to GPT/Codex (do not merge yourself).
3. Optional try: unzip → `python3 tools/build_social_reading_beta.py` → `python3 -m http.server 8765 --directory site` → open `/social-reading-beta/`.
4. Keep PR #7 separate. Audio/offline stay later.

## Rollback
Revert P0r1 commits on the feature branch; P0 behaviour remains in earlier commits.

## Blockers
No GitHub auth (bundle/patches only). Phone + SR still NOT_RUN. Audio/SW deferred.
