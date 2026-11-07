/**
 * The preview reads the post bank from content/posts/posts.json.
 * That file is the local copy of PR #8 revision 3. It is not a live sync.
 * Records are checked when the app loads. A broken record fails the build.
 * Sample threads live in feed.ts and are never part of this bank.
 */
import bank from "../../content/posts/posts.json";
import { z } from "zod";

const PostSchema = z
  .object({
    id: z.string().regex(/^MJB-P\d+$/),
    revision: z.number().int(),
    status: z.enum(["draft", "approved"]),
    title: z.string().min(1),
    body: z.array(z.string()).min(1),
    depth: z.enum(["simple", "medium", "high"]),
    specificity: z.string(),
    primary_topic: z.string(),
    topics: z.array(z.string()),
    evidence: z.object({
      class: z.string(),
      strength: z.string().nullable(),
      level: z.string(),
      design: z.string().nullable(),
      population: z.string().nullable(),
      source_ids: z.array(z.string()),
      source_years: z.array(z.number()),
    }),
    limitations: z.array(z.string()),
    uncertainty: z.string().nullable(),
    claim_refs: z.array(z.string()),
    article: z.object({ url: z.string().min(1), label: z.string().min(1) }),
    caption: z.string(),
    narration_script: z.string(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
      asset_id: z.string(),
      kind: z.string(),
      creator: z.string(),
      tool: z.string(),
      rights: z.string(),
      version: z.string(),
    }),
  })
  .strict();

export type Post = z.infer<typeof PostSchema>;
export type Evidence = Post["evidence"];

export const POSTS: Post[] = z.array(PostSchema).parse(bank);

export const LIVE_ARTICLE = "https://mjb-adhd.org.uk/science/what-is-adhd/";

export function postById(id: string): Post | undefined {
  return POSTS.find((post) => post.id === id);
}

export function postIndex(id: string): number {
  return POSTS.findIndex((post) => post.id === id);
}

export function neighbours(id: string): { prev: Post | null; next: Post | null; index: number } {
  const index = postIndex(id);
  if (index < 0) return { prev: null, next: null, index: -1 };
  return {
    prev: index > 0 ? POSTS[index - 1] : null,
    next: index < POSTS.length - 1 ? POSTS[index + 1] : null,
    index,
  };
}

export const TOPICS = [
  { id: "intro", label: "Intro" },
  { id: "evidence-method", label: "Evidence method" },
] as const;
