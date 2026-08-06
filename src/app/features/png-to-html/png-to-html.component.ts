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

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface GeneratedHtml {
  id: string;
  htmlCode: string;
  cssCode: string;
  pixelData: PixelData[];
  rectangles: Rectangle[];
  width: number;
  height: number;
  timestamp: number;
}

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  private sanitizer = inject(DomSanitizer);
  
  safeHtmlCode = computed<SafeHtml>(() => {
    const code = this.generatedHtml()?.htmlCode;
    return code ? this.sanitizer.bypassSecurityTrustHtml(code) : '';
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
      
      // Apply RLE optimization to reduce file size
      const rectangles = this.applyRLE(pixelData, cropWidth, cropHeight);
      
      // Generate HTML and CSS using optimized rectangles
      const htmlCode = this.generateHtmlCode(rectangles, cropWidth, cropHeight);
      const cssCode = this.generateCssCode(rectangles);
      
      const result: GeneratedHtml = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        htmlCode,
        cssCode,
        pixelData,
        rectangles,
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
  

  // Apply RLE (Run-Length Encoding) to optimize pixel data into rectangles
  // This reduces file size from O(n) to O(k) where k is number of color changes
  private applyRLE(pixelData: PixelData[], width: number, height: number): Rectangle[] {
    const rectangles: Rectangle[] = [];
    
    // Create a 2D grid for quick lookup
    const grid: Map<number, Map<number, string>> = new Map();
    pixelData.forEach(pixel => {
      if (!grid.has(pixel.y)) {
        grid.set(pixel.y, new Map());
      }
      grid.get(pixel.y)!.set(pixel.x, pixel.color);
    });
    
    // Scan each row
    for (let y = 0; y < height; y++) {
      const row = grid.get(y);
      if (!row) continue;
      
      let x = 0;
      while (x < width) {
        const currentColor = row.get(x);
        if (!currentColor) {
          x++;
          continue;
        }
        
        // Find how many consecutive pixels have the same color in this row
        let runWidth = 1;
        while (x + runWidth < width && row.get(x + runWidth) === currentColor) {
          runWidth++;
        }
        
        // Check if we can extend vertically (same color in next rows)
        let runHeight = 1;
        let canExtend = true;
        
        while (canExtend && y + runHeight < height) {
          const nextRow = grid.get(y + runHeight);
          if (!nextRow) break;
          
          // Check if all pixels in the run have the same color in next row
          for (let i = 0; i < runWidth; i++) {
            if (nextRow.get(x + i) !== currentColor) {
              canExtend = false;
              break;
            }
          }
          if (canExtend) runHeight++;
        }
        
        rectangles.push({
          x,
          y,
          width: runWidth,
          height: runHeight,
          color: currentColor
        });
        
        x += runWidth;
      }
    }
    
    return rectangles;
  }
  // Convert rgba color string to shortest possible CSS color
  private rgbaToHex(color: string): string {
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (!match) return color;

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const a = parseFloat(match[4]);

    // If fully opaque, use hex shorthand
    if (a >= 0.995) {
      const hex = `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
      // Try shorthand hex (#rgb) if possible
      if (hex[1] === hex[2] && hex[3] === hex[4] && hex[5] === hex[6]) {
        return `#${hex[1]}${hex[3]}${hex[5]}`;
      }
      return hex;
    }

    // Semi-transparent: use rgba but with minimal precision
    return `rgba(${r},${g},${b},${a})`;
  }

  // Build a color-to-class map with short sequential names (c0, c1, c2...)
  private buildColorClassMap(rectangles: Rectangle[]): Map<string, { className: string; hexColor: string }> {
    const colorMap = new Map<string, { className: string; hexColor: string }>();
    let index = 0;

    for (const rect of rectangles) {
      if (!colorMap.has(rect.color)) {
        colorMap.set(rect.color, {
          className: `c${index++}`,
          hexColor: this.rgbaToHex(rect.color)
        });
      }
    }

    return colorMap;
  }

  // Generate HTML code (optimized: CSS classes, hex colors, short names)
  private generateHtmlCode(rectangles: Rectangle[], width: number, height: number): string {
    const pixelSize = this.pixelSize();
    const includeComments = this.includeComments();
    const colorMap = this.buildColorClassMap(rectangles);

    let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
    html += '  <meta charset="UTF-8">\n';
    html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    html += '  <title>Generated Image</title>\n';
    html += '  <style>\n';

    // Embed optimized CSS directly in <style> for single-file output
    html += '.ic{position:relative;display:inline-block}\n';
    html += '.p{position:absolute}\n';

    // Color classes
    colorMap.forEach(({ className, hexColor }) => {
      html += `.${className}{background:${hexColor}}\n`;
    });

    html += '  </style>\n';
    html += '</head>\n<body>\n';

    if (includeComments) {
      html += `  <!-- ${width}x${height}px, ${pixelSize}px/block, ${rectangles.length} rects -->\n`;
    }

    html += `  <div class="ic" style="width:${width * pixelSize}px;height:${height * pixelSize}px">\n`;

    // Generate divs with short class names and minimal inline positioning
    for (const rect of rectangles) {
      const entry = colorMap.get(rect.color)!;
      const l = rect.x * pixelSize;
      const t = rect.y * pixelSize;
      const w = rect.width * pixelSize;
      const h = rect.height * pixelSize;

      html += `<div class="p ${entry.className}" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px"></div>\n`;
    }

    html += '  </div>\n</body>\n</html>';

    return html;
  }

  // Generate standalone CSS code (for external stylesheet download)
  private generateCssCode(rectangles: Rectangle[]): string {
    const includeComments = this.includeComments();
    const colorMap = this.buildColorClassMap(rectangles);

    let css = '';
    if (includeComments) {
      css += '/* Generated CSS – PNG to HTML converter */\n';
    }

    css += '.ic{position:relative;display:inline-block}\n';
    css += '.p{position:absolute}\n';

    colorMap.forEach(({ className, hexColor }, originalColor) => {
      if (includeComments) {
        css += `/* ${originalColor} */\n`;
      }
      css += `.${className}{background:${hexColor}}\n`;
    });

    return css;
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
