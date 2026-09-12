---
title: "O Mercado Real de Engenharia de Software em 14 Anos"
slug: "mercado-real-engenharia-software-clecius-martinkoski"
date: "2023-10-12"
author: "Robson Cassiano"
updated: "2026-09-12"
category: "Carreira & Engenharia"
readTime: "10 min de leitura"
tags: ["Engenharia de Software", "Fundamentos", "Carreira Tech", "Clécius Martinkoski", "DDD"]
youtubeVideoId: "PAERGtw-0mk"
videoDuration: "PT56M"
summary: "Conversa com Clécius Martinkoski sobre o abismo entre a academia e a produção, a migração de um sistema de 2011 e o que sustenta a relevância profissional."
coverImage: "assets/images/robson-cassiano-mentor.jpg"
canonicalUrl: "https://eu.robsoncassiano.software/artigos/mercado-real-engenharia-software-clecius-martinkoski/"
preSoldTarget: "mentoria"
---

# O Mercado Real de Engenharia de Software: Fundamentos, Choque Prático e a Longevidade da Carreira

Recebi Clécius Martinkoski, engenheiro de software com 14 anos de atuação, para uma conversa franca sobre o que o mercado realmente exige e o que a maioria dos cursos não ensina. O ponto de partida da trajetória dele é revelador: ele saiu de um emprego estável em manutenção de computadores, com salário razoável, para estagiar por uma remuneração irrisória na área de programação.

> "Eu saí de um emprego de manutenção de computadores com salário legal para ir estagiar por uma merreca na área de programação. Foi uma das melhores opções que eu tomei para entrar na área."

Este ensaio reúne o que discutimos: o choque entre a formação teórica e a produção, o papel dos fundamentos na longevidade da carreira e o que de fato sustenta um engenheiro ao longo das décadas.

## Da manutenção física à abstração do código

A entrada na indústria de software frequentemente ocorre por vias periféricas. Clécius começou na manutenção de hardware e de calculadoras mecânicas, um ambiente de diagnóstico manual de componentes físicos.

A transição para o software preservou a estrutura cognitiva de solução de problemas: formular hipóteses, isolar variáveis, validar empiricamente. Essa disciplina analítica é diretamente transferível para lidar com bases de código legadas, sem a necessidade de controle integral sobre o ambiente.

*Experiência* vem do latim *experientia*, de *ex* mais *periri*, a ação de provar pela prática. Não é o que se assiste em aula, é o que se valida no contato com a matéria.

## O choque entre a academia e a produção

A formação acadêmica tem origem no grego *schole*, o tempo livre destinado à contemplação intelectual. O ambiente universitário introduz o raciocínio lógico formal, o contato inicial com linguagens como C e a correção baseada em notas. O mercado opera com outros parâmetros.

O choque prático aparece quando o profissional ingressa e se depara com arquiteturas multicamadas, bibliotecas de terceiros, concorrência, restrições financeiras e requisitos que mudam. O código acadêmico é descartável. O código de produção permanece em manutenção por mais de uma década.

A superação desse abismo exige *techne*, a habilidade produtiva fundada em princípios demonstráveis. E ela não vem da grade curricular, vem da busca autônoma por padrões de projeto, infraestrutura e integração de sistemas.

## O caso real: um sistema de 2011 que sobreviveu 12 anos

O exemplo mais concreto que Clécius trouxe é o software de gestão e emissão fiscal da empresa dele, voltado a micro e pequenas empresas.

O sistema começou a ser desenvolvido em **2011** com as tecnologias da época: Java 7, JBoss e JSF no front-end. Doze anos depois, permanecia no ar, e foi migrado para **Kotlin com Quarkus**, rodando em containers, com front-end Angular.

O detalhe que torna a migração viável é arquitetural. A regra de negócio nunca esteve acoplada aos frameworks de infraestrutura ou de apresentação, porque o projeto foi pautado em **Domain-Driven Design**.

> "Toda a regra de negócio fica dentro do domínio da aplicação, e esse domínio não estava acoplado a nenhum dos frameworks legados. Durante a migração, foi apenas reescrever as fronteiras."

Java 7, JBoss e JSF tornaram-se obsoletos. A lógica de cálculo fiscal, emissão e tributação sobreviveu intacta, porque estava isolada do que muda. Esse é o argumento mais forte a favor de investir em fundamentos: as ferramentas têm prazo de validade curto, o domínio de negócio tem prazo de validade longo.

```
Arquitetura original (2011)      Arquitetura migrada (2023)
Java 7 / JBoss                   Kotlin / Quarkus
JSF                              Angular
        |                                |
        +-------- CAMADA INVARIANTE -----+
         Domínio de negócio isolado via DDD
```

## Soft skills: o software é uma construção social

Um software corporativo não é escrito por uma pessoa. É construído por equipes, consumido por usuários e sustentado por comunicação.

> "Toda a construção do software depende de uma estrutura social de comunicação, de entendimento e de empatia que muitas vezes é negligenciada, em favor do cara que sai codando que nem louco."

Código ilegível é, antes de tudo, um problema de comunicação. A clareza da escrita afeta diretamente o custo operacional das organizações, já que a maior parte do ciclo de vida de um software é dedicada à manutenção.

## Ciclos de mercado e o que sobra na retração

O mercado, do latim *mercatus*, opera em ciclos macroeconômicos. Clécius descreveu o extremo do pico de contratação durante a pandemia, quando uma vaga de júnior recebia mais de mil currículos.

> "No pico, a gente abria uma vaga de júnior e chegavam mil, dois mil currículos para os sócios validarem."

Nos picos de liquidez, a aceleração das contratações sugere que dominar ferramentas pontuais garante estabilidade. Nos momentos de retração, o mercado reavalia a eficiência das equipes e prioriza quem combina profundidade técnica com capacidade de articulação humana. Os fundamentos são a âncora que permanece quando a ferramenta da moda fica obsoleta.

## Currículo e entrevista: vender o que você tem

A conversa também cobriu a etapa de entrada no mercado. A orientação de Clécius é direta:

- **Não infle o currículo** com o que você não consegue comprovar. As consequências aparecem no processo seletivo.
- **Trabalhe os pontos fortes** e apresente material concreto do que você já fez.
- **A idade não precisa ser um demérito.** Você não precisa declarar a data de nascimento nem se apresentar como iniciante. Foque no que agrega.
- **A comunicação não verbal conta.** Confiança se transmite por postura. Se você tem acesso a uma câmera de qualidade, use.

E a régua para quem teme a barreira da comunicação é generosa: você não precisa se tornar um Shakespeare.

> "Não precisa chegar a um nível máximo de oratória. De zero a dez, se você saiu do dois, já é outro patamar."

## Conclusão

A trajetória de quem sobrevive décadas na engenharia de software não se apoia na ferramenta da vez. Apoia-se no diagnóstico estruturado, na capacidade de escrever código legível por humanos e na compreensão do valor de negócio. O engenheiro de alto nível atua como mediador entre a complexidade lógica das máquinas e as necessidades concretas das organizações. As tecnologias passam. Os fundamentos permanecem.

---

**Sobre o autor.** Robson Cassiano é engenheiro de software sênior, mentor de carreiras internacionais e fundador da Simple Software. Conduz conversas públicas com profissionais experientes sobre os fundamentos que sustentam carreiras longas na engenharia. Este ensaio deriva de uma transmissão ao vivo com Clécius Martinkoski, e as citações foram extraídas dela.
