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
  theme = signal<'dark' | 'light' | 'system'>('dark');
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
    if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'system') {
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
  setTheme(theme: 'dark' | 'light' | 'system'): void {
    this.theme.set(theme);
  }
  
  // Compatibility getters/setters for tests
  get selectedLanguage(): string {
    return this.language();
  }
  set selectedLanguage(val: 'en' | 'sk') {
    this.language.set(val);
  }

  get selectedTheme(): string {
    return this.theme();
  }
  set selectedTheme(val: 'dark' | 'light' | 'system') {
    this.theme.set(val);
  }

  languages = ['en', 'sk'];
  themes = ['light', 'dark', 'system'];

  additionalSettings = [
    { name: 'Auto-save', description: 'Automatically save changes', enabled: true }
  ];

  onLanguageChange(): void {
    localStorage.setItem('language', this.language());
    this.applyLanguage();
  }

  onThemeChange(): void {
    localStorage.setItem('theme', this.theme());
    this.applyTheme();
  }

  applyLanguage(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', this.language());
    }
  }

  getCurrentLanguage(): string {
    return this.language();
  }

  getCurrentTheme(): string {
    return this.theme();
  }

  isDarkMode(): boolean {
    return this.theme() === 'dark';
  }

  getThemeClass(): string {
    return `${this.theme()}-theme`;
  }

  getLanguageLabel(lang: string): string {
    return lang === 'sk' ? 'Slovenský' : 'English';
  }

  getThemeLabel(theme: string): string {
    if (theme === 'light') return 'Light';
    if (theme === 'dark') return 'Dark';
    return 'System';
  }

  toggleSetting(index: number): void {
    if (this.additionalSettings[index]) {
      this.additionalSettings[index].enabled = !this.additionalSettings[index].enabled;
    }
  }

  getBuildDate(): string {
    return '2026-08-06';
  }

  checkForUpdates(): void {
    this.toastService.info('Checking for updates...');
  }

  exportSettings(): void {
    this.downloadJson({ language: this.language(), theme: this.theme() }, 'icongener-settings.json');
  }

  importSettings(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const parsed = JSON.parse(e.target.result);
          this.processImportedSettings(parsed);
        } catch {
          this.toastService.error('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  }

  processImportedSettings(settings: any): void {
    if (settings?.language === 'en' || settings?.language === 'sk') {
      this.selectedLanguage = settings.language;
    } else {
      this.selectedLanguage = 'en';
    }
    if (settings?.theme === 'dark' || settings?.theme === 'light') {
      this.selectedTheme = settings.theme;
    } else {
      this.selectedTheme = 'dark';
    }
    this.saveSettings();
  }

  downloadJson(data: any, filename: string): void {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getVersion(): string {
    return '1.0.0';
  }
}

