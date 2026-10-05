/*
 * Markdown for AI agents.
 *
 * When a request sends `Accept: text/markdown`, this edge function fetches the
 * normal HTML page from the origin, keeps the page's <main> content, strips
 * scripts, styles, navigation, header, footer and sidebars, and returns it as
 * Markdown (converted with Turndown). Any other request passes straight through.
 * If anything goes wrong, the original HTML response is returned instead.
 *
 * Test against a deploy (or a Deploy Preview URL):
 *   curl -H "Accept: text/markdown" https://your-site.netlify.app/path
 *   e.g. curl -H "Accept: text/markdown" https://deploy-preview-2--mjb-adhd.netlify.app/science/pathway/
 *   Add -i to see the X-Markdown-Tokens and Content-Signal headers.
 *
 * Adding or removing paths:
 *   The scope is set in netlify.toml, in the [[edge_functions]] blocks with
 *   function = "markdown". Add a block with a new `path` (wildcards like
 *   "/science/*" are allowed) to cover more pages, delete a block to stop
 *   covering them, or list paths in `excludedPath` to skip files such as media
 *   and PDFs inside a covered folder.
 *
 * Testing locally:
 *   netlify dev --port 8889
 *   curl -i -H "Accept: text/markdown" http://localhost:8889/science/genetics/
 *   curl -i http://localhost:8889/science/genetics/      (unchanged HTML)
 */
// Turndown is installed from package.json and imported by its bare name. Netlify's
// edge bundler resolves npm packages this way; an "npm:turndown" specifier fails to bundle.
import TurndownService from "turndown";

type Context = { next: () => Promise<Response> };

const STRIP = ["script", "style", "noscript", "template", "nav", "header", "footer", "aside", "dialog", "svg", "button", "form", "iframe"];

function wantsMarkdown(req: Request): boolean {
  return (req.headers.get("accept") || "").toLowerCase().includes("text/markdown");
}

function contentOf(html: string): { title: string; body: string } {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  const body = main ?? html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  return { title, body };
}

export default async (req: Request, context: Context) => {
  if (!wantsMarkdown(req)) return context.next();

  const response = await context.next();
  try {
    const type = response.headers.get("content-type") || "";
    if (!response.ok || !type.includes("text/html")) return response;

    const html = await response.clone().text();
    const { title, body } = contentOf(html);

    const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
    td.remove(STRIP);
    // Utility elements that are not part of the page's content.
    td.remove((node: { getAttribute?: (n: string) => string | null }) => {
      const cls = node.getAttribute?.("class") || "";
      return /\b(skip-link|rail|home-btn|crumbs|lib-block|visually-hidden|sr-only)\b/.test(cls);
    });

    // Keep adjacent inline labels (badges, legend items) from running together.
    let markdown = td.turndown(body.replace(/<\/span>\s*<span/g, "</span> <span")).replace(/\n{3,}/g, "\n\n").trim();
    if (title && !/^# /m.test(markdown)) markdown = `# ${title}\n\n${markdown}`;
    markdown += "\n";

    const headers = new Headers({
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Markdown-Tokens": String(Math.ceil(markdown.length / 4)),
      "Content-Signal": "ai-train=yes, search=yes, ai-input=yes",
      "Vary": "Accept",
    });
    return new Response(markdown, { status: response.status, headers });
  } catch (err) {
    console.error("markdown edge function fell back to HTML:", err);
    return response;
  }
};
