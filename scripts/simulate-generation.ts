import fs from 'node:fs';
import path from 'node:path';

function cleanSrtToText(srtContent: string): string {
  const lines = srtContent.split(/\r?\n/);
  const textLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^\d+$/.test(line)) continue;
    if (/^\d{2}:\d{2}:\d{2}/.test(line) || line.includes('-->')) continue;

    const cleaned = line.replace(/<[^>]+>/g, '').trim();
    if (cleaned && (textLines.length === 0 || textLines[textLines.length - 1] !== cleaned)) {
      textLines.push(cleaned);
    }
  }

  return textLines.join(' ');
}

async function main() {
  const tokenData = JSON.parse(fs.readFileSync('scripts/token.json', 'utf-8'));
  const creds = JSON.parse(fs.readFileSync('scripts/client_secrets.json', 'utf-8')).installed;

  console.log('[1/4] Renovando access token...');
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: tokenData.refresh_token,
      grant_type: 'refresh_token'
    })
  });
  const { access_token } = await tokenRes.json();

  const videoId = 'zcOg9aGBNJ4';
  const videoTitle = 'Master Your Daily Stand-up: Professional English & Technical Communication for Developers';
  const publishedAt = '2026-10-04';
  const typeLabel = 'LIVE';

  console.log(`[2/4] Baixando legenda da live mais recente: [${videoId}] ${videoTitle}...`);
  const captionRes = await fetch(`https://www.googleapis.com/youtube/v3/captions/AUieDaYcaZdOjgFoZwXO1rLViQI0bi4lnMJ1WYDyYdiAejj4A7g?tfmt=srt`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const rawSrt = await captionRes.text();
  const transcript = cleanSrtToText(rawSrt);
  console.log(`Transcrição obtida (${transcript.length} caracteres).`);

  console.log('[3/4] Submetendo ao prompt do Cloudflare Worker Cron Publisher via Gemini...');
  const prompt = `Você é um refinado editor e filósofo de tecnologia trabalhando em conjunto com o engenheiro de software sênior e mentor internacional Robson Cassiano (+10 anos de experiência, passagens por Epic Games e fundador da Simple Software).

Sua missão é transformar a transcrição bruta da transmissão do canal de Robson em um ensaio técnico aprofundado e persuasivo para o blog soberano (eu.robsoncassiano.software/artigos).

INFORMAÇÕES DO VÍDEO:
- Título Original: "${videoTitle}"
- Data de Publicação: ${publishedAt}
- Formato Original: ${typeLabel}
- URL do Vídeo: https://www.youtube.com/watch?v=${videoId}

TRANSCRIÇÃO BRUTA:
${transcript.slice(0, 32000)}

REGRAS DE LINGUAGEM E ESTILO OBRIGATÓRIAS (RIGOR MÁXIMO):
1. TOM INFORMAL E CONVERSACIONAL: Redija em tom informal, direto e autêntico, como um desenvolvedor experiente conversando diretamente com outro profissional. Linguagem próxima e franca, sem formalismo acadêmico acartonado ou burocrático.
2. PROIBIDO ESTRUTURAS CONTRASTIVAS RETÓRICAS ("não é X, é Y", "not merely X but Y", "não apenas X—Y", "longe de ser X, trata-se de Y"). Se algo tem duas dimensões, nomeie ambas diretamente sem andaimes de negação.
3. PROIBIDO TRAVESSÕES (— ou –). Substitua qualquer pontuação de travessão por vírgulas, dois-pontos ou parênteses.
4. USO MANDATÓRIO DE ETIMOLOGIA GRECO-LATINA: Conecte os conceitos tratados às raízes linguísticas greco-latinas de forma orgânica e fluida na conversa (ex: carreira do latim carraria; experiência do latim experientia, ex + periri; técnica do grego techne; disciplina do latim disciplina; problema do grego pro + ballein; escola do grego schole; mercado do latim mercatus; trabalho do latim tripalium; contrato do latim contractus; valor do latim valere; comunicação do latim communicare, communis; decisão do latim decidere, de + caedere; salário do latim salarium; autoridade do latim auctoritas).
5. PROIBIDO TOM MOTIVACIONAL, COACH, CORPORATIVO OU SYCOPHANTIC: Sem introduções bajuladoras, sem jargões de autoajuda. Fale a verdade com franqueza técnica e prática real de mercado.
6. LISTA DE PALAVRAS E EXPRESSÕES PROIBIDAS: coach, coaching, executivo, ruído, reside, assertivo, deliberado, "deixar dinheiro na mesa", "virar o jogo", "mudar o jogo", "inverter o jogo".
7. PROIBIDO FÓRMULAS DE FECHO: Proibido encerrar com "em conclusão", "por fim", "finalmente", "e por fim". Finalize diretamente no último ponto prático ou argumento factual.
8. CITAÇÕES E RELATOS REAIS: Inclua falas fiéis de Robson Cassiano e preserve os casos reais relatados durante a transmissão.
9. DIRETRIZ FIX-MY-COPY (ESPELHO DO LEITOR): O texto deve atuar como um espelho da realidade prática do desenvolvedor leitor. Aplique o princípio de foco no cliente/leitor ('mesmo fato, dono diferente'): ao apresentar experiências, ferramentas ou cases de Robson Cassiano, traduza imediatamente para o ganho prático do leitor ('o que isso muda na sua rotina, na sua visibilidade e no seu código'). Mantenha fatos e provas concretas ancorados nos desafios diários enfrentados pelo profissional.

ESTRUTURA DE RESPOSTA OBRIGATÓRIA:
Retorne EXCLUSIVAMENTE o conteúdo do arquivo Markdown com frontmatter YAML completo no início:

---
title: "Título Analítico e Preciso"
slug: "slug-otimizado-em-kebab-case"
date: "${publishedAt}"
author: "Robson Cassiano"
category: "Carreira & Engenharia"
readTime: "8 min de leitura"
tags: ["Tag1", "Tag2", "Tag3"]
youtubeVideoId: "${videoId}"
summary: "Resumo objetivo e persuasivo de até 160 caracteres para SEO."
coverImage: "assets/images/robson-cassiano-mentor.jpg"
canonicalUrl: "https://eu.robsoncassiano.software/artigos/slug-otimizado-em-kebab-case/"
preSoldTarget: "mentoria"
---

# Título Principal do Ensaio

[Desenvolvimento textual com subtítulos h2, tópicos analíticos, diagramas textuais em caixas ASCII e conclusão sólida.]`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no ambiente.');
  }
  const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    })
  });

  if (!aiRes.ok) {
    const err = await aiRes.text();
    throw new Error(`Erro na API do Gemini: ${err}`);
  }

  const aiData = await aiRes.json();
  let markdown = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  markdown = markdown.replace(/^```(?:markdown)?\r?\n/, '').replace(/\r?\n```$/, '').trim();

  console.log('[4/4] Artigo gerado com sucesso!\n');
  const simPath = path.resolve('content', 'articles', 'simulacao-ultima-live.md');
  fs.writeFileSync(simPath, markdown, 'utf-8');
  console.log(`Salvo para inspeção em: ${simPath}\n`);
  console.log('------------------------------------------------------------');
  console.log(markdown);
  console.log('------------------------------------------------------------');
}

main().catch(err => {
  console.error('Falha:', err);
  process.exit(1);
});
