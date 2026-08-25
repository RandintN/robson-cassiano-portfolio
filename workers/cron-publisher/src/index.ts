export interface Env {
  YOUTUBE_CLIENT_ID: string;
  YOUTUBE_CLIENT_SECRET: string;
  YOUTUBE_REFRESH_TOKEN: string;
  GITHUB_TOKEN: string;
  GEMINI_API_KEY?: string;
  GITHUB_REPO_OWNER?: string;
  GITHUB_REPO_NAME?: string;
  CRON_SECRET?: string;
  AI?: any;
}

export type PublishMode = 'LATEST_LIVE' | 'RANDOM_ARCHIVE' | 'AUTO';

interface YouTubeVideoItem {
  id: string;
  title: string;
  publishedAt: string;
  isLive: boolean;
  isShort: boolean;
  typeLabel: string;
  durationSeconds: number;
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

  // Se for busca no acervo aleatório, podemos paginar para pegar vídeos históricos
  const maxResults = mode === 'RANDOM_ARCHIVE' ? 50 : 30;
  let pageToken = '';

  // No modo aleatório, sorteia se busca na página 1, 2, 3 ou 4 do acervo
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

  const videoDetailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoIds.join(',')}&part=snippet,contentDetails,liveStreamingDetails`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const videoDetails = await videoDetailsRes.json<{ items?: Array<{ id: string; snippet: { title: string; publishedAt: string }; contentDetails: { duration: string }; liveStreamingDetails?: unknown }> }>();

  return (videoDetails.items || []).map(v => {
    const durationSeconds = parseDurationInSeconds(v.contentDetails?.duration);
    const isLive = !!v.liveStreamingDetails;
    const isShort = !isLive && durationSeconds > 0 && durationSeconds <= 60;
    const typeLabel = isLive ? '🔴 LIVE' : isShort ? '⚡ SHORT' : '🎬 VÍDEO LONGO';

    return {
      id: v.id,
      title: v.snippet.title,
      publishedAt: v.snippet.publishedAt.slice(0, 10),
      isLive,
      isShort,
      typeLabel,
      durationSeconds
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

REGRAS DE LINGUAGEM OBRIGATÓRIAS (RIGOR MÁXIMO):
1. PROIBIDO ESTRUTURAS CONTRASTIVAS RETÓRICAS ("não é X, é Y", "not merely X but Y", "não apenas X—Y", "longe de ser X, trata-se de Y"). Se algo tem duas dimensões, nomeie ambas diretamente sem andaimes de negação.
2. PROIBIDO TRAVESSÕES (— ou –). Substitua qualquer pontuação de travessão por vírgulas, dois-pontos ou parênteses.
3. USO MANDATÓRIO DE ETIMOLOGIA GRECO-LATINA: Trace conexões com as raízes linguísticas greco-latinas dos conceitos tratados (ex: carreira do latim carraria; experiência do latim experientia, ex + periri; técnica do grego techne; disciplina do latim disciplina; problema do grego pro + ballein; escola do grego schole; mercado do latim mercatus; trabalho do latim tripalium; contrato do latim contractus; valor do latim valere).
4. PROIBIDO TOM MOTIVACIONAL, COACH, CORPORATIVO OU SYCOPHANTIC: Responda direto com densidade analítica e profundidade histórica.
5. CITAÇÕES E RELATOS REAIS: Inclua citações fiéis às falas de Robson Cassiano e preserve os casos reais mencionados na transmissão.

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
canonicalUrl: "https://eu.robsoncassiano.software/artigos/slug-otimizado-em-kebab-case"
preSoldTarget: "mentoria"
---

# Título Principal do Ensaio

[Desenvolvimento textual com subtítulos h2, tópicos analíticos, diagramas textuais em caixas ASCII e conclusão sólida.]`;

  let markdown = '';
  let lastAiError = '';

  // 1. Motor Primário: Google Gemini 3.6 Flash (AI Studio)
  if (env.GEMINI_API_KEY) {
    try {
      const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192
          }
        })
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json<{ candidates?: Array<{ content: { parts: Array<{ text: string }> } }> }>();
        markdown = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        const errText = await aiRes.text();
        lastAiError = `Gemini 3.6 Flash Error: ${errText}`;
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

  markdown = markdown.replace(/^```(?:markdown)?\r?\n/, '').replace(/\r?\n```$/, '').trim();

  const slugMatch = markdown.match(/slug:\s*["']?([^\r\n"']+)["']?/i);
  const rawSlug = slugMatch ? slugMatch[1] : video.title;
  const slug = rawSlug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 60).replace(/^-|-$/g, '');

  const titleMatch = markdown.match(/title:\s*["']([^"']+)["']/i);
  const title = titleMatch ? titleMatch[1] : video.title;

  return { title, slug, markdown };
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

export async function processAutomatedPublishing(env: Env, mode: PublishMode = 'AUTO'): Promise<{ success: boolean; message: string; slug?: string; commitSha?: string; selectedType?: string }> {
  const accessToken = await getGoogleAccessToken(env);
  const videos = await fetchChannelVideos(accessToken, mode);

  if (videos.length === 0) {
    return { success: false, message: 'Nenhum vídeo encontrado no canal.' };
  }

  const existingSlugs = await fetchExistingArticleSlugs(env);

  let selectedVideo: YouTubeVideoItem | undefined;

  if (mode === 'LATEST_LIVE') {
    // Modo Segunda-feira: Prioridade estrita para a Live mais recente não publicada
    selectedVideo = videos.find(v => v.isLive && !existingSlugs.some(s => s.includes(v.id) || s.includes(v.title.slice(0, 15))));
  } else if (mode === 'RANDOM_ARCHIVE') {
    // Modo Sexta-feira: Sorteio aleatório de qualquer live ou vídeo longo não publicado do acervo
    const unindexed = videos.filter(v => !v.isShort && !existingSlugs.some(s => s.includes(v.id) || s.includes(v.title.slice(0, 15))));
    if (unindexed.length > 0) {
      selectedVideo = unindexed[Math.floor(Math.random() * unindexed.length)];
    }
  } else {
    // Modo Automático padrão
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

  return {
    success: true,
    message: `Ensaio '${essay.title}' publicado com sucesso! [Modo: ${mode}] Commit acionado no repositório.`,
    slug: essay.slug,
    commitSha,
    selectedType: selectedVideo.typeLabel
  };
}

export default {
  // Disparos agendados 100% autônomos na Cloudflare
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    let mode: PublishMode = 'AUTO';

    // 1. Segunda-feira às 15:00 UTC (12:00 BRT): Live mais recente
    if (event.cron === '0 15 * * 1') {
      mode = 'LATEST_LIVE';
    } 
    // 2. Sexta-feira às 15:00 UTC (12:00 BRT): Conteúdo aleatório do acervo
    else if (event.cron === '0 15 * * 5') {
      mode = 'RANDOM_ARCHIVE';
    }

    ctx.waitUntil(processAutomatedPublishing(env, mode));
  },

  // Disparo manual via HTTP seguro
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const authHeader = request.headers.get('Authorization');

    if (env.CRON_SECRET && authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/generate-custom' && request.method === 'POST') {
      try {
        const body = await request.json<{ prompt: string }>();
        const endpoint = 'gemini-3.6-flash';
        const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${endpoint}:generateContent?key=${env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: body.prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 8192
            }
          })
        });

        if (!aiRes.ok) {
          const errText = await aiRes.text();
          return new Response(JSON.stringify({ error: errText }), { status: aiRes.status, headers: { 'Content-Type': 'application/json' } });
        }

        const aiData = await aiRes.json<{ candidates?: Array<{ content: { parts: Array<{ text: string }> } }> }>();
        const markdown = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return new Response(JSON.stringify({ success: true, markdown }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || err }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // Suporta forçar modos via query param: ?mode=latest-live ou ?mode=random-archive
    const modeParam = url.searchParams.get('mode');
    let mode: PublishMode = 'AUTO';
    if (modeParam === 'latest-live') mode = 'LATEST_LIVE';
    if (modeParam === 'random-archive') mode = 'RANDOM_ARCHIVE';

    try {
      const result = await processAutomatedPublishing(env, mode);
      return new Response(JSON.stringify(result, null, 2), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || err }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
