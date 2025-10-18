export interface BidItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export enum PaymentTerms {
  FULL_UPFRONT = 'full_upfront',
  PARTIAL_UPFRONT = 'partial_upfront',
  ON_COMPLETION = 'on_completion',
  INSTALLMENTS = 'installments'
}

export enum BidStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

export interface Bid {
  id: string;
  serviceRequestId: string;
  providerId: string;
  providerName?: string;
  providerRating?: number;
  providerReviewCount?: number;
  items: BidItem[];
  totalAmount: number;
  estimatedCompletionTime: number; // in hours
  warrantyPeriod: number; // in days
  warrantyDetails?: string;
  paymentTerms: PaymentTerms;
  notes?: string;
  status: BidStatus;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  withdrawnAt?: string;
}

export interface CreateBidDto {
  serviceRequestId: string;
  items: BidItem[];
  totalAmount: number;
  estimatedCompletionTime: number;
  warrantyPeriod: number;
  warrantyDetails?: string;
  paymentTerms: PaymentTerms;
  notes?: string;
}

export interface UpdateBidDto {
  items?: BidItem[];
  totalAmount?: number;
  estimatedCompletionTime?: number;
  warrantyPeriod?: number;
  warrantyDetails?: string;
  paymentTerms?: PaymentTerms;
  notes?: string;
}
