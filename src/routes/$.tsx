import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArticleScreen, MissingPage } from "@/components/imported-article";
import { articleByPath, loadArticleBody } from "@/data/imported";

export const Route = createFileRoute("/$")({
  loader: async ({ params }) => {
    const article = articleByPath(`/${params._splat ?? ""}`);
    if (!article) throw notFound();
    const body = await loadArticleBody(article.id);
    if (!body) throw notFound();
    return { article, body };
  },
  notFoundComponent: MissingPage,
  component: ImportedRoute,
});

function ImportedRoute() {
  const { article, body } = Route.useLoaderData();
  return <ArticleScreen article={article} body={body} />;
}
