import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.readonly'
];

const BASE_DIR = path.resolve(import.meta.dirname, '..');
const CREDENTIALS_PATH = path.join(BASE_DIR, 'scripts', 'client_secrets.json');
const TOKEN_PATH = path.join(BASE_DIR, 'scripts', 'token.json');
const OUTPUT_DIR = path.join(BASE_DIR, 'content', 'transcripts');

interface ClientSecrets {
  installed?: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
  web?: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
}

function getCredentials(): { client_id: string; client_secret: string } {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`\n[!] Arquivo de credenciais não encontrado: ${CREDENTIALS_PATH}`);
    process.exit(1);
  }

  const content: ClientSecrets = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const config = content.installed || content.web;

  if (!config) {
    console.error('\n[!] Formato inválido no client_secrets.json.');
    process.exit(1);
  }

  return {
    client_id: config.client_id,
    client_secret: config.client_secret
  };
}

async function authenticate(): Promise<InstanceType<typeof google.auth.OAuth2>> {
  const { client_id, client_secret } = getCredentials();

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
    oauth2Client.setCredentials(token);

    // Salva automaticamente o novo access_token quando for renovado nos bastidores
    oauth2Client.on('tokens', (updatedTokens) => {
      const merged = { ...token, ...updatedTokens };
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2), 'utf-8');
    });

    return oauth2Client;
  }

  return new Promise((resolve, reject) => {
    const server = http.createServer();

    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as AddressInfo;
      const port = address.port;
      const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;

      const oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirectUri
      );

      server.on('request', async (req, res) => {
        try {
          if (!req.url || !req.url.startsWith('/oauth2callback')) {
            res.writeHead(404);
            res.end('Not Found');
            return;
          }

          const urlObj = new URL(req.url, `http://127.0.0.1:${port}`);
          const code = urlObj.searchParams.get('code');

          if (!code) {
            res.writeHead(400);
            res.end('Código de autorização não encontrado.');
            return;
          }

          const { tokens } = await oauth2Client.getToken(code);
          oauth2Client.setCredentials(tokens);

          fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), 'utf-8');
          console.log(`\n[✓] Autenticação concluída! Token salvo em ${TOKEN_PATH}`);

          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #16a34a;">Autenticação Concluída com Sucesso!</h1>
              <p>O token do YouTube foi salvo. Você já pode fechar esta aba e retornar ao terminal.</p>
            </div>
          `);

          server.close(() => resolve(oauth2Client));
        } catch (err) {
          res.writeHead(500);
          res.end('Erro ao processar token.');
          server.close(() => reject(err));
        }
      });

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
      });

      console.log('\n============================================================');
      console.log('AUTORIZAÇÃO OAUTH 2.0 DO YOUTUBE (BUN / TYPESCRIPT)');
      console.log('============================================================');
      console.log('\nAbrindo navegador para autorização. Caso não abra automaticamente, acesse a URL abaixo:');
      console.log(`\n${authUrl}\n`);

      const openCmd = process.platform === 'win32'
        ? `start "" "${authUrl}"`
        : process.platform === 'darwin'
        ? `open "${authUrl}"`
        : `xdg-open "${authUrl}"`;

      import('node:child_process').then(cp => cp.exec(openCmd));
    });
  });
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

async function main() {
  const auth = await authenticate();
  const youtube = google.youtube({ version: 'v3', auth });

  console.log('\n[+] Consultando dados do canal...');
  const channelRes = await youtube.channels.list({
    mine: true,
    part: ['snippet', 'contentDetails']
  });

  const channel = channelRes.data.items?.[0];
  if (!channel) {
    console.error('[!] Nenhum canal encontrado para a conta autenticada.');
    return;
  }

  console.log(`[✓] Canal Conectado: ${channel.snippet?.title}`);
  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    console.error('[!] Playlist de uploads não encontrada.');
    return;
  }

  console.log('[+] Listando os 10 vídeos mais recentes...');
  const playlistRes = await youtube.playlistItems.list({
    playlistId: uploadsPlaylistId,
    part: ['snippet'],
    maxResults: 10
  });

  const items = playlistRes.data.items || [];
  if (items.length === 0) {
    console.log('[!] Nenhum vídeo encontrado na playlist de uploads.');
    return;
  }

  console.log('\n--- VÍDEOS ENCONTRADOS NO SEU CANAL ---');
  items.forEach((item, idx) => {
    const title = item.snippet?.title;
    const videoId = item.snippet?.resourceId?.videoId;
    const date = item.snippet?.publishedAt?.slice(0, 10);
    console.log(`[${idx + 1}] ID: ${videoId} | Data: ${date} | Título: ${title}`);
  });

  const targetVideoId = process.argv[2] || items[1]?.snippet?.resourceId?.videoId || items[0]?.snippet?.resourceId?.videoId;
  const targetItem = items.find(i => i.snippet?.resourceId?.videoId === targetVideoId) || items[0];
  const videoId = targetItem.snippet?.resourceId?.videoId!;
  const videoTitle = targetItem.snippet?.title || 'Vídeo';

  console.log(`\n[*] Buscando legendas oficiais do vídeo: [${videoId}] ${videoTitle}...`);

  const captionsRes = await youtube.captions.list({
    videoId: videoId,
    part: ['snippet']
  });

  const captionList = captionsRes.data.items || [];
  if (captionList.length === 0) {
    console.log(`[!] Nenhuma faixa de legenda encontrada para o vídeo ${videoId}.`);
    return;
  }

  const selectedCaption = captionList.find(c => c.snippet?.language?.startsWith('pt')) || captionList[0];
  const captionId = selectedCaption.id!;
  const lang = selectedCaption.snippet?.language || 'pt';

  console.log(`[+] Baixando faixa de legenda ID: ${captionId} (Idioma: ${lang})...`);

  // Download somente-leitura
  const downloadRes = await youtube.captions.download({
    id: captionId,
    tfmt: 'srt'
  }, {
    responseType: 'text'
  });

  const rawSrt = String(downloadRes.data);
  const cleanTranscript = cleanSrtToText(rawSrt);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const cleanSlug = videoTitle
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
    .replace(/^-|-$/g, '');

  const outputPath = path.join(OUTPUT_DIR, `${videoId}_${cleanSlug}.txt`);

  const filePayload = `Título: ${videoTitle}\nVídeo ID: ${videoId}\nURL: https://www.youtube.com/watch?v=${videoId}\nIdioma: ${lang}\nData de Extração: ${new Date().toISOString()}\n\n${cleanTranscript}`;

  fs.writeFileSync(outputPath, filePayload, 'utf-8');

  console.log(`\n============================================================`);
  console.log(`✓ TRANSCRIÇÃO EXTRAÍDA E SALVA COM SUCESSO!`);
  console.log(`Arquivo: ${outputPath}`);
  console.log(`Total de Caracteres: ${cleanTranscript.length}`);
  console.log(`============================================================\n`);
}

main().catch(err => {
  console.error('\n[X] Erro na execução:', err.message || err);
  process.exit(1);
});
