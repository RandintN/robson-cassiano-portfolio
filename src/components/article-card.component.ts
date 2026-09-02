import { Component, input, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Article } from '../app/services/content.service';
import { LanguageService } from '../app/services/language.service';
import { TranslatePipe } from '../app/pipes/translate.pipe';

const ARTICLE_TRANSLATIONS_EN: Record<string, { title: string; summary: string; category: string; readTime: string }> = {
  'por-que-spring-boot-domina-backend-global': {
    title: 'Why Spring Boot and Java Dominate the Most Lucrative Global Backend Contracts',
    summary: "While new frameworks emerge weekly, the Java/Spring ecosystem continues powering the world's most mission-critical and lucrative systems. Learn why US/EU enterprises pay over $8k/mo for engineers mastering this stack.",
    category: 'Software Engineering',
    readTime: '5 min read'
  },
  'polyworking-estrategia-multiplos-contratos-remotos': {
    title: 'The Polyworking Strategy: Managing Multiple Global USD/EUR Remote Contracts Securely',
    summary: 'A deep-dive technical and operational guide on structuring multiple international software contracts simultaneously without burnout, delivering high leverage and compounding wealth.',
    category: 'Career & Global Business',
    readTime: '7 min read'
  },
  'arquitetura-do-polyworking-estrategia-riscos-limites': {
    title: 'The Architecture of Polyworking: Strategy, Operational Risks, and Limits',
    summary: 'A structured engineering breakdown on managing multiple remote developer contracts simultaneously. Context switching, risk mitigation, ethics, and legal frameworks.',
    category: 'Career & Engineering',
    readTime: '6 min read'
  },
  'polyworking-nao-e-tao-vantajoso-quanto-pensa': {
    title: "Polyworking Isn't as Easy as You Think: The Hidden Risks of Multiple Jobs",
    summary: 'A frank, counter-intuitive analysis on context switching overhead, burnout risks, cognitive tax, and when deepening high-ticket specialization beats stacking low-rate contracts.',
    category: 'Career & Strategy',
    readTime: '7 min read'
  },
  'como-criar-diferencial-era-inteligencia-artificial': {
    title: 'Building Unfair Advantage as a Software Engineer in the AI Era',
    summary: 'Why syntactic coding is getting commoditized by LLMs and how classical reasoning, business architecture, and complex domain modeling become the ultimate moat.',
    category: 'Philosophy & Career',
    readTime: '8 min read'
  },
  'filosofia-classica-e-arquitetura-de-software': {
    title: 'Classical Philosophy & Software Architecture: What Socrates and Aristotle Teach About Clean Code',
    summary: 'Applying Greek logic, Aristotelian categorization, and first-principles thinking to decouple domain logic, design clean microservices, and eliminate cognitive debt.',
    category: 'Philosophy & Engineering',
    readTime: '8 min read'
  },
  'como-negociar-contratos-8k-mes-dev-java': {
    title: 'How to Negotiate $8,000+/Month Remote Contracts as an Enterprise Java Engineer',
    summary: 'Negotiation frameworks, positioning strategies, and communication protocols to command premium compensation in USD/EUR from international clients.',
    category: 'Career & Global Business',
    readTime: '6 min read'
  },
  'resiliencia-arquitetural-circuit-breaker-falhas-cascata': {
    title: 'Architectural Resilience: Implementing Circuit Breakers and Preventing Cascading Failures in Spring Boot',
    summary: 'Preventing distributed system outages using Resilience4j, bulkhead patterns, fallback strategies, and distributed tracing in production environments.',
    category: 'Software Engineering',
    readTime: '9 min read'
  },
  'mercado-real-engenharia-software-clecius-martinkoski': {
    title: 'The Real State of Software Engineering: Conversation with Clecius Martinkoski',
    summary: 'An unfiltered architectural debate on senior engineering reality, legacy code modernization, hiring trends, and career longevity.',
    category: 'Interviews & Market',
    readTime: '6 min read'
  },
  'otimizacao-com-open-telemetry-e-grafana': {
    title: 'Performance Optimization & Observability with OpenTelemetry and Grafana',
    summary: 'Practical enterprise guide on tracing distributed transactions, detecting latency spikes, and profiling Java Spring Boot microservices in production.',
    category: 'Software Engineering',
    readTime: '7 min read'
  }
};

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
          <a [href]="'/artigos/' + article().slug" class="hover:text-[#dfb15b] focus:outline-none focus:underline">
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
          [href]="'/artigos/' + article().slug"
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

  article = input.required<Article>();

  private enTranslation = computed(() => ARTICLE_TRANSLATIONS_EN[this.article().slug]);
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
