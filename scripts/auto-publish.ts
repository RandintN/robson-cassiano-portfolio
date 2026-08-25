import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const BASE_DIR = path.resolve(import.meta.dirname, '..');
const CREDENTIALS_PATH = path.join(BASE_DIR, 'scripts', 'client_secrets.json');
const TOKEN_PATH = path.join(BASE_DIR, 'scripts', 'token.json');
const ARTICLES_JSON = path.join(BASE_DIR, 'src', 'assets', 'content', 'articles.json');
const ARTICLES_DIR = path.join(BASE_DIR, 'content', 'articles');

interface PublishedArticle {
  slug: string;
  title: string;
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

async function getAuthClient() {
  if (!fs.existsSync(CREDENTIALS_PATH) || !fs.existsSync(TOKEN_PATH)) {
    console.error('[!] Credenciais ou Token não encontrados. Execute "bun run yt:transcript" primeiro para autenticar.');
    process.exit(1);
  }

  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8')).installed;
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));

  const oauth2Client = new google.auth.OAuth2(creds.client_id, creds.client_secret);
  oauth2Client.setCredentials(token);
  return oauth2Client;
}

async function main() {
  console.log('============================================================');
  console.log('🤖 AUTO-PUBLISHER SOBERANO (LOCAL CLI & EDGE SIMULATOR)');
  console.log('============================================================\n');

  const auth = await getAuthClient();
  const youtube = google.youtube({ version: 'v3', auth });

  const channelRes = await youtube.channels.list({ mine: true, part: ['contentDetails', 'snippet'] });
  const uploadsId = channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsId) {
    console.error('[!] Playlist de uploads não encontrada.');
    return;
  }

  const playlistRes = await youtube.playlistItems.list({
    playlistId: uploadsId,
    part: ['snippet'],
    maxResults: 20
  });

  const videoIds = (playlistRes.data.items || []).map(i => i.snippet?.resourceId?.videoId!).filter(Boolean);

  const videoDetailsRes = await youtube.videos.list({
    id: videoIds,
    part: ['snippet', 'contentDetails', 'liveStreamingDetails']
  });

  const existingArticles: PublishedArticle[] = fs.existsSync(ARTICLES_JSON)
    ? JSON.parse(fs.readFileSync(ARTICLES_JSON, 'utf-8'))
    : [];

  const existingTitles = existingArticles.map(a => a.title.toLowerCase());
  const existingSlugs = existingArticles.map(a => a.slug.toLowerCase());

  const videos = (videoDetailsRes.data.items || []).map(v => {
    const durationSeconds = parseDurationInSeconds(v.contentDetails?.duration || '');
    const isLive = !!v.liveStreamingDetails;
    const isShort = !isLive && durationSeconds > 0 && durationSeconds <= 60;
    const typeLabel = isLive ? '🔴 LIVE' : isShort ? '⚡ SHORT' : '🎬 VÍDEO LONGO';

    const cleanTitle = (v.snippet?.title || '').toLowerCase();
    const isPublished = existingTitles.some(t => t.includes(cleanTitle.slice(0, 20))) ||
                        existingSlugs.some(s => cleanTitle.includes(s.slice(0, 15)));

    return {
      id: v.id!,
      title: v.snippet?.title || 'Sem Título',
      date: v.snippet?.publishedAt?.slice(0, 10) || '',
      isLive,
      isShort,
      typeLabel,
      durationSeconds,
      isPublished
    };
  });

  console.log('--- STATUS DOS CONTEÚDOS DO CANAL ---');
  videos.forEach((v, idx) => {
    const status = v.isPublished ? '✅ JÁ PUBLICADO' : '⏳ PENDENTE';
    console.log(`[${idx + 1}] [${v.typeLabel}] [${status}] ${v.title}`);
  });

  // 1. Tentar encontrar Live nova não publicada
  let selected = videos.find(v => v.isLive && !v.isPublished);

  // 2. Se não houver Live nova, buscar vídeo longo ou live passada não publicada
  if (!selected) {
    const pendingLong = videos.filter(v => !v.isShort && !v.isPublished);
    if (pendingLong.length > 0) {
      selected = pendingLong[Math.floor(Math.random() * pendingLong.length)];
    }
  }

  if (!selected) {
    console.log('\n[✓] Todos os conteúdos recentes já possuem artigos publicados!');
    return;
  }

  console.log(`\n🎯 Conteúdo Selecionado para Novo Ensaio: [${selected.typeLabel}] [${selected.id}] ${selected.title}`);
  console.log('[*] Baixando legenda oficial...');

  const captionsRes = await youtube.captions.list({ videoId: selected.id, part: ['snippet'] });
  const items = captionsRes.data.items || [];

  if (items.length === 0) {
    console.log(`[!] Nenhuma legenda disponível para o vídeo ${selected.id}.`);
    return;
  }

  const selectedCap = items.find(c => c.snippet?.language?.startsWith('pt')) || items[0];
  const downloadRes = await youtube.captions.download({ id: selectedCap.id!, tfmt: 'srt' }, { responseType: 'text' });
  const transcript = cleanSrtToText(String(downloadRes.data));

  console.log(`[✓] Transcrição baixada com sucesso (${transcript.length} caracteres).`);
  console.log(`\n[i] Para gerar o ensaio completo e publicar, use a skill "Publicar Artigo" ou acione o Worker em nuvem.`);
}

main().catch(console.error);
