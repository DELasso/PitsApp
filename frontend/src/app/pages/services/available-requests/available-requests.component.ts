import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faFilter,
  faEye,
  faClock,
  faMapMarkerAlt,
  faDollarSign,
  faCar,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { ServiceRequestService } from '../../../services/service-request.service';
import { ServiceRequest, ServiceType, UrgencyLevel } from '../../../models/service-request.model';

@Component({
  selector: 'app-available-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FontAwesomeModule],
  templateUrl: './available-requests.component.html',
  styleUrls: ['./available-requests.component.scss']
})
export class AvailableRequestsComponent implements OnInit {
  faSearch = faSearch;
  faFilter = faFilter;
  faEye = faEye;
  faClock = faClock;
  faMapMarkerAlt = faMapMarkerAlt;
  faDollarSign = faDollarSign;
  faCar = faCar;
  faSpinner = faSpinner;

  availableRequests: ServiceRequest[] = [];
  filteredRequests: ServiceRequest[] = [];
  isLoading = true;
  errorMessage = '';

  // Filtros
  selectedServiceType: string = 'all';
  selectedUrgency: string = 'all';
  searchTerm: string = '';

  serviceTypeLabels: Record<string, string> = {
    'all': 'Todos los servicios',
    'home_service': 'Servicio a Domicilio',
    'tow_truck': 'Grúa y Remolque',
    'express_oil_change': 'Cambio de Aceite',
    'mechanical_diagnosis': 'Diagnóstico Mecánico',
    'specific_repair': 'Reparación Específica',
    'emergency_service': 'Emergencia',
    'tire_change': 'Cambio de Llantas',
    'battery_service': 'Servicio de Batería',
    'other': 'Otro'
  };

  urgencyLevels: Record<string, string> = {
    'all': 'Todas las urgencias',
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta',
    'emergency': 'Emergencia'
  };

  constructor(
    private serviceRequestService: ServiceRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAvailableRequests();
  }

  loadAvailableRequests(): void {
    this.isLoading = true;
    this.serviceRequestService.getAvailableForBids().subscribe({
      next: (requests) => {
        this.availableRequests = requests.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading available requests:', error);
        this.errorMessage = 'Error al cargar las solicitudes disponibles';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredRequests = this.availableRequests.filter(request => {
      // Filtro por tipo de servicio
      if (this.selectedServiceType !== 'all' && request.serviceType !== this.selectedServiceType) {
        return false;
      }

      // Filtro por urgencia
      if (this.selectedUrgency !== 'all' && request.urgencyLevel !== this.selectedUrgency) {
        return false;
      }

      // Filtro por búsqueda
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        return (
          request.description.toLowerCase().includes(term) ||
          request.vehicleBrand?.toLowerCase().includes(term) ||
          request.vehicleModel?.toLowerCase().includes(term) ||
          this.serviceTypeLabels[request.serviceType].toLowerCase().includes(term)
        );
      }

      return true;
    });
  }

  onServiceTypeChange(event: Event): void {
    this.selectedServiceType = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  onUrgencyChange(event: Event): void {
    this.selectedUrgency = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  viewDetails(requestId: string): void {
    this.router.navigate(['/services/available', requestId]);
  }

  makeOffer(requestId: string): void {
    this.router.navigate(['/services/available', requestId, 'bid']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    } else {
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  getUrgencyClass(urgency: UrgencyLevel): string {
    switch (urgency) {
      case UrgencyLevel.LOW:
        return 'urgency-low';
      case UrgencyLevel.MEDIUM:
        return 'urgency-medium';
      case UrgencyLevel.HIGH:
        return 'urgency-high';
      case UrgencyLevel.EMERGENCY:
        return 'urgency-emergency';
      default:
        return 'urgency-medium';
    }
  }

  getUrgencyLabel(urgency: UrgencyLevel): string {
    return this.urgencyLevels[urgency] || urgency;
  }
}
