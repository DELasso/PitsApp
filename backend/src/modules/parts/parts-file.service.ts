import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Part } from './entities/part.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PartsFileService {
  private readonly filePath = join(process.cwd(), 'data', 'parts.json');

  constructor() {
    this.ensureDataDirectoryExists();
  }

  private ensureDataDirectoryExists(): void {
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    
    if (!existsSync(this.filePath)) {
      writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  private readParts(): Part[] {
    try {
      const data = readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private writeParts(parts: Part[]): void {
    writeFileSync(this.filePath, JSON.stringify(parts, null, 2));
  }

  async create(partData: Partial<Part>): Promise<Part> {
    const parts = this.readParts();
    
    const newPart = new Part({
      id: uuidv4(),
      ...partData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    parts.push(newPart);
    this.writeParts(parts);
    
    return newPart;
  }

  async findAll(): Promise<Part[]> {
    return this.readParts();
  }

  async findById(id: string): Promise<Part | null> {
    const parts = this.readParts();
    return parts.find(part => part.id === id) || null;
  }

  async findByOwnerId(ownerId: string): Promise<Part[]> {
    const parts = this.readParts();
    return parts.filter(part => part.ownerId === ownerId);
  }

  async update(id: string, updateData: Partial<Part>): Promise<Part | null> {
    const parts = this.readParts();
    const index = parts.findIndex(part => part.id === id);
    
    if (index === -1) {
      return null;
    }

    parts[index] = {
      ...parts[index],
      ...updateData,
      id, // Asegurar que el ID no cambie
      updatedAt: new Date(),
    };

    this.writeParts(parts);
    return parts[index];
  }

  async delete(id: string): Promise<boolean> {
    const parts = this.readParts();
    const index = parts.findIndex(part => part.id === id);
    
    if (index === -1) {
      return false;
    }

    parts.splice(index, 1);
    this.writeParts(parts);
    return true;
  }

  async findByCategory(category: string): Promise<Part[]> {
    const parts = this.readParts();
    return parts.filter(part => 
      part.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  async findByBrand(brand: string): Promise<Part[]> {
    const parts = this.readParts();
    return parts.filter(part => 
      part.brand.toLowerCase().includes(brand.toLowerCase())
    );
  }

  async search(query: string): Promise<Part[]> {
    const parts = this.readParts();
    const searchTerm = query.toLowerCase();
    
    return parts.filter(part =>
      part.name.toLowerCase().includes(searchTerm) ||
      part.description.toLowerCase().includes(searchTerm) ||
      part.brand.toLowerCase().includes(searchTerm) ||
      part.category.toLowerCase().includes(searchTerm) ||
      part.partNumber.toLowerCase().includes(searchTerm) ||
      part.compatibleVehicles.some(vehicle => 
        vehicle.toLowerCase().includes(searchTerm)
      )
    );
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Part[]> {
    const parts = this.readParts();
    return parts.filter(part => 
      part.price >= minPrice && part.price <= maxPrice
    );
  }

  async findInStock(): Promise<Part[]> {
    const parts = this.readParts();
    return parts.filter(part => part.stock > 0 && part.isAvailable);
  }
}