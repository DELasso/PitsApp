import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { FileUploadService } from '../../services/file-upload.service';
import { Cart } from '../../models/cart.model';
import { PaymentMethod, CustomerInfo, ShippingAddress, CheckoutData } from '../../models/checkout.model';
import { OrderSummary } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  checkoutForm!: FormGroup;
  currentStep = 1;
  totalSteps = 3;
  isProcessing = false;
  
  private destroy$ = new Subject<void>();

  // Métodos de pago disponibles
  paymentMethods: PaymentMethod[] = [
    {
      id: 'credit_card',
      type: 'credit_card',
      name: 'Tarjeta de Crédito',
      icon: 'fas fa-credit-card',
      description: 'Visa, Mastercard, American Express',
      isAvailable: true
    },
    {
      id: 'debit_card',
      type: 'debit_card',
      name: 'Tarjeta Débito',
      icon: 'fas fa-credit-card',
      description: 'Débito Visa, Mastercard',
      isAvailable: true
    },
    {
      id: 'pse',
      type: 'pse',
      name: 'PSE',
      icon: 'fas fa-university',
      description: 'Pagos Seguros en Línea',
      isAvailable: true
    },
    {
      id: 'nequi',
      type: 'nequi',
      name: 'Nequi',
      icon: 'fas fa-mobile-alt',
      description: 'Pago con Nequi',
      isAvailable: true
    },
    {
      id: 'daviplata',
      type: 'daviplata',
      name: 'DaviPlata',
      icon: 'fas fa-mobile-alt',
      description: 'Pago con DaviPlata',
      isAvailable: true
    },
    {
      id: 'cash',
      type: 'cash',
      name: 'Efectivo',
      icon: 'fas fa-money-bill-wave',
      description: 'Pago contra entrega',
      isAvailable: true
    }
  ];

  selectedPaymentMethod: PaymentMethod | null = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private formBuilder: FormBuilder,
    private router: Router,
    private fileUploadService: FileUploadService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.checkoutForm = this.formBuilder.group({
      // Información del cliente
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      documentType: ['CC', Validators.required],
      documentNumber: ['', [Validators.required, Validators.minLength(6)]],
      
      // Dirección de envío
      street: ['', Validators.required],
      neighborhood: ['', Validators.required],
      city: ['Medellín', Validators.required],
      department: ['Antioquia', Validators.required],
      postalCode: [''],
      additionalInfo: [''],
      
      // Información de pago (para tarjetas)
      cardNumber: [''],
      expiryMonth: [''],
      expiryYear: [''],
      cvv: [''],
      cardholderName: [''],
      
      // Otros
      notes: [''],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  private loadCart(): void {
    this.cartService.getCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart) => {
          this.cart = cart;
          if (!cart || cart.items.length === 0) {
            this.router.navigate(['/carrito']);
          }
        },
        error: (error) => {
          console.error('Error al cargar el carrito:', error);
          this.router.navigate(['/carrito']);
        }
      });
  }

  get orderSummary(): OrderSummary {
    if (!this.cart) {
      return {
        subtotal: 0,
        shippingCost: 0,
        taxes: 0,
        total: 0,
        itemCount: 0
      };
    }

    const subtotal = this.cart.totalAmount;
    const shippingCost = this.calculateShippingCost();
    const taxes = this.calculateTaxes(subtotal);
    const total = subtotal + shippingCost + taxes;

    return {
      subtotal,
      shippingCost,
      taxes,
      total,
      itemCount: this.cart.totalItems
    };
  }

  private calculateShippingCost(): number {
    // Envío gratis para pedidos mayores a $200,000
    if (this.cart && this.cart.totalAmount >= 200000) {
      return 0;
    }
    return 15000; // Costo fijo de envío
  }

  private calculateTaxes(subtotal: number): number {
    // IVA del 19% solo para algunos productos (simplificado)
    return Math.round(subtotal * 0.19);
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      if (this.validateCurrentStep()) {
        this.currentStep++;
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.validateCustomerInfo();
      case 2:
        return this.validateShippingInfo();
      case 3:
        return this.validatePaymentInfo();
      default:
        return false;
    }
  }

  private validateCustomerInfo(): boolean {
    const fields = ['firstName', 'lastName', 'email', 'phone', 'documentType', 'documentNumber'];
    return fields.every(field => this.checkoutForm.get(field)?.valid);
  }

  private validateShippingInfo(): boolean {
    const fields = ['street', 'neighborhood', 'city', 'department'];
    return fields.every(field => this.checkoutForm.get(field)?.valid);
  }

  private validatePaymentInfo(): boolean {
    if (!this.selectedPaymentMethod) {
      return false;
    }

    if (this.selectedPaymentMethod.type === 'credit_card' || this.selectedPaymentMethod.type === 'debit_card') {
      const cardFields = ['cardNumber', 'expiryMonth', 'expiryYear', 'cvv', 'cardholderName'];
      return cardFields.every(field => this.checkoutForm.get(field)?.valid);
    }

    return true;
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
    
    // Configurar validaciones para tarjetas
    if (method.type === 'credit_card' || method.type === 'debit_card') {
      this.checkoutForm.get('cardNumber')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{16}$/)]);
      this.checkoutForm.get('expiryMonth')?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]);
      this.checkoutForm.get('expiryYear')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{4}$/)]);
      this.checkoutForm.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]);
      this.checkoutForm.get('cardholderName')?.setValidators([Validators.required, Validators.minLength(3)]);
    } else {
      // Limpiar validaciones para otros métodos
      this.checkoutForm.get('cardNumber')?.clearValidators();
      this.checkoutForm.get('expiryMonth')?.clearValidators();
      this.checkoutForm.get('expiryYear')?.clearValidators();
      this.checkoutForm.get('cvv')?.clearValidators();
      this.checkoutForm.get('cardholderName')?.clearValidators();
    }

    // Actualizar validaciones
    Object.keys(this.checkoutForm.controls).forEach(key => {
      this.checkoutForm.get(key)?.updateValueAndValidity();
    });
  }

  async processOrder(): Promise<void> {
    if (!this.checkoutForm.valid || !this.selectedPaymentMethod || !this.cart) {
      alert('Por favor, completa todos los campos requeridos');
      return;
    }

    this.isProcessing = true;

    try {
      const checkoutData: CheckoutData = this.buildCheckoutData();
      
      // Crear la orden usando el OrderService
      this.orderService.createOrder(checkoutData, this.cart.items).subscribe({
        next: (order) => {
          console.log('Orden creada exitosamente:', order);
          
          // Limpiar carrito después de crear la orden
          this.cartService.clearCart();
          
          // Redirigir a página de confirmación
          this.router.navigate(['/checkout/confirmation']);
        },
        error: (error) => {
          console.error('Error al crear la orden:', error);
          alert('Hubo un error al procesar tu pedido. Por favor, intenta nuevamente.');
          this.isProcessing = false;
        }
      });

    } catch (error) {
      console.error('Error al procesar la orden:', error);
      alert('Hubo un error al procesar tu pedido. Por favor, intenta nuevamente.');
      this.isProcessing = false;
    }
  }

  private buildCheckoutData(): CheckoutData {
    const formValue = this.checkoutForm.value;
    
    return {
      customerInfo: {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone,
        documentType: formValue.documentType,
        documentNumber: formValue.documentNumber
      },
      shippingAddress: {
        street: formValue.street,
        neighborhood: formValue.neighborhood,
        city: formValue.city,
        department: formValue.department,
        postalCode: formValue.postalCode,
        additionalInfo: formValue.additionalInfo
      },
      paymentMethod: this.selectedPaymentMethod!,
      creditCardInfo: this.selectedPaymentMethod?.type === 'credit_card' || this.selectedPaymentMethod?.type === 'debit_card' ? {
        cardNumber: formValue.cardNumber,
        expiryMonth: formValue.expiryMonth,
        expiryYear: formValue.expiryYear,
        cvv: formValue.cvv,
        cardholderName: formValue.cardholderName
      } : undefined,
      notes: formValue.notes,
      acceptTerms: formValue.acceptTerms
    };
  }

  private simulatePaymentProcessing(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000); // Simular 2 segundos de procesamiento
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  goBackToCart(): void {
    this.router.navigate(['/carrito']);
  }

  getImageUrl(imagePath: string): string {
    return this.fileUploadService.getImageUrl(imagePath);
  }
}