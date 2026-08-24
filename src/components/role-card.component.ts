import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '../app/pipes/translate.pipe';

export type RoleIcon = 'code' | 'compass' | 'briefcase' | 'language' | 'philosophy';

@Component({
  selector: 'app-role-card',
  imports: [TranslatePipe],
  template: `
    <div class="h-full p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-lime-500/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-500/10">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-3 rounded-lg bg-slate-800 text-lime-400 group-hover:bg-lime-500 group-hover:text-slate-900 transition-colors">
          @switch (icon()) {
            @case ('code') {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            }
            @case ('compass') {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 100-18 9 9 0 000 18zM15 9l-6 2-2 6 6-2 2-6z"/>
              </svg>
            }
            @case ('briefcase') {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            }
            @case ('language') {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
              </svg>
            }
            @case ('philosophy') {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            }
          }
        </div>
        <h3 class="text-xl font-bold text-white group-hover:text-lime-400 transition-colors">{{ title() }}</h3>
      </div>
      
      <p class="text-slate-400 leading-relaxed mb-4">
        <ng-content></ng-content>
      </p>

      @if (link()) {
        <a [href]="link()" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-sm font-semibold text-lime-400 hover:text-lime-300 transition-colors">
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
  icon = input.required<RoleIcon>();
  link = input<string>();
}
