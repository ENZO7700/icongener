import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // State
  language = signal<'en' | 'sk'>('en');
  
  // Feature cards
  featureCards = signal([
    {
      id: 'icons',
      title: { en: 'Icon Generator', sk: 'Generátor ikon' },
      description: { en: 'Generate PWA, Android, and iOS icons in all required sizes', sk: 'Generujte ikony pre PWA, Android a iOS vo všetkých potrebných veľkostiach' },
      route: '/icon-generator',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>`,
      color: '#00d4ff'
    },
    {
      id: 'favicons',
      title: { en: 'Favicon Generator', sk: 'Generátor faviconov' },
      description: { en: 'Create favicons in all standard sizes for browsers', sk: 'Vytvorte favicony vo všetkých štandardných veľkostiach pre prehliadače' },
      route: '/favicon-generator',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <path d="M9 9h6v6H9z"/>
      </svg>`,
      color: '#10b981'
    },
    {
      id: 'banners',
      title: { en: 'Banner Generator', sk: 'Generátor bannerov' },
      description: { en: 'Generate banners for social media, websites, and ads', sk: 'Generujte bannery pre sociálne sieťe, webové stránky a reklamy' },
      route: '/banner-generator',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <path d="M7 10h10"/>
        <path d="M7 14h10"/>
      </svg>`,
      color: '#8b5cf6'
    },
    {
      id: 'png-to-html',
      title: { en: 'PNG to HTML', sk: 'PNG na HTML' },
      description: { en: 'Convert PNG images to perfect pixel HTML and CSS', sk: 'Konvertujte PNG obrázky na perfect pixel HTML a CSS' },
      route: '/png-to-html',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>`,
      color: '#f59e0b'
    },
    {
      id: 'history',
      title: { en: 'History', sk: 'História' },
      description: { en: 'View and manage all your generated assets', sk: 'Zobrazte a spravujte všetky vygenerované zdroje' },
      route: '/history',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>`,
      color: '#ef4444'
    },
    {
      id: 'settings',
      title: { en: 'Settings', sk: 'Nastavenia' },
      description: { en: 'Configure API keys and application settings', sk: 'Nastavte API kľúče a nastavenia aplikácie' },
      route: '/settings',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>`,
      color: '#6366f1'
    }
  ]);
  
  // Quick stats
  quickStats = signal([
    {
      label: { en: 'Total Generations', sk: 'Celkom generovaní' },
      value: '0',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>`,
      color: '#00d4ff'
    },
    {
      label: { en: 'Icons Generated', sk: 'Vygenerované ikony' },
      value: '0',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>`,
      color: '#10b981'
    },
    {
      label: { en: 'Storage Used', sk: 'Použité úložište' },
      value: '0 MB',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>`,
      color: '#8b5cf6'
    }
  ]);
  
  // Injected services
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  
  private safeIconCache = new Map<string, SafeHtml>();

  getSafeIcon(svg: string): SafeHtml {
    if (!this.safeIconCache.has(svg)) {
      this.safeIconCache.set(svg, this.sanitizer.bypassSecurityTrustHtml(svg));
    }
    return this.safeIconCache.get(svg)!;
  }
  
  hexToRgb(hex: string): string {
    const normalized = hex.replace('#', '');
    const value = Number.parseInt(normalized, 16);

    if (!Number.isFinite(value) || normalized.length !== 6) {
      return '0, 0, 0';
    }

    return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
  }

  ngOnInit(): void {
    // Load saved language
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'en' || savedLang === 'sk') {
      this.language.set(savedLang);
    }
    
    // Load stats from localStorage
    this.loadStats();
  }
  
  private loadStats(): void {
    // Load generation history from localStorage
    const history = localStorage.getItem('pwa-icon-generator-history');
    if (history) {
      try {
        const items = JSON.parse(history);
        this.quickStats.update(stats => [
          { ...stats[0], value: items.length.toString() },
          { ...stats[1], value: items.filter((i: any) => i.type === 'png' || i.type === 'svg').length.toString() },
          stats[2]
        ]);
      } catch (e) {
        console.error('Error loading stats:', e);
      }
    }
  }
  
  getTitle(card: any): string {
    return card.title[this.language()] || card.title.en;
  }
  
  getDescription(card: any): string {
    return card.description[this.language()] || card.description.en;
  }
  
  getLabel(stat: any): string {
    return stat.label[this.language()] || stat.label.en;
  }
}
