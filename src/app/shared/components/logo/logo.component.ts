import { Component, input, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AiService } from '../../../core/services/ai.service';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.css']
})
export class LogoComponent implements OnInit {
  // Inputs
  size = input<'small' | 'medium' | 'large'>('medium');
  showTitle = input<boolean>(true);
  
  // State
  generatedSvg = signal<string | null>(null);
  safeSvg = signal<SafeHtml | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Injected services
  private aiService = inject(AiService);
  private sanitizer = inject(DomSanitizer);
  
  constructor() {}
  
  async ngOnInit(): Promise<void> {
    await this.generateLogo();
  }
  
  async generateLogo(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const prompt = `
        Generate a modern, clean, and professional logo for an AI-powered icon generator application.
        The logo should:
        - Be simple and recognizable
        - Use a combination of geometric shapes (squares, circles, triangles)
        - Have a futuristic and tech-inspired design
        - Use a color scheme of blue (#00d4ff) and dark blue (#1a1a2e)
        - Include the text "IconGener" in a modern font
        - Be suitable for both light and dark backgrounds
        - Output only the SVG code without any additional text or markdown
      `;
      
      const svgCode = await this.aiService.generateSvg(prompt);
      this.generatedSvg.set(svgCode);
      this.safeSvg.set(this.sanitizer.bypassSecurityTrustHtml(svgCode));
    } catch (err) {
      console.error('Error generating logo:', err);
      this.error.set('Failed to generate logo. Using fallback.');
      // Fallback to a simple SVG logo
      this.generatedSvg.set(this.getFallbackLogo());
      this.safeSvg.set(this.sanitizer.bypassSecurityTrustHtml(this.getFallbackLogo()));
    } finally {
      this.isLoading.set(false);
    }
  }
  
  private getFallbackLogo(): string {
    return `
      <svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00d4ff"/>
            <stop offset="100%" style="stop-color:#0099cc"/>
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="40" height="40" rx="8" fill="url(#logoGradient)"/>
        <text x="60" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#00d4ff">
          IconGener
        </text>
      </svg>
    `;
  }
  
  getSizeClass(): string {
    return this.size();
  }

  getLogoSizeClass(): string {
    return `w-${this.size()}`;
  }
  
  getTitleSizeClass(): string {
    switch (this.size()) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  }

  getLogoTitle(): string {
    return 'IconGener';
  }

  getFallbackSvg(): string {
    return this.getFallbackLogo();
  }
}

