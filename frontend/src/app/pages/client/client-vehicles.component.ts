import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehicleInfo } from '../../models/auth.model';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-client-vehicles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-vehicles.component.html',
  styleUrl: './client-vehicles.component.scss'
})
export class ClientVehiclesComponent implements OnInit {
  vehicles: VehicleInfo[] = [];
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  vehicleForm: FormGroup;

  readonly vehicleBrands = [
    'Chevrolet',
    'Renault',
    'Mazda',
    'Toyota',
    'Nissan',
    'Kia',
    'Hyundai',
    'Suzuki',
    'Honda',
    'Yamaha',
    'Bajaj',
    'AKT'
  ];

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private authService: AuthService
  ) {
    this.vehicleForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1944), Validators.max(2030)]],
      plate: ['', [Validators.required, Validators.pattern(/^(?:[A-Z]{3}\d{3}|[A-Z]{3}\d{2}[A-Z])$/)]],
      type: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading = true;
    this.errorMessage = '';

    this.usersService.getMyVehicles().subscribe({
      next: (response) => {
        this.vehicles = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'No fue posible cargar los vehiculos';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: VehicleInfo = {
      brand: this.vehicleForm.value.brand,
      model: this.vehicleForm.value.model,
      year: Number(this.vehicleForm.value.year),
      plate: String(this.vehicleForm.value.plate || '').trim().toUpperCase(),
      type: this.vehicleForm.value.type,
    };

    this.usersService.addMyVehicle(payload).subscribe({
      next: (response) => {
        this.vehicles = response.data || [];

        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.authService.updateCurrentUser({
            ...currentUser,
            vehicleInfo: this.vehicles[0],
            vehicleInfos: this.vehicles,
          });
        }

        this.vehicleForm.reset();
        this.successMessage = 'Vehiculo agregado correctamente';
        this.saving = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'No fue posible agregar el vehiculo';
        this.saving = false;
      }
    });
  }

  get brand() { return this.vehicleForm.get('brand'); }
  get model() { return this.vehicleForm.get('model'); }
  get year() { return this.vehicleForm.get('year'); }
  get plate() { return this.vehicleForm.get('plate'); }
  get type() { return this.vehicleForm.get('type'); }
}
