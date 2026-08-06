import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import JSZip from 'jszip';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private sanitizer = inject(DomSanitizer);
  
  constructor() {}
  
  /**
   * Download a PNG file from base64
   */
  downloadPng(base64: string, filename: string): void {
    const blob = this.base64ToBlob(base64, 'image/png');
    this.downloadBlob(blob, filename);
  }
  
  /**
   * Download an SVG file
   */
  downloadSvg(svgCode: string, filename: string): void {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    this.downloadBlob(blob, filename);
  }
  
  /**
   * Download a text file
   */
  downloadText(content: string, filename: string, type: string = 'text/plain'): void {
    const blob = new Blob([content], { type });
    this.downloadBlob(blob, filename);
  }
  
  /**
   * Download multiple files as a ZIP
   */
  async downloadZip(files: { name: string; content: string | Blob; type?: string }[]): Promise<void> {
    const zip = new JSZip();
    
    for (const file of files) {
      if (typeof file.content === 'string') {
        zip.file(file.name, file.content);
      } else {
        zip.file(file.name, file.content, { binary: true });
      }
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    this.downloadBlob(zipBlob, 'download.zip');
  }
  
  /**
   * Get a safe URL for an SVG
   */
  getSafeSvgUrl(svgCode: string): string {
    const svgBlob = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`;
    return this.sanitizer.bypassSecurityTrustUrl(svgBlob) as string;
  }
  
  /**
   * Get a safe URL for a PNG
   */
  getSafePngUrl(base64: string): string {
    const pngBlob = `data:image/png;base64,${base64}`;
    return this.sanitizer.bypassSecurityTrustUrl(pngBlob) as string;
  }
  
  /**
   * Convert base64 to Blob
   */
  private base64ToBlob(base64: string, type: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  }
  
  /**
   * Download a Blob
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Create a download link for a base64 image
   */
  createDownloadLink(base64: string, filename: string, type: string = 'image/png'): HTMLAnchorElement {
    const blob = this.base64ToBlob(base64, type);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    return a;
  }
  
  /**
   * Revoke a download link
   */
  revokeDownloadLink(a: HTMLAnchorElement): void {
    if (a.href) {
      URL.revokeObjectURL(a.href);
    }
  }
}
