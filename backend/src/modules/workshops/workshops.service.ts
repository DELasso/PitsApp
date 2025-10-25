import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { Workshop } from './entities/workshop.entity';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class WorkshopsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createWorkshopDto: CreateWorkshopDto, ownerId: string): Promise<Workshop> {
    const supabase = this.supabaseService.getClient();

    const workshopData = {
      owner_id: ownerId,
      name: createWorkshopDto.name,
      description: createWorkshopDto.description || null,
      address: createWorkshopDto.address,
      city: createWorkshopDto.city,
      neighborhood: createWorkshopDto.neighborhood || null,
      phone: createWorkshopDto.phone || null,
      email: createWorkshopDto.email || null,
      website: createWorkshopDto.website || null,
      latitude: createWorkshopDto.latitude || null,
      longitude: createWorkshopDto.longitude || null,
      services: createWorkshopDto.services || [],
      specialties: createWorkshopDto.specialties || [],
      working_hours: createWorkshopDto.workingHours || null,
      images: createWorkshopDto.images || [],
      rating: 0,
      review_count: 0,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('workshops')
      .insert(workshopData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating workshop: ${error.message}`);
    }

    return this.mapToWorkshop(data);
  }

  async findAll(): Promise<Workshop[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching workshops: ${error.message}`);
    }

    return data.map(w => this.mapToWorkshop(w));
  }

  async findOne(id: string): Promise<Workshop> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Taller con ID ${id} no encontrado`);
    }

    return this.mapToWorkshop(data);
  }

  async findByOwner(ownerId: string): Promise<Workshop[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching workshops by owner: ${error.message}`);
    }

    return data.map(w => this.mapToWorkshop(w));
  }

  async update(id: string, updateWorkshopDto: UpdateWorkshopDto, userId: string): Promise<Workshop> {
    const supabase = this.supabaseService.getClient();

    // Verificar que el taller existe y pertenece al usuario
    const workshop = await this.findOne(id);
    
    if (workshop.ownerId !== userId) {
      throw new ForbiddenException('No tienes permisos para actualizar este taller');
    }

    const updateData: any = {};
    if (updateWorkshopDto.name !== undefined) updateData.name = updateWorkshopDto.name;
    if (updateWorkshopDto.description !== undefined) updateData.description = updateWorkshopDto.description;
    if (updateWorkshopDto.address !== undefined) updateData.address = updateWorkshopDto.address;
    if (updateWorkshopDto.city !== undefined) updateData.city = updateWorkshopDto.city;
    if (updateWorkshopDto.neighborhood !== undefined) updateData.neighborhood = updateWorkshopDto.neighborhood;
    if (updateWorkshopDto.phone !== undefined) updateData.phone = updateWorkshopDto.phone;
    if (updateWorkshopDto.email !== undefined) updateData.email = updateWorkshopDto.email;
    if (updateWorkshopDto.website !== undefined) updateData.website = updateWorkshopDto.website;
    if (updateWorkshopDto.latitude !== undefined) updateData.latitude = updateWorkshopDto.latitude;
    if (updateWorkshopDto.longitude !== undefined) updateData.longitude = updateWorkshopDto.longitude;
    if (updateWorkshopDto.services !== undefined) updateData.services = updateWorkshopDto.services;
    if (updateWorkshopDto.specialties !== undefined) updateData.specialties = updateWorkshopDto.specialties;
    if (updateWorkshopDto.workingHours !== undefined) updateData.working_hours = updateWorkshopDto.workingHours;
    if (updateWorkshopDto.images !== undefined) updateData.images = updateWorkshopDto.images;
    if (updateWorkshopDto.rating !== undefined) updateData.rating = updateWorkshopDto.rating;
    if (updateWorkshopDto.reviewCount !== undefined) updateData.review_count = updateWorkshopDto.reviewCount;

    const { data, error } = await supabase
      .from('workshops')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating workshop: ${error.message}`);
    }

    return this.mapToWorkshop(data);
  }

  async remove(id: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    // Verificar que el taller existe y pertenece al usuario
    const workshop = await this.findOne(id);
    
    if (workshop.ownerId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este taller');
    }

    const { error } = await supabase
      .from('workshops')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting workshop: ${error.message}`);
    }
  }

  async findByCity(city: string): Promise<Workshop[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('city', city)
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) {
      throw new Error(`Error fetching workshops by city: ${error.message}`);
    }

    return data.map(w => this.mapToWorkshop(w));
  }

  async search(query: string): Promise<Workshop[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .or(`name.ilike.%${query}%,city.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) {
      throw new Error(`Error searching workshops: ${error.message}`);
    }

    return data.map(w => this.mapToWorkshop(w));
  }

  async updateRating(id: string, averageRating: number, reviewCount: number): Promise<Workshop> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('workshops')
      .update({
        rating: averageRating,
        review_count: reviewCount
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Taller con ID ${id} no encontrado`);
    }

    return this.mapToWorkshop(data);
  }

  // Mapear datos de Supabase (snake_case) a entidad Workshop (camelCase)
  private mapToWorkshop(data: any): Workshop {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    
    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      description: data.description,
      address: data.address,
      city: data.city,
      neighborhood: data.neighborhood,
      phone: data.phone,
      email: data.email,
      website: data.website,
      latitude: data.latitude ? parseFloat(data.latitude) : 0,
      longitude: data.longitude ? parseFloat(data.longitude) : 0,
      services: data.services || [],
      specialties: data.specialties || [],
      workingHours: data.working_hours,
      rating: parseFloat(data.rating) || 0,
      reviewCount: data.review_count || 0,
      images: (data.images || []).map((img: string) => 
        img.startsWith('http') ? img : `${backendUrl}${img}`
      ),
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
