import { TestBed } from '@angular/core/testing';
import { ProgressService } from '../progress.service';

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProgressService]
    });

    service = TestBed.inject(ProgressService);
  });

  afterEach(() => {
    service.stop();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with 0 progress', () => {
    expect(service.getProgress()).toBe(0);
  });

  it('should start progress tracking', () => {
    const steps = [
      { id: 'step1', label: 'Step 1', description: 'First step' },
      { id: 'step2', label: 'Step 2', description: 'Second step' }
    ];

    service.start(steps);
    expect(service.getCurrentStepInfo()).toEqual(steps[0]);
    expect(service.isProgressActive()).toBe(true);
  });

  it('should advance to next step', () => {
    const steps = [
      { id: 'step1', label: 'Step 1', description: 'First step' },
      { id: 'step2', label: 'Step 2', description: 'Second step' }
    ];

    service.start(steps);
    service.nextStep();

    expect(service.getProgress()).toBe(50);
    expect(service.getCurrentStepInfo()).toEqual(steps[1]);
  });

  it('should complete progress', () => {
    const steps = [
      { id: 'step1', label: 'Step 1', description: 'First step' },
      { id: 'step2', label: 'Step 2', description: 'Second step' }
    ];

    service.start(steps);
    service.complete();

    expect(service.getProgress()).toBe(100);
    expect(service.isProgressActive()).toBe(false);
  });

  it('should set error', () => {
    const steps = [
      { id: 'step1', label: 'Step 1', description: 'First step' }
    ];

    service.start(steps);
    service.setError('Test error');

    expect(service.getError()).toBe('Test error');
    expect(service.isProgressActive()).toBe(false);
  });

  it('should stop progress', () => {
    const steps = [
      { id: 'step1', label: 'Step 1', description: 'First step' }
    ];

    service.start(steps);
    service.stop();

    expect(service.isProgressActive()).toBe(false);
  });

  it('should handle empty steps', () => {
    service.start([]);

    expect(service.getProgress()).toBe(0);
    expect(service.getCurrentStepInfo()).toBeNull();
  });
});
