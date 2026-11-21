import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, it, expect } from 'bun:test';
import {
  escapeXml,
  wrapCdata,
  toIsoDate,
  toRfc822Date,
  absolutizeHtmlUrls,
  collectCategories,
  latestDateOf,
  resolveEnclosure,
  buildRssFeed,
  buildAtomFeed,
} from '../scripts/lib/feeds.js';

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir && fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

function createTempAssets(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'feeds-test-'));
  tempDirs.push(dir);
  const ogDir = path.join(dir, 'assets', 'images', 'og');
  fs.mkdirSync(ogDir, { recursive: true });
  fs.writeFileSync(path.join(ogDir, 'artigo-um.jpg'), Buffer.from('fake-jpeg-payload'));
  return dir;
}

describe('Utilitários de XML, datas e URLs de feeds', () => {
  it('deve escapar caracteres reservados de XML', () => {
    expect(escapeXml(`A & B <tag> "aspas" 'simples'`)).toBe(
      'A &amp; B &lt;tag&gt; &quot;aspas&quot; &apos;simples&apos;'
    );
  });

  it('deve dividir a sequência ]]> dentro de blocos CDATA', () => {
    const wrapped = wrapCdata('<p>antes ]]> depois</p>');
    expect(wrapped).toBe('<![CDATA[<p>antes ]]]]><![CDATA[> depois</p>]]>');
    expect(wrapped).not.toContain('<p>antes ]]> depois</p>');
  });

  it('deve formatar datas ISO 8601 e RFC 822 de forma determinística e rejeitar datas inválidas', () => {
    expect(toIsoDate('2026-10-04')).toBe('2026-10-04T10:00:00-03:00');
    expect(toIsoDate('2026-10-04T15:30:00Z')).toBe('2026-10-04T15:30:00Z');
    expect(toRfc822Date('2026-10-04')).toBe('Sun, 04 Oct 2026 10:00:00 -0300');
    expect(toRfc822Date('2026-08-29')).toBe('Sat, 29 Aug 2026 10:00:00 -0300');

    expect(() => toIsoDate('data-invalida')).toThrow();
    expect(() => toIsoDate('2026-02-30')).toThrow();
    expect(() => toRfc822Date('2026-13-01')).toThrow();
    expect(() => toRfc822Date('')).toThrow();
  });

  it('deve converter URLs relativas em absolutas preservando esquemas externos e âncoras', () => {
    const html = [
      '<img src="/assets/images/roadmap.webp" alt="Mapa">',
      '<img src="assets/images/local.jpg" alt="Local">',
      '<a href="/artigos/outro/">Outro</a>',
      '<a href="https://externo.example/doc">Externo</a>',
      '<a href="mailto:contato@robsoncassiano.software">Email</a>',
      '<a href="#secao">Seção</a>',
    ].join('\n');

    const out = absolutizeHtmlUrls(html, 'https://eu.robsoncassiano.software');
    expect(out).toContain('src="https://eu.robsoncassiano.software/assets/images/roadmap.webp"');
    expect(out).toContain('src="https://eu.robsoncassiano.software/assets/images/local.jpg"');
    expect(out).toContain('href="https://eu.robsoncassiano.software/artigos/outro/"');
    expect(out).toContain('href="https://externo.example/doc"');
    expect(out).toContain('href="mailto:contato@robsoncassiano.software"');
    expect(out).toContain('href="#secao"');
  });

  it('deve deduplicar categoria e tags sem diferenciar maiúsculas de minúsculas', () => {
    const cats = collectCategories({
      category: 'Engenharia de Software',
      tags: ['Java', 'engenharia de software', 'JAVA', 'Spring Boot', ''],
    });
    expect(cats).toEqual(['Engenharia de Software', 'Java', 'Spring Boot']);
  });
});

describe('Geração de feeds RSS 2.0 e Atom 1.0', () => {
  const sampleArticles = [
    {
      slug: 'artigo-dois',
      title: 'Artigo Dois & Arquitetura <Resiliente>',
      date: '2026-08-29',
      updated: '2026-09-12',
      author: 'Robson Cassiano',
      category: 'Arquitetura',
      tags: ['arquitetura', 'Resiliência'],
      summary: 'Resumo com "aspas" & sinais < >. ',
      ogImage: 'assets/images/og/inexistente.jpg',
      canonicalUrl: 'https://eu.robsoncassiano.software/artigos/artigo-dois/',
      content: '# Título repetido\n\nTexto com ![Mapa](/assets/images/mapa.webp).\n\n<div>antes ]]> depois</div>',
    },
    {
      slug: 'artigo-um',
      title: 'Artigo Um',
      date: '2026-10-04',
      updated: '2026-10-04',
      author: 'Robson Cassiano',
      category: 'Carreira & Engenharia',
      tags: ['Carreira & Engenharia', 'Java'],
      summary: 'Resumo do artigo um.',
      ogImage: 'assets/images/og/artigo-um.jpg',
      canonicalUrl: 'https://eu.robsoncassiano.software/artigos/artigo-um/',
      youtubeVideoId: 'zcOg9aGBNJ4',
      content: '# Artigo Um\n\nParágrafo com [link interno](/artigos/artigo-dois/).',
    },
  ];

  it('deve resolver enclosure apenas quando o arquivo existe em disco', () => {
    const assetsRoot = createTempAssets();
    const present = resolveEnclosure(sampleArticles[1], assetsRoot);
    const missing = resolveEnclosure(sampleArticles[0], assetsRoot);

    expect(present).toEqual({
      url: 'https://eu.robsoncassiano.software/assets/images/og/artigo-um.jpg',
      length: Buffer.byteLength('fake-jpeg-payload'),
      type: 'image/jpeg',
    });
    expect(missing).toBeNull();
  });

  it('deve construir RSS 2.0 ordenado, com CDATA protegido, YouTube sem iframe e enclosure condicional', () => {
    const assetsRoot = createTempAssets();
    const rss = buildRssFeed(sampleArticles, { assetsRoot });

    expect(rss.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(rss).toContain('<atom:link href="https://eu.robsoncassiano.software/rss.xml" rel="self" type="application/rss+xml" />');
    expect(latestDateOf(sampleArticles)).toBe('2026-10-04');
    expect(rss).toContain('<lastBuildDate>Sun, 04 Oct 2026 10:00:00 -0300</lastBuildDate>');

    // Ordenação: Artigo Um (2026-10-04) antes de Artigo Dois (2026-08-29)
    expect(rss.indexOf('<title>Artigo Um</title>')).toBeLessThan(
      rss.indexOf('<title>Artigo Dois &amp; Arquitetura &lt;Resiliente&gt;</title>')
    );

    // Sem tag <author> no <item> quando há <dc:creator>
    expect(rss).toContain('<dc:creator>Robson Cassiano</dc:creator>');
    expect(rss).not.toMatch(/<item>[\s\S]*?<author>/);

    // YouTube substituído por link direto (sem iframe)
    expect(rss).toContain('https://www.youtube.com/watch?v=zcOg9aGBNJ4');
    expect(rss).not.toContain('<iframe');

    // URLs relativas absolutizadas e remoção de título repetido
    expect(rss).toContain('src="https://eu.robsoncassiano.software/assets/images/mapa.webp"');
    expect(rss).toContain('href="https://eu.robsoncassiano.software/artigos/artigo-dois/"');
    expect(rss).not.toContain('<h1>Título repetido</h1>');

    // Proteção de CDATA contra ]]>
    expect(rss).toContain(']]]]><![CDATA[>');

    // Enclosure presente apenas para artigo-um.jpg
    expect(rss.match(/<enclosure /g)?.length).toBe(1);
    expect(rss).toContain('url="https://eu.robsoncassiano.software/assets/images/og/artigo-um.jpg"');

    // Deduplicação de categorias: 2 categorias únicas por artigo = 4 no total
    expect(rss.match(/<category>/g)?.length).toBe(4);
  });

  it('deve construir Atom 1.0 conforme RFC 4287 com datas ISO, conteúdo escapado e enclosure condicional', () => {
    const assetsRoot = createTempAssets();
    const atom = buildAtomFeed(sampleArticles, { assetsRoot });

    expect(atom.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(atom).toContain('<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="pt-BR">');
    expect(atom).toContain('<updated>2026-10-04T10:00:00-03:00</updated>');
    expect(atom).toContain('<published>2026-08-29T10:00:00-03:00</published>');
    expect(atom).toContain('<updated>2026-09-12T10:00:00-03:00</updated>');
    expect(atom).toContain('<content type="html">');
    expect(atom).toContain('https://www.youtube.com/watch?v=zcOg9aGBNJ4');
    expect(atom).not.toContain('&lt;iframe');
    expect(atom).toContain('https://eu.robsoncassiano.software/assets/images/mapa.webp');
    expect(atom.match(/rel="enclosure"/g)?.length).toBe(1);
    expect(atom.match(/<category /g)?.length).toBe(4);
  });
});
