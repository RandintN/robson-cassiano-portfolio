import { EmailEnv, sendEmail } from '../_email';
import { SEQUENCE_TEMPLATES } from '../_sequence_templates';

export const onRequestPost: PagesFunction<EmailEnv> = async (context) => {
  const { request, env } = context;

  // Autenticação estrita por Bearer Token (Sem fallback inseguro)
  const authHeader = request.headers.get('Authorization');
  const secret = env.ADMIN_SECRET;

  if (!secret || !authHeader || authHeader !== `Bearer ${secret}`) {
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
    // 0. Trava de concorrência em nível de execução
    // Remove locks expirados (mais de 10 minutos) antes da checagem
    await env.DB.prepare(`
      DELETE FROM sequence_dispatch_locks
      WHERE lock_key = 'active_dispatch'
        AND (strftime('%s', 'now') - strftime('%s', locked_at)) > 600
    `).run();

    try {
      await env.DB.prepare(`
        INSERT INTO sequence_dispatch_locks (lock_key, locked_at)
        VALUES ('active_dispatch', CURRENT_TIMESTAMP)
      `).run();
    } catch (lockErr) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Execução de envio já em andamento por outro processo.',
        skipped: true,
      }), {
        status: 409,
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

        const currentStep = subscriber.sequence_step || 0;
        const newStatus = nextStep >= 7 ? 'completed' : 'active';

        // 1. Reserva atômica prévia (Optimistic Lock)
        // Atualiza o inscrito antes da chamada externa pela rede.
        // Se outro processo concorrente já tiver avançado este lead, changes será 0.
        const reserveResult = await env.DB.prepare(`
          UPDATE subscribers
          SET sequence_step = ?,
              last_sequence_sent_at = CURRENT_TIMESTAMP,
              sequence_status = ?
          WHERE id = ?
            AND sequence_step = ?
            AND status = 'active'
            AND (
              last_sequence_sent_at IS NULL
              OR (strftime('%s', 'now') - strftime('%s', last_sequence_sent_at)) >= 72000
            )
        `).bind(nextStep, newStatus, subscriber.id, currentStep).run();

        if (!reserveResult.meta.changes || reserveResult.meta.changes === 0) {
          details.push({ email: subscriber.email, step: nextStep, status: 'skipped_concurrency' });
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
            // Registra no log da sequência (protegido por índice único)
            await env.DB.prepare(`
              INSERT OR IGNORE INTO sequence_logs (subscriber_id, email, step, video_id, subject, status)
              VALUES (?, ?, ?, ?, ?, 'sent')
            `).bind(
              subscriber.id,
              subscriber.email,
              nextStep,
              template.videoId,
              template.subject
            ).run();

            sentCount++;
            details.push({ email: subscriber.email, step: nextStep, status: 'sent' });
          } else {
            // Reverte a reserva em caso de falha no envio
            await env.DB.prepare(`
              UPDATE subscribers
              SET sequence_step = ?,
                  last_sequence_sent_at = ?,
                  sequence_status = 'active'
              WHERE id = ?
            `).bind(currentStep, subscriber.last_sequence_sent_at, subscriber.id).run();

            details.push({ email: subscriber.email, step: nextStep, status: 'failed_dispatch' });
          }
        } catch (err: any) {
          console.error(`Erro ao disparar dia ${nextStep} para ${subscriber.email}:`, err);
          // Reverte a reserva em caso de exceção de rede
          await env.DB.prepare(`
            UPDATE subscribers
            SET sequence_step = ?,
                last_sequence_sent_at = ?,
                sequence_status = 'active'
            WHERE id = ?
          `).bind(currentStep, subscriber.last_sequence_sent_at, subscriber.id).run();

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
    } finally {
      // Liberação garantida da trava de concorrência
      try {
        await env.DB.prepare(`
          DELETE FROM sequence_dispatch_locks
          WHERE lock_key = 'active_dispatch'
        `).run();
      } catch (releaseErr) {
        console.error('Falha ao liberar lock de disparo:', releaseErr);
      }
    }
  } catch (error: any) {
    console.error('Erro na rota /api/sequence/dispatch:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
