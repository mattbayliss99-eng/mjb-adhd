# Final design and accessibility pass — 14 October 2026

Status: draft preview candidate; production and outreach held pending review and default text-colour choice.

## Implemented

- Shared main/guide/static navigation header. The emblem sits inside Navigation; MJB ADHD is centred in the header and prominently on the home page. Guide-specific tools remain available in an optional disclosure.
- Black base, saturated violet section surfaces (`#2b1244`, raised `#3b1b58`), gold headers and accents. The owner's animation screenshot informed the brighter violet hue. Green text is darker and less pale (`#7ee2a0`). White text is provisional; `?palette=purple-green` offers the alternative for owner selection. Existing custom colours are preserved.
- Six profiles; deuteranopia, protanopia, tritanopia and monochrome label palettes. Evidence types retain text and border distinctions. Figure artwork is unchanged and retains written descriptions.
- Separate custom page text, panel/menu text, backgrounds, headers and link colours; optional global text colour. Font, size, spacing, line-width, reduced-motion and bold-word-start choices persist on the device.
- Min / Medium / Max controls share preferences. Guide sections remain in the same order; additional detail opens within them. Actions, hypothesis/contested/missing-source qualifications and emergency notices remain available. Ordinary articles have corresponding progressive sections. Source anchors reveal hidden source content.
- User-initiated section read-aloud with a player immediately beside its heading: Play / Pause / Resume / Replay, Stop, previous / next passage and a keyboard-operable position slider. Speed (0.5–2×) and device voice selection sit in an optional disclosure within the same player. Section switching, detail changes and navigation stop earlier narration. Whole-page playback places its player beside the page toolbar and closes settings so controls are visible. No autoplay.
- Device narration seeks between passages; times are explicitly estimated from word count and speed. Pause cancels the current utterance and resumes from the last reported word boundary, avoiding reliance on native pause/resume behaviour. Voices without boundary events repeat the current passage. Exact time seeking requires prerecorded audio; MP3 generation and word highlighting are deferred. Some device voices use online services; availability varies by device.
- Animation control moved below the image, larger home title/banner presentation, natural topic-specific headings and the requested interruptions wording.
- Existing formulations route expanded from the owner-provided draft, with retrospective first-person observations and explicit separation from causal claims. Manufacturer examples do not identify the earlier dispensed generic product.
- No-JavaScript static reading remains available; standalone offline guide includes the reading preferences module.

## Validation and limits

23 DOM integration checks passed, including all 48 guide article/hub routes plus guide home, shared persistence, presets, colour controls, detail sections, source orientation and mocked speech. Audio checks cover player placement, control text exclusion, boundary-aware resume, no-boundary fallback, passage seeking, slider dragging during playback, speed/voice changes while paused, natural completion/replay, whole-page player reuse, unavailable speech and cancellation of stale callbacks. All six preset page/panel/raised-panel text pairs exceed 7:1; header/panel pairs exceed 4.5:1. Custom combinations display a contrast readout; no claim of full WCAG conformance is made. Current report: `audio-checks-2026-10-14.json`.

Guide validation: 49 pages, 140 labelled claims, 110 sources, 80 links. All 131 HTML pages have shared reading assets and no missing referenced stylesheet/script files. JavaScript syntax and Git whitespace checks pass. Previous diagram reviews are preserved; SVG/PNG/WebP artwork was not changed.

DOM tests do not render layout or validate real device speech. Fresh physical Android/tablet, TalkBack, large-text layout and actual voice playback review remain required. The required browser-control preview facility is unavailable in this recovery environment.

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

Prior hosted verification passed for 151 pages/assets at implementation 7dbc346518df9b50a1db05860f45ecfc72433fdd, deploy 6acf894c465c4229423bdb95. The current audio/colour refinement is pending its separate ready-preview check. Assets compare byte-for-byte; HTML permits equivalent resolved index.html links and observed Netlify form-registration processing.

Next: owner compares white/green text and exercises Navigation, reading settings and Listen on the actual devices. Publish only the authorised reviewed revision within the recorded release window.
