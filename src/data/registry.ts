import { feedById } from "@/data/feed";
import { IMPORTED_ARTICLES } from "@/data/imported";
import { readerPost } from "@/data/reader-bank";

export type CatalogItem = {
  id: string;
  title: string;
  kind: "published" | "sample" | "draft" | "article" | "unknown";
  available: boolean;
  href?: string;
};

/** One lookup for saved posts and saved pages. Unknown ids stay visible so they can be removed. */
export function catalogItem(id: string): CatalogItem {
  const published = readerPost(id);
  if (published) return { id, title: published.title, kind: "published", available: true };
  const post = feedById(id);
  if (post) return { id, title: post.title, kind: post.sample ? "sample" : "draft", available: true };
  const article = IMPORTED_ARTICLES.find((item) => item.id === id);
  if (article && article.id !== "RT-404" && article.status !== "blocked") {
    const href = article.id === "RT-home" || article.path === "/" ? "/about/original-home/" : article.path;
    return { id, title: article.title, kind: "article", available: true, href };
  }
  return { id, title: "This saved item is unavailable in this version.", kind: "unknown", available: false };
}
