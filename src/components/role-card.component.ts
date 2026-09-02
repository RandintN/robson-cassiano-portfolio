import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '../app/pipes/translate.pipe';

export type RoleIcon = 'code' | 'compass' | 'briefcase' | 'language' | 'philosophy';

@Component({
  selector: 'app-role-card',
  imports: [TranslatePipe],
  template: `
    <div class="h-full p-6 rounded-2xl bg-gradient-to-b from-[#141418] to-[#0e0e12] border border-[#252530] hover:border-[#dfb15b]/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#dfb15b]/10 flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <div class="p-3 rounded-xl bg-[#1f1f27] text-[#dfb15b] border border-[#252530] group-hover:bg-[#dfb15b] group-hover:text-[#08080a] group-hover:border-[#dfb15b] transition-all duration-300 shadow-sm">
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
          <h3 class="text-xl font-bold text-white group-hover:text-[#dfb15b] transition-colors">{{ title() }}</h3>
        </div>
        
        <p class="text-slate-300 leading-relaxed mb-4">
          <ng-content></ng-content>
        </p>
      </div>

      @if (link()) {
        <div class="pt-2">
          <a [href]="link()" target="_blank" rel="noopener noreferrer"
            [attr.aria-label]="linkText() || (('LEARN_MORE_ABOUT' | translate) + ' ' + title())"
            class="inline-flex items-center text-sm font-semibold text-[#dfb15b] hover:text-[#f6e0a4] transition-colors">
            {{ linkText() || (('LEARN_MORE_ABOUT' | translate) + ' ' + title()) }}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleCardComponent {
  title = input.required<string>();
  icon = input.required<RoleIcon>();
  link = input<string>();
  linkText = input<string>();
}
