import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Bid, CreateBidDto, UpdateBidDto } from '../models/bid.model';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private apiUrl = `${environment.apiUrl}/bids`;

  constructor(private http: HttpClient) {}

  create(bid: CreateBidDto): Observable<Bid> {
    return this.http.post<Bid>(this.apiUrl, bid);
  }

  getAll(): Observable<Bid[]> {
    return this.http.get<Bid[]>(this.apiUrl);
  }

  getMyBids(): Observable<Bid[]> {
    return this.http.get<Bid[]>(`${this.apiUrl}/my-bids`);
  }

  getById(id: string): Observable<Bid> {
    return this.http.get<Bid>(`${this.apiUrl}/${id}`);
  }

  update(id: string, data: UpdateBidDto): Observable<Bid> {
    return this.http.patch<Bid>(`${this.apiUrl}/${id}`, data);
  }

  withdraw(id: string): Observable<Bid> {
    return this.http.patch<Bid>(`${this.apiUrl}/${id}/withdraw`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
