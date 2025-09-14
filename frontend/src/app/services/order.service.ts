import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Order, OrderStatus, PaymentStatus, CreateOrderRequest, OrderSummary } from '../models/order.model';
import { CheckoutData } from '../models/checkout.model';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders: Order[] = [];
  private ordersSubject = new BehaviorSubject<Order[]>([]);

  constructor() {
    this.loadOrdersFromStorage();
  }

  // Crear una nueva orden
  createOrder(checkoutData: CheckoutData, cartItems: CartItem[]): Observable<Order> {
    const orderSummary = this.calculateOrderSummary(cartItems);
    
    const order: Order = {
      id: this.generateOrderId(),
      orderNumber: this.generateOrderNumber(),
      customerInfo: checkoutData.customerInfo,
      shippingAddress: checkoutData.shippingAddress,
      items: cartItems,
      subtotal: orderSummary.subtotal,
      shippingCost: orderSummary.shippingCost,
      taxes: orderSummary.taxes,
      total: orderSummary.total,
      paymentMethod: checkoutData.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
      notes: checkoutData.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDelivery: this.calculateEstimatedDelivery()
    };

    // Simular procesamiento de pago
    return this.processPayment(order).pipe(
      delay(2000) // Simular tiempo de procesamiento
    );
  }

  // Simular procesamiento de pago
  private processPayment(order: Order): Observable<Order> {
    return new Observable(observer => {
      // Simular diferentes resultados de pago
      const paymentSuccess = Math.random() > 0.05; // 95% de éxito

      setTimeout(() => {
        if (paymentSuccess) {
          order.paymentStatus = PaymentStatus.APPROVED;
          order.orderStatus = OrderStatus.CONFIRMED;
          order.trackingNumber = this.generateTrackingNumber();
        } else {
          order.paymentStatus = PaymentStatus.REJECTED;
          order.orderStatus = OrderStatus.CANCELLED;
        }

        order.updatedAt = new Date();
        
        if (paymentSuccess) {
          this.orders.push(order);
          this.saveOrdersToStorage();
          this.ordersSubject.next([...this.orders]);
        }

        observer.next(order);
        observer.complete();
      }, 1000);
    });
  }

  // Obtener órdenes del usuario
  getUserOrders(): Observable<Order[]> {
    return this.ordersSubject.asObservable();
  }

  // Obtener orden por ID
  getOrderById(orderId: string): Observable<Order | null> {
    const order = this.orders.find(o => o.id === orderId);
    return of(order || null);
  }

  // Calcular resumen de la orden
  calculateOrderSummary(cartItems: CartItem[]): OrderSummary {
    const subtotal = cartItems.reduce((total, item) => total + item.subtotal, 0);
    const shippingCost = this.calculateShippingCost(subtotal);
    const taxes = this.calculateTaxes(subtotal);
    const total = subtotal + shippingCost + taxes;
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return {
      subtotal,
      shippingCost,
      taxes,
      total,
      itemCount
    };
  }

  // Calcular costo de envío
  private calculateShippingCost(subtotal: number): number {
    // Envío gratis para pedidos mayores a $200,000
    if (subtotal >= 200000) {
      return 0;
    }
    return 15000; // Costo fijo de envío
  }

  // Calcular impuestos
  private calculateTaxes(subtotal: number): number {
    // IVA del 19%
    return Math.round(subtotal * 0.19);
  }

  // Calcular fecha estimada de entrega
  private calculateEstimatedDelivery(): Date {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 días hábiles
    return deliveryDate;
  }

  // Generar ID único para la orden
  private generateOrderId(): string {
    return 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Generar número de orden
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PA-${timestamp}-${random}`;
  }

  // Generar número de seguimiento
  private generateTrackingNumber(): string {
    return 'TRK' + Date.now().toString().slice(-10);
  }

  // Persistencia en localStorage
  private saveOrdersToStorage(): void {
    try {
      localStorage.setItem('pitsapp_orders', JSON.stringify(this.orders));
    } catch (error) {
      console.warn('No se pudieron guardar las órdenes en localStorage:', error);
    }
  }

  private loadOrdersFromStorage(): void {
    try {
      const savedOrders = localStorage.getItem('pitsapp_orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        this.orders = parsedOrders.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
          items: order.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }))
        }));
        this.ordersSubject.next([...this.orders]);
      }
    } catch (error) {
      console.warn('No se pudieron cargar las órdenes desde localStorage:', error);
      this.orders = [];
    }
  }

  // Simular actualización de estado de orden
  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order | null> {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.orderStatus = status;
      order.updatedAt = new Date();
      this.saveOrdersToStorage();
      this.ordersSubject.next([...this.orders]);
      return of(order);
    }
    return of(null);
  }

  // Cancelar orden
  cancelOrder(orderId: string): Observable<boolean> {
    const order = this.orders.find(o => o.id === orderId);
    if (order && order.orderStatus === OrderStatus.PENDING) {
      order.orderStatus = OrderStatus.CANCELLED;
      order.paymentStatus = PaymentStatus.CANCELLED;
      order.updatedAt = new Date();
      this.saveOrdersToStorage();
      this.ordersSubject.next([...this.orders]);
      return of(true);
    }
    return of(false);
  }
}