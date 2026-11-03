/**
 * Os proxies de /api são camada de transporte: a política CORS vem do worker e não
 * pode ser sobrescrita no caminho. O caminho HTTPS de contingência fixava `*` em
 * todos eles, apagando a origem restrita e o Vary: Origin.
 */
import { afterEach, describe, it, expect, mock } from 'bun:test';
import { onRequest as unsubscribeProxy } from '../functions/api/unsubscribe';

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

function workerResponse(): Response {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://eu.robsoncassiano.software',
      Vary: 'Origin',
    },
  });
}

interface ProxyContext {
  request: Request;
  env: { CRON_PUBLISHER?: { fetch: typeof fetch } };
}

function context(workerFetch: ProxyContext['env']['CRON_PUBLISHER']): ProxyContext {
  return {
    request: new Request('https://eu.robsoncassiano.software/api/unsubscribe?email=a%40b.com', { method: 'GET' }),
    env: workerFetch ? { CRON_PUBLISHER: workerFetch } : {},
  };
}

function call(workerFetch: ProxyContext['env']['CRON_PUBLISHER']) {
  return unsubscribeProxy(context(workerFetch) as unknown as Parameters<typeof unsubscribeProxy>[0]);
}

describe('Proxy de /api/unsubscribe', () => {
  it('deve repassar a origem restrita e o Vary vindos do service binding', async () => {
    const res = await call({ fetch: async () => workerResponse() });

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://eu.robsoncassiano.software');
    expect(res.headers.get('Vary')).toBe('Origin');
  });

  it('deve usar curinga no fallback HTTPS apenas quando o worker não define a origem', async () => {
    const realFetchMock = mock(async () => new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    globalThis.fetch = realFetchMock as unknown as typeof fetch;

    const res = await call(undefined);

    expect(realFetchMock).toHaveBeenCalledTimes(1);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
