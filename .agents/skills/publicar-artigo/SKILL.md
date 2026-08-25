---
name: publicar-artigo
description: >-
  Obtém a live ou vídeo mais recente do canal @RobsonCassianoSoftware no YouTube via API oficial (Bun/TypeScript),
  extrai a transcrição completa e converte o conteúdo em um ensaio/artigo técnico aprofundado para o blog soberano,
  gerando páginas estáticas SSG e atualizando o sitemap com Schema.org.
---

# Skill: Publicar Artigo a Partir de Live do YouTube

Esta skill automatiza o fluxo completo de ingestão da última transmissão do canal de Robson Cassiano, redação de ensaio técnico estruturado sob regras linguísticas estritas, sincronização com o CMS Markdown e pré-renderização estática (SSG) no Cloudflare Pages.

---

## 🛑 REGRAS DE LINGUAGEM OBRIGATÓRIAS (SEM EXCEÇÃO)

1. **Proibido estruturas contrastivas retóricas:**
   - Proibido usar construções como "não é X, é Y", "not merely X but Y", "não apenas X—Y", "longe de ser X, trata-se de Y".
   - Se um conceito possui duas dimensões ou facetas, nomeie ambas diretamente sem andaimes de negação.
2. **Proibido travessões (`—` ou `–`):**
   - Substitua qualquer pontuação de travessão por vírgulas, dois-pontos ou parênteses quando estritamente necessário.
3. **Uso Mandatório de Etimologia:**
   - Trace conexões com as raízes linguísticas greco-latinas dos conceitos tratados (ex: *problema* do grego *pro* + *ballein*, lançar para frente; *escala* do latim *scala*, escada; *trabalho* do latim *tripalium*; *salário* do latim *salarium*; *subordinação* do latim *sub* + *ordinare*; *contrato* do latim *contractus*, puxar junto; *valor* do latim *valere*, ter força/saúde).
4. **Proibido tom motivacional, coach, corporativo ou sycophantic:**
   - Elimine qualquer introdução bajuladora ("Great question", "I'd be happy to help", "Absolutely", "Com certeza"). Responda direto ao cerne da questão.
5. **Proibido metalinguagem e referências a diretrizes:**
   - Proibido reiterar que está seguindo diretrizes ou citar arquivos de contexto. A execução deve ser direta e autoevidente.

---

## 🔄 PROCEDIMENTO OPERACIONAL PADRÃO

### Passo 1: Extrair a Transcrição da Live Mais Recente
Execute o comando TypeScript com Bun:
```bash
bun run yt:transcript
```
*O script utiliza o token OAuth oficial em `scripts/token.json`, conecta à YouTube Data API v3, identifica a transmissão mais recente e salva a transcrição limpa em `content/transcripts/{videoId}_{slug}.txt`.*

Caso queira especificar um vídeo por ID:
```bash
bun run yt:transcript <VIDEO_ID>
```

### Passo 2: Leitura e Mapeamento da Transcrição
1. Leia o arquivo salvo em `content/transcripts/`.
2. Mapeie:
   - Teses centrais defendidas por Robson Cassiano.
   - Citações textuais e relatos práticos da live.
   - Casos reais (ex: contratos na gringa, remuneração em USD/EUR, estratégias de engenharia e negociação).
   - Objeções e respostas dadas às perguntas da audiência.

### Passo 3: Redação do Artigo Markdown (`content/articles/{slug}.md`)
Crie o arquivo em `content/articles/{slug}.md` utilizando o frontmatter padrão:

```markdown
---
title: "Título Analítico e Preciso"
slug: "slug-amigavel-e-otimizado"
date: "AAAA-MM-DD"
author: "Robson Cassiano"
category: "Carreira & Engenharia"
readTime: "X min de leitura"
tags: ["Tag1", "Tag2", "Tag3"]
summary: "Resumo objetivo e persuasivo para meta tags e SEO."
coverImage: "assets/images/robson-cassiano-mentor.jpg"
canonicalUrl: "https://eu.robsoncassiano.software/artigos/slug-amigavel-e-otimizado"
preSoldTarget: "mentoria"
---

# Título Principal do Ensaio

[Desenvolvimento textual rigoroso, sem travessões, sem andaimes contrastivos, com etimologia e citações textuais da fala de Robson Cassiano.]
```

### Passo 4: Sincronização, Geração Estática (SSG) e Deploy
Após salvar o arquivo `.md`, execute a esteira automatizada:
```bash
bun run build
```
Isso aciona automaticamente:
1. `scripts/sync-content.js`: Atualiza `src/assets/content/articles.json` e `sitemap.xml`.
2. `ng build`: Compila a SPA Angular com Signals e rotas otimizadas.
3. `scripts/generate-static-articles.js`: Cria `dist/artigos/{slug}/index.html` com Schema.org JSON-LD (`BlogPosting`), meta tags OpenGraph e semântica pura para o Googlebot.

Para enviar para produção na Cloudflare Pages:
```bash
bun run pages:deploy
```

### Passo 5: Verificação de Publicação
Confirme que a nova página HTML existe em `dist/artigos/{slug}/index.html` e que a URL correspondente consta em `dist/sitemap.xml`.
