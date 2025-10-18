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
  serviceRequestId: string;  // ID de la solicitud de servicio
  providerId: string;        // ID del proveedor/taller
  providerName: string;      // Nombre del taller
  providerRating?: number;   // Calificación del taller
  workshopId?: string;       // ID del taller específico (si aplica)
  
  // Oferta económica
  totalAmount: number;
  items?: BidItem[];         // Desglose opcional de la oferta
  includesPartsAndLabor: boolean;
  warranty?: string;         // Ej: "3 meses o 5000 km"
  
  // Timing
  estimatedTime: string;     // Ej: "2 horas", "mismo día", "24 horas"
  availabilityDate?: string; // Cuándo puede realizarlo
  
  // Detalles adicionales
  proposalDescription: string;
  paymentTerms?: string;     // Ej: "50% adelanto, 50% al finalizar"
  includesHomeService?: boolean;
  includesTowing?: boolean;
  additionalServices?: string[];
  
  // Estado
  status: BidStatus;
  
  // Mensajes
  providerMessage?: string;  // Mensaje del proveedor al cliente
  clientResponse?: string;   // Respuesta del cliente
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;        // Fecha límite de la oferta
}
