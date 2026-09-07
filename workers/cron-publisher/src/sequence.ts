import { Env, Subscriber } from './types';
import { sendEmail } from './email';
import { SEQUENCE_TEMPLATES } from './sequence_templates';
import { generateUnsubscribeToken } from './security';

export async function processSequenceDispatch(env: Env): Promise<{
  success: boolean;
  message?: string;
  eligibleCount?: number;
  sentCount?: number;
  details?: Array<{ email: string; step: number; status: string }>;
  skipped?: boolean;
}> {
  if (!env.DB) {
    throw new Error('Banco D1 não configurado no ambiente do Worker.');
  }

  const secret = env.ADMIN_SECRET || env.CRON_SECRET || 'secret-token-key';

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
  } catch {
    return {
      success: false,
      message: 'Execução de envio já em andamento por outro processo.',
      skipped: true,
    };
  }

  try {
    // Busca inscritos ativos aptos para o próximo passo da sequência de 7 dias
    // Regra: status='active', sequence_status='active', sequence_step < 7
    // Intervalo mínimo de 20 horas (72000s) respeitado desde o último envio ou criação da conta (COALESCE)
    // Limite defensivo de 50 inscritos por ciclo para respeitar limites de sub-requests da Cloudflare
    const { results } = await env.DB.prepare(`
      SELECT id, email, name, sequence_step, last_sequence_sent_at, created_at
      FROM subscribers
      WHERE status = 'active'
        AND sequence_status = 'active'
        AND sequence_step < 7
        AND (strftime('%s', 'now') - strftime('%s', COALESCE(last_sequence_sent_at, created_at))) >= 72000
      ORDER BY id ASC
      LIMIT 50
    `).all<Subscriber>();

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
      // Valida concorrência e integridade de status antes da chamada externa pela rede
      const reserveResult = await env.DB.prepare(`
        UPDATE subscribers
        SET sequence_step = ?,
            last_sequence_sent_at = CURRENT_TIMESTAMP,
            sequence_status = ?
        WHERE id = ?
          AND sequence_step = ?
          AND status = 'active'
          AND sequence_status = 'active'
          AND (strftime('%s', 'now') - strftime('%s', COALESCE(last_sequence_sent_at, created_at))) >= 72000
      `).bind(nextStep, newStatus, subscriber.id, currentStep).run();

      if (!reserveResult.meta.changes || reserveResult.meta.changes === 0) {
        details.push({ email: subscriber.email, step: nextStep, status: 'skipped_concurrency' });
        continue;
      }

      const firstName = subscriber.name ? subscriber.name.split(' ')[0] : 'dev';
      const token = await generateUnsubscribeToken(subscriber.email, secret);
      const unsubLink = `https://eu.robsoncassiano.software/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${token}`;
      const html = template.renderHtml(firstName, unsubLink);
      const text = template.renderText(firstName, unsubLink);

      try {
        const ok = await sendEmail({
          to: subscriber.email,
          subject: template.subject,
          html,
          text,
          headers: {
            'List-Unsubscribe': `<${unsubLink}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
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
          // Reverte a reserva em caso de falha no envio condicionada ao estado
          await env.DB.prepare(`
            UPDATE subscribers
            SET sequence_step = ?,
                last_sequence_sent_at = ?,
                sequence_status = 'active'
            WHERE id = ?
              AND sequence_step = ?
              AND status = 'active'
          `).bind(currentStep, subscriber.last_sequence_sent_at ?? null, subscriber.id, nextStep).run();

          details.push({ email: subscriber.email, step: nextStep, status: 'failed_dispatch' });
        }
      } catch (err: any) {
        console.error(`[Sequence Dispatch Error] ${subscriber.email}:`, err);
        // Reverte a reserva em caso de exceção de rede
        await env.DB.prepare(`
          UPDATE subscribers
          SET sequence_step = ?,
              last_sequence_sent_at = ?,
              sequence_status = 'active'
          WHERE id = ?
            AND sequence_step = ?
            AND status = 'active'
        `).bind(currentStep, subscriber.last_sequence_sent_at ?? null, subscriber.id, nextStep).run();

        details.push({ email: subscriber.email, step: nextStep, status: 'network_error' });
      }
    }

    return {
      success: true,
      eligibleCount: candidates.length,
      sentCount,
      details,
    };
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
}

export async function previewSequenceStep(
  env: Env,
  body: { email: string; step: number; name?: string }
): Promise<{
  success: boolean;
  step: number;
  targetEmail: string;
  subject: string;
  videoId: string;
  message: string;
}> {
  if (!body.email || !body.step) {
    throw new Error('Campos email e step (1 a 7) são obrigatórios.');
  }

  const template = SEQUENCE_TEMPLATES[body.step];
  if (!template) {
    throw new Error(`Passo da sequência inválido: ${body.step}. Use de 1 a 7.`);
  }

  const secret = env.ADMIN_SECRET || env.CRON_SECRET || 'secret-token-key';
  const firstName = body.name ? body.name.split(' ')[0] : 'dev';
  const token = await generateUnsubscribeToken(body.email, secret);
  const unsubLink = `https://eu.robsoncassiano.software/api/unsubscribe?email=${encodeURIComponent(body.email)}&token=${token}`;

  const html = template.renderHtml(firstName, unsubLink);
  const text = template.renderText(firstName, unsubLink);

  const ok = await sendEmail({
    to: body.email,
    subject: `[PREVIEW TESTE] ${template.subject}`,
    html,
    text,
    headers: {
      'List-Unsubscribe': `<${unsubLink}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  }, env);

  return {
    success: ok,
    step: body.step,
    targetEmail: body.email,
    subject: template.subject,
    videoId: template.videoId,
    message: ok ? `E-mail do Dia ${body.step} enviado com sucesso!` : 'Falha no disparo.',
  };
}
