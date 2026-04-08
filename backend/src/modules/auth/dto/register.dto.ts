import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  IsDateString,
  IsIn,
  IsInt,
  Min,
  Max,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, BusinessType } from '../../users/entities/user.entity';

const ALLOWED_VEHICLE_BRANDS = [
  'Chevrolet',
  'Renault',
  'Mazda',
  'Toyota',
  'Nissan',
  'Kia',
  'Hyundai',
  'Suzuki',
  'Honda',
  'Yamaha',
  'Bajaj',
  'AKT',
] as const;

export class VehicleInfoDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_VEHICLE_BRANDS)
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsInt()
  @Min(1944)
  @Max(2030)
  year: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:[A-Z]{3}\d{3}|[A-Z]{3}\d{2}[A-Z])$/)
  plate: string;

  @IsOptional()
  @IsString()
  @IsIn(['car', 'suv', 'truck', 'motorcycle', 'van'])
  type?: string;
}

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
  @ValidateNested()
  @Type(() => VehicleInfoDto)
  vehicleInfo?: VehicleInfoDto;
}