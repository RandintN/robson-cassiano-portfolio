import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const articlesFile = path.resolve('src/assets/content/articles.json');
const distDir = path.resolve('dist');

if (!fs.existsSync(articlesFile)) {
  console.error('Arquivo articles.json não encontrado para pré-renderização.');
  process.exit(1);
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Sincronizar sitemap.xml gerado para o dist
const rootSitemap = path.resolve('sitemap.xml');
const distSitemap = path.join(distDir, 'sitemap.xml');
if (fs.existsSync(rootSitemap)) {
  fs.copyFileSync(rootSitemap, distSitemap);
  console.log('✓ sitemap.xml sincronizado em dist/sitemap.xml');
}

const articles = await Bun.file(articlesFile).json();

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

  const canonicalUrl = `https://eu.robsoncassiano.software/artigos/${art.slug}`;
  const coverImageUrl = `https://eu.robsoncassiano.software/${art.coverImage}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "headline": art.title,
    "description": art.summary,
    "image": coverImageUrl,
    "author": {
      "@type": "Person",
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
      "name": "Simple Software LTDA",
      "url": "https://www.robsoncassiano.software/",
      "logo": {
        "@type": "ImageObject",
        "url": coverImageUrl
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
    "datePublished": art.date,
    "dateModified": art.date,
    "articleSection": art.category,
    "keywords": art.tags.join(', '),
    "inLanguage": "pt-BR"
  };

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${art.title} | Robson Cassiano</title>
  <meta name="description" content="${art.summary}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">

  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${art.title}">
  <meta property="og:description" content="${art.summary}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${coverImageUrl}">
  <meta property="og:site_name" content="Robson Cassiano - Senior Software Engineer">
  <meta property="article:published_time" content="${art.date}">
  <meta property="article:author" content="Robson Cassiano">
  <meta property="article:section" content="${art.category}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@RobsonDev">
  <meta name="twitter:creator" content="@RobsonDev">
  <meta name="twitter:title" content="${art.title}">
  <meta name="twitter:description" content="${art.summary}">
  <meta name="twitter:image" content="${coverImageUrl}">

  <!-- Schema.org JSON-LD Structured Data for Googlebot & LLMs -->
  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>

  <script src="https://cdn.tailwindcss.com"></script>
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
    body { background-color: #020617; color: #cbd5e1; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    .article-body h1 { font-size: 1.875rem; font-weight: 800; color: #ffffff; margin-top: 2rem; margin-bottom: 1rem; line-height: 1.3; }
    .article-body h2 { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-top: 2rem; margin-bottom: 0.75rem; border-left: 4px solid #a3e635; padding-left: 0.75rem; }
    .article-body h3 { font-size: 1.25rem; font-weight: 700; color: #a3e635; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    .article-body p { margin-bottom: 1.25rem; line-height: 1.8; color: #cbd5e1; font-size: 1.05rem; }
    .article-body ul, .article-body ol { margin-left: 1.5rem; margin-bottom: 1.25rem; color: #cbd5e1; list-style-type: disc; }
    .article-body ol { list-style-type: decimal; }
    .article-body li { margin-bottom: 0.5rem; line-height: 1.6; }
    .article-body strong { color: #ffffff; font-weight: 700; }
    .article-body em { color: #e2e8f0; font-style: italic; }
    .article-body blockquote { border-left: 4px solid #a3e635; padding: 1rem 1.25rem; margin: 1.5rem 0; background: rgba(30, 41, 59, 0.6); border-radius: 0 0.75rem 0.75rem 0; color: #e2e8f0; font-style: italic; }
    .article-body blockquote p { margin-bottom: 0; }
    .article-body pre { background: #0b0f19; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1.25rem; overflow-x: auto; margin: 1.5rem 0; font-family: ui-monospace, monospace; font-size: 0.9rem; color: #f8fafc; }
    .article-body code { font-family: ui-monospace, monospace; font-size: 0.875rem; color: #a3e635; background: rgba(15, 23, 42, 0.9); padding: 0.2rem 0.4rem; border-radius: 0.25rem; }
    .article-body pre code { color: #f8fafc; background: transparent; padding: 0; }
    .article-body table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; border: 1px solid #334155; border-radius: 0.75rem; overflow: hidden; }
    .article-body th { background-color: #1e293b; color: #ffffff; font-weight: 700; text-align: left; padding: 0.75rem 1rem; border: 1px solid #334155; font-size: 0.9rem; }
    .article-body td { padding: 0.75rem 1rem; border: 1px solid #334155; color: #cbd5e1; font-size: 0.95rem; }
    .article-body tr:nth-child(even) { background-color: rgba(30, 41, 59, 0.4); }
    .article-body hr { border-color: #1e293b; margin: 2.5rem 0; }
    .article-body a { color: #a3e635; text-decoration: underline; text-underline-offset: 3px; }
    .article-body img { max-width: 100%; height: auto; border-radius: 0.875rem; border: 1px solid #334155; margin: 1.75rem auto; display: block; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .article-body figure { margin: 2rem 0; text-align: center; }
    .article-body figcaption { margin-top: 0.5rem; font-size: 0.875rem; color: #94a3b8; font-style: italic; }
    .article-video-callout { margin: 2.5rem 0; padding: 1.5rem; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.95)); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 1rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); }
    .article-video-callout .video-wrapper { position: relative; width: 100%; padding-bottom: 56.25%; height: 0; border-radius: 0.75rem; overflow: hidden; border: 1px solid #334155; background-color: #020617; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); margin-top: 0.75rem; }
    .article-video-callout .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body class="min-h-screen antialiased selection:bg-lime-500 selection:text-slate-900">

  <!-- Header -->
  <header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 group">
        <div class="w-8 h-8 bg-gradient-to-br from-lime-400 to-green-600 rounded-lg flex items-center justify-center text-slate-900 font-bold">R</div>
        <span class="font-bold text-lg tracking-tight text-white group-hover:text-lime-400 transition-colors">Robson<span class="text-lime-400">Cassiano</span></span>
      </a>
      <a href="/#artigos" class="text-sm font-semibold text-slate-300 hover:text-lime-400 transition-colors flex items-center gap-1">
        <span>&larr;</span> <span>Todos os Artigos</span>
      </a>
    </div>
  </header>

  <!-- Breadcrumb -->
  <nav aria-label="Breadcrumb" class="max-w-4xl mx-auto px-6 pt-6">
    <ol class="flex items-center gap-2 text-xs text-slate-500">
      <li><a href="/" class="hover:text-slate-400">Início</a></li>
      <li>/</li>
      <li><a href="/#artigos" class="hover:text-slate-400">Blog</a></li>
      <li>/</li>
      <li class="text-slate-300 truncate max-w-xs">${art.title}</li>
    </ol>
  </nav>

  <!-- Main Article Content -->
  <main class="max-w-4xl mx-auto px-6 py-8">
    <article itemscope itemtype="https://schema.org/BlogPosting">
      
      <!-- Header -->
      <header class="mb-10 pb-8 border-b border-slate-800">
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-lime-500/10 text-lime-400 border border-lime-500/20 uppercase tracking-wider">
            ${art.category}
          </span>
          <span class="text-slate-600">•</span>
          <time datetime="${art.date}" class="text-slate-400 text-xs">${art.date}</time>
          <span class="text-slate-600">•</span>
          <span class="text-slate-400 text-xs">${art.readTime}</span>
        </div>

        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6" itemprop="headline">
          ${art.title}
        </h1>

        <p class="text-lg text-slate-400 leading-relaxed mb-6 font-medium" itemprop="description">
          ${art.summary}
        </p>

        <!-- Author Card -->
        <div class="flex items-center gap-4 pt-4 border-t border-slate-900" itemprop="author" itemscope itemtype="https://schema.org/Person">
          <img src="/assets/images/robson-cassiano-mentor.jpg" width="48" height="48" alt="Robson Cassiano" class="w-12 h-12 rounded-full border border-slate-700 object-cover" itemprop="image">
          <div>
            <span class="text-base font-bold text-white block" itemprop="name">Robson Cassiano</span>
            <span class="text-xs text-slate-400 block" itemprop="jobTitle">Software Engineer na Epic Games & Cambridge CELTA Certified Teacher</span>
          </div>
        </div>
      </header>

      <!-- Semantic Body -->
      <div class="article-body" itemprop="articleBody">
        ${articleHtml}
      </div>

      <!-- Pre-Sold Authority / Mentorship Banner -->
      <section class="mt-12 p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-lime-500/30 shadow-2xl relative overflow-hidden">
        <div class="inline-block px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs font-bold mb-3 uppercase tracking-wider">
          Aceleração de Carreira Internacional
        </div>
        <h3 class="text-2xl font-bold text-white mb-3">
          Quer faturar de R$ 30k a R$ 60k+/mês como Dev Sênior no Exterior?
        </h3>
        <p class="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
          No programa <strong>Descomplica DEV Na Gringa</strong>, você domina entrevistas técnicas em inglês ("Real English"), negociação salarial em moeda forte (USD/EUR) e posicionamento estratégico global.
        </p>
        <div class="flex flex-wrap gap-4">
          <a href="https://global.robsoncassiano.software/" target="_blank" rel="noopener noreferrer" class="px-6 py-3 bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-lime-500/20 inline-flex items-center gap-2">
            <span>Conhecer o Método 30k+ & Casos Reais</span>
            <span>&rarr;</span>
          </a>
          <a href="/#artigos" class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors">
            Explorar Outros Artigos
          </a>
        </div>
      </section>

    </article>
  </main>

  <!-- Footer -->
  <footer class="border-t border-slate-800 py-10 mt-16 bg-slate-950 text-center text-xs text-slate-500">
    <p>© ${new Date().getFullYear()} Robson Cassiano. Todos os direitos reservados.</p>
    <p class="mt-2"><a href="/" class="text-lime-400 hover:underline">eu.robsoncassiano.software</a> | <a href="https://global.robsoncassiano.software/" class="text-lime-400 hover:underline">global.robsoncassiano.software</a></p>
  </footer>

</body>
</html>`;

  await Bun.write(path.join(targetDir, 'index.html'), htmlContent);
  console.log(`✓ Pré-renderizado HTML semântico com JSON-LD em dist/artigos/${art.slug}/index.html`);
}

console.log(`✓ Geração estática de ${articles.length} artigos finalizada com sucesso.`);

// 3. Gerar a versão estática pré-renderizada em Inglês para /en/index.html
const rootDistIndex = path.join(distDir, 'index.html');
const enDir = path.join(distDir, 'en');

if (fs.existsSync(rootDistIndex)) {
  fs.mkdirSync(enDir, { recursive: true });
  const rawHtml = await Bun.file(rootDistIndex).text();

  const enIndexHtml = rawHtml
    .replace('<html lang="pt-BR"', '<html lang="en"')
    .replace(
      /<title>.*?<\/title>/i,
      '<title>Robson Cassiano | Senior Java Backend Engineer &amp; Enterprise Architect</title>'
    )
    .replace(
      /<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i,
      '<meta name="description" content="Senior Software Engineer with 10+ years architecting high-throughput Java/Spring systems, resilient PostgreSQL databases, and high-performance microservices for global enterprises.">'
    )
    .replace(
      /<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i,
      '<link rel="canonical" href="https://eu.robsoncassiano.software/en">'
    )
    .replace(
      /<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i,
      '<meta property="og:title" content="Robson Cassiano | Senior Java Backend Engineer &amp; Enterprise Architect">'
    )
    .replace(
      /<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i,
      '<meta property="og:description" content="Senior Software Engineer with 10+ years architecting high-throughput Java/Spring systems, resilient PostgreSQL databases, and high-performance microservices for global enterprises.">'
    )
    .replace(
      /<meta\s+property=["']og:locale["']\s+content=["']pt_BR["']\s*\/?>/i,
      '<meta property="og:locale" content="en_US">'
    )
    .replace(
      /<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i,
      '<meta name="twitter:title" content="Robson Cassiano | Senior Java Backend Engineer &amp; Enterprise Architect">'
    )
    .replace(
      /<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i,
      '<meta name="twitter:description" content="Senior Software Engineer with 10+ years architecting high-throughput Java/Spring systems, resilient PostgreSQL databases, and high-performance microservices for global enterprises.">'
    )
    .replace(
      'Engenheiro de Software Sênior &amp; Mentor Global',
      'Senior Java Backend Engineer &amp; Enterprise Architect'
    )
    .replace(
      'Nem só de <span style="color: #a3e635;">código</span> vive o DEV.',
      'Engineering <span style="color: #a3e635;">high-throughput</span> resilient systems.'
    )
    .replace(
      'Especialista em Java Backend, filósofo clássico e mentor de carreiras internacionais. Construindo o futuro sobre os ombros de gigantes para levar devs sênior a faturar +R$ 30k/mês no exterior.',
      'Specialized in Enterprise Java, high-performance Spring Boot microservices, scalable PostgreSQL databases, and clean distributed architectures. +10 years delivering robust software for global operations.'
    );

  await Bun.write(path.join(enDir, 'index.html'), enIndexHtml);
  console.log('✓ Pré-renderizado portal em Inglês em dist/en/index.html (SEO Internacional /en)');
}
