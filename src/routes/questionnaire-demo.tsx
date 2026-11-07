import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type RefObject } from "react";
import { QUESTIONNAIRE_CATALOG, createRecord, recordToText, type Quiz } from "@/lib/questionnaire";

export const Route = createFileRoute("/questionnaire-demo")({
  component: QuestionnaireDemo,
});

function QuestionnaireDemo() {
  const [topic, setTopic] = useState<Quiz | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [status, setStatus] = useState("Demonstration only. Answers stay in this page until you leave it.");
  const legendRef = useRef<HTMLLegendElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const topicButtonRef = useRef<HTMLButtonElement>(null);
  const seen = useRef<string | null>(null);
  const prefix = useRef("");

  function choose(quiz: Quiz) {
    setTopic(quiz);
    setAnswers({});
    setStep(0);
    prefix.current = "";
    setStatus("Topic selected. Answers stay in this page only.");
  }

  function download(kind: "json" | "text") {
    if (!topic) return;
    const record = createRecord(topic, answers);
    const content = kind === "json" ? JSON.stringify(record, null, 2) : recordToText(record);
    const blob = new Blob([content], { type: kind === "json" ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${topic.id}-v${topic.version}.${kind === "json" ? "json" : "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Download requested. Check your browser’s downloads.");
  }

  const question = topic?.questions[step];
  const finished = Boolean(topic && step >= topic.questions.length);
  const focusToken = !topic ? "topics" : finished ? "results" : `${topic.id}:${step}`;

  useEffect(() => {
    if (seen.current === focusToken) return;
    const first = seen.current === null;
    seen.current = focusToken;
    if (first || !topic) return;
    const lead = prefix.current;
    prefix.current = "";
    if (finished) setStatus(`${lead}Sample results.`.trim());
    else setStatus(`${lead}Question ${step + 1} of ${topic.questions.length}.`.trim());
    const node = finished ? resultRef.current : legendRef.current;
    window.requestAnimationFrame(() => node?.focus());
  }, [focusToken, topic, finished, step]);

  return (
    <div className="px-4 py-4" id="mjb-questionnaire-hub">
      <p className="kicker">Demonstration only</p>
      <h1 className="font-serif text-3xl text-ink">Fictional questionnaire</h1>
      <p>These questions are a fictional, unscored demonstration from the reviewed definition. They are not a diagnosis, not a rating scale, and not a real instrument.</p>
      <p role="status">{status}</p>
      {!topic ? (
        <div className="flex flex-col gap-2">
          {QUESTIONNAIRE_CATALOG.questionnaires.map((quiz, index) => (
            <button key={quiz.id} ref={index === 0 ? topicButtonRef : undefined} type="button" className="btn" onClick={() => choose(quiz)}>
              {quiz.title}
              <span className="mt-1 block text-sm text-muted">{quiz.description}</span>
            </button>
          ))}
          <p className="text-sm text-muted">Every topic leads to the same kind of fixed fictional result. There is no score.</p>
        </div>
      ) : null}
      {topic && question && !finished ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            prefix.current = "";
            setStep((value) => value + 1);
          }}
        >
          <p className="text-sm text-muted">{topic.title} · {topic.id} · v{topic.version}</p>
          <p>Question {step + 1} of {topic.questions.length}</p>
          <fieldset className="border-0 p-0">
            <legend ref={legendRef} tabIndex={-1} className="text-xl">
              {question.prompt}
            </legend>
            <p id="hub-optional">Optional. Choose one answer, or skip this question.</p>
            {question.options.map((option) => (
              <label key={option.id} className="flex min-h-11 items-center gap-2">
                <input
                  type="radio"
                  name={`hub-${question.id}`}
                  value={option.id}
                  checked={answers[question.id] === option.id}
                  onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (step === 0) {
                  setTopic(null);
                  setAnswers({});
                  setStatus("Topic list.");
                  window.requestAnimationFrame(() => topicButtonRef.current?.focus());
                  return;
                }
                prefix.current = "";
                setStep((value) => value - 1);
              }}
            >
              {step === 0 ? "Change topic" : "Back"}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setAnswers((current) => ({ ...current, [question.id]: null }));
                prefix.current = "Question skipped. ";
                setStep((value) => value + 1);
              }}
            >
              Skip question
            </button>
            <button type="submit" className="btn btn-primary">{step === topic.questions.length - 1 ? "View sample results" : "Next question"}</button>
          </div>
        </form>
      ) : null}
      {topic && finished ? (
        <Result
          topic={topic}
          answers={answers}
          headingRef={resultRef}
          onDownload={download}
          onReview={() => {
            prefix.current = "";
            setStep(0);
          }}
          onClear={() => {
            setTopic(null);
            setAnswers({});
            setStep(0);
            setStatus("All answers cleared from this page.");
            window.requestAnimationFrame(() => topicButtonRef.current?.focus());
          }}
        />
      ) : null}
    </div>
  );
}

function Result({
  topic,
  answers,
  headingRef,
  onDownload,
  onReview,
  onClear,
}: {
  topic: Quiz;
  answers: Record<string, string | null>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onDownload: (kind: "json" | "text") => void;
  onReview: () => void;
  onClear: () => void;
}) {
  const record = createRecord(topic, answers);
  return (
    <section>
      <h2 ref={headingRef} tabIndex={-1}>Your demonstration summary</h2>
      <p className="text-sm text-muted">Questionnaire ID: {record.questionnaireId}. Version: {record.questionnaireVersion}.</p>
      <p><strong>{record.result.title}</strong></p>
      <p>{record.result.explanation}</p>
      <h3>Your selections</h3>
      <dl>
        {record.responses.map((item) => (
          <div key={item.questionId} className="border-b border-line py-2">
            <dt>{item.question}</dt>
            <dd className="m-0">{item.answer ?? "Skipped"}</dd>
            <dd className="m-0 text-sm text-muted">Question ID: {item.questionId}. Option ID: {item.optionId ?? "none (skipped)"}.</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn" onClick={() => onDownload("text")}>Download text</button>
        <button type="button" className="btn" onClick={() => onDownload("json")}>Download JSON</button>
        <button type="button" className="btn" onClick={() => window.print()}>Print or save as PDF</button>
        <button type="button" className="btn" onClick={onReview}>Review answers</button>
        <button type="button" className="btn" onClick={onClear}>Clear answers</button>
      </div>
      <p className="text-sm text-muted">Print uses the browser dialog. This preview does not build a tagged PDF. Nothing is uploaded.</p>
    </section>
  );
}