
import { Injectable, signal, computed, effect } from '@angular/core';

export type Language = 'pt' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguage = signal<Language>(this.getInitialLanguage());
  
  // Translation maps
  private translations = signal<Record<Language, Record<string, string>>>({
    pt: {},
    en: {}
  });

  language = this.currentLanguage.asReadonly();

  constructor() {
    // Persist language choice
    effect(() => {
      localStorage.setItem('preferred-language', this.currentLanguage());
      document.documentElement.lang = this.currentLanguage();
    });
  }

  private getInitialLanguage(): Language {
    const saved = localStorage.getItem('preferred-language') as Language;
    if (saved === 'pt' || saved === 'en') return saved;
    
    const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en';
    return browserLang === 'pt' ? 'pt' : 'en';
  }

  public async loadTranslations(): Promise<void> {
    try {
      const [ptResponse, enResponse] = await Promise.all([
        fetch('assets/i18n/pt.json'),
        fetch('assets/i18n/en.json')
      ]);

      if (!ptResponse.ok || !enResponse.ok) {
        throw new Error(`Failed to fetch translations: pt=${ptResponse.status}, en=${enResponse.status}`);
      }
      
      const [pt, en] = await Promise.all([
        ptResponse.json(),
        enResponse.json()
      ]);
      
      this.translations.set({ pt, en });
    } catch (e) {
      console.error('Failed to load translations', e);
      // Fallback: provide at least empty objects so the app doesn't crash
      this.translations.set({ pt: {}, en: {} });
    }
  }

  setLanguage(lang: Language) {
    this.currentLanguage.set(lang);
  }

  translate(key: string): string {
    const lang = this.currentLanguage();
    const translations = this.translations();
    return translations[lang][key] || key;
  }
}
