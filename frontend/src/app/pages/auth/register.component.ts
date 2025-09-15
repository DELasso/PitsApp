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
      dateOfBirth: [''],
      vehicleInfo: ['']
    }, { validators: this.passwordMatchValidator });

    // Observar cambios en el rol para mostrar/ocultar campos
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      this.updateValidators(role);
    });
  }

  updateValidators(role: UserRole) {
    const companyName = this.registerForm.get('companyName');
    const businessType = this.registerForm.get('businessType');
    
    if (role === UserRole.PROVEEDOR) {
      // Hacer campos de proveedor requeridos
      companyName?.setValidators([Validators.required]);
      businessType?.setValidators([Validators.required]);
    } else {
      // Quitar validadores para clientes
      companyName?.clearValidators();
      businessType?.clearValidators();
    }
    
    companyName?.updateValueAndValidity();
    businessType?.updateValueAndValidity();
  }

  get isProvider() {
    return this.registerForm.get('role')?.value === UserRole.PROVEEDOR;
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
        registerData.dateOfBirth = this.registerForm.value.dateOfBirth;
        registerData.vehicleInfo = this.registerForm.value.vehicleInfo;
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
}