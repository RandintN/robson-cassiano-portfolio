import { EmailEnv, sendEmail } from '../_email';
import { SEQUENCE_TEMPLATES } from '../_sequence_templates';

export const onRequestPost: PagesFunction<EmailEnv> = async (context) => {
  const { request, env } = context;

  // Autenticação simples por Bearer Token
  const authHeader = request.headers.get('Authorization');
  const secret = env.ADMIN_SECRET || 'robson_secret_2026';

  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Banco D1 não configurado.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Busca inscritos ativos aptos para o próximo passo da sequência de 7 dias
    // Regra: status='active', sequence_status='active', sequence_step < 7
    // E intervalo mínimo de 20 horas (72000s) desde o último envio de sequência ou cadastro inicial
    const { results } = await env.DB.prepare(`
      SELECT id, email, name, sequence_step, last_sequence_sent_at, created_at
      FROM subscribers
      WHERE status = 'active'
        AND sequence_status = 'active'
        AND sequence_step < 7
        AND (
          last_sequence_sent_at IS NULL
          OR (strftime('%s', 'now') - strftime('%s', last_sequence_sent_at)) >= 72000
        )
    `).all<{
      id: number;
      email: string;
      name: string;
      sequence_step: number;
      last_sequence_sent_at: string | null;
      created_at: string;
    }>();

    const candidates = results || [];
    let sentCount = 0;
    const details: Array<{ email: string; step: number; status: string }> = [];

    for (const subscriber of candidates) {
      const nextStep = (subscriber.sequence_step || 0) + 1;
      const template = SEQUENCE_TEMPLATES[nextStep];

      if (!template) {
        continue;
      }

      const firstName = subscriber.name ? subscriber.name.split(' ')[0] : 'dev';
      const unsubLink = `https://eu.robsoncassiano.software/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
      const html = template.renderHtml(firstName, unsubLink);
      const text = template.renderText(firstName, unsubLink);

      try {
        const ok = await sendEmail({
          to: subscriber.email,
          subject: template.subject,
          html,
          text,
        }, env);

        if (ok) {
          // 1. Registra no log da sequência
          await env.DB.prepare(`
            INSERT INTO sequence_logs (subscriber_id, email, step, video_id, subject, status)
            VALUES (?, ?, ?, ?, ?, 'sent')
          `).bind(
            subscriber.id,
            subscriber.email,
            nextStep,
            template.videoId,
            template.subject
          ).run();

          // 2. Atualiza o inscrito
          const newStatus = nextStep >= 7 ? 'completed' : 'active';
          await env.DB.prepare(`
            UPDATE subscribers
            SET sequence_step = ?,
                last_sequence_sent_at = CURRENT_TIMESTAMP,
                sequence_status = ?
            WHERE id = ?
          `).bind(nextStep, newStatus, subscriber.id).run();

          sentCount++;
          details.push({ email: subscriber.email, step: nextStep, status: 'sent' });
        } else {
          details.push({ email: subscriber.email, step: nextStep, status: 'failed_dispatch' });
        }
      } catch (err: any) {
        console.error(`Erro ao disparar dia ${nextStep} para ${subscriber.email}:`, err);
        details.push({ email: subscriber.email, step: nextStep, status: `error: ${err.message}` });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        eligibleCount: candidates.length,
        sentCount,
        details,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Erro na rota /api/sequence/dispatch:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
