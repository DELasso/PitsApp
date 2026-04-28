import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest, UserRole, BusinessType } from '../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';
  UserRole = UserRole;
  BusinessType = BusinessType;
  currentYear = new Date().getFullYear();

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

  private readonly colombianPlatePattern = /^(?:[A-Z]{3}\d{3}|[A-Z]{3}\d{2}[A-Z])$/;

  businessTypeOptions = [
    { value: BusinessType.TALLER_MECANICO, label: 'Taller Mecánico' },
    { value: BusinessType.VENTA_REPUESTOS, label: 'Venta de Repuestos' },
    { value: BusinessType.TALLER_Y_REPUESTOS, label: 'Taller y Repuestos' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: [UserRole.CLIENTE, [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
      companyName: [''],
      businessType: [''],
      address: [''],
      city: [''],
      description: [''],
      vehicleBrand: [''],
      vehicleModel: [''],
      vehicleYear: [''],
      vehiclePlate: [''],
      vehicleType: ['']
    }, { validators: this.passwordMatchValidator });

    // Observar cambios en el rol para mostrar/ocultar campos
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      this.updateValidators(role);
    });

    this.updateValidators(this.registerForm.get('role')?.value);
  }

  updateValidators(role: UserRole) {
    const companyName = this.registerForm.get('companyName');
    const businessType = this.registerForm.get('businessType');
    const vehicleBrand = this.registerForm.get('vehicleBrand');
    const vehicleModel = this.registerForm.get('vehicleModel');
    const vehicleYear = this.registerForm.get('vehicleYear');
    const vehiclePlate = this.registerForm.get('vehiclePlate');
    const vehicleType = this.registerForm.get('vehicleType');
    
    if (role === UserRole.PROVEEDOR) {
      // Hacer campos de proveedor requeridos
      companyName?.setValidators([Validators.required]);
      businessType?.setValidators([Validators.required]);

      vehicleBrand?.clearValidators();
      vehicleModel?.clearValidators();
      vehicleYear?.clearValidators();
      vehiclePlate?.clearValidators();
      vehicleType?.clearValidators();
    } else {
      // Quitar validadores para clientes
      companyName?.clearValidators();
      businessType?.clearValidators();

      vehicleBrand?.clearValidators();
      vehicleModel?.clearValidators();
      vehicleYear?.setValidators([
        Validators.min(1944),
        Validators.max(2030)
      ]);
      vehiclePlate?.setValidators([
        Validators.pattern(this.colombianPlatePattern)
      ]);
      vehicleType?.clearValidators();
    }
    
    companyName?.updateValueAndValidity();
    businessType?.updateValueAndValidity();
    vehicleBrand?.updateValueAndValidity();
    vehicleModel?.updateValueAndValidity();
    vehicleYear?.updateValueAndValidity();
    vehiclePlate?.updateValueAndValidity();
    vehicleType?.updateValueAndValidity();
  }

  get isProvider() {
    return this.registerForm.get('role')?.value === UserRole.PROVEEDOR;
  }

  get passwordStrength() {
    return this.calculatePasswordStrength(this.registerForm.get('password')?.value || '');
  }

  private calculatePasswordStrength(password: string) {
    let strength = 0;
    const requirements: { [key: string]: boolean } = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    // Calcular puntuación
    if (requirements['length']) strength += 1;
    if (requirements['uppercase']) strength += 1;
    if (requirements['lowercase']) strength += 1;
    if (requirements['numbers']) strength += 1;
    if (requirements['special']) strength += 1;

    // Bonificación por longitud extra
    if (password.length >= 12) strength += 0.5;
    if (password.length >= 16) strength += 0.5;

    // Determinar nivel
    let level = 'Muy débil';
    let color = 'danger';
    let percentage = 0;

    if (password.length === 0) {
      level = '';
      color = '';
      percentage = 0;
    } else if (strength < 2) {
      level = 'Muy débil';
      color = 'danger';
      percentage = 20;
    } else if (strength < 3) {
      level = 'Débil';
      color = 'warning';
      percentage = 40;
    } else if (strength < 4) {
      level = 'Regular';
      color = 'info';
      percentage = 60;
    } else if (strength < 5) {
      level = 'Buena';
      color = 'success';
      percentage = 80;
    } else {
      level = 'Muy Fuerte';
      color = 'success';
      percentage = 100;
    }

    // Construir recomendaciones
    const suggestions: string[] = [];
    if (!requirements['length']) suggestions.push('Mínimo 8 caracteres');
    if (!requirements['uppercase']) suggestions.push('Agrega letras mayúsculas');
    if (!requirements['lowercase']) suggestions.push('Agrega letras minúsculas');
    if (!requirements['numbers']) suggestions.push('Agrega números');
    if (!requirements['special']) suggestions.push('Agrega caracteres especiales (!@#$%^&*)');

    return {
      level,
      color,
      percentage,
      suggestions,
      requirements
    };
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      const registerData: RegisterRequest = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        phone: this.registerForm.value.phone,
        role: this.registerForm.value.role
      };

      if (registerData.role === UserRole.PROVEEDOR) {
        registerData.companyName = this.registerForm.value.companyName;
        registerData.businessType = this.registerForm.value.businessType;
        registerData.address = this.registerForm.value.address;
        registerData.city = this.registerForm.value.city;
        registerData.description = this.registerForm.value.description;
      } else {
        const vehicleBrand = String(this.registerForm.value.vehicleBrand || '').trim();
        const vehicleModel = String(this.registerForm.value.vehicleModel || '').trim();
        const vehicleYear = String(this.registerForm.value.vehicleYear || '').trim();
        const vehiclePlate = String(this.registerForm.value.vehiclePlate || '').trim().toUpperCase();
        const vehicleType = String(this.registerForm.value.vehicleType || '').trim();
        const hasAnyVehicleField = Boolean(vehicleBrand || vehicleModel || vehicleYear || vehiclePlate || vehicleType);

        if (hasAnyVehicleField) {
          if (!vehicleBrand || !vehicleModel || !vehicleYear || !vehiclePlate || !vehicleType) {
            this.loading = false;
            this.errorMessage = 'Si deseas registrar un vehiculo, completa todos los campos del vehiculo';
            return;
          }

          registerData.vehicleInfo = {
            brand: vehicleBrand,
            model: vehicleModel,
            year: parseInt(vehicleYear, 10),
            plate: vehiclePlate,
            type: vehicleType
          };
        }
      }

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Registro exitoso:', response.message);
          
          // Redirigir según el tipo de usuario
          const user = this.authService.getCurrentUser();
          if (user?.role === 'proveedor') {
            this.router.navigate(['/provider/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Error al registrar usuario';
          console.error('Error en registro:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onPasswordChange() {
    // Trigger password strength recalculation through the getter
    this.registerForm.get('password')?.updateValueAndValidity({ emitEvent: false });
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get phone() { return this.registerForm.get('phone'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get role() { return this.registerForm.get('role'); }
  get acceptTerms() { return this.registerForm.get('acceptTerms'); }
  get name() { return this.registerForm.get('name'); }
  get companyName() { return this.registerForm.get('companyName'); }
  get businessType() { return this.registerForm.get('businessType'); }
  get description() { return this.registerForm.get('description'); }
  get vehicleBrand() { return this.registerForm.get('vehicleBrand'); }
  get vehicleModel() { return this.registerForm.get('vehicleModel'); }
  get vehicleYear() { return this.registerForm.get('vehicleYear'); }
  get vehiclePlate() { return this.registerForm.get('vehiclePlate'); }
  get vehicleType() { return this.registerForm.get('vehicleType'); }
}