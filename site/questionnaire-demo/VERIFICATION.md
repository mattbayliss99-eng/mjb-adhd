# Verification — 1 November 2026

## Passed
- JavaScript syntax for definition.js and hub.js; git diff whitespace check.
- Six dependency-free regression groups: all questionnaire IDs/versions and exported question/option IDs; skipped/null export values; fixed result regardless of answers; rejection of malformed/duplicate IDs and non-fictional/scored definitions; ID stability when order changes; scoped CSS; direct shared control imports; absence of answer storage/submission; preservation of all pre-existing navigation destinations.
- Navigation generator completed in Python UTF-8 mode. Diff adds the demo to shared navigation and the no-JavaScript topic index without removing or renaming existing destinations.
- Actual local browser: neutral Reading questionnaire through results. Enter activates topic and Next; Tab enters radio group; ArrowDown selects the next option; Space activates Back/Skip and radio selection. Back preserved selection; question and result focus moved to new content; skipped question and selected answer displayed correctly.
- Shared navigation: demo highlighted as current; desktop Keep visible pins the actual left navigator; mobile switches the rail to the shared drawer; Escape closes it and returns focus to navtoggle.
- Shared full accessibility dialog available, including custom/vision palettes, font, size, width, bionic reading, motion, detail and audio. Monochrome, 150% size, serif, narrow width and bold word beginnings visibly applied to the component. Settings dialog closes with focus back on Reading settings. These were localhost preferences, not production changes.
- Mobile viewport 390 x 844 with those enlarged preferences: document scroll width 375px within 390px viewport; desktop width 1265px within 1280px viewport. No horizontal overflow in tested states.
- Chrome separately loaded the integrated final shell. Topic and results contained shared Listen controls, questionnaire ID/version, question IDs, option IDs and the fixed fictional result.

## Remaining verification limits — do not treat as passed
- The Print button was invoked in Chrome, but browser automation timed out during window.print. Native inspection was then stopped by the computer-use safety check because the active browser URL could not be determined reliably. No final PDF was saved or inspected. Print CSS is implemented and scoped; printed/PDF output remains a pre-merge verification requirement.
- TXT/JSON payloads and metadata pass source/contract checks. The original standalone v1 downloads were verified in the prior task, but actual browser downloads of this revised integrated version were not completed before computer use stopped. Do not use the earlier download success as verification of this new build.
- Shared Listen controls and speech integration are present, but audio playback was not exercised. Custom colour editing, every palette, forced colours, complete keyboard-only traversal, all browsers and a screen reader were not exhaustively audited. No WCAG conformance claim.

## Pre-merge checks
1. On the feature Deploy Preview, complete a sample with one skipped answer; download TXT and JSON and confirm IDs/version, choices and skipped null values.
2. Print the result via Save as PDF. Inspect every page for complete questions/answers, the fictional notice and IDs/version; confirm menus, buttons, reading tools and warning chrome are absent. Test a skipped-all result and enlarged reading preferences.
3. Verify keyboard traversal end to end, screen-reader announcement, mobile at enlarged text, and existing navigation/reading preferences on an unrelated page.
4. Real questionnaire specifications require separate review and implementation. This branch accepts fictional demos only.
