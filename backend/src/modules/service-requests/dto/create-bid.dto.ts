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

  @IsNumber()
  @Min(0)
  subtotal: number;
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

  @IsBoolean()
  includesPartsAndLabor: boolean;

  @IsOptional()
  @IsString()
  warranty?: string;

  @IsString()
  estimatedTime: string;

  @IsOptional()
  @IsString()
  availabilityDate?: string;

  @IsString()
  proposalDescription: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

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
