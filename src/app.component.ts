
import { Component, signal, inject, effect, computed, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RoleCardComponent } from './components/role-card.component';
import { PostItemComponent } from './components/post-item.component';
import { LanguageService, Language } from './app/services/language.service';
import { TranslatePipe } from './app/pipes/translate.pipe';
import { Title, Meta } from '@angular/platform-browser';

interface SocialLink {
  name: string;
  url: string;
  icon: string;
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private languageService = inject(LanguageService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  currentYear = signal(new Date().getFullYear());
  currentLanguage = this.languageService.language;

  profileImage = signal('https://raw.githubusercontent.com/SimpleSoftwareLTDA/treinamento-descomplica-dev-na-gringa/refs/heads/master/img/mentor/robson-cassiano-mentor.jpg');

  socials = signal<SocialLink[]>([
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/robsoncassiano-software/', icon: 'fab fa-linkedin-in' },
    { name: 'GitHub', url: 'https://github.com/randintn', icon: 'fab fa-github' },
    { name: 'Instagram', url: 'https://www.instagram.com/robsoncassiano.software/', icon: 'fab fa-instagram' },
    { name: 'YouTube', url: 'https://www.youtube.com/@RobsonCassianoSoftware', icon: 'fab fa-youtube' },
    { name: 'Twitter', url: 'https://twitter.com/RobsonDev', icon: 'fab fa-twitter' }
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

      this.titleService.setTitle(title);
      this.metaService.updateTag({ name: 'description', content: description });
      this.metaService.updateTag({ property: 'og:title', content: title });
      this.metaService.updateTag({ property: 'og:description', content: description });
      this.metaService.updateTag({ name: 'twitter:title', content: title });
      this.metaService.updateTag({ name: 'twitter:description', content: description });
      this.metaService.updateTag({ property: 'og:locale', content: this.currentLanguage() === 'pt' ? 'pt_BR' : 'en_US' });

      this.updateStructuredData();
    });
  }

  private updateStructuredData() {
    const lang = this.currentLanguage();
    const isPt = lang === 'pt';

    const personSchema = {
      "@context": "https://schema.org/",
      "@type": "Person",
      "name": "Robson Cassiano",
      "alternateName": "Robson Cassiano Software",
      "url": "https://eu.robsoncassiano.software/",
      "image": {
        "@type": "ImageObject",
        "url": "https://raw.githubusercontent.com/SimpleSoftwareLTDA/treinamento-descomplica-dev-na-gringa/refs/heads/master/img/mentor/robson-cassiano-mentor.jpg",
        "width": 500,
        "height": 500
      },
      "sameAs": [
        "https://www.linkedin.com/in/robsoncassiano-software/",
        "https://github.com/randintn",
        "https://www.instagram.com/robsoncassiano.software/",
        "https://www.youtube.com/@RobsonCassianoSoftware",
        "https://twitter.com/RobsonDev"
      ],
      "jobTitle": isPt ? "Senior Software Engineer" : "Senior Software Engineer",
      "description": this.languageService.translate('SEO_DESCRIPTION'),
      "knowsAbout": [
        "Java", "Spring Framework", "PostgreSQL", "Software Architecture", "International Career",
        "Backend Development", "Mentorship", "Philosophy", "English Teaching", "Entrepreneurship"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": this.languageService.translate('FAQ_Q1'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": this.languageService.translate('FAQ_A1')
          }
        },
        {
          "@type": "Question",
          "name": this.languageService.translate('FAQ_Q2'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": this.languageService.translate('FAQ_A2')
          }
        },
        {
          "@type": "Question",
          "name": this.languageService.translate('FAQ_Q3'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": this.languageService.translate('FAQ_A3')
          }
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
    scriptTag.text = JSON.stringify([personSchema, faqSchema]);
  }

  changeLanguage(lang: Language) {
    this.languageService.setLanguage(lang);
  }
}
