import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { DownloadService } from '../download.service';

describe('DownloadService', () => {
  let service: DownloadService;
  let mockSanitizer: any;

  beforeEach(() => {
    mockSanitizer = {
      bypassSecurityTrustUrl: jasmine.createSpy('bypassSecurityTrustUrl').and.callFake((url: string) => url)
    };

    TestBed.configureTestingModule({
      providers: [
        DownloadService,
        { provide: DomSanitizer, useValue: mockSanitizer }
      ]
    });

    service = TestBed.inject(DownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert base64 to blob', () => {
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const blob = (service as any).base64ToBlob(base64, 'image/png');

    expect(blob).toBeTruthy();
    expect(blob.type).toBe('image/png');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should get safe SVG URL', () => {
    const svgCode = '<svg>test</svg>';
    const url = service.getSafeSvgUrl(svgCode);

    expect(url).toBeTruthy();
    expect(mockSanitizer.bypassSecurityTrustUrl).toHaveBeenCalled();
  });

  it('should get safe PNG URL', () => {
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const url = service.getSafePngUrl(base64);

    expect(url).toBeTruthy();
    expect(mockSanitizer.bypassSecurityTrustUrl).toHaveBeenCalled();
  });

  it('should create download link', () => {
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const link = service.createDownloadLink(base64, 'test.png', 'image/png');

    expect(link).toBeTruthy();
    expect(link.download).toBe('test.png');
    expect(link.href).toContain('blob:');
  });

  it('should revoke download link', () => {
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const link = service.createDownloadLink(base64, 'test.png', 'image/png');
    const spy = spyOn(URL, 'revokeObjectURL');

    service.revokeDownloadLink(link);

    expect(spy).toHaveBeenCalledWith(link.href);
  });
});
