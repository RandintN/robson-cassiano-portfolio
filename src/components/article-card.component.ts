import { Component, input, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { ContentService, Article } from '../app/services/content.service';
import { LanguageService } from '../app/services/language.service';
import { TranslatePipe } from '../app/pipes/translate.pipe';

@Component({
  selector: 'app-article-card',
  imports: [TranslatePipe],
  template: `
    <article class="h-full p-6 rounded-2xl bg-gradient-to-b from-[#141418] to-[#0e0e12] border border-[#252530] hover:border-[#dfb15b]/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#dfb15b]/10 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#dfb15b]/10 text-[#dfb15b] border border-[#dfb15b]/25">
            {{ displayCategory() }}
          </span>
          <span class="text-xs text-slate-500">{{ displayReadTime() }}</span>
        </div>

        <h3 class="text-xl font-bold text-white group-hover:text-[#dfb15b] transition-colors leading-snug mb-3">
          <a [href]="'/artigos/' + article().slug + '/'" class="hover:text-[#dfb15b] focus:outline-none focus:underline">
            {{ displayTitle() }}
          </a>
        </h3>

        <p class="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
          {{ displaySummary() }}
        </p>

        <div class="flex flex-wrap gap-1.5 mb-4">
          @for (tag of article().tags; track tag) {
            <span class="text-[11px] text-slate-400 bg-[#1f1f27] border border-[#252530]/60 px-2 py-0.5 rounded-md">#{{ tag }}</span>
          }
        </div>
      </div>

      <div class="pt-4 border-t border-[#252530] flex items-center justify-between">
        <span class="text-xs text-slate-500">{{ article().date }}</span>
        <a
          [href]="'/artigos/' + article().slug + '/'"
          [attr.aria-label]="('READ_ARTICLE' | translate) + ': ' + displayTitle()"
          class="inline-flex items-center text-sm font-bold text-[#dfb15b] hover:text-[#f6e0a4] transition-colors gap-1.5"
        >
          <span>{{ 'READ_ARTICLE' | translate }}</span>
          <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
        </a>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCardComponent {
  private languageService = inject(LanguageService);
  private contentService = inject(ContentService);

  article = input.required<Article>();

  private enTranslation = computed(() => this.contentService.articlesEn()[this.article().slug]);
  private isEn = computed(() => this.languageService.language() === 'en');

  displayTitle = computed(() => {
    if (this.isEn() && this.enTranslation()) {
      return this.enTranslation()!.title;
    }
    return this.article().title;
  });

  displaySummary = computed(() => {
    if (this.isEn() && this.enTranslation()) {
      return this.enTranslation()!.summary;
    }
    return this.article().summary;
  });

  displayCategory = computed(() => {
    if (this.isEn() && this.enTranslation()) {
      return this.enTranslation()!.category;
    }
    return this.article().category;
  });

  displayReadTime = computed(() => {
    if (this.isEn() && this.enTranslation()) {
      return this.enTranslation()!.readTime;
    }
    return this.article().readTime;
  });
}
