# Deploy notes (not an authorisation to deploy)

- Host remains Netlify via existing `netlify.toml`.
- Beta route: `/social-reading-beta/` (noindex).
- Do not add beta links to the live sitemap/menus until release approval.
- Rollback: remove `site/social-reading-beta/` and revert content/posts/posts.json slide schema if needed; PR #8 preview under `/posts-preview/` remains.
- PR #7 questionnaire route is separate and must not be merged into this branch casually.
