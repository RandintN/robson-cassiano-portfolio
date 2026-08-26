import { Component, signal, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslatePipe } from '../app/pipes/translate.pipe';

@Component({
  selector: 'app-newsletter-form',
  imports: [TranslatePipe],
  template: `
    <div class="relative overflow-hidden p-8 lg:p-10 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
      <!-- Glow effect -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 max-w-2xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs font-bold mb-4 uppercase tracking-wider">
          <span>📬 {{ (badge() ? badge() : 'NEWSLETTER_BADGE') | translate }}</span>
        </div>

        <h3 class="text-2xl lg:text-3xl font-extrabold text-white mb-3">
          {{ (title() ? title() : 'NEWSLETTER_TITLE') | translate }}
        </h3>

        <p class="text-slate-400 text-sm lg:text-base leading-relaxed mb-6">
          {{ (description() ? description() : 'NEWSLETTER_DESC') | translate }}
        </p>

        @if (state() === 'success') {
          <div class="p-4 rounded-xl bg-lime-500/10 border border-lime-500/30 text-lime-300 text-sm flex items-center gap-3">
            <svg class="w-6 h-6 shrink-0 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p class="font-bold">{{ 'NEWSLETTER_SUCCESS_TITLE' | translate }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ 'NEWSLETTER_SUCCESS_DESC' | translate }}</p>
            </div>
          </div>
        } @else {
          <form (submit)="subscribe($event)" class="space-y-3">
            <div class="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                [value]="name()"
                (input)="name.set($any($event.target).value)"
                [placeholder]="'NEWSLETTER_NAME_PLACEHOLDER' | translate"
                class="w-full sm:w-1/3 px-4 py-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all"
                [disabled]="state() === 'loading'"
              />

              <input
                type="email"
                required
                [value]="email()"
                (input)="email.set($any($event.target).value)"
                [placeholder]="'NEWSLETTER_EMAIL_PLACEHOLDER' | translate"
                class="w-full sm:w-2/3 px-4 py-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all"
                [disabled]="state() === 'loading'"
              />
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
              <p class="text-xs text-slate-500 flex items-center gap-1.5">
                <span>🔒</span> {{ 'NEWSLETTER_ZERO_SPAM' | translate }}
              </p>

              <button
                type="submit"
                [disabled]="state() === 'loading'"
                class="w-full sm:w-auto px-6 py-3.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-lime-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                @if (state() === 'loading') {
                  <svg class="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>{{ 'NEWSLETTER_LOADING' | translate }}</span>
                } @else {
                  <span>{{ (buttonLabel() ? buttonLabel() : 'NEWSLETTER_BUTTON') | translate }}</span>
                  <span>&rarr;</span>
                }
              </button>
            </div>

            @if (state() === 'error') {
              <p class="text-xs text-red-400 mt-2">{{ errorMessage() }}</p>
            }
          </form>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsletterFormComponent {
  badge = input<string>('');
  title = input<string>('');
  description = input<string>('');
  buttonLabel = input<string>('');
  source = input<string>('portfolio_home');

  readonly email = signal('');
  readonly name = signal('');
  readonly state = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  readonly errorMessage = signal('');

  async subscribe(event: Event) {
    event.preventDefault();
    const mail = this.email().trim();
    if (!mail || !mail.includes('@')) return;

    this.state.set('loading');
    this.errorMessage.set('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mail,
          name: this.name().trim(),
          source: this.source()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.state.set('success');
      } else {
        this.state.set('error');
        this.errorMessage.set(data.error || 'Erro ao processar inscrição. Tente novamente.');
      }
    } catch (e: any) {
      this.state.set('error');
      this.errorMessage.set('Erro de conexão com o servidor. Tente novamente.');
    }
  }
}
