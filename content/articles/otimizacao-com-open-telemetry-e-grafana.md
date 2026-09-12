---
title: "OpenTelemetry e Grafana: Caching e Status 202 na Prática"
slug: "otimizacao-com-open-telemetry-e-grafana"
date: "2025-08-30"
author: "Robson Cassiano"
updated: "2026-09-12"
category: "Carreira & Engenharia"
readTime: "7 min de leitura"
tags: ["OpenTelemetry", "Grafana", "Observabilidade", "Spring Boot", "Kotlin"]
youtubeVideoId: "h1W5z1HxrP4"
videoDuration: "PT7M41S"
summary: "Demonstração prática de OpenTelemetry e Grafana em backend Kotlin com Spring: tracing, caching seletivo e 110 mil linhas com resposta 202 Accepted."
coverImage: "assets/images/robson-cassiano-mentor.jpg"
canonicalUrl: "https://eu.robsoncassiano.software/artigos/otimizacao-com-open-telemetry-e-grafana/"
preSoldTarget: "mentoria"
---

# OpenTelemetry e Grafana na Prática: Caching, Processamento Assíncrono e o Status 202

Observabilidade não é um painel bonito. É a capacidade de responder, em produção, a uma pergunta específica: onde exatamente este sistema está perdendo tempo? Para responder a isso, abri o código de um backend real que construí, escrito em Kotlin com Spring, e mostrei na prática como OpenTelemetry, Prometheus e Grafana se conectam para tornar esse diagnóstico possível.

Este ensaio documenta essa demonstração, com os números e as decisões de engenharia que apareceram na tela.

## Como as peças se conectam

Três ferramentas formam a base da stack. O **OpenTelemetry** funciona como camada de instrumentação: coleta métricas, traces e logs de forma padronizada. O **Prometheus** atua como meio de campo, armazenando séries temporais. O **Grafana** é a camada de visualização, onde os dados viram painéis.

A conexão no Grafana acontece por um conceito simples, o **data source** (fonte de dados). O data source pode apontar para o OpenTelemetry, para o Prometheus ou até para um banco de dados relacional. Uma vez configurada a fonte, os painéis passam a ler dali.

Essa separação importa porque define o fluxo: a instrumentação produz, o coletor armazena, o Grafana apresenta. Trocar qualquer peça da cadeia é uma decisão local, não uma reescrita do sistema.

## O erro mais comum: cachear todo GET

No backend de demonstração, havia um cache de cinco minutos aplicado sobre chamadas externas que vinham sendo feitas por um client HTTP. Esse padrão é comum e frequentemente mal aplicado.

O raciocínio correto não é "cacheie todos os GET". É cachear chamadas externas cujo dado é estável e cuja leitura é frequente. A orientação que dei durante a sessão:

> "Se o dado muda muito, pense bem, mesmo sendo um GET. Agora, se o dado é estável e você não precisa dele quente com frequência, o caching vai melhorar muito o desempenho."

A regra prática tem duas variáveis: volatilidade do dado e frequência de leitura. Dado volátil com cache longo gera informação incorreta. Dado estável e quente sem cache gera custo e latência desnecessários. O cache não é um interruptor global, é uma decisão por endpoint.

## Processamento assíncrono: o caso do arquivo de 110 mil linhas

O coração da demonstração foi um fluxo real de upload. Quando o usuário faz login por magic link, o sistema associa um token ao CNPJ daquele fornecedor. Ao subir um arquivo de estoque, o backend processa as linhas e vincula os produtos ao fornecedor correto.

O problema aparece no volume. Havia um arquivo real com cerca de 110.000 linhas. Depois de otimizações, o processamento estava levando entre 5 e 10 minutos para esse volume.

Processar isso de forma síncrona travaria a requisição e impediria o próximo upload. A solução foi tornar o processamento assíncrono. A API recebe o arquivo, aceita a requisição e responde imediatamente com o status **202 Accepted**.

O código 202 tem um significado específico e frequentemente ignorado: a requisição foi recebida, mas ainda não foi processada. Ele é a resposta correta para operações de longa duração em que outro processo assumirá o trabalho e a confirmação virá depois. Com isso, o backend responde na hora, e N usuários podem subir arquivos simultaneamente sem bloquear uns aos outros.

```
[Upload do arquivo] --> [Validação] --> [202 Accepted]  (resposta imediata)
                                          |
                                          v
                          [Processamento assíncrono em background]
                                          |
                                          v
                          [Atualização de status do fornecedor]
```

Essa decisão é tanto de performance quanto de experiência. O usuário não espera dez minutos olhando para uma tela travada, e a infraestrutura não acumula conexões abertas.

## Por que isso importa para quem está começando

Existe uma tentação de tratar observabilidade como um assunto avançado, reservado a equipes grandes. A demonstração mostra o contrário: as mesmas decisões aparecem em um sistema pequeno.

Cachear corretamente, escolher o status HTTP adequado e isolar processamento pesado são fundamentos que se aplicam a qualquer escala. As ferramentas mudam de nome, mas o raciocínio é o mesmo. E é exatamente esse raciocínio que se cobra em entrevistas técnicas de nível sênior, como discuti na análise da sabatina de arquitetura.

## Conclusão

OpenTelemetry e Grafana não são um exercício de vaidade visual. São o mecanismo que transforma um sistema opaco em um sistema diagnosticável. Combinados com decisões corretas de caching e processamento assíncrono, permitem que um backend responda rápido mesmo quando o trabalho real é pesado.

A pergunta que a stack de observabilidade deve responder, sempre, é uma só: quando algo ficar lento, você saberá dizer onde? Se a resposta for não, o painel é decoração.

---

**Sobre o autor.** Robson Cassiano é engenheiro de software sênior especializado em backend Java e Kotlin, com mais de dez anos de experiência em sistemas corporativos de alta disponibilidade. Construiu e operou pipelines de observabilidade com OpenTelemetry, Prometheus e Grafana em produção. O código demonstrado neste ensaio é um backend real, escrito por ele para um produto próprio.
