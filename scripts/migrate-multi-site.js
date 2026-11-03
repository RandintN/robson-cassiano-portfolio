/**
 * Migração aditiva para o modelo multi-site.
 *
 * `schema.sql` só tem `CREATE TABLE IF NOT EXISTS`, então aplicá-lo não altera a
 * tabela `subscribers` de um banco existente. Esta migração adiciona apenas o que
 * falta, nunca remove nem recria: nenhuma linha é perdida.
 *
 * Uso (a partir do diretório do worker, que carrega o estado local/produção):
 *   bun scripts/migrate-multi-site.js --local
 *   bun scripts/migrate-multi-site.js --remote
 *
 * Idempotente: rodar de novo não repete `ALTER` já aplicado.
 */
import { $ } from 'bun';
import path from 'node:path';

const DB = process.env.D1_DATABASE || 'robson-cassiano-portfolio-db';
const mode = process.argv.includes('--remote') ? '--remote' : '--local';

/** Colunas novas em `subscribers`, com o default que preserva o comportamento atual. */
const COLUMNS = [
  ['first_source', "TEXT DEFAULT ''"],
  ['last_source', "TEXT DEFAULT ''"],
  ['site_id', 'INTEGER'],
  ['sequence_enabled', 'INTEGER NOT NULL DEFAULT 1'],
];

async function run(sql) {
  const out = await $`bunx wrangler d1 execute ${DB} ${mode} --json --command ${sql}`.quiet().text();
  const trimmed = out.trim();
  if (!trimmed.startsWith('[')) return [];
  try {
    const parsed = JSON.parse(trimmed);
    return parsed[0]?.results ?? [];
  } catch {
    return [];
  }
}

const existing = new Set((await run('PRAGMA table_info(subscribers)')).map((row) => row.name));
if (existing.size === 0) {
  console.error('Tabela `subscribers` não encontrada. Aplique o schema.sql antes.');
  process.exit(1);
}

let applied = 0;
for (const [name, definition] of COLUMNS) {
  if (existing.has(name)) {
    console.log(`= ${name} já existe`);
    continue;
  }
  await run(`ALTER TABLE subscribers ADD COLUMN ${name} ${definition}`);
  console.log(`+ ${name}`);
  applied += 1;
}

await run(`
  CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    origins TEXT NOT NULL,
    turnstile_sitekey TEXT NOT NULL DEFAULT '',
    turnstile_action TEXT NOT NULL DEFAULT 'subscribe',
    tags TEXT NOT NULL DEFAULT '',
    sequence_enabled INTEGER NOT NULL DEFAULT 1,
    from_name TEXT NOT NULL DEFAULT '',
    from_email TEXT NOT NULL DEFAULT '',
    reply_to TEXT NOT NULL DEFAULT '',
    ebook_url_pt TEXT NOT NULL DEFAULT '',
    ebook_url_en TEXT NOT NULL DEFAULT '',
    welcome_headline_pt TEXT NOT NULL DEFAULT '',
    welcome_headline_en TEXT NOT NULL DEFAULT '',
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

await run(`CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug)`);
await run(`CREATE INDEX IF NOT EXISTS idx_subscribers_seq_enabled ON subscribers(sequence_enabled, sequence_status, sequence_step)`);
await run(`CREATE INDEX IF NOT EXISTS idx_subscribers_first_source ON subscribers(first_source)`);

const seed = await Bun.file(path.resolve(import.meta.dir, '..', 'schema.sql')).text();
const seedBlock = seed.slice(seed.indexOf('INSERT OR IGNORE INTO sites'), seed.indexOf(';', seed.indexOf('INSERT OR IGNORE INTO sites')) + 1);
if (seedBlock) {
  await run(seedBlock);
  console.log('+ sites semeados a partir do schema.sql');
}

// Backfill só onde falta: preserva o rótulo histórico de `source` (slug de página)
// em vez de inventar um tenant que não existia na época.
const backfilled = await run(`
  UPDATE subscribers
     SET first_source = source, last_source = source
   WHERE COALESCE(source, '') != ''
     AND COALESCE(first_source, '') = ''
     AND COALESCE(last_source, '') = ''
  RETURNING id
`);
console.log(`~ ${backfilled.length} linha(s) com origem histórica preenchida`);

const total = await run('SELECT COUNT(*) AS total FROM subscribers');
console.log(`\nLinhas preservadas: ${total[0]?.total ?? '?'}  |  colunas aplicadas agora: ${applied}`);
console.log('Migração concluída. Aplique o schema em produção antes de deployar o worker.');
