import { Component, signal, ChangeDetectionStrategy, HostListener, OnInit, inject } from '@angular/core';
import { TranslatePipe } from '../app/pipes/translate.pipe';

@Component({
  selector: 'app-newsletter-modal',
  imports: [TranslatePipe],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        (click)="onBackdropClick($event)"
      >
        <div
          class="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden my-8"
          (click)="$event.stopPropagation()"
        >
          <!-- Glowing background ambient light -->
          <div class="absolute -top-20 -right-20 w-56 h-56 bg-lime-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-20 -left-20 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Close button -->
          <button
            type="button"
            (click)="closeModal()"
            aria-label="Fechar modal"
            class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
          >
            ✕
          </button>

          <!-- Header badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs font-bold mb-4 uppercase tracking-wider">
            <span>{{ 'EXIT_MODAL_BADGE' | translate }}</span>
          </div>

          <h2 id="modal-title" class="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
            {{ 'EXIT_MODAL_TITLE' | translate }}
          </h2>

          <p class="text-slate-400 text-sm leading-relaxed mb-6">
            {{ 'EXIT_MODAL_SUBTITLE' | translate }}
          </p>

          <!-- Benefits List -->
          <ul class="space-y-2.5 mb-6 text-xs sm:text-sm text-slate-300">
            <li class="flex items-start gap-2.5">
              <span class="text-lime-400 font-bold shrink-0 mt-0.5">✓</span>
              <span>{{ 'EXIT_MODAL_BENEFIT_1' | translate }}</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="text-lime-400 font-bold shrink-0 mt-0.5">✓</span>
              <span>{{ 'EXIT_MODAL_BENEFIT_2' | translate }}</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="text-lime-400 font-bold shrink-0 mt-0.5">✓</span>
              <span>{{ 'EXIT_MODAL_BENEFIT_3' | translate }}</span>
            </li>
          </ul>

          @if (state() === 'success') {
            <div class="p-5 rounded-xl bg-lime-500/10 border border-lime-500/30 text-lime-300 text-sm flex items-start gap-3">
              <svg class="w-6 h-6 shrink-0 text-lime-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p class="font-bold text-base text-white">Inscrição confirmada com sucesso!</p>
                <p class="text-xs text-slate-300 mt-1">Enviamos as primeiras análises estratégicas para a sua caixa de entrada.</p>
                <button
                  type="button"
                  (click)="closeModal()"
                  class="mt-4 px-4 py-2 bg-lime-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-lime-400 transition-colors"
                >
                  Continuar navegando
                </button>
              </div>
            </div>
          } @else {
            <form (submit)="subscribe($event)" class="space-y-3.5">
              <div>
                <input
                  type="text"
                  [value]="name()"
                  (input)="name.set($any($event.target).value)"
                  placeholder="Seu primeiro nome"
                  class="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all"
                  [disabled]="state() === 'loading'"
                />
              </div>

              <div>
                <input
                  type="email"
                  required
                  [value]="email()"
                  (input)="email.set($any($event.target).value)"
                  placeholder="Seu melhor e-mail corporativo"
                  class="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all"
                  [disabled]="state() === 'loading'"
                />
              </div>

              @if (state() === 'error') {
                <p class="text-xs text-red-400">{{ errorMessage() }}</p>
              }

              <button
                type="submit"
                [disabled]="state() === 'loading'"
                class="w-full py-3.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-lime-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                @if (state() === 'loading') {
                  <svg class="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Garantindo acesso...</span>
                } @else {
                  <span>Receber Acesso Gratuito</span>
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
  readonly isOpen = signal(false);
  readonly email = signal('');
  readonly name = signal('');
  readonly state = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  readonly errorMessage = signal('');

  private readonly STORAGE_KEY = 'rc_newsletter_dismissed_at';
  private readonly SUBSCRIBED_KEY = 'rc_newsletter_subscribed';
  private readonly COOLDOWN_DAYS = 7;

  ngOnInit() {
    if (typeof window === 'undefined') return;

    // Não exibe se já for inscrito ou tiver fechado recentemente
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
  }

  closeModal() {
    this.isOpen.set(false);
    try {
      localStorage.setItem(this.STORAGE_KEY, Date.now().toString());
    } catch (e) {}
  }

  async subscribe(event: Event) {
    event.preventDefault();
    const mail = this.email().trim();
    if (!mail || !mail.includes('@')) {
      this.errorMessage.set('Por favor, informe um e-mail válido.');
      return;
    }

    this.state.set('loading');
    this.errorMessage.set('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mail,
          name: this.name().trim(),
          source: 'exit_intent_modal',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.state.set('success');
        try {
          localStorage.setItem(this.SUBSCRIBED_KEY, 'true');
        } catch (e) {}
      } else {
        this.state.set('error');
        this.errorMessage.set(data.error || 'Erro ao processar inscrição. Tente novamente.');
      }
    } catch (e) {
      this.state.set('error');
      this.errorMessage.set('Erro de conexão. Tente novamente.');
    }
  }
}
