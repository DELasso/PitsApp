import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent {
  services = [
    {
      name: 'Servicio a Domicilio',
      description: 'Mecánicos que van hasta tu ubicación',
      icon: 'fa-solid fa-house-chimney',
      available: true
    },
    {
      name: 'Grúa y Remolque',
      description: 'Servicio de grúa 24/7 en toda la ciudad',
      icon: 'fa-solid fa-truck',
      available: true
    },
    {
      name: 'Diagnóstico Computarizado',
      description: 'Escaneo completo del sistema de tu vehículo',
      icon: 'fa-solid fa-laptop',
      available: true
    },
    {
      name: 'Cambio de Aceite Express',
      description: 'Cambio de aceite rápido sin cita previa',
      icon: 'fa-solid fa-gas-pump',
      available: true
    },
    {
      name: 'Revisión Tecnomecánica',
      description: 'Preparación para la revisión técnica',
      icon: 'fa-solid fa-clipboard-list',
      available: true
    },
    {
      name: 'Lavado y Detailing',
      description: 'Servicios de lavado y embellecimiento',
      icon: 'fa-solid fa-soap',
      available: false
    }
  ];
}
