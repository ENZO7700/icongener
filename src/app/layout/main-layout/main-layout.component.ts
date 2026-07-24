// @ts-nocheck - Browser-only component, skip Node.js type checking
import { Component, signal, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit, AfterViewInit {
  // State
  isSidebarOpen = signal<boolean>(true);
  language = signal<'en' | 'sk'>('en');
  
  // ViewChild
  @ViewChild('mainContent') mainContent!: ElementRef;
  
  // Injected services
  private router = inject(Router);
  
  constructor() {}
  
  ngOnInit(): void {
    // Check if mobile on init
    this.checkMobile();
    
    // Load saved language preference
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'en' || savedLang === 'sk') {
      this.language.set(savedLang);
    }
  }
  
  ngAfterViewInit(): void {
    // Add padding to main content based on header height
    this.adjustContentPadding();
  }
  
  private checkMobile(): void {
    const isMobile = window.innerWidth <= 768;
    this.isSidebarOpen.set(!isMobile);
  }
  
  private adjustContentPadding(): void {
    const headerHeight = 64; // Fixed header height
    if (this.mainContent) {
      this.mainContent.nativeElement.style.paddingTop = `${headerHeight}px`;
    }
  }
  
  toggleSidebar(): void {
    this.isSidebarOpen.update(open => !open);
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
}
