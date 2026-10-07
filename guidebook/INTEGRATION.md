# Guidebook integration

The existing static Netlify site remains the published folder `site/`. Guidebook authoring lives in `guidebook/content/` and `guidebook/src/`. Run:

```sh
node guidebook/tools/build.mjs
node guidebook/tools/integrate.mjs
```

Commit generated `site/guide/`, `site/js/registry.js`, `site/sitemap.xml` and `guidebook/hosted-routes.json` alongside source changes. No server build, API key or AI service is required. The guide uses the site's existing script policy without weakening it. Inline single-file/offline editions generated in ignored `guidebook/dist/` are export artifacts, not hosted routes.

The homepage provides five guide entrances. Existing articles have reciprocal links; the fourteen-entry mapping is `integration-map.csv`. Site-wide search includes guide titles, summaries and content. The guide retains its own search, depth dial, atlas, timeline, evidence labels and device-local tools. `hosted-routes.json` lists all interactive/static routes and source IDs. Static pages include sources, component explanations and onward links without JavaScript.

The initial eight new pages cover dystonia, spasticity, ataxia, nerve-pain descriptions, sensory feedback, hereditary spastic paraplegia, dopa-responsive dystonia, and fatigue/sleep. They use nine institutional sources. These are introductory sourced guides, not independently medically reviewed comprehensive treatment reviews. Uncertainty and alternatives remain explicit.

The compiler checks declared claim source IDs, page links, required metadata and some identifier patterns. It does not prove medical accuracy, ensure every factual sentence is annotated, validate every external URL, or guarantee comprehensive redaction. Editorial review remains required. Repeated numbered layers now fail rather than silently replacing content.

Visual artwork is commissioned separately through `GROK_VISUALS_BRIEF.md`; no album image has been automatically downloaded/published. Avoid empty image placeholders. Future generated article rebuilds should retain guide navigation and reciprocal links; check generated output before committing. Existing genetics source links are included where an exact source file was available.

No ChatGPT login, paid AI chat or universal navigation agent is implemented in this package. Search and local worksheets work without such integration.

The subsequent field-guide extension adds five pages: field-guide navigation, dopamine-related intervention comparison, saffron/Mucuna evidence audit, Parkinson introduction and a primary-record case decision page. Total: 43 guide pages and 64 source records. Sources include access limitations; this is a targeted pilot, not an exhaustive neurological or supplement review.

Visuals: @visual ID is compiled from content/visuals.json; public exports live in visuals/web and are copied into site/guide/visuals. Commission originals, holds and review notes remain outside site/. Run both scripts after visual changes. Original defective raster exports are not published.
