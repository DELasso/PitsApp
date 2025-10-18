import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServiceRequest, ServiceStatus } from '../models/service-request.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {
  private apiUrl = `${environment.apiUrl}/service-requests`;

  constructor(private http: HttpClient) {}

  create(serviceRequest: any): Observable<ServiceRequest> {
    return this.http.post<ServiceRequest>(this.apiUrl, serviceRequest);
  }

  getAll(status?: ServiceStatus): Observable<ServiceRequest[]> {
    const url = status ? `${this.apiUrl}?status=${status}` : this.apiUrl;
    return this.http.get<ServiceRequest[]>(url);
  }

  getAvailableForBids(): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/available`);
  }

  getMyRequests(): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/my-requests`);
  }

  getById(id: string): Observable<ServiceRequest> {
    return this.http.get<ServiceRequest>(`${this.apiUrl}/${id}`);
  }

  getBidsByServiceRequest(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/bids`);
  }

  update(id: string, data: any): Observable<ServiceRequest> {
    return this.http.patch<ServiceRequest>(`${this.apiUrl}/${id}`, data);
  }

  acceptBid(serviceRequestId: string, bidId: string): Observable<ServiceRequest> {
    return this.http.patch<ServiceRequest>(
      `${this.apiUrl}/${serviceRequestId}/accept-bid/${bidId}`,
      {}
    );
  }

  updateStatus(id: string, status: ServiceStatus): Observable<ServiceRequest> {
    return this.http.patch<ServiceRequest>(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
