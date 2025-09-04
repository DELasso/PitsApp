import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Part } from '../../models/part.model';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrderComponent {
  items: Part[] = [];
  orderForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    address: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private router: Router
  ) {
    this.items = this.cartService.getItems();
  }

  getTotal(): number {
    return this.items.reduce((acc, item) => acc + item.price, 0);
  }

  submitOrder() {
    if (this.orderForm.valid) {
      const orderData = {
        customer: this.orderForm.value,
        items: this.items,
        total: this.getTotal(),
        date: new Date()
      };

      console.log('Pedido generado ✅', orderData);

      // Limpiar carrito
      this.cartService.clearCart();

      // Redirigir a confirmación o carrito vacío
      this.router.navigate(['/cart']);
    }
  }
}
