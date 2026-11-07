import { useEffect, useMemo, useRef, useState } from "react";
import { PRESETS, type Mood } from "@/data/roasts";
import { exportableNoteTimes, journalBackupFile } from "@/lib/backup";
import { playTone } from "@/lib/audio";
import { askToKeepData } from "@/lib/make-alarm";
import { formatStamp } from "@/lib/stamp";
import { deleteClip, loadClip, saveClip } from "@/lib/voice-store";
import {
  COLOURS,
  clockKey,
  shiftTime,
  todayKey,
  useHydrated,
  usePrivate,
  type Alarm,
  type ColourId,
  type Note,
  type ToneName,
} from "@/lib/session";

const TONES: { id: ToneName; label: string }[] = [
  { id: "chime", label: "Chime" },
  { id: "pulse", label: "Pulse" },
  { id: "bell", label: "Bell" },
];

function nextQuarter(): string {
  const now = new Date();
  const plus = new Date(now.getTime() + 15 * 60 * 1000);
  plus.setMinutes(plus.getMinutes() - (plus.getMinutes() % 15), 0, 0);
  return clockKey(plus);
}

function statusWords(status: Alarm["status"]): string {
  if (status === "scheduled") return "Scheduled";
  if (status === "due") return "Due now";
  if (status === "snoozed") return "Snoozed";
  if (status === "dismissed") return "Dismissed";
  return "Completed by you";
}

function occurrence(alarm: Alarm, paused: boolean, now: Date): string {
  if (paused) return "Group paused";
  if (alarm.status === "due") return "Now";
  if (alarm.status === "snoozed" && alarm.snoozeUntil) {
    return `Snoozed until ${new Date(alarm.snoozeUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  const [h, m] = alarm.time.split(":").map((part) => Number(part));
  const when = new Date(now);
  when.setHours(h, m, 0, 0);
  const actedToday =
    (alarm.status === "dismissed" || alarm.status === "completed") && alarm.lastActionDate === todayKey(now);
  if (when <= now || actedToday) when.setDate(when.getDate() + 1);
  const day = when.toDateString() === now.toDateString() ? "Today" : "Tomorrow";
  return `${day} ${alarm.time}`;
}

function AlarmLine({ alarm, when }: { alarm: Alarm; when: string }) {
  return (
    <p className="mb-2 last:mb-0">
      <span className="font-serif text-xl text-ink">{alarm.roast || alarm.label}</span>
      <span className="mt-1 block text-sm text-muted">
        {when} · {alarm.label}
      </span>
    </p>
  );
}

function VoiceNote({ id }: { id: string }) {
  const [note, setNote] = useState("");

  async function play() {
    const blob = await loadClip(id);
    if (!blob) {
      setNote("That clip is no longer in this browser.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    await audio.play();
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn" onClick={() => void play()}>
        Play voice note
      </button>
      {note ? <span className="text-sm text-muted">{note}</span> : null}
    </span>
  );
}

export function ToolsPanel() {
  const hydrated = useHydrated();
  const alarms = usePrivate((state) => state.alarms);
  const groups = usePrivate((state) => state.groups);
  const notes = usePrivate((state) => state.notes);
  const upsertAlarm = usePrivate((state) => state.upsertAlarm);
  const patchAlarm = usePrivate((state) => state.patchAlarm);
  const removeAlarm = usePrivate((state) => state.removeAlarm);
  const renameGroup = usePrivate((state) => state.renameGroup);
  const toggleGroup = usePrivate((state) => state.toggleGroup);
  const saveNote = usePrivate((state) => state.saveNote);
  const removeNote = usePrivate((state) => state.removeNote);
  const journalTitle = usePrivate((state) => state.journalTitle);
  const setJournalTitle = usePrivate((state) => state.setJournalTitle);

  const [label, setLabel] = useState("");
  const [time, setTime] = useState(nextQuarter);
  const [groupId, setGroupId] = useState("everyday");
  const [colour, setColour] = useState<ColourId>("gold");
  const [tone, setTone] = useState<ToneName>("chime");
  const [mood, setMood] = useState<Mood>("cheeky");
  const [customLine, setCustomLine] = useState("");
  const [speak, setSpeak] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [days, setDays] = useState<number[]>([]);
  const [copies, setCopies] = useState(3);
  const [step, setStep] = useState(60);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [query, setQuery] = useState("");
  const [micNote, setMicNote] = useState("");
  const [shareFallback, setShareFallback] = useState("");
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [undo, setUndo] = useState<Note | null>(null);
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const undoRef = useRef<Note | null>(null);

  useEffect(() => {
    undoRef.current = undo;
  }, [undo]);

  useEffect(() => {
    return () => {
      const rec = recRef.current;
      if (rec) {
        rec.stream.getTracks().forEach((track) => track.stop());
        if (rec.state !== "inactive") rec.stop();
      }
      const pending = undoRef.current;
      if (pending) saveNote(pending);
    };
  }, [saveNote]);

  const board = useMemo(() => {
    const now = new Date();
    const rows = alarms.map((alarm) => {
      const paused = groups.find((group) => group.id === alarm.groupId)?.paused ?? false;
      return { alarm, paused, when: occurrence(alarm, paused, now) };
    });
    const nowRows = rows.filter((row) => row.alarm.status === "due");
    const nextRow = rows
      .filter((row) => row.alarm.status !== "due")
      .sort((a, b) => a.when.localeCompare(b.when))[0];
    return { nowRows, nextRow, rows };
  }, [alarms, groups]);

  if (!hydrated) {
    return <p className="text-muted">Loading what is already stored on this device…</p>;
  }

  function makeAlarm(partial: Partial<Alarm> & { label: string; time: string }): Alarm {
    return {
      id: crypto.randomUUID(),
      label: partial.label,
      time: partial.time,
      groupId: partial.groupId ?? groupId,
      colour: partial.colour ?? colour,
      tone: partial.tone ?? tone,
      urgent: partial.urgent ?? urgent,
      status: "scheduled",
      snoozeUntil: null,
      lastFiredDate: null,
      lastActionDate: null,
      enabled: true,
      nextAt: null,
      mood: partial.mood ?? mood,
      custom: partial.custom ?? (customLine.trim() ? [customLine.trim()] : []),
      snoozes: 0,
      speak: partial.speak ?? speak,
      days: partial.days ?? (days.length ? [...days] : undefined),
    };
  }

  function addOne() {
    const name = label.trim();
    if (!name) {
      setError("Add a label first. A blank reminder is too easy to misread.");
      return;
    }
    setError("");
    upsertAlarm(makeAlarm({ label: name, time }));
    askToKeepData();
    setLabel("");
  }

  function addCopies() {
    const name = label.trim();
    if (!name) {
      setError("Name the routine before copying it.");
      return;
    }
    const count = Math.min(5, Math.max(2, copies));
    for (let i = 0; i < count; i += 1) {
      upsertAlarm(
        makeAlarm({
          label: `${name} · ${i + 1}`,
          time: shiftTime(time, i * step),
        }),
      );
    }
    setError("");
    setLabel("");
  }

  async function toggleRecord() {
    if (recording && recorder) {
      recorder.stop();
      setRecording(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMicNote("This browser cannot record audio. Type the note instead. Nothing was uploaded.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        const id = crypto.randomUUID();
        const now = Date.now();
        void saveClip(id, blob)
          .then(() => {
            saveNote({
              id,
              kind: "voice",
              title: title.trim() || "Voice note",
              body: body.trim(),
              voiceId: id,
              createdAt: now,
              updatedAt: now,
            });
            setTitle("");
            setBody("");
            setMicNote("Voice note saved on this device only. This is a recording, not a transcription.");
          })
          .catch(() => {
            setMicNote("This browser could not store the recording. Your typed text is still here.");
          });
      };
      rec.start();
      recRef.current = rec;
      setRecorder(rec);
      setRecording(true);
      setMicNote("Recording. Stop when you are done. It is not uploaded.");
    } catch {
      setMicNote("Microphone blocked. You can still type a note. Nothing was uploaded.");
    }
  }

  function saveText() {
    const text = body.trim();
    const name = title.trim();
    if (!text && !name) return;
    const now = Date.now();
    saveNote({
      id: crypto.randomUUID(),
      kind: "text",
      title: name || "Note",
      body: text,
      voiceId: null,
      createdAt: now,
      updatedAt: now,
    });
    askToKeepData();
    setTitle("");
    setBody("");
  }

  function stamp(ms: number) {
    return formatStamp(ms);
  }

  function removeWithUndo(note: Note) {
    removeNote(note.id);
    setUndo(note);
    window.setTimeout(() => {
      setUndo((current) => {
        if (current?.id !== note.id) return current;
        if (note.voiceId) void deleteClip(note.voiceId);
        return null;
      });
    }, 8000);
  }

  async function shareNote(note: Note) {
    const text = `${note.title}\n\n${note.body}`.trim();
    const voice = Boolean(note.voiceId);
    const copied = voice
      ? "Copied the text of this entry. The recording was not shared."
      : "Copied this entry. It was not uploaded.";
    if (!voice && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: note.title, text });
        setShareFallback("");
        return;
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(text);
      setShareFallback("");
      setMicNote(copied);
    } catch {
      setShareFallback(text);
      setMicNote("Could not copy automatically. Select the text below.");
    }
  }

  function downloadJournal(kind: "json" | "md") {
    if (kind === "json") {
      const file = journalBackupFile({
        journalTitle: journalTitle.trim() || "Journal",
        notes,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        exportedAt: new Date().toISOString(),
      });
      const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mjb-journal-backup.json";
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    const heading = journalTitle.trim() ? `${journalTitle.trim()}'s no-obligation journal` : "Your no-obligation journal";
    const lines = notes.map((note) => {
      const edited = note.updatedAt !== note.createdAt ? `Edited: ${stamp(note.updatedAt)}\n` : "";
      const media = note.voiceId ? "Recording: kept on this device. Not included in this file.\n" : "";
      return `## ${note.title}\n\nCreated: ${stamp(note.createdAt)}\n${edited}${media}\n${note.body}\n`;
    });
    const blob = new Blob([`# ${heading}\n\n${lines.join("\n")}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mjb-journal.md";
    link.click();
    URL.revokeObjectURL(url);
  }

  const filtered = notes.filter((note) => {
    const hay = `${note.title} ${note.body}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6">
      <p className="m-0 text-sm text-muted">
        On-device reminders and a private note. They ring only while this tab is open. They are not a medical record, not a
        phone alarm, and Done is not proof a dose was taken.
      </p>

      <section aria-labelledby="board-heading">
        <h2 id="board-heading" className="mb-2 text-2xl">
          Now / Next
        </h2>
        {board.nowRows.length === 0 && !board.nextRow ? (
          <p className="text-body">Nothing set. Add one labelled reminder. You do not need a full routine first.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card">
              <p className="kicker m-0">Now</p>
              {board.nowRows.length === 0 ? (
                <p className="mb-0">Nothing is due.</p>
              ) : (
                board.nowRows.map((row) => <AlarmLine key={row.alarm.id} alarm={row.alarm} when="Due now" />)
              )}
            </div>
            <div className="card">
              <p className="kicker m-0">Next</p>
              {board.nextRow ? (
                <AlarmLine alarm={board.nextRow.alarm} when={board.nextRow.when} />
              ) : (
                <p className="mb-0">Nothing else queued.</p>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="card" aria-labelledby="add-heading">
        <h2 id="add-heading" className="m-0 text-xl">
          Add a roast alarm
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="btn"
              onClick={() => {
                setLabel(preset.label);
                setMood(preset.mood);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="field sm:col-span-2">
            <span>Label</span>
            <input className="input" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Evening dose check" />
          </label>
          <label className="field">
            <span>Time</span>
            <input className="input" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          </label>
          <label className="field">
            <span>Group</span>
            <select className="select" value={groupId} onChange={(event) => setGroupId(event.target.value)}>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="mt-3 border-0 p-0">
          <legend className="kicker">Days</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className={days.length === 0 ? "btn btn-primary" : "btn"} onClick={() => setDays([])}>
              Every day
            </button>
            <button
              type="button"
              className={days.join() === "1,2,3,4,5" ? "btn btn-primary" : "btn"}
              onClick={() => setDays([1, 2, 3, 4, 5])}
            >
              Weekdays
            </button>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((name, index) => {
              const day = index + 1;
              const on = days.includes(day);
              return (
                <button
                  key={name}
                  type="button"
                  className={on ? "btn btn-primary" : "btn"}
                  aria-pressed={on}
                  onClick={() => setDays(on ? days.filter((item) => item !== day) : [...days, day].sort((a, b) => a - b))}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </fieldset>
        <fieldset className="mt-3 border-0 p-0">
          <legend className="kicker">Colour name</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {COLOURS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === colour ? "btn btn-primary" : "btn"}
                aria-pressed={item.id === colour}
                onClick={() => setColour(item.id)}
              >
                <span className={`swatch ${item.swatch}`} aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-3 border-0 p-0">
          <legend className="kicker">Sound</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {TONES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === tone ? "btn btn-primary" : "btn"}
                aria-pressed={item.id === tone}
                onClick={() => {
                  setTone(item.id);
                  playTone(item.id);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mb-0 mt-2 text-sm text-muted">Local tones only. Not Spotify or YouTube.</p>
        </fieldset>
        <fieldset className="mt-3 border-0 p-0">
          <legend className="kicker">Mood</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["gentle", "cheeky", "savage"] as Mood[]).map((item) => (
              <button
                key={item}
                type="button"
                className={item === mood ? "btn btn-primary" : "btn"}
                aria-pressed={item === mood}
                onClick={() => setMood(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="field mt-3">
          <span>Your own line, optional</span>
          <input className="input" value={customLine} onChange={(event) => setCustomLine(event.target.value)} />
        </label>
        <button type="button" className="btn mt-3" aria-pressed={speak} onClick={() => setSpeak(!speak)}>
          Say it out loud {speak ? "on" : "off"}
        </button>
        <button type="button" className="btn mt-3" aria-pressed={urgent} onClick={() => setUrgent(!urgent)}>
          {urgent ? "Marked urgent" : "Mark urgent"}
        </button>
        {urgent ? <p className="text-sm text-danger">Urgent is a written flag, not a colour code for evidence.</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={addOne}>
            Save reminder
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="field">
            <span>Copies, 2 to 5</span>
            <input
              className="input"
              type="number"
              min={2}
              max={5}
              value={copies}
              onChange={(event) => setCopies(Number(event.target.value))}
            />
          </label>
          <label className="field">
            <span>Minutes apart</span>
            <select className="select" value={step} onChange={(event) => setStep(Number(event.target.value))}>
              <option value={30}>30</option>
              <option value={60}>60</option>
            </select>
          </label>
        </div>
        <button type="button" className="btn mt-3" onClick={addCopies}>
          Duplicate as a short run
        </button>
      </section>

      <section aria-labelledby="groups-heading">
        <h2 id="groups-heading" className="text-xl">
          Groups
        </h2>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {groups.map((group) => (
            <li key={group.id} className="card flex flex-wrap items-center gap-2">
              <label className="field min-w-40 flex-1">
                <span>Name</span>
                <input className="input" value={group.name} onChange={(event) => renameGroup(group.id, event.target.value)} />
              </label>
              <button type="button" className="btn" aria-pressed={group.paused} onClick={() => toggleGroup(group.id)}>
                {group.paused ? "Paused" : "Pause group"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="list-heading">
        <h2 id="list-heading" className="text-xl">
          All reminders
        </h2>
        {alarms.length === 0 ? (
          <p className="text-muted">No reminders yet.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {alarms.map((alarm) => {
              const group = groups.find((item) => item.id === alarm.groupId);
              const colourName = COLOURS.find((item) => item.id === alarm.colour);
              return (
                <li key={alarm.id} className="card">
                  <p className="m-0 flex flex-wrap items-center gap-2">
                    <span className={`swatch ${colourName?.swatch ?? "swatch-gold"}`} aria-hidden="true" />
                    <span className="font-serif text-xl text-ink">{alarm.label}</span>
                  </p>
                  <p className="text-sm text-muted">
                    {colourName?.label} · {group?.name} · {alarm.time} · {alarm.mood} · {statusWords(alarm.status)}
                    {group?.paused ? " · group paused" : ""}
                    {alarm.urgent ? " · Urgent" : ""}
                    {alarm.speak ? " · spoken" : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn"
                      onClick={() =>
                        upsertAlarm({
                          ...alarm,
                          id: crypto.randomUUID(),
                          label: `${alarm.label} copy`,
                          time: shiftTime(alarm.time, 60),
                          status: "scheduled",
                          snoozeUntil: null,
                          lastFiredDate: null,
                          lastActionDate: null,
                          nextAt: null,
                          snoozes: 0,
                          roast: undefined,
                          late: false,
                        })
                      }
                    >
                      Duplicate +1 hour
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() =>
                        patchAlarm(alarm.id, {
                          status: "dismissed",
                          lastActionDate: todayKey(),
                          snoozeUntil: null,
                        })
                      }
                    >
                      Dismissed
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() =>
                        patchAlarm(alarm.id, {
                          status: "completed",
                          lastActionDate: todayKey(),
                          snoozeUntil: null,
                        })
                      }
                    >
                      Completed by me
                    </button>
                    <button type="button" className="btn btn-quiet" onClick={() => removeAlarm(alarm.id)}>
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card" aria-labelledby="journal-heading">
        <h2 id="journal-heading" className="m-0 text-xl">
          {journalTitle.trim() ? `${journalTitle.trim()}'s no-obligation journal` : "Your no-obligation journal"}
        </h2>
        <p className="text-sm text-muted">
          Dates and times are added automatically. Write as much or as little as you want. Change the title and colours whenever you like.
        </p>
        <p className="text-sm text-muted">
          Entries stay in this browser. They are not encrypted by this app and may be accessible to other people using this browser profile. Keep a backup if you want to retain them.
        </p>
        <label className="field">
          <span>Journal title</span>
          <input
            className="input"
            value={nameDraft ?? journalTitle}
            onChange={(event) => setNameDraft(event.target.value)}
            onBlur={() => {
              if (nameDraft !== null) {
                setJournalTitle(nameDraft);
                setNameDraft(null);
              }
            }}
          />
        </label>
        <div className="grid gap-3">
          <label className="field">
            <span>Title</span>
            <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field">
            <span>Note</span>
            <textarea className="input min-h-24" value={body} onChange={(event) => setBody(event.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={saveText}>
              Save note
            </button>
            <button type="button" className="btn" onClick={() => void toggleRecord()}>
              {recording ? "Stop recording" : "Record a voice note"}
            </button>
          </div>
          {micNote ? <p className="m-0 text-sm text-muted">{micNote}</p> : null}
          {shareFallback ? (
            <label className="field">
              <span>Entry text</span>
              <textarea className="input min-h-24" readOnly value={shareFallback} />
            </label>
          ) : null}
          <p className="m-0 text-sm text-muted">A voice note is a recording kept on this device. It is not turned into text.</p>
          <label className="field">
            <span>Find a note</span>
            <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={() => downloadJournal("json")}>
            Export journal backup (JSON)
          </button>
          <button type="button" className="btn" onClick={() => downloadJournal("md")}>
            Readable text
          </button>
          <button type="button" className="btn" onClick={() => window.print()}>
            Print or save as PDF
          </button>
        </div>
        {undo ? (
          <p className="text-sm" role="status">
            Entry removed.{" "}
            <button
              type="button"
              className="btn"
              onClick={() => {
                saveNote(undo);
                setUndo(null);
              }}
            >
              Undo
            </button>
          </p>
        ) : null}
        {filtered.length === 0 ? (
          <p className="mb-0 mt-3 text-sm text-muted">Nothing saved on this device yet.</p>
        ) : (
          <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
            {filtered.map((note: Note) => (
              <li key={note.id} className="border-t border-line pt-3">
                {editing === note.id ? (
                  <div className="grid gap-2">
                    <input className="input" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} />
                    <textarea className="input min-h-24" value={draftBody} onChange={(event) => setDraftBody(event.target.value)} />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          const now = Date.now();
                          const times = exportableNoteTimes(note.createdAt, now, now);
                          saveNote({
                            ...note,
                            title: draftTitle.trim() || "Note",
                            body: draftBody,
                            createdAt: times.createdAt,
                            updatedAt: times.updatedAt,
                          });
                          setEditing(null);
                        }}
                      >
                        Save changes
                      </button>
                      <button type="button" className="btn" onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="m-0 font-semibold text-ink">{note.title}</p>
                    <p className="mb-1 mt-1 text-sm text-muted">Created {stamp(note.createdAt)}</p>
                    {note.updatedAt !== note.createdAt ? <p className="mb-1 text-sm text-muted">Edited {stamp(note.updatedAt)}</p> : null}
                    {note.body ? <p className="mb-2 mt-1 whitespace-pre-line">{note.body}</p> : null}
                    {note.voiceId ? <VoiceNote id={note.voiceId} /> : null}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          setEditing(note.id);
                          setDraftTitle(note.title);
                          setDraftBody(note.body);
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" className="btn" onClick={() => void shareNote(note)}>
                        {note.voiceId ? "Share text" : "Share this entry"}
                      </button>
                      <button type="button" className="btn btn-quiet" onClick={() => removeWithUndo(note)}>
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
