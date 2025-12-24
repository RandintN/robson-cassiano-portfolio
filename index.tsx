

import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, APP_INITIALIZER } from '@angular/core';
import { AppComponent } from './src/app.component';
import { LanguageService } from './src/app/services/language.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    {
      provide: APP_INITIALIZER,
      useFactory: (langService: LanguageService) => () => langService.loadTranslations(),
      deps: [LanguageService],
      multi: true
    }
  ]
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
