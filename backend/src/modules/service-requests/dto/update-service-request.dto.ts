import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceRequestDto } from './create-service-request.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ServiceStatus } from '../entities/service-request.entity';

export class UpdateServiceRequestDto extends PartialType(CreateServiceRequestDto) {
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsOptional()
  @IsString()
  acceptedBidId?: string;
}
