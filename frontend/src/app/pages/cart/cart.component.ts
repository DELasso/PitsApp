import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { FileUploadService } from '../../services/file-upload.service';
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

  constructor(
    private cartService: CartService, 
    private router: Router,
    private fileUploadService: FileUploadService
  ) {}

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
    if (this.cartSummary?.isEmpty) {
      alert('Tu carrito está vacío. Agrega algunos repuestos antes de proceder al checkout.');
      return;
    }
    
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/repuestos']);
  }

  getImageUrl(imagePath: string): string {
    return this.fileUploadService.getImageUrl(imagePath);
  }
}