export enum NotificationType {
  NEW_SERVICE_REQUEST = "new_service_request", // Para proveedores: nuevo servicio publicado
  NEW_BID_RECEIVED = "new_bid_received", // Para clientes: nueva oferta en su solicitud
  BID_ACCEPTED = "bid_accepted", // Para proveedores: su oferta fue aceptada
}

export interface Notification {
  id: string;
  userId: string; // A quién va la notificación
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string; // ID de la solicitud o bid relacionado
  relatedType?: "service_request" | "bid";
  createdAt: string;
  updatedAt: string;
}
