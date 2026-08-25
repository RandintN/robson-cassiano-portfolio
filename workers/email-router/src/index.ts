export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailMessageBuilder {
  to: string | EmailAddress | (string | EmailAddress)[];
  from: string | EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | EmailAddress;
  headers?: { [key: string]: string };
}

export interface EmailSendResult {
  messageId: string;
}

export interface Env {
  EMAIL?: {
    send: (message: EmailMessageBuilder | any) => Promise<EmailSendResult>;
  };
  ROUTER_SECRET?: string;
}

export interface SendMailRequest {
  to: string | EmailAddress | (string | EmailAddress)[];
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  fromAddress?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido. Use POST.' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = (await request.json()) as SendMailRequest;

      if (!body.to || !body.subject || (!body.html && !body.text)) {
        return new Response(
          JSON.stringify({ error: 'Campos to, subject e html/text são obrigatórios.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!env.EMAIL) {
        console.error('[Cloudflare Email Router Error]: Binding EMAIL (send_email) não configurado.');
        return new Response(
          JSON.stringify({ error: 'Binding de envio de e-mail não disponível na Cloudflare.' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const senderName = body.fromName || 'Robson Cassiano';
      const senderAddr = body.fromAddress || 'contato@robsoncassiano.software';

      // Uso da API Estruturada oficial recomendada pela Cloudflare (EmailMessageBuilder)
      const result = await env.EMAIL.send({
        from: {
          name: senderName,
          email: senderAddr,
        },
        to: body.to,
        subject: body.subject,
        html: body.html,
        text: body.text,
      });

      return new Response(
        JSON.stringify({
          success: true,
          messageId: result?.messageId,
          message: 'E-mail enviado com sucesso via Cloudflare Email Service.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error: any) {
      console.error('[Cloudflare Email Error]:', error.code, error.message);

      // Tratamento refinado de erros com base nos códigos oficiais da Cloudflare
      switch (error.code) {
        case 'E_SENDER_NOT_VERIFIED':
          return new Response(
            JSON.stringify({ success: false, code: error.code, error: 'O domínio ou remetente de envio não está verificado no Cloudflare Email Routing.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        case 'E_RECIPIENT_NOT_ALLOWED':
          return new Response(
            JSON.stringify({ success: false, code: error.code, error: 'Destinatário não autorizado pelas regras da Cloudflare.' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        case 'E_RATE_LIMIT_EXCEEDED':
        case 'E_DAILY_LIMIT_EXCEEDED':
          return new Response(
            JSON.stringify({ success: false, code: error.code, error: 'Limite de envio de e-mails da Cloudflare atingido. Tente novamente mais tarde.' }),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
          );
        default:
          return new Response(
            JSON.stringify({ success: false, code: error.code || 'E_UNKNOWN', error: error.message || 'Falha ao enviar e-mail.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
      }
    }
  },
};

