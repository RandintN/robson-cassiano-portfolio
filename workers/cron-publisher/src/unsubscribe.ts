import { Env } from './types';
import { escapeHtml, validateEmail, verifyUnsubscribeToken } from './security';

export async function handleUnsubscribe(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  let email = url.searchParams.get('email');
  let token = url.searchParams.get('token');

  // Suporte a RFC 8058 One-Click Unsubscribe (POST)
  if (request.method === 'POST') {
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = await request.json<{ email?: string; token?: string }>();
        if (body.email) email = body.email;
        if (body.token) token = body.token;
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        const formEmail = formData.get('email');
        const formToken = formData.get('token');
        if (typeof formEmail === 'string') email = formEmail;
        if (typeof formToken === 'string') token = formToken;
      }
    } catch {
      // Continua com query params se body for vazio
    }
  }

  if (!email) {
    return new Response(JSON.stringify({
      error: 'Informe o endereço de e-mail no parâmetro da URL (?email=seu-email@dominio.com) ou no corpo da requisição para concluir o cancelamento da inscrição.',
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (!validateEmail(normalizedEmail)) {
    return new Response(JSON.stringify({ error: 'Formato de e-mail inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validação opcional de token HMAC para proteção contra IDOR
  // Se o token for fornecido, deve ser válido; se omitido, permite cancelamento de links legados
  const secret = env.ADMIN_SECRET || env.CRON_SECRET || '';
  if (token && secret) {
    const isValidToken = await verifyUnsubscribeToken(normalizedEmail, token, secret);
    if (!isValidToken) {
      return new Response(JSON.stringify({ error: 'Token de descadastro inválido ou expirado.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (env.DB) {
    await env.DB.prepare(
      "UPDATE subscribers SET status = 'unsubscribed', sequence_status = 'unsubscribed', unsubscribed_at = CURRENT_TIMESTAMP WHERE LOWER(email) = LOWER(?)"
    ).bind(normalizedEmail).run();
  }

  const safeEmail = escapeHtml(normalizedEmail);
  const acceptHeader = request.headers.get('Accept') || '';

  if (acceptHeader.includes('application/json') || request.method === 'POST') {
    return new Response(JSON.stringify({
      success: true,
      message: `O endereço ${safeEmail} foi removido com sucesso de todas as transmissões e sequências ativas. Sua privacidade foi preservada.`,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Descadastro Confirmado | Robson Cassiano</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #08080a;
      color: #f4f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background-color: #141418;
      border: 1px solid #252530;
      border-radius: 16px;
      padding: 40px 32px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .badge {
      display: inline-block;
      background-color: rgba(223, 177, 91, 0.12);
      color: #dfb15b;
      border: 1px solid rgba(223, 177, 91, 0.25);
      padding: 4px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 16px;
    }
    p {
      color: #94a3b8;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    p strong {
      color: #e2e8f0;
    }
    .btn-return {
      display: inline-block;
      background: linear-gradient(135deg, #dfb15b, #c99839);
      color: #08080a;
      font-weight: 800;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      font-size: 14px;
      transition: transform 0.15s ease, opacity 0.15s ease;
    }
    .btn-return:hover {
      opacity: 0.95;
      transform: translateY(-1px);
    }
  </style>
</head>
<body>
  <main class="card">
    <div class="badge">Privacidade e Descadastro Confirmados</div>
    <h1>Inscrição Encerrada com Sucesso</h1>
    <p>
      O endereço <strong>${safeEmail}</strong> foi retirado da lista ativa de e-mails. Respeitamos integralmente o seu tempo e a sua caixa de entrada. Os ensaios e análises de arquitetura continuam abertos ao público no portal.
    </p>
    <a href="https://eu.robsoncassiano.software/artigos" class="btn-return" rel="noreferrer">
      Acessar Ensaios Técnicos Públicos
    </a>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'none';",
    },
  });
}
