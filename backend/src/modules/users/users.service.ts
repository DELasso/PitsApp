import { Injectable } from '@nestjs/common';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private users: User[] = []; // En memoria por ahora, después será BD
  private currentId = 1;

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = this.users.find(user => user.email === createUserDto.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser: User = {
      id: this.currentId.toString(),
      ...createUserDto,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.currentId++;
    this.users.push(newUser);
    
    return newUser;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async findAll(): Promise<User[]> {
    return this.users.map(user => {
      const { password, ...userWithoutPassword } = user;
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
}