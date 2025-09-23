import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Workshop, WorkshopSearchParams } from '../models/workshop.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkshopsService {
  private apiUrl = `${environment.apiUrl}/workshops`;

  constructor(private http: HttpClient) {}

  getWorkshops(): Observable<Workshop[]> {
    return this.http.get<ApiResponse<Workshop[]>>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  getWorkshop(id: string): Observable<Workshop> {
    return this.http.get<ApiResponse<Workshop>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  searchWorkshops(params: WorkshopSearchParams): Observable<Workshop[]> {
    let httpParams = new HttpParams();
    
    if (params.service) {
      httpParams = httpParams.set('service', params.service);
    }
    if (params.neighborhood) {
      httpParams = httpParams.set('neighborhood', params.neighborhood);
    }
    if (params.latitude && params.longitude) {
      httpParams = httpParams.set('lat', params.latitude.toString());
      httpParams = httpParams.set('lng', params.longitude.toString());
      if (params.radius) {
        httpParams = httpParams.set('radius', params.radius.toString());
      }
    }

    return this.http.get<ApiResponse<Workshop[]>>(`${this.apiUrl}/search`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  createWorkshop(workshopData: Partial<Workshop>): Observable<ApiResponse<Workshop>> {
    return this.http.post<ApiResponse<Workshop>>(this.apiUrl, workshopData);
  }

  getMyWorkshops(): Observable<Workshop[]> {
    return this.http.get<ApiResponse<Workshop[]>>(`${this.apiUrl}/my-workshops`)
      .pipe(map(response => response.data));
  }

  updateWorkshop(id: string, workshopData: Partial<Workshop>): Observable<ApiResponse<Workshop>> {
    return this.http.put<ApiResponse<Workshop>>(`${this.apiUrl}/${id}`, workshopData);
  }

  deleteWorkshop(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  getCercanos(lat: number, lng: number, radio: number = 5): Observable<Workshop[]> {
    return this.http.get<Workshop[]>(`${this.apiUrl}/cercanos?lat=${lat}&lng=${lng}&radioKm=${radio}`);
  }

  // Métodos mockeados mientras no hay backend funcionando
  getWorkshopsMocked(): Observable<Workshop[]> {
    const workshops: Workshop[] = [
      {
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
        website: 'https://elexperto.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
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
        rating: 4.5,
        reviewCount: 89,
        workingHours: 'Lunes a Sábado: 8:00 AM - 6:00 PM',
        specialties: ['BMW', 'Mercedes-Benz', 'Audi'],
        website: 'https://autoservicepro.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
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
        rating: 5,
        reviewCount: 156,
        workingHours: 'Lunes a Viernes: 8:00 AM - 5:30 PM, Sábados: 8:00 AM - 3:00 PM',
        specialties: ['Yamaha', 'Honda', 'Kawasaki', 'Suzuki'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(workshops);
        observer.complete();
      }, 500); // Simular delay de red
    });
  }
}
