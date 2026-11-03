-- Cloudflare D1 Database Schema para Robson Cassiano Portfolio & CMS

-- Catálogo de sites autorizados a usar a API de captura.
-- Fonte de verdade da identidade do tenant: a origem do request é casada aqui, o
-- cliente só declara apresentação. Adicionar site = inserir linha, sem deploy.
CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    origins TEXT NOT NULL, -- JSON array de origens exatas ("https://exemplo.com")
    turnstile_sitekey TEXT NOT NULL DEFAULT '',
    turnstile_action TEXT NOT NULL DEFAULT 'subscribe',
    tags TEXT NOT NULL DEFAULT '', -- tags aplicadas ao lead, separadas por vírgula
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
);

-- Tabela de Inscritos na Newsletter / Lista Soberana
CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    status TEXT DEFAULT 'active', -- 'active', 'unsubscribed', 'bounced'
    source TEXT DEFAULT 'portfolio', -- primeiro site de origem (slug do tenant)
    first_source TEXT DEFAULT '', -- primeiro toque, nunca sobrescrito
    last_source TEXT DEFAULT '', -- toque mais recente
    site_id INTEGER, -- tenant da última captura
    tags TEXT DEFAULT 'general',
    ip_country TEXT DEFAULT '',
    sequence_step INTEGER DEFAULT 0, -- 0 = Boas-vindas, 1 a 7 = Dias da Sequência de Vídeos
    sequence_status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed', 'unsubscribed'
    sequence_enabled INTEGER NOT NULL DEFAULT 1, -- 0 = site sem sequência de 7 dias
    last_sequence_sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at DATETIME
);

-- Sites em produção. As origens listadas são as únicas aceitas quando
-- ENFORCE_ORIGINS=true.
INSERT OR IGNORE INTO sites
    (slug, origins, tags, sequence_enabled, from_name, from_email, turnstile_sitekey, turnstile_action, ebook_url_pt, ebook_url_en)
VALUES
    ('portfolio',
     '["https://eu.robsoncassiano.software","https://robsoncassiano.software","https://*.robson-cassiano-portfolio.pages.dev"]',
     'portfolio', 1, 'Robson Cassiano', 'contato@robsoncassiano.software',
     '0x4AAAAAAEjUfJwT3yG_vHIF', 'subscribe',
     'https://robsoncassiano.software/7-passos-simples-dev-na-gringa',
     'https://robsoncassiano.software/7-steps-remote-dev'),
    ('treinamento',
     '["https://treinamento.robsoncassiano.software","https://*.treinamento-descomplica-dev-na-gringa.pages.dev"]',
     'treinamento', 1, 'Robson Cassiano', 'contato@robsoncassiano.software',
     '0x4AAAAAAEjUfJwT3yG_vHIF', 'subscribe',
     'https://robsoncassiano.software/7-passos-simples-dev-na-gringa',
     'https://robsoncassiano.software/7-steps-remote-dev');


-- Tabela de Histórico de Disparos de Newsletters / Broadcasts
CREATE TABLE IF NOT EXISTS newsletters_sent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_slug TEXT NOT NULL,
    subject TEXT NOT NULL,
    sent_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'sent',
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Logs da Sequência Cadenciada de 7 Dias (Drip Campaign)
CREATE TABLE IF NOT EXISTS sequence_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscriber_id INTEGER,
    email TEXT NOT NULL,
    step INTEGER NOT NULL, -- 1 a 7
    video_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'sent',
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(subscriber_id) REFERENCES subscribers(id)
);

-- Tabela de Controle de Locks de Disparo Concorrente
CREATE TABLE IF NOT EXISTS sequence_dispatch_locks (
    lock_key TEXT PRIMARY KEY,
    locked_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas rápidas e garantia de unicidade na borda
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_seq ON subscribers(sequence_status, sequence_step);
CREATE INDEX IF NOT EXISTS idx_newsletters_slug ON newsletters_sent(article_slug);
CREATE INDEX IF NOT EXISTS idx_sequence_logs_email ON sequence_logs(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sequence_logs_sub_step ON sequence_logs(subscriber_id, step);
CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug);
CREATE INDEX IF NOT EXISTS idx_subscribers_seq_enabled ON subscribers(sequence_enabled, sequence_status, sequence_step);
CREATE INDEX IF NOT EXISTS idx_subscribers_first_source ON subscribers(first_source);


