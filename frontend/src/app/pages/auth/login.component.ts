import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    this.errorMessage = '';
    
    if (this.loginForm.valid) {
      this.loading = true;
      const loginData: LoginRequest = this.loginForm.value;
      
      this.authService.login(loginData).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.loading = false;
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        }
      });
    } else {
      this.markFormGroupTouched();
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  get rememberMe() { return this.loginForm.get('rememberMe'); }
}