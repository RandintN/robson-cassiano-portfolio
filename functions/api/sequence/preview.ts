/**
 * Rota de Preview de Sequência (Proxy com Service Binding para o Worker Dedicado)
 * Encaminha o teste prioritariamente em memória via CRON_PUBLISHER
 */

interface PagesEnv {
  CRON_PUBLISHER?: { fetch: typeof fetch };
}

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  const { request, env } = context;

  // 1. Chamada in-memory via Service Binding nativo
  if (env.CRON_PUBLISHER) {
    try {
      return await env.CRON_PUBLISHER.fetch('http://internal/api/sequence/preview', request);
    } catch (err: any) {
      console.error('[CRON_PUBLISHER Preview Binding Error]:', err);
    }
  }

  // 2. Fallback HTTPS na borda Cloudflare
  const targetUrl = 'https://robson-cassiano-cron-publisher.robson-cassiano.workers.dev/api/sequence/preview';
  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.set('X-Forwarded-Host', request.headers.get('Host') || 'eu.robsoncassiano.software');

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: forwardHeaders,
      body: request.body,
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Falha de comunicação com o worker dedicado de preview.' }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
