/**
 * Rota de Encaminhamento Soberano (Proxy de Contingência)
 * Redireciona e despacha chamadas legadas para o microsserviço capture-worker centralizado
 */

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;

  const targetUrl = 'https://capture.robsoncassiano.software/api/subscribe';
  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.set('X-Forwarded-Host', request.headers.get('Host') || 'eu.robsoncassiano.software');

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
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
    return new Response(JSON.stringify({ error: 'Falha de comunicação com o serviço central de captura.' }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
