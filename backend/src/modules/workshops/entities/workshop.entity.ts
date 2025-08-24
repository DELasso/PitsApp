export class Workshop {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  neighborhood: string;
  phone: string;
  email: string;
  services: string[];
  latitude: number;
  longitude: number;
  website?: string;
  images?: string[];
  workingHours?: string;
  specialties?: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Workshop>) {
    Object.assign(this, partial);
    this.rating = this.rating || 0;
    this.reviewCount = this.reviewCount || 0;
    this.isActive = this.isActive !== undefined ? this.isActive : true;
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = this.updatedAt || new Date();
  }
}
