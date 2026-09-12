/**
 * /privacidade/ — Política de Privacidade.
 *
 * Every message of the 7-day drip sequence and every broadcast links to this URL,
 * so it must exist: a dead privacy link in outbound email is a compliance defect
 * (LGPD art. 9º requires informing the data subject how their data is handled).
 *
 * The content is derived strictly from what the code actually does:
 *   - subscribers table (schema.sql): email, name, status, source, ip_country,
 *     sequence state, created_at/unsubscribed_at.
 *   - capture-worker: raw IP is used only for rate limiting and is NOT stored;
 *     only the two-letter country (cf-ipcountry) is persisted.
 *   - unsubscribe sets status='unsubscribed' (it does not delete the row).
 *   - front-end processors: Cloudflare (Pages, D1, Turnstile, Web Analytics),
 *     Google Fonts, YouTube thumbnails.
 * Nothing about the controller's registry data is invented: identity is given as
 * the entity already declared in the site's structured data plus a real contact.
 */

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const PRIVACY_UPDATED = '2026-09-12';

export function buildPrivacyPage({ stylesHref }) {
  const canonicalUrl = 'https://eu.robsoncassiano.software/privacidade/';
  const title = 'Política de Privacidade | Robson Cassiano';
  const description =
    'Como os dados de contato enviados pelo formulário deste site são coletados, usados, armazenados e eliminados, conforme a LGPD (Lei 13.709/2018).';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        inLanguage: 'pt-BR',
        dateModified: PRIVACY_UPDATED,
        isPartOf: { '@id': 'https://eu.robsoncassiano.software/#profilepage' },
        publisher: { '@id': 'https://eu.robsoncassiano.software/#organization' },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://eu.robsoncassiano.software/' },
          { '@type': 'ListItem', position: 2, name: 'Política de Privacidade', item: canonicalUrl },
        ],
      },
    ],
  };

  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" hreflang="pt-BR" href="${canonicalUrl}">
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png">
  <link rel="shortcut icon" href="/assets/icons/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">

  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="https://eu.robsoncassiano.software/assets/images/Robson-Cassiano.webp">
  <meta property="og:site_name" content="Robson Cassiano - Senior Software Engineer">
  <meta name="twitter:card" content="summary">

  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>

  <link rel="stylesheet" href="${stylesHref}">
  <style>
    body { background-color: #08080a; color: #cbd5e1; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; line-height: 1.7; }
    .pv-wrap { max-width: 52rem; margin: 0 auto; padding: 0 24px; }
    .pv-header { border-bottom: 1px solid #252530; position: sticky; top: 0; background: #08080a; z-index: 20; }
    .pv-header-in { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 24px; max-width: 52rem; margin: 0 auto; }
    .pv-brand { font-weight: 700; color: #fff; font-size: 18px; text-decoration: none; }
    .pv-brand em { color: #dfb15b; font-style: normal; }
    .pv-header a { text-decoration: none; }
    .pv-back { color: #94a3b8; font-size: 14px; font-weight: 600; }
    .pv-back:hover { color: #dfb15b; }
    h1 { font-size: clamp(1.8rem, 4.5vw, 2.4rem); font-weight: 800; color: #fff; line-height: 1.2; margin: 0 0 12px; }
    h2 { font-size: 1.3rem; font-weight: 700; color: #fff; margin: 40px 0 12px; }
    h3 { font-size: 1.05rem; font-weight: 700; color: #dfb15b; margin: 24px 0 8px; }
    p, li { color: #cbd5e1; }
    ul { padding-left: 22px; }
    li { margin-bottom: 6px; }
    a { color: #dfb15b; }
    a:hover { color: #f6e0a4; }
    .pv-updated { color: #94a3b8; font-size: 13px; margin: 0 0 28px; }
    .pv-lead { font-size: 1.05rem; color: #9e9ea8; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #252530; border-radius: 12px; overflow: hidden; font-size: .95rem; }
    th { background: #16161c; color: #fff; text-align: left; padding: 10px 14px; border: 1px solid #252530; font-size: .875rem; }
    td { padding: 10px 14px; border: 1px solid #252530; color: #cbd5e1; vertical-align: top; }
    tr:nth-child(even) td { background: rgba(22,22,28,.4); }
    code { background: #14141a; border: 1px solid #252530; border-radius: 4px; padding: 1px 5px; font-size: .85em; color: #dfb15b; }
    footer { border-top: 1px solid #252530; margin-top: 56px; padding: 32px 0; text-align: center; font-size: 13px; color: #94a3b8; }
  </style>
</head>
<body>
  <header class="pv-header">
    <div class="pv-header-in">
      <a class="pv-brand" href="/"><span>Robson<em>Cassiano</em></span></a>
      <a class="pv-back" href="/"><span aria-hidden="true">&larr;</span> Voltar ao site</a>
    </div>
  </header>

  <nav aria-label="Breadcrumb" class="pv-wrap" style="padding-top:24px">
    <ol style="list-style:none;display:flex;gap:8px;padding:0;margin:0;font-size:12px;color:#94a3b8">
      <li><a href="/" style="color:#94a3b8">Início</a></li>
      <li>/</li>
      <li style="color:#dfb15b">Política de Privacidade</li>
    </ol>
  </nav>

  <main class="pv-wrap" style="padding:24px 24px 0">
    <h1>Política de Privacidade</h1>
    <p class="pv-updated">Última atualização: ${PRIVACY_UPDATED}</p>

    <p class="pv-lead">
      Esta política descreve como os dados enviados pelo formulário de inscrição deste site
      (eu.robsoncassiano.software) são coletados, usados, armazenados e eliminados, em conformidade
      com a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).
    </p>

    <h2>1. Quem é o controlador</h2>
    <p>
      O controlador dos dados é <strong>Robson Cassiano</strong>, atuando por meio da
      <strong>Simple Software LTDA</strong> (a mesma entidade declarada como publisher nos dados
      estruturados deste site). Canal oficial para qualquer assunto de privacidade:
      <a href="mailto:contato@robsoncassiano.software">contato@robsoncassiano.software</a>.
    </p>

    <h2>2. Quais dados são coletados</h2>
    <p>
      Apenas os dados fornecidos voluntariamente no formulário, mais informações técnicas mínimas
      geradas no momento da inscrição:
    </p>
    <table>
      <thead>
        <tr><th>Dado</th><th>Origem</th><th>Obrigatório</th></tr>
      </thead>
      <tbody>
        <tr><td>Endereço de e-mail</td><td>Informado por você no formulário</td><td>Sim</td></tr>
        <tr><td>Primeiro nome</td><td>Informado por você no formulário</td><td>Não</td></tr>
        <tr><td>Página de origem da inscrição</td><td>Coletado automaticamente (ex.: <code>article_cta</code>)</td><td>Sim</td></tr>
        <tr><td>País de origem (duas letras)</td><td>Derivado do IP pela Cloudflare no momento da requisição</td><td>Sim</td></tr>
        <tr><td>Datas de inscrição e de descadastro</td><td>Geradas automaticamente</td><td>Sim</td></tr>
        <tr><td>Estado do envio (etapa da sequência, status)</td><td>Gerado automaticamente</td><td>Sim</td></tr>
      </tbody>
    </table>
    <p>
      <strong>Não armazenamos o seu endereço IP.</strong> O IP é usado exclusivamente, em memória,
      para limitar a taxa de requisições e bloquear abusos, e é descartado em seguida. Também não
      coletamos dados sensíveis (art. 5º, II da LGPD), não fazemos perfilamento comportamental e não
      usamos os seus dados para treinar modelos de inteligência artificial.
    </p>

    <h2>3. Para que usamos os dados e com qual base legal</h2>
    <ul>
      <li><strong>Enviar o material solicitado</strong> (e-book e acesso aos conteúdos) e a sequência de e-mails educativos de 7 dias.</li>
      <li><strong>Comunicar novos ensaios e materiais</strong> publicados no site, quando você optar por receber.</li>
      <li><strong>Garantir a segurança e a integridade do serviço</strong> (prevenção de fraude, abuso e envio automatizado).</li>
    </ul>
    <p>
      A base legal é o <strong>seu consentimento</strong> (art. 7º, I da LGPD), manifestado no ato da
      inscrição. Você pode revogá-lo a qualquer momento, sem qualquer prejuízo, pelo link de
      descadastro presente em todos os e-mails ou por solicitação ao canal indicado no item 1.
    </p>

    <h2>4. Onde os dados ficam armazenados</h2>
    <p>
      Os dados de inscrição ficam em um banco de dados <strong>Cloudflare D1</strong>, operado pela
      infraestrutura da Cloudflare, Inc. Como a Cloudflare opera uma rede global distribuída, os
      dados podem ser processados em servidores fora do Brasil, o que caracteriza transferência
      internacional de dados (arts. 33 a 36 da LGPD). A Cloudflare mantém cláusulas contratuais e
      compromissos de proteção de dados para seus serviços.
    </p>

    <h2>5. Cookies e armazenamento local</h2>
    <p>
      Este site <strong>não usa cookies de publicidade, de rastreamento ou de redes sociais</strong>.
      O que existe é o mínimo necessário para o funcionamento e a segurança:
    </p>
    <table>
      <thead>
        <tr><th>Item</th><th>Tipo</th><th>Finalidade</th></tr>
      </thead>
      <tbody>
        <tr><td><code>__cf_bm</code> e correlatos</td><td>Cookie de segurança</td><td>Distingue tráfego humano de automatizado. Definido pela Cloudflare.</td></tr>
        <tr><td>Cloudflare Turnstile</td><td>Desafio anti-robô</td><td>Protege o formulário de inscrição contra envio automatizado, processando sinais do dispositivo no momento do desafio.</td></tr>
        <tr><td><code>preferred-language</code></td><td>Armazenamento local</td><td>Lembra o idioma escolhido (português ou inglês).</td></tr>
        <tr><td><code>rc_embed_subscribed</code>, <code>rc_embed_dismissed</code></td><td>Armazenamento local</td><td>Evita exibir novamente o formulário ou o convite já respondido/dispensado.</td></tr>
        <tr><td>Cloudflare Web Analytics</td><td>Métricas agregadas</td><td>Contagem anônima de visitas e desempenho, sem cookies e sem identificação individual, conforme a documentação da Cloudflare.</td></tr>
        <tr><td>Google Fonts</td><td>Recurso externo</td><td>Carrega as fontes tipográficas do site; a requisição é feita aos servidores do Google, que registra o IP do visitante para entregar o arquivo.</td></tr>
        <tr><td>Miniaturas e vídeos do YouTube</td><td>Recurso externo</td><td>As miniaturas são carregadas do domínio do YouTube; o player incorporado só é carregado após o seu clique.</td></tr>
      </tbody>
    </table>

    <h2>6. Com quem os dados são compartilhados</h2>
    <p>
      Não vendemos, alugamos nem cedemos os seus dados. Eles são acessíveis apenas a
      <strong>operadores</strong> estritamente necessários à prestação do serviço:
    </p>
    <ul>
      <li><strong>Cloudflare, Inc.</strong> — hospedagem do site, banco de dados (D1), proteção anti-robô (Turnstile), métricas agregadas e envio dos e-mails.</li>
      <li><strong>Google LLC</strong> — entrega das fontes tipográficas utilizadas na interface.</li>
    </ul>
    <p>
      Dados também podem ser divulgados se houver obrigação legal ou ordem de autoridade competente.
    </p>

    <h2>7. Por quanto tempo os dados são mantidos</h2>
    <p>
      Enquanto a inscrição estiver ativa e você desejar receber os conteúdos. Ao se descadastrar, o
      registro é <strong>marcado como inativo</strong> e todos os envios são interrompidos
      imediatamente — a marcação é mantida justamente para garantir que nenhuma nova mensagem seja
      enviada. Você pode solicitar a <strong>eliminação definitiva</strong> do registro a qualquer
      momento pelo canal do item 1, e ela será executada sem custo.
    </p>
    <p>
      Registros de envio (histórico de disparos) podem ser mantidos de forma agregada ou anonimizada
      para fins de auditoria e de comprovação de conformidade.
    </p>

    <h2>8. Seus direitos</h2>
    <p>Nos termos do art. 18 da LGPD, você pode solicitar a qualquer momento:</p>
    <ul>
      <li>Confirmação da existência de tratamento e acesso aos dados.</li>
      <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
      <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei.</li>
      <li>Portabilidade dos dados a outro fornecedor, mediante requisição expressa.</li>
      <li>Eliminação dos dados tratados com base no consentimento.</li>
      <li>Informação sobre as entidades com as quais os dados foram compartilhados.</li>
      <li>Revogação do consentimento, a qualquer momento.</li>
    </ul>
    <p>
      Para exercer qualquer um desses direitos, escreva para
      <a href="mailto:contato@robsoncassiano.software">contato@robsoncassiano.software</a>.
      A resposta é enviada em até 15 dias.
    </p>

    <h2>9. Como se descadastrar</h2>
    <p>
      Todo e-mail enviado contém um link de <strong>descadastro em um clique</strong>, compatível com
      o padrão <code>RFC 8058</code> (o botão nativo "Cancelar inscrição" dos principais provedores).
      O efeito é imediato. Também é possível se descadastrar por este endereço:
      <a href="https://eu.robsoncassiano.software/api/unsubscribe?email=">eu.robsoncassiano.software/api/unsubscribe</a>.
    </p>

    <h2>10. Segurança</h2>
    <p>
      O site opera integralmente sobre HTTPS. O formulário de inscrição é protegido por
      <strong>Cloudflare Turnstile</strong> e por <strong>limitação de taxa</strong> por origem, e os
      dados recebidos passam por validação e sanitização na borda antes de chegarem ao banco.
      O acesso ao banco de dados é restrito ao próprio serviço.
    </p>

    <h2>11. Alterações desta política</h2>
    <p>
      Esta política pode ser atualizada para refletir mudanças no serviço ou na legislação. A data de
      última atualização é sempre exibida no topo desta página. Alterações materiais que afetem os
      seus direitos serão comunicadas por e-mail aos inscritos ativos.
    </p>

    <h2>12. Contato</h2>
    <p>
      Dúvidas, solicitações ou reclamações sobre privacidade e proteção de dados:
      <a href="mailto:contato@robsoncassiano.software">contato@robsoncassiano.software</a>.
      Você também pode peticionar à Autoridade Nacional de Proteção de Dados (ANPD).
    </p>
  </main>

  <footer>
    <div class="pv-wrap">
      <p>&copy; ${new Date().getFullYear()} Robson Cassiano · <a href="/">eu.robsoncassiano.software</a> · <a href="/artigos/">Todos os artigos</a></p>
    </div>
  </footer>
</body>
</html>
`;
}
