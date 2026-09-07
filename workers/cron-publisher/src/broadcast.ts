import { Env, BroadcastRequest } from './types';
import { sendEmail } from './email';
import { escapeHtml, generateUnsubscribeToken } from './security';

export async function processBroadcast(env: Env, body: BroadcastRequest): Promise<{
  success: boolean;
  message: string;
  sentCount: number;
}> {
  if (!env.DB) {
    throw new Error('Banco D1 não configurado no ambiente do Worker.');
  }

  if (!body.subject || !body.articleUrl) {
    throw new Error('Campos subject e articleUrl são obrigatórios.');
  }

  const safeUrl = body.articleUrl.trim();
  if (!safeUrl.startsWith('https://eu.robsoncassiano.software')) {
    throw new Error('A URL do artigo precisa pertencer obrigatoriamente ao domínio eu.robsoncassiano.software');
  }

  const safeTitle = escapeHtml(body.title ? body.title.trim() : body.subject.trim());
  const safePreviewText = escapeHtml(body.previewText ? body.previewText.trim() : '');
  const secret = env.ADMIN_SECRET || env.CRON_SECRET || 'secret-token-key';

  // Busca inscritos ativos com limite defensivo de lote para estabilidade de runtime
  const { results } = await env.DB.prepare(
    "SELECT id, email, name FROM subscribers WHERE status = 'active' ORDER BY id ASC LIMIT 200"
  ).all<{ id: number; email: string; name: string }>();

  let sentCount = 0;

  if (results && results.length > 0) {
    for (const subscriber of results) {
      try {
        const token = await generateUnsubscribeToken(subscriber.email, secret);
        const unsubLink = `https://eu.robsoncassiano.software/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${token}`;
        const firstName = subscriber.name ? escapeHtml(subscriber.name.split(' ')[0]) : 'dev';

        const html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #08080a; color: #f4f4f6; padding: 30px; border-radius: 12px; border: 1px solid #252530;">
            <div style="margin-bottom: 20px;">
              <span style="background-color: rgba(223, 177, 91, 0.15); color: #dfb15b; border: 1px solid rgba(223, 177, 91, 0.3); padding: 4px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
                Ensaio Técnico de Engenharia
              </span>
            </div>
            <h1 style="color: #ffffff; font-size: 22px; line-height: 1.3; margin-bottom: 16px;">${safeTitle}</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px;">
              Olá, ${firstName}! Preparei uma análise aprofundada sobre engenharia de software e decisões de arquitetura em escala internacional para respaldar suas escolhas técnicas em projetos de alta complexidade.
            </p>
            <div style="background-color: #141418; padding: 18px; border-radius: 8px; border-left: 4px solid #dfb15b; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                ${safePreviewText}
              </p>
            </div>
            <div style="margin-bottom: 30px;">
              <a href="${safeUrl}" style="display: inline-block; background: linear-gradient(135deg, #dfb15b, #c99839); color: #08080a; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; box-shadow: 0 4px 12px rgba(223, 177, 91, 0.25);">
                Acessar Análise Técnica Completa &rarr;
              </a>
            </div>
            <p style="font-size: 12px; color: #64748b; border-top: 1px solid #252530; padding-top: 20px; margin-top: 30px;">
              Você recebeu este e-mail como assinante da lista técnica em <a href="https://eu.robsoncassiano.software" style="color: #dfb15b;">eu.robsoncassiano.software</a>.<br />
              <a href="https://eu.robsoncassiano.software/privacidade" style="color: #94a3b8; text-decoration: none;">Política de Privacidade</a> • Para deixar de receber novos ensaios, <a href="${unsubLink}" style="color: #ef4444;">cancele sua inscrição aqui</a>.
            </p>
          </div>
        `;

        const textContent = `Olá, ${firstName}!\n\nPreparei uma nova análise técnica de arquitetura e engenharia aplicada:\n\n"${body.title}"\n\n${body.previewText}\n\nAcesse o ensaio completo e os diagramas técnicos no portal:\n${safeUrl}\n\nRobson Cassiano\nEngenheiro de Software Sênior e Mentor Internacional\neu.robsoncassiano.software\n\nPrivacidade: https://eu.robsoncassiano.software/privacidade\nPara cancelar sua inscrição: ${unsubLink}`;

        const ok = await sendEmail({
          to: subscriber.email,
          subject: body.subject,
          html: html,
          text: textContent,
          headers: {
            'List-Unsubscribe': `<${unsubLink}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }, env);

        if (ok) sentCount++;
      } catch (e) {
        console.error(`[Broadcast Dispatch Error] ${subscriber.email}:`, e);
      }
    }
  }

  // Registra envio
  await env.DB.prepare(
    "INSERT INTO newsletters_sent (article_slug, subject, sent_count) VALUES (?, ?, ?)"
  ).bind(body.articleSlug || 'custom', body.subject, sentCount).run();

  return {
    success: true,
    message: `Newsletter enviada com sucesso para ${sentCount} inscritos.`,
    sentCount,
  };
}
