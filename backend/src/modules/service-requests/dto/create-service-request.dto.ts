import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";
import {
  ServiceType,
  VehicleType,
  UrgencyLevel,
  HomeServiceDetails,
  TowTruckDetails,
  OilChangeDetails,
  DiagnosisDetails,
  RepairDetails,
} from "../entities/service-request.entity";

class HomeServiceDetailsDto implements HomeServiceDetails {
  @IsString({ message: "La dirección debe ser un texto" })
  @IsNotEmpty({ message: "La dirección es obligatoria" })
  @MinLength(5, { message: "La dirección debe tener al menos 5 caracteres" })
  @MaxLength(150, { message: "La dirección no puede exceder 150 caracteres" })
  address: string;

  @IsString({ message: "La ciudad debe ser un texto" })
  @IsNotEmpty({ message: "La ciudad es obligatoria" })
  @MinLength(2, { message: "La ciudad debe tener al menos 2 caracteres" })
  city: string;

  @IsOptional()
  @IsString({ message: "El barrio debe ser un texto" })
  @MaxLength(50, { message: "El barrio no puede exceder 50 caracteres" })
  neighborhood?: string;

  @IsOptional()
  @IsEnum(["house", "apartment", "building"], {
    message: "El tipo de unidad debe ser casa, apartamento o edificio",
  })
  unitType?: "house" | "apartment" | "building";

  @IsOptional()
  @IsString({ message: "El número de unidad debe ser un texto" })
  @MaxLength(20, {
    message: "El número de unidad no puede exceder 20 caracteres",
  })
  unitNumber?: string;

  @IsOptional()
  @IsString({ message: "El piso debe ser un texto" })
  @MaxLength(20, { message: "El piso no puede exceder 20 caracteres" })
  floor?: string;

  @IsOptional()
  @IsString({ message: "Las indicaciones adicionales deben ser un texto" })
  @MaxLength(300, {
    message: "Las indicaciones adicionales no pueden exceder 300 caracteres",
  })
  additionalDirections?: string;

  @IsBoolean({ message: "hasParking debe ser un valor booleano" })
  hasParking: boolean;
}

class TowTruckDetailsDto implements TowTruckDetails {
  @IsString({ message: "La dirección de recogida debe ser un texto" })
  @IsNotEmpty({ message: "La dirección de recogida es obligatoria" })
  @MinLength(5, {
    message: "La dirección de recogida debe tener al menos 5 caracteres",
  })
  pickupAddress: string;

  @IsString({ message: "La ciudad de recogida debe ser un texto" })
  @IsNotEmpty({ message: "La ciudad de recogida es obligatoria" })
  @MinLength(2, {
    message: "La ciudad de recogida debe tener al menos 2 caracteres",
  })
  pickupCity: string;

  @IsString({ message: "La dirección de entrega debe ser un texto" })
  @IsNotEmpty({ message: "La dirección de entrega es obligatoria" })
  @MinLength(5, {
    message: "La dirección de entrega debe tener al menos 5 caracteres",
  })
  deliveryAddress: string;

  @IsString({ message: "La ciudad de entrega debe ser un texto" })
  @IsNotEmpty({ message: "La ciudad de entrega es obligatoria" })
  @MinLength(2, {
    message: "La ciudad de entrega debe tener al menos 2 caracteres",
  })
  deliveryCity: string;

  @IsOptional()
  @IsNumber({}, { message: "La distancia estimada debe ser un número" })
  @Min(0, { message: "La distancia estimada debe ser mayor a 0" })
  estimatedDistance?: number;

  @IsEnum(["running", "not_running", "accident"], {
    message: "La condición del vehículo debe ser válida",
  })
  vehicleCondition: "running" | "not_running" | "accident";

  @IsBoolean({ message: "needsFlatbed debe ser un valor booleano" })
  needsFlatbed: boolean;

  @IsOptional()
  @IsString({ message: "La información adicional debe ser un texto" })
  @MaxLength(500, {
    message: "La información adicional no puede exceder 500 caracteres",
  })
  additionalInfo?: string;
}

class OilChangeDetailsDto implements OilChangeDetails {
  @IsNumber({}, { message: "El kilometraje actual debe ser un número" })
  @Min(0, { message: "El kilometraje debe ser mayor o igual a 0" })
  @Max(1000000, { message: "El kilometraje no puede exceder 1,000,000 km" })
  currentMileage: number;

  @IsOptional()
  @IsNumber({}, { message: "El último cambio de aceite debe ser un número" })
  @Min(0, { message: "El último cambio debe ser mayor o igual a 0" })
  lastOilChange?: number;

  @IsOptional()
  @IsString({ message: "La marca de aceite debe ser un texto" })
  @MaxLength(50, {
    message: "La marca de aceite no puede exceder 50 caracteres",
  })
  preferredOilBrand?: string;

  @IsOptional()
  @IsEnum(["synthetic", "semi-synthetic", "conventional"], {
    message: "El tipo de aceite debe ser válido",
  })
  oilType?: "synthetic" | "semi-synthetic" | "conventional";

  @IsBoolean({ message: "includeFilter debe ser un valor booleano" })
  includeFilter: boolean;

  @IsOptional()
  @IsString({
    each: true,
    message: "Cada servicio adicional debe ser un texto",
  })
  additionalServices?: string[];
}

class DiagnosisDetailsDto implements DiagnosisDetails {
  @IsString({ message: "Los síntomas deben ser un texto" })
  @IsNotEmpty({ message: "La descripción de síntomas es obligatoria" })
  @MinLength(20, { message: "Los síntomas deben tener al menos 20 caracteres" })
  @MaxLength(500, { message: "Los síntomas no pueden exceder 500 caracteres" })
  symptoms: string;

  @IsOptional()
  @IsString({ message: "La información de cuándo comenzó debe ser un texto" })
  @MaxLength(100, {
    message: "Esta información no puede exceder 100 caracteres",
  })
  whenStarted?: string;

  @IsOptional()
  @IsString({
    each: true,
    message: "Cada luz de advertencia debe ser un texto",
  })
  warningLights?: string[];

  @IsOptional()
  @IsString({ message: "Las reparaciones recientes deben ser un texto" })
  @MaxLength(300, {
    message: "Las reparaciones recientes no pueden exceder 300 caracteres",
  })
  recentRepairs?: string;

  @IsBoolean({ message: "needsScanner debe ser un valor booleano" })
  needsScanner: boolean;
}

class RepairDetailsDto implements RepairDetails {
  @IsOptional()
  @IsString({ message: "El diagnóstico previo debe ser un texto" })
  @MaxLength(300, {
    message: "El diagnóstico previo no puede exceder 300 caracteres",
  })
  previousDiagnosis?: string;

  @IsOptional()
  @IsBoolean({ message: "hasWarranty debe ser un valor booleano" })
  hasWarranty?: boolean;

  @IsOptional()
  @IsEnum(["original", "aftermarket", "used"], {
    message: "El tipo de repuesto preferido debe ser válido",
  })
  preferredParts?: "original" | "aftermarket" | "used";
}

export class CreateServiceRequestDto {
  @IsEnum(ServiceType, { message: "El tipo de servicio es inválido" })
  serviceType: ServiceType;

  @IsEnum(VehicleType, { message: "El tipo de vehículo es inválido" })
  vehicleType: VehicleType;

  @IsOptional()
  @IsString({ message: "La marca del vehículo debe ser un texto" })
  @MaxLength(50, { message: "La marca no puede exceder 50 caracteres" })
  vehicleBrand?: string;

  @IsOptional()
  @IsString({ message: "El modelo del vehículo debe ser un texto" })
  @MaxLength(50, { message: "El modelo no puede exceder 50 caracteres" })
  vehicleModel?: string;

  @IsOptional()
  @IsNumber({}, { message: "El año debe ser un número" })
  @Min(1900, { message: "El año debe ser mayor a 1900" })
  @Max(2026, { message: "El año no puede ser mayor a 2026" })
  vehicleYear?: number;

  @IsOptional()
  @IsString({ message: "La placa debe ser un texto" })
  @MaxLength(20, { message: "La placa no puede exceder 20 caracteres" })
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
  @IsNumber({}, { message: "El presupuesto mínimo debe ser un número" })
  @Min(0, { message: "El presupuesto mínimo debe ser mayor o igual a 0" })
  budgetMin?: number;

  @IsOptional()
  @IsNumber({}, { message: "El presupuesto máximo debe ser un número" })
  @Min(0, { message: "El presupuesto máximo debe ser mayor o igual a 0" })
  budgetMax?: number;

  @IsOptional()
  @IsString({ message: "La fecha preferida debe ser un texto" })
  preferredDate?: string;

  @IsOptional()
  @IsEnum(["morning", "afternoon", "evening", "flexible"])
  preferredTimeSlot?: "morning" | "afternoon" | "evening" | "flexible";

  @IsEnum(UrgencyLevel)
  urgencyLevel: UrgencyLevel;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
