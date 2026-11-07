import bank from "../../content/posts/reader-bank.json";
import directory from "../../content/routes/directory.json";

/** Published site. Figures are reused by their existing URLs, not copied into this preview. */
export const PUBLISHED_ORIGIN = "https://mjb-adhd.org.uk";

export type ReaderSource = {
  id: string;
  fullTitle: string;
  authorsOrIssuer?: string;
  date?: string;
  url?: string;
  verifiedLocator?: string;
  sourceType?: string;
  type?: string;
  title?: string;
};

export type ReaderClaim = {
  id: string;
  wording: string;
  supportSummary?: string;
  limitations?: string;
  reviewStatus?: string;
  sourceRefs?: string[];
  passageRefs?: string[];
};

export type ReaderVisual = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  longDescription?: string;
  rightsStatus?: string;
  role?: string;
};

export type ReaderLink = { label: string; href?: string; kind?: "official" | "controlled" | "observational" | "scientific" | "editorial"; studyType?: string; detail?: string };
export type ReaderInlineLink = { phrase: string; href: string };

export type ReaderSlide = {
  id: string;
  order: number;
  role?: string;
  heading: string;
  body: string;
  qualification?: string;
  qualificationPlacement?: "before" | "after";
  qualificationProvenance?: string;
  limitHeading?: string;
  claim_refs?: string[];
  source_refs?: string[];
  visualRefs?: string[];
  sourceLocator?: string;
  provenance?: string;
  claimCategory?: string;
  sourcePath?: string;
  sourceSection?: string;
  passageRef?: string;
  links?: ReaderLink[];
  inlineLinks?: ReaderInlineLink[];
  evidenceNeeded?: string;
};

export type ReaderPost = {
  id: string;
  title: string;
  hook?: string;
  primary_topic?: string;
  topics?: string[];
  articleUrl?: string;
  editorial_state?: string;
  slides: ReaderSlide[];
  image?: { src?: string; alt?: string; caption?: string; asset_id?: string };
};

export type DirectoryPage = {
  id: string;
  path: string;
  group: string;
  title: string;
  description: string;
  reviewState?: string;
};

const sourceList = bank.sources as ReaderSource[];
const claimList = bank.claims as ReaderClaim[];
const visualList = bank.visuals as ReaderVisual[];

export const READER_POSTS = bank.posts as ReaderPost[];
export const DIRECTORY = directory as DirectoryPage[];
export const CONTENT_REVISION = bank.content_revision;

const PUBLISHED_STATES = new Set(["published-existing-excerpt", "approved", "published"]);

/** A public introduction needs an explicit published state. Missing or any other state stays a proposal. */
export function isPublicExcerpt(state: string | undefined): boolean {
  return Boolean(state && PUBLISHED_STATES.has(state));
}

export function publicationLabel(state: string | undefined): string {
  return isPublicExcerpt(state) ? "Published excerpt" : "Reviewed proposal · not approved";
}

export const GROUP_LABELS: Record<string, string> = {
  start: "Start",
  "science-core": "Science",
  "process-atlas": "Process atlas",
  "guide-understand": "Understand",
  "guide-evidence": "Evidence",
  "guide-accountability": "Accountability guides",
  "guide-neurology": "Neurology",
  "guide-method": "Method",
  "support-rights": "Rights and support",
  accountability: "Accountability",
  sources: "Sources",
  journey: "Journey",
  compounds: "Medication context",
  contact: "Contact",
};

export const GROUP_ORDER = Object.keys(GROUP_LABELS);

export function readerPost(id: string): ReaderPost | undefined {
  return READER_POSTS.find((post) => post.id === id);
}

export function claimById(id: string): ReaderClaim | undefined {
  return claimList.find((claim) => claim.id === id);
}

export function sourceById(id: string): ReaderSource | undefined {
  return sourceList.find((source) => source.id === id);
}

export function visualById(id: string): ReaderVisual | undefined {
  return visualList.find((visual) => visual.id === id);
}

/** Local copies of published figures. External addresses stay external. */
export function publicAssetUrl(src: string | undefined): string {
  if (!src) return "";
  if (src.includes("mjb-engraved-mark")) return "/media/mjb-engraved-mark.svg";
  if (src.startsWith("/")) return src;
  if (src.startsWith("https://mjb-adhd.org.uk/") || src.startsWith("http://mjb-adhd.org.uk/")) {
    return src.replace(/^https?:\/\/mjb-adhd\.org\.uk/, "");
  }
  if (src.startsWith("https://") || src.startsWith("http://")) return src;
  return "";
}

export function publishedUrl(pathOrUrl: string | undefined): string {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("https://") || pathOrUrl.startsWith("http://")) return pathOrUrl;
  if (pathOrUrl.startsWith("/")) return `${PUBLISHED_ORIGIN}${pathOrUrl}`;
  return "";
}

export function slideVisual(slide: ReaderSlide, post: ReaderPost): ReaderVisual | undefined {
  const id = slide.visualRefs?.[0] || (slide.order === 1 ? post.image?.asset_id : undefined);
  const found = id ? visualById(id) : undefined;
  if (found) return found;
  if (slide.order === 1 && post.image?.src) {
    return {
      id: `${post.id}-figure`,
      src: post.image.src,
      alt: post.image.alt || "",
      caption: post.image.caption,
    };
  }
  return undefined;
}

export function roleLabel(role: string | undefined): string {
  if (!role) return "";
  const labels: Record<string, string> = {
    evidence_context: "Research context",
    definition: "Clinical description",
    mechanism: "Proposed mechanism",
    qualification: "Limit of the claim",
    overview: "Overview",
    context: "Context",
    implication: "What this does not decide",
  };
  return labels[role] ?? "Explanation";
}

export function sourceKindLabel(type: string | undefined): string {
  if (!type) return "Source";
  const labels: Record<string, string> = {
    "editorial-method": "Method note",
    "editorial-article": "MJB article",
    "site-article": "MJB article",
    "international-classification": "Clinical classification",
    "national-guideline (England)": "National guideline",
    "peer-reviewed study": "Research finding",
  };
  return labels[type] ?? "Recorded source";
}

/** Inherited publication is not the same as an independent check. */
export function reviewLabel(status: string | undefined): string {
  if (!status) return "Evidence status was not recorded.";
  if (status.startsWith("superseded")) return "Superseded interface note. Not a scientific claim.";
  return "Inherited from the published article. Not independently re-checked.";
}
