import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      const { password, ...userWithoutPassword } = user;
      
      const payload = { email: user.email, sub: user.id, role: user.role };
      const access_token = this.jwtService.sign(payload);
      
      return {
        access_token,
        user: userWithoutPassword,
        message: 'Usuario registrado exitosamente'
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password, 
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const { password, ...userWithoutPassword } = user;
    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    
    return {
      access_token,
      user: userWithoutPassword,
      message: 'Login exitoso'
    };
  }

  async validateUser(payload: any): Promise<any> {
    const user = await this.usersService.findByIdSafe(payload.sub);
    if (user && user.isActive) {
      return user;
    }
    return null;
  }
}