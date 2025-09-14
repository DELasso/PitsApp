import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { Cart, CartSummary } from '../../models/cart.model';
import { CartItem } from '../../models/cart-item.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  cartSummary: CartSummary | null = null;
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
    this.loadCartSummary();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCart(): void {
    this.cartService.getCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart) => {
          this.cart = cart;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar el carrito:', error);
          this.isLoading = false;
        }
      });
  }

  private loadCartSummary(): void {
    this.cartService.getCartSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.cartSummary = summary;
        },
        error: (error) => {
          console.error('Error al cargar el resumen del carrito:', error);
        }
      });
  }

  updateQuantity(partId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(partId);
    } else {
      this.cartService.updateQuantity(partId, quantity);
    }
  }

  removeItem(partId: string): void {
    this.cartService.removeFromCart(partId);

  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  proceedToCheckout(): void {
    // Implementar lógica de checkout aquí
    alert('Funcionalidad de checkout pendiente de implementar');
  }

  continueShopping(): void {
    // Navegar de vuelta a la lista de repuestos
    window.location.href = '/repuestos';
  }
}