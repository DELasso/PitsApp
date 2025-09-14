import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'talleres',
    loadComponent: () => import('./pages/workshops/workshops.component').then(m => m.WorkshopsComponent)
  },
  {
    path: 'repuestos',
    loadComponent: () => import('./pages/parts/parts.component').then(m => m.PartsComponent)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'servicios',
    loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
