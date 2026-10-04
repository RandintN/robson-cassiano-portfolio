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

function resolveCredentials(): { client_id: string; client_secret: string } {
  const envClientId = process.env.YOUTUBE_CLIENT_ID;
  const envClientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (envClientId && envClientSecret) {
    return { client_id: envClientId, client_secret: envClientSecret };
  }

  if (fs.existsSync(CREDENTIALS_PATH)) {
    const content: ClientSecrets = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const config = content.installed || content.web;
    if (config?.client_id && config?.client_secret) {
      return { client_id: config.client_id, client_secret: config.client_secret };
    }
  }

  console.error('\nCredenciais não encontradas.');
  console.error('Forneça via scripts/client_secrets.json ou passe via argumentos:');
  console.error('bun run scripts/renew-youtube-token.ts <CLIENT_ID> <CLIENT_SECRET>\n');
  process.exit(1);
}

async function main() {
  const argClientId = process.argv[2];
  const argClientSecret = process.argv[3];

  let client_id = argClientId;
  let client_secret = argClientSecret;

  if (!client_id || !client_secret) {
    const resolved = resolveCredentials();
    client_id = resolved.client_id;
    client_secret = resolved.client_secret;
  }

  const port = 8080;
  const redirectUri = `http://localhost:${port}/oauth2callback`;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirectUri
  );

  const server = http.createServer();

  server.listen(port, '0.0.0.0', () => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });

    console.log('\n============================================================');
    console.log('RENOVAÇÃO DE REFRESH TOKEN OAUTH 2.0 (MODO PRODUÇÃO)');
    console.log('============================================================');
    console.log(`Redirect URI: ${redirectUri}`);
    console.log('\nAcesse o link abaixo no seu navegador se não abrir automaticamente:');
    console.log(`\n${authUrl}\n`);
    console.log('Aguardando autorização via callback...');

    import('node:child_process').then(cp => {
      cp.exec(`xdg-open "${authUrl}" 2>/dev/null`);
    });
  });

  server.on('request', async (req, res) => {
    try {
      if (!req.url || (!req.url.startsWith('/oauth2callback') && !req.url.includes('code='))) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const urlObj = new URL(req.url, `http://localhost:${port}`);
      const code = urlObj.searchParams.get('code');

      if (!code) {
        res.writeHead(400);
        res.end('Código de autorização não encontrado na URL de retorno.');
        return;
      }

      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), 'utf-8');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #16a34a;">Autorização Concluída com Sucesso!</h1>
          <p>O novo Refresh Token permanente foi capturado. Retorne ao terminal.</p>
        </div>
      `);

      console.log('\n============================================================');
      console.log('NOVO REFRESH TOKEN OBTIDO COM SUCESSO:');
      console.log('============================================================');
      console.log(`Refresh Token: ${tokens.refresh_token}`);
      console.log(`Arquivo salvo em: ${TOKEN_PATH}`);
      console.log('============================================================\n');

      server.close(() => process.exit(0));
    } catch (err: any) {
      res.writeHead(500);
      res.end('Erro ao processar token.');
      console.error('\nErro ao trocar o código por token:', err?.message || err);
      server.close(() => process.exit(1));
    }
  });
}

main().catch(err => {
  console.error('\nErro inesperado:', err);
  process.exit(1);
});
