import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { applyBackup, exportableNoteTimes, parseBackup, type BackupPreview } from "@/lib/backup";
import {
  prefsCanPersist,
  usePrefs,
  usePrivate,
  type Measure,
  type ReadingFont,
  type ReadingLayout,
  type Scale,
  type Spacing,
  type ThemeName,
  type Vision,
} from "@/lib/session";

export const Route = createFileRoute("/settings")({
  validateSearch: (search: Record<string, unknown>) => ({
    dev: search.dev === "1" || search.dev === 1 ? 1 : 0,
  }),
  component: SettingsPage,
});

const THEMES: { id: ThemeName; label: string }[] = [
  { id: "gold", label: "Gold" },
  { id: "plain", label: "Plain dark" },
  { id: "ink", label: "Plain light" },
  { id: "purple", label: "Purple" },
  { id: "pink", label: "Pink" },
  { id: "blue", label: "Blue" },
  { id: "contrast", label: "High contrast" },
];

const FONTS: { id: ReadingFont; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "sans", label: "Sans" },
  { id: "verdana", label: "Verdana" },
];

const MEASURES: { id: Measure; label: string }[] = [
  { id: "narrow", label: "Narrow" },
  { id: "reading", label: "Reading" },
  { id: "wide", label: "Wide" },
];

const VISION: { id: Vision; label: string }[] = [
  { id: "standard", label: "Standard" },
  { id: "red-green", label: "Blue accent" },
  { id: "blue-yellow", label: "Pink accent" },
];

const LAYOUTS: { id: ReadingLayout; label: string }[] = [
  { id: "auto", label: "Automatic" },
  { id: "deck", label: "Steps" },
  { id: "split", label: "Split view" },
  { id: "article", label: "Continuous article" },
];

const SPACING: { id: Spacing; label: string }[] = [
  { id: "compact", label: "Compact" },
  { id: "roomy", label: "Roomy" },
  { id: "open", label: "Open" },
];

function SettingsPage() {
  const prefs = usePrefs();
  const { dev } = Route.useSearch();
  const [backupNote, setBackupNote] = useState("");
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [replaceArmed, setReplaceArmed] = useState(false);
  const scales: Scale[] = [1, 1.25, 1.5, 2];
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  function notePersist() {
    if (!prefsCanPersist()) setBackupNote("Your changes work for this visit, but this browser could not save them.");
  }

  function exportBackup() {
    const state = usePrivate.getState();
    const voice = state.notes.filter((note) => note.kind === "voice" || note.voiceId).length;
    const exportedAt = Date.now();
    const file = {
      kind: "mjb-preview-backup",
      version: 1,
      alarms: state.alarms,
      groups: state.groups,
      notes: state.notes.map((note) => {
        const times = exportableNoteTimes(note.createdAt, note.updatedAt, exportedAt);
        return {
          ...note,
          ...times,
          kind: "text" as const,
          voiceId: null,
          mediaExcluded: Boolean(note.voiceId || note.kind === "voice"),
        };
      }),
      bookmarks: state.bookmarks,
    };
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mjb-preview-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    setBackupNote(
      `This backup contains written notes, reminders and saved posts. Voice recordings are not included.${voice ? ` ${voice} voice recording${voice === 1 ? "" : "s"} left out.` : ""}`,
    );
  }

  function importBackup(file: File) {
    if (file.size > 1_500_000) {
      setPreview(null);
      setBackupNote("That backup is too large. Nothing was changed.");
      return;
    }
    void file.text().then((raw) => {
      const state = usePrivate.getState();
      const parsed = parseBackup(raw, state);
      if (!parsed.ok) {
        setPreview(null);
        setReplaceArmed(false);
        setBackupNote(parsed.message);
        return;
      }
      setPreview(parsed);
      setReplaceArmed(false);
      setBackupNote(
        `${parsed.bundle.notes.length} notes, ${parsed.bundle.alarms.length} reminders, ${parsed.bundle.bookmarks.length} saved posts. ${parsed.conflicts.notes + parsed.conflicts.alarms + parsed.conflicts.bookmarks} already on this device. Voice recordings are not included.`,
      );
    }).catch(() => {
      setPreview(null);
      setBackupNote("That file is not an MJB backup. Nothing was changed.");
    });
  }

  function commit(mode: "merge" | "replace") {
    if (!preview) return;
    const state = usePrivate.getState();
    const next = applyBackup(state, preview.bundle, mode);
    try {
      const raw = localStorage.getItem("mjb-preview-private");
      const current = raw ? (JSON.parse(raw) as { state?: object; version?: number }) : { state: {}, version: 2 };
      localStorage.setItem(
        "mjb-preview-private",
        JSON.stringify({ ...current, version: current.version ?? 2, state: { ...current.state, ...next } }),
      );
    } catch {
      setBackupNote("This browser could not save the backup. Your existing notes are unchanged.");
      return;
    }
    usePrivate.setState(next);
    setPreview(null);
    setReplaceArmed(false);
    setBackupNote(
      mode === "merge"
        ? "Merged the backup. Recordings already on this device stay linked. Voice recordings are not included in the file."
        : "Replaced data on this device. A recording stays linked only when that same note is still in the file.",
    );
  }

  return (
    <div className="px-4 py-4">
      <h1 className="font-serif text-3xl text-ink">Accessibility</h1>
      <p className="text-sm text-muted">These choices are saved in this browser. You can change them at any time.</p>
      <fieldset className="mt-4 border-0 p-0">
        <legend className="kicker">Appearance</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={prefs.theme === theme.id ? "btn btn-primary" : "btn"}
              aria-pressed={prefs.theme === theme.id}
              onClick={() => {
                prefs.setTheme(theme.id);
                notePersist();
              }}
            >
              {theme.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">Appearance only. A colour or typeface is not a treatment.</p>
      </fieldset>
      <fieldset className="mt-4 border-0 p-0">
        <legend className="kicker">Typeface</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {FONTS.map((font) => (
            <button key={font.id} type="button" className={prefs.font === font.id ? "btn btn-primary" : "btn"} aria-pressed={prefs.font === font.id} onClick={() => { prefs.setFont(font.id); notePersist(); }}>
              {font.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">This changes how letters look. It is not a reading treatment.</p>
      </fieldset>
      <fieldset className="mt-4 border-0 p-0">
        <legend className="kicker">Line length</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {MEASURES.map((item) => (
            <button key={item.id} type="button" className={prefs.measure === item.id ? "btn btn-primary" : "btn"} aria-pressed={prefs.measure === item.id} onClick={() => { prefs.setMeasure(item.id); notePersist(); }}>
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-4 border-0 p-0">
        <legend className="kicker">Colour distinction</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {VISION.map((item) => (
            <button key={item.id} type="button" className={prefs.vision === item.id ? "btn btn-primary" : "btn"} aria-pressed={prefs.vision === item.id} onClick={() => { prefs.setVision(item.id); notePersist(); }}>
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">Blue or pink accent underlines links so meaning is not only the gold colour. This is not a clinical colour-vision correction.</p>
      </fieldset>
      <fieldset className="mt-4 border-0 p-0">
        <legend className="kicker">Reading text size</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {scales.map((scale) => (
            <button
              key={scale}
              type="button"
              className={prefs.scale === scale ? "btn btn-primary" : "btn"}
              aria-pressed={prefs.scale === scale}
              onClick={() => {
                prefs.setScale(scale);
                notePersist();
              }}
            >
              {Math.round(scale * 100)}%
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-4 border-0 p-0">
        <legend className="kicker">Line spacing</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SPACING.map((gap) => (
            <button
              key={gap.id}
              type="button"
              className={prefs.spacing === gap.id ? "btn btn-primary" : "btn"}
              aria-pressed={prefs.spacing === gap.id}
              onClick={() => {
                prefs.setSpacing(gap.id);
                notePersist();
              }}
            >
              {gap.label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-4 border-0 p-0">
        <legend className="kicker">Reading layout</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              type="button"
              className={prefs.layout === layout.id ? "btn btn-primary" : "btn"}
              aria-pressed={prefs.layout === layout.id}
              onClick={() => {
                prefs.setLayout(layout.id);
                notePersist();
              }}
            >
              {layout.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 flex flex-col gap-2">
        <button type="button" className="btn" aria-pressed={prefs.bionic} onClick={() => prefs.setBionic(!prefs.bionic)}>
          Bionic text {prefs.bionic ? "on" : "off"}
        </button>
        <button type="button" className="btn" aria-pressed={prefs.swipe} onClick={() => prefs.setSwipe(!prefs.swipe)}>
          Swipe for sample threads only {prefs.swipe ? "on" : "off"}
        </button>
        <p className="m-0 text-sm text-muted">This does not move the published explanations. Swipe stays off until you turn it on.</p>
        <button type="button" className="btn" aria-pressed={prefs.navAlways} onClick={() => prefs.setNavAlways(!prefs.navAlways)}>
          Always show navigation {prefs.navAlways ? "on" : "off"}
        </button>
        <button
          type="button"
          className="btn"
          aria-pressed={prefs.motion === "reduce"}
          onClick={() => prefs.setMotion(prefs.motion === "reduce" ? "system" : "reduce")}
        >
          Reduce motion {prefs.motion === "reduce" ? "on" : "off"}
        </button>
        <p className="m-0 text-sm text-muted">Bionic text applies to the short explanations. Full published pages stay in ordinary type so the wording is unchanged.</p>
      </div>
      <fieldset className="mt-4 border-0 p-0">
        <legend className="kicker">Listening voice</legend>
        <label className="field mt-2">
          <span>Speed, {Number(prefs.speechRate).toFixed(2)}×</span>
          <input
            className="mt-1 block w-full"
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={Number(prefs.speechRate)}
            onChange={(event) => { prefs.setSpeechRate(Number(event.target.value)); notePersist(); }}
          />
        </label>
        <button type="button" className="btn mt-2" onClick={() => { prefs.setSpeechRate(1); notePersist(); }}>Reset speed</button>
        <label className="field mt-3">
          <span>Device voice, grouped by language</span>
          <select className="input" value={prefs.voiceURI} onChange={(event) => { prefs.setVoiceURI(event.target.value); notePersist(); }}>
            <option value="">Browser default</option>
            {prefs.voiceURI && !voices.some((voice) => voice.voiceURI === prefs.voiceURI) ? (
              <option value={prefs.voiceURI}>Saved voice is not on this device</option>
            ) : null}
            {[...voices.reduce((groups, voice) => {
              const lang = voice.lang || "Other";
              const list = groups.get(lang) ?? [];
              list.push(voice);
              groups.set(lang, list);
              return groups;
            }, new Map<string, SpeechSynthesisVoice[]>())].sort(([a], [b]) => a.localeCompare(b)).map(([lang, list]) => (
              <optgroup key={lang} label={lang}>
                {list.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <p className="mt-2 text-sm text-muted">Voices come from this device and can appear or disappear. The language is the voice, not a translation of the page. This does not promise a particular voice, or that speech works offline, on another device.</p>
      </fieldset>
      <section className="mt-6">
        <h2 className="text-xl text-ink">Backup on this device</h2>
        <p className="text-sm text-muted">This backup contains written notes, reminders and saved posts. Voice recordings are not included.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={exportBackup}>
            Export backup
          </button>
          <label className="btn">
            Choose a backup
            <input
              className="sr-only"
              type="file"
              accept="application/json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) importBackup(file);
                event.target.value = "";
              }}
            />
          </label>
        </div>
        {preview ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={() => commit("merge")}>
              Merge backup
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setPreview(null);
                setReplaceArmed(false);
                setBackupNote("Import cancelled. Nothing was changed.");
              }}
            >
              Cancel
            </button>
            {replaceArmed ? (
              <button type="button" className="btn" onClick={() => commit("replace")}>
                Replace existing data
              </button>
            ) : (
              <button type="button" className="btn" onClick={() => setReplaceArmed(true)}>
                Replace existing data…
              </button>
            )}
          </div>
        ) : null}
        {replaceArmed ? (
          <p className="text-sm">
            {preview?.bundle.scope === "journal"
              ? "This replaces the journal on this device. Reminders and saved posts stay. A recording stays on a note only when that same note is still in the file."
              : "This replaces written notes, reminders and saved posts on this device. A recording stays on a note only when that same note is still in the file. The backup file does not contain recordings."}
          </p>
        ) : null}
        {backupNote ? (
          <p className="text-sm" role="status">
            {backupNote}
          </p>
        ) : null}
      </section>
      {dev === 1 ? (
        <fieldset className="mt-6 border-0 p-0">
          <legend className="kicker">Developer layout</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["feed", "cards", "hybrid"] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                className={prefs.direction === direction ? "btn btn-primary" : "btn"}
                onClick={() => prefs.setDirection(direction)}
              >
                {direction}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}
