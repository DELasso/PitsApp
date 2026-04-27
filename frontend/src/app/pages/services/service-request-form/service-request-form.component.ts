import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ServiceRequestService } from '../../../services/service-request.service';
import { ServiceType, VehicleType, UrgencyLevel } from '../../../models/service-request.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-service-request-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './service-request-form.component.html',
  styleUrls: ['./service-request-form.component.scss']
})
export class ServiceRequestFormComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  faCheck = faCheck;
  faSpinner = faSpinner;

  serviceType!: ServiceType;
  serviceForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  vehicleInfoLoaded = false;

  ServiceType = ServiceType;
  VehicleType = VehicleType;
  UrgencyLevel = UrgencyLevel;

  vehicleTypes = Object.values(VehicleType);
  urgencyLevels = Object.values(UrgencyLevel);

  serviceTypeLabels: Record<ServiceType, string> = {
    [ServiceType.HOME_SERVICE]: 'Servicio a Domicilio',
    [ServiceType.TOW_TRUCK]: 'Grúa y Remolque',
    [ServiceType.EXPRESS_OIL_CHANGE]: 'Cambio de Aceite Express',
    [ServiceType.MECHANICAL_DIAGNOSIS]: 'Diagnóstico Mecánico',
    [ServiceType.SPECIFIC_REPAIR]: 'Reparación Específica',
    [ServiceType.EMERGENCY_SERVICE]: 'Servicio de Emergencia',
    [ServiceType.TIRE_CHANGE]: 'Cambio de Llantas',
    [ServiceType.BATTERY_SERVICE]: 'Servicio de Batería',
    [ServiceType.OTHER]: 'Otro Servicio'
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private serviceRequestService: ServiceRequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.serviceType = this.route.snapshot.paramMap.get('type') as ServiceType;
    this.initializeForm();
    this.loadUserVehicleInfo();
  }

  loadUserVehicleInfo(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.vehicleInfo) {
      const vehicle = currentUser.vehicleInfo;
      this.serviceForm.patchValue({
        vehicleBrand: vehicle.brand || '',
        vehicleModel: vehicle.model || '',
        vehicleYear: vehicle.year || '',
        vehiclePlate: vehicle.plate || ''
      });
      this.vehicleInfoLoaded = true;
    }
  }

  initializeForm(): void {
    // Formulario base
    this.serviceForm = this.fb.group({
      // Información del vehículo
      vehicleType: ['', Validators.required],
      vehicleBrand: [''],
      vehicleModel: [''],
      vehicleYear: [''],
      vehiclePlate: [''],

      // Detalles generales
      description: ['', [
        Validators.required, 
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      urgencyLevel: ['medium', Validators.required],
      budgetMin: [''],
      budgetMax: [''],
      preferredDate: [''],
      preferredTimeSlot: ['flexible'],
      additionalNotes: ['']
    });

    // Agregar campos específicos según el tipo de servicio
    this.addServiceSpecificFields();
  }

  addServiceSpecificFields(): void {
    switch (this.serviceType) {
      case ServiceType.HOME_SERVICE:
        this.addHomeServiceFields();
        break;
      case ServiceType.TOW_TRUCK:
        this.addTowTruckFields();
        break;
      case ServiceType.EXPRESS_OIL_CHANGE:
        this.addOilChangeFields();
        break;
      case ServiceType.MECHANICAL_DIAGNOSIS:
        this.addDiagnosisFields();
        break;
      case ServiceType.SPECIFIC_REPAIR:
        this.addRepairFields();
        break;
    }
  }

  addHomeServiceFields(): void {
    this.serviceForm.addControl('address', this.fb.control('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(150)
    ]));
    this.serviceForm.addControl('city', this.fb.control('Medellín', [
      Validators.required,
      Validators.minLength(2)
    ]));
    this.serviceForm.addControl('neighborhood', this.fb.control(''));
    this.serviceForm.addControl('unitType', this.fb.control('house'));
    this.serviceForm.addControl('unitNumber', this.fb.control(''));
    this.serviceForm.addControl('floor', this.fb.control(''));
    this.serviceForm.addControl('additionalDirections', this.fb.control(''));
    this.serviceForm.addControl('hasParking', this.fb.control(true));
  }

  addTowTruckFields(): void {
    this.serviceForm.addControl('pickupAddress', this.fb.control('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(150)
    ]));
    this.serviceForm.addControl('pickupCity', this.fb.control('Medellín', [
      Validators.required,
      Validators.minLength(2)
    ]));
    this.serviceForm.addControl('deliveryAddress', this.fb.control('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(150)
    ]));
    this.serviceForm.addControl('deliveryCity', this.fb.control('Medellín', [
      Validators.required,
      Validators.minLength(2)
    ]));
    this.serviceForm.addControl('estimatedDistance', this.fb.control(''));
    this.serviceForm.addControl('vehicleCondition', this.fb.control('not_running', Validators.required));
    this.serviceForm.addControl('needsFlatbed', this.fb.control(false));
    this.serviceForm.addControl('towAdditionalInfo', this.fb.control(''));
  }

  addOilChangeFields(): void {
    this.serviceForm.addControl('currentMileage', this.fb.control('', [Validators.required, Validators.min(0)]));
    this.serviceForm.addControl('lastOilChange', this.fb.control(''));
    this.serviceForm.addControl('preferredOilBrand', this.fb.control(''));
    this.serviceForm.addControl('oilType', this.fb.control('synthetic'));
    this.serviceForm.addControl('includeFilter', this.fb.control(true));
    this.serviceForm.addControl('additionalServices', this.fb.control([]));
  }

  addDiagnosisFields(): void {
    this.serviceForm.addControl('symptoms', this.fb.control('', [
      Validators.required, 
      Validators.minLength(20),
      Validators.maxLength(500)
    ]));
    this.serviceForm.addControl('whenStarted', this.fb.control(''));
    this.serviceForm.addControl('warningLights', this.fb.control([]));
    this.serviceForm.addControl('recentRepairs', this.fb.control(''));
    this.serviceForm.addControl('needsScanner', this.fb.control(false));
  }

  addRepairFields(): void {
    this.serviceForm.addControl('problemDescription', this.fb.control('', [
      Validators.required, 
      Validators.minLength(20),
      Validators.maxLength(500)
    ]));
    this.serviceForm.addControl('affectedParts', this.fb.control([]));
    this.serviceForm.addControl('previousDiagnosis', this.fb.control(''));
    this.serviceForm.addControl('hasWarranty', this.fb.control(false));
    this.serviceForm.addControl('preferredParts', this.fb.control('original'));
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.markFormGroupTouched(this.serviceForm);
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = this.prepareFormData();

    this.serviceRequestService.create(formData).subscribe({
      next: (response) => {
        this.successMessage = '¡Solicitud creada exitosamente! Pronto recibirás ofertas.';
        setTimeout(() => {
          this.router.navigate(['/servicios/mis-solicitudes']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error creating service request:', error);
        this.errorMessage = error.error?.message || 'Error al crear la solicitud. Intenta nuevamente.';
        this.isSubmitting = false;
      }
    });
  }

  prepareFormData(): any {
    const formValue = this.serviceForm.value;
    const data: any = {
      serviceType: this.serviceType,
      vehicleType: formValue.vehicleType,
      vehicleBrand: formValue.vehicleBrand,
      vehicleModel: formValue.vehicleModel,
      vehicleYear: formValue.vehicleYear ? parseInt(formValue.vehicleYear) : undefined,
      vehiclePlate: formValue.vehiclePlate,
      description: formValue.description,
      urgencyLevel: formValue.urgencyLevel,
      budgetMin: formValue.budgetMin ? parseFloat(formValue.budgetMin) : undefined,
      budgetMax: formValue.budgetMax ? parseFloat(formValue.budgetMax) : undefined,
      preferredDate: formValue.preferredDate,
      preferredTimeSlot: formValue.preferredTimeSlot,
      additionalNotes: formValue.additionalNotes
    };

    // Agregar detalles específicos según el tipo
    switch (this.serviceType) {
      case ServiceType.HOME_SERVICE:
        data.homeServiceDetails = {
          address: formValue.address,
          city: formValue.city,
          neighborhood: formValue.neighborhood,
          unitType: formValue.unitType,
          unitNumber: formValue.unitNumber,
          floor: formValue.floor,
          additionalDirections: formValue.additionalDirections,
          hasParking: formValue.hasParking
        };
        break;

      case ServiceType.TOW_TRUCK:
        data.towTruckDetails = {
          pickupAddress: formValue.pickupAddress,
          pickupCity: formValue.pickupCity,
          deliveryAddress: formValue.deliveryAddress,
          deliveryCity: formValue.deliveryCity,
          estimatedDistance: formValue.estimatedDistance ? parseFloat(formValue.estimatedDistance) : undefined,
          vehicleCondition: formValue.vehicleCondition,
          needsFlatbed: formValue.needsFlatbed,
          additionalInfo: formValue.towAdditionalInfo
        };
        break;

      case ServiceType.EXPRESS_OIL_CHANGE:
        data.oilChangeDetails = {
          currentMileage: parseFloat(formValue.currentMileage),
          lastOilChange: formValue.lastOilChange ? parseFloat(formValue.lastOilChange) : undefined,
          preferredOilBrand: formValue.preferredOilBrand,
          oilType: formValue.oilType,
          includeFilter: formValue.includeFilter,
          additionalServices: formValue.additionalServices
        };
        break;

      case ServiceType.MECHANICAL_DIAGNOSIS:
        data.diagnosisDetails = {
          symptoms: formValue.symptoms,
          whenStarted: formValue.whenStarted,
          warningLights: formValue.warningLights,
          recentRepairs: formValue.recentRepairs,
          needsScanner: formValue.needsScanner
        };
        break;

      case ServiceType.SPECIFIC_REPAIR:
        data.repairDetails = {
          problemDescription: formValue.problemDescription,
          affectedParts: formValue.affectedParts,
          previousDiagnosis: formValue.previousDiagnosis,
          hasWarranty: formValue.hasWarranty,
          preferredParts: formValue.preferredParts
        };
        break;
    }

    return data;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.serviceForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    // Mensajes específicos por tipo de error
    switch (fieldName) {
      case 'vehicleType':
        if (errors['required']) return 'El tipo de vehículo es obligatorio';
        break;
      case 'address':
        if (errors['required']) return 'La dirección es obligatoria';
        if (errors['minlength']) return `La dirección debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
        if (errors['maxlength']) return `La dirección no puede exceder ${errors['maxlength'].requiredLength} caracteres`;
        break;
      case 'city':
        if (errors['required']) return 'La ciudad es obligatoria';
        if (errors['minlength']) return `La ciudad debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
        break;
      case 'pickupAddress':
        if (errors['required']) return 'La dirección de recogida es obligatoria';
        if (errors['minlength']) return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
        break;
      case 'deliveryAddress':
        if (errors['required']) return 'La dirección de entrega es obligatoria';
        if (errors['minlength']) return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
        break;
      case 'pickupCity':
        if (errors['required']) return 'La ciudad de recogida es obligatoria';
        break;
      case 'deliveryCity':
        if (errors['required']) return 'La ciudad de entrega es obligatoria';
        break;
      case 'vehicleCondition':
        if (errors['required']) return 'La condición del vehículo es obligatoria';
        break;
      case 'currentMileage':
        if (errors['required']) return 'El kilometraje actual es obligatorio';
        if (errors['min']) return 'El kilometraje debe ser mayor o igual a 0';
        if (errors['max']) return 'El kilometraje no puede exceder 1,000,000 km';
        break;
      case 'symptoms':
        if (errors['required']) return 'La descripción de síntomas es obligatoria';
        if (errors['minlength']) return `Los síntomas deben tener al menos ${errors['minlength'].requiredLength} caracteres`;
        if (errors['maxlength']) return `No pueden exceder ${errors['maxlength'].requiredLength} caracteres`;
        break;
      case 'problemDescription':
        if (errors['required']) return 'La descripción del problema es obligatoria';
        if (errors['minlength']) return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
        if (errors['maxlength']) return `No puede exceder ${errors['maxlength'].requiredLength} caracteres`;
        break;
      case 'description':
        if (errors['required']) return 'La descripción del servicio es obligatoria';
        if (errors['minlength']) return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
        break;
    }

    return 'Este campo tiene un error';
  }

  hasError(fieldName: string): boolean {
    const control = this.serviceForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isFieldRequired(fieldName: string): boolean {
    const control = this.serviceForm.get(fieldName);
    if (!control || !control.validator) return false;
    
    const validator = control.validator({} as any);
    return !!(validator && validator['required']);
  }

  getFieldCharacterCount(fieldName: string): { current: number; max: number | null } {
    const control = this.serviceForm.get(fieldName);
    const value = control?.value || '';
    
    const maxLengths: { [key: string]: number } = {
      address: 150,
      pickupAddress: 150,
      deliveryAddress: 150,
      symptoms: 500,
      problemDescription: 500,
      description: 500,
      additionalDirections: 300,
      towAdditionalInfo: 500,
      recentRepairs: 300,
      previousDiagnosis: 300
    };

    return {
      current: value.length,
      max: maxLengths[fieldName] || null
    };
  }

  goBack(): void {
    this.router.navigate(['/services']);
  }
}
