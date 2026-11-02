# MJB SOCIAL / COMPANION — SCREEN & INTERACTION SPECIFICATION v2.0
Date: 2 November 2026. Status: staged design brief, not production approval.

## 0. Source of truth and supplied references
Owner supplied five visual screenshots in chat: Instagram home with circular story links and large image carousels, an Instagram publisher/profile gallery, X home feed with horizontal topic tabs, and X side navigation drawer. These are *interaction and composition references*, not sources for factual assertions or artwork to copy. Do not upload the screenshots or their original posts to the public repo.

Read these exact existing project inputs BEFORE coding:
- https://github.com/mattbayliss99-eng/mjb-adhd/pull/8 — OPEN DRAFT visual-posts pilot; head 72b85a37b6d4a33f0cd7d5e1de3860a8e9336a8c on 2 November; recheck before touching it.
- docs/posts-preview/CURRENT_WEBSITE_SPEC_v1_1.md on the PR #8 branch.
- This planning branch's GROK_IMPLEMENTATION_BRIEF_v1.md and CLAUDE_AUDIT_CHECKLIST_v1.md.
- Current project checkpoint: 00_START_HERE_CURRENT_WEBSITE_STATE_2026-11-02.md in connected Drive website build.
- Existing site/js/navigation.js, reading preferences, current guidebook, image/source export generator and site build/test scripts.
Live main is production; do not modify, merge, deploy or publish without explicit owner approval. Work against the PR #8 source using a separate branch/worktree, preserving its three canonical editorial MJB-P000001–003 posts and source bank.

## 1. Product definition
Build a social-app-quality experience for a single-publisher, free ADHD scientific and advocacy resource. Website is public, searchable, linkable and account-free; companion Android app will add local-first grouped alarms/routines, journal, voice notes, offline reading and quick actions. No fake followers, fake comments, blue checkmarks, subscription sales, intrusive ranking, third-party tracking or dark patterns.

Borrow the useful *mechanisms*:
- Instagram: horizontal circular image collections at the top, carousel imagery with clear page position, compact profile/about and visual post gallery.
- X: simple elegant drawer menu, compact header, topic-tab rail, densely usable vertical feed and unobtrusive bottom navigation.
- MJB: real emblem and brand, existing science/evidence articles, source links, accessibility and reading controls.

Criterion: reach one useful post within one tap, reach its actual full article/source in one more, return to exactly the previous post/media panel/position, and bookmark without signing in.

## 2. Non-negotiable logo / brand identity
Use the ACTUAL existing logo, not a text substitute or a generative remake.
- Existing website navbar already uses /assets/mjb-emblem.jpg, visible in site/js/navigation.js.
- Existing site/ index metadata references /assets/icon-512.jpg for publisher icon and /assets/og-share.jpg for social preview.
Inspect files/crop/rights. Extract GOLD accent from actual approved emblem; suggested colours below are only provisional.
Placement contract:
- TOP LEFT of all app-like screens: real emblem in 40–48 dp tappable zone; opens menu. Its accessible name is Open MJB navigation. Include adjacent MJB ADHD wordmark.
- Publishing identity/avatar on every post and MJB profile page: emblem, name and an honest editorial label, NOT a copied X blue verification symbol.
- Play launcher icon: derived from source master, recognisable at small size and in adaptive-round/squircle/monochrome masks.
- Web PWA install icon/shortcuts: matching gold/black brand.
- Native Android SplashScreen: centred true logo on obsidian; short optional subtle accent animation, never delay app just to show it, use the Android platform SplashScreen / compat API, respect reduced motion. No invented loading progress.
- Display icon + wordmark clearly without treating screenshot status bars as artwork.

## 3. Visual language: MJB Obsidian & Gold
Default first-visit palette: sophisticated near-black charcoal, off-white text, restrained antique gold drawn from real logo. Preserve any EXISTING chosen reading/theme/vision mode; dark default must not override user choice.
Candidate tokens, subject to palette derivation and contrast tests:
BG #090A0C; panel #15171B; raised #20242A; line #35383E; text #F4F4F2; text-muted #B8BCC4; provisional gold #D8AD65.
Focus: visible double ring / clear outline. Radius ~12–16 px, gentle elevation, no heavy gradients or generic futuristic glass.
Traffic-light semantics are NOT evidence strength:
RED with warning/explicit label means urgent actionable risk only.
AMBER with clock/warning and label means caution/review/uncertainty, explicitly differentiated in text.
GREEN with checkmark and label means an operational task was completed/confirmed, never scientific proof or treatment efficacy.
Evidence dimension uses textual class (human trial, observational, animal/cell, hypothesis, personal observation, editorial), with source link and limits; do not use a red-green shortcut for the strength of evidence.
Use purposeful original Lucide-like consistent line icons, do not clone proprietary icon sets or trade dress. High contrast and comfortable text at 200% zoom; maintain colour-blind and light/reading alternatives.
Micro-polish: gentle circle selection/press, subtle selected gold underline, graceful image reveal and progressive View Transitions only when browser supports it. No app-wide animated gradients, auto-scroll, flashing, autoplay or reduced-motion failures.

## 4. Mobile shell — exact areas and actions
Target portrait 320, 360, 390 and 430 CSS px and full device safe areas. Layout uses readable HTML rather than exporting an entire screen as one image.
TOP: sticky thin header with [emblem = menu] [MJB ADHD] [search] [settings as appropriate]. Maintain tap targets >= 44 CSS px, 48 dp Android where possible. Can compact on scroll; don't crowd article reading space.
SECOND: horizontally scrolling round collection links, first four-ish visible, partial next peek and a normal native horizontal scroll. Small circles ~64–76dp plus short distinct labels beneath. Ring = gold for highlight/optionally recent new collection if *actually measured*, neutral otherwise; no Instagram rainbow ring, fake unread story or arbitrary expiry.
THIRD: tabs with gold active indicator e.g. Featured | Latest | Science | Treatment | Care & Rights. All are real curated destinations/filters. No speculative personalised algorithm.
CONTENT: vertical feed with a mixture of compact text-first posts and large purposeful 4:5 illustration-first posts. No compulsory full-screen feed or endlessly forced sequence.
BOTTOM: four primary destinations [Home] [Explore] [Saved] [Tools]. Icons PLUS usable labels, active gold; respects Android/browser gesture bar and bottom inset. No dead buttons or unimplemented fake destinations.
LEFT DRAWER: real logo and purpose at top; functional links for Home, Explore, Science, Medication, Neurology, Life & Function, Care & Rights, Evidence, Collections, Full Guidebook, Downloads, Public Journal, About, Reading Settings and Help. Only include implemented routes; omit fake Groups, Messages, Premium, Boost. Reuse existing MJB route hierarchy. Accessible modal semantics, Escape, click-outside, focus trap/restore, proper scroll.
MAIN ARTICLE: can condense bottom chrome on scroll while keeping essential back and reading tools reachable. No giant unremovable nav consuming phone screen.

## 5. Desktop/tablet rules
Desktop >= 1200 CSS px: existing left MJB navigation rail, central readable ~660–760px feed/article, optional right contextual rail with Sources, Related Topics, Page Contents, Continue Reading. Tablet folds right rail first, then left becomes labelled drawer. Never stretch one 4:5 image to gigantic width.
Retain original site section routes and accessible links. Support keyboard full navigation; no touch-required interaction.

## 6. Screens to actually design
### S1 — HOME / FEED
Real logo, circles, tab rail, first post visible without scrolling a giant header. Each card: MJB avatar/name, topic/depth, editorial/evidence status, title, concise real HTML text, optional hero, direct Full explanation / Sources, bookmark and native share. No fake like counts, comments or social activity. Use PR #8's three editorial content posts as fixtures, not new biomedical claims.
### S2 — TOPIC CIRCLES / COLLECTIONS
Suggested real categories: Science, Treatment, Neurology, Daily Life, Care & Rights, Evidence. Original thumbnail inside branded understated gold/neutral circle, short visible label, normal hyperlink, no-JS fallback. Tap opens curated landing with one-line scope, visually linked cards and "Browse all" list. Each collection has an end; no forced autoplay.
### S3 — POST MEDIA CAROUSEL
One post may contain original 1:1 or 4:5 media panels: "Question", "Mechanism", "What evidence shows", "Limitations", "Sources/next". Panels need persistent IDs, alt, creator, usage rights, canonical article anchor; show visible 1 of N, dots and explicit Previous/Next buttons. Text/caveats/source links not trapped solely in raster or cropped by ratios. Each panel uses HTML explanation alongside editable illustration when detailed science matters. Swipe within media surface, accessible buttons and keyboard always work, no autopaging.
**Gesture conflict:** Home/Feed scrolls VERTICALLY, media panels HORIZONTALLY. Current PR #8 has finite horizontal post-to-post swipes: in its focused SEQUENCE view, disable page swiping when a media panel has gesture focus or route the gestures through explicitly separate targets. Never let one swipe unpredictably change media and post. Provide swipe on/off preference. Test OS Back-edge gesture, vertical scroll, selection and reduced motion. Preserve post ID + media panel + scroll position on Back/Forward.
### S4 — MJB PROFILE / TOPIC GALLERY
Useful Instagram-like structure but honest single-publisher identity: emblem/avatar, "MJB ADHD", short description, website/public guide/evidence buttons; circular Highlight collections; visually organized 3-column image grid with stable links, and an accessible/list mode that can replace grid at 200% zoom. Show creator/editorial provenance and publication date. No follower count unless a real supported, intentional public field, no copied platform verified tick. Play icon only for actual playable media.
### S5 — OPEN ARTICLE / EVIDENCE
Tap post -> related full article, section anchor, actual citations, uncertainty/paper type and return-to-post. Existing MJB reading preferences, narration, Bionic, language, colour vision, print and offline guide remain functioning. Clear "Back to post" or browser history preserves exact position.
### S6 — DRAWER / SETTINGS
Same X-like crisp contrast/density, but owner-aligned functional topic links and existing controls, no meaningless account-centric entries. Explain changing theme, reading profile, narration, swipe preference and saving.
### S7 — APP SPLASH / ONBOARDING
Real logo icon, gold-on-black. Onboarding zero account friction: choose Browse MJB or Use Tools, only ask Android permissions at point of need. Do not make people configure routines to explore the app.
### S8 — ANDROID TODAY / ALARMS CONCEPT
Type-coloured labelled grouped rows (Medication, Appointments, Everyday, Sleep user-customisable), upcoming sorted list, quick template, duplicate/edit, explicit snoozed/dismissed vs completed. Quick alarm test checks sound, notification, volume and permission. Do not claim browser/PWA alarms are equivalent to native Android scheduling; this screen is prototype only until on-device exact alarm tests.
### S9 — PRIVATE CAPTURE
One-tap text journal or clearly indicated mic recording. Local-first, autosave, search/tags and explicit export/delete; never copy into website Public Journal without deliberate user review and separate publication approval.

## 7. Data, publication and accessibility
- PR #8's content/posts/posts.json is canonical. Preserve immutable MJB-P IDs and exact article anchors. Add typed panel records only via reviewed schema extension. Feed list, gallery, captions, app public feed and social crops derive from same approved source.
- Current three posts are editorial DEMO not clinically approved factual posts. Do not treat them as evidence. All research posts require actual source IDs and claim-level status. Separate public editorial journal from device-private personal entries.
- Images: source-authored SVG for precise science; Grok Imagine for atmospheric imagery only. Text and metadata overlaid in selectable HTML/SVG. Rights, creator, source file and alt text required.
- Export 1:1 / 4:5 / 16:9 / 9:16 from canonical post. Existing social_export.py text sidecars do not by themselves guarantee that source cues/important caveats appear visibly: inspect overflow, and fail/split into panels rather than visually truncating qualifications.
- Normal URL and no-JS/print fallback for every essential reading path. Stable bookmark and return state. Saved/bookmarks local; disclose storage and failure cases, no server collection/analytics.
- Contrast, focus order, 200% and where feasible 400% zoom, 320px reflow, images disabled, screen readers, motion reduced, long citations, multilang TTS. Avoid swipe as the sole means of navigation.
- Responsive images/picture/srcset, width-height aspect reservation, lazy load below fold, efficient media with fallback. No auto-play media.
- Performance must be measured on real hardware and tested low-end phone; do not assert Core Web Vitals pass without real measurements.

## 8. "Modern sheen" implementation methods to assess
Consider CSS Grid, container queries, native scroll snap for finite collections, responsive sticky bars, Web Share API with copy fallback, enhanced cross-document View Transitions for topic thumb-to-article and gallery zoom (with ordinary navigation fallback), IntersectionObserver for lazy loading, optional limited PWA caching later. Do not rewrite the static Netlify site as a massive SPA or add expensive heavy JS solely to imitate animations.
Official evidence: https://developer.chrome.com/docs/web-platform/view-transitions and https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/same-document-transitions — transitions do not manage focus automatically, and must respect reduced motion and browser support. Android splash: https://developer.android.com/develop/ui/views/launch/splash-screen/ .

## 9. GROK IMAGINE BRIEF (artwork ONLY, not screenshot fakery)
Make cohesive original source imagery using actual MJB gold/black brand from original logo.
A: "Premium scientific editorial illustration, obsidian-black, measured antique-gold flowing connection motif, elegant luminous pathways abstract metaphor, calm space reserved for editable typography, 4:5 portrait crop, no words, no numbers, no logo, no interface, no invented molecular mechanism."
B: "Six original matching circular topic thumbnail artworks: ADHD Science network, Treatment capsule schematic motif, Neurology abstract cortex, Daily Life environment, Care and Rights document/navigation, Evidence microscope/linked sources; minimal gold-on-charcoal, distinct at 64dp, no labels or trademarked visuals."
C: "Evidence-library atmosphere, charcoal/bronze-gold geometric layers showing connection between primary paper and clearer public explanation, no text or numeric diagram; elegant, readable calm background."
D: "Black and gold subtle abstract technology texture; gentle edge highlight, almost no ornament, suitable behind real brand emblem on native app concept; no wordmark or invented logo."
NEVER create the entire working UI as a single generated screenshot and label it implemented. Design geometry, text and scientific diagrams in editable code; use Imagine only for original atmospheric layers and topic thumbnails.

## 10. Required delivery and review handoff
GROK first tranche: (1) inventory actual source SHA and PR #8 integration points, (2) screen sketches for S1–S6 at 390x844 and desktop 1440x900 + alternative contrast theme, (3) real responsive three-post implementation in isolated branch from latest PR #8, (4) HTML/CSS/JS source patch and demo build, (5) screenshot evidence, source/rights/alt manifest, (6) actual performed checks and blockers, (7) Android S7–S9 concept and feasibility notes. Keep app as concept while web is tested.
CLAUDE independent review: compare exact code/diff to latest PR #8, actual visual mobile tests, gesture precedence, typography overflow, focus/reading modes, site routes, evidence/rights, source links, export clipping, reduced-motion, no-JS, profile/grid, brand crop. Return severity and fix reproduction.
GEMINI optional scoped research: current Android/Play sign-up, Play App Signing and listing requirements, Android splash/icon and PWA compatibility, accessibility review, first-party links and dates; NEVER request or store owner's credentials, signing keys or Play Console private details. Only owner controls developer registration, keys and release.
GPT final: independently reproduce critical checks on code returned, preserve previous source/state, advise owner sign-off and prepare reversible production release only on explicit owner instruction. No automatic posting, deploy, AI-generated medical claims or account creation.

## 11. Acceptance gates
- Logo displayed from real asset at top-left and on app identity designs; tappable drawer and accessible label, plus no fake platform badge.
- Home works at 320 / 360 / 390 / 430 px; 200% text, no horizontal document overflow.
- Six circles have actual links and clear labels; first 4 displayed with scroll hint, no fake ephemerality.
- Home vertical feed, panels horizontal and PR #8 finite post sequence gestures do NOT collide; screen reader/keyboard and swipe-disabled tests pass.
- Post -> article -> source -> browser back restores prior ID, media panel and scroll when possible; explicit return link.
- Dark/gold theme + saved alternative/vision theme maintained. Colour never sole signal; evidence status separate from urgent risk.
- Profile grid degrades to readable list; no fake likes, followers, verified tick, messages or unnecessary login.
- Images-off, no-JS, reduced motion, TTS, sitemap, offline guide and original URLs remain functional.
- Differentiate concept screenshot from real browser capture. Include commands/browser OS, commit SHA, device dimensions, PASS/FAIL/NOT_RUN, previous failures and new regressions.
- No live-site deployment, merging, credential exchange or real social publishing without specific owner authorisation.

## 12. Ownership
Owner chooses product, identity and publication. Grok designs/implements isolated prototype; Claude independently checks and refines; Gemini supports narrowly scoped Android/Google research; GPT independently performs final sign-off checks. All claims of completed tests require actual evidence, not model self-certification.
