/**
 * Guards the pre-rendered output against silent regressions.
 *
 * The build manipulates HTML through regular expressions and string templates,
 * so a broken injection can ship quietly (a stray backreference once duplicated
 * "<app-root>" inside the English FAQ copy). These assertions fail the build
 * instead of the search index.
 */
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const articles = await Bun.file(path.resolve('src/assets/content/articles.json')).json();

const problems = [];
const checks = { total: 0 };

function check(label, condition, detail = '') {
  checks.total += 1;
  if (!condition) problems.push(`${label}${detail ? ` → ${detail}` : ''}`);
}

function read(file) {
  check(`arquivo existe: ${file}`, fs.existsSync(file));
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function count(html, pattern) {
  return (html.match(pattern) || []).length;
}

// ---------------------------------------------------------------------------
// 1. Host documents must carry exactly one intact <app-root> with a rich shell.
// ---------------------------------------------------------------------------
for (const [file, lang, minText] of [
  ['index.html', 'pt-BR', 4000],
  [path.join('en', 'index.html'), 'en', 4000],
]) {
  const full = path.join(distDir, file);
  const html = read(full);
  if (!html) continue;

  check(`${file}: um único <app-root>`, count(html, /<app-root[^>]*>/g) === 1, `encontrados ${count(html, /<app-root[^>]*>/g)}`);
  check(`${file}: </app-root> presente`, count(html, /<\/app-root>/g) === 1);
  check(
    `${file}: nenhum <app-root> dentro do shell (backreference vazado)`,
    !/<div id="static-shell"[\s\S]*?<app-root/i.test(html)
  );

  const shellMatch = html.match(/<div id="static-shell"[\s\S]*?<\/footer>\s*<\/div>/);
  check(`${file}: shell estático presente`, Boolean(shellMatch));
  if (shellMatch) {
    const visible = shellMatch[0]
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    check(`${file}: texto visível ≥ ${minText} chars`, visible.length >= minText, `${visible.length} chars`);
    check(
      `${file}: cataloga os ${articles.length} artigos`,
      count(shellMatch[0], /class="ss-meta"/g) === articles.length,
      `${count(shellMatch[0], /class="ss-meta"/g)} cards`
    );
    check(
      `${file}: links internos para os artigos`,
      count(shellMatch[0], /href="\/artigos\/[^"]+\/"/g) >= articles.length,
      `${count(shellMatch[0], /href="\/artigos\/[^"]+\/"/g)} links`
    );
  }

  check(`${file}: <html lang="${lang}">`, new RegExp(`<html[^>]*lang="${lang}"`).test(html));
  check(`${file}: um único <h1>`, count(html, /<h1[\s>]/g) === 1, `${count(html, /<h1[\s>]/g)}`);

  const schema = html.match(/<script id="structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  check(`${file}: structured-data presente`, Boolean(schema));
  if (schema) {
    try {
      JSON.parse(schema[1]);
      check(`${file}: structured-data é JSON válido`, true);
    } catch (error) {
      check(`${file}: structured-data é JSON válido`, false, error.message);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Every article: page, markdown twin, canonical, hreflang and stylesheet.
// ---------------------------------------------------------------------------
let stylesHref = null;

for (const article of articles) {
  const page = path.join(distDir, 'artigos', article.slug, 'index.html');
  const html = read(page);
  if (!html) continue;

  const canonical = `https://eu.robsoncassiano.software/artigos/${article.slug}/`;
  check(`${article.slug}: canonical`, html.includes(`rel="canonical" href="${canonical}"`));
  check(`${article.slug}: hreflang pt-BR`, html.includes(`hreflang="pt-BR" href="${canonical}"`));
  check(`${article.slug}: robots index`, /name="robots" content="index, follow/.test(html));
  check(`${article.slug}: alternates de markdown/llms`, html.includes(`${article.slug}.md`) && html.includes('llms.txt'));
  check(`${article.slug}: um único <h1>`, count(html, /<h1[\s>]/g) === 1);
  check(`${article.slug}: imagens com alt`, count(html, /<img(?![^>]*\balt=)[^>]*>/g) === 0);
  check(`${article.slug}: data-lang do SDK`, html.includes('data-lang="pt-BR"'));
  check(
    `${article.slug}: FAQ schema preservado`,
    html.includes('"@type": "BlogPosting"') && html.includes('"@type": "BreadcrumbList"')
  );

  const md = path.join(distDir, 'artigos', `${article.slug}.md`);
  const markdown = read(md);
  if (markdown) {
    check(`${article.slug}.md: canonical declarada`, markdown.includes(`Canonical URL: ${canonical}`));
    check(`${article.slug}.md: corpo não vazio`, markdown.split('\n').length > 20);
  }

  const match = html.match(/<link rel="stylesheet" href="(\/styles-artigos\.[a-f0-9]+\.css)">/);
  if (match) stylesHref = match[1];
  else problems.push(`${article.slug}: stylesheet hasheado ausente`);
}

check('CSS hasheado é referenciado de forma consistente', Boolean(stylesHref));
if (stylesHref) {
  check(`CSS hasheado existe em dist (${stylesHref})`, fs.existsSync(path.join(distDir, stylesHref)));
}

// ---------------------------------------------------------------------------
// 3. Blog hub, sitemap and agent catalogs.
// ---------------------------------------------------------------------------
const hub = read(path.join(distDir, 'artigos', 'index.html'));
check('hub: um único <h1>', count(hub, /<h1[\s>]/g) === 1);
check('hub: lista os artigos', count(hub, /class="hub-meta"/g) === articles.length, `${count(hub, /class="hub-meta"/g)}`);
check('hub: CollectionPage + ItemList', hub.includes('"@type": "CollectionPage"') && hub.includes('"@type": "ItemList"'));
check('hub: canonical com barra final', hub.includes('rel="canonical" href="https://eu.robsoncassiano.software/artigos/"'));
check('hub: markdown twin', fs.existsSync(path.join(distDir, 'artigos', 'index.md')));

const sitemap = read(path.join(distDir, 'sitemap.xml'));
const locs = count(sitemap, /<loc>/g);
check(`sitemap: ${articles.length + 3} URLs`, locs === articles.length + 3, `${locs}`);
check('sitemap: hub presente', sitemap.includes('<loc>https://eu.robsoncassiano.software/artigos/</loc>'));
check('sitemap: /en/ com barra final', sitemap.includes('<loc>https://eu.robsoncassiano.software/en/</loc>'));
check('sitemap: nenhuma URL sem barra final além da raiz', !/<loc>https:\/\/[^<]*[a-z0-9]<\/loc>/.test(sitemap));

for (const catalog of ['llms.txt', 'llms-full.txt', 'index.md', 'index-en.md']) {
  const content = read(path.resolve(catalog));
  const listed = count(content, /eu\.robsoncassiano\.software\/artigos\/[a-z0-9-]+\//g);
  check(`${catalog}: cataloga os artigos`, listed >= articles.length, `${listed} referências`);
  check(`${catalog}: marcadores ARTICLES preservados`, content.includes('<!-- ARTICLES:START -->') && content.includes('<!-- ARTICLES:END -->'));
}

// ---------------------------------------------------------------------------
const label = problems.length === 0 ? 'OK' : 'FALHOU';
console.log(`\n${problems.length === 0 ? '✓' : '✗'} Validação do build: ${label} (${checks.total} verificações)`);
if (problems.length) {
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}
