# Robson Cassiano Portfolio

Portfolio + sovereign Markdown CMS + email capture, hosted entirely on **Cloudflare Pages**
at `https://eu.robsoncassiano.software/`.

**PT-BR is the canonical language** (`/`); a full English portal lives at `/en/`.

## 🚀 Stack

- **Angular 21** — zoneless, standalone components, signals-first.
- **Tailwind CSS v4** — compiled AOT by the CLI (`bun run build:css`).
- **Bun** — runtime for every build script.
- **Cloudflare Pages** — static hosting + Pages Functions at the edge.
- **Cloudflare D1** — subscribers, newsletter log and drip-sequence state.
- **Markdown CMS** — `content/articles/*.md` is the single source of truth.

## 🧱 Architecture

### 1. Content pipeline (`bun run build`)

```
build:css  →  sync-content.js  →  ng build  →  generate-static-articles.js
```

| Step | What it does |
| :--- | :--- |
| `build:css` | Compiles `src/styles.css` → `src/assets/css/styles.css`. |
| `sync-content.js` | Parses frontmatter of `content/articles/*.md` → `src/assets/content/articles.json` (build input) and `articles-index.json` (runtime listing, no bodies), regenerates `sitemap.xml` and refreshes the `<!-- ARTICLES:START/END -->` catalog inside `llms.txt`, `llms-full.txt`, `index.md` and `index-en.md`. |
| `ng build` | Builds the SPA shell and copies root assets (`_headers`, `_redirects`, `robots.txt`, `llms.txt`, `404.html`, …) into `dist`. |
| `generate-static-articles.js` | Pre-renders `dist/artigos/{slug}/index.html` with semantic HTML + JSON-LD, its `.md` twin, the `/artigos/` hub, the `/en/` portal and the static shells. |

### 2. Pre-rendering and crawler visibility

- **Articles** are fully static: `<article>`, `<h1>`, tables, code blocks and per-language
  JSON-LD (`BlogPosting`, `BreadcrumbList`, `VideoObject`) are in the HTML payload, no JS required.
- **Home and `/en/`** ship a build-time *static shell* (`scripts/lib/static-shell.js`) injected inside
  `<app-root>`: navigation, the full article catalog, proof metrics, visible FAQ text and footer.
  Angular replaces that block on bootstrap, so JS users get the app and non-JS clients
  (GPTBot, ClaudeBot, PerplexityBot, CCBot, social bots) still get real content and internal links.
- **`/artigos/`** is a real collection page (`CollectionPage` + `ItemList`) instead of a 404.
- **Markdown negotiation** (`functions/_middleware.ts`): any request with
  `Accept: text/markdown` (or `?format=markdown`) to `/`, `/en/`, `/artigos/` or
  `/artigos/{slug}/` receives the Markdown twin plus `x-markdown-tokens` and a canonical `Link` header.
  An article drops from ~26 kB of HTML to ~5 kB of Markdown.

### 3. Edge

- `functions/api/subscribe.ts`, `unsubscribe.ts`, `broadcast.ts` — lead capture and dispatch.
- `functions/_middleware.ts` — content negotiation, CORS preflight, `Vary: Accept`.
- `workers/cron-publisher` — scheduled publishing, 7-day drip sequence, broadcast, unsubscribe.
- `workers/email-router` — inbound email routing.

### 4. Caching (`_headers`)

> ⚠️ **Cloudflare concatenates `Cache-Control` from every matching rule** — it is not "last wins".
> Keep rules disjoint per path and never put `Cache-Control` under `/*`.

- `/*.js` and `/styles-*.css` → `max-age=31536000, immutable` (content-addressed builds).
- `/assets/images/*`, `/assets/icons/*` → immutable.
- `/assets/content/*`, `/assets/i18n/*`, HTML → `max-age=0, must-revalidate`.

The SSG pages reference a content-addressed `/styles-artigos.<hash>.css` on purpose: Cloudflare's
zone-level Browser Cache TTL caps the un-hashed `/assets/css/styles.css` at 4 hours.

## 🛠️ Commands

| Action | Command |
| :--- | :--- |
| Dev server | `bun run dev` |
| Sync content + sitemap + catalogs | `bun run sync` |
| Full build (SSG included) | `bun run build` |
| Regenerate OG images (needs ImageMagick, run **after** sync) | `bun run og:images` |
| Deploy to Cloudflare Pages | `bun run pages:deploy` |
| Local Pages + Functions emulation | `bun run pages:dev` |
| Worker tests | `cd workers/cron-publisher && bun test` |

Wrangler is authenticated via OAuth, so `pages:deploy` works without `CLOUDFLARE_API_TOKEN`.

## ✍️ Publishing an article

Create `content/articles/my-slug.md`:

```markdown
---
title: "Article title (≤60 chars)"
slug: "my-slug"
date: "2026-09-12"
updated: "2026-09-12"
author: "Robson Cassiano"
category: "Career & Engineering"
readTime: "6 min de leitura"
tags: ["Java", "Spring Boot"]
summary: "140–160 char summary used for meta description and social cards."
coverImage: "assets/images/robson-cassiano-mentor.jpg"
canonicalUrl: "https://eu.robsoncassiano.software/artigos/my-slug/"
youtubeVideoId: "optional"
videoDuration: "PT1H12M"
---

# Article title

Body in Markdown…
```

Then `bun run build` (or push — the Cloudflare Pages Git integration builds and deploys).

Optional English metadata for cards and the `/en` shell lives in
`src/assets/content/articles.en.json` (keyed by slug: `title`, `summary`, `category`, `readTime`).

`sync-content.js` emits two catalogues from the same source and they are not interchangeable:

| File | Consumer | Contents |
| :--- | :--- | :--- |
| `src/assets/content/articles.json` | build only (`generate-static-articles.js`, `generate-og-images.js`, `auto-publish.ts`) | Full entries, including the `content` markdown bodies. Excluded from `dist` via the `ignore` list in `angular.json`. |
| `src/assets/content/articles-index.json` | the Angular app at runtime | The same entries without `content`. 12 KB instead of 115 KB, because the bodies are 85% of the payload and the cards never read them. |

Publishing the full catalogue is what makes the homepage pay 40 KB per visit, and dropping the
listing one empties the article grid; `validate-static-output.js` fails the build on either.

## 🌐 Bilingual layer

| Surface | PT | EN |
| :--- | :--- | :--- |
| Page | `/` | `/en/` |
| Markdown alternate | `index.md` | `index-en.md` |
| UI strings | `src/assets/i18n/br.json` | `src/assets/i18n/en.json` |
| Article listing (runtime) | `articles-index.json` | `articles.en.json` |
| Schema `inLanguage` | `pt-BR` | `en-US` |

Both dictionaries must keep identical key sets (currently 112 each). Articles themselves are
Portuguese-only today, so article pages declare `pt-BR` + `x-default` without an `en` alternate.

## ⚠️ Operational notes

1. **Build/deploy runs on the Cloudflare Pages Git integration.** There is no GitHub Actions
   workflow on purpose — do not recreate one.
2. A production deploy takes ~1 minute; the new alias can serve stale HTML until propagation
   finishes. Re-check with a cache-busting query before assuming a bug.
3. **Two images still carry a pre-`_headers`-rewrite cached response**
   (`/assets/images/Robson-Cassiano.webp`, `/assets/icons/logo-header.webp` →
   `max-age=31536000, must-revalidate, immutable`). Harmless (ETag revalidation), but the only fix
   is a purge: Cloudflare dashboard → Caching → Purge by URL, or a token with the `cache_purge` scope.
4. `scripts/publish-transcript.ts` is intentionally untracked; it requires `ZERNIO_API_KEY` from
   the environment (Bun loads `.env`) and must never carry a hardcoded key.
5. OG images are **not** part of `build`; run `bun run og:images` after `sync` when titles change.

## 🔗 Related documents

- `AGENTS.md` — engineering guidelines for this repository.
- `SEO-AEO-IMPLEMENTATION.md` — the original SEO/AEO/GEO audit.
- `.agents/skills/` — operational skills (publishing articles, email capture, Turnstile).
