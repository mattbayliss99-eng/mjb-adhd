import { createFileRoute, Link } from "@tanstack/react-router";
import { DECKS } from "@/data/feed";

export const Route = createFileRoute("/decks")({ component: DecksPage });

function DecksPage() {
  return (
    <div>
      <p className="px-4 pt-4 text-sm text-muted">Four-screen decks. Sample copy until the evidence review signs them off.</p>
      <ul className="m-0 list-none p-0">
        {DECKS.map((deck) => (
          <li key={deck.id} className="border-b border-line">
            <Link to="/deck/$id" params={{ id: deck.id }} search={{ card: 1 }} className="block px-4 py-4 text-ink no-underline">
              <span className="block font-serif text-2xl">{deck.title}</span>
              <span className="text-sm text-muted">{deck.topic} · {deck.cards.length} screens</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
