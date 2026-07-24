import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconGeneratorService, GeneratedIcon, IconPlatform } from '../../core/services/icon-generator.service';
import { ProgressService } from '../../core/services/progress.service';
import { ToastService, ToastContainerComponent } from '../../core/services/toast.service';
import { DownloadService } from '../../core/services/download.service';

@Component({
  selector: 'app-icon-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastContainerComponent],
  templateUrl: './icon-generator.component.html',
  styleUrls: ['./icon-generator.component.css']
})
export class IconGeneratorComponent implements OnInit {
  // State
  language = signal<'en' | 'sk'>('en');
  
  // Form inputs
  description = signal<string>('');
  selectedPlatform = signal<string>('pwa');
  selectedShape = signal<'circle' | 'square' | 'rounded'>('rounded');
  primaryColor = signal<string>('#00d4ff');
  secondaryColor = signal<string>('#ffffff');
  backgroundColor = signal<string>('#1a1a2e');
  
  // Generation state
  isGenerating = signal<boolean>(false);
  generatedIcons = signal<GeneratedIcon[]>([]);
  selectedIcon = signal<GeneratedIcon | null>(null);
  
  // Preview state
  previewSvg = signal<string | null>(null);
  previewSize = signal<{ width: number; height: number }>({ width: 192, height: 192 });
  
  // Injected services
  private iconGeneratorService = inject(IconGeneratorService);
  readonly progressService = inject(ProgressService);
  private toastService = inject(ToastService);
  private downloadService = inject(DownloadService);
  
  // Computed properties
  platforms = this.iconGeneratorService.platforms;
  shapes = this.iconGeneratorService.shapes;
  
  currentPlatform = computed(() => {
    return this.iconGeneratorService.getPlatform(this.selectedPlatform());
  });
  
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
      iconGenerator: { en: 'Icon Generator', sk: 'Generátor ikon' },
      description: { en: 'Description', sk: 'Popis' },
      descriptionPlaceholder: { en: 'Describe your icon (e.g., "A modern app icon for a fitness tracker")', sk: 'Popíšte svoju ikonu (napr. "Moderná ikona pre fitness tracker")' },
      platform: { en: 'Platform', sk: 'Platforma' },
      shape: { en: 'Shape', sk: 'Tvar' },
      colors: { en: 'Colors', sk: 'Farby' },
      primaryColor: { en: 'Primary Color', sk: 'Primárna farba' },
      secondaryColor: { en: 'Secondary Color', sk: 'Sekundárna farba' },
      backgroundColor: { en: 'Background Color', sk: 'Farba pozadia' },
      generate: { en: 'Generate Icons', sk: 'Generovať ikony' },
      generating: { en: 'Generating...', sk: 'Generuje sa...' },
      downloadAll: { en: 'Download All (ZIP)', sk: 'Stiahnuť všetko (ZIP)' },
      preview: { en: 'Preview', sk: 'Náhľad' },
      selectSize: { en: 'Select a size to preview', sk: 'Vyberte veľkosť pre náhľad' },
      noIcons: { en: 'No icons generated yet. Fill in the form and click Generate.', sk: 'Žiadne ikony nebolo vygenerované. Vyplňte formulár a kliknite na Generovať.' },
      download: { en: 'Download', sk: 'Stiahnuť' },
      allPlatforms: { en: 'All Platforms', sk: 'Všetky platformy' },
      pwa: { en: 'PWA', sk: 'PWA' },
      android: { en: 'Android', sk: 'Android' },
      ios: { en: 'iOS', sk: 'iOS' },
      circle: { en: 'Circle', sk: 'Kruh' },
      square: { en: 'Square', sk: 'Štvorec' },
      rounded: { en: 'Rounded Square', sk: 'Zaoblený štvorec' }
    };
    
    return translations[key]?.[this.language()] || key;
  }
  
  // Platform change
  onPlatformChange(platformId: string): void {
    this.selectedPlatform.set(platformId);
    this.updatePreviewSize();
  }
  
  // Shape change
  onShapeChange(shape: 'circle' | 'square' | 'rounded'): void {
    this.selectedShape.set(shape);
  }
  
  // Update preview size based on selected platform
  updatePreviewSize(): void {
    const platform = this.currentPlatform();
    if (platform && platform.sizes.length > 0) {
      this.previewSize.set(platform.sizes[0]);
    }
  }
  
  // Select icon for preview
  selectIcon(icon: GeneratedIcon): void {
    this.selectedIcon.set(icon);
    this.previewSvg.set(icon.svgCode);
  }
  
  // Select preview size
  selectPreviewSize(size: { width: number; height: number }): void {
    this.previewSize.set(size);
  }
  
  // Generate icons
  async generateIcons(): Promise<void> {
    if (!this.description()) {
      this.toastService.error(this.translate('description') + ' is required');
      return;
    }
    
    this.isGenerating.set(true);
    this.generatedIcons.set([]);
    this.previewSvg.set(null);
    
    // Start progress tracking
    const steps = [
      { id: 'generating-svg', label: 'Generating SVG', description: 'Creating base SVG icon' },
      { id: 'converting-png', label: 'Converting to PNG', description: 'Converting SVG to PNG for all sizes' },
      { id: 'finalizing', label: 'Finalizing', description: 'Preparing download files' }
    ];
    
    this.progressService.start(steps);
    
    try {
      // Generate icons for selected platform
      const platformId = this.selectedPlatform();
      const icons = await this.iconGeneratorService.generatePlatformIcons(
        this.description(),
        platformId,
        this.selectedShape(),
        this.primaryColor(),
        this.secondaryColor(),
        this.backgroundColor()
      );
      
      this.generatedIcons.set(icons);
      
      // Set first icon as preview
      if (icons.length > 0) {
        this.selectIcon(icons[0]);
      }
      
      this.progressService.complete();
      this.toastService.success(`${icons.length} icons generated successfully!`);
      
    } catch (error) {
      console.error('Error generating icons:', error);
      this.progressService.setError('Failed to generate icons');
      this.toastService.error('Failed to generate icons. Please try again.');
    } finally {
      this.isGenerating.set(false);
      this.progressService.stop();
    }
  }
  
  // Generate all icons for all platforms
  async generateAllIcons(): Promise<void> {
    if (!this.description()) {
      this.toastService.error(this.translate('description') + ' is required');
      return;
    }
    
    this.isGenerating.set(true);
    this.generatedIcons.set([]);
    this.previewSvg.set(null);
    
    // Start progress tracking
    const steps = [
      { id: 'generating-pwa', label: 'Generating PWA Icons', description: 'Creating PWA icons' },
      { id: 'generating-android', label: 'Generating Android Icons', description: 'Creating Android icons' },
      { id: 'generating-ios', label: 'Generating iOS Icons', description: 'Creating iOS icons' },
      { id: 'finalizing', label: 'Finalizing', description: 'Preparing download files' }
    ];
    
    this.progressService.start(steps);
    
    try {
      // Generate icons for all platforms
      const icons = await this.iconGeneratorService.generateAllIcons(
        this.description(),
        this.selectedShape(),
        this.primaryColor(),
        this.secondaryColor(),
        this.backgroundColor()
      );
      
      this.generatedIcons.set(icons);
      
      // Set first icon as preview
      if (icons.length > 0) {
        this.selectIcon(icons[0]);
      }
      
      this.progressService.complete();
      this.toastService.success(`${icons.length} icons generated for all platforms!`);
      
    } catch (error) {
      console.error('Error generating all icons:', error);
      this.progressService.setError('Failed to generate icons');
      this.toastService.error('Failed to generate icons. Please try again.');
    } finally {
      this.isGenerating.set(false);
      this.progressService.stop();
    }
  }
  
  // Download single icon
  downloadIcon(icon: GeneratedIcon): void {
    this.iconGeneratorService.downloadIcon(icon);
    this.toastService.success('Icon downloaded successfully!');
  }
  
  // Download all icons
  async downloadAllIcons(): Promise<void> {
    if (this.generatedIcons().length === 0) {
      this.toastService.warning('No icons to download');
      return;
    }
    
    try {
      await this.iconGeneratorService.downloadAllIcons(this.generatedIcons());
      this.toastService.success('All icons downloaded as ZIP!');
    } catch (error) {
      console.error('Error downloading icons:', error);
      this.toastService.error('Failed to download icons');
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
  getSafePngUrl(icon: GeneratedIcon): string {
    return this.downloadService.getSafePngUrl(icon.pngBase64);
  }
  
  // Get border radius for shape
  getBorderRadius(shape: string): string {
    const shapeObj = this.iconGeneratorService.getShape(shape);
    return shapeObj ? `${shapeObj.borderRadius}%` : '0';
  }
  
  // Group icons by platform
  groupIconsByPlatform(): { platform: string; icons: GeneratedIcon[] }[] {
    const grouped: { [key: string]: GeneratedIcon[] } = {};
    
    for (const icon of this.generatedIcons()) {
      if (!grouped[icon.platform]) {
        grouped[icon.platform] = [];
      }
      grouped[icon.platform].push(icon);
    }
    
    return Object.entries(grouped).map(([platform, icons]) => ({ platform, icons }));
  }
  
  // Get platform name
  getPlatformName(platformId: string): string {
    const platform = this.iconGeneratorService.getPlatform(platformId);
    return platform ? platform.name : platformId;
  }
}
