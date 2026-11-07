import { createFileRoute } from "@tanstack/react-router";
import { MYTHS } from "@/data/feed";

export const Route = createFileRoute("/myths")({ component: MythsPage });

function MythsPage() {
  return (
    <div>
      <header className="px-4 pt-4">
        <h2 className="font-serif text-3xl text-ink">Bad assumptions. Real consequences.</h2>
        <p className="text-sm text-muted">Draft cards. Each one names a source. They are not an approved MJB article yet.</p>
      </header>
      {MYTHS.map((myth) => (
        <article key={myth.claim} className="border-b border-line px-4 py-4">
          <p className="kicker m-0 text-danger">Not a safe shortcut</p>
          <h3 className="mt-1 font-serif text-2xl text-ink line-through decoration-danger">{myth.claim}</h3>
          <p>{myth.why}</p>
          <p>{myth.says}</p>
          <p className="text-sm">Consequence: {myth.cost}</p>
          <p className="text-sm">Ask next: {myth.ask}</p>
          <a href={myth.href}>Source</a>
        </article>
      ))}
    </div>
  );
}
