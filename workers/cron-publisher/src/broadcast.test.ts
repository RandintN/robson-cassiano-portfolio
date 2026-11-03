import { describe, it, expect } from 'bun:test';
import { processBroadcast } from './broadcast';
import { Env } from './types';

function fakeEnv(onHtml?: (html: string) => void): Env {
  const db = {
    prepare: (sql: string) => ({
      bind: () => ({
        run: async () => ({ meta: { changes: 1 } }),
      }),
      all: async () => ({
        results: sql.includes('FROM subscribers')
          ? [{ id: 1, email: 'dev@exemplo.com', name: 'Dev' }]
          : [],
      }),
      first: async () => ({ total: 1 }),
    }),
  };

  return {
    YOUTUBE_CLIENT_ID: '',
    YOUTUBE_CLIENT_SECRET: '',
    YOUTUBE_REFRESH_TOKEN: '',
    GITHUB_TOKEN: '',
    DB: db as unknown as D1Database,
    EMAIL: {
      send: async (message: { html: string }) => {
        onHtml?.(message.html);
        return undefined;
      },
    },
  };
}

describe('Broadcast', () => {
  it('deve rejeitar domínio parecido que apenas começa com o domínio do site', async () => {
    const env = fakeEnv();

    await expect(
      processBroadcast(env, {
        subject: 'Assunto',
        title: 'Título',
        previewText: 'Resumo',
        articleUrl: 'https://eu.robsoncassiano.software.dominio-alheio.com/artigos/x/',
      })
    ).rejects.toThrow('domínio eu.robsoncassiano.software');
  });

  it('deve escapar o & da URL no href sem perder o destino', async () => {
    let html = '';
    const env = fakeEnv((value) => {
      html = value;
    });

    const result = await processBroadcast(env, {
      subject: 'Assunto',
      title: 'Título',
      previewText: 'Resumo',
      articleUrl: 'https://eu.robsoncassiano.software/artigos/x/?utm=a&ref=b',
    });

    expect(result.sentCount).toBe(1);
    expect(html).toContain('href="https://eu.robsoncassiano.software/artigos/x/?utm=a&amp;ref=b"');
  });

  it('deve informar que a lista continua quando o lote enche', async () => {
    const env = fakeEnv();

    const rows = Array.from({ length: 200 }, (_, index) => ({
      id: index + 1,
      email: `dev${index}@exemplo.com`,
      name: 'Dev',
    }));

    const base = env.DB as unknown as { prepare: (sql: string) => Record<string, unknown> };
    const original = base.prepare.bind(base);

    base.prepare = (sql: string) => {
      if (sql.includes('COUNT(*)')) {
        return { ...original(sql), first: async () => ({ total: 260 }) };
      }
      if (sql.includes('FROM subscribers') && sql.includes('LIMIT')) {
        return { ...original(sql), all: async () => ({ results: rows }) };
      }
      return original(sql);
    };

    const result = await processBroadcast(env, {
      subject: 'Assunto',
      title: 'Título',
      previewText: 'Resumo',
      articleUrl: 'https://eu.robsoncassiano.software/artigos/x/',
    });

    expect(result.hasMore).toBe(true);
    expect(result.remaining).toBe(60);
    expect(result.message).toContain('Restam 60');
  });
});
