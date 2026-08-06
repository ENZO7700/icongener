import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AiService } from '../../core/services/ai.service';
import { DownloadService } from '../../core/services/download.service';
import { ProgressService } from '../../core/services/progress.service';
import { ToastService, ToastContainerComponent } from '../../core/services/toast.service';

export interface FaviconSize {
  width: number;
  height: number;
  label: string;
  ico: boolean; // Whether to include in ICO file
}

export interface GeneratedFavicon {
  id: string;
  size: FaviconSize;
  svgCode: string;
  pngBase64: string;
  timestamp: number;
}

@Component({
  selector: 'app-favicon-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastContainerComponent],
  templateUrl: './favicon-generator.component.html',
  styleUrls: ['./favicon-generator.component.css']
})
export class FaviconGeneratorComponent implements OnInit {
  // State
  language = signal<'en' | 'sk'>('en');
  
  // Form inputs
  description = signal<string>('');
  faviconType = signal<'classic' | 'modern'>('modern');
  primaryColor = signal<string>('#00d4ff');
  secondaryColor = signal<string>('#ffffff');
  backgroundColor = signal<string>('transparent');
  
  // Generation state
  isGenerating = signal<boolean>(false);
  generatedFavicons = signal<GeneratedFavicon[]>([]);
  selectedFavicon = signal<GeneratedFavicon | null>(null);
  
  // Preview state
  previewSvg = signal<string | null>(null);
  
  // Injected services
  private aiService = inject(AiService);
  private downloadService = inject(DownloadService);
  readonly progressService = inject(ProgressService);
  private toastService = inject(ToastService);
  
  // Favicon sizes
  faviconSizes: FaviconSize[] = [
    { width: 16, height: 16, label: '16x16', ico: true },
    { width: 32, height: 32, label: '32x32', ico: true },
    { width: 48, height: 48, label: '48x48', ico: true },
    { width: 64, height: 64, label: '64x64', ico: true },
    { width: 96, height: 96, label: '96x96', ico: false },
    { width: 128, height: 128, label: '128x128', ico: false },
    { width: 180, height: 180, label: '180x180', ico: false },
    { width: 192, height: 192, label: '192x192', ico: false },
    { width: 256, height: 256, label: '256x256', ico: false },
    { width: 512, height: 512, label: '512x512', ico: false }
  ];
  
  constructor() {}
  
  ngOnInit(): void {
    // Load saved language
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'en' || savedLang === 'sk') {
      this.language.set(savedLang);
    }
  }
  
  // Translation helper
  translate(key: string): string {
    const translations: { [key: string]: { en: string; sk: string } } = {
      faviconGenerator: { en: 'Favicon Generator', sk: 'Generátor faviconov' },
      description: { en: 'Description', sk: 'Popis' },
      descriptionPlaceholder: { en: 'Describe your favicon (e.g., "A simple logo for my website")', sk: 'Popíšte svoj favicon (napr. "Jednoduché logo pre moju webovú stránku")' },
      faviconType: { en: 'Favicon Type', sk: 'Typ faviconu' },
      classic: { en: 'Classic (ICO + PNG)', sk: 'Klasický (ICO + PNG)' },
      modern: { en: 'Modern (PNG + SVG)', sk: 'Moderný (PNG + SVG)' },
      colors: { en: 'Colors', sk: 'Farby' },
      primaryColor: { en: 'Primary Color', sk: 'Primárna farba' },
      secondaryColor: { en: 'Secondary Color', sk: 'Sekundárna farba' },
      backgroundColor: { en: 'Background Color', sk: 'Farba pozadia' },
      transparent: { en: 'Transparent', sk: 'Priehľadné' },
      generate: { en: 'Generate Favicon', sk: 'Generovať favicon' },
      generating: { en: 'Generating...', sk: 'Generuje sa...' },
      downloadAll: { en: 'Download All', sk: 'Stiahnuť všetko' },
      preview: { en: 'Preview', sk: 'Náhľad' },
      noFavicons: { en: 'No favicons generated yet. Fill in the form and click Generate.', sk: 'Žiadne favicony nebolo vygenerované. Vyplňte formulár a kliknite na Generovať.' },
      download: { en: 'Download', sk: 'Stiahnuť' },
      browserPreview: { en: 'Browser Preview', sk: 'Náhľad v prehliadači' },
      sizes: { en: 'Sizes', sk: 'Veľkosti' }
    };
    
    return translations[key]?.[this.language()] || key;
  }
  
  // Select favicon for preview
  selectFavicon(favicon: GeneratedFavicon): void {
    this.selectedFavicon.set(favicon);
    this.previewSvg.set(favicon.svgCode);
  }
  
  // Generate favicon
  async generateFavicon(): Promise<void> {
    if (!this.description()) {
      this.toastService.error(this.translate('description') + ' is required');
      return;
    }
    
    this.isGenerating.set(true);
    this.generatedFavicons.set([]);
    this.previewSvg.set(null);
    
    // Start progress tracking
    const steps = [
      { id: 'generating-svg', label: 'Generating SVG', description: 'Creating base SVG favicon' },
      { id: 'converting-png', label: 'Converting to PNG', description: 'Converting SVG to PNG for all sizes' },
      { id: 'finalizing', label: 'Finalizing', description: 'Preparing download files' }
    ];
    
    this.progressService.start(steps);
    
    try {
      // Generate base SVG
      const svgCode = await this.generateBaseSvg();
      
      // Generate all sizes
      const favicons: GeneratedFavicon[] = [];
      
      for (const size of this.faviconSizes) {
        const pngBase64 = await this.svgToPng(svgCode, size.width, size.height);
        
        favicons.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          size,
          svgCode,
          pngBase64,
          timestamp: Date.now()
        });
      }
      
      this.generatedFavicons.set(favicons);
      
      // Set first favicon as preview
      if (favicons.length > 0) {
        this.selectFavicon(favicons[0]);
      }
      
      this.progressService.complete();
      this.toastService.success(`${favicons.length} favicons generated successfully!`);
      
    } catch (error) {
      console.error('Error generating favicon:', error);
      this.progressService.setError('Failed to generate favicon');
      this.toastService.error('Failed to generate favicon. Please try again.');
    } finally {
      this.isGenerating.set(false);
      this.progressService.stop();
    }
  }
  
  // Generate base SVG
  private async generateBaseSvg(): Promise<string> {
    const prompt = `
      Generate a simple, clean favicon icon for a ${this.description()}.
      Requirements:
      - Use primary color: ${this.primaryColor()} for main elements
      - Use secondary color: ${this.secondaryColor()} for accents
      - The icon should be simple and recognizable at 16x16 size
      - Use a minimalist design
      - Output only the SVG code without any additional text or markdown
      - The SVG should have a viewBox="0 0 100 100" attribute
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
  
  // Download single favicon
  downloadFavicon(favicon: GeneratedFavicon): void {
    const filename = `favicon-${favicon.size.width}x${favicon.size.height}.png`;
    this.downloadService.downloadPng(favicon.pngBase64, filename);
    this.toastService.success('Favicon downloaded successfully!');
  }
  
  // Download all favicons
  async downloadAllFavicons(): Promise<void> {
    if (this.generatedFavicons().length === 0) {
      this.toastService.warning('No favicons to download');
      return;
    }
    
    try {
      const files = this.generatedFavicons().map(favicon => ({
        name: `favicon-${favicon.size.width}x${favicon.size.height}.png`,
        content: favicon.pngBase64,
        type: 'image/png'
      }));
      
      // Add site.webmanifest
      const webmanifestContent = JSON.stringify({
        name: this.description() || 'App',
        short_name: 'App',
        icons: [
          { src: 'favicon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'favicon-512x512.png', sizes: '512x512', type: 'image/png' }
        ],
        theme_color: this.primaryColor(),
        background_color: this.backgroundColor() === 'transparent' ? '#ffffff' : this.backgroundColor(),
        display: 'standalone'
      }, null, 2);

      files.push({
        name: 'site.webmanifest',
        content: webmanifestContent,
        type: 'application/json'
      });
      
      await this.downloadService.downloadZip(files);
      this.toastService.success('Complete Favicon Suite & webmanifest downloaded!');
    } catch (error) {
      console.error('Error downloading favicons:', error);
      this.toastService.error('Failed to download favicons');
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
  getSafePngUrl(favicon: GeneratedFavicon): string {
    return this.downloadService.getSafePngUrl(favicon.pngBase64);
  }
  
  // Fallback SVG generator
  private getFallbackSvg(): string {
    return `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="60" height="60" fill="${this.primaryColor()}" rx="10" ry="10"/>
        <circle cx="50" cy="50" r="20" fill="${this.secondaryColor()}"/>
      </svg>
    `;
  }
  
  // Group favicons by type (ICO vs PNG)
  groupFaviconsByType(): { type: string; favicons: GeneratedFavicon[] }[] {
    const icoFavicons = this.generatedFavicons().filter(f => f.size.ico);
    const pngFavicons = this.generatedFavicons().filter(f => !f.size.ico);
    
    return [
      { type: 'ICO', favicons: icoFavicons },
      { type: 'PNG', favicons: pngFavicons }
    ];
  }
}
