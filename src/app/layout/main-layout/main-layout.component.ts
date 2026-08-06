// @ts-nocheck - Browser-only component, skip Node.js type checking
import { Component, signal, OnInit, OnDestroy, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  // State
  isSidebarOpen = signal<boolean>(true);
  isMobile = signal<boolean>(false);
  language = signal<'en' | 'sk'>('en');
  
  // ViewChild
  @ViewChild('mainContent') mainContent!: ElementRef;
  
  // Injected services
  private router = inject(Router);
  private routerSub?: Subscription;
  private resizeListener?: () => void;
  
  constructor() {}
  
  ngOnInit(): void {
    // Check if mobile on init
    this.checkMobile();
    
    this.resizeListener = () => this.checkMobile();
    window.addEventListener('resize', this.resizeListener);
    
    // Auto-close sidebar on mobile after route change
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobile()) {
        this.closeSidebar();
      }
    });
    
    // Load saved language preference
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'en' || savedLang === 'sk') {
      this.language.set(savedLang);
    }
  }
  
  ngAfterViewInit(): void {
    this.adjustContentPadding();
  }
  
  private checkMobile(): void {
    const mobile = window.innerWidth <= 768;
    this.isMobile.set(mobile);
    if (mobile && this.isSidebarOpen()) {
      // Keep mobile closed by default
    }
  }
  
  private adjustContentPadding(): void {
    const headerHeight = 64;
    if (this.mainContent?.nativeElement) {
      this.mainContent.nativeElement.style.paddingTop = `${headerHeight}px`;
    }
  }
  
  toggleSidebar(): void {
    this.isSidebarOpen.update(open => !open);
  }
  
  openSidebar(): void {
    this.isSidebarOpen.set(true);
  }
  
  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
  
  closeSidebarMobile(): void {
    if (this.isMobile()) {
      this.closeSidebar();
    }
  }

  toggleLanguage(): void {
    const nextLang = this.language() === 'en' ? 'sk' : 'en';
    this.onLanguageChange(nextLang);
  }
  
  onLanguageChange(lang: 'en' | 'sk'): void {
    this.language.set(lang);
    localStorage.setItem('language', lang);
  }
  
  get sidebarClass(): string {
    return this.isSidebarOpen() ? 'sidebar-open' : 'sidebar-closed';
  }
  
  get contentClass(): string {
    return this.isSidebarOpen() ? 'content-shifted' : 'content-full';
  }

  getContentPadding(): string {
    return '64px';
  }

  getSidebarWidth(): string {
    return this.isSidebarOpen() ? (this.isMobile() ? '100%' : '280px') : '0px';
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }
}

