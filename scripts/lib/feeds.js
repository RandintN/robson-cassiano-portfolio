import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

export const SITE_URL = 'https://eu.robsoncassiano.software';
export const BLOG_URL = 'https://eu.robsoncassiano.software/artigos/';
export const RSS_URL = 'https://eu.robsoncassiano.software/rss.xml';
export const ATOM_URL = 'https://eu.robsoncassiano.software/atom.xml';
export const FEED_TITLE = 'Robson Cassiano';
export const FEED_SUBTITLE =
  'Ensaios técnicos de engenharia de software, arquitetura backend Java e Spring, carreira internacional e filosofia clássica.';
export const AUTHOR_NAME = 'Robson Cassiano';
export const AUTHOR_EMAIL = 'contato@robsoncassiano.software';
export const ICON_URL = 'https://eu.robsoncassiano.software/assets/icons/apple-touch-icon.png';
export const LOGO_URL = 'https://storage.robsoncassiano.software/Robson-Cassiano.webp';

const RFC822_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const RFC822_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.png': 'image/png',
};

// Caracteres de controle ASCII inválidos em XML 1.0 (exceto tab, LF e CR).
const stripInvalidXmlChars = (value) =>
  String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

export function escapeXml(value) {
  return stripInvalidXmlChars(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function wrapCdata(html) {
  const safe = stripInvalidXmlChars(html).replace(/]]>/g, ']]]]><![CDATA[>');
  return `<![CDATA[${safe}]]>`;
}

function parseCalendarDate(dateStr) {
  if (typeof dateStr !== 'string') {
    throw new Error(`Data inválida no feed: ${String(dateStr)}`);
  }
  const trimmed = dateStr.trim();
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.exec(trimmed);
  const match = dateOnlyMatch || isoMatch;

  if (!match) {
    throw new Error(`Formato de data inválido no feed: "${dateStr}"`);
  }
  if (isoMatch && Number.isNaN(Date.parse(trimmed))) {
    throw new Error(`Timestamp ISO inválido no feed: "${dateStr}"`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day, 13, 0, 0));

  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new Error(`Data de calendário inexistente no feed: "${dateStr}"`);
  }

  return { year, month, day, check, isIso: Boolean(isoMatch), raw: trimmed };
}

export function toIsoDate(dateStr) {
  const parsed = parseCalendarDate(dateStr);
  if (parsed.isIso) {
    return parsed.raw;
  }
  return `${parsed.raw}T10:00:00-03:00`;
}

export function toRfc822Date(dateStr) {
  const { year, month, day, check } = parseCalendarDate(dateStr);
  const dow = RFC822_DAYS[check.getUTCDay()];
  const dd = String(day).padStart(2, '0');
  const mon = RFC822_MONTHS[month - 1];
  return `${dow}, ${dd} ${mon} ${year} 10:00:00 -0300`;
}

export function absolutizeHtmlUrls(html, siteUrl = SITE_URL) {
  const base = String(siteUrl).replace(/\/+$/, '');
  return String(html ?? '').replace(
    /\b(src|href)=(["'])([^"']*)\2/gi,
    (full, attr, quote, rawUrl) => {
      const trimmed = rawUrl.trim();
      if (
        !trimmed ||
        /^(?:https?:\/\/|mailto:|tel:|data:|#|\/\/)/i.test(trimmed)
      ) {
        return full;
      }
      const absolute = trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`;
      return `${attr}=${quote}${absolute}${quote}`;
    }
  );
}

export function resolveEnclosure(article, assetsRoot = path.resolve('src')) {
  const ogImage = article?.ogImage;
  if (!ogImage || typeof ogImage !== 'string' || /^https?:\/\//i.test(ogImage.trim())) {
    return null;
  }
  const cleanPath = ogImage.trim().replace(/^\/+/, '');
  if (!cleanPath) {
    return null;
  }
  const filePath = path.join(assetsRoot, cleanPath);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const stats = fs.statSync(filePath);
  if (!stats.isFile()) {
    return null;
  }
  const ext = path.extname(cleanPath).toLowerCase();
  const type = MIME_BY_EXT[ext];
  if (!type) {
    return null;
  }
  return {
    url: `${SITE_URL}/${cleanPath}`,
    length: stats.size,
    type,
  };
}

export function renderArticleFeedHtml(article) {
  const rawContent = String(article?.content || '').replace(/^#\s+[^\n]+\n+/, '');
  const rendered = absolutizeHtmlUrls(marked.parse(rawContent)).trim();
  const canonicalUrl = article?.canonicalUrl || `${SITE_URL}/artigos/${article?.slug}/`;

  const parts = [rendered];
  if (article?.youtubeVideoId) {
    parts.push(
      `<p><strong>Gravação original:</strong> <a href="https://www.youtube.com/watch?v=${escapeXml(article.youtubeVideoId)}">Assistir transmissão no YouTube</a></p>`
    );
  }
  parts.push(
    `<hr /><p>Publicado originalmente em <a href="${escapeXml(canonicalUrl)}">eu.robsoncassiano.software</a>.</p>`
  );
  return parts.filter(Boolean).join('\n');
}

export function collectCategories(article) {
  const seen = new Set();
  const result = [];
  const candidates = [
    article?.category,
    ...(Array.isArray(article?.tags) ? article.tags : []),
  ];
  for (const raw of candidates) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

export function latestDateOf(articles) {
  if (!Array.isArray(articles) || articles.length === 0) {
    return '2026-01-01';
  }
  let latest = '';
  for (const art of articles) {
    const candidate = String(art?.updated || art?.date || '');
    if (candidate && (!latest || candidate > latest)) {
      latest = candidate;
    }
  }
  return latest || '2026-01-01';
}

function sortArticlesDesc(articles) {
  return [...(articles || [])].sort((a, b) =>
    String(b?.date || '').localeCompare(String(a?.date || ''))
  );
}

export function buildRssFeed(articles, { assetsRoot } = {}) {
  const sorted = sortArticlesDesc(articles);
  const latestDate = latestDateOf(sorted);
  const latestYear = latestDate.slice(0, 4);

  const itemsXml = sorted
    .map((art) => {
      const canonicalUrl = art.canonicalUrl || `${SITE_URL}/artigos/${art.slug}/`;
      const creator = art.author || AUTHOR_NAME;
      const categoriesXml = collectCategories(art)
        .map((cat) => `      <category>${escapeXml(cat)}</category>`)
        .join('\n');
      const enclosure = resolveEnclosure(art, assetsRoot);
      const enclosureXml = enclosure
        ? `\n      <enclosure url="${escapeXml(enclosure.url)}" length="${enclosure.length}" type="${escapeXml(enclosure.type)}" />`
        : '';
      const feedHtml = renderArticleFeedHtml(art);

      return [
        '    <item>',
        `      <title>${escapeXml(art.title)}</title>`,
        `      <link>${escapeXml(canonicalUrl)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(canonicalUrl)}</guid>`,
        `      <pubDate>${toRfc822Date(art.date)}</pubDate>`,
        `      <dc:creator>${escapeXml(creator)}</dc:creator>`,
        categoriesXml,
        `      <description>${escapeXml(art.summary || '')}</description>`,
        `      <content:encoded>${wrapCdata(feedHtml)}</content:encoded>${enclosureXml}`,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${escapeXml(BLOG_URL)}</link>
    <description>${escapeXml(FEED_SUBTITLE)}</description>
    <language>pt-BR</language>
    <copyright>© ${latestYear} ${escapeXml(AUTHOR_NAME)} / Simple Software LTDA</copyright>
    <managingEditor>${escapeXml(AUTHOR_EMAIL)} (${escapeXml(AUTHOR_NAME)})</managingEditor>
    <webMaster>${escapeXml(AUTHOR_EMAIL)} (${escapeXml(AUTHOR_NAME)})</webMaster>
    <lastBuildDate>${toRfc822Date(latestDate)}</lastBuildDate>
    <atom:link href="${escapeXml(RSS_URL)}" rel="self" type="application/rss+xml" />
    <image>
      <url>${escapeXml(LOGO_URL)}</url>
      <title>${escapeXml(FEED_TITLE)}</title>
      <link>${escapeXml(BLOG_URL)}</link>
    </image>
${itemsXml}
  </channel>
</rss>
`;
}

export function buildAtomFeed(articles, { assetsRoot } = {}) {
  const sorted = sortArticlesDesc(articles);
  const latestDate = latestDateOf(sorted);
  const latestYear = latestDate.slice(0, 4);

  const entriesXml = sorted
    .map((art) => {
      const canonicalUrl = art.canonicalUrl || `${SITE_URL}/artigos/${art.slug}/`;
      const creator = art.author || AUTHOR_NAME;
      const categoriesXml = collectCategories(art)
        .map((cat) => `    <category term="${escapeXml(cat)}" />`)
        .join('\n');
      const enclosure = resolveEnclosure(art, assetsRoot);
      const enclosureXml = enclosure
        ? `\n    <link rel="enclosure" href="${escapeXml(enclosure.url)}" type="${escapeXml(enclosure.type)}" length="${enclosure.length}" />`
        : '';
      const feedHtml = renderArticleFeedHtml(art);

      return [
        '  <entry>',
        `    <title>${escapeXml(art.title)}</title>`,
        `    <id>${escapeXml(canonicalUrl)}</id>`,
        `    <link href="${escapeXml(canonicalUrl)}" rel="alternate" type="text/html" />${enclosureXml}`,
        `    <published>${toIsoDate(art.date)}</published>`,
        `    <updated>${toIsoDate(art.updated || art.date)}</updated>`,
        '    <author>',
        `      <name>${escapeXml(creator)}</name>`,
        `      <uri>${escapeXml(`${SITE_URL}/`)}</uri>`,
        '    </author>',
        categoriesXml,
        `    <summary type="text">${escapeXml(art.summary || '')}</summary>`,
        `    <content type="html">${escapeXml(feedHtml)}</content>`,
        '  </entry>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="pt-BR">
  <title>${escapeXml(FEED_TITLE)}</title>
  <subtitle>${escapeXml(FEED_SUBTITLE)}</subtitle>
  <id>${escapeXml(BLOG_URL)}</id>
  <updated>${toIsoDate(latestDate)}</updated>
  <link href="${escapeXml(ATOM_URL)}" rel="self" type="application/atom+xml" />
  <link href="${escapeXml(BLOG_URL)}" rel="alternate" type="text/html" />
  <icon>${escapeXml(ICON_URL)}</icon>
  <logo>${escapeXml(LOGO_URL)}</logo>
  <rights>© ${latestYear} ${escapeXml(AUTHOR_NAME)} / Simple Software LTDA</rights>
  <author>
    <name>${escapeXml(AUTHOR_NAME)}</name>
    <uri>${escapeXml(`${SITE_URL}/`)}</uri>
    <email>${escapeXml(AUTHOR_EMAIL)}</email>
  </author>
${entriesXml}
</feed>
`;
}
