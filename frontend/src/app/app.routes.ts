import { Routes } from '@angular/router';
import { ProviderGuard, BusinessTypeGuard } from './guards/provider.guard';
import { BusinessType } from './models/auth.model';

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
    path: 'talleres/:id',
    loadComponent: () => import('./pages/workshops/workshop-detail.component').then(m => m.WorkshopDetailComponent)
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
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'checkout/confirmation',
    loadComponent: () => import('./pages/checkout/confirmation.component').then(m => m.ConfirmationComponent)
  },
  {
    path: 'services',
    redirectTo: 'services',
    pathMatch: 'full'
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/service-type-selector/service-type-selector.component').then(m => m.ServiceTypeSelectorComponent)
  },
  {
    path: 'services/request/:type',
    loadComponent: () => import('./pages/services/service-request-form/service-request-form.component').then(m => m.ServiceRequestFormComponent)
  },
  {
    path: 'services/my-requests',
    loadComponent: () => import('./pages/services/my-requests/my-requests.component').then(m => m.MyRequestsComponent)
  },
  {
    path: 'services/request/:id/bids',
    loadComponent: () => import('./pages/services/request-bids/request-bids.component').then(m => m.RequestBidsComponent)
  },
  {
    path: 'services/available',
    loadComponent: () => import('./pages/services/available-requests/available-requests.component').then(m => m.AvailableRequestsComponent)
  },
  {
    path: 'services/available/:id',
    loadComponent: () => import('./pages/services/service-request-detail/service-request-detail.component').then(m => m.ServiceRequestDetailComponent)
  },
  {
    path: 'services/available/:id/bid',
    loadComponent: () => import('./pages/services/bid-form/bid-form.component').then(m => m.BidFormComponent)
  },
  {
    path: 'services/my-bids',
    loadComponent: () => import('./pages/services/my-bids/my-bids.component').then(m => m.MyBidsComponent)
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
    path: 'provider/dashboard',
    loadComponent: () => import('./pages/provider/provider-dashboard.component').then(m => m.ProviderDashboardComponent),
    canActivate: [ProviderGuard]
  },
  {
    path: 'workshops',
    loadComponent: () => import('./pages/workshops/workshops.component').then(m => m.WorkshopsComponent),
    canActivate: [BusinessTypeGuard],
    data: { businessType: BusinessType.TALLER_MECANICO }
  },
  {
    path: 'workshops/create',
    loadComponent: () => import('./pages/workshops/workshop-form.component').then(m => m.WorkshopFormComponent),
    canActivate: [BusinessTypeGuard],
    data: { businessType: BusinessType.TALLER_MECANICO }
  },
  {
    path: 'workshops/edit/:id',
    loadComponent: () => import('./pages/workshops/workshop-form.component').then(m => m.WorkshopFormComponent),
    canActivate: [BusinessTypeGuard],
    data: { businessType: BusinessType.TALLER_MECANICO }
  },
  {
    path: 'parts',
    loadComponent: () => import('./pages/parts/parts.component').then(m => m.PartsComponent),
    canActivate: [BusinessTypeGuard],
    data: { businessType: BusinessType.VENTA_REPUESTOS }
  },
  {
    path: 'parts/create',
    loadComponent: () => import('./pages/parts/part-form.component').then(m => m.PartFormComponent),
    canActivate: [BusinessTypeGuard],
    data: { businessType: BusinessType.VENTA_REPUESTOS }
  },
  {
    path: 'parts/edit/:id',
    loadComponent: () => import('./pages/parts/part-form.component').then(m => m.PartFormComponent),
    canActivate: [BusinessTypeGuard],
    data: { businessType: BusinessType.VENTA_REPUESTOS }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
