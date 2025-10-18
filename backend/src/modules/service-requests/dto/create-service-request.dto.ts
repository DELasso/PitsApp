import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ServiceType,
  VehicleType,
  UrgencyLevel,
  HomeServiceDetails,
  TowTruckDetails,
  OilChangeDetails,
  DiagnosisDetails,
  RepairDetails
} from '../entities/service-request.entity';

class HomeServiceDetailsDto implements HomeServiceDetails {
  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsEnum(['house', 'apartment', 'building'])
  unitType?: 'house' | 'apartment' | 'building';

  @IsOptional()
  @IsString()
  unitNumber?: string;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsString()
  additionalDirections?: string;

  @IsBoolean()
  hasParking: boolean;
}

class TowTruckDetailsDto implements TowTruckDetails {
  @IsString()
  pickupAddress: string;

  @IsString()
  pickupCity: string;

  @IsString()
  deliveryAddress: string;

  @IsString()
  deliveryCity: string;

  @IsOptional()
  @IsNumber()
  estimatedDistance?: number;

  @IsEnum(['running', 'not_running', 'accident'])
  vehicleCondition: 'running' | 'not_running' | 'accident';

  @IsBoolean()
  needsFlatbed: boolean;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}

class OilChangeDetailsDto implements OilChangeDetails {
  @IsNumber()
  currentMileage: number;

  @IsOptional()
  @IsNumber()
  lastOilChange?: number;

  @IsOptional()
  @IsString()
  preferredOilBrand?: string;

  @IsOptional()
  @IsEnum(['synthetic', 'semi-synthetic', 'conventional'])
  oilType?: 'synthetic' | 'semi-synthetic' | 'conventional';

  @IsBoolean()
  includeFilter: boolean;

  @IsOptional()
  @IsString({ each: true })
  additionalServices?: string[];
}

class DiagnosisDetailsDto implements DiagnosisDetails {
  @IsString()
  symptoms: string;

  @IsOptional()
  @IsString()
  whenStarted?: string;

  @IsOptional()
  @IsString({ each: true })
  warningLights?: string[];

  @IsOptional()
  @IsString()
  recentRepairs?: string;

  @IsBoolean()
  needsScanner: boolean;
}

class RepairDetailsDto implements RepairDetails {
  @IsString()
  problemDescription: string;

  @IsOptional()
  @IsString({ each: true })
  affectedParts?: string[];

  @IsOptional()
  @IsString()
  previousDiagnosis?: string;

  @IsOptional()
  @IsBoolean()
  hasWarranty?: boolean;

  @IsOptional()
  @IsEnum(['original', 'aftermarket', 'used'])
  preferredParts?: 'original' | 'aftermarket' | 'used';
}

export class CreateServiceRequestDto {
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsOptional()
  @IsString()
  vehicleBrand?: string;

  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @IsOptional()
  @IsNumber()
  vehicleYear?: number;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  // Detalles específicos según tipo de servicio
  @IsOptional()
  @ValidateNested()
  @Type(() => HomeServiceDetailsDto)
  homeServiceDetails?: HomeServiceDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TowTruckDetailsDto)
  towTruckDetails?: TowTruckDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OilChangeDetailsDto)
  oilChangeDetails?: OilChangeDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DiagnosisDetailsDto)
  diagnosisDetails?: DiagnosisDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RepairDetailsDto)
  repairDetails?: RepairDetailsDto;

  // Presupuesto
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @IsOptional()
  @IsString()
  preferredDate?: string;

  @IsOptional()
  @IsEnum(['morning', 'afternoon', 'evening', 'flexible'])
  preferredTimeSlot?: 'morning' | 'afternoon' | 'evening' | 'flexible';

  @IsEnum(UrgencyLevel)
  urgencyLevel: UrgencyLevel;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
