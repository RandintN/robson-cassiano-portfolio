import { Env, PublishMode, YouTubeVideoItem } from './types';
import { processBroadcast } from './broadcast';

async function waitForArticleLive(url: string, maxAttempts = 15, delayMs = 10000): Promise<boolean> {
  console.log(`[HealthCheck] Aguardando propagação do artigo em ${url}...`);
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Cloudflare-Worker-Cron-Publisher-HealthCheck'
        }
      });
      if (res.status === 200) {
        console.log(`[HealthCheck] Artigo disponível em produção na tentativa ${attempt}! Status 200.`);
        return true;
      }
      console.log(`[HealthCheck] Tentativa ${attempt}/${maxAttempts} retornou status ${res.status}. Aguardando ${delayMs / 1000}s...`);
    } catch (e: any) {
      console.log(`[HealthCheck] Tentativa ${attempt}/${maxAttempts} falhou na requisição: ${e?.message || e}`);
    }
    await new Promise(r => setTimeout(r, delayMs));
  }
  console.warn(`[HealthCheck] Limite de espera atingido. Prosseguindo com o envio do broadcast.`);
  return false;
}

function parseDurationInSeconds(isoDuration?: string): number {
  if (!isoDuration) return 0;
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

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

async function getGoogleAccessToken(env: Env): Promise<string> {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.YOUTUBE_CLIENT_ID,
      client_secret: env.YOUTUBE_CLIENT_SECRET,
      refresh_token: env.YOUTUBE_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Falha ao renovar token OAuth do Google: ${err}`);
  }

  const tokenData = await tokenRes.json<{ access_token: string }>();
  return tokenData.access_token;
}

async function fetchChannelVideos(accessToken: string, mode: PublishMode): Promise<YouTubeVideoItem[]> {
  const channelRes = await fetch('https://www.googleapis.com/youtube/v3/channels?mine=true&part=contentDetails,snippet', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const channelData = await channelRes.json<{ items?: Array<{ contentDetails: { relatedPlaylists: { uploads: string } } }> }>();
  const uploadsId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsId) {
    throw new Error('Playlist de uploads não encontrada no canal.');
  }

  const maxResults = mode === 'RANDOM_ARCHIVE' ? 50 : 30;
  let pageToken = '';

  if (mode === 'RANDOM_ARCHIVE') {
    const randomPage = Math.floor(Math.random() * 3);
    for (let p = 0; p < randomPage; p++) {
      const pageRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${uploadsId}&part=snippet&maxResults=50${pageToken ? `&pageToken=${pageToken}` : ''}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const pageData = await pageRes.json<{ nextPageToken?: string }>();
      if (pageData.nextPageToken) {
        pageToken = pageData.nextPageToken;
      } else {
        break;
      }
    }
  }

  const playlistRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${uploadsId}&part=snippet&maxResults=${maxResults}${pageToken ? `&pageToken=${pageToken}` : ''}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const playlistData = await playlistRes.json<{ items?: Array<{ snippet: { resourceId: { videoId: string } } }> }>();
  const videoIds = (playlistData.items || []).map(i => i.snippet.resourceId.videoId).filter(Boolean);

  if (videoIds.length === 0) return [];

  const videoDetailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoIds.join(',')}&part=snippet,contentDetails,liveStreamingDetails,status`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const videoDetails = await videoDetailsRes.json<{ items?: Array<{ id: string; snippet: { title: string; publishedAt: string }; contentDetails: { duration: string }; liveStreamingDetails?: unknown; status?: { privacyStatus: string } }> }>();

  return (videoDetails.items || [])
    .filter(v => v.status?.privacyStatus === 'public')
    .map(v => {
      const durationSeconds = parseDurationInSeconds(v.contentDetails?.duration);
      const isLive = !!v.liveStreamingDetails;
      const isShort = !isLive && durationSeconds > 0 && durationSeconds <= 60;
      const typeLabel = isLive ? 'LIVE' : isShort ? 'SHORT' : 'VIDEO LONGO';

      return {
        id: v.id,
        title: v.snippet.title,
        publishedAt: v.snippet.publishedAt.slice(0, 10),
        isLive,
        isShort,
        typeLabel,
        durationSeconds,
        privacyStatus: v.status?.privacyStatus || 'public'
      };
    });
}

async function fetchExistingArticleSlugs(env: Env): Promise<string[]> {
  const owner = env.GITHUB_REPO_OWNER || 'RandintN';
  const repo = env.GITHUB_REPO_NAME || 'robson-cassiano-portfolio';

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/content/articles`, {
    headers: {
      'User-Agent': 'Cloudflare-Worker-Cron-Publisher',
      Authorization: `token ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });

  if (!res.ok) return [];

  const files = await res.json<Array<{ name: string }>>();
  return (files || []).map(f => f.name.replace(/\.md$/, ''));
}

async function downloadCaption(accessToken: string, videoId: string): Promise<string | null> {
  const listRes = await fetch(`https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&part=snippet`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const captionData = await listRes.json<{ items?: Array<{ id: string; snippet: { language: string } }> }>();
  const items = captionData.items || [];
  if (items.length === 0) return null;

  const selected = items.find(i => i.snippet.language?.startsWith('pt')) || items[0];

  const downloadRes = await fetch(`https://www.googleapis.com/youtube/v3/captions/${selected.id}?tfmt=srt`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!downloadRes.ok) return null;

  const rawSrt = await downloadRes.text();
  return cleanSrtToText(rawSrt);
}

async function generateEssayWithAI(env: Env, video: YouTubeVideoItem, transcript: string): Promise<{ title: string; slug: string; markdown: string }> {
  const prompt = `Você é um refinado editor e filósofo de tecnologia trabalhando em conjunto com o engenheiro de software sênior e mentor internacional Robson Cassiano (+10 anos de experiência, passagens por Epic Games e fundador da Simple Software).

Sua missão é transformar a transcrição bruta da transmissão do canal de Robson em um ensaio técnico aprofundado e persuasivo para o blog soberano (eu.robsoncassiano.software/artigos).

INFORMAÇÕES DO VÍDEO:
- Título Original: "${video.title}"
- Data de Publicação: ${video.publishedAt}
- Formato Original: ${video.typeLabel}
- URL do Vídeo: https://www.youtube.com/watch?v=${video.id}

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
date: "${video.publishedAt}"
author: "Robson Cassiano"
category: "Carreira & Engenharia"
readTime: "8 min de leitura"
tags: ["Tag1", "Tag2", "Tag3"]
youtubeVideoId: "${video.id}"
summary: "Resumo objetivo e persuasivo de até 160 caracteres para SEO."
coverImage: "assets/images/robson-cassiano-mentor.jpg"
canonicalUrl: "https://eu.robsoncassiano.software/artigos/slug-otimizado-em-kebab-case/"
preSoldTarget: "mentoria"
---

# Título Principal do Ensaio

[Desenvolvimento textual com subtítulos h2, tópicos analíticos, diagramas textuais em caixas ASCII e conclusão sólida.]`;

  let markdown = '';
  let lastAiError = '';
  const geminiModel = env.GEMINI_MODEL || 'gemini-3.8-flash';

  // 1. Motor Primário: Google Gemini API (AI Studio)
  if (env.GEMINI_API_KEY) {
    try {
      const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${env.GEMINI_API_KEY}`, {
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

      if (aiRes.ok) {
        const aiData = await aiRes.json<{ candidates?: Array<{ content: { parts: Array<{ text: string }> } }> }>();
        markdown = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        const errText = await aiRes.text();
        lastAiError = `Gemini (${geminiModel}) Error: ${errText}`;
      }
    } catch (e: any) {
      lastAiError = `Gemini Fetch Error: ${e.message}`;
    }
  }

  // 2. Fallback de contingência: Cloudflare Workers AI no Edge
  if (!markdown && env.AI) {
    try {
      const aiRes: any = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
        messages: [
          { role: 'system', content: 'Você é um escritor técnico e filósofo rigoroso.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4096,
        temperature: 0.3
      });
      markdown = aiRes.response || '';
    } catch (err: any) {
      lastAiError += ` | Workers AI Error: ${err?.message || err}`;
    }
  }

  if (!markdown) {
    throw new Error(`Falha ao gerar o ensaio. Detalhes: ${lastAiError}`);
  }

  markdown = markdown
    .replace(/^```(?:markdown)?\r?\n/, '')
    .replace(/\r?\n```$/, '')
    .replace(/—/g, ', ')
    .replace(/–/g, ', ')
    .replace(/\b(reside|residem)\b/gi, 'consiste')
    .replace(/##\s*Conclusão:?\s*/gi, '## ')
    .replace(/\b(Em conclusão|Por fim|Finalmente|E por fim)[,\s]*/gi, '')
    .trim();

  const slugMatch = markdown.match(/slug:\s*["']?([^\r\n"']+)["']?/i);
  const rawSlug = slugMatch ? slugMatch[1] : video.title;
  const slug = rawSlug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 60).replace(/^-|-$/g, '');

  const titleMatch = markdown.match(/title:\s*["']([^"']+)["']/i);
  const title = titleMatch ? titleMatch[1] : video.title;

  const summaryMatch = markdown.match(/summary:\s*["']([^"']+)["']/i);
  const summary = summaryMatch ? summaryMatch[1] : '';

  const canonicalMatch = markdown.match(/canonicalUrl:\s*["']([^"']+)["']/i);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : `https://eu.robsoncassiano.software/artigos/${slug}/`;

  return { title, slug, summary, canonicalUrl, markdown };
}

async function commitArticleToGitHub(env: Env, slug: string, markdown: string, videoTitle: string): Promise<string> {
  const owner = env.GITHUB_REPO_OWNER || 'RandintN';
  const repo = env.GITHUB_REPO_NAME || 'robson-cassiano-portfolio';
  const filePath = `content/articles/${slug}.md`;

  const contentBase64 = btoa(unescape(encodeURIComponent(markdown)));

  const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      'User-Agent': 'Cloudflare-Worker-Cron-Publisher',
      Authorization: `token ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `feat(blog): publicar automaticamente ensaio '${videoTitle}' via Cloudflare Worker Cron`,
      content: contentBase64,
      branch: 'master'
    })
  });

  if (!commitRes.ok) {
    const err = await commitRes.text();
    throw new Error(`Falha ao realizar commit no GitHub (Status ${commitRes.status}): ${err}`);
  }

  const commitData = await commitRes.json<{ commit?: { sha?: string } }>();
  return commitData.commit?.sha || 'commit-concluido';
}

export async function processAutomatedPublishing(env: Env, mode: PublishMode = 'AUTO'): Promise<{
  success: boolean;
  message: string;
  slug?: string;
  commitSha?: string;
  selectedType?: string;
  broadcastSentCount?: number;
}> {
  const accessToken = await getGoogleAccessToken(env);
  const videos = await fetchChannelVideos(accessToken, mode);

  if (videos.length === 0) {
    return { success: false, message: 'Nenhum vídeo encontrado no canal.' };
  }

  const existingSlugs = await fetchExistingArticleSlugs(env);

  let selectedVideo: YouTubeVideoItem | undefined;

  if (mode === 'LATEST_LIVE') {
    selectedVideo = videos.find(v => v.isLive && !existingSlugs.some(s => s.includes(v.id) || s.includes(v.title.slice(0, 15))));
  } else if (mode === 'RANDOM_ARCHIVE') {
    const unindexed = videos.filter(v => !v.isShort && !existingSlugs.some(s => s.includes(v.id) || s.includes(v.title.slice(0, 15))));
    if (unindexed.length > 0) {
      selectedVideo = unindexed[Math.floor(Math.random() * unindexed.length)];
    }
  } else {
    selectedVideo = videos.find(v => v.isLive && !existingSlugs.some(s => s.includes(v.id) || s.includes(v.title.slice(0, 15))));
    if (!selectedVideo) {
      const unindexed = videos.filter(v => !v.isShort && !existingSlugs.some(s => s.includes(v.id) || s.includes(v.title.slice(0, 15))));
      if (unindexed.length > 0) {
        selectedVideo = unindexed[Math.floor(Math.random() * unindexed.length)];
      }
    }
  }

  if (!selectedVideo) {
    return { success: true, message: `Nenhum conteúdo pendente encontrado para o modo [${mode}]. Todos os itens recentes já possuem artigos.` };
  }

  const transcript = await downloadCaption(accessToken, selectedVideo.id);
  if (!transcript || transcript.length < 500) {
    return { success: false, message: `Legenda não encontrada ou insuficiente para o vídeo [${selectedVideo.id}] ${selectedVideo.title}` };
  }

  const essay = await generateEssayWithAI(env, selectedVideo, transcript);
  const commitSha = await commitArticleToGitHub(env, essay.slug, essay.markdown, selectedVideo.title);

  // Aguarda propagação no Cloudflare Pages para garantir disponibilidade antes de notificar assinantes
  const articleUrl = essay.canonicalUrl || `https://eu.robsoncassiano.software/artigos/${essay.slug}/`;
  await waitForArticleLive(articleUrl);

  let broadcastSentCount = 0;
  if (env.DB) {
    try {
      const broadcastRes = await processBroadcast(env, {
        subject: `${essay.title}`,
        title: essay.title,
        previewText: essay.summary || 'Acesse a nova análise técnica no blog.',
        articleUrl: articleUrl,
        articleSlug: essay.slug
      });
      broadcastSentCount = broadcastRes.sentCount;
      console.log(`[Automated Broadcast Success]: Notificados ${broadcastSentCount} inscritos para o ensaio '${essay.slug}'.`);
    } catch (broadcastErr: any) {
      console.error('[Automated Broadcast Error]:', broadcastErr?.message || broadcastErr);
    }
  }

  return {
    success: true,
    message: `Ensaio '${essay.title}' publicado e notificado para ${broadcastSentCount} inscritos! [Modo: ${mode}] Commit: ${commitSha}`,
    slug: essay.slug,
    commitSha,
    selectedType: selectedVideo.typeLabel,
    broadcastSentCount
  };
}
