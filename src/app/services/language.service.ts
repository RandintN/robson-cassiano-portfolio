import { Injectable, signal, effect } from '@angular/core';

export type Language = 'br' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguage = signal<Language>(this.getInitialLanguage());
  
  // Translation maps
  private translations = signal<Record<Language, Record<string, string>>>({
    br: {},
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
        document.documentElement.lang = lang === 'br' ? 'pt-BR' : 'en';
      }
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        const isEn = window.location.pathname.startsWith('/en');
        this.currentLanguage.set(isEn ? 'en' : 'br');
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
        const saved = localStorage.getItem('preferred-language');
        if (saved === 'br' || saved === 'en') return saved as Language;
        if (saved === 'pt') return 'br';
      } catch (e) {}

      // 3. Raiz padrão em Português para alinhamento estrito de canonical e hreflang
      return 'br';
    }
    return 'br';
  }

  public async loadTranslations(): Promise<void> {
    try {
      const [brResponse, enResponse] = await Promise.all([
        fetch('assets/i18n/br.json'),
        fetch('assets/i18n/en.json')
      ]);

      if (!brResponse.ok || !enResponse.ok) {
        throw new Error(`Failed to fetch translations: br=${brResponse.status}, en=${enResponse.status}`);
      }
      
      const [br, en] = await Promise.all([
        brResponse.json(),
        enResponse.json()
      ]);
      
      this.translations.set({ br, en });
    } catch (e) {
      console.error('Failed to load translations', e);
      this.translations.set({ br: {}, en: {} });
    }
  }

  setLanguage(lang: Language) {
    this.currentLanguage.set(lang);

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const hash = window.location.hash || '';

      if (lang === 'en' && !currentPath.startsWith('/en')) {
        window.history.pushState(null, '', '/en/' + hash);
      } else if (lang === 'br' && currentPath.startsWith('/en')) {
        window.history.pushState(null, '', '/' + hash);
      }
    }
  }

  translate(key: string): string {
    const lang = this.currentLanguage();
    const translations = this.translations();
    const current = translations[lang]?.[key];
    if (current) return current;

    // Fall back to the other language before exposing the raw key (never leak KEY_NAME to users)
    const fallbackLang: Language = lang === 'br' ? 'en' : 'br';
    const fallback = translations[fallbackLang]?.[key];
    if (fallback) return fallback;

    console.warn(`[i18n] Missing translation for "${key}" in both br and en.`);
    return key;
  }
}
