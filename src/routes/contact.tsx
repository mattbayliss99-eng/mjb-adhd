import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArticleScreen } from "@/components/imported-article";
import { articleByPath, loadArticleBody } from "@/data/imported";

export const Route = createFileRoute("/contact")({
  loader: async () => {
    const article = articleByPath("/contact");
    if (!article) throw notFound();
    const body = await loadArticleBody(article.id);
    if (!body) throw notFound();
    return { article, body };
  },
  component: ContactPage,
});

function ContactPage() {
  const { article, body } = Route.useLoaderData();
  return <ArticleScreen article={article} body={body} embed="contact" />;
}
