import { Component, ChangeDetectionStrategy, AfterViewInit, inject, ElementRef, computed } from '@angular/core';
import { LanguageService } from '../app/services/language.service';

@Component({
  selector: 'app-capture-embed',
  template: `
    <div id="newsletter-container" class="w-full min-h-[440px] sm:min-h-[380px]">
      <!-- Skeleton de estabilidade visual para neutralizar Layout Shift (CLS) -->
      <div id="newsletter-skeleton" class="w-full h-full min-h-[380px] rounded-2xl bg-gradient-to-br from-[#141418] via-[#0e0e12] to-[#08080a] border border-[#dfb15b]/20 p-8 flex flex-col justify-center animate-pulse">
        <div class="w-48 h-6 bg-[#dfb15b]/10 rounded-full mb-4"></div>
        <div class="w-3/4 h-8 bg-white/10 rounded-lg mb-3"></div>
        <div class="w-full max-w-lg h-4 bg-slate-700/30 rounded mb-2"></div>
        <div class="w-2/3 h-4 bg-slate-700/30 rounded mb-6"></div>
        <div class="w-full h-12 bg-[#16161c] rounded-xl border border-[#252530]"></div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaptureEmbedComponent implements AfterViewInit {
  private readonly languageService = inject(LanguageService);
  private readonly el = inject(ElementRef);

  private readonly isEn = computed(() => this.languageService.language() === 'en');

  ngAfterViewInit() {
    if (typeof window === 'undefined') return;

    const container = document.getElementById('newsletter-container');
    if (container) {
      const removeSkeleton = () => {
        const skeleton = document.getElementById('newsletter-skeleton');
        if (skeleton) skeleton.remove();
      };

      const observer = new MutationObserver(() => {
        const hasOtherChildren = Array.from(container.children).some((child) => child.id !== 'newsletter-skeleton');
        if (hasOtherChildren) {
          removeSkeleton();
          observer.disconnect();
        }
      });
      observer.observe(container, { childList: true });
    }

    if (document.querySelector('script[src*="capture.robsoncassiano.software/embed.js"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://capture.robsoncassiano.software/embed.js';
    script.async = true;
    script.setAttribute('data-source', 'portfolio_home');
    script.setAttribute('data-mode', 'both');
    script.setAttribute('data-target', '#newsletter-container');
    script.setAttribute('data-turnstile-sitekey', '0x4AAAAAAEjUfJwT3yG_vHIF');
    script.setAttribute('data-ebook-url', 'https://robsoncassiano.software/7-passos-simples-dev-na-gringa');

    script.onload = () => {
      const skeleton = document.getElementById('newsletter-skeleton');
      if (skeleton) skeleton.remove();
    };

    if (this.isEn()) {
      script.setAttribute('data-badge', '🎁 Free Ebook & VIP Briefing');
      script.setAttribute('data-title', 'Download Free Playbook: 7 Simple Steps to Land a Global Remote Dev Job');
      script.setAttribute('data-description', 'Get instant access to the 7 Simple Steps playbook, high-throughput architecture breakdowns, and tactical negotiation strategies for senior remote roles.');
      script.setAttribute('data-button', 'Download Free Playbook');
    } else {
      script.setAttribute('data-badge', '📬 Guia Prático & Acesso VIP');
      script.setAttribute('data-title', 'Baixe o E-book: 7 Passos Simples para Conquistar sua Vaga DEV na Gringa');
      script.setAttribute('data-description', 'Receba o passo a passo para conquistar contratos de R$ 30k+/mês no exterior, dominar entrevistas técnicas em inglês e acessar análises de arquitetura sênior.');
      script.setAttribute('data-button', 'Baixar E-book & Acessar Lista VIP');
    }

    document.body.appendChild(script);
  }
}
