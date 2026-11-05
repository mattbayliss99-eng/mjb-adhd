# VERIFICATION REPORT — Reader Experience v2.0 P0

Date: 2026-11-05 Europe/London

Environment: Playwright Chromium headless, Node, Python3, pdftotext.

| ID | Result | Evidence |
|---|---|---|
| A11Y-01 | **PASS** | keyboard journey via READ-03/READ-06 |
| A11Y-02 | **PASS** | buttons sufficient; swipe optional default off |
| A11Y-03 | **PASS** | 320/390/768/1280 no horizontal overflow |
| A11Y-04 | **NOT_RUN** | 200% preference exists; dedicated 400% zoom case not run |
| A11Y-05 | **NOT_RUN** | CSS landscape short-height rules present; not device-tested |
| A11Y-06 | **NOT_RUN** | no screen-reader device in session |
| A11Y-07 | **NOT_RUN** | partial via theme/reduced-motion; not full landmark audit |
| AUDIO-01 | **NOT_RUN** | no recorded audio bank |
| AUDIO-02 | **NOT_RUN** | device speech not wired this slice |
| AUDIO-03 | **NOT_RUN** | background/lock claims withheld |
| AUTO-01 | **PASS** | auto-cycle default off |
| BASE-01 | **PASS** | ZIP digest matched; bundle HEAD 3d3deae; linear 7cdbbb8->33b169e->3d3deae |
| BASE-02 | **PASS** | PR7 untouched; questionnaire-demo unmodified on this branch |
| BASE-03 | **PASS** | npm test + build scripts from lockfile |
| BASE-04 | **PASS** | /, /posts-preview/, article return routes still present |
| DATA-01 | **PASS** | unit authored-slides unique IDs |
| DATA-02 | **PASS** | feed/split/continuous/thread/pack from same bank |
| DATA-03 | **PASS** | no unresolved raster / science samples in feed |
| EVID-01 | **PASS** | evidence panel content |
| EVID-02 | **PASS** | inline disclosure does not trap focus; next control focusable |
| EVID-03 | **NOT_RUN** | article return helper exists; full restore after external not re-run this slice |
| EVID-04 | **NOT_RUN** | return helper allowlist exists; malicious URL fixture not automated here |
| EVID-05 | **NOT_RUN** | enlarged text covered in A11Y-03/prefs; long title reflow not separate |
| NAV-01 | **NOT_RUN** | hide/reveal hysteresis implemented; dedicated scroll-jitter case not separately scripted beyond NAV-03 |
| NAV-02 | **NOT_RUN** | Show navigation control present; focused-nav case partially covered |
| NAV-03 | **PASS** | always-visible + reduced motion prefs |
| NAV-04 | **NOT_RUN** | active scroller selection implemented; not separately asserted |
| PACK-01 | **PASS** | pack downloaded and inspected |
| PACK-02 | **NOT_RUN** | standalone file reopen with networking disabled not executed |
| PACK-03 | **NOT_RUN** | full app offline SW not promised |
| PERF-01 | **NOT_RUN** | bundle size not measured this pass |
| PRINT-01 | **PASS** | print invoked; PDF bytes=99044 |
| PRINT-02 | **PASS** | multi-page PDF text contains ordered slides |
| READ-01 | **PASS** | feed -> reader -> back |
| READ-02 | **PASS** | upper pin stayed while lower scrolled |
| READ-03 | **PASS** | direct link + prev agree |
| READ-04 | **NOT_RUN** | manual image browse marks manual mode; not assertively tested |
| READ-05 | **NOT_RUN** | resume linked control present; not browser-asserted |
| READ-06 | **PASS** | presets + keyboard divider |
| READ-07 | **PASS** | continuous + thread layouts |
| READ-08 | **PASS** | end card without autoplay next post |
| READ-09 | **NOT_RUN** | one-slide/missing-image fixtures not separate cases |
| RELEASE-01 | **PASS** | isolated branch; production main untouched |
| RELEASE-02 | **NOT_RUN** | rollback procedure documented; disposable preview rollback not executed |
| RELEASE-03 | **PASS** | handoff separates verified/deferred |
| SAVE-01 | **PASS** | favourite toggle + pressed state |
| SAVE-02 | **PASS** | Saved page copy distinguishes favourite vs downloaded |
| SAVE-03 | **PASS** | slide progress via localStorage + ?slide= restore (READ-03) |
| SAVE-04 | **NOT_RUN** | quota/private-mode fixtures not automated |
| SAVE-05 | **PASS** | export/import local JSON with schema check + replace confirm |
| SEC-01 | **NOT_RUN** | malicious import fixture not automated beyond schema reject |
| SEC-02 | **PASS** | no network submit; no secrets in outputs; feedback local-only |
| THEME-01 | **PASS** | default theme applied; bg=rgb(17, 18, 20) |
| THEME-02 | **NOT_RUN** | custom colour controls present; derived-token suite not exhaustive |
| THEME-03 | **PASS** | reset/export/import prefs implemented; invalid schema rejected in import handler |
| THEME-04 | **PASS** | purple/paper presets function |
| THEME-05 | **NOT_RUN** | in-site logo variants only; launcher/PWA icon claims withheld |
