import { Component, signal, inject, effect, computed, ChangeDetectionStrategy, OnInit, afterNextRender } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RoleCardComponent } from './components/role-card.component';
import { PostItemComponent } from './components/post-item.component';
import { LanguageService, Language } from './app/services/language.service';
import { TranslatePipe } from './app/pipes/translate.pipe';
import { Title, Meta } from '@angular/platform-browser';

export type SocialPlatform = 'linkedin' | 'github' | 'instagram' | 'youtube' | 'twitter';

interface SocialLink {
  id: SocialPlatform;
  name: string;
  url: string;
}

interface BlogPost {
  id: number;
  date: string;
  content: string;
  likes: number;
}

@Component({
  selector: 'app-root',
  imports: [NgOptimizedImage, RoleCardComponent, PostItemComponent, TranslatePipe],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private languageService = inject(LanguageService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

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

  posts = computed(() => {
    const lang = this.currentLanguage();
    if (lang === 'en') {
      return [
        {
          id: 1,
          date: 'May 2025',
          content: 'Just mixing good things doesn\'t make good code.\n\nUsing DDD, BDD concepts with Clean Arch, Hexagonal, and various crazy Design Patterns doesn\'t mean the codebase will be good.\n\nIt\'s like taking barbecue, which is good. And ice cream, which is also good, a pizza, and hitting it in the blender...\n\nWe need to have criteria when combining solutions; often, using just one of them well is enough.',
          likes: 12
        },
        {
          id: 2,
          date: 'May 2025',
          content: 'Not every problem is on the same level: Having to pay a mechanic to fix the yacht engine VS having to pick up aluminum cans from trash bins to supplement family income, both are problems, but very different...\n\nThe being can be characterized in its universal, particular, and individual aspects.',
          likes: 24
        },
        {
          id: 3,
          date: 'May 2025',
          content: 'DEV: The code is the documentation itself.\nAlso DEV: I don\'t understand the code I wrote 3 months ago...\n\nMost people think agile methodology is just not writing documentation lol',
          likes: 20
        },
        {
          id: 4,
          date: 'May 2025',
          content: 'Everyone has a little sad story to tell; mine isn\'t special, nor is yours, nor anyone\'s.\n\nThe fact is that we must force ourselves to improve more and more because the default is to stay in the shit today, or stay in the shit tomorrow if we do nothing and think we have stability.',
          likes: 18
        }
      ];
    }
    return [
      {
        id: 1,
        date: 'Maio 2025',
        content: 'Apenas misturar coisas boas não dá código bom.\n\nUsar conceitos de DDD, BDD, com Clean Arch, Hexagonal e vários Design Patterns cabulosos, não significa que vai ficar boa a codebase.\n\nÉ como pegar churrasco, que é bom. E sorvete, que também é bom, uma pizza, e bater no liquidificador...\n\nPrecisamos ter critério ao combinar as soluções, muitas vezes usar bem apenas uma delas já basta.',
        likes: 12
      },
      {
        id: 2,
        date: 'Maio 2025',
        content: 'Nem todo problema está no mesmo nível: Ter que pagar um mecânico para consertar o motor do iate VS ter que pegar latinhas de alumínio nas lixeiras para complementar a renda da família, ambos problemas, mas muito diferentes...\n\nO ente pode ser caracterizado em seus aspectos universal, particular e individual.',
        likes: 24
      },
      {
        id: 3,
        date: 'Maio 2025',
        content: 'DEV: O código é a própria documentação.\nAlso DEV: Não entendo o código que fiz 3 meses atrás...\n\nA maioria pensa que metodologia ágil é só não escrever documentação kkj',
        likes: 20
      },
      {
        id: 4,
        date: 'Maio 2025',
        content: 'Todo mundo tem uma histórinha triste para contar, a minha não é especial, nem a sua, nem a de ninguém.\n\nO fato é que devemos nos forçar a melhorar cada vez mais pois o default é ficar na merda hoje, ou ficar na merda amanhã senão fizermos nada e acharmos que temos estabilidade.',
        likes: 18
      }
    ];
  });

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
      this.metaService.updateTag({ property: 'og:url', content: 'https://eu.robsoncassiano.software/' });
      this.metaService.updateTag({ property: 'og:image', content: this.fullCanonicalImageUrl });
      this.metaService.updateTag({ property: 'og:locale', content: locale });

      this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.metaService.updateTag({ name: 'twitter:title', content: title });
      this.metaService.updateTag({ name: 'twitter:description', content: description });
      this.metaService.updateTag({ name: 'twitter:image', content: this.fullCanonicalImageUrl });

      this.metaService.updateTag({ name: 'language', content: languageTag });

      this.updateStructuredData();
    });

    // Carregamento diferido e altamente performático do script do Beehiiv no tempo ocioso (requestIdleCallback)
    afterNextRender(() => {
      if (typeof window === 'undefined') return;

      const loadBeehiiv = () => {
        if (document.querySelector('script[data-beehiiv-form="29cf3bde-b819-4c63-a234-623cd7b5b703"]')) return;
        const script = document.createElement('script');
        script.src = 'https://subscribe-forms.beehiiv.com/v3/loader.js';
        script.setAttribute('data-beehiiv-form', '29cf3bde-b819-4c63-a234-623cd7b5b703');
        script.async = true;
        document.body.appendChild(script);
      };

      if ('requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback(loadBeehiiv, { timeout: 3000 });
      } else {
        setTimeout(loadBeehiiv, 2000);
      }
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
