import fs from 'node:fs';
import path from 'node:path';

const BASE_DIR = path.resolve(import.meta.dirname, '..');
const TRANSCRIPT_PATH = path.join(BASE_DIR, 'content', 'transcripts', 'PAERGtw-0mk_sobre-o-mercado-de-software-atual-clecius.txt');
const TARGET_ARTICLE = path.join(BASE_DIR, 'content', 'articles', 'mercado-real-engenharia-software-clecius-martinkoski.md');

function cleanSrt(srt: string): string {
  return srt.split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !/^\d+$/.test(l) && !l.includes('-->'))
    .map(l => l.replace(/<[^>]+>/g, '').trim())
    .filter((l, i, arr) => i === 0 || l !== arr[i-1])
    .join(' ');
}

async function main() {
  console.log('============================================================');
  console.log('📜 GERANDO ENSAIO DA LIVE MAIS ANTIGA DO CANAL (2023-10-12)');
  console.log('============================================================\n');

  console.log('[*] Lendo transcrição da live mais antiga...');
  const transcriptRaw = fs.readFileSync(TRANSCRIPT_PATH, 'utf8');
  const cleaned = cleanSrt(transcriptRaw);
  console.log(`[✓] Transcrição processada com ${cleaned.length} caracteres.`);

  const prompt = `Você é um refinado editor e filósofo de tecnologia trabalhando em conjunto com o engenheiro de software sênior e mentor internacional Robson Cassiano (+10 anos de experiência, passagens por Epic Games e fundador da Simple Software).

Sua missão é transformar a transcrição bruta da PRIMEIRA LIVE TÉCNICA HISTÓRICA do canal de Robson Cassiano (com a participação do engenheiro de software Clécius Martinkoski, 14+ anos de experiência) em um ensaio técnico e filosófico aprofundado para o blog soberano (eu.robsoncassiano.software/artigos).

INFORMAÇÕES DA TRANSMISSÃO HISTÓRICA:
- Título Original: "Sobre o mercado de Software atual, com Clécius Martinkoski | Parte 1"
- Data de Publicação: 2023-10-12
- Participantes: Robson Cassiano & Clécius Martinkoski (Engenheiro com mais de 14 anos na indústria)
- Formato: 🔴 LIVE HISTÓRICA (A primeira transmissão do canal)

TRANSCRIÇÃO BRUTA:
${cleaned.slice(0, 32000)}

REGRAS DE LINGUAGEM OBRIGATÓRIAS (RIGOR MÁXIMO):
1. PROIBIDO ESTRUTURAS CONTRASTIVAS RETÓRICAS ("não é X, é Y", "not merely X but Y", "não apenas X—Y", "longe de ser X, trata-se de Y"). Se algo tem duas dimensões, nomeie ambas diretamente sem andaimes de negação.
2. PROIBIDO TRAVESSÕES (— ou –). Substitua qualquer pontuação de travessão por vírgulas, dois-pontos ou parênteses.
3. USO MANDATÓRIO DE ETIMOLOGIA GRECO-LATINA: Trace conexões com as raízes linguísticas greco-latinas dos conceitos tratados:
   - carreira: latim carraria (caminho para carruagens, via trilhada).
   - experiência: latim experientia (ex + periri, colocar-se em risco e provar pelo combate real).
   - técnica: grego techne (arte prática fundamentada em princípios rigorosos).
   - disciplina: latim disciplina (instrução e conduta metódica transmitida ao estudante).
   - problema: grego pro + ballein (aquilo que é lançado à frente para ser superado).
   - escola / academia: grego schole (tempo livre para contemplação intelectual).
   - mercado: latim mercatus (espaço de troca de valores e serviços).
   - valor: latim valere (ter vigor, força e saúde).
4. PROIBIDO TOM MOTIVACIONAL, COACH, CORPORATIVO OU SYCOPHANTIC: Responda direto com densidade analítica e profundidade histórica.
5. CITAÇÕES E CASOS REAIS: Preserve as falas de Robson Cassiano e Clécius Martinkoski, o choque da entrada no mercado a partir do suporte e manutenção física de hardware, a defasagem dos cursos acadêmicos frente ao código de produção e o valor duradouro do estudo autodidata de fundamentos.

ESTRUTURA DE RESPOSTA OBRIGATÓRIA:
Retorne EXCLUSIVAMENTE o conteúdo do arquivo Markdown com frontmatter YAML completo no início:

---
title: "O Mercado Real de Engenharia de Software: Fundamentos, Choque Prático e a Longevidade da Carreira"
slug: "mercado-real-engenharia-software-clecius-martinkoski"
date: "2023-10-12"
author: "Robson Cassiano"
category: "Carreira & Engenharia"
readTime: "9 min de leitura"
tags: ["Engenharia de Software", "Fundamentos", "Carreira Tech", "Clécius Martinkoski"]
summary: "Ensaio analítico sobre a primeira live técnica do canal: o abismo entre o ensino acadêmico e a produção real, e os princípios que sustentam mais de uma década na engenharia de software."
coverImage: "assets/images/robson-cassiano-mentor.jpg"
canonicalUrl: "https://eu.robsoncassiano.software/artigos/mercado-real-engenharia-software-clecius-martinkoski"
preSoldTarget: "mentoria"
---

# O Mercado Real de Engenharia de Software: Fundamentos, Choque Prático e a Longevidade da Carreira

[Desenvolvimento textual detalhado com subtítulos h2, tópicos analíticos, caixas ASCII de síntese e conclusão sólida.]`;

  console.log('[*] Enviando requisição para o Google Gemini 3.6 Flash via Cloudflare Edge...');
  const res = await fetch('https://robson-cassiano-cron-publisher.robson-cassiano.workers.dev/generate-custom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[!] Erro na geração:', err);
    return;
  }

  const data = await res.json<{ success: boolean; markdown: string }>();
  let markdown = data.markdown || '';

  // Limpa envolventes markdown se houver
  markdown = markdown.replace(/^```(?:markdown)?\r?\n/, '').replace(/\r?\n```$/, '').trim();

  fs.writeFileSync(TARGET_ARTICLE, markdown, 'utf8');
  console.log(`\n[✓] Ensaio gerado e salvo com sucesso em: ${TARGET_ARTICLE}`);
  console.log(`[i] Tamanho do artigo gerado: ${markdown.length} caracteres.`);
}

main().catch(console.error);
