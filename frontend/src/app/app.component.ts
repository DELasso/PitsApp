import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from './services/cart.service';
import { CartSummary } from './models/cart.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'PitsApp';
  cartSummary: CartSummary | null = null;
  private destroy$ = new Subject<void>();
  
  constructor(private cartService: CartService) {
    console.log('🚗 PitsApp Frontend iniciado correctamente');
  }

  ngOnInit(): void {
    this.loadCartSummary();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCartSummary(): void {
    this.cartService.getCartSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
      });
  }
}
