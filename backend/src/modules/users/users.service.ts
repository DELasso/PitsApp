import { Injectable } from '@nestjs/common';
import { User, UserRole, VehicleInfo } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { SupabaseService } from '../../common/supabase/supabase.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const supabase = this.supabaseService.getClient();

    // Verificar si el email ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', createUserDto.email)
      .single();

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const userData = {
      email: createUserDto.email,
      password: hashedPassword,
      first_name: createUserDto.firstName,
      last_name: createUserDto.lastName,
      phone: createUserDto.phone || null,
      role: createUserDto.role,
      company_name: createUserDto.companyName || null,
      business_type: createUserDto.businessType || null,
      address: createUserDto.address || null,
      city: createUserDto.city || null,
      description: createUserDto.description || null,
      vehicle_info: createUserDto.vehicleInfo ? JSON.stringify([createUserDto.vehicleInfo]) : null,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }

    return this.mapToUser(data);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return undefined;
    }

    return this.mapToUser(data);
  }

  async findById(id: string): Promise<User | undefined> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return undefined;
    }

    return this.mapToUser(data);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async findAll(): Promise<User[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }

    return data.map(user => {
      const mapped = this.mapToUser(user);
      const { password, ...userWithoutPassword } = mapped;
      return userWithoutPassword as User;
    });
  }

  // Método para obtener user sin password
  async findByIdSafe(id: string): Promise<Omit<User, 'password'> | undefined> {
    const user = await this.findById(id);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return undefined;
  }

  async getUserVehicles(userId: string): Promise<VehicleInfo[]> {
    const user = await this.findById(userId);
    return user?.vehicleInfos || [];
  }

  async addUserVehicle(userId: string, vehicle: VehicleInfo): Promise<VehicleInfo[]> {
    const supabase = this.supabaseService.getClient();
    const user = await this.findById(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const vehicles = user.vehicleInfos || [];
    const normalizedPlate = vehicle.plate.trim().toUpperCase();
    const existsByPlate = vehicles.some(v => v.plate.trim().toUpperCase() === normalizedPlate);

    if (existsByPlate) {
      throw new Error('Ya existe un vehiculo registrado con esa placa');
    }

    const updatedVehicles = [
      ...vehicles,
      {
        ...vehicle,
        plate: normalizedPlate,
      },
    ];

    const { error } = await supabase
      .from('users')
      .update({ vehicle_info: JSON.stringify(updatedVehicles) })
      .eq('id', userId);

    if (error) {
      throw new Error(`Error actualizando vehiculos: ${error.message}`);
    }

    return updatedVehicles;
  }

  private normalizeVehicleInfo(rawVehicleInfo: unknown): VehicleInfo[] {
    if (!rawVehicleInfo) {
      return [];
    }

    let parsed = rawVehicleInfo;

    if (typeof rawVehicleInfo === 'string') {
      try {
        parsed = JSON.parse(rawVehicleInfo);
      } catch {
        return [];
      }
    }

    const rawList = Array.isArray(parsed) ? parsed : [parsed];

    return rawList
      .filter(Boolean)
      .map((item: any) => ({
        brand: String(item.brand || '').trim(),
        model: String(item.model || '').trim(),
        year: Number(item.year || 0),
        plate: String(item.plate || '').trim().toUpperCase(),
        type: item.type ? String(item.type) : undefined,
      }))
      .filter(item => item.brand && item.model && item.year > 0 && item.plate);
  }

  // Mapear datos de Supabase (snake_case) a entidad User (camelCase)
  private mapToUser(data: any): User {
    const vehicleInfos = this.normalizeVehicleInfo(data.vehicle_info);

    return {
      id: data.id,
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      role: data.role as UserRole,
      companyName: data.company_name,
      businessType: data.business_type,
      address: data.address,
      city: data.city,
      description: data.description,
      vehicleInfo: vehicleInfos.length > 0 ? vehicleInfos[0] : undefined,
      vehicleInfos,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}