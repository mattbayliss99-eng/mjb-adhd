# MJB reader shell — Grok submission

Kit version 1.0 (5 November 2026). This is an independent reading prototype. It is not the live MJB site, and it was not copied from another builder’s shell.

## Open it

Open `index.html` in a browser. No install, no server, no account.

The posts, styles, script and three illustrations are inlined, so the file still opens with no network. `data/posts.json` and `assets/*.svg` are the same kit files, kept beside it for review.

A link in the social preview menu, labelled **Split reader**, opens this same page when that preview is running.

## Rebuild

From this folder, if you change `shell.js` or `shell.css`:

```
node build.mjs
```

Node is only needed to rebuild. It is not needed to read.

## Checks

`check.mjs` drives a headless browser. This workspace already has Playwright. From the repo root:

```
node public/reader-shell/check.mjs
```

Results from the run that produced this package are in `VERIFICATION.md` and `check-results.json`.

## What it does

One reader. The image and the point stay in the top panel. The explanation moves underneath, with Previous and Next. Drag the thin gold handle to give either panel more room. Tap it, or press Enter on it, or use Controls, for layout, text size and colours. Swipe is off unless you turn it on. Nothing is uploaded.
