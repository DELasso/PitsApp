import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, MinLength, IsDateString } from 'class-validator';
import { UserRole, BusinessType } from '../../users/entities/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
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

  // Campos específicos para proveedores
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

  // Campos específicos para clientes
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  vehicleInfo?: {
    brand: string;
    model: string;
    year: number;
    plate: string;
    type?: string;
  };
}