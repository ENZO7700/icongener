/**
 * Favicon Generator Component Tests
 * Tests for the favicon generator component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaviconGeneratorComponent, GeneratedFavicon } from '../favicon-generator.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AiService } from '../../../core/services/ai.service';
import { DownloadService } from '../../../core/services/download.service';
import { ProgressService } from '../../../core/services/progress.service';
import { ToastService } from '../../../core/services/toast.service';

describe('FaviconGeneratorComponent', () => {
  let component: FaviconGeneratorComponent;
  let fixture: ComponentFixture<FaviconGeneratorComponent>;
  let aiServiceSpy: jasmine.SpyObj<AiService>;
  let downloadServiceSpy: jasmine.SpyObj<DownloadService>;
  let progressServiceSpy: jasmine.SpyObj<ProgressService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    localStorage.clear();
    aiServiceSpy = jasmine.createSpyObj('AiService', ['generateSvg']);
    downloadServiceSpy = jasmine.createSpyObj('DownloadService', ['downloadPng', 'downloadSvg', 'downloadZip', 'downloadText']);
    progressServiceSpy = jasmine.createSpyObj('ProgressService', ['start', 'complete', 'stop', 'setError', 'nextStep']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'getToasts']);
    toastServiceSpy.getToasts.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [FaviconGeneratorComponent, CommonModule, FormsModule, RouterTestingModule],
      providers: [
        { provide: AiService, useValue: aiServiceSpy },
        { provide: DownloadService, useValue: downloadServiceSpy },
        { provide: ProgressService, useValue: progressServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FaviconGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creation & Defaults ───────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default signal values', () => {
    expect(component.description()).toBe('');
    expect(component.faviconType()).toBe('modern');
    expect(component.primaryColor()).toBe('#00d4ff');
    expect(component.secondaryColor()).toBe('#ffffff');
    expect(component.backgroundColor()).toBe('transparent');
    expect(component.isGenerating()).toBe(false);
    expect(component.generatedFavicons()).toEqual([]);
    expect(component.selectedFavicon()).toBeNull();
    expect(component.previewSvg()).toBeNull();
  });

  it('should default language to en', () => {
    expect(component.language()).toBe('en');
  });

  // ─── Favicon Sizes ────────────────────────────────────────────────

  it('should have predefined favicon sizes', () => {
    expect(component.faviconSizes.length).toBeGreaterThan(0);
    const labels = component.faviconSizes.map(s => s.label);
    expect(labels).toContain('16x16');
    expect(labels).toContain('32x32');
  });

  // ─── Signals Updates ──────────────────────────────────────────────

  it('should update description signal', () => {
    component.description.set('app favicon');
    expect(component.description()).toBe('app favicon');
  });

  it('should update faviconType signal', () => {
    component.faviconType.set('classic');
    expect(component.faviconType()).toBe('classic');
  });

  it('should update primaryColor signal', () => {
    component.primaryColor.set('#ff0000');
    expect(component.primaryColor()).toBe('#ff0000');
  });

  it('should update secondaryColor signal', () => {
    component.secondaryColor.set('#00ff00');
    expect(component.secondaryColor()).toBe('#00ff00');
  });

  it('should update backgroundColor signal', () => {
    component.backgroundColor.set('#000000');
    expect(component.backgroundColor()).toBe('#000000');
  });

  // ─── Selection ────────────────────────────────────────────────────

  it('should select and deselect favicon', () => {
    const mockFavicon: GeneratedFavicon = {
      id: 'fav-1',
      size: { width: 32, height: 32, label: '32x32', ico: true },
      svgCode: '<svg>fav</svg>',
      pngBase64: 'data:image/png;base64,abc',
      timestamp: Date.now()
    };

    component.selectedFavicon.set(mockFavicon);
    expect(component.selectedFavicon()?.id).toBe('fav-1');

    component.selectedFavicon.set(null);
    expect(component.selectedFavicon()).toBeNull();
  });

  // ─── Download ─────────────────────────────────────────────────────

  it('should download single favicon', () => {
    const mockFavicon: GeneratedFavicon = {
      id: 'fav-1',
      size: { width: 32, height: 32, label: '32x32', ico: true },
      svgCode: '<svg>fav</svg>',
      pngBase64: 'data:image/png;base64,abc',
      timestamp: Date.now()
    };

    component.downloadFavicon(mockFavicon);
    expect(downloadServiceSpy.downloadPng).toHaveBeenCalledWith('data:image/png;base64,abc', 'favicon-32x32.png');
  });
});
