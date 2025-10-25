import { Module } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { WorkshopsController } from './workshops.controller';
import { WorkshopReviewsService } from './workshop-reviews.service';

@Module({
  controllers: [WorkshopsController],
  providers: [WorkshopsService, WorkshopReviewsService],
  exports: [WorkshopsService],
})
export class WorkshopsModule {}
