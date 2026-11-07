import { Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, ImageIcon, Share2, Volume2 } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { BionicText } from "@/components/bionic";
import {
  CONTENT_REVISION,
  claimById,
  publishedUrl,
  publicationLabel,
  isPublicExcerpt,
  publicAssetUrl,
  readerPost,
  reviewLabel,
  roleLabel,
  slideVisual,
  sourceById,
  sourceKindLabel,
  visualById,
  type ReaderPost,
  type ReaderSlide,
  type ReaderVisual,
} from "@/data/reader-bank";
import { localArticleHref } from "@/data/imported";
import { proposalAsReaderPost, proposalById } from "@/data/proposals";
import { armReturn, readStoredSlide, writeSlide } from "@/lib/place";
import { ReaderModal } from "@/components/reader-modal";
import { canSpeak, pauseSpeak, resumeSpeak, speakChunks, stopSpeak } from "@/lib/speak";
import { prefsCanPersist, usePrefs, usePrivate, type ReadingLayout, type Scale } from "@/lib/session";

const LAYOUTS: { id: ReadingLayout; label: string }[] = [
  { id: "auto", label: "Automatic" },
  { id: "deck", label: "Steps" },
  { id: "split", label: "Split view" },
  { id: "article", label: "Continuous article" },
];

export function PublishedCard({ post }: { post: ReaderPost }) {
  const focusId = `open-${post.id}`;
  return (
    <article className="post-row" id={`post-${post.id}`}>
      <img src="/media/mjb-emblem.jpg" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
      <div className="min-w-0 flex-1">
        <p className="m-0 flex flex-wrap items-center gap-1 text-sm">
          <span className="font-semibold text-ink">MJB ADHD</span>
          <span className="text-muted">{publicationLabel(post.editorial_state)}</span>
        </p>
        <h2 className="mb-1 mt-1 text-lg text-ink">
          <Link to="/post/$id" params={{ id: post.id }} className="text-ink" onClick={() => armReturn(focusId)}>
            {post.title}
          </Link>
        </h2>
        <p className="m-0 text-ink">{post.hook}</p>
        <p className="mb-0 mt-3">
          <Link id={focusId} to="/post/$id" params={{ id: post.id }} className="btn btn-primary" onClick={() => armReturn(focusId)}>
            Read explanation
          </Link>
        </p>
      </div>
    </article>
  );
}

function StepCopy({ slide, headingId }: { slide: ReaderSlide; headingId?: string }) {
  const bionic = usePrefs((state) => state.bionic);
  const qualification = slide.qualification ? (
    <p className="read-qual">
      <BionicText text={slide.qualification} on={bionic} />
      {slide.qualificationProvenance === "author-proposed" ? (
        <span className="mt-1 block text-sm text-muted">Author-supplied qualification. Not a quotation.</span>
      ) : null}
    </p>
  ) : null;
  return (
    <div className="read-copy">
      {slide.role ? <p className="kicker m-0">{roleLabel(slide.role)}</p> : null}
      <h2 id={headingId} className="mb-2 mt-1 font-serif text-3xl text-ink">
        {slide.heading}
      </h2>
      {slide.qualificationPlacement === "before" ? qualification : null}
      <p className="text m-0">
        <LinkedText text={slide.body} links={slide.inlineLinks} bionic={bionic} />
      </p>
      {slide.limitHeading ? <h3 className="mb-1 mt-4 font-serif text-2xl text-ink">{slide.limitHeading}</h3> : null}
      {slide.qualificationPlacement === "before" ? null : qualification}
    </div>
  );
}

function LinkedText({ text, links, bionic }: { text: string; links?: { phrase: string; href: string }[]; bionic: boolean }) {
  if (!links?.length) return <BionicText text={text} on={bionic} />;
  const ranges = links
    .map((link) => ({ ...link, at: text.indexOf(link.phrase) }))
    .filter((link) => link.at >= 0)
    .sort((a, b) => a.at - b.at);
  const parts: { text: string; href?: string }[] = [];
  let cursor = 0;
  for (const link of ranges) {
    if (link.at < cursor) continue;
    if (link.at > cursor) parts.push({ text: text.slice(cursor, link.at) });
    parts.push({ text: link.phrase, href: link.href });
    cursor = link.at + link.phrase.length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });
  return (
    <>
      {parts.map((part, index) =>
        part.href ? (
          <a key={`${part.href}-${index}`} href={part.href}>
            {part.text}
          </a>
        ) : (
          <BionicText key={index} text={part.text} on={bionic} />
        ),
      )}
    </>
  );
}

function GroupedSources({ links }: { links?: ReaderSlide["links"] }) {
  if (!links?.length) return null;
  const groups: { title: string; kind: string }[] = [
    { kind: "official", title: "Official requirements" },
    { kind: "controlled", title: "Controlled observations" },
    { kind: "observational", title: "Observational associations" },
    { kind: "scientific", title: "Scientific reference" },
    { kind: "editorial", title: "Editorial guidance" },
  ];
  const used = new Set<string>();
  return (
    <>
      {groups.map((group) => {
        const items = links.filter((link) => link.kind === group.kind);
        if (items.length === 0) return null;
        items.forEach((link) => used.add((link.href || "local") + link.label));
        const studyTypes: string[] = [];
        for (const item of items) {
          const studyType = item.studyType?.trim() || "";
          if (!studyTypes.includes(studyType)) studyTypes.push(studyType);
        }
        return (
          <section key={group.kind}>
            <h4 className="mb-1 mt-3 text-base">{group.title}</h4>
            {studyTypes.map((studyType) => (
              <div key={studyType || "unspecified"}>
                {studyType ? <p className="mb-1 mt-2 text-sm text-muted">{studyType}</p> : null}
                <ul>
                  {items
                    .filter((link) => (link.studyType?.trim() || "") === studyType)
                    .map((link) => (
                      <li key={(link.href || "local") + link.label}>
                        {link.href ? <a href={link.href}>{link.label}</a> : <span>{link.label}</span>}
                        {link.detail ? <span className="mt-1 block text-sm text-muted">{link.detail}</span> : null}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </section>
        );
      })}
      {links.some((link) => !used.has((link.href || "local") + link.label)) ? (
        <ul>
          {links
            .filter((link) => !used.has((link.href || "local") + link.label))
            .map((link) => (
              <li key={(link.href || "local") + link.label}>
                {link.href ? <a href={link.href}>{link.label}</a> : <span>{link.label}</span>}
                {link.detail ? <span className="mt-1 block text-sm text-muted">{link.detail}</span> : null}
              </li>
            ))}
        </ul>
      ) : null}
    </>
  );
}

function pathLabel(path: string): string {
  const [base, hash] = path.split("#");
  const segments = base.split("/").filter(Boolean);
  const named = segments.filter((part) => !/^f\d+$/i.test(part));
  const page = (named[named.length - 1] || "page").replace(/-/g, " ");
  const titled = page.replace(/\b\w/g, (letter) => letter.toUpperCase()).replace(/\bAdhd\b/g, "ADHD");
  const extra = segments.filter((part) => /^f\d+$/i.test(part)).map((part) => part.toUpperCase());
  const figure = hash ? hash.replace(/^fig-/, "").replace(/-/g, " ") : "";
  return [titled, ...extra, figure].filter(Boolean).join(", ");
}

/** Turns "See /science/…" notes into real destinations. The wording of the page is not rewritten. */
function DescriptionLinks({ text }: { text: string }) {
  const paths = (text.match(/\/[A-Za-z0-9][A-Za-z0-9\-._~/%#]*/g) ?? []).map((path) => path.replace(/[.,;:)]+$/g, ""));
  if (paths.length === 0) return <p>{text}</p>;
  return (
    <p>
      See{" "}
      {paths.map((path, index) => (
        <span key={path}>
          {index > 0 ? " and " : null}
          <a href={path}>{pathLabel(path)}</a>
        </span>
      ))}
      .
    </p>
  );
}

function Figure({ visual, onOpen }: { visual: ReaderVisual | undefined; onOpen: (id: string) => void }) {
  if (!visual) return null;
  const src = publicAssetUrl(visual.src);
  if (!src) return null;
  return (
    <figure className="read-visual panel">
      <img src={src} alt={visual.alt} />
      <figcaption>{visual.caption || visual.alt}</figcaption>
      <button type="button" className="btn" onClick={() => onOpen(visual.id)}>
        <ImageIcon aria-hidden="true" size={16} /> Open image
      </button>
    </figure>
  );
}

function EvidenceBody({ slide }: { slide: ReaderSlide }) {
  const claims = (slide.claim_refs ?? []).map((id) => claimById(id)).filter((claim) => claim !== undefined);
  const sources = (slide.source_refs ?? []).map((id) => sourceById(id)).filter((source) => source !== undefined);
  return (
    <>
      {slide.qualification ? <p>{slide.qualification}</p> : null}
      {claims.map((claim) => (
        <section key={claim.id}>
          <h3>{claim.wording}</h3>
          {claim.supportSummary ? <p>{claim.supportSummary}</p> : null}
          {claim.limitations ? <p>Limit: {claim.limitations}</p> : null}
          <p className="text-sm text-muted">{reviewLabel(claim.reviewStatus)}</p>
        </section>
      ))}
      <h3>Sources</h3>
      {slide.provenance ? <p>Provenance: {slide.provenance === "author-proposed" ? "Author-proposed wording. Not a quotation from the page." : slide.provenance === "verbatim" ? "Quotation from the published page." : slide.provenance}</p> : null}
      {slide.claimCategory ? <p>Claim category: {slide.claimCategory}</p> : null}
      {slide.sourceSection ? <p>Section: {slide.sourceSection}</p> : null}
      {slide.passageRef ? <p>Passage: {slide.passageRef}</p> : null}
      {slide.sourcePath ? (
        <p>
          <a href={slide.sourcePath}>Open the page this step comes from</a>
        </p>
      ) : null}
      {slide.evidenceNeeded ? <p>Still needed: {slide.evidenceNeeded}</p> : null}
      <GroupedSources links={slide.links} />
      {sources.length === 0 && !(slide.links && slide.links.length > 0) && !slide.sourcePath ? <p>No source is recorded for this step.</p> : null}
      <ul>
        {sources.map((source) => {
          const href = publishedUrl(source.url);
          return (
            <li key={source.id}>
              {href ? <a href={href}>{source.fullTitle}</a> : <span>{source.fullTitle}</span>}
              <span className="block text-sm text-muted">
                {[source.authorsOrIssuer, sourceKindLabel(source.sourceType || source.type), source.date].filter(Boolean).join(" · ")}
              </span>
              {source.verifiedLocator || slide.sourceLocator ? (
                <span className="block text-sm text-muted">Passage: {source.verifiedLocator || slide.sourceLocator}</span>
              ) : null}
              <span className="block text-sm text-muted">{reviewLabel("inherited")}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function TopicReader({ id, initialSlide }: { id: string; initialSlide?: number }) {
  const navigate = useNavigate();
  const bankPost = readerPost(id);
  const proposed = proposalById(id);
  const post = useMemo(
    () => bankPost ?? (proposed ? proposalAsReaderPost(proposed) : undefined),
    [bankPost, proposed],
  );
  const saved = usePrivate((state) => state.bookmarks.includes(id));
  const toggle = usePrivate((state) => state.toggleBookmark);
  const touchPlace = usePrivate((state) => state.touchPlace);
  const layout = usePrefs((state) => state.layout);
  const setLayout = usePrefs((state) => state.setLayout);
  const scale = usePrefs((state) => state.scale);
  const setScale = usePrefs((state) => state.setScale);
  const speechRate = usePrefs((state) => state.speechRate);
  const voiceURI = usePrefs((state) => state.voiceURI);
  const [index, setIndex] = useState(0);
  const [wide, setWide] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [evidenceSlide, setEvidenceSlide] = useState<ReaderSlide | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [split, setSplit] = useState(42);
  const [status, setStatus] = useState("");
  const [speech, setSpeech] = useState<"idle" | "playing" | "paused">("idle");
  const [shareHref, setShareHref] = useState("");
  const optionsTitle = useId();
  const evidenceTitle = useId();
  const imageTitle = useId();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bankPost) touchPlace(id);
    setPinnedId(null);
  }, [id, touchPlace, bankPost]);

  useEffect(() => {
    const bar = barRef.current;
    const column = bar?.closest(".column");
    if (!bar || !(column instanceof HTMLElement)) return;
    const apply = () => {
      const rect = column.getBoundingClientRect();
      bar.style.left = `${rect.left}px`;
      bar.style.width = `${rect.width}px`;
      bar.style.right = "auto";
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(column);
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, [id]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const apply = () => setWide(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const slideChoice = useRef<string>("");

  useEffect(() => {
    if (!post) return;
    const key = `${post.id}:${initialSlide ?? "stored"}`;
    if (slideChoice.current === key) return;
    slideChoice.current = key;
    const explicit = typeof initialSlide === "number" && initialSlide >= 1 && initialSlide <= post.slides.length;
    if (explicit) {
      const next = initialSlide - 1;
      setIndex(next);
      writeSlide(post.id, next);
      return;
    }
    const stored = readStoredSlide(post.id, post.slides.length);
    if (stored === null) {
      setIndex(0);
      return;
    }
    setIndex(stored);
    void navigate({ to: "/post/$id", params: { id: post.id }, search: { slide: stored + 1 }, replace: true });
  }, [initialSlide, post, id, navigate]);

  useEffect(() => {
    stopSpeak();
    setSpeech("idle");
    setStatus((current) =>
      current.startsWith("Reading this step") || current.startsWith("Finished reading") || current.startsWith("Listening stopped") || current.startsWith("Paused") || current.startsWith("Stopped")
        ? ""
        : current,
    );
  }, [index, id]);

  useEffect(() => () => stopSpeak(), []);

  if (!post) {
    return (
      <div className="px-4 py-6">
        <h1>That post is not in this preview.</h1>
        <Link to="/" className="btn">
          Home
        </Link>
      </div>
    );
  }

  const slides = post.slides;
  const slide = slides[Math.min(index, slides.length - 1)];
  const enlarged = scale >= 1.5;
  const mode = layout === "auto" ? (wide && !enlarged ? "split" : "deck") : layout;
  const articleHref = localArticleHref(post.articleUrl);
  const stepVisual = slideVisual(slide, post);
  const shownVisual = pinnedId ? visualById(pinnedId) : stepVisual;
  const hasVisual = Boolean(shownVisual && publicAssetUrl(shownVisual.src));
  const dialogVisual = imageId ? visualById(imageId) : undefined;
  const dialogSrc = dialogVisual ? publicAssetUrl(dialogVisual.src) : "";

  const remember = (choice: ReadingLayout | Scale, kind: "layout" | "scale") => {
    if (kind === "layout") setLayout(choice as ReadingLayout);
    else setScale(choice as Scale);
    if (!prefsCanPersist()) setStatus("Your changes work for this visit, but this browser could not save them.");
  };

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, next));
    setIndex(clamped);
    writeSlide(post.id, clamped);
    void navigate({ to: "/post/$id", params: { id: post.id }, search: { slide: clamped + 1 }, replace: true });
    if (mode === "article") {
      window.requestAnimationFrame(() => {
        document.getElementById(slides[clamped].id)?.scrollIntoView({ block: "start" });
      });
    }
  };

  const share = () => {
    const url = new URL(`/post/${post.id}`, window.location.origin);
    url.searchParams.set("slide", String(index + 1));
    const href = url.toString();
    setShareHref(href);
    const copy = () =>
      navigator.clipboard?.writeText(href).then(
        () => setStatus("Link copied for this step."),
        () => setStatus("Could not copy the link. Select it below."),
      );
    if (typeof navigator.share !== "function") {
      void copy();
      return;
    }
    void navigator.share({ title: post.title, url: href }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      void copy();
    });
  };

  const stopListening = () => {
    stopSpeak();
    setSpeech("idle");
    setStatus("Stopped.");
  };

  const listen = () => {
    if (speech === "playing") {
      if (pauseSpeak()) {
        setSpeech("paused");
        setStatus("Paused. Resume continues this step. Stop ends it.");
        return;
      }
      stopListening();
      setStatus("Pause is not available here, so reading stopped.");
      return;
    }
    if (speech === "paused") {
      if (resumeSpeak()) {
        setSpeech("playing");
        setStatus("Reading this step aloud. It stops if you change step.");
        return;
      }
      stopListening();
      setStatus("Could not resume, so reading stopped.");
      return;
    }
    if (!canSpeak()) {
      setSpeech("idle");
      setStatus("Listening is not available in this browser.");
      return;
    }
    const text = `${slide.heading}. ${slide.body}${slide.qualification ? ` ${slide.qualification}` : ""}`;
    const started = speakChunks(text, speechRate, {
      voiceURI,
      onend: () => {
        setSpeech("idle");
        setStatus("Finished reading this step.");
      },
      onerror: () => {
        setSpeech("idle");
        setStatus("Listening stopped before it finished.");
      },
    });
    if (!started) {
      setSpeech("idle");
      setStatus("Listening is not available in this browser.");
      return;
    }
    setSpeech("playing");
    setStatus("Reading this step aloud. It stops if you change step. Voices come from this device and are not a translation.");
  };

  const openImage = (visualId: string) => {
    setZoom(1);
    setImageId(visualId);
  };

  const pinnedVisual = pinnedId ? visualById(pinnedId) : undefined;
  const pinnedSrc = pinnedVisual ? publicAssetUrl(pinnedVisual.src) : "";
  const pinControls = (
    <div className="pinned-kept">
      {pinnedVisual && pinnedSrc ? (
        <figure className="pinned-figure pinned-inline">
          <img src={pinnedSrc} alt={pinnedVisual.alt} />
          <figcaption className="text-sm text-muted">Pinned: {pinnedVisual.caption || pinnedVisual.alt}</figcaption>
          <button type="button" className="btn" onClick={() => setPinnedId(null)}>
            Unpin image
          </button>
        </figure>
      ) : null}
      {stepVisual && pinnedId !== stepVisual.id ? (
        <button type="button" className="btn" onClick={() => setPinnedId(stepVisual.id)}>
          Keep this image
        </button>
      ) : null}
    </div>
  );

  return (
    <article className="read-page" data-layout={mode} data-has-visual={hasVisual ? "1" : "0"} data-scale={String(scale)} style={{ ["--split-share" as string]: `${split}%` }}>
      <header className="read-head">
        <p className="kicker m-0">{publicationLabel(post.editorial_state)}</p>
        <h1 className="mb-1 mt-1 font-serif text-4xl text-ink">{post.title}</h1>
        <p className="m-0 text-muted">{post.hook}</p>
        {post.editorial_state === "merged-into-help" ? (
          <p className="mt-2 text-sm">Merged into the rights guides. This page keeps the origin of those sentences. It is not a finished standalone explanation.</p>
        ) : !isPublicExcerpt(post.editorial_state) ? (
          <p className="mt-2 text-sm">{post.primary_topic}</p>
        ) : null}
        <div className="read-tools">
          <button type="button" className="btn" onClick={() => setOptionsOpen(true)}>
            Reader options
          </button>
          <button
            type="button"
            className="btn"
            aria-pressed={saved}
            onClick={() => {
              toggle(post.id);
              setStatus(saved ? "Removed from saved on this device." : "Saved on this device. This does not mark it as read.");
            }}
          >
            <Bookmark aria-hidden="true" size={16} /> {saved ? "Saved" : "Save"}
          </button>
          <button type="button" className="btn" onClick={share}>
            <Share2 aria-hidden="true" size={16} /> Share
          </button>
          <button type="button" className="btn" aria-pressed={speech === "playing"} onClick={listen}>
            <Volume2 aria-hidden="true" size={16} /> {speech === "playing" ? "Pause" : speech === "paused" ? "Resume" : "Listen"}
          </button>
          {speech !== "idle" ? (
            <button type="button" className="btn" onClick={stopListening}>
              Stop
            </button>
          ) : null}
          <a className="btn" href="/settings">Listening preferences</a>
          <button type="button" className="btn" onClick={() => window.print()}>
            Print or save as PDF
          </button>
        </div>
        <p className="m-0 text-sm text-muted">Prints the text and captions. Diagrams are not embedded, and the file is not a tagged PDF.</p>
        <p className="read-status" role="status">
          {status}
        </p>
        {shareHref ? (
          <p className="text-sm">
            <a href={shareHref}>{shareHref}</a>
          </p>
        ) : null}
      </header>

      <p className="sr-only" aria-live="polite">
        {slide.heading}. Step {index + 1} of {slides.length}
      </p>

      <div ref={barRef} className="read-stepbar" aria-label="Steps">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0}>
          Previous
        </button>
        <p>
          Step {index + 1} of {slides.length}
        </p>
        <button type="button" onClick={() => go(index + 1)} disabled={index >= slides.length - 1}>
          Next
        </button>
      </div>

      {mode === "article" ? (
        <div className="read-article">
          {slides.map((item, itemIndex) => {
            const visual = slideVisual(item, post);
            return (
              <section key={item.id} id={item.id} className={itemIndex === index ? "is-current" : undefined}>
                <StepCopy slide={item} headingId={itemIndex === index ? "step-title" : undefined} />
                <Figure visual={visual} onOpen={openImage} />
                <div className="read-tools">
                  <button type="button" className="btn" onClick={() => setEvidenceSlide(item)}>
                    Evidence and sources
                  </button>
                  {articleHref ? (
                    <a className="btn" href={articleHref}>
                      Read the full article
                    </a>
                  ) : null}
                  {itemIndex === index ? pinControls : null}
                </div>
              </section>
            );
          })}
          {index >= slides.length - 1 ? (
            <p className="text-sm text-muted">You have reached the end of this explanation.</p>
          ) : null}
        </div>
      ) : (
        <div className={mode === "split" && hasVisual ? "read-split" : "read-deck"}>
          {mode === "split" && hasVisual ? <Figure visual={shownVisual} onOpen={openImage} /> : null}
          <div className="read-explain">
            <StepCopy slide={slide} headingId="step-title" />
            <div className="read-tools">
              <button type="button" className="btn" onClick={() => setEvidenceSlide(slide)}>
                Evidence and sources
              </button>
              {articleHref ? (
                <a className="btn" href={articleHref}>
                  Read the full article
                </a>
              ) : null}
              {pinControls}
            </div>
            {mode === "split" && hasVisual && wide && !enlarged ? (
              <div className="read-tools">
                <label className="text-sm">
                  Split position
                  <input type="range" min={25} max={70} value={split} onChange={(event) => setSplit(Number(event.target.value))} />
                </label>
                <button type="button" className="btn" onClick={() => setSplit(42)}>
                  Reset split
                </button>
              </div>
            ) : null}
            {index >= slides.length - 1 ? <p className="text-sm text-muted">You have reached the end of this explanation.</p> : null}
          </div>
          {mode !== "split" && hasVisual ? <Figure visual={shownVisual} onOpen={openImage} /> : null}
        </div>
      )}

      <div className="print-excerpt">
        <p>Text explanation with captions. Diagrams are not embedded. This printout is not a tagged PDF.</p>
        <p>{publicationLabel(post.editorial_state)} · {CONTENT_REVISION}</p>
        <h1>{post.title}</h1>
        {post.hook ? <p>{post.hook}</p> : null}
        {articleHref ? <p>Full article: {articleHref}</p> : null}
        {slides.map((item) => {
          const visual = slideVisual(item, post);
          return (
            <section key={item.id}>
              <h2>
                Step {item.order} of {slides.length}. {item.heading}
              </h2>
              <p>{item.body}</p>
              {item.qualification ? <p>{item.qualification}</p> : null}
              {visual?.caption ? <p>Figure: {visual.caption}</p> : null}
              <div className="print-sources">
                <h3>Sources</h3>
                <ul>
                {(item.links ?? []).map((link) => (
                  <li key={(link.href || "local") + link.label}>
                    {link.label}
                    {link.studyType ? ` — ${link.studyType}` : ""}
                    {link.href ? ` — ${link.href}` : ""}
                  </li>
                ))}
                {(item.source_refs ?? []).map((sourceId) => {
                  const source = sourceById(sourceId);
                  if (!source) return null;
                  return (
                    <li key={source.id}>
                      {source.fullTitle}
                      {source.url ? ` — ${publishedUrl(source.url)}` : ""}
                    </li>
                  );
                })}
              </ul>
              </div>
            </section>
          );
        })}
      </div>

      <ReaderModal open={optionsOpen} labelledBy={optionsTitle} onClose={() => setOptionsOpen(false)}>
        <h2 id={optionsTitle}>Reader options</h2>
        <p>These choices are saved in this browser. You can change them at any time.</p>
        <fieldset>
          <legend>Reading layout</legend>
          {LAYOUTS.map((choice) => (
            <label key={choice.id}>
              <input
                type="radio"
                name="layout"
                checked={layout === choice.id}
                onChange={() => {
                  remember(choice.id, "layout");
                  setOptionsOpen(false);
                }}
              />
              {choice.label}
            </label>
          ))}
          <p className="m-0 text-sm text-muted">Automatic uses Steps on a phone and Split view on a wide window. Swipe is not part of this reader.</p>
        </fieldset>
        <fieldset>
          <legend>Reading text size</legend>
          {([1, 1.25, 1.5, 2] as const).map((choice) => (
            <button key={choice} type="button" className="btn" aria-pressed={scale === choice} onClick={() => remember(choice, "scale")}>
              {Math.round(choice * 100)}%
            </button>
          ))}
        </fieldset>
        <button type="button" className="btn btn-primary" onClick={() => setOptionsOpen(false)}>
          Close
        </button>
      </ReaderModal>

      <ReaderModal open={Boolean(evidenceSlide)} labelledBy={evidenceTitle} onClose={() => setEvidenceSlide(null)}>
        <h2 id={evidenceTitle}>Evidence and sources</h2>
        {evidenceSlide ? <EvidenceBody slide={evidenceSlide} /> : null}
        <button type="button" className="btn btn-primary" onClick={() => setEvidenceSlide(null)}>
          Close
        </button>
      </ReaderModal>

      <ReaderModal open={Boolean(dialogSrc)} labelledBy={imageTitle} onClose={() => setImageId(null)}>
        <h2 id={imageTitle}>{dialogVisual?.caption || "Image"}</h2>
        {dialogVisual?.longDescription ? <DescriptionLinks text={dialogVisual.longDescription} /> : null}
        <div className="read-zoom">
          {dialogSrc ? <img src={dialogSrc} alt={dialogVisual?.alt || ""} data-zoom={String(zoom)} /> : null}
        </div>
        <div className="read-tools">
          <button type="button" className="btn" onClick={() => setZoom(1)}>
            Fit
          </button>
          <button type="button" className="btn" onClick={() => setZoom((value) => Math.min(3, value + 0.5))}>
            Zoom in
          </button>
          <button type="button" className="btn" onClick={() => setZoom((value) => Math.max(1, value - 0.5))}>
            Zoom out
          </button>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setImageId(null)}>
          Close
        </button>
      </ReaderModal>
    </article>
  );
}
