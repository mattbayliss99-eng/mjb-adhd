import catalogJson from "../../content/questionnaire/questionnaires.v1.json";

export type QuizOption = { id: string; label: string };
export type QuizQuestion = { id: string; type: "single-choice"; optional: true; prompt: string; options: QuizOption[] };
export type Quiz = {
  id: string;
  version: string;
  demonstrationOnly: true;
  review: { status: "fictional-demo"; specification: null };
  title: string;
  description: string;
  questions: QuizQuestion[];
  result: { id: string; type: "fixed-fictional"; scoring: "none"; title: string; explanation: string };
};
export type QuizCatalog = { schemaVersion: 1; catalogVersion: string; questionnaires: Quiz[] };
export type QuizRecord = {
  schemaVersion: 2;
  demonstrationOnly: true;
  questionnaireId: string;
  questionnaireVersion: string;
  title: string;
  result: { id: string; fictional: true; scoring: string; title: string; explanation: string };
  responses: { questionId: string; question: string; optionId: string | null; answer: string | null; skipped: boolean }[];
};

const idOk = (value: unknown): value is string => typeof value === "string" && /^[a-z][a-z0-9-]*$/.test(value);
const textOk = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

export function validateCatalog(catalog: QuizCatalog): QuizCatalog {
  if (catalog?.schemaVersion !== 1 || !/^\d+\.\d+\.\d+$/.test(catalog.catalogVersion)) throw new Error("Unsupported catalog version.");
  if (!Array.isArray(catalog.questionnaires) || catalog.questionnaires.length === 0) throw new Error("No questionnaires.");
  const seen = new Set<string>();
  for (const quiz of catalog.questionnaires) {
    if (!idOk(quiz.id) || seen.has(quiz.id)) throw new Error("Invalid or duplicate questionnaire ID.");
    seen.add(quiz.id);
    if (!/^\d+\.\d+\.\d+$/.test(quiz.version) || !textOk(quiz.title) || !textOk(quiz.description)) throw new Error("Invalid questionnaire metadata.");
    if (quiz.demonstrationOnly !== true || quiz.review?.status !== "fictional-demo" || quiz.review.specification !== null || quiz.result?.type !== "fixed-fictional" || quiz.result.scoring !== "none" || !idOk(quiz.result.id) || !textOk(quiz.result.title) || !textOk(quiz.result.explanation)) {
      throw new Error("Only fictional, unscored demos are supported.");
    }
    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) throw new Error("No questions.");
    const questions = new Set<string>();
    for (const item of quiz.questions) {
      if (!idOk(item.id) || questions.has(item.id)) throw new Error("Invalid or duplicate question ID.");
      questions.add(item.id);
      if (item.type !== "single-choice" || item.optional !== true || !textOk(item.prompt) || !Array.isArray(item.options) || item.options.length < 2) throw new Error("Unsupported question.");
      const options = new Set<string>();
      for (const option of item.options) {
        if (!idOk(option.id) || options.has(option.id) || !textOk(option.label)) throw new Error("Invalid or duplicate option ID.");
        options.add(option.id);
      }
    }
  }
  return catalog;
}

export function createRecord(quiz: Quiz, answers: Record<string, string | null>): QuizRecord {
  return {
    schemaVersion: 2,
    demonstrationOnly: true,
    questionnaireId: quiz.id,
    questionnaireVersion: quiz.version,
    title: quiz.title,
    result: {
      id: quiz.result.id,
      fictional: true,
      scoring: quiz.result.scoring,
      title: quiz.result.title,
      explanation: quiz.result.explanation,
    },
    responses: quiz.questions.map((question) => {
      const selected = answers[question.id] ?? null;
      const option = question.options.find((item) => item.id === selected);
      if (selected !== null && !option) throw new Error("Unknown option ID.");
      return {
        questionId: question.id,
        question: question.prompt,
        optionId: option?.id ?? null,
        answer: option?.label ?? null,
        skipped: !option,
      };
    }),
  };
}

export function recordToText(record: QuizRecord): string {
  return [
    "MJB QUESTIONNAIRE — DEMONSTRATION ONLY",
    `Questionnaire: ${record.questionnaireId}`,
    `Version: ${record.questionnaireVersion}`,
    record.title,
    "Fictional fixed result. No clinical scoring or inference.",
    record.result.title,
    record.result.explanation,
    ...record.responses.map((item) => `[${item.questionId}] ${item.question}\n${item.answer ?? "Skipped"} (option ID: ${item.optionId ?? "none"})`),
  ].join("\n\n");
}

export const QUESTIONNAIRE_CATALOG = validateCatalog(catalogJson as QuizCatalog);
