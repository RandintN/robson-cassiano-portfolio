import { createMimeMessage } from 'mimetext';

interface Env {
  DB?: D1Database;
  EMAIL?: {
    send: (message: { from: string; to: string; raw: string }) => Promise<void>;
  };
  ADMIN_SECRET?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Autenticação simples por Bearer Token
  const authHeader = request.headers.get('Authorization');
  const secret = env.ADMIN_SECRET || 'robson_secret_2026';
  
  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json() as {
      subject: string;
      articleSlug: string;
      title: string;
      previewText: string;
      articleUrl: string;
    };

    if (!body.subject || !body.articleUrl) {
      return new Response(JSON.stringify({ error: 'Campos subject e articleUrl são obrigatórios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Banco D1 não configurado.' }), { status: 500 });
    }

    // Busca todos os inscritos ativos
    const { results } = await env.DB.prepare(
      "SELECT email, name FROM subscribers WHERE status = 'active'"
    ).all<{ email: string; name: string }>();

    let sentCount = 0;

    if (results && results.length > 0 && env.EMAIL) {
      for (const subscriber of results) {
        try {
          const unsubLink = `https://eu.robsoncassiano.software/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
          const firstName = subscriber.name ? subscriber.name.split(' ')[0] : 'dev';

          const msg = createMimeMessage();
          msg.setSender({ name: 'Robson Cassiano', addr: 'contato@robsoncassiano.software' });
          msg.setRecipient(subscriber.email);
          msg.setSubject(body.subject);

          const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 30px; border-radius: 12px; border: 1px solid #1e293b;">
              <div style="margin-bottom: 20px;">
                <span style="background-color: #a3e635; color: #022c22; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 11px; text-transform: uppercase;">Novo Artigo Publicado</span>
              </div>
              <h1 style="color: #ffffff; font-size: 22px; line-height: 1.3; margin-bottom: 16px;">${body.title}</h1>
              <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px;">
                Olá, ${firstName}! Acabei de publicar uma nova análise técnica no meu portal.
              </p>
              <div style="background-color: #1e293b; padding: 18px; border-radius: 8px; border-left: 4px solid #a3e635; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                  ${body.previewText}
                </p>
              </div>
              <div style="margin-bottom: 30px;">
                <a href="${body.articleUrl}" style="display: inline-block; background-color: #a3e635; color: #022c22; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 15px;">
                  Ler Artigo Completo no Portal &rarr;
                </a>
              </div>
              <p style="font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 30px;">
                Você recebeu este e-mail porque se inscreveu em <a href="https://eu.robsoncassiano.software" style="color: #94a3b8;">eu.robsoncassiano.software</a>.<br />
                Para deixar de receber novos artigos, <a href="${unsubLink}" style="color: #ef4444;">cancele sua inscrição aqui</a>.
              </p>
            </div>
          `;

          msg.addMessage({ contentType: 'text/html', data: html });

          await env.EMAIL.send({
            from: 'contato@robsoncassiano.software',
            to: subscriber.email,
            raw: msg.asRaw()
          });

          sentCount++;
        } catch (e) {
          console.error(`Falha no envio para ${subscriber.email}:`, e);
        }
      }
    }

    // Registra envio
    await env.DB.prepare(
      "INSERT INTO newsletters_sent (article_slug, subject, sent_count) VALUES (?, ?, ?)"
    ).bind(body.articleSlug || 'custom', body.subject, sentCount).run();

    return new Response(JSON.stringify({
      success: true,
      message: `Newsletter enviada com sucesso para ${sentCount} inscritos.`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Erro no broadcast:', err);
    return new Response(JSON.stringify({ error: err.message || 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
