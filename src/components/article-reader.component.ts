import { Component, input, output, ChangeDetectionStrategy, signal, computed, inject, HostListener } from '@angular/core';
import { Article } from '../app/services/content.service';
import { NgOptimizedImage } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Component({
  selector: 'app-article-reader',
  imports: [NgOptimizedImage],
  template: `
    <div
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 md:p-10 flex justify-center items-start animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-article-title"
      (click)="onBackdropClick($event)"
    >
      <div
        class="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 my-8"
        (click)="$event.stopPropagation()"
      >
        <!-- Header Controls -->
        <div class="flex items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
          <button
            type="button"
            (click)="onClose.emit()"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
          >
            <span>&larr;</span>
            <span>Voltar aos Artigos</span>
          </button>

          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="copyLink()"
              class="text-xs text-slate-400 hover:text-lime-400 transition-colors flex items-center gap-1 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              <span>{{ copied() ? '✓ Link copiado!' : '🔗 Copiar Link' }}</span>
            </button>
            <button
              type="button"
              (click)="onClose.emit()"
              aria-label="Fechar artigo"
              class="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-700"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Article Meta Header -->
        <div class="mb-8">
          <div class="flex flex-wrap items-center gap-2 mb-4">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-lime-500/10 text-lime-400 border border-lime-500/20 uppercase tracking-wider">
              {{ article().category }}
            </span>
            <span class="text-slate-500 text-xs">•</span>
            <span class="text-slate-400 text-xs">{{ article().date }}</span>
            <span class="text-slate-500 text-xs">•</span>
            <span class="text-slate-400 text-xs">{{ article().readTime }}</span>
          </div>

          <h1 id="reader-article-title" class="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            {{ article().title }}
          </h1>

          @if (article().summary) {
            <p class="text-base sm:text-lg text-slate-400 leading-relaxed mb-6 font-normal">
              {{ article().summary }}
            </p>
          }

          <!-- Author Card -->
          <div class="flex items-center gap-3 pt-2">
            <img [ngSrc]="article().coverImage" width="44" height="44" alt="Robson Cassiano" class="w-11 h-11 rounded-full border border-slate-700 object-cover aspect-square">
            <div>
              <p class="text-sm font-bold text-white">{{ article().author }}</p>
              <p class="text-xs text-slate-400">Senior Software Engineer & Mentor Internacional</p>
            </div>
          </div>
        </div>

        <!-- Article Parsed Markdown Content -->
        <div class="article-markdown text-slate-300 text-base leading-relaxed border-b border-slate-800 pb-10 mb-10" [innerHTML]="parsedContent()">
        </div>

        <!-- Mentorship CTA Banner -->
        <div class="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-lime-500/30 shadow-xl relative overflow-hidden">
          <div class="inline-block px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs font-bold mb-3 uppercase tracking-wider">
            Acelere sua Carreira Internacional
          </div>
          <h3 class="text-xl sm:text-2xl font-bold text-white mb-2">
            Quer conquistar contratos de R$ 30k+ a R$ 60k+/mês no exterior?
          </h3>
          <p class="text-slate-400 text-sm leading-relaxed mb-6">
            No programa <strong>Descomplica DEV Na Gringa</strong>, você domina simulações reais de entrevistas técnicas em inglês ("Real English"), negociação salarial em moeda forte e posicionamento estratégico global.
          </p>
          <div class="flex flex-wrap gap-4">
            <a
              href="https://global.robsoncassiano.software/"
              target="_blank"
              rel="noopener noreferrer"
              class="px-6 py-3 bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-lime-500/20 inline-flex items-center gap-2"
            >
              <span>Ver Casos Reais & Mentoria</span>
              <span>&rarr;</span>
            </a>
            <button
              type="button"
              (click)="onClose.emit()"
              class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Continuar lendo outros artigos
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .article-markdown {
      h1 {
        font-size: 1.75rem;
        font-weight: 800;
        color: #ffffff;
        margin-top: 2rem;
        margin-bottom: 1rem;
        line-height: 1.3;
      }
      h2 {
        font-size: 1.4rem;
        font-weight: 700;
        color: #ffffff;
        margin-top: 2rem;
        margin-bottom: 0.75rem;
        border-left: 4px solid #a3e635;
        padding-left: 0.75rem;
      }
      h3 {
        font-size: 1.2rem;
        font-weight: 700;
        color: #a3e635;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
      }
      p {
        margin-bottom: 1.25rem;
        line-height: 1.8;
        color: #cbd5e1;
        font-size: 1.05rem;
      }
      ul, ol {
        margin-left: 1.5rem;
        margin-bottom: 1.25rem;
        color: #cbd5e1;
        list-style-type: disc;
      }
      ol {
        list-style-type: decimal;
      }
      li {
        margin-bottom: 0.5rem;
        line-height: 1.6;
      }
      strong {
        color: #ffffff;
        font-weight: 700;
      }
      em {
        color: #e2e8f0;
        font-style: italic;
      }
      blockquote {
        border-left: 4px solid #a3e635;
        padding: 1rem 1.25rem;
        margin: 1.5rem 0;
        background: rgba(30, 41, 59, 0.6);
        border-radius: 0 0.75rem 0.75rem 0;
        color: #e2e8f0;
        font-style: italic;
      }
      blockquote p {
        margin-bottom: 0;
      }
      pre {
        background: #020617;
        border: 1px solid #1e293b;
        border-radius: 0.75rem;
        padding: 1.25rem;
        overflow-x: auto;
        margin: 1.5rem 0;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.875rem;
        color: #a3e635;
        background: rgba(15, 23, 42, 0.9);
        padding: 0.2rem 0.4rem;
        border-radius: 0.25rem;
      }
      pre code {
        color: #f1f5f9;
        background: transparent;
        padding: 0;
        font-size: 0.875rem;
        line-height: 1.6;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;
        border: 1px solid #334155;
        border-radius: 0.75rem;
        overflow: hidden;
      }
      th {
        background-color: #1e293b;
        color: #ffffff;
        font-weight: 700;
        text-align: left;
        padding: 0.75rem 1rem;
        border: 1px solid #334155;
        font-size: 0.9rem;
      }
      td {
        padding: 0.75rem 1rem;
        border: 1px solid #334155;
        color: #cbd5e1;
        font-size: 0.95rem;
      }
      tr:nth-child(even) {
        background-color: rgba(30, 41, 59, 0.4);
      }
      hr {
        border-color: #1e293b;
        margin: 2rem 0;
      }
      a {
        color: #a3e635;
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      a:hover {
        color: #bef264;
      }
      .article-video-callout {
        margin: 2.5rem 0;
        padding: 1.5rem;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.95));
        border: 1px solid rgba(239, 68, 68, 0.35);
        border-radius: 1rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);

        .video-wrapper {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%;
          height: 0;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid #334155;
          background-color: #020617;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          margin-top: 0.75rem;

          iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 0;
          }
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleReaderComponent {
  private sanitizer = inject(DomSanitizer);

  article = input.required<Article>();
  onClose = output<void>();

  readonly copied = signal(false);

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.onClose.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose.emit();
    }
  }

  readonly parsedContent = computed<SafeHtml>(() => {
    let raw = this.article().content || '';
    // Remove duplicate top h1 title from markdown if present
    raw = raw.replace(/^#\s+[^\n]+\n+/, '');

    let parsed = marked.parse(raw, { gfm: true, breaks: false }) as string;

    const videoId = this.article().youtubeVideoId;
    if (videoId) {
      const videoBox = `
        <div class="article-video-callout">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">Gravação Original</span>
            <span class="text-xs text-slate-300 font-semibold">🎥 Quer se aprofundar? Assista à transmissão que deu origem a este ensaio:</span>
          </div>
          <div class="video-wrapper">
            <iframe 
              src="https://www.youtube.com/embed/${videoId}?rel=0" 
              title="Transmissão Original - Robson Cassiano" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      `;

      let count = 0;
      let injected = false;
      parsed = parsed.replace(/<\/h2>/g, (match) => {
        count++;
        if (count === 2) {
          injected = true;
          return match + videoBox;
        }
        return match;
      });

      if (!injected) {
        if (count === 1) {
          parsed = parsed.replace(/<\/h2>/, (match) => match + videoBox);
        } else {
          parsed += videoBox;
        }
      }
    }

    return this.sanitizer.bypassSecurityTrustHtml(parsed);
  });

  copyLink() {
    const url = this.article().canonicalUrl || window.location.href;
    navigator.clipboard.writeText(url);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2500);
  }
}
