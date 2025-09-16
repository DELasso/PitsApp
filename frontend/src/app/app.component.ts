import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from './services/cart.service';
import { AuthService } from './services/auth.service';
import { CartSummary } from './models/cart.model';
import { User } from './models/auth.model';

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
  currentUser: User | null = null;
  isLoggedIn = false;
  private destroy$ = new Subject<void>();
  
  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.loadCartSummary();
    this.loadAuthState();
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

  private loadAuthState(): void {
    // Suscribirse al estado de autenticación
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
      });

    // Suscribirse al usuario actual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
