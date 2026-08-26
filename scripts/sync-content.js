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

for (const file of files) {
  const raw = fs.readFileSync(path.join(contentDir, file), 'utf-8');
  
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
    author: meta.author || 'Robson Cassiano',
    category: meta.category || 'Geral',
    readTime: meta.readTime || '5 min de leitura',
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    summary: meta.summary || '',
    coverImage: meta.coverImage || 'assets/images/robson-cassiano-mentor.jpg',
    canonicalUrl: meta.canonicalUrl || `https://eu.robsoncassiano.software/artigos/${slug}`,
    youtubeVideoId: meta.youtubeVideoId || undefined,
    content: markdownBody
  });
}

// Ordenar por data decrescente
articles.sort((a, b) => b.date.localeCompare(a.date));

// 1. Salvar JSON para a SPA do Angular
fs.mkdirSync(path.dirname(targetJson), { recursive: true });
fs.writeFileSync(targetJson, JSON.stringify(articles, null, 2), 'utf-8');
console.log(`✓ Sincronizados ${articles.length} artigos em ${targetJson}`);

// 2. Gerar sitemap.xml dinâmico e internacionalizado (W3C / Google Search Central Standard)
const today = new Date().toISOString().split('T')[0];

const sitemapEntries = [
  `  <!-- Página Principal (Português / Canônico x-default) -->
  <url>
    <loc>https://eu.robsoncassiano.software/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="pt" href="https://eu.robsoncassiano.software/" />
    <xhtml:link rel="alternate" hreflang="pt-BR" href="https://eu.robsoncassiano.software/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://eu.robsoncassiano.software/en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://eu.robsoncassiano.software/" />
    <image:image>
      <image:loc>https://eu.robsoncassiano.software/assets/images/robson-cassiano-mentor.jpg</image:loc>
      <image:title>Robson Cassiano - Senior Software Engineer &amp; Mentor Internacional</image:title>
      <image:caption>Robson Cassiano - Senior Software Engineer especializado em Java Backend, mentor de carreiras internacionais e filósofo clássico</image:caption>
    </image:image>
  </url>`,

  `  <!-- Dedicated English Portal (International SEO / English Speakers) -->
  <url>
    <loc>https://eu.robsoncassiano.software/en</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
    <xhtml:link rel="alternate" hreflang="pt" href="https://eu.robsoncassiano.software/" />
    <xhtml:link rel="alternate" hreflang="pt-BR" href="https://eu.robsoncassiano.software/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://eu.robsoncassiano.software/en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://eu.robsoncassiano.software/" />
    <image:image>
      <image:loc>https://eu.robsoncassiano.software/assets/images/robson-cassiano-mentor.jpg</image:loc>
      <image:title>Robson Cassiano - Senior Java Backend Engineer &amp; Enterprise Architect</image:title>
      <image:caption>Robson Cassiano - Senior Java Backend Engineer and Enterprise Software Architect</image:caption>
    </image:image>
  </url>`
];

for (const art of articles) {
  sitemapEntries.push(`  <!-- Artigo: ${art.title} -->
  <url>
    <loc>https://eu.robsoncassiano.software/artigos/${art.slug}</loc>
    <lastmod>${art.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
    <image:image>
      <image:loc>https://eu.robsoncassiano.software/${art.coverImage}</image:loc>
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

fs.writeFileSync(targetSitemap, sitemapXml, 'utf-8');
console.log(`✓ Gerado sitemap.xml dinâmico com ${articles.length + 2} URLs indexáveis.`);

