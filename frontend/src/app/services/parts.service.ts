import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Part, PartSearchParams, PartCondition, VehicleType } from '../models/part.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PartsService {
  private apiUrl = `${environment.apiUrl}/parts`;

  constructor(private http: HttpClient) {}

  getParts(): Observable<Part[]> {
    return this.http.get<ApiResponse<Part[]>>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  getPart(id: string): Observable<Part> {
    return this.http.get<ApiResponse<Part>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  getCategories(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/categories`)
      .pipe(map(response => response.data));
  }

  getBrands(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/brands`)
      .pipe(map(response => response.data));
  }

  searchParts(params: PartSearchParams): Observable<Part[]> {
    let httpParams = new HttpParams();
    
    if (params.q) {
      httpParams = httpParams.set('q', params.q);
    }
    if (params.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.brand) {
      httpParams = httpParams.set('brand', params.brand);
    }
    if (params.vehicleType) {
      httpParams = httpParams.set('vehicleType', params.vehicleType);
    }
    if (params.minPrice) {
      httpParams = httpParams.set('minPrice', params.minPrice.toString());
    }
    if (params.maxPrice) {
      httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    }

    return this.http.get<ApiResponse<Part[]>>(`${this.apiUrl}/search`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  // Métodos mockeados mientras no hay backend funcionando
  getPartsMocked(): Observable<Part[]> {
    const parts: Part[] = [
      {
        id: '1',
        name: 'Pastillas de Freno Delanteras',
        description: 'Pastillas de freno de alta calidad para vehículos Toyota',
        category: 'Frenos',
        brand: 'Akebono',
        partNumber: 'AK-04465-42180',
        price: 85000,
        condition: PartCondition.ORIGINAL,
        vehicleType: VehicleType.CARRO,
        compatibleVehicles: ['Toyota Corolla 2015-2022', 'Toyota Prius 2016-2022'],
        supplier: 'Repuestos Toyota Medellín',
        stock: 15,
        warranty: '12 meses',
        rating: 4.7,
        reviewCount: 23,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Filtro de Aceite',
        description: 'Filtro de aceite universal para motores 1.6L y 2.0L',
        category: 'Motor',
        brand: 'Mann Filter',
        partNumber: 'MF-W712/52',
        price: 25000,
        condition: PartCondition.ORIGINAL,
        vehicleType: VehicleType.CARRO,
        compatibleVehicles: ['Chevrolet Cruze', 'Mazda 3', 'Nissan Sentra'],
        supplier: 'Autopartes Universal',
        stock: 50,
        warranty: '6 meses',
        rating: 4.5,
        reviewCount: 67,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Cadena de Transmisión',
        description: 'Cadena reforzada para motocicletas deportivas',
        category: 'Transmisión',
        brand: 'DID',
        partNumber: 'DID-520VX3-110',
        price: 180000,
        condition: PartCondition.ORIGINAL,
        vehicleType: VehicleType.MOTO,
        compatibleVehicles: ['Yamaha R15', 'Honda CBR150R', 'KTM Duke 200'],
        supplier: 'Motos Repuestos Medellín',
        stock: 8,
        warranty: '18 meses',
        rating: 4.9,
        reviewCount: 34,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(parts);
        observer.complete();
      }, 500);
    });
  }

  getCategoriesMocked(): Observable<string[]> {
    const categories = ['Frenos', 'Motor', 'Transmisión', 'Suspensión', 'Eléctricos', 'Llantas'];
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(categories);
        observer.complete();
      }, 300);
    });
  }
}
