export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: 'CC' | 'CE' | 'NIT' | 'TI';
  documentNumber: string;
}

export interface ShippingAddress {
  street: string;
  neighborhood: string;
  city: string;
  department: string;
  postalCode?: string;
  additionalInfo?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'pse' | 'nequi' | 'daviplata' | 'cash';
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
}

export interface CreditCardInfo {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

export interface CheckoutData {
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  creditCardInfo?: CreditCardInfo;
  notes?: string;
  acceptTerms: boolean;
}