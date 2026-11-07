import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  BAND_LABEL,
  CARE_NOTE,
  CLINICAL_LINE,
  COMPARE_NOTE,
  MEMORY_NOTE,
  OVERLAP_NOTE,
  SAVE_FAIL,
  SAVE_NOTE,
  backupToText,
  compoundsLink,
  exportDocument,
  loadSaved,
  makeBackup,
  parseBackup,
  profileById,
  readMore,
  removeSaved,
  responseLabel,
  scoredQuestions,
  summarise,
  toggleContext,
  writeSaved,
  type Answers,
  type ContextAnswers,
  type SavedProfile,
  type SelfProfile,
} from "@/lib/self-profile";

type Phase = "intro" | "question" | "context" | "review" | "results";

export function SelfProfileRunner({ profileId }: { profileId: string }) {
  const profile = profileById(profileId);
  if (!profile) {
    return (
      <div className="px-4 py-4">
        <h1>Profile not found</h1>
        <p><a href="/questionnaires">Back to profiles</a></p>
      </div>
    );
  }
  return <Runner profile={profile} />;
}

function Runner({ profile }: { profile: SelfProfile }) {
  const questions = scoredQuestions(profile);
  const headingRef = useRef<HTMLElement | null>(null);
  const focusTarget = (node: HTMLElement | null) => {
    headingRef.current = node;
  };
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const opened = useRef(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [returnTo, setReturnTo] = useState<Phase | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [context, setContext] = useState<ContextAnswers>({});
  const [status, setStatus] = useState("");
  const [savedOnDevice, setSavedOnDevice] = useState(false);
  const [preview, setPreview] = useState<SavedProfile | null>(null);
  const [ready, setReady] = useState(false);
  const progressId = useId();

  useEffect(() => setReady(true), []);

  useEffect(() => {
    const found = loadSaved(profile, window.localStorage);
    if (found.kind === "ready") {
      setSavedOnDevice(true);
      setStatus(`Saved answers from ${found.saved.savedAt} (${found.saved.timeZone}) are on this device. They are not opened until you ask.`);
    } else if (found.kind === "version-differs") {
      setStatus(`Saved answers use version ${found.saved.version}. This profile is version ${profile.version}. They will not be scored with these rules.`);
    }
  }, [profile]);

  useEffect(() => {
    if (!opened.current) {
      opened.current = true;
      return;
    }
    const node = headingRef.current;
    window.requestAnimationFrame(() => node?.focus());
  }, [phase, index]);

  function goQuestion(next: number, backTo: Phase | null = null) {
    setReturnTo(backTo);
    setIndex(next);
    setPhase("question");
  }

  function select(questionId: string, optionId: string) {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
  }

  function skipQuestion() {
    const question = questions[index];
    if (!question) return;
    setAnswers((current) => ({ ...current, [question.question.id]: null }));
    advance();
    setStatus("Question skipped.");
  }

  function advance() {
    setStatus("");
    if (returnTo) {
      setPhase(returnTo);
      setReturnTo(null);
      return;
    }
    if (index >= questions.length - 1) setPhase("context");
    else setIndex((value) => value + 1);
  }

  function next() {
    const question = questions[index];
    if (!question) return;
    if (answers[question.question.id] === undefined) {
      setStatus("Choose an answer, or skip this question.");
      return;
    }
    advance();
  }

  function previous() {
    setStatus("");
    if (phase === "context") {
      setPhase("question");
      setIndex(questions.length - 1);
      return;
    }
    if (index === 0) setPhase("intro");
    else setIndex((value) => value - 1);
  }

  function skipContext() {
    const cleared: ContextAnswers = {};
    for (const question of profile.contextQuestions) cleared[question.id] = null;
    setContext(cleared);
    setPhase("review");
    setStatus("Optional questions skipped.");
  }

  function openSaved() {
    const found = loadSaved(profile, window.localStorage);
    if (found.kind !== "ready") return;
    setAnswers(found.saved.answers);
    setContext(found.saved.context);
    setPhase("review");
    setStatus("Saved answers are open on this page. They are still not sent to MJB.");
  }

  function save() {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
    const saved = makeBackup(profile, answers, context, new Date().toISOString(), zone);
    const wrote = writeSaved(saved, window.localStorage);
    if (!wrote.ok) {
      setStatus(SAVE_FAIL);
      return;
    }
    setSavedOnDevice(true);
    setStatus("Saved on this device. " + SAVE_NOTE);
  }

  function confirmDelete() {
    const removed = removeSaved(profile.id, window.localStorage);
    dialogRef.current?.close();
    deleteButtonRef.current?.focus();
    if (!removed.ok) {
      setStatus("The saved copy could not be removed. Answers on this page were kept.");
      return;
    }
    setSavedOnDevice(false);
    setStatus("Saved answers were deleted from this device. Answers on this page were kept.");
  }

  function onFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseBackup(profile, String(reader.result ?? ""));
      if (!parsed.ok) {
        setPreview(null);
        setStatus(parsed.reason);
        return;
      }
      if (parsed.saved.version !== profile.version) {
        setPreview(null);
        setStatus(`This backup is version ${parsed.saved.version}. It was not opened, because this profile is version ${profile.version}.`);
        return;
      }
      setPreview(parsed.saved);
      setStatus("Check this backup before it replaces the answers on this page.");
    };
    reader.readAsText(file);
  }

  function applyPreview() {
    if (!preview) return;
    setAnswers(preview.answers);
    setContext(preview.context);
    setPreview(null);
    setPhase("review");
    setStatus("Backup opened on this page. It was not saved to this device until you choose Save on this device.");
    fileRef.current?.focus();
  }

  const current = questions[index];
  const summary = phase === "results" ? summarise(profile, answers) : null;

  return (
    <div className="profile-run px-4 py-4" data-profile-ready={ready ? "true" : "false"}>
      <p className="kicker">Exploratory · not a diagnostic test · adults 18+</p>
      <h1 className="font-serif text-3xl text-ink">{profile.title}</h1>
      <p>{profile.subtitle}</p>
      <p className="text-sm text-muted">Version {profile.version}. Timeframe: {profile.timeframe}. Nothing is sent to MJB unless you later use the separate contact form, which does not receive these answers.</p>
      <p role="status" className="profile-status">{status}</p>

      {phase === "intro" ? (
        <section>
          <h2 ref={focusTarget} tabIndex={-1} className="text-xl">Before you start</h2>
          <p>{profile.intro}</p>
          <p>{CLINICAL_LINE}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={() => goQuestion(0)}>Start</button>
            {savedOnDevice ? <button type="button" className="btn" onClick={openSaved}>Open saved answers</button> : null}
            <a className="btn" href="/questionnaires">Back to profiles</a>
          </div>
        </section>
      ) : null}

      {phase === "question" && current ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            next();
          }}
        >
          <h2 className="text-xl">{current.domain.label}</h2>
          <p id={progressId} aria-live="polite">Question {current.number} of {questions.length}</p>
          <fieldset className="profile-choices border-0 p-0" aria-describedby={progressId}>
            <legend ref={focusTarget} tabIndex={-1} className="mb-2 text-lg">{current.question.text}</legend>
            {profile.responseOptions.map((option) => (
              <label key={option.id} className="profile-option">
                <input
                  type="radio"
                  name={current.question.id}
                  value={option.id}
                  checked={answers[current.question.id] === option.id}
                  onChange={() => select(current.question.id, option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>
          <Nav>
            <button type="button" className="btn" onClick={previous}>Previous</button>
            <button type="button" className="btn" onClick={skipQuestion}>Skip</button>
            <button type="submit" className="btn btn-primary">Next</button>
            {returnTo === "results" ? <button type="button" className="btn" onClick={() => { setReturnTo(null); setPhase("results"); }}>Back to summary</button> : null}
          </Nav>
        </form>
      ) : null}

      {phase === "context" ? (
        <section>
          <h2 ref={focusTarget} tabIndex={-1} className="text-xl">Anything you want to add?</h2>
          <p>These questions are optional. They do not change the summary.</p>
          {profile.contextQuestions.map((question) => {
            const selected = context[question.id];
            const many = Array.isArray(selected) ? selected : [];
            return (
              <fieldset key={question.id} className="profile-choices border-0 p-0">
                <legend className="mb-2">{question.text}</legend>
                {question.options.map((option) => (
                  <label key={option} className="profile-option">
                    <input
                      type={question.multiple ? "checkbox" : "radio"}
                      name={question.id}
                      value={option}
                      checked={question.multiple ? many.includes(option) : selected === option}
                      onChange={() => {
                        if (question.multiple) {
                          setContext((current) => ({ ...current, [question.id]: toggleContext(many, option, true) }));
                        } else {
                          setContext((current) => ({ ...current, [question.id]: option }));
                        }
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </fieldset>
            );
          })}
          <Nav>
            <button type="button" className="btn" onClick={previous}>Previous</button>
            <button type="button" className="btn" onClick={skipContext}>Skip context</button>
            <button type="button" className="btn btn-primary" onClick={() => setPhase("review")}>Review answers</button>
          </Nav>
        </section>
      ) : null}

      {phase === "review" ? (
        <section>
          <h2 ref={focusTarget} tabIndex={-1} className="text-xl">Review your answers</h2>
          <AnswerList profile={profile} answers={answers} context={context} onEdit={(questionIndex) => goQuestion(questionIndex, "review")} />
          <Nav>
            <button type="button" className="btn" onClick={() => setPhase("context")}>Previous</button>
            <button type="button" className="btn btn-primary" onClick={() => setPhase("results")}>View my summary</button>
          </Nav>
        </section>
      ) : null}

      {phase === "results" && summary ? (
        <section>
          <h2 ref={focusTarget} tabIndex={-1} className="text-xl">Your summary</h2>
          <p>{summary.text}</p>
          {summary.result.domains.map((domain) => {
            const link = readMore(profile.id, domain.id);
            const source = profile.domains.find((item) => item.id === domain.id);
            return (
              <section key={domain.id} className="profile-domain">
                <h3>{domain.label}</h3>
                <p>{BAND_LABEL[domain.band]}</p>
                {source ? (
                  <details>
                    <summary>A question to explore</summary>
                    <p>{source.reflection}</p>
                  </details>
                ) : null}
                {link ? <p><a href={link.href}>Read more about this topic</a> <span className="text-sm text-muted">({link.title})</span></p> : null}
              </section>
            );
          })}
          <p>{OVERLAP_NOTE}</p>
          {profile.id === "mjb-memory-patterns" ? <p>{MEMORY_NOTE}</p> : null}
          <p>{COMPARE_NOTE}</p>
          {profile.id === "mjb-everyday-function" ? (
            <p><a href={compoundsLink().href}>Read more about this topic</a> <span className="text-sm text-muted">({compoundsLink().title}). This link is background reading, not a recommendation to start, stop or change a treatment.</span></p>
          ) : null}
          <p>{CARE_NOTE}</p>
          <details>
            <summary>How this summary works</summary>
            <p>Each chosen frequency is a number from 0 (Never) to 4 (Very often). Not applicable or not sure, and skipped questions, are not numbers and are not filled in. An area is summarised only when all three of its answers are numbers. The mean is the arithmetic mean of those three. Under 1 is rarely reported, from 1 up to but not including 2 is occasionally reported, from 2 up to but not including 3 is sometimes reported, and from 3 to 4 is frequently reported. These are editorial display rules, not validated thresholds.</p>
            <AnswerList profile={profile} answers={answers} context={context} onEdit={(questionIndex) => goQuestion(questionIndex, "results")} />
          </details>
          <Actions
            profile={profile}
            answers={answers}
            context={context}
            savedOnDevice={savedOnDevice}
            deleteButtonRef={deleteButtonRef}
            fileRef={fileRef}
            onSave={save}
            onDelete={() => dialogRef.current?.showModal()}
            onFile={onFile}
            onReview={() => setPhase("review")}
            onStatus={setStatus}
          />
          {preview ? (
            <div className="profile-preview" role="region" aria-label="Backup preview">
              <p>This backup has {Object.keys(preview.answers).length} recorded answers for {preview.title}, version {preview.version}. Opening it replaces the answers on this page. Cancel leaves this page unchanged.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary" onClick={applyPreview}>Open backup</button>
                <button type="button" className="btn" onClick={() => { setPreview(null); fileRef.current?.focus(); setStatus("Backup was not opened."); }}>Cancel</button>
              </div>
            </div>
          ) : null}
          <dialog ref={dialogRef} className="profile-dialog">
            <p>Delete the answers saved on this device for this profile?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn" onClick={confirmDelete}>Delete these saved answers</button>
              <button type="button" className="btn" onClick={() => { dialogRef.current?.close(); deleteButtonRef.current?.focus(); }}>Cancel</button>
            </div>
          </dialog>
        </section>
      ) : null}

      <PrintCopy profile={profile} answers={answers} context={context} />
    </div>
  );
}

function Nav({ children }: { children: ReactNode }) {
  return <div className="profile-nav mt-3 flex flex-wrap gap-2">{children}</div>;
}

function AnswerList({
  profile,
  answers,
  context,
  onEdit,
}: {
  profile: SelfProfile;
  answers: Answers;
  context: ContextAnswers;
  onEdit: (index: number) => void;
}) {
  const questions = scoredQuestions(profile);
  return (
    <div>
      {questions.map((item, itemIndex) => (
        <div key={item.question.id} className="border-b border-line py-2">
          <p className="mb-1"><span className="text-sm text-muted">{item.domain.label}. Question {item.number}.</span> {item.question.text}</p>
          <p className="mb-1">{responseLabel(profile, answers[item.question.id] ?? null)}</p>
          <button type="button" className="btn" onClick={() => onEdit(itemIndex)}>Edit this answer</button>
        </div>
      ))}
      {profile.contextQuestions.map((question) => {
        const value = context[question.id];
        const shown = Array.isArray(value) ? value.join(", ") : typeof value === "string" ? value : "Skipped";
        return (
          <div key={question.id} className="border-b border-line py-2">
            <p className="mb-1">{question.text}</p>
            <p className="mb-0">{shown || "Skipped"}</p>
          </div>
        );
      })}
    </div>
  );
}

function Actions({
  profile,
  answers,
  context,
  savedOnDevice,
  deleteButtonRef,
  fileRef,
  onSave,
  onDelete,
  onFile,
  onReview,
  onStatus,
}: {
  profile: SelfProfile;
  answers: Answers;
  context: ContextAnswers;
  savedOnDevice: boolean;
  deleteButtonRef: RefObject<HTMLButtonElement | null>;
  fileRef: RefObject<HTMLInputElement | null>;
  onSave: () => void;
  onDelete: () => void;
  onFile: (file: File) => void;
  onReview: () => void;
  onStatus: (text: string) => void;
}) {
  function download(kind: "json" | "text") {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
    const saved = makeBackup(profile, answers, context, new Date().toISOString(), zone);
    const content = kind === "json" ? JSON.stringify(exportDocument(profile, answers, context, saved.savedAt, zone), null, 2) : backupToText(profile, saved);
    const blob = new Blob([content], { type: kind === "json" ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.id}-v${profile.version}.${kind === "json" ? "json" : "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
    onStatus("Download requested. The file stays on this device.");
  }

  async function share() {
    const url = `${window.location.origin}/questionnaires/${profile.id}`;
    try {
      await navigator.clipboard.writeText(url);
      onStatus("Link copied. It opens a blank questionnaire and does not include your answers.");
    } catch {
      onStatus(`The link could not be copied. It opens a blank questionnaire and does not include your answers: ${url}`);
    }
  }

  return (
    <div className="no-print mt-3 flex flex-col gap-3">
      <p>{SAVE_NOTE}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn" onClick={onSave}>Save on this device</button>
        {savedOnDevice ? <button type="button" className="btn" ref={deleteButtonRef} onClick={onDelete}>Delete these saved answers</button> : null}
        <button type="button" className="btn" onClick={() => void share()}>Copy blank link</button>
        <button type="button" className="btn" onClick={() => download("text")}>Download text</button>
        <button type="button" className="btn" onClick={() => download("json")}>Download JSON</button>
        <button type="button" className="btn" onClick={() => window.print()}>Print or save as PDF</button>
        <button type="button" className="btn" onClick={onReview}>Review answers</button>
      </div>
      <p className="text-sm text-muted">Print uses the browser dialog and includes every answer. This preview does not build a tagged PDF or a Word file.</p>
      <label className="text-sm">
        Open a JSON backup
        <input
          ref={fileRef}
          className="mt-1 block"
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onFile(file);
          }}
        />
      </label>
    </div>
  );
}

function PrintCopy({ profile, answers, context }: { profile: SelfProfile; answers: Answers; context: ContextAnswers }) {
  const summary = summarise(profile, answers);
  return (
    <section className="profile-print-all">
      <h2>{profile.title}</h2>
      <p>Exploratory self-profile, not a clinical assessment. Version {profile.version}. Timeframe: {profile.timeframe}.</p>
      <p>{summary.text}</p>
      {summary.result.domains.map((domain) => (
        <p key={domain.id}><strong>{domain.label}.</strong> {BAND_LABEL[domain.band]}</p>
      ))}
      {scoredQuestions(profile).map((item) => (
        <p key={item.question.id}><strong>{item.number}. {item.question.text}</strong> {responseLabel(profile, answers[item.question.id] ?? null)}</p>
      ))}
      {profile.contextQuestions.map((question) => {
        const value = context[question.id];
        const shown = Array.isArray(value) ? value.join(", ") : typeof value === "string" ? value : "Skipped";
        return <p key={question.id}><strong>{question.text}</strong> {shown || "Skipped"}</p>;
      })}
      <p>{OVERLAP_NOTE}</p>
      {profile.id === "mjb-memory-patterns" ? <p>{MEMORY_NOTE}</p> : null}
      <p>{COMPARE_NOTE}</p>
      <p>{CARE_NOTE}</p>
    </section>
  );
}
