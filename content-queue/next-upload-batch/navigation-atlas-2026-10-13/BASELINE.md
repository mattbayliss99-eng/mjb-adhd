# S1 baseline — 13 October 2026

Production Netlify deploy `6ac665a88058380008ef3eb6` serves main revision `5b228c773f44c7e2482270673f8df5c2b906ac08`, published 7 October 2026. The current GitHub main agrees. Live root, journey, science overview, guide shell and app.js returned HTTP 200. Live app.js SHA-256 matches the working baseline app.js before editing.

The 12 October accountability branch has head `62acfa66f6b3f83bed1e8b239ad6bfff827a790e`, 68 changed files compared with main. A separate working branch is based on it; neither is merged by this run. GitHub PR #5 is existing accountability work. No AGENTS.md occurs in the fetched repository tree. Netlify is a static site with `site/` as publish folder and no build command. Guide and genetics pages have their own source generators.

The generated navigation inventory covers the regular site, guide hash routes and static equivalents; actual guide-hash rendering is tested independently of HTTP response status. Existing offline guidebook remains self-contained. Route inventory is `site/js/navigation-data.js`.
