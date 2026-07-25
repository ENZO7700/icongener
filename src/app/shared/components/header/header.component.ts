// @ts-nocheck - Browser-only component, skip Node.js type checking
import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // Inputs
  title = input<string>('');
  language = input<'en' | 'sk'>('en');
  
  // Outputs
  toggleSidebar = output<void>();
  languageChange = output<'en' | 'sk'>();
  
  // State
  currentTime = signal<string>('');
  isMobile = signal<boolean>(false);
  hideOnScroll = signal<boolean>(false);
  
  // Injected services
  private router = inject(Router);
  
  constructor() {}
  
  ngOnInit(): void {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
    
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
    
    // Auto-hide header on scroll
    this.setupScrollListener();
  }
  
  private updateTime(): void {
    const now = new Date();
    this.currentTime.set(now.toLocaleTimeString(this.language(), { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
  }
  
  private checkMobile(): void {
    this.isMobile.set(window.innerWidth <= 768);
  }
  
  private setupScrollListener(): void {
    let lastScrollPosition = 0;
    
    window.addEventListener('scroll', () => {
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      
      // Hide header when scrolling down, show when scrolling up
      if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 64) {
        this.hideOnScroll.set(true);
      } else {
        this.hideOnScroll.set(false);
      }
      
      lastScrollPosition = currentScrollPosition;
    });
  }
  
  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
  
  onLanguageChange(lang: 'en' | 'sk'): void {
    this.languageChange.emit(lang);
  }
  
  get currentRoute(): string {
    return this.router.url.split('?')[0];
  }
  
  get pageTitle(): string {
    const route = this.currentRoute;
    
    const titles: { [key: string]: { en: string; sk: string } } = {
      '/dashboard': { en: 'Dashboard', sk: 'Nástroje' },
      '/icon-generator': { en: 'Icon Generator', sk: 'Generátor ikon' },
      '/favicon-generator': { en: 'Favicon Generator', sk: 'Generátor faviconov' },
      '/banner-generator': { en: 'Banner Generator', sk: 'Generátor bannerov' },
      '/png-to-html': { en: 'PNG to HTML', sk: 'PNG na HTML' },
      '/history': { en: 'History', sk: 'História' },
      '/settings': { en: 'Settings', sk: 'Nastavenia' }
    };
    
    const title = titles[route] || { en: 'IconGener', sk: 'IconGener' };
    return title[this.language()] || 'IconGener';
  }
  
  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.checkMobile());
    // Scroll listener will be garbage collected with the component
  }
}
