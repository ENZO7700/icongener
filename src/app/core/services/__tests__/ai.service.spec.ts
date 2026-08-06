import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AiService } from '../ai.service';

describe('AiService', () => {
  let service: AiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AiService]
    });

    service = TestBed.inject(AiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate SVG with valid prompt', (done) => {
    const testPrompt = 'Generate a simple icon';
    const mockResponse = { svgCode: '<svg>test</svg>' };

    service.generateSvg(testPrompt).then(svgCode => {
      expect(svgCode).toContain('<svg>');
      done();
    });

    const req = httpMock.expectOne('/api/generate-svg');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ prompt: testPrompt });
    req.flush(mockResponse);
  });

  it('should clean SVG code by removing markdown blocks', () => {
    const dirtySvg = '```svg\n<svg>clean</svg>\n```';
    const cleaned = service.cleanSvgCode(dirtySvg);
    expect(cleaned).toBe('<svg>clean</svg>');
  });

  it('should handle empty SVG response by throwing error', (done) => {
    const testPrompt = 'Generate an icon';
    const mockResponse = { svgCode: '' };

    service.generateSvg(testPrompt).catch(error => {
      expect(error.message).toContain('No SVG code returned');
      done();
    });

    const req = httpMock.expectOne('/api/generate-svg');
    req.flush(mockResponse);
  });

  it('should enhance preset description', (done) => {
    const testPrompt = 'Enhance this description';
    const mockResponse = { enhancedDescription: 'Enhanced description' };

    service.enhanceDescription(testPrompt).then((description: string) => {
      expect(description).toBe('Enhanced description');
      done();
    });

    const req = httpMock.expectOne('/api/enhance-preset');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ prompt: testPrompt });
    req.flush(mockResponse);
  });
});
