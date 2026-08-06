import { Injectable, inject } from '@angular/core';
import { AiService } from './ai.service';
import { DownloadService } from './download.service';

export interface IconSize {
  width: number;
  height: number;
  label: string;
}

export interface IconPlatform {
  id: string;
  name: string;
  sizes: IconSize[];
}

export interface GeneratedIcon {
  id: string;
  platform: string;
  size: IconSize;
  svgCode: string;
  pngBase64: string;
  shape: 'circle' | 'square' | 'rounded';
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class IconGeneratorService {
  private aiService = inject(AiService);
  private downloadService = inject(DownloadService);
  
  // Platform definitions
  platforms: IconPlatform[] = [
    {
      id: 'pwa',
      name: 'PWA (Progressive Web App)',
      sizes: [
        { width: 192, height: 192, label: '192x192' },
        { width: 512, height: 512, label: '512x512' }
      ]
    },
    {
      id: 'android',
      name: 'Android',
      sizes: [
        { width: 48, height: 48, label: '48x48' },
        { width: 72, height: 72, label: '72x72' },
        { width: 96, height: 96, label: '96x96' },
        { width: 144, height: 144, label: '144x144' },
        { width: 192, height: 192, label: '192x192' },
        { width: 512, height: 512, label: '512x512' }
      ]
    },
    {
      id: 'ios',
      name: 'iOS (Apple)',
      sizes: [
        { width: 20, height: 20, label: '20x20' },
        { width: 29, height: 29, label: '29x29' },
        { width: 40, height: 40, label: '40x40' },
        { width: 58, height: 58, label: '58x58' },
        { width: 60, height: 60, label: '60x60' },
        { width: 76, height: 76, label: '76x76' },
        { width: 80, height: 80, label: '80x80' },
        { width: 87, height: 87, label: '87x87' },
        { width: 120, height: 120, label: '120x120' },
        { width: 152, height: 152, label: '152x152' },
        { width: 167, height: 167, label: '167x167' },
        { width: 180, height: 180, label: '180x180' },
        { width: 1024, height: 1024, label: '1024x1024' }
      ]
    }
  ];
  
  // Shape definitions
  shapes: { id: 'circle' | 'square' | 'rounded'; name: string; borderRadius: number }[] = [
    { id: 'circle', name: 'Circle', borderRadius: 50 },
    { id: 'square', name: 'Square', borderRadius: 0 },
    { id: 'rounded', name: 'Rounded Square', borderRadius: 20 }
  ];
  
  constructor() {}
  
  /**
   * Generate SVG code for an icon
   */
  async generateSvg(
    description: string,
    shape: 'circle' | 'square' | 'rounded',
    primaryColor: string,
    secondaryColor: string,
    backgroundColor: string
  ): Promise<string> {
    const prompt = `
      Generate a modern, clean ${shape} icon for a ${description}.
      Requirements:
      - Use primary color: ${primaryColor} for main elements
      - Use secondary color: ${secondaryColor} for accents
      - Use background color: ${backgroundColor} for the background
      - The icon should be simple, recognizable at small sizes
      - Use a futuristic, tech-inspired design
      - Output only the SVG code without any additional text or markdown
      - The SVG should have a viewBox="0 0 100 100" attribute
      - Include the background in the SVG
    `;
    
    try {
      const svgCode = await this.aiService.generateSvg(prompt);
      return this.applyShapeAndColors(svgCode, shape, primaryColor, secondaryColor, backgroundColor);
    } catch (error) {
      console.error('Error generating SVG:', error);
      // Return a fallback SVG
      return this.getFallbackSvg(shape, primaryColor, secondaryColor, backgroundColor);
    }
  }
  
  /**
   * Apply shape and colors to SVG
   */
  private applyShapeAndColors(
    svgCode: string,
    shape: 'circle' | 'square' | 'rounded',
    primaryColor: string,
    secondaryColor: string,
    backgroundColor: string
  ): string {
    // Clean the SVG code
    let cleaned = this.aiService.cleanSvgCode(svgCode);
    
    // Get the shape properties
    const shapeConfig = this.shapes.find(s => s.id === shape) || this.shapes[0];
    
    // Create a wrapper SVG with background and shape
    const viewBox = this.extractViewBox(cleaned) || '0 0 100 100';
    const borderRadius = shapeConfig.borderRadius;
    
    // Replace colors in the SVG
    cleaned = this.replaceColors(cleaned, primaryColor, secondaryColor);
    
    // Wrap in a container with background
    return `
      <svg width="100" height="100" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="iconClip">
            <rect width="100" height="100" rx="${borderRadius}" ry="${borderRadius}"/>
          </clipPath>
        </defs>
        <rect width="100" height="100" fill="${backgroundColor}" rx="${borderRadius}" ry="${borderRadius}"/>
        <g clip-path="url(#iconClip)">
          ${cleaned.replace(/<svg[^>]*>|<\/svg>/g, '')}
        </g>
      </svg>
    `;
  }
  
  /**
   * Replace colors in SVG code
   */
  private replaceColors(svgCode: string, primaryColor: string, secondaryColor: string): string {
    let replaced = svgCode;
    // Replace hardcoded mock/placeholder colors with user-selected primary and secondary colors
    replaced = replaced.replace(/#00d4ff/gi, primaryColor);
    replaced = replaced.replace(/#ffffff/gi, secondaryColor);
    return replaced;
  }
  
  /**
   * Extract viewBox from SVG code
   */
  private extractViewBox(svgCode: string): string | null {
    const match = svgCode.match(/viewBox="([^"]+)"/);
    return match ? match[1] : null;
  }
  
  /**
   * Convert SVG to PNG
   */
  async svgToPng(svgCode: string, width: number, height: number): Promise<string> {
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
        
        // Fill background with transparent
        ctx.clearRect(0, 0, width, height);
        
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
  
  /**
   * Generate all icons for a platform
   */
  async generatePlatformIcons(
    description: string,
    platformId: string,
    shape: 'circle' | 'square' | 'rounded',
    primaryColor: string,
    secondaryColor: string,
    backgroundColor: string
  ): Promise<GeneratedIcon[]> {
    const platform = this.platforms.find(p => p.id === platformId);
    if (!platform) {
      throw new Error(`Platform ${platformId} not found`);
    }
    
    // Generate base SVG
    const svgCode = await this.generateSvg(
      description, shape, primaryColor, secondaryColor, backgroundColor
    );
    
    const icons: GeneratedIcon[] = [];
    
    // Generate each size
    for (const size of platform.sizes) {
      const pngBase64 = await this.svgToPng(svgCode, size.width, size.height);
      
      icons.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        platform: platformId,
        size,
        svgCode,
        pngBase64,
        shape,
        backgroundColor,
        primaryColor,
        secondaryColor,
        timestamp: Date.now()
      });
    }
    
    return icons;
  }
  
  /**
   * Generate icons for all platforms
   */
  async generateAllIcons(
    description: string,
    shape: 'circle' | 'square' | 'rounded',
    primaryColor: string,
    secondaryColor: string,
    backgroundColor: string
  ): Promise<GeneratedIcon[]> {
    const allIcons: GeneratedIcon[] = [];
    
    for (const platform of this.platforms) {
      const platformIcons = await this.generatePlatformIcons(
        description, platform.id, shape, primaryColor, secondaryColor, backgroundColor
      );
      allIcons.push(...platformIcons);
    }
    
    return allIcons;
  }
  
  /**
   * Download a single icon
   */
  downloadIcon(icon: GeneratedIcon): void {
    const filename = `icon-${icon.platform}-${icon.size.width}x${icon.size.height}.png`;
    this.downloadService.downloadPng(icon.pngBase64, filename);
  }
  
  /**
   * Download all icons as ZIP
   */
  async downloadAllIcons(icons: GeneratedIcon[]): Promise<void> {
    const files = icons.map(icon => ({
      name: `icon-${icon.platform}-${icon.size.width}x${icon.size.height}.png`,
      content: icon.pngBase64,
      type: 'image/png'
    }));
    
    // Add SVG file
    if (icons.length > 0) {
      files.push({
        name: 'icon-source.svg',
        content: icons[0].svgCode,
        type: 'image/svg+xml'
      });
    }
    
    await this.downloadService.downloadZip(files);
  }
  
  /**
   * Get platform by ID
   */
  getPlatform(platformId: string): IconPlatform | undefined {
    return this.platforms.find(p => p.id === platformId);
  }
  
  /**
   * Get shape by ID
   */
  getShape(shapeId: string): { id: string; name: string; borderRadius: number } | undefined {
    return this.shapes.find(s => s.id === shapeId);
  }
  
  /**
   * Fallback SVG generator
   */
  private getFallbackSvg(
    shape: 'circle' | 'square' | 'rounded',
    primaryColor: string,
    secondaryColor: string,
    backgroundColor: string
  ): string {
    const shapeConfig = this.shapes.find(s => s.id === shape) || this.shapes[0];
    const borderRadius = shapeConfig.borderRadius;
    
    return `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="iconClip">
            <rect width="100" height="100" rx="${borderRadius}" ry="${borderRadius}"/>
          </clipPath>
        </defs>
        <rect width="100" height="100" fill="${backgroundColor}" rx="${borderRadius}" ry="${borderRadius}"/>
        <g clip-path="url(#iconClip)">
          <rect x="20" y="20" width="60" height="60" fill="${primaryColor}" rx="10" ry="10"/>
          <circle cx="50" cy="50" r="20" fill="${secondaryColor}"/>
        </g>
      </svg>
    `;
  }
}
