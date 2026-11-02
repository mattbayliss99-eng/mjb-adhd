# MJB visual posts — Codex integration preview
1 November 2026. Separate local branch `feature/visual-posts-codex-preview`, based on `8d4030af8fce5f8a2e9ae27e013219e6e48417fc`. No remote push, PR merge or deployment performed.

## Run
From the repository root:
```
python3 tools/build_posts_preview.py --check
python3 -m http.server 8000 --directory site
```
Open `http://localhost:8000/posts-preview/`. Serve the complete `site/` tree; this is a static-site integration, not a file-open app. Internet is not required for local site scripts, assets or guide text; external sources still need internet. Preview pages are noindex, omitted from live menus/sitemap; this is not an access-control mechanism.

## Result
Four complete static pages: topic shelves plus three posts with stable URLs, ordinary Previous/Next, visible sequence position, and a normal full-article/source destination. No hidden multi-card state, blank '#' topic links or controller dependency for essential navigation. Every card works with JavaScript off. Optional swipe and region-scoped arrows enhance native links. Reader-facing swipe preference starts off and persists within the tab/session. It excludes interactive elements, figures, tables/code, selected text and nested horizontal overflow, cancels on multitouch/cancel, and requires horizontal dominance. No animation is used in this component.

Shared MJB navigation, drawer/pinning mechanism, current-topic breadcrumbs, palettes, reading settings and audio engine are used. A preview-only navigation overlay adds orientation without rewriting the shared production index. The existing article has only a source-heading ID and one query-gated return-helper script added; its factual prose is untouched. The helper accepts only the three registered preview IDs and offers a return link; ordinary article visits receive no banner. Progress means last visited, not read/completed. No account, analytics or answer collection.

Arrival via sequence links focuses the new visible title at the top. Ordinary return/reload uses tab-local saved scroll and normal browser history; fragment destinations are not overridden. Browser back/forward and BFCache must still be exercised in a real browser before approval. Session storage blocked/unavailable degrades to plain links without persistence.

## Content and assets
`content/posts/posts.json` is the candidate canonical dataset for this preview. IDs MJB-P000001–003 originate from the Claude editorial pilot; revision 3 replaces promises/clinical placeholder statements with interface explanations. No biomedical claims were added or source-approved. Article links retain the existing What is ADHD destination. Integrate this bank with the full Claude bank deliberately before expanding: do not run two independently edited banks for the same IDs.

Only Grok's abstract network illustration is used in the candidate site; the other images and SVG remain unchanged in its original Drive packages for reference. Raster screenshots of controls were not shipped as working UI. Asset provenance/rights are not verified and remain explicitly pending in the bank and captions. Full original Grok ZIPs remain untouched; patches are independent additions/revisions, not overwrites of those originals.

## Tests
Install jsdom in a temporary development dependency directory (tested jsdom version in VERIFICATION.md), then set `MJB_DOM_MODULE` to that package's absolute path:
```
MJB_DOM_MODULE=/path/to/node_modules/jsdom node tests/posts-preview.cjs
MJB_DOM_MODULE=/path/to/node_modules/jsdom node tests/posts-preview-integration.cjs
MJB_DOM_MODULE=/path/to/node_modules/jsdom node tools/check_reading.cjs
node guidebook/tools/build.mjs --check
python3 tools/build_posts_preview.py --check
```
DOM checks are not browser checks. jsdom does not establish layout, native browser focus/history/print or real device touch behaviour. Shared speech was stubbed/absent in DOM tests; the existing reading suite checks speech logic, not spoken audio quality.

## Browser completion checklist
Use a permitted local browser or a deliberately created review preview; do not bypass a browser/security block.
- All native links and sequence endpoints with JS on/off; empty, narrow and 200% text layouts; images off.
- Tab/Shift+Tab, native Enter, region-only arrows; title focus after Next and Back from article; no unexpected page scroll or focus loss.
- Swipe off/on across pages, vertical/diagonal/interactive/selected-text/multitouch gestures; device/browser back gesture conflicts.
- Shared navigator pinned desktop, mobile drawer, active ancestry, Escape and restored focus; palettes, line spacing, reading size and narration.
- Full article and sources, return link, browser Back/Forward/reload including BFCache; page and scroll preserved without overriding anchors.
- Reduced-motion preference, browser console and all local requests.
No download/PDF UI was added or changed here; flashcard/questionnaire download and PDF gates remain separate and unresolved. Do not imply this pass verified them.

## Release boundary
Local implementation and DOM regression checks complete; browser verification, visual approval, asset provenance and final integration approval remain open. Do not merge or deploy this package solely because the included tests pass. GPT/Codex final review must use actual runtime evidence. PR #7 and Claude's science post candidates were not merged.
