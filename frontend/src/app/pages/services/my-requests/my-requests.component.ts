import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faEye,
  faCheckCircle,
  faSpinner,
  faClock,
  faTimesCircle,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { ServiceRequestService } from '../../../services/service-request.service';
import { ServiceRequest, ServiceStatus } from '../../../models/service-request.model';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.scss']
})
export class MyRequestsComponent implements OnInit {
  faPlus = faPlus;
  faEye = faEye;
  faCheckCircle = faCheckCircle;
  faSpinner = faSpinner;
  faClock = faClock;
  faTimesCircle = faTimesCircle;
  faTrash = faTrash;

  myRequests: ServiceRequest[] = [];
  isLoading = true;
  errorMessage = '';

  serviceTypeLabels: Record<string, string> = {
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

  statusLabels: Record<ServiceStatus, string> = {
    [ServiceStatus.PENDING]: 'Esperando ofertas',
    [ServiceStatus.RECEIVING_BIDS]: 'Recibiendo ofertas',
    [ServiceStatus.BID_ACCEPTED]: 'Oferta aceptada',
    [ServiceStatus.IN_PROGRESS]: 'En progreso',
    [ServiceStatus.COMPLETED]: 'Completado',
    [ServiceStatus.CANCELLED]: 'Cancelado'
  };

  constructor(
    private serviceRequestService: ServiceRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyRequests();
  }

  loadMyRequests(): void {
    this.isLoading = true;
    this.serviceRequestService.getMyRequests().subscribe({
      next: (requests) => {
        this.myRequests = requests.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.errorMessage = 'Error al cargar tus solicitudes';
        this.isLoading = false;
      }
    });
  }

  viewBids(requestId: string): void {
    this.router.navigate(['/services/request', requestId, 'bids']);
  }

  deleteRequest(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta solicitud?')) {
      this.serviceRequestService.delete(id).subscribe({
        next: () => {
          this.loadMyRequests();
        },
        error: (error) => {
          console.error('Error deleting request:', error);
          alert('Error al eliminar la solicitud');
        }
      });
    }
  }

  getStatusIcon(status: ServiceStatus): any {
    switch (status) {
      case ServiceStatus.PENDING:
      case ServiceStatus.RECEIVING_BIDS:
        return faClock;
      case ServiceStatus.BID_ACCEPTED:
      case ServiceStatus.COMPLETED:
        return faCheckCircle;
      case ServiceStatus.IN_PROGRESS:
        return faSpinner;
      case ServiceStatus.CANCELLED:
        return faTimesCircle;
      default:
        return faClock;
    }
  }

  getStatusClass(status: ServiceStatus): string {
    switch (status) {
      case ServiceStatus.PENDING:
      case ServiceStatus.RECEIVING_BIDS:
        return 'status-pending';
      case ServiceStatus.BID_ACCEPTED:
        return 'status-accepted';
      case ServiceStatus.IN_PROGRESS:
        return 'status-progress';
      case ServiceStatus.COMPLETED:
        return 'status-completed';
      case ServiceStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  createNewRequest(): void {
    this.router.navigate(['/services']);
  }
}
