import { Component, signal, OnInit, inject, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AiService } from '../../core/services/ai.service';
import { DownloadService } from '../../core/services/download.service';
import { ProgressService } from '../../core/services/progress.service';
import { ToastService, ToastContainerComponent } from '../../core/services/toast.service';

export interface PixelData {
  x: number;
  y: number;
  color: string;
}

export interface GeneratedHtml {
  id: string;
  htmlCode: string;
  cssCode: string;
  pixelData: PixelData[];
  width: number;
  height: number;
  timestamp: number;
}

@Component({
  selector: 'app-png-to-html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastContainerComponent],
  templateUrl: './png-to-html.component.html',
  styleUrls: ['./png-to-html.component.css']
})
export class PngToHtmlComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('canvasPreview') canvasPreview!: ElementRef<HTMLCanvasElement>;
  
  // State
  language = signal<'en' | 'sk'>('en');
  
  // Form inputs
  colorQuantization = signal<number>(16);
  pixelSize = signal<number>(10);
  useInlineStyles = signal<boolean>(true);
  includeComments = signal<boolean>(true);
  
  // Image state
  imageFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  imageWidth = signal<number>(0);
  imageHeight = signal<number>(0);
  
  // Generation state
  isGenerating = signal<boolean>(false);
  generatedHtml = signal<GeneratedHtml | null>(null);
  
  // Crop state
  showCrop = signal<boolean>(false);
  cropX = signal<number>(0);
  cropY = signal<number>(0);
  cropWidth = signal<number>(0);
  cropHeight = signal<number>(0);
  isCropping = signal<boolean>(false);
  cropStartX = signal<number>(0);
  cropStartY = signal<number>(0);
  
  // Injected services
  private aiService = inject(AiService);
  private downloadService = inject(DownloadService);
  readonly progressService = inject(ProgressService);
  private toastService = inject(ToastService);
  
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
      pngToHtml: { en: 'PNG to HTML Generator', sk: 'Generátor PNG na HTML' },
      description: { en: 'Convert PNG images to perfect-pixel HTML/CSS', sk: 'Konvertujte PNG obrázky na perfektné HTML/CSS' },
      uploadImage: { en: 'Upload Image', sk: 'Nahrať obrázok' },
      dragDrop: { en: 'Drag & drop PNG here or click to browse', sk: 'Presuňte PNG sem alebo kliknite na prehliadanie' },
      colorQuantization: { en: 'Color Quantization', sk: 'Kvantizácia farieb' },
      colorQuantizationDesc: { en: 'Reduce the number of unique colors in the image', sk: 'Znížte počet jedinečných farieb v obrázku' },
      colors: { en: 'colors', sk: 'farby' },
      pixelSize: { en: 'Pixel Size', sk: 'Veľkosť pixelu' },
      pixelSizeDesc: { en: 'Size of each HTML element in pixels', sk: 'Veľkosť každého HTML elementu v pixeloch' },
      pixels: { en: 'pixels', sk: 'pixelov' },
      useInlineStyles: { en: 'Use Inline Styles', sk: 'Použiť inline štýly' },
      useInlineStylesDesc: { en: 'Apply styles directly to elements instead of using CSS classes', sk: 'Aplikovať štýly priamo na elementy namiesto použitia CSS tried' },
      includeComments: { en: 'Include Comments', sk: 'Zahrnúť komentáre' },
      includeCommentsDesc: { en: 'Add comments to the generated HTML for better readability', sk: 'Pridať komentáre do vygenerovaného HTML pre lepšiu čitateľnosť' },
      generate: { en: 'Generate HTML', sk: 'Generovať HTML' },
      generating: { en: 'Generating...', sk: 'Generuje sa...' },
      downloadHtml: { en: 'Download HTML', sk: 'Stiahnuť HTML' },
      downloadCss: { en: 'Download CSS', sk: 'Stiahnuť CSS' },
      downloadAll: { en: 'Download All', sk: 'Stiahnuť všetko' },
      preview: { en: 'Preview', sk: 'Náhľad' },
      noImage: { en: 'No image uploaded yet. Upload a PNG to get started.', sk: 'Zatiaľ nebol nahraný žiadny obrázok. Nahrajte PNG, aby ste začali.' },
      crop: { en: 'Crop', sk: 'Orezať' },
      cropImage: { en: 'Crop Image', sk: 'Orezať obrázok' },
      cancelCrop: { en: 'Cancel', sk: 'Zrušiť' },
      applyCrop: { en: 'Apply Crop', sk: 'Použiť orez' },
      reset: { en: 'Reset', sk: 'Resetovať' },
      originalSize: { en: 'Original Size', sk: 'Pôvodná veľkosť' },
      quantizedColors: { en: 'Quantized Colors', sk: 'Kvantizované farby' }
    };
    
    return translations[key]?.[this.language()] || key;
  }
  
  // Handle file upload
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }
  
  // Handle drag and drop
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }
  
  // Handle drag over
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
  
  // Handle file
  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Please upload an image file');
      return;
    }
    
    this.imageFile.set(file);
    this.showCrop.set(false);
    this.generatedHtml.set(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.imageWidth.set(img.width);
        this.imageHeight.set(img.height);
        this.imagePreview.set(e.target?.result as string);
        
        // Initialize crop
        this.cropX.set(0);
        this.cropY.set(0);
        this.cropWidth.set(img.width);
        this.cropHeight.set(img.height);
        
        this.toastService.success('Image loaded successfully!');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
  
  // Start cropping
  startCrop(): void {
    if (!this.imagePreview()) {
      this.toastService.error('Please upload an image first');
      return;
    }
    this.showCrop.set(true);
  }
  
  // Handle crop start
  onCropStart(event: MouseEvent): void {
    if (!this.showCrop()) return;
    
    const canvas = this.canvasPreview.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.isCropping.set(true);
    this.cropStartX.set(x);
    this.cropStartY.set(y);
  }
  
  // Handle crop move
  onCropMove(event: MouseEvent): void {
    if (!this.isCropping()) return;
    
    const canvas = this.canvasPreview.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const startX = this.cropStartX();
    const startY = this.cropStartY();
    
    const width = Math.abs(x - startX);
    const height = Math.abs(y - startY);
    const cropX = Math.min(startX, x);
    const cropY = Math.min(startY, y);
    
    this.cropX.set(cropX);
    this.cropY.set(cropY);
    this.cropWidth.set(width);
    this.cropHeight.set(height);
  }
  
  // Handle crop end
  onCropEnd(): void {
    this.isCropping.set(false);
  }
  
  // Apply crop
  applyCrop(): void {
    this.showCrop.set(false);
    this.toastService.success('Crop applied!');
  }
  
  // Cancel crop
  cancelCrop(): void {
    this.showCrop.set(false);
    this.cropX.set(0);
    this.cropY.set(0);
    this.cropWidth.set(this.imageWidth());
    this.cropHeight.set(this.imageHeight());
  }
  
  // Reset image
  resetImage(): void {
    this.imageFile.set(null);
    this.imagePreview.set(null);
    this.imageWidth.set(0);
    this.imageHeight.set(0);
    this.generatedHtml.set(null);
    this.showCrop.set(false);
    if (this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
  
  // Generate HTML
  async generateHtml(): Promise<void> {
    if (!this.imagePreview()) {
      this.toastService.error('Please upload an image first');
      return;
    }
    
    this.isGenerating.set(true);
    this.generatedHtml.set(null);
    
    // Start progress tracking
    const steps = [
      { id: 'processing-image', label: 'Processing Image', description: 'Analyzing image data' },
      { id: 'quantizing-colors', label: 'Quantizing Colors', description: 'Reducing color palette' },
      { id: 'generating-html', label: 'Generating HTML', description: 'Creating HTML structure' },
      { id: 'generating-css', label: 'Generating CSS', description: 'Creating CSS styles' }
    ];
    
    this.progressService.start(steps);
    
    try {
      const img = new Image();
      img.src = this.imagePreview()!;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Get cropped dimensions
      const cropX = this.cropX();
      const cropY = this.cropY();
      const cropWidth = this.cropWidth();
      const cropHeight = this.cropHeight();
      
      // Create canvas for cropped image
      const canvas = document.createElement('canvas');
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get 2D canvas context');
      }
      
      // Draw cropped image
      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, cropWidth, cropHeight);
      
      // Quantize colors
      const pixelData = this.quantizeImage(imageData, this.colorQuantization());
      
      // Generate HTML and CSS
      const htmlCode = this.generateHtmlCode(pixelData, cropWidth, cropHeight);
      const cssCode = this.generateCssCode(pixelData);
      
      const result: GeneratedHtml = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        htmlCode,
        cssCode,
        pixelData,
        width: cropWidth,
        height: cropHeight,
        timestamp: Date.now()
      };
      
      this.generatedHtml.set(result);
      
      this.progressService.complete();
      this.toastService.success('HTML generated successfully!');
      
    } catch (error) {
      console.error('Error generating HTML:', error);
      this.progressService.setError('Failed to generate HTML');
      this.toastService.error('Failed to generate HTML. Please try again.');
    } finally {
      this.isGenerating.set(false);
      this.progressService.stop();
    }
  }
  
  // Quantize image colors
  private quantizeImage(imageData: ImageData, numColors: number): PixelData[] {
    const pixelData: PixelData[] = [];
    const width = imageData.width;
    const height = imageData.height;
    
    // Simple quantization: group similar colors
    const colorMap = new Map<string, string>();
    const colors: string[] = [];
    
    // First pass: collect all colors
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const a = imageData.data[index + 3];
        
        if (a > 0) {
          const color = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
          colors.push(color);
        }
      }
    }
    
    // If we have fewer colors than requested, use all
    if (colors.length <= numColors) {
      colors.forEach(color => colorMap.set(color, color));
    } else {
      // Simple quantization: use k-means clustering (simplified)
      // For now, just use the most common colors
      const colorCounts = new Map<string, number>();
      colors.forEach(color => {
        colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
      });
      
      const sortedColors = Array.from(colorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, numColors);
      
      sortedColors.forEach(([color]) => colorMap.set(color, color));
    }
    
    // Second pass: create pixel data with quantized colors
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const a = imageData.data[index + 3];
        
        if (a > 0) {
          const originalColor = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
          const quantizedColor = colorMap.get(originalColor) || originalColor;
          pixelData.push({ x, y, color: quantizedColor });
        }
      }
    }
    
    return pixelData;
  }
  
  // Generate HTML code
  private generateHtmlCode(pixelData: PixelData[], width: number, height: number): string {
    const pixelSize = this.pixelSize();
    const useInlineStyles = this.useInlineStyles();
    const includeComments = this.includeComments();
    
    let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
    html += '  <meta charset="UTF-8">\n';
    html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    html += '  <title>Generated Image</title>\n';
    
    if (!useInlineStyles) {
      html += '  <link rel="stylesheet" href="styles.css">\n';
    }
    
    html += '</head>\n<body>\n';
    
    if (includeComments) {
      html += `  <!-- Generated from PNG to HTML converter -->\n`;
      html += `  <!-- Original size: ${width}x${height} pixels -->\n`;
      html += `  <!-- Pixel size: ${pixelSize}px -->\n`;
      html += `  <!-- Total pixels: ${pixelData.length} -->\n\n`;
    }
    
    html += `  <div class="image-container" style="width: ${width * pixelSize}px; height: ${height * pixelSize}px; position: relative;">\n`;
    
    // Group pixels by color for optimization
    const pixelsByColor = new Map<string, PixelData[]>();
    pixelData.forEach(pixel => {
      if (!pixelsByColor.has(pixel.color)) {
        pixelsByColor.set(pixel.color, []);
      }
      pixelsByColor.get(pixel.color)!.push(pixel);
    });
    
    // Generate HTML for each color group
    pixelsByColor.forEach((pixels, color) => {
      if (includeComments) {
        html += `    <!-- ${color} -->\n`;
      }
      
      pixels.forEach(pixel => {
        const left = pixel.x * pixelSize;
        const top = pixel.y * pixelSize;
        
        if (useInlineStyles) {
          html += `    <div style="position: absolute; left: ${left}px; top: ${top}px; width: ${pixelSize}px; height: ${pixelSize}px; background-color: ${color};"></div>\n`;
        } else {
          html += `    <div class="pixel ${this.sanitizeColorClass(color)}" style="left: ${left}px; top: ${top}px;"></div>\n`;
        }
      });
      
      if (includeComments) {
        html += '\n';
      }
    });
    
    html += '  </div>\n</body>\n</html>';
    
    return html;
  }
  
  // Generate CSS code
  private generateCssCode(pixelData: PixelData[]): string {
    const pixelSize = this.pixelSize();
    const includeComments = this.includeComments();
    
    let css = '/* Generated CSS from PNG to HTML converter */\n\n';
    
    css += '.image-container {\n';
    css += '  position: relative;\n';
    css += '  display: inline-block;\n';
    css += '}\n\n';
    
    css += '.pixel {\n';
    css += `  position: absolute;\n`;
    css += `  width: ${pixelSize}px;\n`;
    css += `  height: ${pixelSize}px;\n`;
    css += '}\n\n';
    
    // Group pixels by color for CSS classes
    const pixelsByColor = new Map<string, PixelData[]>();
    pixelData.forEach(pixel => {
      if (!pixelsByColor.has(pixel.color)) {
        pixelsByColor.set(pixel.color, []);
      }
      pixelsByColor.get(pixel.color)!.push(pixel);
    });
    
    // Generate CSS class for each color
    pixelsByColor.forEach((pixels, color) => {
      const className = this.sanitizeColorClass(color);
      if (includeComments) {
        css += `/* ${color} */\n`;
      }
      css += `.${className} {\n`;
      css += `  background-color: ${color};\n`;
      css += '}\n\n';
    });
    
    return css;
  }
  
  // Sanitize color for CSS class name
  private sanitizeColorClass(color: string): string {
    // Remove rgba() and replace with solid color name
    if (color.startsWith('rgba(')) {
      const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return `color-${r}-${g}-${b}`;
      }
    }
    return color.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  }
  
  // Download HTML
  downloadHtml(): void {
    const html = this.generatedHtml();
    if (!html) {
      this.toastService.error('No HTML generated yet');
      return;
    }
    
    const filename = `generated-image-${html.width}x${html.height}.html`;
    this.downloadService.downloadText(html.htmlCode, filename, 'text/html');
    this.toastService.success('HTML downloaded successfully!');
  }
  
  // Download CSS
  downloadCss(): void {
    const html = this.generatedHtml();
    if (!html) {
      this.toastService.error('No CSS generated yet');
      return;
    }
    
    const filename = `generated-image-${html.width}x${html.height}.css`;
    this.downloadService.downloadText(html.cssCode, filename, 'text/css');
    this.toastService.success('CSS downloaded successfully!');
  }
  
  // Download all files
  async downloadAll(): Promise<void> {
    const html = this.generatedHtml();
    if (!html) {
      this.toastService.error('No files generated yet');
      return;
    }
    
    try {
      const files = [
        {
          name: `generated-image-${html.width}x${html.height}.html`,
          content: html.htmlCode,
          type: 'text/html'
        },
        {
          name: `generated-image-${html.width}x${html.height}.css`,
          content: html.cssCode,
          type: 'text/css'
        }
      ];
      
      await this.downloadService.downloadZip(files);
      this.toastService.success('All files downloaded!');
    } catch (error) {
      console.error('Error downloading files:', error);
      this.toastService.error('Failed to download files');
    }
  }
  
  // Get unique colors
  getUniqueColors(): string[] {
    const html = this.generatedHtml();
    if (!html) return [];
    
    const uniqueColors = new Set<string>();
    html.pixelData.forEach(pixel => uniqueColors.add(pixel.color));
    return Array.from(uniqueColors);
  }
  
  // Get color count
  getColorCount(): number {
    return this.getUniqueColors().length;
  }
}
