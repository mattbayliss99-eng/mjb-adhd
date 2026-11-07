import type { Mood } from "@/data/roasts";

export const BACKUP_KIND = "mjb-preview-backup";
export const BACKUP_VERSION = 1;
export const MAX_BACKUP_CHARS = 1_500_000;
export const INVALID_DATE = "This backup contains an invalid date. Nothing was changed.";

const STATUSES = ["scheduled", "due", "dismissed", "snoozed", "completed"] as const;
const TONES = ["chime", "pulse", "bell"] as const;
const COLOURS = ["gold", "cream", "sand", "ink", "paper"] as const;
const EARLIEST_MS = 0;
const LATEST_MS = Date.UTC(2200, 0, 1);

export type BackupAlarm = {
  id: string;
  label: string;
  groupId: string;
  colour: (typeof COLOURS)[number];
  tone: (typeof TONES)[number];
  time: string;
  urgent: boolean;
  status: (typeof STATUSES)[number];
  snoozeUntil: number | null;
  lastFiredDate: string | null;
  lastActionDate: string | null;
  enabled: boolean;
  nextAt: number | null;
  days?: number[];
  mood: Mood;
  custom: string[];
  snoozes: number;
  speak: boolean;
};

export type BackupNote = {
  id: string;
  kind: "text";
  title: string;
  body: string;
  voiceId: null;
  createdAt: number;
  updatedAt: number;
};

export type BackupGroup = { id: string; name: string; paused: boolean };

export type BackupBundle = {
  alarms: BackupAlarm[];
  notes: BackupNote[];
  groups: BackupGroup[];
  bookmarks: string[];
  voiceExcluded: number;
  scope: "full" | "journal";
  journalTitle?: string;
};

export type BackupPreview = {
  ok: true;
  bundle: BackupBundle;
  conflicts: { alarms: number; notes: number; bookmarks: number };
};

export type BackupFailure = { ok: false; message: string };

type Existing = {
  alarms: { id: string }[];
  notes: { id: string; createdAt?: number; updatedAt?: number }[];
  bookmarks: string[];
  groups?: { id: string }[];
};

type NoteLike = {
  id: string;
  kind?: string;
  title?: string;
  body?: string;
  voiceId?: string | null;
  createdAt: number;
  updatedAt: number;
};

function fail(message: string): BackupFailure {
  return { ok: false, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** A timestamp the journal can format. Rejects Infinity, exponents and out-of-range values. */
export function acceptableTimestamp(value: unknown): value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isSafeInteger(value)) return false;
  if (value < EARLIEST_MS || value > LATEST_MS) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  try {
    const formatted = new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(value);
    return Boolean(formatted) && formatted !== "Invalid Date";
  } catch {
    return false;
  }
}

/** A time safe to write into a backup. An unreadable stored time is replaced so the file can be imported again. */
export function exportableNoteTimes(
  createdAt: unknown,
  updatedAt: unknown,
  fallback: number,
): { createdAt: number; updatedAt: number } {
  const standIn = acceptableTimestamp(fallback) ? fallback : 0;
  const created = acceptableTimestamp(createdAt) ? createdAt : standIn;
  let updated = acceptableTimestamp(updatedAt) ? updatedAt : created;
  if (updated < created) updated = created;
  return { createdAt: created, updatedAt: updated };
}

function uniqueIds(rows: { id: string }[], label: string): string | null {
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.id)) return `That backup repeats a ${label} id, so nothing was changed.`;
    seen.add(row.id);
  }
  return null;
}

function optionalTime(value: unknown): number | null | "bad" {
  if (value === undefined || value === null) return null;
  if (!acceptableTimestamp(value)) return "bad";
  return value;
}

function cleanAlarm(value: unknown): BackupAlarm | "date" | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id || value.id.length > 80) return null;
  if (typeof value.label !== "string" || !value.label.trim() || value.label.length > 200) return null;
  if (typeof value.time !== "string" || !/^\d{2}:\d{2}$/.test(value.time)) return null;
  const [hour, minute] = value.time.split(":").map(Number);
  if (hour > 23 || minute > 59) return null;
  if (typeof value.groupId !== "string" || !value.groupId) return null;
  if (!COLOURS.includes(value.colour as BackupAlarm["colour"])) return null;
  if (!TONES.includes(value.tone as BackupAlarm["tone"])) return null;
  if (!STATUSES.includes(value.status as BackupAlarm["status"])) return null;
  if (typeof value.enabled !== "boolean") return null;
  if (typeof value.urgent !== "boolean") return null;
  if (typeof value.speak !== "boolean") return null;
  if (value.mood !== "gentle" && value.mood !== "cheeky" && value.mood !== "savage") return null;
  if (!Array.isArray(value.custom) || value.custom.some((item) => typeof item !== "string")) return null;
  if (typeof value.snoozes !== "number" || !Number.isSafeInteger(value.snoozes) || value.snoozes < 0 || value.snoozes > 10000) {
    return null;
  }
  const days = value.days;
  if (
    days !== undefined &&
    (!Array.isArray(days) || days.some((day) => typeof day !== "number" || !Number.isInteger(day) || day < 0 || day > 6))
  ) {
    return null;
  }
  const snoozeUntil = optionalTime(value.snoozeUntil);
  const nextAt = optionalTime(value.nextAt);
  if (snoozeUntil === "bad" || nextAt === "bad") return "date";
  return {
    id: value.id,
    label: value.label.trim(),
    groupId: value.groupId,
    colour: value.colour as BackupAlarm["colour"],
    tone: value.tone as BackupAlarm["tone"],
    time: value.time,
    urgent: value.urgent,
    status: value.status as BackupAlarm["status"],
    snoozeUntil,
    lastFiredDate: typeof value.lastFiredDate === "string" ? value.lastFiredDate : null,
    lastActionDate: typeof value.lastActionDate === "string" ? value.lastActionDate : null,
    enabled: value.enabled,
    nextAt,
    days: days as number[] | undefined,
    mood: value.mood,
    custom: value.custom as string[],
    snoozes: value.snoozes,
    speak: value.speak,
  };
}

function cleanNote(value: unknown): { note: BackupNote; voice: boolean } | "date" | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id || value.id.length > 80) return null;
  if (value.kind !== "text" && value.kind !== "voice") return null;
  if (typeof value.title !== "string" || value.title.length > 200) return null;
  if (typeof value.body !== "string" || value.body.length > 20000) return null;
  if (!acceptableTimestamp(value.createdAt) || !acceptableTimestamp(value.updatedAt)) return "date";
  if (value.updatedAt < value.createdAt) return "date";
  const voice = value.kind === "voice" || value.voiceId != null || value.mediaExcluded === true;
  return {
    voice,
    note: {
      id: value.id,
      kind: "text",
      title: value.title,
      body: value.body,
      voiceId: null,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    },
  };
}

function cleanGroup(value: unknown): BackupGroup | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id) return null;
  if (typeof value.name !== "string" || !value.name.trim()) return null;
  if (typeof value.paused !== "boolean") return null;
  return { id: value.id, name: value.name.trim(), paused: value.paused };
}

export function parseBackup(raw: string, existing: Existing): BackupPreview | BackupFailure {
  if (raw.length > MAX_BACKUP_CHARS) return fail("That backup is too large. Nothing was changed.");
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return fail("That file is not an MJB backup. Nothing was changed.");
  }
  if (!isRecord(data) || data.kind !== BACKUP_KIND) return fail("That file is not an MJB backup. Nothing was changed.");
  if (data.version !== BACKUP_VERSION) return fail("This backup version is not supported. Nothing was changed.");
  if (data.scope !== undefined && data.scope !== "full" && data.scope !== "journal") {
    return fail("This backup version is not supported. Nothing was changed.");
  }
  if (!Array.isArray(data.alarms) || !Array.isArray(data.notes) || !Array.isArray(data.bookmarks)) {
    return fail("That backup is incomplete. Nothing was changed.");
  }
  const alarms: BackupAlarm[] = [];
  for (const row of data.alarms) {
    const alarm = cleanAlarm(row);
    if (alarm === "date") return fail(INVALID_DATE);
    if (!alarm) return fail("That backup has a reminder this version cannot read. Nothing was changed.");
    alarms.push(alarm);
  }
  const notes: BackupNote[] = [];
  let voiceExcluded = 0;
  for (const row of data.notes) {
    const cleaned = cleanNote(row);
    if (cleaned === "date") return fail(INVALID_DATE);
    if (!cleaned) return fail("That backup has a note this version cannot read. Nothing was changed.");
    if (cleaned.voice) voiceExcluded += 1;
    notes.push(cleaned.note);
  }
  const groups: BackupGroup[] = [];
  if (data.groups !== undefined) {
    if (!Array.isArray(data.groups)) return fail("That backup has a group this version cannot read. Nothing was changed.");
    for (const row of data.groups) {
      const group = cleanGroup(row);
      if (!group) return fail("That backup has a group this version cannot read. Nothing was changed.");
      groups.push(group);
    }
  }
  const knownGroups = new Set([...(existing.groups ?? []).map((group) => group.id), ...groups.map((group) => group.id)]);
  if (existing.groups || data.groups !== undefined) {
    for (const alarm of alarms) {
      if (!knownGroups.has(alarm.groupId)) {
        return fail("That backup refers to a reminder group that is not in the file or on this device. Nothing was changed.");
      }
    }
  }
  const bookmarks = data.bookmarks.filter((item): item is string => typeof item === "string" && item.length > 0 && item.length < 80);
  if (bookmarks.length !== data.bookmarks.length) return fail("That backup has a saved post this version cannot read. Nothing was changed.");
  for (const message of [uniqueIds(alarms, "reminder"), uniqueIds(notes, "note"), uniqueIds(groups, "group")]) {
    if (message) return fail(message);
  }
  if (new Set(bookmarks).size !== bookmarks.length) return fail("That backup repeats a saved post, so nothing was changed.");
  let journalTitle: string | undefined;
  if (data.journalTitle !== undefined) {
    if (typeof data.journalTitle !== "string" || data.journalTitle.length > 80) {
      return fail("That backup has a note this version cannot read. Nothing was changed.");
    }
    journalTitle = data.journalTitle;
  }
  const alarmIds = new Set(existing.alarms.map((item) => item.id));
  const noteIds = new Set(existing.notes.map((item) => item.id));
  const saved = new Set(existing.bookmarks);
  return {
    ok: true,
    bundle: {
      alarms,
      notes,
      groups,
      bookmarks,
      voiceExcluded,
      scope: data.scope === "journal" ? "journal" : "full",
      journalTitle,
    },
    conflicts: {
      alarms: alarms.filter((item) => alarmIds.has(item.id)).length,
      notes: notes.filter((item) => noteIds.has(item.id)).length,
      bookmarks: bookmarks.filter((item) => saved.has(item)).length,
    },
  };
}

/**
 * Conflict rule for one note:
 * the later updatedAt supplies the title and body;
 * an equal time keeps the copy already on this device;
 * createdAt is the earlier of the two;
 * a recording link already on this device is kept.
 * A backup file never carries the recording itself.
 */
export function retainRecording<T extends NoteLike>(local: T, incoming: NoteLike): T {
  const text = incoming.updatedAt > local.updatedAt ? incoming : local;
  const voiceId = local.voiceId ?? null;
  return {
    ...local,
    title: text.title ?? local.title,
    body: text.body ?? local.body,
    createdAt: Math.min(local.createdAt, incoming.createdAt),
    updatedAt: Math.max(local.updatedAt, incoming.updatedAt),
    voiceId,
    kind: voiceId ? "voice" : "text",
  };
}

export function mergeBackup<
  TAlarm extends { id: string },
  TNote extends NoteLike,
  TGroup extends { id: string },
>(
  existing: { alarms: TAlarm[]; notes: TNote[]; groups: TGroup[]; bookmarks: string[] },
  bundle: BackupBundle,
): { alarms: TAlarm[]; notes: TNote[]; groups: TGroup[]; bookmarks: string[] } {
  const alarms = [...existing.alarms];
  for (const alarm of bundle.alarms) {
    const index = alarms.findIndex((item) => item.id === alarm.id);
    if (index === -1) alarms.push(alarm as unknown as TAlarm);
    else alarms[index] = { ...alarms[index], ...alarm };
  }
  const notes = [...existing.notes];
  for (const note of bundle.notes) {
    const index = notes.findIndex((item) => item.id === note.id);
    if (index === -1) {
      notes.push(note as unknown as TNote);
      continue;
    }
    notes[index] = retainRecording(notes[index], note);
  }
  const groups = [...existing.groups];
  for (const group of bundle.groups) {
    const index = groups.findIndex((item) => item.id === group.id);
    if (index === -1) groups.push(group as unknown as TGroup);
    else groups[index] = { ...groups[index], ...group } as unknown as TGroup;
  }
  const bookmarks = [...existing.bookmarks];
  for (const id of bundle.bookmarks) if (!bookmarks.includes(id)) bookmarks.push(id);
  return { alarms, notes, groups, bookmarks };
}

export function applyBackup<
  TAlarm extends { id: string },
  TNote extends NoteLike,
  TGroup extends { id: string },
>(
  existing: {
    alarms: TAlarm[];
    notes: TNote[];
    groups: TGroup[];
    bookmarks: string[];
    journalTitle?: string;
  },
  bundle: BackupBundle,
  mode: "merge" | "replace",
): {
  alarms: TAlarm[];
  notes: TNote[];
  groups: TGroup[];
  bookmarks: string[];
  journalTitle?: string;
} {
  const journalTitle = bundle.journalTitle ?? existing.journalTitle;
  if (mode === "merge") {
    return { ...mergeBackup(existing, bundle), journalTitle };
  }
  const notes = bundle.notes.map((note) => {
    const local = existing.notes.find((item) => item.id === note.id);
    return local ? retainRecording(local, note) : (note as unknown as TNote);
  });
  if (bundle.scope === "journal") {
    return {
      alarms: existing.alarms,
      groups: existing.groups,
      bookmarks: existing.bookmarks,
      notes,
      journalTitle,
    };
  }
  return {
    alarms: bundle.alarms as unknown as TAlarm[],
    notes,
    groups: bundle.groups.length > 0 ? (bundle.groups as unknown as TGroup[]) : existing.groups,
    bookmarks: bundle.bookmarks,
    journalTitle,
  };
}

export function journalBackupFile(input: {
  journalTitle: string;
  notes: NoteLike[];
  timeZone: string;
  exportedAt: string;
}) {
  return {
    kind: BACKUP_KIND,
    version: BACKUP_VERSION,
    scope: "journal" as const,
    journalTitle: input.journalTitle,
    timeZone: input.timeZone,
    exportedAt: input.exportedAt,
    alarms: [] as BackupAlarm[],
    groups: [] as BackupGroup[],
    bookmarks: [] as string[],
    notes: input.notes.map((note) => {
      const times = exportableNoteTimes(note.createdAt, note.updatedAt, Date.parse(input.exportedAt));
      return {
        id: note.id,
        kind: "text" as const,
        title: note.title ?? "",
        body: note.body ?? "",
        voiceId: null,
        createdAt: times.createdAt,
        updatedAt: times.updatedAt,
        mediaExcluded: Boolean(note.voiceId || note.kind === "voice"),
      };
    }),
  };
}
