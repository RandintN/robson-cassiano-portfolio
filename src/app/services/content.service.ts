import { Injectable, signal, computed } from '@angular/core';

/**
 * Item do catálogo de listagem (assets/content/articles-index.json).
 *
 * Os corpos em markdown não fazem parte deste payload: são insumo de build das
 * páginas pré-renderizadas em /artigos/{slug}/. Ver scripts/sync-content.js.
 */
export interface Article {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  tags: string[];
  summary: string;
  coverImage: string;
  canonicalUrl: string;
  youtubeVideoId?: string;
}

export interface ArticleTranslation {
  title: string;
  summary: string;
  category: string;
  readTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private readonly articlesData = signal<Article[]>([]);
  private readonly articlesEnData = signal<Record<string, ArticleTranslation>>({});
  readonly selectedCategory = signal<string>('all');

  readonly articles = computed(() => {
    const category = this.selectedCategory();
    const all = this.articlesData();
    if (category === 'all') return all;
    return all.filter(a => a.category.toLowerCase() === category.toLowerCase());
  });

  readonly articlesEn = this.articlesEnData.asReadonly();

  readonly categories = computed(() => {
    const set = new Set<string>();
    this.articlesData().forEach(a => set.add(a.category));
    return ['all', ...Array.from(set)];
  });

  constructor() {
    void this.loadArticles();
  }

  /**
   * Busca o catálogo de listagem, que traz apenas os campos usados nos cards.
   * O articles.json completo (com os corpos markdown) fica restrito ao build.
   */
  async loadArticles(): Promise<void> {
    try {
      const [res, resEn] = await Promise.all([
        fetch('assets/content/articles-index.json'),
        fetch('assets/content/articles.en.json')
      ]);

      if (res.ok) {
        this.articlesData.set(await res.json());
      } else {
        console.error(`Falha ao carregar o catálogo de artigos: HTTP ${res.status}`);
      }

      if (resEn.ok) {
        this.articlesEnData.set(await resEn.json());
      }
    } catch (error) {
      console.error('Falha ao carregar artigos:', error);
    }
  }

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
  }
}
