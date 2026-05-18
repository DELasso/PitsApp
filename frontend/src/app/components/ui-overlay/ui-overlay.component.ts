import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmRequest, ToastItem, UiService } from '../../services/ui.service';

@Component({
  selector: 'app-ui-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-overlay.component.html',
  styleUrls: ['./ui-overlay.component.scss']
})
export class UiOverlayComponent implements OnInit, OnDestroy {
  toasts: ToastItem[] = [];
  confirm: ConfirmRequest | null = null;
  private sub = new Subscription();

  constructor(private ui: UiService) {}

  ngOnInit(): void {
    this.sub.add(this.ui.toasts$.subscribe(toasts => (this.toasts = toasts)));
    this.sub.add(this.ui.confirm$.subscribe(confirm => (this.confirm = confirm)));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  dismissToast(id: string) {
    this.ui.dismissToast(id);
  }

  cancelConfirm() {
    if (!this.confirm) return;
    this.ui.resolveConfirm(this.confirm.id, false);
  }

  acceptConfirm() {
    if (!this.confirm) return;
    this.ui.resolveConfirm(this.confirm.id, true);
  }

  getConfirmButtonClass(): string {
    const variant = this.confirm?.variant ?? 'primary';
    return variant === 'danger' ? 'btn btn-danger' : 'btn btn-primary';
  }

  getToastClass(toast: ToastItem): string {
    return `toast toast-${toast.variant}`;
  }
}

