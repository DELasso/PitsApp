export interface Workshop {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  neighborhood: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  services?: string[];        // Lista de servicios (opcional)
  specialties?: string[];     // Lista de especialidades (opcional)
  workingHours?: string;      // Horario de atención (opcional)
  latitude?: number;          // Coordenada de latitud (opcional)
  longitude?: number;         // Coordenada de longitud (opcional)
  images?: string[];          // Lista de URLs de imágenes (opcional)
  isActive?: boolean;         // Estado del taller (opcional)
  createdAt?: Date;           // Fecha de creación (opcional)
  updatedAt?: Date;           // Fecha de última actualización (opcional)
}

export interface WorkshopSearchParams {
  service?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}
