import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PartsService } from '../../services/parts.service'; // Ajusta el path si necesario
import { Part, PartSearchParams } from '../../models/part.model';

@Component({
  selector: 'app-parts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parts.component.html',
  styleUrls: ['./parts.component.scss']
})
export class PartsComponent implements OnInit {
  categories: { name: string, icon: string, count: number }[] = [];
  // Elimina la lista de partes principal
  // parts: Part[] = [];
  showModal: boolean = false;
  modalParts: Part[] = [];
  modalCategory: string = '';

  constructor(private partsService: PartsService) {}

  ngOnInit(): void {
    // Carga categorías dinámicamente
    this.partsService.getCategories().subscribe(cats => {
      this.categories = cats.map(cat => ({ name: cat, icon: 'fa-solid fa-cog', count: 0 }));
      // Ya no se cargan productos aquí
      this.updateCategoryCounts();
    });
  }

  // Ya no se usa para mostrar productos abajo
  // Método para cargar productos (solo para contar)
  private loadPartsForCount() {
    this.partsService.getParts().subscribe(response => {
      this.updateCategoryCounts(response);
    });
  }

  // Actualiza el conteo de productos por categoría
  private updateCategoryCounts(parts: Part[] = []) {
    if (parts.length === 0) {
      // Si no se pasan partes, obtenerlas solo para contar
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

  // Maneja el clic en "Ver Todo" y muestra el modal
  filterByCategory(category: string) {
    this.partsService.searchParts({ category }).subscribe(response => {
      this.modalParts = response;
      this.modalCategory = category;
      this.showModal = true;
    });
  }

  closeModal() {
    this.showModal = false;
    this.modalParts = [];
    this.modalCategory = '';
  }

  getFloor(value: number): number {
    return Math.floor(value);
  }
}