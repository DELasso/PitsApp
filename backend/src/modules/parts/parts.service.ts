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
