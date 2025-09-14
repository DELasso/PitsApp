import { CartItem } from './cart-item.model';

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartSummary {
  totalItems: number;
  totalAmount: number;
  isEmpty: boolean;
}