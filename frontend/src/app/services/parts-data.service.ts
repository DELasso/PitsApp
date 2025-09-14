import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Part, PartCondition, VehicleType } from '../models/part.model';

@Injectable({
  providedIn: 'root'
})
export class PartsDataService {
  private partsCache: Part[] | null = null;

  // Categorías disponibles
  readonly categories = [
    { name: 'Frenos', icon: 'fa-solid fa-car-on', count: 6 },
    { name: 'Motor', icon: 'fa-solid fa-fire', count: 8 },
    { name: 'Transmisión', icon: 'fa-solid fa-gear', count: 4 },
    { name: 'Suspensión', icon: 'fa-solid fa-car-burst', count: 5 },
    { name: 'Eléctricos', icon: 'fa-solid fa-bolt', count: 4 },
    { name: 'Llantas', icon: 'fa-solid fa-truck-monster', count: 3 }
  ];

  // Obtener todas las partes (simulando llamada a API)
  getAllParts(): Observable<Part[]> {
    if (this.partsCache) {
      return of(this.partsCache);
    }

    // Simular delay de red para datos que vienen de API
    return of(this.getMockParts()).pipe(delay(100));
  }

  // Filtrar partes por categoría
  getPartsByCategory(category: string): Observable<Part[]> {
    return new Observable(observer => {
      this.getAllParts().subscribe(parts => {
        const filtered = parts.filter(part => 
          category === '' || part.category.toLowerCase() === category.toLowerCase()
        );
        observer.next(filtered);
        observer.complete();
      });
    });
  }

  // Buscar partes por término
  searchParts(searchTerm: string, category: string = ''): Observable<Part[]> {
    return new Observable(observer => {
      this.getAllParts().subscribe(parts => {
        let filtered = parts;

        // Filtrar por categoría si se especifica
        if (category) {
          filtered = filtered.filter(part => 
            part.category.toLowerCase() === category.toLowerCase()
          );
        }

        // Filtrar por término de búsqueda
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(part => 
            part.name.toLowerCase().includes(term) ||
            part.brand.toLowerCase().includes(term) ||
            part.description.toLowerCase().includes(term) ||
            part.partNumber.toLowerCase().includes(term) ||
            part.compatibleVehicles.some(vehicle => 
              vehicle.toLowerCase().includes(term)
            )
          );
        }

        observer.next(filtered);
        observer.complete();
      });
    });
  }

  // Obtener parte por ID
  getPartById(id: string): Observable<Part | null> {
    return new Observable(observer => {
      this.getAllParts().subscribe(parts => {
        const part = parts.find(p => p.id === id) || null;
        observer.next(part);
        observer.complete();
      });
    });
  }

  private getMockParts(): Part[] {
    if (this.partsCache) {
      return this.partsCache;
    }

    this.partsCache = [
      // FRENOS
      {
        id: '1',
        name: 'Pastillas de Freno Delanteras',
        description: 'Pastillas de freno cerámicas de alta calidad para máxima seguridad',
        category: 'Frenos',
        brand: 'Brembo',
        partNumber: 'BR-P50024',
        price: 150000,
        condition: PartCondition.ORIGINAL,
        vehicleType: VehicleType.CARRO,
        compatibleVehicles: ['Honda Civic', 'Toyota Corolla', 'Chevrolet Spark'],
        supplier: 'AutoPartes Colombia',
        images: ['assets/PitsApp01.png'],
        stock: 25,
        warranty: '12 meses',
        weight: 2.5,
        dimensions: '25x15x3 cm',
        rating: 4.8,
        reviewCount: 156,
        isAvailable: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-08-20')
      },
      {
        id: '2',
        name: 'Discos de Freno Traseros',
        description: 'Discos de freno ventilados para mejor disipación de calor',
        category: 'Frenos',
        brand: 'ATE',
        partNumber: 'AT-D24152',
        price: 280000,
        condition: PartCondition.ORIGINAL,
        vehicleType: VehicleType.CARRO,
        compatibleVehicles: ['Volkswagen Polo', 'Nissan March', 'Hyundai i10'],
        supplier: 'Distribuidora Central',
        images: ['assets/PitsApp01.png'],
        stock: 18,
        warranty: '18 meses',
        weight: 8.2,
        dimensions: '30x30x5 cm',
        rating: 4.6,
        reviewCount: 89,
        isAvailable: true,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-08-18')
      }
      // Agrega más datos aquí pero de forma lazy...
      // Por ahora solo algunos ejemplos para reducir el tamaño inicial
    ];

    return this.partsCache!;
  }

  // Limpiar cache si es necesario
  clearCache(): void {
    this.partsCache = null;
  }
}