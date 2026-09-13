import fs from 'node:fs';
import path from 'node:path';

const contentDir = path.resolve('content/articles');
const targetJson = path.resolve('src/assets/content/articles.json');
const targetSitemap = path.resolve('sitemap.xml');

if (!fs.existsSync(contentDir)) {
  console.log('Nenhum diretório content/articles encontrado.');
  process.exit(0);
}

const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
const articles = [];
const today = new Date().toISOString().split('T')[0];

for (const file of files) {
  const filePath = path.join(contentDir, file);
  const raw = await Bun.file(filePath).text();
  
  // Parse frontmatter
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) continue;

  const frontmatterStr = match[1];
  const markdownBody = match[2].trim();

  const meta = {};
  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      
      // Remove aspas
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // Parse array
      if (val.startsWith('[') && val.endsWith(']')) {
        try {
          val = JSON.parse(val.replace(/'/g, '"'));
        } catch (e) {
          val = val.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
        }
      }
      meta[key] = val;
    }
  }

  const slug = meta.slug || file.replace(/\.md$/, '');

  articles.push({
    slug,
    title: meta.title || 'Sem título',
    date: meta.date || '2026-08-25',
    updated: meta.updated || meta.date || '2026-08-25',
    author: meta.author || 'Robson Cassiano',
    category: meta.category || 'Geral',
    readTime: meta.readTime || '5 min de leitura',
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    summary: meta.summary || '',
    coverImage: meta.coverImage || 'assets/images/Robson-Cassiano.webp',
    ogImage: meta.ogImage || `assets/images/og/${slug}.jpg`,
    canonicalUrl: meta.canonicalUrl || `https://eu.robsoncassiano.software/artigos/${slug}/`,
    youtubeVideoId: meta.youtubeVideoId || undefined,
    videoDuration: meta.videoDuration || undefined,
    content: markdownBody
  });
}

// Ordenar por data decrescente
articles.sort((a, b) => b.date.localeCompare(a.date));

// 1. Salvar JSON para a SPA do Angular via Bun.write
fs.mkdirSync(path.dirname(targetJson), { recursive: true });
await Bun.write(targetJson, JSON.stringify(articles, null, 2));
console.log(`✓ Sincronizados ${articles.length} artigos em ${targetJson}`);

// 1a. Catálogo de listagem consumido em runtime pelo Angular.
//
// O articles.json acima é insumo de build: 85% do peso dele são os corpos em
// markdown, usados só por generate-static-articles.js para pré-renderizar as
// páginas /artigos/{slug}/. O app nunca lê `content`: os cards usam apenas
// slug, título, resumo, tags, categoria, data e tempo de leitura. Emitir um
// catálogo sem os corpos tira 37 KB (93% gzip) de toda visita à home.
const targetIndexJson = path.resolve('src/assets/content/articles-index.json');
await Bun.write(
  targetIndexJson,
  JSON.stringify(
    articles.map(({ content, ...listing }) => listing),
    null,
    2
  )
);
console.log(`✓ Catálogo de listagem (sem corpos) em ${targetIndexJson}`);

// 1b. Depoimentos (content/testimonials/*.md) -> src/assets/content/testimonials.json
const testimonialsDir = path.resolve('content/testimonials');
const targetTestimonials = path.resolve('src/assets/content/testimonials.json');
let testimonials = [];

if (fs.existsSync(testimonialsDir)) {
  for (const file of fs.readdirSync(testimonialsDir).filter((f) => f.endsWith('.md'))) {
    const raw = await Bun.file(path.join(testimonialsDir, file)).text();
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) continue;

    const meta = {};
    for (const line of match[1].split('\n')) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (val.startsWith('[') && val.endsWith(']')) {
        try {
          val = JSON.parse(val.replace(/'/g, '"'));
        } catch {
          val = val.slice(1, -1).split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean);
        }
      }
      meta[key] = val;
    }

    testimonials.push({
      slug: meta.slug || file.replace(/\.md$/, ''),
      name: meta.name || '',
      role: meta.role || '',
      category: meta.category || 'Depoimento',
      headline: meta.headline || '',
      quote: meta.quote || '',
      metrics: Array.isArray(meta.metrics) ? meta.metrics : [],
      images: Array.isArray(meta.images) ? meta.images : [],
      evidence: meta.evidence || '',
      consent: meta.consent === 'true',
      date: meta.date || today,
      body: match[2].trim(),
    });
  }
}

testimonials.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

if (testimonials.length) {
  await Bun.write(targetTestimonials, JSON.stringify(testimonials, null, 2));
  const missingConsent = testimonials.filter((t) => !t.consent);
  console.log(`✓ Sincronizados ${testimonials.length} depoimentos em ${targetTestimonials}`);
  if (missingConsent.length) {
    console.warn(`⚠ ${missingConsent.length} depoimento(s) sem consentimento registrado: ${missingConsent.map((t) => t.slug).join(', ')}`);
  }
}

// 2. Gerar sitemap.xml dinâmico e internacionalizado (W3C / Google Search Central Standard)

const sitemapEntries = [
  `  <!-- Página Principal (Português / Canônico x-default) -->
  <url>
    <loc>https://eu.robsoncassiano.software/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="pt" href="https://eu.robsoncassiano.software/" />
    <xhtml:link rel="alternate" hreflang="pt-BR" href="https://eu.robsoncassiano.software/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://eu.robsoncassiano.software/en/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://eu.robsoncassiano.software/" />
    <image:image>
      <image:loc>https://eu.robsoncassiano.software/assets/images/Robson-Cassiano.webp</image:loc>
      <image:title>Robson Cassiano - Senior Software Engineer &amp; Mentor Internacional</image:title>
      <image:caption>Robson Cassiano - Senior Software Engineer especializado em Java Backend, mentor de carreiras internacionais e filósofo clássico</image:caption>
    </image:image>
  </url>`,

  `  <!-- Dedicated English Portal (International SEO / English Speakers) -->
  <url>
    <loc>https://eu.robsoncassiano.software/en/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
    <xhtml:link rel="alternate" hreflang="pt" href="https://eu.robsoncassiano.software/" />
    <xhtml:link rel="alternate" hreflang="pt-BR" href="https://eu.robsoncassiano.software/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://eu.robsoncassiano.software/en/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://eu.robsoncassiano.software/" />
    <image:image>
      <image:loc>https://eu.robsoncassiano.software/assets/images/Robson-Cassiano.webp</image:loc>
      <image:title>Robson Cassiano - Senior Java Backend Engineer &amp; Enterprise Architect</image:title>
      <image:caption>Robson Cassiano - Senior Java Backend Engineer and Enterprise Software Architect</image:caption>
    </image:image>
  </url>`,

  `  <!-- Hub de Artigos (Blog) -->
  <url>
    <loc>https://eu.robsoncassiano.software/artigos/</loc>
    <lastmod>${articles[0]?.updated || articles[0]?.date || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <image:image>
      <image:loc>https://eu.robsoncassiano.software/assets/images/Robson-Cassiano.webp</image:loc>
      <image:title>Artigos e Ensaios de Engenharia de Software</image:title>
    </image:image>
  </url>`,

  `  <!-- Depoimentos (prova pública com prints de evidência) -->
  <url>
    <loc>https://eu.robsoncassiano.software/depoimentos/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,

  `  <!-- Política de Privacidade (LGPD) — referenciada em todos os e-mails da régua -->
  <url>
    <loc>https://eu.robsoncassiano.software/privacidade/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`
];

for (const art of articles) {
  sitemapEntries.push(`  <!-- Artigo: ${art.title} -->
  <url>
    <loc>https://eu.robsoncassiano.software/artigos/${art.slug}/</loc>
    <lastmod>${art.updated || art.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
    <image:image>
      <image:loc>https://eu.robsoncassiano.software/${art.ogImage || art.coverImage}</image:loc>
      <image:title>${art.title.replace(/&/g, '&amp;')}</image:title>
      <image:caption>${art.summary.replace(/&/g, '&amp;')}</image:caption>
    </image:image>
  </url>`);
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries.join('\n\n')}
</urlset>
`;

await Bun.write(targetSitemap, sitemapXml);
console.log(`✓ Gerado sitemap.xml dinâmico com ${articles.length + 5} URLs indexáveis.`);

// 3. Atualizar dinamicamente os índices de artigos dos documentos para agentes de
// IA (GEO / AI Discovery): llms.txt, llms-full.txt e os espelhos em markdown.
const articlesEn = fs.existsSync(path.resolve('src/assets/content/articles.en.json'))
  ? await Bun.file(path.resolve('src/assets/content/articles.en.json')).json()
  : {};

const canonicalLine = (a) =>
  `- [${a.title}](https://eu.robsoncassiano.software/artigos/${a.slug}/): ${a.summary} ([markdown](https://eu.robsoncassiano.software/artigos/${a.slug}.md))`;

const englishLine = (a) => {
  const tr = articlesEn[a.slug] || {};
  return `- [${tr.title || a.title}](https://eu.robsoncassiano.software/artigos/${a.slug}/): ${tr.summary || a.summary} ([markdown](https://eu.robsoncassiano.software/artigos/${a.slug}.md))`;
};

const simpleLine = (a) =>
  `- [${a.title}](https://eu.robsoncassiano.software/artigos/${a.slug}/) — ${a.date} · ${a.category}. Markdown: https://eu.robsoncassiano.software/artigos/${a.slug}.md`;

const depLines = testimonials
  .filter((t) => t.consent)
  .map((t) => `- ${t.name} — ${t.headline}: ${t.quote}`);

const catalogTargets = [
  { file: 'llms.txt', lines: articles.map(canonicalLine) },
  { file: 'llms-full.txt', lines: articles.map(simpleLine) },
  { file: 'index.md', lines: articles.map(canonicalLine) },
  { file: 'index-en.md', lines: articles.map(englishLine) },
];

for (const { file, lines } of catalogTargets) {
  const target = path.resolve(file);
  const raw = await Bun.file(target).text();
  const block = `<!-- ARTICLES:START -->\n${lines.join('\n')}\n<!-- ARTICLES:END -->`;

  if (raw.includes('<!-- ARTICLES:START -->') && raw.includes('<!-- ARTICLES:END -->')) {
    await Bun.write(target, raw.replace(/<!-- ARTICLES:START -->[\s\S]*?<!-- ARTICLES:END -->/, () => block));
    console.log(`✓ ${file} atualizado com ${articles.length} artigos canônicos.`);
  } else {
    console.warn(`⚠ ${file} sem marcadores ARTICLES:START/END — índice de artigos não atualizado.`);
  }
}

