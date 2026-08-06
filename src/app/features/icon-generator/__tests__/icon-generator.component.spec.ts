/**
 * Icon Generator Component Tests
 * Tests for the icon generator component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconGeneratorComponent } from '../icon-generator.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IconGeneratorService, GeneratedIcon, IconPlatform } from '../../../core/services/icon-generator.service';
import { DownloadService } from '../../../core/services/download.service';
import { ProgressService } from '../../../core/services/progress.service';
import { ToastService } from '../../../core/services/toast.service';

describe('IconGeneratorComponent', () => {
  let component: IconGeneratorComponent;
  let fixture: ComponentFixture<IconGeneratorComponent>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let downloadServiceSpy: jasmine.SpyObj<DownloadService>;
  let progressServiceSpy: jasmine.SpyObj<ProgressService>;
  let iconGenServiceSpy: jasmine.SpyObj<IconGeneratorService>;

  beforeEach(async () => {
    localStorage.clear();
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'getToasts']);
    toastServiceSpy.getToasts.and.returnValue([]);
    downloadServiceSpy = jasmine.createSpyObj('DownloadService', ['downloadPng', 'downloadSvg', 'downloadZip', 'downloadText']);
    progressServiceSpy = jasmine.createSpyObj('ProgressService', ['start', 'complete', 'stop', 'setError', 'nextStep']);
    iconGenServiceSpy = jasmine.createSpyObj('IconGeneratorService', [
      'generateIcons', 'generateAllPlatformIcons', 'downloadIcon', 'downloadAllIcons', 'getPlatform', 'getShape'
    ], {
      platforms: [
        { id: 'pwa', name: 'PWA', sizes: [{ width: 192, height: 192, label: '192x192' }] },
        { id: 'android', name: 'Android', sizes: [{ width: 512, height: 512, label: '512x512' }] },
        { id: 'ios', name: 'iOS', sizes: [{ width: 180, height: 180, label: '180x180' }] }
      ],
      shapes: [
        { id: 'circle', name: 'Circle', borderRadius: 50 },
        { id: 'square', name: 'Square', borderRadius: 0 },
        { id: 'rounded', name: 'Rounded Square', borderRadius: 20 }
      ]
    });

    iconGenServiceSpy.getPlatform.and.callFake((id: string): IconPlatform | undefined => {
      return iconGenServiceSpy.platforms.find((p) => p.id === id);
    });

    iconGenServiceSpy.getShape.and.callFake((id: string) => {
      return iconGenServiceSpy.shapes.find((s) => s.id === id) as any;
    });

    await TestBed.configureTestingModule({
      imports: [IconGeneratorComponent, CommonModule, FormsModule, RouterTestingModule],
      providers: [
        { provide: IconGeneratorService, useValue: iconGenServiceSpy },
        { provide: DownloadService, useValue: downloadServiceSpy },
        { provide: ProgressService, useValue: progressServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IconGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creation & Defaults ───────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default signal values', () => {
    expect(component.selectedPlatform()).toBe('pwa');
    expect(component.selectedShape()).toBe('rounded');
    expect(component.primaryColor()).toBe('#00d4ff');
    expect(component.secondaryColor()).toBe('#ffffff');
    expect(component.backgroundColor()).toBe('#1a1a2e');
    expect(component.description()).toBe('');
    expect(component.isGenerating()).toBe(false);
    expect(component.generatedIcons()).toEqual([]);
    expect(component.selectedIcon()).toBeNull();
    expect(component.previewSvg()).toBeNull();
  });

  it('should default language to en', () => {
    expect(component.language()).toBe('en');
  });

  // ─── Platform & Shape ─────────────────────────────────────────────

  it('should expose platforms from service', () => {
    expect(component.platforms.length).toBeGreaterThan(0);
    expect(component.platforms.map((p) => p.id)).toContain('pwa');
    expect(component.platforms.map((p) => p.id)).toContain('android');
    expect(component.platforms.map((p) => p.id)).toContain('ios');
  });

  it('should expose shapes from service', () => {
    const shapeIds = component.shapes.map(s => s.id);
    expect(shapeIds).toContain('circle');
    expect(shapeIds).toContain('rounded');
    expect(shapeIds).toContain('square');
  });

  it('should update selectedPlatform on onPlatformChange', () => {
    component.onPlatformChange('android');
    expect(component.selectedPlatform()).toBe('android');
  });

  it('should update selectedShape on onShapeChange', () => {
    component.onShapeChange('circle');
    expect(component.selectedShape()).toBe('circle');
  });

  // ─── Signals ──────────────────────────────────────────────────────

  it('should update description signal', () => {
    component.description.set('test icon');
    expect(component.description()).toBe('test icon');
  });

  it('should update primaryColor signal', () => {
    component.primaryColor.set('#ff0000');
    expect(component.primaryColor()).toBe('#ff0000');
  });

  it('should update secondaryColor signal', () => {
    component.secondaryColor.set('#000000');
    expect(component.secondaryColor()).toBe('#000000');
  });

  it('should update backgroundColor signal', () => {
    component.backgroundColor.set('#ffffff');
    expect(component.backgroundColor()).toBe('#ffffff');
  });

  it('should update isGenerating signal', () => {
    component.isGenerating.set(true);
    expect(component.isGenerating()).toBe(true);
  });

  // ─── Preview ──────────────────────────────────────────────────────

  it('should have default preview size', () => {
    expect(component.previewSize()).toEqual({ width: 192, height: 192 });
  });

  it('should update preview size on updatePreviewSize', () => {
    component.updatePreviewSize();
    expect(component.previewSize()).toBeTruthy();
  });

  // ─── Computed Platform ────────────────────────────────────────────

  it('should compute currentPlatform from selectedPlatform', () => {
    component.selectedPlatform.set('pwa');
    const platform = component.currentPlatform();
    expect(platform).toBeTruthy();
    expect(platform?.id).toBe('pwa');
  });

  it('should update currentPlatform when platform changes', () => {
    component.selectedPlatform.set('android');
    const platform = component.currentPlatform();
    expect(platform?.id).toBe('android');
  });

  // ─── Icon Selection ───────────────────────────────────────────────

  it('should select and deselect icon', () => {
    const mockIcon: GeneratedIcon = {
      id: 'test-1',
      svgCode: '<svg>test</svg>',
      pngBase64: 'data:image/png;base64,abc',
      size: { width: 192, height: 192, label: '192x192' },
      platform: 'pwa',
      shape: 'rounded',
      backgroundColor: '#1a1a2e',
      primaryColor: '#00d4ff',
      secondaryColor: '#ffffff',
      timestamp: Date.now()
    };

    component.selectedIcon.set(mockIcon);
    expect(component.selectedIcon()?.id).toBe('test-1');

    component.selectedIcon.set(null);
    expect(component.selectedIcon()).toBeNull();
  });

  // ─── Download ─────────────────────────────────────────────────────

  it('should call service downloadIcon', () => {
    const mockIcon: GeneratedIcon = {
      id: 'test-1',
      svgCode: '<svg>test</svg>',
      pngBase64: 'data:image/png;base64,abc',
      size: { width: 192, height: 192, label: '192x192' },
      platform: 'pwa',
      shape: 'rounded',
      backgroundColor: '#1a1a2e',
      primaryColor: '#00d4ff',
      secondaryColor: '#ffffff',
      timestamp: Date.now()
    };

    component.downloadIcon(mockIcon);
    expect(iconGenServiceSpy.downloadIcon).toHaveBeenCalledWith(mockIcon);
  });
});
