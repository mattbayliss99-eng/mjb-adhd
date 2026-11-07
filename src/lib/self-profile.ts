import profilesFile from "../../content/questionnaire/profiles.json" with { type: "json" };
import { resultText, scoreProfile } from "../../content/questionnaire/scoring.mjs";

export type ScoreBand = "rarely-reported" | "occasionally-reported" | "sometimes-reported" | "frequently-reported" | "incomplete";
export type ProfileScore = {
  profileId: string;
  version: string;
  complete: boolean;
  note: string;
  domains: {
    id: string;
    label: string;
    answered: number;
    total: number;
    mean: number | null;
    band: ScoreBand;
    answers: { id: string; answer: string | null }[];
    reflection?: string;
  }[];
};

export type ResponseOption = { id: string; label: string; value: number | null };
export type ProfileQuestion = { id: string; text: string };
export type ProfileDomain = { id: string; label: string; reflection: string; questions: ProfileQuestion[] };
export type ContextQuestion = {
  id: string;
  text: string;
  options: string[];
  optional: boolean;
  scored: boolean;
  multiple?: boolean;
};
export type SelfProfile = {
  id: string;
  version: string;
  status: string;
  validated: boolean;
  audience: string;
  title: string;
  subtitle: string;
  intro: string;
  timeframe: string;
  responseOptions: ResponseOption[];
  domains: ProfileDomain[];
  contextQuestions: ContextQuestion[];
};

export type Answers = Record<string, string | null>;
export type ContextAnswers = Record<string, string | string[] | null>;

export type SavedProfile = {
  schemaVersion: 1;
  kind: "mjb-self-profile";
  profileId: string;
  version: string;
  title: string;
  exploratory: true;
  timeframe: string;
  savedAt: string;
  timeZone: string;
  answers: Answers;
  context: ContextAnswers;
};

export const BAND_LABEL: Record<ScoreBand, string> = {
  "rarely-reported": "Rarely reported in these answers",
  "occasionally-reported": "Occasionally reported in these answers",
  "sometimes-reported": "Sometimes reported in these answers",
  "frequently-reported": "Frequently reported in these answers",
  incomplete: "Not enough answers to summarise this area",
};

export const OVERLAP_NOTE =
  "These patterns overlap. Your circumstances, opportunities, supports and interpretation of the questions can affect your answers. A low-frequency summary does not rule out a difficulty, and a high-frequency summary does not identify its cause.";

export const MEMORY_NOTE =
  "These answers describe experiences of remembering. They do not measure memory capacity or establish whether information was lost during attention, learning, storage or retrieval.";

export const COMPARE_NOTE =
  "The profiles ask overlapping questions in different contexts. Their results should not be added together.";

export const CARE_NOTE =
  "If a difficulty is new, rapidly worsening, or affecting your safety or daily life, consider discussing it with an appropriate healthcare professional.";

export const SAVE_NOTE = "Anyone using this browser profile may be able to see saved answers. They are not sent to MJB.";

export const SAVE_FAIL = "Your answers could not be saved on this device. You can still download a copy.";

export const CLINICAL_LINE =
  "This is an exploratory self-profile, not a clinical assessment. You do not need to change your treatment or support to answer it.";

const PREFER_NOT = "Prefer not to say";

const profiles = profilesFile.profiles as SelfProfile[];

export function listProfiles(): SelfProfile[] {
  return profiles;
}

export function profileById(id: string): SelfProfile | undefined {
  return profiles.find((profile) => profile.id === id);
}

export function scoredQuestions(profile: SelfProfile): { domain: ProfileDomain; question: ProfileQuestion; number: number }[] {
  const items: { domain: ProfileDomain; question: ProfileQuestion; number: number }[] = [];
  let number = 0;
  for (const domain of profile.domains) {
    for (const question of domain.questions) {
      number += 1;
      items.push({ domain, question, number });
    }
  }
  return items;
}

export function responseLabel(profile: SelfProfile, id: string | null): string {
  if (id === null) return "Skipped";
  return profile.responseOptions.find((option) => option.id === id)?.label ?? "Skipped";
}

export function summarise(profile: SelfProfile, answers: Answers) {
  const scored: Record<string, string | null> = {};
  for (const item of scoredQuestions(profile)) scored[item.question.id] = answers[item.question.id] ?? null;
  const result = scoreProfile(profile, scored) as ProfileScore;
  return { result, text: resultText(result) };
}

export function readMore(profileId: string, domainId: string): { href: string; title: string } | null {
  const memory = { href: "/guide/static/understand/memory-time-awareness/", title: "Memory, time and awareness" };
  const starting = { href: "/support/quick-starts/", title: "When starting is the hard part" };
  if (profileId === "mjb-memory-patterns") return memory;
  if (profileId !== "mjb-everyday-function") return null;
  if (domainId === "thread" || domainId === "engagement" || domainId === "intentions") return memory;
  if (domainId === "starting" || domainId === "switching" || domainId === "finishing") return starting;
  return null;
}

export function compoundsLink(): { href: string; title: string } {
  return { href: "/compounds/", title: "Medications & Supplements" };
}

export function toggleContext(current: string[], option: string, multiple: boolean): string[] {
  if (!multiple) return current.length === 1 && current[0] === option ? current : [option];
  if (option === PREFER_NOT) return current.length === 1 && current[0] === PREFER_NOT ? [] : [PREFER_NOT];
  const without = current.filter((item) => item !== PREFER_NOT && item !== option);
  return current.includes(option) ? without : [...without, option];
}

const storageKey = (id: string) => `mjb-self-profile:${id}`;

export function classifySaved(
  profile: SelfProfile,
  raw: string | null,
): { kind: "absent" } | { kind: "invalid" } | { kind: "version-differs"; saved: SavedProfile } | { kind: "ready"; saved: SavedProfile } {
  if (raw === null || raw === "") return { kind: "absent" };
  const parsed = parseBackup(profile, raw);
  if (!parsed.ok) return { kind: "invalid" };
  if (parsed.saved.version !== profile.version) return { kind: "version-differs", saved: parsed.saved };
  return { kind: "ready", saved: parsed.saved };
}

export function parseBackup(
  profile: SelfProfile,
  raw: string,
): { ok: true; saved: SavedProfile } | { ok: false; reason: string } {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "This file is not valid JSON." };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, reason: "This file is not a profile backup." };
  const record = value as Partial<SavedProfile>;
  if (record.kind !== "mjb-self-profile" || record.schemaVersion !== 1) return { ok: false, reason: "This file is not an MJB self-profile backup." };
  if (record.profileId !== profile.id) return { ok: false, reason: "This backup belongs to a different profile and was not opened." };
  if (typeof record.version !== "string" || typeof record.savedAt !== "string" || typeof record.timeZone !== "string") {
    return { ok: false, reason: "This backup is missing its version or date." };
  }
  const answers = normaliseAnswers(profile, record.answers);
  if (!answers.ok) return answers;
  const context = normaliseContext(profile, record.context);
  if (!context.ok) return context;
  return {
    ok: true,
    saved: {
      schemaVersion: 1,
      kind: "mjb-self-profile",
      profileId: profile.id,
      version: record.version,
      title: profile.title,
      exploratory: true,
      timeframe: profile.timeframe,
      savedAt: record.savedAt,
      timeZone: record.timeZone,
      answers: answers.answers,
      context: context.context,
    },
  };
}

function normaliseAnswers(profile: SelfProfile, value: unknown): { ok: true; answers: Answers } | { ok: false; reason: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, reason: "The answers in this backup are not usable." };
  const allowed = new Set(scoredQuestions(profile).map((item) => item.question.id));
  const options = new Set(profile.responseOptions.map((option) => option.id));
  const answers: Answers = {};
  for (const [id, answer] of Object.entries(value)) {
    if (!allowed.has(id)) return { ok: false, reason: "This backup contains a question that is not in this profile." };
    if (answer !== null && (typeof answer !== "string" || !options.has(answer))) return { ok: false, reason: "This backup contains an answer that is not in this profile." };
    answers[id] = answer;
  }
  return { ok: true, answers };
}

function normaliseContext(profile: SelfProfile, value: unknown): { ok: true; context: ContextAnswers } | { ok: false; reason: string } {
  if (value === undefined) return { ok: true, context: {} };
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, reason: "The optional answers in this backup are not usable." };
  const questions = new Map(profile.contextQuestions.map((question) => [question.id, question]));
  const context: ContextAnswers = {};
  for (const [id, answer] of Object.entries(value)) {
    const question = questions.get(id);
    if (!question) return { ok: false, reason: "This backup contains an optional question that is not in this profile." };
    if (answer === null) {
      context[id] = null;
      continue;
    }
    if (question.multiple) {
      if (!Array.isArray(answer) || answer.some((item) => typeof item !== "string" || !question.options.includes(item))) {
        return { ok: false, reason: "This backup contains an optional answer that is not in this profile." };
      }
      if (answer.includes(PREFER_NOT) && answer.length > 1) return { ok: false, reason: "Prefer not to say cannot be combined with other answers." };
      context[id] = [...answer];
      continue;
    }
    if (typeof answer !== "string" || !question.options.includes(answer)) return { ok: false, reason: "This backup contains an optional answer that is not in this profile." };
    context[id] = answer;
  }
  return { ok: true, context };
}

export function makeBackup(profile: SelfProfile, answers: Answers, context: ContextAnswers, savedAt: string, timeZone: string): SavedProfile {
  return {
    schemaVersion: 1,
    kind: "mjb-self-profile",
    profileId: profile.id,
    version: profile.version,
    title: profile.title,
    exploratory: true,
    timeframe: profile.timeframe,
    savedAt,
    timeZone,
    answers,
    context,
  };
}

export function exportDocument(profile: SelfProfile, answers: Answers, context: ContextAnswers, savedAt: string, timeZone: string) {
  const saved = makeBackup(profile, answers, context, savedAt, timeZone);
  const { result, text } = summarise(profile, saved.answers);
  return {
    ...saved,
    result: {
      text,
      complete: result.complete,
      note: result.note,
      domains: result.domains.map((domain) => ({
        id: domain.id,
        label: domain.label,
        band: domain.band,
        bandLabel: BAND_LABEL[domain.band],
        answers: domain.answers.map((item) => ({
          id: item.id,
          answer: item.answer,
          label: responseLabel(profile, item.answer),
        })),
      })),
    },
  };
}

export type StoreLike = { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem: (key: string) => void };

export function loadSaved(profile: SelfProfile, store: StoreLike) {
  try {
    return classifySaved(profile, store.getItem(storageKey(profile.id)));
  } catch {
    return { kind: "invalid" as const };
  }
}

export function writeSaved(saved: SavedProfile, store: StoreLike): { ok: true } | { ok: false } {
  try {
    const text = JSON.stringify(saved);
    store.setItem(storageKey(saved.profileId), text);
    if (store.getItem(storageKey(saved.profileId)) !== text) return { ok: false };
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function removeSaved(profileId: string, store: StoreLike): { ok: true } | { ok: false } {
  try {
    store.removeItem(storageKey(profileId));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function backupToText(profile: SelfProfile, saved: SavedProfile): string {
  const { result, text } = summarise(profile, saved.answers);
  const lines = [
    profile.title,
    "Exploratory self-profile, not a clinical assessment.",
    `Version: ${saved.version}`,
    `Timeframe: ${profile.timeframe}`,
    `Date: ${saved.savedAt}`,
    `Time zone: ${saved.timeZone}`,
    text,
    "",
    "Areas",
  ];
  for (const domain of result.domains) {
    lines.push(`${domain.label}: ${BAND_LABEL[domain.band]}`);
    for (const item of domain.answers) {
      const question = profile.domains.flatMap((entry) => entry.questions).find((entry) => entry.id === item.id);
      lines.push(`[${item.id}] ${question?.text ?? item.id}`);
      lines.push(responseLabel(profile, item.answer));
    }
  }
  lines.push("", "Optional context");
  for (const question of profile.contextQuestions) {
    const value = saved.context[question.id];
    const shown = Array.isArray(value) ? value.join(", ") : value || "Skipped";
    lines.push(`${question.text}`);
    lines.push(shown);
  }
  lines.push("", OVERLAP_NOTE, CARE_NOTE);
  if (profile.id === "mjb-memory-patterns") lines.push(MEMORY_NOTE);
  lines.push(COMPARE_NOTE);
  return lines.join("\n");
}
