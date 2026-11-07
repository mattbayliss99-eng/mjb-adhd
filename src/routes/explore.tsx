import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { DIRECTORY, GROUP_LABELS, GROUP_ORDER, READER_POSTS, isPublicExcerpt } from "@/data/reader-bank";
import { articlesForLibrary, isCataloguePage, normalizePath } from "@/data/imported";
import { PROPOSAL_POSTS } from "@/data/proposals";
import { SEARCH_TEXT } from "@/data/search-text";
import { armReturn, takeReturn } from "@/lib/place";

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>) => ({
    topic: typeof search.topic === "string" ? search.topic : "",
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const query = search.q;
  const group = search.topic || "all";
  useEffect(() => {
    const place = takeReturn("/explore");
    if (!place) return;
    const frame = window.requestAnimationFrame(() => {
      if (place.y > 0) window.scrollTo(0, place.y);
      if (place.focus) document.getElementById(place.focus)?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const writeSearch = (nextQuery: string, nextGroup: string) => {
    void navigate({
      to: "/explore",
      search: { q: nextQuery, topic: nextGroup === "all" ? "" : nextGroup },
      replace: true,
    });
  };
  const needle = query.trim().toLowerCase();
  const pages = useMemo(() => {
    const articles = articlesForLibrary();
    return DIRECTORY.filter((page) => {
      if (!isCataloguePage(page.path)) return false;
      if (group !== "all" && page.group !== group) return false;
      if (!needle) return true;
      const article = articles.find((item) => normalizePath(item.originalPath) === normalizePath(page.path) || item.id === page.id);
      const hay = `${page.title} ${page.description} ${page.path} ${SEARCH_TEXT[article?.id ?? ""] ?? ""} ${article?.title ?? ""}`;
      return hay.toLowerCase().includes(needle);
    });
  }, [group, needle]);
  const sections = useMemo(() => {
    return GROUP_ORDER.map((id) => ({
      id,
      label: GROUP_LABELS[id] || id,
      pages: pages.filter((page) => page.group === id),
    })).filter((section) => section.pages.length > 0);
  }, [pages]);
  const posts = READER_POSTS.filter((post) => {
    if (!isPublicExcerpt(post.editorial_state)) return false;
    if (group !== "all") return false;
    if (!needle) return true;
    return `${post.title} ${post.hook ?? ""}`.toLowerCase().includes(needle);
  });

  return (
    <div className="px-4 py-4">
      <h1 className="mb-2 mt-0 font-serif text-3xl text-ink">Explore</h1>
      <p className="text-sm text-muted">
        Browse 130 published pages. The full text opens here. Three short explanations are also here.
      </p>
      <label className="field">
        <span>Search the library</span>
        <input className="input" value={query} onChange={(event) => writeSearch(event.target.value, group)} />
      </label>
      <label className="field">
        <span>Section</span>
        <select className="input" value={group} onChange={(event) => writeSearch(query, event.target.value)}>
          <option value="all">All sections</option>
          {GROUP_ORDER.map((id) => (
            <option key={id} value={id}>
              {GROUP_LABELS[id]}
            </option>
          ))}
        </select>
      </label>
      {posts.length > 0 ? (
        <section className="mb-6">
          <h2 className="text-xl">Published excerpts</h2>
          <ul className="m-0 list-none p-0">
            {posts.map((post) => (
              <li key={post.id} className="border-b border-line py-3">
                <Link id={`open-${post.id}`} to="/post/$id" params={{ id: post.id }} className="text-ink" onClick={() => armReturn(`open-${post.id}`)}>
                  {post.title}
                </Link>
                <p className="mb-0 mt-1 text-sm text-muted">{post.hook}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="text-sm">
        <a href="/questionnaires">Understand your patterns</a>
        <span className="text-muted"> — exploratory self-profiles, not a diagnosis. Official questionnaires are listed separately.</span>
      </p>
      <p className="text-sm">
        <a href="/questionnaire-demo">Fictional questionnaire demonstration</a>
        <span className="text-muted"> — unscored, not a diagnosis.</span>
      </p>
      <details id="proposed-explanations" className="mb-6">
        <summary className="cursor-pointer py-2">Reviewed proposals, not public</summary>
        <p className="text-sm text-muted">
          {PROPOSAL_POSTS.length} reviewed sequences. Not approved, and not on Home. One of them is merged into the rights guides rather than kept as its own explanation.
        </p>
        <ul className="proposal-list">
          {PROPOSAL_POSTS.map((post) => (
            <li key={post.id}>
              <Link to="/post/$id" params={{ id: post.id }} className="shelf-card" onClick={() => armReturn(`open-${post.id}`)}>
                <span className="text-sm text-muted">
                  {post.id} · {post.editorialStatus === "merged-into-help" ? "merged into the rights guides" : "reviewed proposal"}
                </span>
                <strong>{post.title}</strong>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-sm">
          <a href="/proposals">Open the authoring register</a>
          <span className="text-muted"> — 97 headings, with gaps left empty.</span>
        </p>
      </details>
      <p className="text-sm text-muted">
        {pages.length} page{pages.length === 1 ? "" : "s"}
      </p>
      {sections.map((section) => (
        <section key={section.id} className="mb-6">
          <h2 className="mb-1 text-xl">{section.label}</h2>
          <ul className="m-0 list-none p-0">
            {section.pages.map((page) => (
              <li key={page.id} className="border-b border-line py-3">
                <a id={`open-${page.id}`} href={page.path === "/" ? "/about/original-home/" : page.path} onClick={() => armReturn(`open-${page.id}`)}>{page.title}</a>
                <p className="mb-0 mt-1 text-sm text-muted">{page.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {pages.length === 0 ? <p>No pages match that search.</p> : null}
    </div>
  );
}
