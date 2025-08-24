export interface Workshop {
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
}

export interface WorkshopSearchParams {
  service?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}
