export enum BidStatus {
  PENDING = 'pending',       // Oferta enviada, esperando respuesta
  ACCEPTED = 'accepted',     // Oferta aceptada por el cliente
  REJECTED = 'rejected',     // Oferta rechazada
  WITHDRAWN = 'withdrawn',   // Proveedor retiró la oferta
  EXPIRED = 'expired'        // Oferta expiró
}

export interface BidItem {
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Bid {
  id: string;
  serviceRequestId: string;  // ID de la solicitud de servicio (request_id en DB)
  providerId: string;        // ID del proveedor/taller
  providerName: string;      // Nombre del taller
  
  // Oferta económica
  totalAmount: number;       // total_price en DB
  items?: BidItem[];         // Desglose de la oferta
  warranty?: string;         // warranty_info en DB - Ej: "3 meses o 5000 km"
  
  // Timing
  estimatedTime: string;     // estimated_time en DB - Ej: "2 horas", "mismo día"
  
  // Detalles adicionales
  notes?: string;            // notes en DB - Notas adicionales del proveedor
  
  // Estado
  status: BidStatus;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}
