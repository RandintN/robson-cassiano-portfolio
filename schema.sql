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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at DATETIME
);

-- Tabela de Histórico de Disparos de Newsletters
CREATE TABLE IF NOT EXISTS newsletters_sent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_slug TEXT NOT NULL,
    subject TEXT NOT NULL,
    sent_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'sent',
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas rápidas na borda
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_slug ON newsletters_sent(article_slug);
