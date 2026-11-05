# Claude patch pack for grok-workspace (4 Nov 2026)

Copy `src/*` over the Grok repo (same paths). Apply `session.tsx.diff` (or use the
included `src/lib/session.tsx`). Then update `makeAlarm()` in tools-panel.tsx and
DueBanner's snooze, as described in §4.2 of the review.

Tests: `node --experimental-strip-types --test tests/alarm-engine.test.ts`
Prototype: open `prototype/index.html` in any browser. No build step.
