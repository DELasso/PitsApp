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
  PENDING = 'pending',           // Recién creada, esperando ofertas
  RECEIVING_BIDS = 'receiving_bids', // Recibiendo ofertas
  BID_ACCEPTED = 'bid_accepted',    // Oferta aceptada
  IN_PROGRESS = 'in_progress',    // Servicio en progreso
  COMPLETED = 'completed',        // Servicio completado
  CANCELLED = 'cancelled'         // Cancelada
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EMERGENCY = 'emergency'
}

// Detalles específicos para servicio a domicilio
export interface HomeServiceDetails {
  address: string;
  city: string;
  neighborhood?: string;
  unitType?: 'house' | 'apartment' | 'building'; // casa, apartamento, edificio
  unitNumber?: string;
  floor?: string;
  additionalDirections?: string;
  hasParking: boolean;
}

// Detalles específicos para grúa y remolque
export interface TowTruckDetails {
  pickupAddress: string;
  pickupCity: string;
  deliveryAddress: string;
  deliveryCity: string;
  estimatedDistance?: number; // en km
  vehicleCondition: 'running' | 'not_running' | 'accident';
  needsFlatbed: boolean; // necesita plataforma
  additionalInfo?: string;
}

// Detalles específicos para cambio de aceite express
export interface OilChangeDetails {
  currentMileage: number;
  lastOilChange?: number; // kilometraje del último cambio
  preferredOilBrand?: string;
  oilType?: 'synthetic' | 'semi-synthetic' | 'conventional';
  includeFilter: boolean;
  additionalServices?: string[]; // ej: lavado, revisión frenos
}

// Detalles específicos para diagnóstico mecánico
export interface DiagnosisDetails {
  symptoms: string;
  whenStarted?: string;
  warningLights?: string[];
  recentRepairs?: string;
  needsScanner: boolean;
}

// Detalles específicos para reparación específica
export interface RepairDetails {
  problemDescription: string;
  affectedParts?: string[];
  previousDiagnosis?: string;
  hasWarranty?: boolean;
  preferredParts?: 'original' | 'aftermarket' | 'used';
}

export interface ServiceRequest {
  id: string;
  clientId: string; // ID del usuario que solicita
  serviceType: ServiceType;
  vehicleType: VehicleType;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehiclePlate?: string;
  
  // Detalles específicos según tipo de servicio
  homeServiceDetails?: HomeServiceDetails;
  towTruckDetails?: TowTruckDetails;
  oilChangeDetails?: OilChangeDetails;
  diagnosisDetails?: DiagnosisDetails;
  repairDetails?: RepairDetails;
  
  // Presupuesto y timing
  budgetMin?: number;
  budgetMax?: number;
  preferredDate?: string;
  preferredTimeSlot?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  urgencyLevel: UrgencyLevel;
  
  // Estado
  status: ServiceStatus;
  description: string;
  additionalNotes?: string;
  
  // Ofertas
  bidsCount: number;
  acceptedBidId?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  expiresAt?: string; // Fecha límite para recibir ofertas
}
