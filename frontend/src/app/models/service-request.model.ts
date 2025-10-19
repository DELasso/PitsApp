export enum ServiceType {
  HOME_SERVICE = 'home_service',
  TOW_TRUCK = 'tow_truck',
  EXPRESS_OIL_CHANGE = 'express_oil_change',
  MECHANICAL_DIAGNOSIS = 'mechanical_diagnosis',
  SPECIFIC_REPAIR = 'specific_repair',
  EMERGENCY_SERVICE = 'emergency_service',
  TIRE_CHANGE = 'tire_change',
  BATTERY_SERVICE = 'battery_service',
  OTHER = 'other'
}

export enum VehicleType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  SUV = 'suv',
  TRUCK = 'truck',
  VAN = 'van'
}

export enum ServiceStatus {
  PENDING = 'pending',
  RECEIVING_BIDS = 'receiving_bids',
  BID_ACCEPTED = 'bid_accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EMERGENCY = 'emergency'
}

export interface HomeServiceDetails {
  address: string;
  city: string;
  neighborhood?: string;
  unitType?: 'house' | 'apartment' | 'building';
  unitNumber?: string;
  floor?: string;
  additionalDirections?: string;
  hasParking: boolean;
}

export interface TowTruckDetails {
  pickupAddress: string;
  pickupCity: string;
  deliveryAddress: string;
  deliveryCity: string;
  estimatedDistance?: number;
  vehicleCondition: 'running' | 'not_running' | 'accident';
  needsFlatbed: boolean;
  additionalInfo?: string;
}

export interface OilChangeDetails {
  currentMileage: number;
  lastOilChange?: number;
  preferredOilBrand?: string;
  oilType?: 'synthetic' | 'semi-synthetic' | 'conventional';
  includeFilter: boolean;
  additionalServices?: string[];
}

export interface DiagnosisDetails {
  symptoms: string;
  whenStarted?: string;
  warningLights?: string[];
  recentRepairs?: string;
  needsScanner: boolean;
}

export interface RepairDetails {
  problemDescription: string;
  affectedParts?: string[];
  previousDiagnosis?: string;
  hasWarranty?: boolean;
  preferredParts?: 'original' | 'aftermarket' | 'used';
}

export interface VehicleInfo {
  brand: string;
  model: string;
  year: number;
  plate: string;
  type?: string;
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  serviceType: string;
  vehicleType?: VehicleType;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehiclePlate?: string;
  vehicleInfo?: VehicleInfo;
  
  homeServiceDetails?: HomeServiceDetails;
  towTruckDetails?: TowTruckDetails;
  oilChangeDetails?: OilChangeDetails;
  diagnosisDetails?: DiagnosisDetails;
  repairDetails?: RepairDetails;
  
  location?: string;
  budgetEstimate?: number;
  budgetMin?: number;
  budgetMax?: number;
  estimatedBudget?: number; // Agregado para compatibilidad
  preferredDate?: string;
  preferredTimeSlot?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  urgency?: string;
  urgencyLevel?: UrgencyLevel;
  
  status: ServiceStatus | string;
  description: string;
  additionalNotes?: string;
  
  bidsCount: number;
  acceptedBidId?: string;
  
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}
