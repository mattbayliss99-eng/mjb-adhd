# Architecture decision — MJB Reader Experience v2.0

Date: 2026-11-05 (Europe/London)  
Decision owner: Grok Bot (implementation recommendation for Codex/Matty)

## Discovery reconciliation

| Ref | SHA | Role |
|---|---|---|
| origin/main | `8d4030af8fce5f8a2e9ae27e013219e6e48417fc` | Live baseline (unchanged) |
| origin/feature/visual-posts-codex-preview (PR #8) | `72b85a37b6d4a33f0cd7d5e1de3860a8e9336a8c` | Integration base |
| origin/feature/questionnaire-hub-preview (PR #7) | `79631b3ef56d5c7012410f6c204834298494416a` | **Protected — untouched** |
| Local `7cdbbb86…` | first social-reading-beta implementation commit | Named in earlier docs as a “head” mid-handoff |
| Local `33b169ed…` | verification/handover docs commit | Also named as a “head” mid-handoff |
| Bundle HEAD `3d3deaea…` | Drive IDs + package SHA commit | **Authoritative tip of supplied bundle** |
| ZIP SHA-256 | `78b15feeaa046f06f44940e026b2f5feac80cc926a7cfd6cc61ed547c317bd96` | Matches supplied digest |

Ambiguity resolution: `7cdbbb8` → `33b169e` → `3d3deae` is a linear history. Earlier handoff text named intermediate commits while packaging continued. The verified git bundle tip is `3d3deae`; that is the bytes matching the supplied archive/report lineage.

## Decision

**Extend the existing STATIC `/social-reading-beta/` integration** (vanilla HTML/CSS/JS generated from `content/posts/posts.json`).

### Why not merge the TanStack/React prototype now
- Netlify config publishes `site/` with **no build step** (`netlify.toml` → `publish = "site"`).
- The previous handover explicitly states the React/TanStack app was **not** merged.
- Smallest maintainable route that preserves live architecture, existing URLs, PR #8 preview, and PR #7 isolation.
- Avoids shipping auth/db scaffold (`better-auth`, `pglite`, etc.) into a public reader.

### What this means
- Keep route `/social-reading-beta/` isolated and noindex until release approval.
- Evolve the static reader into the DS-style split experience, evidence panels, theme system, favourites, author review exports.
- Derive pages from one canonical JSON bank via `tools/build_social_reading_beta.py` (extended).
- Shared site CSS/JS under `site/js` / `site/css` remain for article return and existing accessibility engines where compatible; beta carries its own reader shell to avoid conflicting preference engines until Codex integrates.

### Rejected alternatives
| Option | Reason rejected for P0 |
|---|---|
| Rewrite whole site as TanStack Start | Breaks static Netlify zip deploy; large auth/db surface; not required for reader |
| Replace `/posts-preview/` in place | Would disturb PR #8 candidate; brief requires isolated beta until approved |
| New framework solely for divider/disclosure | Brief forbids unnecessary large dependencies |

## Netlify notes
- Publish directory: `site`
- Build command: none (static)
- Edge functions live under `netlify/edge-functions/` (Git deploys only)
- Beta pages use `noindex,nofollow` meta; not added to sitemap/menus in this slice
- No catch-all redirect proposed that would swallow assets, articles, or `/questionnaire-demo/`
