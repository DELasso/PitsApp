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
  templateUrl: './workshop-form.component.html',
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

    workshop.services.forEach(service => {
      const checkbox = document.getElementById(service) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = true;
      }
    });
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
        images: formData.images || [],
        latitude: 0,
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