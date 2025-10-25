import { Injectable } from '@nestjs/common';
import { User, UserRole } from './entities/user.entity';
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
      vehicle_info: createUserDto.vehicleInfo ? JSON.stringify(createUserDto.vehicleInfo) : null,
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

  // Mapear datos de Supabase (snake_case) a entidad User (camelCase)
  private mapToUser(data: any): User {
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
      vehicleInfo: data.vehicle_info ? JSON.parse(data.vehicle_info) : undefined,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}