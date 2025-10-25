import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { Part } from './entities/part.entity';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class PartsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createPartDto: CreatePartDto, ownerId: string): Promise<Part> {
    const supabase = this.supabaseService.getClient();

    const partData = {
      owner_id: ownerId,
      name: createPartDto.name,
      description: createPartDto.description || null,
      category: createPartDto.category || null,
      brand: createPartDto.brand || null,
      part_number: createPartDto.partNumber || null,
      price: createPartDto.price,
      stock: createPartDto.stock || 0,
      condition: createPartDto.condition || 'new',
      vehicle_type: createPartDto.vehicleType || null,
      compatible_vehicles: createPartDto.compatibleVehicles ? 
        JSON.stringify(createPartDto.compatibleVehicles) : null,
      warranty: createPartDto.warranty || null,
      weight: createPartDto.weight || null,
      dimensions: createPartDto.dimensions || null,
      images: createPartDto.images || [],
      rating: 0,
      review_count: 0,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('parts')
      .insert(partData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating part: ${error.message}`);
    }

    return this.mapToPart(data);
  }

  async findAll(): Promise<Part[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching parts: ${error.message}`);
    }

    return data.map(p => this.mapToPart(p));
  }

  async findOne(id: string): Promise<Part> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }

    return this.mapToPart(data);
  }

  async findByOwner(ownerId: string): Promise<Part[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching parts by owner: ${error.message}`);
    }

    return data.map(p => this.mapToPart(p));
  }

  async update(id: string, updatePartDto: UpdatePartDto, userId: string): Promise<Part> {
    const supabase = this.supabaseService.getClient();

    // Verificar que el repuesto existe y pertenece al usuario
    const part = await this.findOne(id);
    
    if (part.ownerId !== userId) {
      throw new ForbiddenException('No tienes permisos para actualizar este repuesto');
    }

    const updateData: any = {};
    if (updatePartDto.name !== undefined) updateData.name = updatePartDto.name;
    if (updatePartDto.description !== undefined) updateData.description = updatePartDto.description;
    if (updatePartDto.category !== undefined) updateData.category = updatePartDto.category;
    if (updatePartDto.brand !== undefined) updateData.brand = updatePartDto.brand;
    if (updatePartDto.partNumber !== undefined) updateData.part_number = updatePartDto.partNumber;
    if (updatePartDto.price !== undefined) updateData.price = updatePartDto.price;
    if (updatePartDto.stock !== undefined) updateData.stock = updatePartDto.stock;
    if (updatePartDto.condition !== undefined) updateData.condition = updatePartDto.condition;
    if (updatePartDto.vehicleType !== undefined) updateData.vehicle_type = updatePartDto.vehicleType;
    if (updatePartDto.compatibleVehicles !== undefined) {
      updateData.compatible_vehicles = JSON.stringify(updatePartDto.compatibleVehicles);
    }
    if (updatePartDto.warranty !== undefined) updateData.warranty = updatePartDto.warranty;
    if (updatePartDto.weight !== undefined) updateData.weight = updatePartDto.weight;
    if (updatePartDto.dimensions !== undefined) updateData.dimensions = updatePartDto.dimensions;
    if (updatePartDto.images !== undefined) updateData.images = updatePartDto.images;
    if (updatePartDto.isAvailable !== undefined) updateData.is_active = updatePartDto.isAvailable;

    const { data, error } = await supabase
      .from('parts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating part: ${error.message}`);
    }

    return this.mapToPart(data);
  }

  async remove(id: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    // Verificar que el repuesto existe y pertenece al usuario
    const part = await this.findOne(id);
    
    if (part.ownerId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este repuesto');
    }

    const { error } = await supabase
      .from('parts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting part: ${error.message}`);
    }
  }

  async findByCategory(category: string): Promise<Part[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching parts by category: ${error.message}`);
    }

    return data.map(p => this.mapToPart(p));
  }

  async findByBrand(brand: string): Promise<Part[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('brand', brand)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching parts by brand: ${error.message}`);
    }

    return data.map(p => this.mapToPart(p));
  }

  async search(query: string): Promise<Part[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error searching parts: ${error.message}`);
    }

    return data.map(p => this.mapToPart(p));
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Part[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .gte('price', minPrice)
      .lte('price', maxPrice)
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      throw new Error(`Error fetching parts by price range: ${error.message}`);
    }

    return data.map(p => this.mapToPart(p));
  }

  async findInStock(): Promise<Part[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .gt('stock', 0)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching parts in stock: ${error.message}`);
    }

    return data.map(p => this.mapToPart(p));
  }

  // Mapear datos de Supabase (snake_case) a entidad Part (camelCase)
  private mapToPart(data: any): Part {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    
    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      description: data.description,
      category: data.category,
      brand: data.brand,
      partNumber: data.part_number,
      price: parseFloat(data.price),
      stock: data.stock,
      condition: data.condition,
      vehicleType: data.vehicle_type,
      compatibleVehicles: data.compatible_vehicles ? 
        JSON.parse(data.compatible_vehicles) : undefined,
      warranty: data.warranty,
      weight: data.weight ? parseFloat(data.weight) : undefined,
      dimensions: data.dimensions,
      images: (data.images || []).map((img: string) => 
        img.startsWith('http') ? img : `${backendUrl}${img}`
      ),
      rating: parseFloat(data.rating) || 0,
      reviewCount: data.review_count || 0,
      isAvailable: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
