
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '../app/pipes/translate.pipe';

@Component({
  selector: 'app-role-card',
  imports: [TranslatePipe],
  template: `
    <div class="h-full p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-lime-500/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-500/10">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-3 rounded-lg bg-slate-800 text-lime-400 group-hover:bg-lime-500 group-hover:text-slate-900 transition-colors">
          <i [class]="iconClass()" class="text-xl"></i>
        </div>
        <h3 class="text-xl font-bold text-white group-hover:text-lime-400 transition-colors">{{ title() }}</h3>
      </div>
      
      <p class="text-slate-400 leading-relaxed mb-4">
        <ng-content></ng-content>
      </p>

      @if (link()) {
        <a [href]="link()" target="_blank" class="inline-flex items-center text-sm font-semibold text-lime-400 hover:text-lime-300 transition-colors">
          {{ 'LEARN_MORE' | translate }} 
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleCardComponent {
  title = input.required<string>();
  iconClass = input.required<string>();
  link = input<string>();
}
