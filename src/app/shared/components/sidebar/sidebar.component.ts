import { Component, input, output, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';
import { MENU_ITEMS, ICONS, MenuCategory, MenuItem } from '../../models/menu.model';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  // Inputs
  isOpen = input<boolean>(true);
  language = input<'en' | 'sk'>('en');
  
  // Outputs
  toggle = output<void>();
  
  // State
  menuItems = signal<MenuCategory[]>(MENU_ITEMS);
  icons = ICONS;
  activeRoute = signal<string>('');
  currentPath = signal<string>('');
  expandedCategories = signal<Set<string>>(new Set(['main', 'generators']));
  
  // Injected services
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  constructor() {}

  ngOnInit(): void {
    // Set initial active route
    const path = this.router.url.split('?')[0];
    this.activeRoute.set(path);
    this.currentPath.set(path);
    
    // Listen to route changes
    this.router.events.subscribe(() => {
      const newPath = this.router.url.split('?')[0];
      this.activeRoute.set(newPath);
      this.currentPath.set(newPath);
    });
  }
  
  onToggle(): void {
    this.toggle.emit();
  }
  
  toggleCategory(categoryId: string): void {
    this.expandedCategories.update(categories => {
      const newCategories = new Set(categories);
      if (newCategories.has(categoryId)) {
        newCategories.delete(categoryId);
      } else {
        newCategories.add(categoryId);
      }
      return newCategories;
    });
  }
  
  isCategoryExpanded(categoryId: string): boolean {
    return this.expandedCategories().has(categoryId);
  }
  
  isActive(item: MenuItem): boolean {
    return this.currentPath() === item.route || 
           this.currentPath().startsWith(item.route + '/');
  }
  
  private iconCache = new Map<string, SafeHtml>();

  getIcon(iconKey: string): SafeHtml {
    if (!this.iconCache.has(iconKey)) {
      const rawSvg = this.icons[iconKey] || this.icons['dashboard'];
      this.iconCache.set(iconKey, this.sanitizer.bypassSecurityTrustHtml(rawSvg));
    }
    return this.iconCache.get(iconKey)!;
  }
  
  getPath(item: MenuItem): string {
    return item.route;
  }
  
  getLabel(item: MenuItem): string {
    return item.title[this.language()] || item.label;
  }
  
  getItemsForCategory(categoryId: string): MenuItem[] {
    const categories = this.menuItems();
    const category = categories.find(c => c.id === categoryId);
    return category?.items || [];
  }
  
  setCurrentPath(path: string): void {
    this.currentPath.set(path);
  }
  
  // Translation helper (will be connected to main translations later)
  translate(key: string): string {
    const translations: { [key: string]: { en: string; sk: string } } = {
      menuMain: { en: 'Main', sk: 'Hlavné' },
      menuDashboard: { en: 'Dashboard', sk: 'Nástroje' },
      menuGenerators: { en: 'Generators', sk: 'Generátory' },
      menuIconGenerator: { en: 'Icon Generator', sk: 'Generátor ikon' },
      menuFaviconGenerator: { en: 'Favicon Generator', sk: 'Generátor faviconov' },
      menuBannerGenerator: { en: 'Banner Generator', sk: 'Generátor bannerov' },
      menuPngToHtml: { en: 'PNG to HTML', sk: 'PNG na HTML' },
      menuHistory: { en: 'History', sk: 'História' },
      menuSettings: { en: 'Settings', sk: 'Nastavenia' }
    };
    
    const lang = this.language();
    return translations[key]?.[lang] || key;
  }
}
