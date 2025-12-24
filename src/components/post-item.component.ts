
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '../app/pipes/translate.pipe';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-post-item',
  imports: [TranslatePipe, NgOptimizedImage],
  template: `
    <article class="p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
      <div class="flex items-center gap-3 mb-4">
        <img [ngSrc]="authorImage()" width="40" height="40" alt="Author" class="w-10 h-10 rounded-full border border-slate-700">
        <div>
          <h4 class="font-bold text-white text-sm">Robson Cassiano</h4>
          <p class="text-xs text-slate-500">{{ date() }}</p>
        </div>
        <div class="ml-auto">
          <span class="text-blue-400 text-xs bg-blue-400/10 px-2 py-1 rounded-full">LinkedIn</span>
        </div>
      </div>
      
      <p class="text-slate-300 text-sm leading-relaxed whitespace-pre-line mb-4">
        {{ content() }}
      </p>

      <div class="flex items-center gap-4 border-t border-slate-800 pt-4 text-slate-500 text-sm">
        <button class="flex items-center gap-1 hover:text-blue-400 transition-colors">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.05 9.02a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-1.6 12.5a5.1 5.1 0 1 1 0-10.2 5.1 5.1 0 0 1 0 10.2zm9.35-7.9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>
          {{ likes() }}
        </button>
        <button class="flex items-center gap-1 hover:text-blue-400 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          {{ 'COMMENT' | translate }}
        </button>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostItemComponent {
  authorImage = input.required<string>();
  date = input.required<string>();
  content = input.required<string>();
  likes = input<number>(0);
}
