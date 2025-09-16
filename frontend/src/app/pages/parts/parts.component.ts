import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Part, PartCondition } from '../../models/part.model';
import { PartsService } from '../../services/parts.service';
import { CartService } from '../../services/cart.service';
import { FileUploadService } from '../../services/file-upload.service';
import { CartSummary } from '../../models/cart.model';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/auth.model';

@Component({
  selector: 'app-parts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './parts.component.html',
  styleUrl: './parts.component.scss'
})
export class PartsComponent implements OnInit, OnDestroy {
  Math = Math;
  
  searchTerm: string = '';
  selectedCategory: string = '';
  loading = false;
  error: string | null = null;
  currentUser: User | null = null;
  
  categories = [
    { name: 'Frenos', icon: 'fa-solid fa-car-on', count: 0 },
    { name: 'Motor', icon: 'fa-solid fa-fire', count: 0 },
    { name: 'Transmisión', icon: 'fa-solid fa-gear', count: 0 },
    { name: 'Suspensión', icon: 'fa-solid fa-car-burst', count: 0 },
    { name: 'Eléctricos', icon: 'fa-solid fa-bolt', count: 0 },
    { name: 'Llantas', icon: 'fa-solid fa-truck-monster', count: 0 }
  ];

  allParts: Part[] = [];
  filteredParts: Part[] = [];
  showingCategory: string = '';

  cartSummary: CartSummary | null = null;
  private destroy$ = new Subject<void>();

  // Propiedades para el template
  get partsToShow(): Part[] {
    return this.filteredParts;
  }

  get hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || this.selectedCategory !== '';
  }

  get filterStatusText(): string {
    const filters = [];
    if (this.searchTerm.trim()) {
      filters.push(`"${this.searchTerm.trim()}"`);
    }
    if (this.selectedCategory) {
      filters.push(this.selectedCategory);
    }
    return filters.length > 0 ? `Filtros activos: ${filters.join(', ')}` : '';
  }

  constructor(
    private partsService: PartsService,
    private cartService: CartService,
    private authService: AuthService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    // Obtener usuario actual
    this.currentUser = this.authService.getCurrentUser();
    
    this.loadParts();
    this.loadCartSummary();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadParts(): void {
    this.loading = true;
    this.error = null;
    
    // Si es proveedor, mostrar solo sus repuestos. Si es cliente, mostrar todos
    const isProvider = this.currentUser?.role === UserRole.PROVEEDOR;
    const serviceCall = isProvider ? 
      this.partsService.getMyParts() : 
      this.partsService.getParts();
    
    serviceCall
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (parts) => {
          this.allParts = parts;
          this.filteredParts = [...parts];
          this.updateCategoryCounts();
          this.loading = false;
          
          const userType = isProvider ? 'proveedor' : 'cliente';
          const count = parts.length;
        },
        error: (error) => {
          this.error = 'Error al cargar los repuestos';
          this.loading = false;
          console.error('Error loading parts:', error);
        }
      });
  }

  private updateCategoryCounts(): void {
    this.categories.forEach(category => {
      category.count = this.allParts.filter(part => part.category === category.name).length;
    });
  }

  private loadCartSummary(): void {
    this.cartService.getCartSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
      });
  }

  addToCart(part: Part): void {
    this.cartService.addToCart(part, 1);
  }

  isInCart(partId: string): boolean {
    return this.cartService.isInCart(partId);
  }

  getCartQuantity(partId: string): number {
    return this.cartService.getPartQuantity(partId);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getConditionClass(condition: PartCondition): string {
    return `condition-${condition}`;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onCategoryFilter(categoryName: string): void {
    this.selectedCategory = categoryName;
    this.showingCategory = categoryName;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.showingCategory = '';
    this.filteredParts = [...this.allParts];
  }

  private applyFilters(): void {
    let filtered = [...this.allParts];

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(part => 
        part.name.toLowerCase().includes(searchLower) ||
        part.brand.toLowerCase().includes(searchLower) ||
        part.partNumber.toLowerCase().includes(searchLower) ||
        part.description.toLowerCase().includes(searchLower) ||
        part.compatibleVehicles.some(vehicle => 
          vehicle.toLowerCase().includes(searchLower)
        )
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(part => part.category === this.selectedCategory);
    }

    this.filteredParts = filtered;
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push('fa-solid fa-star');
    }

    if (hasHalfStar) {
      stars.push('fa-solid fa-star-half');
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push('fa-regular fa-star');
    }

    return stars;
  }

  getAvailabilityText(part: Part): string {
    if (!part.isAvailable) {
      return 'No disponible';
    }
    if (part.stock <= 0) {
      return 'Agotado';
    }
    if (part.stock <= 5) {
      return 'Últimas unidades';
    }
    return `${part.stock} disponibles`;
  }

  getAvailabilityClass(part: Part): string {
    if (!part.isAvailable || part.stock <= 0) {
      return 'unavailable';
    }
    if (part.stock <= 5) {
      return 'low-stock';
    }
    return 'available';
  }

  onPartImageError(event: any) {
    // Reemplazar imagen rota con ícono por defecto
    const imgElement = event.target;
    imgElement.style.display = 'none';
    const parent = imgElement.parentElement;
    if (parent) {
      parent.innerHTML = '<div class="part-placeholder"><i class="fa-solid fa-gear"></i></div>';
    }
  }

  getImageUrl(imagePath: string): string {
    return this.fileUploadService.getImageUrl(imagePath);
  }
}