interface Env {
  ASSETS: {
    fetch: typeof fetch;
  };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const request = context.request;
  const accept = request.headers.get("accept") || "";
  const url = new URL(request.url);

  const wantsMarkdown =
    accept.includes("text/markdown") ||
    accept.includes("text/x-markdown") ||
    url.searchParams.get("format") === "markdown";

  // When an AI agent requests markdown on root, serve /index.md with proper agent headers
  if (wantsMarkdown && (url.pathname === "/" || url.pathname === "/index.html")) {
    const mdUrl = new URL("/index.md", url.origin);
    const mdResponse = await context.env.ASSETS.fetch(mdUrl);
    const mdText = await mdResponse.text();
    const tokenCount = Math.round(mdText.length / 4);

    return new Response(mdText, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Vary": "Accept",
        "x-markdown-tokens": tokenCount.toString(),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  }

  const response = await context.next();
  response.headers.set("Vary", "Accept");
  return response;
};
