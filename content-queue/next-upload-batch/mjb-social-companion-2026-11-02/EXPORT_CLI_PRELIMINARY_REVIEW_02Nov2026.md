# 2 Nov 2026 — GPT preliminary code inspection of Grok social export CLI
**Scope:** Read the current Drive copy of `social-export-cli/social_export.py` (last modified 2 Nov 2026, current at inspection). This is code-reading ONLY, not a final rendered-asset, security, rights, Play or production sign-off. Source: https://drive.google.com/file/d/1iGrdpBcrBQECb-aWZfXbJCJpf9hUuSrT/view?usp=drivesdk

## Confirmed improvements
- Imports `xml.sax.saxutils.escape`; renders escaped titles/body/caption/cues in SVG (lines 36, 181–205).
- Writes text sidecars and manifest; provisional `blocked` status for current draft posts with `PENDING_PROVENANCE_REVIEW`.
- `schedule` visibly constructs and saves local JSON only; no Buffer request inside this CLI (lines 284–319).
- Separate text-layout SVG from externally generated hero artwork is explicitly acknowledged.

## Findings to feed into Grok and have Claude verify
**BLOCKER for approving new posts: fragile readiness classifier** — `flag_missing()` reports missing caption (line 83), image (line 99), image alt (line 102) and evidence object/class (lines 87,91), but both the export and schedule readiness expressions (lines 237, 290) block **only** flag strings containing `PENDING`, `not approved` or `empty (required`. Thus a future `approved` post with missing image alt, absent evidence class, missing caption or other missing key fields could become `review` even though fields remain incomplete. `review` itself must never be represented as release approval. Fix: typed blocking checks per field and explicit states `blocked`, `needs_review`, `approved_for_export` only after documented gates; optionally fail closed if any invalid/missing required field. Distinguish editorial text-only posts that legitimately require no hero and permit true decorative images to have appropriately declared alternatives.

**MAJOR visible clipping and qualification risk** — `svg_for()` truncates `cue[:200]`, `source_cue[:140]`, `rights_line[:100]`, `alt[:60]`, and flags `[:120]` at lines 201–205 without overflow warnings specific to these fields. Body/caption overflow flags at 165–179 do not cover these cuts. Long sources/URL/restrictions may disappear from image. The title (line 188) is an unwrapped single text row, so long titles may run off edge. Wrapping uses character counts not actual glyph metrics. Need measured layout, multi-line/slide continuation or intentional reviewed copy, and visible article/source destination that fits each aspect ratio.

**MAJOR unverified image composites** — manifest note (lines 238–239) correctly calls exported SVG a text layout rather than a finished hero+overlay composition. Confirm rights and full composite with render screenshot before output is marked ready. Current sample statuses `blocked` remain appropriate.

**REVIEW test evidence** — no evidence from this inspection of executed tests for XML-sensitive titles, long URLs, overflowing uncertainty statements, very small screen crops, missing-alt approved post, missing-evidence approved post, or visual readability at the four ratios. Recommend fixture tests and actual SVG-to-PNG rendering/screenshots rather than treating sidecar existence as visual completeness.

**REVIEW provenance** — code tries `git rev-parse` from its root. Ensure manifest records accurately distinguish untracked Drive folder `git unavailable` from Git-linked SHA and do not mistake the latter as provenance for separately produced Imagine artwork.

## Required closeout
1. Grok supplies a narrow revision of the SAME CLI, unchanged post-bank schema unless justified, plus validation fixtures and a source-diff; no duplicate export generators.
2. Claude reviews edited lines and exported rasters against all four ratios; supplies observed PASS/FAIL/NOT_RUN, not inference.
3. GPT checks only the corrected version and owner-authorised publishing gate. No Buffer sends and no live-site publication before approval.
