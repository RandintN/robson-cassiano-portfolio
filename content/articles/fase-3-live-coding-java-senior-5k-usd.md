---
title: "Live Coding Java Sênior: Anatomia da Fase 3 de US$ 5.2k"
slug: "fase-3-live-coding-java-senior-5k-usd"
date: "2024-08-29"
author: "Robson Cassiano"
updated: "2026-09-12"
category: "Carreira & Engenharia"
readTime: "9 min de leitura"
tags: ["Live Coding", "Java", "Spring Boot", "Carreira Internacional", "Algoritmos"]
youtubeVideoId: "3-5A4cZZ-6I"
videoDuration: "PT1H3M8S"
summary: "Gravei e analisei uma Fase 3 técnica em inglês para vaga sênior de US$ 5.2k: palíndromo, think aloud, virtual threads, Spring Security e testes."
coverImage: "assets/images/robson-cassiano-mentor.jpg"
canonicalUrl: "https://eu.robsoncassiano.software/artigos/fase-3-live-coding-java-senior-5k-usd/"
preSoldTarget: "mentoria"
---

# Fase 3 Técnica Internacional: Anatomia do Live Coding e da Sabatina Java Sênior de US$ 5.2k

A avaliação técnica sênior para posições remotas no exterior combina dois exames complementares: resolver um problema algorítmico ao vivo, com a tela compartilhada, e sustentar uma sabatina conceitual sobre decisões de arquitetura. Gravei e analisei a íntegra de uma dessas sessões, de uma contratação internacional de **US$ 5.200 mensais** (cerca de R$ 28.500 na cotação da época), e documento aqui o que aconteceu em cada etapa.

O material é útil porque mostra o que se cobra de fato, e não o que se imagina que será cobrado.

## Etapa 1: o desafio algorítmico e o raciocínio em voz alta

O problema clássico apresentado foi encontrar a maior substring palíndroma. *Palíndromo* vem do grego *palin* (de novo, para trás) e *dromos* (percurso), designando sequências cuja leitura se preserva nos dois sentidos.

A abordagem de força bruta examina todas as substrings possíveis, com custo O(n³). A técnica aplicada foi a expansão ao redor do centro: percorrer cada posição como centro potencial, avaliando centros ímpares (um caractere) e pares (dois caracteres iguais contíguos). Isso reduz a complexidade de tempo para O(n²) e mantém o espaço auxiliar em O(1).

```
       Centro Ímpar (pivô único)        Centro Par (pivô duplo)
              <- [a] ->                       <- [b] [b] ->
          r   a   c   e   c   a   r           a   b   b   a
```

Mais importante que o resultado foi o processo de **think aloud**, pensar em voz alta em inglês. Antes de digitar, validei os limites do problema, expliquei a estratégia e justifiquei as condições de contorno. Durante o laço, expliquei formalmente a lógica de expansão e demonstrei que o consumo de memória permanecia constante. O entrevistador quer testemunhar o raciocínio, não apenas o código final.

### A variação súbita de requisito

Imediatamente após os testes passarem, o avaliador mudou o enunciado: em vez da maior substring palíndroma, pediu a menor. Essa intervenção testa estabilidade emocional e flexibilidade sob observação direta. A resposta madura identifica que qualquer caractere isolado é um palíndromo trivial de tamanho unitário e ajusta a lógica com clareza conceitual.

## Etapa 2: a sabatina de fundamentos de Java

A segunda parte foi uma sequência de perguntas conceituais sobre a linguagem e o ecossistema. O roteiro real é mais previsível do que parece.

### Optional, interfaces funcionais e streams

`Optional<T>` modela a presença ou ausência de uma referência no nível do sistema de tipos, prevenindo falhas de `NullPointerException` em retornos de métodos. Uma **interface funcional** declara exatamente um método abstrato único (SAM) e serve de base para expressões lambda. `Predicate<T>` recebe um argumento e retorna booleano, sendo amplamente usado em `Stream.filter`. Referências a métodos, como `String::isEmpty`, são sintaxe compacta para lambdas que apenas repassam parâmetros.

```
Lambda:              (String s) -> s.isEmpty()
Referência a método: String::isEmpty
Tipo funcional alvo: Predicate<String>
```

### Virtual threads e concorrência no Java 21

*Concorrência* vem do latim *concurrere* (correr em conjunto). No modelo tradicional, cada thread da aplicação mapeia uma thread nativa do sistema operacional, com custo de pilha em torno de 1 MB, o que limita a escala em operações de I/O bloqueantes. As **virtual threads** do Java 21 são gerenciadas pela própria JVM e compartilham um conjunto enxuto de carrier threads, viabilizando centenas de milhares de threads para microsserviços com alto volume de I/O.

### Inversão de controle, injeção de dependência e segurança

A inversão de controle desloca do código de negócio para o contêiner do framework a responsabilidade de instanciar e gerenciar dependências. A injeção de dependência é a técnica concreta: as colaborações são providas externamente, o que desacopla arquitetura e permite substituir serviços por mocks em testes.

Em Spring Security, a sabatina cobriu:

1. **Autenticação stateless** com JSON Web Tokens e cabeçalho `Authorization: Bearer`.
2. **Sanitização e validação** com Bean Validation (`@Valid`, `@NotNull`, `@Size`) em DTOs de entrada.
3. **Controle de acesso por perfis (RBAC)** com anotações como `@PreAuthorize` e configuração da `SecurityFilterChain`.

### Pirâmide de testes e práticas de engenharia

*Técnica* vem do grego *techne* (habilidade produtiva fundada em princípios). Na prática: testes unitários com JUnit 5 e Mockito para validação rápida de domínio, testes de integração com Testcontainers para instanciar bancos reais, paginação orientada a cursor para coleções grandes e versionamento explícito de API via URI ou cabeçalho.

## O que separa aprovação de rejeição

A gravação completa mostra que a aprovação decorreu de uma combinação, e não de um único fator:

- **Previsibilidade metodológica:** mais de 80% das perguntas seguem roteiros mapeáveis. Entrar despreparado para concorrência, índices de banco e trade-offs de microsserviços é imprudência.
- **Velocidade e estrutura da resposta:** respostas rápidas e organizadas sinalizam experiência real de produção. Pausas longas sugerem que o candidato está inventando um cenário na hora.
- **Postura consultiva:** em nenhum momento a sessão virou interrogatório escolar. Foi uma conversa entre pares, com hipóteses debatidas e decisões justificadas.
- **Correção de rota em voz alta:** quando um deslize lógico apareceu, corrigi o rumo verbalizando o erro, o que preservou o restante da avaliação.

## Conclusão

A entrevista técnica internacional não é um teste de memória. É uma avaliação de como você pensa sob pressão, comunica decisões e sustenta escolhas de arquitetura em inglês. O código que compila é a linha de base. O que aprova é a clareza com que você explica por que ele existe daquela forma.

---

**Sobre o autor.** Robson Cassiano é engenheiro de software sênior com quase uma década de atuação em backend Java e Kotlin. Passou por processos seletivos internacionais de nível sênior em inglês e documenta, em primeira mão, a anatomia dessas avaliações. A entrevista analisada neste ensaio é uma sessão real gravada por ele.
