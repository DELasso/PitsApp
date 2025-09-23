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
    const workshop = await this.findOne(workshopId);
    
    if (!workshop) {
      throw new Error('Taller no encontrado');
    }


    const newReview = new Review({
      ...createReviewDto,
      userId,  
    });

    
    workshop.reviews.push(newReview);

  
    
    await this.update(workshopId, workshop,userId); 

    return newReview;
  }   



  async getReviewsByWorkshop(workshopId: string): Promise<Review[]> {
    const workshop = await this.findOne(workshopId);
    return workshop ? workshop.reviews : [];
  }


  async getAverageRating(workshopId: string): Promise<number> {
    const reviews = await this.getReviewsByWorkshop(workshopId);
    if (reviews.length === 0) return 0;
    

    const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Number(average.toFixed(1));
  }

}
