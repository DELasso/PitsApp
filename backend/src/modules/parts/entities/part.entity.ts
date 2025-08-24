import { PartCondition, VehicleType } from '../dto/create-part.dto';

export class Part {
  id: string;
  name: string;
  description: string;
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

  constructor(partial: Partial<Part>) {
    Object.assign(this, partial);
    this.stock = this.stock || 0;
    this.rating = this.rating || 0;
    this.reviewCount = this.reviewCount || 0;
    this.isAvailable = this.isAvailable !== undefined ? this.isAvailable : true;
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = this.updatedAt || new Date();
  }
}
