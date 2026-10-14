# Final design and accessibility pass — 14 October 2026

Status: published after explicit owner approval. Purple/green and roomier spacing are the selected defaults. Production commit `69cf8112380305eee14efaf4f070a353cad26e2f`, Netlify deploy `6acfbb34d3b9f30aa6355b37`, published 14 October at 18:26 BST. All 164 live-domain checks pass; website tree exactly equals the reviewed preview. See LIVE_RELEASE_2026-10-14.md. Earlier preview/hold records below are historical. Outreach remains separate and was not sent.

## Profile correction after the 17:51 phone report

The owner reports that main colour profiles do not apply properly while the other features work. Reproduction identified three defects: (1) selecting Paper after a colour-vision scheme retained that scheme and the global-colour override, so the selected button did not correspond to the effective palette; (2) the original `?palette=purple-green` comparison URL reapplied green on every reload after another selection; (3) old Bionic CSS imposed pale `#F4EBD4` on bold word beginnings even in Paper, whose normal text is dark. A stylesheet cascade check also found fixed gold form labels and utility controls.

Selecting a profile now applies its exact palette and resets colour-vision/global-colour overrides. A reader can choose a vision scheme afterwards. Custom colours and their own global-text setting remain stored separately and return when Custom is selected. Comparison links apply once, consume only the palette parameter, and preserve other query parameters and the fragment. Bionic word beginnings inherit the surrounding text colour. Legacy form labels and utility elements use the active profile variables.

36 DOM/style-cascade integration checks pass, including all previous routes/audio/search checks plus exact palette values over conflicting saved settings, Custom setting restoration, comparison-link/reload behaviour, Bionic colour inheritance using the actual stylesheets, and legacy form/control styles. Report: `profile-fix-checks-2026-10-14.json`. Guide rebuild and JavaScript syntax/whitespace checks pass. Rendered layout and physical device confirmation of this fix are pending.

Profile-fix implementation: `8f8227c8b0a0e49e8725642ce4b7aaf88429b81c`; exact staged/uploaded tree `db115874a1f3c7e01beae2d67e072ab0c2a1d7d2`; website subtree `94ac5e4c4d678edf1c6451702eb70158535a5e42`. Netlify deploy `6acfb51c097c2b8bd683c382` is ready in deploy-preview context and matches the implementation. Immutable preview: https://6acfb51c097c2b8bd683c382--mjb-adhd.netlify.app/. Targeted hosted verification passes for 12 shared assets and representative pages; the changed CSS/JavaScript match exact bytes and HTML comparisons allow equivalent resolved links. Report: `profile-fix-hosted-preview-checks.json`. Earlier 136-file verification remains historical evidence for unchanged pages. Checkpoint-only follow-up changes no website files. Production and outreach remain held.

## Final preference refinement

- Owner reports that all voiceover controls work perfectly on the phone. New visits now use purple/green and More space; existing saved spacing, Bionic choice and other preferences remain intact. Bionic remains optional.
- The profile grid offers Purple/green, Purple/white, Warm paper/dark ink, Plain dark/white, and Custom. Custom has four main colour controls (page, section, text, headers) and optional raised-panel, panel-text, link, muted-text and border controls. Trying another preset preserves the saved Custom palette. Removed presets migrate to Custom without losing their colours.
- Deuteranopia, protanopia, tritanopia and monochrome now apply complete webpage palettes, including page background, sections, raised controls, text, headers, links and borders. Each has dark and light variants. Written evidence labels and border patterns remain. Artwork and diagrams retain their original palettes and written equivalents; the schemes are readable alternatives rather than a colour-vision diagnosis or correction.
- All available UK voices are grouped first, followed by other English and other-language voices. Automatic selection prefers UK English; selected voice language is passed to narration. The browser's device voice list limits the number available; no synthetic or unavailable UK entries were added.
- Main and guide Search buttons and fields have magnifying-glass icons; labels and native input semantics remain intact. Bionic formatting no longer inserts spaces inside words in read-aloud extraction.

32 DOM integration checks pass, including all 48 guide article/hub routes, complete vision palettes, profile persistence/legacy migration, UK variants and selected language, main/guide Search, Bionic whole-word narration and prior audio transports. All four presets and all eight dark/light vision schemes meet 7:1 for main text on page/section/raised backgrounds; headings and links meet 4.5:1 on sections. All 131 hosted HTML pages use purple/green and roomier no-script defaults with available shared scripts/styles. Guide validation passes: 49 pages, 140 claims, 110 sources, 80 links. JavaScript syntax and whitespace checks pass. Report: `preference-checks-2026-10-14.json`.

Final preference implementation: `c606a9f60df2cb4fca24614f329565a0a8ab14d8`; exact staged/uploaded tree `416a3a64aa5ee911a1f8e0b4a307658bbcc93557`; website subtree `fff1b8c43358d7f4ac62a1cf2980182df927933c`. Netlify deploy `6acfafe455ca4c8abcc204c2` is ready in deploy-preview context and matches the implementation commit. Immutable preview: https://6acfafe455ca4c8abcc204c2--mjb-adhd.netlify.app/. Hosted verification passes for all 136 changed website files, including 131 HTML pages and five shared/generated assets. JavaScript/CSS compare byte-for-byte; HTML comparison permits equivalent resolved index.html links and observed Netlify form-registration processing. Report: `preference-hosted-preview-checks.json`. Checkpoint-only follow-up changes no website files. Production and outreach remain held.

## Implemented

- Shared main/guide/static navigation header. The emblem sits inside Navigation; MJB ADHD is centred in the header and prominently on the home page. Guide-specific tools remain available in an optional disclosure.
- Black base, saturated violet section surfaces (`#2b1244`, raised `#3b1b58`), gold headers and accents, and green text (`#7ee2a0`) are the selected default. The owner's animation screenshot informed the brighter violet hue. Purple/white remains an alternative. Existing custom colours are preserved.
- Four presets and Custom; deuteranopia, protanopia, tritanopia and monochrome whole-page palettes. Evidence types retain text and border distinctions. Figure artwork is unchanged and retains written descriptions.
- Separate custom page text, panel/menu text, backgrounds, headers and link colours; optional global text colour. Font, size, spacing, line-width, reduced-motion and bold-word-start choices persist on the device.
- Min / Medium / Max controls share preferences. Guide sections remain in the same order; additional detail opens within them. Actions, hypothesis/contested/missing-source qualifications and emergency notices remain available. Ordinary articles have corresponding progressive sections. Source anchors reveal hidden source content.
- User-initiated section read-aloud with a player immediately beside its heading: Play / Pause / Resume / Replay, Stop, previous / next passage and a keyboard-operable position slider. Speed (0.5–2×) and device voice selection sit in an optional disclosure within the same player. Section switching, detail changes and navigation stop earlier narration. Whole-page playback places its player beside the page toolbar and closes settings so controls are visible. No autoplay.
- Device narration seeks between passages; times are explicitly estimated from word count and speed. Pause cancels the current utterance and resumes from the last reported word boundary, avoiding reliance on native pause/resume behaviour. Voices without boundary events repeat the current passage. Exact time seeking requires prerecorded audio; MP3 generation and word highlighting are deferred. Some device voices use online services; availability varies by device.
- Animation control moved below the image, larger home title/banner presentation, natural topic-specific headings and the requested interruptions wording.
- Existing formulations route expanded from the owner-provided draft, with retrospective first-person observations and explicit separation from causal claims. Manufacturer examples do not identify the earlier dispensed generic product.
- No-JavaScript static reading remains available; standalone offline guide includes the reading preferences module.

## Validation and limits

32 DOM integration checks passed. The expanded final preference checks are described above and retain the prior audio checks for player placement, control-text exclusion, boundary-aware resume, no-boundary fallback, passage seeking, slider dragging, speed/voice changes while paused, completion/replay, page-player reuse, unavailable speech and stale callback cancellation. Custom combinations display a contrast readout; no claim of full WCAG conformance is made. Current report: `preference-checks-2026-10-14.json`; prior audio report: `audio-checks-2026-10-14.json`.

Guide validation: 49 pages, 140 labelled claims, 110 sources, 80 links. All 131 HTML pages have shared reading assets and no missing referenced stylesheet/script files. JavaScript syntax and Git whitespace checks pass. Previous diagram reviews are preserved; SVG/PNG/WebP artwork was not changed.

DOM tests do not render layout or validate real device speech. The owner now reports that all audio controls work perfectly on the phone. Final preference layout, tablet, TalkBack and large-text review remain distinct from that confirmation. The required browser-control preview facility is unavailable in this recovery environment.

## Sources checked in original text

- MDN SpeechSynthesis: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- MDN boundary events (word positions vary by browser/voice): https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/boundary_event
- MDN audio media controls (recorded audio option): https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio
- W3C use of colour: https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
- EMA excipient definition and effects: https://www.ema.europa.eu/en/human-regulatory-overview/marketing-authorisation/product-information-requirements/excipients-labelling
- Amfexa / Medice 5 mg section 6.1: https://www.medicines.org.uk/emc/product/5004/smpc
- Amfexa / Medice 10 mg section 6.1: https://www.medicines.org.uk/emc/product/7403/smpc
- Amfexa / Medice 20 mg section 6.1: https://www.medicines.org.uk/emc/product/7404/smpc
- Brown & Burk 5 mg section 6.1: https://www.medicines.org.uk/emc/product/11004/smpc
- Elvanse conversion, sections 5.1/5.2: https://www.medicines.org.uk/emc/product/14089/smpc

Prior audio/colour implementation: `ff15187ac2b0dbdc9df795698bcc215cc721786d`, tree `a30502ceeb5a1e6651eab2c64f9632fddab52b3b`. Netlify deploy `6acfa2f55d4a377dd5158856` is ready and matches that commit. Immutable preview: https://6acfa2f55d4a377dd5158856--mjb-adhd.netlify.app/. Hosted verification passed for 12 affected/shared assets and representative main, guide, static, atlas, genetics, experience and navigation pages. Assets compare byte-for-byte; HTML permits equivalent resolved index.html links. Report: `audio-hosted-preview-checks.json`.

Prior hosted verification passed for 151 pages/assets at implementation 7dbc346518df9b50a1db05860f45ecfc72433fdd, deploy 6acf894c465c4229423bdb95, including observed Netlify form-registration processing. Main and its production deployment remain held.

Next: owner reviews the final custom/colour-vision settings and Search. Publish only the authorised reviewed revision within the recorded release window. Purple/green and roomier spacing are selected; the earlier default-choice item is resolved.
