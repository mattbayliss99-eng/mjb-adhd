# Builder submission

Builder/version: Grok, reader shell 2026-11-05.1
Starting kit version: MJB reader shell comparison kit 1.0 (5 November 2026)
Files/run instructions: Open `index.html` directly. See README.md. `node build.mjs` regenerates it. `node check.mjs` repeats the browser checks where Playwright is installed.
Implementation method and why: One standalone page, with the kit JSON and SVGs inlined, so a reviewer can open a file and not a toolchain. Stacked panels are the default because the brief describes an upper point and a lower explanation, like Android split-screen. Side by side is optional and only used when the window is wide enough.
Dependencies and payload: None at runtime. No CDN, no web fonts, no account, no analytics. Built `index.html` is about 74 KB.

## Interaction decisions

Default split and responsive behaviour: Stacked split whenever the window is tall enough. Below that, or in a short landscape window, the same step opens in one continuous article and a note says why. Side by side is a control, not the default, and waits for a window at least 840 CSS px wide.
How the handle works: A 44 CSS px hit area sits on the seam. The visible mark is a short gold bar. Dragging resizes. A tap, Enter or Space opens controls. Arrow keys resize while the handle is focused. A drag does not open the overlay.
How visual/text independence works: Image Previous/Next and step Previous/Next are separate. The image follows the step until you move the image yourself; it then stays until “Use this step’s image”. Text never advances by itself. Optional image cycling is off, advances images only, has Pause, and stays off when motion is reduced or the tab is hidden.
Where options live: Controls button, and a tap on the divider. Close, Escape, and focus return to the control that opened them.
How evidence opens: “+ Evidence” on the current step. The sheet shows the support, the qualification, the full source title, type, date, locator and limit. The qualification also stays in the reading text. The source link is opened only if it is http(s).
What persists locally: Version 1 JSON in localStorage (`mjb-reader-shell-v1`): layout, colours, text size, the current place, and saved posts with their step. Saved is not treated as read. A failed write rolls the star back and says it was not saved. A corrupt store is ignored and the standard setup is shown. The address hash still wins, so a shared step link is not discarded.
Accessibility fallbacks: Text size 100/125/150/200, reduced motion, plain opaque panels, always-show controls, visible focus, native buttons and dialogs. System reduced motion disables image cycling. If JavaScript is off, the three demonstrations are still listed in the page. There is no claim of a screen-reader pass.

## Verification

See VERIFICATION.md. Physical phone and screen reader are NOT_RUN.

## Limits and future options

Known defects: None found in the browser checks below. The image-cycle timer was advanced with the test browser’s clock, not by waiting beside the screen. The swipe gesture was not performed on a touch screen; the switch was confirmed off.
Deliberate exclusions: Accounts, comments, live models, audio, analytics, a backend, a service worker, a phone wrapper, and the existing social feed. This shell does not replace that preview.
Three useful extensions: A pass on a physical phone. A pass with a screen reader. A printed copy of a whole post.
What to retain if another shell is selected: Stable post and step ids in the address, qualifications kept beside the claim, a drag that cannot open settings by accident, and truthful save/error copy.

No publishing or data collection performed: yes
