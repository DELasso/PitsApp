import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // 👈 importa la configuración de entorno

@Injectable({ providedIn: 'root' })
export class MapsApiService {
  private baseUrl = `${environment.apiUrl}/maps`; // 👈 base URL de tu backend Nest

  constructor(private http: HttpClient) {}

  /** 🔹 Buscar talleres o lugares cercanos */
  getNearby(lat: number, lng: number, radius = 5000, type = 'car_repair'): Observable<any> {
    const params = new HttpParams()
      .set('lat', String(lat))
      .set('lng', String(lng))
      .set('radius', String(radius))
      .set('type', type);

    return this.http.get(`${this.baseUrl}/nearby`, { params });
  }

  /** 🔹 Obtener coordenadas (geocodificación) a partir de una dirección */
  getCoordinates(address: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/geocode`, { address });
  }
}
