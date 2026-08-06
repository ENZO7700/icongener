/**
 * Banner Generator Component Tests
 * Tests for the banner generator component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerGeneratorComponent, GeneratedBanner } from '../banner-generator.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AiService } from '../../../core/services/ai.service';
import { DownloadService } from '../../../core/services/download.service';
import { ProgressService } from '../../../core/services/progress.service';
import { ToastService } from '../../../core/services/toast.service';

describe('BannerGeneratorComponent', () => {
  let component: BannerGeneratorComponent;
  let fixture: ComponentFixture<BannerGeneratorComponent>;
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
      imports: [BannerGeneratorComponent, CommonModule, FormsModule, RouterTestingModule],
      providers: [
        { provide: AiService, useValue: aiServiceSpy },
        { provide: DownloadService, useValue: downloadServiceSpy },
        { provide: ProgressService, useValue: progressServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BannerGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creation & Defaults ───────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default signal values', () => {
    expect(component.description()).toBe('');
    expect(component.customWidth()).toBe(1200);
    expect(component.customHeight()).toBe(630);
    expect(component.primaryColor()).toBe('#00d4ff');
    expect(component.secondaryColor()).toBe('#ffffff');
    expect(component.backgroundColor()).toBe('#1a1a2e');
    expect(component.textContent()).toBe('');
    expect(component.isGenerating()).toBe(false);
    expect(component.generatedBanners()).toEqual([]);
    expect(component.selectedBanner()).toBeNull();
    expect(component.previewSvg()).toBeNull();
  });

  it('should default language to en', () => {
    expect(component.language()).toBe('en');
  });

  // ─── Presets ──────────────────────────────────────────────────────

  it('should have banner presets', () => {
    expect(component.bannerPresets.length).toBeGreaterThan(0);
  });

  // ─── Signals Updates ──────────────────────────────────────────────

  it('should update description signal', () => {
    component.description.set('banner prompt');
    expect(component.description()).toBe('banner prompt');
  });

  it('should update custom dimensions signals', () => {
    component.customWidth.set(800);
    component.customHeight.set(400);
    expect(component.customWidth()).toBe(800);
    expect(component.customHeight()).toBe(400);
  });

  it('should update color signals', () => {
    component.primaryColor.set('#ff0000');
    component.secondaryColor.set('#00ff00');
    component.backgroundColor.set('#0000ff');
    expect(component.primaryColor()).toBe('#ff0000');
    expect(component.secondaryColor()).toBe('#00ff00');
    expect(component.backgroundColor()).toBe('#0000ff');
  });

  // ─── Selection & Download ─────────────────────────────────────────

  it('should select and deselect banner', () => {
    const mockBanner: GeneratedBanner = {
      id: 'b-1',
      preset: { id: 'custom', name: 'Custom', width: 800, height: 400, category: 'General' },
      svgCode: '<svg>banner</svg>',
      pngBase64: 'data:image/png;base64,abc',
      timestamp: Date.now()
    };

    component.selectedBanner.set(mockBanner);
    expect(component.selectedBanner()?.id).toBe('b-1');

    component.selectedBanner.set(null);
    expect(component.selectedBanner()).toBeNull();
  });

  it('should download single banner', () => {
    const mockBanner: GeneratedBanner = {
      id: 'b-1',
      preset: { id: 'custom', name: 'Custom Banner', width: 800, height: 400, category: 'General' },
      svgCode: '<svg>banner</svg>',
      pngBase64: 'data:image/png;base64,abc',
      timestamp: Date.now()
    };

    component.downloadBanner(mockBanner);
    expect(downloadServiceSpy.downloadPng).toHaveBeenCalled();
  });
});
