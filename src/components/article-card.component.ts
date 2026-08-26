import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Article } from '../app/services/content.service';

@Component({
  selector: 'app-article-card',
  template: `
    <article class="h-full p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-lime-500/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-500/10 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-lime-500/10 text-lime-400 border border-lime-500/20">
            {{ article().category }}
          </span>
          <span class="text-xs text-slate-500">{{ article().readTime }}</span>
        </div>

        <h3 class="text-xl font-bold text-white group-hover:text-lime-400 transition-colors leading-snug mb-3">
          <a [href]="'/artigos/' + article().slug" class="hover:text-lime-400 focus:outline-none focus:underline">
            {{ article().title }}
          </a>
        </h3>

        <p class="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
          {{ article().summary }}
        </p>

        <div class="flex flex-wrap gap-1.5 mb-4">
          @for (tag of article().tags; track tag) {
            <span class="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">#{{ tag }}</span>
          }
        </div>
      </div>

      <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <span class="text-xs text-slate-500">{{ article().date }}</span>
        <a
          [href]="'/artigos/' + article().slug"
          [attr.aria-label]="'Ler artigo completo: ' + article().title"
          class="inline-flex items-center text-sm font-bold text-lime-400 hover:text-lime-300 transition-colors gap-1"
        >
          <span>Ler artigo</span>
          <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
        </a>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCardComponent {
  article = input.required<Article>();
}
