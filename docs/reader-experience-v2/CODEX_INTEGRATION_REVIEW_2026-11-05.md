# P0r1 integration review — 5 November 2026

Status: **staged for review, NOT DEPLOYED**. This report supplements rather than certifies the supplied Grok reports.

## Provenance

- Original ZIP: `MJB_reader_experience_v2.0-P0r1_2026-11-05.zip`.
- Independently computed SHA-256: `059b975a5a0aaee12fbb11b9e52f9b8029a16d19e29e03fe5d0dbddc6e739233` — matches supplied digest.
- `git bundle verify`: PASS. Imported tip `374e7e8087b409d805c1c145b306d6a7c129e079`; prerequisite `72b85a37b6d4a33f0cd7d5e1de3860a8e9336a8c`.
- Imported into isolated `review/reader-experience-v2-p0r1`; no merge into main.
- Observed main: `8d4030af8fce5f8a2e9ae27e013219e6e48417fc`.
- Observed PR #7 branch: `79631b3ef56d5c7012410f6c204834298494416a`; untouched.
- Static architecture retained. Existing live article change is the query-gated return helper and source anchor inherited from PR #8.

## Scoped corrections after source review

1. Favourites used `innerHTML` with imported title/date strings. The string blacklist rejected selected examples but allowed other markup. Replaced rendering with DOM elements/textContent and validated stored favourite shapes/IDs. Corrupt storage now recovers to an empty list.
2. Printing exposed all slides, then computed the selected slide from that altered state, returning readers to the first step. Capture the selected step/disclosures before printing and restore both.
3. Manual visual selection could be overwritten while linked mode was still enabled. Keep manual context until Resume linked visuals is explicitly selected.
4. Restore legacy numeric `?slide=2` links and reading progress from persistent storage when no session value exists.
5. Story arrow handling no longer intercepts native controls, disclosures, links or modified shortcuts.
6. The rights-exclusion claim described unused files, not absent files: `topic-network.jpg` remained in BOTH public asset directories. Both unreferenced public copies were removed on this branch. Original archives and PR #8's own branch remain unchanged. No history rewrite.
7. Added focused DOM regressions to `npm test`.

## Independent verification

| Check | Result | Evidence |
|---|---|---|
| Dependency installation | PASS | `npm ci --ignore-scripts --no-audit --no-fund` |
| Generated file freshness, authored slides, packs | PASS | `npm test`: 3 posts / 12 slides; viewport/revision/date/download wording |
| New behaviour regressions | PASS, DOM only | `tests/reader-experience-v2/review-regressions.cjs`: unsafe title/date text, corrupt stored values, numeric links, native-control arrows, manual pin, persistent progress, print restoration and missing unresolved beta asset |
| Existing preview component checks | PASS, DOM only | `node tests/posts-preview.cjs`: 5 groups |
| Shared navigation/article integration | PASS, DOM only | `node tests/posts-preview-integration.cjs`: 4 routes and allowlisted article return |
| Existing guide validation | PASS | `node guidebook/tools/build.mjs --check`: 49 pages, 140 claims, 110 sources, 80 links |
| Supplied PDF renders | PASS, supplied artifact only | Visually inspected all three `pdf-renders/page-*.png`: readable, ordered, no clipped text. Cover is decorative and uses substantial space; future editorial polish can reduce it. This is not a newly rendered PDF of the corrected branch. |
| JavaScript syntax / diff whitespace | PASS | `node --check` changed scripts; `git diff --check` |
| P0r1 browser rerun | BLOCKED | `npm run test:browser:p0r1`: Chromium executable absent. `npx playwright install chromium` failed because downloads were invalid/truncated ZIPs. No browser pass is claimed for our corrections. |
| Physical phone / screen reader | NOT_RUN | Named-device review still required |
| Audio / full offline reopening | NOT_BUILT / NOT_RUN | Deferred; retain truthful limitations |
| Preview rollback | NOT_RUN | Must be tested before production approval |

## Interpretation of supplied test results

Grok's browser results remain attributed upstream evidence. Their scope is narrower than some acceptance labels: NAV-02 reads the focused-nav state but does not assert it; SEC-01 calculates a prototype-pollution result but does not assert it; the 400% case uses CSS zoom combined with text enlargement, not native browser zoom/reflow testing. Do not infer a complete accessibility/security audit from these examples.

The visual carousel currently demonstrates three colour treatments of the same decorative mark, not three independently authored explanatory diagrams. Content-specific visuals remain future editorial work. Custom-colour safety/contrast and Apply/Cancel behaviour also need refinement beyond the six preset checks.

## Review workflow and release boundary

### Hosted preview integration follow-up

Draft PR #9 was opened. The first Netlify preview (`6aeceb0382a30d991b30270b`) failed during building, exit code 2. Source inspection found that the supplied replacement package manifest dropped all existing runtime dependencies even though `netlify/edge-functions/markdown.ts` still imports `turndown` and `turndown-plugin-gfm`, and the fallback function still uses the Netlify types. Restored those original dependency declarations and regenerated the lockfile without changing the edge handlers. Independent Node smoke check: the Markdown converter resolves and preserves article links. The hosting error alone did not identify its root cause; the restored dependencies correct a confirmed source defect, and preview deployment must be rechecked.

The next Netlify deploy (`6aecedfc95f16680e7ad7b41`, commit `19db7ea44195e7e9bfe4e601e4f3290b2eab5a9e`) reached **ready**. A separate cloud Chrome browser opened the preview home and first split story successfully. This is an independent desktop smoke observation, not a rerun of the whole upstream Playwright suite. Its accessibility tree exposed duplicate thread content in split view. Source review also found continuous mode still hid non-selected slides. Corrected layout visibility so split shows one step, continuous exposes every step, and thread shows only expandable blocks. Added a DOM regression proving switching among all three preserves the selected step. Further browser checks should use the updated PR head.

Open `/social-reading-beta/` in the deployment preview, then `/social-reading-beta/author-review/` for stable post/slide references and CSV review export. The author page contains publication-safe editorial content; it is not a protected administration area. Preview URL must be verified separately once hosting completes.

This PR is draft-only. Do not merge until browser reruns, real-phone and screen-reader checks, scoped content/rights review and tested rollback are complete. Audio, full offline reopening and live AI need not be added to review this reading prototype.

Rollback while unmerged: close the PR; main is unchanged. A later production release should use a normal revert of the reviewed merge and verify the prior site. No force push or bypass of checks.
