/**
 * Static semantic shell for the Angular host (<app-root>) and the /artigos/ hub.
 *
 * The SPA renders everything on the client, so crawlers that do not execute
 * JavaScript (most AI agents, social bots) used to see only a 1 kB hero block.
 * These builders emit real HTML at build time from the same sources the app
 * consumes (i18n dictionaries + articles.json / articles.en.json), so the host
 * document ships navigation, the full article catalogue, proof metrics and FAQ
 * text to any client — and Angular replaces the whole block on bootstrap.
 *
 * Styling is self-contained (inline <style> scoped to #static-shell) to avoid
 * depending on the Tailwind bundle, which only covers classes the app uses.
 */

export const stripHtml = (value) => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Keeps the light inline markup used by the i18n dictionaries (accent spans,
 * line breaks, emphasis) while dropping Tailwind-only classes that are not
 * guaranteed to exist in the compiled stylesheet of a standalone document.
 */
export const shellInline = (value) =>
  String(value ?? '')
    .replace(/<span[^>]*>/gi, '<span style="color:#dfb15b">')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/span>/gi, '</span>')
    .replace(/<\/?(strong|b)>/gi, '')
    .replace(/<\/?(em|i)>/gi, '')
    .replace(/<(?!\/?span\b)[^>]*>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

const faqKeys = (t) => {
  const keys = [];
  let i = 1;
  while (t(`FAQ_Q${i}`) !== `FAQ_Q${i}`) {
    keys.push(i);
    i += 1;
  }
  return keys;
};

const SHELL_CSS = `
#static-shell{background-color:#08080a;color:#f4f4f6;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;line-height:1.6;min-height:100vh}
#static-shell *{box-sizing:border-box}
#static-shell a{color:#dfb15b;text-decoration:none}
#static-shell a:hover{color:#f6e0a4}
#static-shell .ss-wrap{max-width:64rem;margin:0 auto;padding:0 24px}
#static-shell .ss-header{border-bottom:1px solid #252530;position:sticky;top:0;background:#08080a;z-index:10}
#static-shell .ss-header-in{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 24px;max-width:64rem;margin:0 auto}
#static-shell .ss-brand{display:flex;align-items:center;gap:12px;font-weight:700;color:#fff;font-size:18px}
#static-shell .ss-brand-accent{color:#dfb15b}
#static-shell .ss-nav{display:flex;flex-wrap:wrap;gap:14px;font-size:14px;font-weight:600}
#static-shell .ss-nav a{color:#cbd5e1}
#static-shell section{padding:40px 0;border-bottom:1px solid #1b1b22}
#static-shell h1{font-size:clamp(2rem,5vw,3rem);font-weight:800;line-height:1.15;margin:16px 0 20px;color:#fff}
#static-shell h2{font-size:clamp(1.35rem,3vw,1.8rem);font-weight:700;color:#fff;margin:0 0 16px}
#static-shell h3{font-size:1.1rem;font-weight:700;margin:0 0 8px;line-height:1.35}
#static-shell h3 a{color:#fff}
#static-shell h3 a:hover{color:#dfb15b}
#static-shell p{color:#cbd5e1;margin:0 0 12px}
#static-shell .ss-badge{display:inline-block;color:#dfb15b;font-weight:800;text-transform:uppercase;font-size:12px;letter-spacing:.05em;border:1px solid rgba(223,177,91,.3);background:rgba(223,177,91,.1);border-radius:99px;padding:6px 14px;margin-bottom:8px}
#static-shell .ss-lead{font-size:1.125rem;color:#9e9ea8;max-width:42rem}
#static-shell .ss-cta{display:inline-block;margin:16px 12px 0 0;padding:12px 22px;border-radius:12px;font-weight:800;font-size:14px;background:linear-gradient(135deg,#dfb15b,#c99839);color:#08080a}
#static-shell .ss-cta:hover{color:#08080a;background:linear-gradient(135deg,#f6e0a4,#dfb15b)}
#static-shell .ss-cta-ghost{background:#16161c;border:1px solid #252530;color:#dfb15b}
#static-shell .ss-cta-ghost:hover{color:#f6e0a4;border-color:rgba(223,177,91,.4)}
#static-shell .ss-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-top:8px;list-style:none;padding:0}
#static-shell .ss-stats li{background:#0e0e12;border:1px solid #252530;border-radius:14px;padding:16px}
#static-shell .ss-stats strong{display:block;color:#dfb15b;font-size:1.5rem;font-weight:800}
#static-shell .ss-stats span{font-size:13px;color:#94a3b8}
#static-shell .ss-articles{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;list-style:none;padding:0;margin:8px 0 0}
#static-shell .ss-articles > li{background:linear-gradient(180deg,#141418,#0e0e12);border:1px solid #252530;border-radius:16px;padding:20px}
#static-shell .ss-meta{font-size:12px;color:#94a3b8;display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px;text-transform:uppercase;letter-spacing:.04em}
#static-shell .ss-meta span:first-child{color:#dfb15b;font-weight:700}
#static-shell .ss-summary{font-size:14px;color:#cbd5e1;margin:0 0 12px}
#static-shell .ss-read{font-size:13px;font-weight:700}
#static-shell .ss-faq{margin:0}
#static-shell .ss-faq > div{padding:18px 0;border-top:1px solid #1b1b22}
#static-shell .ss-faq h3{color:#dfb15b;font-size:1rem}
#static-shell .ss-faq p{margin:0}
#static-shell footer{padding:40px 0;color:#94a3b8;font-size:13px;text-align:center}
#static-shell .ss-social{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin:16px 0 8px}
#static-shell .ss-hub{list-style:none;padding:0;margin:0;display:grid;gap:16px}
#static-shell .ss-hub li{border:1px solid #252530;border-radius:16px;padding:20px;background:linear-gradient(180deg,#141418,#0e0e12)}
`;

const socialLinks = (lang) => {
  const links = [
    ['LinkedIn', 'https://www.linkedin.com/in/robsoncassiano-software/'],
    ['GitHub', 'https://github.com/randintn'],
    ['YouTube', 'https://www.youtube.com/@RobsonCassianoSoftware'],
    ['Instagram', 'https://www.instagram.com/robsoncassiano.software/'],
    ['X / Twitter', 'https://x.com/RobsonDev'],
  ];
  const mentor = lang === 'en' ? 'Mentorship' : 'Mentoria';
  links.push([mentor, 'https://global.robsoncassiano.software/']);
  return links.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>`).join('\n        ');
};

/**
 * Builds the static shell injected inside <app-root>.
 * @param {{lang:'br'|'en', t:(k:string)=>string, articles:Array<object>, translations:Record<string,object>}} options
 */
export function buildStaticShell({ lang, t, articles, translations = {} }) {
  const isEn = lang === 'en';
  const navItems = [
    ['#sobre', t('NAV_ABOUT')],
    ['#artigos', t('NAV_ARTICLES')],
    ['#faq', t('NAV_FAQ')],
    ['#contato', t('NAV_CONTACT')],
  ];
  const nav = navItems
    .map(([href, label]) => `<a href="${href}">${escapeHtml(stripHtml(label))}</a>`)
    .join('\n          ');

  const langSwitch = isEn
    ? '<a href="/" hreflang="pt-BR" title="Ler o portfólio em português">PT</a>'
    : '<a href="/en/" hreflang="en" title="Read the English portfolio">EN</a>';

  const proofItems = [1, 2, 3, 4]
    .filter((i) => t(`PROOF_${i}_VALUE`) !== `PROOF_${i}_VALUE`)
    .map(
      (i) =>
        `          <li><strong>${escapeHtml(stripHtml(t(`PROOF_${i}_VALUE`)))}</strong><span>${escapeHtml(stripHtml(t(`PROOF_${i}_LABEL`)))}</span></li>`
    )
    .join('\n');

  const articleItems = articles
    .map((a) => {
      const tr = translations[a.slug] || {};
      const title = escapeHtml(tr.title || a.title);
      const summary = escapeHtml(tr.summary || a.summary);
      const category = escapeHtml(tr.category || a.category);
      const readTime = escapeHtml(tr.readTime || a.readTime);
      const url = `/artigos/${a.slug}/`;
      return `          <li>
            <div class="ss-meta"><span>${category}</span><span>${escapeHtml(a.date)}</span><span>${readTime}</span></div>
            <h3><a href="${url}">${title}</a></h3>
            <p class="ss-summary">${summary}</p>
            <a class="ss-read" href="${url}">${escapeHtml(stripHtml(t('READ_ARTICLE')))} &rarr;</a>
          </li>`;
    })
    .join('\n');

  const faq = faqKeys(t)
    .map(
      (i) =>
        `        <div>\n          <h3>${escapeHtml(stripHtml(t(`FAQ_Q${i}`)))}</h3>\n          <p>${escapeHtml(stripHtml(t(`FAQ_A${i}`)))}</p>\n        </div>`
    )
    .join('\n');

  return `<div id="static-shell" lang="${isEn ? 'en' : 'pt-BR'}">
    <style>${SHELL_CSS}</style>

    <header class="ss-header">
      <div class="ss-header-in">
        <a class="ss-brand" href="${isEn ? '/en/' : '/'}">Robson<span class="ss-brand-accent">Cassiano</span></a>
        <nav class="ss-nav" aria-label="${isEn ? 'Main navigation' : 'Navegação principal'}">
          ${nav}
          ${langSwitch}
        </nav>
      </div>
    </header>

    <main>
      <section id="sobre">
        <div class="ss-wrap">
          <p class="ss-badge">${escapeHtml(stripHtml(t('HERO_BADGE')))}</p>
          <h1>${shellInline(t('HERO_TITLE'))}</h1>
          <p class="ss-lead">${escapeHtml(stripHtml(t('HERO_DESCRIPTION')))}</p>
          <a class="ss-cta" href="https://global.robsoncassiano.software/" target="_blank" rel="noopener noreferrer">${escapeHtml(stripHtml(t('HERO_MENTORSHIP')))}</a>
          <a class="ss-cta ss-cta-ghost" href="https://www.linkedin.com/in/robsoncassiano-software/" target="_blank" rel="noopener noreferrer">${escapeHtml(stripHtml(t('HERO_LINKEDIN')))}</a>

          <h2 style="margin-top:36px">${escapeHtml(stripHtml(t('ANSWER_FIRST_TITLE')))}</h2>
          <p>${escapeHtml(stripHtml(t('ANSWER_FIRST_TEXT')))}</p>

          <h2 style="margin-top:36px">${escapeHtml(stripHtml(t('PROOF_TITLE')))}</h2>
          <p>${escapeHtml(stripHtml(t('PROOF_TEXT')))}</p>
          <ul class="ss-stats">
${proofItems}
          </ul>
        </div>
      </section>

      <section id="artigos">
        <div class="ss-wrap">
          <p class="ss-badge">${escapeHtml(stripHtml(t('ARTICLES_BADGE')))}</p>
          <h2>${escapeHtml(stripHtml(t('ARTICLES_TITLE')))}</h2>
          <p class="ss-lead">${escapeHtml(stripHtml(t('ARTICLES_SUBTITLE')))}</p>
          <ul class="ss-articles">
${articleItems}
          </ul>
        </div>
      </section>

      <section id="faq">
        <div class="ss-wrap">
          <p class="ss-badge">${escapeHtml(stripHtml(t('FAQ_BADGE')))}</p>
          <h2>${escapeHtml(stripHtml(t('FAQ_TITLE')))}</h2>
          <div class="ss-faq">
${faq}
          </div>
        </div>
      </section>

      <section id="contato">
        <div class="ss-wrap">
          <h2>${shellInline(t('FOOTER_TITLE'))}</h2>
          <p class="ss-lead">${escapeHtml(stripHtml(t('FOOTER_SUBTITLE')))}</p>
          <a class="ss-cta" href="https://global.robsoncassiano.software/" target="_blank" rel="noopener noreferrer">${escapeHtml(stripHtml(t('HERO_MENTORSHIP')))}</a>
        </div>
      </section>
    </main>

    <footer>
      <div class="ss-wrap">
        <nav class="ss-social" aria-label="${isEn ? 'Social profiles' : 'Redes oficiais'}">
        ${socialLinks(lang)}
        </nav>
        <p>${escapeHtml(stripHtml(t('FOOTER_RIGHTS')))}</p>
        <p><a href="/artigos/">${isEn ? 'All articles' : 'Todos os artigos'}</a> · <a href="${isEn ? '/' : '/en/'}">${isEn ? 'Português' : 'English'}</a></p>
      </div>
    </footer>
  </div>`;
}

/** Replaces whatever sits inside <app-root> with the given shell. */
export function injectShell(html, shell) {
  const pattern = /(<app-root[^>]*>)[\s\S]*?(<\/app-root>)/i;
  if (!pattern.test(html)) {
    console.warn('⚠ <app-root> não encontrado para injeção do shell estático.');
    return html;
  }
  // Function replacer: a string replacement would interpret "$1"/"$2" sequences
  // that legitimately appear in the copy (e.g. "$5k-$12k/month") as backreferences.
  return html.replace(pattern, (_match, open, close) => `${open}\n${shell}\n  ${close}`);
}

/**
 * Blog hub (/artigos/): a real collection page for the article cluster, which
 * also gives the homepage shell a stable internal-linking target and the
 * crawler a single hop to every essay.
 */
export function buildArticlesHub({ articles, t, stylesHref }) {
  const canonicalUrl = 'https://eu.robsoncassiano.software/artigos/';
  const title = 'Artigos e Ensaios de Engenharia de Software | Robson Cassiano';
  const description =
    'Os 13 ensaios técnicos de Robson Cassiano: backend Java e Spring, arquitetura resiliente, carreira internacional, negociação em dólar e entrevistas técnicas em inglês.';
  const ogImage = 'https://eu.robsoncassiano.software/assets/images/og/por-que-spring-boot-domina-backend-global.jpg';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collection`,
        url: canonicalUrl,
        name: title,
        description,
        inLanguage: 'pt-BR',
        isPartOf: { '@id': 'https://eu.robsoncassiano.software/#profilepage' },
        about: { '@id': 'https://eu.robsoncassiano.software/#person' },
        mainEntity: { '@id': `${canonicalUrl}#itemlist` },
      },
      {
        '@type': 'ItemList',
        '@id': `${canonicalUrl}#itemlist`,
        name: t('ARTICLES_TITLE'),
        numberOfItems: articles.length,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: articles.map((a, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `https://eu.robsoncassiano.software/artigos/${a.slug}/`,
          name: a.title,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://eu.robsoncassiano.software/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: canonicalUrl },
        ],
      },
    ],
  };

  const cards = articles
    .map(
      (a) => `        <li>
          <div class="hub-meta"><span>${escapeHtml(a.category)}</span><span>${escapeHtml(a.date)}</span><span>${escapeHtml(a.readTime)}</span></div>
          <h3><a href="/artigos/${a.slug}/">${escapeHtml(a.title)}</a></h3>
          <p>${escapeHtml(a.summary)}</p>
          <a class="hub-read" href="/artigos/${a.slug}/">${escapeHtml(stripHtml(t('READ_ARTICLE')))} &rarr;</a>
        </li>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" hreflang="pt-BR" href="${canonicalUrl}">
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png">
  <link rel="shortcut icon" href="/assets/icons/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link rel="alternate" type="text/markdown" href="https://eu.robsoncassiano.software/artigos/index.md" title="Markdown Version for AI Agents">
  <link rel="alternate" type="text/plain" href="https://eu.robsoncassiano.software/llms.txt" title="LLMs.txt">

  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Robson Cassiano - Senior Software Engineer">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@RobsonDev">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ogImage}">

  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>

  <link rel="stylesheet" href="${stylesHref}">
  <style>
    body { background-color: #08080a; color: #cbd5e1; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; }
    .hub-wrap { max-width: 64rem; margin: 0 auto; padding: 0 24px; }
    .hub-header { border-bottom: 1px solid #252530; position: sticky; top: 0; background: #08080a; z-index: 20; }
    .hub-header-in { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 24px; max-width: 64rem; margin: 0 auto; }
    .hub-brand { display: flex; align-items: center; gap: 12px; font-weight: 700; color: #fff; font-size: 18px; text-decoration: none; }
    .hub-brand em { color: #dfb15b; font-style: normal; }
    .hub-header a { text-decoration: none; }
    .hub-lang { color: #94a3b8; font-size: 14px; font-weight: 700; border: 1px solid #252530; border-radius: 10px; padding: 6px 12px; }
    .hub-badge { display: inline-block; color: #dfb15b; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: .05em; border: 1px solid rgba(223,177,91,.3); background: rgba(223,177,91,.1); border-radius: 99px; padding: 6px 14px; margin-bottom: 10px; }
    h1 { font-size: clamp(1.9rem, 4.5vw, 2.75rem); font-weight: 800; color: #fff; line-height: 1.15; margin: 0 0 16px; }
    h3 { font-size: 1.15rem; font-weight: 700; margin: 0 0 8px; line-height: 1.35; }
    h3 a { color: #fff; text-decoration: none; }
    h3 a:hover { color: #dfb15b; }
    .hub-lead { font-size: 1.075rem; color: #9e9ea8; max-width: 46rem; }
    .hub-list { list-style: none; padding: 0; margin: 32px 0 0; display: grid; gap: 18px; }
    .hub-list li { border: 1px solid #252530; border-radius: 16px; padding: 22px; background: linear-gradient(180deg, #141418, #0e0e12); }
    .hub-list p { color: #cbd5e1; font-size: .95rem; margin: 0 0 14px; }
    .hub-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 12px; }
    .hub-meta span:first-child { color: #dfb15b; font-weight: 700; }
    .hub-read { color: #dfb15b; font-weight: 700; font-size: .875rem; text-decoration: none; }
    .hub-read:hover { color: #f6e0a4; }
    footer { border-top: 1px solid #252530; margin-top: 56px; padding: 32px 0; text-align: center; font-size: 13px; color: #94a3b8; }
    footer a { color: #dfb15b; }
  </style>
</head>
<body>
  <header class="hub-header">
    <div class="hub-header-in">
      <a class="hub-brand" href="/"><span>Robson<em>Cassiano</em></span></a>
      <a class="hub-lang" href="/en/" hreflang="en">EN</a>
    </div>
  </header>

  <nav aria-label="Breadcrumb" class="hub-wrap" style="padding-top:24px">
    <ol style="list-style:none;display:flex;gap:8px;padding:0;margin:0;font-size:12px;color:#94a3b8">
      <li><a href="/" style="color:#94a3b8">Início</a></li>
      <li>/</li>
      <li style="color:#dfb15b">Blog</li>
    </ol>
  </nav>

  <main class="hub-wrap" style="padding:24px 24px 0">
    <p class="hub-badge">${escapeHtml(stripHtml(t('ARTICLES_BADGE')))}</p>
    <h1>${escapeHtml(stripHtml(t('ARTICLES_TITLE')))}</h1>
    <p class="hub-lead">${escapeHtml(stripHtml(t('ARTICLES_SUBTITLE')))}</p>

    <ul class="hub-list">
${cards}
    </ul>
  </main>

  <footer>
    <p>&copy; ${new Date().getFullYear()} Robson Cassiano · <a href="/">eu.robsoncassiano.software</a> · <a href="https://global.robsoncassiano.software/" target="_blank" rel="noopener noreferrer">global.robsoncassiano.software</a></p>
  </footer>
</body>
</html>
`;
}

/** Markdown twin of the hub, negotiated by the edge middleware for AI agents. */
export function buildArticlesHubMarkdown({ articles, t, translations = {} }) {
  const lines = [
    `# ${stripHtml(t('ARTICLES_TITLE'))}`,
    '',
    `> ${stripHtml(t('ARTICLES_SUBTITLE'))}`,
    '',
    `- Canonical URL: https://eu.robsoncassiano.software/artigos/`,
    '- Author: Robson Cassiano (https://eu.robsoncassiano.software/#person)',
    `- Language: pt-BR`,
    `- Articles: ${articles.length}`,
    '',
    '---',
    '',
  ];
  for (const a of articles) {
    const summary = (translations[a.slug]?.summary) || a.summary;
    lines.push(`## [${a.title}](https://eu.robsoncassiano.software/artigos/${a.slug}/)`);
    lines.push('');
    lines.push(`- Published: ${a.date} · ${a.category} · ${a.readTime}`);
    lines.push(`- Markdown: https://eu.robsoncassiano.software/artigos/${a.slug}.md`);
    lines.push('');
    lines.push(summary);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}
