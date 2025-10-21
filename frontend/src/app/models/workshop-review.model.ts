export interface WorkshopReview {
  id: string;
  workshopId: string;
  userId: string;
  userName: string;
  userRole: 'cliente' | 'proveedor';
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkshopReviewRequest {
  workshopId: string;
  rating: number;
  comment: string;
}

export interface WorkshopReviewsResponse {
  reviews: WorkshopReview[];
  averageRating: number;
  reviewCount: number;
}
