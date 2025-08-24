import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { Workshop } from './entities/workshop.entity';

@Injectable()
export class WorkshopsService {
  private workshops: Workshop[] = [
    new Workshop({
      id: '1',
      name: 'Taller Mecánico El Experto',
      description: 'Especialistas en mecánica automotriz con más de 15 años de experiencia',
      address: 'Carrera 43A #14-15',
      city: 'Medellín',
      neighborhood: 'Poblado',
      phone: '+57 4 444-5555',
      email: 'contacto@elexperto.com',
      services: ['Mecánica general', 'Frenos', 'Suspensión', 'Cambio de aceite'],
      latitude: 6.209,
      longitude: -75.568,
      rating: 4.8,
      reviewCount: 124,
      workingHours: 'Lunes a Viernes: 7:00 AM - 6:00 PM, Sábados: 8:00 AM - 4:00 PM',
      specialties: ['Toyota', 'Chevrolet', 'Mazda'],
      website: 'https://elexperto.com'
    }),
    new Workshop({
      id: '2',
      name: 'AutoService Pro',
      description: 'Centro de diagnóstico automotriz con tecnología de última generación',
      address: 'Avenida Nutibara #75-25',
      city: 'Medellín',
      neighborhood: 'Laureles',
      phone: '+57 4 333-4444',
      email: 'info@autoservicepro.com',
      services: ['Diagnóstico computarizado', 'Eléctrica automotriz', 'Aire acondicionado'],
      latitude: 6.245,
      longitude: -75.590,
      rating: 4.6,
      reviewCount: 89,
      workingHours: 'Lunes a Sábado: 8:00 AM - 6:00 PM',
      specialties: ['BMW', 'Mercedes-Benz', 'Audi'],
      website: 'https://autoservicepro.com'
    }),
    new Workshop({
      id: '3',
      name: 'Motos y Más',
      description: 'Taller especializado en motocicletas de todas las marcas',
      address: 'Calle 37 Sur #48-19',
      city: 'Envigado',
      neighborhood: 'Centro',
      phone: '+57 4 222-3333',
      email: 'contacto@motosymas.com',
      services: ['Mecánica de motos', 'Repuestos originales', 'Mantenimiento preventivo'],
      latitude: 6.165,
      longitude: -75.590,
      rating: 4.9,
      reviewCount: 156,
      workingHours: 'Lunes a Viernes: 8:00 AM - 5:30 PM, Sábados: 8:00 AM - 3:00 PM',
      specialties: ['Yamaha', 'Honda', 'Kawasaki', 'Suzuki']
    })
  ];

  create(createWorkshopDto: CreateWorkshopDto): Workshop {
    const workshop = new Workshop({
      id: Date.now().toString(),
      ...createWorkshopDto,
    });
    
    this.workshops.push(workshop);
    return workshop;
  }

  findAll(): Workshop[] {
    return this.workshops.filter(workshop => workshop.isActive);
  }

  findOne(id: string): Workshop {
    const workshop = this.workshops.find(w => w.id === id && w.isActive);
    if (!workshop) {
      throw new NotFoundException(`Taller con ID ${id} no encontrado`);
    }
    return workshop;
  }

  update(id: string, updateWorkshopDto: UpdateWorkshopDto): Workshop {
    const workshopIndex = this.workshops.findIndex(w => w.id === id);
    if (workshopIndex === -1) {
      throw new NotFoundException(`Taller con ID ${id} no encontrado`);
    }

    this.workshops[workshopIndex] = {
      ...this.workshops[workshopIndex],
      ...updateWorkshopDto,
      updatedAt: new Date(),
    };

    return this.workshops[workshopIndex];
  }

  remove(id: string): void {
    const workshopIndex = this.workshops.findIndex(w => w.id === id);
    if (workshopIndex === -1) {
      throw new NotFoundException(`Taller con ID ${id} no encontrado`);
    }

    // Soft delete
    this.workshops[workshopIndex].isActive = false;
    this.workshops[workshopIndex].updatedAt = new Date();
  }

  findByLocation(latitude: number, longitude: number, radiusKm: number = 10): Workshop[] {
    return this.workshops.filter(workshop => {
      if (!workshop.isActive) return false;
      
      const distance = this.calculateDistance(
        latitude, 
        longitude, 
        workshop.latitude, 
        workshop.longitude
      );
      
      return distance <= radiusKm;
    });
  }

  findByService(service: string): Workshop[] {
    return this.workshops.filter(workshop => 
      workshop.isActive && 
      workshop.services.some(s => 
        s.toLowerCase().includes(service.toLowerCase())
      )
    );
  }

  findByNeighborhood(neighborhood: string): Workshop[] {
    return this.workshops.filter(workshop => 
      workshop.isActive && 
      workshop.neighborhood.toLowerCase().includes(neighborhood.toLowerCase())
    );
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distancia en kilómetros
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}
