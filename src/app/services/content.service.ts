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
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private readonly articlesData = signal<Article[]>([]);
  readonly selectedArticle = signal<Article | null>(null);
  readonly selectedCategory = signal<string>('all');

  readonly articles = computed(() => {
    const category = this.selectedCategory();
    const all = this.articlesData();
    if (category === 'all') return all;
    return all.filter(a => a.category.toLowerCase() === category.toLowerCase());
  });

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
      const response = await fetch('assets/content/articles.json');
      if (response.ok) {
        const data = await response.json();
        this.articlesData.set(data);
      }
    } catch (e) {
      console.error('Falha ao carregar artigos:', e);
    }
  }

  selectArticle(slug: string) {
    const found = this.articlesData().find(a => a.slug === slug);
    this.selectedArticle.set(found || null);
  }

  closeArticle() {
    this.selectedArticle.set(null);
  }

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
  }
}
