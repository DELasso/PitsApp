import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePartDto, PartCondition, VehicleType } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { Part } from './entities/part.entity';

@Injectable()
export class PartsService {
  private parts: Part[] = [
    new Part({
      id: '1',
      name: 'Pastillas de Freno Delanteras',
      icon: 'fa-solid fa-cog',
      description: 'Pastillas de freno de alta calidad para vehículos Toyota',
      category: 'Frenos',
      brand: 'Akebono',
      partNumber: 'AK-04465-42180',
      price: 85000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Toyota Corolla 2015-2022', 'Toyota Prius 2016-2022'],
      supplier: 'Repuestos Toyota Medellín',
      stock: 15,
      warranty: '12 meses',
      rating: 4.7,
      reviewCount: 23
    }),
    new Part({
      id: '2',
      name: 'Filtro de Aceite',
      icon: 'fa-solid fa-cog',
      description: 'Filtro de aceite universal para motores 1.6L y 2.0L',
      category: 'Motor',
      brand: 'Mann Filter',
      partNumber: 'MF-W712/52',
      price: 25000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Chevrolet Cruze', 'Mazda 3', 'Nissan Sentra'],
      supplier: 'Autopartes Universal',
      stock: 50,
      warranty: '6 meses',
      rating: 4.5,
      reviewCount: 67
    }),
    new Part({
      id: '3',
      name: 'Cadena de Transmisión',
      icon: 'fa-solid fa-cog',
      description: 'Cadena reforzada para motocicletas deportivas',
      category: 'Transmisión',
      brand: 'DID',
      partNumber: 'DID-520VX3-110',
      price: 180000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.MOTO,
      compatibleVehicles: ['Yamaha R15', 'Honda CBR150R', 'KTM Duke 200'],
      supplier: 'Motos Repuestos Medellín',
      stock: 8,
      warranty: '18 meses',
      rating: 4.9,
      reviewCount: 34
    }),
    new Part({
      id: '4',
      name: 'Amortiguador Trasero',
      icon: 'fa-solid fa-cog',
      description: 'Amortiguador de gas para mejor confort y estabilidad',
      category: 'Suspensión',
      brand: 'Monroe',
      partNumber: 'MON-72045',
      price: 120000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Chevrolet Aveo 2012-2018', 'Chevrolet Spark 2013-2019'],
      supplier: 'Suspensiones del Valle',
      stock: 12,
      warranty: '24 meses',
      rating: 4.6,
      reviewCount: 19
    }),
    new Part({
      id: '5',
      name: 'Batería 12V 60Ah',
      icon: 'fa-solid fa-cog',
      description: 'Batería libre de mantenimiento con tecnología AGM',
      category: 'Eléctricos',
      brand: 'MAC',
      partNumber: 'MAC-60AGM',
      price: 350000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Múltiples marcas y modelos'],
      supplier: 'Baterías Medellín',
      stock: 25,
      warranty: '12 meses',
      rating: 4.4,
      reviewCount: 89
    }),
    new Part({
      id: '6',
      name: 'Llanta 175/65 R14',
      icon: 'fa-solid fa-cog',
      description: 'Llanta radial para uso urbano con excelente agarre',
      category: 'Llantas',
      brand: 'Michelin',
      partNumber: 'MICH-175/65R14-82H',
      price: 280000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Múltiples vehículos compactos'],
      supplier: 'Llantas y Rines',
      stock: 20,
      warranty: '5 años',
      rating: 4.8,
      reviewCount: 156
    }),
    new Part({
      id: '6',
      name: 'Pastillas de Freno traseras',
      icon: 'fa-solid fa-cog',
      description: 'Pastillas de freno de alta calidad para vehículos Toyota',
      category: 'Frenos',
      brand: 'Akebono',
      partNumber: 'AK-04465-42180',
      price: 85000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Toyota Corolla 2015-2022', 'Toyota Prius 2016-2022'],
      supplier: 'Repuestos Toyota Medellín',
      stock: 15,
      warranty: '12 meses',
      rating: 4.7,
      reviewCount: 23
    })
    ,
    new Part({
      id: '7',
      name: 'Filtro de Aire',
      icon: 'fa-solid fa-cog',
      description: 'Filtro de aire de alto flujo para motores gasolina',
      category: 'Motor',
      brand: 'Bosch',
      partNumber: 'BOSCH-FA-1234',
      price: 32000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Renault Logan', 'Kia Rio', 'Hyundai Accent'],
      supplier: 'Filtros y Lubricantes',
      stock: 40,
      warranty: '6 meses',
      rating: 4.3,
      reviewCount: 41
    }),
    new Part({
      id: '8',
      name: 'Kit de Arrastre',
      icon: 'fa-solid fa-cog',
      description: 'Kit completo de arrastre para motocicletas de trabajo',
      category: 'Transmisión',
      brand: 'RK',
      partNumber: 'RK-KIT-428H',
      price: 95000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.MOTO,
      compatibleVehicles: ['Bajaj Boxer', 'AKT 125', 'Yamaha YBR125'],
      supplier: 'Motos Repuestos Medellín',
      stock: 18,
      warranty: '12 meses',
      rating: 4.7,
      reviewCount: 27
    }),
    new Part({
      id: '9',
      name: 'Juego de Plumillas',
      icon: 'fa-solid fa-cog',
      description: 'Plumillas limpiaparabrisas de silicona de larga duración',
      category: 'Accesorios',
      brand: 'Rain-X',
      partNumber: 'RX-PLU-22-18',
      price: 28000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Mazda 2', 'Ford Fiesta', 'Volkswagen Gol'],
      supplier: 'Accesorios Express',
      stock: 60,
      warranty: '3 meses',
      rating: 4.2,
      reviewCount: 15
    }),
    new Part({
      id: '10',
      name: 'Bombillo LED H4',
      icon: 'fa-solid fa-cog',
      description: 'Bombillo LED para farolas delanteras, luz blanca 6000K',
      category: 'Eléctricos',
      brand: 'Philips',
      partNumber: 'PHI-LED-H4',
      price: 65000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.AMBOS,
      compatibleVehicles: ['Universal H4'],
      supplier: 'Iluminación Total',
      stock: 35,
      warranty: '12 meses',
      rating: 4.6,
      reviewCount: 52
    }),
    new Part({
      id: '11',
      name: 'Disco de Freno Delantero',
      icon: 'fa-solid fa-cog',
      description: 'Disco ventilado para mejor disipación de calor',
      category: 'Frenos',
      brand: 'Brembo',
      partNumber: 'BRE-09.7011.11',
      price: 120000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Renault Sandero', 'Chevrolet Sail'],
      supplier: 'Frenos Medellín',
      stock: 10,
      warranty: '18 meses',
      rating: 4.8,
      reviewCount: 21
    }),
    new Part({
      id: '12',
      name: 'Espejo Retrovisor Derecho',
      icon: 'fa-solid fa-cog',
      description: 'Espejo retrovisor eléctrico con desempañador',
      category: 'Carrocería',
      brand: 'Original',
      partNumber: 'ORIG-ESP-DR',
      price: 90000,
      condition: PartCondition.ORIGINAL,
      vehicleType: VehicleType.CARRO,
      compatibleVehicles: ['Hyundai Tucson 2016-2021'],
      supplier: 'Carrocerías y Partes',
      stock: 7,
      warranty: '6 meses',
      rating: 4.5,
      reviewCount: 9
    })
  ];

  create(createPartDto: CreatePartDto): Part {
    const part = new Part({
      id: Date.now().toString(),
      ...createPartDto,
    });
    
    this.parts.push(part);
    return part;
  }

  findAll(): Part[] {
    return this.parts.filter(part => part.isAvailable);
  }

  findOne(id: string): Part {
    const part = this.parts.find(p => p.id === id && p.isAvailable);
    if (!part) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }
    return part;
  }

  update(id: string, updatePartDto: UpdatePartDto): Part {
    const partIndex = this.parts.findIndex(p => p.id === id);
    if (partIndex === -1) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }

    this.parts[partIndex] = {
      ...this.parts[partIndex],
      ...updatePartDto,
      updatedAt: new Date(),
    };

    return this.parts[partIndex];
  }

  remove(id: string): void {
    const partIndex = this.parts.findIndex(p => p.id === id);
    if (partIndex === -1) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }

    // Soft delete
    this.parts[partIndex].isAvailable = false;
    this.parts[partIndex].updatedAt = new Date();
  }

  findByCategory(category: string): Part[] {
    return this.parts.filter(part => 
      part.isAvailable && 
      part.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  findByBrand(brand: string): Part[] {
    return this.parts.filter(part => 
      part.isAvailable && 
      part.brand.toLowerCase().includes(brand.toLowerCase())
    );
  }

  findByVehicleType(vehicleType: VehicleType): Part[] {
    return this.parts.filter(part => 
      part.isAvailable && 
      (part.vehicleType === vehicleType || part.vehicleType === VehicleType.AMBOS)
    );
  }

  findByPriceRange(minPrice: number, maxPrice: number): Part[] {
    return this.parts.filter(part => 
      part.isAvailable && 
      part.price >= minPrice && 
      part.price <= maxPrice
    );
  }

  search(query: string): Part[] {
    const searchTerm = query.toLowerCase();
    return this.parts.filter(part => 
      part.isAvailable && (
        part.name.toLowerCase().includes(searchTerm) ||
        part.description.toLowerCase().includes(searchTerm) ||
        part.brand.toLowerCase().includes(searchTerm) ||
        part.category.toLowerCase().includes(searchTerm) ||
        part.partNumber.toLowerCase().includes(searchTerm)
      )
    );
  }

  getCategories(): string[] {
    const categories = [...new Set(this.parts.map(part => part.category))];
    return categories.sort();
  }

  getBrands(): string[] {
    const brands = [...new Set(this.parts.map(part => part.brand))];
    return brands.sort();
  }
}
