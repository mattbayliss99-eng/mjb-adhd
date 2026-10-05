# MJB ADHD website

Static site published at https://mjb-adhd.org.uk. Everything the site serves is in `site/`; there is no build step.

## Updating the site: branch, pull request, preview, merge

This GitHub repository is connected to Netlify. Every commit to `main` triggers a **production** deploy to mjb-adhd.org.uk, so do not use `main` for everyday edits. The normal workflow is:

1. **Branch.** On GitHub, edit a file (pencil icon) or use **Add file → Upload files**. When committing, choose **Create a new branch for this commit and start a pull request**. Do not commit directly to `main`.
2. **Pull request.** Open the pull request and describe what changed.
3. **Preview.** Netlify builds a Deploy Preview for the pull request and posts its link on the PR, in the form `https://deploy-preview-<number>--mjb-adhd.netlify.app`. The preview is not the live site.
4. **Review.** Check the changed pages on the preview, on a phone and on a computer.
5. **Merge.** Only when the preview is right, merge the pull request. Merging publishes it to production. The project's **Deploys** page in Netlify shows each deploy and any errors.

GitHub's web upload is limited to 25 MB per file.

## Generated pages

Some pages are generated from source files. Edit the source, run the tools in this order, and review the diff before committing:

    python3 tools/build_genetics.py   # content/genetics/*.md  -> site/science/genetics/
    python3 tools/build_pathway.py    # content/pathway/model.json -> site/science/pathway/
    python3 tools/build_library.py    # restores the "From the library" blocks

Run `build_library.py` last, because the other two rewrite pages without the library block.

## Fallback: manual ZIP upload

Use this only if the GitHub route is unavailable. It bypasses review and publishes straight to production.

1. Edit files inside `site/`.
2. Zip the **contents** of `site/` (so `index.html` is at the top of the zip, and the hidden `_headers` file is included).
3. Drag the zip onto the project's **Deploys** page in Netlify.

A ZIP deploy contains only `site/`, so it does not include the edge function in `netlify/edge-functions/` (the Markdown responses for AI agents). Deploys from GitHub include it.

## The library (Google Drive)

Each section links to the public folders (`01_ARTICLES`, `02_SOURCES`, `03_VISUALS`, `04_DOWNLOADS`) of its Drive repository. New files added to those folders appear to visitors straight away; the website does not need redeploying.

`00_ROUTE_NOTES`, `05_FUTURE_AI_INTERACTIVE`, `99_ARCHIVE` and the Control/Routing, Inbox, Atlas/Fixtures, Future AI and Archive repositories are never linked.

Folder IDs are kept in `tools/library.json`. The page-to-repository mapping is in `tools/build_library.py`. If a folder is replaced, update the ID in `library.json` and run:

python3 tools/build_library.py

That rewrites the library blocks between the `<!-- library:start -->` and `<!-- library:end -->` markers on every page and on `/archive/`.

## Contact form

The contact page form uses Netlify Forms. Submissions appear in Netlify under **Forms → contact**. To get them by email, add a notification under **Project configuration → Notifications → Emails and webhooks → Form submission notifications**.