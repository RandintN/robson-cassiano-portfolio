import { EmailEnv, sendEmail } from './_email';

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};

export const onRequestPost: PagesFunction<EmailEnv> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json() as { email?: string; name?: string; source?: string };
    const email = body.email ? body.email.toLowerCase().trim() : '';
    const name = body.name ? body.name.trim() : '';
    const source = body.source ? body.source.trim() : 'portfolio';

    // Validação básica de e-mail
    if (!email || !email.includes('@') || email.length < 5) {
      return new Response(JSON.stringify({ error: 'E-mail inválido ou incompleto.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const country = request.headers.get('cf-ipcountry') || 'BR';

    // 1. Salvar no banco Cloudflare D1 (se disponível)
    if (env.DB) {
      await env.DB.prepare(`
        INSERT INTO subscribers (email, name, source, ip_country, status)
        VALUES (?, ?, ?, ?, 'active')
        ON CONFLICT(email) DO UPDATE SET
          name = CASE WHEN excluded.name != '' THEN excluded.name ELSE subscribers.name END,
          status = 'active',
          source = excluded.source
      `).bind(email, name, source, country).run();
    }

    // 2. Envio do e-mail de boas-vindas com Copy de Alta Conversão (Ray Edwards Framework)
    const firstName = name ? name.split(' ')[0] : 'dev';
    
    const subject = `[Acesso Confirmado] O caminho para os contratos de R$ 30k+ no exterior`;

    const textContent = `Fala, ${firstName}!\n\nParabéns pela decisão. Você acabou de garantir seu lugar em um círculo seleto de desenvolvedores que se recusam a ser tratados como commodities na engenharia de software.\n\nA partir de hoje, você terá acesso direto aos bastidores de mais de uma década de engenharia sênior e mentoria internacional:\n\n• Java & Spring Boot de Alto Nível: Decisões arquiteturais limpas, resiliência e performance real para sistemas corporativos de missão crítica.\n• Contratos Globais (R$ 30k+ a R$ 60k+/mês): Estratégias reais de posicionamento internacional e "Real English" para negociar com clientes nos EUA e Europa.\n• Modelos Mentais & Filosofia Clássica: Como a lógica dos estoicos e clássicos transforma engenheiros comuns em líderes técnicos insubstituíveis na era da IA.\n\n💡 "Nem só de código vive o DEV. Construímos o futuro sobre os ombros de gigantes."\n\n📌 UM PEDIDO RÁPIDO (E MUITO IMPORTANTE):\nPara garantir que os ensaios técnicos cheguem sempre à sua caixa de entrada principal e não se percam nos filtros automáticos:\n\n👉 Responda a este e-mail com a palavra "RECEBIDO" (e, se quiser, me diga: qual é o seu maior desafio na carreira hoje? Eu leio e respondo pessoalmente).\n\nNo próximo e-mail, vou te mostrar por que o mercado internacional procura engenheiros com visão arquitetural e não apenas digitadores de código.\n\nForte abraço,\n\nRobson Cassiano\nSenior Software Engineer & Mentor Global\nhttps://eu.robsoncassiano.software`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 32px 28px; border-radius: 16px; border: 1px solid #1e293b; line-height: 1.6;">
        
        <!-- Header Badge -->
        <div style="margin-bottom: 24px;">
          <span style="background-color: #a3e635; color: #022c22; padding: 5px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
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
            <strong style="color: #a3e635;">☕ Java & Spring Boot de Alto Nível:</strong> Decisões arquiteturais limpas, resiliência e performance real para sistemas corporativos de missão crítica.
          </li>
          <li style="margin-bottom: 12px;">
            <strong style="color: #a3e635;">🌍 Contratos Globais (R$ 30k+ a R$ 60k+/mês):</strong> Estratégias reais de posicionamento internacional e <em>"Real English"</em> para negociar com clientes nos EUA e Europa.
          </li>
          <li style="margin-bottom: 12px;">
            <strong style="color: #a3e635;">🏛️ Modelos Mentais & Filosofia Clássica:</strong> Como a lógica dos estoicos e clássicos transforma engenheiros comuns em líderes técnicos insubstituíveis na era da IA.
          </li>
        </ul>

        <!-- Quote Box -->
        <div style="background-color: #1e293b; padding: 16px 20px; border-radius: 10px; border-left: 4px solid #a3e635; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; font-style: italic;">
            💡 "Nem só de código vive o DEV. Construímos o futuro sobre os ombros de gigantes."
          </p>
        </div>

        <!-- Micro-commitment / Deliverability Hack Box -->
        <div style="background-color: rgba(163, 230, 53, 0.06); padding: 20px; border-radius: 12px; border: 1px solid rgba(163, 230, 53, 0.25); margin-bottom: 24px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #a3e635; text-transform: uppercase; letter-spacing: 0.05em;">
            📌 Um pedido rápido (e muito importante):
          </p>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
            Para garantir que as análises técnicas cheguem sempre à sua caixa de entrada principal e não se percam nos filtros automáticos:
          </p>
          <p style="margin: 0; font-size: 14px; color: #ffffff; line-height: 1.6;">
            👉 <strong>Responda a este e-mail com a palavra <span style="color: #a3e635;">"RECEBIDO"</span></strong> <em>(e, se quiser, me diga: qual é o seu maior desafio na carreira hoje? Eu leio e respondo pessoalmente).</em>
          </p>
        </div>

        <!-- Open Loop / Anticipation -->
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px;">
          No próximo e-mail, vou te mostrar por que o mercado internacional procura <strong>engenheiros com visão arquitetural</strong> e não apenas digitadores de código.
        </p>

        <!-- Signature -->
        <div style="border-top: 1px solid #1e293b; padding-top: 20px; font-size: 14px; color: #64748b;">
          <p style="margin: 0 0 4px 0; color: #cbd5e1; font-weight: 700;">Robson Cassiano</p>
          <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 13px;">Senior Software Engineer & Mentor Global</p>
          <a href="https://eu.robsoncassiano.software" style="color: #a3e635; text-decoration: none; font-weight: 600; font-size: 13px;">
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

    return new Response(JSON.stringify({
      success: true,
      message: 'Inscrição confirmada! Verifique sua caixa de entrada.'
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
