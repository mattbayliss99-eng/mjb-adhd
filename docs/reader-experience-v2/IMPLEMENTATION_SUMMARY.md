# Implementation summary — v2.0 P0 (+ partial P1)

## Behaviour delivered
- Isolated `/social-reading-beta/` static reader with charcoal/gold default and engraved styling.
- Feed cards open **one** DS-style split reader (pinned upper + scrolling lower); Back restores feed.
- Divider presets 30/70, 50/50, 70/30 + keyboard adjustment + optional drag; continuous + thread layouts.
- Authored slides with stable IDs; shareable `?slide=` links; end card without autoplay next post.
- Evidence ➕ disclosures with support, limitations, full title link, locator, classification.
- Theme presets + advanced custom colours with reset/export/import; logo variants (in-site).
- Local favourites (aria-pressed) distinct from downloads; progress by slide ID; local export/import.
- Author review page with copy reference + CSV export/import proposals (never silent publish).
- Reading packs: viewport + revision/date; wording **download requested**; original SVG asset only.
- Print / Save as PDF expands slides/evidence; PDF visually text-checked via pdftotext.
- Unresolved GROK-ASSET-003 raster excluded from beta route; original `mjb-engraved-mark.svg` used.

## Deliberate deviations
- No TanStack merge (architecture decision).
- Device TTS / recorded MP3 bank not included (no licensed audio bank yet).
- Service-worker offline reopening deferred (PACK-03 NOT_RUN / backlog).
- Physical phone + screen-reader passes NOT_RUN.
