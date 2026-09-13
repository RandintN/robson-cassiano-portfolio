/**
 * /depoimentos/ — página estática de depoimentos (SSG, sem JavaScript).
 *
 * Regras de publicação:
 *  - Todo depoimento tem `consent: true` no frontmatter; sem isso o build não publica.
 *  - Os prints são publicados como prova de apoio (`<figure>` + `<figcaption>`), já
 *    processados fora do build: cortados para remover a lista de contatos de terceiros
 *    do LinkedIn e com telefone/e-mail/link de recrutador censurados.
 *  - **Nenhum** markup de `Review`/`AggregateRating`: avaliação da própria entidade no
 *    próprio domínio é self-serving (fora da política do Google). O validador do build
 *    reprova qualquer ocorrência.
 */
import fs from 'node:fs';
import path from 'node:path';

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const stripTags = (value) => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const DEPOIMENTOS_IMG_DIR = path.resolve('src/assets/images/depoimentos');
const dimensionCache = new Map();

/**
 * Lê largura e altura reais de um WebP sem decodificar a imagem.
 *
 * A página declarava `width="1200" height="800"` fixos em todos os prints, mas os
 * arquivos vão de 404x597 a 1382x918. O navegador reservava uma caixa 3:2 e
 * reflowava quando a imagem real chegava, deslocando todo o texto abaixo dela.
 * Com dimensões erradas, `loading="lazy"` e `decoding="async"` não evitam o salto:
 * a caixa reservada precisa bater com a proporção do arquivo.
 *
 * Exportada para que `validate-static-output.js` confira as dimensões declaradas
 * contra os arquivos publicados, em vez de só conferir que os atributos existem.
 *
 * Formatos cobertos: VP8X (estendido, com alpha), VP8 (lossy) e VP8L (lossless).
 *
 * @returns {{width:number,height:number}|null} null quando o arquivo não é um WebP legível.
 */
export function readWebpDimensions(filePath) {
  if (dimensionCache.has(filePath)) return dimensionCache.get(filePath);

  let result = null;
  try {
    const buffer = fs.readFileSync(filePath);

    if (buffer.subarray(0, 4).toString('latin1') === 'RIFF' && buffer.subarray(8, 12).toString('latin1') === 'WEBP') {
      const chunk = buffer.subarray(12, 16).toString('latin1');

      if (chunk === 'VP8X') {
        // Canvas de 24 bits little-endian menos um, começa no byte 24.
        result = {
          width: buffer.readUIntLE(24, 3) + 1,
          height: buffer.readUIntLE(27, 3) + 1,
        };
      } else if (chunk === 'VP8 ') {
        // Bitstream lossy: assinatura de 3 bytes e depois duas dimensões de 14 bits.
        result = {
          width: buffer.readUInt16LE(26) & 0x3fff,
          height: buffer.readUInt16LE(28) & 0x3fff,
        };
      } else if (chunk === 'VP8L') {
        const bits = buffer.readUInt32LE(21);
        result = {
          width: (bits & 0x3fff) + 1,
          height: ((bits >> 14) & 0x3fff) + 1,
        };
      }
    }
  } catch {
    result = null;
  }

  if (!result || !result.width || !result.height) result = null;

  dimensionCache.set(filePath, result);
  return result;
}

function webpDimensions(file) {
  const dimensions = readWebpDimensions(path.join(DEPOIMENTOS_IMG_DIR, file));
  if (dimensions) return dimensions;

  console.warn(`⚠ Dimensões desconhecidas para "${file}"; usando 1200x800 como reserva.`);
  return { width: 1200, height: 800 };
}

const CANONICAL = 'https://eu.robsoncassiano.software/depoimentos/';
const TITLE = 'Depoimentos: resultados de quem ajustou o posicionamento | Robson Cassiano';
const DESCRIPTION =
  'Depoimentos com print de abordagens de recrutadores, entrevistas e contratos: o antes e o depois de desenvolvedores que ajustaram perfil, curriculo e posicionamento internacional.';

function figureFor(testimonial, index, image) {
  const src = `/assets/images/depoimentos/${image}`;
  const { width, height } = webpDimensions(image);
  return `        <figure class="dep-figure">
          <img src="${src}" alt="Print enviado por ${escapeHtml(testimonial.name)}: ${escapeHtml(stripTags(testimonial.evidence)).slice(0, 150)}" width="${width}" height="${height}" loading="lazy" decoding="async">
          <figcaption>${index === 0 ? escapeHtml(testimonial.evidence) : 'Evidência complementar enviada pelo próprio autor do depoimento.'}</figcaption>
        </figure>`;
}

export function buildTestimonialsPage({ testimonials, stylesHref }) {
  const published = testimonials.filter((t) => t.consent);
  const withheld = testimonials.length - published.length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${CANONICAL}#collection`,
        url: CANONICAL,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: 'pt-BR',
        isPartOf: { '@id': 'https://eu.robsoncassiano.software/#profilepage' },
        about: { '@id': 'https://eu.robsoncassiano.software/#person' },
        mainEntity: { '@id': `${CANONICAL}#itemlist` },
      },
      {
        '@type': 'ItemList',
        '@id': `${CANONICAL}#itemlist`,
        name: 'Depoimentos com evidencia',
        numberOfItems: published.length,
        itemListElement: published.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Person',
            name: t.name,
            jobTitle: t.role,
            description: `${t.headline}. ${t.quote}`,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${CANONICAL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://eu.robsoncassiano.software/' },
          { '@type': 'ListItem', position: 2, name: 'Depoimentos', item: CANONICAL },
        ],
      },
    ],
  };

  const cards = published
    .map((t) => {
      const metrics = t.metrics.length
        ? `        <ul class="dep-metrics">\n${t.metrics.map((m) => `          <li>${escapeHtml(m)}</li>`).join('\n')}\n        </ul>`
        : '';
      const figures = t.images.length
        ? `        <div class="dep-gallery">\n${t.images.map((img, i) => figureFor(t, i, img)).join('\n')}\n        </div>`
        : '';
      const body = stripTags(t.body);
      return `      <article class="dep-card" id="${escapeHtml(t.slug)}">
        <header>
          <span class="dep-cat">${escapeHtml(t.category)}</span>
          <h2>${escapeHtml(t.name)}</h2>
          <p class="dep-role">${escapeHtml(t.role)}</p>
          <p class="dep-headline">${escapeHtml(t.headline)}</p>
        </header>

        <blockquote class="dep-quote">
          <p>${escapeHtml(t.quote)}</p>
          <cite>${escapeHtml(t.name)}</cite>
        </blockquote>
${metrics}
${figures}
${body ? `        <p class="dep-body">${escapeHtml(body)}</p>` : ''}
      </article>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(TITLE)}</title>
  <meta name="description" content="${escapeHtml(DESCRIPTION)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${CANONICAL}">
  <link rel="alternate" hreflang="pt-BR" href="${CANONICAL}">
  <link rel="alternate" hreflang="x-default" href="${CANONICAL}">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png">
  <link rel="shortcut icon" href="/assets/icons/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link rel="alternate" type="text/markdown" href="https://eu.robsoncassiano.software/depoimentos/index.md" title="Markdown Version for AI Agents">
  <link rel="alternate" type="text/plain" href="https://eu.robsoncassiano.software/llms.txt" title="LLMs.txt">

  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:title" content="${escapeHtml(TITLE)}">
  <meta property="og:description" content="${escapeHtml(DESCRIPTION)}">
  <meta property="og:url" content="${CANONICAL}">
  <meta property="og:image" content="https://eu.robsoncassiano.software/assets/images/og/por-que-spring-boot-domina-backend-global.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Robson Cassiano - Senior Software Engineer">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@RobsonDev">
  <meta name="twitter:title" content="${escapeHtml(TITLE)}">
  <meta name="twitter:description" content="${escapeHtml(DESCRIPTION)}">
  <meta name="twitter:image" content="https://eu.robsoncassiano.software/assets/images/og/por-que-spring-boot-domina-backend-global.jpg">

  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>

  <link rel="stylesheet" href="${stylesHref}">
  <style>
    body { background-color: #08080a; color: #cbd5e1; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; line-height: 1.7; }
    .dep-wrap { max-width: 68rem; margin: 0 auto; padding: 0 24px; }
    .dep-header { border-bottom: 1px solid #252530; position: sticky; top: 0; background: #08080a; z-index: 20; }
    .dep-header-in { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 24px; max-width: 68rem; margin: 0 auto; }
    .dep-brand { font-weight: 700; color: #fff; font-size: 18px; text-decoration: none; }
    .dep-brand em { color: #dfb15b; font-style: normal; }
    .dep-header a { text-decoration: none; }
    .dep-nav { display: flex; gap: 14px; font-size: 14px; font-weight: 600; }
    .dep-nav a { color: #94a3b8; }
    .dep-nav a:hover { color: #dfb15b; }
    h1 { font-size: clamp(1.9rem, 4.5vw, 2.6rem); font-weight: 800; color: #fff; line-height: 1.18; margin: 0 0 14px; }
    .dep-badge { display: inline-block; color: #dfb15b; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: .05em; border: 1px solid rgba(223,177,91,.3); background: rgba(223,177,91,.1); border-radius: 99px; padding: 6px 14px; margin-bottom: 12px; }
    .dep-lead { font-size: 1.05rem; color: #9e9ea8; max-width: 52rem; }
    .dep-note { font-size: .85rem; color: #94a3b8; border-left: 3px solid #dfb15b; padding: 8px 0 8px 14px; margin: 24px 0 0; max-width: 52rem; }
    .dep-note a { color: #dfb15b; }
    .dep-list { display: grid; gap: 22px; margin: 40px 0 0; padding: 0; list-style: none; }
    .dep-card { border: 1px solid #252530; border-radius: 18px; padding: 26px; background: linear-gradient(180deg, #141418, #0e0e12); }
    .dep-cat { display: inline-block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: #08080a; background: #dfb15b; border-radius: 6px; padding: 3px 9px; margin-bottom: 12px; }
    .dep-card h2 { font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0 0 4px; }
    .dep-role { color: #94a3b8; font-size: .9rem; margin: 0 0 10px; }
    .dep-headline { color: #f6e0a4; font-weight: 700; font-size: 1rem; margin: 0 0 18px; }
    .dep-quote { margin: 0 0 18px; padding: 16px 20px; background: rgba(223,177,91,.06); border-left: 3px solid #dfb15b; border-radius: 0 12px 12px 0; }
    .dep-quote p { margin: 0 0 8px; color: #f4f4f6; font-size: 1.05rem; font-style: italic; }
    .dep-quote cite { font-size: .85rem; color: #94a3b8; font-style: normal; }
    .dep-metrics { list-style: none; padding: 0; margin: 0 0 18px; display: grid; gap: 8px; }
    .dep-metrics li { position: relative; padding-left: 20px; font-size: .95rem; color: #cbd5e1; }
    .dep-metrics li::before { content: ""; position: absolute; left: 0; top: .55em; width: 8px; height: 8px; border-radius: 99px; background: #dfb15b; }
    .dep-gallery { display: grid; gap: 18px; margin: 0 0 16px; }
    .dep-figure { margin: 0; }
    .dep-figure img { width: 100%; height: auto; border: 1px solid #252530; border-radius: 12px; background: #05050a; }
    .dep-figure figcaption { font-size: .82rem; color: #94a3b8; margin-top: 8px; }
    .dep-body { font-size: .95rem; color: #cbd5e1; margin: 0; }
    footer { border-top: 1px solid #252530; margin-top: 56px; padding: 32px 0; text-align: center; font-size: 13px; color: #94a3b8; }
    footer a { color: #dfb15b; }
  </style>
</head>
<body>
  <header class="dep-header">
    <div class="dep-header-in">
      <a class="dep-brand" href="/"><span>Robson<em>Cassiano</em></span></a>
      <nav class="dep-nav" aria-label="Navegação">
        <a href="/artigos/">Artigos</a>
        <a href="/#artigos">Blog</a>
        <a href="/en/" hreflang="en">EN</a>
      </nav>
    </div>
  </header>

  <nav aria-label="Breadcrumb" class="dep-wrap" style="padding-top:24px">
    <ol style="list-style:none;display:flex;gap:8px;padding:0;margin:0;font-size:12px;color:#94a3b8">
      <li><a href="/" style="color:#94a3b8">Início</a></li>
      <li>/</li>
      <li style="color:#dfb15b">Depoimentos</li>
    </ol>
  </nav>

  <main class="dep-wrap" style="padding:24px 24px 0">
    <p class="dep-badge">Prova pública e auditável</p>
    <h1>Depoimentos: o antes e o depois de quem ajustou o posicionamento</h1>
    <p class="dep-lead">
      Todos os relatos abaixo foram enviados espontaneamente por desenvolvedores, com o print original
      preservado como evidência. O padrão que se repete: antes do ajuste de perfil, currículo e
      posicionamento, os recrutadores não chegavam. Depois, passaram a chegar sozinhos.
    </p>
    <p class="dep-note">
      Prints publicados com autorização dos autores. Telefones, e-mails e links de recrutadores foram
      censurados e a lista lateral de contatos do LinkedIn foi removida no processamento das imagens.
      Nenhum resultado aqui depende de JavaScript para ser lido: a página é estática.
    </p>

    <ul class="dep-list">
${cards}
    </ul>
  </main>

  <footer>
    <div class="dep-wrap">
      <p>&copy; ${new Date().getFullYear()} Robson Cassiano · <a href="/">eu.robsoncassiano.software</a> · <a href="/artigos/">Blog</a> · <a href="/privacidade/">Política de Privacidade</a></p>
    </div>
  </footer>
</body>
</html>
`;
}

/** Gêmeo em markdown, negociado na borda para agentes de IA. */
export function buildTestimonialsMarkdown({ testimonials }) {
  const published = testimonials.filter((t) => t.consent);
  const lines = [
    '# Depoimentos: o antes e o depois de quem ajustou o posicionamento',
    '',
    '> Relatos enviados espontaneamente por desenvolvedores, com print original como evidência. Padrão recorrente: antes do ajuste de perfil e currículo os recrutadores não chegavam; depois passaram a chegar sozinhos.',
    '',
    `- Canonical URL: ${CANONICAL}`,
    '- Author: Robson Cassiano (https://eu.robsoncassiano.software/#person)',
    '- Language: pt-BR',
    `- Testimonials: ${published.length}`,
    '',
    '---',
    '',
  ];
  for (const t of published) {
    lines.push(`## ${t.name} — ${t.headline}`);
    lines.push('');
    lines.push(`- Role: ${t.role}`);
    lines.push(`- Category: ${t.category}`);
    lines.push('');
    lines.push(`> ${t.quote}`);
    lines.push('');
    if (t.metrics.length) {
      for (const m of t.metrics) lines.push(`- ${m}`);
      lines.push('');
    }
    lines.push(stripTags(t.body));
    lines.push('');
    if (t.images.length) {
      lines.push(`Evidência (imagem): ${t.images.map((i) => `https://eu.robsoncassiano.software/assets/images/depoimentos/${i}`).join(', ')}`);
      lines.push('');
    }
  }
  return `${lines.join('\n')}\n`;
}
