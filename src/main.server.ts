import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './app/app.component';

const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection()
  ]
}, context);

export default bootstrap;
