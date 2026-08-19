import type { Context } from "@netlify/edge-functions";

export default async function (request: Request, context: Context) {
  const accept = request.headers.get("accept") || "";
  const url = new URL(request.url);

  const wantsMarkdown =
    accept.includes("text/markdown") ||
    accept.includes("text/x-markdown");

  // If client/agent sends Accept: text/markdown on the root or html page, return markdown representation
  if (wantsMarkdown && (url.pathname === "/" || url.pathname === "/index.html")) {
    const mdResponse = await context.rewrite("/index.md");
    const mdText = await mdResponse.text();
    const tokenCount = Math.round(mdText.length / 4);

    return new Response(mdText, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Vary": "Accept",
        "x-markdown-tokens": tokenCount.toString(),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400, must-revalidate"
      }
    });
  }

  const response = await context.next();
  response.headers.set("Vary", "Accept");
  return response;
}
