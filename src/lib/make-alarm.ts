import type { Mood } from "@/data/roasts";
import type { Alarm, ColourId, ToneName } from "@/lib/session";

export function makeAlarm(partial: {
  label: string;
  time: string;
  groupId?: string;
  colour?: ColourId;
  tone?: ToneName;
  urgent?: boolean;
  mood?: Mood;
  custom?: string[];
  speak?: boolean;
  days?: number[];
}): Alarm {
  return {
    id: crypto.randomUUID(),
    label: partial.label,
    time: partial.time,
    groupId: partial.groupId ?? "everyday",
    colour: partial.colour ?? "gold",
    tone: partial.tone ?? "chime",
    urgent: partial.urgent ?? false,
    status: "scheduled",
    snoozeUntil: null,
    lastFiredDate: null,
    lastActionDate: null,
    enabled: true,
    nextAt: null,
    days: partial.days && partial.days.length ? partial.days : undefined,
    mood: partial.mood ?? "cheeky",
    custom: partial.custom ?? [],
    snoozes: 0,
    speak: partial.speak ?? false,
  };
}

/** Ask the browser to keep on-device alarms and notes. It may still say no. */
export function askToKeepData(): void {
  const storage = navigator.storage as StorageManager & { persist?: () => Promise<boolean> };
  void storage.persist?.().catch(() => undefined);
}
