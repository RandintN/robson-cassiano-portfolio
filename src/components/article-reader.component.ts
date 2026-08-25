import { Component, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
import { Article } from '../app/services/content.service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-article-reader',
  imports: [NgOptimizedImage],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 md:p-10 flex justify-center items-start animate-fade-in">
      <div class="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 my-8">
        
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
              class="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Article Meta -->
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

          <h1 class="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            {{ article().title }}
          </h1>

          <!-- Author Mini Header -->
          <div class="flex items-center gap-3 pt-2">
            <img [ngSrc]="article().coverImage" width="40" height="40" alt="Robson Cassiano" class="w-10 h-10 rounded-full border border-slate-700 object-cover aspect-square">
            <div>
              <p class="text-sm font-bold text-white">{{ article().author }}</p>
              <p class="text-xs text-slate-400">Senior Software Engineer & Mentor Internacional</p>
            </div>
          </div>
        </div>

        <!-- Article Content -->
        <div class="prose prose-invert max-w-none text-slate-300 text-base leading-relaxed space-y-6 whitespace-pre-line border-b border-slate-800 pb-10 mb-10">
          {{ article().content }}
        </div>

        <!-- Pre-Sold Authority / Mentorship Box -->
        <div class="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-lime-500/30 shadow-xl relative overflow-hidden">
          <div class="inline-block px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs font-bold mb-3 uppercase tracking-wider">
            Acelere sua Carreira Internacional
          </div>
          <h3 class="text-xl sm:text-2xl font-bold text-white mb-2">
            Quer conquistar contratos de R$ 30k+ a R$ 60k+/mês no exterior?
          </h3>
          <p class="text-slate-400 text-sm leading-relaxed mb-6">
            O programa <strong>Descomplica DEV Na Gringa</strong> prepara desenvolvedores sênior com simulações reais de entrevistas técnicas em inglês, estratégias de negociação salarial e posicionamento no mercado global.
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleReaderComponent {
  article = input.required<Article>();
  onClose = output<void>();

  readonly copied = signal(false);

  copyLink() {
    const url = this.article().canonicalUrl || window.location.href;
    navigator.clipboard.writeText(url);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2500);
  }
}
