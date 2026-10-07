# Editorial visual integration — 6 October 2026

The commissioned visual package was reviewed against the current 43-page working guide, extending the earlier 38-page packet. No remote commit, deploy preview or publication occurred. The production snapshot remains e5fc0c2. Local source-control commits and compiled output preserve the proposed integration.

## Selected

V01–V06 and S01–S03: nine masters, ten guide placements (V06 serves both continuity and no-prescriber). Each has a caption, accessible alt text, full-size SVG link and adjacent readable text equivalent. Descriptive/editorial frameworks remain labelled, and clinical source IDs are checked against the source inventory.

All 36 supplied manifest records passed file hash, byte-count and raster dimension checks. SVG originals passed script/event-handler/external-resource checks. Inspection found body text effectively black on dark backgrounds in supplied PNG/WebP exports. Selected SVGs were re-exported using CairoSVG and checked visually; refreshed hashes are in selected-manifest.json. S02's public copy now dates/attributes the case account and replaces production instructions. S03's public copy uses mission wording instead of a production caveat. Commission originals remain unchanged under originals/.

Raster copies are supplementary; the full-size SVG and HTML text provide reading routes where shrinking a poster would make it difficult to read. This is not a claim of completed mobile usability testing.

## Held outside the published folder

V07/V07b: unresolved source gaps, unattached exhibits and shortening require review against primary records. In particular, October RTC has no source ID; the full timeline SVG cites X8 but its supplied manifest source list omits X8. The existing interactive timeline retains its labelled source gaps; the separate poster is not inserted.

V08: numerical claims are consistent with the guide's R1 entry, but this editorial pass has not independently re-read the trial tables. Retained for a focused source check rather than inserted.

The existing gene-to-symptom infographic has been removed from the proposed `site/assets/` and its two page placements. Its original is retained under `guidebook/review-held/`, outside Netlify's published `site/` folder. It requires per-arrow source/uncertainty review before reuse. Other held album candidates remain unimported.

## Other integration corrections

The compiler now renders root-relative links to the existing library instead of leaving Markdown visible. The offline export embeds the selected artwork; hosted exports keep same-origin files. CSP remains unchanged. The botanical page explicitly distinguishes sampled retail products from a different supplier or tested batch; product-quality evidence and clinical-effectiveness evidence answer separate questions.

## Verification

Compiler: 43 pages, 101 declared labelled claims, 64 sources, no warnings. Local links: 1,718 across 76 HTML files, no missing targets. Nine masters/ten placements, complete static equivalents, offline artwork embedding and held-file exclusion checks passed. JavaScript syntax and git whitespace checks passed. Identifier-pattern scan of published text/SVG files had no hits; it is not exhaustive privacy verification.

Outstanding: rendered desktop/mobile site inspection, V07/V08 checks, V09–V11 visuals, full clinical review where needed, GitHub write access, preview and release. Never use manual drag-and-drop as an equivalent to the Git-connected edge-function release.

## V09–V11 integration, 7 October

All three selected for their existing field-guide pages. Text equivalents and source lists accompany them. V09 text truncated by the commission generator was shortened to complete sentences, and the methylphenidate mechanism receives its own official label source F14. V11's visible C1/C2/C3 shorthand was replaced by document dates; text equivalents and clickable sources use canonical CASE identifiers. Original commission is preserved in commission-oct7/. Public exports have new hashes in selected-manifest.json. UK licensing was not re-audited; no UK availability conclusion is added.
