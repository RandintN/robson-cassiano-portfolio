import { Injectable, signal, computed } from '@angular/core';

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
  content: string;
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
    this.loadArticles();
  }

  async loadArticles() {
    try {
      const [res, resEn] = await Promise.all([
        fetch('assets/content/articles.json'),
        fetch('assets/content/articles.en.json')
      ]);

      if (res.ok) {
        const data = await res.json();
        this.articlesData.set(data);
      }
      if (resEn.ok) {
        const dataEn = await resEn.json();
        this.articlesEnData.set(dataEn);
      }
    } catch (e) {
      console.error('Falha ao carregar artigos:', e);
    }
  }

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
  }
}
