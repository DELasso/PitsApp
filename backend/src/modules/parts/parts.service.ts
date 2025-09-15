import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { Part } from './entities/part.entity';
import { PartsFileService } from './parts-file.service';

@Injectable()
export class PartsService {
  constructor(private readonly partsFileService: PartsFileService) {}

  async create(createPartDto: CreatePartDto, ownerId: string): Promise<Part> {
    return this.partsFileService.create({
      ...createPartDto,
      ownerId,
    });
  }

  async findAll(): Promise<Part[]> {
    return this.partsFileService.findAll();
  }

  async findOne(id: string): Promise<Part> {
    const part = await this.partsFileService.findById(id);
    if (!part) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }
    return part;
  }

  async findByOwner(ownerId: string): Promise<Part[]> {
    return this.partsFileService.findByOwnerId(ownerId);
  }

  async update(id: string, updatePartDto: UpdatePartDto, userId: string): Promise<Part> {
    const part = await this.partsFileService.findById(id);
    
    if (!part) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }

    // Verificar que el usuario sea el propietario del repuesto
    if (part.ownerId !== userId) {
      throw new ForbiddenException('No tienes permisos para actualizar este repuesto');
    }

    const updatedPart = await this.partsFileService.update(id, updatePartDto);
    if (!updatedPart) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }

    return updatedPart;
  }

  async remove(id: string, userId: string): Promise<void> {
    const part = await this.partsFileService.findById(id);
    
    if (!part) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }

    // Verificar que el usuario sea el propietario del repuesto
    if (part.ownerId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este repuesto');
    }

    const deleted = await this.partsFileService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }
  }

  async findByCategory(category: string): Promise<Part[]> {
    return this.partsFileService.findByCategory(category);
  }

  async findByBrand(brand: string): Promise<Part[]> {
    return this.partsFileService.findByBrand(brand);
  }

  async search(query: string): Promise<Part[]> {
    return this.partsFileService.search(query);
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Part[]> {
    return this.partsFileService.findByPriceRange(minPrice, maxPrice);
  }

  async findInStock(): Promise<Part[]> {
    return this.partsFileService.findInStock();
  }
}
