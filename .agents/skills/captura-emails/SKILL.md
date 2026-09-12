---
name: captura-emails
description: >-
  Instruções e padrões oficiais para integração e uso do capture-worker (https://capture.robsoncassiano.software),
  o serviço soberano de captura de leads, sanitização RFC, verificação Turnstile e despacho transacional de e-mails
  em qualquer página, projeto ou landing page.
---

# Skill: Captura Soberana de E-mails (capture-worker)

Esta skill define as diretrizes, opções de parametrização, mecanismos de segurança e padrões de integração do **capture-worker**, o microsserviço autônomo na borda da Cloudflare responsável pela ingestão, higienização, validação contra erros de digitação e nutrição de leads para todos os produtos e páginas de **Robson Cassiano** e **Simple Software LTDA**.

---

## 1. Arquitetura e Endpoints Oficiais

* **Domínio de Produção:** `https://capture.robsoncassiano.software`
* **SDK de Distribuição:** `https://capture.robsoncassiano.software/embed.js` (tamanho compilado: ~16.6 KiB)
* **API de Ingestão:** `https://capture.robsoncassiano.software/api/subscribe`
* **Monitoramento e Diagnóstico:** `https://capture.robsoncassiano.software/health`
* **Base de Dados Central:** Cloudflare D1 `robson-cassiano-portfolio-db` (tabela `subscribers`)
* **Disparo de E-mails:** Cloudflare Email Routing nativo autenticado (`contato@robsoncassiano.software`)
* **Proteção Anti-Bot:** Cloudflare Turnstile estrito em modo fail-closed (rejeita requisições sem token com status `HTTP 403`)
* **Mitigação de Abuso:** Cloudflare Workers Rate Limiting API (10 requisições a cada 60 segundos por IP, responde `HTTP 429`)

---

## 2. Inclusão Básica em Qualquer Página HTML

Adicione a tag de script antes do fechamento de `</body>`:

```html
<script 
  src="https://capture.robsoncassiano.software/embed.js" 
  data-source="nome-do-produto-ou-landing"
  data-mode="modal"
  defer>
</script>
```

---

## 3. Tabela Completa de Atributos `data-*`

| Atributo | Padrão | Finalidade |
| :--- | :--- | :--- |
| `data-source` | `window.location.hostname` | Identificador gravado na coluna `source` do banco D1 para rastrear a conversão do lead. |
| `data-mode` | `"inline"` | Modo de exibição: `"inline"`, `"modal"` ou `"both"`. |
| `data-target` | `""` | Seletor CSS do container onde o formulário inline deve ser renderizado (ex: `"#newsletter-area"`). |
| `data-turnstile-sitekey` | `"0x4AAAAAAEjUfJwT3yG_vHIF"` | Chave pública do Cloudflare Turnstile. |
| `data-title` | `"Engenharia de Software de Elite & Contratos Globais"` | Título principal do cartão de captura. |
| `data-badge` | `"📬 Masterclass & Conteúdo Soberano"` | Rótulo superior com destaque dourado. |
| `data-description` | Texto padrão de posicionamento internacional | Subtítulo e texto explicativo da proposta de valor. |
| `data-button` | `"Garantir Acesso VIP"` | Rótulo de ação do botão de submissão. |
| `data-ebook-url` | `https://robsoncassiano.software/7-passos-simples-dev-na-gringa` | URL validada (`http:`/`https:`) para download do material pós-conversão. |
| `data-api` | `https://capture.robsoncassiano.software` | Origem da API de captura. |
| `data-theme` | `"dark"` | Tema visual do cartão. |
| `data-lang` | `lang` do documento hospedeiro | Idioma dos **textos internos** do SDK (placeholders, privacidade, mensagem de autocorreção de e-mail, estados de carregamento, erro e sucesso, `aria-label` de fechar) e dos defaults de copy. Aceita `pt-BR` (fallback) e `en`. Use `en` em páginas em inglês: sem isso o visitante preenche um formulário em português. |

---

## 4. Detecção Algorítmica de Typos e Autocorreção no SDK

O SDK e o backend utilizam o algoritmo de distância **Damerau-Levenshtein** para identificar erros de digitação e domínios de *typosquatting*:

### 1. Provedores Monitorados
* `gmail.com`
* `hotmail.com`
* `outlook.com`
* `yahoo.com`
* `yahoo.com.br`
* `icloud.com`
* `proton.me`
* `live.com`

### 2. Variações Interceptadas Automaticamente
Erros de digitação comuns com distância de edição de até 2 caracteres são identificados:
* `gmil.com` $\rightarrow$ `gmail.com`
* `gmai.com` $\rightarrow$ `gmail.com`
* `gamil.com` $\rightarrow$ `gmail.com`
* `gmial.com` $\rightarrow$ `gmail.com`
* `gmaill.com` $\rightarrow$ `gmail.com`
* `gmail.con` $\rightarrow$ `gmail.com`
* `gmail.com.br` $\rightarrow$ `gmail.com`
* `hotmial.com` $\rightarrow$ `hotmail.com`
* `outlok.com` $\rightarrow$ `outlook.com`

Provedores legítimos que possuem grafia semelhante (`mail.com`, `zoho.com`, `uol.com.br`, `bol.com.br`) possuem exceção e são aceitos normalmente.

### 3. Experiência de Autocorreção Interativa no SDK
* **Evento `blur`:** Ao terminar de preencher o e-mail, se for identificado um domínio com erro, o SDK exibe um link clicável com a correção (ex: *"Você quis dizer **usuario@gmail.com**? Corrija seu endereço antes de continuar."*).
* **Correção com 1 clique:** Ao clicar no e-mail sugerido, o valor do campo é atualizado, a mensagem de erro desaparece e o campo recebe foco.
* **Bloqueio no Envio:** Caso o formulário seja submetido com o e-mail incorreto, o envio é impedido antes de consumir a rede e antes do desafio do Turnstile.

---

## 5. Modos de Exibição

### Modo Inline
Renderiza o formulário no fluxo do documento, dentro do seletor indicado em `data-target` ou logo após o `<script>`, com isolamento total via Shadow DOM:
```html
<div id="newsletter-container"></div>

<script 
  src="https://capture.robsoncassiano.software/embed.js" 
  data-target="#newsletter-container"
  data-source="blog-artigos"
  data-mode="inline"
  defer>
</script>
```

### Modo Modal (Gatilhos Comportamentais)
Cria uma sobreposição com efeito de vidro fosco (`backdrop-filter`) acionada automaticamente por três critérios:
1. **Intenção de Saída no Desktop:** Detecta o movimento do cursor ultrapassando o topo da página (`mouseleave`).
2. **Tempo de Permanência:** Abre após 20 segundos de navegação ativa.
3. **Profundidade de Leitura:** Abre ao atingir 60% da rolagem da página.

Ao ser fechado, o modal memoriza a dispensa no `localStorage` por 7 dias para respeitar a experiência do visitante.

---

## 6. Disparo Manual do Modal

O disparo manual ignora a dispensa temporária do `localStorage` e força a abertura imediata.

### Método 1: Chamada JavaScript ou Console DevTools
```javascript
window.RobsonCapture.open();
```
Para fechar:
```javascript
window.RobsonCapture.close();
```

### Método 2: Atributos HTML Declarativos
Qualquer elemento na página com o atributo `data-capture-open` ou o link `href="#capture-modal"` abre o modal ao ser clicado:
```html
<button type="button" class="btn-primary" data-capture-open>
  Receber Guia Gratuito
</button>

<a href="#capture-modal" class="link-destaque">
  Baixar E-book Agora
</a>
```

### Método 3: Evento Customizado DOM
```javascript
window.dispatchEvent(new CustomEvent('rc:open-modal'));
```

---

## 7. Exemplos Práticos de Integração

### Angular (v19, v20, v21)
Inserir no arquivo `src/index.html` antes de `</body>`:
```html
<script 
  src="https://capture.robsoncassiano.software/embed.js" 
  data-source="interview-analyzer"
  data-mode="modal"
  defer>
</script>
```

Para acionar via botão em componente Angular:
```typescript
@Component({
  template: `
    <button type="button" (click)="abrirCaptura()" class="btn-cta">
      Quero Acesso VIP
    </button>
  `
})
export class CtaComponent {
  abrirCaptura(): void {
    if (typeof window !== 'undefined' && (window as any).RobsonCapture) {
      (window as any).RobsonCapture.open();
    }
  }
}
```

### React / Next.js
No Next.js (App Router), incluir no `app/layout.tsx`:
```tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Script
          src="https://capture.robsoncassiano.software/embed.js"
          data-source="meu-app-next"
          data-mode="modal"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
```

---

## 8. Diretrizes de Segurança e Boas Práticas

1. **Anti-Bot Fail-Closed:** O endpoint de submissão exige a presença e a verificação válida do token do Turnstile perante o endpoint oficial da Cloudflare (`https://challenges.cloudflare.com/turnstile/v0/siteverify`). Submissões sem token são rejeitadas com `HTTP 403`.
2. **Proteção Antienumeração:** A resposta da API é padronizada (`"Inscrição confirmada! Verifique sua caixa de entrada."`), impedindo que terceiros descubram se um e-mail já existe na base de dados.
3. **Limitação de Taxa de Requisições:** A Workers Rate Limiting API restringe acessos a 10 requisições a cada 60 segundos por IP, mitigando ataques de força bruta e amplificação de e-mails.
4. **Higienização de Injeção HTML:** Nomes e variáveis dinâmicas inseridas no template de e-mail passam pela função `escapeHtml`, neutralizando ataques de injeção de HTML no cliente de e-mail.
5. **Prevenção contra XSS no SDK:** Textos informados em atributos `data-*` são atribuídos via propriedades `textContent` nos elementos do Shadow DOM, e URLs de materiais são validadas para aceitar unicamente esquemas `http:` e `https:`.
