import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, Min, Max, IsEnum, IsBoolean } from 'class-validator';

export enum PartCondition {
  ORIGINAL = 'original',
  GENERICO = 'generico',
  REMANUFACTURADO = 'remanufacturado',
  USADO = 'usado'
}

export enum VehicleType {
  CARRO = 'carro',
  MOTO = 'moto',
  AMBOS = 'ambos'
}

export class CreatePartDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  partNumber: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(PartCondition)
  condition: PartCondition;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsArray()
  @IsString({ each: true })
  compatibleVehicles: string[];

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  warranty?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reviewCount?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
