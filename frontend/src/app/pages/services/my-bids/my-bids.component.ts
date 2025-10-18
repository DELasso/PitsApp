import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faList,
  faEye,
  faCheck,
  faTimes,
  faClock,
  faDollarSign,
  faSpinner,
  faTrash,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { BidService } from '../../../services/bid.service';
import { Bid, BidStatus } from '../../../models/bid.model';

@Component({
  selector: 'app-my-bids',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './my-bids.component.html',
  styleUrls: ['./my-bids.component.scss']
})
export class MyBidsComponent implements OnInit {
  faList = faList;
  faEye = faEye;
  faCheck = faCheck;
  faTimes = faTimes;
  faClock = faClock;
  faDollarSign = faDollarSign;
  faSpinner = faSpinner;
  faTrash = faTrash;
  faShieldAlt = faShieldAlt;

  bids: Bid[] = [];
  isLoading = true;
  errorMessage = '';

  // Stats
  totalBids = 0;
  pendingBids = 0;
  acceptedBids = 0;
  rejectedBids = 0;

  BidStatus = BidStatus;

  constructor(
    private bidService: BidService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyBids();
  }

  loadMyBids(): void {
    this.isLoading = true;
    this.bidService.getMyBids().subscribe({
      next: (bids) => {
        this.bids = bids.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bids:', error);
        this.errorMessage = 'Error al cargar tus ofertas';
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalBids = this.bids.length;
    this.pendingBids = this.bids.filter(b => b.status === BidStatus.PENDING).length;
    this.acceptedBids = this.bids.filter(b => b.status === BidStatus.ACCEPTED).length;
    this.rejectedBids = this.bids.filter(b => b.status === BidStatus.REJECTED).length;
  }

  viewRequest(requestId: string): void {
    this.router.navigate(['/services/available', requestId]);
  }

  withdrawBid(bidId: string): void {
    if (confirm('¿Estás seguro de que deseas retirar esta oferta?')) {
      this.bidService.withdraw(bidId).subscribe({
        next: () => {
          this.loadMyBids();
        },
        error: (error) => {
          console.error('Error withdrawing bid:', error);
          alert('Error al retirar la oferta. Por favor intenta nuevamente.');
        }
      });
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: BidStatus): string {
    switch (status) {
      case BidStatus.PENDING:
        return 'status-pending';
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

  getStatusLabel(status: BidStatus): string {
    switch (status) {
      case BidStatus.PENDING:
        return 'Pendiente';
      case BidStatus.ACCEPTED:
        return 'Aceptada';
      case BidStatus.REJECTED:
        return 'Rechazada';
      case BidStatus.WITHDRAWN:
        return 'Retirada';
      default:
        return status;
    }
  }

  getStatusIcon(status: BidStatus) {
    switch (status) {
      case BidStatus.PENDING:
        return faClock;
      case BidStatus.ACCEPTED:
        return faCheck;
      case BidStatus.REJECTED:
      case BidStatus.WITHDRAWN:
        return faTimes;
      default:
        return faClock;
    }
  }

  canWithdraw(bid: Bid): boolean {
    return bid.status === BidStatus.PENDING;
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
