import { Link } from "@tanstack/react-router";
import { createElement, useEffect, useId, useState, type MouseEvent, type ReactNode } from "react";
import { BionicText } from "@/components/bionic";
import { ContactForm } from "@/components/contact-form";
import { ReaderModal } from "@/components/reader-modal";
import { linksFor } from "@/config/links";
import { GUIDE_ALIASES, type ArticleMeta, type Markup, normalizePath } from "@/data/imported";
import { canSpeak, speakChunks, stopSpeak } from "@/lib/speak";
import { useHydrated, usePrefs, usePrivate } from "@/lib/session";

const TAGS = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "figure", "figcaption", "img", "a", "blockquote", "details", "summary", "dl", "dt", "dd", "section", "div", "span",
  "strong", "em", "b", "i", "small", "sup", "sub", "br", "time", "caption", "abbr", "code", "pre", "button", "form",
  "label", "input", "textarea", "select", "option", "fieldset", "legend", "article", "hr", "picture", "source",
  "video", "audio", "colgroup", "col", "nav", "aside", "header", "footer", "address", "cite", "mark", "q", "kbd", "s", "u",
]);
const VOID = new Set(["img", "input", "br", "hr", "source", "col"]);
const PROSE = new Set(["p", "li", "blockquote", "figcaption", "dd", "td", "th"]);

type SrcLink = { href: string; text: string };
type EvidenceInfo = { label: string; aria: string; ids: string[]; links: SrcLink[]; confidence: string };
type ZoomImage = { src: string; alt: string; caption: string };
type Actions = {
  bionic: boolean;
  imageCount: { n: number };
  openImage: (image: ZoomImage) => void;
  openEvidence: (info: EvidenceInfo) => void;
  skipFirstH1: boolean;
  skippedH1: { done: boolean };
};

function safeUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("/") || value.startsWith("#") || value.startsWith("mailto:") || value.startsWith("tel:") || value.startsWith("sms:")) return value;
  if (value.startsWith("https://") || value.startsWith("http://")) return value;
  return undefined;
}

function textOf(node: Markup): string {
  if (typeof node === "string") return node;
  return (node.c ?? []).map(textOf).join("");
}

function findTag(node: Markup, tag: string): Markup | undefined {
  if (typeof node === "string") return undefined;
  if (node.t === tag) return node;
  for (const child of node.c ?? []) {
    const found = findTag(child, tag);
    if (found) return found;
  }
  return undefined;
}

function collectRefs(node: Markup, into: SrcLink[]) {
  if (typeof node === "string") return;
  const classes = (node.a?.class ?? "").split(/\s+/);
  if (node.t === "a" && classes.includes("ref")) {
    const href = safeUrl(node.a?.href);
    if (href) into.push({ href, text: textOf(node).trim() || href });
  }
  for (const child of node.c ?? []) collectRefs(child, into);
}

function classList(value: string | undefined): string[] {
  return (value ?? "").split(/\s+/).filter(Boolean);
}

function renderMarkup(node: Markup, key: string, actions: Actions, claimLinks?: SrcLink[]): ReactNode {
  if (typeof node === "string") {
    return node;
  }
  if (actions.skipFirstH1 && node.t === "h1" && !actions.skippedH1.done) {
    actions.skippedH1.done = true;
    return null;
  }
  const attrs = node.a ?? {};
  const classes = classList(attrs.class);
  const claim = node.t === "div" && classes.includes("claim");
  const links = claim ? (() => { const found: SrcLink[] = []; collectRefs(node, found); return found; })() : claimLinks;
  const children = (node.c ?? []).map((child, index) => {
    if (typeof child === "string" && actions.bionic && PROSE.has(node.t)) {
      return createElement(BionicText, { key: `${key}-${index}`, text: child, on: true });
    }
    return renderMarkup(child, `${key}-${index}`, actions, links);
  });
  if (node.t === "dialog") {
    return createElement("div", { key, className: ["imported-notice", attrs.class].filter(Boolean).join(" "), role: "region", id: attrs.id }, ...children);
  }
  const tag = TAGS.has(node.t) ? node.t : "span";
  const props: Record<string, unknown> = { key };
  if (attrs.id) props.id = attrs.id;
  if (attrs.class) props.className = attrs.class;
  if (attrs.title) props.title = attrs.title;
  if (attrs.role) props.role = attrs.role;
  if (attrs.lang) props.lang = attrs.lang;
  if (attrs["aria-label"]) props["aria-label"] = attrs["aria-label"];
  if (attrs["aria-labelledby"]) props["aria-labelledby"] = attrs["aria-labelledby"];
  if (attrs["aria-describedby"]) props["aria-describedby"] = attrs["aria-describedby"];
  if (attrs["aria-controls"]) props["aria-controls"] = attrs["aria-controls"];
  if (attrs["aria-expanded"]) props["aria-expanded"] = attrs["aria-expanded"] === "true";
  if (attrs["aria-current"]) props["aria-current"] = attrs["aria-current"];
  if (attrs["aria-hidden"] === "true" || attrs["aria-hidden"] === "false") props["aria-hidden"] = attrs["aria-hidden"] === "true";
  if (attrs["data-node"]) props["data-node"] = attrs["data-node"];
  if (attrs["data-guide-layer"]) props["data-guide-layer"] = attrs["data-guide-layer"];
  if (attrs.hidden === "true") props.hidden = true;

  if (tag === "button" && classes.includes("chip")) {
    const ids = (attrs["data-srcs"] ?? "").split(",").map((item) => item.trim()).filter(Boolean);
    const label = (node.c ?? []).map((part) => textOf(part).trim()).filter(Boolean).join(" ");
    const info: EvidenceInfo = {
      label,
      aria: attrs["aria-label"] || label || "Show sources",
      ids,
      links: links ?? [],
      confidence: (attrs["data-conf"] ?? "").trim(),
    };
    return createElement(
      "button",
      {
        key,
        type: "button",
        className: attrs.class || "chip",
        "aria-label": info.aria,
        onClick: () => actions.openEvidence(info),
      },
      ...children,
    );
  }
  if (tag === "button" && attrs["data-close"] !== undefined) {
    props.type = "button";
    props.onClick = (event: MouseEvent<HTMLButtonElement>) => {
      event.currentTarget.closest(".imported-notice")?.setAttribute("hidden", "");
    };
  } else if (tag === "button" && attrs.type) {
    props.type = attrs.type;
  }
  if (tag === "a") {
    const href = safeUrl(attrs.href);
    props.href = href;
    if (href && !href.startsWith("/") && !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
      props.rel = attrs.rel || "noopener";
    }
    if (attrs.target === "_blank") props.target = "_blank";
  } else if (tag === "img") {
    props.src = safeUrl(attrs.src);
    props.alt = attrs.alt ?? "";
    if (attrs.width) props.width = attrs.width;
    if (attrs.height) props.height = attrs.height;
    props.loading = actions.imageCount.n++ === 0 ? "eager" : attrs.loading || "lazy";
  } else if (tag === "source") {
    const src = safeUrl(attrs.src);
    if (src) props.src = src;
    if (attrs.srcset) props.srcSet = attrs.srcset;
    if (attrs.type) props.type = attrs.type;
    if (attrs.media) props.media = attrs.media;
    if (attrs.sizes) props.sizes = attrs.sizes;
  } else if (tag === "form" && attrs.name === "contact") {
    return createElement(ContactForm, { key, className: attrs.class, children });
  } else if (tag === "label") {
    if (attrs.for) props.htmlFor = attrs.for;
  } else if (tag === "td" || tag === "th") {
    if (attrs.colspan) props.colSpan = Number(attrs.colspan);
    if (attrs.rowspan) props.rowSpan = Number(attrs.rowspan);
    if (attrs.scope) props.scope = attrs.scope;
    if (attrs.headers) props.headers = attrs.headers;
  } else if (tag === "time" && attrs.datetime) {
    props.dateTime = attrs.datetime;
  } else if (tag === "ol" && attrs.start) {
    props.start = Number(attrs.start);
  } else if (tag === "video" || tag === "audio") {
    if (attrs.controls === "true") props.controls = true;
    const src = safeUrl(attrs.src);
    if (src) props.src = src;
    if (attrs.poster) props.poster = safeUrl(attrs.poster);
  } else if (tag === "input" || tag === "textarea" || tag === "select" || tag === "option") {
    if (attrs.name) props.name = attrs.name;
    if (attrs.type) props.type = attrs.type;
    if (attrs.placeholder) props.placeholder = attrs.placeholder;
    if (attrs.value) props.defaultValue = attrs.value;
    if (attrs.disabled === "true") props.disabled = true;
    if (attrs.required === "true") props.required = true;
    if (attrs.autocomplete) props.autoComplete = attrs.autocomplete;
    if (attrs.rows) props.rows = Number(attrs.rows);
    if (attrs.tabindex) props.tabIndex = Number(attrs.tabindex);
    if (attrs.name === "bot-field") {
      props.autoComplete = "off";
      props.tabIndex = -1;
    }
    if (tag === "input" && attrs.id === "cf-name") props.autoComplete = "name";
    if (tag === "input" && attrs.id === "cf-email") props.autoComplete = "email";
    if (tag === "textarea" && attrs.name === "message" && !attrs.rows) props.rows = 7;
  } else if (tag === "details" && attrs.open === "true") {
    props.open = true;
  } else if (tag === "figure") {
    const image = findTag(node, "img");
    const caption = findTag(node, "figcaption");
    const src = safeUrl(image && typeof image !== "string" ? image.a?.src : undefined);
    const button = src
      ? createElement(
          "button",
          {
            type: "button",
            className: "btn",
            onClick: () =>
              actions.openImage({
                src,
                alt: image && typeof image !== "string" ? image.a?.alt ?? "" : "",
                caption: caption ? textOf(caption).replace(/\s+/g, " ").trim() : "",
              }),
          },
          "Open image",
        )
      : null;
    return createElement(tag, props, ...children, button);
  }
  if (VOID.has(tag)) return createElement(tag, props);
  return createElement(tag, props, ...children);
}

export function ArticleScreen({ article, body, embed }: { article: ArticleMeta; body: Markup; embed?: "contact" }) {
  const saved = usePrivate((state) => state.bookmarks.includes(article.id));
  const toggle = usePrivate((state) => state.toggleBookmark);
  const hydrated = useHydrated();
  const speechRate = usePrefs((state) => state.speechRate);
  const voiceURI = usePrefs((state) => state.voiceURI);
  const bionic = usePrefs((state) => state.bionic);
  const [back, setBack] = useState("/explore");
  const [zoom, setZoom] = useState<ZoomImage | null>(null);
  const [zoomLevel, setZoomLevel] = useState("1.5");
  const [pinned, setPinned] = useState<ZoomImage | null>(null);
  const [evidence, setEvidence] = useState<EvidenceInfo | null>(null);
  const [listenStatus, setListenStatus] = useState("");
  const zoomTitle = useId();
  const evidenceTitle = useId();

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#\/n\/([a-z0-9-]+)/);
    if (match) {
      const dest = GUIDE_ALIASES[match[1]];
      if (dest && normalizePath(dest) !== normalizePath(article.path)) {
        window.location.assign(dest.startsWith("#") ? `/guide/${dest}` : dest);
        return;
      }
    }
    const placeHash = hash.startsWith("#") && !match ? hash : "";
    if (placeHash) {
      const target = document.getElementById(placeHash.slice(1));
      target?.scrollIntoView({ block: "start" });
    }
    try {
      const raw = sessionStorage.getItem("mjb-return");
      if (!raw) return;
      const place = JSON.parse(raw) as { path?: string; search?: string };
      if (place?.path && place.path !== window.location.pathname) setBack(`${place.path}${place.search || ""}`);
    } catch {
      /* the library link still works */
    }
  }, [article.path]);

  useEffect(() => {
    stopSpeak();
    setListenStatus("");
    setPinned(null);
    return () => stopSpeak();
  }, [article.id]);

  function listen() {
    if (listenStatus.startsWith("Reading")) {
      stopSpeak();
      setListenStatus("");
      return;
    }
    const spoken = (article.text || textOf(body)).replace(/\s+/g, " ").trim();
    if (!canSpeak() || !spoken) {
      setListenStatus("Listening is not available in this browser.");
      return;
    }
    const started = speakChunks(spoken, speechRate, {
      voiceURI,
      onend: () => setListenStatus("Finished reading this page."),
      onerror: () => setListenStatus("Listening stopped before it finished."),
    });
    setListenStatus(started ? "Reading this page." : "Listening is not available in this browser.");
  }

  const root = typeof body !== "string" && body.t === "main" ? body : null;
  const nodes: Markup[] = root ? root.c ?? [] : [body];
  const bodyId = root?.a?.id && root.a.id !== "main" ? root.a.id : undefined;
  const actions: Actions = {
    bionic,
    imageCount: { n: 0 },
    openImage: (image) => {
      setZoom(image);
      setZoomLevel("1.5");
    },
    openEvidence: setEvidence,
    skipFirstH1: embed === "contact" || article.id === "RT-contact-thanks",
    skippedH1: { done: false },
  };
  const crumbs = article.originalPath.split("/").filter(Boolean);
  const pathway = normalizePath(article.path) === "/science/pathway";

  return (
    <article className="imported-article px-4 py-4" data-status={article.status}>
      {article.id === "RT-contact-thanks" ? (
        <div className="mb-4">
          <h1 className="font-serif text-3xl text-ink">This address does not send a message</h1>
          <p>Opening this page does not mean a message was sent, and it does not send one.</p>
        </div>
      ) : null}
      <div className="article-layout" data-pinned={pinned ? "1" : "0"}>
        {pinned ? (
          <details className="pinned-figure" open>
            <summary>Kept image</summary>
            <img src={pinned.src} alt={pinned.alt} />
            <p className="mb-2 text-sm">Pinned: {pinned.caption || pinned.alt}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn" onClick={() => { setZoom(pinned); setZoomLevel("1.5"); }}>Open image</button>
              <button type="button" className="btn" onClick={() => setPinned(null)}>Unpin image</button>
            </div>
          </details>
        ) : null}
        <div className="article-tools no-print mb-3 flex flex-wrap gap-2">
          <a className="btn" href={back}>Back</a>
          <button type="button" className="btn" aria-pressed={hydrated && saved} onClick={() => toggle(article.id)}>
            {hydrated && saved ? "Saved — remove" : "Save this page"}
          </button>
          <button type="button" className="btn" onClick={listen}>
            {listenStatus.startsWith("Reading") ? "Stop listening" : "Listen to this page"}
          </button>
        </div>
        <div className="article-column">
      <p className="read-status" role="status">{listenStatus}</p>
      <details className="mb-3 text-sm text-muted">
        <summary>About reading this page</summary>
        <p>This page is one continuous article. Steps and split are for the short explanations, which were written as a finite set of steps. Saving does not mark this page as read. Listening uses a voice on this device. Some voices use an online service.</p>
        {pathway ? (
          <p>The coloured pathway map on the published site is drawn by a script. That script is not copied here. The text steps are the same pathway, in reading order. Choosing a step name scrolls to that step.</p>
        ) : null}
      </details>
      {normalizePath(article.path).startsWith("/rights/") ? (
        <section id="about-these-guides" className="about-guides">
          <h2>About these guides</h2>
          <p>This page is general information, not legal advice.</p>
          <p>Claims are dated, jurisdiction-limited where relevant, and should be corrected when stronger evidence changes the conclusion.</p>
          <p className="mb-0 text-sm text-muted">
            These two sentences are reviewed proposal MJB-D000006, merged here from “Scope of this guidance”. The date and the nation labels stay on the page. This is not a new legal finding.
          </p>
        </section>
      ) : null}
      {embed === "contact" ? <ContactChannels /> : null}
      {embed !== "contact" && crumbs.length > 0 ? (
        <p className="mb-2 text-sm text-muted">
          <Link to="/">Home</Link>
          {crumbs.map((part, index) => {
            const href = `/${crumbs.slice(0, index + 1).join("/")}/`;
            return (
              <span key={href}>
                {" / "}
                {index === crumbs.length - 1 ? <span>{article.title}</span> : <a href={href}>{part.replace(/-/g, " ")}</a>}
              </span>
            );
          })}
        </p>
      ) : null}
      <div
        className={root?.a?.class ? `imported-body ${root.a.class}` : "imported-body"}
        id={bodyId}
        onClick={(event) => {
          const target = event.target;
          if (!(target instanceof Element)) return;
          const node = target.closest("[data-node]");
          const id = node?.getAttribute("data-node");
          if (!id) return;
          document.getElementById(`n-${id}`)?.scrollIntoView({ block: "start" });
        }}
      >
        {nodes.map((node, index) => renderMarkup(node, `${article.id}-${index}`, actions))}
      </div>
      {normalizePath(article.path) === "/guide" ? <GuideIndex /> : null}
      <p className="mt-6 text-sm text-muted">
        Inherited from the published site at commit {article.commit.slice(0, 12)}. Not independently re-checked.{" "}
        <a href={`https://mjb-adhd.org.uk${article.originalPath}`}>Original page</a>
      </p>
        </div>
      </div>
      <ReaderModal open={Boolean(zoom)} labelledBy={zoomTitle} onClose={() => setZoom(null)}>
        <h2 id={zoomTitle} className="text-xl">Enlarged image</h2>
        <p className="text-sm">{zoom?.caption || zoom?.alt || "Figure from this page."}</p>
        {zoom ? (
          <div className="read-zoom">
            <img src={zoom.src} alt={zoom.alt} data-zoom={zoomLevel} />
          </div>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-2">
          {["1", "1.5", "2", "3"].map((level) => (
            <button key={level} type="button" className="btn" aria-pressed={zoomLevel === level} onClick={() => setZoomLevel(level)}>
              {level}×
            </button>
          ))}
          {zoom && pinned?.src === zoom.src ? (
            <button type="button" className="btn" onClick={() => setPinned(null)}>Unpin image</button>
          ) : (
            <button type="button" className="btn" onClick={() => zoom && setPinned(zoom)}>Keep this image</button>
          )}
          <button type="button" className="btn btn-primary" onClick={() => setZoom(null)}>Close</button>
        </div>
      </ReaderModal>
      <ReaderModal open={Boolean(evidence)} labelledBy={evidenceTitle} onClose={() => setEvidence(null)}>
        <h2 id={evidenceTitle} className="text-xl">{evidence?.label || "Sources"}</h2>
        <p className="text-sm">{evidence?.aria}</p>
        {evidence?.confidence ? <p>Confidence recorded on the page: {evidence.confidence}</p> : null}
        {evidence && evidence.links.length > 0 ? (
          <>
            <p>Source links already on this claim. Nothing was added.</p>
            <ul>
              {evidence.links.map((link) => (
                <li key={`${link.href}-${link.text}`}>
                  <a href={link.href}>{link.text}</a>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {evidence && evidence.ids.length > 0 ? <p>Source ids on this control: {evidence.ids.join(", ")}</p> : null}
        {evidence && evidence.links.length === 0 && evidence.ids.length === 0 ? (
          <p>No source is attached to this label on the page.</p>
        ) : null}
        <button type="button" className="btn btn-primary" onClick={() => setEvidence(null)}>Close</button>
      </ReaderModal>
    </article>
  );
}

function ContactChannels() {
  const items = linksFor("main");
  const evidence = linksFor("evidence");
  return (
    <div className="mb-4">
      <h1 className="font-serif text-3xl text-ink">Follow & contact</h1>
      <p>Follow MJB or get in touch by email. Messages are not monitored for urgent help.</p>
      <ul className="m-0 list-none p-0">
        {items.map((item) => (
          <li key={item.id} className="border-b border-line py-3">
            <a href={item.href}>
              {item.label}
              <span className="mt-1 block text-sm text-muted">{item.handle}</span>
            </a>
          </li>
        ))}
      </ul>
      {evidence.length > 0 ? (
        <>
          <h2 className="text-xl">Evidence playlist</h2>
          <ul className="m-0 list-none p-0">
            {evidence.map((item) => (
              <li key={item.id} className="border-b border-line py-3">
                <a href={item.href}>
                  {item.handle}
                  <span className="mt-1 block text-sm text-muted">A playlist, not the channel homepage.</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <p className="text-sm text-muted">Personal accounts are not listed. Danger: <a href="tel:999">999</a>. Urgent: <a href="tel:111">NHS 111</a>. Samaritans: <a href="tel:116123">116 123</a>.</p>
    </div>
  );
}

function GuideIndex() {
  const entries = Object.entries(GUIDE_ALIASES).sort((a, b) => a[0].localeCompare(b[0]));
  return (
    <section className="mt-6">
      <h2>Guide pages in this preview</h2>
      <p>The interactive guide’s hash links open the static reading page for that node. This preview does not load the old guide script.</p>
      <ul>
        {entries.map(([id, href]) => (
          <li key={id}>
            <a href={href.startsWith("#") ? `/guide/${href}` : href}>{id.replace(/-/g, " ")}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MissingPage() {
  return (
    <div className="px-4 py-6">
      <h1 className="font-serif text-3xl">That page is not in this preview.</h1>
      <p>The address does not match one of the published pages copied into this preview.</p>
      <p>
        <Link to="/" className="btn">Home</Link>{" "}
        <Link to="/explore" search={{ topic: "", q: "" }} className="btn">Library</Link>
      </p>
    </div>
  );
}
