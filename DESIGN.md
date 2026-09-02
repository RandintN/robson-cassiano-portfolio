# Jinkan (迅貫) Design System
### *Velocidade & Coerência* — Diretrizes de UX, UI e Identidade Visual

---

## 1. Filosofia de Design & Arquétipo

O **Jinkan (迅貫)** nasce da síntese entre **ação fulminante** e **ordem inabalável**. Ele rejeita tanto a lentidão da hiper-ponderação quanto o caos da velocidade desgovernada. 

* **迅 (Jin — Velocidade):** Latência zero, atrito nulo, microinterações instantâneas e fluxo contínuo de pensamento.
* **貫 (Kan — Coerência):** Integridade de ponta a ponta, consistência de grid, clareza tipográfica e hierarquia visual rigorosa.

> **Princípio Fundamental:**  
> *"Cada interação deve responder com a rapidez do pensamento e a estabilidade da rocha."*

---

## 2. Paleta de Cores (Obsidian & Imperial Gold)

A atmosfera cromática é construída sobre uma base **Dark Luxury / Industrial Minimalist**, utilizando tons profundos de ardósia e carbono como pano de fundo para destacar acentos metálicos dourados.

### Cores Primárias (Surfaces & Canvas)
| Token | Hex | Nome | Uso |
| :--- | :--- | :--- | :--- |
| `surface-void` | `#08080A` | **Void Black** | Background da aplicação e canvas principal |
| `surface-base` | `#0E0E12` | **Obsidian Slate** | Background padrão de painéis e containers |
| `surface-raised` | `#16161C` | **Carbon Matrix** | Cards, modais e superfícies elevadas |
| `surface-overlay` | `#1F1F27` | **Brushed Steel** | Dropdowns, tooltips e estados de hover em superfícies |

### Acentos Metálicos (The Golden Thread)
| Token | Hex | Nome | Uso |
| :--- | :--- | :--- | :--- |
| `gold-primary` | `#DFB15B` | **Imperial Gold** | Bordas ativas, ícones chave, badges de prestígio e CTAs |
| `gold-light` | `#F6E0A4` | **Champagne Light** | Highlights, texto de destaque e brilho especular em hover |
| `gold-muted` | `#967432` | **Burnished Bronze** | Bordas sutis (hairlines), divisores e estados inativos |
| `gold-glow` | `rgba(223, 177, 91, 0.12)` | **Aura Gold** | Sombras difusas e backdrops radiantes |

### Tipografia & Contraste (Text Tokens)
| Token | Hex | Nome | Uso |
| :--- | :--- | :--- | :--- |
| `text-primary` | `#F4F4F6` | **Pure White Pearl** | Títulos e leitura primária de alto contraste |
| `text-secondary` | `#9E9EA8` | **Titanium Silver** | Subtítulos, labels descritivos e metadados |
| `text-tertiary` | `#5A5A66` | **Muted Slate** | Placeholders, atalhos de teclado e texto desativado |
| `text-gold` | `#E8CA7C` | **Refined Gold Text** | Kanjis, palavras-chave e chamadas de valor |

---

## 3. Tipografia & Escala

A tipografia reflete a dualidade do sistema: a solidez geométrica moderna unida à elegância clássica.

### Famílias Tipográficas
* **Primária (UI / Textos):** `Inter`, `Geist Sans` ou `SF Pro Text` — alta legibilidade e espaçamento métrico preciso.
* **Display / Títulos:** `Cinzel`, `Cormorant Garamond` ou `Syne` — refinamento atemporal e presença marcante.
* **Monospace / Métricas:** `Geist Mono` ou `JetBrains Mono` — para código, dados e telemetria.
* **Caligrafia Oriental:** `Shippori Mincho` ou `Noto Serif JP` — para ideogramas e acentos orientais.

### Escala de Tipografia
```css
--font-display-2xl: 4.5rem;   /* 72px - Hero display / Kanjis monumentais */
--font-display-xl:  3.0rem;   /* 48px - Títulos principais */
--font-title-lg:    1.75rem;  /* 28px - Cabeçalhos de seção */
--font-title-md:    1.25rem;  /* 20px - Títulos de cards */
--font-body-lg:     1.0rem;   /* 16px - Texto corrido principal */
--font-body-sm:     0.875rem; /* 14px - UI compacta e dados */
--font-caption:     0.75rem;  /* 12px - Labels técnicos e tags */
```

---

## 4. Grid, Espaçamento & Estrutura (貫 - Kan)

Para assegurar **coerência absoluta**, todo o layout é construído em um sistema de múltiplos de **8px** (com sub-unidade de **4px** para micro-espaçamento).

* `space-1`: `4px` (Ajustes finos entre ícone e texto)
* `space-2`: `8px` (Gaps internos compactos)
* `space-3`: `12px` (Paddings de botões e tags)
* `space-4`: `16px` (Padding padrão de containers)
* `space-6`: `24px` (Espaçamento entre seções internas)
* `space-8`: `32px` (Margens de blocos e grids)
* `space-12`: `48px` (Gaps estruturais maiores)

---

## 5. Física de Movimento & Animações (迅 - Jin)

O movimento no Jinkan nunca é decorativo ou lento. Ele é instantâneo na partida e sedoso na desaceleração.

### Curvas de Easing (Velocidade Responsiva)
```css
/* Easing padrão: Saída rápida como raio, parada ultra-suave */
--ease-jin: cubic-bezier(0.16, 1, 0.3, 1);

/* Durações */
--duration-instant: 100ms; /* Toggles, micro-hovers, cliques */
--duration-fast:    180ms; /* Abertura de tooltips, badges, menus */
--duration-flow:    300ms; /* Transição de páginas e expansão de cards */
```

### Regras de Ouro de Animação
1. **Zero CLS (Cumulative Layout Shift):** O layout nunca deve "pular" enquanto elementos carregam.
2. **Feedback em < 50ms:** Toda ação tem resposta visual imediata (micro-brilho dourado ou depressão tátil).

---

## 6. Especificação de Componentes Chave

### A. O Cartão "Jinkan Black Card" (Componente Assinatura)
```css
.jinkan-card {
  background: linear-gradient(145deg, #141418 0%, #0c0c0f 100%);
  border: 1px solid rgba(223, 177, 91, 0.22);
  border-radius: 12px;
  box-shadow: 
    0 4px 24px -1px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(255, 255, 255, 0.02) inset;
  transition: all 180ms var(--ease-jin);
  position: relative;
  overflow: hidden;
}

.jinkan-card:hover {
  border-color: rgba(223, 177, 91, 0.6);
  box-shadow: 
    0 8px 32px -2px rgba(0, 0, 0, 0.9),
    0 0 20px rgba(223, 177, 91, 0.12);
  transform: translateY(-2px);
}
```

### B. Botões de Ação (Gold Foil & Obsidian)
* **Primário (Gold Emboss):** Fundo gradiente ouro metálico, texto preto grafite (`#0A0A0C`), peso 600, leve efeito de chanfro nas bordas.
* **Secundário (Dark Wireframe):** Fundo escuro transparente, borda de `1px` em `gold-muted`, texto `text-primary`. Ao hover: borda brilha em `gold-primary` com fundo levemente iluminado.

### C. Bordas Hairline & Divisores
* Nunca use divisores cinzas genéricos. Use gradientes lineares horizontais que se dissolvem nas extremidades:
```css
.jinkan-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(223, 177, 91, 0.3) 50%, transparent);
  border: none;
}
```

---

## 7. Acessibilidade (a11y) & Usabilidade

* **Contraste de Texto:** O ouro para textos (`#E8CA7C`) sobre o fundo preto (`#0E0E12`) atinge uma relação de contraste superior a **8.5:1**, superando os requisitos **WCAG AAA**.
* **Focus States:** Anéis de foco definidos em `2px solid #DFB15B` com `2px offset`, garantindo navegação por teclado fluida e visível.
