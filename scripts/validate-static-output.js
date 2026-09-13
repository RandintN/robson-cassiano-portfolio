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
import { readWebpDimensions } from './lib/testimonials-page.js';

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
// 0. Drift de dependência entre o build local e o build do CI.
//
// O deploy roda na integração Git do Cloudflare Pages, que instala pelo
// bun.lock. Mas os ranges do package.json são abertos (`^21.0.0`) e a versão
// efetivamente resolvida fica gravada no HTML que os scripts de build escrevem.
// O build local roda com o node_modules instalado e o do CI com o lock: quando
// os dois divergem, o site publicado sai de um Angular diferente do que foi
// validado, sem nada apontando isso. Aqui o bundle é comparado com o lock.
// ---------------------------------------------------------------------------
const angularCore = JSON.parse(fs.readFileSync(path.resolve('node_modules/@angular/core/package.json'), 'utf8')).version;
const lock = fs.readFileSync(path.resolve('bun.lock'), 'utf8');
const lockedAngular = (lock.match(/angular\/core@(\d+\.\d+\.\d+)/) || [])[1];
check(
  `Angular instalado (${angularCore}) bate com o bun.lock (${lockedAngular})`,
  Boolean(lockedAngular) && angularCore === lockedAngular,
  'rode `bun install` antes do build para alinhar com o CI'
);

const expectedRuntime = fs.existsSync(path.resolve('.node-version'))
  ? fs.readFileSync(path.resolve('.node-version'), 'utf8').trim()
  : null;
const actualRuntime = process.versions.node;
if (expectedRuntime && actualRuntime !== expectedRuntime) {
  // Aviso, não falha: rodar o build local em outro runtime é normal e o dano é
  // sobre o artefato, que o validador confere adiante. A divergência de Angular
  // acima é diferente, porque ela reescreve o HTML e muda o bundle publicado.
  console.warn(
    `⚠ Build rodando em Node ${actualRuntime}, mas .node-version pede ${expectedRuntime} (o que o CI usa).`
  );
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

  // O cabeçalho pré-renderizado é o que o visitante e o crawler veem antes do
  // Angular assumir. Se o item de depoimentos sumir dele, a página fica sem
  // caminho de entrada a partir da home para quem não executa JavaScript.
  const shellNav = html.match(/<nav class="ss-nav"[\s\S]*?<\/nav>/);
  check(`${file}: shell tem a nav do cabeçalho`, Boolean(shellNav));
  if (shellNav) {
    check(
      `${file}: nav do cabeçalho aponta para /depoimentos/`,
      /<a href="\/depoimentos\/" hreflang="pt-BR">/.test(shellNav[0]),
      shellNav[0].replace(/\s+/g, ' ').slice(0, 200)
    );
    check(
      `${file}: depoimentos vem logo depois dos artigos na nav`,
      /href="#artigos"[^>]*>[\s\S]*?<a href="\/depoimentos\/"/.test(shellNav[0])
    );
  }

  // The bundle is the last node of the document; without a head-level hint the
  // download only starts after the inlined critical CSS is parsed.
  const entry = html.match(/<script[^>]+src="(main-[^"]*\.js)"/i);
  check(`${file}: bundle main-*.js presente`, Boolean(entry));
  if (entry) {
    check(
      `${file}: modulepreload do bundle no head`,
      count(html, /rel="modulepreload"[^>]*href="main-[^"]*\.js"/g) === 1,
      `${count(html, /rel="modulepreload"/g)} modulepreload`
    );
    check(
      `${file}: modulepreload usa o mesmo href do bundle`,
      html.includes(`<link rel="modulepreload" crossorigin href="${entry[1]}">`),
      `esperado href="${entry[1]}"`
    );
    const headEnd = html.indexOf('</head>');
    check(`${file}: modulepreload antes de </head>`, html.indexOf('rel="modulepreload"') < headEnd);
  }

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
// 1b. Runtime asset boundary.
//
// articles.json carrega os corpos markdown completos e existe apenas como insumo
// de build. Se ele voltar a ser publicado, o app pode voltar a buscá-lo e a home
// volta a pagar 40 KB por visita, e se articles-index.json sumir os cards ficam
// vazios. As duas coisas falham aqui em vez de em produção.
// ---------------------------------------------------------------------------
const publishedCatalog = path.join(distDir, 'assets', 'content', 'articles.json');
check('articles.json (insumo de build) não é publicado', !fs.existsSync(publishedCatalog));

const runtimeCatalog = path.join(distDir, 'assets', 'content', 'articles-index.json');
check('catálogo de runtime articles-index.json existe', fs.existsSync(runtimeCatalog));
if (fs.existsSync(runtimeCatalog)) {
  const catalog = JSON.parse(fs.readFileSync(runtimeCatalog, 'utf8'));
  check(
    `catálogo de runtime com os ${articles.length} artigos`,
    catalog.length === articles.length,
    `${catalog.length}`
  );
  check(
    'catálogo de runtime não carrega os corpos markdown',
    catalog.every((entry) => !('content' in entry))
  );
  check(
    'catálogo de runtime mantém os campos usados pelos cards',
    catalog.every((entry) =>
      ['slug', 'title', 'date', 'category', 'readTime', 'tags', 'summary'].every((field) => field in entry)
    )
  );
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
check(`sitemap: ${articles.length + 5} URLs`, locs === articles.length + 5, `${locs}`);
check('sitemap: hub presente', sitemap.includes('<loc>https://eu.robsoncassiano.software/artigos/</loc>'));
check('sitemap: privacidade presente', sitemap.includes('<loc>https://eu.robsoncassiano.software/privacidade/</loc>'));
check('sitemap: depoimentos presente', sitemap.includes('<loc>https://eu.robsoncassiano.software/depoimentos/</loc>'));
check('sitemap: /en/ com barra final', sitemap.includes('<loc>https://eu.robsoncassiano.software/en/</loc>'));
check('sitemap: nenhuma URL sem barra final além da raiz', !/<loc>https:\/\/[^<]*[a-z0-9]<\/loc>/.test(sitemap));

// ---------------------------------------------------------------------------
// 4. Privacy page: the URL is printed in every drip/broadcast email, so a missing
// or empty page would leave every outbound message with a dead compliance link.
// ---------------------------------------------------------------------------
const privacy = read(path.join(distDir, 'privacidade', 'index.html'));
check('privacidade: canonical', privacy.includes('rel="canonical" href="https://eu.robsoncassiano.software/privacidade/"'));
check('privacidade: indexável', /name="robots" content="index, follow/.test(privacy));
check('privacidade: um único <h1>', count(privacy, /<h1[\s>]/g) === 1);
for (const disclosure of ['LGPD', 'consentimento', 'Cloudflare', 'contato@robsoncassiano.software', 'Turnstile', 'descadastr']) {
  check(`privacidade: divulga "${disclosure}"`, privacy.toLowerCase().includes(disclosure.toLowerCase()));
}
check('privacidade: sem AggregateRating/Review', !/aggregateRating|"@type":\s*"Review"/i.test(privacy));

// Links para a política precisam existir onde o visitante pode clicar.
for (const [file, html] of [
  ['index.html', read(path.join(distDir, 'index.html'))],
  [path.join('en', 'index.html'), read(path.join(distDir, 'en', 'index.html'))],
  ['artigos/index.html', hub],
  ['artigos/{slug}/index.html', read(path.join(distDir, 'artigos', articles[0].slug, 'index.html'))],
]) {
  check(`${file}: link para /privacidade/`, /href="\/privacidade\/"/.test(html));
  check(`${file}: link para /depoimentos/`, /href="\/depoimentos\/"/.test(html));
}

// ---------------------------------------------------------------------------
// 4b. Testimonials page (/depoimentos/) — pre-rendered, evidence-backed.
// ---------------------------------------------------------------------------
const testimonialsFile = path.resolve('src/assets/content/testimonials.json');
const testimonials = fs.existsSync(testimonialsFile)
  ? JSON.parse(fs.readFileSync(testimonialsFile, 'utf8'))
  : [];
const consenting = testimonials.filter((t) => t.consent);
const dep = read(path.join(distDir, 'depoimentos', 'index.html'));

if (testimonials.length) {
  check('depoimentos: canonical', dep.includes('rel="canonical" href="https://eu.robsoncassiano.software/depoimentos/"'));
  check('depoimentos: indexável', /name="robots" content="index, follow/.test(dep));
  check('depoimentos: um único <h1>', count(dep, /<h1[\s>]/g) === 1);
  check('depoimentos: CollectionPage + ItemList', dep.includes('"@type": "CollectionPage"') && dep.includes('"@type": "ItemList"'));
  check('depoimentos: sem AggregateRating/Review', !/aggregateRating|"@type"\s*:\s*"Review"/i.test(dep));
  check(`depoimentos: publica os ${consenting.length} relatos consentidos`, count(dep, /class="dep-card"/g) === consenting.length, `${count(dep, /class="dep-card"/g)} cards`);
  check('depoimentos: html lang pt-BR', /<html[^>]*lang="pt-BR"/.test(dep));
  check('depoimentos: markdown twin', fs.existsSync(path.join(distDir, 'depoimentos', 'index.md')));

  // SSG de verdade: o conteudo precisa estar no HTML inicial, sem JS.
  const depNoScripts = dep.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
  const depText = depNoScripts.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  for (const t of consenting) {
    check(`depoimentos: ${t.slug} presente no HTML estatico`, depText.includes(t.name), t.name);
    check(`depoimentos: ${t.slug} cita o resultado`, depText.includes(t.headline.slice(0, 30)));
    check(`depoimentos: ${t.slug} tem consentimento registrado`, t.consent === true);
    for (const image of t.images) {
      check(`depoimentos: imagem ${image} existe`, fs.existsSync(path.join(distDir, 'assets', 'images', 'depoimentos', image)));
    }
  }

  // Toda imagem publicada precisa de alt, dimensões explícitas e lazy loading (CLS/CWV).
  //
  // O atributo `width`/`height` só protege contra layout shift quando a proporção bate
  // com o arquivo: a página declarava 1200x800 fixos e o navegador reflowava ao carregar.
  // Por isso aqui a dimensão declarada é comparada com o próprio WebP, não só verificada
  // quanto à presença.
  for (const img of dep.match(/<img\b[^>]*>/g) || []) {
    check('depoimentos: img com alt', /\balt="[^"]{10,}"/.test(img));
    check('depoimentos: img com width/height', /\bwidth="\d+"/.test(img) && /\bheight="\d+"/.test(img));

    const src = (img.match(/\bsrc="([^"]+)"/) || [])[1];
    const declared = img.match(/\bwidth="(\d+)"\s+height="(\d+)"/);
    if (src && declared) {
      const file = path.join(distDir, src.replace(/^\//, ''));
      const real = fs.existsSync(file) ? readWebpDimensions(file) : null;
      if (real) {
        const declaredRatio = Number(declared[1]) / Number(declared[2]);
        const realRatio = real.width / real.height;
        check(
          `depoimentos: dimensões declaradas batem com ${path.basename(src)}`,
          Math.abs(declaredRatio - realRatio) <= 0.02,
          `declarado ${declared[1]}x${declared[2]} (${declaredRatio.toFixed(3)}), arquivo ${real.width}x${real.height} (${realRatio.toFixed(3)})`
        );
      } else {
        check(`depoimentos: ${path.basename(src)} é um WebP legível`, false, src);
      }
    }
    check('depoimentos: img com loading=lazy', /loading="lazy"/.test(img));
  }

  // O validador tambem exige que TODO depoimento publicado tenha passado pelo
  // processo de redacao/corte (as imagens vivem so em assets/images/depoimentos).
  check(
    'depoimentos: nenhuma imagem fora de /assets/images/depoimentos',
    !/<img\b[^>]*src="\/assets\/images\/(?!depoimentos\/)/.test(dep)
  );
}

// ---------------------------------------------------------------------------
// 5. Structured-data policy: reviews about ourselves are forbidden.
//
// Google treats reviews published on the same site as the entity they describe as
// self-serving: they are explicitly out of policy for Organization/LocalBusiness
// (and a grey area everywhere else), and marking them up anyway is handled as
// structured-data spam — which would strip the BlogPosting, FAQPage, VideoObject
// and BreadcrumbList rich results this site already earns. If a future change
// introduces rating markup, this check fails the build instead of the SERP.
// ---------------------------------------------------------------------------
const FORBIDDEN_SCHEMA = /aggregateRating|ratingValue|ratingCount|reviewCount|itemReviewed|reviewedBy|starRating|bestRating|"@type"\s*:\s*"Review"/i;

function collectHtml(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectHtml(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const generatedHtml = collectHtml(distDir);
const offenders = generatedHtml.filter((file) => FORBIDDEN_SCHEMA.test(fs.readFileSync(file, 'utf8')));
check(
  'nenhum markup de review/avaliação própria em páginas geradas',
  offenders.length === 0,
  offenders.map((f) => path.relative(distDir, f)).join(', ')
);

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
