interface Env {
  DB?: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  if (!email) {
    return new Response('E-mail não fornecido.', { status: 400 });
  }

  if (env.DB) {
    await env.DB.prepare(
      "UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = CURRENT_TIMESTAMP WHERE email = ?"
    ).bind(email.toLowerCase().trim()).run();
  }

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>Descadastro Confirmado | Robson Cassiano</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: system-ui, sans-serif; background-color: #08080a; color: #f4f4f6; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: #141418; padding: 32px; border-radius: 16px; max-width: 450px; text-align: center; border: 1px solid #252530; }
        h1 { color: #ffffff; font-size: 22px; margin-bottom: 12px; }
        p { color: #9e9ea8; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
        a { display: inline-block; background: linear-gradient(135deg, #dfb15b, #c99839); color: #08080a; font-weight: bold; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Descadastro Realizado</h1>
        <p>O e-mail <strong>${email}</strong> foi removido da lista de e-mails com sucesso. Você não receberá novos comunicados.</p>
        <a href="https://eu.robsoncassiano.software">Voltar ao Portfólio</a>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
};
