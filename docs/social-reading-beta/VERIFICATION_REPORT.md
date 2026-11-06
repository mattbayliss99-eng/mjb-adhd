# VERIFICATION REPORT — MJB social reading beta v0.1

Date: 2026-11-05 (Europe/London)
Branch: `feature/social-reading-beta`
Head commit: `7cdbbb86c68683e876a70d9bc8c3b7b61f3e83fa`
Base (PR #8 / visual-posts): `72b85a37b6d4a33f0cd7d5e1de3860a8e9336a8c`
PR #7 head (untouched): `79631b3ef56d5c7012410f6c204834298494416a`
Content revision: `srb-2026-11-05.1`
Repo clone: **worked** (public `git clone` of https://github.com/mattbayliss99-eng/mjb-adhd)

Environment: Node v24.22.1, Python 3.13.5, Playwright Chromium (headless), Linux box.

## Checkpoint table

| # | Checkpoint | Result | Evidence |
|---|---|---|---|
| 1 | Inspect repo/preview; separate feature branch; keep PR #7 | **PASS** | Branched from `feature/visual-posts-codex-preview`; questionnaire files unchanged |
| 2 | Authored slides with stable IDs; qualifications with claims | **PASS** | `content/posts/posts.json` schema 1.1; 12 slides `MJB-S…`; unit test |
| 3 | Share links to selected slide; article/source return | **PASS** | `?slide=` deep links; article-return supports `from=social-reading-beta`; browser T_SLIDE_DEEP_LINK / T_ARTICLE_RETURN |
| 4 | Pack HTML viewport + revision/date; “download requested” | **PASS** | Pack metas + packs.js wording; reading-pack unit + T_DOWNLOAD |
| 5 | Reading-pack tests in normal `npm test` | **PASS** | `package.json` `test` → `test:social-unit` includes reading-pack |
| 6 | Nav hide/reveal, always-visible, keyboard, reduced motion, enlarged text | **PASS** | `chrome.js`/`prefs.js`; browser T_NAV_CHROME, T_KEYBOARD, T_MOBILE_VIEWPORT |
| 7 | Labelled public beta route; keep site URLs; exclude unreviewed science | **PASS** | `/social-reading-beta/` only; Science tab disabled/excluded; editorial posts only |
| 8 | Source, assets provenance, lockfile, run + deploy notes; no secrets | **PASS** | See package ZIP contents; ASSET_PROVENANCE.md; no `.vercel/output` / no secrets |
| 9 | Real headless browser tests | **PASS** | See browser table below (not inferred from source) |
| 10 | Versioned ZIP + reports + Drive upload | **PASS** | This handoff package |

## Browser results (Playwright Chromium — observed)

| ID | Result | Detail |
|---|---|---|
| T_MOBILE_VIEWPORT | PASS | 390px feed + 200% text story heading visible, no overflow |
| T_KEYBOARD | PASS | ArrowRight advanced; status shows stable slide id |
| T_DOWNLOAD | PASS | download event + wording + viewport/revision in saved file |
| T_PRINT_DECK | PASS | print control invoked; all 4 slides printable |
| T_SLIDE_DEEP_LINK | PASS | direct slide URL + article return present |
| T_NAV_CHROME | PASS | always-visible prevented hide on scroll |
| T_ARTICLE_RETURN | PASS | article with post-return opened |

Raw JSON: `docs/social-reading-beta/BROWSER_RESULTS.json`

## Unit / generator

| Check | Result |
|---|---|
| `npm test` (generated freshness + authored-slides + reading-pack) | PASS |
| `python3 tools/build_posts_preview.py --check` | PASS |
| `python3 tools/build_social_reading_beta.py --check` | PASS |

## Not run / blocked

| Item | Status | Why |
|---|---|---|
| Physical phone / iOS Safari / TalkBack/VoiceOver | NOT_RUN | No device in this session |
| Full WCAG audit | NOT_RUN | Out of scope for this beta slice |
| Asset rights clearance / social posting | NOT_RUN | Provenance still PENDING |
| Offline service-worker pack after kill+disconnect | NOT_RUN | Pack download verified; full SW offline cycle deferred |
| Native Android alarms | NOT_RUN | Separate companion track |
| GitHub push / Netlify deploy | NOT_RUN | Explicitly forbidden |

## Safety

- No merge, no deploy, no GitHub push (no auth).
- No secrets, private records or personal data in outputs.
- Unreviewed science sample copy from Claude/TanStack prototype excluded from the beta feed.


## Package
- File: `MJB_social_reading_beta_v0.1_2026-11-05.zip`
- SHA-256: `78b15feeaa046f06f44940e026b2f5feac80cc926a7cfd6cc61ed547c317bd96`
- Bytes: 869959

## Drive package (uploaded 2026-11-05 Europe/London)

- Folder (Grok Handoff): `1Kq5UBt-ae8Zn4IFVksvLvmUoi0CZ5nBD`
- ZIP: [MJB_social_reading_beta_v0.1_2026-11-05.zip](https://drive.google.com/file/d/1rRaql4j-eu74F2GD8fWDggjhqkjVuKAk/view) — id `1rRaql4j-eu74F2GD8fWDggjhqkjVuKAk`
- SHA-256: `78b15feeaa046f06f44940e026b2f5feac80cc926a7cfd6cc61ed547c317bd96`
- Bytes: 869959
- VERIFICATION_REPORT.md id `1J8_necfd7vwImGi41gsJ9JMjOYxKy8uN`
- HANDOVER.md id `1Bh7htIAsNefBx_V2v-CHDF68m75A7iPd`
- Local head: `33b169edbeff7a096937fb3c1948206aa371e981` · base PR#8: `72b85a37b6d4a33f0cd7d5e1de3860a8e9336a8c`
