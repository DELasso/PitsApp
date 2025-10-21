import { Module } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { WorkshopsController } from './workshops.controller';
import { WorkshopsFileService } from './workshops-file.service';
import { WorkshopReviewsService } from './workshop-reviews.service';

@Module({
  controllers: [WorkshopsController],
  providers: [WorkshopsService, WorkshopsFileService, WorkshopReviewsService],
  exports: [WorkshopsService],
})
export class WorkshopsModule {}
