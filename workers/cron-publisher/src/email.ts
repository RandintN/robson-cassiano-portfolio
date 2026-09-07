import { Env, SendMailPayload } from './types';

export async function sendEmail(payload: SendMailPayload, env: Env): Promise<boolean> {
  const fromName = payload.fromName || 'Robson Cassiano';
  const fromAddress = payload.fromAddress || 'contato@robsoncassiano.software';

  // 1. Envio soberano via Service Binding nativo da Cloudflare (EMAIL_ROUTER)
  if (env.EMAIL_ROUTER?.fetch) {
    try {
      const response = await env.EMAIL_ROUTER.fetch('http://internal/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(payload.headers || {}),
        },
        body: JSON.stringify({
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          fromName,
          fromAddress,
          headers: payload.headers,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (response.ok) {
        return true;
      }
      const err = await response.text();
      console.error('[Cloudflare Email Router Service Error]:', err);
    } catch (e: any) {
      console.error('[Cloudflare Email Router Service Fetch Error]:', e?.message || e);
    }
  }

  // 2. Envio direto se o binding nativo EMAIL (Send Email) estiver acessível no contexto
  if (env.EMAIL?.send) {
    try {
      await env.EMAIL.send({
        from: { name: fromName, email: fromAddress },
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        headers: payload.headers,
      });
      return true;
    } catch (e: any) {
      console.error('[Cloudflare Send Email Direct Error]:', e?.code, e?.message || e);
    }
  }

  // 3. Fallback para o Worker Cloudflare na borda
  try {
    const directRes = await fetch('https://robson-cassiano-email-router.robson-cassiano.workers.dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(payload.headers || {}),
      },
      body: JSON.stringify({
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        fromName,
        fromAddress,
        headers: payload.headers,
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (directRes.ok) {
      return true;
    }
  } catch (e: any) {
    console.error('[Cloudflare Email Router Fallback Error]:', e?.message || e);
  }

  console.warn('[Cloudflare Email Warning]: Não foi possível despachar o e-mail para destinatário.');
  return false;
}
