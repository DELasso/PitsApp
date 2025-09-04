import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Part } from '../models/part.model';

@Injectable({
  providedIn: 'root'  // 👈 Esto lo hace disponible globalmente
})
export class CartService {
  private items: Part[] = [];
  private cartItems = new BehaviorSubject<Part[]>([]);
  cartItems$ = this.cartItems.asObservable();

  addToCart(item: Part) {
    this.items.push(item);
    this.cartItems.next(this.items);
  }

  getItems() {
    return this.items;
  }

  removeFromCart(index: number) {
    this.items.splice(index, 1);
    this.cartItems.next(this.items);
  }

  clearCart() {
    this.items = [];
    this.cartItems.next(this.items);
  }
}
