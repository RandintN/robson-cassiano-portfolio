import fs from 'node:fs';
import path from 'node:path';

/**
 * Gera imagens Open Graph 1200x630 por artigo (JPG) em src/assets/images/og/.
 * Requer ImageMagick (magick). Execute APÓS `bun run sync` (lê articles.json).
 *
 *   bun run og:images
 */

const ARTICLES_JSON = path.resolve('src/assets/content/articles.json');
const OUT_DIR = path.resolve('src/assets/images/og');
const PROFILE = path.resolve('src/assets/images/Robson-Cassiano.webp');
const DOMAIN = 'eu.robsoncassiano.software';

const FONT_CANDIDATES = [
  '/usr/share/fonts/noto/NotoSans-Bold.ttf',
  '/usr/share/fonts/liberation/LiberationSans-Bold.ttf',
  '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
];
const REGULAR_CANDIDATES = [
  '/usr/share/fonts/noto/NotoSans-Regular.ttf',
  '/usr/share/fonts/liberation/LiberationSans-Regular.ttf',
  '/System/Library/Fonts/Supplemental/Arial.ttf',
];

const pickFont = (candidates) => candidates.find((f) => fs.existsSync(f));
const BOLD = pickFont(FONT_CANDIDATES);
const REGULAR = pickFont(REGULAR_CANDIDATES);

if (!BOLD || !REGULAR) {
  console.error('✗ Nenhuma fonte adequada encontrada para gerar as imagens OG.');
  process.exit(1);
}
if (!fs.existsSync(ARTICLES_JSON)) {
  console.error('✗ articles.json não encontrado. Rode `bun run sync` primeiro.');
  process.exit(1);
}

const run = (args) => {
  const res = Bun.spawnSync(['magick', ...args], { stdout: 'pipe', stderr: 'pipe' });
  if (res.exitCode !== 0) {
    throw new Error(`magick falhou: ${res.stderr.toString()}`);
  }
};

const articles = await Bun.file(ARTICLES_JSON).json();
fs.mkdirSync(OUT_DIR, { recursive: true });

let generated = 0;
for (const art of articles) {
  const titleTmp = path.join(OUT_DIR, `.${art.slug}-title.png`);
  const output = path.join(OUT_DIR, `${art.slug}.jpg`);
  const category = (art.category || '').toUpperCase();

  // 1. Renderiza o título com quebra de linha automática
  run([
    '-background', 'none',
    '-fill', '#ffffff',
    '-font', BOLD,
    '-pointsize', '48',
    '-size', '700x360',
    `caption:${art.title}`,
    titleTmp,
  ]);

  // 2. Compõe o card final
  run([
    '-size', '1200x630', 'xc:#08080a',
    '-fill', '#dfb15b', '-draw', 'rectangle 0,0 14,630',
    '-font', BOLD,
    '-gravity', 'northwest',
    '-fill', '#dfb15b', '-pointsize', '26', '-annotate', '+70+74', category,
    titleTmp, '-gravity', 'northwest', '-geometry', '+70+130', '-composite',
    '(', PROFILE, '-resize', '300x300^', '-gravity', 'center', '-extent', '300x300', ')',
    '-gravity', 'southeast', '-geometry', '+70+80', '-composite',
    '-font', REGULAR,
    '-gravity', 'southwest',
    '-fill', '#8a8a95', '-pointsize', '24', '-annotate', '+70+74', DOMAIN,
    '-quality', '84',
    output,
  ]);

  fs.rmSync(titleTmp, { force: true });
  generated++;
  console.log(`✓ OG image: ${path.relative(process.cwd(), output)}`);
}

console.log(`✓ ${generated} imagens Open Graph (1200x630) geradas em src/assets/images/og/`);
