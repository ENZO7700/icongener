import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoComponent } from '../logo/logo.component';
import { DomSanitizer } from '@angular/platform-browser';
import { AiService } from '../../../core/services/ai.service';

describe('LogoComponent', () => {
  let component: LogoComponent;
  let fixture: ComponentFixture<LogoComponent>;
  let mockSanitizer: any;
  let mockAiService: any;

  beforeEach(async () => {
    mockSanitizer = {
      bypassSecurityTrustHtml: jasmine.createSpy('bypassSecurityTrustHtml').and.callFake((html: string) => html)
    };

    mockAiService = {
      generateSvg: jasmine.createSpy('generateSvg').and.returnValue(Promise.resolve('<svg>test</svg>')),
      cleanSvgCode: jasmine.createSpy('cleanSvgCode').and.callFake((code: string) => code)
    };

    await TestBed.configureTestingModule({
      imports: [LogoComponent],
      providers: [
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: AiService, useValue: mockAiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default size medium', () => {
    expect(component.size()).toBe('medium');
  });

  it('should have default showTitle true', () => {
    expect(component.showTitle()).toBe(true);
  });

  it('should get logo size class', () => {
    expect(component.getLogoSizeClass()).toContain('w-medium');
  });

  it('should get title size class', () => {
    expect(component.getTitleSizeClass()).toBe('text-base');
  });

  it('should get logo title', () => {
    expect(component.getLogoTitle()).toBe('IconGener');
  });

  it('should get fallback SVG', () => {
    const fallbackSvg = component.getFallbackSvg();
    expect(fallbackSvg).toContain('<svg');
    expect(fallbackSvg).toContain('viewBox');
  });

  it('should generate logo on init', () => {
    expect(mockAiService.generateSvg).toHaveBeenCalled();
  });

  it('should handle SVG generation error', async () => {
    mockAiService.generateSvg.and.returnValue(Promise.reject(new Error('Test error')));

    await component.generateLogo();

    expect(component.generatedSvg()).toBeTruthy();
    expect(component.error()).toBeTruthy();
  });
});
