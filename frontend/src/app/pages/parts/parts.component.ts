import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { PartsService } from '../../services/parts.service';
import { Part } from '../../models/part.model';

@Component({
  selector: 'app-parts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parts.component.html',
  styleUrls: ['./parts.component.scss']
})
export class PartsComponent implements OnInit {
  categories: { name: string, icon: string, count: number }[] = [];
  parts: Part[] = [];   // 👈 aquí guardamos los productos filtrados
  selectedCategory: string = '';

  constructor(
    private partsService: PartsService,
    private cartService: CartService
  ) {}

  addToCart(part: Part): void {
    this.cartService.addToCart(part);
    console.log('Agregado al carrito:', part);
  }

  ngOnInit(): void {
    this.partsService.getCategories().subscribe(cats => {
      this.categories = cats.map(cat => ({
        name: cat,
        icon: 'fa-solid fa-cog',
        count: 0
      }));
      this.updateCategoryCounts();
    });
  }

  private updateCategoryCounts(parts: Part[] = []) {
    if (parts.length === 0) {
      this.partsService.getParts().subscribe(allParts => {
        this.categories.forEach(cat => {
          cat.count = allParts.filter(p => p.category === cat.name).length;
        });
      });
    } else {
      this.categories.forEach(cat => {
        cat.count = parts.filter(p => p.category === cat.name).length;
      });
    }
  }

  // ✅ Ahora en vez de modal, cargamos productos en la misma vista
  filterByCategory(category: string) {
    this.partsService.searchParts({ category }).subscribe(response => {
      this.parts = response;
      this.selectedCategory = category;
    });
  }
}
