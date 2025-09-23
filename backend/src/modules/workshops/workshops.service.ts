import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';
import { Workshop } from './entities/workshop.entity';
import { WorkshopsFileService } from './workshops-file.service';

@Injectable()
export class WorkshopsService {
  constructor(private readonly workshopsFileService: WorkshopsFileService) {}

  async create(createWorkshopDto: CreateWorkshopDto, ownerId: string): Promise<Workshop> {
    return this.workshopsFileService.create({
      ...createWorkshopDto,
      ownerId,
    });
  }

  async findAll(): Promise<Workshop[]> {
    return this.workshopsFileService.findAll();
  }

  async findOne(id: string): Promise<Workshop> {
    const workshop = await this.workshopsFileService.findById(id);
    if (!workshop) {
      throw new NotFoundException(`Taller con ID ${id} no encontrado`);
    }
    return workshop;
  }

  async findByOwner(ownerId: string): Promise<Workshop[]> {
    return this.workshopsFileService.findByOwnerId(ownerId);
  }

  async update(id: string, updateWorkshopDto: UpdateWorkshopDto, userId: string): Promise<Workshop> {
    const workshop = await this.workshopsFileService.findById(id);
    
    if (!workshop) {
      throw new NotFoundException(`Taller con ID ${id} no encontrado`);
    }

    // Verificar que el usuario sea el propietario del taller
    if (workshop.ownerId !== userId) {
      throw new ForbiddenException('No tienes permisos para actualizar este taller');
    }

    const updatedWorkshop = await this.workshopsFileService.update(id, updateWorkshopDto);
    if (!updatedWorkshop) {
      throw new NotFoundException(`Taller con ID ${id} no encontrado`);
    }

    return updatedWorkshop;
  }

  async remove(id: string, userId: string): Promise<void> {
    const workshop = await this.workshopsFileService.findById(id);
    
    if (!workshop) {
      throw new NotFoundException(`Taller con ID ${id} no encontrado`);
    }

    // Verificar que el usuario sea el propietario del taller
    if (workshop.ownerId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este taller');
    }

    const deleted = await this.workshopsFileService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Taller con ID ${id} no encontrado`);
    }
  }

  async findByCity(city: string): Promise<Workshop[]> {
    return this.workshopsFileService.findByCity(city);
  }

  async search(query: string): Promise<Workshop[]> {
    return this.workshopsFileService.search(query);
  }

  async createReview(workshopId: string, createReviewDto: CreateReviewDto, userId: string): Promise<Review> {
    // Espera a que se resuelva la promesa del findOne
    const workshop = await this.findOne(workshopId);
    
    if (!workshop) {
      throw new Error('Taller no encontrado');
    }


    const newReview = new Review({
      ...createReviewDto,
      userId,  // Asegúrate de usar el userId del JWT
    });

    // Agrega la reseña al taller
    workshop.reviews.push(newReview);

  
    // ✅ AJUSTA ESTOS PARÁMETROS según tu método update existente
    await this.update(workshopId, workshop,userId); 

    return newReview;
  }   


// ✅ VERSIÓN CORREGIDA - Maneja async correctamente
  async getReviewsByWorkshop(workshopId: string): Promise<Review[]> {
    const workshop = await this.findOne(workshopId);
    return workshop ? workshop.reviews : [];
  }

// ✅ VERSIÓN CORREGIDA - Maneja async y tipado
  async getAverageRating(workshopId: string): Promise<number> {
    const reviews = await this.getReviewsByWorkshop(workshopId);
    if (reviews.length === 0) return 0;
    
    // Ahora sí puedes usar reduce porque 'reviews' es Review[], no Promise
    const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Number(average.toFixed(1)); // Redondea a 1 decimal
  }

}
