import { describe, it, expect } from 'bun:test';
import { SEQUENCE_TEMPLATES } from './sequence_templates';

describe('Sequence Email Templates', () => {
  it('deve possuir exatamente 7 passos na régua cadenciada', () => {
    const steps = Object.keys(SEQUENCE_TEMPLATES).map(Number);
    expect(steps).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('cada passo deve possuir metadados válidos e completos', () => {
    for (let step = 1; step <= 7; step++) {
      const template = SEQUENCE_TEMPLATES[step];
      expect(template).toBeDefined();
      expect(template.step).toBe(step);
      expect(template.subject.length).toBeGreaterThan(10);
      expect(template.videoId.length).toBeGreaterThan(5);
      expect(template.youtubeUrl).toContain('https://www.youtube.com/watch?v=');
      expect(template.badge.length).toBeGreaterThan(5);
      expect(template.title.length).toBeGreaterThan(10);
      expect(template.previewText.length).toBeGreaterThan(15);
    }
  });

  it('não deve conter travessões em nenhum assunto, texto ou HTML', () => {
    for (let step = 1; step <= 7; step++) {
      const template = SEQUENCE_TEMPLATES[step];
      const unsub = 'https://eu.robsoncassiano.software/api/unsubscribe?email=dev@test.com';
      const html = template.renderHtml('Dev', unsub);
      const text = template.renderText('Dev', unsub);

      expect(template.subject).not.toContain('—');
      expect(template.subject).not.toContain('–');
      expect(html).not.toContain('—');
      expect(html).not.toContain('–');
      expect(text).not.toContain('—');
      expect(text).not.toContain('–');
    }
  });

  it('não deve conter o termo saturado "deixar dinheiro na mesa"', () => {
    for (let step = 1; step <= 7; step++) {
      const template = SEQUENCE_TEMPLATES[step];
      const unsub = 'https://eu.robsoncassiano.software/api/unsubscribe?email=dev@test.com';
      const html = template.renderHtml('Dev', unsub);
      const text = template.renderText('Dev', unsub);

      expect(html.toLowerCase()).not.toContain('deixar dinheiro na mesa');
      expect(text.toLowerCase()).not.toContain('deixar dinheiro na mesa');
    }
  });

  it('deve injetar o nome do lead e o link de descadastro corretamente', () => {
    const template = SEQUENCE_TEMPLATES[1];
    const unsub = 'https://eu.robsoncassiano.software/api/unsubscribe?email=joao@exemplo.com';
    const html = template.renderHtml('João', unsub);
    const text = template.renderText('João', unsub);

    expect(html).toContain('João');
    expect(html).toContain(unsub);
    expect(text).toContain('João');
    expect(text).toContain(unsub);
  });
});
