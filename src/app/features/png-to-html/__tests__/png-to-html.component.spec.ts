/**
 * PNG to HTML Component Tests
 * Tests for the PNG to HTML generator component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PngToHtmlComponent } from '../png-to-html.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AiService } from '../../../core/services/ai.service';
import { DownloadService } from '../../../core/services/download.service';
import { ProgressService } from '../../../core/services/progress.service';
import { ToastService } from '../../../core/services/toast.service';

describe('PngToHtmlComponent', () => {
  let component: PngToHtmlComponent;
  let fixture: ComponentFixture<PngToHtmlComponent>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let downloadServiceSpy: jasmine.SpyObj<DownloadService>;
  let progressServiceSpy: jasmine.SpyObj<ProgressService>;

  beforeEach(async () => {
    localStorage.clear();
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'getToasts']);
    toastServiceSpy.getToasts.and.returnValue([]);
    downloadServiceSpy = jasmine.createSpyObj('DownloadService', ['downloadText', 'downloadZip']);
    progressServiceSpy = jasmine.createSpyObj('ProgressService', ['start', 'complete', 'stop', 'setError', 'nextStep']);

    await TestBed.configureTestingModule({
      imports: [PngToHtmlComponent, CommonModule, FormsModule, RouterTestingModule],
      providers: [
        { provide: AiService, useValue: jasmine.createSpyObj('AiService', ['generateSvg']) },
        { provide: DownloadService, useValue: downloadServiceSpy },
        { provide: ProgressService, useValue: progressServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PngToHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creation & Defaults ───────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default signal values', () => {
    expect(component.colorQuantization()).toBe(16);
    expect(component.pixelSize()).toBe(10);
    expect(component.useInlineStyles()).toBe(true);
    expect(component.includeComments()).toBe(true);
    expect(component.showCrop()).toBe(false);
    expect(component.cropX()).toBe(0);
    expect(component.cropY()).toBe(0);
    expect(component.isGenerating()).toBe(false);
    expect(component.generatedHtml()).toBeNull();
    expect(component.imageFile()).toBeNull();
    expect(component.imagePreview()).toBeNull();
  });

  it('should default language to en', () => {
    expect(component.language()).toBe('en');
  });

  it('should have zero image dimensions by default', () => {
    expect(component.imageWidth()).toBe(0);
    expect(component.imageHeight()).toBe(0);
  });

  // ─── Translation ──────────────────────────────────────────────────

  it('should translate keys in English', () => {
    component.language.set('en');
    expect(component.translate('pngToHtml')).toContain('PNG to HTML');
    expect(component.translate('generate')).toBe('Generate HTML');
  });

  it('should translate keys in Slovak', () => {
    component.language.set('sk');
    expect(component.translate('pngToHtml')).toContain('PNG na HTML');
    expect(component.translate('generate')).toContain('Generovať');
  });

  it('should return key for unknown translation', () => {
    expect(component.translate('nonexistent_key')).toBe('nonexistent_key');
  });

  // ─── File Handling ────────────────────────────────────────────────

  it('should call handleFile via onFileChange when file selected', () => {
    const mockFile = new File(['fake-data'], 'test.png', { type: 'image/png' });
    const handleFileSpy = spyOn<any>(component, 'handleFile');
    const event = { target: { files: [mockFile] } } as any;

    component.onFileChange(event);

    expect(handleFileSpy).toHaveBeenCalledWith(mockFile);
  });

  it('should not call handleFile when no files selected', () => {
    const handleFileSpy = spyOn<any>(component, 'handleFile');
    const event = { target: { files: [] } } as any;

    component.onFileChange(event);

    expect(handleFileSpy).not.toHaveBeenCalled();
  });

  it('should reject non-image files in handleFile', () => {
    const textFile = new File(['text'], 'test.txt', { type: 'text/plain' });
    (component as any).handleFile(textFile);
    expect(toastServiceSpy.error).toHaveBeenCalledWith('Please upload an image file');
  });

  // ─── Drag & Drop ──────────────────────────────────────────────────

  it('should handle drag over', () => {
    const event = {
      preventDefault: jasmine.createSpy(),
      stopPropagation: jasmine.createSpy()
    };
    component.onDragOver(event as any);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should handle drop with files', () => {
    const mockFile = new File(['data'], 'test.png', { type: 'image/png' });
    const handleFileSpy = spyOn<any>(component, 'handleFile');
    const event = {
      preventDefault: jasmine.createSpy(),
      stopPropagation: jasmine.createSpy(),
      dataTransfer: { files: [mockFile] }
    };

    component.onDrop(event as any);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(handleFileSpy).toHaveBeenCalledWith(mockFile);
  });

  it('should handle drop without files', () => {
    const handleFileSpy = spyOn<any>(component, 'handleFile');
    const event = {
      preventDefault: jasmine.createSpy(),
      stopPropagation: jasmine.createSpy(),
      dataTransfer: { files: [] }
    };

    component.onDrop(event as any);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(handleFileSpy).not.toHaveBeenCalled();
  });

  // ─── Crop ─────────────────────────────────────────────────────────

  it('should start crop when image is loaded', () => {
    component.imagePreview.set('data:image/png;base64,abc');
    component.startCrop();
    expect(component.showCrop()).toBe(true);
  });

  it('should not start crop without image', () => {
    component.imagePreview.set(null);
    component.startCrop();
    expect(component.showCrop()).toBe(false);
    expect(toastServiceSpy.error).toHaveBeenCalledWith('Please upload an image first');
  });

  it('should apply crop and show toast', () => {
    component.showCrop.set(true);
    component.applyCrop();
    expect(component.showCrop()).toBe(false);
    expect(toastServiceSpy.success).toHaveBeenCalledWith('Crop applied!');
  });

  it('should cancel crop and reset crop values', () => {
    component.imageWidth.set(200);
    component.imageHeight.set(150);
    component.cropX.set(50);
    component.cropY.set(50);
    component.showCrop.set(true);

    component.cancelCrop();

    expect(component.showCrop()).toBe(false);
    expect(component.cropX()).toBe(0);
    expect(component.cropY()).toBe(0);
    expect(component.cropWidth()).toBe(200);
    expect(component.cropHeight()).toBe(150);
  });

  it('should track cropping state via onCropStart/onCropEnd', () => {
    component.showCrop.set(true);
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    (component as any).canvasPreview = { nativeElement: canvas };

    const rect = canvas.getBoundingClientRect();
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: rect.left + 10,
      clientY: rect.top + 20
    });

    component.onCropStart(mouseEvent);
    expect(component.isCropping()).toBe(true);

    component.onCropEnd();
    expect(component.isCropping()).toBe(false);
  });

  // ─── Reset ────────────────────────────────────────────────────────

  it('should reset all image state', () => {
    component.imageFile.set(new File([''], 'x.png'));
    component.imagePreview.set('data:image/png;base64,abc');
    component.imageWidth.set(100);
    component.imageHeight.set(100);

    component.resetImage();

    expect(component.imageFile()).toBeNull();
    expect(component.imagePreview()).toBeNull();
    expect(component.imageWidth()).toBe(0);
    expect(component.imageHeight()).toBe(0);
    expect(component.generatedHtml()).toBeNull();
    expect(component.showCrop()).toBe(false);
  });

  // ─── Generate Guard ───────────────────────────────────────────────

  it('should show error toast if generate called without image', async () => {
    component.imagePreview.set(null);
    await component.generateHtml();
    expect(toastServiceSpy.error).toHaveBeenCalledWith('Please upload an image first');
  });

  // ─── rgbaToHex Optimization ───────────────────────────────────────

  it('should convert opaque rgba to hex shorthand', () => {
    expect((component as any).rgbaToHex('rgba(255, 0, 0, 1.00)')).toBe('#f00');
    expect((component as any).rgbaToHex('rgba(0, 0, 0, 1.00)')).toBe('#000');
    expect((component as any).rgbaToHex('rgba(255, 255, 255, 1.00)')).toBe('#fff');
  });

  it('should convert opaque rgba to full hex when not shortable', () => {
    expect((component as any).rgbaToHex('rgba(0, 128, 255, 1.00)')).toBe('#0080ff');
    expect((component as any).rgbaToHex('rgba(18, 52, 86, 1.00)')).toBe('#123456');
  });

  it('should convert shorthand-able hex colors (#aabbcc -> #abc)', () => {
    expect((component as any).rgbaToHex('rgba(170, 187, 204, 1.00)')).toBe('#abc');
  });

  it('should keep rgba for semi-transparent colors', () => {
    const result = (component as any).rgbaToHex('rgba(255, 0, 0, 0.50)');
    expect(result).toBe('rgba(255,0,0,0.5)');
  });

  it('should pass through non-rgba colors unchanged', () => {
    expect((component as any).rgbaToHex('#ff0000')).toBe('#ff0000');
    expect((component as any).rgbaToHex('red')).toBe('red');
  });

  // ─── buildColorClassMap ───────────────────────────────────────────

  it('should build sequential class names (c0, c1, c2)', () => {
    const rects = [
      { x: 0, y: 0, width: 1, height: 1, color: 'rgba(255, 0, 0, 1.00)' },
      { x: 1, y: 0, width: 1, height: 1, color: 'rgba(0, 255, 0, 1.00)' },
      { x: 2, y: 0, width: 1, height: 1, color: 'rgba(255, 0, 0, 1.00)' }
    ];

    const map = (component as any).buildColorClassMap(rects);
    expect(map.size).toBe(2);

    const red = map.get('rgba(255, 0, 0, 1.00)');
    const green = map.get('rgba(0, 255, 0, 1.00)');

    expect(red.className).toBe('c0');
    expect(red.hexColor).toBe('#f00');
    expect(green.className).toBe('c1');
    expect(green.hexColor).toBe('#0f0');
  });

  it('should handle empty rectangles in buildColorClassMap', () => {
    const map = (component as any).buildColorClassMap([]);
    expect(map.size).toBe(0);
  });

  // ─── generateHtmlCode (Optimized Output) ──────────────────────────

  it('should generate HTML with CSS classes instead of inline bg colors', () => {
    const rects = [
      { x: 0, y: 0, width: 2, height: 1, color: 'rgba(255, 0, 0, 1.00)' },
      { x: 2, y: 0, width: 1, height: 1, color: 'rgba(0, 0, 255, 1.00)' }
    ];

    component.pixelSize.set(10);
    component.includeComments.set(false);

    const html = (component as any).generateHtmlCode(rects, 3, 1);

    // Should contain base class and color classes
    expect(html).toContain('.p{position:absolute}');
    expect(html).toContain('.c0{background:#f00}');
    expect(html).toContain('.c1{background:#00f}');

    // Should NOT contain old verbose inline styles
    expect(html).not.toContain('position: absolute;');
    expect(html).not.toContain('background-color:');

    // Should have compact div with class="p c0"
    expect(html).toContain('class="p c0"');
    expect(html).toContain('class="p c1"');
  });

  it('should embed style tag in generated HTML', () => {
    const rects = [{ x: 0, y: 0, width: 1, height: 1, color: 'rgba(0, 0, 0, 1.00)' }];
    const html = (component as any).generateHtmlCode(rects, 1, 1);

    expect(html).toContain('<style>');
    expect(html).toContain('</style>');
    expect(html).not.toContain('styles.css');
  });

  it('should include comments when enabled', () => {
    const rects = [{ x: 0, y: 0, width: 1, height: 1, color: 'rgba(0, 0, 0, 1.00)' }];
    component.includeComments.set(true);

    const html = (component as any).generateHtmlCode(rects, 10, 10);
    expect(html).toContain('<!-- 10x10px');
    expect(html).toContain('1 rects -->');
  });

  it('should not include comments when disabled', () => {
    const rects = [{ x: 0, y: 0, width: 1, height: 1, color: 'rgba(0, 0, 0, 1.00)' }];
    component.includeComments.set(false);

    const html = (component as any).generateHtmlCode(rects, 10, 10);
    expect(html).not.toContain('<!--');
  });

  // ─── generateCssCode (Standalone) ─────────────────────────────────

  it('should generate standalone CSS with short class names', () => {
    const rects = [
      { x: 0, y: 0, width: 1, height: 1, color: 'rgba(255, 0, 0, 1.00)' }
    ];

    component.includeComments.set(false);
    const css = (component as any).generateCssCode(rects);

    expect(css).toContain('.ic{position:relative;display:inline-block}');
    expect(css).toContain('.p{position:absolute}');
    expect(css).toContain('.c0{background:#f00}');
  });

  // ─── Download Methods ─────────────────────────────────────────────

  it('should show error when downloading HTML without generation', () => {
    component.generatedHtml.set(null);
    component.downloadHtml();
    expect(toastServiceSpy.error).toHaveBeenCalledWith('No HTML generated yet');
  });

  it('should show error when downloading CSS without generation', () => {
    component.generatedHtml.set(null);
    component.downloadCss();
    expect(toastServiceSpy.error).toHaveBeenCalledWith('No CSS generated yet');
  });

  it('should show error when downloading all without generation', async () => {
    component.generatedHtml.set(null);
    await component.downloadAll();
    expect(toastServiceSpy.error).toHaveBeenCalledWith('No files generated yet');
  });

  it('should download HTML when generated', () => {
    component.generatedHtml.set({
      id: 'test',
      htmlCode: '<div>test</div>',
      cssCode: '.p{}',
      previewHtmlCode: '<div>preview</div>',
      pixelData: [],
      rectangles: [],
      width: 10,
      height: 10,
      timestamp: Date.now()
    });

    component.downloadHtml();
    expect(downloadServiceSpy.downloadText).toHaveBeenCalledWith(
      '<div>test</div>',
      'generated-image-10x10.html',
      'text/html'
    );
    expect(toastServiceSpy.success).toHaveBeenCalledWith('HTML downloaded successfully!');
  });

  it('should download CSS when generated', () => {
    component.generatedHtml.set({
      id: 'test',
      htmlCode: '<div>test</div>',
      cssCode: '.p{position:absolute}',
      previewHtmlCode: '<div>preview</div>',
      pixelData: [],
      rectangles: [],
      width: 10,
      height: 10,
      timestamp: Date.now()
    });

    component.downloadCss();
    expect(downloadServiceSpy.downloadText).toHaveBeenCalledWith(
      '.p{position:absolute}',
      'generated-image-10x10.css',
      'text/css'
    );
    expect(toastServiceSpy.success).toHaveBeenCalledWith('CSS downloaded successfully!');
  });

  // ─── Color Helpers ────────────────────────────────────────────────

  it('should return empty array for getUniqueColors when no generation', () => {
    expect(component.getUniqueColors()).toEqual([]);
  });

  it('should return 0 for getColorCount when no generation', () => {
    expect(component.getColorCount()).toBe(0);
  });

  it('should return unique colors from generated data', () => {
    component.generatedHtml.set({
      id: 'test',
      htmlCode: '',
      cssCode: '',
      previewHtmlCode: '',
      pixelData: [
        { x: 0, y: 0, color: 'red' },
        { x: 1, y: 0, color: 'blue' },
        { x: 2, y: 0, color: 'red' }
      ],
      rectangles: [],
      width: 3,
      height: 1,
      timestamp: Date.now()
    });

    expect(component.getUniqueColors().length).toBe(2);
    expect(component.getColorCount()).toBe(2);
  });

  // ─── Signal Updates ───────────────────────────────────────────────

  it('should update colorQuantization signal', () => {
    component.colorQuantization.set(32);
    expect(component.colorQuantization()).toBe(32);
  });

  it('should update pixelSize signal', () => {
    component.pixelSize.set(5);
    expect(component.pixelSize()).toBe(5);
  });

  it('should toggle useInlineStyles signal', () => {
    component.useInlineStyles.set(false);
    expect(component.useInlineStyles()).toBe(false);
  });

  it('should toggle includeComments signal', () => {
    component.includeComments.set(false);
    expect(component.includeComments()).toBe(false);
  });

  // ─── Preview Iframe / Sandbox ────────────────────────────────────

  it('should return empty string for previewIframeSrc when no generation', () => {
    expect(component.previewIframeSrc()).toBe('');
  });

  it('should return previewHtmlCode from previewIframeSrc', () => {
    component.generatedHtml.set({
      id: 'test',
      htmlCode: '<div>full</div>',
      cssCode: '',
      previewHtmlCode: '<div>preview</div>',
      pixelData: [],
      rectangles: [],
      width: 10,
      height: 10,
      timestamp: Date.now()
    });

    expect(component.previewIframeSrc()).toBe('<div>preview</div>');
  });

  // ─── Preview Dimensions ──────────────────────────────────────────

  it('should return same dimensions if within preview limits', () => {
    const dims = (component as any).getPreviewDimensions(800, 600);
    expect(dims.width).toBe(800);
    expect(dims.height).toBe(600);
    expect(dims.scale).toBe(1);
  });

  it('should downscale wide images to max 1280 width', () => {
    const dims = (component as any).getPreviewDimensions(2560, 960);
    expect(dims.width).toBe(1280);
    expect(dims.height).toBe(480);
    expect(dims.scale).toBe(0.5);
  });

  it('should downscale tall images to max 960 height', () => {
    const dims = (component as any).getPreviewDimensions(640, 1920);
    expect(dims.width).toBe(320);
    expect(dims.height).toBe(960);
    expect(dims.scale).toBe(0.5);
  });

  // ─── Contenteditable in Download HTML ────────────────────────────

  it('should add contenteditable to HTML when editable=true', () => {
    const rects = [{ x: 0, y: 0, width: 1, height: 1, color: 'rgba(0, 0, 0, 1.00)' }];
    component.pixelSize.set(10);
    component.includeComments.set(false);

    const html = (component as any).generateHtmlCode(rects, 1, 1, true);
    expect(html).toContain('contenteditable="true"');
  });

  it('should NOT add contenteditable when editable=false', () => {
    const rects = [{ x: 0, y: 0, width: 1, height: 1, color: 'rgba(0, 0, 0, 1.00)' }];
    component.pixelSize.set(10);
    component.includeComments.set(false);

    const html = (component as any).generateHtmlCode(rects, 1, 1, false);
    expect(html).not.toContain('contenteditable');
  });
});
