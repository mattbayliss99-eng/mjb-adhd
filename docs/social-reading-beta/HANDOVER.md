# HANDOVER — MJB social reading beta v0.1 (2026-11-05)

For GPT/Codex final integration. **Matty steps are short and numbered at the bottom.**

## Git (local only — not pushed)

- Branch: `feature/social-reading-beta`
- Base: `origin/feature/visual-posts-codex-preview` = `72b85a37b6d4a33f0cd7d5e1de3860a8e9336a8c` (PR #8)
- Head: `7cdbbb86c68683e876a70d9bc8c3b7b61f3e83fa`
- PR #7 untouched: `feature/questionnaire-hub-preview` = `79631b3ef56d5c7012410f6c204834298494416a`
- Patch: `0001-*.patch` from `git format-patch`
- Bundle: `mjb-social-reading-beta.bundle` (`git fetch` / `git pull` from bundle)

Apply on a clean worktree of PR #8:
```
git fetch mjb-social-reading-beta.bundle feature/social-reading-beta:feature/social-reading-beta
# or: git am < 0001-….patch
```

## What changed

- New labelled route `/social-reading-beta/` (X-style shell, feed, stories, explore, saved, packs, feedback stub).
- `content/posts/posts.json` → schema 1.1 with `slides[]` stable IDs + captions prep.
- Reading packs: mobile viewport + content revision/date; UI says **download requested**.
- Nav chrome hide/reveal + always-visible preference; keyboard slide nav; reduced motion; enlarged text.
- `npm test` includes reading-pack tests; Playwright suite under `tests/social-reading-beta/`.
- Existing `/posts-preview/` and all production URLs kept. Article return helper also returns to beta when `from=social-reading-beta`.

## Run

1. `python3 tools/build_social_reading_beta.py`
2. `python3 -m http.server 8765 --directory site`
3. Open `http://localhost:8765/social-reading-beta/`

## Rollback

1. Delete `site/social-reading-beta/` and `tools/build_social_reading_beta.py` / related tests/docs.
2. Restore `content/posts/posts.json` from PR #8 head (revision 3 bodies without slides) if needed.
3. Revert `site/posts-preview/article-return.js` and `package.json` / lockfile.

## Blockers for release

1. Asset rights for GROK-ASSET-003 still **PENDING_PROVENANCE_REVIEW**.
2. No physical-device / screen-reader pass yet.
3. No GitHub auth in this session — patch/bundle must be applied by Codex/Matty.
4. Unreviewed science samples remain excluded until evidence review.

## Optional companion

TanStack Grok prototype + Claude patch pack were inputs. A static X-style prototype HTML is in `artifacts/social-reading-beta/`. Full TanStack app was **not** merged into the static site (keeps Netlify static architecture).

---

## Matty — short steps

1. Open the Drive folder **Grok Handoff** and download the ZIP + two markdown files.
2. Give the ZIP + `HANDOVER.md` to GPT/Codex (do not merge yourself).
3. When asked to try it: unzip → run the three commands in **Run** above → open the beta URL on your phone.
4. Say yes/no to asset rights for the abstract network image before any social posting.
5. Keep PR #7 separate until Codex says otherwise.


## Package
- File: `MJB_social_reading_beta_v0.1_2026-11-05.zip`
- SHA-256: `78b15feeaa046f06f44940e026b2f5feac80cc926a7cfd6cc61ed547c317bd96`
- Bytes: 869959

## Drive links

1. ZIP — https://drive.google.com/file/d/1rRaql4j-eu74F2GD8fWDggjhqkjVuKAk/view — SHA-256 `78b15feeaa046f06f44940e026b2f5feac80cc926a7cfd6cc61ed547c317bd96`
2. VERIFICATION_REPORT — https://drive.google.com/file/d/1J8_necfd7vwImGi41gsJ9JMjOYxKy8uN/view
3. HANDOVER — https://drive.google.com/file/d/1Bh7htIAsNefBx_V2v-CHDF68m75A7iPd/view

Local commits (not pushed): `33b169edbeff7a096937fb3c1948206aa371e981` on `feature/social-reading-beta` off `72b85a37b6d4a33f0cd7d5e1de3860a8e9336a8c`.
