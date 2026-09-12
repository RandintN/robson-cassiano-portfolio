import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { marked } from 'marked';
import {
  buildStaticShell,
  buildArticlesHub,
  buildArticlesHubMarkdown,
  injectShell,
} from './lib/static-shell.js';

const articlesFile = path.resolve('src/assets/content/articles.json');
const articlesEnFile = path.resolve('src/assets/content/articles.en.json');
const distDir = path.resolve('dist');

if (!fs.existsSync(articlesFile)) {
  console.error('Arquivo articles.json não encontrado para pré-renderização.');
  process.exit(1);
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// The un-hashed /assets/css/styles.css is capped by Cloudflare's zone-level
// Browser Cache TTL (4h), which would leave the SSG pages on stale CSS after a
// deploy. Emitting a content-addressed copy in the root lets the existing
// /styles-*.css rule serve it as immutable.
const cssSource = path.resolve('src/assets/css/styles.css');
let stylesHref = '/assets/css/styles.css';
if (fs.existsSync(cssSource)) {
  const css = await Bun.file(cssSource).text();
  const hash = createHash('sha256').update(css).digest('hex').slice(0, 10);
  const hashedFile = `styles-artigos.${hash}.css`;
  await Bun.write(path.join(distDir, hashedFile), css);
  stylesHref = `/${hashedFile}`;
}

// Sincronizar sitemap.xml gerado para o dist
const rootSitemap = path.resolve('sitemap.xml');
const distSitemap = path.join(distDir, 'sitemap.xml');
if (fs.existsSync(rootSitemap)) {
  fs.copyFileSync(rootSitemap, distSitemap);
  console.log('✓ sitemap.xml sincronizado em dist/sitemap.xml');
}

const articles = await Bun.file(articlesFile).json();
const articlesEn = fs.existsSync(articlesEnFile) ? await Bun.file(articlesEnFile).json() : {};

const escapeAttr = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

for (const art of articles) {
  let rawContent = art.content || '';
  rawContent = rawContent.replace(/^#\s+[^\n]+\n+/, '');
  let articleHtml = marked.parse(rawContent);

  if (art.youtubeVideoId) {
    const videoCallout = `
      <div class="article-video-callout">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">Gravação Original</span>
          <span class="text-xs text-slate-300 font-semibold">🎥 Quer se aprofundar? Assista à transmissão que deu origem a este ensaio:</span>
        </div>
        <div class="video-wrapper">
          <iframe 
            src="https://www.youtube.com/embed/${art.youtubeVideoId}?rel=0" 
            title="Transmissão Original - Robson Cassiano" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    `;

    let count = 0;
    let injected = false;
    articleHtml = articleHtml.replace(/<\/h2>/g, (match) => {
      count++;
      if (count === 2) {
        injected = true;
        return match + videoCallout;
      }
      return match;
    });

    if (!injected) {
      if (count === 1) {
        articleHtml = articleHtml.replace(/<\/h2>/, (match) => match + videoCallout);
      } else {
        articleHtml += videoCallout;
      }
    }
  }
  const targetDir = path.join(distDir, 'artigos', art.slug);
  fs.mkdirSync(targetDir, { recursive: true });

  const canonicalUrl = `https://eu.robsoncassiano.software/artigos/${art.slug}/`;
  const cleanCoverImage = (art.coverImage || '').replace(/^\/+/, '');
  const coverImageUrl = `https://eu.robsoncassiano.software/${cleanCoverImage}`;
  const cleanOgImage = (art.ogImage || art.coverImage || '').replace(/^\/+/, '');
  const ogImageUrl = `https://eu.robsoncassiano.software/${cleanOgImage}`;
  const publisherLogoUrl = 'https://eu.robsoncassiano.software/assets/icons/logo-header.webp';

  // Keep the <title> within the 50-60 char SERP budget: append the brand only if it still fits.
  const brandedTitle = `${art.title} | Robson Cassiano`;
  const metaTitle = brandedTitle.length <= 60 ? brandedTitle : art.title;

  const graphItems = [
    {
      "@type": "BlogPosting",
      "@id": `${canonicalUrl}#article`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      },
      "headline": art.title,
      "description": art.summary,
      "image": coverImageUrl,
      "author": {
        "@type": "Person",
        "@id": "https://eu.robsoncassiano.software/#person",
        "name": "Robson Cassiano",
        "jobTitle": "Software Engineer na Epic Games & Cambridge CELTA Certified Teacher",
        "url": "https://www.robsoncassiano.software/",
        "worksFor": {
          "@type": "Organization",
          "name": "Epic Games"
        },
        "alumniOf": {
          "@type": "Organization",
          "name": "University of Cambridge (CELTA Certification)"
        },
        "sameAs": [
          "https://www.robsoncassiano.software/",
          "https://global.robsoncassiano.software/",
          "https://eu.robsoncassiano.software/",
          "https://github.com/RandintN",
          "https://www.linkedin.com/in/robsoncassiano-software/",
          "https://www.amazon.com.br/stores/Robson-Cassiano/author/B0FLN1QMCJ",
          "https://www.goodreads.com/user/show/68023009-robson-cassiano",
          "https://twitter.com/RobsonDev",
          "https://www.youtube.com/@RobsonCassianoSoftware",
          "https://instagram.com/robsoncassiano.software",
          "https://www.facebook.com/RobsonCassianoSoftware/",
          "https://randintn.substack.com",
          "https://beacons.ai/robson.cassiano/portflio"
        ]
      },
      "publisher": {
        "@type": "Organization",
        "@id": "https://eu.robsoncassiano.software/#organization",
        "name": "Simple Software LTDA",
        "url": "https://www.robsoncassiano.software/",
        "logo": {
          "@type": "ImageObject",
          "url": publisherLogoUrl
        },
        "sameAs": [
          "https://www.robsoncassiano.software/",
          "https://global.robsoncassiano.software/",
          "https://github.com/SimpleSoftwareLTDA",
          "https://www.linkedin.com/company/simple-software-ltda",
          "https://www.linkedin.com/in/robsoncassiano-software/",
          "https://www.youtube.com/@RobsonCassianoSoftware",
          "https://www.facebook.com/RobsonCassianoSoftware/"
        ]
      },
      "datePublished": `${art.date}T10:00:00-03:00`,
      "dateModified": `${art.updated || art.date}T10:00:00-03:00`,
      "articleSection": art.category,
      "keywords": art.tags.join(', '),
      "inLanguage": "pt-BR"
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Início",
          "item": "https://eu.robsoncassiano.software/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": "https://eu.robsoncassiano.software/artigos/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": art.title,
          "item": canonicalUrl
        }
      ]
    }
  ];

  if (art.youtubeVideoId) {
    const videoObject = {
      "@type": "VideoObject",
      "@id": `${canonicalUrl}#video`,
      "name": `Transmissão Original: ${art.title}`,
      "description": art.summary,
      "thumbnailUrl": `https://i.ytimg.com/vi/${art.youtubeVideoId}/hqdefault.jpg`,
      "uploadDate": `${art.date}T10:00:00-03:00`,
      "contentUrl": `https://www.youtube.com/watch?v=${art.youtubeVideoId}`,
      "embedUrl": `https://www.youtube.com/embed/${art.youtubeVideoId}`
    };
    // duration is required for Google video rich results; only emit it when a real ISO-8601 value exists.
    if (art.videoDuration) videoObject.duration = art.videoDuration;
    graphItems.push(videoObject);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graphItems
  };

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeAttr(metaTitle)}</title>
  <meta name="description" content="${escapeAttr(art.summary)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" hreflang="pt-BR" href="${canonicalUrl}">
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png">
  <link rel="shortcut icon" href="/assets/icons/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link rel="alternate" type="text/markdown" href="https://eu.robsoncassiano.software/artigos/${art.slug}.md" title="Markdown Version for AI Agents">
  <link rel="alternate" type="text/plain" href="https://eu.robsoncassiano.software/llms.txt" title="LLMs.txt">

  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:type" content="article">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:title" content="${escapeAttr(art.title)}">
  <meta property="og:description" content="${escapeAttr(art.summary)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeAttr(art.title)}">
  <meta property="og:site_name" content="Robson Cassiano - Senior Software Engineer">
  <meta property="article:published_time" content="${art.date}">
  <meta property="article:modified_time" content="${art.updated || art.date}">
  <meta property="article:author" content="Robson Cassiano">
  <meta property="article:section" content="${escapeAttr(art.category)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@RobsonDev">
  <meta name="twitter:creator" content="@RobsonDev">
  <meta name="twitter:title" content="${escapeAttr(art.title)}">
  <meta name="twitter:description" content="${escapeAttr(art.summary)}">
  <meta name="twitter:image" content="${ogImageUrl}">
  <meta name="twitter:image:alt" content="${escapeAttr(art.title)}">

  <!-- Schema.org JSON-LD Structured Data for Googlebot & LLMs -->
  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>

  <link rel="stylesheet" href="${stylesHref}">
  <script>
    class LiteYouTube extends HTMLElement {
      connectedCallback() {
        const videoId = this.getAttribute('videoid');
        if (!videoId || this.dataset.initialized) return;
        this.dataset.initialized = 'true';

        const playLabel = this.getAttribute('playlabel') || 'Assistir transmissão';
        this.innerHTML = \`
          <div class="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden cursor-pointer group shadow-2xl border border-slate-800 transition-all">
            <img 
              src="https://i.ytimg.com/vi/\${videoId}/hqdefault.jpg" 
              alt="\${playLabel}"
              loading="lazy"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 flex items-center justify-center">
              <div class="w-16 h-12 bg-red-600/90 group-hover:bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all group-hover:scale-110">
                <svg class="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
        \`;

        this.firstElementChild?.addEventListener('click', (e) => {
          e.preventDefault();
          const origin = encodeURIComponent(window.location.origin);
          this.innerHTML = \`
            <iframe 
              src="https://www.youtube.com/embed/\${videoId}?autoplay=1&origin=\${origin}"
              title="\${playLabel}"
              class="w-full aspect-video rounded-xl shadow-2xl border border-slate-800"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          \`;
        }, { once: true });
      }
    }
    if (!customElements.get('lite-youtube')) {
      customElements.define('lite-youtube', LiteYouTube);
    }
  </script>
  <style>
    body { background-color: #08080a; color: #cbd5e1; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    .article-body h1 { font-size: 1.875rem; font-weight: 800; color: #ffffff; margin-top: 2rem; margin-bottom: 1rem; line-height: 1.3; }
    .article-body h2 { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-top: 2rem; margin-bottom: 0.75rem; border-left: 4px solid #dfb15b; padding-left: 0.75rem; }
    .article-body h3 { font-size: 1.25rem; font-weight: 700; color: #dfb15b; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    .article-body p { margin-bottom: 1.25rem; line-height: 1.8; color: #cbd5e1; font-size: 1.05rem; }
    .article-body ul, .article-body ol { margin-left: 1.5rem; margin-bottom: 1.25rem; color: #cbd5e1; list-style-type: disc; }
    .article-body ol { list-style-type: decimal; }
    .article-body li { margin-bottom: 0.5rem; line-height: 1.6; }
    .article-body strong { color: #ffffff; font-weight: 700; }
    .article-body em { color: #e2e8f0; font-style: italic; }
    .article-body blockquote { border-left: 4px solid #dfb15b; padding: 1rem 1.25rem; margin: 1.5rem 0; background: rgba(22, 22, 28, 0.7); border-radius: 0 0.75rem 0.75rem 0; color: #f6e0a4; font-style: italic; }
    .article-body blockquote p { margin-bottom: 0; }
    .article-body pre { background: #0e0e12; border: 1px solid #252530; border-radius: 0.75rem; padding: 1.25rem; overflow-x: auto; margin: 1.5rem 0; font-family: ui-monospace, monospace; font-size: 0.9rem; color: #f8fafc; }
    .article-body code { font-family: ui-monospace, monospace; font-size: 0.875rem; color: #dfb15b; background: rgba(20, 20, 24, 0.9); padding: 0.2rem 0.4rem; border-radius: 0.25rem; }
    .article-body pre code { color: #f8fafc; background: transparent; padding: 0; }
    .article-body table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; border: 1px solid #252530; border-radius: 0.75rem; overflow: hidden; }
    .article-body th { background-color: #16161c; color: #ffffff; font-weight: 700; text-align: left; padding: 0.75rem 1rem; border: 1px solid #252530; font-size: 0.9rem; }
    .article-body td { padding: 0.75rem 1rem; border: 1px solid #252530; color: #cbd5e1; font-size: 0.95rem; }
    .article-body tr:nth-child(even) { background-color: rgba(22, 22, 28, 0.4); }
    .article-body hr { border: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(223, 177, 91, 0.3) 50%, transparent); margin: 2.5rem 0; }
    .article-body a { color: #dfb15b; text-decoration: underline; text-underline-offset: 3px; }
    .article-body a:hover { color: #f6e0a4; }
    .article-body img { max-width: 100%; height: auto; border-radius: 0.875rem; border: 1px solid #252530; margin: 1.75rem auto; display: block; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .article-body figure { margin: 2rem 0; text-align: center; }
    .article-body figcaption { margin-top: 0.5rem; font-size: 0.875rem; color: #94a3b8; font-style: italic; }
    .article-video-callout { margin: 2.5rem 0; padding: 1.5rem; background: linear-gradient(135deg, rgba(20, 20, 24, 0.95), rgba(8, 8, 10, 0.95)); border: 1px solid rgba(223, 177, 91, 0.35); border-radius: 1rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); }
    .article-video-callout .video-wrapper { position: relative; width: 100%; padding-bottom: 56.25%; height: 0; border-radius: 0.75rem; overflow: hidden; border: 1px solid #252530; background-color: #08080a; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); margin-top: 0.75rem; }
    .article-video-callout .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body class="min-h-screen antialiased selection:bg-[#dfb15b] selection:text-[#08080a] bg-[#08080a] text-[#f4f4f6]">

  <!-- Header -->
  <header class="border-b border-[#252530] bg-[#08080a]/90 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
      <a href="/" class="flex items-center gap-3 group">
        <img
          src="/assets/icons/logo-header.webp"
          width="36"
          height="36"
          alt="Robson Cassiano"
          class="w-9 h-9 object-contain group-hover:scale-105 transition-transform drop-shadow-[0_2px_10px_rgba(223,177,91,0.25)]" />
        <div class="flex flex-col">
          <span class="font-bold text-lg tracking-tight text-white group-hover:text-[#dfb15b] transition-colors">Robson<span class="text-[#dfb15b]">Cassiano</span></span>
          <span class="text-[9px] tracking-widest uppercase font-semibold text-[#967432] font-mono">迅貫 · Jinkan</span>
        </div>
      </a>
      <div class="flex items-center gap-4">
        <a href="/en/" hreflang="en" title="Read the English portfolio" class="text-sm font-bold text-slate-400 hover:text-[#dfb15b] transition-colors border border-[#252530] hover:border-[#dfb15b]/40 rounded-lg px-3 py-1.5">EN</a>
        <a href="/#artigos" class="text-sm font-semibold text-slate-300 hover:text-[#dfb15b] transition-colors flex items-center gap-1.5 group">
          <span class="group-hover:-translate-x-1 transition-transform">&larr;</span> <span>Todos os Artigos</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Breadcrumb -->
  <nav aria-label="Breadcrumb" class="max-w-4xl mx-auto px-6 pt-6">
    <ol class="flex items-center gap-2 text-xs text-slate-400">
      <li><a href="/" class="hover:text-[#dfb15b] transition-colors">Início</a></li>
      <li>/</li>
      <li><a href="/artigos/" class="hover:text-[#dfb15b] transition-colors">Blog</a></li>
      <li>/</li>
      <li class="text-[#dfb15b] truncate max-w-xs">${art.title}</li>
    </ol>
  </nav>

  <!-- Main Article Content -->
  <main class="max-w-4xl mx-auto px-6 py-8">
    <article>
      
      <!-- Header -->
      <header class="mb-10 pb-8 border-b border-[#252530]">
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#dfb15b]/10 text-[#dfb15b] border border-[#dfb15b]/25 uppercase tracking-wider">
            ${art.category}
          </span>
          <span class="text-slate-600">•</span>
          <time datetime="${art.date}" class="text-slate-400 text-xs">${art.date}</time>
          <span class="text-slate-600">•</span>
          <span class="text-slate-400 text-xs">${art.readTime}</span>
        </div>

        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
          ${art.title}
        </h1>

        <p class="text-lg text-slate-400 leading-relaxed mb-6 font-medium">
          ${art.summary}
        </p>

        <!-- Author Card -->
        <div class="flex items-center gap-4 pt-4 border-t border-[#252530]">
          <img src="/assets/images/Robson-Cassiano.webp" width="48" height="48" alt="Robson Cassiano" class="w-12 h-12 rounded-full border border-[#dfb15b]/30 object-cover shadow-md shadow-[#dfb15b]/10">
          <div>
            <span class="text-base font-bold text-white block">Robson Cassiano</span>
            <span class="text-xs text-slate-400 block">Software Engineer na Epic Games & Cambridge CELTA Certified Teacher</span>
          </div>
        </div>
      </header>

      <!-- Semantic Body -->
      <div class="article-body">
        ${articleHtml}
      </div>

      <!-- Pre-Sold Authority / Mentorship Banner -->
      <section class="mt-12 p-8 rounded-2xl bg-gradient-to-b from-[#141418] to-[#0e0e12] border border-[#dfb15b]/30 shadow-2xl shadow-[#dfb15b]/5 relative overflow-hidden">
        <div class="inline-block px-3 py-1 rounded-full bg-[#dfb15b]/10 border border-[#dfb15b]/25 text-[#dfb15b] text-xs font-bold mb-3 uppercase tracking-wider">
          Mentoria Executiva Internacional
        </div>
        <h3 class="text-2xl font-bold text-white mb-3">
          Conquiste Contratos de R$ 30k a R$ 60k+/mês como Dev Sênior no Exterior
        </h3>
        <p class="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
          No programa <strong class="text-white">Descomplica DEV Na Gringa</strong>, você domina entrevistas técnicas em inglês ("Real English"), negociação salarial em moeda forte (USD/EUR) e posicionamento estratégico global.
        </p>
        <div class="flex flex-wrap gap-4">
          <a href="https://global.robsoncassiano.software/" target="_blank" rel="noopener noreferrer" class="px-6 py-3 bg-gradient-to-r from-[#dfb15b] to-[#c99839] hover:from-[#f6e0a4] hover:to-[#dfb15b] text-[#08080a] font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-[#dfb15b]/20 hover:shadow-[#dfb15b]/35 inline-flex items-center gap-2">
            <span>Conhecer o Método 30k+ &amp; Casos Reais</span>
            <span>&rarr;</span>
          </a>
          <a href="https://robsoncassiano.software/7-passos-simples-dev-na-gringa" data-capture-open target="_blank" rel="noopener noreferrer" class="px-5 py-3 rounded-xl bg-[#16161c] hover:bg-[#1f1f27] border border-[#252530] hover:border-[#dfb15b]/40 text-[#dfb15b] hover:text-[#f6e0a4] text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer">
            <span>📖 Baixar E-book Gratuito</span>
          </a>
          <a href="/#artigos" class="px-5 py-3 rounded-xl bg-[#16161c] hover:bg-[#1f1f27] border border-[#252530] hover:border-[#dfb15b]/40 text-slate-300 hover:text-white text-sm font-semibold transition-colors">
            Explorar Outros Artigos
          </a>
        </div>
      </section>

    </article>
  </main>

  <!-- Footer -->
  <footer class="border-t border-[#252530] py-10 mt-16 bg-[#08080a] text-center text-xs text-slate-500">
    <p>© ${new Date().getFullYear()} Robson Cassiano. Todos os direitos reservados.</p>
    <p class="mt-2"><a href="/" class="text-[#dfb15b] hover:text-[#f6e0a4] hover:underline transition-colors">eu.robsoncassiano.software</a> | <a href="https://global.robsoncassiano.software/" class="text-[#dfb15b] hover:text-[#f6e0a4] hover:underline transition-colors">global.robsoncassiano.software</a></p>
  </footer>

  <!-- Sovereign Cloudflare Lead Capture Modal -->
  <script 
    src="https://capture.robsoncassiano.software/embed.js" 
    data-source="artigo-${art.slug}"
    data-mode="modal"
    data-turnstile-sitekey="0x4AAAAAAEjUfJwT3yG_vHIF"
    data-badge="📬 Acesso Exclusivo &amp; E-book Gratuito"
    data-title="Conquiste Vagas Internacionais de R$ 30k+/mês"
    data-description="Receba o e-book 7 Passos Simples DEV na Gringa e acompanhe os bastidores de arquitetura de grandes sistemas globais."
    data-button="Garantir Meu Acesso VIP"
    data-ebook-url="https://robsoncassiano.software/7-passos-simples-dev-na-gringa"
    defer>
  </script>
</body>
</html>`;

  await Bun.write(path.join(targetDir, 'index.html'), htmlContent);
  console.log(`✓ Pré-renderizado HTML semântico com JSON-LD em dist/artigos/${art.slug}/index.html`);

  // Markdown alternate for AI agents: the same content minus HTML noise, served at
  // /artigos/{slug}.md and negotiated by functions/_middleware.ts on Accept: text/markdown.
  const markdownBody = (art.content || '').replace(/^#\s+[^\n]+\n+/, '').trim();
  const markdownMeta = [
    `# ${art.title}`,
    '',
    `> ${art.summary}`,
    '',
    `- Canonical URL: ${canonicalUrl}`,
    '- Author: Robson Cassiano (https://eu.robsoncassiano.software/#person)',
    `- Published: ${art.date}${art.updated && art.updated !== art.date ? ` (updated: ${art.updated})` : ''}`,
    `- Category: ${art.category} · ${art.readTime}`,
    `- Language: pt-BR`,
    `- Tags: ${art.tags.join(', ')}`
  ];
  if (art.youtubeVideoId) {
    markdownMeta.push(`- Original broadcast: https://www.youtube.com/watch?v=${art.youtubeVideoId}`);
  }
  const markdownDoc = `${markdownMeta.join('\n')}\n\n---\n\n${markdownBody}\n`;
  await Bun.write(path.join(distDir, 'artigos', `${art.slug}.md`), markdownDoc);
}

console.log(`✓ Geração estática de ${articles.length} artigos finalizada com sucesso.`);

// ---------------------------------------------------------------------------
// Structured data (Schema.org JSON-LD) built from the i18n source of truth, so
// both / (pt-BR) and /en (en-US) ship language-correct schema to crawlers that
// do not execute JavaScript (Googlebot, Bingbot, most AI crawlers).
// ---------------------------------------------------------------------------
const i18nBr = await Bun.file(path.resolve('src/assets/i18n/br.json')).json();
const i18nEn = await Bun.file(path.resolve('src/assets/i18n/en.json')).json();

const SITE_URL = 'https://eu.robsoncassiano.software/';
const ARCHIVE_URL = 'https://www.youtube.com/playlist?list=PLuL_sXVvkAaLvbKq4oSmzbgrn1iB3zwS-';
const FAQ_KEYS = ['FAQ_Q1', 'FAQ_Q2', 'FAQ_Q3', 'FAQ_Q4', 'FAQ_Q5', 'FAQ_Q6', 'FAQ_Q7', 'FAQ_Q8', 'FAQ_Q9'];
const PERSON_SAME_AS = [
  'https://www.robsoncassiano.software/',
  'https://global.robsoncassiano.software/',
  'https://eu.robsoncassiano.software/',
  'https://github.com/RandintN',
  'https://www.linkedin.com/in/robsoncassiano-software/',
  'https://www.amazon.com.br/stores/Robson-Cassiano/author/B0FLN1QMCJ',
  'https://www.goodreads.com/user/show/68023009-robson-cassiano',
  'https://twitter.com/RobsonDev',
  'https://www.youtube.com/@RobsonCassianoSoftware',
  'https://instagram.com/robsoncassiano.software',
  'https://www.facebook.com/RobsonCassianoSoftware/',
  'https://randintn.substack.com',
  'https://beacons.ai/robson.cassiano/portflio'
];
const ORG_SAME_AS = [
  'https://www.robsoncassiano.software/',
  'https://global.robsoncassiano.software/',
  'https://github.com/SimpleSoftwareLTDA',
  'https://www.linkedin.com/company/simple-software-ltda',
  'https://www.linkedin.com/in/robsoncassiano-software/',
  'https://www.youtube.com/@RobsonCassianoSoftware',
  'https://www.facebook.com/RobsonCassianoSoftware/'
];
const KNOWS_ABOUT = [
  'Software Engineering', 'International Tech Careers', 'Technical English for Developers',
  'System Design', 'B2B Remote Contracts', 'Simples Nacional Fator R', 'Java Backend Development',
  'Spring Framework & Spring Boot', 'PostgreSQL Database Optimization',
  'Software Architecture & Clean Architecture', 'Classical Philosophy'
];
const KNOWS_LANGUAGE = [
  { '@type': 'Language', name: 'Portuguese', alternateName: 'pt-BR' },
  { '@type': 'Language', name: 'English', alternateName: 'en' },
  { '@type': 'Language', name: 'Japanese', alternateName: 'ja' },
  { '@type': 'Language', name: 'Latin', alternateName: 'la' },
  { '@type': 'Language', name: 'Ancient Greek', alternateName: 'grc' }
];
const stripHtml = (value) => String(value || '').replace(/<[^>]*>/g, '');

function buildStructuredData(lang) {
  const isBr = lang === 'br';
  const dict = isBr ? i18nBr : i18nEn;
  const t = (key) => dict[key] || key;
  const pageUrl = isBr ? SITE_URL : `${SITE_URL}en`;
  const locale = isBr ? 'pt-BR' : 'en-US';

  const profilePage = {
    '@type': 'ProfilePage',
    '@id': `${SITE_URL}#profilepage`,
    url: pageUrl,
    name: isBr
      ? 'Robson Cassiano | Senior Software Engineer, Mentor de Carreira Internacional e Filósofo'
      : 'Robson Cassiano | Senior Software Engineer, International Career Mentor and Philosopher',
    inLanguage: locale,
    mainEntity: {
      '@type': 'Person',
      '@id': `${SITE_URL}#person`,
      name: 'Robson Cassiano',
      alternateName: ['RobsonDev', 'Robson Cassiano Software', 'randintn'],
      url: SITE_URL,
      image: {
        '@type': 'ImageObject',
        url: `${SITE_URL}assets/images/Robson-Cassiano.webp`,
        width: 800,
        height: 800,
        caption: isBr
          ? 'Robson Cassiano - Software Engineer na Epic Games & Cambridge CELTA Certified Teacher'
          : 'Robson Cassiano - Software Engineer at Epic Games & Cambridge CELTA Certified Teacher'
      },
      jobTitle: isBr
        ? 'Software Engineer na Epic Games & Cambridge CELTA Certified Teacher'
        : 'Software Engineer at Epic Games & Cambridge CELTA Certified Teacher',
      description: isBr
        ? 'Software Engineer na Epic Games. Ex-BTG Pactual, Fundador da Simple Software, Autor de Livros de Tecnologia na Amazon e Professor de Inglês certificado por Cambridge (CELTA). Mentor de carreira internacional para desenvolvedores.'
        : 'Software Engineer at Epic Games. Ex-BTG Pactual, Founder of Simple Software, Amazon Author, and Cambridge CELTA Certified English Teacher. International career mentor for developers.',
      worksFor: { '@type': 'Organization', name: 'Epic Games' },
      alumniOf: { '@type': 'Organization', name: 'University of Cambridge (CELTA Certification)' },
      sameAs: PERSON_SAME_AS,
      subjectOf: {
        '@type': 'ItemList',
        name: isBr
          ? 'Acervo de Entrevistas Técnicas e Mentoria Internacional (+500 Horas Gravadas)'
          : 'Technical Interview & International Mentorship Archive (500+ Recorded Hours)',
        description: isBr
          ? 'Acervo público e auditável de mais de 500 horas de gravações de entrevistas técnicas reais, mock interviews e análises com desenvolvedores de software.'
          : 'Public, auditable archive of 500+ hours of real technical interviews, mock sessions and engineering analyses with software developers.',
        url: ARCHIVE_URL
      },
      knowsAbout: KNOWS_ABOUT,
      knowsLanguage: KNOWS_LANGUAGE,
      founder: { '@type': 'Organization', '@id': `${SITE_URL}#organization` }
    }
  };

  const organization = {
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: 'Simple Software LTDA',
    url: 'https://www.robsoncassiano.software/',
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}#logo`,
      url: `${SITE_URL}assets/images/Robson-Cassiano.webp`,
      caption: 'Simple Software'
    },
    founder: { '@type': 'Person', '@id': `${SITE_URL}#person` },
    description: isBr
      ? 'Software house e consultoria de alta engenharia fundada por Robson Cassiano.'
      : 'High-engineering software house and consultancy founded by Robson Cassiano.',
    sameAs: ORG_SAME_AS
  };

  const course = {
    '@type': 'Course',
    '@id': 'https://global.robsoncassiano.software/#program',
    name: isBr
      ? 'Descomplica DEV Na Gringa - Mentoria de Carreira Internacional'
      : 'Descomplica DEV Na Gringa - International Career Mentorship',
    description: isBr
      ? 'Programa de mentoria e aceleração para desenvolvedores conquistarem contratos internacionais acima de R$ 30.000 mensais, fundamentado em um acervo auditável de mais de 500 horas de entrevistas técnicas reais.'
      : 'Mentorship and career acceleration program for engineers targeting international contracts above US$ 6,000/month, grounded in an auditable archive of 500+ hours of real technical interviews.',
    inLanguage: locale,
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'P3M' },
    hasPart: {
      '@type': 'ItemList',
      name: isBr ? 'Acervo de +500 Horas de Entrevistas Gravadas' : 'Archive of 500+ Hours of Recorded Interviews',
      url: ARCHIVE_URL
    },
    provider: { '@type': 'Person', '@id': `${SITE_URL}#person` },
    url: 'https://global.robsoncassiano.software/',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'BRL',
      category: isBr ? 'Mentoria & Aceleração de Carreira' : 'Mentorship & Career Acceleration',
      availability: 'https://schema.org/InStock',
      url: 'https://global.robsoncassiano.software/'
    }
  };

  const faq = {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}#faq`,
    inLanguage: locale,
    mainEntity: FAQ_KEYS.map((key) => ({
      '@type': 'Question',
      name: stripHtml(t(key)),
      acceptedAnswer: { '@type': 'Answer', text: stripHtml(t(key.replace('_Q', '_A'))) }
    }))
  };

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    '@id': `${SITE_URL}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isBr ? 'Início' : 'Home', item: SITE_URL }
    ]
  };

  return { '@context': 'https://schema.org', '@graph': [profilePage, organization, course, faq, breadcrumb] };
}

function injectStructuredData(html, lang) {
  const jsonLd = JSON.stringify(buildStructuredData(lang), null, 2);
  const scriptTag = `  <script id="structured-data" type="application/ld+json">\n${jsonLd}\n  </script>`;
  const pattern = /<script id="structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/;
  if (!pattern.test(html)) {
    console.warn(`⚠ structured-data não encontrado para injeção (${lang}).`);
    return html;
  }
  // Function replacer keeps "$1"/"$&" sequences in the copy literal.
  return html.replace(pattern, () => scriptTag);
}

// 3. Gerar a versão estática pré-renderizada em Inglês para /en/index.html
const rootDistIndex = path.join(distDir, 'index.html');
const enDir = path.join(distDir, 'en');

if (fs.existsSync(rootDistIndex)) {
  fs.mkdirSync(enDir, { recursive: true });

  // 3a. Rebuild the PT structured data from br.json (single source of truth)
  const rawHtml = injectStructuredData(await Bun.file(rootDistIndex).text(), 'br');

  // 3b. Static semantic shell for the PT host document: navigation, the full
  // article catalogue, proof metrics and FAQ text, served to clients that never
  // run JavaScript. Angular replaces the whole block on bootstrap.
  const ptShellHtml = injectShell(rawHtml, buildStaticShell({
    lang: 'br',
    t: (key) => i18nBr[key] || key,
    articles,
    translations: {},
  }));
  await Bun.write(rootDistIndex, ptShellHtml);

  const enIndexHtml = ptShellHtml
    .replace('<html lang="pt-BR"', '<html lang="en"')
    .replace(
      /<title>.*?<\/title>/i,
      '<title>Robson Cassiano: Senior Java Backend Engineer | 2026</title>'
    )
    .replace(
      /<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i,
      '<meta name="description" content="Senior Software Engineer with 10+ years architecting high-throughput Java/Spring systems and resilient PostgreSQL databases for global enterprises.">'
    )
    .replace(
      /<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i,
      '<link rel="canonical" href="https://eu.robsoncassiano.software/en/" />'
    )
    // The EN portal is its own document: every self-referencing URL must use the
    // final /en/ form (the bare /en 308-redirects to it) and every social/agent
    // alternate must point to the English artefacts, never back to the PT ones.
    .replace(/(<link\s+rel=["']alternate["']\s+hreflang=["']en["']\s+href=["'])[^"']*(["'])/i, '$1https://eu.robsoncassiano.software/en/$2')
    .replace(/(<meta\s+property=["']og:url["']\s+content=["'])[^"']*(["'])/i, '$1https://eu.robsoncassiano.software/en/$2')
    .replace(/(<link\s+rel=["']alternate["']\s+type=["']text\/markdown["']\s+href=["'])[^"']*(["'])/i, '$1https://eu.robsoncassiano.software/index-en.md$2')
    .replace(
      /<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i,
      '<meta property="og:title" content="Robson Cassiano: Senior Java Backend Engineer | 2026">'
    )
    .replace(
      /<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i,
      '<meta property="og:description" content="Senior Software Engineer with 10+ years architecting high-throughput Java/Spring systems and resilient PostgreSQL databases for global enterprises.">'
    )
    // og:locale must be en_US and its alternate the original pt_BR; a naive swap
    // would leave both on en_US.
    .replace(/(<meta\s+property=["']og:locale["']\s+content=["'])[^"']*(["'])/i, '$1en_US$2')
    .replace(/(<meta\s+property=["']og:locale:alternate["']\s+content=["'])[^"']*(["'])/i, '$1pt_BR$2')
    .replace(
      /<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i,
      '<meta name="twitter:title" content="Robson Cassiano: Senior Java Backend Engineer | 2026">'
    )
    .replace(
      /<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i,
      '<meta name="twitter:description" content="Senior Software Engineer with 10+ years architecting high-throughput Java/Spring systems and resilient PostgreSQL databases for global enterprises.">'
    );

  // 3c. Inject EN structured data (en-US) so non-JS crawlers never see PT schema on /en,
  // then swap the PT shell for an EN shell built from en.json + articles.en.json.
  const enIndexWithSchema = injectStructuredData(enIndexHtml, 'en');
  const enShellHtml = injectShell(enIndexWithSchema, buildStaticShell({
    lang: 'en',
    t: (key) => i18nEn[key] || key,
    articles,
    translations: articlesEn,
  }));
  await Bun.write(path.join(enDir, 'index.html'), enShellHtml);
  console.log('✓ Pré-renderizado portal em Inglês em dist/en/index.html (SEO Internacional /en + shell EN)');
}

// 4. Blog hub: a real /artigos/ collection page for the article cluster, which also
// gives the host shell a stable internal-linking target.
const hubDir = path.join(distDir, 'artigos');
fs.mkdirSync(hubDir, { recursive: true });
await Bun.write(
  path.join(hubDir, 'index.html'),
  buildArticlesHub({ articles, t: (key) => i18nBr[key] || key, stylesHref })
);
await Bun.write(
  path.join(hubDir, 'index.md'),
  buildArticlesHubMarkdown({ articles, t: (key) => i18nBr[key] || key })
);
console.log(`✓ Hub de artigos gerado em dist/artigos/index.html (+ index.md, ${articles.length} artigos)`);
