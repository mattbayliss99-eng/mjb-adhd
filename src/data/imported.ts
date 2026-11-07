import indexBank from "../../content/imported/catalog.json";
import aliases from "../../content/imported/guide-aliases.json";

export type Markup = string | { t: string; a?: Record<string, string>; c?: Markup[] };

export type ArticleMeta = {
  id: string;
  path: string;
  originalPath: string;
  title: string;
  description: string;
  group: string;
  sourceFile: string;
  blobSha: string;
  commit: string;
  contentHash: string;
  status: "integrated" | "mapped" | "blocked";
  statusNote: string;
  counts: { p?: number; li?: number; table?: number; figure?: number; a?: number; h2?: number };
  text?: string;
};

export type ImportedArticle = ArticleMeta & { body: Markup };

export const SOURCE_COMMIT = (indexBank as { commit: string }).commit;
export const ARTICLE_INDEX = (indexBank as { articles: ArticleMeta[] }).articles;
export const IMPORTED_ARTICLES = ARTICLE_INDEX;
export const GUIDE_ALIASES = aliases as Record<string, string>;

const bodyLoaders = import.meta.glob("../../content/imported/bodies/*.json");

export async function loadArticleBody(id: string): Promise<Markup | null> {
  const key = `../../content/imported/bodies/${id}.json`;
  const load = bodyLoaders[key];
  if (!load) return null;
  const mod = (await load()) as { default: { body: Markup } };
  return mod.default?.body ?? null;
}

const byPath = new Map<string, ArticleMeta>();
for (const article of ARTICLE_INDEX) {
  byPath.set(normalizePath(article.path), article);
  if (article.originalPath !== article.path) byPath.set(normalizePath(article.originalPath), article);
}

export function normalizePath(path: string): string {
  let next = path.split("#")[0]?.split("?")[0] ?? "/";
  if (!next.startsWith("/")) next = `/${next}`;
  if (next.endsWith("/index.html")) next = next.slice(0, -"index.html".length);
  if (next.length > 1 && next.endsWith("/")) next = next.slice(0, -1);
  return next || "/";
}

export function articleByPath(path: string): ArticleMeta | undefined {
  return byPath.get(normalizePath(path));
}

/** Prefer the copied page. Keep a same-site query and fragment. External citations stay put. */
export function localArticleHref(pathOrUrl: string | undefined): string {
  if (!pathOrUrl) return "";
  let path = pathOrUrl;
  let suffix = "";
  if (pathOrUrl.startsWith("https://") || pathOrUrl.startsWith("http://")) {
    try {
      const url = new URL(pathOrUrl);
      if (url.hostname !== "mjb-adhd.org.uk" && url.hostname !== "www.mjb-adhd.org.uk") return pathOrUrl;
      path = url.pathname;
      suffix = `${url.search}${url.hash}`;
    } catch {
      return pathOrUrl;
    }
  } else if (path.startsWith("/")) {
    const cut = Math.min(
      path.includes("#") ? path.indexOf("#") : path.length,
      path.includes("?") ? path.indexOf("?") : path.length,
    );
    suffix = path.slice(cut);
    path = path.slice(0, cut);
  } else {
    return "";
  }
  const article = articleByPath(path);
  if (!article || article.id === "RT-404") return `${path}${suffix}`;
  if (normalizePath(article.path) === "/" || article.id === "RT-home") return `/about/original-home/${suffix}`;
  return `${article.path}${suffix}`;
}

export function isCataloguePage(path: string): boolean {
  const withSlash = path.endsWith("/") ? path : `${path}/`;
  return withSlash !== "/contact/thanks/";
}

export function articlesForLibrary(): ArticleMeta[] {
  return IMPORTED_ARTICLES.filter((article) => article.id !== "RT-404" && article.id !== "RT-contact-thanks" && article.status !== "blocked" && isCataloguePage(article.path));
}
