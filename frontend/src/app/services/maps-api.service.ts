import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MapsApiService {
  constructor(private http: HttpClient) {}

  getNearby(lat: number, lng: number, radius = 5000, type = 'car_repair'): Observable<any> {
    const params = new HttpParams()
      .set('lat', String(lat))
      .set('lng', String(lng))
      .set('radius', String(radius))
      .set('type', type);
    return this.http.get('/api/maps/nearby', { params });
  }
}
