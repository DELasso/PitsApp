import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Part, PartCondition, VehicleType } from '../../models/part.model';
import { CartService } from '../../services/cart.service';
import { CartSummary } from '../../models/cart.model';

@Component({
  selector: 'app-parts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './parts.component.html',
  styleUrl: './parts.component.scss'
})
export class PartsComponent implements OnInit, OnDestroy {
  Math = Math; // Exponer Math al template
  
  // Propiedades de filtrado
  searchTerm: string = '';
  selectedCategory: string = '';
  
  categories = [
    { name: 'Frenos', icon: 'fa-solid fa-car-on', count: 6 },
    { name: 'Motor', icon: 'fa-solid fa-fire', count: 8 },
    { name: 'Transmisión', icon: 'fa-solid fa-gear', count: 4 },
    { name: 'Suspensión', icon: 'fa-solid fa-car-burst', count: 5 },
    { name: 'Eléctricos', icon: 'fa-solid fa-bolt', count: 4 },
    { name: 'Llantas', icon: 'fa-solid fa-truck-monster', count: 3 }
  ];

  // Lista completa de repuestos de ejemplo
  allParts: Part[] = [
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
      weight: 1.2,
      rating: 4.5,
      reviewCount: 23,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '7',
      name: 'Pastillas de Freno Traseras',
      description: 'Pastillas de freno traseras para máximo frenado',
      category: 'Frenos',
      brand: 'Ferodo',
      partNumber: 'FE-T45028',
      price: 120000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Renault Logan', 'Nissan Versa', 'Kia Rio'],
      supplier: 'AutoPartes Colombia',
      images: ['assets/PitsApp01.png'],
      stock: 18,
      warranty: '12 meses',
      weight: 1.0,
      rating: 4.3,
      reviewCount: 17,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '8',
      name: 'Discos de Freno Ventilados',
      description: 'Discos de freno ventilados para mejor disipación del calor',
      category: 'Frenos',
      brand: 'Brembo',
      partNumber: 'BR-D09580',
      price: 280000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Honda Civic', 'Toyota Corolla'],
      supplier: 'AutoPartes Colombia',
      images: ['assets/PitsApp01.png'],
      stock: 12,
      warranty: '24 meses',
      weight: 8.5,
      rating: 4.7,
      reviewCount: 31,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '9',
      name: 'Líquido de Frenos DOT 4',
      description: 'Líquido de frenos de alta calidad DOT 4',
      category: 'Frenos',
      brand: 'Castrol',
      partNumber: 'CAS-DOT4-500',
      price: 25000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.AMBOS,
      compatibleVehicles: ['Universal'],
      supplier: 'Lubricantes Pro',
      images: ['assets/PitsApp01.png'],
      stock: 50,
      warranty: '24 meses',
      weight: 0.5,
      rating: 4.6,
      reviewCount: 42,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '10',
      name: 'Cilindro Maestro de Frenos',
      description: 'Cilindro maestro remanufacturado para sistema de frenos',
      category: 'Frenos',
      brand: 'TRW',
      partNumber: 'TRW-CM-4521',
      price: 180000,
      condition: PartCondition.REMANUFACTURADO,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Chevrolet Aveo', 'Daewoo Lanos'],
      supplier: 'Hidráulicos Express',
      images: ['assets/PitsApp01.png'],
      stock: 8,
      warranty: '18 meses',
      weight: 2.1,
      rating: 4.2,
      reviewCount: 19,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '11',
      name: 'Cables de Freno de Mano',
      description: 'Juego de cables para freno de mano',
      category: 'Frenos',
      brand: 'Cofle',
      partNumber: 'COF-FM-852',
      price: 65000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Renault Sandero', 'Dacia Logan'],
      supplier: 'Cables y Chicotes',
      images: ['assets/PitsApp01.png'],
      stock: 15,
      warranty: '12 meses',
      weight: 1.5,
      rating: 4.1,
      reviewCount: 12,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // MOTOR
    {
      id: '2',
      name: 'Filtro de Aire',
      description: 'Filtro de aire de papel de alta eficiencia',
      category: 'Motor',
      brand: 'K&N',
      partNumber: 'KN-33-2304',
      price: 75000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.AMBOS,
      compatibleVehicles: ['Renault Logan', 'Nissan March', 'Kia Picanto'],
      supplier: 'Filtros Pro',
      images: ['assets/PitsApp01.png'],
      stock: 40,
      warranty: '6 meses',
      weight: 0.3,
      rating: 4.8,
      reviewCount: 45,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Bujías de Encendido',
      description: 'Set de 4 bujías de iridio para mejor rendimiento',
      category: 'Motor',
      brand: 'NGK',
      partNumber: 'NGK-IFR6T11',
      price: 120000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Mazda 3', 'Hyundai Accent', 'Ford Fiesta'],
      supplier: 'Encendido Total',
      images: ['assets/PitsApp01.png'],
      stock: 30,
      warranty: '24 meses',
      weight: 0.5,
      rating: 4.7,
      reviewCount: 38,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '12',
      name: 'Filtro de Aceite',
      description: 'Filtro de aceite de alta calidad para motor',
      category: 'Motor',
      brand: 'Mann',
      partNumber: 'MANN-W712-93',
      price: 35000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Toyota Corolla', 'Honda Civic', 'Nissan Sentra'],
      supplier: 'Filtros Pro',
      images: ['assets/PitsApp01.png'],
      stock: 60,
      warranty: '12 meses',
      weight: 0.4,
      rating: 4.5,
      reviewCount: 67,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '13',
      name: 'Correa de Distribución',
      description: 'Correa de distribución reforzada con fibra de vidrio',
      category: 'Motor',
      brand: 'Gates',
      partNumber: 'GAT-5522XS',
      price: 85000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Chevrolet Spark', 'Daewoo Matiz'],
      supplier: 'Distribución Motor',
      images: ['assets/PitsApp01.png'],
      stock: 20,
      warranty: '24 meses',
      weight: 0.8,
      rating: 4.6,
      reviewCount: 24,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '14',
      name: 'Bobina de Encendido',
      description: 'Bobina de encendido individual de alta potencia',
      category: 'Motor',
      brand: 'Bosch',
      partNumber: 'BOS-0221504024',
      price: 95000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Volkswagen Gol', 'Seat Ibiza'],
      supplier: 'Encendido Total',
      images: ['assets/PitsApp01.png'],
      stock: 25,
      warranty: '24 meses',
      weight: 0.6,
      rating: 4.4,
      reviewCount: 18,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '15',
      name: 'Termostato',
      description: 'Termostato del sistema de refrigeración',
      category: 'Motor',
      brand: 'Wahler',
      partNumber: 'WAH-4244.82D',
      price: 45000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Renault Logan', 'Dacia Sandero'],
      supplier: 'Refrigeración Auto',
      images: ['assets/PitsApp01.png'],
      stock: 35,
      warranty: '12 meses',
      weight: 0.3,
      rating: 4.3,
      reviewCount: 29,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '16',
      name: 'Sensor de Oxígeno',
      description: 'Sensor lambda para control de emisiones',
      category: 'Motor',
      brand: 'Bosch',
      partNumber: 'BOS-0258007351',
      price: 165000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Honda Civic', 'Toyota Corolla'],
      supplier: 'Sensores Auto',
      images: ['assets/PitsApp01.png'],
      stock: 12,
      warranty: '24 meses',
      weight: 0.2,
      rating: 4.7,
      reviewCount: 22,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '17',
      name: 'Radiador',
      description: 'Radiador de aluminio para refrigeración del motor',
      category: 'Motor',
      brand: 'Valeo',
      partNumber: 'VAL-732974',
      price: 320000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Chevrolet Aveo', 'Daewoo Lanos'],
      supplier: 'Refrigeración Auto',
      images: ['assets/PitsApp01.png'],
      stock: 8,
      warranty: '24 meses',
      weight: 4.2,
      rating: 4.5,
      reviewCount: 16,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // TRANSMISIÓN
    {
      id: '18',
      name: 'Kit de Embrague',
      description: 'Kit completo de embrague con disco, prensa y collarín',
      category: 'Transmisión',
      brand: 'Sachs',
      partNumber: 'SAC-3000951301',
      price: 450000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Renault Logan', 'Dacia Sandero'],
      supplier: 'Transmisiones Pro',
      images: ['assets/PitsApp01.png'],
      stock: 10,
      warranty: '24 meses',
      weight: 12.5,
      rating: 4.6,
      reviewCount: 34,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '19',
      name: 'Aceite de Transmisión ATF',
      description: 'Aceite para transmisión automática ATF Dexron III',
      category: 'Transmisión',
      brand: 'Mobil',
      partNumber: 'MOB-ATF-D3',
      price: 85000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Universal automáticos'],
      supplier: 'Lubricantes Pro',
      images: ['assets/PitsApp01.png'],
      stock: 30,
      warranty: '36 meses',
      weight: 4.0,
      rating: 4.8,
      reviewCount: 41,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '20',
      name: 'Filtro de Transmisión',
      description: 'Filtro para caja automática con empaque',
      category: 'Transmisión',
      brand: 'Wix',
      partNumber: 'WIX-58940',
      price: 65000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Honda Civic AT', 'Toyota Corolla AT'],
      supplier: 'Filtros Pro',
      images: ['assets/PitsApp01.png'],
      stock: 15,
      warranty: '12 meses',
      weight: 0.8,
      rating: 4.4,
      reviewCount: 28,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '21',
      name: 'Cable de Clutch',
      description: 'Cable del embrague con regulador',
      category: 'Transmisión',
      brand: 'Cofle',
      partNumber: 'COF-CL-945',
      price: 75000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Chevrolet Spark', 'Daewoo Matiz'],
      supplier: 'Cables y Chicotes',
      images: ['assets/PitsApp01.png'],
      stock: 22,
      warranty: '18 meses',
      weight: 1.2,
      rating: 4.2,
      reviewCount: 19,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // SUSPENSIÓN
    {
      id: '4',
      name: 'Amortiguador Trasero',
      description: 'Amortiguador hidráulico remanufacturado en excelente estado',
      category: 'Suspensión',
      brand: 'Monroe',
      partNumber: 'MON-32144',
      price: 280000,
      condition: PartCondition.REMANUFACTURADO,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Chevrolet Aveo', 'Daewoo Lanos'],
      supplier: 'Suspensión Express',
      images: ['assets/PitsApp01.png'],
      stock: 12,
      warranty: '18 meses',
      weight: 3.5,
      rating: 4.2,
      reviewCount: 15,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '22',
      name: 'Amortiguador Delantero',
      description: 'Amortiguador delantero de gas para mejor manejo',
      category: 'Suspensión',
      brand: 'KYB',
      partNumber: 'KYB-335806',
      price: 320000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Honda Civic', 'Toyota Corolla'],
      supplier: 'Suspensión Express',
      images: ['assets/PitsApp01.png'],
      stock: 14,
      warranty: '24 meses',
      weight: 4.1,
      rating: 4.6,
      reviewCount: 27,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '23',
      name: 'Resortes Helicoidales',
      description: 'Par de resortes helicoidales traseros',
      category: 'Suspensión',
      brand: 'Eibach',
      partNumber: 'EIB-E10-82-014-01',
      price: 195000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Renault Logan', 'Nissan Versa'],
      supplier: 'Suspensión Express',
      images: ['assets/PitsApp01.png'],
      stock: 18,
      warranty: '36 meses',
      weight: 6.8,
      rating: 4.4,
      reviewCount: 21,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '24',
      name: 'Bieletas de Suspensión',
      description: 'Bieletas estabilizadoras delanteras',
      category: 'Suspensión',
      brand: 'TRW',
      partNumber: 'TRW-JTS439',
      price: 85000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Mazda 3', 'Ford Focus'],
      supplier: 'Suspensión Express',
      images: ['assets/PitsApp01.png'],
      stock: 24,
      warranty: '12 meses',
      weight: 0.8,
      rating: 4.3,
      reviewCount: 33,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '25',
      name: 'Bases de Amortiguador',
      description: 'Bases superiores de amortiguador con rodamiento',
      category: 'Suspensión',
      brand: 'Febi',
      partNumber: 'FEB-27632',
      price: 125000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Volkswagen Gol', 'Seat Ibiza'],
      supplier: 'Suspensión Express',
      images: ['assets/PitsApp01.png'],
      stock: 16,
      warranty: '18 meses',
      weight: 1.5,
      rating: 4.1,
      reviewCount: 14,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // ELÉCTRICOS
    {
      id: '6',
      name: 'Batería 12V 45Ah',
      description: 'Batería libre de mantenimiento para arranque confiable',
      category: 'Eléctricos',
      brand: 'MAC',
      partNumber: 'MAC-45AH-12V',
      price: 180000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.AMBOS,
      compatibleVehicles: ['Universal pequeños y medianos'],
      supplier: 'Baterías Colombia',
      images: ['assets/PitsApp01.png'],
      stock: 22,
      warranty: '12 meses',
      weight: 12.0,
      rating: 4.4,
      reviewCount: 31,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '26',
      name: 'Alternador',
      description: 'Alternador remanufacturado de 90 amperios',
      category: 'Eléctricos',
      brand: 'Bosch',
      partNumber: 'BOS-0124325003',
      price: 450000,
      condition: PartCondition.REMANUFACTURADO,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Renault Logan', 'Dacia Sandero'],
      supplier: 'Eléctricos Auto',
      images: ['assets/PitsApp01.png'],
      stock: 8,
      warranty: '18 meses',
      weight: 5.2,
      rating: 4.3,
      reviewCount: 25,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '27',
      name: 'Motor de Arranque',
      description: 'Motor de arranque remanufacturado',
      category: 'Eléctricos',
      brand: 'Valeo',
      partNumber: 'VAL-458178',
      price: 380000,
      condition: PartCondition.REMANUFACTURADO,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Chevrolet Aveo', 'Daewoo Lanos'],
      supplier: 'Eléctricos Auto',
      images: ['assets/PitsApp01.png'],
      stock: 6,
      warranty: '18 meses',
      weight: 4.8,
      rating: 4.2,
      reviewCount: 18,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '28',
      name: 'Faros Delanteros',
      description: 'Par de faros delanteros con regulador',
      category: 'Eléctricos',
      brand: 'Hella',
      partNumber: 'HEL-1EJ008052-171',
      price: 285000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Honda Civic', 'Toyota Corolla'],
      supplier: 'Luces Auto',
      images: ['assets/PitsApp01.png'],
      stock: 10,
      warranty: '24 meses',
      weight: 3.2,
      rating: 4.5,
      reviewCount: 22,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // LLANTAS
    {
      id: '5',
      name: 'Llanta Rin 14',
      description: 'Llanta nueva 185/65R14 para vehículos livianos',
      category: 'Llantas',
      brand: 'Michelin',
      partNumber: 'MICH-185-65-14',
      price: 320000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Renault Sandero', 'Chevrolet Sail'],
      supplier: 'Llantas del Valle',
      images: ['assets/PitsApp01.png'],
      stock: 18,
      warranty: '60000 km',
      weight: 8.5,
      rating: 4.6,
      reviewCount: 28,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '29',
      name: 'Llanta Rin 15',
      description: 'Llanta deportiva 195/60R15 para mejor agarre',
      category: 'Llantas',
      brand: 'Bridgestone',
      partNumber: 'BRI-195-60-15',
      price: 380000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Honda Civic', 'Mazda 3'],
      supplier: 'Llantas del Valle',
      images: ['assets/PitsApp01.png'],
      stock: 16,
      warranty: '80000 km',
      weight: 9.2,
      rating: 4.7,
      reviewCount: 35,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '30',
      name: 'Rines de Aleación',
      description: 'Rines de aleación rin 15 diseño deportivo',
      category: 'Llantas',
      brand: 'BBS',
      partNumber: 'BBS-RE-15x6',
      price: 180000,
      condition: PartCondition.USADO,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Honda Civic', 'Toyota Corolla', 'Mazda 3'],
      supplier: 'Rines y Llantas',
      images: ['assets/PitsApp01.png'],
      stock: 12,
      warranty: '6 meses',
      weight: 7.8,
      rating: 4.1,
      reviewCount: 19,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Propiedades para el filtrado
  filteredParts: Part[] = [];
  showingCategory: string = '';

  cartSummary: CartSummary | null = null;
  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCartSummary();
    this.filteredParts = [...this.allParts];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  // Métodos de filtrado
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

    // Filtrar por búsqueda de texto
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

    // Filtrar por categoría
    if (this.selectedCategory) {
      filtered = filtered.filter(part => part.category === this.selectedCategory);
    }

    this.filteredParts = filtered;
  }

  // Obtener repuestos a mostrar (filtrados o todos)
  get partsToShow(): Part[] {
    return this.filteredParts;
  }

  // Verificar si hay filtros activos
  get hasActiveFilters(): boolean {
    return !!(this.searchTerm.trim() || this.selectedCategory);
  }

  // Obtener texto del estado actual
  get filterStatusText(): string {
    if (this.showingCategory && this.searchTerm.trim()) {
      return `Mostrando repuestos de "${this.showingCategory}" que coinciden con "${this.searchTerm}"`;
    } else if (this.showingCategory) {
      return `Mostrando repuestos de la categoría "${this.showingCategory}"`;
    } else if (this.searchTerm.trim()) {
      return `Resultados de búsqueda para "${this.searchTerm}"`;
    }
    return 'Mostrando todos los repuestos disponibles';
  }
}
