import { createFileRoute, Link } from "@tanstack/react-router";
import { ARTICLE } from "@/data/article";
import { postById } from "@/data/posts";
import { BionicText } from "@/components/bionic";
import { usePrefs } from "@/lib/session";

export const Route = createFileRoute("/article")({
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search.from === "string" ? search.from : "",
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { from } = Route.useSearch();
  const bionic = usePrefs((state) => state.bionic);
  const origin = from ? postById(from) : undefined;

  return (
    <article className="flex flex-col gap-4">
      <p className="kicker m-0">Public article · excerpt for the return path</p>
      <h1 className="m-0 text-4xl">{ARTICLE.title}</h1>
      <p className="m-0 text-sm text-muted">Last updated {ARTICLE.updated} on the public MJB site. Science, not a dosing tool.</p>
      {ARTICLE.sections.map((section) => (
        <section key={section.heading}>
          <h2 className="text-2xl">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>
              <BionicText text={paragraph} on={bionic} />
            </p>
          ))}
        </section>
      ))}
      <section className="card">
        <h2 className="m-0 text-xl">Known, and not established</h2>
        <h3 className="text-lg">Stated as known on the public page</h3>
        <ul>
          {ARTICLE.known.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3 className="text-lg">The same page says this is not established</h3>
        <ul>
          {ARTICLE.notEstablished.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mb-0 text-sm">{ARTICLE.sourceNote}</p>
      </section>
      <div className="flex flex-wrap gap-2">
        {origin ? (
          <Link to="/post/$id" params={{ id: origin.id }} className="btn btn-primary">
            Return to {origin.title}
          </Link>
        ) : (
          <Link to="/" className="btn btn-primary">
            Return home
          </Link>
        )}
        <a className="btn" href={ARTICLE.href}>
          Full article and sources
        </a>
      </div>
      <p className="text-sm text-muted">
        Diagrams and the source register stay on the live page. This excerpt does not add claims.
      </p>
    </article>
  );
}
