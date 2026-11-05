# Architecture

See also ARCHITECTURE_DECISION.md.

- Content: `content/posts/posts.json` schema 2.0 (posts, slides/blocks, claims, sources, visuals).
- Generate: `tools/build_social_reading_beta.py` → `site/social-reading-beta/**`.
- Client: prefs.js (v2), chrome.js, story.js (split), favourites.js, packs.js.
- Deploy: Netlify `publish = site`, no build command; beta pages noindex.
- Extension points: local state adapter keys `mjb-srb-*`; content repository = JSON bank.
