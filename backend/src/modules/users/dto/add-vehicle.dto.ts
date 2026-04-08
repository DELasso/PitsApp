import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

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

export class AddVehicleDto {
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
