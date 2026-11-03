const TRUSTED_ORIGINS = new Set([
  'https://eu.robsoncassiano.software',
  'https://robsoncassiano.software',
]);

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * crypto.subtle.timingSafeEqual é extensão da Cloudflare, não faz parte do padrão
 * WebCrypto. Fora da borda (Bun, Node) a chamada explode, então a comparação cai
 * para um XOR de tempo constante local em vez de lançar.
 */
export async function isTimingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);

  if (bufA.byteLength !== bufB.byteLength) {
    return false;
  }

  const subtle = crypto.subtle as SubtleCrypto & {
    timingSafeEqual?: (a: Uint8Array, b: Uint8Array) => boolean;
  };

  if (typeof subtle.timingSafeEqual === 'function') {
    return subtle.timingSafeEqual(bufA, bufB);
  }

  let diff = 0;
  for (let i = 0; i < bufA.byteLength; i += 1) {
    diff |= bufA[i] ^ bufB[i];
  }
  return diff === 0;
}

/**
 * Uma única origem de segredo para assinar e verificar.
 *
 * Antes havia três fallbacks diferentes: a geração usava
 * 'default-fallback-secret-for-tokens', os chamadores passavam 'secret-token-key' e
 * a verificação pulava a checagem quando não havia segredo. O resultado era token
 * decorativo: sem ADMIN_SECRET nada era validado.
 */
// Const, não função: index.ts faz `export *`, e o runtime de Workers só aceita
// função ou ExportedHandler entre os named exports do módulo de entrada.
const TOKEN_SECRET_FALLBACK = 'secret-token-key';

export function resolveTokenSecret(env: { ADMIN_SECRET?: string; CRON_SECRET?: string }): string {
  return env.ADMIN_SECRET || env.CRON_SECRET || TOKEN_SECRET_FALLBACK;
}

export async function generateUnsubscribeToken(email: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret || TOKEN_SECRET_FALLBACK),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(email.toLowerCase().trim())
  );

  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

export async function verifyUnsubscribeToken(email: string, token: string, secret: string): Promise<boolean> {
  if (!token || !email) return false;
  const expected = await generateUnsubscribeToken(email, secret);
  return isTimingSafeEqual(token, expected);
}

export function getSecurityCorsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('Origin') || '';
  const allowOrigin = TRUSTED_ORIGINS.has(origin) ? origin : 'https://eu.robsoncassiano.software';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, List-Unsubscribe-Post',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}
