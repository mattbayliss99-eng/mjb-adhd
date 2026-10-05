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

A ZIP deploy contains only `site/`, so it does not include the edge functions in `netlify/edge-functions/` (Markdown responses for AI agents and automatic error fallback). Include both `_headers` and `_redirects` in the ZIP. Deploys from GitHub include the edge functions.

## Site failure and backup access

The public backup profile is https://x.com/MJB_ADHD. The `/x`, `/x/`, `/backup` and `/backup/` shortcuts redirect there temporarily (HTTP 302). The missing-page screen also links directly to the profile, without relying on JavaScript or the shortcut working.

For normal browser page requests, the fallback edge function sends visitors to the X profile if the downstream site returns a server error (HTTP 5xx) or throws while serving the request. The redirect is not cached, so visitors can return to the site after recovery. Successful pages, missing pages (404), form submissions, assets, internal Netlify endpoints and non-browser requests are left alone. This checks the response to each visit; it is not an uptime monitor or a separate health check.

### Manual maintenance redirect

To send page visitors to X deliberately during an outage or maintenance, prepend this rule to `site/_redirects` and deploy it:

```text
/*  https://x.com/MJB_ADHD  302!
```

The `!` makes this temporary rule override existing static files. It redirects all paths, including assets, so use it only when taking the entire site offline. Remove the rule and redeploy to restore normal access. Do not use a permanent 301 redirect for an outage. This manual method also works with a ZIP deploy and does not require an edge function.

### Independent mirror

No mirror address has been configured. To create a basic independent mirror:

1. Choose a static host outside Netlify and use a separate hostname that does not depend on this site's DNS.
2. Upload the contents of `site/`, with `index.html` at the root. The host must support directory index pages. Configure its missing-page handler to serve `404.html` with status 404.
3. Configure `/x` and `/backup` as temporary redirects on that host if it does not understand Netlify's `_redirects` file. Configure equivalent security headers if it does not understand `_headers`.
4. Test several nested pages, images and navigation links. Netlify Forms and edge functions do not operate on another host; mark the mirror as read-only and replace its contact form with a link to X before publishing it.
5. Pin the mirror's direct address on the X profile and update the mirror whenever the main site's content changes. Keep the original site's canonical URLs to avoid making the mirror a competing search result.

The standard Netlify address, https://mjb-adhd.netlify.app, is also worth bookmarking and testing as an alternative to the custom domain. It serves the same deployment and is not an independent mirror.

Neither redirect method can run during a complete Netlify outage or when the visitor cannot resolve or connect to the site's hostname. A failed deployment also does not activate the fallback if the previous working deployment is still serving normally. Bookmark the X profile and the independent mirror directly; publish those addresses ahead of an outage. Automatic failover for a complete hosting or DNS outage requires a separately managed proxy or DNS failover service and is not part of this basic setup.

## The library (Google Drive)

Each section links to the public folders (`01_ARTICLES`, `02_SOURCES`, `03_VISUALS`, `04_DOWNLOADS`) of its Drive repository. New files added to those folders appear to visitors straight away; the website does not need redeploying.

`00_ROUTE_NOTES`, `05_FUTURE_AI_INTERACTIVE`, `99_ARCHIVE` and the Control/Routing, Inbox, Atlas/Fixtures, Future AI and Archive repositories are never linked.

Folder IDs are kept in `tools/library.json`. The page-to-repository mapping is in `tools/build_library.py`. If a folder is replaced, update the ID in `library.json` and run:

python3 tools/build_library.py

That rewrites the library blocks between the `<!-- library:start -->` and `<!-- library:end -->` markers on every page and on `/archive/`.

## Contact form

The contact page form uses Netlify Forms. Submissions appear in Netlify under **Forms → contact**. To get them by email, add a notification under **Project configuration → Notifications → Emails and webhooks → Form submission notifications**.
