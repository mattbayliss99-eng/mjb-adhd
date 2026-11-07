/**
 * Pure alarm scheduling. Replaces alarm-watch.tsx's approach of comparing
 * `alarm.time === "HH:MM"` once a second, which silently MISSES an alarm if
 * the tab is throttled/backgrounded during that minute (browsers clamp timers
 * in hidden tabs to ≥1 min, and freeze them entirely on mobile).
 *
 * Here every alarm stores an absolute `nextAt` timestamp. On each tick — and
 * on `visibilitychange`/`focus`/`pageshow` — anything with nextAt <= now fires,
 * flagged `late` if it was missed by more than LATE_MS. No minute is ever lost.
 * DST-safe: uses local wall-clock construction via Date#setHours.
 */
export const LATE_MS = 90_000;

export type Schedulable = {
  id: string;
  time: string; // "HH:MM" local
  enabled: boolean;
  /** Optional ISO weekdays 1–7 (Mon–Sun). Empty/undefined = every day. */
  days?: readonly number[];
  nextAt: number | null;
  snoozeUntil: number | null;
};

export function nextFireAt(alarm: Pick<Schedulable, "time" | "days">, after: number): number {
  const [h, m] = alarm.time.split(":").map(Number);
  const d = new Date(after);
  for (let i = 0; i < 8; i += 1) {
    const c = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i, h, m, 0, 0);
    const iso = ((c.getDay() + 6) % 7) + 1;
    if (c.getTime() > after && (!alarm.days?.length || alarm.days.includes(iso))) return c.getTime();
  }
  throw new Error(`No valid day for alarm at ${alarm.time}`);
}

export type Firing = { id: string; late: boolean; dueAt: number };

/** Returns which alarms fire now and the patched schedule. Never mutates input. */
export function evaluate<T extends Schedulable>(alarms: readonly T[], now: number): { fired: Firing[]; next: T[] } {
  const fired: Firing[] = [];
  const next = alarms.map((a) => {
    if (!a.enabled) return a;
    if (a.nextAt == null && a.snoozeUntil == null) return { ...a, nextAt: nextFireAt(a, now) };
    const due = a.snoozeUntil ?? a.nextAt!;
    if (now < due) return a;
    fired.push({ id: a.id, late: now - due > LATE_MS, dueAt: due });
    // Schedule the following occurrence from the due time, not "now", so a
    // device asleep for 3 days fires once (late), not three times.
    return { ...a, snoozeUntil: null, nextAt: nextFireAt(a, Math.max(due, now - 1)) };
  });
  return { fired, next };
}

export function snooze<T extends Schedulable>(alarm: T, now: number, minutes = 5): T {
  return { ...alarm, snoozeUntil: now + minutes * 60_000 };
}

export function describeIn(ms: number): string {
  const m = Math.max(0, Math.round(ms / 60_000));
  if (m < 1) return "in under a minute";
  if (m < 60) return `in ${m} min`;
  const h = Math.floor(m / 60);
  return m % 60 ? `in ${h}h ${m % 60}m` : `in ${h}h`;
}
