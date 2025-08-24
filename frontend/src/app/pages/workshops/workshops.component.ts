import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { WorkshopsService } from '../../services/workshops.service';
import { Workshop, WorkshopSearchParams } from '../../models/workshop.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-workshops',  
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './workshops.component.html',
  styleUrl: './workshops.component.scss',
  providers: [WorkshopsService]
})
export class WorkshopsComponent implements OnInit {
  workshops: Workshop[] = [];
  filteredWorkshops: Workshop[] = [];
  loading = false;
  error: string | null = null;
  
  // Filtros
  searchTerm = '';
  selectedService = '';
  selectedNeighborhood = '';
  
  // Opciones para filtros
  services = ['Mecánica general', 'Frenos', 'Suspensión', 'Eléctrica', 'Aire acondicionado', 'Diagnóstico'];
  neighborhoods = ['Poblado', 'Laureles', 'Envigado', 'Belén', 'Sabaneta', 'Itagüí'];

  constructor(private workshopsService: WorkshopsService) {}

  ngOnInit() {
    this.loadWorkshops();
  }

  loadWorkshops() {
    this.loading = true;
    this.error = null;
    
    // Usar método mockeado por ahora
    this.workshopsService.getWorkshopsMocked().subscribe({
      next: (workshops) => {
        this.workshops = workshops;
        this.filteredWorkshops = [...workshops];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los talleres. Por favor, intenta de nuevo.';
        this.loading = false;
        console.error('Error loading workshops:', error);
      }
    });
  }

  searchWorkshops() {
    this.loading = true;
    
    // Filtrar localmente por ahora
    this.filteredWorkshops = this.workshops.filter(workshop => {
      const matchesSearch = !this.searchTerm || 
        workshop.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        workshop.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesService = !this.selectedService || 
        workshop.services.some(service => service.includes(this.selectedService));
      
      const matchesNeighborhood = !this.selectedNeighborhood || 
        workshop.neighborhood.includes(this.selectedNeighborhood);
      
      return matchesSearch && matchesService && matchesNeighborhood;
    });
    
    this.loading = false;
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedService = '';
    this.selectedNeighborhood = '';
    this.filteredWorkshops = [...this.workshops];
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Estrellas llenas
    for (let i = 0; i < fullStars; i++) {
      stars.push('fa-solid fa-star');
    }

    // Media estrella
    if (hasHalfStar) {
      stars.push('fa-solid fa-star-half');
    }

    // Estrellas vacías
    for (let i = 0; i < emptyStars; i++) {
      stars.push('fa-regular fa-star');
    }

    return stars;
  }

  formatPhoneNumber(phone: string): string {
    // Formatear número de teléfono para mostrar mejor
    return phone;
  }

  onWorkshopClick(workshop: Workshop) {
    // Navegar a detalle del taller (implementar más tarde)
    console.log('Workshop clicked:', workshop);
  }

  onContactClick(workshop: Workshop, event: Event) {
    event.stopPropagation();
    // Abrir WhatsApp o llamada
    window.open(`tel:${workshop.phone}`, '_blank');
  }
}
