import { CartItem } from './cart-item.model';
import { CustomerInfo, ShippingAddress, PaymentMethod } from './checkout.model';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface Order {
  id: string;
  orderNumber: string;
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  taxes: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  trackingNumber?: string;
}

export interface CreateOrderRequest {
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  paymentMethodId: string;
  notes?: string;
}

export interface OrderSummary {
  subtotal: number;
  shippingCost: number;
  taxes: number;
  total: number;
  itemCount: number;
}