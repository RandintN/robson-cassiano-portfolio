---
title: "O Sistema do Joinha no ATS: Como os Entrevistadores Eliminam Candidatos nos Bastidores"
slug: "o-sistema-do-joinha-no-ats"
date: "2026-11-03"
author: "Robson Cassiano"
category: "Carreira & Engenharia"
readTime: "8 min de leitura"
tags: ["ATS", "Entrevistas Técnicas", "Carreira Internacional", "Recrutamento"]
youtubeVideoId: "5RtqWmJfMUU"
summary: "Entenda a mecânica binária dos sistemas ATS e como os critérios de desempate técnico determinam a sua eliminação em processos seletivos internacionais."
coverImage: "assets/images/robson-cassiano-mentor.jpg"
canonicalUrl: "https://eu.robsoncassiano.software/artigos/o-sistema-do-joinha-no-ats/"
preSoldTarget: "mentoria"
---

# O Sistema do Joinha no ATS: Como os Entrevistadores Eliminam Candidatos nos Bastidores

Quando você entra numa sala para fazer uma entrevista técnica, existe uma interface rodando na segunda tela do entrevistador que você provavelmente nunca viu. É o painel do ATS (Applicant Tracking System), como o Greenhouse, o Lever ou o Ashby.

Ali dentro existe um botão simplório chamado "Add Evaluation". Quando o entrevistador clica nessa opção, ele se depara com um mecanismo binário idêntico ao do Coliseu romano: um joinha para cima ou um joinha para baixo.

Como eu mencionei na live:

> "Tá vendo esse add evaluation aqui? Quando eu clico nele, eu posso fazer tipo o imperador César. Eu posso dar um joinha para cima ou um joinha para baixo. Se for um joinha para cima, a pessoa recebeu uma avaliação positiva. Se for um joinha para baixo, vai ser negativo. Dependendo dos critérios da empresa, se tiver um negativo, a pessoa já não passa para a frente."

Essa mecânica expõe a frieza procedural dos processos seletivos em empresas de tecnologia pelo mundo. A palavra decisão vem do latim *decidere*, que significa literalmente "cortar fora" (*de* + *caedere*). No fim da sua entrevista de código ou de arquitetura, o que acontece ali é um corte sumário fundamentado em parâmetros prévios de avaliação.

```
+-------------------------------------------------------------+
|             PAINEL INTERNO DO AVALIADOR (ATS)               |
+-------------------------------------------------------------+
| Candidato: Engenheiro Fullstack / Backend                   |
| Etapa: Technical Screen (Fase 2)                            |
+-------------------------------------------------------------+
| Critério: Resolução de Algoritmos   [+] Strong Yes          |
| Critério: Comunicação e Trade-offs  [-] Strong No           |
| Decisão Final (Veto Power):         [-] THUMBS DOWN         |
+-------------------------------------------------------------+
| STATUS: CANDIDATO ARQUIVADO / REJEIÇÃO AUTOMATIZADA         |
+-------------------------------------------------------------+
```

## A Dinâmica dos Dois Avaliadores e o Princípio do Veto

Na maioria das empresas internacionais maduras, a fase técnica (geralmente a etapa dois do pipeline) coloca dois engenheiros na chamada para avaliar um único candidato. Esses desenvolvedores se voluntariaram ou foram escalados para a escala semanal de entrevistas. 

A palavra critério tem raiz no grego *kriterion*, que se refere ao "instrumento para julgar". Se a política da empresa adotar a regra do consenso estrito, a presença de uma única avaliação negativa encerra a sua candidatura ali mesmo.

```
       [ Candidato ]
             |
      +------+------+
      |             |
      v             v
[Dev Senior 1]  [Dev Senior 2]
      |             |
   (Joinha +)    (Joinha -)
      |             |
      +------+------+
             |
             v
     [ VETO ATIVADO ] -> Rejeição no ATS
```

Quando um dos dois avaliadores aperta o botão de negativo, o sistema aciona a flag de rejeição. Não existe debate prolongado nem mesa redonda para tentar salvar o seu currículo. O mercado, termo derivado do latim *mercatus*, opera pela redução de risco. Para a empresa, aprovar alguém duvidoso custa muito mais caro do que reprovar um bom profissional por engano.

## A Arquitetura da Decisão Técnica

A palavra técnica descende do grego *techne*, que abrange tanto a perícia prática quanto a arte de produzir algo com eficácia. Quando esses dois desenvolvedores entram na sala com você, eles estão observando aspectos bem definidos em uma matriz de competências:

1. A clareza da sua comunicação. Comunicação vem do latim *communicare*, que significa "tornar comum", "compartilhar". Se você resolve o problema em silêncio e não torna o seu raciocínio inteligível para a dupla, o seu código perde relevância.
2. A postura diante de correções de rota. Quando um dos engenheiros aponta uma falha de lógica na sua implementação, ele quer avaliar a sua capacidade de absorver parâmetros novos sem teimosia improdutiva.
3. O domínio dos fundamentos. O conhecimento superficial de bibliotecas modernas não sustenta uma conversa de arquitetura profunda quando os limites de memória ou latência entram em pauta.

Um único descompasso em qualquer um desses três eixos faz um dos entrevistadores abrir a aba lateral do sistema e marcar a opção negativa. O voto dele funciona como uma porta lógica AND: ambos precisam dizer sim para que a sua pontuação autorize o avanço de fase.

## O Que Muda na Sua Preparação Prática

Saber que o sistema opera por eliminação binária altera completamente o modo como você conduz a entrevista:

* **Gerencie os dois ouvintes de forma homogênea:** Se você focar apenas no engenheiro mais falante e ignorar o desenvolvedor silencioso que está anotando tudo no canto da tela, esse segundo profissional será exatamente o responsável pelo joinha invertido no sistema. Dirija o olhar, as perguntas e as checagens de entendimento a ambos.
* **Torne o seu processo analítico transparente:** Aborde o problema (do grego *proballein*, "lançar à frente", "obstáculo colocado diante de si") decompondo premissas antes de digitar a primeira linha de código. Pergunte sobre restrições de escala e volume de dados. Isso demonstra disciplina, palavra herdada do latim *disciplina*, ligada ao aprendizado e à ordem do método.
* **Elimine pontos cegos com perguntas de alinhamento:** Ao concluir uma função ou uma proposta de modelagem de dados, pergunte diretamente aos avaliadores se a solução atende aos critérios esperados para aquele trecho ou se eles preferem explorar outro caminho de otimização.

O painel do ATS continuará sendo implacável e reducionista por design. O seu papel na chamada técnica é conduzir a sessão de forma estruturada para garantir que os dois avaliadores preencham o formulário com o mesmo parecer favorável ao final dos sessenta minutos.