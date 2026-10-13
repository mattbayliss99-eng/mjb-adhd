# Navigation and visual pilot — review handoff

This candidate adds a category menu to the regular website, with the current page and ancestor path, a shared site/guide hierarchy, and a broader search index. Select one category to reveal children; other sibling branches close. On wide screens the reader can pin the sidebar. The compact alternative uses `?navlayout=compact`; the rail can be explored with `?navlayout=rail`. These are preview choices, not a production publish.

## Review entry points

- Home and ordinary articles: open Navigation, change categories, then close without losing reading position.
- `/science/genetics/gen-03/`: deep-page location and vesicle-loading pilot.
- `/guide/index.html#/n/no-prescriber`: cross-link into the guide; current path must read Getting care.
- `/science/process-atlas/`: four reviewed coded figures; enlargement, text explanations and source links.
- `/support/relatable-examples/`: three original meme-style vector cards.
- `/navigation/`: browsable topic index that works without JavaScript.

## Included source work

The working branch starts at the 12 October accountability revision `62acfa66f6b3f83bed1e8b239ad6bfff827a790e`; its existing 68-file change remains included. GitHub main/live was `5b228c773f44c7e2482270673f8df5c2b906ac08` at the baseline check. The existing accountability PR #5 is not merged by this run.

## Validation

13 browser journeys passed on Chromium: regular deep paths; category collapse/selection; guide hash and static paths; focus/scroll restoration; header search; keyboard page finder; mobile overflow; desktop pin and narrow-screen fallback; compact alternative and Ink/Paper/Terminal/Contrast; scientific images/text/enlargement; relatable images; JavaScript error check; no-JavaScript index. The guide's 49 pages, 139 claims, 104 sources and 80 links pass source validation. All 85 indexed destinations and 135 route/alias records were checked; pilot image files exist. `git diff --check` passes.

No physical Android/TalkBack or actual Lenovo tablet mouse testing has been performed. The user should assess the preview before final release. General navigation guidance informed the pattern; no measured MJB visitor study is claimed.

## Figure scope

Only F00, F04, F36 and F39 are staged. F04 and F39 wording corrections are recorded; the original ZIP is untouched. See ATLAS_REVIEW.md and figure-review-register.json for sources and limits. 37 other figures remain outside public assets. No BioRender publication rights are assumed. No personal/private photographs or health logs are included.

## Research lead

The supplied ScienceDaily URL is retained in GENETICS_RESEARCH_LEAD_261012185008.md. Fetching is blocked and the primary paper has not been identified; no substitute article was added as if it were the requested one. This does not change accepted genetics-engine code or tests.

## Repeatable maintenance

Run the relevant page generators first. `tools/stage_atlas.py` takes the original ZIP and writes the selected corrected SVGs; rasterise those exact SVGs with sharp. `tools/build_relatable_examples.py` regenerates the original cards. `tools/build_navigation.py` runs last to refresh hierarchy/search and hosted-page integration. The separate offline guide remains self-contained.

Release still requires the user's acceptance of the concrete candidate. A main merge would deploy the combined accountability/navigation/visual update through Git CD. No production deployment, outreach send or Drive migration is performed in this run.

Hosted preview: https://deploy-preview-6--mjb-adhd.netlify.app/science/genetics/gen-03/

Draft PR: https://github.com/mattbayliss99-eng/mjb-adhd/pull/6

Initial hosted checks confirmed navigation scripts and the F04 image; cloud browser verified its drawer/current path. Refreshed gallery-page verification is pending the follow-up deploy. A follow-up fixes depth metadata on new pages and rewrites production-note captions for readers while retaining original captions in metadata. The ScienceDaily intake note is also filed in the genetics discovery inbox and verified by metadata readback; accepted engine/queue records were not changed.
