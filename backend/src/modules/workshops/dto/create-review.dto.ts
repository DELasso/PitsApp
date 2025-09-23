import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  comment: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  userId: string;  // Debe venir del JWT

  @IsOptional()
  @IsString()
  purchaseId?: string;
}