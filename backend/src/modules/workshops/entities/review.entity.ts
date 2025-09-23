export class Review {
  id: string;  // ID único
  comment: string;  // Comentario del usuario
  rating: number;  // Calificación (1-5)
  userId: string;  // ID del usuario (client) que reseña
  purchaseId?: string;  // Opcional: ID de la compra asociada
  createdAt: Date;  // Fecha de creación

  constructor(data: Partial<Review>) {
    Object.assign(this, data);
    if (!this.id) {
      this.id = Date.now().toString();  // Genera ID si no existe
    }

    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    
  }

}