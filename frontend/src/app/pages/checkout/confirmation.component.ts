import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  order: Order | null = null;
  loading = true;

  constructor(
    private router: Router,
    private orderService: OrderService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadLatestOrder();
  }

  private loadLatestOrder() {
    // Obtener la última orden del servicio
    this.orderService.getUserOrders().subscribe(orders => {
      if (orders.length > 0) {
        this.order = orders[orders.length - 1]; // Última orden
      }
      
      this.loading = false;

      // Si no hay orden, redirigir al carrito
      if (!this.order) {
        this.router.navigate(['/carrito']);
      }
    });
  }

  continueShopping() {
    // El carrito ya fue limpiado en el checkout
    this.router.navigate(['/repuestos']);
  }

  viewMyOrders() {
    // Redirigir a una página de órdenes (por implementar)
    this.router.navigate(['/']);
  }

  printOrder() {
    if (this.order) {
      window.print();
    }
  }

  getStatusClass(): string {
    if (!this.order) return '';
    
    switch (this.order.orderStatus) {
      case 'confirmed':
      case 'delivered':
        return 'status-completed';
      case 'processing':
      case 'shipped':
        return 'status-processing';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusText(): string {
    if (!this.order) return '';
    
    switch (this.order.orderStatus) {
      case 'confirmed':
        return 'Confirmada';
      case 'processing':
        return 'En Proceso';
      case 'shipped':
        return 'Enviada';
      case 'delivered':
        return 'Entregada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'refunded':
        return 'Reembolsada';
      default:
        return this.order.orderStatus;
    }
  }
}