import { useEffect, useMemo, useState } from "react";
import { EDITORIAL, SLIDE_SET } from "@/data/feed";
import {
  loadPackLocal,
  packByteSize,
  removePackLocal,
  renderPackHtml,
  savePackLocal,
  type ReadingPack,
} from "@/lib/reading-pack";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function introPack(): ReadingPack {
  return {
    id: "intro",
    title: "MJB introductions",
    note: "Three draft introductions. Pending evidence review. This file is not the live website. The article link still needs a connection. No papers are included.",
    contentRevision: SLIDE_SET.contentRevision,
    revisedOn: SLIDE_SET.revisedOn,
    posts: EDITORIAL.map((post) => ({
      id: post.id,
      title: post.title,
      status: "draft",
      slides: post.slides.map((slide) => ({ heading: slide.heading, body: slide.body })),
      sources: post.sources.map((source) => ({ label: source.label, href: source.href })),
    })),
  };
}

export function ReadingPackPanel() {
  const pack = useMemo(introPack, []);
  const html = useMemo(() => renderPackHtml(pack), [pack]);
  const bytes = useMemo(() => packByteSize(html), [html]);
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<ReadingPack | null>(null);

  useEffect(() => {
    void loadPackLocal(pack.id)
      .then((row) => setSaved(row?.pack ?? null))
      .catch(() => setSaved(null));
  }, [pack.id]);

  async function refresh() {
    const row = await loadPackLocal(pack.id);
    setSaved(row?.pack ?? null);
  }

  function download() {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mjb-introductions.html";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    setNote(
      "A download was started. This page cannot tell whether it finished, or where the browser put the file. If it completes, open that file with no connection. Linked pages still need the internet.",
    );
  }

  const matches =
    saved && query.trim()
      ? saved.posts.flatMap((post) =>
          post.slides
            .filter((slide) => `${post.title} ${slide.heading} ${slide.body}`.toLowerCase().includes(query.trim().toLowerCase()))
            .map((slide) => ({ post: post.title, body: slide.body })),
        )
      : [];

  return (
    <section className="card" aria-labelledby="pack-heading">
      <div className="screen-only">
      <h2 id="pack-heading" className="m-0 text-xl">
        Introductions pack
      </h2>
      <p className="text-sm text-muted">
        About {formatBytes(bytes)}. Three draft posts, every slide, and the article link. Not the research papers, and not a promise this
        preview reopens with no network.
      </p>
      <div className="flex flex-wrap gap-2 no-print">
        <button type="button" className="btn btn-primary" onClick={download}>
          Download {formatBytes(bytes)}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            void savePackLocal(pack, html)
              .then(() => refresh())
              .then(() => setNote("Copy kept in this browser. It can disappear if the browser clears site data."))
              .catch(() => setNote("This browser would not store the copy."));
          }}
        >
          Keep a copy in this browser
        </button>
        <button type="button" className="btn" onClick={() => window.print()}>
          Print or save as PDF
        </button>
      </div>
      <p className="mb-0 text-sm text-muted">
        Print opens the browser’s print dialog. Choose “Save as PDF” there. This preview does not build the PDF itself.
      </p>
      {note ? <p className="text-sm">{note}</p> : null}
      {saved ? (
        <div className="mt-3">
          <label className="field">
            <span>Search the saved copy</span>
            <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          {query.trim() ? (
            matches.length ? (
              <ul>
                {matches.map((item) => (
                  <li key={`${item.post}-${item.body}`}>
                    <strong>{item.post}.</strong> {item.body}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No match in the saved copy.</p>
            )
          ) : (
            <p className="text-sm text-muted">The copy is on this device. Type to search it.</p>
          )}
          <button
            type="button"
            className="btn"
            onClick={() => {
              void removePackLocal(pack.id).then(() => {
                setSaved(null);
                setNote("Removed the copy from this browser. A downloaded file is untouched.");
              });
            }}
          >
            Remove the saved copy
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted">Nothing is saved in this browser yet. Use the button above, then search.</p>
      )}
      </div>
      <div className="print-deck">
        <h2>{pack.title}</h2>
        <p>{pack.note}</p>
        {pack.posts.map((post) => (
          <article key={post.id}>
            <p>Draft · Pending evidence review</p>
            <h3>{post.title}</h3>
            <ol>
              {post.slides.map((slide, index) => (
                <li key={`${post.id}-${index}`}>
                  <p>
                    {index + 1} of {post.slides.length}
                    {slide.heading ? `. ${slide.heading}` : ""}
                  </p>
                  <p>{slide.body}</p>
                </li>
              ))}
            </ol>
            <ul>
              {post.sources.map((source) => (
                <li key={source.href}>
                  <a href={source.href}>{source.label}</a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
