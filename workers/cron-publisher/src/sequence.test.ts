import { describe, it, expect } from 'bun:test';
import { processSequenceDispatch } from './sequence';
import { Env } from './types';

interface SentMessage {
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
}

function fakeEnv(sent: SentMessage[]): Env {
  const db = {
    prepare: (sql: string) => ({
      run: async () => ({ meta: { changes: 1 } }),
      bind: () => ({
        run: async () => ({ meta: { changes: 1 } }),
      }),
      all: async () => ({
        results: sql.includes('FROM subscribers')
          ? [{ id: 1, email: 'dev@exemplo.com', name: '<b>Leo</b>', sequence_step: 0, last_sequence_sent_at: null, created_at: '2026-01-01' }]
          : [],
      }),
      first: async () => null,
    }),
  };

  return {
    YOUTUBE_CLIENT_ID: '',
    YOUTUBE_CLIENT_SECRET: '',
    YOUTUBE_REFRESH_TOKEN: '',
    GITHUB_TOKEN: '',
    ADMIN_SECRET: 'segredo-de-teste',
    DB: db as unknown as D1Database,
    EMAIL: {
      send: async (message: SentMessage) => {
        sent.push(message);
      },
    },
  };
}

describe('Sequence dispatch', () => {
  it('deve enviar o primeiro passo com cabeçalho List-Unsubscribe assinado', async () => {
    const sent: SentMessage[] = [];

    const result = await processSequenceDispatch(fakeEnv(sent));

    expect(result.success).toBe(true);
    expect(result.sentCount).toBe(1);
    expect(sent).toHaveLength(1);
    expect(sent[0].headers?.['List-Unsubscribe']).toContain('/api/unsubscribe?email=dev%40exemplo.com&token=');
    expect(sent[0].headers?.['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
  });

  it('deve escapar o nome do inscrito no corpo do e-mail', async () => {
    const sent: SentMessage[] = [];

    await processSequenceDispatch(fakeEnv(sent));

    expect(sent[0].html).toContain('Olá, &lt;b&gt;Leo&lt;/b&gt;!');
    expect(sent[0].html).not.toContain('Olá, <b>Leo</b>!');
  });
});
