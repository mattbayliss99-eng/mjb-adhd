# VERIFICATION REPORT — Reader Experience v2.0 P0r1 (focused fixes)

Date: 2026-11-05 Europe/London  
Branch: `feature/reader-experience-v2-p0`  
Scope: GPT review fixes only — not new feature expansion. Audio + offline SW remain deferred.

## How PASS was established

| ID | Before (P0) | After (P0r1) | Evidence basis |
|---|---|---|---|
| PRINT-01 | PASS (print event + PDF bytes) | **PASS** | Playwright `page.pdf` with evidence expanded |
| PRINT-02 | PASS via **pdftotext only** (not visual) | **PASS** | `pdftoppm` → 3 PNGs; agent **Read()** each image for layout/clipping/order/readability; full claim text present |
| THEME-01 | PASS (bg colour only) | **PASS** | Computed WCAG ratios for ink/muted/btn/accent/link/focus across all 6 presets + `@axe-core/playwright` `color-contrast` |
| THEME-04 | PASS (2 presets) | **PASS** | All 6 presets selectable |
| AUTO-01 | PASS (default-off only) | **PASS** | Default off; Play/Pause control; advances **visuals only**; pauses on evidence; reduced-motion disables without override |
| NAV-01 | NOT_RUN | **PASS** | Real Chromium scroll hide/reveal |
| NAV-02 | NOT_RUN | **PASS** | Show navigation + focusable prefs |
| EVID-03 | NOT_RUN | **PASS** | Article return restores beta story + `?slide=` |
| A11Y-04 | NOT_RUN | **PASS** | 200% text + ~400% zoom; controls remain |
| SEC-01 | NOT_RUN | **PASS** | Hostile theme `url(javascript:…)` + scripty favourite title rejected |
| SAVE-04 | NOT_RUN | **PASS** | QuotaExceeded path surfaces graceful status |

## Fixes applied
1. Print stylesheet forced light linear reading order; full claim wording in evidence; decorative mark on first printed page then slides.
2. Ink-paper (and graphite) contrast tokens raised; accent button text on light theme set to light-on-dark-gold.
3. Auto-cycle: visible Play/Pause, ≥3 visual frames, pause on manual/focus/evidence/hidden tab; reduced-motion override gate; never advances text.
4. Article return stores/restores slide; prefs/favourites import hostile rejection; storage failure messaging.

## Still deferred
AUDIO-*, PACK-02/03 (offline SW), physical phone + screen-reader, A11Y-05/06, PERF-01, RELEASE-02 disposable preview rollback.

## Commands
```
npm test
node tests/reader-experience-v2/playwright.p0r1.cjs
```
