import { EmailEnv, sendEmail } from './_email';

async function hasValidMxRecord(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`, {
      headers: { Accept: 'application/dns-json' },
    });
    if (!res.ok) return true;
    const data = await res.json() as { Status: number; Answer?: Array<{ type: number; data: string }> };

    // Status 3: NXDOMAIN (domínio não existe na raiz DNS global)
    if (data.Status === 3) return false;

    // Se possui registros MX configurados
    if (data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0) return true;

    // Fallback RFC 5321 para domínios sem MX explícito com registro A
    const aRes = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, {
      headers: { Accept: 'application/dns-json' },
    });
    if (!aRes.ok) return true;
    const aData = await aRes.json() as { Status: number; Answer?: Array<{ type: number; data: string }> };
    return aData.Status === 0 && Array.isArray(aData.Answer) && aData.Answer.length > 0;
  } catch (err) {
    console.error('[DNS MX Validation Error]:', err);
    return true; // Fail-open para resiliência
  }
}

export const onRequest: PagesFunction<EmailEnv> = async (context) => {
  const { request, env } = context;

  // Global CORS preflight handler
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  try {
    let body: { email?: string; name?: string; source?: string; turnstileToken?: string; 'cf-turnstile-response'?: string } = {};
    try {
      const text = await request.text();
      body = JSON.parse(text);
    } catch {
      try {
        body = await request.json();
      } catch {}
    }

    // 0. Cloudflare Turnstile Anti-Bot Verification
    const turnstileToken = body.turnstileToken || body['cf-turnstile-response'] || request.headers.get('cf-turnstile-response');
    if (env.TURNSTILE_SECRET_KEY && turnstileToken) {
      try {
        const clientIp = request.headers.get('cf-connecting-ip') || '';
        const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: env.TURNSTILE_SECRET_KEY,
            response: turnstileToken,
            remoteip: clientIp || undefined,
          }),
        });
        const turnstileOutcome = (await turnstileRes.json()) as { success: boolean; 'error-codes'?: string[] };
        if (!turnstileOutcome.success) {
          return new Response(JSON.stringify({ error: 'Verificação de segurança (Turnstile) falhou. Por favor, tente novamente.' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      } catch (err) {
        console.error('[Turnstile Verification Error]:', err);
      }
    }

    // 1. Sanitização e Normalização Estrita (Unicode, Zero-Width Spaces, Trim, Lowercase)
    let rawEmail = body.email ? body.email.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim().toLowerCase() : '';
    const name = body.name ? body.name.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim() : '';
    const source = body.source ? body.source.trim() : 'portfolio';

    // Validação estrita de formato RFC 5322
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!rawEmail || !emailRegex.test(rawEmail) || rawEmail.length < 5 || rawEmail.length > 254) {
      return new Response(JSON.stringify({ error: 'E-mail inválido ou incompleto.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const [localPart, domain] = rawEmail.split('@');

    // Validação de limites RFC 5321 (Local: máx 64 chars, Domínio: máx 255 chars)
    if (localPart.length > 64 || domain.length > 255) {
      return new Response(JSON.stringify({ error: 'Comprimento de e-mail inválido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Bloqueio de e-mails departamentais / genéricos (Role-Based Addresses)
    const roleBasedPrefixes = new Set([
      'admin', 'administrator', 'contato', 'contact', 'suporte', 'support', 'help', 'info',
      'informacoes', 'financeiro', 'finance', 'billing', 'faturamento', 'vendas', 'sales',
      'comercial', 'postmaster', 'hostmaster', 'webmaster', 'abuse', 'noreply', 'no-reply',
      'marketing', 'rh', 'hr', 'jobs', 'carreiras', 'careers', 'sac', 'atendimento',
      'recepcao', 'press', 'imprensa', 'parcerias', 'contabilidade'
    ]);

    // Extrai o identificador base (removendo tags + se existirem)
    const baseLocalPart = localPart.split('+')[0];
    if (roleBasedPrefixes.has(baseLocalPart)) {
      return new Response(JSON.stringify({ 
        error: 'Por favor, utilize seu e-mail individual ou corporativo pessoal (não aceitamos e-mails genéricos de equipe como contato@, suporte@, admin@).' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Bloqueio de domínios descartáveis e de teste que causam Hard Bounces
    const blockedDomains = new Set([
      'example.com', 'example.org', 'example.net', 'test.com', 'invalid.com', 'localhost',
      'mailinator.com', 'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'throwawaymail.com',
      'yopmail.com', 'trashmail.com', 'sharklasers.com', 'dispostable.com', 'getairmail.com',
      'nada.ltd', 'mohmal.com', 'burnermail.io'
    ]);

    if (blockedDomains.has(domain) || rawEmail.startsWith('test_')) {
      return new Response(JSON.stringify({ error: 'Por favor, utilize um endereço de e-mail válido e definitivo.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Detecção de erros comuns de digitação em domínios populares
    const typoCorrections: Record<string, string> = {
      'gmai.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'hotmial.com': 'hotmail.com',
      'hotmai.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'outloo.com': 'outlook.com',
      'yaho.com': 'yahoo.com',
      'yahooo.com': 'yahoo.com'
    };

    if (typoCorrections[domain]) {
      return new Response(JSON.stringify({ 
        error: `Você quis dizer ${localPart}@${typoCorrections[domain]}? Corrija seu e-mail.` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Validação ativa de existência do domínio e servidores MX via DNS over HTTPS da Cloudflare
    const hasMx = await hasValidMxRecord(domain);
    if (!hasMx) {
      return new Response(JSON.stringify({ 
        error: 'O domínio do e-mail informado não existe ou não está configurado para receber mensagens.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const email = rawEmail;

    const country = request.headers.get('cf-ipcountry') || 'BR';

    // 1. Verificação de Idempotência e Persistência no Cloudflare D1
    let isNewSubscriber = true;
    let shouldSendWelcomeEmail = true;

    if (env.DB) {
      const existing = await env.DB.prepare(`
        SELECT id, email, name, status, sequence_step, last_sequence_sent_at, created_at
        FROM subscribers
        WHERE email = ?
      `).bind(email).first<{
        id: number;
        email: string;
        name: string;
        status: string;
        sequence_step: number;
        last_sequence_sent_at: string | null;
        created_at: string;
      }>();

      if (existing) {
        isNewSubscriber = false;
        // Se o lead já está ativo no banco: Idempotência estrita (NÃO envia e-mail duplicado)
        if (existing.status === 'active') {
          shouldSendWelcomeEmail = false;
          // Apenas atualiza metadados se necessário
          await env.DB.prepare(`
            UPDATE subscribers SET
              name = CASE WHEN ? != '' THEN ? ELSE name END,
              source = ?
            WHERE email = ?
          `).bind(name, name, source, email).run();
        } else {
          // O lead estava unsubscribed/inativo e pediu para se reinscrever voluntariamente
          shouldSendWelcomeEmail = true;
          await env.DB.prepare(`
            UPDATE subscribers SET
              name = CASE WHEN ? != '' THEN ? ELSE name END,
              status = 'active',
              source = ?,
              unsubscribed_at = NULL
            WHERE email = ?
          `).bind(name, name, source, email).run();
        }
      } else {
        // Novo inscrito inédito
        await env.DB.prepare(`
          INSERT INTO subscribers (email, name, source, ip_country, status, last_sequence_sent_at)
          VALUES (?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
        `).bind(email, name, source, country).run();
      }
    }

    // 2. Envio do e-mail de boas-vindas APENAS para novos inscritos ou reativações
    if (shouldSendWelcomeEmail) {
      const firstName = name ? name.split(' ')[0] : 'dev';
      
      const subject = `[Acesso Confirmado] O caminho para os contratos de R$ 30k+ no exterior`;

      const textContent = `Fala, ${firstName}!\n\nParabéns pela decisão. Você acabou de garantir seu lugar em um círculo seleto de desenvolvedores que se recusam a ser tratados como commodities na engenharia de software.\n\nA partir de hoje, você terá acesso direto aos bastidores de mais de uma década de engenharia sênior e mentoria internacional:\n\n• Java & Spring Boot de Alto Nível: Decisões arquiteturais limpas, resiliência e performance real para sistemas corporativos de missão crítica.\n• Contratos Globais (R$ 30k+ a R$ 60k+/mês): Estratégias reais de posicionamento internacional e "Real English" para negociar com clientes nos EUA e Europa.\n• Modelos Mentais & Filosofia Clássica: Como a lógica dos estoicos e clássicos transforma engenheiros comuns em líderes técnicos insubstituíveis na era da IA.\n\n💡 "Nem só de código vive o DEV. Construímos o futuro sobre os ombros de gigantes."\n\n📌 UM PEDIDO RÁPIDO (E MUITO IMPORTANTE):\nPara garantir que os ensaios técnicos cheguem sempre à sua caixa de entrada principal e não se percam nos filtros automáticos:\n\n👉 Responda a este e-mail com a palavra "RECEBIDO" (e, se quiser, me diga: qual é o seu maior desafio na carreira hoje? Eu leio e respondo pessoalmente).\n\nNo próximo e-mail, vou te mostrar por que o mercado internacional procura engenheiros com visão arquitetural e não apenas digitadores de código.\n\nForte abraço,\n\nRobson Cassiano\nSenior Software Engineer & Mentor Global\nhttps://eu.robsoncassiano.software`;

      const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #08080a; color: #f4f4f6; padding: 32px 28px; border-radius: 16px; border: 1px solid #252530; line-height: 1.6;">
        
        <!-- Header Badge -->
        <div style="margin-bottom: 24px;">
          <span style="background-color: rgba(223, 177, 91, 0.15); color: #dfb15b; border: 1px solid rgba(223, 177, 91, 0.3); padding: 5px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
            Acesso VIP Confirmado
          </span>
        </div>

        <!-- Greeting & Hook -->
        <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; line-height: 1.2; margin: 0 0 16px 0;">
          Fala, ${firstName}!
        </h1>
        
        <p style="font-size: 16px; color: #cbd5e1; margin-bottom: 20px;">
          Parabéns pela decisão. Você acabou de garantir seu lugar em um círculo seleto de desenvolvedores que se recusam a ser tratados como <em>commodities</em> na engenharia de software.
        </p>

        <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px;">
          A partir de hoje, você terá acesso direto aos bastidores de mais de uma década de engenharia sênior e mentoria internacional:
        </p>

        <!-- Fascinations Bullets -->
        <ul style="color: #e2e8f0; font-size: 15px; line-height: 1.7; padding-left: 20px; margin-bottom: 24px;">
          <li style="margin-bottom: 12px;">
            <strong style="color: #dfb15b;">☕ Java & Spring Boot de Alto Nível:</strong> Decisões arquiteturais limpas, resiliência e performance real para sistemas corporativos de missão crítica.
          </li>
          <li style="margin-bottom: 12px;">
            <strong style="color: #dfb15b;">🌍 Contratos Globais (R$ 30k+ a R$ 60k+/mês):</strong> Estratégias reais de posicionamento internacional e <em>"Real English"</em> para negociar com clientes nos EUA e Europa.
          </li>
          <li style="margin-bottom: 12px;">
            <strong style="color: #dfb15b;">🏛️ Modelos Mentais & Filosofia Clássica:</strong> Como a lógica dos estoicos e clássicos transforma engenheiros comuns em líderes técnicos insubstituíveis na era da IA.
          </li>
        </ul>

        <!-- Quote Box -->
        <div style="background-color: #141418; padding: 16px 20px; border-radius: 10px; border-left: 4px solid #dfb15b; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; font-style: italic;">
            💡 "Nem só de código vive o DEV. Construímos o futuro sobre os ombros de gigantes."
          </p>
        </div>

        <!-- Ebook CTA Box -->
        <div style="background: linear-gradient(135deg, rgba(223, 177, 91, 0.12), rgba(14, 14, 18, 0.9)); padding: 22px; border-radius: 12px; border: 1px solid rgba(223, 177, 91, 0.35); margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #dfb15b; text-transform: uppercase; letter-spacing: 0.05em;">
            🎁 Seu E-book Gratuito
          </p>
          <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #ffffff; line-height: 1.3;">
            7 Passos Simples para Conquistar sua Vaga DEV na Gringa
          </h3>
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #cbd5e1;">
            Se o seu download não abriu automaticamente, acesse o material pelo botão abaixo:
          </p>
          <a href="https://robsoncassiano.software/7-passos-simples-dev-na-gringa" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #dfb15b, #c99839); color: #08080a; font-weight: 800; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            📖 Baixar E-book Agora &rarr;
          </a>
        </div>

        <!-- Micro-commitment / Deliverability Hack Box -->
        <div style="background-color: rgba(223, 177, 91, 0.06); padding: 20px; border-radius: 12px; border: 1px solid rgba(223, 177, 91, 0.25); margin-bottom: 24px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #dfb15b; text-transform: uppercase; letter-spacing: 0.05em;">
            📌 Um pedido rápido (e muito importante):
          </p>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
            Para garantir que as análises técnicas cheguem sempre à sua caixa de entrada principal e não se percam nos filtros automáticos:
          </p>
          <p style="margin: 0; font-size: 14px; color: #ffffff; line-height: 1.6;">
            👉 <strong>Responda a este e-mail com a palavra <span style="color: #dfb15b;">"RECEBIDO"</span></strong> <em>(e, se quiser, me diga: qual é o seu maior desafio na carreira hoje? Eu leio e respondo pessoalmente).</em>
          </p>
        </div>

        <!-- Open Loop / Anticipation -->
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px;">
          No próximo e-mail, vou te mostrar por que o mercado internacional procura <strong>engenheiros com visão arquitetural</strong> e não apenas digitadores de código.
        </p>

        <!-- Signature -->
        <div style="border-top: 1px solid #252530; padding-top: 20px; font-size: 14px; color: #64748b;">
          <p style="margin: 0 0 4px 0; color: #cbd5e1; font-weight: 700;">Robson Cassiano</p>
          <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 13px;">Senior Software Engineer & Mentor Global</p>
          <a href="https://eu.robsoncassiano.software" style="color: #dfb15b; text-decoration: none; font-weight: 600; font-size: 13px;">
            eu.robsoncassiano.software &rarr;
          </a>
        </div>

      </div>
    `;

      await sendEmail({
        to: email,
        subject: subject,
        html: htmlContent,
        text: textContent
      }, env);
    }

    return new Response(JSON.stringify({
      success: true,
      message: shouldSendWelcomeEmail 
        ? 'Inscrição confirmada! Verifique sua caixa de entrada.' 
        : 'Inscrição atualizada! Seu acesso já está liberado.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error: any) {
    console.error('Erro na rota /api/subscribe:', error);
    return new Response(JSON.stringify({ error: 'Erro interno ao processar inscrição.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
