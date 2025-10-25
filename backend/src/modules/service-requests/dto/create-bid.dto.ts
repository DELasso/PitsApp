import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class BidItemDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateBidDto {
  @IsString()
  serviceRequestId: string;

  @IsOptional()
  @IsString()
  workshopId?: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BidItemDto)
  items?: BidItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCompletionTime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  warrantyPeriod?: number;

  @IsOptional()
  @IsString()
  warrantyDetails?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // Campos adicionales opcionales que pueden venir del frontend
  @IsOptional()
  @IsBoolean()
  includesPartsAndLabor?: boolean;

  @IsOptional()
  @IsString()
  warranty?: string;

  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @IsOptional()
  @IsString()
  availabilityDate?: string;

  @IsOptional()
  @IsString()
  proposalDescription?: string;

  @IsOptional()
  @IsBoolean()
  includesHomeService?: boolean;

  @IsOptional()
  @IsBoolean()
  includesTowing?: boolean;

  @IsOptional()
  @IsString({ each: true })
  additionalServices?: string[];

  @IsOptional()
  @IsString()
  providerMessage?: string;

  @IsOptional()
  @IsString()
  expiresAt?: string;
}
