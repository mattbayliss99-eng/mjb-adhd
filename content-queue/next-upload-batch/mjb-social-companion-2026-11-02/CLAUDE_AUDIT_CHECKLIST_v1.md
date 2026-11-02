# MJB social website + companion app: Claude adversarial audit brief v1
Date: 2026-11-02
Status: REVIEW CHECKLIST ONLY. No merge/deploy/communication authority.

## Scope
Review Grok's actual patch and screenshots against the current MJB main baseline, open PR #8 (visual posts) and separate PR #7 (questionnaire). The new Grok brief is the target product direction, not evidence work has been implemented. Keep GitHub production on main untouched. Return findings linked to specific source lines, renderings and observed test results.

## 1. Source and integration integrity
- Identify exact baseline SHA, Grok output SHA/diff, file paths and dependency changes; distinguish proposed behaviour from actual working code.
- Flag recreated or duplicate posts.json banks, generators, captions or competing routes. Confirm post IDs immutable and article deep links canonical.
- Confirm no silent destructive changes to nav, reading settings, TTS, dyslexia/vision profiles, old URLs, offline guide, static no-JS fallback or site build.
- Ensure changed code is genuinely minimal relative to PR #8 and does not mix questionnaire work.

## 2. Social UI and accessibility
- Test 320/360/390px plus desktop, 200% zoom, keyboard Tab/Enter/Space, touch gestures, reduced motion and focus order. Look for scroll hijacking, inaccessible horizontal-only paging, text cropping, false 'read' status and broken back/forward/return position.
- Test feed > full article > original study > browser Back; verify place and subject preserved. Test absent image, long scientific title and source cue; user must be able to select/copy critical content.
- Dark/gold contrast, dark/light/profile persistence, evidence class labels distinct from red/amber/green task urgency, warning icons with actual text, no colour-only signals.
- Check for manipulative engagement elements, fake accounts/likes and privacy-invasive telemetry.

## 3. Specific issues with recent social_export.py report
The 2 November tool in Drive adds XML escaping, text sidecars, source cue/URL, flags, git/hash provenance and dry-run scheduling. This does NOT, by itself, prove rendered source-cue legibility, image integration or publish readiness.
- Inspect title single-line overflow, SVG text geometry and clipping at every 1:1, 4:5, 16:9 and 9:16 export.
- Inspect truncation still present in the reviewed file's cue[:200], source_cue[:140], rights_line[:100] and alt[:60], despite full-text sidecars. Full text may survive in a sidecar but the visible post can still omit safety qualifications or source URLs. Require measured layout/approved shortening or split panels, never hidden truncation.
- Confirm whether finished rasters actually include hero artwork and text overlay; existing CLI says artwork is separate.
- Check missing flags really block release (not merely display status), including source IDs for factual claims, no rights, no alt, draft status; ensure 'review' is not treated as 'approved'.
- Verify schedule payload is dry-run only. No real Buffer integration or queue writes have been demonstrated.

## 4. Android technical / policy audit before any app release
- Exact alarms: Play eligibility for USE_EXACT_ALARM, fallback SCHEDULE_EXACT_ALARM permission and denial case; receiver after reboot; Doze, DND, notification channels, volume and device-specific scheduling behavior. Don't approve 'reliable alarms' by code inspection alone.
- Voice: supported Android shortcuts, App Actions and locale support; do not claim any Assistant will handle freeform custom commands without actual device testing.
- Spotify: developer compliance tips disallow using Spotify song clips for alarms and voice-controlled experiences; do not approve that integration as proposed. YouTube policies disallow background playback or extracting audio from video.
- Music: favour system/user-selected local tone; ensure network/authorization failures cannot suppress the alarm.
- PWA/TWA is a content distribution technique, not a standalone substitute for native exact alarms; assess Play listing quality requirements before promising acceptance.
- Journal/voice notes: least-privilege permissions, on-device data isolation, storage encryption/backup implications, opt-in export, deletion, accidental upload, logging/crash reports, no health data in demos.
- Medical reminder UI must not infer dose taken from an alarm being dismissed or give clinical dosage recommendations.

## 5. Editorial/evidence audit
- All medical/clinical claims linked to actual sources with population, study design, biological level, uncertainty, contradictory work and primary record where possible.
- Separate editorial observation, hypothesis, mechanistic plausibility and established clinical evidence; source class not conflated with treatment safety.
- Generated art not passed off as accurate molecular diagram; attribution/licence provenance and alt text checked.
- Distinguish personal case public narrative from private notes. No source documents copied into public repos.

## 6. Return
Create a compact severity-ranked findings register:
BLOCKER (publishing/safety/privacy/source-critical), MAJOR (broken route/interaction or accessibility), MINOR, and ACCEPTABLE TRADEOFF. Each finding has exact file/line, reproduction or official reference, effect, minimal suggested fix, and an observed verification status (PASS/FAIL/NOT_RUN).
Add short:
- Technical summary, including regressions against PR #8.
- Visual audit with 4 aspect ratios and 3 source post types.
- Remaining Play / Android policy unknowns.
- Three highest-value fixes and suggested order.
Claude may draft fixes separately, but must NOT directly merge, deploy, send correspondence or mark the content approved. Owner directs product decisions. GPT conducts final independent release check.
