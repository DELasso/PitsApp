import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { WorkshopsService } from '../../services/workshops.service';
import { Workshop, WorkshopSearchParams } from '../../models/workshop.model';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/auth.model';

@Component({
  selector: 'app-workshops',  
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './workshops.component.html',
  styleUrl: './workshops.component.scss',
  providers: [WorkshopsService]
})
export class WorkshopsComponent implements OnInit, OnDestroy {
  workshops: Workshop[] = [];
  filteredWorkshops: Workshop[] = [];
  loading = false;
  error: string | null = null;
  private routerSubscription?: Subscription;
  currentUser: User | null = null;
  
  // Filtros
  searchTerm = '';
  selectedService = '';
  selectedNeighborhood = '';
  
  // Opciones para filtros
  services = ['Mecánica general', 'Frenos', 'Suspensión', 'Eléctrica', 'Aire acondicionado', 'Diagnóstico'];
  neighborhoods = ['Poblado', 'Laureles', 'Envigado', 'Belén', 'Sabaneta', 'Itagüí'];

  constructor(
    private workshopsService: WorkshopsService, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Obtener usuario actual
    this.currentUser = this.authService.getCurrentUser();
    
    this.loadWorkshops();
    
    // Suscribirse a eventos de navegación para refrescar cuando se regrese del formulario
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/workshops' && event.url !== event.urlAfterRedirects) {
          // Se regresó a la lista desde otra página, refrescar
          this.loadWorkshops();
        }
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadWorkshops() {
    this.loading = true;
    this.error = null;
    
    // Si es proveedor, mostrar solo sus talleres. Si es cliente, mostrar todos
    const isProvider = this.currentUser?.role === UserRole.PROVEEDOR;
    const serviceCall = isProvider ? 
      this.workshopsService.getMyWorkshops() : 
      this.workshopsService.getWorkshops();
    
    serviceCall.subscribe({
      next: (workshops) => {
        this.workshops = workshops;
        this.filteredWorkshops = [...workshops];
        this.loading = false;
        
        const userType = isProvider ? 'proveedor' : 'cliente';
        const count = workshops.length;
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
    // Navegar a detalle del taller
    this.router.navigate(['/talleres', workshop.id]);
  }

  onContactClick(workshop: Workshop, event: Event) {
    event.stopPropagation();
    // Abrir WhatsApp o llamada
    window.open(`tel:${workshop.phone}`, '_blank');
  }

  onImageError(event: any) {
    // Reemplazar imagen rota con ícono por defecto
    const imgElement = event.target;
    imgElement.style.display = 'none';
    const parent = imgElement.parentElement;
    if (parent) {
      parent.innerHTML = '<span class="workshop-icon"><i class="fa-solid fa-wrench"></i></span>';
    }
  }
}
