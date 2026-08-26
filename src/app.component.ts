import { Component, signal, inject, effect, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RoleCardComponent } from './components/role-card.component';
import { ArticleCardComponent } from './components/article-card.component';
import { NewsletterFormComponent } from './components/newsletter-form.component';
import { NewsletterModalComponent } from './components/newsletter-modal.component';
import { LanguageService, Language } from './app/services/language.service';
import { ContentService } from './app/services/content.service';
import { TranslatePipe } from './app/pipes/translate.pipe';
import { Title, Meta } from '@angular/platform-browser';

export type SocialPlatform = 'linkedin' | 'github' | 'instagram' | 'youtube' | 'twitter';

interface SocialLink {
  id: SocialPlatform;
  name: string;
  url: string;
}

@Component({
  selector: 'app-root',
  imports: [
    NgOptimizedImage,
    RoleCardComponent,
    ArticleCardComponent,
    NewsletterFormComponent,
    NewsletterModalComponent,
    TranslatePipe
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private languageService = inject(LanguageService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  readonly contentService = inject(ContentService);

  currentYear = signal(new Date().getFullYear());
  currentLanguage = this.languageService.language;

  // Local optimized image served on the same edge origin (Cloudflare Pages)
  profileImage = signal('assets/images/robson-cassiano-mentor.jpg');
  fullCanonicalImageUrl = 'https://eu.robsoncassiano.software/assets/images/robson-cassiano-mentor.jpg';

  socials = signal<SocialLink[]>([
    { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/in/robsoncassiano-software/' },
    { id: 'github', name: 'GitHub', url: 'https://github.com/randintn' },
    { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/robsoncassiano.software/' },
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/@RobsonCassianoSoftware' },
    { id: 'twitter', name: 'Twitter / X', url: 'https://x.com/RobsonDev' }
  ]);

  constructor() {
    effect(() => {
      const title = this.languageService.translate('SEO_TITLE');
      const description = this.languageService.translate('SEO_DESCRIPTION');
      const isPt = this.currentLanguage() === 'pt';
      const locale = isPt ? 'pt_BR' : 'en_US';
      const languageTag = isPt ? 'pt-BR' : 'en-US';

      this.titleService.setTitle(title);
      this.metaService.updateTag({ name: 'description', content: description });
      this.metaService.updateTag({ name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' });

      this.metaService.updateTag({ property: 'og:type', content: 'profile' });
      this.metaService.updateTag({ property: 'og:site_name', content: 'Robson Cassiano' });
      this.metaService.updateTag({ property: 'og:title', content: title });
      this.metaService.updateTag({ property: 'og:description', content: description });
      this.metaService.updateTag({ property: 'og:url', content: isPt ? 'https://eu.robsoncassiano.software/' : 'https://eu.robsoncassiano.software/en' });
      this.metaService.updateTag({ property: 'og:image', content: this.fullCanonicalImageUrl });
      this.metaService.updateTag({ property: 'og:locale', content: locale });

      this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.metaService.updateTag({ name: 'twitter:title', content: title });
      this.metaService.updateTag({ name: 'twitter:description', content: description });
      this.metaService.updateTag({ name: 'twitter:image', content: this.fullCanonicalImageUrl });

      this.metaService.updateTag({ name: 'language', content: languageTag });

      if (typeof document !== 'undefined') {
        const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (canonical) {
          canonical.href = isPt ? 'https://eu.robsoncassiano.software/' : 'https://eu.robsoncassiano.software/en';
        }
      }

      this.updateStructuredData();
    });
  }

  ngOnInit() {
    // Initialization hooks
  }

  private updateStructuredData() {
    const lang = this.currentLanguage();
    const isPt = lang === 'pt';

    const profilePageSchema = {
      "@type": "ProfilePage",
      "@id": "https://eu.robsoncassiano.software/#profilepage",
      "url": "https://eu.robsoncassiano.software/",
      "name": isPt ? "Robson Cassiano | Senior Software Engineer, Mentor e Filósofo" : "Robson Cassiano | Senior Software Engineer, Mentor and Philosopher",
      "inLanguage": isPt ? "pt-BR" : "en-US",
      "mainEntity": {
        "@type": "Person",
        "@id": "https://eu.robsoncassiano.software/#person",
        "name": "Robson Cassiano",
        "alternateName": ["RobsonDev", "Robson Cassiano Software", "randintn"],
        "url": "https://eu.robsoncassiano.software/",
        "image": {
          "@type": "ImageObject",
          "url": this.fullCanonicalImageUrl,
          "width": 500,
          "height": 500,
          "caption": "Robson Cassiano - Senior Software Engineer & Mentor Internacional"
        },
        "sameAs": [
          "https://www.linkedin.com/in/robsoncassiano-software/",
          "https://github.com/randintn",
          "https://www.instagram.com/robsoncassiano.software/",
          "https://www.youtube.com/@RobsonCassianoSoftware",
          "https://x.com/RobsonDev"
        ],
        "jobTitle": isPt ? "Senior Software Engineer & Mentor Internacional" : "Senior Software Engineer & International Career Mentor",
        "description": this.languageService.translate('SEO_DESCRIPTION'),
        "knowsAbout": [
          "Java Backend Development",
          "Spring Framework & Spring Boot",
          "PostgreSQL Database Optimization",
          "Software Architecture & Clean Architecture",
          "International Career Acceleration",
          "Remote Work Negotiation",
          "English for Software Engineers",
          "Classical Philosophy"
        ],
        "knowsLanguage": [
          { "@type": "Language", "name": "Portuguese", "alternateName": "pt-BR" },
          { "@type": "Language", "name": "English", "alternateName": "en" },
          { "@type": "Language", "name": "Japanese", "alternateName": "ja" },
          { "@type": "Language", "name": "Latin", "alternateName": "la" },
          { "@type": "Language", "name": "Ancient Greek", "alternateName": "grc" }
        ],
        "worksFor": {
          "@type": "Organization",
          "@id": "https://eu.robsoncassiano.software/#organization"
        },
        "founder": {
          "@type": "Organization",
          "@id": "https://eu.robsoncassiano.software/#organization"
        }
      }
    };

    const organizationSchema = {
      "@type": "Organization",
      "@id": "https://eu.robsoncassiano.software/#organization",
      "name": "Simple Software LTDA",
      "url": "https://www.linkedin.com/company/simple-software-sa/",
      "logo": this.fullCanonicalImageUrl,
      "founder": {
        "@type": "Person",
        "@id": "https://eu.robsoncassiano.software/#person"
      },
      "description": isPt
        ? "Software house e consultoria de alta engenharia fundada por Robson Cassiano."
        : "Software engineering company and consulting founded by Robson Cassiano."
    };

    const programSchema = {
      "@type": "EducationalOccupationalProgram",
      "@id": "https://global.robsoncassiano.software/#program",
      "name": "Descomplica DEV Na Gringa - Mentoria de Carreira Internacional",
      "description": isPt
        ? "Programa de mentoria e aceleração para desenvolvedores conquistarem contratos internacionais acima de R$ 30.000 mensais."
        : "Mentorship and career acceleration program for software engineers targeting $6k-$12k+/month remote roles.",
      "provider": {
        "@type": "Person",
        "@id": "https://eu.robsoncassiano.software/#person"
      },
      "url": "https://global.robsoncassiano.software/",
      "timeToComplete": "P3M",
      "occupationalCategory": "Software Developers",
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "BRL",
        "category": "Mentoria & Aceleração de Carreira",
        "availability": "https://schema.org/InStock",
        "url": "https://global.robsoncassiano.software/"
      }
    };

    const faqQuestions = [
      { q: 'FAQ_Q1', a: 'FAQ_A1' },
      { q: 'FAQ_Q2', a: 'FAQ_A2' },
      { q: 'FAQ_Q3', a: 'FAQ_A3' },
      { q: 'FAQ_Q4', a: 'FAQ_A4' },
      { q: 'FAQ_Q5', a: 'FAQ_A5' },
      { q: 'FAQ_Q6', a: 'FAQ_A6' },
      { q: 'FAQ_Q7', a: 'FAQ_A7' },
      { q: 'FAQ_Q8', a: 'FAQ_A8' }
    ];

    const faqSchema = {
      "@type": "FAQPage",
      "@id": "https://eu.robsoncassiano.software/#faq",
      "inLanguage": isPt ? "pt-BR" : "en-US",
      "mainEntity": faqQuestions.map(item => ({
        "@type": "Question",
        "name": this.languageService.translate(item.q),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": this.languageService.translate(item.a).replace(/<[^>]*>/g, '')
        }
      }))
    };

    const breadcrumbSchema = {
      "@type": "BreadcrumbList",
      "@id": "https://eu.robsoncassiano.software/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://eu.robsoncassiano.software/"
        }
      ]
    };

    let scriptTag = document.getElementById('structured-data') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'structured-data';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [profilePageSchema, organizationSchema, programSchema, faqSchema, breadcrumbSchema]
    });
  }

  changeLanguage(lang: Language) {
    this.languageService.setLanguage(lang);
  }
}
