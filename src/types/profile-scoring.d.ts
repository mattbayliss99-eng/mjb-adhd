declare module "../../content/questionnaire/scoring.mjs" {
  export const RESULT_NOTE: string;
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
      band: "rarely-reported" | "occasionally-reported" | "sometimes-reported" | "frequently-reported" | "incomplete";
      answers: { id: string; answer: string | null }[];
      reflection?: string;
    }[];
  };
  export function scoreProfile(
    profile: { id: string; version: string; domains: { id: string; label: string; reflection?: string; questions: { id: string }[] }[] },
    answers?: Record<string, string | null>,
  ): ProfileScore;
  export function resultText(result: ProfileScore): string;
}
