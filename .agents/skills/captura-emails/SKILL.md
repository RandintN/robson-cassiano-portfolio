---
name: captura-emails
description: >-
  Instruções e padrões oficiais para integração e uso do capture-worker (https://capture.robsoncassiano.software),
  o serviço soberano de captura de leads, sanitização RFC, verificação Turnstile e despacho transacional de e-mails
  em qualquer página, projeto ou landing page.
---

# Skill: Captura Soberana de E-mails (capture-worker)

Esta skill define as diretrizes, opções de parametrização e padrões de integração do **capture-worker**, o microsserviço autônomo na borda da Cloudflare responsável pela ingestão, higienização e nutrição de leads para todos os produtos e páginas de **Robson Cassiano** e **Simple Software LTDA**.

---

## 1. Arquitetura e Endpoints Oficiais

* **Domínio de Produção:** `https://capture.robsoncassiano.software`
* **SDK de Distribuição:** `https://capture.robsoncassiano.software/embed.js`
* **API de Ingestão:** `https://capture.robsoncassiano.software/api/subscribe`
* **Monitoramento e Diagnóstico:** `https://capture.robsoncassiano.software/health`
* **Base de Dados Unificada:** Cloudflare D1 `robson-cassiano-portfolio-db` (tabela `subscribers`)
* **Disparo de E-mails:** Cloudflare Email Routing nativo autenticado (`contato@robsoncassiano.software`)
* **Proteção Ativa:** Cloudflare Turnstile obrigatório (fail-closed) e Workers Rate Limiting API (10 requisições por 60s por IP)

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
| `data-source` | `window.location.hostname` | Identificador gravado na coluna `source` do banco D1 para rastrear a origem do lead. |
| `data-mode` | `"inline"` | Modo de exibição: `"inline"`, `"modal"` ou `"both"`. |
| `data-target` | `""` | Seletor CSS do container onde o formulário inline deve ser renderizado (ex: `"#newsletter-area"`). Se omitido, insere logo após o script. |
| `data-turnstile-sitekey` | `"0x4AAAAAAEjUfJwT3yG_vHIF"` | Chave pública do Cloudflare Turnstile. |
| `data-title` | `"Engenharia de Software de Elite & Contratos Globais"` | Título principal do cartão de captura. |
| `data-badge` | `"📬 Masterclass & Conteúdo Soberano"` | Rótulo superior com destaque dourado. |
| `data-description` | Texto padrão de posicionamento internacional | Subtítulo e texto explicativo do benefício. |
| `data-button` | `"Garantir Acesso VIP"` | Texto de ação do botão de submissão. |
| `data-ebook-url` | `https://robsoncassiano.software/7-passos-simples-dev-na-gringa` | URL validada (`http:`/`https:`) para download do material pós-conversão. |
| `data-api` | `https://capture.robsoncassiano.software` | Origem da API de captura. |

---

## 4. Modos de Operação

### Modo Inline
Renderiza o formulário fixo dentro da estrutura visual da página, utilizando Shadow DOM para isolar CSS:
```html
<div id="newsletter-container"></div>

<script 
  src="https://capture.robsoncassiano.software/embed.js" 
  data-target="#newsletter-container"
  data-source="artigo-blog"
  data-mode="inline"
  defer>
</script>
```

### Modo Modal (Comportamental e Autônomo)
Cria uma sobreposição escura com blur que surge automaticamente através de três gatilhos:
1. **Intenção de Saída no Desktop:** Detecta o movimento do cursor ultrapassando o topo da janela (`mouseleave`).
2. **Temporizador de Permanência:** Abre após 20 segundos de leitura na página.
3. **Profundidade de Rolagem:** Abre quando o usuário ultrapassa 60% da altura da página.

Após o fechamento, o modal memoriza a dispensa no `localStorage` por 7 dias para evitar interrupções repetitivas.

---

## 5. Como Disparar o Modal Manualmente

O disparo manual ignora supressões temporais e força a exibição imediata do modal.

### Opção A: Chamada JavaScript / Console
```javascript
window.RobsonCapture.open();
```

Para fechar programaticamente:
```javascript
window.RobsonCapture.close();
```

### Opção B: Atributo HTML Declarativo em Botões e Links
Qualquer elemento contendo `data-capture-open` ou `href="#capture-modal"` aciona o modal ao ser clicado:
```html
<!-- Botão com atributo de captura -->
<button type="button" class="btn-destaque" data-capture-open>
  Receber E-book Gratuito
</button>

<!-- Link com identificador de âncora -->
<a href="#capture-modal" class="link-cta">
  Acessar Materiais Exclusivos
</a>
```

### Opção C: Evento Customizado do DOM
```javascript
window.dispatchEvent(new CustomEvent('rc:open-modal'));
```

---

## 6. Padrões de Integração por Framework

### Angular (v19, v20, v21)
Inserir diretamente no arquivo `src/index.html` antes de `</body>`.
Para disparar via componente Angular:
```typescript
@Component({
  template: `
    <button (click)="openCaptureModal()" class="btn-gold">
      Entrar na Lista VIP
    </button>
  `
})
export class CtaComponent {
  openCaptureModal() {
    if (typeof window !== 'undefined' && (window as any).RobsonCapture) {
      (window as any).RobsonCapture.open();
    }
  }
}
```

### React / Next.js
No Next.js (App Router), adicionar no `app/layout.tsx`:
```tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Script
          src="https://capture.robsoncassiano.software/embed.js"
          data-source="nextjs-app"
          data-mode="modal"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
```

### WordPress / Elementor / Landing Pages
Inserir um bloco de HTML personalizado com o snippet padrão ou vincular a classe/atributo `data-capture-open` aos botões de conversão existentes no layout.

---

## 7. Diretrizes de Segurança do capture-worker

1. **Proteção Contra Robôs:** O backend rejeita requisições sem validação válida do Turnstile com status `HTTP 403`.
2. **Higienização de Entradas:** E-mails passam por sanitização Unicode, validação estrutural RFC 5322 e limites RFC 5321.
3. **Validação DNS em Tempo Real:** Domínios sem registros MX válidos são rejeitados com status `HTTP 400`.
4. **Proteção Antienumeração:** A resposta da API retorna mensagem padronizada (`"Inscrição confirmada! Verifique sua caixa de entrada."`) independentemente de ser um lead inédito ou uma reinscrição.
5. **Mitigação de Abuso:** O endpoint opera com limitação ativa de 10 requisições a cada 60 segundos por IP.
