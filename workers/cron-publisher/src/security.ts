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

export async function isTimingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);

  if (bufA.byteLength !== bufB.byteLength) {
    return false;
  }

  return crypto.subtle.timingSafeEqual(bufA, bufB);
}

export async function generateUnsubscribeToken(email: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret || 'default-fallback-secret-for-tokens');
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
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
