# Final design and accessibility pass — 14 October 2026

Status: draft preview candidate; production and outreach held pending review and default text-colour choice.

## Implemented

- Shared main/guide/static navigation header. The emblem sits inside Navigation; MJB ADHD is centred in the header and prominently on the home page. Guide-specific tools remain available in an optional disclosure.
- Black base, deep purple section surfaces, gold headers and accents. White text is provisional; `?palette=purple-green` offers the alternative for owner selection.
- Six profiles; deuteranopia, protanopia, tritanopia and monochrome label palettes. Evidence types retain text and border distinctions. Figure artwork is unchanged and retains written descriptions.
- Separate custom page text, panel/menu text, backgrounds, headers and link colours; optional global text colour. Font, size, spacing, line-width, reduced-motion and bold-word-start choices persist on the device.
- Min / Medium / Max controls share preferences. Guide sections remain in the same order; additional detail opens within them. Actions, hypothesis/contested/missing-source qualifications and emergency notices remain available. Ordinary articles have corresponding progressive sections. Source anchors reveal hidden source content.
- User-initiated section read-aloud, device voice list, 0.5–2× rate, inline pause/resume/stop and voice settings. Route changes stop playback. No autoplay. Some device voices use online speech services; availability varies by device.
- Animation control moved below the image, larger home title/banner presentation, natural topic-specific headings and the requested interruptions wording.
- Existing formulations route expanded from the owner-provided draft, with retrospective first-person observations and explicit separation from causal claims. Manufacturer examples do not identify the earlier dispensed generic product.
- No-JavaScript static reading remains available; standalone offline guide includes the reading preferences module.

## Validation and limits

16 DOM integration checks passed, including all 48 guide article/hub routes plus guide home, shared persistence, presets, colour controls, detail sections, source orientation and mocked speech controls. All six preset page/panel text pairs exceed 7:1; header/panel pairs exceed 4.5:1. Custom combinations display a contrast readout; no claim of full WCAG conformance is made.

Guide validation: 49 pages, 140 labelled claims, 110 sources, 80 links. All 131 HTML pages have shared reading assets and no missing referenced stylesheet/script files. JavaScript syntax and Git whitespace checks pass. Previous diagram reviews are preserved; SVG/PNG/WebP artwork was not changed.

DOM tests do not render layout or validate real device speech. Fresh physical Android/tablet, TalkBack, large-text layout and actual voice playback review remain required. The required browser-control preview facility is unavailable in this recovery environment.

## Sources checked in original text

- MDN SpeechSynthesis: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- W3C use of colour: https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
- EMA excipient definition and effects: https://www.ema.europa.eu/en/human-regulatory-overview/marketing-authorisation/product-information-requirements/excipients-labelling
- Amfexa / Medice 5 mg section 6.1: https://www.medicines.org.uk/emc/product/5004/smpc
- Amfexa / Medice 10 mg section 6.1: https://www.medicines.org.uk/emc/product/7403/smpc
- Amfexa / Medice 20 mg section 6.1: https://www.medicines.org.uk/emc/product/7404/smpc
- Brown & Burk 5 mg section 6.1: https://www.medicines.org.uk/emc/product/11004/smpc
- Elvanse conversion, sections 5.1/5.2: https://www.medicines.org.uk/emc/product/14089/smpc

Next: verify the matching deploy, then owner compares white/green text and exercises Navigation, reading settings and Listen on the actual devices. Publish only the authorised reviewed revision within the recorded release window.
