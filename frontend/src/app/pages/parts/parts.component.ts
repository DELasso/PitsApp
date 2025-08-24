import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-parts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parts.component.html',
  styleUrl: './parts.component.scss'
})
export class PartsComponent {
  categories = [
    { name: 'Frenos', icon: 'fa-solid fa-car-on', count: 45 },
    { name: 'Motor', icon: 'fa-solid fa-fire', count: 78 },
    { name: 'Transmisión', icon: 'fa-solid fa-gear', count: 32 },
    { name: 'Suspensión', icon: 'fa-solid fa-car-burst', count: 56 },
    { name: 'Eléctricos', icon: 'fa-solid fa-bolt', count: 89 },
    { name: 'Llantas', icon: 'fa-solid fa-truck-monster', count: 67 }
  ];
}
