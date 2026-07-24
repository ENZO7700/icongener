import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { IconGeneratorComponent } from './features/icon-generator/icon-generator.component';
import { FaviconGeneratorComponent } from './features/favicon-generator/favicon-generator.component';
import { BannerGeneratorComponent } from './features/banner-generator/banner-generator.component';
import { PngToHtmlComponent } from './features/png-to-html/png-to-html.component';
import { HistoryComponent } from './features/history/history.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard - IconGener'
      },
      {
        path: 'icon-generator',
        component: IconGeneratorComponent,
        title: 'Icon Generator - IconGener'
      },
      {
        path: 'favicon-generator',
        component: FaviconGeneratorComponent,
        title: 'Favicon Generator - IconGener'
      },
      {
        path: 'banner-generator',
        component: BannerGeneratorComponent,
        title: 'Banner Generator - IconGener'
      },
      {
        path: 'png-to-html',
        component: PngToHtmlComponent,
        title: 'PNG to HTML - IconGener'
      },
      {
        path: 'history',
        component: HistoryComponent,
        title: 'History - IconGener'
      },
      {
        path: 'settings',
        component: SettingsComponent,
        title: 'Settings - IconGener'
      },
      {
        path: '**',
        redirectTo: '/dashboard'
      }
    ]
  }
];
