import { createFileRoute, Link } from "@tanstack/react-router";
import register from "../../content/posts/authoring-register.json";
import { PROPOSAL_POSTS } from "@/data/proposals";

export const Route = createFileRoute("/proposals")({
  component: ProposalsPage,
});

function ProposalsPage() {
  const items = register.items;
  return (
    <div className="px-4 py-4">
      <h1 className="mb-2 mt-0 font-serif text-3xl text-ink">Reviewed proposals</h1>
      <p>
        These {PROPOSAL_POSTS.length} sequences are not approved and they are not on Home. One is merged into the rights guides and is not a finished standalone explanation. Quotations stay marked as quotations. New wording is marked as author-proposed.
      </p>
      <p className="text-sm text-muted">
        The register has {register.counts.proposals} headings. {register.counts.withoutPassage} headings have no passage under them, so nothing was written to fill the gap.
      </p>
      <ul className="proposal-list">
        {PROPOSAL_POSTS.map((post) => (
          <li key={post.id}>
            <Link to="/post/$id" params={{ id: post.id }} className="shelf-card">
              <span className="text-sm text-muted">
                {post.id} · {post.editorialStatus === "merged-into-help" ? "merged into the rights guides" : "reviewed proposal"}
              </span>
              <strong>{post.title}</strong>
              <span className="text-sm text-muted">{post.learningPoint}</span>
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-8 font-serif text-2xl text-ink">Authoring register</h2>
      <p className="text-sm text-muted">{register.note}</p>
      <p className="text-sm text-muted">{register.limitsFragment}</p>
      {items.map((item) => (
        <details key={item.id} className="register-row">
          <summary>
            {item.id} · {item.section}
            {item.batchPostId ? ` · sequence ${item.batchPostId}` : ""}
            {item.passage ? "" : " · no passage"}
          </summary>
          <p className="text-sm text-muted">
            <a href={item.articlePath}>{item.articleTitle}</a>
            {" · "}
            {item.evidenceStatus}
          </p>
          <p>{item.learningPoint}</p>
          {item.openEditorialQuestion ? <p>{item.openEditorialQuestion}</p> : null}
          {item.visual ? <p className="text-sm">Visual on the page: {item.visual.alt || item.visual.src}</p> : <p className="text-sm">No figure in this section.</p>}
          {item.proposedSequence.length > 0 ? <p className="text-sm">Proposed sequence: {item.proposedSequence.join(", ")}</p> : <p className="text-sm">No sequence proposed.</p>}
          {item.passage ? <p>{item.passage}</p> : null}
        </details>
      ))}
    </div>
  );
}
