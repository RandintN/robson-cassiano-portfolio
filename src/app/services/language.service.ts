import { Injectable, signal, effect } from '@angular/core';

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
    // Persist language choice and sync HTML lang attribute
    effect(() => {
      const lang = this.currentLanguage();
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('preferred-language', lang);
        } catch (e) {}
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
      }
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        const isEn = window.location.pathname.startsWith('/en');
        this.currentLanguage.set(isEn ? 'en' : 'pt');
      });
    }
  }

  private getInitialLanguage(): Language {
    if (typeof window !== 'undefined') {
      // 1. Prioridade máxima: URL direta (/en -> 'en')
      if (window.location.pathname.startsWith('/en')) {
        return 'en';
      }

      // 2. Preferência salva anteriormente
      try {
        const saved = localStorage.getItem('preferred-language') as Language;
        if (saved === 'pt' || saved === 'en') return saved;
      } catch (e) {}

      // 3. Detecção do navegador
      const browserLang = (navigator.language || 'en').toLowerCase();
      return browserLang.startsWith('pt') ? 'pt' : 'en';
    }
    return 'pt';
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
      this.translations.set({ pt: {}, en: {} });
    }
  }

  setLanguage(lang: Language) {
    this.currentLanguage.set(lang);

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const hash = window.location.hash || '';

      if (lang === 'en' && !currentPath.startsWith('/en')) {
        window.history.pushState(null, '', '/en' + hash);
      } else if (lang === 'pt' && currentPath.startsWith('/en')) {
        window.history.pushState(null, '', '/' + hash);
      }
    }
  }

  translate(key: string): string {
    const lang = this.currentLanguage();
    const translations = this.translations();
    return translations[lang][key] || key;
  }
}
