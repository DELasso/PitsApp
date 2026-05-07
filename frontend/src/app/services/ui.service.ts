import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  durationMs: number;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export interface ConfirmRequest extends ConfirmOptions {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private toastsSubject = new BehaviorSubject<ToastItem[]>([]);
  private confirmSubject = new BehaviorSubject<ConfirmRequest | null>(null);
  private confirmResolvers = new Map<string, (value: boolean) => void>();

  toasts$ = this.toastsSubject.asObservable();
  confirm$ = this.confirmSubject.asObservable();

  toast(variant: ToastVariant, message: string, durationMs = 3200) {
    const id = this.createId();
    const toast: ToastItem = { id, variant, message, durationMs };
    const next = [...this.toastsSubject.value, toast];
    this.toastsSubject.next(next);

    window.setTimeout(() => {
      this.dismissToast(id);
    }, durationMs);
  }

  success(message: string, durationMs?: number) {
    this.toast('success', message, durationMs);
  }

  error(message: string, durationMs?: number) {
    this.toast('error', message, durationMs);
  }

  info(message: string, durationMs?: number) {
    this.toast('info', message, durationMs);
  }

  warning(message: string, durationMs?: number) {
    this.toast('warning', message, durationMs);
  }

  dismissToast(id: string) {
    const next = this.toastsSubject.value.filter(t => t.id !== id);
    if (next.length !== this.toastsSubject.value.length) {
      this.toastsSubject.next(next);
    }
  }

  confirm(options: ConfirmOptions): Promise<boolean> {
    const id = this.createId();
    const request: ConfirmRequest = { id, ...options };
    this.confirmSubject.next(request);

    return new Promise(resolve => {
      this.confirmResolvers.set(id, resolve);
    });
  }

  resolveConfirm(id: string, result: boolean) {
    const resolver = this.confirmResolvers.get(id);
    if (resolver) {
      resolver(result);
      this.confirmResolvers.delete(id);
    }
    if (this.confirmSubject.value?.id === id) {
      this.confirmSubject.next(null);
    }
  }

  private createId(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

