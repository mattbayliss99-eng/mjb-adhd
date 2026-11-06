# MJB website — current sources and handoff
Updated 2 November 2026. Start here before asking any model to continue. This is a website-build checkpoint, not a declaration that all research, account work or independent AI workspaces are synchronised.

## Current implementation sources
| Workstream | Current source | State |
|---|---|---|
| Live website baseline | https://github.com/mattbayliss99-eng/mjb-adhd/tree/main | main SHA 8d4030af8fce5f8a2e9ae27e013219e6e48417fc at sync; no main change made |
| Visual posts: latest integration candidate | https://github.com/mattbayliss99-eng/mjb-adhd/pull/8 | OPEN DRAFT; branch feature/visual-posts-codex-preview; do not merge yet |
| Visual posts: matched source snapshot | Commit fa1634389ff67a040d051b2c5727dce1d60360e5 | Git tree 350c6600fb0ab5cd68a68f2e39b1f06e84296d0d exactly matches tested local commit ab1887875e3cdd65f42998fa3ebce80fccaa68ee |
| Visual posts: complete runnable source ZIP | https://drive.google.com/file/d/1WGhQZgsoEKHWiGxegd7e45kdgU_bOJWg/view | Same source snapshot as the commit above; later source-sync documentation may sit on branch head |
| Visual posts patch | https://drive.google.com/file/d/14oz14QQXnhgLmtCZ4Pb7snaGg5YdbZte/view | Applies to recorded main baseline; not an additional feature to apply after checking out PR #8 |
| Visual posts verification | https://drive.google.com/file/d/1b5H62w-V3_zMeI0bnR55-U_Ed9MvIzN6/view | 7 targeted DOM groups + 36 shared reading checks + guide/generator checks passed; browser/real-touch/screen-reader gates OPEN |
| Questionnaire demonstration | https://github.com/mattbayliss99-eng/mjb-adhd/pull/7 | Separate draft feature/questionnaire-hub-preview, head 79631b3ef56d5c7012410f6c204834298494416a at earlier checkpoint; verify branch head before editing; do not merge it into PR #8 silently |
| Terminology flashcards v1.2 | https://drive.google.com/file/d/1y7qyT9uijdwoxJxQ3M8s8rmA4X2JmetP/view | Complete runnable/source bank is in ZIP; not integrated into GitHub site; factual content pending evidence review and browser/download/PDF checks unresolved |
| Claude broader post bank/prototype | https://drive.google.com/file/d/1mpoKIE1Qzb4s1_u4VMP28GGHr8FmjBWp/view | Older broader content/design candidate; 13 drafts, not approved factual copy. PR #8 uses revised editorial IDs MJB-P000001–003. Reconcile other candidate records deliberately. |

Source archive SHA-256: e5e22dd24960ed5f50cf8ddf3a34b5c4c846e7fbdda4cbdd49d44ea6c90e752b (47,370,778 bytes). GitHub's API-created commit has different metadata/SHA from the local commit but the entire Git tree was compared and matches; this is not unverified filename matching.

## Canonical locations
- Website build Drive root: https://drive.google.com/drive/folders/1ETzHWo35idPDhaEqxVCtbPc-PttaPzVx
- Grok assets, originals, repairs, Codex candidate and reviews: https://drive.google.com/drive/folders/1mXPAAIyzoQrR0ni1WPjhzjc0auCs8wC-
- Learning tools / flashcards: https://drive.google.com/drive/folders/1odPca2tsO7t9dqw-g0s4hGDLTdXcvJLj
- Posts bank workspace: https://drive.google.com/drive/folders/1IbQHP7a2kppoQ_mtpHJm9VDHmGokyqG2
- Current task spec: docs/posts-preview/CURRENT_WEBSITE_SPEC_v1_1.md on feature/visual-posts-codex-preview (copied from the consolidated 1 November handoff; existing design requirements retained).
- Gemini Creation Kit: https://drive.google.com/file/d/1pOQkkeeGVJs5qyIBaCIfhNlj0kWd0oSH/view — workflow guidance, not scientific evidence.

## Which package to use
For visual-post implementation, use PR #8's branch or its matched Codex source ZIP. Do NOT restart from GROK_DESIGN_PASS_001.zip or GROK_DESIGN_PASS_001_repair.zip: both are historical reference inputs with reviewed functional defects. Original packages and reviews are preserved; they were not overwritten. The first main-source ZIP is still the live baseline, but does not include the new preview feature.

Native static pages under /posts-preview/ are now the navigation model. Use the three editorial records in content/posts/posts.json as the candidate canonical bank. Do not introduce another independently edited bank for those IDs. No browser pass, clinical approval or illustration-rights clearance is implied by a successful build. Source banks and directories are not evidence passages.

## Continuing with Grok and Claude
Grok/Bot: make assets, editable visual treatments, social-caption alternatives and bounded changes against this exact branch. Record the base SHA, preserve original files and return source/diff plus observations. Prioritise the missing real-browser verification or produce visuals; avoid rewriting the working controller without a demonstrated defect.

Claude/Claude Code: research readable primary sources, audit exact claims and offer alternative synthesis. Label hypotheses, contradictions and missing source content. Work in a separate branch/package and return claim IDs/locators rather than silently editing approved source or clinical interpretations.

GPT/Codex: coordinate content/IDs and source versions, review factual and technical work, run reproducible checks and perform the final authorised release. Do not treat model identity or a PASS checklist as evidence. The owner directs product choices. No other AI session has been messaged or launched by this sync.

## Open gates / next task
Real-browser checks remain pending: 390px, 200% text, keyboard focus, touch/swipe, back/forward/BFCache, article/source returns, reduced motion, shared themes/narration and screen readers. Flashcard/questionnaire downloads/PDF are separate unresolved gates. Visual asset provenance/rights is pending. Do not change main, merge or deploy production while these gates are open.

To get the visual candidate:
```
git clone --branch feature/visual-posts-codex-preview https://github.com/mattbayliss99-eng/mjb-adhd.git mjb-visual-review
cd mjb-visual-review
python3 tools/build_posts_preview.py --check
python3 -m http.server 8000 --directory site
```
Open http://localhost:8000/posts-preview/ in a permitted browser. Existing workspaces: inspect git status and fetch before changing branches; do not reset/clean existing work. No paid API, account setup or new model subscription is required to download the public source.
