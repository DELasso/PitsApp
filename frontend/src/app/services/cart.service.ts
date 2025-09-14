import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Part } from '../models/part.model';
import { Cart, CartSummary } from '../models/cart.model';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Cart = {
    items: [],
    totalItems: 0,
    totalAmount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  private cartSubject = new BehaviorSubject<Cart>(this.cart);
  private cartSummarySubject = new BehaviorSubject<CartSummary>({
    totalItems: 0,
    totalAmount: 0,
    isEmpty: true
  });

  constructor() {
    this.loadCartFromStorage();
  }

  // Observables para que los componentes puedan suscribirse
  getCart(): Observable<Cart> {
    return this.cartSubject.asObservable();
  }

  getCartSummary(): Observable<CartSummary> {
    return this.cartSummarySubject.asObservable();
  }

  // Agregar un repuesto al carrito
  addToCart(part: Part, quantity: number = 1): void {
    const existingItemIndex = this.cart.items.findIndex(item => item.part.id === part.id);

    if (existingItemIndex > -1) {
      // Si el repuesto ya existe, actualizar la cantidad
      this.cart.items[existingItemIndex].quantity += quantity;
      this.cart.items[existingItemIndex].subtotal = 
        this.cart.items[existingItemIndex].quantity * this.cart.items[existingItemIndex].part.price;
    } else {
      // Si es un nuevo repuesto, agregarlo al carrito
      const newCartItem: CartItem = {
        id: this.generateCartItemId(),
        part: part,
        quantity: quantity,
        addedAt: new Date(),
        subtotal: part.price * quantity
      };
      this.cart.items.push(newCartItem);
    }

    this.updateCartTotals();
    this.saveCartToStorage();
    this.notifyCartUpdate();
  }

  // Quitar un repuesto del carrito
  removeFromCart(partId: string): void {
    this.cart.items = this.cart.items.filter(item => item.part.id !== partId);
    this.updateCartTotals();
    this.saveCartToStorage();
    this.notifyCartUpdate();
  }

  // Actualizar cantidad de un repuesto
  updateQuantity(partId: string, quantity: number): void {
    const itemIndex = this.cart.items.findIndex(item => item.part.id === partId);
    
    if (itemIndex > -1 && quantity > 0) {
      this.cart.items[itemIndex].quantity = quantity;
      this.cart.items[itemIndex].subtotal = 
        this.cart.items[itemIndex].quantity * this.cart.items[itemIndex].part.price;
      
      this.updateCartTotals();
      this.saveCartToStorage();
      this.notifyCartUpdate();
    } else if (quantity <= 0) {
      this.removeFromCart(partId);
    }
  }

  // Limpiar todo el carrito
  clearCart(): void {
    this.cart.items = [];
    this.updateCartTotals();
    this.saveCartToStorage();
    this.notifyCartUpdate();
  }

  // Verificar si un repuesto está en el carrito
  isInCart(partId: string): boolean {
    return this.cart.items.some(item => item.part.id === partId);
  }

  // Obtener la cantidad de un repuesto específico en el carrito
  getPartQuantity(partId: string): number {
    const item = this.cart.items.find(item => item.part.id === partId);
    return item ? item.quantity : 0;
  }

  // Métodos privados
  private updateCartTotals(): void {
    this.cart.totalItems = this.cart.items.reduce((total, item) => total + item.quantity, 0);
    this.cart.totalAmount = this.cart.items.reduce((total, item) => total + item.subtotal, 0);
    this.cart.updatedAt = new Date();
  }

  private buildCartSummary(): CartSummary {
    return {
      totalItems: this.cart.totalItems,
      totalAmount: this.cart.totalAmount,
      isEmpty: this.cart.items.length === 0
    };
  }

  private notifyCartUpdate(): void {
    this.cartSubject.next({ ...this.cart });
    this.cartSummarySubject.next(this.buildCartSummary());
  }

  private generateCartItemId(): string {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Persistencia en localStorage
  private saveCartToStorage(): void {
    try {
      localStorage.setItem('pitsapp_cart', JSON.stringify(this.cart));
    } catch (error) {
      console.warn('No se pudo guardar el carrito en localStorage:', error);
    }
  }

  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem('pitsapp_cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        this.cart = {
          ...parsedCart,
          createdAt: new Date(parsedCart.createdAt),
          updatedAt: new Date(parsedCart.updatedAt),
          items: parsedCart.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }))
        };
        this.updateCartTotals();
        this.notifyCartUpdate();
      }
    } catch (error) {
      console.warn('No se pudo cargar el carrito desde localStorage:', error);
      this.cart = {
        items: [],
        totalItems: 0,
        totalAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }
}