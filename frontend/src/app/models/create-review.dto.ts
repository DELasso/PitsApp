export interface CreateReviewDto {
  comment: string;        // El texto del comentario
  rating: number;         // Calificación (1-5)
  userId: string;         // ID del usuario que hace la reseña
  purchaseId?: string;    // Opcional: ID de la compra asociada
}