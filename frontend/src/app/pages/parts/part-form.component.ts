import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PartsService } from '../../services/parts.service';
import { AuthService } from '../../services/auth.service';
import { Part, PartCondition, VehicleType } from '../../models/part.model';
import { ImageUploadComponent } from '../../components/image-upload/image-upload.component';

@Component({
  selector: 'app-part-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUploadComponent],
  templateUrl: './part-form.component.html',
  styleUrls: ['./part-form.component.scss']
})
export class PartFormComponent implements OnInit {
  partForm!: FormGroup;
  loading = false;
  errorMessage = '';
  validationMessage = '';
  isEditMode = false;
  partId: string | null = null;

  // Enum references for template
  PartCondition = PartCondition;
  VehicleType = VehicleType;

  availableBrands = [
    'Toyota', 'Honda', 'Chevrolet', 'Ford', 'Nissan', 'Hyundai', 'Kia',
    'Mazda', 'Volkswagen', 'Renault', 'BMW', 'Mercedes-Benz', 'Audi',
    'Yamaha', 'Kawasaki', 'Suzuki', 'Bajaj', 'TVS', 'Hero', 'AKT',
    'Bosch', 'Denso', 'NGK', 'Mobil', 'Castrol', 'Otro'
  ];

  availableCategories = [
    'Motor', 'Frenos', 'Suspensión', 'Transmisión', 'Sistema eléctrico',
    'Filtros', 'Aceites y lubricantes', 'Llantas', 'Batería', 'Escape',
    'Aire acondicionado', 'Radiador', 'Embrague', 'Carrocería',
    'Iluminación', 'Accesorios', 'Herramientas'
  ];

  constructor(
    private fb: FormBuilder,
    private partsService: PartsService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.partId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.partId;

    if (this.isEditMode) {
      this.loadPart();
    }
  }

  initForm() {
    this.partForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(80),
        this.trimValidator
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(600),
        this.trimValidator
      ]],
      category: ['', Validators.required],
      brand: ['', Validators.required],
      partNumber: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(40),
        Validators.pattern(/^[A-Za-z0-9\-\._\/ ]+$/),
        this.trimValidator
      ]],
      price: [null, [Validators.required, Validators.min(1), Validators.max(999999999)]],
      condition: ['', Validators.required],
      vehicleType: ['', Validators.required],
      compatibleVehicles: [[]],
      compatibleVehiclesText: ['', [
        Validators.required,
        Validators.maxLength(300),
        this.vehiclesTextValidator
      ]],
      stock: [null, [Validators.required, Validators.min(0), Validators.max(999999)]],
      warranty: ['', [Validators.maxLength(60), this.trimValidator]],
      weight: [null, [Validators.min(0), Validators.max(1000)]],
      dimensions: ['', [Validators.maxLength(80), this.trimValidator]],
      images: [[]]
    });

    // Listener para actualizar compatibleVehicles cuando cambie el texto
    this.partForm.get('compatibleVehiclesText')?.valueChanges.subscribe(value => {
      if (value) {
        const vehicles = value.split(',').map((v: string) => v.trim()).filter((v: string) => v.length > 0);
        this.partForm.get('compatibleVehicles')?.setValue(vehicles);
      } else {
        this.partForm.get('compatibleVehicles')?.setValue([]);
      }
    });
  }

  trimValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined || typeof value !== 'string') return null;
    return value.trim().length > 0 ? null : { required: true };
  }

  vehiclesTextValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value ?? '').toString().trim();
    if (!value) return { required: true };

    const vehicles = value.split(',').map((v: string) => v.trim()).filter((v: string) => v.length > 0);
    if (vehicles.length === 0) return { vehiclesRequired: true };
    if (vehicles.some((v: string) => v.length < 3)) return { vehicleTooShort: true };

    return null;
  }

  loadPart() {
    if (!this.partId) return;

    this.loading = true;
    this.partsService.getPart(this.partId).subscribe({
      next: (part) => {
        this.populateForm(part);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar el repuesto';
        this.loading = false;
      }
    });
  }

  populateForm(part: Part) {
    this.partForm.patchValue({
      name: part.name,
      description: part.description,
      category: part.category,
      brand: part.brand,
      partNumber: part.partNumber,
      price: part.price,
      condition: part.condition,
      vehicleType: part.vehicleType,
      compatibleVehicles: part.compatibleVehicles,
      compatibleVehiclesText: part.compatibleVehicles.join(', '),
      stock: part.stock,
      warranty: part.warranty,
      weight: part.weight,
      dimensions: part.dimensions
    });
  }

  onSubmit() {
    this.validationMessage = '';

    if (this.partForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const formData = this.partForm.value;

      const normalizedVehicles = (formData.compatibleVehiclesText ?? '')
        .toString()
        .split(',')
        .map((v: string) => v.trim())
        .filter((v: string) => v.length > 0);
      
      const partData = {
        ...formData,
        compatibleVehicles: normalizedVehicles,
        images: formData.images || [],
        rating: 0,
        reviewCount: 0,
        isAvailable: Number(formData.stock) > 0
      };

      // Remove helper field
      delete partData.compatibleVehiclesText;

      const operation = this.isEditMode 
        ? this.partsService.updatePart(this.partId!, partData)
        : this.partsService.createPart(partData);

      operation.subscribe({
        next: (response: any) => {
          this.loading = false;
          this.goBack();
        },
        error: (error: any) => {
          this.loading = false;
          
          if (error.status === 401) {
            this.errorMessage = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          } else if (error.status === 403) {
            this.errorMessage = 'No tienes permisos para realizar esta acción.';
          } else {
            this.errorMessage = error.error?.message || 'Error al guardar el repuesto';
          }
        }
      });
    } else {
      this.markFormGroupTouched();
      this.validationMessage = 'Revisa los campos marcados en rojo. Los campos con * son obligatorios.';
    }
  }

  markFormGroupTouched() {
    Object.keys(this.partForm.controls).forEach(key => {
      const control = this.partForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    this.router.navigate(['/provider/repuestos']);
  }

  // Getters para facilitar el acceso a los controles del formulario
  get name() { return this.partForm.get('name'); }
  get description() { return this.partForm.get('description'); }
  get category() { return this.partForm.get('category'); }
  get brand() { return this.partForm.get('brand'); }
  get partNumber() { return this.partForm.get('partNumber'); }
  get price() { return this.partForm.get('price'); }
  get condition() { return this.partForm.get('condition'); }
  get vehicleType() { return this.partForm.get('vehicleType'); }
  get compatibleVehiclesText() { return this.partForm.get('compatibleVehiclesText'); }
  get stock() { return this.partForm.get('stock'); }
  get warranty() { return this.partForm.get('warranty'); }
  get weight() { return this.partForm.get('weight'); }
  get dimensions() { return this.partForm.get('dimensions'); }
}
