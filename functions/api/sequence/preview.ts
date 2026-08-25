import { EmailEnv, sendEmail } from '../_email';
import { SEQUENCE_TEMPLATES } from '../_sequence_templates';

export const onRequestPost: PagesFunction<EmailEnv> = async (context) => {
  const { request, env } = context;

  const authHeader = request.headers.get('Authorization');
  const secret = env.ADMIN_SECRET || 'robson_secret_2026';

  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await request.json()) as {
      email: string;
      step: number; // 1 a 7
      name?: string;
    };

    if (!body.email || !body.step) {
      return new Response(
        JSON.stringify({ error: 'Campos email e step (1 a 7) são obrigatórios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const template = SEQUENCE_TEMPLATES[body.step];
    if (!template) {
      return new Response(
        JSON.stringify({ error: `Passo da sequência inválido: ${body.step}. Use de 1 a 7.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const firstName = body.name ? body.name.split(' ')[0] : 'dev';
    const unsubLink = `https://eu.robsoncassiano.software/api/unsubscribe?email=${encodeURIComponent(body.email)}`;

    const html = template.renderHtml(firstName, unsubLink);
    const text = template.renderText(firstName, unsubLink);

    const ok = await sendEmail({
      to: body.email,
      subject: `[PREVIEW TESTE] ${template.subject}`,
      html,
      text,
    }, env);

    return new Response(
      JSON.stringify({
        success: ok,
        step: body.step,
        targetEmail: body.email,
        subject: template.subject,
        videoId: template.videoId,
        message: ok ? `E-mail do Dia ${body.step} enviado com sucesso!` : 'Falha no disparo.',
      }),
      { status: ok ? 200 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
