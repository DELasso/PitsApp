import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Part } from '../../models/part.model';
import { PartsDataService } from '../../services/parts-data.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-parts-optimized',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="parts-container">
      <h1>Catálogo de Repuestos</h1>
      
      <!-- Búsqueda y filtros -->
      <div class="search-section">
        <input 
          type="text" 
          [(ngModel)]="searchTerm" 
          (ngModelChange)="onSearchChange()"
          placeholder="Buscar repuestos..."
          class="search-input">
        
        <select [(ngModel)]="selectedCategory" (ngModelChange)="onCategoryChange()">
          <option value="">Todas las categorías</option>
          <option *ngFor="let category of categories" [value]="category.name">
            {{ category.name }} ({{ category.count }})
          </option>
        </select>
      </div>

      <!-- Lista de partes -->
      <div class="parts-grid" *ngIf="!loading">
        <div *ngFor="let part of displayedParts; trackBy: trackByPartId" class="part-card">
          <h3>{{ part.name }}</h3>
          <p>{{ part.description }}</p>
          <p class="price">{{ formatPrice(part.price) }}</p>
          <button (click)="addToCart(part)" class="add-to-cart-btn">
            Agregar al Carrito
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">
        Cargando repuestos...
      </div>
    </div>
  `,
  styleUrls: ['./parts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartsOptimizedComponent implements OnInit, OnDestroy {
  searchTerm = '';
  selectedCategory = '';
  displayedParts: Part[] = [];
  categories: any[] = [];
  loading = false;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private partsDataService: PartsDataService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {
    this.categories = this.partsDataService.categories;
  }

  ngOnInit(): void {
    this.setupSearch();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Optimización: TrackBy para evitar re-renders innecesarios
  trackByPartId(index: number, part: Part): string {
    return part.id;
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300), // Esperar 300ms después del último keystroke
        distinctUntilChanged(), // Solo buscar si el término cambió
        switchMap(searchTerm => 
          this.partsDataService.searchParts(searchTerm, this.selectedCategory)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(parts => {
        this.displayedParts = parts;
        this.loading = false;
        this.cdr.markForCheck(); // Marcar para detección de cambios
      });
  }

  private loadInitialData(): void {
    this.loading = true;
    this.cdr.markForCheck();
    
    this.partsDataService.getAllParts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(parts => {
        this.displayedParts = parts;
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  onSearchChange(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.searchSubject.next(this.searchTerm);
  }

  onCategoryChange(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.searchSubject.next(this.searchTerm);
  }

  addToCart(part: Part): void {
    this.cartService.addToCart(part, 1);
    // Mostrar feedback visual aquí si es necesario
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }
}