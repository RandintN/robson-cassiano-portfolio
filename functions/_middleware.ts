interface Env {
  ASSETS: {
    fetch: typeof fetch;
  };
}

const SITE_URL = "https://eu.robsoncassiano.software";

/**
 * Maps an HTML route to its Markdown alternate, when one exists.
 * `/`            -> /index.md
 * `/en` `/en/`   -> /index-en.md
 * `/artigos/{s}/` -> /artigos/{s}.md
 */
function markdownVariant(pathname: string): string | null {
  const clean = pathname.replace(/\/index\.html$/i, "").replace(/\/+$/, "") || "/";
  if (clean === "/") return "/index.md";
  if (clean === "/en") return "/index-en.md";
  if (clean === "/artigos") return "/artigos/index.md";
  const article = /^\/artigos\/([a-z0-9-]+)$/i.exec(clean);
  if (article) return `/artigos/${article[1]}.md`;
  return null;
}

/** Canonical HTML URL that a given Markdown file mirrors (for the Link header). */
function canonicalOf(mdPath: string): string {
  if (mdPath === "/index.md") return `${SITE_URL}/`;
  if (mdPath === "/index-en.md") return `${SITE_URL}/en/`;
  if (mdPath === "/artigos/index.md") return `${SITE_URL}/artigos/`;
  const article = /^\/artigos\/(.+)\.md$/i.exec(mdPath);
  if (article) return `${SITE_URL}/artigos/${article[1]}/`;
  return SITE_URL;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const request = context.request;
  const accept = request.headers.get("accept") || "";
  const url = new URL(request.url);

  const wantsMarkdown =
    accept.includes("text/markdown") ||
    accept.includes("text/x-markdown") ||
    url.searchParams.get("format") === "markdown";

  // Content negotiation for AI agents: serve the Markdown twin of any page that has
  // one, so agents do not have to download and parse the full HTML payload.
  if (wantsMarkdown && request.method === "GET") {
    const mdPath = markdownVariant(url.pathname);

    if (mdPath) {
      const mdResponse = await context.env.ASSETS.fetch(new URL(mdPath, url.origin));

      if (mdResponse.ok) {
        const mdText = await mdResponse.text();
        const tokenCount = Math.round(mdText.length / 4);

        return new Response(mdText, {
          status: 200,
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Content-Language": mdPath === "/index-en.md" ? "en" : "pt-BR",
            "Vary": "Accept",
            "x-markdown-tokens": tokenCount.toString(),
            "Link": `<${canonicalOf(mdPath)}>; rel="canonical"`,
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=0, must-revalidate",
          },
        });
      }
    }
  }

  // Handle global CORS preflight for all endpoints
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const response = await context.next();
  response.headers.set("Vary", "Accept");
  response.headers.set("Access-Control-Allow-Origin", "*");

  // Responses produced by Pages Functions ignore the _headers file, so the crawl
  // directive for the capture API has to be set on the response itself.
  if (url.pathname.startsWith("/api/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
};
