import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(UserRole)
  role: UserRole;

  // Campos opcionales para proveedores
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  businessType?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  // Campos opcionales para clientes
  @IsOptional()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  vehicleInfo?: string;
}