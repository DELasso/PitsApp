import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faCheck,
  faStar,
  faMapMarkerAlt,
  faClock,
  faShieldAlt,
  faDollarSign,
  faTruck,
  faHome,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { ServiceRequestService } from '../../../services/service-request.service';
import { BidService } from '../../../services/bid.service';
import { ServiceRequest } from '../../../models/service-request.model';
import { Bid, BidStatus } from '../../../models/bid.model';

@Component({
  selector: 'app-request-bids',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './request-bids.component.html',
  styleUrls: ['./request-bids.component.scss']
})
export class RequestBidsComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  faCheck = faCheck;
  faStar = faStar;
  faMapMarkerAlt = faMapMarkerAlt;
  faClock = faClock;
  faShieldAlt = faShieldAlt;
  faDollarSign = faDollarSign;
  faTruck = faTruck;
  faHome = faHome;
  faSpinner = faSpinner;

  serviceRequestId!: string;
  serviceRequest: ServiceRequest | null = null;
  bids: Bid[] = [];
  isLoading = true;
  errorMessage = '';
  isAccepting = false;

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceRequestService: ServiceRequestService,
    private bidService: BidService
  ) {}

  ngOnInit(): void {
    this.serviceRequestId = this.route.snapshot.paramMap.get('id')!;
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // Cargar solicitud de servicio
    this.serviceRequestService.getById(this.serviceRequestId).subscribe({
      next: (request) => {
        this.serviceRequest = request;
        this.loadBids();
      },
      error: (error) => {
        console.error('Error loading service request:', error);
        this.errorMessage = 'Error al cargar la solicitud';
        this.isLoading = false;
      }
    });
  }

  loadBids(): void {
    this.serviceRequestService.getBidsByServiceRequest(this.serviceRequestId).subscribe({
      next: (bids) => {
        this.bids = this.sortBids(bids);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bids:', error);
        this.errorMessage = 'Error al cargar las ofertas';
        this.isLoading = false;
      }
    });
  }

  sortBids(bids: Bid[]): Bid[] {
    // Ordenar por: 1) Estado aceptado primero, 2) Menor precio, 3) Mayor calificación
    return bids.sort((a, b) => {
      // Ofertas aceptadas primero
      if (a.status === BidStatus.ACCEPTED && b.status !== BidStatus.ACCEPTED) return -1;
      if (b.status === BidStatus.ACCEPTED && a.status !== BidStatus.ACCEPTED) return 1;

      // Ofertas rechazadas al final
      if (a.status === BidStatus.REJECTED && b.status !== BidStatus.REJECTED) return 1;
      if (b.status === BidStatus.REJECTED && a.status !== BidStatus.REJECTED) return -1;

      // Ordenar por precio (menor primero)
      if (a.totalAmount !== b.totalAmount) {
        return a.totalAmount - b.totalAmount;
      }

      // Ordenar por calificación (mayor primero)
      const ratingA = a.providerRating || 0;
      const ratingB = b.providerRating || 0;
      return ratingB - ratingA;
    });
  }

  acceptBid(bid: Bid): void {
    if (!confirm(`¿Estás seguro de aceptar la oferta de ${bid.providerName} por ${this.formatCurrency(bid.totalAmount)}?`)) {
      return;
    }

    this.isAccepting = true;
    this.serviceRequestService.acceptBid(this.serviceRequestId, bid.id).subscribe({
      next: (updatedRequest) => {
        alert('¡Oferta aceptada exitosamente!');
        this.loadData(); // Recargar datos
        this.isAccepting = false;
      },
      error: (error) => {
        console.error('Error accepting bid:', error);
        alert('Error al aceptar la oferta. Intenta nuevamente.');
        this.isAccepting = false;
      }
    });
  }

  getBidStatusClass(status: BidStatus): string {
    switch (status) {
      case BidStatus.ACCEPTED:
        return 'status-accepted';
      case BidStatus.REJECTED:
        return 'status-rejected';
      case BidStatus.WITHDRAWN:
        return 'status-withdrawn';
      default:
        return 'status-pending';
    }
  }

  getBidStatusLabel(status: BidStatus): string {
    switch (status) {
      case BidStatus.ACCEPTED:
        return 'Aceptada';
      case BidStatus.REJECTED:
        return 'Rechazada';
      case BidStatus.WITHDRAWN:
        return 'Retirada';
      case BidStatus.PENDING:
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
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
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < Math.round(rating));
  }

  goBack(): void {
    this.router.navigate(['/services/my-requests']);
  }

  canAcceptBid(bid: Bid): boolean {
    return (
      bid.status === BidStatus.PENDING &&
      this.serviceRequest?.status !== 'bid_accepted' &&
      this.serviceRequest?.status !== 'in_progress' &&
      this.serviceRequest?.status !== 'completed'
    );
  }

  getLowestBid(): Bid | null {
    const pendingBids = this.bids.filter(b => b.status === BidStatus.PENDING);
    if (pendingBids.length === 0) return null;
    return pendingBids.reduce((min, bid) => bid.totalAmount < min.totalAmount ? bid : min);
  }

  isLowestBid(bid: Bid): boolean {
    const lowest = this.getLowestBid();
    return lowest?.id === bid.id;
  }

  getHighestRatedBid(): Bid | null {
    const pendingBids = this.bids.filter(b => b.status === BidStatus.PENDING && b.providerRating);
    if (pendingBids.length === 0) return null;
    return pendingBids.reduce((max, bid) => 
      (bid.providerRating || 0) > (max.providerRating || 0) ? bid : max
    );
  }

  isHighestRated(bid: Bid): boolean {
    const highest = this.getHighestRatedBid();
    return highest?.id === bid.id;
  }

  formatCompletionTime(hours: number): string {
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? 'día' : 'días'}`;
  }

  formatWarrantyPeriod(days: number): string {
    if (days < 7) {
      return `${days} ${days === 1 ? 'día' : 'días'}`;
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else {
      const years = Math.floor(days / 365);
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    }
  }
}
