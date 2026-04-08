import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { VehicleInfo } from '../models/auth.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getMyVehicles(): Observable<ApiResponse<VehicleInfo[]>> {
    return this.http.get<ApiResponse<VehicleInfo[]>>(`${this.apiUrl}/me/vehicles`);
  }

  addMyVehicle(vehicle: VehicleInfo): Observable<ApiResponse<VehicleInfo[]>> {
    return this.http.post<ApiResponse<VehicleInfo[]>>(`${this.apiUrl}/me/vehicles`, vehicle);
  }
}
