import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Workshop } from './entities/workshop.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WorkshopsFileService {
  private readonly filePath = join(process.cwd(), 'data', 'workshops.json');

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

  private readWorkshops(): Workshop[] {
    try {
      const data = readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private writeWorkshops(workshops: Workshop[]): void {
    writeFileSync(this.filePath, JSON.stringify(workshops, null, 2));
  }

  async create(workshopData: Partial<Workshop>): Promise<Workshop> {
    const workshops = this.readWorkshops();
    
    const newWorkshop = new Workshop({
      id: uuidv4(),
      ...workshopData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    workshops.push(newWorkshop);
    this.writeWorkshops(workshops);
    
    return newWorkshop;
  }

  async findAll(): Promise<Workshop[]> {
    return this.readWorkshops();
  }

  async findById(id: string): Promise<Workshop | null> {
    const workshops = this.readWorkshops();
    return workshops.find(workshop => workshop.id === id) || null;
  }

  async findByOwnerId(ownerId: string): Promise<Workshop[]> {
    const workshops = this.readWorkshops();
    return workshops.filter(workshop => workshop.ownerId === ownerId);
  }

  async update(id: string, updateData: Partial<Workshop>): Promise<Workshop | null> {
    const workshops = this.readWorkshops();
    const index = workshops.findIndex(workshop => workshop.id === id);
    
    if (index === -1) {
      return null;
    }

    workshops[index] = {
      ...workshops[index],
      ...updateData,
      id, // Asegurar que el ID no cambie
      updatedAt: new Date(),
    };

    this.writeWorkshops(workshops);
    return workshops[index];
  }

  async delete(id: string): Promise<boolean> {
    const workshops = this.readWorkshops();
    const index = workshops.findIndex(workshop => workshop.id === id);
    
    if (index === -1) {
      return false;
    }

    workshops.splice(index, 1);
    this.writeWorkshops(workshops);
    return true;
  }

  async findByCity(city: string): Promise<Workshop[]> {
    const workshops = this.readWorkshops();
    return workshops.filter(workshop => 
      workshop.city.toLowerCase().includes(city.toLowerCase())
    );
  }

  async search(query: string): Promise<Workshop[]> {
    const workshops = this.readWorkshops();
    const searchTerm = query.toLowerCase();
    
    return workshops.filter(workshop =>
      workshop.name.toLowerCase().includes(searchTerm) ||
      workshop.description.toLowerCase().includes(searchTerm) ||
      workshop.services.some(service => 
        service.toLowerCase().includes(searchTerm)
      ) ||
      workshop.specialties?.some(specialty => 
        specialty.toLowerCase().includes(searchTerm)
      )
    );
  }
}