import { TestBed } from '@angular/core/testing';
import { ToastService, ToastContainerComponent } from '../toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService]
    });

    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success toast', () => {
    const id = service.success('Test success message');
    
    expect(id).toBeGreaterThan(0);
    expect(service.getToasts().length).toBe(1);
    expect(service.getToasts()[0].type).toBe('success');
    expect(service.getToasts()[0].message).toBe('Test success message');
  });

  it('should show error toast', () => {
    const id = service.error('Test error message');
    
    expect(id).toBeGreaterThan(0);
    expect(service.getToasts().length).toBe(1);
    expect(service.getToasts()[0].type).toBe('error');
  });

  it('should show warning toast', () => {
    const id = service.warning('Test warning message');
    
    expect(id).toBeGreaterThan(0);
    expect(service.getToasts().length).toBe(1);
    expect(service.getToasts()[0].type).toBe('warning');
  });

  it('should show info toast', () => {
    const id = service.info('Test info message');
    
    expect(id).toBeGreaterThan(0);
    expect(service.getToasts().length).toBe(1);
    expect(service.getToasts()[0].type).toBe('info');
  });

  it('should dismiss toast by ID', () => {
    const id1 = service.success('Toast 1');
    const id2 = service.success('Toast 2');
    
    expect(service.getToasts().length).toBe(2);
    
    service.dismiss(id1);
    
    expect(service.getToasts().length).toBe(1);
    expect(service.getToasts()[0].id).toBe(id2);
  });

  it('should dismiss all toasts', () => {
    service.success('Toast 1');
    service.success('Toast 2');
    service.success('Toast 3');
    
    expect(service.getToasts().length).toBe(3);
    
    service.dismissAll();
    
    expect(service.getToasts().length).toBe(0);
  });

  it('should check if has toasts', () => {
    expect(service.hasToasts()).toBeFalse();
    
    service.success('Test toast');
    
    expect(service.hasToasts()).toBeTrue();
  });

  it('should auto-dismiss toast after duration', (done) => {
    service.show('Test toast', 'success', 100);
    
    expect(service.getToasts().length).toBe(1);
    
    setTimeout(() => {
      expect(service.getToasts().length).toBe(0);
      done();
    }, 150);
  });

  it('should not auto-dismiss if duration is 0', () => {
    service.show('Persistent toast', 'success', 0);
    
    expect(service.getToasts().length).toBe(1);
  });
});

describe('ToastContainerComponent', () => {
  it('should be created', async () => {
    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
      providers: [ToastService]
    }).compileComponents();

    const fixture = TestBed.createComponent(ToastContainerComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
