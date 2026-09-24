/**
 * /depoimentos/ e /en/testimonials/: páginas estáticas de depoimentos (SSG, sem JavaScript).
 *
 * Regras de publicação:
 *  - Todo depoimento tem consent: true no frontmatter; sem isso o build não publica.
 *  - Os prints são publicados como prova de apoio (<figure> + <figcaption>), já
 *    processados fora do build: cortados para remover a lista de contatos de terceiros
 *    do LinkedIn e com telefone/e-mail/link de recrutador censurados.
 *  - Nenhum markup de Review/AggregateRating: avaliação da própria entidade no
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
 * Formatos cobertos: VP8X (estendido, com alpha), VP8 (lossy) e VP8L (lossless).
 */
export function readWebpDimensions(filePath) {
  if (dimensionCache.has(filePath)) return dimensionCache.get(filePath);

  let result = null;
  try {
    const buffer = fs.readFileSync(filePath);

    if (buffer.subarray(0, 4).toString('latin1') === 'RIFF' && buffer.subarray(8, 12).toString('latin1') === 'WEBP') {
      const chunk = buffer.subarray(12, 16).toString('latin1');

      if (chunk === 'VP8X') {
        result = {
          width: buffer.readUIntLE(24, 3) + 1,
          height: buffer.readUIntLE(27, 3) + 1,
        };
      } else if (chunk === 'VP8 ') {
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

export const TESTIMONIALS_EN = {
  'almir-aluno': {
    role: 'Software Developer',
    category: 'Hired',
    headline: 'Job offer from DBC Company allocated to Sicredi within 3 weeks',
    quote: 'Definitely, it made total difference. I used the inverted pyramid concept in the interview. I achieved approval within two and a half or three weeks, and advanced to the next stage in another selection process.',
    metrics: [
      'Official hiring approval from DBC Company (allocated to the Sicredi Milhas engineering team)',
      'Job offer received within 2.5 to 3 weeks of starting the training',
      'Direct application of the inverted pyramid communication framework during technical assessment',
      'Concurrent advancement to the next round of another recruitment pipeline',
    ],
    evidence: 'WhatsApp conversation and forwarded formal approval message from DBC Company confirming the impact of the inverted pyramid framework.',
    body: 'The record documents a rapid job offer from DBC Company to join the Sicredi Milhas engineering team, secured on the exact day of the technical interview. The developer applied the inverted pyramid communication technique during technical questioning, landing the role within three weeks while advancing concurrently in another selection process.',
  },
  'caio-aluno': {
    role: 'Software Developer',
    category: 'Before & After',
    headline: 'From 1-2 weekly inbounds to a steady stream',
    quote: 'On average, 1-2x a week. Today it is definitely more.',
    metrics: [
      'Before: 1 to 2 recruiter reach-outs per week',
      'After: visibly higher contact frequency',
      'Glassdoor salary benchmark verified before responding',
    ],
    evidence: 'Frequency comparison reported directly by him during the chat.',
    body: 'Direct frequency comparison by the candidate himself, stating his prior baseline and the tangible jump after repositioning.',
  },
  'caio-braga': {
    role: 'Software Engineer',
    category: 'Hired',
    headline: 'Hired with immediate Canadian CEO endorsement',
    quote: 'I watched the recorded interview you sent me, it definitely helped. I think it helped in some way for sure.',
    metrics: [
      'Hiring contract signed',
      'During round one, the Canadian CEO stated he wanted to work with him immediately',
      'Direct credit given to studying real recorded technical interviews',
    ],
    evidence: 'Conversation detailing the CEO interview and crediting the recorded interview breakdowns.',
    body: 'Asked if the guidance helped secure the position, he confirms and singles out real recorded technical interview breakdowns as a primary factor.',
  },
  'diego-grassato': {
    role: 'Senior Software Engineer',
    category: 'LinkedIn Inbounds',
    headline: '8 recruiters & active $6,000 to $9,000/month remote offer',
    quote: 'IT Director from Itaú pinged me lol. Itaú. And another one just now.',
    metrics: [
      '8 concurrent recruiters identified in a single inbox',
      'Active remote offer: $6,000 to $9,000/month (Nexton, AWS/Java/Node.js stack)',
      'Inbounds from Itaú Unibanco, Arbit (US project), EVT, Jobbility (NYC, USD rate), Capmation, and Inmetrics',
    ],
    evidence: 'Inbox showing simultaneous recruiter messages and the Nexton offer with salary bracket in US dollars.',
    body: 'Proof of volume: a single inbox concentrates eight recruiters, including a top bank, global consultancies, and two USD-paying companies. The highest bracket is stated in writing by the recruiter.',
  },
  'enrico-meira': {
    role: 'Java Developer',
    category: 'First Inbound',
    headline: 'First inbound ever plus R$ 12k to R$ 17k salary brackets',
    quote: 'First time ever to be honest hahaha',
    metrics: [
      'First unsolicited recruiter reach-out ever, right after profile adjustment',
      'Stefanini brackets in screenshot: Mid-level up to R$ 12,000 + R$ 2,000 benefits',
      'Senior: R$ 14,000 to R$ 15,000 + R$ 2,000 benefits. Specialist: R$ 17,000 + R$ 2,000 benefits',
    ],
    evidence: 'Confirmation that this was his first inbound reach-out ever, paired with recruiter salary brackets.',
    body: 'He had never received an unsolicited recruiter reach-out. The follow-up screenshot details the transparent salary brackets by seniority up to specialist tier.',
  },
  'fabiano-moreira': {
    role: 'Software Developer',
    category: 'Free Content Win',
    headline: 'Results achieved solely with free content',
    quote: 'I did not even hire your consulting, just consuming your free content recruiters started pinging me again. I made a few adjustments and seem to have reappeared on their radar, I do not think that is a coincidence.',
    metrics: [
      'Did not purchase paid mentoring: applied only free guides',
      'Reports consistent resumption of recruiter inbounds after profile adjustments',
      'Personally redacted recruiter contact info before sharing',
    ],
    evidence: 'Direct feedback message with the recruiter screenshot already sanitized by him.',
    body: 'A clear demonstration for prospective students, coming from someone who applied the free principles and measured the concrete outcome.',
  },
  'felipe-barboza': {
    role: 'Java Backend Developer',
    category: 'LinkedIn Inbounds',
    headline: '4 recruiter inbounds after positioning; zero before',
    quote: 'Only these 3 since we updated the profile. Before the profile and resume adjustments, had that ever happened? Never.',
    metrics: [
      'Before profile and resume adjustments: never received a recruiter message',
      'After: 3 inbounds (F Camara, Aubay, Dexian IT Solutions) plus a 4th on the same day',
      'International role visible in screenshot: Senior Golang Developer, Dexian IT Solutions, Remote',
    ],
    evidence: 'Conversation verifying zero reach-outs before profile changes and 4 after, plus the Dexian screenshot.',
    body: 'A clean before-and-after case: zero recruiter contacts prior to the profile and resume overhaul, followed by four inquiries, including three on the exact same day.',
  },
  'felipe-lima': {
    role: 'Java Developer',
    category: 'Interviews',
    headline: 'Advanced to the English interview stage',
    quote: 'We liked your profile and would like to advance to the next stages. Are you available for a conversational English chat today at 5 PM?',
    metrics: [
      'Passed initial screening and summoned to conversational English evaluation',
      'Negotiated meeting schedule with recruiter from a position of confidence',
    ],
    evidence: 'Recruiter message scheduling the English assessment and candidate response.',
    body: 'The decisive milestone for Brazilian software engineers: the conversational English assessment invite scheduled for the same day.',
  },
  'gustavo-aluno': {
    role: 'Tech Lead / Software Engineer',
    category: 'Final Stage Interviews',
    headline: 'Near closing $8,000/month role & Canada relocation offer',
    quote: 'I am close to closing one with relocation to Canada and another for Tech Lead paying almost $8k. It has been much easier applying what was learned in 3 weeks of consulting, totally worth it.',
    metrics: [
      'Two final-stage international opportunities: Tech Lead paying nearly $8,000/month and role with Canada relocation',
      'Additional concurrent recruitment pipelines underway with HR',
      'Strategic communication framework: anchoring answers on revenue impact and infrastructure cost efficiency aligned with job descriptions',
      'Concrete results achieved after 3 weeks of consulting and technical English refinement',
    ],
    evidence: 'WhatsApp conversation detailing two final-round international roles (Canada relocation and $8,000/month Tech Lead), 3-week consulting results, and targeted technical communication.',
    body: 'The report highlights a confident interview posture: fluid technical English, low-pressure conversations, and strategic alignment around core business drivers (revenue generation and infrastructure cost control). Within three weeks of targeted consulting, the developer advanced to the final stages of two simultaneous global opportunities.',
  },
  'jeovany-negocio': {
    role: 'Software Engineer',
    category: 'Salary Negotiation',
    headline: 'Turned down local R$ 10k ceiling targeting USD contracts',
    quote: 'Unfortunately not. Robson Cassiano LinkedIn tips really work.',
    metrics: [
      'Target salary expectation: $2,500 to $2,800/month',
      'Response to R$ 10,000 CLT ceiling offer: Unfortunately not.',
      'International InMails in screenshot: DevOps in Salt Lake City, Cloud IaC, and remote Python/PostgreSQL',
    ],
    evidence: 'Negotiation log rejecting local currency ceiling in favor of dollar compensation, plus international inbox.',
    body: 'The screenshot highlights a confident refusal of a R$ 10,000 local offer because his rate card had already shifted to US dollars. Recruiter contact details were redacted.',
  },
  'kaua-sacramento': {
    role: 'Software Developer',
    category: 'Before & After',
    headline: '3 simultaneous interview pipelines from zero',
    quote: 'I am even leaving people on read because it is just too many inbounds.',
    metrics: [
      '3 opportunities active at the same time',
      'Before: had never held 3 simultaneous opportunities',
    ],
    evidence: 'Direct exchange discussing the shift to juggling 3 concurrent opportunities.',
    body: 'The strategic shift: the bottleneck ceases to be getting inbounds and becomes filtering high contact volume.',
  },
  'luiz-gasparetto': {
    role: 'Java Developer',
    category: 'LinkedIn Inbounds',
    headline: 'Spontaneous international recruiter reach-out from Minsait',
    quote: 'I am Viviane from Minsait Consulting. We have an opportunity for Java Developer, remote work, permanent contract. Would you like to evaluate new opportunities?',
    metrics: [
      'Spontaneous outreach: Minsait, Java Developer, full remote',
      'Shared progress also via voice message during chat',
    ],
    evidence: 'Recruiter message forwarded by him alongside voice updates on incoming interview schedules.',
    body: 'The message arrived without any active application, which is the exact passive discovery dynamic produced by positioning.',
  },
  'marcelo-aluno': {
    role: 'Software Developer',
    category: 'Offers Received',
    headline: 'R$ 15,000/month remote offer + 10% annual bonus',
    quote: 'I received a reach-out from an international recruiter.',
    metrics: [
      'Offer: R$ 15,000/month + 10% annual bonus',
      'Role: Fullstack Software Engineer Remote (Java & Angular), InComm Payments',
    ],
    evidence: 'Recruiter message outlining base compensation, bonus, and contract model.',
    body: 'The offer arrived with complete transparency: monthly compensation, annual bonus, and remote setup for a Java and Angular stack.',
  },
  'marcelo-jean': {
    role: 'Backend Software Engineer',
    category: 'Before & After',
    headline: 'From 1 message a month to continuous inbound volume',
    quote: 'I used to get maybe 1 message a month, but recently after small updates profile visits and passive recruiter contact grew significantly.',
    metrics: [
      'Before: roughly 1 recruiter message per month',
      'After: significant increase in profile visits and passive recruiter inquiries',
      'Featured example: Louis Dreyfus Company outreach for Backend Software Engineer',
    ],
    evidence: 'Chat exchange comparing prior frequency against current volume plus the new opportunity screenshot.',
    body: 'Quantified by the candidate: from approximately one sporadic message a month to sustained, inbound interest.',
  },
  'marcos-vinicius': {
    role: 'Software Developer',
    category: 'LinkedIn Inbounds',
    headline: 'Turning down technical interviews due to inbound volume',
    quote: 'Recruiter messages will not stop ringing here. I am even turning down interviews.',
    metrics: [
      'Continuous stream of recruiter inbounds',
      'Declining interviews due to inability to absorb all pipeline slots',
    ],
    evidence: 'Unsolicited direct message sharing recruiter reach-outs.',
    body: 'Also documents technical screening insights: corporate recruiters specifically filtering by explicit Java LTS versions.',
  },
  'matus-moura': {
    role: 'Software Developer',
    category: 'Before & After',
    headline: 'From never getting called to booked interview pipelines',
    quote: 'Before, I could not even reach the interview stage.',
    metrics: [
      'Before: could not reach the interview phase',
      'After: multiple scheduled technical interviews, including GBT Solutions',
      'Declared target: earning in Euros and securing Senior tier',
    ],
    evidence: 'Quote comparing before and after alongside recruiter scheduling confirmation email.',
    body: 'The most direct account of overcoming the gatekeeping barrier: the hurdle was not passing interviews, but getting invited to them.',
  },
  'thaissa-barbosa': {
    role: 'Software Developer',
    category: 'LinkedIn Inbounds',
    headline: '3 recruiter messages in a single day',
    quote: 'And today I received 3 more messages.',
    metrics: [
      '3 inbounds in a single day',
      '4 visible recruiter contacts: Ovi O.Kedo, Wendell Costa (Full-stack), Nesj Joy Ordonio (Software Engineer Expert C# Remote), Carlos Levir',
    ],
    evidence: 'Inbox screenshot showing same-day reach-outs.',
    body: 'Concentrated volume: three recruiters on the exact same day, spanning domestic and international opportunities.',
  },
};

function figureFor(testimonial, index, image, isEn, evidenceText) {
  const src = `/assets/images/depoimentos/${image}`;
  const { width, height } = webpDimensions(image);
  const caption = index === 0
    ? escapeHtml(evidenceText)
    : (isEn ? 'Supplementary evidence provided directly by the testimonial author.' : 'Evidência complementar enviada pelo próprio autor do depoimento.');

  return `        <figure class="dep-figure">
          <img src="${src}" alt="${isEn ? 'Screenshot sent by' : 'Print enviado por'} ${escapeHtml(testimonial.name)}: ${escapeHtml(stripTags(evidenceText)).slice(0, 150)}" width="${width}" height="${height}" loading="lazy" decoding="async">
          <figcaption>${caption}</figcaption>
        </figure>`;
}

export function buildTestimonialsPage({ testimonials, stylesHref, lang = 'pt' }) {
  const isEn = lang === 'en';
  const published = testimonials.filter((t) => t.consent);

  const CANONICAL = isEn
    ? 'https://eu.robsoncassiano.software/en/testimonials/'
    : 'https://eu.robsoncassiano.software/depoimentos/';
  const PT_URL = 'https://eu.robsoncassiano.software/depoimentos/';
  const EN_URL = 'https://eu.robsoncassiano.software/en/testimonials/';
  const MD_URL = isEn
    ? 'https://eu.robsoncassiano.software/en/testimonials/index.md'
    : 'https://eu.robsoncassiano.software/depoimentos/index.md';

  const TITLE = 'Real Wins - Global DEV Playbook Testimonials';
  const DESCRIPTION = isEn
    ? 'Real screenshots of recruiter reach-outs, interview invites, and dollar offers: before and after developer career repositioning.'
    : 'Depoimentos com print de abordagens de recrutadores, entrevistas e contratos: o antes e o depois de desenvolvedores que ajustaram perfil, curriculo e posicionamento internacional.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${CANONICAL}#collection`,
        url: CANONICAL,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: isEn ? 'en' : 'pt-BR',
        isPartOf: { '@id': isEn ? 'https://eu.robsoncassiano.software/en/#profilepage' : 'https://eu.robsoncassiano.software/#profilepage' },
        about: { '@id': 'https://eu.robsoncassiano.software/#person' },
        mainEntity: { '@id': `${CANONICAL}#itemlist` },
      },
      {
        '@type': 'ItemList',
        '@id': `${CANONICAL}#itemlist`,
        name: isEn ? 'Testimonials with evidence' : 'Depoimentos com evidencia',
        numberOfItems: published.length,
        itemListElement: published.map((t, i) => {
          const tEn = isEn ? TESTIMONIALS_EN[t.slug] || {} : {};
          const role = isEn ? tEn.role || t.role : t.role;
          const headline = isEn ? tEn.headline || t.headline : t.headline;
          const quote = isEn ? tEn.quote || t.quote : t.quote;
          return {
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Person',
              name: t.name,
              jobTitle: role,
              description: `${headline}. ${quote}`,
            },
          };
        }),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${CANONICAL}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: isEn ? 'Home' : 'Início',
            item: isEn ? 'https://eu.robsoncassiano.software/en/' : 'https://eu.robsoncassiano.software/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: isEn ? 'Testimonials' : 'Depoimentos',
            item: CANONICAL,
          },
        ],
      },
    ],
  };

  const cards = published
    .map((t) => {
      const tEn = isEn ? TESTIMONIALS_EN[t.slug] || {} : {};
      const role = isEn ? tEn.role || t.role : t.role;
      const category = isEn ? tEn.category || t.category : t.category;
      const headline = isEn ? tEn.headline || t.headline : t.headline;
      const quote = isEn ? tEn.quote || t.quote : t.quote;
      const metricsList = isEn ? tEn.metrics || t.metrics : t.metrics;
      const evidenceText = isEn ? tEn.evidence || t.evidence : t.evidence;
      const body = isEn ? tEn.body || stripTags(t.body) : stripTags(t.body);

      const metrics = metricsList.length
        ? `        <ul class="dep-metrics">\n${metricsList.map((m) => `          <li>${escapeHtml(m)}</li>`).join('\n')}\n        </ul>`
        : '';
      const figures = t.images.length
        ? `        <div class="dep-gallery">\n${t.images.map((img, i) => figureFor(t, i, img, isEn, evidenceText)).join('\n')}\n        </div>`
        : '';

      return `      <article class="dep-card" id="${escapeHtml(t.slug)}">
        <header>
          <span class="dep-cat">${escapeHtml(category)}</span>
          <h2>${escapeHtml(t.name)}</h2>
          <p class="dep-role">${escapeHtml(role)}</p>
          <p class="dep-headline">${escapeHtml(headline)}</p>
        </header>

        <blockquote class="dep-quote">
          <p>${escapeHtml(quote)}</p>
          <cite>${escapeHtml(t.name)}</cite>
        </blockquote>
${metrics}
${figures}
${body ? `        <p class="dep-body">${escapeHtml(body)}</p>` : ''}
      </article>`;
    })
    .join('\n');

  const heroBadge = isEn ? 'Public and auditable proof' : 'Prova pública e auditável';
  const heroLead = isEn
    ? 'Every account below was sent spontaneously by developers, with original screenshots preserved as evidence. The recurring pattern: before repositioning profile, resume, and communication, recruiters did not reach out. Afterward, inbounds started arriving automatically.'
    : 'Todos os relatos abaixo foram enviados espontaneamente por desenvolvedores, com o print original preservado como evidência. O padrão que se repete: antes do ajuste de perfil, currículo e posicionamento, os recrutadores não chegavam. Depois, passaram a chegar sozinhos.';
  const heroNote = isEn
    ? 'Screenshots published with author consent. Recruiter phone numbers, emails, and links have been redacted, and third-party LinkedIn sidebars removed during image processing. Pure static HTML: zero JavaScript required.'
    : 'Prints publicados com autorização dos autores. Telefones, e-mails e links de recrutadores foram censurados e a lista lateral de contatos do LinkedIn foi removida no processamento das imagens. Nenhum resultado aqui depende de JavaScript para ser lido: a página é estática.';

  const breadcrumbHome = isEn ? 'Home' : 'Início';
  const breadcrumbHomeUrl = isEn ? '/en/' : '/';
  const breadcrumbCurrent = isEn ? 'Testimonials' : 'Depoimentos';

  const navArticles = isEn ? 'Articles' : 'Artigos';
  const navArticlesUrl = '/artigos/';
  const navBlogUrl = isEn ? '/en/#artigos' : '/#artigos';
  const langSwitchUrl = isEn ? '/depoimentos/' : '/en/testimonials/';
  const langSwitchLabel = isEn ? 'PT' : 'EN';
  const langSwitchHreflang = isEn ? 'pt-BR' : 'en';

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pt-BR'}" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(TITLE)}</title>
  <meta name="description" content="${escapeHtml(DESCRIPTION)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${CANONICAL}">
  <link rel="alternate" hreflang="pt-BR" href="${PT_URL}">
  <link rel="alternate" hreflang="en" href="${EN_URL}">
  <link rel="alternate" hreflang="x-default" href="${PT_URL}">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png">
  <link rel="shortcut icon" href="/assets/icons/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link rel="alternate" type="text/markdown" href="${MD_URL}" title="Markdown Version for AI Agents">
  <link rel="alternate" type="text/plain" href="https://eu.robsoncassiano.software/llms.txt" title="LLMs.txt">

  <meta property="og:type" content="website">
  <meta property="og:locale" content="${isEn ? 'en_US' : 'pt_BR'}">
  <meta property="og:locale:alternate" content="${isEn ? 'pt_BR' : 'en_US'}">
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
    .dep-cta-wrap { margin-top: 64px; }
    .dep-cta-box {
      border: 1px solid rgba(223, 177, 91, 0.22);
      border-radius: 24px;
      padding: 56px 32px 48px;
      background: radial-gradient(circle at 50% 0%, rgba(223, 177, 91, 0.08) 0%, transparent 70%), linear-gradient(180deg, #16151c, #0d0c12);
      text-align: center;
      max-width: 52rem;
      margin: 0 auto;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
    }
    .dep-cta-kicker {
      font-family: Georgia, Cambria, "Times New Roman", Times, serif;
      font-style: italic;
      color: #dfb15b;
      font-size: 1.25rem;
      margin: 0 0 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .dep-cta-kicker::before,
    .dep-cta-kicker::after {
      content: "";
      display: inline-block;
      width: 28px;
      height: 1px;
      background: #dfb15b;
      opacity: 0.65;
    }
    .dep-cta-title {
      font-size: clamp(1.85rem, 4.5vw, 2.6rem);
      font-weight: 800;
      color: #ffffff;
      line-height: 1.2;
      margin: 0 0 20px;
      letter-spacing: -0.02em;
    }
    .dep-cta-accent {
      color: #dfb15b;
    }
    .dep-cta-desc {
      font-size: 1.05rem;
      color: #cbd5e1;
      max-width: 38rem;
      margin: 0 auto 36px;
      line-height: 1.65;
    }
    .dep-cta-action {
      display: flex;
      justify-content: center;
    }
    .dep-cta-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: linear-gradient(180deg, #dfb15b, #c9983e);
      color: #08080a;
      font-weight: 800;
      font-size: 1.05rem;
      padding: 16px 36px;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 6px 24px rgba(223, 177, 91, 0.28);
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }
    .dep-cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 32px rgba(223, 177, 91, 0.42);
      background: linear-gradient(180deg, #ebd188, #dfb15b);
    }
    .dep-cta-btn:focus-visible {
      outline: 2px solid #dfb15b;
      outline-offset: 4px;
    }
    .dep-cta-divider {
      height: 1px;
      background: #252530;
      max-width: 52rem;
      margin: 56px auto 36px;
    }
    .dep-cta-author {
      font-family: Georgia, Cambria, "Times New Roman", Times, serif;
      font-style: italic;
      color: #dfb15b;
      font-size: 1.3rem;
      margin: 0 0 10px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .dep-cta-author::before {
      content: "";
      display: inline-block;
      width: 24px;
      height: 1px;
      background: #dfb15b;
      opacity: 0.65;
    }
    .dep-cta-community {
      font-size: 0.95rem;
      color: #94a3b8;
      text-align: center;
      margin: 0;
    }
    .dep-cta-community a {
      color: #f6e0a4;
      text-decoration: underline;
      text-underline-offset: 4px;
      transition: color 0.2s ease;
    }
    .dep-cta-community a:hover {
      color: #dfb15b;
    }
    footer { border-top: 1px solid #252530; margin-top: 56px; padding: 32px 0; text-align: center; font-size: 13px; color: #94a3b8; }
    footer a { color: #dfb15b; }
  </style>
</head>
<body>
  <header class="dep-header">
    <div class="dep-header-in">
      <a class="dep-brand" href="${breadcrumbHomeUrl}"><span>Robson<em>Cassiano</em></span></a>
      <nav class="dep-nav" aria-label="${isEn ? 'Navigation' : 'Navegação'}">
        <a href="${navArticlesUrl}">${navArticles}</a>
        <a href="${navBlogUrl}">Blog</a>
        <a href="${langSwitchUrl}" hreflang="${langSwitchHreflang}">${langSwitchLabel}</a>
      </nav>
    </div>
  </header>

  <nav aria-label="Breadcrumb" class="dep-wrap" style="padding-top:24px">
    <ol style="list-style:none;display:flex;gap:8px;padding:0;margin:0;font-size:12px;color:#94a3b8">
      <li><a href="${breadcrumbHomeUrl}" style="color:#94a3b8">${breadcrumbHome}</a></li>
      <li>/</li>
      <li aria-current="page" style="color:#dfb15b">${breadcrumbCurrent}</li>
    </ol>
  </nav>

  <main class="dep-wrap" style="padding:24px 24px 0">
    <p class="dep-badge">${heroBadge}</p>
    <h1>${escapeHtml(TITLE)}</h1>
    <p class="dep-lead">${escapeHtml(heroLead)}</p>
    <p class="dep-note">${escapeHtml(heroNote)}</p>

    <ul class="dep-list">
${cards}
    </ul>

    <section class="dep-cta-wrap" aria-labelledby="cta-heading">
      <div class="dep-cta-box">
        <p class="dep-cta-kicker">Your turn</p>
        <h2 id="cta-heading" class="dep-cta-title">
          You just scrolled past <span class="dep-cta-accent">${published.length} reasons</span> to join.
        </h2>
        <p class="dep-cta-desc">
          Every person in those screenshots was where you are now. They paid the $30. They showed up. They learned. They won.
        </p>
        <div class="dep-cta-action">
          <a href="https://robsoncassiano.software/skool-global-dev-playbook" class="dep-cta-btn" target="_blank" rel="noopener noreferrer">
            Join the Global DEV Playbook <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>

      <div class="dep-cta-divider"></div>

      <div class="dep-cta-footer">
        <p class="dep-cta-author">Robson</p>
        <p class="dep-cta-community">
          Designed for the <a href="https://robsoncassiano.software/skool-global-dev-playbook" target="_blank" rel="noopener noreferrer">Global DEV Playbook</a> community.
        </p>
      </div>
    </section>
  </main>

  <footer>
    <div class="dep-wrap">
      <p>&copy; ${new Date().getFullYear()} Robson Cassiano · <a href="${breadcrumbHomeUrl}">eu.robsoncassiano.software</a> · <a href="/artigos/">Blog</a> · <a href="/privacidade/">${isEn ? 'Privacy Policy' : 'Política de Privacidade'}</a></p>
    </div>
  </footer>
</body>
</html>
`;
}

/** Gêmeo em markdown, negociado na borda para agentes de IA. */
export function buildTestimonialsMarkdown({ testimonials, lang = 'pt' }) {
  const isEn = lang === 'en';
  const published = testimonials.filter((t) => t.consent);
  const CANONICAL = isEn
    ? 'https://eu.robsoncassiano.software/en/testimonials/'
    : 'https://eu.robsoncassiano.software/depoimentos/';

  const title = 'Real Wins - Global DEV Playbook Testimonials';
  const intro = isEn
    ? 'Accounts sent spontaneously by developers, with original screenshots preserved as evidence. Recurring pattern: before profile and resume repositioning recruiters did not reach out; afterward they started arriving on their own.'
    : 'Relatos enviados espontaneamente por desenvolvedores, com print original como evidência. Padrão recorrente: antes do ajuste de perfil e currículo os recrutadores não chegavam; depois passaram a chegar sozinhos.';

  const lines = [
    `# ${title}`,
    '',
    `> ${intro}`,
    '',
    `- Canonical URL: ${CANONICAL}`,
    '- Author: Robson Cassiano (https://eu.robsoncassiano.software/#person)',
    `- Language: ${isEn ? 'en' : 'pt-BR'}`,
    `- Testimonials: ${published.length}`,
    '',
    '---',
    '',
  ];

  for (const t of published) {
    const tEn = isEn ? TESTIMONIALS_EN[t.slug] || {} : {};
    const role = isEn ? tEn.role || t.role : t.role;
    const category = isEn ? tEn.category || t.category : t.category;
    const headline = isEn ? tEn.headline || t.headline : t.headline;
    const quote = isEn ? tEn.quote || t.quote : t.quote;
    const metricsList = isEn ? tEn.metrics || t.metrics : t.metrics;
    const body = isEn ? tEn.body || stripTags(t.body) : stripTags(t.body);

    lines.push(`## ${t.name}: ${headline}`);
    lines.push('');
    lines.push(`- Role: ${role}`);
    lines.push(`- Category: ${category}`);
    lines.push('');
    lines.push(`> ${quote}`);
    lines.push('');
    if (metricsList.length) {
      for (const m of metricsList) lines.push(`- ${m}`);
      lines.push('');
    }
    lines.push(body);
    lines.push('');
    if (t.images.length) {
      lines.push(`Evidence (image): ${t.images.map((i) => `https://eu.robsoncassiano.software/assets/images/depoimentos/${i}`).join(', ')}`);
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');
  lines.push('### Your turn');
  lines.push('');
  lines.push(`You just scrolled past ${published.length} reasons to join.`);
  lines.push('');
  lines.push('Every person in those screenshots was where you are now. They paid the $30. They showed up. They learned. They won.');
  lines.push('');
  lines.push('[Join the Global DEV Playbook →](https://robsoncassiano.software/skool-global-dev-playbook)');
  lines.push('');
  lines.push('Robson');
  lines.push('');
  lines.push('Designed for the [Global DEV Playbook](https://robsoncassiano.software/skool-global-dev-playbook) community.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}
