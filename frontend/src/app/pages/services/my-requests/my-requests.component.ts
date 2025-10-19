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

  statusLabels: Record<string, string> = {
    'pending': 'Esperando ofertas',
    'receiving_bids': 'Recibiendo ofertas',
    'bid_accepted': 'Oferta aceptada',
    'in_progress': 'En progreso',
    'completed': 'Completado',
    'cancelled': 'Cancelado'
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
    this.router.navigate(['/servicios/solicitud', requestId, 'ofertas']);
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

  getStatusIcon(status: ServiceStatus | string): any {
    const statusStr = status as string;
    switch (statusStr) {
      case 'pending':
      case 'receiving_bids':
        return faClock;
      case 'bid_accepted':
      case 'completed':
        return faCheckCircle;
      case 'in_progress':
        return faSpinner;
      case 'cancelled':
        return faTimesCircle;
      default:
        return faClock;
    }
  }

  getStatusClass(status: ServiceStatus | string): string {
    const statusStr = status as string;
    switch (statusStr) {
      case 'pending':
      case 'receiving_bids':
        return 'status-pending';
      case 'bid_accepted':
        return 'status-accepted';
      case 'in_progress':
        return 'status-progress';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
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
    this.router.navigate(['/servicios']);
  }
}
