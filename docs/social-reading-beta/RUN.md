# Run — MJB social reading beta

## Quick start
```bash
cd <repo>
python3 tools/build_social_reading_beta.py
python3 -m http.server 8765 --directory site
```
Open http://localhost:8765/social-reading-beta/

## Tests
```bash
npm install   # jsdom + playwright (dev)
npm test      # includes reading-pack tests
npx playwright install chromium
npm run test:browser
```

## Deploy config
Existing `netlify.toml` remains the site deploy config. This beta is a labelled preview route under `/social-reading-beta/` and is noindex. Do not merge or deploy production from this handoff alone.
