import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faArrowLeft,
    faCar,
    faClock,
    faMapMarkerAlt,
    faDollarSign,
    faCalendar,
    faExclamationTriangle,
    faTools,
    faSpinner,
    faFileAlt,
    faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';
import { ServiceRequestService } from '../../../services/service-request.service';
import { ServiceRequest } from '../../../models/service-request.model';

@Component({
    selector: 'app-service-request-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FontAwesomeModule],
    templateUrl: './service-request-detail.component.html',
    styleUrls: ['./service-request-detail.component.scss']
})
export class ServiceRequestDetailComponent implements OnInit {
    faArrowLeft = faArrowLeft;
    faCar = faCar;
    faClock = faClock;
    faMapMarkerAlt = faMapMarkerAlt;
    faDollarSign = faDollarSign;
    faCalendar = faCalendar;
    faExclamationTriangle = faExclamationTriangle;
    faTools = faTools;
    faSpinner = faSpinner;
    faFileAlt = faFileAlt;
    faMoneyBillWave = faMoneyBillWave;

    serviceRequest?: ServiceRequest;
    isLoading = true;
    errorMessage = '';
    requestId = '';

    serviceTypeLabels: Record<string, string> = {
        'home_service': 'Servicio a Domicilio',
        'tow_truck': 'Grúa y Remolque',
        'express_oil_change': 'Cambio de Aceite Express',
        'mechanical_diagnosis': 'Diagnóstico Mecánico',
        'specific_repair': 'Reparación Específica',
        'emergency_service': 'Servicio de Emergencia',
        'tire_change': 'Cambio de Llantas',
        'battery_service': 'Servicio de Batería',
        'other': 'Otro Servicio'
    };

    urgencyLabels: Record<string, string> = {
        'low': 'Baja',
        'medium': 'Media',
        'high': 'Alta',
        'emergency': 'Emergencia'
    };

    vehicleTypeLabels: Record<string, string> = {
        'car': 'Automóvil',
        'motorcycle': 'Motocicleta',
        'suv': 'SUV',
        'truck': 'Camioneta',
        'van': 'Van'
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private serviceRequestService: ServiceRequestService
    ) { }

    ngOnInit(): void {
        this.requestId = this.route.snapshot.paramMap.get('id') || '';
        if (this.requestId) {
            this.loadServiceRequest();
        }
    }

    loadServiceRequest(): void {
        this.isLoading = true;
        this.serviceRequestService.getById(this.requestId).subscribe({
            next: (request) => {
                this.serviceRequest = request;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading service request:', error);
                this.errorMessage = 'Error al cargar la solicitud de servicio';
                this.isLoading = false;
            }
        });
    }

  goBack(): void {
    this.router.navigate(['/servicios/disponibles']);
  }

  makeOffer(): void {
    this.router.navigate(['/servicios/disponibles', this.requestId, 'ofertar']);
  }    formatCurrency(amount: number): string {
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
            day: 'numeric'
        });
    }

    getUrgencyClass(urgency: string): string {
        switch (urgency) {
            case 'emergency':
                return 'urgency-emergency';
            case 'high':
                return 'urgency-high';
            case 'medium':
                return 'urgency-medium';
            default:
                return 'urgency-low';
        }
    }

    hasSpecificDetails(): boolean {
        if (!this.serviceRequest) return false;

        return !!(
            this.serviceRequest.homeServiceDetails ||
            this.serviceRequest.towTruckDetails ||
            this.serviceRequest.oilChangeDetails ||
            this.serviceRequest.diagnosisDetails ||
            this.serviceRequest.repairDetails
        );
    }
}
