/**
 * Drop-in replacement for src/components/alarm-watch.tsx.
 * - Uses absolute timestamps (alarm-engine.ts) so backgrounded tabs catch up.
 * - Re-checks on visibilitychange / focus / pageshow (BFCache restore).
 * - Shows a system Notification when the tab is hidden and permission exists.
 * - Speaks the roast if the alarm has `speak` on.
 * Requires the Alarm type in session.tsx to gain:
 *   enabled, nextAt, snoozeUntil (already), mood, custom, snoozes, speak, roast, late
 */
import { useEffect } from "react";
import { pickRoast, type Mood } from "@/data/roasts";
import { playTone } from "@/lib/audio";
import { evaluate } from "@/lib/alarm-engine";
import { useHydrated, usePrivate } from "@/lib/session";

type RoastFields = { label: string; mood: Mood; custom: string[]; snoozes: number; speak: boolean; tone: Parameters<typeof playTone>[0] };

function announce(alarm: RoastFields & { id: string }, roast: string) {
  playTone(alarm.tone);
  try {
    navigator.vibrate?.([200, 100, 200]);
  } catch {
    /* some browsers throw if vibration is blocked */
  }
  if (alarm.speak && "speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(roast);
    u.lang = "en-GB";
    window.setTimeout(() => window.speechSynthesis.speak(u), 700);
  }
  try {
    if (document.hidden && "Notification" in window && Notification.permission === "granted") {
      new Notification(alarm.label, { body: roast, tag: alarm.id, icon: "/media/mjb-emblem.jpg" });
    }
  } catch {
    /* some embedded/iOS contexts throw; the in-page banner still shows */
  }
}

export function AlarmWatch() {
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    const groupsPaused = () => new Set(usePrivate.getState().groups.filter((g) => g.paused).map((g) => g.id));

    const tick = () => {
      const state = usePrivate.getState();
      const paused = groupsPaused();
      const live = state.alarms.map((a) => ({ ...a, enabled: a.enabled && !paused.has(a.groupId) && a.status !== "due" }));
      const { fired, next } = evaluate(live, Date.now());
      if (!fired.length && next.every((a, i) => a.nextAt === state.alarms[i].nextAt)) return;
      const firedIds = new Map(fired.map((f) => [f.id, f]));
      const alarms = next.map((a, i) => {
        const original = state.alarms[i];
        const hit = firedIds.get(a.id);
        if (!hit) return { ...original, nextAt: a.nextAt };
        const roast = pickRoast({ mood: original.mood, snoozes: original.snoozes, custom: original.custom });
        announce(original, roast);
        return { ...original, nextAt: a.nextAt, snoozeUntil: null, status: "due" as const, roast, late: hit.late };
      });
      usePrivate.setState({ alarms });
    };

    tick();
    const id = window.setInterval(tick, 1000);
    const wake = () => tick();
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("focus", wake);
    window.addEventListener("pageshow", wake);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
      window.removeEventListener("pageshow", wake);
    };
  }, [hydrated]);

  return null;
}
