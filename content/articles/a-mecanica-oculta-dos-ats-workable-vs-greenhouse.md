---
title: "ATS na Prática: Workable vs Greenhouse e o Seu Currículo"
slug: "a-mecanica-oculta-dos-ats-workable-vs-greenhouse"
date: "2025-09-10"
author: "Robson Cassiano"
updated: "2026-09-12"
category: "Carreira & Engenharia"
readTime: "8 min de leitura"
tags: ["ATS", "Workable", "Greenhouse", "Recrutamento", "Carreira Tech"]
youtubeVideoId: "sGUASE0odeI"
videoDuration: "PT5M55S"
summary: "Testei o Workable na prática e comparei com o Greenhouse: parser de currículo, preços e o mito do Canva que elimina candidatos antes da entrevista."
coverImage: "assets/images/robson-cassiano-mentor.jpg"
canonicalUrl: "https://eu.robsoncassiano.software/artigos/a-mecanica-oculta-dos-ats-workable-vs-greenhouse/"
preSoldTarget: "mentoria"
---

# A Mecânica Oculta dos ATS: o que Workable e Greenhouse Realmente Fazem com o Seu Currículo

Já usei plataformas de ATS no meu trabalho como engenheiro, do lado do recrutador, e contratei uma delas com o meu próprio CNPJ para poder mostrar aqui, sem violar nenhum acordo de confidencialidade, como a ferramenta realmente funciona. Este ensaio nasce dessa sessão prática: abri a conta da minha empresa, populei o sistema com dados fictícios e naveguei pela mesma interface que um recrutador usa todos os dias.

O ponto de partida é uma assimetria de informação. Quase todo conteúdo sobre ATS é escrito do ponto de vista do candidato, e a visão do recrutador é raríssima de se encontrar. Este é um esforço para corrigir essa lacuna.

## A visão do recrutador quase não existe na internet

A maior parte dos profissionais observa o processo seletivo pela perspectiva de quem envia o currículo, sem nunca ter visto a engrenagem do outro lado da mesa. Quando procurei material sobre a visão do recrutador, encontrei muito pouco.

> "O meu objetivo é mostrar esse outro lado para que vocês possam melhorar o seu jogo e não cair em papo furado, não cair em ideias que não têm base na realidade."

Foi por isso que reproduzi o experimento. Populei a plataforma com dados simulados gerados pela própria ferramenta, o chamado *generate sample data*, que insere registros fictícios no banco para permitir a exploração da interface sem expor dados reais de clientes.

> "Eu já usei essa plataforma no meu trabalho. Só que, por motivos óbvios, não posso mostrar as coisas do trabalho aqui. Então eu contratei a ferramenta para mim mesmo."

## Workable e Greenhouse: a comparação de mercado

No ecossistema corporativo, as ferramentas de recrutamento se dividem em faixas operacionais distintas, e a diferença de preço revela o público-alvo.

O **Workable** posiciona-se no mercado intermediário e exibe preços publicamente. O plano inicial custa cerca de US$ 360 por mês e inclui distribuição automática da vaga para múltiplos canais, como LinkedIn e Glassdoor, a partir de um único cadastro. O plano completo adiciona recursos de multilinguagem e módulos de contratação.

O **Greenhouse** é o líder entre grandes corporações. A precificação não aparece na página pública. Esse é um sinal de mercado deliberado: quando uma empresa esconde o preço atrás de formulários de demonstração, o custo de implantação exige negociação de vendas, o que caracteriza o segmento enterprise.

| Métrica | Workable | Greenhouse |
| :--- | :--- | :--- |
| Público-alvo | Médias empresas e scale-ups | Grandes corporações |
| Transparência de preço | Pública (a partir de ~US$ 360/mês) | Oculta (só via demonstração) |
| Distribuição de vagas | Multicanais automáticos no plano base | Rede extensa via integrações enterprise |
| Posição de mercado | Alternativa acessível | Líder de mercado |

A leitura prática: o ATS que você enfrenta numa scale-up provavelmente é o Workable. Numa multinacional, é o Greenhouse ou equivalente. O comportamento do parser e a lógica do funil, no entanto, são semelhantes em ambos.

## O mito do Canva e como o parser realmente funciona

Existe uma crença recorrente entre candidatos de que sistemas de ATS não conseguem ler currículos feitos em ferramentas visuais como o Canva. Essa afirmação não tem base técnica.

> "Eu já ouvi dizer que o ATS não consegue entender um currículo feito no Canva. Isso não faz o menor sentido."

O que determina a leitura é a **camada de texto do PDF**, não a ferramenta que o gerou. Se a biblioteca de parsing consegue extrair texto selecionável do documento, o sistema processa as informações e popula o banco do recrutador normalmente. A ferramenta de edição é irrelevante.

O problema real aparece quando a exportação produz um PDF puramente rasterizado, ou seja, uma imagem sem camada de texto. Nesse caso, nenhum ATS consegue extrair dados, independentemente de o layout ser simples ou elaborado. A regra prática é objetiva: antes de enviar, abra o PDF e confirme que o texto pode ser selecionado com o cursor. Se puder, o parser lê.

## As quatro fases do funil de seleção

Dentro da interface do recrutador, as candidaturas são organizadas em estágios sequenciais, movidas entre colunas no formato Kanban. A maioria dos processos de engenharia segue quatro fases:

1. **Sourcing e candidatura:** entrada do dado no sistema, via formulário ou via busca ativa de perfis.
2. **Triagem inicial (screening):** checagem de requisitos básicos e alinhamento de expectativas salariais.
3. **Avaliação técnica:** teste prático, análise de arquitetura ou revisão de código.
4. **Entrevista executiva:** validação cultural e alinhamento final com o gestor direto.

O recrutador não investiga, ele filtra. A ferramenta existe para acelerar a decisão dele, não para decifrar o candidato. Cada campo do seu currículo que responde diretamente a um requisito da vaga reduz o esforço de triagem e aumenta a chance de o card avançar.

## O que isso muda na sua candidatura

Com a visão do recrutador, algumas decisões ficam mais claras.

**Otimize para leitura rápida, não para estética.** O objetivo não é impressionar visualmente, é permitir que os dados sejam extraídos e que o valor apareça nos primeiros segundos de leitura. Nome do cargo, tecnologias e resultados quantificados devem estar em posição de destaque.

**Teste o parsing do seu próprio PDF.** Selecione o texto do arquivo antes de enviar. Se algo não for selecionável, o ATS também não lerá.

**Distribuição automática não substitui posicionamento.** A ferramenta anuncia a mesma vaga em vários canais, o que significa que sua candidatura compete com um volume maior. O diferencial continua sendo a clareza das informações e a correspondência entre as suas habilidades e a necessidade descrita.

**Nunca se apresente como desempregado.** O recrutador busca alguém que está trabalhando. A percepção de estabilidade influencia a triagem antes de qualquer avaliação técnica. Esse ponto, que tratei em detalhe no ensaio sobre polyworking, vale também para quem não pratica múltiplos contratos.

## Conclusão

O ATS é uma ferramenta administrativa de eficiência do recrutador. Não é uma caixa-preta misteriosa, nem um inimigo do candidato. Estudar o funcionamento de ferramentas como o Workable e o Greenhouse elimina concepções equivocadas e permite jogar o jogo com informação real, em vez de repetir mitos.

---

**Sobre o autor.** Robson Cassiano é engenheiro de software sênior com quase uma década de atuação em backend Java e Kotlin, com experiência do lado do recrutador em plataformas de ATS corporativas. Contratou o Workable com recursos próprios para produzir esta análise de primeira mão. Assina este ensaio a partir de uso direto das ferramentas, não de especulação.
