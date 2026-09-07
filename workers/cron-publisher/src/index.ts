import { Env, PublishMode } from './types';
import { processAutomatedPublishing } from './publisher';
import { processSequenceDispatch, previewSequenceStep } from './sequence';
import { processBroadcast } from './broadcast';
import { handleUnsubscribe } from './unsubscribe';
import { isTimingSafeEqual, getSecurityCorsHeaders } from './security';

export * from './types';
export * from './publisher';
export * from './sequence';
export * from './broadcast';
export * from './unsubscribe';
export * from './security';

async function isAuthorized(request: Request, env: Env): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  const secret = env.ADMIN_SECRET || env.CRON_SECRET;
  if (!secret || !authHeader) return false;
  return isTimingSafeEqual(authHeader, `Bearer ${secret}`);
}

export default {
  // Disparos agendados na Cloudflare (Crons nativos)
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // 1. Diariamente às 15:00 UTC (12:00 BRT): Disparo in-process da Sequência de 7 Dias
    // Execução direta no banco D1 sem necessidade de requisição HTTP externa
    if (event.cron === '0 15 * * *') {
      ctx.waitUntil(
        processSequenceDispatch(env)
          .then(res => console.log('[Cron Sequence Dispatch Result]:', JSON.stringify(res)))
          .catch(err => console.error('[Cron Sequence Dispatch Error]:', err))
      );
      return;
    }

    // 2. Publicação automatizada de artigos
    let mode: PublishMode | null = null;
    if (event.cron === '0 15 * * 1') {
      mode = 'LATEST_LIVE';
    } else if (event.cron === '0 15 * * 5') {
      mode = 'RANDOM_ARCHIVE';
    }

    if (mode) {
      ctx.waitUntil(
        processAutomatedPublishing(env, mode)
          .then(res => console.log(`[Cron Auto-Publish ${mode} Result]:`, JSON.stringify(res)))
          .catch(err => console.error(`[Cron Auto-Publish ${mode} Error]:`, err))
      );
      return;
    }

    console.warn('[Cron Warning]: Gatilho cron não reconhecido:', event.cron);
  },

  // Handlers HTTP para rotas públicas e operacionais
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = getSecurityCorsHeaders(request);

    // Resposta para preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // 1. Rota Soberana de Descadastro (Pública: GET e POST)
    if (path === '/api/unsubscribe' || path === '/unsubscribe') {
      return handleUnsubscribe(request, env);
    }

    // 2. Healthcheck operacional
    if (path === '/' || path === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'robson-cassiano-cron-publisher',
        time: new Date().toISOString(),
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // 3. Rotas Protegidas (Exigem autenticação Bearer Token)
    const authorized = await isAuthorized(request, env);
    if (!authorized) {
      return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Disparo manual da sequência cadenciada
    if (path === '/api/sequence/dispatch' && request.method === 'POST') {
      try {
        const result = await processSequenceDispatch(env);
        return new Response(JSON.stringify(result, null, 2), {
          status: result.success ? 200 : (result.skipped ? 409 : 500),
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (err: any) {
        console.error('[Sequence Dispatch Error]:', err);
        return new Response(JSON.stringify({ error: 'Erro interno no processamento do disparo.' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Preview manual de passos da sequência (Teste individual)
    if (path === '/api/sequence/preview' && request.method === 'POST') {
      try {
        const body = await request.json<any>();
        const result = await previewSequenceStep(env, body);
        return new Response(JSON.stringify(result, null, 2), {
          status: result.success ? 200 : 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (err: any) {
        console.error('[Sequence Preview Error]:', err);
        return new Response(JSON.stringify({ error: 'Erro no disparo de teste de pré-visualização.' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Disparo manual de broadcast de artigos
    if (path === '/api/broadcast' && request.method === 'POST') {
      try {
        const body = await request.json<any>();
        const result = await processBroadcast(env, body);
        return new Response(JSON.stringify(result, null, 2), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (err: any) {
        console.error('[Broadcast Error]:', err);
        return new Response(JSON.stringify({ error: 'Erro no processamento do broadcast de e-mails.' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Geração sob demanda via prompt customizado (segurança de cabeçalho x-goog-api-key)
    if (path === '/generate-custom' && request.method === 'POST') {
      try {
        const body = await request.json<{ prompt: string }>();
        const endpoint = 'gemini-3.6-flash';
        const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${endpoint}:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': env.GEMINI_API_KEY || '',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: body.prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 8192
            }
          }),
          signal: AbortSignal.timeout(35000),
        });

        if (!aiRes.ok) {
          const errText = await aiRes.text();
          console.error('[Gemini Custom Generation Error]:', errText);
          return new Response(JSON.stringify({ error: 'Falha no provedor de IA.' }), {
            status: aiRes.status,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        const aiData = await aiRes.json<{ candidates?: Array<{ content: { parts: Array<{ text: string }> } }> }>();
        const markdown = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return new Response(JSON.stringify({ success: true, markdown }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (err: any) {
        console.error('[Generate Custom Exception]:', err);
        return new Response(JSON.stringify({ error: 'Erro interno ao processar geração customizada.' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Disparo manual da publicação de artigos (?mode=latest-live ou ?mode=random-archive)
    if (path === '/publish' || path === '/api/publish') {
      const modeParam = url.searchParams.get('mode');
      let mode: PublishMode = 'AUTO';
      if (modeParam === 'latest-live') mode = 'LATEST_LIVE';
      if (modeParam === 'random-archive') mode = 'RANDOM_ARCHIVE';

      try {
        const result = await processAutomatedPublishing(env, mode);
        return new Response(JSON.stringify(result, null, 2), {
          status: result.success ? 200 : 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (err: any) {
        console.error('[Automated Publishing Error]:', err);
        return new Response(JSON.stringify({ error: 'Erro na esteira de publicação automatizada.' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Rota não encontrada.' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  },
};
