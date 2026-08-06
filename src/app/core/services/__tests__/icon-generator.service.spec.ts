import { TestBed } from '@angular/core/testing';
import { IconGeneratorService } from '../icon-generator.service';
import { AiService } from '../ai.service';
import { DownloadService } from '../download.service';

describe('IconGeneratorService', () => {
  let service: IconGeneratorService;
  let aiServiceSpy: jasmine.SpyObj<AiService>;
  let downloadServiceSpy: jasmine.SpyObj<DownloadService>;

  beforeEach(() => {
    aiServiceSpy = jasmine.createSpyObj('AiService', ['generateSvg']);
    downloadServiceSpy = jasmine.createSpyObj('DownloadService', ['downloadPng', 'downloadSvg', 'downloadZip', 'downloadText']);

    TestBed.configureTestingModule({
      providers: [
        IconGeneratorService,
        { provide: AiService, useValue: aiServiceSpy },
        { provide: DownloadService, useValue: downloadServiceSpy }
      ]
    });

    service = TestBed.inject(IconGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get platform by id', () => {
    const platform = service.getPlatform('pwa');
    expect(platform).toBeTruthy();
    expect(platform?.id).toBe('pwa');
  });

  it('should return undefined for unknown platform', () => {
    const platform = service.getPlatform('unknown');
    expect(platform).toBeUndefined();
  });

  it('should get shape by id', () => {
    const shape = service.getShape('circle');
    expect(shape).toBeTruthy();
    expect(shape?.id).toBe('circle');
  });

  it('should return undefined for unknown shape', () => {
    const shape = service.getShape('unknown' as any);
    expect(shape).toBeUndefined();
  });

  it('should generate fallback SVG', () => {
    const fallbackSvg = (service as any).getFallbackSvg('rounded', '#00d4ff', '#ffffff', '#1a1a2e');
    expect(fallbackSvg).toContain('<svg');
    expect(fallbackSvg).toContain('#00d4ff');
  });

  it('should get all platform IDs', () => {
    const platformIds = service.platforms.map(p => p.id);
    expect(platformIds.length).toBeGreaterThan(0);
    expect(platformIds).toContain('pwa');
    expect(platformIds).toContain('android');
    expect(platformIds).toContain('ios');
  });

  it('should get all shape IDs', () => {
    const shapeIds = service.shapes.map(s => s.id);
    expect(shapeIds.length).toBeGreaterThan(0);
    expect(shapeIds).toContain('circle');
    expect(shapeIds).toContain('square');
    expect(shapeIds).toContain('rounded');
  });
});
