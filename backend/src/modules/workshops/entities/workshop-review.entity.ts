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
