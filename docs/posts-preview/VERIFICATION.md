# Verification — Codex visual-posts preview
1 November 2026. PASS means only the stated executed scope. No browser verification or accessibility certification is claimed.

Environment: Node v24.22.1, jsdom 30.1.3, Python 3. Base main SHA: 8d4030af8fce5f8a2e9ae27e013219e6e48417fc.

| Check | Result | Evidence |
|---|---|---|
| Original reported navigation defect | Reproduced | Test-first check against Grok repair failed: BUTTON rather than an ordinary next A link. Subsequent tests exercise actual generated pages and controller with jsdom. |
| All three static pages / native endpoints | PASS | `tests/posts-preview.cjs`; visible post, correct per-page previous/next, 1/2/3 position. No JS-dependent hidden content. |
| Scoped arrows, form controls, modifiers | PASS (DOM) | Actual controller dispatches correct native destination; controls and modified keys are left alone. Native document navigation itself is not simulated by jsdom. |
| Sequence arrival focus | PASS (DOM) | Arrival request focuses visible title, consumes request and resets saved stale scroll to zero. Test first reproduced incorrect restoration of 340 before the fix. |
| Optional gestures | PASS (DOM) | Synthetic events: off means no navigation; horizontal enabled gesture follows native destination; vertical, interactive, initial multitouch and touchcancel cases do not. This does not prove real device gesture behaviour. |
| Saved return/reload scroll | PASS (DOM) | Saved 340 restored; explicit fragment is not overridden. Native history/BFCache unverified. |
| Shared shell on 4 preview routes | PASS (DOM) | `tests/posts-preview-integration.cjs`: local dependencies resolve, real shared engines build header/reading controls, current entry, navigation opens/closes and returns focus, settings and reading level work. Initial missing shelf-current entry was caught and corrected. CSS responses intentionally omitted from DOM execution; no visual styling inference. |
| Query-gated article return | PASS (DOM) | Known ID yields correct local return URL; no query or arbitrary external URL yields no banner. |
| Existing shared reading suite | PASS, 36 checks | `tools/check_reading.cjs`, including original home/guide/static/article paths, palette/contrast logic, reading preferences, narration lifecycle and routing. This suite uses DOM/stubbed speech and cannot establish real browser/assistive-tech behaviour. |
| Guide content | PASS | `node guidebook/tools/build.mjs --check`: 49 pages, 140 claims, 110 sources, 80 links. |
| Generator output current | PASS | `python3 tools/build_posts_preview.py --check`. |
| Local route/dependency/fragment graph | PASS | Python HTMLParser resolved all new HTML href/src paths and explicit HTML fragment IDs against the full site tree. No external-source reachability or claim-support certification. |
| JS syntax | PASS | `node --check` on sequence.js, article-return.js and generated navigation-preview.js. |
| Article factual prose | Unchanged | Diff adds a Sources heading ID and a query-gated script reference only; no scientific sentence edited. |
| Browser navigation / real touch | NOT_RUN | Remote browser in this session could not reach local server and rejected file URLs. No workaround, tunnel, alternate browser automation or lower-level command used. |
| 390px layout / 200% text / reduced motion / themes visually | NOT_RUN | Component uses flexible shared-variable styles and no animation; source properties do not establish rendering. |
| Real-browser history, focus, narration, screen readers | NOT_RUN | Required before signoff. |
| Existing browser suites (navigation and atlas) | NOT_RUN | Require browser automation unavailable under the observed session boundary; no failures concealed as passes. |
| Download / PDF output | OUT OF SCOPE | No such control added or changed in this component; earlier flashcard/questionnaire gaps remain unresolved. |

The repo has no npm test script or single aggregate suite. The relevant available DOM suite and guide validation were run. Tests are included so an appropriately equipped local Codex session can reproduce them. Candidate is runnable for review, not release-approved. No production deployment or remote push performed.
