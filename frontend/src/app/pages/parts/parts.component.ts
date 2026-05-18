import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, filter } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Part, PartCondition } from '../../models/part.model';
import { PartsService } from '../../services/parts.service';
import { CartService } from '../../services/cart.service';
import { FileUploadService } from '../../services/file-upload.service';
import { CartSummary } from '../../models/cart.model';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/auth.model';
import { UiService } from '../../services/ui.service';

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
  isProviderView = false;
  private routerSubscription?: Subscription;
  
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
    private fileUploadService: FileUploadService,
    private router: Router,
    private route: ActivatedRoute,
    private ui: UiService
  ) {}

  ngOnInit(): void {
    // Obtener usuario actual
    this.currentUser = this.authService.getCurrentUser();
    
    this.isProviderView = this.route.snapshot.url.some(s => s.path === 'provider' || s.path === 'repuestos');
    this.route.url.subscribe(segments => {
      this.isProviderView = segments.some(s => s.path === 'provider' || s.path === 'repuestos');
    });

    this.loadParts();
    if (!this.isProviderView) {
      this.loadCartSummary();
    }

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects === '/parts' || event.urlAfterRedirects === '/provider/repuestos') {
          this.loadParts();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadParts(): void {
    this.loading = true;
    this.error = null;
    
    const partsRequest = this.isProviderView && this.currentUser?.role === UserRole.PROVEEDOR
      ? this.partsService.getMyParts()
      : this.partsService.getParts();

    partsRequest
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (parts) => {
          this.allParts = parts;
          this.filteredParts = [...parts];
          this.updateCategoryCounts();
          this.loading = false;
        },
        error: (error) => {
          this.error = this.isProviderView
            ? 'Error al cargar tus repuestos'
            : 'Error al cargar los repuestos';
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

  navigateToCreatePart() {
    this.router.navigate(['/provider/repuestos/crear']);
  }

  navigateToProviderDashboard() {
    this.router.navigate(['/provider/dashboard']);
  }

  editPart(part: Part, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/provider/repuestos/editar', part.id]);
  }

  async deletePart(part: Part, event: Event) {
    event.stopPropagation();

    const confirmed = await this.ui.confirm({
      title: 'Eliminar repuesto',
      message: `¿Deseas eliminar el repuesto "${part.name}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger'
    });

    if (!confirmed) return;

    this.loading = true;

    this.partsService.deletePart(part.id).subscribe({
      next: () => {
        this.allParts = this.allParts.filter(p => p.id !== part.id);
        this.filteredParts = this.filteredParts.filter(p => p.id !== part.id);
        this.updateCategoryCounts();
        this.loading = false;
        this.ui.success('Repuesto eliminado correctamente');
      },
      error: (error) => {
        this.loading = false;
        this.ui.error(error.error?.message || 'Error al eliminar el repuesto');
        console.error('Error deleting part:', error);
      }
    });
  }

  onPartClick(part: Part) {
    if (this.isProviderView) {
      this.editPart(part);
    }
  }
}
