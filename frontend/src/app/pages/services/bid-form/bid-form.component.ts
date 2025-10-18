import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faSave,
  faPlus,
  faTrash,
  faDollarSign,
  faClock,
  faFileAlt,
  faShieldAlt,
  faInfoCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { ServiceRequestService } from '../../../services/service-request.service';
import { BidService } from '../../../services/bid.service';
import { ServiceRequest } from '../../../models/service-request.model';
import { CreateBidDto, PaymentTerms } from '../../../models/bid.model';

@Component({
  selector: 'app-bid-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './bid-form.component.html',
  styleUrls: ['./bid-form.component.scss']
})
export class BidFormComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  faSave = faSave;
  faPlus = faPlus;
  faTrash = faTrash;
  faDollarSign = faDollarSign;
  faClock = faClock;
  faFileAlt = faFileAlt;
  faShieldAlt = faShieldAlt;
  faInfoCircle = faInfoCircle;
  faSpinner = faSpinner;

  bidForm!: FormGroup;
  serviceRequest: ServiceRequest | null = null;
  requestId: string = '';
  
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  
  paymentTermsOptions = [
    { value: PaymentTerms.FULL_UPFRONT, label: 'Pago Total por Adelantado' },
    { value: PaymentTerms.PARTIAL_UPFRONT, label: 'Pago Parcial Adelantado (50%)' },
    { value: PaymentTerms.ON_COMPLETION, label: 'Pago al Completar' },
    { value: PaymentTerms.INSTALLMENTS, label: 'Pago en Cuotas' }
  ];

  serviceTypeLabels: Record<string, string> = {
    'home_service': 'Servicio a Domicilio',
    'tow_truck': 'Grúa y Remolque',
    'express_oil_change': 'Cambio de Aceite Express',
    'mechanical_diagnosis': 'Diagnóstico Mecánico',
    'specific_repair': 'Reparación Específica',
    'emergency_service': 'Servicio de Emergencia',
    'tire_change': 'Cambio de Llantas',
    'battery_service': 'Servicio de Batería',
    'other': 'Otro Servicio'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private serviceRequestService: ServiceRequestService,
    private bidService: BidService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.requestId = this.route.snapshot.params['id'];
    this.loadServiceRequest();
  }

  initForm(): void {
    this.bidForm = this.fb.group({
      items: this.fb.array([]),
      totalAmount: [{ value: 0, disabled: true }],
      estimatedCompletionTime: ['', [Validators.required, Validators.min(1)]],
      estimatedTimeUnit: ['hours', Validators.required],
      warrantyPeriod: ['', [Validators.required, Validators.min(0)]],
      warrantyPeriodUnit: ['days', Validators.required],
      warrantyDetails: [''],
      paymentTerms: [PaymentTerms.ON_COMPLETION, Validators.required],
      notes: ['', Validators.maxLength(1000)]
    });

    // Add at least one item by default
    this.addItem();
  }

  get items(): FormArray {
    return this.bidForm.get('items') as FormArray;
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      subtotal: [{ value: 0, disabled: true }]
    });

    // Update subtotal when quantity or unit price changes
    itemGroup.get('quantity')?.valueChanges.subscribe(() => this.updateItemSubtotal(itemGroup));
    itemGroup.get('unitPrice')?.valueChanges.subscribe(() => this.updateItemSubtotal(itemGroup));

    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.updateTotalAmount();
    }
  }

  updateItemSubtotal(itemGroup: FormGroup): void {
    const quantity = itemGroup.get('quantity')?.value || 0;
    const unitPrice = itemGroup.get('unitPrice')?.value || 0;
    const subtotal = quantity * unitPrice;
    itemGroup.get('subtotal')?.setValue(subtotal, { emitEvent: false });
    this.updateTotalAmount();
  }

  updateTotalAmount(): void {
    let total = 0;
    this.items.controls.forEach(item => {
      const subtotal = item.get('subtotal')?.value || 0;
      total += subtotal;
    });
    this.bidForm.get('totalAmount')?.setValue(total, { emitEvent: false });
  }

  loadServiceRequest(): void {
    this.isLoading = true;
    this.serviceRequestService.getById(this.requestId).subscribe({
      next: (request) => {
        this.serviceRequest = request;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading service request:', error);
        this.errorMessage = 'Error al cargar la solicitud de servicio';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.bidForm.invalid) {
      this.markFormGroupTouched(this.bidForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Build CreateBidDto
    const formValue = this.bidForm.getRawValue();
    
    // Convert time to hours
    let estimatedHours = formValue.estimatedCompletionTime;
    if (formValue.estimatedTimeUnit === 'days') {
      estimatedHours = formValue.estimatedCompletionTime * 24;
    } else if (formValue.estimatedTimeUnit === 'weeks') {
      estimatedHours = formValue.estimatedCompletionTime * 24 * 7;
    }

    // Convert warranty to days
    let warrantyDays = formValue.warrantyPeriod;
    if (formValue.warrantyPeriodUnit === 'weeks') {
      warrantyDays = formValue.warrantyPeriod * 7;
    } else if (formValue.warrantyPeriodUnit === 'months') {
      warrantyDays = formValue.warrantyPeriod * 30;
    } else if (formValue.warrantyPeriodUnit === 'years') {
      warrantyDays = formValue.warrantyPeriod * 365;
    }

    const createBidDto: CreateBidDto = {
      serviceRequestId: this.requestId,
      items: formValue.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      totalAmount: formValue.totalAmount,
      estimatedCompletionTime: estimatedHours,
      warrantyPeriod: warrantyDays,
      warrantyDetails: formValue.warrantyDetails || undefined,
      paymentTerms: formValue.paymentTerms,
      notes: formValue.notes || undefined
    };

    this.bidService.create(createBidDto).subscribe({
      next: (bid) => {
        // Navigate back to available requests
        this.router.navigate(['/services/available']);
      },
      error: (error) => {
        console.error('Error creating bid:', error);
        this.errorMessage = error.error?.message || 'Error al crear la oferta. Por favor intenta nuevamente.';
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/services/available']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bidForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isItemFieldInvalid(index: number, fieldName: string): boolean {
    const field = this.items.at(index).get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getServiceTypeLabel(serviceType: string): string {
    return this.serviceTypeLabels[serviceType] || serviceType;
  }
}
