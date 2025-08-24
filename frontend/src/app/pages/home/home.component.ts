import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  services = [
    {
      title: 'Talleres',
      description: 'Encuentra los mejores talleres mecánicos cerca de ti',
      icon: 'fa-solid fa-wrench',
      route: '/talleres'
    },
    {
      title: 'Repuestos',
      description: 'Repuestos originales y genéricos para tu vehículo',
      icon: 'fa-solid fa-gears',
      route: '/repuestos'
    },
    {
      title: 'Servicios',
      description: 'Servicios especializados para carros y motos',
      icon: 'fa-solid fa-screwdriver-wrench',
      route: '/servicios'
    }
  ];
}
