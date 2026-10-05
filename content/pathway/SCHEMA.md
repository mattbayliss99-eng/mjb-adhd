# Pathway model

`model.json` is the single source for `/science/pathway/`. `tools/build_pathway.py` turns it into the page and into `source-to-edge.csv`. The page has the complete text without JavaScript, plus the same data for the interactive graph. After editing the JSON, run:

    python3 tools/build_pathway.py
    python3 tools/build_library.py

The second command puts the library block back at the foot of the page.

The model is a teaching map of one dopamine-releasing nerve cell in the brain, and of what happens to the dopamine it releases. Selecting a node means "reading this explanation". It never means unlocking, activating, measuring or scoring anything. Keep `status` as `review` until the owner signs the page off.

## Fields

- **sources**: keyed records with `cite`, `doi`, `pmid`, `pmcid` and `read` (what was actually read: full text, abstract, or as cited elsewhere).
- **lanes**: display groups, in reading order (`main`, `support`, `after`, `branch`).
- **nodes**: these fields:
  - `id`: stable; links use `#n-<id>`
  - `kind`: `process`, `support` (cofactor or energy), `feedback`, or `branch` (context only)
  - `lane`, `row`, `col`: desktop grid position; layout only
  - `title`, `short`, `what`
  - `needs`: cofactors or supports
  - `tier`: for the biology (A to D, as defined on GEN-00)
  - `adhd`: `{text, tier}`, kept separate from the biology
  - `medicines`: understanding only, never a recommendation
  - `limits`
  - `refs`: `[{source, loc, quote}]`
  - `route`: further reading
  - `icon`: decorative role only
- **edges**: these fields:
  - `id`, `from`, `to`; the direction is the direction of the process or influence
  - `rel`: what the arrow means: `transport`, `supply`, `conversion`, `packaging`, `release`, `binding`, `reuptake`, `breakdown`, `cofactor`, `gradient`, `energy`, `feedback` or `branch`
  - `style`: drawing class: `step` (solid arrow), `support` (dotted), `feedback` (dashed) or `branch` (thin)
  - `label`, `explain`, `tier`, `refs`, `caveat`
- **omitted**: connections deliberately left out, with the reason.

Unsourced connections are left out entirely. They are never drawn faintly as a "maybe". Genetic association is not drawn as an edge; it lives in each node's `adhd` text.
