/**
 * Default alarm copy: "negative encouragement", as the project brief asks.
 * Escalates with each snooze. Rules for adding lines:
 *  - mock the procrastination, never the person's worth, body or diagnosis
 *  - no self-harm, slurs, or anything that would land badly on a bad day
 *  - keep it under ~90 characters so it fits a lock-screen notification
 */
export type Mood = "gentle" | "cheeky" | "savage";

export const ROASTS: Record<Mood, readonly string[]> = {
  gentle: [
    "Hey. The thing. It's time for the thing.",
    "Tiny step. Just stand up. That's the whole job right now.",
    "You set this for a reason. Past-you was looking out for you.",
    "Gentle nudge: future-you will be very pleased about this.",
  ],
  cheeky: [
    "Your future self called. They're absolutely furious.",
    "Plot twist: the task does not, in fact, do itself.",
    "This alarm has been ignored by better people than you. Don't join them.",
    "Ah yes, the classic 'I'll remember without an alarm'. Anyway, here's your alarm.",
    "Your dopamine isn't coming. You'll have to go without it. Go.",
  ],
  savage: [
    "Get up. Nobody is coming to do this for you. Least of all you, apparently.",
    "Bold strategy, ignoring a thing you literally asked me to remind you about.",
    "Your to-do list has started a support group. It's about you.",
    "You've scrolled long enough to read a novel. Do the one thing.",
    "Even your cat thinks you should have started by now.",
  ],
};

export const SNOOZE_ROASTS: readonly string[] = [
  "Snooze #{n}. That's not a nap, that's a lifestyle.",
  "Snoozed {n} times. At this point I'm just a very loud podcast.",
  "Snooze {n}? Fine. I'll be back. I'm always back.",
  "{n} snoozes. The task is still here. It's patient. Unlike me.",
];

export const DONE_PRAISE: readonly string[] = ["Look at you. Functional.", "Legend behaviour.", "See? Wasn't so bad."];

export const PRESETS: { label: string; mood: Mood }[] = [
  { label: "Drink water", mood: "cheeky" },
  { label: "Medication", mood: "gentle" },
  { label: "Eat something", mood: "cheeky" },
  { label: "Leave the house", mood: "savage" },
  { label: "Go to bed", mood: "savage" },
  { label: "Make that phone call", mood: "savage" },
];

/**
 * Pick a line. Pass `rand` for deterministic tests.
 * After a snooze the mood escalates one step (gentle → cheeky → savage).
 */
export function pickRoast(
  opts: { mood: Mood; snoozes?: number; custom?: readonly string[] },
  rand: () => number = Math.random,
): string {
  const snoozes = opts.snoozes ?? 0;
  if (snoozes > 0 && rand() < 0.5) {
    const line = SNOOZE_ROASTS[(snoozes - 1) % SNOOZE_ROASTS.length];
    return line.replaceAll("{n}", String(snoozes));
  }
  const ladder: Mood[] = ["gentle", "cheeky", "savage"];
  const mood = ladder[Math.min(ladder.length - 1, ladder.indexOf(opts.mood) + snoozes)];
  const pool = [...(opts.custom ?? []), ...ROASTS[mood]];
  return pool[Math.floor(rand() * pool.length)];
}
