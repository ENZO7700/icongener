import { Injectable, signal, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  private toastId = 0;
  
  constructor() {}
  
  /**
   * Show a toast notification
   */
  show(message: string, type: ToastType = 'success', duration: number = 3000, dismissible: boolean = true): number {
    const id = ++this.toastId;
    
    this.toasts.update(current => [...current, { id, message, type, duration, dismissible }]);
    
    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
    
    return id;
  }
  
  /**
   * Show success toast
   */
  success(message: string, duration: number = 3000): number {
    return this.show(message, 'success', duration);
  }
  
  /**
   * Show error toast
   */
  error(message: string, duration: number = 5000): number {
    return this.show(message, 'error', duration);
  }
  
  /**
   * Show warning toast
   */
  warning(message: string, duration: number = 4000): number {
    return this.show(message, 'warning', duration);
  }
  
  /**
   * Show info toast
   */
  info(message: string, duration: number = 3000): number {
    return this.show(message, 'info', duration);
  }
  
  /**
   * Dismiss a toast by ID
   */
  dismiss(id: number): void {
    this.toasts.update(current => current.filter(toast => toast.id !== id));
  }
  
  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    this.toasts.set([]);
  }
  
  /**
   * Get all toasts
   */
  getToasts(): Toast[] {
    return this.toasts();
  }
  
  /**
   * Check if there are any toasts
   */
  hasToasts(): boolean {
    return this.toasts().length > 0;
  }
}

// Toast Container Component
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.getToasts(); track toast.id) {
        <div 
          class="toast {{ toast.type }}"
          [class.dismissible]="toast.dismissible"
          (click)="toast.dismissible ? toastService.dismiss(toast.id) : null"
        >
          <div class="toast-icon">
            @if (toast.type === 'success') {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            } @else if (toast.type === 'error') {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            } @else if (toast.type === 'warning') {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            }
          </div>
          <div class="toast-message">{{ toast.message }}</div>
          @if (toast.dismissible) {
            <button
              type="button"
              class="toast-dismiss"
              aria-label="Dismiss notification"
              title="Dismiss"
              (click)="toastService.dismiss(toast.id); $event.stopPropagation()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }
    
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 12px;
      color: white;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
      pointer-events: auto;
      min-width: 300px;
      max-width: 400px;
    }
    
    .toast.success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .toast.error {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
    
    .toast.warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    
    .toast.info {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }
    
    .toast-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .toast-icon svg {
      width: 20px;
      height: 20px;
    }
    
    .toast-message {
      flex: 1;
      font-size: 0.9rem;
      font-weight: 500;
      line-height: 1.4;
    }
    
    .toast-dismiss {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .toast-dismiss:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .toast-dismiss svg {
      width: 16px;
      height: 16px;
    }
    
    .toast.dismissible {
      cursor: pointer;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @media (max-width: 768px) {
      .toast-container {
        bottom: 16px;
        right: 16px;
        left: 16px;
        max-width: calc(100vw - 32px);
      }
      
      .toast {
        min-width: auto;
        max-width: none;
      }
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}

