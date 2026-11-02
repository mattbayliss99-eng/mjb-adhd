# Claude visual/a11y review addendum v2 — owner screenshot reference
Date: 2026-11-02. Stage only, no live publication. Read VISUAL_EXPERIENCE_SPEC_v2.md and CLAUDE_AUDIT_CHECKLIST_v1.md.

## New reference-design review requirements
Owner provided screenshots of Instagram's topic/story circles, multi-panel image feed and publisher grid, plus X's compact feed, category tabs and side drawer. Refer to their interaction patterns; do not copy screenshots or accept the sensational posts' factual claims.

1. Source fidelity: inspect the latest open PR #8 branch (feature/visual-posts-codex-preview) and compare Grok's actual code patch against the branch's current head; preserve the canonical three editorial IDs. Never assume main already includes PR #8.
2. Brand: check actual /assets/mjb-emblem.jpg top-left and in publisher/avatar, /assets/icon-512.jpg icon source, logo legibility/crop at 48dp and dark launch concept. No brand-hallucinated AI redraw or copied blue verified badge.
3. Topic circles: confirm every circle is a labelled functional URL to an actual category, no fake Stories, fabricated unread states or Instagram gradient identity; screen reader and keyboard test.
4. Gesture priority: Home vertically scrolls; image panels horizontally page; existing finite sequence PR #8 optionally supports post swipes. Test horizontal/vertical gesture angles, swipe setting OFF, Android browser OS-edge back, nested media pointer handling, focus/Arrow keys and selected panel on browser back. No ambiguous double-swipe result.
5. Drawer and gallery: existing nested MJB navigation preserved, keyboard and focus managed, 3-column grid has readable zoom/reflow/list mode, no engagement counts or fake UI links.
6. Evidence and action semantics: clearly label experimental level and source, no misleading implication that red/amber/green prove or disprove medicine effects, all source cues and caveats remain readable and reachable. In social_export.py check any visible metadata truncation even if sidecars keep full words.
7. Test dark/gold, prior reading themes/colour-vision schemes, Bionic, narration, no JS, image-off, 320px/390px, 200% text and screen-reader focus/links. Preserve article URL anchors and return position.
8. Verify rendered screenshot vs concept image vs actual interactive state. CSS view transitions are progressive, must not break focus/history/reduced motion; test perf rather than relying on sheen.
9. If native app designs appear: SplashScreen and adaptive icon follow Android APIs, no artificial launch delay; actual alarm reliability requires Android native implementation and tested permissions. Never let Gemini handle account keys or Play Console credentials.
10. Return reproducible issue register with BLOCKER, MAJOR, MINOR; exact file/line, device/browser/test steps, fix and PASS/FAIL/NOT_RUN. Prioritise three fixes. No production deploy, account creation, messaging or publish.
