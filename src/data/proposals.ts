import batch from "../../content/posts/batch-10.json";
import next from "../../content/posts/batch-11.json";
import type { ReaderPost, ReaderSlide } from "@/data/reader-bank";

export type ProposalVisual = { src: string; alt: string; caption?: string };
export type ProposalLink = { label: string; href?: string; kind?: "official" | "controlled" | "observational" | "scientific" | "editorial"; studyType?: string; detail?: string };

export type ProposalSlide = {
  id: string;
  order: number;
  heading: string;
  body: string;
  provenance: "verbatim" | "author-proposed" | "mixed";
  claimCategory: string;
  sourcePath: string;
  sourceSection: string;
  passageRef: string;
  qualification?: string;
  qualificationPlacement?: "before" | "after";
  qualificationProvenance?: string;
  limitHeading?: string;
  role?: string;
  links?: ProposalLink[];
  inlineLinks?: { phrase: string; href: string }[];
  replacedBody?: string;
};

export type ProposalPost = {
  id: string;
  registerOrigins?: string[];
  proposalId: string;
  status: "reviewed-proposal";
  editorialStatus: "reviewed-proposal" | "merged-into-help";
  approved: false;
  disposition: string;
  title: string;
  previousTitle?: string;
  articlePath: string;
  articleTitle: string;
  articleId: string;
  visual: ProposalVisual | null;
  visualNote?: string;
  evidenceStatus: string;
  evidenceNeeded?: string;
  openEditorialQuestion: string | null;
  learningPoint: string;
  previousLearningPoint?: string;
  slides: ProposalSlide[];
};

export const PROPOSAL_POSTS = [...(batch.posts as ProposalPost[]), ...(next.posts as ProposalPost[])];

export function proposalById(id: string): ProposalPost | undefined {
  return PROPOSAL_POSTS.find((post) => post.id === id);
}

/** Same reader shape as a published excerpt, marked so it stays a review item. */
export function proposalAsReaderPost(post: ProposalPost): ReaderPost {
  const slides: ReaderSlide[] = post.slides.map((slide) => ({
    id: slide.id,
    order: slide.order,
    role: slide.role,
    heading: slide.heading,
    body: slide.body,
    qualification: slide.qualification,
    qualificationPlacement: slide.qualificationPlacement,
    qualificationProvenance: slide.qualificationProvenance,
    limitHeading: slide.limitHeading,
    provenance: slide.provenance,
    claimCategory: slide.claimCategory,
    sourcePath: slide.sourcePath,
    sourceSection: slide.sourceSection,
    passageRef: slide.passageRef,
    sourceLocator: slide.passageRef,
    links: slide.links,
    inlineLinks: slide.inlineLinks,
    evidenceNeeded: post.evidenceNeeded,
  }));
  return {
    id: post.id,
    title: post.title,
    hook: post.learningPoint,
    articleUrl: post.articlePath.split("#")[0],
    editorial_state: post.editorialStatus,
    primary_topic: post.disposition,
    slides,
    image: post.visual
      ? { src: post.visual.src, alt: post.visual.alt, caption: post.visual.caption }
      : undefined,
  };
}
