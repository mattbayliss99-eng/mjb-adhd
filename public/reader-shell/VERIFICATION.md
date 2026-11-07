# Verification — Grok reader shell

Run: `node public/reader-shell/check.mjs` on 5 November 2026.
File opened from a `file://` URL in headless Chromium. No page errors and no console errors.
Physical phone: NOT_RUN. Screen reader: NOT_RUN.

| ID | Result | Evidence | What was done | What happened |
|---|---|---|---|---|
| R01 | PASS | browser | Open the default page | One reader. Image and point in the upper panel, explanation in the lower panel. No nested feed. |
| R02 | PASS | browser (T03) | Drag, arrow key, Enter, click | Ratio 46→62 on drag, overlay stayed shut. Arrow then Enter opened controls. A later click did too. Hit area 44 CSS px. |
| R03 | PASS | browser (T02) | Step 1→2, move the image, step onward | Step 2 selected its own image. A manual image stayed put on the next step. |
| R04 | PASS | browser (R-extra) | Reach the last step | Next disabled, Previous still available. Swipe switch unchecked. The swipe gesture itself was not performed on a touch screen. |
| R05 | PASS | browser (T06) | Save, leave, return, reload, force a failed write | “Saved… does not mark it as read.” The other topic was not saved. Return and reload kept the step and the star. A forced failure left the star unchanged and said it could not save. |
| R06 | PASS | browser (T04, T05) | Open evidence | Full brief title, date/type line, and the limit that it does not establish clinical benefit. The qualification string appeared once in the article, beside the claim. |
| R07 | PASS | browser (T05) | Split → article → thread → split | Article and thread showed 3 steps, split showed 1, only one stage, and step 2 was still selected. |
| R08 | PASS | browser (T03, T04) | Divider, Controls, Escape | Both opened controls. Escape returned focus to the divider or the Controls button. Browser Back is covered by T09. |
| R09 | PASS | browser (R-extra) | Scroll the explanation after making that panel short | The top bar hid. Show controls brought it back. The Always-show checkbox is in Controls; that box was not clicked in this run. |
| R10 | PASS | browser (T09) | Open `#DEMO-P002/DEMO-S002-02`, Next, Back, then `#NOPE/NOPE` | Back returned to the same step. The bad address did not crash; the first explanation was shown. |
| R11 | PASS | browser screenshot plus source | Default page | Charcoal and gold, rounded panels, kit SVGs, in-page monogram. No external font request. |
| R12 | PASS | browser (T07, R-extra) | Cancel, Apply paper, block pale-on-pale, Reset | Cancel restored rgb(20, 18, 14). Paper applied rgb(251, 247, 239). Pale-on-pale was blocked and the paper colours stayed. Reset restored charcoal. |
| R13 | PASS | source | Settings copy and the header SVG | Monogram is drawn in the page. The page says it does not change a phone icon. No launcher-icon change was attempted. |
| R14 | PASS | browser (T07, R14-motion) | 200% text, Reduce motion, opaque panels, a reduced-motion browser | Root font size 32px. `data-motion=reduce`, `data-opaque=true`. With `prefers-reduced-motion`, image cycling was disabled. Keyboard use is in T03 and T04. |
| R15 | PASS | browser viewport emulation, not a phone (T08) | 320×568, 390×844, 768×1024, 1280×800, 800×360, 390×420 | No horizontal overflow. Next was reachable. The two short viewports dropped to the continuous article. |
| R16 | PASS | browser, clock forwarded 7.5s (R16) | Turn cycling on, advance the test clock, pause | The image changed and the step text did not. Pause left the image held. System reduced motion keeps cycling off (R14-motion). |
| R17 | PASS | browser (T06, R-extra) | Corrupt JSON, forced quota failure, import `javascript:` | Corrupt store: “could not be read”, page still showed the linked step. Quota failure did not flip the star. The import was rejected and the colours did not change. |
| R18 | PASS | browser keyboard and DOM; screen reader NOT_RUN | Focus the divider, Escape from dialogs | Native buttons and dialogs, focus returned, one stage. This is not a screen-reader test. |
| T01 | PASS | browser, file URL | Open `index.html` | First step title, one inline SVG, no missing-illustration message, no page error. |
| T02 | PASS | browser | See R03 | Image stayed on “Keep the anchor” after the explanation moved on. |
| T03 | PASS | browser | See R02 | Drag did not open the overlay. Keyboard and tap did. |
| T04 | PASS | browser | Evidence and Controls | Focus returned to Evidence and to Controls. Explanation scroll stayed at 32px. |
| T05 | PASS | browser | See R07 | No second hidden copy of the qualification. |
| T06 | PASS | browser | See R05 | Saved step survived a topic change and a reload. |
| T07 | PASS | browser | See R12 and R14 | Cancel, paper, blocked custom colours, 200% text, reduced motion, opaque panels. |
| T08 | PASS | browser emulation | See R15 | Not a physical phone. |
| T09 | PASS | browser | See R10 | Direct link, Back, and a bad id. |
| T10 | NOT_RUN | not executed | Physical phone and screen reader | No phone and no screen reader were used. |

The social-preview checks named T01–T18 in the earlier website brief are a different list. They were not run here and are not claimed.
