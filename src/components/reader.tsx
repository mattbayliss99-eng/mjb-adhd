import { Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, Share2, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BionicText } from "@/components/bionic";
import { DECKS, EDITORIAL, SAMPLES, feedById, type FeedPost } from "@/data/feed";
import { useReaderKeys } from "@/hooks/use-reader-keys";
import { useSwipe } from "@/hooks/use-swipe";
import { readSamplesOpen, readSlide, slideSearch, takeReturn, writeSamplesOpen, writeSlide } from "@/lib/place";
import { READER_POSTS, isPublicExcerpt, readerPost } from "@/data/reader-bank";
import { PublishedCard } from "@/components/topic-reader";
import { speakChunks, stopSpeak } from "@/lib/speak";
import { usePrefs, usePrivate } from "@/lib/session";

function statusLabel(post: FeedPost): string {
  return post.sample ? "Sample · Pending evidence review" : "Draft · Pending evidence review";
}

function Evidence({ post }: { post: FeedPost }) {
  return <span className="chip chip-sample">{statusLabel(post)}</span>;
}

function markClass(id: string): string {
  if (id.endsWith("2") || id.endsWith("time")) return "story-mark blob";
  if (id.endsWith("3") || id.endsWith("nice")) return "story-mark tile";
  return "story-mark";
}

export function StorySlides({ post, initialSlide }: { post: FeedPost; initialSlide?: number }) {
  const slides = post.slides.length ? post.slides : [{ id: `${post.id}-s1`, heading: post.title, body: post.text }];
  const bionic = usePrefs((state) => state.bionic);
  const swipeOn = usePrefs((state) => state.swipe);
  const [index, setIndex] = useState(0);
  const skipWrite = useRef(true);
  const slide = slides[Math.min(index, slides.length - 1)];
  const last = index >= slides.length - 1;

  useEffect(() => {
    if (skipWrite.current) {
      skipWrite.current = false;
      if (initialSlide && initialSlide >= 1 && initialSlide <= slides.length) {
        setIndex(initialSlide - 1);
        writeSlide(post.id, initialSlide - 1);
        return;
      }
      setIndex(readSlide(post.id, slides.length));
      return;
    }
    writeSlide(post.id, index);
  }, [index, initialSlide, post.id, slides.length]);

  useEffect(() => () => stopSpeak(), []);

  const go = (next: number) => setIndex(Math.max(0, Math.min(slides.length - 1, next)));
  const ref = useReaderKeys<HTMLElement>({ onPrev: () => go(index - 1), onNext: () => (last ? undefined : go(index + 1)) }, { autoFocus: false });
  const swipe = useSwipe({ enabled: swipeOn, onPrev: () => go(index - 1), onNext: () => go(index + 1) });

  return (
    <section ref={ref} tabIndex={-1} className="story-frame outline-none" aria-roledescription="story" aria-label={post.title} {...swipe}>
      <p className="m-0 text-sm text-muted" aria-live="polite">
        {index + 1} of {slides.length}
      </p>
      <div className={`${markClass(post.id)} screen-only`} aria-hidden="true" />
      <div className="screen-only">
        {slide.heading && slide.heading !== post.title ? <h3 className="mb-1 mt-2 text-xl text-ink">{slide.heading}</h3> : null}
        <p className="text m-0">
          <BionicText text={slide.body} on={bionic} />
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={() => go(index - 1)} disabled={index === 0}>
            Previous
          </button>
          <button type="button" className="btn btn-primary" onClick={() => go(index + 1)} disabled={last}>
            Next
          </button>
          <button type="button" className="btn" onClick={() => speakChunks(`${slide.heading ? `${slide.heading}. ` : ""}${slide.body}`)}>
            <Volume2 aria-hidden="true" size={16} /> Listen
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              const url = new URL(`/post/${post.id}`, window.location.origin);
              url.searchParams.set("slide", String(index + 1));
              const href = url.toString();
              const copy = () => navigator.clipboard?.writeText(href).catch(() => undefined);
              if (typeof navigator.share !== "function") {
                void copy();
                return;
              }
              void navigator.share({ title: post.title, url: href }).catch((error: unknown) => {
                if (error instanceof DOMException && error.name === "AbortError") return;
                void copy();
              });
            }}
          >
            <Share2 aria-hidden="true" size={16} /> Share
          </button>
        </div>
        {last ? <p className="mb-0 mt-3 text-sm text-muted">End of this story. It does not start again on its own.</p> : null}
      </div>
      <div className="print-deck">
        <p>Pending evidence review</p>
        <h2>{post.title}</h2>
        <ol>
          {slides.map((item, itemIndex) => (
            <li key={item.id}>
              <h3>
                {itemIndex + 1} of {slides.length}
                {item.heading ? `. ${item.heading}` : ""}
              </h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>
        <h3>Sources</h3>
        <ul>
          {post.sources.map((source) => (
            <li key={source.href}>
              <a href={source.href}>{source.label}</a>
            </li>
          ))}
        </ul>
      </div>
      {post.article ? (
        <p className="mb-0 mt-3">
          <a href={post.article.href}>{post.article.label}</a>
        </p>
      ) : null}
      <details className="mt-2">
        <summary>Sources</summary>
        <ul>
          {post.sources.map((source) => (
            <li key={source.href}>
              <a href={source.href}>{source.label}</a>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

export function PostCard({ post }: { post: FeedPost }) {
  const bionic = usePrefs((state) => state.bionic);
  const saved = usePrivate((state) => state.bookmarks.includes(post.id));
  const toggle = usePrivate((state) => state.toggleBookmark);
  const deck = post.deck ? DECKS.find((item) => item.id === post.deck) : undefined;

  return (
    <article className="post-row" id={`post-${post.id}`}>
      <img src="/media/mjb-emblem.jpg" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
      <div className="min-w-0 flex-1">
        <p className="m-0 flex flex-wrap items-center gap-1 text-sm">
          <span className="font-semibold text-ink">MJB ADHD</span>
          <span className="text-muted">Publisher</span>
          <span className="text-muted">@MJB_ADHD{post.sample ? "" : ` · ${post.id}`}</span>
          <Evidence post={post} />
        </p>
        <h2 className="mb-1 mt-1 text-lg text-ink">
          <Link to="/post/$id" params={{ id: post.id }} className="text-ink">
            <BionicText text={post.title} on={bionic} />
          </Link>
        </h2>
        <StorySlides post={post} />
        {deck ? (
          <Link to="/deck/$id" params={{ id: deck.id }} search={{ card: 1 }} className="deck-preview no-print">
            <span className="deck-emoji" aria-hidden="true">
              {deck.emoji}
            </span>
            <span>
              <span className="kicker">{deck.short}</span>
              <strong className="mt-1 block text-ink">{deck.cards[0].heading}</strong>
            </span>
          </Link>
        ) : null}
        <div className="actions no-print">
          <button type="button" aria-pressed={saved} onClick={() => toggle(post.id)}>
            <Bookmark aria-hidden="true" size={16} /> {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}

export type HomeTab = "latest" | "science" | "help";
export const HOME_TABS: readonly [HomeTab, string][] = [
  ["latest", "Start here"],
  ["science", "Preview samples"],
  ["help", "Help"],
];

export function HomeFeed({ tab = "latest" }: { tab?: HomeTab }) {
  const lastId = usePrivate((state) => state.lastPostId);
  const last = lastId ? readerPost(lastId) ?? feedById(lastId) : undefined;
  const [showSamples, setShowSamples] = useState(false);

  useEffect(() => {
    if (readSamplesOpen()) setShowSamples(true);
    const place = takeReturn("/");
    if (!place) {
      window.scrollTo(0, 0);
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      if (place.y > 0) window.scrollTo(0, place.y);
      if (place.focus) document.getElementById(place.focus)?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div>
      <nav className="tabs no-print" aria-label="Filter the feed">
        {HOME_TABS.map(([id, label]) => (
          <Link key={id} to="/" search={{ tab: id }} aria-current={tab === id ? "page" : undefined}>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      {last ? (
        <p className="resume no-print">
          <Link to="/post/$id" params={{ id: last.id }} search={slideSearch(last.id)}>
            Continue · {last.title}
          </Link>
        </p>
      ) : null}
      <Link to="/decks" className="decks-chip no-print">
        Decks
      </Link>
      {tab === "help" ? (
        <div className="px-4 py-4">
          <h1 className="mb-2 px-4 font-serif text-3xl text-ink">Help</h1>
          <p>Find guides to accessing care, preparing questions and keeping useful records.</p>
          <Link to="/help" className="btn">
            Help with care
          </Link>
        </div>
      ) : null}
      {tab === "latest" ? (
        <>
          <h1 className="mb-2 px-4 font-serif text-4xl text-ink">Start here</h1>
          <p className="px-4 text-sm text-muted">
            Explore ADHD through short explanations, diagrams and linked sources. Open a topic, read at your own pace, or browse the full library.
          </p>
          {READER_POSTS.filter((post) => isPublicExcerpt(post.editorial_state)).map((post) => (
            <PublishedCard key={post.id} post={post} />
          ))}
          <p className="px-4 py-6 text-center text-muted">That is the end of these introductions. Open Explore for more topics.</p>
          <p className="px-4 pb-4 text-center">
            <a href="/about/original-home/">Original home page</a>
          </p>
          <section className="topic-shelf px-4 pb-6" aria-label="Topics in the library">
            <h2 className="font-serif text-2xl text-ink">Open a topic</h2>
            <p className="text-sm text-muted">Full pages from the library. These are not the short introductions above.</p>
            <ul>
              {[
                ["/science/what-is-adhd/", "What is ADHD?", "The condition, in the published article"],
                ["/science/genetics/", "Genetics", "Published genetics pages"],
                ["/science/pathway/", "Dopamine pathway", "The published step-by-step map"],
                ["/science/process-atlas/", "Process atlas", "Diagrams with their captions"],
                ["/guide/", "Guide", "Evidence labels and how to read them"],
                ["/accountability/", "Accountability", "The published record"],
                ["/rights/overview/", "Rights and care", "Routes, not a personal case"],
                ["/questionnaire-demo", "Sample questions", "A fictional, unscored demonstration"],
              ].map(([href, title, note]) => (
                <li key={href}>
                  <a className="shelf-card" href={href}>
                    <strong>{title}</strong>
                    <span className="text-sm text-muted">{note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
          {showSamples ? (
            <section aria-label="Sample threads">
              <h2 className="px-4 font-serif text-2xl text-ink">Preview samples</h2>
              <p className="px-4 text-sm text-muted">
                Not the publication. Pending evidence review. These are not approved research.
              </p>
              {SAMPLES.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </section>
          ) : (
            <p className="px-4 pb-8 text-center">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setShowSamples(true);
                  writeSamplesOpen(true);
                }}
              >
                Load preview samples
              </button>
            </p>
          )}
        </>
      ) : null}
      {tab === "science" ? (
        <>
          <h1 className="mb-2 px-4 font-serif text-3xl text-ink">Preview samples</h1>
          <p className="px-4 text-sm text-muted">
            Sample threads only. Not the publication. Pending evidence review.
          </p>
          {SAMPLES.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          <p className="px-4 py-8 text-center text-muted">End of the samples in this preview.</p>
        </>
      ) : null}
    </div>
  );
}

export function Thread({ id, initialSlide }: { id: string; initialSlide?: number }) {
  const post = feedById(id);
  const index = post ? (post.sample ? SAMPLES : EDITORIAL).findIndex((item) => item.id === id) : -1;
  const list = post?.sample ? SAMPLES : EDITORIAL;
  const prev = index > 0 ? list[index - 1] : null;
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null;
  const touchPlace = usePrivate((state) => state.touchPlace);
  const toggle = usePrivate((state) => state.toggleBookmark);
  const saved = usePrivate((state) => state.bookmarks.includes(id));
  const navigate = useNavigate();

  useEffect(() => {
    touchPlace(id);
    const y = usePrivate.getState().scrollById[id] ?? 0;
    const frame = window.requestAnimationFrame(() => {
      if (y > 0) window.scrollTo(0, y);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      touchPlace(id, window.scrollY);
    };
  }, [id, touchPlace]);

  if (!post) {
    return (
      <p className="p-4">
        That post is not in this feed. <Link to="/">Back home</Link>
      </p>
    );
  }

  return (
    <article className="px-4 py-3">
      <p className="m-0 flex flex-wrap items-center gap-2">
        <img src="/media/mjb-emblem.jpg" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
        <span>
          <span className="block font-semibold text-ink">
            MJB ADHD <span className="font-normal text-muted">Publisher</span>
          </span>
          <span className="text-sm text-muted">@MJB_ADHD{post.sample ? "" : ` · ${post.id}`}</span>
        </span>
        <Evidence post={post} />
      </p>
      <h2 className="font-serif text-3xl">{post.title}</h2>
      <StorySlides post={post} initialSlide={initialSlide} />
      <div className="actions no-print">
        <button type="button" onClick={() => speakChunks(`${post.title}. ${post.slides.map((slide) => slide.body).join(" ")}`)}>
          <Volume2 aria-hidden="true" size={16} /> Listen
        </button>
        <button type="button" aria-pressed={saved} onClick={() => toggle(post.id)}>
          <Bookmark aria-hidden="true" size={16} /> {saved ? "Saved" : "Save"}
        </button>
        <button type="button" className="btn" onClick={() => window.print()}>
          Print or save as PDF
        </button>
      </div>
      <p className="text-sm text-muted">
        Print opens this browser’s print dialog. Choose “Save as PDF” there if you want a file. This preview does not build the PDF itself.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 no-print">
        {prev ? (
          <button type="button" className="btn" onClick={() => void navigate({ to: "/post/$id", params: { id: prev.id } })}>
            Previous topic
          </button>
        ) : null}
        {next ? (
          <button type="button" className="btn" onClick={() => void navigate({ to: "/post/$id", params: { id: next.id } })}>
            Next topic
          </button>
        ) : null}
      </div>
      <p className="text-sm text-muted">
        {post.sample ? "Sample" : "Draft"} {index + 1} of {list.length}. Saving a post does not mark it read.
      </p>
    </article>
  );
}
