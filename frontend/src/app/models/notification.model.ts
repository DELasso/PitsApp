export enum NotificationType {
  NEW_SERVICE_REQUEST = "new_service_request",
  NEW_BID_RECEIVED = "new_bid_received",
  BID_ACCEPTED = "bid_accepted",
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  relatedType?: "service_request" | "bid";
  createdAt: string;
  updatedAt: string;
}

export interface UnreadCountResponse {
  count: number;
}
