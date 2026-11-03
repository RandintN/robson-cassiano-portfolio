import { describe, it, expect } from 'bun:test';
import { handleUnsubscribe } from './unsubscribe';
import { generateUnsubscribeToken } from './security';
import { Env } from './types';

describe('Unsubscribe Handler', () => {
  it('deve retornar 400 se o e-mail não for informado no GET', async () => {
    const req = new Request('https://worker.internal/api/unsubscribe', { method: 'GET' });
    const fakeEnv: Env = {
      YOUTUBE_CLIENT_ID: '',
      YOUTUBE_CLIENT_SECRET: '',
      YOUTUBE_REFRESH_TOKEN: '',
      GITHUB_TOKEN: '',
    };

    const res = await handleUnsubscribe(req, fakeEnv);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBeDefined();
    expect(body.error).toContain('Informe o endereço de e-mail');
  });

  it('deve retornar HTML de confirmação quando o e-mail for fornecido via GET', async () => {
    let queryExecuted = false;
    const fakeDb = {
      prepare: (sql: string) => {
        expect(sql).toContain("UPDATE subscribers SET status = 'unsubscribed'");
        return {
          bind: (email: string) => {
            expect(email).toBe('dev@exemplo.com');
            return {
              run: async () => {
                queryExecuted = true;
                return { meta: { changes: 1 } };
              },
            };
          },
        };
      },
    };

    const fakeEnv: Env = {
      YOUTUBE_CLIENT_ID: '',
      YOUTUBE_CLIENT_SECRET: '',
      YOUTUBE_REFRESH_TOKEN: '',
      GITHUB_TOKEN: '',
      DB: fakeDb as any,
    };

    const req = new Request('https://worker.internal/api/unsubscribe?email=dev@exemplo.com', { method: 'GET' });
    const res = await handleUnsubscribe(req, fakeEnv);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('dev@exemplo.com');
    expect(html).toContain('Inscrição Encerrada com Sucesso');
    expect(html).toContain('Acessar Ensaios Técnicos Públicos');
    expect(html).not.toContain('—');
    expect(html).not.toContain('–');
    expect(queryExecuted).toBe(true);
  });

  it('deve suportar RFC 8058 One-Click Unsubscribe via POST com JSON', async () => {
    let executedEmail = '';
    const fakeDb = {
      prepare: (sql: string) => ({
        bind: (email: string) => ({
          run: async () => {
            executedEmail = email;
            return { meta: { changes: 1 } };
          },
        }),
      }),
    };

    const fakeEnv: Env = {
      YOUTUBE_CLIENT_ID: '',
      YOUTUBE_CLIENT_SECRET: '',
      YOUTUBE_REFRESH_TOKEN: '',
      GITHUB_TOKEN: '',
      DB: fakeDb as any,
    };

    const req = new Request('https://worker.internal/api/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email: 'rfc8058@exemplo.com' }),
    });

    const res = await handleUnsubscribe(req, fakeEnv);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean };
    expect(data.success).toBe(true);
    expect(executedEmail).toBe('rfc8058@exemplo.com');
  });

  it('deve rejeitar token inválido mesmo sem segredo configurado', async () => {
    const fakeEnv: Env = {
      YOUTUBE_CLIENT_ID: '',
      YOUTUBE_CLIENT_SECRET: '',
      YOUTUBE_REFRESH_TOKEN: '',
      GITHUB_TOKEN: '',
    };

    const req = new Request(
      'https://worker.internal/api/unsubscribe?email=dev@exemplo.com&token=deadbeefdeadbeefdeadbeefdeadbeef',
      { method: 'GET', headers: { Accept: 'application/json' } }
    );

    const res = await handleUnsubscribe(req, fakeEnv);

    expect(res.status).toBe(403);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('Token de descadastro inválido');
  });

  it('deve aceitar token gerado com o segredo configurado', async () => {
    const env: Env = {
      YOUTUBE_CLIENT_ID: '',
      YOUTUBE_CLIENT_SECRET: '',
      YOUTUBE_REFRESH_TOKEN: '',
      GITHUB_TOKEN: '',
      ADMIN_SECRET: 'segredo-de-teste',
    };
    const token = await generateUnsubscribeToken('dev@exemplo.com', 'segredo-de-teste');

    const req = new Request(
      `https://worker.internal/api/unsubscribe?email=dev@exemplo.com&token=${token}`,
      { method: 'GET', headers: { Accept: 'application/json' } }
    );

    const res = await handleUnsubscribe(req, env);

    expect(res.status).toBe(200);
  });
});
