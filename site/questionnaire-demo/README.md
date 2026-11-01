# Questionnaire hub: feature preview

This is an additive `/questionnaire-demo/` route. It preserves the original three fictional demo topics, wording and fixed fictional result. The original separate Sites demonstration and downloadable v1 package have not been changed. No real clinical questionnaire, account or answer collection is included.

## Source and runtime
- `questionnaires.v1.json`: schemaVersion 1, catalogVersion 1.0.0; three questionnaire definitions, each with its own stable ID and version 1.0.0. Every question and option has an explicit semantic ID, independent of array order or text labels.
- `definition.js`: dependency-free definition validation and export contract, usable from Node and the browser. Rejects unsupported versions/types, duplicate/missing IDs, required questions and all non-fictional/scored instruments.
- `hub.js`: rendering, in-memory answers keyed by question/option ID, focus movement, progress, back/skip/review/reset and export triggers. One same-origin GET loads the public JSON; no answers are sent with it.
- `hub.css`: component selectors are scoped beneath `#mjb-questionnaire-hub`. Print-only shell exclusions are scoped to `body[data-page="questionnaire-demo"]`. No global tokens or shared styles are replaced.
- `index.html`: uses the actual `/js/accessibility.js`, `/js/navigation.js`, `/js/app.js`, `/js/registry.js`, navigation data and shared styles. No duplicate preference engine. Shared MJB navigation has the desktop pin/left rail and phone drawer. The route is registered through tools/build_navigation.py, and the generated index includes it without removing old routes.

There are no new production dependencies, build step, CDN fonts, API keys or server functions. Serve the repository's whole `site/` directory; this integrated version depends on the shared root-relative MJB assets and is no longer a self-contained single-folder application. Do not replace shared files with the old standalone prototype's assets or settings code.

Shared MJB preferences and navigation pin state are stored by the existing shared scripts. Questionnaire responses are held only in a closure in page memory: no storage, cookies, query parameters, telemetry or submissions. Refresh/close clears responses. Explicit TXT/JSON downloads and print output persist on the visitor's device. Shared Read aloud is user-triggered device speech; some device voices may use an online service. The interface discloses this. No automatic speech is started.

## Versioning and content review
Questionnaire IDs: `mjb-demo-reading`, `mjb-demo-planning`, `mjb-demo-space`.

Question IDs are semantic identifiers such as `page-format`, `initial-detail` and `section-navigation`; option IDs such as `a-bullet-list` stay stable when display ordering changes. A question ID is unique within its questionnaire; an option ID is unique within its question. Use the full questionnaire ID/version + question ID + option ID to identify a response. Never recycle an ID for a different meaning. Keep released versions immutable; issue a new questionnaire version for changes to wording, options, interpretation or behaviour. Bump schemaVersion only when the definition structure becomes incompatible. catalogVersion identifies a catalog release.

Only `demonstrationOnly: true`, `review.status: fictional-demo`, a null real specification and a `fixed-fictional` result with `scoring: none` can load. This is an intentional implementation boundary, not proof that a real questionnaire has been reviewed. Real instruments require a separate reviewed specification and a separate implementation PR: exact authorised wording/licensing, intended population/purpose, item IDs and answer semantics, scoring/missing-answer rules, result wording, accessibility requirements, validation fixtures and reviewer approval. Do not mark an instrument reviewed by editing the JSON flag. No real content has been added here.

## Exports
Export schemaVersion 2 adds questionnaireId and questionnaireVersion; responses carry questionId, optionId, visible wording/labels, and skipped/null fields. JSON also includes demonstrationOnly and a fictional fixed result. TXT includes the same IDs/version in readable form. Print results include questionnaire ID/version and every question/selected option ID. There is no direct PDF generator; the Print button uses the browser dialog's Save as PDF option.

## Preview workflow
Work remains on `feature/questionnaire-hub-preview`; do not merge to main until reviewed. Main is production per the repository README. Netlify still publishes `site/`; `_headers`, `_redirects`, domains and deployment config are unchanged. A draft PR can generate a Netlify Deploy Preview. The existing Sites publication is preserved rather than republished.

Local preview from repository root:

    python -m http.server 8766 --bind 127.0.0.1 --directory site

Open http://127.0.0.1:8766/questionnaire-demo/ . Existing root-relative navigation links remain within the same preview origin.

Checks:

    node --check site/questionnaire-demo/hub.js
    node --check site/questionnaire-demo/definition.js
    node tools/check_questionnaire.cjs
    python -X utf8 tools/build_navigation.py
    git diff --check

Use Python UTF-8 mode on Windows for the existing navigation generator. It regenerates navigation data and the no-JavaScript topic index. The new page deliberately sets data-sectioned so shared detail controls cannot hide form controls or results; shared refresh is called after each render to enhance new content and stop stale speech. The optional Listen button appears on the topic/result headings; page-level reading controls are also available.

See VERIFICATION.md for observed checks and remaining release blockers, especially the unverified final PDF/download browser flow. Keep noindex while this is a demonstration.
