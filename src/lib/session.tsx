import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Mood } from "@/data/roasts";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Direction = "feed" | "cards" | "hybrid";
export type ThemeName = "gold" | "purple" | "ink" | "contrast" | "plain" | "pink" | "blue";
export type Spacing = "compact" | "roomy" | "open";
export type Scale = 1 | 1.25 | 1.5 | 2;
export type SpeechRate = number;
export type ReadingFont = "default" | "sans" | "verdana";
export type Measure = "narrow" | "reading" | "wide";
export type Vision = "standard" | "red-green" | "blue-yellow";
export type ReadingLayout = "auto" | "deck" | "split" | "article";
export type RailMode = "expanded" | "compact" | "closed";

type Prefs = {
  direction: Direction;
  theme: ThemeName;
  swipe: boolean;
  scale: Scale;
  spacing: Spacing;
  motion: "system" | "reduce";
  bionic: boolean;
  navAlways: boolean;
  layout: ReadingLayout;
  rail: RailMode;
  font: ReadingFont;
  measure: Measure;
  vision: Vision;
  speechRate: SpeechRate;
  voiceURI: string;
  setDirection: (direction: Direction) => void;
  setTheme: (theme: ThemeName) => void;
  setSwipe: (swipe: boolean) => void;
  setScale: (scale: Scale) => void;
  setSpacing: (spacing: Spacing) => void;
  setMotion: (motion: "system" | "reduce") => void;
  setBionic: (bionic: boolean) => void;
  setNavAlways: (navAlways: boolean) => void;
  setLayout: (layout: ReadingLayout) => void;
  setRail: (rail: RailMode) => void;
  setFont: (font: ReadingFont) => void;
  setMeasure: (measure: Measure) => void;
  setVision: (vision: Vision) => void;
  setSpeechRate: (speechRate: SpeechRate) => void;
  setVoiceURI: (voiceURI: string) => void;
};

export const usePrefs = create<Prefs>()(
  persist(
    (set) => ({
      direction: "hybrid",
      theme: "gold",
      swipe: false,
      scale: 1,
      spacing: "roomy",
      motion: "system",
      bionic: false,
      navAlways: false,
      layout: "auto",
      rail: "expanded",
      font: "default",
      measure: "reading",
      vision: "standard",
      speechRate: 1,
      voiceURI: "",
      setDirection: (direction) => set({ direction }),
      setTheme: (theme) => set({ theme }),
      setSwipe: (swipe) => set({ swipe }),
      setScale: (scale) => set({ scale }),
      setSpacing: (spacing) => set({ spacing }),
      setMotion: (motion) => set({ motion }),
      setBionic: (bionic) => set({ bionic }),
      setNavAlways: (navAlways) => set({ navAlways }),
      setLayout: (layout) => set({ layout }),
      setRail: (rail) => set({ rail }),
      setFont: (font) => set({ font }),
      setMeasure: (measure) => set({ measure }),
      setVision: (vision) => set({ vision }),
      setSpeechRate: (speechRate) => {
        const next = Number.isFinite(speechRate) ? Math.min(2, Math.max(0.5, Math.round(speechRate * 20) / 20)) : 1;
        set({ speechRate: next });
      },
      setVoiceURI: (voiceURI) => set({ voiceURI }),
    }),
    {
      name: "mjb-preview-prefs",
      skipHydration: true,
      partialize: (state) => ({
        direction: state.direction,
        theme: state.theme,
        swipe: state.swipe,
        scale: state.scale,
        spacing: state.spacing,
        motion: state.motion,
        bionic: state.bionic,
        navAlways: state.navAlways,
        layout: state.layout,
        rail: state.rail,
        font: state.font,
        measure: state.measure,
        vision: state.vision,
        speechRate: state.speechRate,
        voiceURI: state.voiceURI,
      }),
    },
  ),
);

export type AlarmStatus = "scheduled" | "due" | "dismissed" | "snoozed" | "completed";
export type ToneName = "chime" | "pulse" | "bell";
export type ColourId = "gold" | "cream" | "sand" | "ink" | "paper";

export type Group = { id: string; name: string; paused: boolean };

export type Alarm = {
  id: string;
  label: string;
  groupId: string;
  colour: ColourId;
  tone: ToneName;
  time: string;
  urgent: boolean;
  status: AlarmStatus;
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
  roast?: string;
  late?: boolean;
};

export type NoteKind = "text" | "voice";

export type Note = {
  id: string;
  kind: NoteKind;
  title: string;
  body: string;
  voiceId: string | null;
  createdAt: number;
  updatedAt: number;
};

type PrivateState = {
  alarms: Alarm[];
  groups: Group[];
  notes: Note[];
  bookmarks: string[];
  seenDecks: string[];
  lastPostId: string | null;
  scrollById: Record<string, number>;
  journalTitle: string;
  upsertAlarm: (alarm: Alarm) => void;
  patchAlarm: (id: string, patch: Partial<Alarm>) => void;
  removeAlarm: (id: string) => void;
  renameGroup: (id: string, name: string) => void;
  toggleGroup: (id: string) => void;
  toggleBookmark: (id: string) => void;
  markDeckSeen: (id: string) => void;
  touchPlace: (postId: string, scrollY?: number) => void;
  saveNote: (note: Note) => void;
  removeNote: (id: string) => void;
  setJournalTitle: (title: string) => void;
};

const DEFAULT_GROUPS: Group[] = [
  { id: "medication", name: "Medication", paused: false },
  { id: "appointments", name: "Appointments", paused: false },
  { id: "everyday", name: "Everyday", paused: false },
  { id: "sleep", name: "Sleep", paused: false },
];

export const COLOURS: { id: ColourId; label: string; swatch: string }[] = [
  { id: "gold", label: "Gold", swatch: "swatch-gold" },
  { id: "cream", label: "Cream", swatch: "swatch-cream" },
  { id: "sand", label: "Sand", swatch: "swatch-sand" },
  { id: "ink", label: "Ink", swatch: "swatch-ink" },
  { id: "paper", label: "Paper", swatch: "swatch-paper" },
];

export const usePrivate = create<PrivateState>()(
  persist(
    (set) => ({
      alarms: [],
      groups: DEFAULT_GROUPS,
      notes: [],
      bookmarks: [],
      seenDecks: [],
      lastPostId: null,
      scrollById: {},
      journalTitle: "",
      upsertAlarm: (alarm) =>
        set((state) => ({
          alarms: state.alarms.some((item) => item.id === alarm.id)
            ? state.alarms.map((item) => (item.id === alarm.id ? alarm : item))
            : [...state.alarms, alarm],
        })),
      patchAlarm: (id, patch) =>
        set((state) => ({
          alarms: state.alarms.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),
      removeAlarm: (id) => set((state) => ({ alarms: state.alarms.filter((item) => item.id !== id) })),
      renameGroup: (id, name) =>
        set((state) => ({
          groups: state.groups.map((group) => (group.id === id ? { ...group, name } : group)),
        })),
      toggleGroup: (id) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === id ? { ...group, paused: !group.paused } : group,
          ),
        })),
      toggleBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(id)
            ? state.bookmarks.filter((item) => item !== id)
            : [...state.bookmarks, id],
        })),
      markDeckSeen: (id) =>
        set((state) => {
          if (state.seenDecks.includes(id)) return state;
          return { seenDecks: [...state.seenDecks, id] };
        }),
      touchPlace: (postId, scrollY) =>
        set((state) => ({
          lastPostId: postId,
          scrollById:
            typeof scrollY === "number"
              ? { ...state.scrollById, [postId]: scrollY }
              : state.scrollById,
        })),
      saveNote: (note) =>
        set((state) => ({
          notes: state.notes.some((item) => item.id === note.id)
            ? state.notes.map((item) => (item.id === note.id ? note : item))
            : [note, ...state.notes],
        })),
      removeNote: (id) => set((state) => ({ notes: state.notes.filter((item) => item.id !== id) })),
      setJournalTitle: (journalTitle: string) => set({ journalTitle }),
    }),
    {
      name: "mjb-preview-private",
      skipHydration: true,
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as { alarms?: Partial<Alarm>[]; seenDecks?: string[] };
        if (!Array.isArray(state.seenDecks)) state.seenDecks = [];
        if (version < 2 && Array.isArray(state.alarms)) {
          state.alarms = state.alarms.map((alarm) => ({
            enabled: true,
            nextAt: null,
            mood: "cheeky" as Mood,
            custom: [],
            snoozes: 0,
            speak: false,
            ...alarm,
          }));
        }
        return state as never;
      },
      partialize: (state) => ({
        alarms: state.alarms,
        groups: state.groups,
        notes: state.notes,
        bookmarks: state.bookmarks,
        seenDecks: state.seenDecks,
        lastPostId: state.lastPostId,
        scrollById: state.scrollById,
        journalTitle: state.journalTitle,
      }),
    },
  ),
);

const HydrationContext = createContext(false);

export function useHydrated(): boolean {
  return useContext(HydrationContext);
}

function applyPrefs(prefs: Pick<Prefs, "theme" | "scale" | "spacing" | "motion" | "font" | "measure" | "vision">) {
  const root = document.documentElement;
  root.dataset.theme = prefs.theme;
  root.dataset.spacing = prefs.spacing;
  root.dataset.motion = prefs.motion === "reduce" ? "reduce" : "system";
  root.dataset.scale = String(prefs.scale);
  root.dataset.font = prefs.font;
  root.dataset.measure = prefs.measure;
  root.dataset.vision = prefs.vision;
  root.style.setProperty("--read-scale", String(prefs.scale));
  const themeColor =
    prefs.theme === "ink"
      ? "#fbf8f1"
      : prefs.theme === "purple"
        ? "#0e0a1a"
        : prefs.theme === "pink"
          ? "#14080e"
          : prefs.theme === "blue"
            ? "#071018"
            : prefs.theme === "plain"
              ? "#111111"
              : "#050505";
  const theme = document.querySelector('meta[name="theme-color"]');
  if (theme) theme.setAttribute("content", themeColor);
}

const LEGACY_LAYOUTS = ["auto", "deck", "split", "article"] as const;
const LEGACY_SCALES = [1, 1.25, 1.5, 2] as const;

/**
 * One-time move from the old reader keys into the shared preference store.
 * Those keys win once, then they are removed. After that, Settings and the
 * reader edit the same values. Text size is applied once, on the reading text.
 */
export function takeLegacyReaderPrefs(): { layout?: ReadingLayout; scale?: Scale } {
  try {
    if (localStorage.getItem("mjb-prefs-layout-migrated") === "1") return {};
    const layout = localStorage.getItem("mjb-reader-layout");
    const scale = Number(localStorage.getItem("mjb-reader-scale"));
    const next: { layout?: ReadingLayout; scale?: Scale } = {};
    if ((LEGACY_LAYOUTS as readonly string[]).includes(layout ?? "")) next.layout = layout as ReadingLayout;
    if ((LEGACY_SCALES as readonly number[]).includes(scale)) next.scale = scale as Scale;
    localStorage.setItem("mjb-prefs-layout-migrated", "1");
    localStorage.removeItem("mjb-reader-layout");
    localStorage.removeItem("mjb-reader-scale");
    return next;
  } catch {
    return {};
  }
}

export function prefsCanPersist(): boolean {
  try {
    localStorage.setItem("mjb-prefs-probe", "1");
    localStorage.removeItem("mjb-prefs-probe");
    return true;
  } catch {
    return false;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    void Promise.all([
      Promise.resolve(usePrefs.persist.rehydrate()),
      Promise.resolve(usePrivate.persist.rehydrate()),
    ]).finally(() => {
      if (!live) return;
      applyPrefs(usePrefs.getState());
      const legacy = takeLegacyReaderPrefs();
      if (legacy.layout) usePrefs.getState().setLayout(legacy.layout);
      if (legacy.scale) usePrefs.getState().setScale(legacy.scale);
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);

  const theme = usePrefs((state) => state.theme);
  const scale = usePrefs((state) => state.scale);
  const spacing = usePrefs((state) => state.spacing);
  const motion = usePrefs((state) => state.motion);
  const font = usePrefs((state) => state.font);
  const measure = usePrefs((state) => state.measure);
  const vision = usePrefs((state) => state.vision);

  useEffect(() => {
    if (!ready) return;
    applyPrefs({ theme, scale, spacing, motion, font, measure, vision });
  }, [ready, theme, scale, spacing, motion, font, measure, vision]);

  return <HydrationContext.Provider value={ready}>{children}</HydrationContext.Provider>;
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function clockKey(date = new Date()): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function shiftTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map((part) => Number(part));
  const total = (((h * 60 + m + minutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
