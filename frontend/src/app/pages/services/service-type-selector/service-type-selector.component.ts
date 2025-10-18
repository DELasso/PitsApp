import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faHome,
  faTruck,
  faOilCan,
  faStethoscope,
  faWrench,
  faExclamationTriangle,
  faCircle,
  faBatteryFull,
  faEllipsisH,
  faList,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import { ServiceType } from '../../../models/service-request.model';
import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../models/auth.model';

interface ServiceTypeOption {
  type: ServiceType;
  icon: any;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-service-type-selector',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './service-type-selector.component.html',
  styleUrls: ['./service-type-selector.component.scss']
})
export class ServiceTypeSelectorComponent implements OnInit {
  faList = faList;
  faClipboardList = faClipboardList;
  
  currentUser$ = this.authService.currentUser$;
  UserRole = UserRole;
  
  serviceTypes: ServiceTypeOption[] = [
    {
      type: ServiceType.HOME_SERVICE,
      icon: faHome,
      title: 'Servicio a Domicilio',
      description: 'Llevamos el taller hasta tu ubicación',
      color: '#DC143C'
    },
    {
      type: ServiceType.TOW_TRUCK,
      icon: faTruck,
      title: 'Grúa y Remolque',
      description: 'Transporte seguro de tu vehículo',
      color: '#DC143C'
    },
    {
      type: ServiceType.EXPRESS_OIL_CHANGE,
      icon: faOilCan,
      title: 'Cambio de Aceite Express',
      description: 'Servicio rápido de cambio de aceite',
      color: '#DC143C'
    },
    {
      type: ServiceType.MECHANICAL_DIAGNOSIS,
      icon: faStethoscope,
      title: 'Diagnóstico Mecánico',
      description: 'Análisis completo de tu vehículo',
      color: '#DC143C'
    },
    {
      type: ServiceType.SPECIFIC_REPAIR,
      icon: faWrench,
      title: 'Reparación Específica',
      description: 'Arreglo de partes específicas',
      color: '#DC143C'
    },
    {
      type: ServiceType.EMERGENCY_SERVICE,
      icon: faExclamationTriangle,
      title: 'Servicio de Emergencia',
      description: 'Atención urgente 24/7',
      color: '#DC143C'
    },
    {
      type: ServiceType.TIRE_CHANGE,
      icon: faCircle,
      title: 'Cambio de Llantas',
      description: 'Instalación y balanceo de llantas',
      color: '#DC143C'
    },
    {
      type: ServiceType.BATTERY_SERVICE,
      icon: faBatteryFull,
      title: 'Servicio de Batería',
      description: 'Diagnóstico y cambio de batería',
      color: '#DC143C'
    },
    {
      type: ServiceType.OTHER,
      icon: faEllipsisH,
      title: 'Otro Servicio',
      description: 'Describe tu necesidad específica',
      color: '#DC143C'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    console.log('ServiceTypeSelectorComponent constructor ejecutado');
  }

  ngOnInit(): void {
    console.log('ServiceTypeSelectorComponent ngOnInit ejecutado');
    console.log('Cantidad de servicios disponibles:', this.serviceTypes.length);
  }

  selectServiceType(serviceType: ServiceType): void {
    console.log('Navegando a:', '/services/request', serviceType);
    this.router.navigate(['/services/request', serviceType]);
  }

  viewMyRequests(): void {
    this.router.navigate(['/services/my-requests']);
  }

  viewAvailableRequests(): void {
    this.router.navigate(['/services/available']);
  }
}
