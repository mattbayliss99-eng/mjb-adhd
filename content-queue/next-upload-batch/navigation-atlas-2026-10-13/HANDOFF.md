# Expanded navigation and visual release — S6 review handoff

This candidate combines the prior accountability update with the regular-site category menu, visible topic path, shared search, all 41 scoped atlas figures, nine original relatable images and four practical visual guides, plus the first-person article “When understanding is not enough”. Production remains unchanged. No email was sent by this work.

## Review entry points

- Atlas hub: https://deploy-preview-6--mjb-adhd.netlify.app/science/process-atlas/
- BH4 route/species distinctions: `/science/process-atlas/f37/`.
- Dexamfetamine experimental versus clinical scope: `/science/process-atlas/f40/`.
- Menu depth: open Navigation from either topic page; current ancestors are revealed and only the selected sibling group opens.
- Memes: `/support/relatable-examples/` (nine original examples).
- Lived experience: `/support/when-understanding-is-not-enough/`; linked from quick starts, navigation/search and sitemap. The supporting journal is not part of the public page.
- Useful explanatory images: `/support/visual-guides/` (four practical guides).
- Regular article placement: `/science/what-is-adhd/`, `/science/genetics/gen-03/`, `/compounds/`, `/support/quick-starts/`.
- Guide equivalence: `/guide/index.html#/n/no-prescriber`; no-JavaScript index: `/navigation/`.

## Source and rights scope

The four original pilot diagrams remain. The other 37 are independently recreated code-native SVGs with narrower, explicitly stated educational scope where needed. Original ZIPs are unchanged; no BioRender artwork/editor links are copied. The five source gaps are filled. Sources include primary study records/abstracts, curated Reactome event summaries and official product/reference text. Not every research full text was accessible. This is AI-assisted checking, not independent expert validation or an individual medical conclusion. See ATLAS_REVIEW.md, atlas-recreated-specifications.json and the source/review registers for exact content and limits. All release_approved flags remain false until final user review.

## Verification and maintenance

41 figure-page journeys and actual-browser SVG geometry checks passed locally. All 37 recreated diagrams and all 13 meme/guide images have no detected clipped/overlapping text. All 13 navigation journeys pass. Guide content validation passes: 49 pages, 139 claims, 104 sources, 80 links. Actual Android/TalkBack or Lenovo tablet mouse testing has not been performed. Hosted verification on 14 October passed all 198 checked pages/assets, including all 41 figure pages. Implementation commit: `64213188697acc5317d4be96b74daa076861f6af`; exact remote/local tree: `95ad60e26cc767abac1088b408362f38eae9dc61`; ready Netlify preview deploy: `6acf6fc1035d55f76071118b`. The immutable preview is https://6acf6fc1035d55f76071118b--mjb-adhd.netlify.app. Comparison was exact bytes for assets, and HTML event equality allowing only equivalent guide hash-link rewriting. Interactive browser checks were not repeated during this recovery because browser-control infrastructure was unavailable; previous local reports remain valid for their recorded scope. Consult CHECKPOINT.json and hosted-preview-checks.json for details.

Run relevant source/page generators first; then atlas_catalog.py, recreate_atlas.py, render_atlas.cjs, build_relatable_examples.py, build_visual_guides.py, place_visuals.py and build_navigation.py last. README records dependencies. The offline guide remains self-contained. Private correspondence/audit records are outside this public repository. Accepted genetics engine/queue records are unchanged; the ScienceDaily lead remains pending.

## Release control

The existing draft PR #6 is https://github.com/mattbayliss99-eng/mjb-adhd/pull/6. Main/live baseline remains 5b228c773f44c7e2482270673f8df5c2b906ac08. A merge deploys the combined candidate through Git CD; PR #5 must not be separately merged on top without reviewing overlap.

S6 next: user phone/tablet review of the verified expanded preview. All 202 changed paths were uploaded successfully; no upload remains outstanding. Navigation contains 128 searchable destinations and 178 route/alias records. A later checkpoint-only commit does not change the deployed website files. S7: publish the reviewed authorised revision before 15:00 Europe/London on its release day; if missed, carry it to the following day. Website-announcement email follows verified live publication and approval of the exact message/recipients. S8 Ryan Swain draft remains held. No live deployment or external send has occurred.
