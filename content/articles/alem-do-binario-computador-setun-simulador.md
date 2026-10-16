---
title: "Além do Binário: A Engenharia Ternária Balanceada do Computador Setun"
slug: "alem-do-binario-computador-setun-simulador"
date: "2025-10-19"
author: "Robson Cassiano"
category: "Engenharia de Software"
readTime: "9 min de leitura"
tags: ["Arquitetura de Computadores", "Setun", "Computação Ternária", "Engenharia Reversa", "História da Computação"]
youtubeVideoId: "NuAWG3BX-GM"
summary: "Por que usamos bits em vez de trits? Uma análise prática da arquitetura ternária balanceada do computador soviético Setun e seu impacto na computação moderna."
coverImage: "assets/images/robson-cassiano-mentor.jpg"
canonicalUrl: "https://eu.robsoncassiano.software/artigos/alem-do-binario-computador-setun-simulador/"
preSoldTarget: "mentoria"
---

# Além do Binário: A Engenharia Ternária Balanceada do Computador Setun

Toda a infraestrutura de software que você manipula hoje, do kernel do Linux aos runtimes de JavaScript e aos bancos de dados relacionais, assenta-se sobre uma fundação que a indústria aceitou sem questionar: a base binária. Você aprendeu a organizar bytes, declarar tipos primitivos, alinhar registradores e otimizar operações bitwise assumindo que dois estados elétricos representam o ápice do design de hardware. Essa escolha tem raízes na pura conveniência física da década de 1950. Naquele período inicial, era trivial fabricar transistores que identificassem apenas tensão baixa e tensão alta, batizados pragmaticamente de 0 e 1.

A palavra técnica vem do grego *techne*, que expressa a arte ou habilidade do ofício manual e racional, enquanto decisão deriva do latim *decidere*, fusão de *de* e *caedere*, significando literalmente cortar fora outras possibilidades. A engenharia dos primórdios decepou a base ternária para colocar máquinas nas prateleiras rapidamente. Essa renúncia gerou gargalos matemáticos e físicos que você contorna diariamente nas suas implementações com custos adicionais de processamento e energia.

```
+-------------------------------------------------------------+
|               ESPAÇO DE VALORES: SISTEMAS                   |
+-------------------------------------------------------------+
| Binário:              { 0, 1 }                              |
| Ternário Balanceado:  { -1, 0, +1 }                         |
| Inclusão Direta:      { 0, 1 } está contido em { -1, 0, +1 } |
+-------------------------------------------------------------+
```

## A Matemática Esquecida: A Constante de Euler e o Custo de Radix

Existe um critério estritamente matemático para medir a eficácia de representação numérica em hardware: o radix economy. Ele calcula o produto entre a base utilizada e o número de dígitos necessários para representar uma quantidade arbitrária. A base que minimiza esse consumo de forma perfeita é a constante de Euler, o número irracional $e \approx 2,71828$. 

Como não construímos portas lógicas usando frações irracionais, precisamos escolher o número inteiro mais próximo. O número inteiro mais perto de 2,71828 é 3, seguido por 2. A base três apresenta uma proximidade física e matemática com essa constante fundamental da natureza que supera a base dois. No binário, a representação de grandezas exige mais posições de memória e mais ciclos de barramento.

Na prática da engenharia, ao utilizar a lógica ternária balanceada com os valores `-1`, `0` e `+1`, você tem ganhos expressivos em comparação com o binário convencional:

* **Densidade de Informação:** Uma economia aproximada de 16% na quantidade de casas necessárias para representar inteiros. O valor decimal 35, por exemplo, consome 6 dígitos no sistema binário (`100011`), enquanto demanda apenas 4 trits no ternário balanceado (`+---` ou `1, -1, -1, -1` em notação posicional).
* **Ausência de Bit de Sinal:** Em binário, você é forçado a lidar com complemento de dois, manobras de sinal, overflow artificial e representações duplicadas. No ternário balanceado, os sinais positivo e negativo estão embutidos nativamente nos próprios estados.
* **Inversão Algébrica Imediata:** A operação de negação aritmética de qualquer número, não importando a sua extensão em memória, resume-se a trocar os estados dos trits (`+` vira `-` e vice-versa). Trata-se de uma instrução executada em ciclo único, sem o encadeamento de somadores exigido no complemento de dois.

## O Caso Setun: Hardware Soviético Operacional em 1958

Essa abordagem teórica rodou em computadores físicos reais. Na década de 1950, a Universidade Estadual de Moscou, liderada pelo matemático e engenheiro Nikolay Brusentsov, projetou e colocou em funcionamento o Setun. Foi uma CPU ternária balanceada funcional, desenvolvida sob escassez de componentes, que entregava velocidade e confiabilidade superiores a máquinas binárias do mesmo período que consumiam muito mais válvulas e núcleos de ferrite.

O Setun foi abandonado devido a determinações burocráticas soviéticas da época, que preferiram padronizar a indústria copiando a arquitetura binária ocidental da IBM. O problema, derivado do grego *proballein* (aquilo que é lançado diante de nós como obstáculo a ser superado), nunca foi de engenharia; foi puramente de política industrial.

Para resgatar essa arquitetura e entender sua dinâmica operacional, desenvolvi um simulador funcional do Setun rodando no navegador, reproduzindo a interface, o console, o registrador de somador e a memória de instruções daquela CPU.

```
+-------------------------------------------------------------+
|               FLUXO DA ARQUITETURA SETUN                    |
+-------------------------------------------------------------+
|                                                             |
|  [Fita 1: Programa] ----> [ Leitor / Parser ]              |
|                                 |                           |
|                                 v                           |
|  [Fita 2: Dados] --------> [ Barramento de Instrução: ISA ] |
|                                 |                           |
|                                 v                           |
|       +---------------------------------------------+       |
|       |   Registrador Somador (S)                   |       |
|       |   Registrador Multiplicando Auxiliar        |       |
|       |   Contador de Passos (Program Counter)      |       |
|       |   Indicador de Polaridade (Minúsculo Ômega) |       |
|       +---------------------------------------------+       |
|                                 |                           |
|                                 v                           |
|                      [ Saída: Console / Log ]               |
+-------------------------------------------------------------+
```

## Dissecando o Simulador: Separação de Fitas e Ciclos de Instrução

A primeira escolha arquitetural observável no console do Setun reflete a separação física do meio de armazenamento: a máquina utilizava dois leitores de fita de papel perfurado, a Fita 1 para o programa e a Fita 2 para os dados.

Essa divisão evitava ter de reimprimir cartões ou fitas de código inteiro quando apenas os parâmetros operacionais mudavam. O software mantinha sua estrutura estável, alterando-se unicamente a entrada de dados.

No conjunto de instruções (ISA) do Setun, cada comando é composto por um trio de trits. Na demonstração executada ao vivo na transmissão, carregamos um algoritmo enxuto contendo três instruções principais para ilustrar a execução aritmética básica:

```text
// Instrução 1: Enviar valor +10 decimal para o Somador (S)
+00 +0+

// Instrução 2: Adicionar o valor -2 decimal ao Somador (S)
+0+ 0--

// Instrução 3: Parada da máquina
000
```

Analisando a decodificação passo a passo pelo contador de programa:

1. **Ciclo 0 (PC = 0):** O comando `+00` ativa a rotina de transferência direta para o somador principal. O operando passado é o conjunto posicional `+ 0 +`. Lendo as colunas de valor posicional da direita para a esquerda:
   * Coluna 1 (peso $3^0 = 1$): estado `+` = $1$
   * Coluna 2 (peso $3^1 = 3$): estado `0` = $0$
   * Coluna 3 (peso $3^2 = 9$): estado `+` = $9$
   * Total acumulado no registrador: $9 + 0 + 1 = 10$.
   O display do ômega minúsculo ($\omega$) acende o polo superior, confirmando de maneira instantânea que o registrador contém um número estritamente positivo.

2. **Ciclo 1 (PC = 1):** O comando `+0+` chama a adição aritmética. O operando fornecido é `-` na primeira coluna e `0` nas seguintes, somando o valor decimal $-2$ (calculado via representação interna ternária). A operação soma o valor com sinal nativo sem recorrer ao complemento de dois:
   $$10 + (-2) = 8$$
   O registrador de saída agora exibe as lâmpadas acesas correspondentes ao peso $9$ (`+`) e peso $1$ (`-`), validando a conta diretamente no hardware: $9 - 1 = 8$.

3. **Ciclo 2 (PC = 2):** A instrução `000` dispara o encerramento do ciclo de trabalho, descarregando o conteúdo final consolidado no registrador de saída para a impressora matricial simulada.

```
+-------------------------------------------------------------+
|        LEITURA POSICIONAL TERNÁRIA: VALOR DECIMAL 8         |
+-------------------------------------------------------------+
| Colunas:             | 3^2 (9)  |  3^1 (3)  |  3^0 (1)      |
| Estados dos Trits:   |   +1     |    0      |   -1          |
| Multiplicação:       | 1 * 9    |  0 * 3    |  -1 * 1       |
| Total:               |   9      +    0      -   1    = 8    |
+-------------------------------------------------------------+
```

## O Ábaco Ternário e a Conexão com a Computação Quântica

Para apoiar a compreensão desses estados sem recorrer à conversão mental decimal constante, projetei um ábaco ternário balanceado fundamentado na mecânica do soroban japonês tradicional. A disciplina (do latim *disciplina*, ligada à aprendizagem e ao método de transmissão de conhecimento) exige ferramentas visuais simples para reconfigurar anos de condicionamento binário. 

Cada coluna vertical do ábaco representa uma potência de três ($1, 3, 9, 27, 81, 243, 729$). O profissional move as contas para a barra superior para registrar o valor `+1`, para a barra inferior para computar o valor `-1`, mantendo-as neutras ao centro para expressar o `0`. 

Ao inverter a polaridade de um número arbitrário, não é preciso refazer somas e subtrações periféricas. Basta inverter o eixo mecânico ou de tensão lógica, espelhando os valores.

```
       ÁBACO TERNÁRIO BALANCEADO (ESQUEMÁTICO)
       
       Coluna 3 (x9)      Coluna 2 (x3)      Coluna 1 (x1)
       +-----------+      +-----------+      +-----------+
       |   ( O )   |      |           |      |           |  <- Barra Superior (+1)
       |           |      |           |      |           |
=======|===========|======|===========|======|===========|== Barra Neutra (0)
       |           |      |   ( O )   |      |           |
       |           |      |           |      |   ( O )   |  <- Barra Inferior (-1)
       +-----------+      +-----------+      +-----------+
       Valor: +9          Valor: 0           Valor: -1   ===> TOTAL = +8
```

Essa lógica possui intersecção direta com as fronteiras do hardware de ponta, especificamente a computação quântica. Hoje, boa parte dos laboratórios dedica esforços na estruturação de qubits, que oscilam em superposição entre os estados 0 e 1. A física desses sistemas acomoda nativamente os chamados qutrits (quantum trits), unidades ternárias de informação quântica. 

Como a natureza organiza estados quânticos em espectros com polaridades positivas, neutras e negativas, construir algoritmos nativos em base 3 corta passos de emulação intermediários. Toda a lógica binária é um subconjunto estrito da lógica ternária balanceada: o par `{0, 1}` é absorvido com naturalidade pelo trio `{-1, 0, 1}`.

## Por Que Essa Base Importa Para a Sua Carreira Técnica

A palavra carreira deriva do latim *carraria*, estrada destinada a carretas, trajeto percorrido com base em tração e direção definidas. Trabalho procede de *tripalium*, instrumento primitivo de fixação e esforço, e experiência decorre de *experientia*, formada pelo prefixo *ex* (saída, superação) e pelo verbo *periri* (testar, arriscar-se diante de fatos). 

Entender os alicerces profundos da computação livra o desenvolvedor da dependência cega em relação a frameworks transitórios e APIs de mercado com ciclos curtos de validade.

1. **Compreensão de Custos Ocultos de Máquina:** Ao programar código em linguagens de alto nível, seu software consome memória manipulando inteiros com sinal, serializações JSON e estruturas de dados pesadas. Entender como a lógica de portas afeta a representação numérica permite escrever rotinas alinhadas com o processamento real da máquina, economizando ciclos de processamento e memória em aplicações de alto volume.
2. **Capacidade de Modelagem de Domínio:** A lógica formal de negócio raramente é binária. Nossos modelos de dados são constantemente poluídos com flags nulas, booleanos tri-state mal formatados e estruturas ambíguas porque tentamos enfiar realidades com três estados legítimos (verdadeiro, falso e desconhecido ou neutro) em estruturas primitivas booleanas. Pensar em três estados balanceados simplifica a arquitetura lógica de motores de regras, máquinas de estado e processamento distribuído.
3. **Visão Estratégica de Engenharia:** Empresas pioneiras de semicondutores e patentes de ponta (incluindo avanços documentados em gigantes de hardware) estudam o uso prático de barramentos ternários para mitigar o gargalo térmico da miniaturização de transistores de silício. Profissionais que compreendem esses limites físicos posicionam-se à frente nas discussões técnicas de arquitetura e infraestrutura de alta performance.

O repositório do simulador e o conversor de bases estão publicados em código aberto. Você pode navegar pelo simulador, depurar as instruções fita a fita e acompanhar como uma soma de trits é processada na tela:

* Simulador Setun: [github.com/robsoncassiano/setun-simulator](https://github.com/robsoncassiano/setun-simulator)
* Conversor de Bases Ternário Balanceado: [github.com/robsoncassiano/rx-converter](https://github.com/robsoncassiano/rx-converter)
* Tese do Dr. Steven Boss: *Ternary Balanced Computer Architecture and Information Theory*, Universidade do Sudeste da Noruega (USN).

O estudo das bases da computação demonstra que a nossa tecnologia dominante atual resulta de contingências de fabricação do século passado, e não de limites intransponíveis da matemática. Conhecer caminhos alternativos amplia seu repertório crítico para projetar sistemas de software e hardware mais robustos, velozes e enxutos.