# 🎨 Design System: Simple Software & Robson Cassiano

Guia de estilo e especificações visuais para replicar o design system, paleta de cores, tipografia, componentes e padrões de interface de **Robson Cassiano / Simple Software** em outros projetos (Angular, React, Vue, Astro, Tailwind ou HTML puro).

---

## 🏛️ 1. Filosofia de Design & Identidade Visual

O design system baseia-se em **High-Tech Dark Sovereignty + Engineering Minimalism**:
* **Foco em Engenharia & Rigor:** Fundo escuro profundo (*Deep Slate*), contraste nítido, sem ruídos desnecessários.
* **Acentos Neon Lime:** Verde-limão neon vibrante (`#a3e635` / `#84cc16`), transmitindo sofisticação técnica, dinamismo, alta energia e precisão.
* **Glow & Glassmorphism:** Luzes ambientes difusas (*ambient glow orbs*) no fundo com desfoque pesado (`blur-3xl`) e containers translúcidos (`backdrop-blur-md`).
* **Tipografia Legível & Hierárquica:** `Inter` para leitura longa e limpa; tipografia monoespacial para código e dados técnicos.

---

## 🎨 2. Paleta de Cores & Design Tokens

### 🟢 Cores de Destaque (Brand / Accent)
| Token | HEX | Tailwind Class | Aplicação Principal |
| :--- | :--- | :--- | :--- |
| **Accent Primary** | `#a3e635` | `text-lime-400` / `bg-lime-400` | Links, badges, barras de citação, bordas ativas |
| **Accent Solid** | `#84cc16` | `bg-lime-500` | Botões primários de alta conversão (CTAs) |
| **Accent Hover** | `#bef264` | `hover:text-lime-300` / `hover:bg-lime-400` | Hover states |
| **Accent Glow** | `rgba(163, 230, 53, 0.15)` | `bg-lime-500/10` / `border-lime-500/30` | Fundos de badges, caixas de destaque |

### ⚫ Escala de Fundos Escuros (Deep Slate)
| Token | HEX | Tailwind Class | Aplicação Principal |
| :--- | :--- | :--- | :--- |
| **Background Root** | `#020617` | `bg-slate-950` | Fundo principal da página |
| **Surface Deep** | `#0f172a` | `bg-slate-900` | Fundo de cartões, seções, modais |
| **Surface Elevated** | `#1e293b` | `bg-slate-800` | Inputs, botões secundários, cabeçalhos de tabela |
| **Border Subtle** | `#334155` | `border-slate-700` | Bordas de inputs, separadores de cartões |
| **Border Minimal** | `#1e293b` | `border-slate-800` | Linhas de divisão, grids, rodapé |

### ⚪ Tipografia & Contrastes
| Token | HEX | Tailwind Class | Aplicação Principal |
| :--- | :--- | :--- | :--- |
| **Text Heading** | `#ffffff` | `text-white` | Títulos `h1`, `h2`, `h3`, números de destaque |
| **Text High-Contrast** | `#f8fafc` | `text-slate-100` | Títulos secundários e cabeçalhos de tabela |
| **Text Body Primary** | `#cbd5e1` | `text-slate-300` | Parágrafos de leitura, listas, artigos |
| **Text Body Secondary** | `#94a3b8` | `text-slate-400` | Subtítulos, descrições secundárias |
| **Text Muted / Meta** | `#64748b` | `text-slate-500` | Datas, badges discretos, copyright |

### 🔴 Cores Funcionais
| Token | HEX | Tailwind Class | Aplicação |
| :--- | :--- | :--- | :--- |
| **Danger / Video** | `#ef4444` | `text-red-400` / `border-red-500/30` | Badges de gravação de vídeo, erros |
| **Success** | `#a3e635` | `text-lime-400` / `bg-lime-500/10` | Mensagens de sucesso, confirmação de formulário |

---

## 🔤 3. Tipografia & Escala

* **Família Primária:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
* **Família Monospace:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

```html
<!-- Importação do Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

### Escala de Títulos
* **Display / Hero H1:** `text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white`
* **Section Title H2:** `text-3xl lg:text-4xl font-extrabold text-white leading-tight`
* **Card / Subsection H3:** `text-xl lg:text-2xl font-bold text-white`
* **Body / Artigos:** `text-base lg:text-lg text-slate-300 leading-relaxed` (`line-height: 1.8`)
* **Badges / Tags:** `text-xs font-bold uppercase tracking-wider`

---

## 🧩 4. Componentes e Padrões de Interface

### 4.1. Fundo com Luz Ambiente Difusa (Ambient Glow Orbs)
```html
<div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
  <div class="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-3xl animate-pulse"></div>
  <div class="absolute bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
</div>
```

---

### 4.2. Badges & Tags (Pills)
```html
<!-- Badge Primário (Lime) -->
<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs font-bold uppercase tracking-wider">
  <span>💡 Conhecimento & Alta Engenharia</span>
</div>

<!-- Badge de Vídeo / Atenção (Red) -->
<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
  Gravação Original
</span>
```

---

### 4.3. Botões de Ação (CTAs)
```html
<!-- 1. Botão Primário (Lime Neon - Alta Conversão) -->
<a href="#link" class="px-6 py-3.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg shadow-lime-500/20 inline-flex items-center gap-2">
  <span>Acessar Mentoria Internacional</span>
  <span>&rarr;</span>
</a>

<!-- 2. Botão Secundário (Dark Slate Outline) -->
<a href="#link" class="px-6 py-3.5 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 hover:border-lime-500 hover:text-lime-400 transition-colors inline-flex items-center gap-2">
  <span>Ver Perfil no LinkedIn</span>
</a>
```

---

### 4.4. Cartão com Glassmorphism (Card Container)
```html
<div class="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm hover:border-lime-500/40 transition-all duration-300 shadow-xl relative overflow-hidden group">
  <div class="text-xs text-lime-400 font-bold mb-2 uppercase tracking-wider">Categoria</div>
  <h3 class="text-xl font-bold text-white mb-3 group-hover:text-lime-400 transition-colors">Título do Cartão</h3>
  <p class="text-slate-400 text-sm leading-relaxed mb-4">Descrição detalhada do cartão mantendo contraste acessível.</p>
</div>
```

---

### 4.5. Caixa de Citação & Modelo Mental (Quote Box)
```html
<!-- Estilo para citações em artigos e seções -->
<blockquote class="border-l-4 border-lime-400 p-4 pl-5 my-6 bg-slate-800/60 rounded-r-xl text-slate-200 italic">
  <p class="m-0 leading-relaxed font-light text-lime-100/90">
    "Standing on the shoulders of giants."
  </p>
</blockquote>
```

---

### 4.6. Player de Vídeo Responsivo (YouTube Callout)
```html
<div class="my-8 p-6 bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-red-500/30 rounded-2xl shadow-2xl">
  <div class="flex items-center gap-2 mb-3">
    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">Gravação Original</span>
    <span class="text-xs text-slate-300 font-semibold">🎥 Assista à transmissão completa sem cortes:</span>
  </div>
  <div class="relative w-full pb-[56.25%] h-0 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl mt-2">
    <iframe 
      src="https://www.youtube.com/embed/VIDEO_ID?rel=0" 
      title="Transmissão Original" 
      class="absolute top-0 left-0 w-full h-full border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      allowfullscreen
      loading="lazy"
    ></iframe>
  </div>
</div>
```

---

### 4.7. Tabela Comparativa (Dark Zebra Table)
```html
<div class="overflow-x-auto rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/60">
  <table class="w-full text-left border-collapse">
    <thead class="bg-slate-800/90 text-xs uppercase tracking-wider font-semibold text-slate-300">
      <tr>
        <th class="p-5 border-b border-slate-700 text-slate-400">Critério</th>
        <th class="p-5 border-b border-slate-700 bg-lime-500/10 text-lime-400 font-bold border-x border-lime-500/30">Nossa Solução</th>
        <th class="p-5 border-b border-slate-700 text-slate-400">Mercado Tradicional</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-800 text-sm">
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="p-5 font-semibold text-white">Renda Mensal</td>
        <td class="p-5 bg-lime-500/5 font-bold text-lime-400 border-x border-lime-500/20">R$ 30k+ a R$ 60k+/mês</td>
        <td class="p-5 text-slate-400">R$ 4k a R$ 8k/mês</td>
      </tr>
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="p-5 font-semibold text-white">Metodologia</td>
        <td class="p-5 bg-lime-500/5 font-medium text-slate-200 border-x border-lime-500/20">Engenharia Real &amp; Prática</td>
        <td class="p-5 text-slate-400">Aulas expositivas e código defasado</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### 4.8. Modal Soberano (Popup / Dialog)
```html
<div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-fade-in" role="dialog" aria-modal="true">
  <div class="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden my-8">
    
    <!-- Luz ambiente do modal -->
    <div class="absolute -top-20 -right-20 w-56 h-56 bg-lime-500/15 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Botão de Fechar -->
    <button type="button" aria-label="Fechar" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700">
      ✕
    </button>

    <!-- Header Badge -->
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs font-bold mb-4 uppercase tracking-wider">
      <span>🎁 Material Exclusivo Gratuito</span>
    </div>

    <h2 class="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">Título Principal</h2>
    <p class="text-slate-400 text-sm leading-relaxed mb-6">Subtítulo explicativo sobre a oportunidade.</p>

    <!-- Formulário -->
    <form class="space-y-3.5">
      <input type="text" placeholder="Seu primeiro nome" class="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all" />
      <input type="email" required placeholder="Seu melhor e-mail" class="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all" />
      <button type="submit" class="w-full py-3.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-lime-500/25">
        Garantir Acesso &rarr;
      </button>
    </form>
  </div>
</div>
```

---

## 🛠️ 5. Configuração Recomendada do Tailwind CSS

Para replicar exatamente as cores e utilitários em novos projetos com Tailwind CSS:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts,tsx,jsx,vue,svelte,astro}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      colors: {
        slate: {
          950: '#020617',
          900: '#0f172a',
          850: '#151f33',
          800: '#1e293b',
          700: '#334155'
        },
        lime: {
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      }
    }
  },
  plugins: []
};
```

---

## 📋 6. Resumo das Regras Áureas

1. **Dark Mode Perpétuo:** O fundo da página principal deve ser sempre `slate-950` (`#020617`) ou `slate-900` (`#0f172a`). Nunca use branco puro como fundo.
2. **Neon Lime para Foco de Ação:** O verde `#a3e635` / `#84cc16` deve ser reservado para CTAs principais, pontos de foco, badges de validação e links.
3. **Bordas Sutis:** Use `border-slate-800` (`#1e293b`) ou `border-slate-700` (`#334155`) para delimitar containers sem criar caixas pesadas.
4. **Proporções de Imagem Fixas:** Imagens de avatar sempre em proporção 1:1 (`aspect-square`), e vídeos sempre em proporção 16:9 (`padding-bottom: 56.25%` ou `aspect-video`).
5. **Legibilidade WCAG AA:** O texto dos parágrafos deve manter contraste alto com `#cbd5e1` sobre `#0f172a`, e títulos em `#ffffff`.
