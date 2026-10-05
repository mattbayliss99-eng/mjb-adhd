import type { Config, Context } from "@netlify/edge-functions";

function backupRedirect(): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "https://x.com/MJB_ADHD",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export default async (request: Request, context: Context) => {
  if (request.method !== "GET" && request.method !== "HEAD") return;

  const pathname = new URL(request.url).pathname;
  const destination = request.headers.get("sec-fetch-dest");
  const acceptsHtml = /\btext\/html\b/i.test(request.headers.get("accept") || "");
  const isDocument = destination === "document" || (!destination && acceptsHtml);
  if (!isDocument || (/\.[^/]+$/.test(pathname) && !/\.html?$/i.test(pathname))) return;

  try {
    const response = await context.next();
    return response.status >= 500 ? backupRedirect() : response;
  } catch {
    return backupRedirect();
  }
};

export const config: Config = {
  path: "/*",
  excludedPath: ["/.netlify/*", "/assets/*", "/css/*", "/js/*"],
};
