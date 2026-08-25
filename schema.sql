-- Cloudflare D1 Database Schema para Robson Cassiano Portfolio & CMS

-- Tabela de Inscritos na Newsletter / Lista Soberana
CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT '',
    status TEXT DEFAULT 'active', -- 'active', 'unsubscribed', 'bounced'
    source TEXT DEFAULT 'portfolio', -- 'portfolio_home', 'article_cta', 'lead_magnet'
    tags TEXT DEFAULT 'general',
    ip_country TEXT DEFAULT '',
    sequence_step INTEGER DEFAULT 0, -- 0 = Boas-vindas, 1 a 7 = Dias da Sequência de Vídeos
    sequence_status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed'
    last_sequence_sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at DATETIME
);

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

-- Índices para consultas rápidas na borda
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_seq ON subscribers(sequence_status, sequence_step);
CREATE INDEX IF NOT EXISTS idx_newsletters_slug ON newsletters_sent(article_slug);
CREATE INDEX IF NOT EXISTS idx_sequence_logs_email ON sequence_logs(email);

