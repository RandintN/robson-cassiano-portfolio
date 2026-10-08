---
title: "Por Que Recrutadores Não Olham Seu GitHub na Triagem Inicial"
slug: "por-que-recrutadores-nao-olham-github"
date: "2026-10-02"
author: "Robson Cassiano"
category: "Carreira & Engenharia"
readTime: "8 min de leitura"
tags: ["Carreira Dev", "LinkedIn", "Recrutamento Técnico", "Engenharia de Software"]
youtubeVideoId: "sDNJeB6oPOI"
summary: "Entenda por que enviar repositórios para recrutadores na primeira fase sabota seus processos seletivos e como alinhar seu perfil aos filtros reais."
coverImage: "assets/images/robson-cassiano-mentor.jpg"
canonicalUrl: "https://eu.robsoncassiano.software/artigos/por-que-recrutadores-nao-olham-github/"
preSoldTarget: "mentoria"
---

# Por Que Recrutadores Não Olham Seu GitHub na Triagem Inicial

Eu conversei com um desenvolvedor no ano passado que estava indignado porque não conseguia passar da fase inicial em nenhum processo seletivo. Ele me mostrou o currículo, me mostrou o perfil do LinkedIn e me disse que os recrutadores ignoravam a qualidade técnica dos projetos dele. Quando eu bati o olho naquilo, a causa ficou evidente na hora. Ele colocou o link do GitHub, o site pessoal, mas o headline e o resumo estavam completamente descalibrados. O algoritmo da plataforma tratava o texto dele como spam e a triagem humana simplesmente descartava a candidatura em segundos.

A palavra carreira vem do latim *carraria*, que indicava uma estrada para carretas, um caminho com trilhos definidos no chão de terra batida. Se você sai do trilho estabelecido pela mecânica da contratação, você quebra a roda da carroça. O erro desse programador foi achar que o recrutador da fase um tem tempo ou capacidade técnica para ler commits, inspecionar branches e julgar arquitetura de código.

```
+-----------------------------------------------------------------------+
|                       FLUXO REAL DE CONTRATAÇÃO                       |
+-----------------------------------------------------------------------+
|                                                                       |
|  FASE 1: TRIAGEM INICIAL                                              |
|  Ator: Recrutador de RH / Filtro ATS                                  |
|  Foco: Palavras-chave coerentes, headline limpo, tempo de experiência |
|  GitHub analisado aqui? NÃO.                                          |
|                                                                       |
|                               v                                       |
|                                                                       |
|  FASE 2: ENTREVISTA TÉCNICA                                           |
|  Ator: Engenheiro Sênior / Tech Lead                                  |
|  Foco: Arquitetura, qualidade do código, trade-offs, decisões          |
|  GitHub analisado aqui? SIM.                                          |
|                                                                       |
+-----------------------------------------------------------------------+
```

## A Barreira da Primeira Fase e a Origem do Problema

A palavra problema vem do grego *problema*, derivado de *pro* (à frente) e *ballein* (lançar). É um obstáculo colocado fisicamente diante dos seus pés. Na contratação moderna, o primeiro obstáculo colocado diante de você nunca é o código. É o profissional de recursos humanos.

Como eu disse na transmissão ao vivo:

> "Ele não consegue entender que a pessoa que vai fazer a primeira fase da entrevista, que é a fase um, ela não entende nada de código, ela não sabe nem o que é o GitHub, na maioria das vezes. Então é inútil você falar do seu GitHub antes da hora pra pessoa errada."

O profissional de triagem recebe duzentos a quinhentos currículos por vaga. Ele busca termos específicos solicitados pelos gestores da equipe. Se a vaga pede Java e Spring Boot, ele rastreia esses termos. Ele não clica no link do seu repositório para avaliar se você aplicou boas práticas de orientação a objetos ou se sua suíte de testes unitários tem alta cobertura. Apresentar repositórios de código para quem avalia aderência textual é perda de esforço e distrai o avaliador daquilo que realmente decide o avanço: clareza na descrição de responsabilidades.

## O Spam Algorítmico no Headline

O LinkedIn funciona sobre um motor de busca e indexação contínua. Quando você abre o campo de headline (o título profissional abaixo do seu nome) e despeja quinze tecnologias sem qualquer coerência, o algoritmo pune o seu perfil.

Na análise que fiz em tela durante a live, o colega acumulou:

* Golang
* Java
* React
* JavaScript
* Git
* Docker
* Kubernetes

A palavra decisão vem do latim *decidere*, junção de *de* (fora) e *caedere* (cortar). Decidir exige cortar o que sobra. Golang e Java pertencem a ecossistemas totalmente distintos, com filosofias de concorrência e design de memória que operam em polos opostos. React e JavaScript formam outro contexto de atuação no frontend. Docker e Kubernetes pertencem ao universo de DevOps, e embora DevOps perpasse grande parte da engenharia, colocar todas essas frentes espremidas na mesma linha demonstra falta de foco.

Para o algoritmo do LinkedIn, misturar dezenas de termos incompatíveis no headline atua como tática de manipulação de busca, frequentemente rotulada como spam de palavras-chave. Para o recrutador humano, gera a impressão de alguém generalista demais que não domina profundamente nenhuma das tecnologias listadas.

```
+--------------------------------------------------------------------+
|                ANÁLISE DE COMPATIBILIDADE NO HEADLINE              |
+--------------------------------------------------------------------+
|  [Golang]       -> Foco em concorrência leve, microserviços        |
|  [Java]         -> Ecossistema corporativo enterprise, JVM         |
|  [React]        -> Interface com o usuário, client-side, browsers  |
|                                                                    |
|  DIAGNÓSTICO: Conflito semântico severo para o motor de busca.     |
|  RESULTADO: O perfil perde relevância orgânica e é descartado.    |
+--------------------------------------------------------------------+
```

## O Campo "Sobre" e a Indexação do Perfil

A seção de resumo (o "About" do LinkedIn) é o segundo pilar onde vi o desenvolvedor errar feio. O texto dele continha parágrafos longos, cheios de floreios sobre paixão por programar, mas com apenas três palavras-chave indexáveis ao longo de quatro blocos de texto.

A comunicação vem do latim *communicare*, derivado de *communis* (tornar comum, repartir). Você não está escrevendo um diário pessoal; você está disponibilizando termos comuns ao setor para que a base de dados encontre o seu perfil quando um contratante digitar uma busca booleana. O algoritmo varre o campo "Sobre" buscando a frequência e o contexto das competências. Se o texto carece das palavras técnicas adequadas, sua pontuação de relevância despenca.

O mercado vem do latim *mercatus*, o local físico de comércio e troca de bens. O mercado de tecnologia compra capacidade de resolução de problemas específicos através de ferramentas específicas. Se o seu perfil não expõe essas ferramentas de forma legível para quem não programa, o valor do seu trabalho permanece invisível. O valor vem do latim *valere*, que significa ter força, ser eficaz. A força da sua experiência só opera depois que você vence a triagem inicial.

## Quando o GitHub Realmente Funciona

O portfólio de código possui utilidade real, mas no momento certo do fluxo seletivo. Ele serve para a fase dois em diante, quando você se senta para conversar com quem realmente entende de arquitetura de software, como um engenheiro sênior, um tech lead ou o próprio gestor de engenharia.

```
+-------------------------------------------------------------------+
|               MOMENTO CORRETO PARA CADA ELEMENTO                  |
+-------------------------------------------------------------------+
|  RECRUTADOR / RH (Fase 1):                                        |
|  - Título objetivo e sem excessos                                 |
|  - Histórico de entregas com tecnologias bem distribuídas         |
|  - Descrição limpa no "Sobre" com densidade de termos técnicos    |
|                                                                   |
|  ENGENHEIRO / TECH LEAD (Fase 2):                                 |
|  - Repositórios com commits atômicos                              |
|  - Código limpo, testes automatizados e modelagem de domínio      |
|  - Trade-offs técnicos discutidos na entrevista ao vivo           |
+-------------------------------------------------------------------+
```

A técnica vem do grego *techne*, que abrange a perícia manual, a arte prática e o conhecimento de um ofício. Quem avalia sua *techne* é outro engenheiro. O recrutador avalia conformidade de perfil, aderência ao orçamento da vaga e comunicação clara.

Para garantir que o seu perfil avance nos processos:

1. Limpe o headline do seu LinkedIn. Escolha a sua stack primária e remova linguagens que você apenas arranhou a superfície ou que pertencem a mundos completamente desconectados da sua busca atual.
2. Reescreva a seção "Sobre" focando em tecnologias reais, bancos de dados, padrões de mensageria e métodos de trabalho que você aplicou na prática.
3. Reserve os links de projetos e repositórios para o momento em que a conversa migrar para o time técnico.

Quem compreende as etapas do processo e respeita os limites de cada interlocutor para de perder tempo em candidaturas silenciosas e passa a receber convites reais para entrevistas técnicas.