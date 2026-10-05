/*
 * OPTIONAL FEATURE: Markdown for AI agents.
 * Self-contained: this file plus the turndown dependencies in package.json.
 * To remove it, delete this file (and the two dependencies). Nothing else uses it.
 *
 * When a GET or HEAD request explicitly accepts `text/markdown`, the function
 * takes the site's own response via context.next() (it never fetches the public
 * URL, so it cannot re-enter itself), and, only if that is a successful text/html
 * page that is not marked noindex, returns the page's <main> content as Markdown.
 * Headings, tables, citations, source links, figure captions and meaningful
 * image descriptions are kept; scripts, navigation, header, footer, library
 * blocks and forms are dropped. Every other request, and any error, gets the
 * original response unchanged, apart from an added `Vary: Accept` header so
 * caches never confuse the two versions.
 *
 * Content-Signal is `search=yes, ai-input=yes, ai-train=no`: AI answers may
 * read and cite the pages; no permission is given for model training.
 *
 * Test against a deploy (or a Deploy Preview URL):
 *   curl -i -H "Accept: text/markdown" https://your-site.netlify.app/path
 *   e.g. curl -i -H "Accept: text/markdown" https://deploy-preview-2--mjb-adhd.netlify.app/science/genetics/gen-12/
 *   curl -i https://deploy-preview-2--mjb-adhd.netlify.app/science/genetics/gen-12/   (normal HTML)
 *
 * Adding or removing paths:
 *   Edit the explicit `path` list in `config` at the bottom of this file. Only
 *   published content pages belong there. Never add /contact/, /contact/thanks/,
 *   /archive/, assets, XML/JSON files, form endpoints or unpublished routes.
 *
 * Testing locally:
 *   npm install
 *   netlify dev --port 8889
 *   curl -i -H "Accept: text/markdown" http://localhost:8889/science/genetics/gen-12/
 */
// Turndown is installed from package.json and imported by its bare name. Netlify's
// edge bundler resolves npm packages this way; an "npm:turndown" specifier fails to bundle.
import TurndownService from "turndown";
import * as gfm from "turndown-plugin-gfm";

type Context = { next: (request?: Request) => Promise<Response> };

const SIGNAL = "search=yes, ai-input=yes, ai-train=no";
const STRIP = ["script", "style", "noscript", "template", "nav", "header", "footer", "aside", "dialog", "button", "form", "iframe", "video", "svg"];
const UTILITY = /\b(skip-link|rail|home-btn|crumbs|lib-block|visually-hidden|sr-only|gloss-hint|gen-series)\b/;

/* True only if the Accept header names text/markdown with a non-zero q value.
   Malformed or wildcard-only headers are treated as "not asking for Markdown". */
export function acceptsMarkdown(accept: string | null): boolean {
  if (!accept || accept.length > 1024) return false;
  return accept.split(",").some((part) => {
    const [type, ...params] = part.trim().toLowerCase().split(";").map((s) => s.trim());
    if (type !== "text/markdown") return false;
    const q = params.find((p) => p.startsWith("q="));
    if (!q) return true;
    const v = Number(q.slice(2));
    return Number.isFinite(v) && v > 0 && v <= 1;
  });
}

function withVary(res: Response): Response {
  const out = new Response(res.body, res);
  const vary = out.headers.get("vary");
  if (!vary || !/\baccept\b/i.test(vary)) out.headers.set("Vary", vary ? `${vary}, Accept` : "Accept");
  return out;
}

function absolutise(html: string, base: string): string {
  return html.replace(/\b(href|src)="([^"#][^"]*|#[^"]*)"/g, (all, attr, url) => {
    if (/^(https?:|mailto:|tel:|data:)/i.test(url)) return all;
    try { return `${attr}="${new URL(url, base).href}"`; } catch { return all; }
  });
}

export function toMarkdown(html: string, pageUrl: string): string {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
  const plugins = (gfm as any).tables ? gfm : (gfm as any).default;
  td.use(plugins.tables);
  td.remove(STRIP as any);
  td.remove(((node: any) => UTILITY.test(node.getAttribute?.("class") || "")) as any);
  // Decorative images (empty alt) are dropped; described images keep their description.
  td.addRule("decorativeImages", { filter: (node: any) => node.nodeName === "IMG" && !(node.getAttribute("alt") || "").trim(), replacement: () => "" });
  td.addRule("figureLabel", { filter: (node: any) => node.nodeName === "SPAN" && /\bfig-label\b/.test(node.getAttribute("class") || ""), replacement: (content: string) => `_${content.trim()}._ ` });
  td.addRule("figcaption", { filter: "figcaption", replacement: (content: string) => `\n\n> **Figure:** ${content.trim().replace(/\n+/g, " ")}\n\n` });
  const prepared = absolutise(main, pageUrl).replace(/<\/span>\s*<span/g, "</span> <span");
  let md = td.turndown(prepared).replace(/\n{3,}/g, "\n\n").trim();
  if (title && !/^# /m.test(md)) md = `# ${title}\n\n${md}`;
  return `${md}\n\nSource: ${pageUrl}\n`;
}

export default async (req: Request, context: Context) => {
  if ((req.method !== "GET" && req.method !== "HEAD") || !acceptsMarkdown(req.headers.get("accept"))) {
    return withVary(await context.next());
  }
  // Ask the site for the full page even for HEAD, so headers describe the Markdown body.
  const res = await context.next(req.method === "HEAD" ? new Request(req, { method: "GET" }) : undefined);
  try {
    const type = res.headers.get("content-type") || "";
    if (res.status !== 200 || !type.toLowerCase().startsWith("text/html")) return withVary(res);
    const html = await res.clone().text();
    if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html)) return withVary(res);

    const url = new URL(req.url);
    const md = toMarkdown(html, url.origin + url.pathname);
    const headers = new Headers({
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Markdown-Tokens": String(Math.ceil(md.length / 4)),
      "Content-Signal": SIGNAL,
      "Vary": "Accept",
      "Cache-Control": "public, max-age=0, must-revalidate",
    });
    return new Response(req.method === "HEAD" ? null : md, { status: 200, headers });
  } catch (err) {
    console.error("markdown edge function fell back to HTML:", err);
    return withVary(res);
  }
};

/* Published content pages only (the sitemap minus /contact/ and /archive/). */
export const config = {
  path: [
    "/",
    "/science/what-is-adhd/",
    "/science/genetics/",
    "/science/genetics/gen-01/",
    "/science/genetics/gen-02/",
    "/science/genetics/gen-03/",
    "/science/genetics/gen-04/",
    "/science/genetics/gen-05/",
    "/science/genetics/gen-06/",
    "/science/genetics/gen-09/",
    "/science/genetics/gen-10/",
    "/science/genetics/gen-11/",
    "/science/genetics/gen-12/",
    "/science/pathway/",
    "/support/quick-starts/",
    "/compounds/",
    "/compounds/cannabis/",
    "/compounds/strain-reviews/",
    "/rights/overview/",
    "/about/mission/",
    "/journey/",
    "/arguments/",
    "/accountability/",
    "/sources/",
    "/sources/evidence-map/",
    "/sources/method/",
    "/sources/numbers/",
  ],
};
