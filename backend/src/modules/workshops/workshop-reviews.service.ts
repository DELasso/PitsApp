import { Injectable } from '@nestjs/common';
import { WorkshopReview } from './entities/workshop-review.entity';
import { CreateWorkshopReviewDto } from './dto/create-workshop-review.dto';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class WorkshopReviewsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(
    createReviewDto: CreateWorkshopReviewDto,
    userId: string,
    userName: string,
    userRole: 'cliente' | 'proveedor',
  ): Promise<WorkshopReview> {
    const supabase = this.supabaseService.getClient();

    // Verificar si el usuario ya dejó una reseña para este taller
    const { data: existingReview } = await supabase
      .from('workshop_reviews')
      .select('id')
      .eq('workshop_id', createReviewDto.workshopId)
      .eq('user_id', userId)
      .single();

    if (existingReview) {
      throw new Error('Ya has dejado una reseña para este taller');
    }

    const reviewData = {
      workshop_id: createReviewDto.workshopId,
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    };

    const { data, error } = await supabase
      .from('workshop_reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating review: ${error.message}`);
    }

    return this.mapToReview(data);
  }

  async findByWorkshopId(workshopId: string): Promise<WorkshopReview[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('workshop_reviews')
      .select('*')
      .eq('workshop_id', workshopId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching reviews: ${error.message}`);
    }

    return data.map(r => this.mapToReview(r));
  }

  async getAverageRating(workshopId: string): Promise<{
    averageRating: number;
    reviewCount: number;
  }> {
    const reviews = await this.findByWorkshopId(workshopId);
    
    if (reviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
      reviewCount: reviews.length,
    };
  }

  async delete(reviewId: string, userId: string): Promise<WorkshopReview> {
    const supabase = this.supabaseService.getClient();

    // Primero verificar que la reseña existe y pertenece al usuario
    const { data: review } = await supabase
      .from('workshop_reviews')
      .select('*')
      .eq('id', reviewId)
      .eq('user_id', userId)
      .single();

    if (!review) {
      throw new Error('Reseña no encontrada o no tienes permiso para eliminarla');
    }

    const { error } = await supabase
      .from('workshop_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error deleting review: ${error.message}`);
    }

    return this.mapToReview(review);
  }

  // Mapear datos de Supabase (snake_case) a entidad WorkshopReview (camelCase)
  private mapToReview(data: any): WorkshopReview {
    return {
      id: data.id,
      workshopId: data.workshop_id,
      userId: data.user_id,
      userName: data.user_name,
      userRole: data.user_role,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}