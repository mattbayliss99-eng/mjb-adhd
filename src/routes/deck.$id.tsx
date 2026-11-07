import { createFileRoute, Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Volume2, X } from "lucide-react";
import { useCallback, useEffect } from "react";
import { deckById } from "@/data/feed";
import { useReaderKeys } from "@/hooks/use-reader-keys";
import { useSwipe } from "@/hooks/use-swipe";
import { speakChunks, stopSpeak } from "@/lib/speak";
import { usePrefs, usePrivate } from "@/lib/session";

export const Route = createFileRoute("/deck/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    card: Math.max(1, Math.floor(Number(search.card)) || 1),
  }),
  head: ({ params }) => {
    const deck = deckById(params.id);
    const title = deck ? `${deck.title} · MJB ADHD` : "Deck not found · MJB ADHD";
    const description = deck ? `${deck.cards[0].heading} ${deck.cards[0].body}` : "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: DeckPage,
});

function DeckPage() {
  const { id } = Route.useParams();
  const { card } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const deck = deckById(id);
  const markSeen = usePrivate((state) => state.markDeckSeen);
  const swipeOn = usePrefs((state) => state.swipe);
  const total = deck?.cards.length ?? 0;
  const index = deck ? Math.min(total, Math.max(1, card)) - 1 : 0;
  const slide = deck?.cards[index];
  const last = index === total - 1;

  const close = useCallback(() => {
    stopSpeak();
    if (canGoBack) router.history.back();
    else void navigate({ to: "/decks" });
  }, [canGoBack, navigate, router]);

  const go = useCallback(
    (nextIndex: number) => {
      if (!deck) return;
      if (nextIndex >= total) {
        void navigate({ to: "/post/$id", params: { id: deck.post } });
        return;
      }
      const clamped = Math.max(0, nextIndex);
      if (clamped === index) return;
      stopSpeak();
      void navigate({ to: "/deck/$id", params: { id }, search: { card: clamped + 1 }, replace: true });
    },
    [deck, id, index, navigate, total],
  );

  const ref = useReaderKeys<HTMLElement>(
    { onPrev: () => go(index - 1), onNext: () => go(index + 1), onExit: close },
    { autoFocus: true, focusKey: index },
  );
  const swipe = useSwipe({ enabled: swipeOn, onPrev: () => go(index - 1), onNext: () => go(index + 1) });

  useEffect(() => {
    if (deck) markSeen(deck.id);
    return () => stopSpeak();
  }, [deck, markSeen]);

  if (!deck || !slide) {
    return (
      <div className="p-4">
        <p>That deck is not in this preview.</p>
        <Link to="/decks" className="btn">
          All decks
        </Link>
      </div>
    );
  }

  return (
    <section ref={ref} className="viewer outline-none" {...swipe} aria-roledescription="story deck" aria-label={deck.title}>
      <div className="bars" aria-hidden="true">
        {deck.cards.map((item, itemIndex) => (
          <i key={item.kicker} className={itemIndex < index ? "done" : itemIndex === index ? "now" : ""}>
            <b />
          </i>
        ))}
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <p className="m-0 flex-1 text-sm" aria-live="polite">
          {deck.title} · card {index + 1} of {total}
        </p>
        <button type="button" className="btn btn-quiet" aria-label="Read this card aloud" onClick={() => speakChunks(`${slide.heading}. ${slide.body}`)}>
          <Volume2 aria-hidden="true" size={18} />
        </button>
        <button type="button" className="btn btn-quiet" aria-label="Close deck" onClick={close}>
          <X aria-hidden="true" size={18} />
        </button>
      </div>
      <div className={`slide slide-centred ${slide.tone} flex-1`}>
        <div className={`mark mark-${deck.id}`} aria-hidden="true" />
        <p className="m-0 text-sm">{slide.kicker}</p>
        <h2 className="font-serif text-4xl">{slide.heading}</h2>
        <p className="text-lg">{slide.body}</p>
        {deck.notice ? <p className="deck-notice">{deck.notice}</p> : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 p-3">
        <button type="button" className="btn" onClick={() => go(index - 1)} disabled={index === 0}>
          <ChevronLeft aria-hidden="true" size={18} /> Back
        </button>
        <button type="button" className="btn btn-primary" onClick={() => go(index + 1)}>
          {last ? "Read the full thread" : "Next"} <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>
    </section>
  );
}
