# START HERE — MJB Reader Experience v2.0 P0

Branch: `feature/reader-experience-v2-p0`  
Base (PR #8): `72b85a37b6d4a33f0cd7d5e1de3860a8e9336a8c`  
Prior static beta tip (bundle): `3d3deaea92858ccb1ecf6d7d0b5c23dd7730eaa2`  
PR #7 protected: `79631b3ef56d5c7012410f6c204834298494416a`

Architecture: **extend static** `/social-reading-beta/` (see ARCHITECTURE_DECISION.md). TanStack app not merged.

## Run
```
python3 tools/build_social_reading_beta.py
python3 -m http.server 8765 --directory site
```
Open http://localhost:8765/social-reading-beta/

## Test
```
npm test
node tests/reader-experience-v2/playwright.p0.cjs
```
