import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Part } from '../../models/part.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  items: Part[] = [];

  constructor(private cartService: CartService) {
    this.items = this.cartService.getItems();
  }

  removeItem(index: number) {
    this.cartService.removeFromCart(index);
    this.items = this.cartService.getItems();
  }

  clearCart() {
    this.cartService.clearCart();
    this.items = [];
  }

  getTotal(): number {
    return this.items.reduce((acc, item) => acc + item.price, 0);
  }

  checkout() {
    if (this.items.length === 0) return;

    // Aquí podrías redirigir a una página de pago o procesar la orden
    alert(`Compra realizada con éxito 🎉\nTotal: ${this.getTotal().toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`);

    this.clearCart();
  }
}
  
