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

export interface Part {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  brand: string;
  partNumber: string;
  price: number;
  condition: PartCondition;
  vehicleType: VehicleType;
  compatibleVehicles: string[];
  supplier?: string;
  images?: string[];
  stock: number;
  warranty?: string;
  weight?: number;
  dimensions?: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartSearchParams {
  q?: string;
  category?: string;
  brand?: string;
  vehicleType?: VehicleType;
  minPrice?: number;
  maxPrice?: number;
}
