import fs from 'node:fs';
import path from 'node:path';

const contentDir = path.resolve('content/articles');
const targetFile = path.resolve('src/assets/content/articles.json');

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

  articles.push({
    slug: meta.slug || file.replace(/\.md$/, ''),
    title: meta.title || 'Sem título',
    date: meta.date || '2026',
    author: meta.author || 'Robson Cassiano',
    category: meta.category || 'Geral',
    readTime: meta.readTime || '5 min de leitura',
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    summary: meta.summary || '',
    coverImage: meta.coverImage || 'assets/images/robson-cassiano-mentor.jpg',
    canonicalUrl: meta.canonicalUrl || `https://eu.robsoncassiano.software/artigos/${meta.slug}`,
    content: markdownBody
  });
}

// Ordenar por data decrescente
articles.sort((a, b) => b.date.localeCompare(a.date));

fs.mkdirSync(path.dirname(targetFile), { recursive: true });
fs.writeFileSync(targetFile, JSON.stringify(articles, null, 2), 'utf-8');
console.log(`✓ Sincronizados ${articles.length} artigos em ${targetFile}`);
