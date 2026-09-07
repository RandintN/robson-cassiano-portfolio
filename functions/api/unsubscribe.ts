/**
 * Rota de Descadastro Soberana (Proxy de Borda com Service Binding para o Worker Dedicado)
 * Encaminha chamadas GET e POST prioritariamente em memória via CRON_PUBLISHER
 */

interface PagesEnv {
  CRON_PUBLISHER?: { fetch: typeof fetch };
}

export const onRequest: PagesFunction<PagesEnv> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, List-Unsubscribe-Post',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const url = new URL(request.url);
  const targetPath = `/api/unsubscribe${url.search}`;

  // 1. Chamada interna in-memory via Service Binding nativo (Zero Latência)
  if (env.CRON_PUBLISHER) {
    try {
      return await env.CRON_PUBLISHER.fetch(`http://internal${targetPath}`, request);
    } catch (err: any) {
      console.error('[CRON_PUBLISHER Service Binding Error]:', err);
    }
  }

  // 2. Fallback HTTPS na borda Cloudflare
  const fallbackUrl = new URL(`https://robson-cassiano-cron-publisher.robson-cassiano.workers.dev${targetPath}`);
  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.set('X-Forwarded-Host', request.headers.get('Host') || 'eu.robsoncassiano.software');

  try {
    const res = await fetch(fallbackUrl.toString(), {
      method: request.method,
      headers: forwardHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Falha de comunicação com o serviço de descadastro.' }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
