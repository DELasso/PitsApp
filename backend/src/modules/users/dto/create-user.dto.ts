import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsDate } from 'class-validator';
import { UserRole, BusinessType } from '../entities/user.entity';

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
  @IsEnum(BusinessType)
  businessType?: BusinessType;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Campos opcionales para clientes
  @IsOptional()
  @IsDate()
  dateOfBirth?: Date;

  @IsOptional()
  vehicleInfo?: {
    brand: string;
    model: string;
    year: number;
    plate: string;
    type?: string;
  };
}