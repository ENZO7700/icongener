import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AiService } from '../../core/services/ai.service';
import { DownloadService } from '../../core/services/download.service';
import { ProgressService } from '../../core/services/progress.service';
import { ToastService, ToastContainerComponent } from '../../core/services/toast.service';

export interface BannerPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: string;
}

export interface GeneratedBanner {
  id: string;
  preset: BannerPreset;
  svgCode: string;
  pngBase64: string;
  timestamp: number;
}

@Component({
  selector: 'app-banner-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastContainerComponent],
  templateUrl: './banner-generator.component.html',
  styleUrls: ['./banner-generator.component.css']
})
export class BannerGeneratorComponent implements OnInit {
  // State
  language = signal<'en' | 'sk'>('en');
  
  // Form inputs
  description = signal<string>('');
  selectedPresetId = signal<string>('');
  customWidth = signal<number>(1200);
  customHeight = signal<number>(630);
  primaryColor = signal<string>('#00d4ff');
  secondaryColor = signal<string>('#ffffff');
  backgroundColor = signal<string>('#1a1a2e');
  textContent = signal<string>('');
  
  // Generation state
  isGenerating = signal<boolean>(false);
  generatedBanners = signal<GeneratedBanner[]>([]);
  selectedBanner = signal<GeneratedBanner | null>(null);
  
  // Preview state
  previewSvg = signal<string | null>(null);
  
  // Injected services
  private aiService = inject(AiService);
  private downloadService = inject(DownloadService);
  readonly progressService = inject(ProgressService);
  private toastService = inject(ToastService);
  
  // Banner presets
  bannerPresets: BannerPreset[] = [
    // Social Media
    { id: 'facebook-cover', name: 'Facebook Cover', width: 820, height: 312, category: 'Social Media' },
    { id: 'facebook-post', name: 'Facebook Post', width: 1200, height: 630, category: 'Social Media' },
    { id: 'twitter-header', name: 'Twitter Header', width: 1500, height: 500, category: 'Social Media' },
    { id: 'twitter-post', name: 'Twitter Post', width: 1200, height: 675, category: 'Social Media' },
    { id: 'instagram-post', name: 'Instagram Post', width: 1080, height: 1080, category: 'Social Media' },
    { id: 'instagram-story', name: 'Instagram Story', width: 1080, height: 1920, category: 'Social Media' },
    { id: 'linkedin-banner', name: 'LinkedIn Banner', width: 1584, height: 396, category: 'Social Media' },
    { id: 'linkedin-post', name: 'LinkedIn Post', width: 1200, height: 627, category: 'Social Media' },
    { id: 'youtube-banner', name: 'YouTube Banner', width: 2560, height: 1440, category: 'Social Media' },
    { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', width: 1280, height: 720, category: 'Social Media' },
    { id: 'pinterest-pin', name: 'Pinterest Pin', width: 1000, height: 1500, category: 'Social Media' },
    { id: 'tiktok-video', name: 'TikTok Video', width: 1080, height: 1920, category: 'Social Media' },
    
    // Website
    { id: 'website-header', name: 'Website Header', width: 1920, height: 400, category: 'Website' },
    { id: 'website-banner', name: 'Website Banner', width: 1200, height: 300, category: 'Website' },
    { id: 'hero-section', name: 'Hero Section', width: 1440, height: 600, category: 'Website' },
    { id: 'feature-banner', name: 'Feature Banner', width: 800, height: 400, category: 'Website' },
    { id: 'popup-banner', name: 'Popup Banner', width: 600, height: 400, category: 'Website' },
    
    // Advertising
    { id: 'google-display', name: 'Google Display Ad', width: 300, height: 250, category: 'Advertising' },
    { id: 'google-display-large', name: 'Google Display Large', width: 336, height: 280, category: 'Advertising' },
    { id: 'leaderboard', name: 'Leaderboard', width: 728, height: 90, category: 'Advertising' },
    { id: 'medium-rectangle', name: 'Medium Rectangle', width: 300, height: 600, category: 'Advertising' },
    { id: 'wide-skyscraper', name: 'Wide Skyscraper', width: 160, height: 600, category: 'Advertising' },
    { id: 'billboard', name: 'Billboard', width: 970, height: 250, category: 'Advertising' },
    
    // Print
    { id: 'a4-landscape', name: 'A4 Landscape', width: 297, height: 210, category: 'Print' },
    { id: 'a4-portrait', name: 'A4 Portrait', width: 210, height: 297, category: 'Print' },
    { id: 'a5-landscape', name: 'A5 Landscape', width: 210, height: 148, category: 'Print' },
    { id: 'a5-portrait', name: 'A5 Portrait', width: 148, height: 210, category: 'Print' },
    
    // Mobile
    { id: 'mobile-wallpaper', name: 'Mobile Wallpaper', width: 1080, height: 1920, category: 'Mobile' },
    { id: 'mobile-app-banner', name: 'Mobile App Banner', width: 640, height: 200, category: 'Mobile' },
    { id: 'tablet-banner', name: 'Tablet Banner', width: 1024, height: 400, category: 'Mobile' },
    
    // Custom
    { id: 'custom', name: 'Custom Size', width: 0, height: 0, category: 'Custom' }
  ];
  
  // Categories
  categories = computed(() => {
    const uniqueCategories = new Set<string>();
    this.bannerPresets.forEach(preset => uniqueCategories.add(preset.category));
    return Array.from(uniqueCategories);
  });
  
  // Filtered presets by category
  filteredPresets = computed(() => {
    const selectedCategory = this.selectedCategory();
    if (!selectedCategory) {
      return this.bannerPresets;
    }
    return this.bannerPresets.filter(p => p.category === selectedCategory);
  });
  
  // Selected category
  selectedCategory = signal<string>('');
  
  constructor() {}
  
  ngOnInit(): void {
    // Load saved language
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'en' || savedLang === 'sk') {
      this.language.set(savedLang);
    }
    
    // Set default preset
    if (this.bannerPresets.length > 0) {
      this.selectedPresetId.set(this.bannerPresets[0].id);
    }
  }
  
  // Translation helper
  translate(key: string): string {
    const translations: { [key: string]: { en: string; sk: string } } = {
      bannerGenerator: { en: 'Banner Generator', sk: 'Generátor bannerov' },
      description: { en: 'Description', sk: 'Popis' },
      descriptionPlaceholder: { en: 'Describe your banner (e.g., "Promotional banner for summer sale")', sk: 'Popíšte svoj banner (napr. "Propagačný banner pre letný výpredaj")' },
      textContent: { en: 'Text Content', sk: 'Textový obsah' },
      textContentPlaceholder: { en: 'Optional text to include in the banner', sk: 'Nepovinný text na vloženie do banneru' },
      preset: { en: 'Preset', sk: 'Prednastavenie' },
      customSize: { en: 'Custom Size', sk: 'Vlastná veľkosť' },
      width: { en: 'Width', sk: 'Šírka' },
      height: { en: 'Height', sk: 'Výška' },
      pixels: { en: 'pixels', sk: 'pixelov' },
      colors: { en: 'Colors', sk: 'Farby' },
      primaryColor: { en: 'Primary Color', sk: 'Primárna farba' },
      secondaryColor: { en: 'Secondary Color', sk: 'Sekundárna farba' },
      backgroundColor: { en: 'Background Color', sk: 'Farba pozadia' },
      generate: { en: 'Generate Banner', sk: 'Generovať banner' },
      generating: { en: 'Generating...', sk: 'Generuje sa...' },
      downloadAll: { en: 'Download All', sk: 'Stiahnuť všetko' },
      preview: { en: 'Preview', sk: 'Náhľad' },
      noBanners: { en: 'No banners generated yet. Fill in the form and click Generate.', sk: 'Žiadne bannery nebolo vygenerované. Vyplňte formulár a kliknite na Generovať.' },
      download: { en: 'Download', sk: 'Stiahnuť' },
      bannerPreview: { en: 'Banner Preview', sk: 'Náhľad banneru' },
      allCategories: { en: 'All Categories', sk: 'Všetky kategórie' },
      selectPreset: { en: 'Select a preset or use custom size', sk: 'Vyberte prednastavenie alebo použite vlastnú veľkosť' }
    };
    
    return translations[key]?.[this.language()] || key;
  }
  
  // Select preset
  selectPreset(presetId: string): void {
    this.selectedPresetId.set(presetId);
    const preset = this.bannerPresets.find(p => p.id === presetId);
    if (preset && preset.id !== 'custom') {
      this.customWidth.set(preset.width);
      this.customHeight.set(preset.height);
    }
  }
  
  // Select category
  selectCategory(category: string): void {
    this.selectedCategory.set(category === this.selectedCategory() ? '' : category);
  }
  
  // Get selected preset
  getSelectedPreset(): BannerPreset | null {
    return this.bannerPresets.find(p => p.id === this.selectedPresetId()) || null;
  }
  
  // Select banner for preview
  selectBanner(banner: GeneratedBanner): void {
    this.selectedBanner.set(banner);
    this.previewSvg.set(banner.svgCode);
  }
  
  // Generate banner
  async generateBanner(): Promise<void> {
    if (!this.description()) {
      this.toastService.error(this.translate('description') + ' is required');
      return;
    }
    
    const width = this.customWidth();
    const height = this.customHeight();
    
    if (width <= 0 || height <= 0) {
      this.toastService.error('Please enter valid dimensions');
      return;
    }
    
    this.isGenerating.set(true);
    this.generatedBanners.set([]);
    this.previewSvg.set(null);
    
    // Start progress tracking
    const steps = [
      { id: 'generating-svg', label: 'Generating SVG', description: 'Creating base SVG banner' },
      { id: 'converting-png', label: 'Converting to PNG', description: 'Converting SVG to PNG' },
      { id: 'finalizing', label: 'Finalizing', description: 'Preparing download files' }
    ];
    
    this.progressService.start(steps);
    
    try {
      // Generate base SVG
      const svgCode = await this.generateBaseSvg();
      
      // Create banner
      const banner: GeneratedBanner = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        preset: {
          id: this.selectedPresetId(),
          name: this.getSelectedPreset()?.name || 'Custom',
          width: this.customWidth(),
          height: this.customHeight(),
          category: this.getSelectedPreset()?.category || 'Custom'
        },
        svgCode,
        pngBase64: await this.svgToPng(svgCode, this.customWidth(), this.customHeight()),
        timestamp: Date.now()
      };
      
      this.generatedBanners.set([banner]);
      this.selectBanner(banner);
      
      this.progressService.complete();
      this.toastService.success('Banner generated successfully!');
      
    } catch (error) {
      console.error('Error generating banner:', error);
      this.progressService.setError('Failed to generate banner');
      this.toastService.error('Failed to generate banner. Please try again.');
    } finally {
      this.isGenerating.set(false);
      this.progressService.stop();
    }
  }
  
  // Generate base SVG
  private async generateBaseSvg(): Promise<string> {
    const preset = this.getSelectedPreset();
    const presetName = preset?.name || 'Custom';
    const width = this.customWidth();
    const height = this.customHeight();
    const text = this.textContent();
    
    const prompt = `
      Generate a banner design for ${this.description()}.
      Requirements:
      - Banner dimensions: ${width}x${height} pixels
      - Preset: ${presetName}
      - Use primary color: ${this.primaryColor()} for main elements
      - Use secondary color: ${this.secondaryColor()} for accents
      - Use background color: ${this.backgroundColor()} for background
      ${text ? `- Include text: "${text}"` : ''}
      - The design should be clean, modern, and suitable for the specified use case
      - Output only the SVG code without any additional text or markdown
      - The SVG should have a viewBox="0 0 ${width} ${height}" attribute
      - Make sure the design fits well within the dimensions
    `;
    
    try {
      const svgCode = await this.aiService.generateSvg(prompt);
      return this.aiService.cleanSvgCode(svgCode);
    } catch (error) {
      console.error('Error generating base SVG:', error);
      // Return a fallback SVG
      return this.getFallbackSvg();
    }
  }
  
  // Convert SVG to PNG
  private async svgToPng(svgCode: string, width: number, height: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get 2D canvas context'));
          return;
        }
        
        // Fill background
        if (this.backgroundColor() !== 'transparent') {
          ctx.fillStyle = this.backgroundColor();
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.clearRect(0, 0, width, height);
        }
        
        // Draw SVG
        ctx.drawImage(img, 0, 0, width, height);
        
        const pngDataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        
        const base64 = pngDataUrl.split(',')[1];
        resolve(base64);
      };
      
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to render SVG to canvas'));
      };
      
      img.src = url;
    });
  }
  
  // Download single banner
  downloadBanner(banner: GeneratedBanner): void {
    const filename = `banner-${banner.preset.name.replace(/\s+/g, '-').toLowerCase()}-${banner.preset.width}x${banner.preset.height}.png`;
    this.downloadService.downloadPng(banner.pngBase64, filename);
    this.toastService.success('Banner downloaded successfully!');
  }
  
  // Download all banners
  async downloadAllBanners(): Promise<void> {
    if (this.generatedBanners().length === 0) {
      this.toastService.warning('No banners to download');
      return;
    }
    
    try {
      const files = this.generatedBanners().map(banner => ({
        name: `banner-${banner.preset.name.replace(/\s+/g, '-').toLowerCase()}-${banner.preset.width}x${banner.preset.height}.png`,
        content: banner.pngBase64,
        type: 'image/png'
      }));
      
      // Add SVG file
      if (this.generatedBanners().length > 0) {
        files.push({
          name: 'banner.svg',
          content: this.generatedBanners()[0].svgCode,
          type: 'image/svg+xml'
        });
      }
      
      await this.downloadService.downloadZip(files);
      this.toastService.success('All banners downloaded!');
    } catch (error) {
      console.error('Error downloading banners:', error);
      this.toastService.error('Failed to download banners');
    }
  }
  
  // Get safe SVG URL for preview
  getSafeSvgUrl(): string {
    if (!this.previewSvg()) {
      return '';
    }
    return this.downloadService.getSafeSvgUrl(this.previewSvg()!);
  }
  
  // Get safe PNG URL for preview
  getSafePngUrl(banner: GeneratedBanner): string {
    return this.downloadService.getSafePngUrl(banner.pngBase64);
  }
  
  // Fallback SVG generator
  private getFallbackSvg(): string {
    const width = this.customWidth();
    const height = this.customHeight();
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${width}" height="${height}" fill="${this.backgroundColor()}"/>
        <rect x="${width * 0.2}" y="${height * 0.3}" width="${width * 0.6}" height="${height * 0.4}" fill="${this.primaryColor()}" rx="10" ry="10"/>
        <circle cx="${width * 0.5}" cy="${height * 0.5}" r="${Math.min(width, height) * 0.15}" fill="${this.secondaryColor()}"/>
      </svg>
    `;
  }
  
  // Get banner aspect ratio
  getAspectRatio(banner: GeneratedBanner): string {
    const width = banner.preset.width;
    const height = banner.preset.height;
    const gcd = this.gcd(width, height);
    const ratioWidth = width / gcd;
    const ratioHeight = height / gcd;
    return `${ratioWidth}:${ratioHeight}`;
  }
  
  // Greatest Common Divisor helper
  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}
