import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  WorkshopReview, 
  CreateWorkshopReviewRequest,
  WorkshopReviewsResponse 
} from '../models/workshop-review.model';

@Injectable({
  providedIn: 'root'
})
export class WorkshopReviewService {
  private apiUrl = `${environment.apiUrl}/workshops`;

  constructor(private http: HttpClient) {}

  createReview(workshopId: string, reviewData: Omit<CreateWorkshopReviewRequest, 'workshopId'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/${workshopId}/reviews`, {
      workshopId,
      ...reviewData
    });
  }

  getReviews(workshopId: string): Observable<{ 
    success: boolean; 
    message: string; 
    data: WorkshopReviewsResponse 
  }> {
    return this.http.get<{ 
      success: boolean; 
      message: string; 
      data: WorkshopReviewsResponse 
    }>(`${this.apiUrl}/${workshopId}/reviews`);
  }

  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${reviewId}`);
  }
}
