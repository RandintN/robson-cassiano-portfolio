import { Component, signal, ChangeDetectionStrategy, HostListener, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { TranslatePipe } from '../app/pipes/translate.pipe';

@Component({
  selector: 'app-newsletter-modal',
  imports: [TranslatePipe],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 overflow-y-auto bg-[#08080a]/85 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        (click)="onBackdropClick($event)"
      >
        <div
          class="relative w-full max-w-lg bg-gradient-to-br from-[#141418] via-[#0e0e12] to-[#08080a] border border-[#dfb15b]/30 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden my-8"
          (click)="$event.stopPropagation()"
        >
          <!-- Glowing background ambient light -->
          <div class="absolute -top-20 -right-20 w-56 h-56 bg-[#dfb15b]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-20 -left-20 w-56 h-56 bg-[#967432]/10 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Close button -->
          <button
            type="button"
            (click)="closeModal()"
            aria-label="Fechar modal"
            class="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#16161c] hover:bg-[#1f1f27] text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-[#252530]"
          >
            ✕
          </button>

          <!-- Header badge -->
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#dfb15b]/10 border border-[#dfb15b]/30 text-[#dfb15b] text-xs font-bold mb-4 uppercase tracking-wider">
            <span>{{ 'EXIT_MODAL_BADGE' | translate }}</span>
          </div>

          <h2 id="modal-title" class="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
            {{ 'EXIT_MODAL_TITLE' | translate }}
          </h2>

          <p class="text-slate-300 text-sm leading-relaxed mb-6">
            {{ 'EXIT_MODAL_SUBTITLE' | translate }}
          </p>

          <!-- Benefits List -->
          <ul class="space-y-2.5 mb-6 text-xs sm:text-sm text-slate-300">
            <li class="flex items-start gap-2.5">
              <span class="text-[#dfb15b] font-bold shrink-0 mt-0.5">✓</span>
              <span>{{ 'EXIT_MODAL_BENEFIT_1' | translate }}</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="text-[#dfb15b] font-bold shrink-0 mt-0.5">✓</span>
              <span>{{ 'EXIT_MODAL_BENEFIT_2' | translate }}</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="text-[#dfb15b] font-bold shrink-0 mt-0.5">✓</span>
              <span>{{ 'EXIT_MODAL_BENEFIT_3' | translate }}</span>
            </li>
          </ul>

          @if (state() === 'success') {
            <div class="p-5 rounded-xl bg-[#dfb15b]/10 border border-[#dfb15b]/30 text-[#f6e0a4] text-sm flex items-start gap-3">
              <svg class="w-6 h-6 shrink-0 text-[#dfb15b] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p class="font-bold text-base text-white">{{ 'EXIT_MODAL_SUCCESS_TITLE' | translate }}</p>
                <p class="text-xs text-slate-300 mt-1">{{ 'EXIT_MODAL_SUCCESS_DESC' | translate }}</p>
                <div class="flex flex-wrap items-center gap-3 mt-4">
                  <a
                    [href]="ebookUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-4 py-2.5 bg-gradient-to-r from-[#dfb15b] to-[#c99839] hover:from-[#f6e0a4] hover:to-[#dfb15b] text-[#08080a] font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5 shadow-md shadow-[#dfb15b]/20"
                  >
                    <span>📖 {{ 'EXIT_MODAL_SUCCESS_EBOOK_BTN' | translate }}</span>
                    <span>&rarr;</span>
                  </a>
                  <button
                    type="button"
                    (click)="closeModal()"
                    class="px-3 py-2.5 bg-[#16161c] hover:bg-[#1f1f27] text-slate-300 font-medium rounded-lg text-xs transition-colors border border-[#252530]"
                  >
                    {{ 'EXIT_MODAL_SUCCESS_BUTTON' | translate }}
                  </button>
                </div>
              </div>
            </div>
          } @else {
            <form (submit)="subscribe($event)" class="space-y-3.5">
              <div>
                <input
                  type="text"
                  [value]="name()"
                  (input)="name.set($any($event.target).value)"
                  [placeholder]="'EXIT_MODAL_NAME_PLACEHOLDER' | translate"
                  class="w-full px-4 py-3 rounded-xl bg-[#16161c] border border-[#252530] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#dfb15b] focus:ring-1 focus:ring-[#dfb15b] transition-all"
                  [disabled]="state() === 'loading'"
                />
              </div>

              <div>
                <input
                  type="email"
                  required
                  [value]="email()"
                  (input)="email.set($any($event.target).value)"
                  [placeholder]="'EXIT_MODAL_EMAIL_PLACEHOLDER' | translate"
                  class="w-full px-4 py-3 rounded-xl bg-[#16161c] border border-[#252530] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#dfb15b] focus:ring-1 focus:ring-[#dfb15b] transition-all"
                  [disabled]="state() === 'loading'"
                />
              </div>

              @if (state() === 'error') {
                <p class="text-xs text-red-400">{{ errorMessage() }}</p>
              }

              <!-- Cloudflare Turnstile Widget Container -->
              <div id="turnstile-modal-container" class="my-2 flex justify-center min-h-[65px]"></div>

              <button
                type="submit"
                [disabled]="state() === 'loading'"
                class="w-full py-3.5 bg-gradient-to-r from-[#dfb15b] to-[#c99839] hover:from-[#f6e0a4] hover:to-[#dfb15b] text-[#08080a] font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-[#dfb15b]/25 hover:shadow-[#dfb15b]/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                @if (state() === 'loading') {
                  <svg class="animate-spin h-4 w-4 text-[#08080a]" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>{{ 'EXIT_MODAL_LOADING' | translate }}</span>
                } @else {
                  <span>{{ 'EXIT_MODAL_BUTTON' | translate }}</span>
                  <span>&rarr;</span>
                }
              </button>

              <div class="text-center pt-2">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="text-xs text-slate-500 hover:text-slate-400 transition-colors underline underline-offset-2"
                >
                  {{ 'EXIT_MODAL_DISMISS' | translate }}
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsletterModalComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly isOpen = signal(false);
  readonly ebookUrl = 'https://robsoncassiano.software/7-passos-simples-dev-na-gringa';
  readonly email = signal('');
  readonly name = signal('');
  readonly state = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  readonly errorMessage = signal('');

  private widgetId: string | null = null;
  private readonly turnstileToken = signal<string>('');

  private readonly STORAGE_KEY = 'rc_newsletter_dismissed_at';
  private readonly SUBSCRIBED_KEY = 'rc_newsletter_subscribed';
  private readonly COOLDOWN_DAYS = 7;

  ngOnInit() {
    if (typeof window === 'undefined') return;

    // Expõe no window para testes ou acionamento manual
    (window as any).openNewsletterModal = () => this.openModal();
    (window as any).closeNewsletterModal = () => this.closeModal();

    // Não inicializa triggers automáticos se já for inscrito ou tiver fechado recentemente
    if (this.isUserExempt()) return;

    this.setupTriggers();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isOpen()) {
      this.closeModal();
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  private isUserExempt(): boolean {
    try {
      if (localStorage.getItem(this.SUBSCRIBED_KEY) === 'true') {
        return true;
      }

      const dismissedAt = localStorage.getItem(this.STORAGE_KEY);
      if (dismissedAt) {
        const diffMs = Date.now() - parseInt(dismissedAt, 10);
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays < this.COOLDOWN_DAYS) {
          return true;
        }
      }
    } catch (e) {
      // Ignora erro de localStorage desabilitado/privado
    }
    return false;
  }

  private setupTriggers() {
    // 1. Exit Intent (Desktop: mouse sai do topo da página)
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !this.isOpen() && !this.isUserExempt()) {
        this.openModal();
        document.removeEventListener('mouseleave', onMouseLeave);
      }
    };
    document.addEventListener('mouseleave', onMouseLeave);

    // 2. Timer de engajamento (aparece após 18 segundos de leitura)
    const timer = setTimeout(() => {
      if (!this.isOpen() && !this.isUserExempt()) {
        this.openModal();
        document.removeEventListener('mouseleave', onMouseLeave);
      }
    }, 18000);

    // 3. Scroll Trigger (aparece ao rolar mais de 60% da página)
    const onScroll = () => {
      if (this.isOpen() || this.isUserExempt()) return;
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercent >= 0.6) {
        this.openModal();
        window.removeEventListener('scroll', onScroll);
        clearTimeout(timer);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  openModal() {
    this.isOpen.set(true);
    this.state.set('idle');
    this.errorMessage.set('');
    this.cdr.detectChanges();
    setTimeout(() => this.renderTurnstile(), 50);
  }

  private renderTurnstile() {
    if (typeof window === 'undefined') return;
    const container = document.getElementById('turnstile-modal-container');
    if (!container) return;
    if ((window as any).turnstile) {
      try {
        container.innerHTML = '';
        this.widgetId = (window as any).turnstile.render(container, {
          sitekey: '0x4AAAAAAEjUfJwT3yG_vHIF',
          action: 'subscribe',
          theme: 'dark',
          callback: (token: string) => {
            this.turnstileToken.set(token);
          }
        });
      } catch (e) {}
    } else {
      setTimeout(() => this.renderTurnstile(), 200);
    }
  }

  closeModal() {
    this.isOpen.set(false);
    this.cdr.detectChanges();
    try {
      localStorage.setItem(this.STORAGE_KEY, Date.now().toString());
    } catch (e) {}
  }

  async subscribe(event: Event) {
    event.preventDefault();
    const mail = this.email().trim();
    if (!mail || !mail.includes('@')) {
      this.errorMessage.set('Por favor, informe um e-mail válido.');
      this.cdr.detectChanges();
      return;
    }

    this.state.set('loading');
    this.errorMessage.set('');
    this.cdr.detectChanges();

    const token = this.turnstileToken() || (this.widgetId ? (window as any).turnstile?.getResponse(this.widgetId) : '') || (window as any).turnstile?.getResponse() || '';

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mail,
          name: this.name().trim(),
          source: 'exit_intent_modal',
          turnstileToken: token || undefined
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.state.set('success');
        this.cdr.detectChanges();
        try {
          localStorage.setItem(this.SUBSCRIBED_KEY, 'true');
        } catch (e) {}
        if (typeof window !== 'undefined') {
          try {
            window.open(this.ebookUrl, '_blank');
          } catch (err) {}
        }
      } else {
        this.state.set('error');
        this.errorMessage.set(data.error || 'Erro ao processar inscrição. Tente novamente.');
        this.cdr.detectChanges();
      }
    } catch (e: any) {
      this.state.set('error');
      this.errorMessage.set('Erro de conexão com o servidor. Tente novamente.');
      this.cdr.detectChanges();
    } finally {
      this.cdr.detectChanges();
      if (typeof window !== 'undefined' && (window as any).turnstile?.reset && this.widgetId) {
        try { (window as any).turnstile.reset(this.widgetId); } catch (err) {}
      }
    }
  }
}
