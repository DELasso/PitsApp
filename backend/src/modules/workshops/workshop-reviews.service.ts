import { Injectable } from '@nestjs/common';
import { WorkshopReview } from './entities/workshop-review.entity';
import { CreateWorkshopReviewDto } from './dto/create-workshop-review.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WorkshopReviewsService {
  private readonly reviewsFilePath = path.join(
    process.cwd(),
    'data',
    'workshop-reviews.json',
  );

  private readReviews(): WorkshopReview[] {
    try {
      const data = fs.readFileSync(this.reviewsFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private writeReviews(reviews: WorkshopReview[]): void {
    fs.writeFileSync(
      this.reviewsFilePath,
      JSON.stringify(reviews, null, 2),
      'utf-8',
    );
  }

  create(
    createReviewDto: CreateWorkshopReviewDto,
    userId: string,
    userName: string,
    userRole: 'cliente' | 'proveedor',
  ): WorkshopReview {
    const reviews = this.readReviews();

    // Verificar si el usuario ya dejó una reseña para este taller
    const existingReview = reviews.find(
      (review) =>
        review.workshopId === createReviewDto.workshopId &&
        review.userId === userId,
    );

    if (existingReview) {
      throw new Error('Ya has dejado una reseña para este taller');
    }

    const newReview: WorkshopReview = {
      id: uuidv4(),
      workshopId: createReviewDto.workshopId,
      userId,
      userName,
      userRole,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    reviews.push(newReview);
    this.writeReviews(reviews);

    return newReview;
  }

  findByWorkshopId(workshopId: string): WorkshopReview[] {
    const reviews = this.readReviews();
    return reviews.filter((review) => review.workshopId === workshopId);
  }

  getAverageRating(workshopId: string): {
    averageRating: number;
    reviewCount: number;
  } {
    const reviews = this.findByWorkshopId(workshopId);
    
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

  delete(reviewId: string, userId: string): WorkshopReview {
    const reviews = this.readReviews();
    const reviewIndex = reviews.findIndex(
      (review) => review.id === reviewId && review.userId === userId,
    );

    if (reviewIndex === -1) {
      throw new Error('Reseña no encontrada o no tienes permiso para eliminarla');
    }

    const deletedReview = reviews[reviewIndex];
    reviews.splice(reviewIndex, 1);
    this.writeReviews(reviews);

    return deletedReview;
  }
}