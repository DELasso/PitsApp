export interface Review {
  id: string;
  comment: string;
  rating: number;
  userId: string;
  purchaseId?: string;
  createdAt: Date;
}