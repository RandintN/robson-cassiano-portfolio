import { createMimeMessage } from 'mimetext';

interface Env {
  DB?: D1Database;
  EMAIL?: {
    send: (message: { from: string; to: string; raw: string }) => Promise<void>;
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
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

    // 2. Envio nativo do e-mail de boas-vindas via Cloudflare Worker
    if (env.EMAIL) {
      try {
        const msg = createMimeMessage();
        msg.setSender({ name: 'Robson Cassiano', addr: 'contato@robsoncassiano.software' });
        msg.setRecipient(email);
        msg.setSubject('Bem-vindo à minha rede | Robson Cassiano');
        
        const firstName = name ? name.split(' ')[0] : 'dev';
        const htmlContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 30px; border-radius: 12px; border: 1px solid #1e293b;">
            <div style="margin-bottom: 20px;">
              <span style="background-color: #a3e635; color: #022c22; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 11px; text-transform: uppercase;">Robson Cassiano</span>
            </div>
            <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 16px;">Fala, ${firstName}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
              Obrigado por se inscrever na minha newsletter. A partir de agora, você receberá análises exclusivas e direto ao ponto sobre:
            </p>
            <ul style="color: #cbd5e1; font-size: 15px; line-height: 1.8; margin-bottom: 24px;">
              <li><strong>Java Backend Corporativo:</strong> Arquitetura limpa, Spring Boot e performance real.</li>
              <li><strong>Carreira Internacional (30k+):</strong> Estratégias de posicionamento e "Real English" para contratos no exterior.</li>
              <li><strong>Filosofia & Empreendedorismo:</strong> Modelos mentais para decisões de alto impacto na engenharia.</li>
            </ul>
            <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: #94a3b8;">
                💡 <em>"Nem só de código vive o DEV. Construindo o futuro sobre os ombros de gigantes."</em>
              </p>
            </div>
            <p style="font-size: 14px; color: #64748b; border-top: 1px solid #1e293b; pt-4; margin-top: 30px;">
              Robson Cassiano | Senior Software Engineer & Mentor Global<br />
              <a href="https://eu.robsoncassiano.software" style="color: #a3e635; text-decoration: none;">eu.robsoncassiano.software</a>
            </p>
          </div>
        `;

        msg.addMessage({
          contentType: 'text/html',
          data: htmlContent
        });

        await env.EMAIL.send({
          from: 'contato@robsoncassiano.software',
          to: email,
          raw: msg.asRaw()
        });
      } catch (emailErr) {
        console.error('Erro no envio do e-mail de boas-vindas:', emailErr);
      }
    }

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
