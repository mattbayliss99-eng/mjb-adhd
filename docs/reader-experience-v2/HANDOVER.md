# HANDOVER — Reader Experience v2.0 P0 (2026-11-05)

## Git (local only — not pushed)
- Branch: `feature/reader-experience-v2-p0`
- Base PR #8: `72b85a37b6d4a33f0cd7d5e1de3860a8e9336a8c`
- Prior social-reading tip: `3d3deae` (resolved ambiguity: 7cdbbb8 → 33b169e → 3d3deae)
- Head: resolve with `git rev-parse feature/reader-experience-v2-p0` after applying the bundle (also listed in MANIFEST.txt)
- PR #7 untouched: `79631b3ef56d5c7012410f6c204834298494416a`
- Apply via bundle/format-patch in Drive (see package)

## Architecture
Extend **static** `/social-reading-beta/` (ARCHITECTURE_DECISION.md). Netlify publish=`site`, no build.

## Run
1. `python3 tools/build_social_reading_beta.py`
2. `python3 -m http.server 8765 --directory site`
3. Open `/social-reading-beta/`

## Rollback
1. Remove `site/social-reading-beta/` changes / revert branch commits.
2. Restore `content/posts/posts.json` prior revision if needed.
3. PR #8 `/posts-preview/` remains.

## Blockers
1. No GitHub auth — Codex must apply bundle/patches.
2. Physical phone + screen-reader NOT_RUN.
3. SW offline reopen NOT_RUN.
4. GROK-ASSET-003 still pending rights (excluded from beta).

## Matty — short steps
1. Open Drive **Grok Handoff** and download the v2 ZIP + HANDOVER.
2. Give them to GPT/Codex (do not merge yourself).
3. To try: unzip → run the three Run commands → open the beta on your phone.
4. Walk Author review page and dictate notes into the CSV export if you want wording changes.
5. Keep PR #7 separate.
