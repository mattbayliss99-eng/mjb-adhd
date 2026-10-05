# MJB ADHD website

Static site published at https://mjb-adhd.org.uk. Everything the site serves is in `site/`; there is no build step.

## Updating the site on GitHub

This repository is connected to Netlify, so any change committed to `main` is published automatically within a minute or two. There is no need to zip or upload anything.

- **Edit a page:** open the file under `site/` on GitHub, click the pencil icon, make the change and click **Commit changes** (commit directly to `main`).
- **Add or replace files:** open the right folder under `site/` on GitHub, choose **Add file → Upload files**, drag the files in and commit to `main`. A file with the same name replaces the old one. GitHub's web upload is limited to 25 MB per file.
- **Check it worked:** the project's **Deploys** page in Netlify shows each publish and any errors.

## If Updating the site from a zip

1. Edit files inside `site/`.
2. Zip the **contents** of `site/` (so `index.html` is at the top of the zip, and the hidden `_headers` file is included).
3. Drag the zip onto the project's **Deploys** page in Netlify.

## The library (Google Drive)

Each section links to the public folders (`01_ARTICLES`, `02_SOURCES`, `03_VISUALS`, `04_DOWNLOADS`) of its Drive repository. New files added to those folders appear to visitors straight away; the website does not need redeploying.

`00_ROUTE_NOTES`, `05_FUTURE_AI_INTERACTIVE`, `99_ARCHIVE` and the Control/Routing, Inbox, Atlas/Fixtures, Future AI and Archive repositories are never linked.

Folder IDs are kept in `tools/library.json`. The page-to-repository mapping is in `tools/build_library.py`. If a folder is replaced, update the ID in `library.json` and run:

python3 tools/build_library.py

That rewrites the library blocks between the `<!-- library:start -->` and `<!-- library:end -->` markers on every page and on `/archive/`.

## Contact form

The contact page form uses Netlify Forms. Submissions appear in Netlify under **Forms → contact**. To get them by email, add a notification under **Project configuration → Notifications → Emails and webhooks → Form submission notifications**.