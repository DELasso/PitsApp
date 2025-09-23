import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkshopsService } from '../../services/workshops.service';
import { AuthService } from '../../services/auth.service';
import { Workshop } from '../../models/workshop.model';
import { ImageUploadComponent } from '../../components/image-upload/image-upload.component';

@Component({
  selector: 'app-workshop-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUploadComponent],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h1>{{ isEditMode ? 'Editar Taller' : 'Crear Nuevo Taller' }}</h1>
        <button class="btn-back" (click)="goBack()">
          <i class="fa-solid fa-arrow-left"></i> Volver
        </button>
      </div>

      <form [formGroup]="workshopForm" (ngSubmit)="onSubmit()" class="workshop-form">
        <div class="form-section">
          <h3>Información Básica</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="name" class="form-label">Nombre del Taller *</label>
              <input 
                type="text" 
                id="name" 
                formControlName="name" 
                class="form-input"
                [class.error]="name?.invalid && name?.touched"
                placeholder="Ej: Taller Mecánico Rodriguez">
              <div *ngIf="name?.invalid && name?.touched" class="error-message">
                <span *ngIf="name?.errors?.['required']">El nombre es requerido</span>
                <span *ngIf="name?.errors?.['minlength']">Mínimo 3 caracteres</span>
              </div>
            </div>

            <div class="form-group">
              <label for="phone" class="form-label">Teléfono *</label>
              <input 
                type="tel" 
                id="phone" 
                formControlName="phone" 
                class="form-input"
                [class.error]="phone?.invalid && phone?.touched"
                placeholder="Ej: +57 300 123 4567">
              <div *ngIf="phone?.invalid && phone?.touched" class="error-message">
                <span *ngIf="phone?.errors?.['required']">El teléfono es requerido</span>
                <span *ngIf="phone?.errors?.['pattern']">Formato de teléfono inválido</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email *</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-input"
              [class.error]="email?.invalid && email?.touched"
              placeholder="contacto@taller.com">
            <div *ngIf="email?.invalid && email?.touched" class="error-message">
              <span *ngIf="email?.errors?.['required']">El email es requerido</span>
              <span *ngIf="email?.errors?.['email']">Formato de email inválido</span>
            </div>
          </div>

          <div class="form-group">
            <label for="description" class="form-label">Descripción *</label>
            <textarea 
              id="description" 
              formControlName="description" 
              class="form-textarea"
              [class.error]="description?.invalid && description?.touched"
              rows="4"
              placeholder="Describe tu taller, especialidades y servicios destacados..."></textarea>
            <div *ngIf="description?.invalid && description?.touched" class="error-message">
              <span *ngIf="description?.errors?.['required']">La descripción es requerida</span>
              <span *ngIf="description?.errors?.['minlength']">Mínimo 20 caracteres</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Ubicación</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="city" class="form-label">Ciudad *</label>
              <select 
                id="city" 
                formControlName="city" 
                class="form-select"
                [class.error]="city?.invalid && city?.touched">
                <option value="">Selecciona una ciudad</option>
                <option value="Bogotá">Bogotá</option>
                <option value="Medellín">Medellín</option>
                <option value="Cali">Cali</option>
                <option value="Barranquilla">Barranquilla</option>
                <option value="Cartagena">Cartagena</option>
                <option value="Bucaramanga">Bucaramanga</option>
                <option value="Pereira">Pereira</option>
                <option value="Manizales">Manizales</option>
              </select>
              <div *ngIf="city?.invalid && city?.touched" class="error-message">
                <span *ngIf="city?.errors?.['required']">La ciudad es requerida</span>
              </div>
            </div>

            <div class="form-group">
              <label for="neighborhood" class="form-label">Barrio *</label>
              <input 
                type="text" 
                id="neighborhood" 
                formControlName="neighborhood" 
                class="form-input"
                [class.error]="neighborhood?.invalid && neighborhood?.touched"
                placeholder="Ej: Chapinero, Poblado, etc.">
              <div *ngIf="neighborhood?.invalid && neighborhood?.touched" class="error-message">
                <span *ngIf="neighborhood?.errors?.['required']">El barrio es requerido</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="address" class="form-label">Dirección *</label>
            <input 
              type="text" 
              id="address" 
              formControlName="address" 
              class="form-input"
              [class.error]="address?.invalid && address?.touched"
              placeholder="Ej: Calle 123 # 45-67">
            <div *ngIf="address?.invalid && address?.touched" class="error-message">
              <span *ngIf="address?.errors?.['required']">La dirección es requerida</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Servicios y Especialidades</h3>
          
          <div class="form-group">
            <label class="form-label">Servicios Ofrecidos *</label>
            <div class="checkbox-grid">
              <div *ngFor="let service of availableServices" class="checkbox-item">
                <input 
                  type="checkbox" 
                  [id]="service" 
                  [value]="service"
                  (change)="onServiceChange($event)">
                <label [for]="service">{{ service }}</label>
              </div>
            </div>
            <div *ngIf="workshopForm.get('services')?.invalid && workshopForm.get('services')?.touched" class="error-message">
              <span>Selecciona al menos un servicio</span>
            </div>
          </div>

          <div class="form-group">
            <label for="specialties" class="form-label">Especialidades (opcional)</label>
            <input 
              type="text" 
              id="specialties" 
              formControlName="specialtiesText" 
              class="form-input"
              placeholder="Ej: Autos europeos, Motos deportivas, Carros clásicos (separadas por comas)">
            <small class="form-help">Separa las especialidades con comas</small>
          </div>

          <div class="form-group">
            <label for="workingHours" class="form-label">Horarios de Atención (opcional)</label>
            <input 
              type="text" 
              id="workingHours" 
              formControlName="workingHours" 
              class="form-input"
              placeholder="Ej: Lun-Vie 8:00-18:00, Sáb 8:00-14:00">
          </div>

          <div class="form-group">
            <label for="website" class="form-label">Sitio Web (opcional)</label>
            <input 
              type="url" 
              id="website" 
              formControlName="website" 
              class="form-input"
              placeholder="https://www.miweb.com">
          </div>
        </div>

        <!-- Sección de Imágenes -->
        <div class="form-section">
          <h3>Imágenes del Taller</h3>
          <app-image-upload 
            formControlName="images"
            uploadType="workshop"
            label="Sube imágenes de tu taller"
            [required]="false">
          </app-image-upload>
          <p class="form-hint">
            Las imágenes ayudan a los clientes a conocer mejor tu taller. Puedes subir hasta 5 imágenes.
          </p>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="goBack()">
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            [disabled]="loading || workshopForm.invalid">
            <i *ngIf="loading" class="fa-solid fa-spinner fa-spin"></i>
            {{ isEditMode ? 'Actualizar' : 'Crear' }} Taller
          </button>
        </div>
      </form>

      <div *ngIf="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styleUrls: ['./workshop-form.component.scss']
})
export class WorkshopFormComponent implements OnInit {
  workshopForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEditMode = false;
  workshopId: string | null = null;

  availableServices = [
    'Cambio de aceite',
    'Frenos',
    'Suspensión',
    'Transmisión',
    'Motor',
    'Aire acondicionado',
    'Sistema eléctrico',
    'Diagnóstico computarizado',
    'Alineación y balanceo',
    'Llantas',
    'Batería',
    'Radiador',
    'Embrague',
    'Escape',
    'Pintura y carrocería'
  ];

  constructor(
    private fb: FormBuilder,
    private workshopsService: WorkshopsService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.workshopId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.workshopId;

    if (this.isEditMode) {
      this.loadWorkshop();
    }
  }

  initForm() {
    this.workshopForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      neighborhood: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      services: [[], [Validators.required, this.servicesValidator]],
      website: [''],
      workingHours: [''],
      specialtiesText: [''],
      images: [[]]
    });
  }

  servicesValidator(control: any) {
    const services = control.value;
    return services && services.length > 0 ? null : { required: true };
  }

  onServiceChange(event: any) {
    const services = this.workshopForm.get('services')?.value || [];
    if (event.target.checked) {
      services.push(event.target.value);
    } else {
      const index = services.indexOf(event.target.value);
      if (index > -1) {
        services.splice(index, 1);
      }
    }
    this.workshopForm.get('services')?.setValue(services);
  }

  loadWorkshop() {
    if (!this.workshopId) return;

    this.loading = true;
    this.workshopsService.getWorkshop(this.workshopId).subscribe({
      next: (workshop) => {
        this.populateForm(workshop);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar el taller';
        this.loading = false;
      }
    });
  }

  populateForm(workshop: Workshop) {
    this.workshopForm.patchValue({
      name: workshop.name,
      description: workshop.description,
      address: workshop.address,
      city: workshop.city,
      neighborhood: workshop.neighborhood,
      phone: workshop.phone,
      email: workshop.email,
      services: workshop.services,
      website: workshop.website,
      workingHours: workshop.workingHours,
      specialtiesText: workshop.specialties?.join(', ') || ''
    });

    // Marcar servicios seleccionados
    if (workshop.services){
    workshop.services.forEach(service => {
      const checkbox = document.getElementById(service) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = true;
      }
    });
    }
  }
  onSubmit() {
    if (this.workshopForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const formData = this.workshopForm.value;
      const specialties = formData.specialtiesText 
        ? formData.specialtiesText.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : [];

      const workshopData = {
        ...formData,
        specialties,
        images: formData.images || [], // Asegurar que siempre sea un array
        latitude: 0, // TODO: Implementar geolocalización
        longitude: 0,
        rating: 0,
        reviewCount: 0,
        isActive: true
      };

      delete workshopData.specialtiesText;

      // Verificar token
      const token = this.authService.getToken();

      const operation = this.isEditMode 
        ? this.workshopsService.updateWorkshop(this.workshopId!, workshopData)
        : this.workshopsService.createWorkshop(workshopData);

      operation.subscribe({
        next: (response) => {
          this.loading = false;
          this.goBack();
        },
        error: (error) => {
          this.loading = false;
          
          if (error.status === 401) {
            this.errorMessage = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          } else if (error.status === 403) {
            this.errorMessage = 'No tienes permisos para realizar esta acción.';
          } else {
            this.errorMessage = error.error?.message || 'Error al guardar el taller';
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.workshopForm.controls).forEach(key => {
      const control = this.workshopForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    this.router.navigate(['/provider/dashboard']);
  }

  // Getters para facilitar el acceso a los controles del formulario
  get name() { return this.workshopForm.get('name'); }
  get description() { return this.workshopForm.get('description'); }
  get address() { return this.workshopForm.get('address'); }
  get city() { return this.workshopForm.get('city'); }
  get neighborhood() { return this.workshopForm.get('neighborhood'); }
  get phone() { return this.workshopForm.get('phone'); }
  get email() { return this.workshopForm.get('email'); }
}