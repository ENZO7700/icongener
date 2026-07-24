import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastService, ToastContainerComponent } from '../../core/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastContainerComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  // State
  language = signal<'en' | 'sk'>('en');
  theme = signal<'dark' | 'light'>('dark');
  apiKey = signal<string>('');
  showApiKey = signal<boolean>(false);
  
  // Injected services
  private toastService = inject(ToastService);
  
  constructor() {}
  
  ngOnInit(): void {
    // Load saved settings
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'en' || savedLang === 'sk') {
      this.language.set(savedLang);
    }
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.theme.set(savedTheme);
    }
    
    // The Mistral API key remains server-side and is never exposed to the browser.
    this.apiKey.set('');
  }
  
  // Translation helper
  translate(key: string): string {
    const translations: { [key: string]: { en: string; sk: string } } = {
      settings: { en: 'Settings', sk: 'Nastavenia' },
      description: { en: 'Configure application preferences', sk: 'Konfigurujte preferencie aplikácie' },
      appearance: { en: 'Appearance', sk: 'Vzhľad' },
      language: { en: 'Language', sk: 'Jazyk' },
      theme: { en: 'Theme', sk: 'Téma' },
      dark: { en: 'Dark', sk: 'Tmavá' },
      light: { en: 'Light', sk: 'Svetlá' },
      apiSettings: { en: 'API Settings', sk: 'Nastavenia API' },
      mistralApiKey: { en: 'Mistral API Key', sk: 'Kľúč Mistral API' },
      apiKeyDesc: { en: 'Enter your Mistral AI API key for generating content', sk: 'Zadajte svoj kľúč Mistral AI API pre generovanie obsahu' },
      showKey: { en: 'Show Key', sk: 'Zobraziť kľúč' },
      hideKey: { en: 'Hide Key', sk: 'Skryť kľúč' },
      save: { en: 'Save Settings', sk: 'Uložiť nastavenia' },
      saved: { en: 'Settings saved successfully!', sk: 'Nastavenia boli úspešne uložené!' },
      reset: { en: 'Reset to Defaults', sk: 'Resetovať na predvolené' },
      version: { en: 'Version', sk: 'Verzia' },
      about: { en: 'About', sk: 'O aplikácii' },
      aboutText: { en: 'IconGener is a comprehensive tool for generating icons, favicons, banners, and converting PNG to HTML.', sk: 'IconGener je komplexný nástroj na generovanie ikon, faviconov, bannerov a konverziu PNG na HTML.' }
    };
    
    return translations[key]?.[this.language()] || key;
  }
  
  // Save settings
  saveSettings(): void {
    // Save language
    localStorage.setItem('language', this.language());
    
    // Save theme
    localStorage.setItem('theme', this.theme());
    
    // Apply theme
    this.applyTheme();
    
    this.toastService.success(this.translate('saved'));
  }
  
  // Apply theme
  applyTheme(): void {
    const body = document.body;
    if (this.theme() === 'dark') {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    }
  }
  
  // Reset to defaults
  resetSettings(): void {
    this.language.set('en');
    this.theme.set('dark');
    this.saveSettings();
    this.toastService.success('Settings reset to defaults');
  }
  
  // Toggle API key visibility
  toggleApiKey(): void {
    this.showApiKey.update(show => !show);
  }
  
  // Set language
  setLanguage(lang: 'en' | 'sk'): void {
    this.language.set(lang);
  }
  
  // Set theme
  setTheme(theme: 'dark' | 'light'): void {
    this.theme.set(theme);
  }
  
  // Get version
  getVersion(): string {
    return '1.0.0';
  }
}
